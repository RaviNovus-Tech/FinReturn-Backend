import crypto from "crypto";
import User from "../models/User.js";
export class ReferralCodeGenerator {
  // Characters optimized for readability (removed confusing chars like 0, O, I, 1)
  static CHARS = "ABCDEFGHIJKLMNPQRSTUVWXYZ23456789";

  // Generate secure random code
  static generateCode(length = 8) {
    const buffer = crypto.randomBytes(length);
    let result = "";

    for (let i = 0; i < length; i++) {
      result += this.CHARS[buffer[i] % this.CHARS.length];
    }

    return result;
  }

  // Generate unique code with retry logic
  static async generateUniqueCode(maxAttempts = 10) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const code = this.generateCode();

      // Check if code already exists
      const existing = await User.findOne({ referralCode: code }).lean();

      if (!existing) {
        return code;
      }

      // If we're on the last attempt, throw error
      if (attempt === maxAttempts) {
        throw new Error(
          "Unable to generate unique referral code after maximum attempts"
        );
      }
    }
  }
}
