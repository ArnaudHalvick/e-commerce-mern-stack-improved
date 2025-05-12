import React from "react";
import Input from "../../ui/input/Input";
import "../styles/common.css";

const PriceSection = ({
  formData,
  errors,
  hasDiscount,
  handleChange,
  handleDiscountChange,
}) => {
  return (
    <>
      <div className="product-edit-modal-form-row">
        <div className="product-edit-modal-form-group">
          <label className="product-edit-modal-form-label">
            Original Price ($)
          </label>
          <Input
            type="number"
            name="old_price"
            value={formData.old_price}
            onChange={handleChange}
            error={errors.old_price}
            min={0.01}
            step={0.01}
            required
          />
        </div>
      </div>

      <div className="product-edit-modal-form-row">
        <div className="product-edit-modal-form-group">
          <div className="product-edit-modal-checkbox-container discount">
            <label className="product-edit-modal-checkbox-label">
              <input
                type="checkbox"
                name="hasDiscount"
                checked={hasDiscount}
                onChange={handleDiscountChange}
                className="product-edit-modal-checkbox-input"
              />
              <span>Apply Discount</span>
            </label>
          </div>
        </div>
      </div>

      {hasDiscount && (
        <div className="product-edit-modal-form-row">
          <div className="product-edit-modal-form-group">
            <label className="product-edit-modal-form-label">
              Discounted Price ($)
            </label>
            <Input
              type="number"
              name="new_price"
              value={formData.new_price}
              onChange={handleChange}
              error={errors.new_price}
              min={0.01}
              max={formData.old_price - 0.01}
              step={0.01}
              required={hasDiscount}
              disabled={!hasDiscount}
            />
            {formData.new_price >= formData.old_price && hasDiscount && (
              <div className="product-edit-modal-input-error">
                Discounted price must be less than original price
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PriceSection;
