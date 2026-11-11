# Phone layout QA — 9 November 2026

Local-only changes; no commit, push or deployment.

## Measurements

Chrome headless, mobile viewport 390 x 844, DPR 1, reduced motion, images loaded. Original Home markup from HEAD was served with the same current unmodified desktop styles for a same-session comparison.

| Width | Original height | Final height |
| --- | ---: | ---: |
| 390 (mobile emulation) | 14,750px | 3,460px |
| 768 | 10,467px | 10,467px |
| 1440 | 7,953px | 7,953px |

390px reduction: 76.5%, exceeding the requested 35–45% range. The specified small photo rows and compact sections remove far more height than that target. No artificial whitespace was added to reach the percentage.

The earlier supplied audit recorded 14,605px before in desktop-style viewport emulation; this is not interchangeable with the mobile-emulation baseline above. Exact same-session section measurements are in phone-comparison-final.json. All Home section heights match at 768 and 1440; full pixel equality is not asserted.

## Verified

- All eight pages checked at 360, 390 and 430px in Chrome mobile emulation: seven direct navigation links, hidden hamburger, 88px header, no horizontal document overflow and no captured application JavaScript errors.
- Home hero 325px; services start around y=479px, with navbar, hero, trust strip and three service cards visible within the first 844px screen.
- Footer 190px; 46px vertical floating controls, transparent wrapper; controls hide while footer is visible to avoid covering its links.
- Browser-native touch dispatch: swipe changed photo 1/6 to 2/6; two-finger pinch increased rendered width from 366px to 805px. Viewer locks body scrolling, and close restores it.
- Shared phone assets included on all pages, including 404.
- Existing real photos, image dimensions, alt text and business content retained. No libraries or CDN scripts added.

## Scope decisions and limits

- Compact breakpoint is max-width 767px to honour the explicit request to leave 768px unchanged. Tablet drawer code remains used at 768–992px.
- Reduced-motion mode disables carousel animation/autoplay; focused slide links pause advancement to preserve keyboard interaction. Phone dot focus no longer stops subsequent autoplay.
- Tests use a real Chrome engine with emulated viewports/touch, not physical Android or iPhone hardware. Hardware pinch, Safari, full contrast auditing, and Lighthouse performance 90+ are not verified. Node/npm/Lighthouse were not available in the discovered local tooling.
- Google Maps embed failed to load in this preview environment; the existing map URL and business details were retained.
- Gallery/service/bridal photo controls use the lightbox. Hero artwork and the owner portrait retain their existing non-lightbox behavior.

## File summary

- css/phone.css: isolated phone navigation, compact Home sections, photo rows/masonry, footer, floating actions, touch targets and inherited desktop heading fix.
- index.html: phone-specific short copy, service badges, extra gallery photos, WhatsApp banner and FAQ toggle; English desktop content retained.
- about.html, services.html, bridal.html, courses.html, gallery.html, contact.html: shared phone stylesheet/script and short Book label.
- 404.html: shared phone assets and short Book label.
- js/phone.js: active nav positioning, FAQ disclosure, footer overlap handling.
- js/nav.js: drawer interaction limited to tablet range.
- js/lightbox.js: two-finger pinch and touch panning alongside swipe/close behavior.
- js/hero-slider.js: phone dot focus allows automatic advancement; desktop focus behavior retained.
- audit/phone_qa.py, phone-final.json, phone-interactions.json, phone-comparison-final.json and screenshots: browser QA evidence.

Some implementation and initial audit files existed as uncommitted work at task start; they were preserved and refined.
