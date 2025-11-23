import mongoose from "mongoose";

const CafeTableSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // "Table 1"

    capacity: { type: Number, default: 2 },

    // NEW — better status control
    status: {
      type: String,
      enum: ["FREE", "OCCUPIED", "BILLING_PENDING", "RESERVED"],
      default: "FREE",
    },

    // NEW — number of customers sitting
    customers: { type: Number, default: 0 },

    // NEW — when table was occupied (for order delay analytics)
    activeSince: { type: Date },

    // NEW — last bill reference
    lastBillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      default: null,
    },

    // NEW — tracking waiter (optional)
    servedBy: { type: String }, // e.g. "Rohan"

    // NEW — auto clear flags
    autoClearAfterBilling: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("CafeTable", CafeTableSchema);
