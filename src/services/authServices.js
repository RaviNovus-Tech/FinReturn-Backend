import User from "../models/User.js";
import { sendEmail } from "../utils/emails/email.js";
import { ERROR_CODES } from "../utils/errors/errorCodes.js";
import {
  AppError,
  ConflictError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
} from "../utils/errors/errors.js";
import { generateOTP, generateOTPExpires } from "../utils/helpers.js";
import { generateToken } from "../utils/jwt.js";
import { ReferralCodeGenerator } from "../utils/RefferalCodeGenrate.js";

export default class AuthService {
  async register(data) {
    try {
      // this.validateRegistrationData(data);

      const { fullName, email, phone, password, walletAddress, referralCode } =
        data;

      // Check for existing user
      await this.checkExistingUser(email, walletAddress);

      // Generate unique referral code
      const newUserReferralCode =
        await ReferralCodeGenerator.generateUniqueCode();

      // Handle referral logic
      const referrer = await this.processReferralCode(referralCode);

      // Create user
      const userData = {
        fullName,
        email,
        password,
        phone,
        walletAddress,
        referralCode: newUserReferralCode,
        referredBy: referrer?._id || null,
      };

      const user = await User.create(userData);

      // Update referrer if exists
      if (referrer) {
        await this.updateReferrerStats(referrer._id, user._id);
      }

      // Return response
      const { password: _, ...userWithoutPassword } = user.toObject();
      const token = generateToken({ userId: user._id, role: user.role });

      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Handle unexpected errors
      throw new AppError("Registration failed", 500, ERROR_CODES.SERVER_ERROR, {
        originalError: error.message,
      });
    }
  }

  async login(data) {
    const { email, password } = data;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    const token = generateToken({ userId: user._id, role: user.role });
    return {
      user: userWithoutPassword,
      token,
    };
  }

  async sendOtp(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const otpCode = generateOTP(); // e.g. 582639
    const otpExpiresAt = generateOTPExpires(5); // e.g. 5 minutes from now
    user.otp = {
      code: otpCode,
      expiresAt: otpExpiresAt,
    };

    await user.save();

    await sendEmail(email, "OTP", {
      otp: otpCode,
    });
  }

  validateRegistrationData(data) {
    const { fullName, email, phone, password, walletAddress } = data;

    if (!fullName?.trim()) {
      throw new ValidationError("Full name is required", "fullName");
    }

    if (!email?.trim()) {
      throw new ValidationError("Email is required", "email");
    }

    if (!this.isValidEmail(email)) {
      throw new ValidationError("Invalid email format", "email");
    }

    if (!password || password.length < 6) {
      throw new ValidationError(
        "Password must be at least 6 characters",
        "password"
      );
    }

    if (!walletAddress?.trim()) {
      throw new ValidationError("Wallet address is required", "walletAddress");
    }
  }

  async checkExistingUser(email, walletAddress) {
    const [existingUser, existingWallet] = await Promise.all([
      User.findOne({ email }).lean(),
      User.findOne({ walletAddress }).lean(),
    ]);

    if (existingUser) {
      throw new ConflictError("User with this email already exists", {
        field: "email",
        value: email,
      });
    }

    if (existingWallet) {
      throw new ConflictError("Wallet address already registered", {
        field: "walletAddress",
        value: walletAddress,
      });
    }
  }

  async processReferralCode(referralCode) {
    if (!referralCode) return null;

    const trimmedCode = referralCode.trim().toUpperCase();

    if (trimmedCode.length !== 8) {
      throw new ValidationError(
        "Referral code must be 8 characters long",
        "referralCode"
      );
    }

    const referrer = await User.findOne({ referralCode: trimmedCode }).lean();

    if (!referrer) {
      throw new ValidationError("Invalid referral code", "referralCode", {
        code: trimmedCode,
      });
    }

    return referrer;
  }

  async updateReferrerStats(referrerId, newUserId) {
    try {
      await User.findByIdAndUpdate(
        referrerId,
        {
          $push: { referredUsers: newUserId },
          $inc: { referralCount: 1 },
        },
        { new: true }
      );
    } catch (error) {
      // Log error but don't fail registration
      console.error("Failed to update referrer stats:", error);
    }
  }

  async getReferralInfo(userId) {
    const user = await User.findById(userId)
      .select("referralCode referralCount")
      .populate("referredUsers", "fullName email createdAt")
      .lean();

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
      referredUsers: user.referredUsers || [],
    };
  }

  async validateReferralCode(referralCode) {
    if (!referralCode || typeof referralCode !== "string") {
      return {
        isValid: false,
        message: "Invalid referral code format",
        code: ERROR_CODES.REFERRAL_CODE_INVALID_FORMAT,
      };
    }

    const code = referralCode.trim().toUpperCase();

    if (code.length !== 8) {
      return {
        isValid: false,
        message: "Referral code must be 8 characters long",
        code: ERROR_CODES.REFERRAL_CODE_INVALID_FORMAT,
      };
    }

    const user = await User.findOne({ referralCode: code }).lean();

    if (!user) {
      return {
        isValid: false,
        message: "Referral code not found",
        code: ERROR_CODES.REFERRAL_CODE_NOT_FOUND,
      };
    }

    return {
      isValid: true,
      referrer: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
