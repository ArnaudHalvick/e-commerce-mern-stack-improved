// Path: frontend/src/components/relatedProducts/RelatedProducts.jsx
import React, { useState, useEffect } from "react";
import "./RelatedProducts.css";
import Item from "../item/Item";
import { useParams } from "react-router-dom";

const RelatedProducts = () => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { productId, productSlug } = useParams();

  useEffect(() => {
    // For now, fetch general 'featured women' products as a placeholder for related
    // Later you might want to implement a proper "related products" API endpoint
    setLoading(true);
    setError(null);

    fetch("http://localhost:4000/api/featured-women")
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to fetch related products: ${res.status} ${res.statusText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        // Validate and log data for debugging
        if (!Array.isArray(data)) {
          console.warn("API didn't return an array for related products", data);
          setRelatedProducts([]);
        } else {
          // If we have a current product ID or slug, filter it out of the related products
          let filteredProducts = data;
          if (productId) {
            filteredProducts = data.filter(
              (p) => p.id !== Number(productId) && p._id !== productId
            );
          } else if (productSlug) {
            filteredProducts = data.filter((p) => p.slug !== productSlug);
          }

          setRelatedProducts(filteredProducts);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching related products:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [productId, productSlug]);

  if (loading) {
    return <div className="loading">Loading related products...</div>;
  }

  if (error) {
    return <div className="error">Error loading related products: {error}</div>;
  }

  return (
    <div className="related-products">
      <h1>Related Products</h1>
      <hr />
      <div className="related-products-item">
        {relatedProducts.map((item, i) => (
          <Item
            key={i}
            id={item.id}
            _id={item._id}
            slug={item.slug}
            name={item.name}
            images={item.images || []}
            mainImageIndex={item.mainImageIndex || 0}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
