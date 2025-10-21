const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const baseUrl = "http://localhost:3000";

// Test these pages
const testPages = [
  { path: "/", name: "Home", expectIndex: true },
  { path: "/men", name: "Men Category", expectIndex: true },
  { path: "/women", name: "Women Category", expectIndex: true },
  { path: "/kids", name: "Kids Category", expectIndex: true },
  { path: "/shop", name: "Shop/Offers", expectIndex: true },
  { path: "/shop?page=2", name: "Shop Page 2", expectIndex: true },
  { path: "/cart", name: "Cart", expectIndex: false },
  { path: "/login", name: "Login", expectIndex: false },
  { path: "/profile", name: "Profile", expectIndex: false },
];

const testSinglePage = async (browser, { path, name, expectIndex }) => {
  const url = `${baseUrl}${path}`;
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${name}`);
  console.log(`URL: ${url}`);
  console.log("=".repeat(60));

  const page = await browser.newPage();
  const issues = [];

  try {
    // Navigate and wait for React to render
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait a bit more for React 19 Document Metadata to apply
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Extract all SEO data
    const seoData = await page.evaluate(() => {
      // Helper to get meta content
      const getMeta = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.getAttribute("content") || el.getAttribute("href") : null;
      };

      // Get all JSON-LD
      const jsonLdScripts = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]')
      )
        .map((s) => {
          try {
            return JSON.parse(s.textContent);
          } catch (e) {
            return { error: "Invalid JSON-LD", content: s.textContent };
          }
        })
        .filter(Boolean);

      return {
        // Basic SEO
        title: document.title,
        description: getMeta('meta[name="description"]'),
        canonical: getMeta('link[rel="canonical"]'),
        robots: getMeta('meta[name="robots"]'),

        // Open Graph
        ogTitle: getMeta('meta[property="og:title"]'),
        ogDescription: getMeta('meta[property="og:description"]'),
        ogImage: getMeta('meta[property="og:image"]'),
        ogUrl: getMeta('meta[property="og:url"]'),
        ogType: getMeta('meta[property="og:type"]'),

        // Twitter
        twitterCard: getMeta('meta[name="twitter:card"]'),
        twitterTitle: getMeta('meta[name="twitter:title"]'),
        twitterDescription: getMeta('meta[name="twitter:description"]'),
        twitterImage: getMeta('meta[name="twitter:image"]'),

        // Content
        h1: document.querySelector("h1")?.textContent?.trim(),
        h1Count: document.querySelectorAll("h1").length,
        h2Count: document.querySelectorAll("h2").length,

        // Structured Data
        jsonLd: jsonLdScripts,

        // Images
        imageCount: document.querySelectorAll("img").length,
        imagesWithoutAlt: Array.from(document.querySelectorAll("img:not([alt])")).map((img) => ({
          src: img.src,
          classes: img.className,
        })),

        // Links
        internalLinks: document.querySelectorAll('a[href^="/"]').length,
        externalLinks: document.querySelectorAll('a[href^="http"]').length,

        // Performance indicators
        hasPreconnect: !!document.querySelector('link[rel="preconnect"]'),
        hasPreload: !!document.querySelector('link[rel="preload"]'),

        // Check for lazy loading
        lazyImages: document.querySelectorAll('img[loading="lazy"]').length,
        eagerImages: document.querySelectorAll('img[loading="eager"], img[fetchpriority="high"]')
          .length,
      };
    });

    // Check indexability
    const isNoIndex = seoData.robots && seoData.robots.includes("noindex");
    const indexStatus = isNoIndex ? "🚫 NOINDEX" : "✅ INDEXABLE";
    const expectationMet = isNoIndex !== expectIndex;

    console.log(`\nIndexability: ${indexStatus}`);
    if (expectationMet) {
      console.log(`   ✓ Matches expectation`);
    } else {
      console.log(`   ✗ MISMATCH! Expected: ${expectIndex ? "indexable" : "noindex"}`);
      issues.push(`Indexability mismatch: expected ${expectIndex ? "indexable" : "noindex"}`);
    }

    // Title check
    console.log(`\n📝 Title: ${seoData.title || "❌ MISSING"}`);
    if (!seoData.title) {
      issues.push("Missing title tag");
    } else {
      console.log(`   Length: ${seoData.title.length} chars`);
      if (seoData.title.length > 60) {
        console.log(`   ⚠️  Warning: Title is ${seoData.title.length} chars (recommended < 60)`);
        issues.push(`Title too long: ${seoData.title.length} chars`);
      }
      if (seoData.title.length < 30) {
        console.log(`   ⚠️  Warning: Title is short (${seoData.title.length} chars)`);
      }
    }

    // Description check
    console.log(`\n📄 Description: ${seoData.description ? "✅" : "❌ MISSING"}`);
    if (!seoData.description) {
      issues.push("Missing meta description");
    } else {
      console.log(`   Length: ${seoData.description.length} chars`);
      if (seoData.description.length > 160) {
        console.log(
          `   ⚠️  Warning: Too long (${seoData.description.length} chars, recommended < 160)`
        );
        issues.push(`Description too long: ${seoData.description.length} chars`);
      }
      if (seoData.description.length < 120) {
        console.log(
          `   ℹ️  Could be longer (${seoData.description.length} chars, optimal 120-160)`
        );
      }
    }

    // Canonical check
    console.log(`\n🔗 Canonical: ${seoData.canonical || "❌ MISSING"}`);
    if (!seoData.canonical) {
      issues.push("Missing canonical URL");
    } else if (
      !seoData.canonical.startsWith("http://localhost") &&
      !seoData.canonical.startsWith("https://mernappshopper.xyz")
    ) {
      console.log(`   ⚠️  Warning: Canonical domain doesn't match expected`);
      issues.push(`Unexpected canonical domain: ${seoData.canonical}`);
    }

    // H1 check
    console.log(`\n📌 H1: ${seoData.h1 || "❌ MISSING"}`);
    if (!seoData.h1) {
      issues.push("Missing H1 tag");
    }
    if (seoData.h1Count > 1) {
      console.log(`   ⚠️  Warning: Multiple H1s found (${seoData.h1Count})`);
      issues.push(`Multiple H1 tags: ${seoData.h1Count}`);
    } else if (seoData.h1Count === 1) {
      console.log(`   ✓ Single H1 (optimal)`);
    }
    console.log(`   H2 count: ${seoData.h2Count}`);

    // Open Graph
    console.log(`\n🌐 Open Graph:`);
    console.log(`   Title: ${seoData.ogTitle ? "✅" : "❌"}`);
    console.log(`   Description: ${seoData.ogDescription ? "✅" : "❌"}`);
    console.log(`   Image: ${seoData.ogImage ? "✅" : "❌"}`);
    console.log(`   URL: ${seoData.ogUrl ? "✅" : "❌"}`);
    console.log(`   Type: ${seoData.ogType || "not set"}`);

    if (!seoData.ogTitle) issues.push("Missing OG title");
    if (!seoData.ogDescription) issues.push("Missing OG description");
    if (!seoData.ogImage) issues.push("Missing OG image");

    // Twitter
    console.log(`\n🐦 Twitter Card:`);
    console.log(`   Card Type: ${seoData.twitterCard || "not set"}`);
    console.log(`   Title: ${seoData.twitterTitle ? "✅" : "❌"}`);
    console.log(`   Description: ${seoData.twitterDescription ? "✅" : "❌"}`);
    console.log(`   Image: ${seoData.twitterImage ? "✅" : "❌"}`);

    // Structured Data
    console.log(`\n🏷️  JSON-LD Schemas: ${seoData.jsonLd.length}`);
    if (seoData.jsonLd.length > 0) {
      seoData.jsonLd.forEach((schema, i) => {
        if (schema.error) {
          console.log(`   ${i + 1}. ❌ ${schema.error}`);
          issues.push("Invalid JSON-LD detected");
        } else {
          const types = Array.isArray(schema["@type"])
            ? schema["@type"].join(", ")
            : schema["@type"];
          console.log(`   ${i + 1}. ${types || "Unknown"}`);
        }
      });
    } else if (expectIndex) {
      console.log(`   ⚠️  No structured data found`);
    }

    // Images
    console.log(`\n🖼️  Images: ${seoData.imageCount} total`);
    console.log(`   Lazy loaded: ${seoData.lazyImages}`);
    console.log(`   Eager/High priority: ${seoData.eagerImages}`);
    if (seoData.imagesWithoutAlt.length > 0) {
      console.log(`   ⚠️  ${seoData.imagesWithoutAlt.length} images missing alt text`);
      issues.push(`${seoData.imagesWithoutAlt.length} images missing alt text`);
      if (seoData.imagesWithoutAlt.length <= 5) {
        seoData.imagesWithoutAlt.forEach((img) => {
          console.log(`      - ${img.src.substring(0, 80)}...`);
        });
      }
    } else if (seoData.imageCount > 0) {
      console.log(`   ✓ All images have alt text`);
    }

    // Performance hints
    console.log(`\n⚡ Performance Hints:`);
    console.log(`   Preconnect: ${seoData.hasPreconnect ? "✅" : "❌"}`);
    console.log(`   Preload: ${seoData.hasPreload ? "✅" : "❌"}`);

    // Links
    console.log(`\n🔗 Links:`);
    console.log(`   Internal: ${seoData.internalLinks}`);
    console.log(`   External: ${seoData.externalLinks}`);

    if (seoData.internalLinks < 5 && expectIndex) {
      console.log(`   ℹ️  Consider adding more internal links for better navigation`);
    }

    // Screenshot for visual verification
    const screenshotFilename = `${name.replace(/\s+/g, "-").toLowerCase()}.png`;
    const screenshotPath = `${__dirname}/screenshots/${screenshotFilename}`;
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
    });
    console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

    // Return results for summary
    return {
      name,
      path,
      success: true,
      issues,
      seoData,
    };
  } catch (error) {
    console.error(`\n❌ Error testing page: ${error.message}`);
    return {
      name,
      path,
      success: false,
      error: error.message,
      issues: ["Page failed to load or render"],
    };
  } finally {
    await page.close();
  }
};

