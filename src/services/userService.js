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
}
