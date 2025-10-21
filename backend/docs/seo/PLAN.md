# SEO Implementation Plan (React 19 + MERN)

Scope: storefront only; admin excluded from indexing.

- Phase 1: Audit, indexability policy, robots.txt, admin noindex header, env‑driven base URL for SEO
- Phase 2: Per‑route metadata with React 19 Document Metadata; robots meta for non‑indexable routes
- Phase 3: Structured data (JSON‑LD): Home (Organization, WebSite), Listings (BreadcrumbList, ItemList), Product (Offer, AggregateRating)
- Phase 4: Dynamic sitemaps (index/static/categories/products) served by backend; reverse proxy routing
- Phase 5: Crawlable pagination; unique titles/canonicals with ?page=; prev/next anchor links
- Phase 6: Core Web Vitals improvements (LCP/CLS/INP), preload/preconnect, image sizing/lazy‑load
- Phase 7: Content + internal linking improvements (ongoing)

Notes

- rel=prev/next is ignored by Google; rely on crawlable links and self‑canonicals
- Dynamic rendering is deprecated; avoid prerender middlewares
- INP replaces FID; prioritize interaction latency
