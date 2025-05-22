// Path: frontend/src/pages/shop/Shop.jsx
import Hero from "../../components/hero/Hero";
import Popular from "../../components/popular/Popular";
import Shop from "../../components/shop/Shop";
import NewCollection from "../../components/newCollections/NewCollections";
import Newsletter from "../../components/newsLetter/NewsLetter";
import SEO from "../../utils/SEO";

const ShopPage = () => {
  return (
    <div>
      <SEO
        title="Home"
        description="Discover the latest fashion trends at our MERN E-Commerce store. Shop clothes, accessories, and more with fast shipping and great prices."
        keywords="fashion, clothing, shopping, e-commerce, online shopping, trendy clothes, accessories, new collection"
        type="website"
        url="/"
        strategy="replace"
      >
        {/* Organization structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "MERN E-Commerce",
            url: "https://mernappshopper.xyz",
            logo: "https://mernappshopper.xyz/images/logo.png",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+1-234-567-8901",
              contactType: "customer service",
            },
            sameAs: [
              "https://facebook.com/mernecommerce",
              "https://twitter.com/mernecommerce",
              "https://instagram.com/mernecommerce",
            ],
          })}
        </script>
      </SEO>
      <Hero />
      <Popular />
      <Shop />
      <NewCollection />
      <Newsletter />
    </div>
  );
};

export default ShopPage;
