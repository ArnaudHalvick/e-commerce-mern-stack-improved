import { useState, useCallback } from "react";
import { useToast } from "../../errorHandling/toast/hooks/useToast";
import productsService from "../../../api/services/products";

const useImageUpload = (formData, handleImageChange) => {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [newlyUploadedImages, setNewlyUploadedImages] = useState([]);

  const handleImageUpload = useCallback(
    async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Check if we're exceeding the maximum allowed images (5)
      const totalImagesAfterUpload = formData.images.length + files.length;
      const maxImages = 5;

      if (totalImagesAfterUpload > maxImages) {
        showToast({
          type: "warning",
          message: `You can only upload a maximum of ${maxImages} images. Please select fewer images.`,
        });
        e.target.value = null;
        return;
      }

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

          handleImageChange(newImages);

          showToast({
            type: "success",
            message: `Successfully uploaded ${uploadedPaths.length} image(s)`,
          });
        }
      } catch (error) {
        showToast({
          type: "error",
          message: `Failed to upload images: ${error.message}`,
        });
      } finally {
        setIsUploading(false);
        // Reset the input field to allow uploading the same file again
        e.target.value = null;
      }
    },
    [formData.images, handleImageChange, showToast]
  );

  const cleanupUploadedImages = useCallback(async (imagesToDelete) => {
    if (!imagesToDelete || imagesToDelete.length === 0) return;

    try {
      await productsService.deleteUploadedImages(imagesToDelete);
    } catch {
      // Don't show toast here since this is a background operation
    }
  }, []);

  // This function cleans up any newly uploaded images if the form is closed without saving
  const cleanupAllNewlyUploadedImages = useCallback(async () => {
    if (newlyUploadedImages.length === 0) return;

    try {
      await cleanupUploadedImages(newlyUploadedImages);
    } catch {
      // Error handling is done in cleanupUploadedImages
    }
  }, [newlyUploadedImages, cleanupUploadedImages]);

  const resetImageUpload = useCallback(() => {
    setNewlyUploadedImages([]);
  }, []);

  return {
    isUploading,
    newlyUploadedImages,
    handleImageUpload,
    cleanupUploadedImages,
    cleanupAllNewlyUploadedImages,
    resetImageUpload,
  };
};

export default useImageUpload;
