# BAMAS.xyz — Complete UI/UX, Performance, SEO & GEO Enhancement Plan

**Status: EXECUTED (2026-08-16) — Phases 0–2 and the SEO/GEO technical layer are live.
See "Execution status & required user actions" at the top. Phase 3 (editorial content) and
§5.1 prerendering remain open, plus the user-action items below.**

---

## Execution status & required user actions

### Shipped (commits 73360bb, d247105, 8ccbdf0 + follow-ups)
- **Phase 0 — all 12 items**: 63 MB team photos → 96 KB WebP; newsletter really
  subscribes; og:url/og:image fixed; dynamic <html lang>; content visible-by-default
  (js-anim progressive enhancement + 3s fail-safe); Context7 key removed from repo;
  single h1 + <main> + skip link; membership function hardened (origin allow-list,
  rate limit, honeypot, store-before-email); analytics consent-gated + gptengineer.js
  removed; remaining big images compressed; aria-labels + newsletter label; navbar
  active-state and cross-route links fixed.
- **SEO/GEO layer**: robots.txt with AI-crawler allows + Sitemap; sitemap.xml; llms.txt;
  JSON-LD Organization/WebSite (static) + Event + FAQPage + DefinedTermSet (in-app);
  canonical/hreflang/OG/Twitter complete; per-route meta on all pages via
  useDocumentMeta; noscript canon block; RSS autodiscovery.
- **Phase 1**: hero factual tagline + height cap; About canon paragraph; Upcoming-events
  grid with Event schema + history split; pricing FAQ; real stored contact form +
  lazy map facade + legal identity lines; footer links/legal; news.json ticker
  (dated/typed/localized, pause-on-hover, reading-speed duration, links to /news);
  cube pause-after-3-cycles + GA4 banner_click events + mobile min-height; mobile
  menu stagger halved; /join alias.
- **Phase 2**: /faq, /news, /glossary (+/rechnik) public pages; rss.xml generated at
  build; migrations 026 (newsletter_subscribers, contact_messages,
  membership_applications) and 027 (public glossary read).

### ⚠️ Requires your action (cannot be done from this machine)
1. **Apply migrations 026 + 027** in the Supabase SQL editor
   (`supabase/migrations/026_newsletter_and_contact.sql`, `027_public_glossary_read.sql`).
   Until 026 runs, newsletter/contact submissions return a friendly error;
   until 027 runs, /glossary shows the members-teaser state.
2. **Redeploy the edge function** `send-membership-application`
   (`supabase functions deploy send-membership-application`) to activate the
   origin allow-list, rate limit, honeypot and store-first behavior.
3. **Rotate the Context7 API key** (it was committed historically; removal from the
   repo does not un-leak it).
4. **Search Console**: submit https://www.bamas.xyz/sitemap.xml; verify domain.
5. **Off-page (§5.4/§6.6)**: Wikidata entity, Google Business Profile, partner
   backlink round, LinkedIn completeness — human-owned tasks.

### Still open from the plan
- §5.1 prerendering (biggest remaining SEO lever) — recommend vite prerender or Astro
  migration for public routes as a dedicated project.
- Phase 3 editorial: 4 pillar articles, monthly news posts, annual report.
- §3.4 board roles/affiliations/LinkedIn (needs real data from you).
- §3.8 dashboard screenshot tour (needs an account/screenshots you approve).
- Pricing per-tier feature matrix (§3.7) — deferred in favour of the FAQ.

---

Prepared after a full audit of the live site (www.bamas.xyz) and the codebase: every homepage
section walked at desktop (1512px) and mobile (390px), a programmatic DOM/accessibility audit,
form-functionality tracing through the source, asset weighing, and a review of the existing
`SEO.md` / `GEO.md` strategy docs against what is actually implemented.

Verdict up front: **the platform behind the login is far stronger than the public site.**
The dashboard has 60+ components, a bilingual terminology dictionary, a materials database, an
EU funding radar — genuinely citable, differentiating assets — and the public site shows none
of it. The public site is one long animated page that hides its content from crawlers, ships
60 MB of photos, lies to users in two forms, and has no per-page metadata. The 100x is not a
restyle; it is turning a brochure into the **authoritative public knowledge hub for additive
manufacturing in Bulgaria**, which is exactly what SEO and GEO reward.

---

## Table of contents

