import { useState } from "react";

const useModalManagement = (
  isFormDirty,
  onClose,
  cleanupUploadedImages,
  newlyUploadedImages
) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleModalClose = () => {
    // If there are unsaved changes, show confirmation modal
    if (isFormDirty) {
      setIsConfirmModalOpen(true);
    } else {
      // No changes, just close
      onClose();
    }
  };

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

  return {
    isConfirmModalOpen,
    handleModalClose,
    getConfirmationMessage,
    handleConfirmDiscard,
    handleCancelDiscard,
  };
};

export default useModalManagement;
