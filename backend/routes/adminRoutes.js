// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { isAuthenticated } = require("../middleware/auth");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImages,
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
// All routes require authentication
router.use(isAuthenticated);

// Get all products
router.get("/products", getAllProducts);

// Get single product
router.get("/products/:id", getProductById);

// Create new product
router.post("/products", createProduct);

// Update product
router.put("/products/:id", updateProduct);

// Delete product
router.delete("/products/:id", deleteProduct);

// Upload product images
router.post(
  "/products/upload",
  upload.array("images", 5), // Allow up to 5 images
  uploadProductImages
);

module.exports = router;
