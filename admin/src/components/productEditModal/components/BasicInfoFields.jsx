import React from "react";
import Input from "../../ui/input/Input";
import "../styles/common.css";

const BasicInfoFields = ({ formData, errors, handleChange }) => {
  return (
    <>
      <div className="product-edit-modal-form-row">
        <div className="product-edit-modal-form-group">
          <label className="product-edit-modal-form-label">Product Name</label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="Enter product name (required)"
          />
        </div>
      </div>

      <div className="product-edit-modal-form-row">
        <div className="product-edit-modal-form-group">
          <label className="product-edit-modal-form-label">
            Short Description
          </label>
          <Input
            type="text"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            error={errors.shortDescription}
            required
            maxLength={200}
            placeholder="Enter short description (required)"
          />
        </div>
      </div>

      <div className="product-edit-modal-form-row">
        <div className="product-edit-modal-form-group">
          <label className="product-edit-modal-form-label">
            Long Description
          </label>
          <textarea
            name="longDescription"
            value={formData.longDescription}
            onChange={handleChange}
            className={`product-edit-modal-textarea ${
              errors.longDescription ? "error" : ""
            }`}
            rows={5}
            required
            placeholder="Enter detailed product description (required)"
          />
          {errors.longDescription && (
            <div className="product-edit-modal-input-error">
              {errors.longDescription}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BasicInfoFields;
