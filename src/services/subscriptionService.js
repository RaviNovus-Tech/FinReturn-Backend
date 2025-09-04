import Subscription from "../models/Subscription.js";
import { ERROR_CODES } from "../utils/errors/errorCodes.js";
import { AppError, ValidationError } from "../utils/errors/errors.js";
import User from "../models/User.js";
import Package from "../models/Package.js";
import { ErrorHandler } from "../utils/errors/ErrorHandler.js";
import ReferralEarnings from "../models/ReferralEarnings.js";

export default class SubscriptionService {
  async createSubscription(subscriptionData, paymentProof) {
    try {
      const { userId, packageId, amount, paymentDetails } = subscriptionData;
      // Validate user
      const user = await this._validateUser(userId, packageId);

      // Validate package
      const packageData = await Package.findById(packageId);
      if (!packageData) {
        throw new ValidationError("Package not found", "PACKAGE_NOT_FOUND", {
          packageId,
        });
      }

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
      user.hasSubscribed = true;
      await user.save();

      //if user is referred by another user, update referral earnings
      if (user.referredBy) {
        await this._handleAffiliateLogic(
          user.referredBy,
          user._id,
          amount,
          subscription._id
        );
      }

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

  async getSubscriptionByUserId(userId) {
    try {
      const subscription = await Subscription.findOne({ userId }).populate(
        "packageId"
      );
      return subscription;
    } catch (error) {
      console.error("Error retrieving subscription:");
      throw new AppError(
        "Failed to retrieve subscription",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  async handleSubscriptionAction(body) {
    try {
      const { subscriptionId, status } = body;
      console.log("Subscription ID:", subscriptionId, "Status:", status); // TODO REMOVE

      const subscription = await Subscription.findById(subscriptionId);

      if (!subscription) {
        throw new ValidationError(
          "Subscription not found",
          "SUBSCRIPTION_NOT_FOUND",
          {
            subscriptionId,
          }
        );
      }
      subscription.status = status;
      await subscription.save();

      return subscription;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error("Error handling subscription action:", error);
      throw new AppError(
        "Failed to handle subscription action",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }

  async _validateUser(userId, packageId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ValidationError("User not found", "USER_NOT_FOUND", {
        userId,
      });
    }

    // Check if user already has an active subscription
    if (user.hasSubscribed) {
      throw new ValidationError(
        "User already has an active subscription",
        "ACTIVE_SUBSCRIPTION_EXISTS",
        { userId }
      );
    }

    const existingSubscription = await Subscription.findOne({
      userId,
      packageId,
    });

    if (existingSubscription) {
      throw new ValidationError(
        "User already has an active subscription for this package",
        "ACTIVE_SUBSCRIPTION_EXISTS",
        { userId, packageId }
      );
    }

    return user;
  }

  async _handleAffiliateLogic(
    referredById,
    referredId,
    amount,
    subscriptionId
  ) {
    const referredByUser = await User.findById(referredById);

    if (!referredByUser) {
      console.log(
        "Referred by user not found, creating without referral earnings"
      );
      throw new ValidationError(
        "Referred by user not found",
        "REFERRER_NOT_FOUND",
        { referredById }
      );
    }

    const commissionAmount =
      amount * process.env.REFERRAL_EARNINGS_PERCENTAGE || 0.1;
    referredByUser.referralEarnings += commissionAmount; // Assuming 10% commission
    // referredByUser.totalEarnings += commissionAmount;
    await referredByUser.save();

    //create referral earnings record
    const referralEarnings = new ReferralEarnings({
      referrerId: referredByUser._id,
      referredUserId: referredId,
      subscriptionId: subscriptionId,
      commissionAmount: commissionAmount,
      commissionPercentage: process.env.REFERRAL_EARNINGS_PERCENTAGE || 0.1,
      status: "pending", // Initial status
    });

    await referralEarnings.save();
  }
}


