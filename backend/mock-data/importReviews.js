// importReviews.js

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Import the Review model
const Review = require("../models/Review");
const Product = require("../models/Product");

// MongoDB connection details
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const mongoURI = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.prdnq.mongodb.net/ecommerce-mern?retryWrites=true&w=majority`;

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Load the JSON data
const mockReviewsPath = path.join(__dirname, "mock-reviews.json");
const usersPath = path.join(__dirname, "ecommerce-mern.users.json");
const productsPath = path.join(__dirname, "ecommerce-mern.products.json");

const mockReviews = JSON.parse(fs.readFileSync(mockReviewsPath, "utf8"));
const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));

// Extract user and product IDs from the MongoDB exports
const userIds = users.map((user) => user._id.$oid);
const productIds = products.map((product) => product._id.$oid);

console.log(
  `Loaded ${mockReviews.length} reviews, ${userIds.length} users, and ${productIds.length} products`
);

// Function to get a random ID from an array
const getRandomId = (ids) => {
  const randomIndex = Math.floor(Math.random() * ids.length);
  return ids[randomIndex];
};

// Function to parse date string to Date object
const parseDate = (dateString) => {
  if (!dateString) return new Date();

  try {
    // Try to parse the date string (format: MM/DD/YYYY)
    const [month, day, year] = dateString.split("/");
    return new Date(year, month - 1, day);
  } catch (error) {
    console.warn(
      `Invalid date format: ${dateString}, using current date instead`
    );
    return new Date();
  }
};

// Function to import reviews into MongoDB
const importReviews = async () => {
  try {
    // Clear existing reviews
    await Review.deleteMany({});
    console.log("Cleared existing reviews");

    // Prepare reviews with random user and product IDs
    const reviewsToImport = mockReviews.map((review) => {
      return {
        user: getRandomId(userIds),
        product: getRandomId(productIds),
        rating: review.rating,
        content: review.content,
        verifiedPurchase: review.verifiedPurchase || false,
        date: parseDate(review.date),
      };
    });

    // Insert reviews in batches to avoid overwhelming the server
    const batchSize = 50;
    const totalBatches = Math.ceil(reviewsToImport.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, reviewsToImport.length);
      const batch = reviewsToImport.slice(start, end);

      await Review.insertMany(batch);
      console.log(
        `Imported batch ${i + 1}/${totalBatches} (${batch.length} reviews)`
      );
    }

    console.log(`Successfully imported ${reviewsToImport.length} reviews`);

    // Update product ratings
    console.log("Updating product ratings...");
    const products = await Product.find({});

    for (const product of products) {
      // Find all reviews for this product
      const reviews = await Review.find({ product: product._id });

      // Calculate average rating
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating =
        reviews.length > 0 ? totalRating / reviews.length : 0;

      // Update product rating and reviews array
      product.rating = parseFloat(averageRating.toFixed(1));
      product.reviews = reviews.map((review) => review._id);

      await product.save();
    }

    console.log("Product ratings updated successfully");

    mongoose.connection.close();
    console.log("Import completed successfully");
  } catch (error) {
    console.error("Error importing reviews:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the import
importReviews();
