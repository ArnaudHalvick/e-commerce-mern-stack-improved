import React from "react";
import Select from "../../ui/select/Select";
import "../styles/common.css";

const CategorySection = ({ formData, errors, handleChange }) => {
  // Category options
  const categoryOptions = [
    { value: "men", label: "Men" },
    { value: "women", label: "Women" },
    { value: "kids", label: "Kids" },
  ];

  return (
    <div className="product-edit-modal-form-row two-column">
      <div className="product-edit-modal-form-group">
        <label className="product-edit-modal-form-label">Category</label>
        <Select
          name="category"
          value={formData.category}
          options={categoryOptions}
          onChange={(e) =>
            handleChange({
              target: { name: "category", value: e.target.value },
            })
          }
          error={errors.category}
          required
        />
      </div>
      <div className="product-edit-modal-form-group">
        <div className="product-edit-modal-checkbox-container">
          <label className="product-edit-modal-checkbox-label">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleChange}
              className="product-edit-modal-checkbox-input"
            />
            <span>Product Available</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
