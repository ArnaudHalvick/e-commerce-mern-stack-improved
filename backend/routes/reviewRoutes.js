const express = require("express");
const {
  addReview,
  getProductReviews,
  getReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
} = require("../controllers/reviewController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// Public routes - no authentication required
// GET all reviews for a product
router.get("/product/:productId", getProductReviews);

// GET a single review
router.get("/:reviewId", getReview);

// Protected routes - authentication required
// POST a new review
router.post("/", isAuthenticated, addReview);

// PUT update a review
router.put("/:reviewId", isAuthenticated, updateReview);

// DELETE a review
router.delete("/:reviewId", isAuthenticated, deleteReview);

// POST mark a review as helpful
router.post("/:reviewId/helpful", isAuthenticated, markReviewHelpful);

module.exports = router;
