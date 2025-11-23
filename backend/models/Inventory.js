import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true }, // Packets, Jars, Kg, etc.
    quantityAvailable: { type: Number, required: true },
    reorderLevel: { type: Number, default: 5 }, // Low stock warning
  },
  { timestamps: true }
);

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", InventorySchema);
