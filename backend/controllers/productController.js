// backend/controllers/productController.js

const Product = require("../models/Product");

// Helper function to transform product data from MongoDB to proper JSON
const formatProductForClient = (product) => {
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

// New helper function that allows specifying which fields to include
const formatProductForResponse = (product, options = {}) => {
  if (!product) return null;

  // Default options
  const defaultOptions = {
    includeReviews: false,
    basicInfo: false,
  };

  // Merge provided options with defaults
  const mergedOptions = { ...defaultOptions, ...options };

  // If product is not a mongoose document, return as is or filter fields
  if (!product.toObject) {
    // If we need only basic info, filter fields
    if (mergedOptions.basicInfo) {
      const {
        _id,
        id,
        name,
        slug,
        images,
        mainImageIndex,
        new_price,
        old_price,
        mainImage,
      } = product;
      return {
        _id,
        id,
        name,
        slug,
        images,
        mainImageIndex,
        new_price,
        old_price,
        mainImage,
      };
    }
    return product;
  }

  // Convert to object and decide what to include
  let productObj;

  if (mergedOptions.basicInfo) {
    // Only include essential fields for listing views
    const minimalObj = product.toObject({ virtuals: false });
    productObj = {
      _id: minimalObj._id.toString(),
      id: minimalObj.id,
      name: minimalObj.name,
      slug: minimalObj.slug,
      images: minimalObj.images,
      mainImageIndex: minimalObj.mainImageIndex,
      new_price: minimalObj.new_price,
      old_price: minimalObj.old_price,
    };

    // Add mainImage virtual if it exists
    if (product.mainImage) {
      productObj.mainImage = product.mainImage;
    }

    return productObj;
  }

  // Full object conversion
  productObj = product.toObject({ virtuals: true });

  // Ensure _id is properly passed
  if (productObj._id) {
    productObj._id = productObj._id.toString();
  }

  // Remove reviews if not needed
  if (!mergedOptions.includeReviews && productObj.reviews) {
    delete productObj.reviews;
  }

  return productObj;
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    // Set new_price to 0 if not provided or is 0
    const new_price = req.body.new_price || 0;

    const product = new Product({
      // Slug will be automatically generated by the mongoose-slug-generator
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
      slug: product.slug,
      _id: product._id.toString(),
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
    let product;

    if (req.body.slug) {
      product = await Product.findOneAndDelete({ slug: req.body.slug });
    } else if (req.body._id) {
      product = await Product.findByIdAndDelete(req.body._id);
    } else if (req.body.id) {
      // For backwards compatibility - id could be either a MongoDB _id or a legacy id
      // Try to use it as MongoDB ID first
      try {
        product = await Product.findByIdAndDelete(req.body.id);
      } catch (err) {
        // If that fails, we'll just return product not found below
        console.log("Error trying to find by ID:", err);
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Missing product identifier (slug, _id, or id)",
      });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      name: product.name,
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
    // Check if we should include reviews or just basic info
    const includeReviews = req.query.includeReviews === "true";
    const basicInfo = req.query.basicInfo !== "false";

    let query = Product.find();

    // Only populate reviews if requested
    if (includeReviews) {
      query = query.populate({
        path: "reviews",
        populate: { path: "user", select: "name" },
      });
    }

    let products = await query;

    // Format products with the appropriate level of detail
    const formattedProducts = products.map((product) =>
      formatProductForResponse(product, {
        includeReviews,
        basicInfo,
      })
    );

    res.send(formattedProducts);
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
    // Determine if reviews should be included and if only basic info is needed
    const includeReviews = req.query.includeReviews === "true";
    const basicInfo = req.query.basicInfo !== "false";

    // Define population options for reviews if requested
    const populateOptions = includeReviews
      ? { path: "reviews", populate: { path: "user", select: "name" } }
      : null;

    // Build queries for each category using sort and limit by date
    const womenQuery = Product.find({ category: "women" })
      .sort({ date: -1 })
      .limit(4);
    const menQuery = Product.find({ category: "men" })
      .sort({ date: -1 })
      .limit(2);
    const kidsQuery = Product.find({ category: "kids" })
      .sort({ date: -1 })
      .limit(2);

    // Apply population if reviews are needed
    if (populateOptions) {
      womenQuery.populate(populateOptions);
      menQuery.populate(populateOptions);
      kidsQuery.populate(populateOptions);
    }

    // Execute all three queries concurrently
    const [womenProducts, menProducts, kidsProducts] = await Promise.all([
      womenQuery,
      menQuery,
      kidsQuery,
    ]);

    // Combine results (order: women, then men, then kids)
    const newcollection = [...womenProducts, ...menProducts, ...kidsProducts];

    // Format each product for the response
    const formattedProducts = newcollection.map((product) =>
      formatProductForResponse(product, { includeReviews, basicInfo })
    );

    res.send(formattedProducts);
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
    // Check if we should include reviews or just basic info
    const includeReviews = req.query.includeReviews === "true";
    const basicInfo = req.query.basicInfo !== "false";

    let query = Product.find({
      category: "women",
      rating: { $gte: 3.7 }, // Only products with rating 3.7 or above
    })
      .sort({ createdAt: -1 }) // Sort by latest created date
      .limit(4); // Return a maximum of 4 products

    // Only populate reviews if requested
    if (includeReviews) {
      query = query.populate({
        path: "reviews",
        populate: { path: "user", select: "name" },
      });
    }

    let products = await query;

    // Format products with the appropriate level of detail
    const formattedProducts = products.map((product) =>
      formatProductForResponse(product, {
        includeReviews,
        basicInfo,
      })
    );

    res.send(formattedProducts);
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
    // Check if we should include reviews or just basic info
    const includeReviews = req.query.includeReviews === "true";
    const basicInfo = req.query.basicInfo !== "false";

    let query = Product.find({ tags: tag });

    // Only populate reviews if requested
    if (includeReviews) {
      query = query.populate({
        path: "reviews",
        populate: { path: "user", select: "name" },
      });
    }

    let products = await query;

    // Format products with the appropriate level of detail
    const formattedProducts = products.map((product) =>
      formatProductForResponse(product, {
        includeReviews,
        basicInfo,
      })
    );

    res.send(formattedProducts);
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
    // Check if we should include reviews or just basic info
    const includeReviews = req.query.includeReviews === "true";
    const basicInfo = req.query.basicInfo !== "false";

    let query = Product.find({ types: type });

    // Only populate reviews if requested
    if (includeReviews) {
      query = query.populate({
        path: "reviews",
        populate: { path: "user", select: "name" },
      });
    }

    let products = await query;

    // Format products with the appropriate level of detail
    const formattedProducts = products.map((product) =>
      formatProductForResponse(product, {
        includeReviews,
        basicInfo,
      })
    );

    res.send(formattedProducts);
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
    // Check if we should include reviews
    const includeReviews = req.query.includeReviews !== "false"; // Default to true for single product view

    let query = Product.findById(id);

    // Populate reviews if requested
    if (includeReviews) {
      query = query.populate({
        path: "reviews",
        populate: { path: "user", select: "name" },
      });
    }

    let product = await query;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Format the product with requested detail level
    const formattedProduct = formatProductForResponse(product, {
      includeReviews,
      basicInfo: false, // Always include full details for single product view
    });

    res.send(formattedProduct);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Add a new route to get a single product by slug
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    // Check if we should include reviews
    const includeReviews = req.query.includeReviews !== "false"; // Default to true for single product view

    let query = Product.findOne({ slug });

    // Populate reviews if requested
    if (includeReviews) {
      query = query.populate({
        path: "reviews",
        populate: { path: "user", select: "name" },
      });
    }

    let product = await query;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Format the product with requested detail level
    const formattedProduct = formatProductForResponse(product, {
      includeReviews,
      basicInfo: false, // Always include full details for single product view
    });

    res.send(formattedProduct);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Validate that category is one of the allowed values
    if (!["men", "women", "kids"].includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category. Must be one of: men, women, kids",
      });
    }

    // Check if we should include reviews or just basic info
    const includeReviews = req.query.includeReviews === "true";
    const basicInfo = req.query.basicInfo !== "false";

    let query = Product.find({ category: category });

    // Only populate reviews if requested
    if (includeReviews) {
      query = query.populate({
        path: "reviews",
        populate: { path: "user", select: "name" },
      });
    }

    let products = await query;

    // Format products with the appropriate level of detail
    const formattedProducts = products.map((product) =>
      formatProductForResponse(product, {
        includeReviews,
        basicInfo,
      })
    );

    res.send(formattedProducts);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get related products based on category, sorted by rating and discount
const getRelatedProducts = async (req, res) => {
  try {
    const { category, productId, productSlug } = req.params;

    // Validate that category is one of the allowed values
    if (!["men", "women", "kids"].includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category. Must be one of: men, women, kids",
      });
    }

    // Check if we should include reviews or just basic info
    const includeReviews = req.query.includeReviews === "true";
    const basicInfo = req.query.basicInfo !== "false";
    const limit = parseInt(req.query.limit) || 4; // Default to 4 related products

    // Build query to find products in the same category, excluding the current product
    let query = { category };

    // Exclude the current product from results
    if (productId) {
      query._id = { $ne: productId };
    } else if (productSlug) {
      query.slug = { $ne: productSlug };
    }

    // Find products and sort by rating (descending) and discount amount (descending)
    let productsQuery = Product.find(query)
      .sort({ rating: -1 }) // Sort by rating first (highest first)
      .limit(limit);

    // Only populate reviews if requested
    if (includeReviews) {
      productsQuery = productsQuery.populate({
        path: "reviews",
        populate: { path: "user", select: "name" },
      });
    }

    let products = await productsQuery;

    // Calculate discount amount and sort by it as a secondary criterion
    products = products
      .map((product) => {
        const formattedProduct = formatProductForResponse(product, {
          includeReviews,
          basicInfo,
        });

        // Calculate discount amount
        formattedProduct.discountAmount =
          formattedProduct.old_price -
          (formattedProduct.new_price || formattedProduct.old_price);

        return formattedProduct;
      })
      .sort((a, b) => {
        // If ratings are equal, sort by discount amount
        if (a.rating === b.rating) {
          return b.discountAmount - a.discountAmount;
        }
        return 0; // Keep the original rating-based sort
      })
      .slice(0, limit); // Ensure we only return the requested number of products

    // Remove the temporary discountAmount property before sending response
    products.forEach((product) => {
      delete product.discountAmount;
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

module.exports = {
  addProduct,
  removeProduct,
  getAllProducts,
  getNewCollection,
  getFeaturedWomen,
  getProductsByTag,
  getProductsByType,
  getProductById,
  getProductBySlug,
  formatProductForClient,
  formatProductForResponse,
  getProductsByCategory,
  getRelatedProducts,
};
