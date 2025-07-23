import Subscription from "../models/Subscription.js";
import { ERROR_CODES } from "../utils/errors/errorCodes.js";
import { AppError, ValidationError } from "../utils/errors/errors.js";
import User from "../models/User.js";
import Package from "../models/Package.js";
import { ErrorHandler } from "../utils/errors/ErrorHandler.js";

export default class SubscriptionService {
  async createSubscription(subscriptionData, paymentProof) {
    try {
      const { userId, packageId, amount, paymentDetails } = subscriptionData;

      // Validate user
      const user = await User.findById(userId);
      console.log("user ", user);

      if (!user) {
        throw new ValidationError("User not found", "USER_NOT_FOUND", {
          userId,
        });
      }

      // Validate package
      const packageData = await Package.findById(packageId);
      if (!packageData) {
        throw new ValidationError("Package not found", "PACKAGE_NOT_FOUND", {
          packageId,
        });
      }

      // Prepare subscription data
      //   const subscription = new Subscription({
      //     userId,
      //     packageId,
      //     amount,
      //     paymentDetails: {
      //       ...paymentDetails,
      //       paymentProofUrl: paymentProof?.url || null, // Include Cloudinary URL if available
      //     },
      //   });

      // Save subscription
      //   await subscription.save();
      return {};
    } catch (error) {
      console.error("Error creating subscription:", error);
      // Handle Mongoose-specific errors
      if (
        error.name === "ValidationError" ||
        error.name === "CastError" ||
        error.code === 11000
      ) {
        console.log(error);

        throw ErrorHandler.handleMongoError(error);
      }

      // Handle custom errors (e.g., ValidationError from user/package checks)
      if (error instanceof AppError) {
        throw error;
      }

      // Generic server error
      throw new AppError(
        "Failed to create subscription",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  async getAllSubscriptions() {
    try {
      const subscriptions = await Subscription.find();
      return subscriptions;
    } catch (error) {
      // Handle Mongoose-specific errors
      if (
        error.name === "ValidationError" ||
        error.name === "CastError" ||
        error.code === 11000
      ) {
        throw ErrorHandler.handleMongoError(error);
      }
      throw new AppError(
        "Failed to retrieve subscriptions",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }
}
