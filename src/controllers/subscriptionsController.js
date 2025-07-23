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
