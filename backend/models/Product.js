// backend/models/Product.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProductSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  images: {
    type: [String],
    required: true,
    validate: [arrayLimit, "Product must have between 1 and 5 images"],
  },
  mainImageIndex: {
    type: Number,
    default: 0,
    min: 0,
    max: 4,
  },
  name: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 200,
  },
  longDescription: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["men", "women", "kid"],
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  sizes: {
    type: [
      {
        type: String,
        enum: ["S", "M", "L", "XL", "XXL"],
      },
    ],
    default: ["S", "M", "L", "XL", "XXL"], // By default, all sizes are available
  },
  tags: {
    type: [
      {
        type: String,
        enum: [
          "Modern",
          "Latest",
          "Trending",
          "Casual",
          "Formal",
          "Sportswear",
          "Vintage",
          "Sustainable",
          "Bestseller",
          "Limited Edition",
        ],
      },
    ],
    default: [],
  },
  types: {
    type: [
      {
        type: String,
        enum: [
          "T-Shirt",
          "Shirt",
          "Jeans",
          "Dress",
          "Skirt",
          "Jacket",
          "Coat",
          "Sweater",
          "Hoodie",
          "Crop Top",
          "Pants",
          "Shorts",
          "Swimwear",
          "Activewear",
          "Underwear",
        ],
      },
    ],
    default: [],
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

function arrayLimit(val) {
  return val.length >= 1 && val.length <= 5;
}

// Create a virtual property for the main image
ProductSchema.virtual("mainImage").get(function () {
  if (this.images && this.images.length > 0) {
    return this.images[this.mainImageIndex];
  }
  return "";
});

module.exports = mongoose.model("Product", ProductSchema);
