const jwt = require("jsonwebtoken");

const User = require("../models/User");

const protect = async (req, res, next) => {
  // Read Authorization header and validate Bearer token format.
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  // Extract token from "Bearer <token>".
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // Verify token and decode user id from payload.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach authenticated user to request without password.
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

const requireRole = (...roles) => {
  const allowedRoles = roles.flat().filter(Boolean);

  return (req, res, next) => {
    const userRole = (req.user && req.user.role) || "client";
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    return next();
  };
};

module.exports = {
  protect,
  requireRole,
};