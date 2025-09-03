import { asyncHandler } from "../middlewares/errorHandler.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";

export default class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  getAllUsers = asyncHandler(async (req, res) => {
    const users = await this.userService.getAllUsers();
    return ResponseHandler.success(res, users, "Users retrieved successfully");
  });

  getUserAffiliatesByID = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const affiliates = await this.userService.getUserAffiliatesByID(userId);
    return ResponseHandler.success(
      res,
      {
        userId,
        affiliates,
        totalAffiliates: affiliates.length,
      },
      "User affiliates retrieved successfully"
    );
  });
  getAffiliatesWithHistory = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const affiliatesWithHistory =
      await this.userService.getAffiliatesWithHistory(userId);
    return ResponseHandler.success(
      res,
      {
        userId,
        affiliates: affiliatesWithHistory,
        totalAffiliates: affiliatesWithHistory.length,
      },
      "User affiliates with history retrieved successfully"
    );
  });
}
