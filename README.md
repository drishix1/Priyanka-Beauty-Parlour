# Project collaboration preferences

- Work as the user's coding partner on the existing Priyanka Beauty Parlour project.
- Accept requirements and reference screenshots in Hinglish. Communicate naturally in Hinglish unless the user requests another language.
- Understand the existing code and relevant reference screenshots, then implement requested changes directly. If the user asks only for review or planning, respect that scope.
- Make routine professional design, colour, layout, and animation decisions independently, consistent with the requested section and existing design.
- Work only on the section or scope requested in the current task. Avoid unrelated changes or a full-site rewrite unless explicitly requested.
- Preserve existing functionality, business details, content, and images unless the requested change requires updating them.
- Prefer the existing HTML, CSS, and JavaScript stack. Do not add unnecessary frameworks or dependencies.
- Check changes with appropriate validation. Check responsive layouts, accessibility, interactions, and navigation in a browser when available, and clearly report anything that could not be verified.
- Ask questions only for important ambiguities that materially affect the result. Make reasonable assumptions for routine decisions and proceed.
- Give a short completion summary explaining the changes, checks performed, and any verification limitations.
- Do not push commits or deploy unless the user explicitly requests it.
- For every edit, prioritise a professional, responsive UI/UX on phones, tablets and laptops. Preserve readable text, usable touch targets, balanced spacing and layouts without clipping or horizontal overflow; verify representative viewport sizes when a browser is available.

## Styles and scripts

- Palette: Royal Rose & Gold (Option A), defined in `css/tokens.css`. Gold is decorative on light surfaces; use deep wine or the dark-gold text token where contrast requires it. Home uses four hero slides. Hero artwork is cropped in CSS so the supplied banner lettering is not used as content; the 236px haircut photo stays in a compact arch without upscaling.
- Animate only transform, opacity and border-radius; keep hover effects inside hover-capable media queries and preserve the global reduced-motion overrides. FAQ uses native details with an opacity/transform entrance rather than animating layout height.

- Load CSS in this order: `css/tokens.css`, `css/base.css`, `css/layout.css`, `css/components.css`, then the relevant `home.css`, `about.css`, `courses.css` or `gallery.css`. Keep rule order inside each file: later responsive/theme rules intentionally override earlier component defaults.
- Tokens hold the existing colours, font families, spacing and type values. Base contains resets/typography; layout contains shared containers/grids; components contains shared controls, cards, navigation, footer, motion and photo viewer styles. Shared course steps and portfolio cards stay in components because Home also uses them.
- Scripts are plain, deferred scripts with no build/runtime dependencies. Load `js/nav.js`, `js/motion.js` and `js/contact-hints.js` everywhere. Load `js/hero-slider.js` only on Home, `js/lightbox.js` only with photo triggers, `js/gallery.js` before lightbox on Gallery, and `js/achievements.js` on Home and About, with `js/about.js` only on About. Each feature owns its DOM-ready handler; feature internals do not depend on script globals.
- About's inline `--portrait-image` URLs are root-relative so moving the consuming stylesheet into `css/` does not break the blurred image backgrounds.
- Reduced-motion and About's `[hidden]` overrides retain necessary `!important` declarations. Do not remove these accessibility overrides without checking animated/hidden states.

## Shared HTML build status

Node.js was unavailable during this refactor, so the optional header/footer partial build step was skipped as requested.
Root HTML files remain the deployable source; keep their shared header/footer changes in sync manually.
No `scripts/build.js` or partial injection is installed; there is currently no build command to run.
