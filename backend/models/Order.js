import mongoose from "mongoose";

/* ---------------------------------------------
   ITEM inside a batch
--------------------------------------------- */
const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subCategory: { type: String, default: null },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: false },
  },
  { timestamps: true }
);

/* ---------------------------------------------
   BATCH for each order cycle (Confirmed cart)
--------------------------------------------- */
const BatchSchema = new mongoose.Schema(
  {
    confirmed: { type: Boolean, default: true },
    items: [ItemSchema],
  },
  { timestamps: true }
);

/* ---------------------------------------------
   ORDER for each table
--------------------------------------------- */
const OrderSchema = new mongoose.Schema(
  {
    tableName: { type: String, required: true },

    // multiple confirmed batches
    batches: [BatchSchema],

    // admin marks served
    served: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
