// Path: frontend/src/context/ShopContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

// TODO: review this code because I doubt that it's best practice. Check other file for the 300 item cart initialization

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let i = 0; i < 300 + 1; i++) {
    cart[i] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const { isAuthenticated } = useContext(AuthContext);

  // Load products and cart data
  useEffect(() => {
    // Fetch all products
    fetch("http://localhost:4000/api/all-products")
      .then((res) => res.json())
      .then((data) => setAll_Product(data))
      .catch((err) => console.error("Error fetching products:", err));

    // Fetch cart data if authenticated
    if (isAuthenticated) {
      fetchCartData();
    } else {
      // Reset cart to default if not authenticated
      setCartItems(getDefaultCart());
    }
  }, [isAuthenticated]);

  // Function to fetch cart data
  const fetchCartData = () => {
    const token = localStorage.getItem("auth-token");
    if (!token) return;

    fetch("http://localhost:4000/api/cart", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "auth-token": token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setCartItems(data);
        }
      })
      .catch((err) => console.error("Error fetching cart:", err));
  };

  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));

    if (isAuthenticated) {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      fetch("http://localhost:4000/api/cart/add", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ itemId }),
      })
        .then((res) => res.json())
        .catch((err) => console.error("Error adding to cart:", err));
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const newQuantity = Math.max(0, prev[itemId] - 1);
      return { ...prev, [itemId]: newQuantity };
    });

    if (isAuthenticated) {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      fetch("http://localhost:4000/api/cart/remove", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ itemId }),
      })
        .then((res) => res.json())
        .catch((err) => console.error("Error removing from cart:", err));
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = all_product.find(
          (product) => product.id === Number(item)
        );
        if (itemInfo) {
          totalAmount += itemInfo.new_price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItems = 0;
    for (const item in cartItems) {
      const quantity = cartItems[item];
      if (quantity > 0) {
        totalItems += quantity;
      }
    }
    return totalItems;
  };

  const ctxValue = {
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
    fetchCartData,
  };

  return (
    <ShopContext.Provider value={ctxValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
