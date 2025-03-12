const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User");

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

// Add random good ratings to products
const addRandomGoodRatings = async () => {
  try {
    // Get all products
    const products = await Product.find();
    console.log(`Found ${products.length} products in the database`);

    // Get all users (for review authorship)
    const users = await User.find();

    if (users.length === 0) {
      console.error(
        "No users found in the database to assign as review authors"
      );
      return;
    }

    console.log(`Found ${users.length} users for review authorship`);

    // Percentage of products to update (50%)
    const percentageToUpdate = 0.5;
    const numProductsToUpdate = Math.floor(
      products.length * percentageToUpdate
    );

    // Select random products to update
    const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
    const productsToUpdate = shuffledProducts.slice(0, numProductsToUpdate);

    console.log(
      `Will update ${productsToUpdate.length} products with good ratings`
    );

    // Generate and save reviews
    let addedReviews = 0;

    for (const product of productsToUpdate) {
      // Decide how many reviews to add (3-8 per product)
      const numReviews = Math.floor(Math.random() * 6) + 3;

      for (let i = 0; i < numReviews; i++) {
        // Get a random user
        const randomUser = users[Math.floor(Math.random() * users.length)];

        // Generate good rating (4.0 - 5.0)
        const rating = Math.floor(Math.random() * 2) + 4;

        // Generate review content
        const reviewTitles = [
          "Absolutely love it!",
          "Great quality product",
          "Exceeded my expectations",
          "Highly recommend",
          "Perfect fit and style",
          "Amazing value for money",
          "Best purchase ever",
          "Outstanding quality",
          "Exactly as described",
          "Very satisfied",
        ];

        const reviewContents = [
          "This product exceeded my expectations in every way. The quality is outstanding and it looks even better in person than in the photos.",
          "I couldn't be happier with this purchase. It's comfortable, stylish, and exactly what I was looking for. Highly recommend!",
          "The attention to detail on this item is impressive. I've received many compliments when wearing it. Will definitely buy more from this store.",
          "Perfect fit and the material is of excellent quality. Shipping was fast and the packaging was very nice. Overall a great shopping experience.",
          "I was hesitant to order online, but this exceeded my expectations. The color is true to the pictures and the quality is exceptional.",
          "Absolutely worth every penny! The fit is perfect and the quality is better than items I've purchased at much higher price points.",
          "This is now one of my favorite pieces in my wardrobe. The material is soft yet durable, and the design is timeless. Very happy customer!",
          "The comfort and style of this item make it a must-have. I've already ordered another one in a different color. Fantastic product!",
          "I'm extremely pleased with this purchase. The sizing was accurate, the quality is excellent, and it arrived sooner than expected.",
          "This product has quickly become my go-to favorite. The craftsmanship is evident and it has held up well after multiple washes.",
        ];

        const randomTitleIndex = Math.floor(
          Math.random() * reviewTitles.length
        );
        const randomContentIndex = Math.floor(
          Math.random() * reviewContents.length
        );

        // Create new review
        const review = new Review({
          user: randomUser._id,
          product: product._id,
          rating,
          title: reviewTitles[randomTitleIndex],
          content: reviewContents[randomContentIndex],
          verifiedPurchase: true, // Set as verified purchase for better authenticity
          date: new Date(
            Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
          ), // Random date within last 30 days
        });

        await review.save();
        addedReviews++;

        if (addedReviews % 20 === 0) {
          console.log(`Added ${addedReviews} reviews so far...`);
        }
      }
    }

    console.log(
      `Successfully added ${addedReviews} good reviews to ${productsToUpdate.length} products`
    );
    console.log(
      "Product ratings have been updated automatically through Review model middleware"
    );
  } catch (error) {
    console.error("Error adding random good ratings:", error);
  } finally {
    mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

// Run the script
connectDB()
  .then(() => addRandomGoodRatings())
  .catch((error) => {
    console.error("Script error:", error);
    mongoose.disconnect();
  });
