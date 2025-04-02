import React, { useRef, useCallback, useMemo } from "react";
import { getImageUrl } from "../../../utils/imageUtils";
import "./ImageGallery.css";

/**
 * Component for displaying product images with thumbnails
 *
 * @param {Object} props
 * @param {Array} props.images - Array of image URLs
 * @param {Number} props.selectedImageIndex - Index of currently selected image
 * @param {Function} props.setSelectedImageIndex - Function to update selected image
 * @param {String} props.getBaseUrl - Base URL for fallback images
 */
const ImageGallery = ({
  images,
  selectedImageIndex,
  setSelectedImageIndex,
  getBaseUrl,
}) => {
  const thumbnailsContainerRef = useRef(null);

  // Determine the main image based on the selected image index
  const mainImage = useMemo(() => {
    if (images && images.length > 0) {
      return getImageUrl(images[selectedImageIndex]);
    }
    return getImageUrl("/images/pink-placeholder.png");
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

  return (
    <div className="product-display-left">
      {/* Main image display */}
      <div className="product-display-img">
        <img src={mainImage} alt="" className="product-display-main-img" />
      </div>

      {/* Horizontal thumbnail gallery */}
      <div className="product-display-thumbnails-container">
        <div
          className="product-display-thumbnails"
          ref={thumbnailsContainerRef}
        >
          {images && images.length > 0 ? (
            images.map((img, index) => (
              <img
                key={index}
                src={getImageUrl(img)}
                alt=""
                onClick={() => handleThumbnailClick(index)}
                className={
                  selectedImageIndex === index
                    ? "product-display-thumbnail-img selected-thumbnail"
                    : "product-display-thumbnail-img"
                }
              />
            ))
          ) : (
            <img
              src={getImageUrl("/images/pink-placeholder.png")}
              alt=""
              className="product-display-thumbnail-img"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
