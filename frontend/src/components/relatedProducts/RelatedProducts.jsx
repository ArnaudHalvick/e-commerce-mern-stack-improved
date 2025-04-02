// Path: frontend/src/components/relatedProducts/RelatedProducts.jsx
import React, { useState, useEffect } from "react";
import "./RelatedProducts.css";
import Item from "../item/Item";
import { useParams } from "react-router-dom";
import { productsService } from "../../api";

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

    const fetchRelatedProducts = async () => {
      try {
        // Determine which parameters to use for the API call
        const id = product._id || productId;
        const { category } = product;

        // Use productsService to get related products
        const data = await productsService.getRelatedProducts(category, id);

        // Validate data
        if (!Array.isArray(data)) {
          console.warn("API didn't return an array for related products", data);
          setRelatedProducts([]);
        } else {
          setRelatedProducts(data);
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product, productId, productSlug]);

  if (loading) {
    return (
      <div className="related-products-loading">
        Loading related products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="related-products-error">
        Error loading related products: {error}
      </div>
    );
  }

  // Don't render if no related products found
  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="related-products">
      <h1 className="related-products-title">Related Products</h1>
      <hr className="related-products-divider" />
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
