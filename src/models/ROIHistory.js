import mongoose from "mongoose";

const roiHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investment",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["credited", "pending"],
      default: "credited",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ROIHistory", roiHistorySchema);
