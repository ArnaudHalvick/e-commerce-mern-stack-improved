const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("../models/Product");

// Test function to verify slug generation works
const testSlugGeneration = async () => {
  try {
    const dbUsername = process.env.DB_USERNAME;
    const dbPassword = process.env.DB_PASSWORD;
    const mongoURI = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.prdnq.mongodb.net/ecommerce-mern`;

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    // Test scenario: Create products with identical names to test slug uniqueness
    const baseProductName = "Test Product for Slug Generation";

    console.log(`Creating test products with base name: "${baseProductName}"`);

    // Create 5 products with the same name to ensure uniqueness
    for (let i = 0; i < 5; i++) {
      const product = new Product({
        name: baseProductName,
        shortDescription: `Test product ${i + 1}`,
        longDescription: `This is a test product ${
          i + 1
        } for testing slug generation`,
        category: "men",
        old_price: 100,
        images: ["http://localhost:4000/images/placeholder.png"],
      });

      await product.save();
      console.log(`Created product ${i + 1} with slug: ${product.slug}`);
    }

    // Now retrieve all test products to verify slugs
    const testProducts = await Product.find({ name: baseProductName });

    console.log("\nRetrieved test products:");
    testProducts.forEach((product, index) => {
      console.log(
        `${index + 1}. Name: "${product.name}", Slug: "${product.slug}"`
      );
    });

    // Check for duplicate slugs
    const slugs = testProducts.map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);

    if (slugs.length === uniqueSlugs.size) {
      console.log("\n✅ SUCCESS: All slugs are unique!");
    } else {
      console.log("\n❌ ERROR: Duplicate slugs found!");
      console.log(
        `Found ${slugs.length} products with ${uniqueSlugs.size} unique slugs`
      );
    }

    // Clean up test data
    if (process.argv.includes("--cleanup")) {
      console.log("\nCleaning up test data...");
      await Product.deleteMany({ name: baseProductName });
      console.log("Test data removed");
    } else {
      console.log(
        "\nTest data kept in database. Run with --cleanup to remove test data."
      );
    }
  } catch (error) {
    console.error("Error testing slug generation:", error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the test
testSlugGeneration();
