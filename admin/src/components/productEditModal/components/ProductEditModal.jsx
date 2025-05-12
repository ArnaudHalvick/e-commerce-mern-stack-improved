import React from "react";
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
  } = useProductForm(product);

  // Image upload state and handlers
  const {
    isUploading,
    newlyUploadedImages,
    handleImageUpload,
    cleanupUploadedImages,
    resetImageUpload,
  } = useImageUpload(formData, handleImageChange);

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
          <form onSubmit={handleSubmit} className="product-edit-modal-form">
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
            onClick={handleSubmit}
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
