import React, { useEffect } from "react";
import { useProducts } from "../hooks/state";

const ProductHookTest = () => {
  const { products, loading, error, fetchProducts, getProductsByCategory } =
    useProducts();

  useEffect(() => {
    // Fetch products on component mount
    fetchProducts();
  }, [fetchProducts]);

  const handleFetchCategory = async (category) => {
    try {
      const categoryProducts = await getProductsByCategory(category);
      console.log(
        `Fetched ${categoryProducts.length} products in category: ${category}`
      );
    } catch (err) {
      console.error(`Error fetching ${category} products:`, err);
    }
  };

  return (
    <div>
      <h2>Product Hook Test</h2>

      {loading && <p>Loading products...</p>}
      {error && <p>Error: {error}</p>}

      <div>
        <h3>Available Products: {products.length}</h3>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button onClick={() => handleFetchCategory("men")}>
            Load Men's Products
          </button>
          <button onClick={() => handleFetchCategory("women")}>
            Load Women's Products
          </button>
          <button onClick={() => handleFetchCategory("kids")}>
            Load Kids' Products
          </button>
        </div>

        {products.length > 0 ? (
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            {products.slice(0, 8).map((product) => (
              <li
                key={product._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "4px",
                  padding: "10px",
                  listStyle: "none",
                }}
              >
                <div>
                  <strong>{product.name}</strong>
                </div>
                <div>Category: {product.category}</div>
                <div>
                  Price: $
                  {product.new_price > 0
                    ? product.new_price
                    : product.old_price}
                </div>
                {product.new_price > 0 &&
                  product.new_price < product.old_price && (
                    <div style={{ color: "green" }}>
                      On Sale! Was: ${product.old_price}
                    </div>
                  )}
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p>No products available</p>
        )}
      </div>
    </div>
  );
};

export default ProductHookTest;
