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
  errors,
}) => {
  return (
    <div className="product-edit-modal-form-row">
      <div className="product-edit-modal-form-group">
        <label className="product-edit-modal-form-label">Product Images</label>
        <p className="product-edit-modal-form-help">
          Upload or select product images. You can upload up to 5 images.
        </p>
        <ImageGalleryDisplay
          images={formData.images || []}
          mainImageIndex={formData.mainImageIndex || 0}
          onImagesChange={handleImageChange}
          onMainImageChange={handleMainImageChange}
          onCleanupImages={cleanupUploadedImages}
          newlyUploadedImages={newlyUploadedImages}
          onImageUpload={handleImageUpload}
          isUploading={isUploading}
          maxImages={5}
        />
        {errors && errors.images && (
          <div className="admin-input-error-text">{errors.images}</div>
        )}
      </div>
    </div>
  );
};

export default ImageSection;
