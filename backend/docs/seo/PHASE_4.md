# Phase 4 — Dynamic Sitemaps and Proxy Routing

Changes
- Backend: `controllers/seoController.js` adds sitemap index/static/categories/products
- Backend: `routes/seoRoutes.js`, mounted at root in `server.js` so sitemaps live at domain root
- Nginx proxy: `/sitemap*.xml` proxied to backend; robots.txt remains served by frontend

Verification
- http://localhost:4001/sitemap.xml returns index; http://localhost:3000/sitemap.xml via proxy in prod
- Product sitemap lists product slugs with lastmod; excludes deleted products
