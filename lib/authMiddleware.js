// lib/authMiddleware.js

import jwt from "jsonwebtoken";

export const verifyToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Token missing or malformed");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "kjhgfdJHGFDSDFGH9876rfghGFDS84");
    req.user = {
    id: decoded.id,
    role: decoded.role,
  };
  
  } catch (err) {
    console.error("Token verification failed:", err);
    throw new Error("Invalid or expired token");
  }
};
