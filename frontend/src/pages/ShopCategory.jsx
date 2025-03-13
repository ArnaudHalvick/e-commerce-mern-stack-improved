// Path: frontend/src/pages/ShopCategory.jsx
import { useState, useEffect } from "react";
import dropdown_icon from "../components/assets/dropdown_icon.png";
import Item from "../components/item/Item";
import "./CSS/ShopCategory.css";
import { Link } from "react-router-dom";
import arrow_icon from "../components/assets/breadcrum_arrow.png";
import "../components/breadcrumbs/breadcrumb.css";

// Simple breadcrumb component for category pages
const CategoryBreadcrumb = ({ category }) => {
  return (
    <div className="breadcrumb">
      <Link to="/" className="breadcrumb-link">
        HOME
      </Link>
      <img src={arrow_icon} alt="" />
      <Link to="/" className="breadcrumb-link">
        SHOP
      </Link>
      <img src={arrow_icon} alt="" />
      <span className="breadcrumb-current">{category}</span>
    </div>
  );
};

const ShopCategory = (props) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products by category directly from API
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Use the new API endpoint that filters by category on the server
    fetch(
      `http://localhost:4000/api/products/category/${props.category}?basicInfo=true`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to fetch products: ${res.status} ${res.statusText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          console.warn("API didn't return an array for products", data);
          setProducts([]);
        } else {
          // No need to filter as the API already returns the correct category
          setProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [props.category]);

  // Calculate the total count of products in this category
  const productCount = products.length;

  // For now we'll show a fixed range (1-12), but this could be expanded with pagination
  const displayRange = `1-${Math.min(12, productCount)}`;

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error loading products: {error}</div>;
  }

  return (
    <div className="product-category-container">
      <CategoryBreadcrumb category={props.category} />
      <img className="category-banner" src={props.banner} alt="" />
      <div className="product-filter-bar">
        <p>
          <span>Showing {displayRange} </span>of {productCount} products
        </p>
        <div className="sort-dropdown">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>
      <div className="product-grid">
        {products.length > 0 ? (
          products.map((item, index) => (
            <Item
              key={item._id || item.id || index}
              id={item.id}
              _id={item._id}
              slug={item.slug}
              name={item.name}
              images={item.images}
              mainImageIndex={item.mainImageIndex}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        ) : (
          <p>No products available in this category.</p>
        )}
      </div>
      {products.length > 0 && (
        <div className="load-more-button">Explore more</div>
      )}
    </div>
  );
};

export default ShopCategory;
