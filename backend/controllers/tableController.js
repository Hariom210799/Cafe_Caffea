import CafeTable from "../models/CafeTable.js";
import Order from "../models/Order.js";
import Bill from "../models/Bill.js";
import { createNotification } from "./notificationController.js";

// GET all tables with active orders + last bill
export const getTables = async (req, res) => {
  try {
    const tables = await CafeTable.find().sort({ name: 1 }).lean();

    for (let table of tables) {
      table.activeOrders = await Order.find({
        tableName: table.name,
        status: "CONFIRMED",
      }).lean();

      table.lastBill = await Bill.findOne({ tableName: table.name })
        .sort({ createdAt: -1 })
        .lean();
    }

    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD table
export const addTable = async (req, res) => {
  try {
    const table = new CafeTable({
      ...req.body,
      status: "FREE",
      customers: 0,
      activeSince: null,
    });

    await table.save();
    res.json({ message: "Table added", table });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE table (status, capacity, etc.)
export const updateTable = async (req, res) => {
  try {
    const updated = await CafeTable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE table
export const deleteTable = async (req, res) => {
  try {
    await CafeTable.findByIdAndDelete(req.params.id);
    res.json({ message: "Table deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CLEAR TABLE after billing
export const clearTable = async (req, res) => {
  try {
    const table = await CafeTable.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });

    table.status = "FREE";
    table.customers = 0;
    table.activeSince = null;
    table.lastBillId = null;

    await table.save();

    await createNotification({
      type: "TABLE_CLEARED",
      level: "info",
      message: `Table ${table.name} has been cleared.`,
      data: { tableId: table._id },
    });

    res.json({ message: "Table cleared", table });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
