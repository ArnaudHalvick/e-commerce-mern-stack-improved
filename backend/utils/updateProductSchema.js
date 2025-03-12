const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const Product = require("../models/Product");

// Helper function to generate a slug from a product name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single one
    .trim(); // Trim leading/trailing whitespace
};

// Function to ensure slug uniqueness
const ensureUniqueSlug = async (baseSlug, productId = null) => {
  // Check if slug already exists (excluding the current product if updating)
  const query = productId
    ? { slug: baseSlug, _id: { $ne: productId } }
    : { slug: baseSlug };
  const existingProduct = await Product.findOne(query);

  if (!existingProduct) return baseSlug;

  // If slug exists, add a numeric suffix
  let counter = 1;
  let newSlug = `${baseSlug}-${counter}`;

  while (
    await Product.findOne(
      productId ? { slug: newSlug, _id: { $ne: productId } } : { slug: newSlug }
    )
  ) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
};

// Main function to update all products
const updateProducts = async () => {
  let client;
  try {
    const dbUsername = process.env.DB_USERNAME;
    const dbPassword = process.env.DB_PASSWORD;
    const mongoURI = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.prdnq.mongodb.net/ecommerce-mern`;

    console.log("Connecting to MongoDB...");

    // Connect with both MongoDB driver (for index operations) and Mongoose (for model operations)
    await mongoose.connect(mongoURI);
    client = new MongoClient(mongoURI);
    await client.connect();

    const db = client.db("ecommerce-mern");
    const productsCollection = db.collection("products");

    console.log("Connected to MongoDB");

    // STEP 1: Drop the unique index on the id field if it exists
    console.log("Step 1: Dropping 'id' index...");

    try {
      // First, get all indexes to check if 'id' index exists
      const indexes = await productsCollection.indexes();

      // Find the id index if it exists
      const idIndex = indexes.find(
        (idx) => idx.key && idx.key.id !== undefined && idx.unique === true
      );

      if (idIndex) {
        console.log("Found unique index on 'id' field. Dropping index...");
        // Drop the index
        await productsCollection.dropIndex(idIndex.name);
        console.log("Index dropped successfully");
      } else {
        console.log("No unique index found on 'id' field, continuing...");
      }
    } catch (error) {
      console.error("Error handling index:", error);
      // Continue with the script even if index handling fails
    }

    // STEP 2: Get all products
    const products = await Product.find();
    console.log(`Found ${products.length} products to update`);

    // STEP 3: Update each product to regenerate the slug using the mongoose-slug-generator
    console.log("Step 2: Regenerating slugs and removing 'id' field...");

    let updatedCount = 0;

    for (const product of products) {
      // Save will trigger the slug generation
      product.isNew = false; // Ensure Mongoose knows this is an update, not an insert

      // Remove the id field
      product.id = undefined;

      // Save the product to regenerate the slug
      await product.save();

      updatedCount++;
      console.log(`Updated product: ${product.name} -> slug: ${product.slug}`);
    }

    console.log(`Successfully updated ${updatedCount} products`);
  } catch (error) {
    console.error("Error updating products:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB client disconnected");
    }
    mongoose.disconnect();
    console.log("Mongoose disconnected");
  }
};

// Run the update function
updateProducts();
