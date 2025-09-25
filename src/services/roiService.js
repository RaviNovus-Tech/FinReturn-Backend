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

      const results = {
        successful: [],
        failed: [],
        summary: {
          totalProcessed: entries.length,
          successCount: 0,
          failureCount: 0,
        },
      };

      // Process each entry individually for better error handling
      for (const entry of entries) {
        try {
          // Validate required fields
          if (!entry.userId || !entry.subscriptionId || !entry.amount) {
            results.failed.push({
              entry,
              reason:
                "Missing required fields (userId, subscriptionId, or amount)",
            });
            continue;
          }

          // Check if user exists
          const user = await User.findById(entry.userId);
          if (!user) {
            results.failed.push({
              entry,
              reason: `User with ID ${entry.userId} not found`,
            });
            continue;
          }

          // Check if subscription exists and belongs to the user
          const subscription = await Subscription.findOne({
            _id: entry.subscriptionId,
            userId: entry.userId,
          });

          console.log("***********************8888888888888888888888888888888");
          console.log(subscription);
          console.log("***********************8888888888888888888888888888888");

          if (!subscription) {
            results.failed.push({
              entry,
              reason: `Subscription with ID ${entry.subscriptionId} not found or doesn't belong to user ${entry.userId}`,
            });
            continue;
          }

          // Validate subscription status (optional check)
          if (subscription.status !== "active") {
            results.failed.push({
              entry,
              reason: `Subscription ${entry.subscriptionId} is not active (status: ${subscription.status})`,
            });
            continue;
          }

          // Prepare ROI entry
          const roiEntry = {
            userId: entry.userId,
            subscriptionId: entry.subscriptionId,
            amount: Number(entry.amount),
            date: entry.date || new Date(),
            note: entry.note || "Bulk ROI credit",
            creditedByAdmin: true,
          };

          // Create ROI history record
          const roi = new ROIHistory(roiEntry);
          await roi.save();

          // Update subscription roiCredited
          subscription.roiCredited += roiEntry.amount;
          await subscription.save();

          // Update user roiEarnings
          await User.findByIdAndUpdate(entry.userId, {
            $inc: { roiEarnings: roiEntry.amount },
          });

          results.successful.push({
            roiId: roi._id,
            userId: entry.userId,
            subscriptionId: entry.subscriptionId,
            amount: roiEntry.amount,
          });

          results.summary.successCount++;
        } catch (entryError) {
          results.failed.push({
            entry,
            reason: `Processing error: ${entryError.message}`,
          });
        }
      }

      results.summary.failureCount = results.failed.length;

      // If all entries failed, throw an error
      if (results.summary.successCount === 0) {
        throw new AppError(
          "All ROI credit entries failed",
          400,
          ERROR_CODES.VALIDATION_ERROR,
          results
        );
      }

      // If some entries failed, return partial success with details
      if (results.summary.failureCount > 0) {
        const partialError = new AppError(
          "Some ROI credit entries failed",
          207, // Multi-Status response
          ERROR_CODES.PARTIAL_SUCCESS,
          results
        );
        partialError.isPartialSuccess = true;
        throw partialError;
      }

      // All entries succeeded
      return results;
    } catch (error) {
      // If it's already a handled error, re-throw
      if (error instanceof AppError) {
        throw error;
      }

      // For unexpected errors
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
      // Ensure roiCredited doesn't go below 0
      if (subscription.roiCredited < 0) {
        subscription.roiCredited = 0;
      }
      await subscription.save();

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