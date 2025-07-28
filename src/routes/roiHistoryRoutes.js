import { query, body } from "express-validator";
import express from "express";
import ROIHistoryService from "../services/roiService.js";
import ROIHistoryController from "../controllers/roiController.js";
import { handleValidationErrors } from "../middlewares/handleValidateErrors.js";

const router = express.Router();
const service = new ROIHistoryService();
const controller = new ROIHistoryController(service);

const validateGetBySubscriptionId = [
  query("subscriptionId")
    .notEmpty()
    .withMessage("subscriptionId is required")
    .isMongoId()
    .withMessage("Invalid subscriptionId"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
];

const validateCreateROI = [
  body("userId").notEmpty().isMongoId().withMessage("Valid userId is required"),
  body("subscriptionId")
    .notEmpty()
    .isMongoId()
    .withMessage("Valid subscriptionId is required"),
  body("amount")
    .notEmpty()
    .isFloat({ gt: 0 })
    .withMessage("Amount must be > 0"),
  body("note").optional().isString(),
];

const validateBulkROI = [
  body("entries")
    .isArray({ min: 1 })
    .withMessage("entries must be a non-empty array"),

  body("entries.*.userId")
    .notEmpty()
    .isMongoId()
    .withMessage("Each entry must have a valid userId"),

  body("entries.*.subscriptionId")
    .notEmpty()
    .isMongoId()
    .withMessage("Each entry must have a valid subscriptionId"),

  body("entries.*.amount")
    .notEmpty()
    .isFloat({ gt: 0 })
    .withMessage("Each entry must have amount > 0"),

  body("entries.*.note").optional().isString(),
];

router.get(
  "/",
  validateGetBySubscriptionId,
  handleValidationErrors,
  controller.getBySubscriptionId
);
router.post(
  "/",
  validateCreateROI,
  handleValidationErrors,
  controller.createROI
);

router.post(
  "/bulk",
  validateBulkROI,
  handleValidationErrors,
  controller.creditBulkROI
);


router.delete(
  "/bulk-delete",
  [
    body("ids")
      .isArray({ min: 1 })
      .withMessage("ids must be a non-empty array"),
    body("ids.*")
      .isMongoId()
      .withMessage("Each id must be a valid MongoDB ObjectId"),
  ],
  handleValidationErrors,
  controller.bulkDeleteROIHistory
);

router.delete("/:id", controller.deleteROIHistory);


export default router;
