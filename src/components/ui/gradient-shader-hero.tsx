import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Rounded WebGL gradient-shader hero with cursor interaction.
 *
 * Drop-in replacement for the old `DotGlobeHero`: same wrapper contract
 * (forwardRef, `relative w-full min-h-screen`, children slot at z-[10]) so the
 * hero content keeps rendering exactly where it did.
 *
 * Implemented against the raw WebGL API rather than three.js / ogl — it is one
 * fullscreen quad and one fragment shader, so a rendering library would be all
 * cost and no benefit. This adds **no** new dependencies.
 *
 * The gradient is a domain-warped fBm field (the classic iq warp: fbm of fbm of
 * fbm), which is what gives it the organic "mesh gradient" drift rather than the
 * banded look of a plain sine field. The cursor adds a soft local bloom.
 */

interface GradientShaderHeroProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Animation speed multiplier. */
    speed?: number;
    /** Strength of the cursor bloom, 0 disables it. */
    amplitude?: number;
    className?: string;
    children?: React.ReactNode;
}

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;      // 0..1, y up
uniform float uMouseOn;    // 0 or 1
uniform float uAmplitude;
uniform vec3  uColorA;     // deepest / background end
uniform vec3  uColorB;     // mid
uniform vec3  uColorC;     // accent highlight

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.02;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uRes.xy;

    // Aspect-corrected sample position so the field doesn't stretch on wide screens.
    vec2 p = uv;
    p.x *= uRes.x / uRes.y;
    p *= 1.6;

    float t = uTime * 0.06;

    // Domain warp — three nested fBm lookups.
    vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + t),
                  fbm(p + vec2(5.2, 1.3) - t * 0.8));

    vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.5),
                  fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.4));

    float f = fbm(p + 3.0 * r);

    // Cursor bloom: a soft radial lift centred on the pointer.
    vec2 m = uMouse;
    m.x *= uRes.x / uRes.y;
    vec2 pv = uv;
    pv.x *= uRes.x / uRes.y;
    float md = distance(pv, m);
    float bloom = (1.0 - smoothstep(0.0, 0.55, md)) * uAmplitude * uMouseOn;

    float mixA = clamp(f * 1.9 + bloom, 0.0, 1.0);
    float mixB = clamp(length(r) * 1.15 + bloom * 0.7, 0.0, 1.0);

    vec3 col = mix(uColorA, uColorB, mixA);
    // Squared so the accent concentrates into hotspots instead of washing the
    // whole panel — the hero headline is this colour, and it needs to sit on
    // dark ground to stay legible.
    col = mix(col, uColorC, mixB * mixB * 0.45);

    // Vignette so the panel edges settle into the page rather than cutting hard,
    // and the centre (where the headline sits) stays darkest.
    float vig = smoothstep(1.25, 0.25, length(uv - 0.5) * 1.4);
    col *= mix(0.60, 1.0, vig);

    // Dither: breaks up banding in the large flat gradients on 8-bit displays.
    float d = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
    col += d;

    gl_FragColor = vec4(col, 1.0);
}
`;

type Palette = { a: [number, number, number]; b: [number, number, number]; c: [number, number, number] };

/** BAMAS brand: slate background, deep teal #052E40, additive green #0C9D6A. */
const DARK: Palette = {
    a: [0.027, 0.043, 0.078], // deep slate ground, darker than --background
    b: [0.016, 0.125, 0.176], // #052E40 deep teal, muted
    c: [0.047, 0.616, 0.416], // #0C9D6A additive green — accent only
};

const LIGHT: Palette = {
    a: [0.960, 0.976, 0.984], // near-white
    b: [0.839, 0.925, 0.906], // pale teal wash
    c: [0.294, 0.769, 0.612], // lifted green so it doesn't go muddy on white
};

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("Hero shader compile failed:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
    }
    return sh;
}

const GradientShaderHero = React.forwardRef<HTMLDivElement, GradientShaderHeroProps>(
    ({ speed = 1, amplitude = 0.22, className, children, ...props }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const hostRef = useRef<HTMLDivElement>(null);
        // Mouse is tracked in a ref so pointer moves never trigger a React render.
        const mouse = useRef({ x: 0.5, y: 0.5, on: 0 });

        useEffect(() => {
            const canvas = canvasRef.current;
            const host = hostRef.current;
            if (!canvas || !host) return;

            const gl = (canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }) ||
                canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

            // No WebGL (old device, hardware acceleration off, context refused):
            // the CSS gradient underneath stays visible and we simply do nothing.
            if (!gl) return;

            const vs = compile(gl, gl.VERTEX_SHADER, VERT);
            const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
            if (!vs || !fs) return;

            const prog = gl.createProgram();
            if (!prog) return;
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                console.warn("Hero shader link failed:", gl.getProgramInfoLog(prog));
                return;
            }
            gl.useProgram(prog);

            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
            const aPos = gl.getAttribLocation(prog, "aPos");
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

            const uRes = gl.getUniformLocation(prog, "uRes");
            const uTime = gl.getUniformLocation(prog, "uTime");
            const uMouse = gl.getUniformLocation(prog, "uMouse");
            const uMouseOn = gl.getUniformLocation(prog, "uMouseOn");
            const uAmp = gl.getUniformLocation(prog, "uAmplitude");
            const uA = gl.getUniformLocation(prog, "uColorA");
            const uB = gl.getUniformLocation(prog, "uColorB");
            const uC = gl.getUniformLocation(prog, "uColorC");

            gl.uniform1f(uAmp, amplitude);

            const applyPalette = () => {
                const p = document.documentElement.classList.contains("dark") ? DARK : LIGHT;
                gl.uniform3fv(uA, p.a);
                gl.uniform3fv(uB, p.b);
                gl.uniform3fv(uC, p.c);
            };
            applyPalette();
            const themeObserver = new MutationObserver(applyPalette);
            themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

            // Cap DPR: this is a soft gradient, so rendering above ~1.5x costs
            // fill rate and buys nothing visible.
            const resize = () => {
                const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
                const w = Math.max(1, Math.floor(host.clientWidth * dpr));
                const h = Math.max(1, Math.floor(host.clientHeight * dpr));
                if (canvas.width !== w || canvas.height !== h) {
                    canvas.width = w;
                    canvas.height = h;
                    gl.viewport(0, 0, w, h);
                }
                gl.uniform2f(uRes, canvas.width, canvas.height);
            };
            resize();
            const ro = new ResizeObserver(resize);
            ro.observe(host);

            const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

            let raf = 0;
            let start = performance.now();
            let elapsed = 0;
            let visible = true;
            let running = false;

            const draw = (tMs: number) => {
                gl.uniform1f(uTime, tMs * 0.001 * speed);
                gl.uniform2f(uMouse, mouse.current.x, mouse.current.y);
                gl.uniform1f(uMouseOn, mouse.current.on);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
            };

            const frame = (now: number) => {
                elapsed = now - start;
                draw(elapsed);
                raf = requestAnimationFrame(frame);
            };

            const stop = () => {
                if (!running) return;
                running = false;
                cancelAnimationFrame(raf);
            };

            const play = () => {
                if (running || !visible) return;
                // Reduced motion: render a single static frame and stop.
                if (reduceMotion.matches) {
                    draw(0);
                    return;
                }
                running = true;
                start = performance.now() - elapsed;
                raf = requestAnimationFrame(frame);
            };

            // Don't burn GPU while the hero is scrolled off or the tab is hidden.
            const io = new IntersectionObserver(
                ([e]) => {
                    visible = e.isIntersecting;
                    if (visible) play();
                    else stop();
                },
                { threshold: 0 }
            );
            io.observe(host);

            const onVisibility = () => (document.hidden ? stop() : play());
            document.addEventListener("visibilitychange", onVisibility);
            reduceMotion.addEventListener("change", () => {
                stop();
                play();
            });

            // Pointer is tracked on the host, not the canvas — the hero content
            // sits above the canvas at z-[10], so a canvas-bound listener would
            // go dead everywhere the text and buttons overlap it.
            const onMove = (e: PointerEvent) => {
                const r = host.getBoundingClientRect();
                mouse.current.x = (e.clientX - r.left) / r.width;
                // WebGL y is bottom-up.
                mouse.current.y = 1 - (e.clientY - r.top) / r.height;
                mouse.current.on = 1;
            };
            const onLeave = () => {
                mouse.current.on = 0;
            };
            host.addEventListener("pointermove", onMove, { passive: true });
            host.addEventListener("pointerleave", onLeave, { passive: true });

            const onLost = (e: Event) => {
                e.preventDefault();
                stop();
            };
            canvas.addEventListener("webglcontextlost", onLost);

            play();

            return () => {
                stop();
                io.disconnect();
                ro.disconnect();
                themeObserver.disconnect();
                document.removeEventListener("visibilitychange", onVisibility);
                host.removeEventListener("pointermove", onMove);
                host.removeEventListener("pointerleave", onLeave);
                canvas.removeEventListener("webglcontextlost", onLost);
                gl.deleteProgram(prog);
                gl.deleteShader(vs);
                gl.deleteShader(fs);
                gl.deleteBuffer(buf);
            };
        }, [speed, amplitude]);

        return (
            <div
                ref={ref}
                className={cn("relative w-full min-h-screen bg-background overflow-hidden", className)}
                {...props}
            >
                {/* Rounded shader panel, inset from the page edges. */}
                <div
                    ref={hostRef}
                    className="absolute inset-2 sm:inset-3 md:inset-5 rounded-2xl md:rounded-[2rem] overflow-hidden z-0"
                >
                    {/* Painted before/behind the canvas: covers first paint, and is
                        the permanent fallback when WebGL is unavailable. */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(135deg,#0F172A_0%,#052E40_45%,#0C9D6A_130%)] dark:bg-[linear-gradient(135deg,#0F172A_0%,#052E40_45%,#0C9D6A_130%)]"
                    />
                    <canvas
                        ref={canvasRef}
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full block pointer-events-none"
                    />

                    {/* Legibility scrim. The headline is rendered in the same
                        green as the shader's accent, so it needs guaranteed dark
                        ground behind it regardless of where the gradient drifts. */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.25)_45%,transparent_78%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(6,12,24,0.80)_0%,rgba(6,12,24,0.45)_45%,transparent_78%)]"
                    />
                </div>

                {/* Children slot — identical to the previous hero wrapper. */}
                <div className="absolute inset-0 z-[10] flex flex-col items-center justify-center h-full w-full px-4">
                    {children}
                </div>
            </div>
        );
    }
);

GradientShaderHero.displayName = "GradientShaderHero";

export { GradientShaderHero };
export type { GradientShaderHeroProps };
