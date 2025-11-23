import Inventory from "../models/Inventory.js";

export const addInventoryItem = async (req, res) => {
  try {
    const { itemName, category, unit, quantityAvailable, reorderLevel } =
      req.body;

    if (!itemName || !category || !unit || !quantityAvailable)
      return res.status(400).json({ message: "Missing fields" });

    const item = await Inventory.create({
      itemName,
      category,
      unit,
      quantityAvailable,
      reorderLevel,
    });

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const lowStockItems = async (req, res) => {
  try {
    const items = await Inventory.find({
      $expr: { $lte: ["$quantityAvailable", "$reorderLevel"] },
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
