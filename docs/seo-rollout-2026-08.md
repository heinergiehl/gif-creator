# SEO rollout checklist — August 2026

This file separates repository work from actions that depend on deployment, Google, domain
control, backlinks, or AdSense. Rankings and indexing are not release gates because they happen
after deployment and cannot be guaranteed from the codebase.

## Deploy and verify

1. Deploy the production build and confirm these canonical URLs return `200`:
   - `/image-to-gif`
   - `/video-to-gif`
   - `/edit-gifs`
   - `/add-text-to-gif`
   - `/compress-gif`
   - `/webp-to-gif`
   - `/gif-to-mp4`
   - `/resize-gif`
   - `/crop-gif`
   - `/gif-to-png`
2. Confirm `/sitemap.xml` contains `/gif-to-png` and does not contain
   `/split-gif-into-frames` or any `/converter-and-editor` URL.
3. Confirm the legacy routes return permanent `308` redirects to their canonical tool pages.
4. Smoke-test one image upload, one GIF upload, and one video upload in the deployed browser.

## Google Search Console

1. Submit the current sitemap once after deployment.
2. Inspect and request indexing for the four proven canonical clusters first:
   `/image-to-gif`, `/video-to-gif`, `/edit-gifs`, and `/add-text-to-gif`.
3. Then inspect the high-opportunity direct tools: `/compress-gif`, `/webp-to-gif`,
   `/gif-to-mp4`, `/resize-gif`, `/crop-gif`, and `/gif-to-png`.
4. Do not repeatedly request indexing. Review 28-day comparisons and track unbranded queries
   moving into positions 1–20; 24-hour CTR is not a useful release verdict at current positions.
5. Expect old editor URLs and the old frame URL to remain in reports until Google recrawls their
   permanent redirects.

## Former Gif Magic name and domain

- The current application contains no `Gif Magic` or `GifMagic` branding and does not target it.
- If the former domain is still controlled, configure host-level `301`/`308` redirects to the
  closest matching canonical pages on the current site. This must be done at the old domain's
  DNS/hosting layer and is not implementable from this repository alone.
- Update old owned articles, profiles, directory listings, and backlinks to the current brand and
  canonical URLs. A temporary fall in old-brand impressions is expected and is not a loss of
  relevant search visibility.

## Authority and content

- Prioritize legitimate links to useful tools and original assets, especially Image to GIF,
  exact-size GIF compression, and GIF to PNG frame extraction.
- Avoid paid link schemes, bulk directory spam, and large batches of near-duplicate converter
  pages.
- Add another tool page only when working product functionality and a distinct user job both
  exist. Background removal and GIF merging remain product ideas, not placeholder SEO pages.

## AdSense

- Monetize useful sessions and page RPM; never ask for or encourage ad clicks.
- Keep ads away from upload controls, previews, play controls, and download buttons to avoid
  accidental clicks.
- Introduce or increase ad density only after organic usage is meaningful, and keep the tool as
  the dominant content on every utility page.

## Known pre-existing engineering debt

- `next.config.mjs` currently skips type and lint validation during `next build`.
- A separate `tsc --noEmit` run reports pre-existing errors across the legacy editor, stores,
  Supabase helpers, and canvas code. The SEO release was linted independently and builds, but the
  repository-wide TypeScript debt should be handled as a separate engineering project.
