/**
 * ImageGallery Component Exports
 * Exports all components and hooks for image management
 */

import { ImageGalleryDisplay, ImageGalleryModal } from "./components";
import { useGalleryImages, useImageSelection } from "./hooks";
import "./styles";

// Component exports
export { ImageGalleryDisplay, ImageGalleryModal };

// Hook exports
export { useGalleryImages, useImageSelection };

// Default export for convenience
export default ImageGalleryDisplay;
