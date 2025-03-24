// backend/routes/uploadRoutes.js

const express = require("express");
const router = express.Router();
const upload = require("../utils/common/upload");

// Upload routes
router.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `/images/${req.file.filename}`,
  });
});

module.exports = router;
