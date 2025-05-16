import React, { useRef, useCallback, useState } from "react";
import Modal from "../../ui/modal/Modal";
import Button from "../../ui/button/Button";
import BasicInfoFields from "./BasicInfoFields";
import CategorySection from "./CategorySection";
import PriceSection from "./PriceSection";
import AttributesSection from "./AttributesSection";
import ImageSection from "./ImageSection";
import ConfirmationModal from "./ConfirmationModal";
import useProductForm from "../hooks/useProductForm";
import useImageUpload from "../hooks/useImageUpload";
import useFormValidation from "../hooks/useFormValidation";
import "../styles/common.css";

const ProductEditModal = ({ isOpen, onClose, product, onSave, title }) => {
  // Reference to the form element
  const formRef = useRef(null);

  // Product form state and handlers
  const {
    formData,
    errors,
    hasDiscount,
    isFormDirty,
    isNewProduct,
    validateForm,
    handleChange,
    handleDiscountChange,
    handleArrayFieldChange,
    handleImageChange,
    handleMainImageChange,
    prepareFormDataForSubmission,
    setFormData,
    resetForm,
  } = useProductForm(product);

  // Image upload state and handlers
  const {
    isUploading,
    newlyUploadedImages,
    handleImageUpload,
    cleanupUploadedImages,
    resetImageUpload,
  } = useImageUpload(formData, handleImageChange);

  // Handle successful form submission (explicitly reset the form)
  const handleSuccessfulSubmission = useCallback(
    (result) => {
      // First call the parent's onSave callback
      if (onSave) {
        onSave(result);
      }

      // Reset all form fields to their default values
      resetForm();

      // Reset image upload state
      resetImageUpload();

      // Close the modal
      onClose();
    },
    [onSave, resetForm, resetImageUpload, onClose]
  );

  // Form submission handler
  const { isSubmitting, handleSubmit } = useFormValidation(
    validateForm,
    prepareFormDataForSubmission,
    handleSuccessfulSubmission,
    resetImageUpload,
    isNewProduct
  );

  // Custom submit handler wrapper to ensure ID is included
  const handleFormSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Ensure ID is explicitly set if we're editing
    if (product && product._id && !formData._id) {
      setFormData((prev) => ({
        ...prev,
        _id: product._id,
      }));
      // Allow state update to complete before continuing
      setTimeout(() => handleSubmit(), 0);
    } else {
      handleSubmit(e);
    }
  };

  // Custom modal management with form reset
  const handleModalClose = useCallback(() => {
    if (isFormDirty) {
      // If there are unsaved changes, show confirmation dialog
      setIsConfirmModalOpen(true);
    } else {
      // If no unsaved changes, reset form and close immediately
      resetForm();

      // Reset image upload state
      if (newlyUploadedImages && newlyUploadedImages.length > 0) {
        cleanupUploadedImages(newlyUploadedImages);
        resetImageUpload();
      }

      // Close the modal
      onClose();
    }
  }, [
    isFormDirty,
    onClose,
    resetForm,
    resetImageUpload,
    cleanupUploadedImages,
    newlyUploadedImages,
  ]);

  // Confirm discard changes
  const handleConfirmDiscard = useCallback(() => {
    setIsConfirmModalOpen(false);

    // Reset form fields explicitly
    resetForm();

    // Clean up any newly uploaded images
    if (newlyUploadedImages && newlyUploadedImages.length > 0) {
      cleanupUploadedImages(newlyUploadedImages);
      resetImageUpload();
    }

    // Close the modal
    onClose();
  }, [
    onClose,
    resetForm,
    cleanupUploadedImages,
    resetImageUpload,
    newlyUploadedImages,
  ]);

  // Cancel discard changes
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleCancelDiscard = useCallback(() => {
    setIsConfirmModalOpen(false);
  }, []);

  // Get confirmation message
  const getConfirmationMessage = useCallback(() => {
    if (newlyUploadedImages && newlyUploadedImages.length > 0) {
      return "You have unsaved changes and newly uploaded images. If you close without saving, these images will be deleted. Are you sure you want to discard your changes?";
    }
    return "You have unsaved changes. Are you sure you want to discard them?";
  }, [newlyUploadedImages]);

  // Default title based on whether we're creating or editing
  const modalTitle =
    title ||
    (isNewProduct ? "Add New Product" : `Edit Product: ${product?.name || ""}`);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        size="large"
        closeOnOverlayClick={false}
      >
        <Modal.Header onClose={handleModalClose}>{modalTitle}</Modal.Header>

        <Modal.Body>
          <form
            ref={formRef}
            onSubmit={handleFormSubmit}
            className="product-edit-modal-form"
          >
            {/* Hidden ID field to ensure ID is preserved during form submission */}
            {product && product._id && (
              <input type="hidden" name="_id" value={product._id} />
            )}

            {/* Basic Information */}
            <BasicInfoFields
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />

            {/* Category and Availability */}
            <CategorySection
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />

            {/* Pricing */}
            <PriceSection
              formData={formData}
              errors={errors}
              hasDiscount={hasDiscount}
              handleChange={handleChange}
              handleDiscountChange={handleDiscountChange}
            />

            {/* Attributes (Sizes, Tags, Types) */}
            <AttributesSection
              formData={formData}
              handleArrayFieldChange={handleArrayFieldChange}
              errors={errors}
            />

            {/* Image management section */}
            <ImageSection
              formData={formData}
              handleImageChange={handleImageChange}
              handleMainImageChange={handleMainImageChange}
              handleImageUpload={handleImageUpload}
              cleanupUploadedImages={cleanupUploadedImages}
              newlyUploadedImages={newlyUploadedImages}
              isUploading={isUploading}
              errors={errors}
            />
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
            onClick={handleFormSubmit}
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting
              ? "Saving..."
              : isNewProduct
              ? "Create Product"
              : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation modal for discarding changes */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelDiscard}
        title="Discard Changes?"
        message={getConfirmationMessage()}
      />
    </>
  );
};

export default ProductEditModal;
