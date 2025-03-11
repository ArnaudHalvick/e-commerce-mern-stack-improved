// Path: frontend/src/context/ShopContext.jsx
import { createContext, useState, useEffect } from "react";

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

  useEffect(() => {
    fetch("http://localhost:4000/api/all-products")
      .then((res) => res.json())
      .then((data) => setAll_Product(data));

    if (localStorage.getItem("auth-token")) {
      // TODO: Improve this code used to get cart data from the database
      fetch("http://localhost:4000/api/cart", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": `${localStorage.getItem("auth-token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setCartItems(data);
        });
    }
  }, []);

  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    // TODO: Improve this code used to add item to cart and store it in the database
    // Need to also reset cartItems state to 0 after a while or some other conditions because restarting server doesn't reset it
    if (localStorage.getItem("auth-token")) {
      fetch("http://localhost:4000/api/cart/add", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": `${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ itemId }),
      }).then((res) => res.json());
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const newQuantity = Math.max(0, prev[itemId] - 1);
      return { ...prev, [itemId]: newQuantity };
    });
    // TODO: Improve this code used to remove item from cart and store it in the database.
    // It doesnt work as intended. I have button to do minus 1 item or remove all items and it wont work properly
    if (localStorage.getItem("auth-token")) {
      fetch("http://localhost:4000/api/cart/remove", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": `${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ itemId }),
      }).then((res) => res.json());
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
  };

  return (
    <ShopContext.Provider value={ctxValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