1. [Critical defects found (fix before anything else)](#1-critical-defects)
2. [Global / systemic findings](#2-global-findings)
3. [Section-by-section audit](#3-section-audit)
4. [The 100x enhancement plan (phased)](#4-the-plan)
5. [SEO deep plan](#5-seo)
6. [GEO (Generative Engine Optimization) deep plan](#6-geo)
7. [Popularization & marketing plan](#7-marketing)
8. [Impact/effort matrix & sequencing](#8-matrix)
9. [Verification & acceptance criteria](#9-verification)

---

<a name="1-critical-defects"></a>
## 1. Critical defects found (fix before anything else)

These are not enhancements — they are bugs and integrity problems, each verified directly.

### 1.1 — 60 MB of board-member photos on the homepage 🔴
`public/no background images members/` weighs **60 MB** and every image loads on the homepage
via `BoardMembersCarousel`. Individual files: `lyubomir_gerasimov.png` **12 MB**,
`nikolay_yordanov.png` **11 MB**, `boyan_pehlevanov.png` 9.1 MB, `kuzo_donchev.png` 9.0 MB,
`krasimir_georgiev.png` 8.0 MB, `vasil_nikolov.png` 7.7 MB. These render at roughly 130×130 px.
On a 4G connection this section alone takes minutes to fully load and will destroy LCP/CWV
scores, which are a direct ranking factor.
**Fix:** convert to WebP/AVIF at 2× display size (~300px), ≤ 40 KB each → **60 MB → ~0.4 MB
(-99.3%)**. Also rename the directory: spaces in `no background images members/` produce
`%20`-encoded URLs, which are fragile and ugly in logs.

### 1.2 — The newsletter form is fake 🔴
`Index.tsx:984` — submitting the footer newsletter shows *"Thank you for subscribing with
{email}! We'll keep you updated."* and **discards the email**. No table, no service, nothing.
Every subscriber the site has ever "collected" is lost, and for an association this is the
single most valuable marketing asset being thrown away.
**Fix:** persist to a `newsletter_subscribers` Supabase table (with double-opt-in via the
existing Resend edge-function infrastructure), or wire to a list provider. Same audit applies
to `handleFormSubmit` (`Index.tsx:87`) which fake-toasts "Form Submitted" for any form using it.

### 1.3 — Open Graph URL points to the wrong domain 🔴
`index.html`: `og:url` is `https://bamas.bg` — **not this site's domain** (bamas.xyz). Every
share on LinkedIn/Facebook attributes content to a domain the association doesn't control.
Additionally `og:image` is a relative path (`/bamas-uploads/BamasMain.png`) — OG images **must
be absolute URLs** or most scrapers show no image at all.
**Fix:** `og:url` → `https://www.bamas.xyz/`, `og:image` → absolute URL, add
`og:image:width/height`, `og:type`, `og:locale` + alternate.

### 1.4 — `<html lang="en">` on a Bulgarian-default site 🔴
Default content renders in Bulgarian, but the document declares English. This misleads
search engines' language detection, screen readers (Bulgarian text read with English
phonetics), and AI crawlers deciding which language market the site serves.
**Fix:** set `lang` dynamically from `LanguageContext` (`bg` default), and keep it in sync on
toggle.

### 1.5 — Content is invisible to non-scrolling agents 🔴
42 elements (whole sections: Objectives, Member Benefits, Membership, Events, Partner-with-us,
Contact) carry `animate-on-scroll opacity-0` and only become visible when a JS
IntersectionObserver fires on scroll. Verified live: jumping mid-page shows large blank
regions; the Events timeline and Membership zones render as near-empty screens for seconds.
Googlebot renders pages but **does not scroll** — everything below the first viewport that
depends on IO may be treated as hidden content. AI crawlers (GPTBot, ClaudeBot, PerplexityBot)
mostly don't execute JS at all, so they see **an empty `<div id="root">`**.
**Fix (two layers):** (a) make content visible-by-default and use animation only as
*progressive enhancement* (e.g. `motion.whileInView` with `initial={false}` on the server
path, or CSS `@media (prefers-reduced-motion: no-preference)` gating); (b) prerender — see §5.1.

### 1.6 — A committed API key in the repo 🔴
`.cursor/mcp.json` contains a plaintext Context7 API key (`ctx7sk-…`) committed to a public
repo. Rotate the key, move it to an env var, gitignore the file. (Flagged in an earlier
session; still present.)

### 1.7 — Two `<h1>` elements, zero `<main>`, zero JSON-LD 🟠
Verified via DOM audit: `h1` count = 2 (hero renders the title twice — the blur-echo
duplicate is a real heading in the DOM), no `<main>` landmark, no structured data at all,
and `h2` order jumps around ("About Us" → board `h3`s ×30 (three carousel clones) → "BULGARIAN
ADDITIVE HUB"). The tripled board-member headings (9 people × 3 carousel copies = 27 `h3`s)
pollute the document outline.
**Fix:** one `h1`; `aria-hidden="true"` on the decorative blur duplicate; wrap page content in
`<main>`; carousel clones get `aria-hidden` + heading demotion; add JSON-LD (§5.2).

### 1.8 — The public membership email relay has no abuse protection 🟠
`send-membership-application` edge function: `Access-Control-Allow-Origin: *`, no rate limit,
no captcha/honeypot, sends via Resend on every request. Discoverable and abusable; can burn
the Resend quota and get the domain flagged.
**Fix:** Cloudflare Turnstile (invisible) + per-IP rate limit in the function + origin check.

---

<a name="2-global-findings"></a>
## 2. Global / systemic findings

### 2.1 Performance
| Item | Today | Target |
|---|---|---|
| Homepage eager JS | ~284 KB gz (already fixed in prior sessions from 1,083 KB) | keep < 300 KB |
| Board photos | **60 MB** PNG | ~0.4 MB WebP |
| `GreMa3D_Blue.png` partner logo | 1.4 MB | < 30 KB |
| `bamas-map-logo.png` | 1.2 MB | < 60 KB |
| Web fonts | 3 families (Sofia Sans + Oswald + Rubik), render-blocking `<link>` CSS | preload + `font-display: swap`; subset Oswald/Rubik to the exact weights the banners use |
| 3rd-party JS in `<head>` | gtag + Clarity + **`cdn.gpteng.co/gptengineer.js`** | remove gptengineer.js entirely (Lovable dev artifact shipped to production); defer analytics until consent |
| Images | no `width`/`height` attrs (CLS), no `srcset`, no lazy except CSS hack | proper `<img>` hygiene site-wide |

Notes: the CSS `img { loading: lazy }` rule in `index.css` does nothing — `loading` is an HTML
attribute, not a CSS property. The mobile "optimization" block is a no-op.

### 2.2 Accessibility (WCAG 2.1 AA gaps found)
- **~30 icon/logo links with no accessible name** (partner carousel links wrap images; footer
  social icons; verified `emptyLinks` in audit). Add `aria-label`s.
- Newsletter input has **no label** (placeholder only).
- 2 unnamed icon buttons.
- Carousel clones are focusable — keyboard users tab through 27 board cards, 3× each person.
- Very low-contrast body text in several places: `text-foreground/55` links on the hero,
  `#B8B8B8`-on-black banner subtext at tiny sizes, muted gray on `bg-muted/30` sections —
  several measure below 4.5:1.
- Focus states exist (good) but scroll-triggered content means keyboard-focus can land on
  invisible elements mid-animation.
- No skip-to-content link.

### 2.3 Information architecture & conversion
The entire public site is **one page + a documents page**. Consequences:
- Only one URL can rank for anything (see §5).
- No page for the association's best assets: the terminology dictionary, the materials DB, the
  additive map, the EU funding radar all sit behind login — invisible to search, AI, and
  prospective members evaluating whether membership is worth it.
- **No member-facing proof**: no member logos wall as social proof near pricing, no
  testimonials, no "N members / M partners / K events" numbers anywhere.
- The membership funnel has friction stacked at the wrong point: "Join Now" on a pricing card
  opens a large multi-field modal immediately; there is no intermediate "what happens next"
  reassurance, no member count, no logos.
- Two CTAs compete in the hero ("Стани член" / "За нас") with equal-adjacent weight, plus four
  more CTAs visible simultaneously (banner cube CTA, Register in nav, Login). Attention is
  split five ways above the fold.
- The news ticker mixes major announcements (partnerships) with routine items at the same
  visual priority, scrolling too fast to read comfortably (30s loop across ~9 items in 2 rows).

### 2.4 The banner cube + ticker + hero stack
Three attention-competing animated systems are stacked at the top: tumbling banner cube
(3.5s/face), scrolling news ticker (two rows), and the rotating dot globe. Each is individually
fine; together they create a fairground effect and push the `h1` far down (~600 px of promo
before the association's own name appears). Recommendation in §4 Phase 2.

### 2.5 Theme & language
- Dark-mode-forced by inline script; light mode exists but several surfaces were clearly only
  designed dark (banner scrims, footer watermark). Screenshot pass showed light mode works but
  with weaker contrast hierarchy.
- Language toggle exists in 3 different UIs (navbar globe, footer switch, mobile menu) with
  different visual languages — consolidate.
- `lang` attr never changes (see 1.4); URLs don't encode language (see §5.3).

### 2.6 Trust & authority surface (what's *missing* globally)
No public: member directory teaser, annual report, press kit, founding date/legal identity
(the UIC/ЕИК number appears only inside a PDF), team credentials, articles/news pages
(the ticker links point *off-site*), or any dated content whatsoever. Search engines and AI
models rank *entities* — the site gives almost no machine-readable evidence that the entity
exists, is active, and is authoritative.

---

<a name="3-section-audit"></a>
## 3. Section-by-section audit

Ordered top to bottom as rendered. ✅ = works well, keep. ⚠️ = enhance. 🔴 = defect.

### 3.0 Navbar
- ✅ Sticky, clean, active-section highlight, auth-aware buttons.
- 🔴 Active-link logic: on `/documents` the highlight stays on "Home" (verified).
- ⚠️ White rounded logo tile looks like a placeholder chip at 1512px — the actual logo art is
  illegible at 40px. A horizontal lockup (mark + "БАЗАП / BAMAS" wordmark) would carry far
  more brand.
- ⚠️ Login/Register both visible pre-auth: one primary CTA is enough; "Login" can be quiet text.
- ⚠️ Mobile menu items animate in with a long stagger — Contact is invisible for ~1s after
  opening (verified mid-animation screenshot); items also have odd increasing indentation.
- ⚠️ No skip link; nav landmarks: 3 `<nav>` elements with no `aria-label` distinctions.

### 3.1 Banner cube (partner banners)
- ✅ Solid engineering: measured ports, correct pausing, a11y (`inert`, `aria-hidden`,
  indicators), reduced-motion fallbacks.
- ⚠️ 3.5 s/face at 0.7 s tumble means motion 20% of the time, near the top of every page view.
  Consider 5–6 s dwell, and **pause after 2 full cycles** (8 rotations) then resume on hover —
  eliminates permanent motion for readers.
- ⚠️ The four banners have four different design languages (blue Oswald / white+black RSF /
  chartreuse Rubik / teal-white IndustryInfo). Unavoidable (partner creatives), but a thin
  BAMAS-branded frame (label "Партньорски събития · Partner events") would explain *why* this
  strip exists — first-time visitors currently see unexplained third-party ads.
- ⚠️ No analytics events on banner clicks — the partners will ask for numbers; instrument now.
- ⚠️ Mobile: 132 px fixed height truncates RSF/IndustryInfo bottom rows on narrow devices with
  large font settings — needs `min-height` + clamp rather than fixed height.

### 3.2 News ticker
- ⚠️ Reading speed: 30 s loop regardless of content length; with 9 items the effective
  per-item exposure is ~3 s split across two rows moving in the same direction. Slow to 45–60s
  and pause on hover (currently continues under the cursor).
- ⚠️ All items visually identical — add small type tags (Партньор / Събитие / Медия) and dates.
  Undated news reads as stale news the moment it isn't.
- ⚠️ `news.txt` fetch every 5 minutes is fine, but the file format (pipe-separated) supports no
  dates/types. Move to `news.json` with `{date, type, url, title_bg, title_en}` — this also
  becomes a GEO surface (§6).
- 🔴 Titles are not localized — Bulgarian headlines show on the English site and vice versa.

### 3.3 Hero (dot globe)
- ✅ Instant-paint canvas globe (fixed in a prior session), good motion, brand-consistent.
- 🔴 Duplicate `h1` text node for the blur echo — screen readers announce the title twice;
  crawlers see duplicated heading text. Make the echo `aria-hidden`.
- ⚠️ The `h1` is the association name only. For SEO the strongest pattern is
  *name + what it is*: "Българска асоциация за адитивно производство — националната
  организация за 3D печат и Industry 4.0" with the tagline as a real `<p>`.
- ⚠️ Subtitle "Обединяваме иновациите. Укрепваме индустрията. Формираме бъдещето." is pure
  slogan — zero information scent. One concrete line ("Обединяваме N компании, университети и
  стартъпи в българската AM екосистема") converts and ranks better.
- ⚠️ `min-h-screen` hero after ~350 px of banners+ticker = the fold shows *only* decoration on
  smaller laptops (900 px viewports): banner + ticker + badge + half the title. Cap hero at
  `min-h-[calc(100vh-<stack>)]` or reduce to ~80 vh.
- ⚠️ Globe is decorative-only; a a low-cost upgrade with real meaning: plot member-city dots
  (Sofia, Plovdiv, Varna…) on the sphere — turns decoration into evidence.

### 3.4 About Us / Bulgarian map + board carousel
- ✅ The Bulgaria-map motif with circuit traces is the strongest visual idea on the site.
- 🔴 60 MB images (§1.1).
- 🔴 27 `h3` headings from carousel cloning (§1.7).
- ⚠️ Board members have **names only** — no titles, no companies, no LinkedIn. For an
  association, the board *is* the credibility; each card needs role + affiliation + link.
    These are also the entities GEO needs (People ↔ Organization links, §6).
- ⚠️ "About Us" heading followed by... a map and portraits. The actual *about text* (who,
  since when, legal form, how many members) doesn't exist on the page. Add a 3-sentence
  factual intro (the GEO canon paragraph, §6.2) directly under the heading.
- ⚠️ Carousel auto-scrolls with no pause control; on mobile it's the heaviest scroll jank
  source (now moot once images are 40 KB).

### 3.5 Vision / Mission ("BULGARIAN ADDITIVE HUB")
- ✅ Clear, expandable cards work, four supporting pillars are scannable.
- ⚠️ Heading says "BULGARIAN ADDITIVE HUB" while nav says "Our Mission" — terminology drift
  confuses both users and crawlers. Align heading to nav label + keyword ("Мисия и визия").
- ⚠️ Expand/collapse hides content from crawlers pre-render; default-open on desktop.
- ⚠️ The four pillar cards are near-duplicates of the Objectives section below — two sections
  saying the same thing halves the weight of both. Merge or differentiate (pillars = what we
  believe; objectives = what we do, with proof links).

### 3.6 Core Objectives
- 🔴 Scroll-animation blanking (§1.5) — verified worst here: mid-scroll the section is one
  visible card + three invisible ones.
- ⚠️ Six generic cards ("Strengthen Communication", …) with no proof or links. Attach each to
  something real (→ terminology dictionary, → events, → EU funding radar teaser, → standards
  page) — every objective becomes an internal-linking hub.

### 3.7 Membership pricing
- ✅ Clean 4-tier table, POPULAR badge, dual currency (EUR/BGN) — genuinely good bones.
- ⚠️ "Free" for organizations is the most interesting offer on the page and it's presented
  identically to the paid tiers — spotlight it for universities/non-profits.
- ⚠️ No feature comparison: all four tiers show the same "Join Now" with no differences listed.
  Users must scroll *down* to a separate benefits section, mentally join the two. Integrate a
  compact check-mark comparison into the cards.
- ⚠️ No FAQ (invoice? VAT? when does membership start? can I switch tiers?) — this is both a
  conversion blocker and a lost `FAQPage` schema opportunity.
- ⚠️ No social proof adjacent (member logos wall belongs right here, not only in the partner
  carousel at the bottom).

### 3.8 Member benefits
- ⚠️ Six text cards, icon + paragraph. Fine, but the *platform* is the benefit and it's
  invisible: screenshot-tour of the actual dashboard (terminology DB, funding radar, additive
  map, member directory) would be dramatically more convincing. "What you get" should show
  the product.
- 🔴 Same scroll-blanking issue.

### 3.9 Membership application ("membership" section + modal)
- ⚠️ Verified render: the section between benefits and events shows a mostly-empty band —
  the CTA area is easy to scroll past entirely. Needs a distinct background and a single,
  unmissable CTA block.
- ⚠️ The modal form (MembershipForm, 1,026 lines) asks everything up-front in one giant form
  inside a dialog. Split into 2–3 steps with progress (type → details → confirm), persist
  drafts to localStorage, and move it to a dedicated `/join` route (deep-linkable, trackable,
  prerenderable, and the browser Back button works).
- 🔴 The fallback path when email isn't configured tells the user to email info@bamas.xyz —
  but the submission is otherwise silently lost server-side if Resend fails (no retry queue,
  no DB row). Store the application first, then send email — never lose an application.

### 3.10 Events timeline
- ✅ Alternating timeline with UPCOMING badge is a good format.
- 🔴 Scroll-blanking (§1.5) — mid-scroll this renders as faint ghosts (verified).
- ⚠️ Content is hardcoded history ("Initial Vision Meeting", "Official Foundation Assembly"…)
  — an *events* section whose newest entries are administrative meetings signals inactivity.
  Split: "История" (compressed) vs "Предстоящи събития" (fed from `strategic_events` table —
  the data already exists in Supabase!). Upcoming events are prime `Event` schema targets and
  the #1 reason for repeat visits.
- ⚠️ No add-to-calendar links, no event detail pages (needed for schema + shareability).

### 3.11 Partner With Us
- ⚠️ Verified: text column on the left, **completely empty right half** at desktop — the
  layout reserves space for a card that only appears lower / on interaction. Fill with the
  partner-benefits card or collapse to single column.
- ⚠️ Undifferentiated from membership — clarify: membership (companies in the industry) vs
  partnership (media, institutions, event organizers) with separate CTAs.

### 3.12 Partner logos carousel
- ✅ Healthy list (17+ logos), theme-aware variants, links out.
- 🔴 Links have no accessible names (§2.2).
- ⚠️ `GreMa3D_Blue.png` is 1.4 MB. Normalize all logos: same box, compressed, `loading=lazy`,
  grayscale-to-color on hover for calmer presentation.
- ⚠️ Heading "The Companies Shaping Bulgaria's Additive Manufacturing Industry" — strong line,
  but these logos deserve an `/members` page with per-member mini-profiles: that page is a
  member benefit (visibility!), a link magnet, and a GEO entity farm (§6.4).

### 3.13 Contact + map
- ⚠️ Verified: section top renders as a large empty band (scroll-blanking + tall padding).
- ⚠️ Three cards: mailto, Discord, LinkedIn. mailto-only contact loses everyone on webmail;
  add a real (stored + emailed) contact form with topic select.
- ⚠️ Google Maps iframe loads eagerly with all its JS weight for a generic Sofia view —
  lazy-load on scroll (facade pattern: static image → click to activate), or drop for a
  designed static map; the interactive map adds nothing at country zoom.
- ⚠️ "Sofia, Bulgaria" is the only address; no legal entity name/UIC — put the registry
  identity here (trust + `Organization` schema consistency).

### 3.14 Footer
- ✅ Full sitemap links, newsletter, theme/language, policies, big BAMAS watermark — good.
- 🔴 Newsletter is fake (§1.2). Social icons: only LinkedIn, unlabeled.
- ⚠️ The giant outline "BAMAS" watermark occupies ~500 px of scroll with zero function —
  halve it.
- ⚠️ Missing: legal identity line (name, UIC, seat), link to `/documents`, link to Discord
  (it's in contact but not footer), partner-with-us link.

### 3.15 /documents page
- ✅ Clean, bilingual documents with View/Download, Commercial Register link — genuinely good.
- 🔴 Navbar active state wrong (highlights Home).
- ⚠️ This page is the *only* crawlable evidence of legal existence — put the УИК/UIC and
  founding date as **text on the page**, not only inside PDFs (crawlers don't reliably read
  the Cyrillic PDFs; AI engines won't).
- ⚠️ Missing metadata: no per-page title/description (SPA — every route shares the same
  `<title>`).

### 3.16 Auth pages & policies (spot-check)
- ⚠️ Same shared `<title>` on all routes (login, register, policies) — bad for SEO and for
  browser tabs/history UX.
- ⚠️ Policies are long walls in `<p>` with inline headers — restructure with real headings
  (a11y + featured-snippet eligibility for "BAMAS privacy policy" style queries).
- ⚠️ Cookie consent banner sets categories, but analytics (gtag + Clarity) load in `<head>`
  unconditionally **before consent** — a GDPR compliance gap for an EU association. Gate
  analytics behind consent.

---

<a name="4-the-plan"></a>
## 4. The 100x enhancement plan (phased)

Each phase is independently shippable. Estimates are focused working sessions, not
calendar time.

### Phase 0 — Integrity & performance triage (1–2 sessions) — *do first, hard requirement*
| # | Item | Ref |
|---|---|---|
| 0.1 | Compress board photos 60 MB → ~0.4 MB WebP; rename directory; add width/height | §1.1 |
| 0.2 | Wire newsletter to Supabase table + double-opt-in email; remove fake toast | §1.2 |
| 0.3 | Fix `og:url` domain, absolute `og:image`, add full OG/Twitter set | §1.3 |
| 0.4 | Dynamic `<html lang>` synced to language context | §1.4 |
| 0.5 | Content visible by default; animations as enhancement only | §1.5 |
| 0.6 | Rotate & remove committed Context7 key | §1.6 |
| 0.7 | Single `h1`, `aria-hidden` blur echo, add `<main>`, demote carousel-clone headings | §1.7 |
| 0.8 | Turnstile + rate-limit on membership email function; store application before emailing | §1.8, §3.9 |
| 0.9 | Remove `gptengineer.js`; consent-gate gtag/Clarity | §2.1, §3.16 |
| 0.10 | Compress remaining >200 KB images (GreMa3D, bamas-map-logo, uploads) | §2.1 |
| 0.11 | aria-labels on all icon/logo links & buttons; newsletter input label; skip link | §2.2 |
| 0.12 | Navbar active-state fix on non-home routes | §3.0 |

### Phase 1 — Conversion & section-level UX (2–3 sessions)
| # | Item | Ref |
|---|---|---|
| 1.1 | Hero: informative `h1` + concrete subtitle + single primary CTA; cap height; fold audit at 900px | §3.3 |
| 1.2 | Pricing: in-card feature comparison, spotlight Free tier, pricing FAQ (+schema) | §3.7 |
| 1.3 | `/join` route: 3-step application with progress, draft persistence, success page | §3.9 |
| 1.4 | Events: split history vs upcoming; feed upcoming from `strategic_events`; add-to-calendar | §3.10 |
| 1.5 | Board cards: role/affiliation/LinkedIn per member | §3.4 |
| 1.6 | About: 3-sentence factual intro paragraph (GEO canon) under the heading | §3.4 |
| 1.7 | Merge/differentiate pillars vs objectives; attach proof-links to each objective | §3.5–3.6 |
| 1.8 | Benefits: dashboard screenshot tour ("what members actually get") | §3.8 |
| 1.9 | Fix Partner-with-us empty half; separate membership vs partnership propositions | §3.11 |
| 1.10 | Contact: real stored contact form; lazy map facade; legal identity block | §3.13 |
| 1.11 | Footer: legal line, complete links, shrink watermark; social labels | §3.14 |
| 1.12 | Ticker: slower loop, pause-on-hover, dated + typed + localized items (`news.json`) | §3.2 |
| 1.13 | Banner cube: dwell 5–6s, pause after 2 cycles, click analytics, BAMAS frame label, mobile min-height | §3.1 |
| 1.14 | Mobile menu: instant items (no stagger), fix indentation, Contact visible immediately | §3.0 |
| 1.15 | Light-mode polish pass on all sections | §2.5 |

### Phase 2 — From brochure to knowledge hub (3–5 sessions) — *this is the 100x core*
New public, crawlable, bilingual routes (each with its own metadata + schema):

| Route | Content | Source |
|---|---|---|
| `/za-nas` · `/en/about` | Full about: history, legal identity, board with bios, statutes summary | exists (scattered) |
| `/chlenove` · `/en/members` | Member & partner directory with mini-profiles + links | `users`/`companies` (opt-in flag) |
| `/rechnik` · `/en/glossary` | **Public read-only terminology dictionary** (the killer asset: bilingual AM terminology, already 1,200+ lines of data in Supabase) — one page per term | `terminology_terms` |
| `/karta` · `/en/map` | Public additive-manufacturing map of Bulgaria (read-only company markers) | `companies` |
| `/novini` · `/en/news` | Real news/articles (each ticker item becomes a dated page); RSS feed | new `posts` table or MDX |
| `/sabitia` · `/en/events` | Events listing + per-event pages with Event schema | `strategic_events` |
| `/resursi/...` | Reference articles: "Състоянието на AM в България", "3D печат технологии", "EU финансиране за AM", "AM стандарти" (the four GEO.md pillar pages) | write (Phase 3 content) |
| `/faq` | 15–20 real questions, bilingual, `FAQPage` schema | write |

Also: URL-level language (`/en/*` prefix), route-level code splitting (already lazy), shared
`SiteLayout` so navbar/footer stay identical, and every dashboard tool gets a public teaser
page that ends in a join-CTA. **Members get public profile pages — visibility becomes a
membership benefit, which feeds the association's own growth loop.**

### Phase 3 — Content production (ongoing, editorial)
- The four pillar reference articles (BG first, EN second), 1,500–2,500 words each,
  question-shaped H2s, definition-first paragraphs, sources cited.
- One news post minimum per month (every partnership already announced in the ticker is a
  ready-made post).
- Annual "State of Bulgarian AM" report (PDF + HTML) — the single strongest citation magnet
  an association can produce; press-release it.
- Convert `news.txt` history into dated archive posts (instant 9-page archive).

---

<a name="5-seo"></a>
## 5. SEO deep plan

### 5.1 Rendering: the existential item
Vite CSR serves `<div id="root"></div>` to every non-JS agent. Options, in order of
recommendation:
1. **Prerender at build time** (e.g. `vite-plugin-ssg` / `vite-prerender-plugin` or a simple
   Puppeteer postbuild over the public route list) — static HTML per route, zero runtime
   change, works on Vercel as-is. Recommended.
2. Migrate public pages to a meta-framework (Astro islands or Next) — cleaner long-term,
   bigger lift; keep dashboard as-is (it's auth-gated; SEO-irrelevant).
Acceptance test: `curl https://www.bamas.xyz/rechnik | grep "адитивно"` returns content.

### 5.2 Technical checklist (all currently missing)
- `sitemap.xml` (auto-generated from routes incl. glossary terms; submit in Search Console)
- `robots.txt`: add `Sitemap:` line + explicit AI-crawler allows (§6.5)
- Canonicals on every route; `hreflang` bg/en/x-default pairs
- Per-route `<title>`/`<meta description>` (react-helmet-async now; native in prerender)
- JSON-LD: `Organization` (sitewide), `WebSite`+SearchAction, `Person` (board),
  `Event` (events), `FAQPage`, `Article` (news), `DefinedTerm`/`DefinedTermSet` (glossary —
  rare schema, high differentiation), `BreadcrumbList`
- 404 page returning real 404 (SPA fallback currently 200s everything — soft-404s)
- `www`/apex + trailing-slash canonical consistency (currently 307 apex→www; declare www
  canonical everywhere)
- OG image: designed 1200×630 with logo + tagline (current BamasMain.png untested/unsized)

### 5.3 URL & keyword strategy
- Language in path (`/en/...`), Bulgarian at root (primary market per SEO.md).
- Keyword→page map (the one-page site can't do this today):
  - "адитивно производство" → home + pillar article
  - "3D печат България" → pillar + members map
  - "БАЗАП" → about (entity page)
  - "3D печат речник / терминология" → glossary (near-zero competition, high AI-citation odds)
  - "EU финансиране 3D печат" → funding article
  - "3D печат събития България" → events
- Internal linking: objectives cards → tool pages; glossary terms cross-link; every news post
  links member profiles.

### 5.4 Off-page
- **Wikidata entity + Bulgarian Wikipedia stub** for БАЗАП (both feed Google's KG *and* LLM
  training/retrieval directly).
- Google Business Profile (Sofia).
- Directory/backlink pass: EPMA, Addliance, WAATERS, BETMA, all 17 partners already linked
  *from* the site — request reciprocal links; university partner pages; EU DIH catalogues;
  event pages (Additive Days, MACH-TECH exhibitor lists).
- Every member gets a "Member of BAMAS" badge embed (EmbedBadge.tsx already exists in the
  dashboard!) — a self-serve backlink machine that's already 80% built.

---

<a name="6-geo"></a>
## 6. GEO deep plan (being *the answer* in ChatGPT/Claude/Perplexity/AI Overviews)

### 6.1 Why BAMAS can win GEO outright
The question space ("Is there a 3D-printing association in Bulgaria?", "адитивно производство
България кой?") has **no incumbent answer**. Whoever publishes the clearest machine-readable
facts becomes the permanent citation. The glossary + map + member directory are unique data
assets no competitor can copy quickly.

### 6.2 The canonical facts block
One paragraph, identical wording, placed on: homepage `<About intro>`, `/za-nas`, footer,
`Organization` JSON-LD `description`, LinkedIn, Wikidata:
> "Българска асоциация за адитивно производство (БАЗАП / BAMAS) е националната неутрална
> нетърговска организация за адитивно производство и 3D печат в България, основана 2026 г.,
> обединяваща производители, университети и стартъпи. Част от (Add)liance — European Centre
> for Additive Manufacturing. Контакт: info@bamas.xyz."
(EN mirror with identical facts.) Every divergence between surfaces makes models hedge.

### 6.3 Retrieval-shaped content rules (apply to every Phase-2/3 page)
- First 2 sentences answer the page's question completely, standalone.
- H2s phrased as questions users actually ask.
- Facts in tables/bullets; one claim per sentence; dates absolute ("октомври 2026").
- Bilingual parity — same facts both languages.

### 6.4 Machine-readable surfaces
- **`/llms.txt`** (and `llms-full.txt`) — the emerging convention AI crawlers fetch: canon
  block + link map to key pages with one-line descriptions.
- JSON-LD everywhere (§5.2) — `DefinedTermSet` for the glossary is the star.
- Public read-only **JSON endpoints** for glossary and map data (`/api/terms.json`), announced
  in llms.txt — trivially retrievable, quotable data with attribution required in a short
  usage note.
- RSS/Atom for news (Perplexity and search AIs consume feeds aggressively).

### 6.5 Crawler access
`robots.txt` additions: explicit `Allow: /` for GPTBot, ClaudeBot, Claude-Web, PerplexityBot,
Google-Extended, Bingbot/BingPreview, CCBot, Amazonbot + `Sitemap:` line. (Blocking none —
citation is the goal.)

### 6.6 Presence seeding
Ask-an-AI audit quarterly (record what ChatGPT/Claude/Perplexity answer for the §6.1
questions; fix the source gap each wrong answer reveals). Seed profiles that models retrieve:
Wikidata (first), LinkedIn company page completeness, Crunchbase/OpenCorporates via UIC,
GitHub org (repo is already public — a README pointing at bamas.xyz helps).

---

<a name="7-marketing"></a>
## 7. Popularization & marketing plan

1. **Activate the assets already built:** EU funding radar teasers as monthly LinkedIn posts
   ("3 нови отворени покани за AM финансиране"); terminology "term of the week"; map counts
   ("вече N компании на картата").
2. **Newsletter (once real, §0.2):** monthly digest = news + upcoming events + funding
   deadlines + new members. The funding-deadline section alone is subscription-worthy for
   every SME in the sector.
3. **Event piggybacking:** Additive Days (10.09.2026) and MACH-TECH (06–09.10.2026) are
   already on the site — publish companion content before each ("Кой ще бъде на Additive
   Days", speaker interviews), QR to `/join` at the booth, post-event recap posts (backlinks
   from organizers likely — they're partners).
4. **Member badge program** (§5.4) — each of 17+ partners/members embedding the badge is a
   permanent branded backlink.
5. **PR cadence:** every new partner (the ticker shows ~1/month!) becomes a bilingual press
   note to engineering-review.bg, industryinfo.bg (already a media partner!), 3Druck (Austrian
   partner) — the distribution network is literally already in the partner list.
6. **Annual report** (§Phase 3) → national tech media coverage → the authority backlink tier.
7. **Measurement:** GA4 events for join-funnel steps, banner clicks, doc downloads; Search
   Console; a quarterly KPI sheet (sessions, members applied, newsletter subs, AI-answer
   audit results, ranking positions for the §5.3 keyword map).

---

<a name="8-matrix"></a>
## 8. Impact/effort matrix & sequencing

**Do now (max impact, low effort):** 0.1 images · 0.2 newsletter · 0.3 OG fix · 0.4 lang ·
0.7 headings/main · 5.2 sitemap+robots+canonical · 6.2 canon block · 6.4 llms.txt

**Do next (max impact, medium effort):** 0.5+5.1 visibility & prerender · Phase 1 conversion
items (1.1–1.4 first) · JSON-LD set · glossary public route (single highest-leverage new page)

**Scheduled (high impact, higher effort):** rest of Phase 2 routes · pillar articles ·
Wikidata/Wikipedia · badge program rollout

**Nice-to-have (defer):** globe member-dots, light-mode deep polish, event detail pages
before events data grows.

Sequencing rule: **Phase 0 → 5.1/5.2 → 1 → 2 → 3 continuous.** SEO/GEO items ride along with
the phase that creates their surface.

---

<a name="9-verification"></a>
## 9. Verification & acceptance criteria

- **Performance:** Lighthouse mobile ≥ 90 perf / 100 a11y / 100 SEO on home, /join, glossary.
  Homepage total transfer < 1.5 MB cold (today: >60 MB with board images). LCP < 2.0s on 4G.
- **Rendering:** `curl` any public route → meaningful HTML with correct `<title>`, meta,
  JSON-LD (validate via Rich Results Test).
- **A11y:** axe-core clean on all public routes; keyboard-only walkthrough of nav → join flow.
- **Forms:** newsletter row lands in DB + confirmation email received; membership application
  row exists even when email fails; abuse test rate-limited.
- **SEO:** Search Console: sitemap accepted, coverage clean, no soft-404s; OG validated in
  LinkedIn Post Inspector + Facebook debugger.
- **GEO:** quarterly audit doc — ask the 4 canonical questions in ChatGPT/Claude/Perplexity,
  record answers + citations; target: bamas.xyz cited in ≥2 of 3 engines within 2 quarters of
  Phase 2 shipping.
- **Regression:** every phase ends with the standing checks — typecheck, lint, build, homepage
  eager JS < 300 KB gz, cube/banners/ticker/globe unaffected, dashboard untouched.

---

*End of plan. Nothing above has been executed — awaiting your go/no-go per phase. The plan is
designed so Phase 0 can ship same-day on approval, and each later phase is independently
valuable.*
