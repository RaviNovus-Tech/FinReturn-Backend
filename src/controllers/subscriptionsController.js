import { uploadImageToCloudinary } from "../utils/cloudnary.js";
import { ResponseHandler } from "../utils/ResponseHandler.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

export default class SubscriptionController {
  constructor(subscriptionService) {
    this.subscriptionService = subscriptionService;
  }

  getAllSubscriptions = asyncHandler(async (req, res) => {
    const subscriptions = await this.subscriptionService.getAllSubscriptions();
    return ResponseHandler.success(
      res,
      subscriptions,
      "Subscriptions retrieved successfully"
    );
  });

  getSubscriptionByUserId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const subscription = await this.subscriptionService.getSubscriptionByUserId(
      id
    );
    if (!subscription) {
      return ResponseHandler.error(
        res,
        "Subscription not found for this user",
        404
      );
    }
    return ResponseHandler.success(
      res,
      subscription,
      "Subscription retrieved successfully"
    );
  });

  handleSubscriptionAction = asyncHandler(async (req, res) => {
    const subscription =
      await this.subscriptionService.handleSubscriptionAction(req.body);

    return ResponseHandler.success(
      res,
      subscription,
      "Subscription action handled successfully"
    );
  });

  createSubscription = asyncHandler(async (req, res) => {
    let paymentProof = null;

    if (req.file?.buffer) {
      try {
        paymentProof = await uploadImageToCloudinary(req.file.buffer);
      } catch (error) {
        console.warn("Cloudinary upload failed:", error.message);
      }
    }

    const subscriptionData = req.body;
    const newSubscription = await this.subscriptionService.createSubscription(
      subscriptionData,
      paymentProof
    );

    return ResponseHandler.success(
      res,
      newSubscription,
      "Subscription created successfully",
      201
    );
  });
}
