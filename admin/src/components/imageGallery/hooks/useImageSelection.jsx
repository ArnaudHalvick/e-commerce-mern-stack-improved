import { useState, useEffect } from "react";
import { useToast } from "../../../components/errorHandling/toast/hooks/useToast";

const useImageSelection = (isOpen, maxSelect) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const { showToast } = useToast();

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedImages([]);
    }
  }, [isOpen]);

  const handleImageClick = (imagePath) => {
    setSelectedImages((prev) => {
      // If already selected, remove it
      if (prev.includes(imagePath)) {
        return prev.filter((path) => path !== imagePath);
      }

      // If max selection reached, show error toast
      if (prev.length >= maxSelect) {
        showToast({
          type: "error",
          message: `You can only select up to ${maxSelect} images`,
        });
        return prev;
      }

      // Add to selection
      return [...prev, imagePath];
    });
  };

  return {
    selectedImages,
    handleImageClick,
  };
};

export default useImageSelection;
