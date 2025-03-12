// Path: admin/src/components/listProduct/ListProduct.jsx
import { useState, useEffect } from "react";
import "./ListProduct.css";

// TODO: Rework the layout, need to use table with all info in a line with responsive design for smaller screens
// Also implement product editing

const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/all-products");
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err + "/" + "Failed to fetch products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const response = await fetch(
          "http://localhost:4000/api/remove-product",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
          }
        );
        const data = await response.json();

        if (data.success) {
          setProducts(products.filter((product) => product.id !== id));
          alert("Product deleted successfully!");
        }
      } catch (err) {
        alert(err + "/" + "Failed to delete product. Please try again.");
      }
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="list-product-container">
      <h2>Product List</h2>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img
                src={
                  product.images && product.images.length > 0
                    ? product.images[product.mainImageIndex || 0]
                    : ""
                }
                alt={product.name}
              />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">
                <span className="old-price">${product.old_price}</span>
                <span className="new-price">${product.new_price}</span>
              </p>
              <p className="category">Category: {product.category}</p>
              <p className="date">
                Added: {new Date(product.date).toLocaleDateString()}
              </p>
            </div>
            <div className="product-actions">
              <button className="edit-btn">Edit</button>
              <button
                className="delete-btn"
                onClick={() => handleDelete(product.id, product.name)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;
