const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Product routes
router.post("/add-product", productController.addProduct);
router.post("/remove-product", productController.removeProduct);
router.get("/all-products", productController.getAllProducts);
router.get("/newcollection", productController.getNewCollection);
router.get("/featured-women", productController.getFeaturedWomen);

module.exports = router;
