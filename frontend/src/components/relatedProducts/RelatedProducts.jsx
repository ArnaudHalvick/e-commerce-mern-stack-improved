// Path: frontend/src/components/relatedProducts/RelatedProducts.jsx
import React, { useState, useEffect } from "react";
import "./RelatedProducts.css";
import Item from "../item/Item";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../../utils/apiUtils";

const RelatedProducts = ({ product }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { productId, productSlug } = useParams();

  useEffect(() => {
    // Don't attempt to fetch if we don't have a product or category
    if (!product || !product.category) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Determine which parameters to use for the API call
    const id = product._id || productId;
    const slug = product.slug || productSlug;
    const { category } = product;

    // Build the API URL with the available parameters
    let apiUrl = `${API_BASE_URL}/api/products/related/${category}`;

    // Add productId if available
    if (id) {
      apiUrl += `/${id}`;
    } else {
      apiUrl += "/null"; // Use 'null' as a placeholder
    }

    // Add productSlug if available
    if (slug) {
      apiUrl += `/${slug}`;
    }

    // Add query parameters
    apiUrl += "?basicInfo=true";

    fetch(apiUrl)
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
          setRelatedProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching related products:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [product, productId, productSlug]);

  if (loading) {
    return <div className="loading">Loading related products...</div>;
  }

  if (error) {
    return <div className="error">Error loading related products: {error}</div>;
  }

  // Don't render if no related products found
  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="related-products">
      <h1>Related Products</h1>
      <hr />
      <div className="related-products-items">
        {relatedProducts.map((item, index) => (
          <Item
            key={item._id || item.id || index}
            id={item.id}
            _id={item._id}
            slug={item.slug}
            images={item.images}
            mainImageIndex={item.mainImageIndex}
            name={item.name}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
