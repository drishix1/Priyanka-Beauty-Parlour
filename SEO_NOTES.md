# Technical SEO and image optimization

Production base URL: https://priyanka-beauty-parlour.vercel.app

No example.com placeholders remain.

## Changes
- Canonical, Open Graph, Twitter large-image card, theme color and Apple touch icon on all seven content pages and the 404 document.
- Matching BeautySalon JSON-LD on index.html and contact.html, with the existing business details and footer social URLs. No ratings or reviews.
- sitemap.xml lists the seven content pages. The 404 page is excluded and marked noindex.
- robots.txt advertises the sitemap and excludes the originals backup directory from crawling.
- 404.html uses the shared header/footer and root-relative assets and links, so nested missing paths can display it correctly.
- Pillow WebP quality 80. 25 PNG/JPG files converted; originals remain at their original paths and byte-identical backups are in images/originals/.
- 50 referenced image sources have responsive derivatives in images/optimized/. Card/gallery images use 480px and 960px variants where the source resolution permits. Smaller originals are retained at their native width rather than upscaled; srcset descriptors match actual widths.
- Lightbox data-full points to WebP files with width at most 1600px. Small header/footer logos use a 144px derivative. Apple touch icon is a dedicated 180px PNG derived from logo.jpg.
- Images have intrinsic dimensions, below-the-fold lazy loading, and high-priority eager opening images with matching responsive preload hints.

## File-size comparison (not page-transfer or Lighthouse scores)
- Original referenced image sources: 8,457,721 bytes.
- Optimized full-size equivalents: 6,250,888 bytes.
- Small responsive variants combined: 2,462,162 bytes.

Actual browser transfers depend on viewport, pixel density, lazy loading and which photos are opened. The variants are alternatives, not all downloaded together.

## Validation and limits
- Chrome: eight pages at 320, 360, 390, 768, 993, 1024, 1200, 1280, 1440 and 1920px. No document overflow or visible text below 12px in the checks.
- Shared navigation, focus trap, Escape, photo viewer, filters, FAQ and About carousel exercised. Isolated Courses/404 navigation checks passed.
- Canonical and OG URLs agree; structured data parses; XML sitemap has seven unique URLs; image files, width descriptors and full-size limits checked.
- Original backup hashes match. Representative original/WebP image pairs visually compared.
- Lighthouse mobile baseline/final: unavailable for Performance, Accessibility, Best Practices and SEO. Node/npm and Lighthouse are not installed; no scores are inferred from the layout checks.
- Physical phones, Safari, Google indexing/rich-result validation and social-crawler previews were not tested.
- The live URL could not be fetched by the browsing tool. No changes were deployed. Production HTTP status and asset availability must be checked after deployment.
- Vercel supports a 404.html in the output directory for missing static routes; the local file is ready, but production routing was not changed or tested.

## Reference documentation
- [Google canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Schema.org openingHours](https://www.schema.org/openingHours)
- [Vercel static 404 pages](https://vercel.com/kb/guide/custom-404-page)
