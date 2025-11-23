import mongoose from "mongoose";

const MenuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },   // ❗ removed unique

    category: { type: String, required: true },

    subCategory: { type: String, default: "" },

    price: { type: Number, required: true },

    description: { type: String, default: "" },

    image: { type: String, default: "" },

    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Create unique combination – name + subCategory
MenuSchema.index({ name: 1, subCategory: 1 }, { unique: true });

export default mongoose.model("Menu", MenuSchema);
