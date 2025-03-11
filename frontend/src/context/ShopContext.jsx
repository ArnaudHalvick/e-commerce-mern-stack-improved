// Path: frontend/src/context/ShopContext.jsx
import { createContext, useState, useEffect } from "react";

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);

  // Load products
  useEffect(() => {
    // Fetch all products
    fetch("http://localhost:4000/api/all-products")
      .then((res) => res.json())
      .then((data) => setAll_Product(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const ctxValue = {
    all_product,
  };

  return (
    <ShopContext.Provider value={ctxValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
