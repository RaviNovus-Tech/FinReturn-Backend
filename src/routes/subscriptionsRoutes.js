import express from "express";
import SubscriptionService from "../services/subscriptionService.js";
import SubscriptionController from "../controllers/subscriptionsController.js";
import { handleValidationErrors } from "../middlewares/handleValidateErrors.js";
import multer from "multer";
import { body } from "express-validator";

const upload = multer({ storage: multer.memoryStorage() });
const createSubscriptionValidator = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid User ID"),

  body("packageId")
    .notEmpty()
    .withMessage("Package ID is required")
    .isMongoId()
    .withMessage("Invalid Package ID"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),

  body("paymentDetails.method")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["bank", "crypto"])
    .withMessage("Payment method must be 'bank' or 'crypto'"),

  body("paymentDetails.transactionId").optional().isString().trim(),

  body("paymentDetails.paymentProof").optional().isString().trim(),

  body("paymentDetails.adminAccountDetails").optional().isString().trim(),
];

const router = express.Router();
const subscriptionService = new SubscriptionService();
const subscriptionController = new SubscriptionController(subscriptionService);

// 🔸 Get all subscriptions
router.get("/", subscriptionController.getAllSubscriptions);

// 🔸 Create subscription
router.post(
  "/create",
  upload.single("paymentProof"),
  createSubscriptionValidator,
  handleValidationErrors,
  subscriptionController.createSubscription
);

// // 🔸 Get single subscription
// router.get("/:id", subscriptionController.getSubscriptionById);

// // 🔸 Update subscription
// router.put("/:id", subscriptionController.updateSubscription);

// // 🔸 Delete subscription
// router.delete("/:id", subscriptionController.deleteSubscription);

export default router;
