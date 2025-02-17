const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust path if needed

const protect = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const protectEventActions = (req, res, next) => {
  if (!req.user || req.user.role === "guest") {
    return res
      .status(403)
      .json({ message: "Guests cannot create or modify events" });
  }
  next();
};

module.exports = { protect, protectEventActions };
