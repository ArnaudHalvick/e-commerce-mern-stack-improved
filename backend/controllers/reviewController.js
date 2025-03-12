const Review = require("../models/Review");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");

// Add a new review (only if user has purchased the product)
const addReview = async (req, res) => {
  try {
    const { userId, productId, rating, content } = req.body;

    // Check if user has purchased the product
    const cart = await Cart.findOne({
      user_id: userId,
      products: { $elemMatch: { product_id: productId } },
      ordered: true, // Only count completed orders
    });

    const verifiedPurchase = !!cart;

    // Allow review even if not purchased (for portfolio purposes), but mark it as non-verified
    const review = new Review({
      user: userId,
      product: productId,
      rating,
      content,
      verifiedPurchase,
    });

    await review.save();

    res.status(201).json({
      success: true,
      review,
      message: "Review added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all reviews for a product with pagination and sorting
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 5, sort = "date-desc" } = req.query;

    console.log(`Fetching reviews for product: ${productId}`);
    console.log(`Query params: page=${page}, limit=${limit}, sort=${sort}`);

    // Calculate skip amount for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case "date-desc":
        sortOption = { date: -1 };
        break;
      case "date-asc":
        sortOption = { date: 1 };
        break;
      case "rating-desc":
        sortOption = { rating: -1 };
        break;
      case "rating-asc":
        sortOption = { rating: 1 };
        break;
      default:
        sortOption = { date: -1 }; // Default to most recent first
    }

    // Check if product exists
    const productExists = await Product.findById(productId);

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Count total reviews for this product
    const totalReviews = await Review.countDocuments({ product: productId });
    console.log(`Total reviews found: ${totalReviews}`);

    // Get paginated and sorted reviews
    const reviews = await Review.find({ product: productId })
      .populate("user", "name") // Only get required user fields, no avatar
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`Reviews fetched: ${reviews.length}`);

    // Calculate total pages
    const totalPages = Math.ceil(totalReviews / parseInt(limit));

    res.json({
      success: true,
      count: totalReviews,
      totalPages,
      currentPage: parseInt(page),
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get a specific review
const getReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId)
      .populate("user", "name")
      .populate("product", "name images id");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, content } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Optional: Check if the user updating is the owner of the review
    // if (review.user.toString() !== req.user.id) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Not authorized to update this review"
    //   });
    // }

    // Update the review
    review.rating = rating || review.rating;
    review.content = content || review.content;

    await review.save();

    res.json({
      success: true,
      review,
      message: "Review updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Optional: Check if the user deleting is the owner of the review
    // if (review.user.toString() !== req.user.id) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Not authorized to delete this review"
    //   });
    // }

    await review.remove();

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Mark a review as helpful - let's keep it simple since we don't have this field
const markReviewHelpful = async (req, res) => {
  try {
    return res.status(501).json({
      success: false,
      message: "Marking reviews as helpful is not yet implemented",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addReview,
  getProductReviews,
  getReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
};
