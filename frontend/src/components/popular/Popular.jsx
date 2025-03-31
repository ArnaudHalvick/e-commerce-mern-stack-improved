// Path: frontend/src/components/popular/Popular.jsx
import React, { useState, useEffect } from "react";
import "./Popular.css";
import Item from "../item/Item";
import { productsService } from "../../api";

const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        // Use the productsService to get featured products
        const data = await productsService.getFeaturedProducts();
        // Update to handle the correct response structure from the backend
        setPopularProducts(data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching popular products:", error);
        setError("Failed to load popular products");
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  if (loading) {
    return <div className="loading">Loading popular products...</div>;
  }

  if (error) {
    return <div className="error">Error loading popular products: {error}</div>;
  }

  return (
    <div className="popular-container">
      <h1>Popular For Women</h1>
      <hr />
      <div className="popular-items">
        {popularProducts.map((item, index) => (
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

export default Popular;
