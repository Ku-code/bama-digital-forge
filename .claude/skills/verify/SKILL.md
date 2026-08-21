---
name: verify
description: Build, serve and drive the BAMAS site to observe real runtime behavior (timers, carousels, forms) without Chrome's background-tab freezing.
---

# Verifying bamas.xyz at runtime

## Build and serve

```bash
npm run build && npx vite preview --port 4173   # dist/, matches production
npm run dev                                     # only when you need HMR
```

`npm run build` is transpile-only — run `npx tsc --noEmit` separately if types matter.

## Gotcha: the MCP browser tab is frozen

The Claude-in-Chrome tab usually runs in an occluded window, so
`document.visibilityState === "hidden"` and Chrome **freezes timers entirely**
(measured: 0 `setInterval` ticks in 25 s). Anything time-based — carousels,
banner rotation, toasts, debounces — looks broken there even when it works.
`osascript ... activate` does not fix it. Screenshots of that tab also ignore
programmatic scrolling.

Drive a separate headless Chrome over CDP instead; pages there are `visible`
and timers run at full speed. Port 9222 is taken by the extension — use 9333.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --remote-debugging-port=9333 --user-data-dir=/tmp/chrome-verify \
  --no-first-run --window-size=1400,900 &
```

`ws` resolves from `node_modules`, so the CDP driver script must live **inside the
repo** (`/tmp/*.mjs` fails with ERR_MODULE_NOT_FOUND). `PUT /json/new?<url>` opens a
tab, then `Runtime.evaluate` with `awaitPromise: true, returnByValue: true` runs an
async IIFE that returns `JSON.stringify(...)`. Keep each evaluate under ~45 s or CDP
times out — poll into a global and read it back in a second call for longer waits.

## Driving the UI

- React synthesizes `onPointerEnter`/`onMouseEnter` from **`pointerover`/`pointerout`**.
  Dispatching `pointerenter` directly does nothing. Simulate a touch tap with
  `new MouseEvent('mouseover', {bubbles:true, relatedTarget:null})` followed by
  `.click()` — that is the compat sequence phones fire, and it is how the
  hover-pause-forever class of bug reproduces.
- Board carousel / nav aria-labels are **bilingual** — match both, e.g.
  `/ext member|ледващ/i`, `/revious member|редишен/i`. Dots are `button[aria-label*="/"]`.
- Allow ≥500 ms after a burst of clicks before reading state; React batches, and
  probes that read too early produce phantom failures.
- Screenshots: `Page.captureScreenshot` clip coordinates are **page**-relative, not
  viewport-relative — add `window.scrollY` to a `getBoundingClientRect()` y.

## Backend

Supabase project ref `swgnchtjypwkxveffrpl`; Management API token via
`security find-generic-password -s "Supabase CLI" -w | sed 's/^go-keyring-base64://' | base64 -d`.
Production env lives in Vercel — if forms work locally but fail live, grep the
deployed bundle for `placeholder.supabase.co` first.
