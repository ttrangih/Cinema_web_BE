// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const { findUserById } = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Yêu cầu có token mới cho vào
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = {
      id: user.Id,
      fullName: user.FullName,
      email: user.Email,
      role: user.Role,
    };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Chỉ ADMIN mới được phép
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};
