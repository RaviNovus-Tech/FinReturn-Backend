// middleware/authenticate.js
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = verifyToken(token);
    console.log(decoded);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
