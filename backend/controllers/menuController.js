import Menu from "../models/Menu.js";

// GET all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Menu.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all menu items
export const getMenu = async (req, res) => {
  try {
    const items = await Menu.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET items by category
export const getMenuByCategory = async (req, res) => {
  try {
    const items = await Menu.find({ category: req.params.category });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD new menu item
export const addMenuItem = async (req, res) => {
  try {
    const item = new Menu(req.body);
    await item.save();
    res.json({ message: "Menu item added", item });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE menu item
export const updateMenuItem = async (req, res) => {
  try {
    const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: "Menu item updated", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE menu item
export const deleteMenuItem = async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
