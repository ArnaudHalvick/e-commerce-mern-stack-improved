import { useEffect, useRef } from "react";

/**
 * Custom hook to set up the product display reference
 * @returns {Object} - Reference to the product display
 */
const useProductId = () => {
  const displayRef = useRef(null);

  // Make the ref accessible via an ID for easier scrolling from outside
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.id = "product-display";
    }
  }, []);

  return displayRef;
};

export default useProductId;
