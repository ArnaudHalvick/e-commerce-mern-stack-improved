import { useState } from "react";
import { useToast } from "../../errorHandling/toast/hooks/useToast";
import productsService from "../../../api/services/products";

const useImageUpload = (formData, handleImageChange) => {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [newlyUploadedImages, setNewlyUploadedImages] = useState([]);

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

        handleImageChange(newImages);

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

  const resetImageUpload = () => {
    setNewlyUploadedImages([]);
  };

  return {
    isUploading,
    newlyUploadedImages,
    handleImageUpload,
    cleanupUploadedImages,
    resetImageUpload,
  };
};

export default useImageUpload;
