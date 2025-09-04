import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js"; // Assuming you have a User model to check balance, etc.
import {
  AppError,
  NotFoundError,
  ValidationError,
} from "../utils/errors/errors.js";

export default class WithdrawalService {
  /**
   * Creates a new withdrawal request for a user.
   * @param {string} userId - The ID of the user making the request.
   * @param {object} data - The withdrawal data.
   * @param {number} data.amount - The amount to withdraw.
   * @param {string} data.walletAddress - The destination wallet address.
   * @returns {Promise<object>} The created withdrawal document.
   */
  async createWithdrawal(userId, data) {
    const { amount } = data;

    // --- Optional Business Logic ---
    // You would typically check if the user has sufficient balance before creating the request.
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found.");
    }
    if (user.roiEarnings < amount) {
      throw new ValidationError(
        "Insufficient balance for this withdrawal.",
        "amount"
      );
    }
    //
    // // It's best practice to deduct the balance here within a database transaction.
    user.roiEarnings -= amount;
    await user.save();
    // -------------------------------
    const withdrawal = await Withdrawal.create({
      userId,
      amount,
      walletAddress: user.walletAddress,
    });

    return withdrawal;
  }

  /**
   * Retrieves the withdrawal history for a specific user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array<object>>} A list of the user's withdrawals.
   */
  async getUserWithdrawals(userId) {
    const withdrawals = await Withdrawal.find({ userId }).sort({
      createdAt: -1,
    });
    if (!withdrawals) {
      return [];
    }
    return withdrawals;
  }
}
