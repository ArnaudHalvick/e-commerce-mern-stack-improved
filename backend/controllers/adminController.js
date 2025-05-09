// backend/controllers/adminController.js

const Product = require("../models/Product");
const catchAsync = require("../utils/common/catchAsync");
const AppError = require("../utils/errors/AppError");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

// Helper function to transform product data from MongoDB to proper JSON
const formatProductForResponse = (product) => {
  if (!product) return null;

  // If product is already a plain object (not a mongoose document)
  if (!product.toObject) {
    return product;
  }

  // Convert mongoose document to plain object
  const productObj = product.toObject({ virtuals: true });

  // Ensure _id is properly passed
  if (productObj._id) {
    productObj._id = productObj._id.toString();
  }

  return productObj;
};

/**
 * Create a new product
 * @route POST /api/admin/products
 * @access Private (requires authentication)
 */
const createProduct = catchAsync(async (req, res, next) => {
  // Set new_price to 0 if not provided or is 0
  const new_price = req.body.new_price || 0;

  if (!req.body.name) {
    return next(
      AppError.createAndLogError("Product name is required", 400, {
        providedFields: Object.keys(req.body),
      })
    );
  }

  const product = new Product({
    // Slug will be automatically generated in the model
    images: req.body.images,
    mainImageIndex: req.body.mainImageIndex || 0,
    name: req.body.name,
    shortDescription: req.body.shortDescription,
    longDescription: req.body.longDescription,
    category: req.body.category,
    new_price: new_price,
    old_price: req.body.old_price,
    sizes: req.body.sizes || ["S", "M", "L", "XL", "XXL"],
    tags: req.body.tags || [],
    types: req.body.types || [],
    available: req.body.available !== false, // Default to true
  });

  await product.save();

  res.status(201).json({
    success: true,
    data: formatProductForResponse(product),
  });
});

/**
 * Get all products (admin view with all details)
 * @route GET /api/admin/products
 * @access Private (requires authentication)
 */
const getAllProducts = catchAsync(async (req, res, next) => {
  // Add query param to include or exclude deleted products (default: exclude)
  const includeDeleted = req.query.includeDeleted === "true";
  const onlyDeleted = req.query.onlyDeleted === "true";

  let query = {};

  // Filter products based on deletion status
  if (onlyDeleted) {
    query.deleted = true;
  } else if (!includeDeleted) {
    query.deleted = { $ne: true };
  }

  const products = await Product.find(query);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products.map(formatProductForResponse),
  });
});

/**
 * Get a single product by ID
 * @route GET /api/admin/products/:id
 * @access Private (requires authentication)
 */
const getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      AppError.createAndLogError("Product not found", 404, {
        productId: req.params.id,
      })
    );
  }

  res.status(200).json({
    success: true,
    data: formatProductForResponse(product),
  });
});

/**
 * Update a product
 * @route PUT /api/admin/products/:id
 * @access Private (requires authentication)
 */
const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      AppError.createAndLogError("Product not found", 404, {
        productId: req.params.id,
      })
    );
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: formatProductForResponse(updatedProduct),
  });
});

/**
 * Soft delete a product (mark as deleted)
 * @route DELETE /api/admin/products/:id
 * @access Private (requires authentication)
 */
const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      AppError.createAndLogError("Product not found", 404, {
        productId: req.params.id,
      })
    );
  }

  // Use soft deletion instead of permanent deletion
  await Product.findByIdAndUpdate(req.params.id, {
    deleted: true,
    deletedAt: new Date(),
    available: false, // Also mark as unavailable
  });

  res.status(200).json({
    success: true,
    message: `Product ${product.name} marked as deleted`,
  });
});

/**
 * Restore a deleted product
 * @route POST /api/admin/products/:id/restore
 * @access Private (requires authentication)
 */
const restoreProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      AppError.createAndLogError("Product not found", 404, {
        productId: req.params.id,
      })
    );
  }

  if (!product.deleted) {
    return next(
      AppError.createAndLogError("Product is not deleted", 400, {
        productId: req.params.id,
      })
    );
  }

  await Product.findByIdAndUpdate(req.params.id, {
    deleted: false,
    deletedAt: null,
    // Don't automatically set available to true, leave it as is
  });

  res.status(200).json({
    success: true,
    message: `Product ${product.name} restored successfully`,
  });
});

/**
 * Toggle product availability
 * @route PATCH /api/admin/products/:id/toggle-availability
 * @access Private (requires authentication)
 */
const toggleAvailability = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      AppError.createAndLogError("Product not found", 404, {
        productId: req.params.id,
      })
    );
  }

  // Cannot set a deleted product as available
  if (product.deleted && req.body.available === true) {
    return next(
      AppError.createAndLogError(
        "Cannot make a deleted product available",
        400,
        {
          productId: req.params.id,
        }
      )
    );
  }

  // If available status is provided in the request body, use it
  // Otherwise, toggle the current value
  const newAvailability =
    req.body.available !== undefined ? req.body.available : !product.available;

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { available: newAvailability },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: `Product ${product.name} is now ${
      newAvailability ? "available" : "unavailable"
    }`,
    data: formatProductForResponse(updatedProduct),
  });
});

/**
 * Permanently delete a product (admin only, use with caution)
 * @route DELETE /api/admin/products/:id/permanent
 * @access Private (requires authentication)
 */
const permanentDeleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      AppError.createAndLogError("Product not found", 404, {
        productId: req.params.id,
      })
    );
  }

  // Optionally, delete product images from the file system
  if (product.images && product.images.length > 0) {
    try {
      for (const imagePath of product.images) {
        // Extract filename from the path and create the full path
        const filename = imagePath.split("/").pop();
        const fullPath = path.join(__dirname, "../upload/images", filename);

        // Check if file exists before trying to delete
        if (fs.existsSync(fullPath)) {
          await unlinkAsync(fullPath);
        }
      }
    } catch (error) {
      // Don't fail the deletion if image cleanup fails, just log it
      console.error("Error deleting product images:", error);
    }
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: `Product ${product.name} permanently deleted`,
  });
});

/**
 * Upload product images
 * @route POST /api/admin/products/upload
 * @access Private (requires authentication)
 * Note: This endpoint expects to be used with multer middleware
 */
const uploadProductImages = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(AppError.createAndLogError("No images uploaded", 400));
  }

  // Create array of image paths
  const imagePaths = req.files.map((file) => `/images/${file.filename}`);

  res.status(200).json({
    success: true,
    count: imagePaths.length,
    data: imagePaths,
  });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  restoreProduct,
  toggleAvailability,
  permanentDeleteProduct,
};
