import express from "express";
import { body } from "express-validator";
import AuthController from "../controllers/authController.js";
import AuthService from "../services/authServices.js";
import { authenticate } from "../middlewares/authenticate.js";
import { handleValidationErrors } from "../middlewares/handleValidateErrors.js";

const router = express.Router();
const authService = new AuthService();
const authController = new AuthController(authService);
// Global error handling middleware

// Signup route
router.post(
  "/register",
  [
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("Full name is required")
      .isLength({ max: 100 })
      .withMessage("Full name cannot exceed 100 characters"),
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("phone")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage("Please provide a valid phone number"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("walletAddress")
      .trim()
      .notEmpty()
      .withMessage("Wallet address is required"),
    body("referralCode")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Referral code cannot be empty if provided"),
  ],
  handleValidationErrors,
  authController.register
);

router.get("/test", authenticate, (req, res) => {
  res.status(200).json({ message: "Test route is working" });
});

// Login route
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidationErrors,
  authController.login
);

router.get("/logout", authenticate, authController.logout);

// // Forgot password route
router.post(
  "/send-otp",
  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
  ],
  handleValidationErrors,
  authController.sendOtp
);

// // Reset password route
// router.post(
//   "/reset-password",
//   [
//     body("email")
//       .isEmail()
//       .withMessage("Please provide a valid email")
//       .normalizeEmail(),
//     body("otp")
//       .isNumeric()
//       .isLength({ min: 6, max: 6 })
//       .withMessage("OTP must be a 6-digit number"),
//     body("newPassword")
//       .isLength({ min: 6 })
//       .withMessage("New password must be at least 6 characters"),
//   ],
//   handleValidationErrors,
//   authController.resetPassword
// );

export default router;
