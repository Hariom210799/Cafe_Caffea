// backend/routes/billingRoutes.js
import express from "express";
import {
  createBill,
  getAllBills,
  markBillPaid,
} from "../controllers/billingController.js";
import Bill from "../models/Bill.js";

const router = express.Router();

router.post("/create", createBill);
router.get("/all", getAllBills);

// Mark bill as paid
router.patch("/markPaid/:id", markBillPaid);

// Get single bill
router.get("/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });

    res.json({ success: true, bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete bill
router.delete("/:id", async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });

    return res.json({ success: true, message: "Bill deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
