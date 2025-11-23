import express from "express";
import {
  getUnreadNotifications,
  markNotificationRead,
  markAllRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getUnreadNotifications);
router.post("/read/:id", markNotificationRead);
router.post("/read-all", markAllRead);

export default router;
