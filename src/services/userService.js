import User from "../models/User.js";
import { ERROR_CODES } from "../utils/errors/errorCodes.js";
import { AppError } from "../utils/errors/errors.js";
import ReferralEarnings from "../models/ReferralEarnings.js";

export default class UserService {
  async getAllUsers() {
    try {
      const users = await User.find();
      return users;
    } catch (error) {
      throw new AppError(
        "Failed to retrieve users",
        500,
        ERROR_CODES.SERVER_ERROR,
        {
          originalError: error.message,
        }
      );
    }
  }

  async getUserAffiliatesByID(userId) {
    try {
      const user = await User.findById(userId).populate("referredUsers");

      if (!user) {
        throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND, {
          userId,
        });
      }

      return user.referredUsers;
    } catch (error) {
      if (error.name === "CastError") {
        throw new AppError(
          "Invalid user ID format",
          400,
          ERROR_CODES.BAD_REQUEST,
          { userId }
        );
      }
      throw new AppError(
        "Failed to retrieve user affiliates",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  // Alternative simpler approach using populate (less efficient for large datasets)
  async getAffiliatesWithHistory(userId) {
    try {
      const user = await User.findById(userId).populate({
        path: "referredUsers",
        select: "fullName email createdAt hasSubscribed isActive",
      });

      if (!user) {
        throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND, {
          userId,
        });
      }

      // Get earnings history for each affiliate
      const affiliatesWithHistory = await Promise.all(
        user.referredUsers.map(async (affiliate) => {
          const earningsHistory = await ReferralEarnings.find({
            referrerId: userId,
            referredUserId: affiliate._id,
          })
            .populate("subscriptionId", "planName amount createdAt")
            .sort({ createdAt: -1 });

          const totalEarnings = earningsHistory.reduce(
            (sum, earning) => sum + earning.commissionAmount,
            0
          );

          return {
            user: affiliate,
            earningsHistory,
            totalEarnings,
            totalTransactions: earningsHistory.length,
            lastEarningDate: earningsHistory[0]?.createdAt || null,
          };
        })
      );

      return {
        userId,
        affiliates: affiliatesWithHistory,
        totalAffiliates: affiliatesWithHistory.length,
        totalEarningsFromAllAffiliates: affiliatesWithHistory.reduce(
          (sum, affiliate) => sum + affiliate.totalEarnings,
          0
        ),
      };
    } catch (error) {
      if (error.name === "CastError") {
        throw new AppError(
          "Invalid user ID format",
          400,
          ERROR_CODES.BAD_REQUEST,
          { userId }
        );
      }

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Failed to retrieve affiliates with history",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }
}
