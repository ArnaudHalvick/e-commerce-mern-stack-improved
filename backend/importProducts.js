// importProducts.js

require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");

// Import the new Product model (adjust the path if needed)
const Product = require("./models/Product");

// MongoDB connection details
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const mongoURI = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.prdnq.mongodb.net/your_db_name?retryWrites=true&w=majority`;

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Load the JSON data
const products = require("./products.json");

// Convert date objects if needed
const cleanedProducts = products.map((product) => {
  if (product.date && typeof product.date === "object" && product.date.$date) {
    product.date = new Date(product.date.$date);
  }
  return product;
});

// Function to import products into MongoDB
const importProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert new products using the new Product schema
    await Product.insertMany(cleanedProducts);
    console.log(`Successfully imported ${cleanedProducts.length} products`);

    mongoose.connection.close();
  } catch (error) {
    console.error("Error importing products:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the import
importProducts();
