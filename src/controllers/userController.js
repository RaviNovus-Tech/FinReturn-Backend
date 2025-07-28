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
      affiliates,
      "User affiliates retrieved successfully"
    );
  });
}
