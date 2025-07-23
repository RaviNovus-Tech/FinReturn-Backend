import { AppError, ValidationError } from "./errors.js";
import { ERROR_CODES } from "./errorCodes.js";

export class ErrorHandler {
  static handleMongoError(error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const message = this.getDuplicateErrorMessage(field);
      const errorCode = this.getDuplicateErrorCode(field);

      return new AppError(message, 409, errorCode, {
        field,
        value: error.keyValue ? error.keyValue[field] : null,
      });
    }

    if (error.name === "ValidationError" && error.errors) {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path || "unknown",
        message: err.message || "Validation error",
        value: err.value || null,
      }));

      return new ValidationError("Validation failed", null, { errors });
    }

    if (error.name === "CastError") {
      return new AppError(
        `Invalid ${error.path}: ${error.value}`,
        400,
        ERROR_CODES.VALIDATION_ERROR,
        { field: error.path, value: error.value }
      );
    }

    // Fallback for unexpected errors
    return new AppError(
      "Database operation failed",
      500,
      ERROR_CODES.DATABASE_ERROR,
      { originalError: error.message || "Unknown error" }
    );
  }

  static getDuplicateErrorMessage(field) {
    const messages = {
      email: "User with this email already exists",
      walletAddress: "Wallet address already registered",
      referralCode: "Referral code already exists",
    };
    return (
      messages[field] || `Duplicate value for field: ${field || "unknown"}`
    );
  }

  static getDuplicateErrorCode(field) {
    const codes = {
      email: ERROR_CODES.USER_EXISTS,
      walletAddress: ERROR_CODES.WALLET_EXISTS,
      referralCode: ERROR_CODES.REFERRAL_CODE_GENERATION_FAILED,
    };
    return codes[field] || ERROR_CODES.DATABASE_ERROR;
  }
}
