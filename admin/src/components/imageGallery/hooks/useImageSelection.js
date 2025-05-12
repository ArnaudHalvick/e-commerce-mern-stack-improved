import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../errorHandling/toast/hooks/useToast";

/**
 * Hook for managing image selection in the gallery
 * @param {boolean} isModalOpen - Whether the gallery modal is open
 * @param {number} maxSelect - Maximum number of images that can be selected
 * @returns {Object} Image selection state and handlers
 */
const useImageSelection = (isModalOpen, maxSelect) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const { showToast } = useToast();

  // Reset selection when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setSelectedImages([]);
    }
  }, [isModalOpen]);

  const handleImageClick = useCallback(
    (imagePath) => {
      setSelectedImages((prev) => {
        // If image is already selected, remove it
        if (prev.includes(imagePath)) {
          return prev.filter((img) => img !== imagePath);
        }

        // Otherwise, add it if we haven't reached the max
        if (prev.length < maxSelect) {
          return [...prev, imagePath];
        }

        // Show a warning if trying to select too many images
        showToast({
          type: "warning",
          message: `You can only select up to ${maxSelect} image${
            maxSelect === 1 ? "" : "s"
          }`,
        });
        return prev;
      });
    },
    [maxSelect, showToast]
  );

  return {
    selectedImages,
    handleImageClick,
  };
};

export default useImageSelection;
