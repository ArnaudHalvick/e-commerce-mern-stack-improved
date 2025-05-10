# Image Gallery Components

This directory contains reusable components for managing product image galleries in the admin panel.

## Components

### ImageGalleryDisplay

A component for displaying and managing a set of product images, including:

- Viewing existing images
- Setting a main image
- Removing images
- Uploading new images
- Selecting from existing uploaded images

```jsx
import { ImageGalleryDisplay } from "../components/imageGallery";

// Usage example
<ImageGalleryDisplay
  images={product.images}
  onImagesChange={handleImagesChange}
  onMainImageChange={handleMainImageChange}
  mainImageIndex={product.mainImageIndex}
  maxImages={5}
  onImageUpload={handleImageUpload}
  isUploading={isUploading}
  onCleanupImages={cleanupImages}
  newlyUploadedImages={newlyUploadedImages}
/>;
```

#### Props

| Prop                | Type     | Required | Default | Description                                                     |
| ------------------- | -------- | -------- | ------- | --------------------------------------------------------------- |
| images              | Array    | Yes      | []      | Array of image paths                                            |
| onImagesChange      | Function | Yes      | -       | Callback when images change: (newImages) => void                |
| onMainImageChange   | Function | Yes      | -       | Callback when main image changes: (newIndex) => void            |
| mainImageIndex      | Number   | No       | 0       | Index of the main image                                         |
| maxImages           | Number   | No       | 5       | Maximum number of images allowed                                |
| onImageUpload       | Function | Yes      | -       | Callback when images are uploaded via input: (event) => void    |
| isUploading         | Boolean  | No       | false   | Whether images are currently being uploaded                     |
| onCleanupImages     | Function | No       | -       | Callback to clean up images on the server: (imagePaths) => void |
| newlyUploadedImages | Array    | No       | []      | Array of newly uploaded image paths that may need cleanup       |

### ImageGalleryModal

A modal dialog for selecting from previously uploaded images.

```jsx
import { ImageGalleryModal } from "../components/imageGallery";

// Usage example
<ImageGalleryModal
  isOpen={isGalleryModalOpen}
  onClose={handleCloseModal}
  onSelectImages={handleSelectImages}
  maxSelect={5}
/>;
```

#### Props

| Prop           | Type     | Required | Default | Description                                                     |
| -------------- | -------- | -------- | ------- | --------------------------------------------------------------- |
| isOpen         | Boolean  | Yes      | -       | Whether the modal is visible                                    |
| onClose        | Function | Yes      | -       | Callback when modal is closed                                   |
| onSelectImages | Function | Yes      | -       | Callback when images are selected: (selectedImagePaths) => void |
| maxSelect      | Number   | No       | 5       | Maximum number of images that can be selected                   |

## API Integration

The components integrate with the products API service to:

1. Fetch all uploaded images
2. Upload new images
3. Delete images that aren't saved with products

The components use the getImageUrl utility function to correctly format image URLs from relative paths.
