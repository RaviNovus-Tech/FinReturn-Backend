import express from "express";
import { body, param } from "express-validator";
import Package from "../models/Package.js";
import { handleValidationErrors } from "../middlewares/handleValidateErrors.js";
import PackageService from "../services/packageService.js";
import PackageController from "../controllers/packageController.js";

const router = express.Router();
const packageService = new PackageService();
const packageController = new PackageController(packageService);

// 🔸 Create package
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("duration")
      .isInt({ min: 1 })
      .withMessage("Duration must be at least 1 day"),
    body("roiDailyPercentage")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("roiDailyPercentage must be a positive number"),
    body("roiDailyFixedAmount")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("roiDailyFixedAmount must be a positive number"),
    body("totalReturn")
      .isFloat({ gt: 0 })
      .withMessage("Total return must be a positive number"),
    body("roiCycle")
      .optional()
      .isIn(["daily", "weekly", "monthly"])
      .withMessage("ROI cycle must be daily, weekly, or monthly"),
  ],
  handleValidationErrors,
  packageController.createPackage
);

// 🔸 Get all packages
router.get("/", packageController.getAllPackages);

// 🔸 Get single package
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid package ID")],
  handleValidationErrors,
  packageController.getPackageById
);

// 🔸 Update package
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid package ID"),
    body("name").optional().trim().notEmpty().withMessage("Name is required"),
    body("amount")
      .optional()
      .isNumeric()
      .withMessage("Amount must be a number"),
    body("duration")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Duration must be at least 1 day"),
    body("roiDailyPercentage")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("roiDailyPercentage must be a positive number"),
    body("roiDailyFixedAmount")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("roiDailyFixedAmount must be a positive number"),
    body("totalReturn")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Total return must be a positive number"),
    body("roiCycle")
      .optional()
      .isIn(["daily", "weekly", "monthly"])
      .withMessage("ROI cycle must be daily, weekly, or monthly"),
  ],
  handleValidationErrors,
  packageController.updatePackageById
);

// 🔸 Delete package
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid package ID")],
  handleValidationErrors,
  packageController.deletePackageById
);

export default router;
