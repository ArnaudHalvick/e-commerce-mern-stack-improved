/**
 * SEO Component that uses React 19's native Document Metadata features
 * This component allows for dynamic SEO metadata management without
 * third-party libraries like react-helmet
 */

const SEO = ({
  title,
  description,
  keywords,
  author = "MERN E-Commerce",
  type = "website",
  image,
  url,
  children,
  strategy = "replace", // "replace" (default) or "merge"
}) => {
  // Check if we should use the environment-specified strategy instead
  const envStrategy = process.env.REACT_APP_META_MERGE_STRATEGY;
  const finalStrategy = envStrategy || strategy;

  // Base URL for absolute paths
  const baseUrl = "https://mernappshopper.xyz";

  // If a relative URL is provided, make it absolute
  const canonicalUrl = url
    ? url.startsWith("http")
      ? url
      : `${baseUrl}${url}`
    : baseUrl;

  // If a relative image path is provided, make it absolute
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${baseUrl}${image}`
    : `${baseUrl}/images/default-og-image.jpg`;

  // If we're using replace strategy, we always include all metadata
  // If we're using merge strategy, we conditionally include metadata
  // based on what's provided

  const shouldInclude = (value) => {
    return finalStrategy === "replace" || (finalStrategy === "merge" && value);
  };

  return (
    <>
      {/* Standard metadata tags */}
      {shouldInclude(title) && (
        <title>
          {title
            ? `${title} | MERN E-Commerce`
            : "MERN E-Commerce - Shop the Latest Fashion"}
        </title>
      )}
      {shouldInclude(description) && (
        <meta
          name="description"
          content={
            description ||
            "Discover the latest fashion trends at our MERN E-Commerce store. Shop clothes, accessories, and more with fast shipping and great prices."
          }
        />
      )}
      {shouldInclude(keywords) && <meta name="keywords" content={keywords} />}
      {shouldInclude(author) && <meta name="author" content={author} />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph tags for social media */}
      {shouldInclude(title) && (
        <meta property="og:title" content={title || "MERN E-Commerce"} />
      )}
      {shouldInclude(description) && (
        <meta
          property="og:description"
          content={
            description ||
            "Discover the latest fashion trends at our MERN E-Commerce store. Shop clothes, accessories, and more with fast shipping and great prices."
          }
        />
      )}
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="MERN E-Commerce" />

      {/* Twitter card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      {shouldInclude(title) && (
        <meta name="twitter:title" content={title || "MERN E-Commerce"} />
      )}
      {shouldInclude(description) && (
        <meta
          name="twitter:description"
          content={
            description ||
            "Discover the latest fashion trends at our MERN E-Commerce store. Shop clothes, accessories, and more with fast shipping and great prices."
          }
        />
      )}
      <meta name="twitter:image" content={ogImage} />

      {/* Mobile-specific meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Additional metadata from children */}
      {children}
    </>
  );
};

export default SEO;
