import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "rejected"],
      default: "pending",
    },
    paymentDetails: {
      method: {
        type: String,
        enum: ["manual", "crypto"],
        required: true,
      },
      transactionId: {
        type: String,
        trim: true,
      },
      paymentProof: {
        type: String,
        trim: true,
      },
      adminAccountDetails: {
        type: String,
        trim: true,
      },
    },
    roiCredited: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
