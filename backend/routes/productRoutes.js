// backend/routes/productRoutes.js

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Product routes
router.post("/add-product", productController.addProduct);
router.post("/remove-product", productController.removeProduct);
router.get("/all-products", productController.getAllProducts);
router.get("/newcollection", productController.getNewCollection);
router.get("/featured-women", productController.getFeaturedWomen);
router.get("/products/tag/:tag", productController.getProductsByTag);
router.get("/products/type/:type", productController.getProductsByType);
router.get(
  "/products/category/:category",
  productController.getProductsByCategory
);
router.get("/product/slug/:slug", productController.getProductBySlug);
router.get("/product/:id", productController.getProductById);
router.get(
  "/related-products/:category/:productId?/:productSlug?",
  productController.getRelatedProducts
);

module.exports = router;
