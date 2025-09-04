import ROIHistory from "../models/ROIHistory.js";
import { AppError, ValidationError } from "../utils/errors/errors.js";
import { ERROR_CODES } from "../utils/errors/errorCodes.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

export default class ROIHistoryService {
  async getROIHistoryBySubscription(subscriptionId, page = 1, limit = 10) {
    try {
      const query = { subscriptionId };
      const skip = (page - 1) * limit;

      const data = await ROIHistory.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

      const total = await ROIHistory.countDocuments(query);

      return {
        data,
        pagination: {
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      throw new AppError(
        "Failed to retrieve ROI history",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  async createROIHistory(payload) {
    try {
      const subscription = await Subscription.findById(payload.subscriptionId);
      if (!subscription) {
        throw new ValidationError(
          "Subscription not found",
          "SUBSCRIPTION_NOT_FOUND",
          { subscriptionId: payload.subscriptionId }
        );
      }

      subscription.roiCredited += payload.amount;
      await subscription.save();

      const roi = new ROIHistory({
        ...payload,
        date: payload.date || new Date(),
      });
      await roi.save();

      await User.findByIdAndUpdate(payload.userId, {
        $inc: { roiEarnings: payload.amount },
      });

      return roi;
    } catch (error) {
      throw new AppError(
        "Failed to create ROI history",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  async creditBulkROI(entries) {
    try {
      if (!Array.isArray(entries) || entries.length === 0) {
        throw new AppError(
          "No ROI entries provided",
          400,
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      const preparedEntries = entries.map((entry) => ({
        userId: entry.userId,
        subscriptionId: entry.subscriptionId,
        amount: entry.amount,
        date: entry.date || new Date(),
        note: entry.note || "Bulk ROI credit",
        creditedByAdmin: true,
      }));

      const result = await ROIHistory.insertMany(preparedEntries);

      return {
        count: result.length,
        data: result,
      };
    } catch (error) {
      throw new AppError(
        "Bulk ROI credit failed",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  async deleteROIHistory(id) {
    try {
      const roi = await ROIHistory.findByIdAndDelete(id);
      if (!roi) {
        throw new AppError("ROI history not found", 404, ERROR_CODES.NOT_FOUND);
      }
      const subscription = await Subscription.findById(roi.subscriptionId);
      if (!subscription) {
        throw new ValidationError(
          "Subscription not found",
          "SUBSCRIPTION_NOT_FOUND",
          { subscriptionId: roi.subscriptionId }
        );
      }
      subscription.roiCredited -= roi.amount;
      await subscription.save();
      if (!subscription.roiCredited) {
        subscription.roiCredited = 0;
      }

      return roi;
    } catch (error) {
      throw new AppError(
        "Failed to delete ROI history",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  async bulkDeleteROIHistory(ids = []) {
    const results = {
      deleted: [],
      failed: [],
    };

    for (const id of ids) {
      try {
        const deleted = await this.deleteROIHistory(id);
        results.deleted.push(deleted._id);
      } catch (err) {
        results.failed.push({
          id,
          reason: err.message,
        });
      }
    }

    if (results.failed.length > 0) {
      throw new AppError(
        "Some ROI history deletions failed",
        207, // Multi-Status response
        ERROR_CODES.PARTIAL_SUCCESS,
        results
      );
    }

    return results;
  }
}
