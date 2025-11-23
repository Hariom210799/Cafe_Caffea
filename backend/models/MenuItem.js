import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, default: "" }, // OPTIONAL
    price: { type: Number, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Menu", menuSchema);
