import React, { useEffect } from "react";
import { useAuth, useCart, useProducts } from "../hooks/state";

const HookTestComponent = () => {
  // Use our custom hooks
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    error: authError,
    login,
    logout,
  } = useAuth();

  const {
    items,
    totalItems,
    totalPrice,
    loading: cartLoading,
    error: cartError,
    addItem,
    removeItem,
  } = useCart();

  const {
    products,
    loading: productsLoading,
    error: productsError,
    fetchProducts,
  } = useProducts();

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const result = await login(email, password);
    if (result.success) {
      console.log("Login successful!", result.user);
    } else {
      console.error("Login failed:", result.message);
    }
  };

  // Add a product to cart (example function)
  const handleAddToCart = (productId, size = "M") => {
    if (!isAuthenticated) {
      console.log("Please log in to add items to your cart");
      return;
    }

    addItem(productId, 1, size);
  };

  return (
    <div>
      <h2>Hook Test Component</h2>

      {/* Authentication Section */}
      <section>
        <h3>Authentication</h3>
        {authLoading && <p>Loading authentication...</p>}
        {authError && <p>Error: {authError}</p>}

        {isAuthenticated ? (
          <div>
            <p>Welcome, {user?.username || user?.name || "User"}!</p>
            <button onClick={logout}>Log Out</button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div>
              <label>Email:</label>
              <input type="email" name="email" required />
            </div>
            <div>
              <label>Password:</label>
              <input type="password" name="password" required />
            </div>
            <button type="submit" disabled={authLoading}>
              {authLoading ? "Logging in..." : "Log In"}
            </button>
          </form>
        )}
      </section>

      {/* Cart Section */}
      <section>
        <h3>Your Cart</h3>
        {cartLoading && <p>Loading cart...</p>}
        {cartError && <p>Error: {cartError}</p>}

        <div>
          <p>Total Items: {totalItems}</p>
          <p>Total Price: ${totalPrice.toFixed(2)}</p>

          {items.length > 0 ? (
            <ul>
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}`}>
                  {item.name} ({item.size}) - ${item.price} x {item.quantity}
                  <button
                    onClick={() => removeItem(item.productId, 1, item.size)}
                  >
                    Remove One
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Your cart is empty</p>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section>
        <h3>Products</h3>
        {productsLoading && <p>Loading products...</p>}
        {productsError && <p>Error: {productsError}</p>}

        <div>
          {products.length > 0 ? (
            <ul>
              {products.slice(0, 5).map((product) => (
                <li key={product._id}>
                  {product.name} - ${product.price}
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={!isAuthenticated || cartLoading}
                  >
                    Add to Cart
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No products available</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HookTestComponent;
