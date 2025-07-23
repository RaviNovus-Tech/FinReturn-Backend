import { asyncHandler } from "../middlewares/errorHandler.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";

export default class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = asyncHandler(async (req, res) => {
    const { user, token } = await this.authService.register(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return ResponseHandler.success(
      res,
      user,
      "User registered successfully",
      201
    );
  });

  login = asyncHandler(async (req, res) => {
    const result = await this.authService.login(req.body);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return ResponseHandler.success(res, result.user, "Login successful");
  });

  logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return ResponseHandler.success(res, null, "Logout successful");
  });

  sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    await this.authService.sendOtp(email);
    return ResponseHandler.success(res, null, "OTP sent to your email");
  });

  getReferralInfo = asyncHandler(async (req, res) => {
    const referralInfo = await this.authService.getReferralInfo(req.user.id);

    return ResponseHandler.success(
      res,
      referralInfo,
      "Referral information retrieved successfully"
    );
  });

  validateReferralCode = asyncHandler(async (req, res) => {
    const { referralCode } = req.params;
    const result = await this.authService.validateReferralCode(referralCode);

    return ResponseHandler.success(res, result, "Referral code validated");
  });
}
