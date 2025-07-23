import jwt from "jsonwebtoken";
import { commonResponses } from "./responseMessages.js";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

/*
 * Generate a JWT token for a user.
 * @param {number} userId - The ID of the user.
 * @returns {string} A signed JWT token.
 */
export const generateToken = (payload) => {
  console.log("payload:", payload); // Log the payload for debugging
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/*
 * Verify a JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {object} The decoded token payload.
 * @throws {Error} If the token is invalid.
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error(commonResponses.fail.INVALID_TOKEN);
  }
};
