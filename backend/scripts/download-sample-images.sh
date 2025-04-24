#!/bin/bash

# Script to download sample product images and placeholders
# Usage: bash download-sample-images.sh

set -e

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
IMAGE_DIR="$BACKEND_DIR/upload/images"
PLACEHOLDER_DIR="$IMAGE_DIR/placeholders"

echo "Creating image directories..."
mkdir -p "$IMAGE_DIR"
mkdir -p "$PLACEHOLDER_DIR"

# Function to download an image if it doesn't exist
download_image() {
  local url="$1"
  local dest="$2"
  
  if [ ! -f "$dest" ]; then
    echo "Downloading: $url -> $dest"
    curl -s "$url" --output "$dest"
    if [ $? -eq 0 ]; then
      echo "✅ Downloaded successfully!"
    else
      echo "❌ Failed to download $url"
    fi
  else
    echo "Image already exists: $dest (skipping)"
  fi
}

echo "Downloading placeholder images..."
download_image "https://placehold.co/400x400?text=Placeholder+Small" "$PLACEHOLDER_DIR/product-placeholder-small.png"
download_image "https://placehold.co/600x600?text=Placeholder+Medium" "$PLACEHOLDER_DIR/product-placeholder-medium.png"
download_image "https://placehold.co/800x800?text=Placeholder+Large" "$PLACEHOLDER_DIR/product-placeholder-large.png"

echo "Downloading sample product images..."
# Use a more reliable image service for sample products
for i in $(seq 1 12); do
  download_image "https://placehold.co/600x800?text=Product+$i" "$IMAGE_DIR/product_$i.png"
done

echo "Image download complete! Total files:"
find "$IMAGE_DIR" -type f | wc -l

echo "Image directory contents:"
ls -la "$IMAGE_DIR"
echo "Placeholder directory contents:"
ls -la "$PLACEHOLDER_DIR"
