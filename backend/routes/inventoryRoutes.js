import express from "express";
import {
  addInventoryItem,
  getInventory,
  lowStockItems,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.post("/add", addInventoryItem);
router.get("/", getInventory);
router.get("/low-stock", lowStockItems);

export default router;
