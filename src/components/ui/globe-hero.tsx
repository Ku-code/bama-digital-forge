import React, { useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Rotating dot-globe hero.
 *
 * Renders on a plain 2D canvas rather than three.js / react-three-fiber. The
 * visual is unchanged — it is still the vertices of a UV sphere drawn as square
 * points under a perspective camera — but the maths is ~40 lines, so there is
 * no 232 KB `three` download, no WebGL context creation and no shader compile
 * before the globe appears. It paints on the first frame after mount, which is
 * why the old CSS spinning-ring placeholder is gone: there is nothing to wait
 * for any more.
 *
 * Geometry and camera below deliberately mirror the previous THREE setup:
 *   SphereGeometry(radius, 48, 48) → 49×49 = 2401 vertices
 *   PerspectiveCamera(fov 75, z 3), PointsMaterial(size .02, sizeAttenuation)
 * PointsMaterial with no map renders SQUARE points, hence fillRect.
 */

interface DotGlobeHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  rotationSpeed?: number;
  globeRadius?: number;
  className?: string;
  children?: React.ReactNode;
}

/** Vertices of a UV sphere, matching THREE.SphereGeometry's ordering. */
function sphereVertices(radius: number, widthSeg: number, heightSeg: number): Float32Array {
  const out = new Float32Array((widthSeg + 1) * (heightSeg + 1) * 3);
  let i = 0;
  for (let iy = 0; iy <= heightSeg; iy++) {
    const v = iy / heightSeg;
    const theta = v * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    for (let ix = 0; ix <= widthSeg; ix++) {
      const u = ix / widthSeg;
      const phi = u * Math.PI * 2;
      out[i++] = -radius * Math.cos(phi) * sinTheta;
      out[i++] = radius * cosTheta;
      out[i++] = radius * Math.sin(phi) * sinTheta;
    }
  }
  return out;
}

const DotGlobeHero = React.forwardRef<HTMLDivElement, DotGlobeHeroProps>(
  ({ rotationSpeed = 0.005, globeRadius = 1.134, className, children, ...props }, ref) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isMobile = useIsMobile();

    const config = useMemo(
      () => ({
        radius: isMobile ? globeRadius * 0.75 : globeRadius * 1.5,
        seg: isMobile ? 32 : 48,
        pointSize: isMobile ? 0.015 : 0.02,
        camZ: isMobile ? 3.5 : 3,
        fov: isMobile ? 60 : 75,
      }),
      [isMobile, globeRadius]
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      const host = hostRef.current;
      if (!canvas || !host) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { radius, seg, pointSize, camZ, fov } = config;
      const verts = sphereVertices(radius, seg, seg);
      const count = verts.length / 3;

      let colour = "#ffffff";
      let alpha = 0.8;
      const applyTheme = () => {
        const dark = document.documentElement.classList.contains("dark");
        colour = dark ? "#ffffff" : "#0C9D6A";
        alpha = dark ? 0.8 : 0.6;
      };
      applyTheme();
      const themeObserver = new MutationObserver(applyTheme);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      let W = 0;
      let H = 0;
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = Math.max(1, Math.floor(host.clientWidth * dpr));
        H = Math.max(1, Math.floor(host.clientHeight * dpr));
        if (canvas.width !== W || canvas.height !== H) {
          canvas.width = W;
          canvas.height = H;
        }
      };
      resize();
      const ro = new ResizeObserver(() => {
        resize();
        render();
      });
      ro.observe(host);

      let rotY = 0;
      let rotX = 0;

      const render = () => {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = colour;
        ctx.globalAlpha = alpha;

        // Perspective projection, matching THREE.PerspectiveCamera.
        const f = 1 / Math.tan((fov * Math.PI) / 360);
        const aspect = W / H;
        const fx = (f / aspect) * 0.5 * W;
        const fy = f * 0.5 * H;
        const cx = W * 0.5;
        const cy = H * 0.5;
        // sizeAttenuation: gl_PointSize = size * (height/2) / -z_view
        const sizeScale = pointSize * H * 0.5;

        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);

        for (let i = 0; i < count; i++) {
          const x0 = verts[i * 3];
          const y0 = verts[i * 3 + 1];
          const z0 = verts[i * 3 + 2];

          // Rotate about Y, then X.
          const x1 = x0 * cosY + z0 * sinY;
          const z1 = -x0 * sinY + z0 * cosY;
          const y2 = y0 * cosX - z1 * sinX;
          const z2 = y0 * sinX + z1 * cosX;

          const depth = camZ - z2; // distance in front of the camera
          if (depth <= 0.01) continue;

          const sx = cx + (fx * x1) / depth;
          const sy = cy - (fy * y2) / depth;
          const s = sizeScale / depth;
          ctx.fillRect(sx - s * 0.5, sy - s * 0.5, s, s);
        }
        ctx.globalAlpha = 1;
      };

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

      let raf = 0;
      let running = false;
      let visible = true;
      let last = performance.now();
      let elapsed = 0;

      const frame = (now: number) => {
        const dt = now - last;
        last = now;
        elapsed += dt;
        // Normalised to 60fps so the speed matches the old per-frame increment
        // regardless of display refresh rate.
        rotY += rotationSpeed * (dt / 16.6667);
        rotX = Math.sin((elapsed / 1000) * 0.2) * 0.1;
        render();
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
          render(); // one static frame
          return;
        }
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      };

      // Paint immediately — this is the whole point: the globe is on screen in
      // the same frame the component mounts.
      render();

      const io = new IntersectionObserver(
        ([e]) => {
          visible = e.isIntersecting;
          if (visible) play();
          else stop();
        },
        { threshold: 0 }
      );
      io.observe(host);

      const onVisibility = () => {
        if (document.hidden) stop();
        else play();
      };
      document.addEventListener("visibilitychange", onVisibility);
      const onMotion = () => {
        stop();
        play();
      };
      reduceMotion.addEventListener("change", onMotion);

      play();

      return () => {
        stop();
        io.disconnect();
        ro.disconnect();
        themeObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        reduceMotion.removeEventListener("change", onMotion);
      };
    }, [config, rotationSpeed]);

    return (
      <div
        ref={ref}
        className={cn("relative w-full min-h-screen bg-background overflow-hidden", className)}
        {...props}
      >
        <div className="absolute inset-0 z-[10] flex flex-col items-center justify-center h-full w-full px-4">
          {children}
        </div>

        <div ref={hostRef} className="absolute inset-0 z-[1] pointer-events-none">
          <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
        </div>
      </div>
    );
  }
);

DotGlobeHero.displayName = "DotGlobeHero";

export { DotGlobeHero, type DotGlobeHeroProps };
