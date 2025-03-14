import React, { useState } from "react";

/**
 * Component for entering and applying promo codes
 */
const PromoCodeSection = () => {
  const [promoCode, setPromoCode] = useState("");

  const handleSubmit = () => {
    // Future implementation: Handle promo code submission
    console.log("Promo code submitted:", promoCode);
    // Reset after submission
    setPromoCode("");
  };

  return (
    <div className="promo-code-section">
      <p className="promo-code-text">If you have a promo code, Enter it here</p>
      <div className="promo-code-input-container">
        <input
          type="text"
          className="promo-code-input"
          placeholder="promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
        />
        <button className="promo-code-submit" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default PromoCodeSection;
