import { useEffect, useRef, useState } from "react";

interface LazyMapProps {
    src: string;
    title: string;
    className?: string;
}

/**
 * Facade-pattern lazy Google Maps embed.
 *
 * The map iframe used to load eagerly with all of Google Maps' JS for a
 * generic country-level view most visitors never interact with. Now the
 * iframe is injected only when the map area scrolls near the viewport.
 */
const LazyMap = ({ src, title, className }: LazyMapProps) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const [load, setLoad] = useState(false);

    useEffect(() => {
        const el = hostRef.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setLoad(true);
                    io.disconnect();
                }
            },
            { rootMargin: "400px" }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={hostRef} className={className}>
            {load ? (
                <iframe
                    src={src}
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                    title={title}
                />
            ) : (
                <div
                    className="flex h-[450px] w-full items-center justify-center bg-muted/40 text-sm text-muted-foreground"
                    aria-hidden="true"
                >
                    …
                </div>
            )}
        </div>
    );
};

export default LazyMap;
