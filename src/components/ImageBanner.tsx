/**
 * Partner banner supplied as a finished image (GIF/WebP) rather than built in
 * markup, as MachTechBanner and RSFBanner are.
 *
 * The cube stage is 12:1 on desktop and a 132px block on mobile, but supplied
 * artwork rarely matches either. The image is therefore letterboxed with
 * `object-contain` over `background`, which must be sampled from the artwork's
 * own edge pixels — matched correctly the bars are invisible and the banner
 * simply reads as having wider margins. Cropping with `cover` is not an option:
 * these are ad creatives with type running close to all four edges.
 */

interface ImageBannerProps {
    /** Path under /banners. */
    src: string;
    /** Where the whole strip links to. */
    href: string;
    /** Describes the event, and says the link opens in a new tab. */
    alt: string;
    /** CSS colour matching the artwork's edge pixels. */
    background: string;
}

const ImageBanner: React.FC<ImageBannerProps> = ({ src, href, alt, background }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
        style={{ backgroundColor: background }}
    >
        <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain"
            loading="lazy"
            decoding="async"
        />
    </a>
);

export default ImageBanner;
