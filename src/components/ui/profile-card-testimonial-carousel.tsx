import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Github,
    Twitter,
    Youtube,
    Linkedin,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Profile-card carousel (adapted from the supplied Next.js component).
 *
 * Changes from the original:
 * - Vite/react-router project: next/image -> <img>, next/link -> <a>,
 *   "use client" removed.
 * - Prop-driven `items` instead of hardcoded testimonials, so it can present
 *   board members, testimonials, or any people list.
 * - Theme tokens (bg-card / border / primary) instead of hardcoded grays so
 *   both BAMAS themes work.
 * - `imageFit` option: the BAMAS team photos are transparent cut-outs that
 *   must not be face-cropped by object-cover; "contain" renders them on the
 *   brand gradient tile instead.
 * - Optional slow auto-advance (pauses on hover and after interaction).
 * - Social icons render only when a URL is provided.
 */

export interface ProfileCardItem {
    name: string;
    title: string;
    description?: string;
    imageUrl: string;
    githubUrl?: string;
    twitterUrl?: string;
    youtubeUrl?: string;
    linkedinUrl?: string;
}

export interface ProfileCardCarouselProps {
    items: ProfileCardItem[];
    className?: string;
    /** "cover" for photos, "contain" for transparent cut-outs. */
    imageFit?: "cover" | "contain";
    /** Auto-advance interval in ms; 0 disables. */
    autoAdvanceMs?: number;
    /** aria labels for prev/next, override for i18n */
    prevLabel?: string;
    nextLabel?: string;
}

export function ProfileCardCarousel({
    items,
    className,
    imageFit = "cover",
    autoAdvanceMs = 0,
    prevLabel = "Previous",
    nextLabel = "Next",
}: ProfileCardCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    /* Pause on hover only for real mice. Touch taps synthesize mouseenter
       with no matching mouseleave, which used to leave the slideshow frozen
       for the rest of the visit on phones. */
    const pauseForMouse = (event: React.PointerEvent) => {
        if (event.pointerType === "mouse") setPaused(true);
    };
    const resume = () => setPaused(false);

    const count = items.length;
    const handleNext = useCallback(
        () => setCurrentIndex((index) => (index + 1) % count),
        [count]
    );

    /* Bumped by every manual navigation so the auto-advance timer restarts;
       without it a click could be followed by an automatic jump a moment
       later, which reads as the slideshow fighting the visitor. */
    const [cycle, setCycle] = useState(0);
    const goTo = (next: number | ((index: number) => number)) => {
        setCurrentIndex(next);
        setCycle((c) => c + 1);
    };
    const handlePrevious = () => goTo((index) => (index - 1 + count) % count);
    const handleNextClick = () => goTo((index) => (index + 1) % count);

    useEffect(() => {
        if (!autoAdvanceMs || paused || count < 2) return;
        const id = window.setInterval(handleNext, autoAdvanceMs);
        return () => window.clearInterval(id);
    }, [autoAdvanceMs, paused, count, handleNext, cycle]);

    const current = items[currentIndex];
    if (!current) return null;

    const socialIcons = [
        { icon: Github, url: current.githubUrl, label: "GitHub" },
        { icon: Twitter, url: current.twitterUrl, label: "Twitter" },
        { icon: Youtube, url: current.youtubeUrl, label: "YouTube" },
        { icon: Linkedin, url: current.linkedinUrl, label: "LinkedIn" },
    ].filter((s) => s.url);

    const imageTile = (sizeClasses: string, imgSize: number) => (
        <div
            className={cn(
                "overflow-hidden rounded-3xl bg-gradient-to-br from-primary/30 via-primary/10 to-muted/60 border border-primary/15 flex-shrink-0",
                sizeClasses
            )}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={current.imageUrl}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="h-full w-full"
                >
                    {current.imageUrl ? (
                        <img
                            src={current.imageUrl}
                            alt={current.name}
                            width={imgSize}
                            height={imgSize}
                            className={cn(
                                "h-full w-full",
                                imageFit === "contain"
                                    ? "object-contain object-bottom drop-shadow-2xl"
                                    : "object-cover"
                            )}
                            draggable={false}
                        />
                    ) : (
                        /* No photo yet — initial-letter placeholder */
                        <div className="flex h-full w-full items-center justify-center">
                            <span className="text-7xl font-black text-primary/40">
                                {current.name.charAt(0)}
                            </span>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );

    const socials = (centered = false) =>
        socialIcons.length > 0 && (
            <div className={cn("flex space-x-4", centered && "justify-center")}>
                {socialIcons.map(({ icon: IconComponent, url, label }) => (
                    <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                        aria-label={label}
                    >
                        <IconComponent className="h-5 w-5" />
                    </a>
                ))}
            </div>
        );

    return (
        <div
            className={cn("mx-auto w-full max-w-3xl px-4", className)}
            onPointerEnter={pauseForMouse}
            onPointerLeave={resume}
            onPointerCancel={resume}
        >
            {/* Desktop layout */}
            <div className="relative hidden items-center md:flex">
                {imageTile("h-[300px] w-[300px]", 300)}

                {/* Card */}
                <div className="z-10 ml-[-60px] max-w-md flex-1 rounded-2xl border border-primary/15 bg-card p-6 shadow-2xl backdrop-blur-xl">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={current.name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            <div className="mb-4">
                                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                                    {current.title}
                                </p>
                                <h3 className="text-2xl font-extrabold text-foreground">
                                    {current.name}
                                </h3>
                            </div>

                            {current.description && (
                                <p className="mb-6 text-sm leading-relaxed text-foreground/80">
                                    {current.description}
                                </p>
                            )}

                            <div className="mb-2 h-1 w-16 rounded-full bg-primary/30" />

                            {socials()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile layout */}
            <div className="mx-auto max-w-sm bg-transparent text-center md:hidden">
                {imageTile("mb-5 mx-auto aspect-square w-64", 320)}

                <div className="px-4">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={current.name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            <p className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                                {current.title}
                            </p>
                            <h3 className="mb-3 text-xl font-extrabold text-foreground">
                                {current.name}
                            </h3>
                            {current.description && (
                                <p className="mb-6 text-sm leading-relaxed text-foreground/80">
                                    {current.description}
                                </p>
                            )}
                            {socials(true)}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom navigation */}
            <div className="mt-6 flex items-center justify-center gap-5">
                <button
                    onClick={handlePrevious}
                    aria-label={prevLabel}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:border-primary/50 hover:bg-muted"
                >
                    <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>

                <div className="flex gap-2">
                    {items.map((_, itemIndex) => (
                        <button
                            key={itemIndex}
                            onClick={() => goTo(itemIndex)}
                            className={cn(
                                "h-2.5 w-2.5 cursor-pointer rounded-full transition-all",
                                itemIndex === currentIndex
                                    ? "w-6 bg-primary"
                                    : "bg-muted-foreground/40 hover:bg-muted-foreground/70"
                            )}
                            aria-label={`${itemIndex + 1} / ${items.length}`}
                            aria-current={itemIndex === currentIndex}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNextClick}
                    aria-label={nextLabel}
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:border-primary/50 hover:bg-muted"
                >
                    <ChevronRight className="h-5 w-5 text-foreground" />
                </button>
            </div>
        </div>
    );
}
