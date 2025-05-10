import React, { useState, useEffect } from "react";
import Modal from "../ui/modal/Modal";
import Button from "../ui/button/Button";
import Input from "../ui/input/Input";
import Select from "../ui/select/Select";
import { useToast } from "../ui/errorHandling/toast/ToastHooks";
import productsService from "../../api/services/products";
import { ImageGalleryDisplay } from "../imageGallery";
import "./ProductEditModal.css";

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="small"
      closeOnOverlayClick={false}
      closeOnEscape={false}
      centered={true}
      className="product-edit-modal-confirm-discard"
    >
      <Modal.Header
        onClose={onCancel}
        className="product-edit-modal-confirm-discard-header"
      >
        {title}
      </Modal.Header>
      <Modal.Body>
        <p className="product-edit-modal-confirm-discard-text">{message}</p>
      </Modal.Body>
      <Modal.Footer className="product-edit-modal-confirm-discard-footer">
        <Button variant="secondary" onClick={onCancel}>
          No, Keep Editing
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Yes, Discard Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const ProductEditModal = ({ isOpen, onClose, product, onSave, title }) => {
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
    images: [],
    mainImageIndex: 0,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [newlyUploadedImages, setNewlyUploadedImages] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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
      const hasDiscountValue = product.new_price > 0;
      const productData = {
        ...product,
        // Convert array fields to match the expected format of the Select component
        sizes: product.sizes || [],
        tags: product.tags || [],
        types: product.types || [],
        images: product.images || [],
        mainImageIndex: product.mainImageIndex || 0,
      };

      setFormData(productData);
      // Store the original form data for potential cancellation
      setOriginalFormData(JSON.parse(JSON.stringify(productData)));
      setHasDiscount(hasDiscountValue);
      // Reset newly uploaded images when opening a new product
      setNewlyUploadedImages([]);
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
    if (formData.old_price <= 0)
      newErrors.old_price = "Original price must be greater than 0";
    if (hasDiscount && formData.new_price <= 0)
      newErrors.new_price = "Discounted price must be greater than 0";

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

  const handleDiscountChange = (e) => {
    const { checked } = e.target;
    setHasDiscount(checked);

    // Reset new_price to 0 when discount is disabled
    if (!checked) {
      setFormData((prev) => ({
        ...prev,
        new_price: 0,
      }));
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
      // If discount is disabled, ensure new_price is set to 0
      const updatedData = {
        ...formData,
        _id: product?._id, // Ensure ID is preserved if it exists
        new_price: hasDiscount ? formData.new_price : 0,
      };

      await onSave(updatedData);

      // After successful save, clear the newly uploaded images array
      // as they are now part of the product
      setNewlyUploadedImages([]);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      // Upload the images
      const response = await productsService.uploadProductImages(files);

      if (response && response.data) {
        // Track newly uploaded images for potential cleanup
        const uploadedPaths = response.data;
        setNewlyUploadedImages((prev) => [...prev, ...uploadedPaths]);

        // Update the form data with the new images
        const newImages = [...formData.images, ...uploadedPaths];

        setFormData((prev) => ({
          ...prev,
          images: newImages,
          // If this is the first image, set it as main
          mainImageIndex: prev.images.length === 0 ? 0 : prev.mainImageIndex,
        }));

        showToast({
          type: "success",
          message: `Successfully uploaded ${response.count} image(s)`,
        });
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      showToast({
        type: "error",
        message: `Failed to upload images: ${error.message}`,
      });
    } finally {
      setIsUploading(false);
      // Reset the input field to allow uploading the same file again
      e.target.value = null;
    }
  };

  const cleanupUploadedImages = async (imagesToDelete) => {
    if (imagesToDelete.length === 0) return;

    try {
      await productsService.deleteUploadedImages(imagesToDelete);
    } catch (error) {
      console.error("Error cleaning up images:", error);
    }
  };

  const handleModalClose = () => {
    // If there are unsaved changes, show confirmation modal
    if (JSON.stringify(formData) !== JSON.stringify(originalFormData)) {
      setIsConfirmModalOpen(true);
    } else {
      // No changes, just close
      onClose();
    }
  };

  // Generate the confirmation message based on what changes would be discarded
  const getConfirmationMessage = () => {
    let message =
      "You have unsaved changes. Are you sure you want to discard them?";

    // Add information about newly uploaded images
    if (newlyUploadedImages.length > 0) {
      message += ` ${newlyUploadedImages.length} newly uploaded image${
        newlyUploadedImages.length > 1 ? "s" : ""
      } will be deleted.`;
    }

    return message;
  };

  const handleConfirmDiscard = () => {
    // User confirmed discarding changes, so clean up any images that were uploaded
    if (newlyUploadedImages.length > 0) {
      cleanupUploadedImages(newlyUploadedImages);
    }

    // Close confirmation modal and main edit modal
    setIsConfirmModalOpen(false);
    onClose();
  };

  const handleCancelDiscard = () => {
    // User canceled discarding changes, just close the confirmation modal
    setIsConfirmModalOpen(false);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleModalClose} size="large">
        <Modal.Header onClose={handleModalClose}>
          {title ||
            `${product ? "Edit" : "Add"} Product: ${product?.name || ""}`}
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={handleSubmit} className="product-edit-modal-form">
            <div className="product-edit-modal-form-row">
              <div className="product-edit-modal-form-group">
                <label className="product-edit-modal-form-label">
                  Product Name
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
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
                />
                {errors.longDescription && (
                  <div className="product-edit-modal-input-error">
                    {errors.longDescription}
                  </div>
                )}
              </div>
            </div>

            <div className="product-edit-modal-form-row two-column">
              <div className="product-edit-modal-form-group">
                <label className="product-edit-modal-form-label">
                  Category
                </label>
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
                        className="product-edit-modal-checkbox-input"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="product-edit-modal-form-row">
              <div className="product-edit-modal-form-group">
                <label className="product-edit-modal-form-label">
                  Product Tags
                </label>
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
                          const isChecked = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            tags: isChecked
                              ? [...prev.tags, option.value]
                              : prev.tags.filter((tag) => tag !== option.value),
                          }));
                        }}
                        className="product-edit-modal-checkbox-input"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="product-edit-modal-form-row">
              <div className="product-edit-modal-form-group">
                <label className="product-edit-modal-form-label">
                  Product Type
                </label>
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
                        className="product-edit-modal-checkbox-input"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Image management section */}
            <div className="product-edit-modal-form-row">
              <div className="product-edit-modal-form-group">
                <label className="product-edit-modal-form-label">
                  Product Images
                </label>
                <ImageGalleryDisplay
                  images={formData.images || []}
                  mainImageIndex={formData.mainImageIndex}
                  onImagesChange={(newImages) =>
                    setFormData((prev) => ({ ...prev, images: newImages }))
                  }
                  onMainImageChange={(newIndex) =>
                    setFormData((prev) => ({
                      ...prev,
                      mainImageIndex: newIndex,
                    }))
                  }
                  onCleanupImages={cleanupUploadedImages}
                  newlyUploadedImages={newlyUploadedImages}
                  onImageUpload={handleImageUpload}
                  isUploading={isUploading}
                  maxImages={5}
                />
              </div>
            </div>
          </form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleModalClose}
            disabled={isSubmitting || isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation modal for discarding changes */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelDiscard}
        title="Discard Changes"
        message={getConfirmationMessage()}
      />
    </>
  );
};

export default ProductEditModal;
