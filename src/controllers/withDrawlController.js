import { asyncHandler } from "../middlewares/errorHandler.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";

export default class WithdrawalController {
  constructor(withdrawalService) {
    this.withdrawalService = withdrawalService;
  }

  /**
   * @desc    Create a new withdrawal request
   * @route   POST /api/withdrawals
   * @access  Private
   */
  createWithdrawalRequest = asyncHandler(async (req, res) => {
    // Assuming 'authenticate' middleware adds user object to req
    const userId = req?.user?.id || req.body.userId; // Fallback to body for testing purposes
    const withdrawalData = {
      amount: req.body.amount,
      userId: userId,
    };

    const withdrawal = await this.withdrawalService.createWithdrawal(
      userId,
      withdrawalData
    );

    return ResponseHandler.success(
      res,
      withdrawal,
      "Withdrawal request submitted successfully.",
      201
    );
  });

  /**
   * @desc    Get withdrawal history for the logged-in user
   * @route   GET /api/withdrawals
   * @access  Private
   */
  getWithdrawalHistory = asyncHandler(async (req, res) => {
    const userId = req?.user?.id || req.params?.userId; // Fallback to query for testing purposes
    const withdrawals = await this.withdrawalService.getUserWithdrawals(userId);

    return ResponseHandler.success(
      res,
      withdrawals,
      "Withdrawal history retrieved successfully."
    );
  });
}
