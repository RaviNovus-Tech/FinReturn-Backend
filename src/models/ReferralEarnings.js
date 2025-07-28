import mongoose from "mongoose";

const referralEarningsSchema = new mongoose.Schema(
  {
    referrerId: {
      //user who shared the referral link
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referredUserId: {
      //user who signed up using the referral link
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriptionId: {
      //subscription for which the earnings are being calculated
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    commissionAmount: {
      type: Number,
      required: true,
    },
    commissionPercentage: {
      type: Number,
      default: 0.1, // Default to 10% if not specified
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ReferralEarnings", referralEarningsSchema);
