import express from "express";
import {
  getTables,
  addTable,
  updateTable,
  deleteTable,
} from "../controllers/tableController.js";

import CafeTable from "../models/CafeTable.js";

const router = express.Router();

// Get all tables
router.get("/", getTables);

// Create new table
router.post("/", addTable);

// Update table
router.put("/:id", updateTable);

// Delete table
router.delete("/:id", deleteTable);

/* -----------------------------------------------
   SEED TABLES (RUN ONLY ONCE AFTER DEPLOY)
------------------------------------------------ */
router.post("/seed", async (req, res) => {
  try {
    const tables = [
      { name: "Table 1", capacity: 4 },
      { name: "Table 2", capacity: 4 },
      { name: "Table 3", capacity: 4 },
      { name: "Table 4", capacity: 4 },
      { name: "Table 5", capacity: 4 },
      { name: "Table 6", capacity: 4 },
      { name: "Table 7", capacity: 4 },
      { name: "Table 8", capacity: 4 },
    ];

    // Remove any existing tables
    await CafeTable.deleteMany({});

    // Insert fresh ones
    const created = await CafeTable.insertMany(tables);

    res.json({
      success: true,
      message: "Tables seeded successfully",
      tables: created,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