(async () => {
  console.log("🕷️  Starting SEO Crawler...\n");
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Testing ${testPages.length} pages\n`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results = [];

  for (const testPage of testPages) {
    const result = await testSinglePage(browser, testPage);
    results.push(result);
  }

  await browser.close();

  // Generate summary report
  console.log("\n" + "=".repeat(60));
  console.log("📊 SEO AUDIT SUMMARY");
  console.log("=".repeat(60));

  const totalPages = results.length;
  const successfulPages = results.filter((r) => r.success).length;
  const pagesWithIssues = results.filter((r) => r.issues && r.issues.length > 0).length;
  const totalIssues = results.reduce((sum, r) => sum + (r.issues ? r.issues.length : 0), 0);

  console.log(`\nPages tested: ${totalPages}`);
  console.log(`Successfully crawled: ${successfulPages}`);
  console.log(`Pages with issues: ${pagesWithIssues}`);
  console.log(`Total issues found: ${totalIssues}`);

  if (totalIssues > 0) {
    console.log(`\n🔍 Issues by Page:`);
    results.forEach((result) => {
      if (result.issues && result.issues.length > 0) {
        console.log(`\n  ${result.name}:`);
        result.issues.forEach((issue) => {
          console.log(`    • ${issue}`);
        });
      }
    });
  }

  // Save detailed report to JSON
  const reportPath = path.join(__dirname, "seo-audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved: ${reportPath}`);

  console.log("\n" + "=".repeat(60));
  console.log("✅ Crawl complete!");
  console.log("=".repeat(60));
})();
