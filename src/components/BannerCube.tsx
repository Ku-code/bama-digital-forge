import React, { useEffect, useRef, useState, useCallback } from "react";

/**
 * Rotating banner cube.
 *
 * Four banners live on the four faces of a horizontal prism that tumbles
 * forward (around the X axis), so each banner rolls up and out while the next
 * rolls in from below.
 *
 * The faces are positioned with `rotateX(i * 90deg) translateZ(depth)`, where
 * `depth` is half the banner's height — that is what makes the four faces meet
 * at right angles instead of overlapping. Height is measured at runtime with a
 * ResizeObserver rather than hard-coded, because the banner is responsive
 * (12:1 on desktop, a taller stacked block on mobile).
 *
 * `index` increments forever instead of wrapping modulo 4 — wrapping would make
 * the cube spin backwards through three faces on every fourth step.
 */

interface BannerCubeProps {
    /** Face contents, front face first. Each fills the full banner area. */
    faces: React.ReactNode[];
    /** Time each face is shown, ms. */
    intervalMs?: number;
    className?: string;
}

const BannerCube: React.FC<BannerCubeProps> = ({ faces, intervalMs = 7000, className }) => {
    const stageRef = useRef<HTMLDivElement>(null);
    const [depth, setDepth] = useState(0);
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    // Half the banner height — the translateZ that forms the prism.
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const measure = () => setDepth(el.clientHeight / 2);
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const count = faces.length;

    // Auto-advance retires after a few full cycles so the page eventually
    // settles for readers; hovering or using the dots re-arms it.
    const MAX_AUTO_STEPS = count * 3;
    const autoSteps = useRef(0);

    useEffect(() => {
        if (paused || reducedMotion || count < 2) return;
        const id = window.setInterval(() => {
            if (autoSteps.current >= MAX_AUTO_STEPS) return;
            autoSteps.current += 1;
            setIndex((i) => i + 1);
        }, intervalMs);
        return () => window.clearInterval(id);
    }, [paused, reducedMotion, intervalMs, count, MAX_AUTO_STEPS]);

    // Pause while the banner is off-screen or the tab is hidden.
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setPaused((p) => (e.isIntersecting ? false : true)), {
            threshold: 0,
        });
        io.observe(el);
        const onVis = () => setPaused(document.hidden);
        document.addEventListener("visibilitychange", onVis);
        return () => {
            io.disconnect();
            document.removeEventListener("visibilitychange", onVis);
        };
    }, []);

    const goTo = useCallback(
        (target: number) => {
            autoSteps.current = 0; // interaction re-arms the auto cycle
            // Step forward to the requested face without ever spinning backwards.
            setIndex((i) => {
                const current = ((i % count) + count) % count;
                const delta = ((target - current) % count + count) % count;
                return i + delta;
            });
        },
        [count]
    );

    // Partner banners get click analytics — partners will ask for numbers.
    const trackClick = useCallback((face: number) => (e: React.MouseEvent) => {
        const href = (e.target as HTMLElement).closest('a')?.href;
        const w = window as unknown as { gtag?: (...args: unknown[]) => void };
        if (typeof w.gtag === 'function') {
            w.gtag('event', 'banner_click', { banner_face: face + 1, banner_url: href ?? '' });
        }
    }, []);

    const active = ((index % count) + count) % count;

    return (
        <div
            className={`w-full bg-background relative z-[41] ${className ?? ""}`}
            onMouseEnter={() => { setPaused(true); autoSteps.current = 0; }}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
        >
            <div
                ref={stageRef}
                className="relative w-full h-[132px] min-h-[132px] md:h-auto md:min-h-0 md:aspect-[12/1]"
                style={{ perspective: "1600px" }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        transformStyle: "preserve-3d",
                        transform: `translateZ(-${depth}px) rotateX(${-90 * index}deg)`,
                        transition: reducedMotion ? "none" : "transform 0.7s cubic-bezier(0.72, 0, 0.18, 1)",
                    }}
                >
                    {faces.map((face, i) => (
                        <div
                            key={i}
                            className="absolute inset-0 overflow-hidden"
                            style={{
                                transform: `rotateX(${90 * i}deg) translateZ(${depth}px)`,
                                backfaceVisibility: "hidden",
                            }}
                            // Faces that aren't showing are hidden from AT and tab order.
                            aria-hidden={i !== active}
                            {...(i !== active ? { inert: "" } : {})}
                            onClickCapture={trackClick(i)}
                        >
                            {face}
                        </div>
                    ))}
                </div>
            </div>

            {/* Face indicators */}
            {count > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[2] flex items-center gap-1.5">
                    {faces.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => goTo(i)}
                            aria-label={`Show banner ${i + 1} of ${count}`}
                            aria-current={i === active}
                            className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                                i === active ? "w-5 bg-white/90" : "w-1.5 bg-white/40 hover:bg-white/70"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BannerCube;
