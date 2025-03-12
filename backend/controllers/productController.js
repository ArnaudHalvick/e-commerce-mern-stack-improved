// backend/controllers/productController.js

const Product = require("../models/Product");

// Add a new product
const addProduct = async (req, res) => {
  try {
    let products = await Product.find();
    let id;

    if (products.length > 0) {
      id = products[products.length - 1].id + 1;
    } else {
      id = 1;
    }

    // Set new_price to 0 if not provided or is 0
    const new_price = req.body.new_price || 0;

    const product = new Product({
      id: id,
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
      date: req.body.date,
      available: req.body.available,
    });
    await product.save();
    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Remove a product
const removeProduct = async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({
      success: true,
      name: req.body.name,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    let products = await Product.find().populate({
      path: "reviews",
      populate: { path: "user", select: "name" },
    });
    res.send(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get new collection
const getNewCollection = async (req, res) => {
  try {
    let products = await Product.find().populate({
      path: "reviews",
      populate: { path: "user", select: "name" },
    });
    let newcollection = products.slice(-8);
    res.send(newcollection);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get featured women's products
const getFeaturedWomen = async (req, res) => {
  try {
    let products = await Product.find({
      category: "women",
    }).populate({
      path: "reviews",
      populate: { path: "user", select: "name" },
    });
    let featured_product = products.slice(0, 4);
    res.send(featured_product);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get products by tag
const getProductsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    let products = await Product.find({ tags: tag }).populate({
      path: "reviews",
      populate: { path: "user", select: "name" },
    });
    res.send(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get products by type
const getProductsByType = async (req, res) => {
  try {
    const { type } = req.params;
    let products = await Product.find({ types: type }).populate({
      path: "reviews",
      populate: { path: "user", select: "name" },
    });
    res.send(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Add a new route to get a single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let product = await Product.findById(id).populate({
      path: "reviews",
      populate: { path: "user", select: "name" },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.send(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
  removeProduct,
  getAllProducts,
  getNewCollection,
  getFeaturedWomen,
  getProductsByTag,
  getProductsByType,
  getProductById,
};
