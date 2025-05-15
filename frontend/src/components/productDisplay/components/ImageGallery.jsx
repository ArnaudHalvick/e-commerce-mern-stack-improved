import React, { useRef, useCallback, useMemo } from "react";
import { getProductImageUrl, getPlaceholderImage } from "../utils";

/**
 * Component for displaying product images with thumbnails
 *
 * @param {Object} props
 * @param {Array} props.images - Array of image URLs
 * @param {Number} props.selectedImageIndex - Index of currently selected image
 * @param {Function} props.setSelectedImageIndex - Function to update selected image
 * @param {Number} props.mainImageIndex - Index of the main image from product
 * @returns {JSX.Element} ImageGallery component
 */
const ImageGallery = ({
  images,
  selectedImageIndex,
  setSelectedImageIndex,
  mainImageIndex = 0,
}) => {
  const thumbnailsContainerRef = useRef(null);

  // Determine the main image based on the selected image index
  const mainImage = useMemo(() => {
    if (images && images.length > 0) {
      return getProductImageUrl(images[selectedImageIndex]);
    }
    return getPlaceholderImage();
  }, [images, selectedImageIndex]);

  // Reorder images to always show main image first, but keep the actual array references intact
  const orderedImages = useMemo(() => {
    if (!images || images.length === 0) return [];

    // Create a new array to avoid modifying the original
    const reordered = [...images];

    // If the main image is already at index 0 or invalid, no reordering needed
    if (mainImageIndex === 0 || mainImageIndex >= images.length) {
      return reordered;
    }

    // Move the main image to the front by swapping
    const mainImg = reordered[mainImageIndex];
    reordered.splice(mainImageIndex, 1);
    reordered.unshift(mainImg);

    return reordered;
  }, [images, mainImageIndex]);

  // Get the actual index in the original images array
  const getOriginalIndex = useCallback(
    (reorderedIndex) => {
      if (!images || images.length === 0) return 0;
      if (mainImageIndex === 0 || mainImageIndex >= images.length)
        return reorderedIndex;

      // If we're selecting the first item (main image moved to front)
      if (reorderedIndex === 0) return mainImageIndex;

      // For items after the main image, we need to adjust
      if (reorderedIndex <= mainImageIndex) return reorderedIndex - 1;
      return reorderedIndex;
    },
    [images, mainImageIndex]
  );

  // Scroll thumbnails to center the selected one
  const scrollToSelectedThumbnail = useCallback(() => {
    if (
      thumbnailsContainerRef.current &&
      orderedImages &&
      orderedImages.length > 0
    ) {
      const container = thumbnailsContainerRef.current;
      const thumbnailWidth = 80; // Approximate width of thumbnail + gap

      // Find display index in reordered array
      let displayIndex = 0;
      for (let i = 0; i < orderedImages.length; i++) {
        if (orderedImages[i] === images[selectedImageIndex]) {
          displayIndex = i;
          break;
        }
      }

      const scrollPosition =
        displayIndex * thumbnailWidth -
        container.clientWidth / 2 +
        thumbnailWidth / 2;
      container.scrollTo({ left: scrollPosition, behavior: "smooth" });
    }
  }, [selectedImageIndex, images, orderedImages]);

  // Handle thumbnail click
  const handleThumbnailClick = useCallback(
    (reorderedIndex) => {
      // Convert the reordered index back to the original index
      const originalIndex =
        mainImageIndex === 0
          ? reorderedIndex
          : reorderedIndex === 0
          ? mainImageIndex
          : reorderedIndex <= mainImageIndex
          ? reorderedIndex - 1
          : reorderedIndex;

      setSelectedImageIndex(originalIndex);
      // We'll scroll to the selected thumbnail after the state update
      setTimeout(scrollToSelectedThumbnail, 0);
    },
    [scrollToSelectedThumbnail, setSelectedImageIndex, mainImageIndex]
  );

  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback(
    (e, reorderedIndex) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleThumbnailClick(reorderedIndex);
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
          {orderedImages && orderedImages.length > 0 ? (
            orderedImages.map((img, reorderedIndex) => {
              // Find the original index this image corresponds to
              const imgOriginalIndex = images.findIndex(
                (orgImg) => orgImg === img
              );

              return (
                <img
                  key={reorderedIndex}
                  src={getProductImageUrl(img)}
                  alt={`Product view ${reorderedIndex + 1}`}
                  onClick={() => handleThumbnailClick(reorderedIndex)}
                  onKeyDown={(e) => handleKeyDown(e, reorderedIndex)}
                  tabIndex={0}
                  role="tab"
                  aria-selected={selectedImageIndex === imgOriginalIndex}
                  aria-controls="main-product-image"
                  className={
                    selectedImageIndex === imgOriginalIndex
                      ? "product-display-thumbnail-img product-display-thumbnail-selected"
                      : "product-display-thumbnail-img"
                  }
                />
              );
            })
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
