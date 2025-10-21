# Phase 2 — Per‑Route Metadata and Robots

Changes
- SEO.jsx: added `robots` prop to render `<meta name="robots">`
- Applied `robots="noindex,follow"` to: /cart, /checkout, /login, /signup, /forgot-password, /reset-password/:token, /verify-email, /verify-pending, /order-confirmation/:id, /account/orders, /profile, /admin

Verification
- On each non-indexable route, inspect `<head>` for `<meta name="robots" content="noindex,follow">`
- Indexed routes (/, /men, /women, /kids, /shop, /products/:slug) have no robots meta by default
