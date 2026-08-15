import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Rounded WebGL gradient-shader hero with a notched panel.
 *
 * Shape: a large rounded rectangle with a concave cut-out in the bottom-right.
 * The cut-out is produced by an overlay painted in the page background colour
 * with a rounded top-left corner — the panel's inward curve is that overlay's
 * outward curve. Cheaper and far more responsive than clip-path/SVG masking,
 * which would need fixed coordinates for the rounded concave corner.
 *
 * Content is delivered through named slots rather than a single centred child,
 * because the layout pins each piece to a different corner.
 *
 * The gradient is a domain-warped fBm field (fbm of fbm of fbm) rendered
 * against the raw WebGL API — one fullscreen quad, one fragment shader, so a
 * rendering library would be all cost and no benefit. No new dependencies.
 */

interface GradientShaderHeroProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Small label, top-left. */
    eyebrow?: React.ReactNode;
    /** Primary action, top-right (rendered as-is, style it at the call site). */
    action?: React.ReactNode;
    /** Large headline block, bottom-left. */
    headline?: React.ReactNode;
    /** Link stack that sits inside the bottom-right notch. */
    links?: React.ReactNode;
    /** Animation speed multiplier. */
    speed?: number;
    /** Strength of the cursor bloom; 0 disables it. */
    amplitude?: number;
    className?: string;
}

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uMouseOn;
uniform float uAmplitude;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;

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

    vec2 p = uv;
    p.x *= uRes.x / uRes.y;
    // Low frequency: large, soft blobs rather than busy detail.
    p *= 1.05;

    float t = uTime * 0.05;

    vec2 q = vec2(fbm(p + t),
                  fbm(p + vec2(5.2, 1.3) - t * 0.8));

    vec2 r = vec2(fbm(p + 2.6 * q + vec2(1.7, 9.2) + t * 0.45),
                  fbm(p + 2.6 * q + vec2(8.3, 2.8) - t * 0.35));

    float f = fbm(p + 2.6 * r);

    vec2 m = uMouse;
    m.x *= uRes.x / uRes.y;
    vec2 pv = uv;
    pv.x *= uRes.x / uRes.y;
    float bloom = (1.0 - smoothstep(0.0, 0.55, distance(pv, m))) * uAmplitude * uMouseOn;

    float mixA = clamp(f * 1.85 + bloom, 0.0, 1.0);
    float mixB = clamp(length(r) * 1.1 + bloom * 0.7, 0.0, 1.0);

    vec3 col = mix(uColorA, uColorB, mixA);
    // Squared so the accent concentrates into highlights instead of washing the
    // whole panel — the headline sits on this and needs dark ground.
    col = mix(col, uColorC, mixB * mixB * 0.5);

    // Diagonal falloff: brightest toward the top-left, settling into the dark
    // bottom-right where the notch and link stack are.
    float diag = clamp((uv.x * 0.55 + (1.0 - uv.y) * 0.45), 0.0, 1.0);
    col *= mix(1.05, 0.55, diag);

    // Dither — kills banding across these large flat gradients on 8-bit panels.
    col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
}
`;

type Palette = { a: [number, number, number]; b: [number, number, number]; c: [number, number, number] };

/** BAMAS brand: slate ground, deep teal #052E40, additive green #0C9D6A. */
const DARK: Palette = {
    a: [0.031, 0.055, 0.094],
    b: [0.055, 0.196, 0.278],
    c: [0.047, 0.616, 0.416],
};

const LIGHT: Palette = {
    a: [0.925, 0.949, 0.961],
    b: [0.741, 0.867, 0.867],
    c: [0.220, 0.706, 0.553],
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
    ({ eyebrow, action, headline, links, speed = 1, amplitude = 0.22, className, children, ...props }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const panelRef = useRef<HTMLDivElement>(null);
        // Tracked in a ref so pointer movement never triggers a React render.
        const mouse = useRef({ x: 0.5, y: 0.5, on: 0 });

        useEffect(() => {
            const canvas = canvasRef.current;
            const panel = panelRef.current;
            if (!canvas || !panel) return;

            const gl = (canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }) ||
                canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

            // No WebGL (old device, acceleration disabled, context refused):
            // the CSS gradient underneath stays visible and we do nothing.
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

            // Cap DPR — this is a soft gradient, rendering above ~1.5x costs fill
            // rate and buys nothing visible.
            const resize = () => {
                const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
                const w = Math.max(1, Math.floor(panel.clientWidth * dpr));
                const h = Math.max(1, Math.floor(panel.clientHeight * dpr));
                if (canvas.width !== w || canvas.height !== h) {
                    canvas.width = w;
                    canvas.height = h;
                    gl.viewport(0, 0, w, h);
                }
                gl.uniform2f(uRes, canvas.width, canvas.height);
            };
            resize();
            const ro = new ResizeObserver(resize);
            ro.observe(panel);

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
                if (reduceMotion.matches) {
                    draw(0); // single static frame
                    return;
                }
                running = true;
                start = performance.now() - elapsed;
                raf = requestAnimationFrame(frame);
            };

            // Don't burn GPU while scrolled away or backgrounded.
            const io = new IntersectionObserver(
                ([e]) => {
                    visible = e.isIntersecting;
                    if (visible) play();
                    else stop();
                },
                { threshold: 0 }
            );
            io.observe(panel);

            const onVisibility = () => {
                if (document.hidden) stop();
                else play();
            };
            document.addEventListener("visibilitychange", onVisibility);

            const onMotionChange = () => {
                stop();
                play();
            };
            reduceMotion.addEventListener("change", onMotionChange);

            // Pointer tracked on the panel, not the canvas: content sits above the
            // canvas, so a canvas-bound listener would go dead over the text.
            const onMove = (e: PointerEvent) => {
                const r = panel.getBoundingClientRect();
                mouse.current.x = (e.clientX - r.left) / r.width;
                mouse.current.y = 1 - (e.clientY - r.top) / r.height; // GL y is bottom-up
                mouse.current.on = 1;
            };
            const onLeave = () => {
                mouse.current.on = 0;
            };
            panel.addEventListener("pointermove", onMove, { passive: true });
            panel.addEventListener("pointerleave", onLeave, { passive: true });

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
                reduceMotion.removeEventListener("change", onMotionChange);
                panel.removeEventListener("pointermove", onMove);
                panel.removeEventListener("pointerleave", onLeave);
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
                className={cn("relative w-full bg-background px-2 sm:px-3 md:px-5 pb-4 md:pb-6", className)}
                {...props}
            >
                <div
                    ref={panelRef}
                    className="relative w-full min-h-[520px] md:min-h-[600px] lg:min-h-[660px] rounded-[1.75rem] md:rounded-[2.5rem] overflow-hidden"
                >
                    {/* Painted behind the canvas: covers first paint and is the
                        permanent fallback when WebGL is unavailable. */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(135deg,#0E3A4E_0%,#0A1420_60%,#050A12_100%)]"
                    />
                    <canvas
                        ref={canvasRef}
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full block pointer-events-none"
                    />

                    {/* ── The notch. An overlay in the page background colour whose
                        rounded top-left corner reads as the panel curving inward.
                        Desktop only — on a phone there's no room for it. ── */}
                    <div
                        aria-hidden="true"
                        className="hidden md:block absolute bottom-0 right-0 w-[46%] lg:w-[42%] h-[30%] lg:h-[28%] bg-background rounded-tl-[2.5rem] rounded-br-[2.5rem] z-[5]"
                    />

                    {/* ── Content ── */}
                    {eyebrow && (
                        <div className="absolute top-6 left-6 md:top-10 md:left-12 z-[10] max-w-[45%]">
                            {eyebrow}
                        </div>
                    )}

                    {action && (
                        <div className="absolute top-6 right-6 md:top-10 md:right-12 z-[10]">{action}</div>
                    )}

                    {headline && (
                        <div className="absolute left-6 right-6 bottom-24 md:left-12 md:right-auto md:bottom-16 md:max-w-[56%] lg:max-w-[52%] z-[10]">
                            {headline}
                        </div>
                    )}

                    {/* Links sit inside the notch on desktop; below the headline on mobile. */}
                    {links && (
                        <div className="absolute right-6 bottom-6 md:right-12 md:bottom-10 z-[10] flex flex-row md:flex-col items-end gap-3 md:gap-2">
                            {links}
                        </div>
                    )}

                    {children}
                </div>
            </div>
        );
    }
);

GradientShaderHero.displayName = "GradientShaderHero";

export { GradientShaderHero };
export type { GradientShaderHeroProps };
