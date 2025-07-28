import User from "../models/User.js";
import { ERROR_CODES } from "../utils/errors/errorCodes.js";
import { AppError } from "../utils/errors/errors.js";

export default class UserService {
  async getAllUsers() {
    try {
      const users = await User.find();
      return users;
    } catch (error) {
      throw new AppError(
        "Failed to retrieve users",
        500,
        ERROR_CODES.SERVER_ERROR,
        {
          originalError: error.message,
        }
      );
    }
  }

  async getUserAffiliatesByID(userId) {
    try {
      const user = await User.findById(userId).populate("referredUsers");

      if (!user) {
        throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND, {
          userId,
        });
      }

      return user.referredUsers;
    } catch (error) {
      if (error.name === "CastError") {
        throw new AppError(
          "Invalid user ID format",
          400,
          ERROR_CODES.BAD_REQUEST,
          { userId }
        );
      }
      throw new AppError(
        "Failed to retrieve user affiliates",
        500,
        ERROR_CODES.SERVER_ERROR,
        { originalError: error.message }
      );
    }
  }
}
