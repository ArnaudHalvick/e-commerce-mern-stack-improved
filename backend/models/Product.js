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
    enum: ["men", "women", "kids"],
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
        enum: ["S", "M", "L", "XL", "XXL", "One Size"],
      },
    ],
    default: ["S", "M", "L", "XL", "XXL", "One Size"], // By default, all sizes are available
  },
  tags: {
    type: [
      {
        type: String,
        enum: [
          "Winter",
          "Summer",
          "Spring",
          "Fall",
          "Trendy",
          "Elegant",
          "Casual",
          "Athleisure",
          "Boho",
          "Minimalist",
          "Party",
          "Chic",
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
          "Tank Top",
          "Shirt",
          "Jeans",
          "Dress",
          "Skirt",
          "Jacket",
          "Sweater",
          "Hoodie",
          "Crop Top",
          "Pants",
          "Shorts",
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
