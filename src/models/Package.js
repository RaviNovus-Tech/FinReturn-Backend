import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // in days
      required: true,
    },
    roiDailyPercentage: {
      type: Number,
    },
    roiDailyFixedAmount: {
      type: Number,
    },
    totalReturn: {
      type: Number,
      required: true,
    },
    roiCycle: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "daily",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

packageSchema.pre("validate", function (next) {
  if (!this.roiDailyPercentage && !this.roiDailyFixedAmount) {
    this.invalidate(
      "roiDailyPercentage",
      "Either roiDailyPercentage or roiDailyFixedAmount is required."
    );
    this.invalidate(
      "roiDailyFixedAmount",
      "Either roiDailyPercentage or roiDailyFixedAmount is required."
    );
  }
  next();
});

export default mongoose.model("Package", packageSchema);
