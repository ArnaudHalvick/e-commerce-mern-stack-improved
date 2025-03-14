// Path: frontend/src/components/popular/Popular.jsx
import "./Popular.css";
import Item from "../item/Item";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../utils/imageUtils";

const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/api/featured-women?basicInfo=true`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to fetch popular products: ${res.status} ${res.statusText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        // Validate and log data for debugging
        if (!Array.isArray(data)) {
          console.warn("API didn't return an array for popular products", data);
          setPopularProducts([]);
        } else {
          setPopularProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching popular products:", err);
        setError(err.message);
        setLoading(false);
      });
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
