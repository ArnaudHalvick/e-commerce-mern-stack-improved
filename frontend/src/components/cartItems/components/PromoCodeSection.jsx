import React, { useState } from "react";
import "./PromoCodeSection.css";

/**
 * Component for entering and applying promo codes
 */
const PromoCodeSection = () => {
  const [promoCode, setPromoCode] = useState("");

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    // Future implementation: Handle promo code submission
    console.log("Promo code submitted:", promoCode);
    // Reset after submission
    setPromoCode("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="cart-items-promo-code-section">
      <p className="cart-items-promo-code-text">
        If you have a promo code, Enter it here
      </p>
      <form
        onSubmit={handleSubmit}
        className="cart-items-promo-code-input-container"
      >
        <input
          type="text"
          className="cart-items-promo-code-input"
          placeholder="promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          aria-label="Enter promo code"
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          className="cart-items-promo-code-submit"
          aria-label="Apply promo code"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default PromoCodeSection;
