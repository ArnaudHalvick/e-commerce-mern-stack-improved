import React, { useState, useEffect, useCallback } from "react";
import Modal from "../../../components/ui/modal/Modal";
import Button from "../../../components/ui/button/Button";
import productsService from "../../../api/services/products";
import { useToast } from "../../../components/ui/errorHandling/toast/ToastHooks";
import { getImageUrl } from "../../../utils/apiUtils";
import "../styles/ImageGalleryModal.css";

/**
 * Modal for selecting from already uploaded images
 */
const ImageGalleryModal = ({
  isOpen,
  onClose,
  onSelectImages,
  maxSelect = 5,
}) => {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
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

  const handleConfirm = () => {
    if (selectedImages.length === 0) {
      showToast({
        type: "error",
        message: "Please select at least one image",
      });
      return;
    }

    onSelectImages(selectedImages);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      className="image-gallery-modal"
    >
      <Modal.Header onClose={onClose}>
        Select Images ({selectedImages.length}/{maxSelect})
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div className="image-gallery-loading">Loading images...</div>
        ) : images.length === 0 ? (
          <div className="image-gallery-empty">
            No images found. Upload some images first.
          </div>
        ) : (
          <div className="image-gallery-grid">
            {images.map((image, index) => (
              <div
                key={index}
                className={`image-gallery-item ${
                  selectedImages.includes(image) ? "selected" : ""
                }`}
                onClick={() => handleImageClick(image)}
              >
                <img src={getImageUrl(image)} alt={`Gallery image ${index}`} />
                {selectedImages.includes(image) && (
                  <div className="image-gallery-selected-indicator">
                    <span>✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={isLoading || selectedImages.length === 0}
        >
          Add Selected Images
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageGalleryModal;
