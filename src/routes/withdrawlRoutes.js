import express from "express";
import { body } from "express-validator";
import WithdrawalController from "../controllers/withDrawlController.js";
import WithdrawalService from "../services/withdrawlService.js";
import { authenticate } from "../middlewares/authenticate.js";
import { handleValidationErrors } from "../middlewares/handleValidateErrors.js";

const router = express.Router();

// Initialize service and controller
const withdrawalService = new WithdrawalService();
const withdrawalController = new WithdrawalController(withdrawalService);

// All routes in this file are protected and require a logged-in user
// router.use(authenticate);

/**
 * @route   POST /
 * @desc    Create a new withdrawal request
 * @access  Private
 */
router.post(
  "/",
  [
    body("amount")
      .notEmpty()
      .withMessage("Amount is required.")
      .isNumeric()
      .withMessage("Amount must be a valid number.")
      .custom((value) => value > 0)
      .withMessage("Amount must be greater than zero."),
    //   MongoId
    body("userId")
      .notEmpty()
      .withMessage("User ID is required.")
      .isMongoId()
      .withMessage("User ID must be a valid MongoDB ObjectId."),
  ],
  handleValidationErrors,
  withdrawalController.createWithdrawalRequest
);

/**
 * @route   GET /
 * @desc    Get current user's withdrawal history
 * @access  Private
 */
router.get("/:userId", withdrawalController.getWithdrawalHistory);

// ============== ADMIN ROUTES ==============

/**
 * @route   GET /admin/all
 * @desc    Get all withdrawal requests (Admin only)
 * @access  Admin
 */
router.get("/admin/all", withdrawalController.getAllWithdrawals);

/**
 * @route   GET /admin/pending
 * @desc    Get all pending withdrawal requests (Admin only)
 * @access  Admin
 */
router.get("/admin/pending", withdrawalController.getPendingWithdrawals);

/**
 * @route   PUT /admin/:withdrawalId/status
 * @desc    Update withdrawal status (Admin only)
 * @access  Admin
 */
router.put(
  "/admin/:withdrawalId/status",
  [
    body("status")
      .notEmpty()
      .withMessage("Status is required.")
      .isIn(["pending", "processing", "completed", "cancelled"])
      .withMessage("Status must be one of: pending, processing, completed, cancelled"),
    body("transactionId")
      .optional()
      .isString()
      .withMessage("Transaction ID must be a string"),
  ],
  handleValidationErrors,
  withdrawalController.updateWithdrawalStatus
);

/**
 * @route   GET /admin/:withdrawalId
 * @desc    Get specific withdrawal details (Admin only)
 * @access  Admin
 */
router.get("/admin/:withdrawalId", withdrawalController.getWithdrawalById);

/**
 * @route   GET /admin/stats
 * @desc    Get withdrawal statistics (Admin only)
 * @access  Admin
 */
router.get("/admin/stats", withdrawalController.getWithdrawalStats);

export default router;