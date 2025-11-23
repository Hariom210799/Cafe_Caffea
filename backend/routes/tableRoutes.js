import express from "express";
import {
  getTables,
  addTable,
  updateTable,
  deleteTable,
} from "../controllers/tableController.js";

const router = express.Router();

router.get("/", getTables);
router.post("/", addTable);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);

export default router;
