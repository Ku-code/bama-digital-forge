import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Placeholder face for the banner cube.
 *
 * Stands in for banners 2–4 until real creatives arrive. To replace one, swap
 * the corresponding entry in the `faces` array in `src/pages/Index.tsx` for a
 * real banner component — it just needs to fill `w-full h-full`.
 */

interface PlaceholderBannerProps {
    /** 1-based slot number, shown in the label. */
    slot: number;
    /** Optional accent so the four faces are visually distinguishable. */
    accent?: string;
}

const PlaceholderBanner = ({ slot, accent = "#052E40" }: PlaceholderBannerProps) => {
    const { language } = useLanguage();
    const bg = language === "bg";

    return (
        <div
            className="w-full h-full flex items-center justify-center px-6"
            style={{ backgroundColor: accent }}
        >
            <div className="flex items-center gap-3 md:gap-5 text-center">
                <span
                    aria-hidden="true"
                    className="hidden md:inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/25 text-sm font-bold text-white/70"
                >
                    {slot}
                </span>
                <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
                    <span className="text-sm md:text-xl font-bold uppercase tracking-wide text-white/90">
                        {bg ? `Банер ${slot}` : `Banner slot ${slot}`}
                    </span>
                    <span className="text-[11px] md:text-sm text-white/50">
                        {bg ? "предстои" : "coming soon"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PlaceholderBanner;
