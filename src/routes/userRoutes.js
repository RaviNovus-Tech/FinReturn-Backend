import express from "express";
import UserService from "../services/userService.js";
import UserController from "../controllers/userController.js";

const router = express.Router();
const userService = new UserService();
const userController = new UserController(userService);

router.get("/", userController.getAllUsers);
router.get("/:id/affiliates", userController.getUserAffiliatesByID);
router.get("/:id/affiliates/history", userController.getAffiliatesWithHistory);

export default router;
