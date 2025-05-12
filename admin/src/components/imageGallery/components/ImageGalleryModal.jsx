import React from "react";
import Modal from "../../../components/ui/modal/Modal";
import Button from "../../../components/ui/button/Button";
import { getImageUrl } from "../../../utils/apiUtils";
import { useToast } from "../../../components/errorHandling/toast/hooks/useToast";
import { useGalleryImages, useImageSelection } from "../hooks";
import "../styles/ImageGalleryModal.css";

/**
 * Reusable Modal component for selecting from already uploaded images
 */
const ImageGalleryModal = ({
  isOpen,
  onClose,
  onSelectImages,
  maxSelect = 5,
}) => {
  const { images, isLoading } = useGalleryImages(isOpen);
  const { selectedImages, handleImageClick } = useImageSelection(
    isOpen,
    maxSelect
  );
  const { showToast } = useToast();

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
      size="xl"
      className="admin-image-gallery-modal"
    >
      <Modal.Header onClose={onClose}>
        Select Images ({selectedImages.length}/{maxSelect})
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div className="admin-image-gallery-loading">Loading images...</div>
        ) : images.length === 0 ? (
          <div className="admin-image-gallery-empty">
            No images found. Upload some images first.
          </div>
        ) : (
          <div className="admin-image-gallery-grid">
            {images.map((image, index) => (
              <div
                key={index}
                className={`admin-image-gallery-item ${
                  selectedImages.includes(image) ? "selected" : ""
                }`}
                onClick={() => handleImageClick(image)}
                tabIndex="0"
                aria-label={`Gallery image ${index + 1}${
                  selectedImages.includes(image) ? ", selected" : ""
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleImageClick(image);
                  }
                }}
              >
                <img
                  src={getImageUrl(image)}
                  alt={`Gallery image ${index}`}
                  className="admin-image-gallery-item-image"
                />
                {selectedImages.includes(image) && (
                  <div className="admin-image-gallery-selected-indicator">
                    <span className="admin-image-gallery-indicator-check">
                      ✓
                    </span>
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
