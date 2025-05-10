# Image Gallery Components

## Overview

This directory contains reusable components for managing product image galleries in the admin panel. These components handle all aspects of product image management including displaying, uploading, selecting, and organizing product images.

## Components

### ImageGalleryDisplay

A versatile component for displaying and managing a set of product images with the following capabilities:

- Viewing existing product images in a grid layout
- Setting the main/primary product image
- Removing images from a product
- Uploading new images via file input
- Opening a modal to select from existing uploaded images

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

A modal dialog for selecting from previously uploaded images in the system. It displays a grid of all available images that aren't already selected and allows users to choose multiple images to add to their product.

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

## Features

### Responsive Grid Layout

- Both components use CSS Grid to create a responsive layout that adapts to different screen sizes
- Images maintain proper aspect ratio and scale appropriately

### Main Image Selection

- Users can click the "Set as Main" button to select the primary product image
- The main image is visually distinguished with a highlighted border

### Image Upload

- Direct file input for uploading new images
- Progress indicator during upload
- Error handling for failed uploads

### Image Selection from Library

- Modal dialog shows all available images
- Supports multi-select with maximum limit
- Visual selection indicators
- Pagination for large image libraries

### Image Removal

- Each image has a remove button
- Confirmation before removal
- Cleanup of unused images on the server

## API Integration

The components integrate with the products API service to:

1. Fetch all uploaded images
2. Upload new images
3. Delete images that aren't saved with products

The components use the getImageUrl utility function to correctly format image URLs from relative paths.

## Usage in Other Components

These image gallery components are primarily used in:

1. **ProductEditModal**: For managing images when creating/editing products
2. **Product Detail Views**: For displaying product images in admin detail views

## Styling

The components include their own CSS files with:

- Responsive grid layouts
- Hover effects for interactive elements
- Loading state indicators
- Consistent styling with the admin theme

## Error Handling

Both components include comprehensive error handling for:

- Image loading failures
- Upload errors
- API connection issues
- Validation errors (too many images, wrong file format)
