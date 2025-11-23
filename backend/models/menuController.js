import Menu from "../models/Menu.js";

// ===================================================
// GET all categories (distinct category names)
// ===================================================
export const getCategories = async (req, res) => {
  try {
    const categories = await Menu.distinct("category");
    res.json(categories);
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    res.status(500).json({ message: "Failed to get categories" });
  }
};

// ===================================================
// GET all menu items
// ===================================================
export const getMenu = async (req, res) => {
  try {
    const items = await Menu.find();
    res.json(items);
  } catch (err) {
    console.error("GET MENU ERROR:", err);
    res.status(500).json({ message: "Failed to get menu" });
  }
};

// ===================================================
// GET menu items by category
// ===================================================
export const getMenuByCategory = async (req, res) => {
  try {
    const items = await Menu.find({ category: req.params.category });
    res.json(items);
  } catch (err) {
    console.error("GET CATEGORY MENU ERROR:", err);
    res.status(500).json({ message: "Failed to get menu by category" });
  }
};

// ===================================================
// ADD new menu item
// ===================================================
export const addMenuItem = async (req, res) => {
  try {
    // Ensure subCategory always exists
    if (!req.body.subCategory) {
      req.body.subCategory = "";
    }

    const newItem = new Menu(req.body);
    await newItem.save();

    res.json({ message: "Menu item added", item: newItem });
  } catch (err) {
    console.error("ADD MENU ERROR:", err);

    // Handle duplicate (name + subCategory)
    if (err.code === 11000) {
      return res.status(400).json({
        message: "An item with the same name and sub category already exists."
      });
    }

    res.status(500).json({
      message: "Failed to add menu item",
      error: err.message,
    });
  }
};

// ===================================================
// UPDATE a menu item
// ===================================================
export const updateMenuItem = async (req, res) => {
  try {
    // Ensure subCategory always exists
    if (!req.body.subCategory) {
      req.body.subCategory = "";
    }

    const updated = await Menu.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Safe update
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("UPDATE MENU ERROR:", err);

    // Handle duplicate (name + subCategory)
    if (err.code === 11000) {
      return res.status(400).json({
        message: "An item with this name and sub category already exists."
      });
    }

    res.status(500).json({
      message: "Failed to update menu item",
      error: err.message,
    });
  }
};

// ===================================================
// DELETE a menu item
// ===================================================
export const deleteMenuItem = async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error("DELETE MENU ERROR:", err);
    res.status(500).json({ message: "Failed to delete menu item" });
  }
};
