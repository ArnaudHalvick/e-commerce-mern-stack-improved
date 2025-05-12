import { useState, useCallback, useEffect } from "react";
import productsService from "../../../api/services/products";
import { useToast } from "../../../components/errorHandling/toast/hooks/useToast";

const useGalleryImages = (isOpen) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await productsService.getAllUploadedImages();
      if (response && response.data) {
        setImages(response.data);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      showToast({
        type: "error",
        message: `Failed to load images: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Fetch all images when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen, fetchImages]);

  return { images, isLoading, fetchImages };
};

export default useGalleryImages;
