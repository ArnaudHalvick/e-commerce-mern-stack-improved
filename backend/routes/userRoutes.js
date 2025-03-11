// backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// User routes
router.post("/signup", userController.registerUser);
router.post("/login", userController.loginUser);

module.exports = router;
