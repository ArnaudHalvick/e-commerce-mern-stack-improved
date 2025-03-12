const express = require("express");
const {
  addReview,
  getProductReviews,
  getReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
} = require("../controllers/reviewController");

const router = express.Router();

// POST a new review
router.post("/", addReview);

// GET all reviews for a product
router.get("/product/:productId", getProductReviews);

// GET a single review
router.get("/:reviewId", getReview);

// PUT update a review
router.put("/:reviewId", updateReview);

// DELETE a review
router.delete("/:reviewId", deleteReview);

// POST mark a review as helpful
router.post("/:reviewId/helpful", markReviewHelpful);

module.exports = router;
