// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { isAdmin } = require("../middleware/auth");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  restoreProduct,
  toggleAvailability,
  permanentDeleteProduct,
  deleteUploadedImages,
  getAllUploadedImages,
} = require("../controllers/adminController");

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../upload/images");
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Product Routes
// All routes require admin authentication
router.use(isAdmin);

// Get all products (includes query params for filtering deleted products)
router.get("/products", getAllProducts);

// Create new product
router.post("/products", createProduct);

// Upload product images - specific routes before dynamic routes
router.post(
  "/products/upload",
  upload.array("images", 5), // Allow up to 5 images
  uploadProductImages
);

// Get all uploaded images
router.get("/products/images", getAllUploadedImages);

// Delete uploaded images - specific routes before dynamic routes
router.delete("/products/images", deleteUploadedImages);

// Get single product - dynamic route with ID
router.get("/products/:id", getProductById);

// Update product - dynamic route with ID
router.put("/products/:id", updateProduct);

// Soft delete product - dynamic route with ID
router.delete("/products/:id", deleteProduct);

// Permanently delete product - dynamic route with ID
router.delete("/products/:id/permanent", permanentDeleteProduct);

// Restore deleted product - dynamic route with ID
router.post("/products/:id/restore", restoreProduct);

// Toggle product availability - dynamic route with ID
router.patch("/products/:id/toggle-availability", toggleAvailability);

module.exports = router;
