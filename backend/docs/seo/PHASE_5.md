# Phase 5 — Crawlable Pagination and Canonicals

Changes
- robots.txt: continue disallowing sort/filter; allow `?page=`
- Listings: title includes “– Page N”; canonical and og:url reflect `?page=N`
- Pagination controls: real anchors with `href` and `rel="prev|next"` to be crawlable while preserving SPA behavior
- URL sync: reading `?page=` on mount and writing `?page=` on page change

Canonical behavior
- On `/shop?page=3` or `/men?page=3`, canonical should be `.../shop?page=3` (self‑canonical), which is correct for paginated pages.
- If the visible browser URL shows `/shop` without the `?page=3`, this is expected when clicking pagination (SPA) but we now update the address bar with `?page=` so it matches the canonical. If you still see mismatch, hard‑refresh or navigate by anchor; the code pushes `?page=` to history on page change.

Verification
- Navigate to `/shop?page=2`; confirm head shows canonical with `?page=2`
- Navigate via pagination controls; the address bar should update to include `?page=` and head canonical should match
