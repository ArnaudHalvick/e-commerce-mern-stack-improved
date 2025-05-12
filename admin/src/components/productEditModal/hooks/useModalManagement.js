import { useState, useCallback } from "react";

const useModalManagement = (
  isFormDirty,
  onClose,
  cleanupUploadedImages,
  newlyUploadedImages
) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Handle closing the modal - check for unsaved changes
  const handleModalClose = useCallback(() => {
    if (isFormDirty) {
      setIsConfirmModalOpen(true);
    } else {
      // If there are no unsaved changes but we have uploaded images, clean them up
      if (newlyUploadedImages && newlyUploadedImages.length > 0) {
        cleanupUploadedImages(newlyUploadedImages);
      }
      onClose();
    }
  }, [isFormDirty, onClose, cleanupUploadedImages, newlyUploadedImages]);

  // Confirmation message for discard dialog
  const getConfirmationMessage = useCallback(() => {
    if (newlyUploadedImages && newlyUploadedImages.length > 0) {
      return "You have unsaved changes and newly uploaded images. If you close without saving, these images will be deleted. Are you sure you want to discard your changes?";
    }
    return "You have unsaved changes. Are you sure you want to discard them?";
  }, [newlyUploadedImages]);

  // Confirm discarding changes
  const handleConfirmDiscard = useCallback(() => {
    setIsConfirmModalOpen(false);

    // Clean up any newly uploaded images before closing
    if (newlyUploadedImages && newlyUploadedImages.length > 0) {
      cleanupUploadedImages(newlyUploadedImages);
    }

    onClose();
  }, [onClose, cleanupUploadedImages, newlyUploadedImages]);

  // Cancel discarding changes
  const handleCancelDiscard = useCallback(() => {
    setIsConfirmModalOpen(false);
  }, []);

  return {
    isConfirmModalOpen,
    handleModalClose,
    getConfirmationMessage,
    handleConfirmDiscard,
    handleCancelDiscard,
  };
};

export default useModalManagement;
