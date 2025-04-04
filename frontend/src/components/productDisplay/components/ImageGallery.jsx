import React, { useRef, useCallback, useMemo } from "react";
import { getProductImageUrl, getPlaceholderImage } from "../utils";

/**
 * Component for displaying product images with thumbnails
 *
 * @param {Object} props
 * @param {Array} props.images - Array of image URLs
 * @param {Number} props.selectedImageIndex - Index of currently selected image
 * @param {Function} props.setSelectedImageIndex - Function to update selected image
 * @returns {JSX.Element} ImageGallery component
 */
const ImageGallery = ({
  images,
  selectedImageIndex,
  setSelectedImageIndex,
}) => {
  const thumbnailsContainerRef = useRef(null);

  // Determine the main image based on the selected image index
  const mainImage = useMemo(() => {
    if (images && images.length > 0) {
      return getProductImageUrl(images[selectedImageIndex]);
    }
    return getPlaceholderImage();
  }, [images, selectedImageIndex]);

  // Scroll thumbnails to center the selected one
  const scrollToSelectedThumbnail = useCallback(() => {
    if (thumbnailsContainerRef.current && images && images.length > 0) {
      const container = thumbnailsContainerRef.current;
      const thumbnailWidth = 80; // Approximate width of thumbnail + gap
      const scrollPosition =
        selectedImageIndex * thumbnailWidth -
        container.clientWidth / 2 +
        thumbnailWidth / 2;
      container.scrollTo({ left: scrollPosition, behavior: "smooth" });
    }
  }, [selectedImageIndex, images]);

  // Handle thumbnail click
  const handleThumbnailClick = useCallback(
    (index) => {
      setSelectedImageIndex(index);
      // We'll scroll to the selected thumbnail after the state update
      setTimeout(scrollToSelectedThumbnail, 0);
    },
    [scrollToSelectedThumbnail, setSelectedImageIndex]
  );

  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback(
    (e, index) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleThumbnailClick(index);
      }
    },
    [handleThumbnailClick]
  );

  return (
    <div className="product-display-left">
      {/* Main image display */}
      <div className="product-display-img" aria-hidden="true">
        <img
          src={mainImage}
          alt={`Product ${selectedImageIndex + 1}`}
          className="product-display-main-img"
        />
      </div>

      {/* Horizontal thumbnail gallery */}
      <div className="product-display-thumbnails-container">
        <div
          className="product-display-thumbnails"
          ref={thumbnailsContainerRef}
          role="tablist"
          aria-label="Product images"
        >
          {images && images.length > 0 ? (
            images.map((img, index) => (
              <img
                key={index}
                src={getProductImageUrl(img)}
                alt={`Product view ${index + 1}`}
                onClick={() => handleThumbnailClick(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                tabIndex={0}
                role="tab"
                aria-selected={selectedImageIndex === index}
                aria-controls="main-product-image"
                className={
                  selectedImageIndex === index
                    ? "product-display-thumbnail-img product-display-thumbnail-selected"
                    : "product-display-thumbnail-img"
                }
              />
            ))
          ) : (
            <img
              src={getPlaceholderImage()}
              alt="Product placeholder"
              className="product-display-thumbnail-img"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
