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
      const existingSubscription = await Subscription.findOne({
        userId,
        packageId,
      });

      // if (existingSubscription) {
      //   throw new ValidationError(
      //     "User already has an active subscription for this package",
      //     "ACTIVE_SUBSCRIPTION_EXISTS",
      //     { userId, packageId }
      //   );
      // }

      if (paymentDetails.transactionId && !paymentProof) {
        throw new ValidationError(
          "Payment proof is required when transaction ID is provided",
          "PAYMENT_PROOF_REQUIRED"
        );
      }

      console.log(packageData); // TODO REMOVE

      if (amount != packageData.amount) {
        throw new ValidationError(
          "Amount does not match the package price",
          "AMOUNT_MISMATCH",
          { amount, packagePrice: packageData.amount }
        );
      }

      const subscription = new Subscription({
        userId,
        packageId,
        amount,
        startDate: new Date(),
        endDate: new Date(
          Date.now() + packageData.duration * 24 * 60 * 60 * 1000
        ), // Assuming duration is in days

        paymentDetails: {
          method: paymentDetails.method,
          transactionId: paymentDetails.transactionId,
          paymentProof: paymentProof ? paymentProof.url : null, // Assuming paymentProof is an object with a url property
          adminAccountDetails: paymentDetails.adminAccountDetails,
        },
      });
      const savedSubscription = await subscription.save();
      return savedSubscription;
    } catch (error) {
      console.error("Error creating subscription:", error);
      // Handle Mongoose-specific errors
      if (
        error.name === "ValidationError" ||
        error.name === "CastError" ||
        error.code === 11000
      ) {
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
      const subscriptions = await Subscription.find()
        .populate("userId")
        .populate("packageId");
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
