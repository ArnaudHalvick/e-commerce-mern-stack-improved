import React, { useEffect, useRef } from "react";
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
import useModalManagement from "../hooks/useModalManagement";
import "../styles/common.css";

const ProductEditModal = ({ isOpen, onClose, product, onSave, title }) => {
  // Reference to the form element
  const formRef = useRef(null);

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log("ProductEditModal opened with product:", {
        hasProduct: !!product,
        productId: product?._id || "none",
        isNewProduct: !product || !product._id,
        productData: product,
      });
    }
  }, [isOpen, product]);

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
  } = useProductForm(product);

  // Debug log form state
  useEffect(() => {
    if (isOpen) {
      // Check for discrepancy between isNewProduct flag and form ID
      if (!isNewProduct && !formData._id && product?._id) {
        console.warn(
          "ID discrepancy detected: Form marked as edit but missing ID"
        );
        // Fix the discrepancy by setting the ID
        setFormData((prev) => ({
          ...prev,
          _id: product._id,
        }));
      }

      console.log("Form state:", {
        isNewProduct,
        formHasId: !!formData._id,
        formDataId: formData._id || "none",
        originalProductId: product?._id || "none",
      });
    }
  }, [isOpen, isNewProduct, formData, product, setFormData]);

  // Image upload state and handlers
  const {
    isUploading,
    newlyUploadedImages,
    handleImageUpload,
    cleanupUploadedImages,
    resetImageUpload,
  } = useImageUpload(formData, handleImageChange);

  // Custom submit handler wrapper to ensure ID is included
  const handleFormSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Ensure ID is explicitly set if we're editing
    if (product && product._id && !formData._id) {
      console.log("Fixing missing ID before submission");
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

  // Form submission handler
  const { isSubmitting, handleSubmit } = useFormValidation(
    validateForm,
    prepareFormDataForSubmission,
    onSave,
    resetImageUpload,
    isNewProduct
  );

  // Modal management handlers
  const {
    isConfirmModalOpen,
    handleModalClose,
    getConfirmationMessage,
    handleConfirmDiscard,
    handleCancelDiscard,
  } = useModalManagement(
    isFormDirty,
    onClose,
    cleanupUploadedImages,
    newlyUploadedImages
  );

  // Default title based on whether we're creating or editing
  const modalTitle =
    title ||
    (isNewProduct ? "Add New Product" : `Edit Product: ${product?.name || ""}`);

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleModalClose} size="large">
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
        title="Discard Changes"
        message={getConfirmationMessage()}
      />
    </>
  );
};

export default ProductEditModal;
