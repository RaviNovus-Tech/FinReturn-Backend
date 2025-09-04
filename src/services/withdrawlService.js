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

  // ============== ADMIN METHODS ==============

  /**
   * Get all withdrawals with pagination and filtering (Admin only)
   * @param {object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.status - Filter by status
   * @param {string} options.sortBy - Sort field
   * @returns {Promise<object>} Paginated withdrawals with metadata
   */
  async getAllWithdrawals(options = {}) {
    const { page = 1, limit = 10, status, sortBy = "createdAt" } = options;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = -1; // Default descending

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(query)
        .populate("userId", "email username walletAddress")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Withdrawal.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      withdrawals,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get all pending withdrawals (Admin only)
   * @param {object} options - Query options
   * @returns {Promise<object>} Paginated pending withdrawals
   */
  async getPendingWithdrawals(options = {}) {
    return this.getAllWithdrawals({ ...options, status: "pending" });
  }

  /**
   * Update withdrawal status (Admin only)
   * @param {string} withdrawalId - Withdrawal ID
   * @param {string} status - New status
   * @param {string} transactionId - Transaction ID (optional)
   * @returns {Promise<object>} Updated withdrawal
   */
  async updateWithdrawalStatus(withdrawalId, status, transactionId = null) {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      throw new NotFoundError("Withdrawal not found.");
    }

    // Prepare update data
    const updateData = { status };

    if (status === "completed" || status === "processing") {
      updateData.processedAt = new Date();
      if (transactionId) {
        updateData.transactionId = transactionId;
      }
    }

    // If withdrawal is being cancelled, restore user balance
    if (status === "cancelled" && withdrawal.status !== "cancelled") {
      const user = await User.findById(withdrawal.userId);
      if (user) {
        user.roiEarnings += withdrawal.amount;
        await user.save();
      }
    }

    const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(
      withdrawalId,
      updateData,
      { new: true, runValidators: true }
    ).populate("userId", "email username walletAddress");

    return updatedWithdrawal;
  }

  /**
   * Get withdrawal by ID (Admin only)
   * @param {string} withdrawalId - Withdrawal ID
   * @returns {Promise<object>} Withdrawal details
   */
  async getWithdrawalById(withdrawalId) {
    const withdrawal = await Withdrawal.findById(withdrawalId).populate(
      "userId",
      "email username walletAddress"
    );

    if (!withdrawal) {
      throw new NotFoundError("Withdrawal not found.");
    }

    return withdrawal;
  }

  /**
   * Get withdrawal statistics (Admin only)
   * @param {object} options - Query options
   * @param {string} options.startDate - Start date filter
   * @param {string} options.endDate - End date filter
   * @returns {Promise<object>} Withdrawal statistics
   */
  async getWithdrawalStats(options = {}) {
    const { startDate, endDate } = options;

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    const matchStage = {};
    if (Object.keys(dateFilter).length > 0) {
      matchStage.createdAt = dateFilter;
    }

    const stats = await Withdrawal.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: null,
          totalWithdrawals: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          processingCount: {
            $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] },
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledCount: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] },
          },
          processingAmount: {
            $sum: { $cond: [{ $eq: ["$status", "processing"] }, "$amount", 0] },
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0] },
          },
          cancelledAmount: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, "$amount", 0] },
          },
          averageAmount: { $avg: "$amount" },
        },
      },
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Withdrawal.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = stats[0] || {
      totalWithdrawals: 0,
      totalAmount: 0,
      pendingCount: 0,
      processingCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      pendingAmount: 0,
      processingAmount: 0,
      completedAmount: 0,
      cancelledAmount: 0,
      averageAmount: 0,
    };

    return {
      ...result,
      recentActivity,
    };
  }
}