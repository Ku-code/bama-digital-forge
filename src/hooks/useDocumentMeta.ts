import { useEffect } from "react";

interface DocumentMeta {
  /** Page title — set as-is (include brand suffix yourself if wanted). */
  title: string;
  /** Meta description for this route. */
  description?: string;
  /** Canonical URL (absolute). Defaults to https://www.bamas.xyz + pathname. */
  canonical?: string;
  /** Set true on routes that must not be indexed (auth, dashboard, 404). */
  noindex?: boolean;
}

const SITE_ORIGIN = "https://www.bamas.xyz";

/**
 * Per-route document metadata for a client-rendered SPA.
 *
 * Every route previously shared the single static <title>/<meta> from
 * index.html. This hook keeps title, description, canonical and robots in
 * sync with the active route, and restores the homepage defaults on unmount
 * so navigating back never leaves stale metadata behind.
 */
export function useDocumentMeta({ title, description, canonical, noindex }: DocumentMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const ensureTag = (selector: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = create();
        document.head.appendChild(el);
      }
      return el;
    };

    // Description
    let prevDescription: string | null = null;
    if (description) {
      const meta = ensureTag('meta[name="description"]', () => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        return m;
      }) as HTMLMetaElement;
      prevDescription = meta.content;
      meta.content = description;
    }

    // Canonical
    const link = ensureTag('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    }) as HTMLLinkElement;
    const prevCanonical = link.href;
    link.href = canonical ?? `${SITE_ORIGIN}${window.location.pathname}`;

    // Robots
    let robots = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const hadRobots = !!robots;
    const prevRobots = robots?.content ?? "";
    if (noindex) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.setAttribute("name", "robots");
        document.head.appendChild(robots);
      }
      robots.content = "noindex, nofollow";
    } else if (robots) {
      robots.remove();
      robots = null;
    }

    return () => {
      document.title = prevTitle;
      if (description && prevDescription !== null) {
        const meta = document.head.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        if (meta) meta.content = prevDescription;
      }
      link.href = prevCanonical;
      const currentRobots = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
      if (noindex && currentRobots) {
        if (hadRobots) currentRobots.content = prevRobots;
        else currentRobots.remove();
      }
    };
  }, [title, description, canonical, noindex]);
}
