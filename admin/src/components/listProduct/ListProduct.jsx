// Path: admin/src/components/listProduct/ListProduct.jsx
import { useState, useEffect } from "react";
import "./ListProduct.css";
import { getApiUrl, getImageUrl } from "../../utils/apiUtils";

// TODO: Rework the layout, need to use table with all info in a line with responsive design for smaller screens
// Also implement product editing

const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use the new utility function for proper URL construction
        const apiUrl = getApiUrl("all-products");

        const response = await fetch(apiUrl);
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err + "/" + "Failed to fetch products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        // Use the new utility function for proper URL construction
        const apiUrl = getApiUrl("remove-product");

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: productId }),
        });
        const data = await response.json();

        if (data.success) {
          setProducts(products.filter((product) => product._id !== productId));
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
    <div className="list-product">
      <h1>All Products</h1>
      <div className="list-product-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="list-product-allproducts">
        <hr />
        {products.length === 0 ? (
          <p className="no-products">No products found</p>
        ) : (
          products.map((product, index) => {
            return (
              <div key={index} className="list-product-format">
                <img
                  src={getImageUrl(
                    product.images ? product.images[0] : product.image
                  )}
                  alt={product.name}
                  className="list-product-image"
                />
                <p>{product.name}</p>
                <p>${product.old_price}</p>
                <p>${product.new_price}</p>
                <p>{product.category}</p>
                <button
                  className="list-product-remove"
                  onClick={() => handleDelete(product._id, product.name)}
                >
                  <img src="/cross.png" alt="delete" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ListProduct;
