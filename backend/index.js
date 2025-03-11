require("dotenv").config(); // Load environment variables from .env file

const port = 4000;
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Log environment variables for debugging
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;

const mongoURI = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.prdnq.mongodb.net/`;

// Database Connection
mongoose
  .connect(mongoURI, {})
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Creation
app.get("/", (req, res) => {
  res.send("Express app is running");
});

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

// Creating Upload Endpoint for images
app.use("/images", express.static(path.join(__dirname, "upload/images")));
app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

// Schema for the product
// TODO: More schema to its own file
const Product = new mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
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

app.post("/add-product", async (req, res) => {
  let products = await Product.find();
  let id;

  // TODO: Modify the way ids are generated because this is not a good practice
  if (products.length > 0) {
    id = products[products.length - 1].id + 1;
  } else {
    id = 1;
  }

  const product = new Product({
    id: id,
    image: req.body.image,
    name: req.body.name,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
    date: req.body.date,
    available: req.body.available,
  });
  await product.save();
  res.json({
    success: true,
    name: req.body.name,
  });
});

// API to delete a product
app.post("/remove-product", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({
    success: true,
    name: req.body.name,
    // TODO: Remove line above because it doesn't make sense because we can put any name in req body.
    // Should give the name of deleted product instead. Maybe find name before deleting and return it.
    message: "Product deleted successfully",
  });
});

// Creating API to get all products
app.get("/all-products", async (req, res) => {
  let products = await Product.find();
  res.send(products);
});

// Schema for the user
const Users = mongoose.model("Users", {
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cartData: {
    type: Object,
    default: {},
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Creating endpoint for user registration
// TODO: Rework signup, cart, login, etc.
app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, "secret_ecom");

  res.json({ success: true, token });
});

// Creating endpoint for user login
// TODO: rework login because it's not secure AT ALL (lol ?)
app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };

      const token = jwt.sign(data, "secret_ecom");

      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid password" });
    }
  } else {
    res.json({ success: false, message: "User not found" });
  }
});

// Endpoint for newcollection data
// TODO: Make this endpoint dynamic so it can be used for any category ? Or mix categories ?
app.get("/newcollection", async (req, res) => {
  let products = await Product.find();
  let newcollection = products.slice(-8);
  res.send(newcollection);
});

// Endpoint for featured women's products
app.get("/featured-women", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let featuredWomen = products.slice(-8);
  res.send(featuredWomen);
});

// Middleware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.headers["auth-token"];
  if (!token) {
    return res.status(401).json({ message: "Please login to continue" });
  } else {
    try {
      const data = jwt.verify(token, "secret_ecom");
      req.user = data.user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Please login to continue" });
    }
  }
};

// Endpoint for cart data
app.post("/add-to-cart", fetchUser, async (req, res) => {
  console.log("Added ", req.body.itemId);
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Added");
});

app.post("/remove-from-cart", fetchUser, async (req, res) => {
  console.log("Removed ", req.body.itemId);
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] > 0) {
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate(
      { _id: req.user.id },
      { cartData: userData.cartData }
    );
    res.send("Removed");
  }
});

// Endpoint to get cart data
app.post("/get-cart-data", fetchUser, async (req, res) => {
  let userData = await Users.findOne({ _id: req.user.id });
  res.send(userData.cartData);
});

// Listening to the port
app.listen(port, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`Server is running on port ${port}`);
  }
});
