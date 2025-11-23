// backend/controllers/billingController.js
import Bill from "../models/Bill.js";

// ===============================
// CREATE BILL (Always PENDING)
// ===============================
export const createBill = async (req, res) => {
  try {
    const {
      tableName,
      items,
      totalAmount,
      relatedOrders,
      paymentMethod,
      discount,
      serviceCharge,
      customerName,
    } = req.body;

    if (!tableName) return res.status(400).json({ success: false, message: "tableName is required" });

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ success: false, message: "items must be a non-empty array" });

    const cleanItems = items.map((it) => ({
      name: it.name,
      price: Number(it.price),
      quantity: Number(it.quantity),
    }));

    const bill = new Bill({
      tableName,
      items: cleanItems,
      totalAmount: Number(totalAmount),
      relatedOrders: relatedOrders || [],
      paymentMethod: paymentMethod || "CASH",

      // ⭐ Always start as PENDING
      status: "PENDING",

      discount: discount || 0,
      serviceCharge: serviceCharge || 0,
      customerName: customerName || "",
    });

    await bill.save();

    return res.status(201).json({ success: true, bill });
  } catch (err) {
    console.error("Error creating bill:", err);
    return res.status(500).json({
      success: false,
      message: "Error creating bill",
      error: err.message,
    });
  }
};

// ===============================
// GET ALL BILLS
// ===============================
export const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    return res.json(bills);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// MARK BILL AS PAID
// ===============================
export const markBillPaid = async (req, res) => {
  try {
    const updated = await Bill.findByIdAndUpdate(
      req.params.id,
      { status: "PAID" },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Bill not found" });

    res.json({ success: true, bill: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
