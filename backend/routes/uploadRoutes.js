// backend/routes/uploadRoutes.js

const express = require("express");
const router = express.Router();
const path = require("path");
const upload = require("../utils/upload");

// Upload routes
router.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `/images/${req.file.filename}`,
  });
});

module.exports = router;
