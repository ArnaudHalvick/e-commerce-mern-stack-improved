import { useState, useEffect } from "react";
import productsService from "../../../api/services/products";
import { useToast } from "../../errorHandling/toast/hooks/useToast";

/**
 * Hook for fetching and managing image gallery data
 * @param {boolean} isModalOpen - Whether the gallery modal is open
 * @returns {Object} Image gallery state and handlers
 */
const useGalleryImages = (isModalOpen) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // Fetch images when the modal opens
  useEffect(() => {
    if (!isModalOpen) return;

    const fetchImages = async () => {
      setIsLoading(true);
      try {
        const response = await productsService.getAllUploadedImages();
        setImages(response.images || []);
      } catch (error) {
        console.error("Error fetching gallery images:", error);
        showToast({
          type: "error",
          message: `Failed to load images: ${error.message}`,
        });
        setImages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [isModalOpen, showToast]);

  return {
    images,
    isLoading,
  };
};

export default useGalleryImages;
