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

  // ============== ADMIN METHODS ==============

  /**
   * @desc    Get all withdrawal requests (Admin only)
   * @route   GET /api/withdrawals/admin/all
   * @access  Admin
   */
  getAllWithdrawals = asyncHandler(async (req, res) => {
    const { page, limit, status, sortBy } = req.query;
    const withdrawals = await this.withdrawalService.getAllWithdrawals({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      sortBy: sortBy || "createdAt",
    });

    return ResponseHandler.success(
      res,
      withdrawals,
      "All withdrawals retrieved successfully."
    );
  });

  /**
   * @desc    Get all pending withdrawal requests (Admin only)
   * @route   GET /api/withdrawals/admin/pending
   * @access  Admin
   */
  getPendingWithdrawals = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const withdrawals = await this.withdrawalService.getPendingWithdrawals({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });

    return ResponseHandler.success(
      res,
      withdrawals,
      "Pending withdrawals retrieved successfully."
    );
  });

  /**
   * @desc    Update withdrawal status (Admin only)
   * @route   PUT /api/withdrawals/admin/:withdrawalId/status
   * @access  Admin
   */
  updateWithdrawalStatus = asyncHandler(async (req, res) => {
    const { withdrawalId } = req.params;
    const { status, transactionId } = req.body;

    const withdrawal = await this.withdrawalService.updateWithdrawalStatus(
      withdrawalId,
      status,
      transactionId
    );

    return ResponseHandler.success(
      res,
      withdrawal,
      `Withdrawal status updated to ${status} successfully.`
    );
  });

  /**
   * @desc    Get specific withdrawal details (Admin only)
   * @route   GET /api/withdrawals/admin/:withdrawalId
   * @access  Admin
   */
  getWithdrawalById = asyncHandler(async (req, res) => {
    const { withdrawalId } = req.params;
    const withdrawal = await this.withdrawalService.getWithdrawalById(
      withdrawalId
    );

    return ResponseHandler.success(
      res,
      withdrawal,
      "Withdrawal details retrieved successfully."
    );
  });

  /**
   * @desc    Get withdrawal statistics (Admin only)
   * @route   GET /api/withdrawals/admin/stats
   * @access  Admin
   */
  getWithdrawalStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const stats = await this.withdrawalService.getWithdrawalStats({
      startDate,
      endDate,
    });

    return ResponseHandler.success(
      res,
      stats,
      "Withdrawal statistics retrieved successfully."
    );
  });
}