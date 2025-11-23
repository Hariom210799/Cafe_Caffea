import Order from "../models/Order.js";
import { reduceStock } from "./inventoryController.js";
import Notification from "../models/Notification.js";

// calculate total helper
const calculateTotal = (items) => {
  return Object.values(items).reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );
};

// POST /api/orders/confirm
export const confirmOrder = async (req, res) => {
  try {
    const { tableName, items } = req.body;

    if (!tableName || !items || Object.keys(items).length === 0) {
      return res.status(400).json({ message: "tableName and items required" });
    }

    // convert object → array
    const itemsArray = Object.values(items).map((it) => ({
      name: it.name,
      price: it.price,
      quantity: it.quantity,
    }));

    const totalAmount = calculateTotal(items);

    // determine next batch number
    const lastOrder = await Order.findOne({ tableName }).sort({ batchNumber: -1 });
    const batchNumber = lastOrder ? lastOrder.batchNumber + 1 : 1;

    const order = new Order({
      tableName,
      items: itemsArray,
      totalAmount,
      status: "CONFIRMED",
      batchNumber,
      timeToServe: Date.now() + 15 * 60 * 1000, // 15-minute serving window
    });

    await order.save();

    // Deduct stock
    await reduceStock(items);

    // Serving delay notification (scheduled check)
    setTimeout(async () => {
      const checkOrder = await Order.findById(order._id);
      if (checkOrder && checkOrder.status === "CONFIRMED") {
        await Notification.create({
          type: "DELAY",
          message: `Order for ${tableName} is delayed.`,
          createdAt: new Date(),
        });
      }
    }, 15 * 60 * 1000);

    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ confirmOrder error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET active orders
export const getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "CONFIRMED" }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    console.error("❌ getActiveOrders error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET orders by table
export const getOrdersByTable = async (req, res) => {
  try {
    const { tableName } = req.params;
    const orders = await Order.find({ tableName }).sort({ createdAt: 1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ getOrdersByTable error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Used by billing
export const markOrdersBilledForTable = async (tableName) => {
  try {
    await Order.updateMany(
      { tableName, status: "CONFIRMED" },
      { $set: { status: "BILLED" } }
    );
  } catch (err) {
    console.error("❌ markOrdersBilledForTable error:", err);
  }
};
