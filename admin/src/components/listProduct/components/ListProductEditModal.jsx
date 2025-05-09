import React, { useState, useEffect } from "react";
import Modal from "../../ui/modal/Modal";
import Button from "../../ui/button/Button";
import Input from "../../ui/input/Input";
import Select from "../../ui/select/Select";
import { useToast } from "../../ui/errorHandling/toast/ToastHooks";
import { getImageUrl } from "../../../utils/apiUtils";
import "../styles/ListProductEditModal.css";

const ListProductEditModal = ({ isOpen, onClose, product, onSave }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    longDescription: "",
    category: "",
    new_price: 0,
    old_price: 0,
    available: true,
    sizes: [],
    tags: [],
    types: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category options
  const categoryOptions = [
    { value: "men", label: "Men" },
    { value: "women", label: "Women" },
    { value: "kids", label: "Kids" },
  ];

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

  // Initialize form with product data when modal opens
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        // Convert array fields to match the expected format of the Select component
        sizes: product.sizes || [],
        tags: product.tags || [],
        types: product.types || [],
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.shortDescription)
      newErrors.shortDescription = "Short description is required";
    if (!formData.longDescription)
      newErrors.longDescription = "Long description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.new_price <= 0)
      newErrors.new_price = "New price must be greater than 0";
    if (formData.old_price <= 0)
      newErrors.old_price = "Old price must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast({
        type: "error",
        message: "Please fix the errors in the form",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        ...formData,
        _id: product._id, // Ensure ID is preserved
      });
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <Modal.Header onClose={onClose}>
        Edit Product: {product?.name}
      </Modal.Header>

      <Modal.Body>
        <form onSubmit={handleSubmit} className="list-product-edit-form">
          <div className="list-product-form-row">
            <div className="list-product-form-group">
              <Input
                label="Product Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
            </div>
          </div>

          <div className="list-product-form-row">
            <div className="list-product-form-group">
              <Input
                label="Short Description"
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                error={errors.shortDescription}
                required
                maxLength={200}
              />
            </div>
          </div>

          <div className="list-product-form-row">
            <div className="list-product-form-group">
              <label>Long Description</label>
              <textarea
                name="longDescription"
                value={formData.longDescription}
                onChange={handleChange}
                className={`list-product-textarea-input ${
                  errors.longDescription ? "error" : ""
                }`}
                rows={5}
                required
              />
              {errors.longDescription && (
                <div className="list-product-input-error">
                  {errors.longDescription}
                </div>
              )}
            </div>
          </div>

          <div className="list-product-form-row two-column">
            <div className="list-product-form-group">
              <Select
                label="Category"
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
            <div className="list-product-form-group">
              <div className="list-product-checkbox-container">
                <label className="list-product-checkbox-label">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                  />
                  <span>Product Available</span>
                </label>
              </div>
            </div>
          </div>

          <div className="list-product-form-row two-column">
            <div className="list-product-form-group">
              <Input
                label="Current Price ($)"
                type="number"
                name="new_price"
                value={formData.new_price}
                onChange={handleChange}
                error={errors.new_price}
                min={0}
                step={0.01}
                required
              />
            </div>
            <div className="list-product-form-group">
              <Input
                label="Original Price ($)"
                type="number"
                name="old_price"
                value={formData.old_price}
                onChange={handleChange}
                error={errors.old_price}
                min={0}
                step={0.01}
                required
              />
            </div>
          </div>

          <div className="list-product-form-row">
            <div className="list-product-form-group">
              <label>Sizes</label>
              <div className="list-product-checkbox-group">
                {sizeOptions.map((option) => (
                  <label
                    key={option.value}
                    className="list-product-checkbox-label"
                  >
                    <input
                      type="checkbox"
                      name="sizes"
                      value={option.value}
                      checked={formData.sizes.includes(option.value)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          sizes: isChecked
                            ? [...prev.sizes, option.value]
                            : prev.sizes.filter(
                                (size) => size !== option.value
                              ),
                        }));
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="list-product-form-row">
            <div className="list-product-form-group">
              <label>Product Tags</label>
              <div className="list-product-checkbox-group">
                {tagOptions.map((option) => (
                  <label
                    key={option.value}
                    className="list-product-checkbox-label"
                  >
                    <input
                      type="checkbox"
                      name="tags"
                      value={option.value}
                      checked={formData.tags.includes(option.value)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          tags: isChecked
                            ? [...prev.tags, option.value]
                            : prev.tags.filter((tag) => tag !== option.value),
                        }));
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="list-product-form-row">
            <div className="list-product-form-group">
              <label>Product Type</label>
              <div className="list-product-checkbox-group">
                {typeOptions.map((option) => (
                  <label
                    key={option.value}
                    className="list-product-checkbox-label"
                  >
                    <input
                      type="checkbox"
                      name="types"
                      value={option.value}
                      checked={formData.types.includes(option.value)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          types: isChecked
                            ? [...prev.types, option.value]
                            : prev.types.filter(
                                (type) => type !== option.value
                              ),
                        }));
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Image management section - placeholder for now */}
          <div className="list-product-form-row">
            <div className="list-product-form-group">
              <label>Product Images</label>
              <div className="list-product-image-preview-container">
                {formData.images &&
                  formData.images.map((image, index) => (
                    <div key={index} className="list-product-image-preview">
                      <img
                        src={getImageUrl(image)}
                        alt={`Product ${index + 1}`}
                      />
                      <div className="list-product-image-preview-actions">
                        <button
                          type="button"
                          className="list-product-image-action-btn"
                          onClick={() => {
                            // Handle set as main image
                            setFormData((prev) => ({
                              ...prev,
                              mainImageIndex: index,
                            }));
                          }}
                          disabled={formData.mainImageIndex === index}
                        >
                          {formData.mainImageIndex === index
                            ? "Main Image"
                            : "Set as Main"}
                        </button>
                        <button
                          type="button"
                          className="list-product-image-action-btn remove"
                          onClick={() => {
                            // Handle remove image
                            const newImages = [...formData.images];
                            newImages.splice(index, 1);

                            let newMainIndex = formData.mainImageIndex;
                            if (index === formData.mainImageIndex) {
                              newMainIndex = 0; // Reset to first image if main was removed
                            } else if (index < formData.mainImageIndex) {
                              newMainIndex--; // Adjust index if removed image was before main
                            }

                            setFormData((prev) => ({
                              ...prev,
                              images: newImages,
                              mainImageIndex: newMainIndex,
                            }));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                {(!formData.images || formData.images.length < 5) && (
                  <div className="list-product-image-upload-placeholder">
                    <span>Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        // This is a simplified placeholder - would need to implement file upload
                        console.log("File selected:", e.target.files[0]);
                        // In a real implementation, you would upload the file and add the URL to formData.images
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="list-product-image-help-text">
                You can upload up to 5 images. The first image will be used as
                the main product image.
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ListProductEditModal;
