# Four-slide design QA - 8 November 2026

## Scope and changes

- index.html: four requested themes and CTAs, one H1, four dots and slide labels. Existing image alt text and business facts preserved.
- css/home.css: desktop photo fades into blush; mobile photo first, full-width buttons; real low-resolution haircut image in a compact gold arch, without enlargement beyond its native width, including the zoom. Banner artwork remains cropped to exclude lettering.
- All eight root HTML footers: visible Facebook name and accessible label changed to ruchi.raj.gupta. Contact's Ruchi Raj Gupta text, all hrefs, JSON-LD sameAs and Instagram unchanged. Sitemap unchanged.
- Existing tokens, section designs, Meet Priyanka, booking/FAQ, global motion and generic hero-slider.js already implemented the remaining requested behavior and were reused. All seven obsolete CSS hex values have zero matches.
- FAQ intentionally keeps the native details fallback with opacity/transform entrance. Height/grid-row animation would conflict with the explicit transform/opacity-only rule.
- Audit harness updated for four slides. Added Chrome-level keyboard checks and current screenshots/results. No framework, dependency, commit, push or deployment.

## Hero images

| Slide | Image |
|---|---|
| Bridal Makeup | hero-bridal-makeup (responsive 480/960/full) |
| Party Makeup and Mehendi | hero-priyanka-services (mobile/wide picture) |
| Professional Courses | hero-priyanka-wedding (mobile/wide picture) |
| Haircut and Hair Styling | service-haircut-full.webp (236 x 420) |

The haircut source is too small for a large desktop image: its 230px outer arch holds a 208px image, at most about 221px wide during zoom. A higher-resolution real photo would allow a larger presentation. Existing photos elsewhere were not removed.

## Verification

- Headless Chrome: all eight pages at 390, 768 and 1440, plus 320, 360, 1024, 1280 and 1920: 64 layout cases, zero measured horizontal overflow, clipping, undersized text/targets, or solid-background contrast flags. This remains a geometry heuristic, not exhaustive cross-element overlap or gradient contrast certification.
- 107 scripted interaction assertions passed. Reduced motion reported in every case, with zero running animations before measurement-only styles.
- Chrome Input.dispatchKeyEvent: 24 page/width runs at 390, 768, 1440; 107 assertions passed. Drawer Enter/Tab/Shift+Tab/Escape at 390; applicable lightbox Enter/Tab/Escape, FAQ Enter, gallery filter Enter; slider left/right wrap, Tab/Enter dots and computed visible focus. This covers browser input, not an OS/screen-reader usability review or every focusable element.
- Ordinary-motion slider: autoplay, hover pause/resume, focus pause, explicit pause, manual advance, stable hero height and stable following-section position all passed. Tab-hidden pause source-reviewed, not separately exercised.
- Captured JS errors: zero. Not a blanket certification of all third-party iframe/network console messages.
- Source checker: 808 references valid; no duplicate IDs, missing img alt, heading jumps, incorrect telephone/WhatsApp values or missing internal targets.
- Visual screenshots inspected at 390 and 1440 for bridal, party, courses and haircut presentations. The party crop was adjusted to remove a residual artwork edge. Previous Meet/booking visuals remain unchanged.
- git diff --check passed.

## Not verified

Lighthouse mobile performance >=90 is NOT verified: Lighthouse and Node/npm CLI are unavailable. No score is invented. Previous Slow 3G observations belong to the earlier three-slide design, not this new layout. Actual browser zoom, field performance and exhaustive visual/accessibility review remain unverified. No W3C upload was attempted in this task.

## Facebook href inventory

All nine hrefs below retain the existing account. The only remaining ishikaraj matches in production HTML are href URLs and JSON-LD sameAs URLs. Archived audit evidence is not production HTML.

| Page | href |
|---|---|
| 404.html | https://www.facebook.com/ishikaraj.gupta.31 |
| about.html | https://www.facebook.com/ishikaraj.gupta.31 |
| bridal.html | https://www.facebook.com/ishikaraj.gupta.31 |
| contact.html | https://www.facebook.com/ishikaraj.gupta.31 |
| contact.html | https://www.facebook.com/ishikaraj.gupta.31 |
| courses.html | https://www.facebook.com/ishikaraj.gupta.31 |
| gallery.html | https://www.facebook.com/ishikaraj.gupta.31 |
| index.html | https://www.facebook.com/ishikaraj.gupta.31 |
| services.html | https://www.facebook.com/ishikaraj.gupta.31 |
