# Phase 1 — Audit and Foundations

Changes

- robots.txt: Disallow auth/profile/checkout/admin and common faceted params; added Sitemap line
- Admin reverse proxy: X-Robots-Tag: noindex, nofollow
- SEO.jsx: base URL is environment-driven (REACT_APP_PUBLIC_URL/PUBLIC_URL)

Verification

- http://localhost:3000/robots.txt shows disallows and Sitemap
- Admin header validated in prod-like proxy only
- Dev: set REACT_APP_PUBLIC_URL=http://localhost:3000, restart, verify canonical/OG point to localhost
