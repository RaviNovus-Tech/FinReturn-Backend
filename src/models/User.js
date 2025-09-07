import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Subscription from "./Subscription.js";

const otpSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: { expires: 0 }, // TTL index: auto-delete when expiresAt < now
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    walletAddress: {
      type: String,
      trim: true,
    },

    // Referral System Fields
    referralCode: {
      type: String,
      unique: true,
      sparse: true, // Allows null values but enforces uniqueness for non-null
      uppercase: true,
      trim: true,
      length: 8,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    referredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    referralCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    referralEarnings: {
      type: Number,
      default: 0, // Total referral commissions earned
      min: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    roiEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    referralEarnings: {
      type: Number,
      default: 0, // This already exists in your schema
      min: 0,
    },

    hasSubscribed: {
      type: Boolean,
      default: false, // Indicates if the user has an active subscription
    },

    // Additional useful fields
    isActive: {
      type: Boolean,
      default: true,
    },

    otp: otpSchema,

    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// pre save update anything calculate total earnings = roiEarnings + referralEarnings
userSchema.pre("save", function (next) {
  this.totalEarnings = this.roiEarnings + this.referralEarnings;
  next();
});



userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Subscription.deleteMany({ userId: doc._id });
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


userSchema.index({ referredBy: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for referral URL
userSchema.virtual("referralUrl").get(function () {
  return `${process.env.FRONTEND_URL}/register?ref=${this.referralCode}`;
});

// Method to get referral stats
userSchema.methods.getReferralStats = async function () {
  const stats = await this.model("User").aggregate([
    { $match: { referredBy: this._id } },
    {
      $group: {
        _id: null,
        totalReferrals: { $sum: 1 },
        thisMonth: {
          $sum: {
            $cond: [
              {
                $gte: [
                  "$createdAt",
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return stats[0] || { totalReferrals: 0, thisMonth: 0 };
};

export default mongoose.model("User", userSchema);
