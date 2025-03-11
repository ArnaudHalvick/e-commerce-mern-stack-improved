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

    const product = new Product({
      id: id,
      image: req.body.image,
      name: req.body.name,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
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
    let products = await Product.find();
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
    let products = await Product.find();
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
    let products = await Product.find({ category: "women" });
    let featuredWomen = products.slice(-8);
    res.send(featuredWomen);
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
};
