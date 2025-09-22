const Product = require("../models/Product");

// Helper to get absolute base URL
const getBaseUrl = () => {
  const envUrl = process.env.FRONTEND_URL || process.env.PUBLIC_URL;
  if (envUrl && /^https?:\/\//.test(envUrl)) {
    return envUrl.replace(/\/$/, "");
  }
  return "https://mernappshopper.xyz";
};

// Common XML header
const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';

exports.getSitemapIndex = async (req, res) => {
  const base = getBaseUrl();
  const body = `\
${xmlHeader}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${base}/sitemap-static.xml</loc></sitemap>
  <sitemap><loc>${base}/sitemap-categories.xml</loc></sitemap>
  <sitemap><loc>${base}/sitemap-products.xml</loc></sitemap>
</sitemapindex>`;

  res.set("Content-Type", "application/xml");
  res.set("Cache-Control", "public, max-age=3600");
  return res.status(200).send(body);
};

exports.getSitemapStatic = async (req, res) => {
  const base = getBaseUrl();
  const urls = ["/"/* Add more static pages here when available */];
  const now = new Date().toISOString();

  const urlset = urls
    .map(
      (u) => `  <url><loc>${base}${u}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`
    )
    .join("\n");

  const body = `\
${xmlHeader}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

  res.set("Content-Type", "application/xml");
  res.set("Cache-Control", "public, max-age=3600");
  return res.status(200).send(body);
};

exports.getSitemapCategories = async (req, res) => {
  const base = getBaseUrl();
  const categories = ["/men", "/women", "/kids", "/shop"]; // listing endpoints
  const now = new Date().toISOString();

  const urlset = categories
    .map(
      (u) => `  <url><loc>${base}${u}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`
    )
    .join("\n");

  const body = `\
${xmlHeader}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

  res.set("Content-Type", "application/xml");
  res.set("Cache-Control", "public, max-age=3600");
  return res.status(200).send(body);
};

exports.getSitemapProducts = async (req, res) => {
  const base = getBaseUrl();
  try {
    const products = await Product.find({ deleted: { $ne: true } })
      .select("slug date _id")
      .lean();

    const urlset = (products || [])
      .map((p) => {
        const loc = p.slug ? `${base}/products/${p.slug}` : `${base}/product/${p._id}`;
        const lastmod = (p.date instanceof Date ? p.date : new Date(p.date || Date.now())).toISOString();
        return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`;
      })
      .join("\n");

    const body = `\
${xmlHeader}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=1800");
    return res.status(200).send(body);
  } catch (err) {
    return res.status(500).json({ error: "Failed to generate product sitemap" });
  }
};


