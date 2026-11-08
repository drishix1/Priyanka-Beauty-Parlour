> Historical audit before the four-slide update. See DESIGN-QA.md for current design checks; the Slow 3G figures below describe the earlier layout.

# Final site audit - 8 November 2026

Current audit scope: small regression fixes only. No new production regression was confirmed by the available checks, so this pass adds/refreshes audit evidence rather than changing site code. Existing working-tree design changes were preserved. No dependency, commit, push or deployment was added.

## Page x check

PASS applies only to the measured check described below. PENDING is not a pass or a confirmed defect.

| Page | 8 widths: geometry | Links/anchors/tel/WA | IDs/alt/headings | Text/targets | Scripted interactions | Reduced motion | Captured JS errors |
|---|---|---|---|---|---|---|---|
| index | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| about | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| services | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| bridal | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| courses | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| gallery | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| contact | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| 404 | PASS | PASS | PASS | PASS | PASS | PASS | 0 |

- **Geometry:** 64 headless Chrome iframe measurements at 320, 360, 390, 768, 1024, 1280, 1440 and 1920 CSS pixels; height 900. Requested innerWidth verified. No document horizontal overflow, measured out-of-viewport content, clipped direct text, direct visible text below 12px, or measured visible link/button/summary target below 44px. Intentional artwork cropping, inert/hidden slides and closed dialogs are excluded. Windows vertical scrollbars consume 15px. These are heuristics: they do not prove no cross-element overlap at every scroll position or every expanded/modal/filter state. Webfonts were not explicitly awaited in the 64-case harness.
- **Source:** 804 references checked across eight documents. Local href/src/data-full/srcset/imagesrcset files and anchor IDs exist. Telephone is tel:+919523262455; WhatsApp is https://wa.me/919523262455. One h1 per page, no heading jumps, duplicate IDs or missing img alt attributes. Decorative empty alt allowed. CSS URLs, every alt description's quality and every anchor's scroll/focus offset are not covered. This is not formal HTML validation.
- **Interactions:** 107 passing assertions at 390, 768 and 1440, as applicable. Drawer open, synthetic forward/reverse Tab boundary trapping, Escape and focus return; lightbox open/Escape/focus return; gallery filtering; FAQ toggle; About carousel next; Home slide dots/arrows/wrap/swipe, height stability, focus pause, computed outline and reduced-motion autoplay suppression. Ordinary-motion slider timer/hover/focus/pause checks also passed in the saved slider run. Programmatic activation and synthetic key events do not certify genuine Tab traversal/Enter activation or focus visibility everywhere.
- **Motion:** all 64 cases reported prefers-reduced-motion; zero running animations/transitions before measurement-only styles were injected.
- **Errors:** zero captured window errors, unhandled rejections and console.error calls in the layout run. No captured loadingFailed, runtime exception or error-level browser log entry in the 30-second Home network run. This does not certify all third-party frames or every network request on every page.
- Approximate solid-background contrast checks reported zero flags; gradients/images and all composited states require visual/manual verification.

## Required checks still pending

| Check | Status | Reason |
|---|---|---|
| Native Tab / Shift+Tab / Enter / Escape and complete focus visibility | PENDING | Native/browser UI connection unavailable; scripted coverage is narrower |
| Actual browser zoom 200% / 400% on all pages | PENDING | No native browser zoom run; narrow viewport tests are not relabelled as zoom |
| Full scrolled/open-state overlap review, loaded-webfont matrix | PENDING | Geometry and sampled screenshots are not exhaustive |
| Formal W3C / html-validate | PENDING | html-validate unavailable; W3C source-upload request rejected by automatic approval review pending explicit source-disclosure permission |
| Lighthouse mobile | NOT RUN - no scores | Lighthouse and Node/npm CLI unavailable; no dependency installed |
| Lighthouse desktop | NOT RUN - no scores | Same limitation |
| Full console, Maps embed and hosting 404 status | PENDING | Requires broader browser/deployed-host checks; no deployment performed |

No Lighthouse-derived scores or top-three diagnostics are claimed.

## Slow 3G Home observation

**Actual Chrome network emulation completed:** 390 x 844, DPR 1, cold cache disabled, 400ms latency, 62,500 bytes/sec download and upload (500 Kbps), no CPU throttling, 30-second observation. Local server sends uncompressed assets and no-store; this is one lab run, not a production-host or real-device benchmark.

- First paint and FCP: **5,608ms**. Initial LCP candidate was the first bridal hero image at **5,608ms**.
- The first screenshot showed the header/logo and bridal image while animated hero copy was still entering. The 10-second observation showed readable heading, description and booking controls. Screenshot capture itself can wait for rendering: filename checkpoints are request times, not exact filmstrip timestamps.
- Autoplay introduced a larger wedding-image LCP candidate at **13,524ms**. This is the latest observed candidate, not a field metric or Lighthouse result.
- Largest image fetched in this run: **hero-priyanka-wedding-mobile.webp**, 163,724 body bytes (**159.9 KiB**), 164,024 reported transfer bytes.
- Next: hero-priyanka-services-mobile.webp, 153,108 body bytes (**149.5 KiB**). Both started around 5.58s and completed around 13.3-13.5s.
- First hero candidate: hero-bridal-makeup-480w.webp, 29,372 body bytes (**28.7 KiB**), completed around 3.52s.
- Larger Home source candidates exist outside this initial mobile fetch: bridal-magenta-gold-960w.webp 208,524 bytes (203.6 KiB), and viewer-only bridal-red-veil-full.webp 226,844 bytes (221.5 KiB). These are filesystem sizes, not initial mobile transfers.

## Top three follow-up priorities

1. **Critical CSS / first paint:** components.css is 67,015 uncompressed body bytes and finished around 5.47s, just before 5.61s FCP. Investigate critical CSS and actual hosting compression/cache behavior before a broader performance change. Causality and production impact require another controlled measurement.
2. **Hero loading / autoplay LCP:** later hero assets total about 309.4 KiB and the carousel updates the LCP candidate to 13.52s. Review image encoding/cropping, loading priorities and carousel timing together. This is larger than a small audit regression fix.
3. **Finish release verification:** obtain Lighthouse mobile/desktop results, native keyboard and actual 200%/400% zoom checks, formal HTML validation, and scrolled/open-state visual review. No full release sign-off until these gaps are closed.

## Files and reproduction

Current-pass evidence: refreshed layout-dom.html, layout-results.json and source-results.json; added slow_network.py, slow-3g-results.json and five slow-3g screenshots; updated this report. Production changes already present in the working tree were not treated as new audit fixes.

Run `python audit/check_site.py`. Start `python audit/serve.py`; it binds only localhost:8766 and injects error capture in served responses without modifying production HTML. Open /audit/harness.html; results appear in #results with title AUDIT COMPLETE. A Chrome headless dump with --force-prefers-reduced-motion can be parsed using `python audit/read_layout.py`.

For network reproduction, launch a dedicated headless Chrome with --remote-debugging-port=9223 and a temporary user profile, then run `python audit/slow_network.py`. It throttles that dedicated browser, writes evidence and closes it. Do not attach this script to a personal browsing session.

The source checker and custom browser harness are limited audit tools, not replacements for standards validators, Lighthouse or manual accessibility review.
