import { asyncHandler } from "../middlewares/errorHandler.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";
import { validationResult } from "express-validator";

export default class ROIHistoryController {
  constructor(service) {
    this.service = service;
  }

  getBySubscriptionId = asyncHandler(async (req, res) => {
    const { subscriptionId } = req.query;
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");

    const result = await this.service.getROIHistoryBySubscription(
      subscriptionId,
      page,
      limit
    );
    return ResponseHandler.success(
      res,
      result,
      "ROI history fetched successfully"
    );
  });

  createROI = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.error(
        res,
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        { errors: errors.array() }
      );
    }

    const roi = await this.service.createROIHistory(req.body);
    return ResponseHandler.success(res, roi, "ROI entry created", 201);
  });

  creditBulkROI = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.error(
        res,
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        { errors: errors.array() }
      );
    }

    const result = await this.service.creditBulkROI(req.body.entries);
    return ResponseHandler.success(
      res,
      result,
      "Bulk ROI credited successfully",
      201
    );
  });

  //used to remove roi history entry
  deleteROIHistory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await this.service.deleteROIHistory(id);
    return ResponseHandler.success(
      res,
      result,
      "ROI history entry deleted successfully"
    );
  });

  bulkDeleteROIHistory = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    const result = await this.service.bulkDeleteROIHistory(ids);
    return ResponseHandler.success(
      res,
      result,
      "ROI history entries deleted successfully"
    );
  });
}

