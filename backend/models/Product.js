// backend/models/Product.js

const mongoose = require("mongoose");
const slugify = require("slugify");
const { Schema } = mongoose;

// Updated slug generator using slugify
const generateSlug = (name) => {
  // The options below convert the string to lower case and remove special characters
  return slugify(name, { lower: true, strict: true });
};

// Function to ensure slug uniqueness (will be used in pre-save hook)
const ensureUniqueSlug = async function (baseSlug, productId) {
  const Product = this.constructor;

  // Check if slug already exists (excluding the current product if updating)
  const query = productId
    ? { slug: baseSlug, _id: { $ne: productId } }
    : { slug: baseSlug };

  const existingProduct = await Product.findOne(query);

  if (!existingProduct) return baseSlug;

  // If slug exists, add a numeric suffix
  let counter = 1;
  let newSlug = `${baseSlug}-${counter.toString().padStart(3, "0")}`;

  while (true) {
    const duplicateQuery = productId
      ? { slug: newSlug, _id: { $ne: productId } }
      : { slug: newSlug };

    const duplicate = await Product.findOne(duplicateQuery);

    if (!duplicate) break;

    counter++;
    newSlug = `${baseSlug}-${counter.toString().padStart(3, "0")}`;

    // Safety check to prevent infinite loops
    if (counter > 1000) {
      throw new Error("Could not generate a unique slug after 1000 attempts");
    }
  }

  return newSlug;
};

// Custom validators for minimum array length
function minArrayLength(val) {
  return val.length >= 1;
}

const ProductSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false,
    unique: false,
  },
  slug: {
    type: String,
    required: false, // Allow auto-generation during save
    unique: true,
    index: true,
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
    default: 0,
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
    default: ["S", "M", "L", "XL", "XXL", "One Size"],
    validate: [minArrayLength, "At least one size is required"],
    required: true,
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
    validate: [minArrayLength, "At least one tag is required"],
    required: true,
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
    validate: [minArrayLength, "At least one type is required"],
    required: true,
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
  deleted: {
    type: Boolean,
    default: false,
    index: true, // Add index for faster queries
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

function arrayLimit(val) {
  return val.length >= 1 && val.length <= 5;
}

// Pre-validate hook to ensure slug exists before validation
ProductSchema.pre("validate", async function (next) {
  if (!this.slug) {
    try {
      // Generate a base slug from the name using slugify
      const baseSlug = generateSlug(this.name);

      // Ensure the slug is unique
      this.slug = await ensureUniqueSlug.call(this, baseSlug, this._id);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Pre-save hook to update slug if name changes
ProductSchema.pre("save", async function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    try {
      // Generate a base slug from the name using slugify
      const baseSlug = generateSlug(this.name);

      // Ensure the slug is unique
      this.slug = await ensureUniqueSlug.call(this, baseSlug, this._id);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Create a virtual property for the main image
ProductSchema.virtual("mainImage").get(function () {
  if (this.images && this.images.length > 0) {
    return this.images[this.mainImageIndex];
  }
  return "";
});

module.exports = mongoose.model("Product", ProductSchema);
