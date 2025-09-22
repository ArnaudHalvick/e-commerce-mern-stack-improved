const express = require("express");
const router = express.Router();
const seo = require("../controllers/seoController");

// Sitemap endpoints
router.get("/sitemap.xml", seo.getSitemapIndex);
router.get("/sitemap-static.xml", seo.getSitemapStatic);
router.get("/sitemap-categories.xml", seo.getSitemapCategories);
router.get("/sitemap-products.xml", seo.getSitemapProducts);

module.exports = router;


