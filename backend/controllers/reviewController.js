const Review = require("../models/Review");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

// Add a new review (only if user has purchased the product)
const addReview = async (req, res) => {
  try {
    const { userId, productId, rating, title, content } = req.body;

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
      title,
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

// Get all reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name avatar") // Only get required user fields
      .sort({ date: -1 }); // Most recent first

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get a specific review
const getReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId)
      .populate("user", "name avatar")
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
    const { rating, title, content } = req.body;

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
    review.title = title || review.title;
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

// Mark a review as helpful
const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user has already marked this review as helpful
    const alreadyMarked = review.helpful.users.includes(userId);

    if (alreadyMarked) {
      // Remove the user's helpful mark
      review.helpful.users = review.helpful.users.filter(
        (id) => id.toString() !== userId.toString()
      );
      review.helpful.count -= 1;
    } else {
      // Add the user's helpful mark
      review.helpful.users.push(userId);
      review.helpful.count += 1;
    }

    await review.save();

    res.json({
      success: true,
      helpful: review.helpful,
      message: alreadyMarked
        ? "Helpful mark removed successfully"
        : "Review marked as helpful successfully",
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
