import React, { useState } from "react";
import { getImageUrl } from "../../../utils/apiUtils";
import Button from "../../ui/button/Button";
import ImageGalleryModal from "./ImageGalleryModal";
import "../styles/ImageGalleryDisplay.css";

/**
 * Reusable component for displaying and managing product images
 */
const ImageGalleryDisplay = ({
  images = [],
  onImagesChange,
  onMainImageChange,
  mainImageIndex = 0,
  maxImages = 5,
  onImageUpload,
  isUploading = false,
  onCleanupImages,
  newlyUploadedImages = [],
}) => {
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  const handleRemoveImage = (index) => {
    const imageToRemove = images[index];
    const newImages = [...images];
    newImages.splice(index, 1);

    // Adjust main image index if necessary
    let newMainIndex = mainImageIndex;
    if (index === mainImageIndex) {
      newMainIndex = newImages.length > 0 ? 0 : -1; // Reset to first image if main was removed
    } else if (index < mainImageIndex) {
      newMainIndex--; // Adjust index if removed image was before main
    }

    // Check if the removed image was newly uploaded (if tracking is enabled)
    if (
      newlyUploadedImages &&
      newlyUploadedImages.includes(imageToRemove) &&
      onCleanupImages
    ) {
      onCleanupImages([imageToRemove]);
    }

    onImagesChange(newImages);
    onMainImageChange(newMainIndex);
  };

  const handleSetMainImage = (index) => {
    onMainImageChange(index);
  };

  const handleGalleryImagesSelected = (selectedImages) => {
    // Only proceed if images were actually selected
    if (selectedImages && selectedImages.length > 0) {
      const updatedImages = [...images, ...selectedImages].slice(0, maxImages);
      onImagesChange(updatedImages);
      // If there was no main image before, set first image as main
      if (mainImageIndex === -1 && updatedImages.length > 0) {
        onMainImageChange(0);
      }
    }
  };

  return (
    <div className="admin-image-gallery-display">
      <div className="admin-image-gallery-preview-container">
        {images.map((image, index) => (
          <div key={index} className="admin-image-gallery-preview">
            <img
              src={getImageUrl(image)}
              alt={`Product ${index + 1}`}
              className="admin-image-gallery-preview-image"
            />
            <div className="admin-image-gallery-preview-actions">
              <Button
                type="button"
                size="small"
                variant={mainImageIndex === index ? "primary" : "secondary"}
                onClick={() => handleSetMainImage(index)}
                disabled={mainImageIndex === index}
                className="admin-image-gallery-preview-button"
              >
                {mainImageIndex === index ? "Main Image" : "Set as Main"}
              </Button>
              <Button
                type="button"
                size="small"
                variant="danger"
                onClick={() => handleRemoveImage(index)}
                className="admin-image-gallery-preview-button"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <div className="admin-image-gallery-actions">
            <div className="admin-image-gallery-upload-placeholder">
              {isUploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <span>Upload New</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    disabled={isUploading}
                    multiple
                    className="admin-image-gallery-upload-input"
                  />
                </>
              )}
            </div>
            <div
              className="admin-image-gallery-upload-placeholder"
              onClick={() => setIsGalleryModalOpen(true)}
              tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsGalleryModalOpen(true);
                }
              }}
              aria-label="Select existing images"
            >
              <span>Select Existing</span>
            </div>
          </div>
        )}
      </div>

      {/* Image Gallery modal for selecting existing images */}
      <ImageGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        onSelectImages={handleGalleryImagesSelected}
        maxSelect={maxImages - images.length}
      />
    </div>
  );
};

export default ImageGalleryDisplay;
