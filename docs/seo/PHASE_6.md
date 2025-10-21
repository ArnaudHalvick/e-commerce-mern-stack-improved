# Phase 6 — Core Web Vitals (LCP/CLS/INP) improvements

Changes

- Home: preconnect to API origin; preload LCP hero image in `<head>` via SEO children
- Hero: `fetchpriority="high"`, `decoding="async"`, intrinsic `width/height`
- Category banners: `fetchpriority="high"`, `decoding="async"`, intrinsic `width/height`
- Product listing items: `loading="lazy"`, `decoding="async"`, intrinsic `width/height`
- Product gallery: main image `fetchpriority="high"` and thumbnails `loading="lazy"`

Why

- LCP: prioritize above‑the‑fold images, avoid network contention, preload critical assets
- CLS: set width/height to reserve space and prevent layout shifts
- INP: reduce main‑thread pressure during interaction with async decoding and less reflow

Verification

- Lighthouse/PageSpeed Insights: check LCP under 2.5s, CLS ~0.00, INP within good range
