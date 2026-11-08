# Priyanka Beauty Parlour audit — 8 November 2026

Status: available automated checks pass after small fixes; full release sign-off remains pending the checks below. No commit, push, deployment, new dependency, business-detail change, or new business claim was made.

## Changes

- `js/lightbox.js`: replaced the corrupted zoom-out label with English `Zoom -`.
- `css/components.css`: minimum 44 × 44 CSS-pixel targets for shared navigation/footer links, small buttons, contact phone/WhatsApp and social links.
- `css/about.css`: carousel dot targets increased from 36 to 44 pixels wide.
- `css/base.css`: reduced-motion now removes transitions entirely instead of using 0.01 ms transitions. Existing animation overrides remain.
- `audit/`: reproducible source/layout checks and results. These files are development audit artifacts, not public navigation pages.

## Page × check

Widths: **320, 360, 390, 768, 1024, 1280, 1440, 1920** CSS pixels, with a 900-pixel iframe height. Each iframe's `innerWidth` matched the requested width. A vertical scrollbar consumes 15 pixels of the content width in this Windows Chrome environment.

| Page | 8-width geometry* | Links/anchors/phone | IDs/alt/headings** | 12px text / 44px targets* | Scripted behavior*** | Reduced motion | Captured JS errors**** |
|---|---|---|---|---|---|---|---|
| index | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| about | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| services | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| bridal | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| courses | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| gallery | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| contact | PASS | PASS | PASS | PASS | PASS | PASS | 0 |
| 404 | PASS | PASS | PASS | PASS | PASS | PASS | 0 |

\* 64 headless Chromium iframe measurements: no out-of-viewport elements, measured text clipping, text under 12px, or measured visible controls under 44px. Screen-reader-only content, inert/hidden slides, and closed dialogs are excluded appropriately. This is a geometry heuristic, not an exhaustive proof of no overlap: it does not test every scrolled position, all open-dialog layouts, FAQ-open geometry, all filter states, or cross-element text intersections. First-screen previews of all eight pages at 390px were visually inspected during the initial run; no major first-screen layout break was observed. Fonts/external resources were not required to finish loading, so fallback-font measurements may differ from the fully loaded site.

\** Dependency-free HTML parser checks: 803 references across eight documents; local href/src/data-full/srcset paths and anchor IDs, exact WhatsApp and telephone values, one h1 per page, no heading-level jumps, duplicate IDs, or missing img alt attributes. Empty decorative alt attributes are allowed. This does not replace W3C/HTML Validate validation or assess the quality of every alt description. Matching anchor IDs were verified, but every destination's scroll offset/focus was not manually checked.

\*** 64 assertions at 390px and 1280px, as applicable: mobile drawer open/focus containment, synthetic Tab and Shift+Tab boundary handling, Escape/focus restoration; lightbox open/Escape/focus restoration; gallery category visibility; native details click open/close; About carousel next control. Programmatic click and synthetic keyboard events do not prove real Enter activation or full native Tab traversal. Other pages have no carousel/filter/FAQ where absent; those features were not assumed to exist. Native focus-ring visibility remains pending.

\**** The local audit server injects listeners before page scripts for window errors, unhandled rejections and console.error. Zero captured errors during tested states. Browser-level network/DevTools messages and third-party iframe errors are not comprehensively captured; this is not a blanket zero-console-error certification.

Reduced-motion was enabled using Chrome's `--force-prefers-reduced-motion` flag. All 64 documents reported the preference; no running animations/transitions were observed before the harness applied its measurement-only style. Ordinary-motion visual behavior was not exhaustively rechecked after the final changes.

## Pending checks and top three priorities

1. **Complete native accessibility and visual sign-off.** Real Tab/Shift+Tab/Enter/Escape traversal and visible focus; actual 200%/400% browser zoom; scrolled content and open-modal/expanded-state overlap checks; final loaded-webfont layouts. The 320px layout test is not reported as an actual 400% zoom test. Browser UI host/native connection was unavailable, and the installed Playwright import failed.
2. **Obtain actual Lighthouse and Slow 3G measurements.** Lighthouse mobile: **NOT RUN / no scores**. Lighthouse desktop: **NOT RUN / no scores**. Lighthouse was not installed and there was no npm/node CLI available. Actual Slow 3G throttling, FCP/LCP/CLS and transferred-resource rankings remain **NOT VERIFIED**. No Lighthouse-derived top-three findings are invented. External Google Fonts stylesheets and the larger gallery variants are candidates to inspect in a real waterfall, not proven performance failures.
3. **Run formal HTML and full-console validation.** Neither W3C validation nor html-validate completed; html-validate was not installed. The source checks above are narrower. Recheck network errors, Maps embedding and the deployed 404 HTTP status on the actual hosting environment.

No large structural defect was confirmed by the available checks; the above are unresolved verification gaps and follow-up priorities, not fabricated failures. No broad redesign was attempted.

## Home loading and image evidence

Actual Slow 3G first-paint ordering is unknown. Source-based expectation only: header, hero heading/copy and booking controls are present in the initial HTML; the hero image is eager/high-priority and preloaded; below-fold photographs use lazy loading. Google Fonts is external and its stylesheet is render-blocking, although `display=swap` is requested. This should be measured before deciding on a font-delivery change.

| Asset / role | File bytes | Approximate KiB |
|---|---:|---:|
| `images/optimized/hero-bridal-makeup-480w.webp` — small hero candidate | 29,372 | 28.7 |
| `images/optimized/hero-bridal-makeup-960w.webp` — medium hero candidate | 76,954 | 75.2 |
| `images/optimized/hero-bridal-makeup-full.webp` — largest hero candidate | 139,634 | 136.4 |
| `images/optimized/bridal-magenta-gold-960w.webp` — largest home img/srcset candidate found | 208,524 | 203.6 |
| `images/optimized/bridal-red-veil-full.webp` — largest home-referenced viewer asset | 226,844 | 221.5 |

These are filesystem sizes, not measured network transfer sizes. Responsive source selection depends on viewport and device pixel ratio. The viewer asset is requested on opening that photo, not assumed to be part of initial load. Large original PNGs elsewhere in the repository are not counted as home requests.

## Reproduction

From the repository root:

```text
python audit/check_site.py
python audit/serve.py
```

Open `http://127.0.0.1:8766/audit/harness.html` in Chrome. The page exposes results in `#results` and changes its title to `AUDIT COMPLETE`. A headless `--dump-dom --virtual-time-budget=45000` run can save to `audit/layout-dom.html`; `python audit/read_layout.py` extracts `audit/layout-results.json`. Enable reduced-motion separately when reproducing that check. `audit/preview.html` displays eight 390px first-screen previews.

Evidence: `source-results.json`, `layout-results.json`. The custom server binds only to localhost and disables cache; the instrumentation is served dynamically and does not modify the production HTML files.
