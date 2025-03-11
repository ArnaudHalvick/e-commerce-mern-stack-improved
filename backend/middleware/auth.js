// backend/middleware/auth.js

const jwt = require("jsonwebtoken");

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

module.exports = fetchUser;
