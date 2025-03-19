const Review = require("../models/Review");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// Add a new review (only if user has purchased the product)
const addReview = catchAsync(async (req, res, next) => {
  const { userId, productId, rating, content } = req.body;

  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }

  if (!rating) {
    return next(new AppError("Rating is required", 400));
  }

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

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
});

// Get all reviews for a product with pagination and sorting
const getProductReviews = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const {
    page = 1,
    limit = 5,
    sortBy = "createdAt",
    sortOrder = "desc",
    verified = "all",
  } = req.query;

  if (!productId) {
    return next(new AppError("Product ID is required", 400));
  }

  // Calculate skip value for pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Build query
  let query = { product: productId };

  // Filter by verified purchase if requested
  if (verified !== "all") {
    query.verifiedPurchase = verified === "true";
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Count total reviews matching the query
  const totalReviews = await Review.countDocuments(query);

  // Fetch reviews with pagination, sorting, and populate user data
  const reviews = await Review.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("user", "name avatar");

  // Calculate average rating
  const ratingSum = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);

  const averageRating = ratingSum.length > 0 ? ratingSum[0].avgRating : 0;

  // Get rating distribution (count of 1-star, 2-star, etc.)
  const ratingDistribution = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Build the distribution object with all ratings from 1-5
  const distribution = {};
  for (let i = 1; i <= 5; i++) {
    const ratingObj = ratingDistribution.find((r) => r._id === i);
    distribution[i] = ratingObj ? ratingObj.count : 0;
  }

  // Send response with reviews, pagination info, and rating data
  res.status(200).json({
    success: true,
    reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalReviews,
      totalPages: Math.ceil(totalReviews / parseInt(limit)),
    },
    ratings: {
      average: averageRating,
      distribution,
    },
  });
});

// Get a single review
const getReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findById(id).populate("user", "name avatar");

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  res.status(200).json({
    success: true,
    review,
  });
});

// Update a review
const updateReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { rating, content } = req.body;

  const review = await Review.findById(id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  // Check if the user is the owner of the review
  if (review.user.toString() !== req.user.id && !req.user.isAdmin) {
    return next(new AppError("Not authorized to update this review", 403));
  }

  // Update fields if provided
  if (rating !== undefined) review.rating = rating;
  if (content !== undefined) review.content = content;

  // Save the updated review
  review.edited = true;
  review.editedAt = Date.now();
  await review.save();

  // If the rating was updated, recalculate the product's average rating
  if (rating !== undefined) {
    const ratingSum = await Review.aggregate([
      { $match: { product: review.product } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    const averageRating = ratingSum.length > 0 ? ratingSum[0].avgRating : 0;

    // Update the product with the new rating
    await Product.findByIdAndUpdate(review.product, {
      rating: averageRating,
    });
  }

  res.status(200).json({
    success: true,
    review,
    message: "Review updated successfully",
  });
});

// Delete a review
const deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  // Check if the user is the owner of the review or an admin
  if (review.user.toString() !== req.user.id && !req.user.isAdmin) {
    return next(new AppError("Not authorized to delete this review", 403));
  }

  // Store the product ID for rating recalculation
  const productId = review.product;

  // Delete the review
  await Review.findByIdAndDelete(id);

  // Recalculate the product's average rating
  const ratingSum = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);

  const averageRating = ratingSum.length > 0 ? ratingSum[0].avgRating : 0;

  // Update the product with the new rating
  await Product.findByIdAndUpdate(productId, {
    rating: averageRating,
  });

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

// Mark a review as helpful
const markReviewHelpful = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const review = await Review.findById(id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  // Check if the user has already marked this review as helpful
  const alreadyMarked = review.helpfulVotes.includes(userId);

  if (alreadyMarked) {
    // If already marked, remove the vote
    review.helpfulVotes = review.helpfulVotes.filter(
      (id) => id.toString() !== userId
    );
  } else {
    // Otherwise, add the vote
    review.helpfulVotes.push(userId);
  }

  await review.save();

  res.status(200).json({
    success: true,
    helpful: !alreadyMarked,
    helpfulCount: review.helpfulVotes.length,
    message: alreadyMarked
      ? "Helpful vote removed"
      : "Review marked as helpful",
  });
});

module.exports = {
  addReview,
  getProductReviews,
  getReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
};
