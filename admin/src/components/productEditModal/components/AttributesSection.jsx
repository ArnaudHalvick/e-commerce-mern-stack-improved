import React from "react";
import "../styles/common.css";

const AttributesSection = ({ formData, handleArrayFieldChange, errors }) => {
  // Size options
  const sizeOptions = [
    { value: "S", label: "Small (S)" },
    { value: "M", label: "Medium (M)" },
    { value: "L", label: "Large (L)" },
    { value: "XL", label: "Extra Large (XL)" },
    { value: "XXL", label: "Double XL (XXL)" },
    { value: "One Size", label: "One Size" },
  ];

  // Tag options
  const tagOptions = [
    { value: "Winter", label: "Winter" },
    { value: "Summer", label: "Summer" },
    { value: "Spring", label: "Spring" },
    { value: "Fall", label: "Fall" },
    { value: "Trendy", label: "Trendy" },
    { value: "Elegant", label: "Elegant" },
    { value: "Casual", label: "Casual" },
    { value: "Athleisure", label: "Athleisure" },
    { value: "Boho", label: "Boho" },
    { value: "Minimalist", label: "Minimalist" },
    { value: "Party", label: "Party" },
    { value: "Chic", label: "Chic" },
  ];

  // Product type options
  const typeOptions = [
    { value: "T-Shirt", label: "T-Shirt" },
    { value: "Tank Top", label: "Tank Top" },
    { value: "Shirt", label: "Shirt" },
    { value: "Jeans", label: "Jeans" },
    { value: "Dress", label: "Dress" },
    { value: "Skirt", label: "Skirt" },
    { value: "Jacket", label: "Jacket" },
    { value: "Sweater", label: "Sweater" },
    { value: "Hoodie", label: "Hoodie" },
    { value: "Crop Top", label: "Crop Top" },
    { value: "Pants", label: "Pants" },
    { value: "Shorts", label: "Shorts" },
  ];

  return (
    <>
      <div className="product-edit-modal-form-row">
        <div className="product-edit-modal-form-group">
          <label className="product-edit-modal-form-label">Sizes</label>
          <div className="product-edit-modal-checkbox-group">
            {sizeOptions.map((option) => (
              <label
                key={option.value}
                className="product-edit-modal-checkbox-label"
              >
                <input
                  type="checkbox"
                  name="sizes"
                  value={option.value}
                  checked={formData.sizes.includes(option.value)}
                  onChange={(e) => {
                    handleArrayFieldChange(
                      "sizes",
                      option.value,
                      e.target.checked
                    );
                  }}
                  className="product-edit-modal-checkbox-input"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {errors && errors.sizes && (
            <div className="admin-input-error-text">{errors.sizes}</div>
          )}
        </div>
      </div>

      <div className="product-edit-modal-form-row">
        <div className="product-edit-modal-form-group">
          <label className="product-edit-modal-form-label">Product Tags</label>
          <div className="product-edit-modal-checkbox-group">
            {tagOptions.map((option) => (
              <label
                key={option.value}
                className="product-edit-modal-checkbox-label"
              >
                <input
                  type="checkbox"
                  name="tags"
                  value={option.value}
                  checked={formData.tags.includes(option.value)}
                  onChange={(e) => {
                    handleArrayFieldChange(
                      "tags",
                      option.value,
                      e.target.checked
                    );
                  }}
                  className="product-edit-modal-checkbox-input"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {errors && errors.tags && (
            <div className="admin-input-error-text">{errors.tags}</div>
          )}
        </div>
      </div>

      <div className="product-edit-modal-form-row">
        <div className="product-edit-modal-form-group">
          <label className="product-edit-modal-form-label">Product Type</label>
          <div className="product-edit-modal-checkbox-group">
            {typeOptions.map((option) => (
              <label
                key={option.value}
                className="product-edit-modal-checkbox-label"
              >
                <input
                  type="checkbox"
                  name="types"
                  value={option.value}
                  checked={formData.types.includes(option.value)}
                  onChange={(e) => {
                    handleArrayFieldChange(
                      "types",
                      option.value,
                      e.target.checked
                    );
                  }}
                  className="product-edit-modal-checkbox-input"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {errors && errors.types && (
            <div className="admin-input-error-text">{errors.types}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default AttributesSection;
