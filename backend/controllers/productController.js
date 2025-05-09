// backend/controllers/productController.js

const Product = require("../models/Product");
const catchAsync = require("../utils/common/catchAsync");
const AppError = require("../utils/errors/AppError");

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
        category,
        rating,
        tags,
        types,
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
        category,
        rating,
        tags,
        types,
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
      category: minimalObj.category,
      rating: minimalObj.rating || 0,
      tags: minimalObj.tags || [],
      types: minimalObj.types || [],
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

// Get all products
const getAllProducts = catchAsync(async (req, res, next) => {
  // Check if we should include reviews or just basic info
  const includeReviews = req.query.includeReviews === "true";
  const basicInfo = req.query.basicInfo !== "false";

  // Only show available and non-deleted products to regular users
  let query = {
    deleted: { $ne: true },
    available: true,
  };

  // Only populate reviews if requested
  if (includeReviews) {
    query = query.populate({
      path: "reviews",
      populate: { path: "user", select: "name" },
    });
  }

  let products = await Product.find(query);

  // Format products based on requested detail level
  const formattedProducts = products.map((product) =>
    formatProductForResponse(product, {
      includeReviews,
      basicInfo,
    })
  );

  res.status(200).json({
    success: true,
    count: formattedProducts.length,
    data: formattedProducts,
  });
});

// Get new collection
const getNewCollection = catchAsync(async (req, res, next) => {
  // Determine if reviews should be included and if only basic info is needed
  const includeReviews = req.query.includeReviews === "true";
  const basicInfo = req.query.basicInfo !== "false";

  // Define population options for reviews if requested
  const populateOptions = includeReviews
    ? { path: "reviews", populate: { path: "user", select: "name" } }
    : null;

  // Base filter to exclude deleted products and only show available ones
  const baseFilter = {
    deleted: { $ne: true },
    available: true,
  };

  // Build queries for each category using sort and limit by date
  const womenQuery = Product.find({ ...baseFilter, category: "women" })
    .sort({ date: -1 })
    .limit(4);
  const menQuery = Product.find({ ...baseFilter, category: "men" })
    .sort({ date: -1 })
    .limit(2);
  const kidsQuery = Product.find({ ...baseFilter, category: "kids" })
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
});

// Get featured women's products
const getFeaturedWomen = catchAsync(async (req, res, next) => {
  // Check if we should include reviews or just basic info
  const includeReviews = req.query.includeReviews === "true";
  const basicInfo = req.query.basicInfo !== "false";

  let query = Product.find({
    category: "women",
    rating: { $gte: 3.7 }, // Only products with rating 3.7 or above
    deleted: { $ne: true }, // Filter out deleted products
    available: true, // Only show available products
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
});

// Get products by tag
const getProductsByTag = catchAsync(async (req, res, next) => {
  const { tag } = req.params;
  // Check if we should include reviews or just basic info
  const includeReviews = req.query.includeReviews === "true";
  const basicInfo = req.query.basicInfo !== "false";

  // Filter out deleted and unavailable products
  let query = Product.find({
    tags: tag,
    deleted: { $ne: true },
    available: true,
  });

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
});

// Get products by type
const getProductsByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  // Check if we should include reviews or just basic info
  const includeReviews = req.query.includeReviews === "true";
  const basicInfo = req.query.basicInfo !== "false";

  // Filter out deleted and unavailable products
  let query = Product.find({
    types: type,
    deleted: { $ne: true },
    available: true,
  });

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
});

// Get product by ID
const getProductById = catchAsync(async (req, res, next) => {
  // Only show non-deleted and available products
  const product = await Product.findOne({
    _id: req.params.id,
    deleted: { $ne: true },
    available: true,
  }).populate("reviews");

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.json({
    success: true,
    product: formatProductForResponse(product, { includeReviews: true }),
  });
});

// Get product by slug
const getProductBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  // Check if we should include reviews
  const includeReviews = req.query.includeReviews !== "false"; // Default to true for single product view

  // Only show non-deleted and available products
  let query = {
    slug: slug,
    deleted: { $ne: true },
    available: true,
  };

  let product;

  // Populate reviews if requested
  if (includeReviews) {
    product = await Product.findOne(query).populate({
      path: "reviews",
      populate: { path: "user", select: "name" },
    });
  } else {
    product = await Product.findOne(query);
  }

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Format the product with requested detail level
  const formattedProduct = formatProductForResponse(product, {
    includeReviews,
    basicInfo: false, // Always include full details for single product view
  });

  res.json({
    success: true,
    product: formattedProduct,
  });
});

// Get products by category
const getProductsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;

  // Validate that category is one of the allowed values
  if (!["men", "women", "kids"].includes(category)) {
    return next(
      new AppError("Invalid category. Must be one of: men, women, kids", 400)
    );
  }

  // Check if we should include reviews or just basic info
  const includeReviews = req.query.includeReviews === "true";
  const basicInfo = req.query.basicInfo !== "false";

  // Filter out deleted and unavailable products
  let query = Product.find({
    category: category,
    deleted: { $ne: true },
    available: true,
  });

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
});

// Get related products based on category, sorted by rating and discount
const getRelatedProducts = catchAsync(async (req, res, next) => {
  const { category, productId, productSlug } = req.params;

  // Validate that category is one of the allowed values
  if (!["men", "women", "kids"].includes(category)) {
    return next(
      new AppError("Invalid category. Must be one of: men, women, kids", 400)
    );
  }

  // Check if we should include reviews or just basic info
  const includeReviews = req.query.includeReviews === "true";
  const basicInfo = req.query.basicInfo !== "false";
  const limit = parseInt(req.query.limit) || 4; // Default to 4 related products

  // Build query to find products in the same category, excluding the current product
  let query = {
    category,
    deleted: { $ne: true },
    available: true,
  };

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
});

module.exports = {
  getAllProducts,
  getProductsByTag,
  getProductsByType,
  getProductById,
  getProductBySlug,
  formatProductForClient,
  formatProductForResponse,
  getProductsByCategory,
  getRelatedProducts,
  getNewCollection,
  getFeaturedWomen,
};
