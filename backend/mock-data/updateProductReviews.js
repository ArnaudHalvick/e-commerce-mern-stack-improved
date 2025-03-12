const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Product = require("../models/Product");
const Review = require("../models/Review");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const dbUsername = process.env.DB_USERNAME;
    const dbPassword = process.env.DB_PASSWORD;

    if (!dbUsername || !dbPassword) {
      console.error("Database credentials not found in environment variables");
      process.exit(1);
    }

    const mongoURI = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.prdnq.mongodb.net/ecommerce-mern`;

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Update products with their reviews
const updateProductReviews = async () => {
  try {
    console.log("Starting to update products with review references...");

    // Get all reviews
    const reviews = await Review.find();
    console.log(`Found ${reviews.length} reviews to process`);

    // Group reviews by product ID
    const reviewsByProduct = {};

    reviews.forEach((review) => {
      const productId = review.product.toString();
      if (!reviewsByProduct[productId]) {
        reviewsByProduct[productId] = [];
      }
      reviewsByProduct[productId].push(review._id);
    });

    // Update each product with its reviews
    const productIds = Object.keys(reviewsByProduct);
    console.log(`Updating ${productIds.length} products with reviews`);

    let updatedCount = 0;

    for (const productId of productIds) {
      const productReviews = reviewsByProduct[productId];

      const product = await Product.findById(productId);
      if (!product) {
        console.log(`Product with ID ${productId} not found`);
        continue;
      }

      // Update product's reviews array
      product.reviews = productReviews;

      // Recalculate product rating
      const reviewDocs = await Review.find({ product: productId });
      const totalRating = reviewDocs.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating =
        reviewDocs.length > 0 ? totalRating / reviewDocs.length : 0;
      product.rating = parseFloat(averageRating.toFixed(1));

      await product.save();
      updatedCount++;

      if (updatedCount % 10 === 0) {
        console.log(`Updated ${updatedCount} products so far...`);
      }
    }

    console.log(
      `Successfully updated ${updatedCount} products with their reviews`
    );
  } catch (error) {
    console.error("Error updating product reviews:", error);
  } finally {
    mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

// Run the script
connectDB()
  .then(() => updateProductReviews())
  .catch((error) => {
    console.error("Script error:", error);
    mongoose.disconnect();
  });
