import React from "react";
import { ImageGalleryDisplay } from "../../imageGallery";
import "../styles/common.css";

const ImageSection = ({
  formData,
  handleImageChange,
  handleMainImageChange,
  handleImageUpload,
  cleanupUploadedImages,
  newlyUploadedImages,
  isUploading,
}) => {
  return (
    <div className="product-edit-modal-form-row">
      <div className="product-edit-modal-form-group">
        <label className="product-edit-modal-form-label">Product Images</label>
        <ImageGalleryDisplay
          images={formData.images || []}
          mainImageIndex={formData.mainImageIndex}
          onImagesChange={handleImageChange}
          onMainImageChange={handleMainImageChange}
          onCleanupImages={cleanupUploadedImages}
          newlyUploadedImages={newlyUploadedImages}
          onImageUpload={handleImageUpload}
          isUploading={isUploading}
          maxImages={5}
        />
      </div>
    </div>
  );
};

export default ImageSection;
