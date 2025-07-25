import express from "express";
const router = express.Router();

import authRoutes from "./authRoutes.js";
import packageRoutes from "./packageRoutes.js";
import userRoutes from "./userRoutes.js";
import subscriptionRoutes from "./subscriptionsRoutes.js";
import roiHistoryRoutes from "./roiHistoryRoutes.js";

// Use routes
router.use("/auth", authRoutes);
router.use("/packages", packageRoutes);
router.use("/users", userRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/roi", roiHistoryRoutes);


export default router;
