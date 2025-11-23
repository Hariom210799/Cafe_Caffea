import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

/**
 * POST /api/orders
 * Create a new order batch OR append batch to existing table
 */
router.post("/", async (req, res) => {
  try {
    const { tableName, items } = req.body;

    if (!tableName || !items?.length) {
      return res.status(400).json({ error: "tableName and items required" });
    }

    let order = await Order.findOne({ tableName, served: false });

    const newBatch = {
      confirmed: true,
      items: items.map((i) => ({
        name: i.name,
        subCategory: i.subCategory || null,
        quantity: i.quantity,
        price: i.price,
        menuItem: i.menuItem || i._id,
      })),
    };

    if (!order) {
      order = await Order.create({
        tableName,
        served: false,
        batches: [newBatch],
      });
    } else {
      order.batches.push(newBatch);
      await order.save();
    }

    res.json(order);
  } catch (err) {
    console.error("❌ Error confirming order:", err);
    res.status(500).json({ error: "Server error confirming order" });
  }
});

/**
 * GET /api/orders
 * Fetch all active (not served) orders
 */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({ served: false }).sort({ createdAt: 1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Server error fetching orders" });
  }
});

/**
 * PATCH /api/orders/:orderId/served
 * Mark entire table as served
 */
router.patch("/:orderId/served", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { served: true },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("❌ Error marking served:", err);
    res.status(500).json({ error: "Server error marking served" });
  }
});

/**
 * PATCH /api/orders/:orderId/add-item
 * Adds a dish to the last batch
 */
router.patch("/:orderId/add-item", async (req, res) => {
  try {
    const { item, batchId } = req.body;

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    let batch = batchId
      ? order.batches.id(batchId)
      : order.batches[order.batches.length - 1];

    if (!batch) {
      batch = {
        confirmed: true,
        items: [],
      };
      order.batches.push(batch);
    }

    batch.items.push({
      name: item.name,
      subCategory: item.subCategory || null,
      price: item.price,
      quantity: item.quantity || 1,
    });

    await order.save();
    res.json(order);
  } catch (err) {
    console.error("❌ Error adding dish:", err);
    res.status(500).json({ error: "Server error adding dish" });
  }
});

/**
 * PATCH /api/orders/:orderId/remove-item
 * Remove individual item from a specific batch
 */
router.patch("/:orderId/remove-item", async (req, res) => {
  try {
    const { batchId, itemId } = req.body;

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const batch = order.batches.id(batchId);
    if (!batch) return res.status(404).json({ error: "Batch not found" });

    const item = batch.items.id(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    item.remove();
    await order.save();

    res.json(order);
  } catch (err) {
    console.error("❌ Error removing item:", err);
    res.status(500).json({ error: "Server error removing item" });
  }
});

export default router;
