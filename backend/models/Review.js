const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  content: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000,
  },
  verifiedPurchase: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update product rating when a review is added or modified
ReviewSchema.post("save", async function () {
  const Product = mongoose.model("Product");
  const product = await Product.findById(this.product);

  // Find all reviews for this product
  const Review = mongoose.model("Review");
  const reviews = await Review.find({ product: this.product });

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  // Update product rating
  product.rating = parseFloat(averageRating.toFixed(1));

  // Add the review to product's reviews array if not already included
  if (!product.reviews.includes(this._id)) {
    product.reviews.push(this._id);
  }

  await product.save();
});

// Also update the product rating when a review is removed
ReviewSchema.post("remove", async function () {
  const Product = mongoose.model("Product");
  const product = await Product.findById(this.product);

  if (!product) return;

  // Remove this review from product's reviews array
  product.reviews = product.reviews.filter(
    (reviewId) => reviewId.toString() !== this._id.toString()
  );

  // Find all remaining reviews for this product
  const Review = mongoose.model("Review");
  const reviews = await Review.find({ product: this.product });

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  // Update product rating
  product.rating = parseFloat(averageRating.toFixed(1));

  await product.save();
});

module.exports = mongoose.model("Review", ReviewSchema);
