// backend/routes/historyRoutes.js
import express from "express";
import {
  getHistoryBills,
  getHistorySummary,
  getHistoryTrend
} from "../controllers/historyController.js";

const router = express.Router();

// Bills list (with filters)
router.get("/bills", getHistoryBills);

// Summary (with filters)
router.get("/summary", getHistorySummary);

// Revenue trend
router.get("/trend", getHistoryTrend);

export default router;
