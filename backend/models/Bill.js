// backend/models/Bill.js
import mongoose from "mongoose";
import InvoiceCounter from "./InvoiceCounter.js";

const BillItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const BillSchema = new mongoose.Schema(
  {
    tableName: { type: String, required: true },

    items: { type: [BillItemSchema], required: true },

    totalAmount: { type: Number, required: true },

    invoiceNumber: {
      type: String,
      unique: true,
    },

    paymentMethod: {
      type: String,
      enum: ["CASH", "UPI", "CARD", "ONLINE"],
      default: "CASH",
    },

    // ⭐ CORRECT DEFAULT
    status: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED", "REFUNDED"],
      default: "PENDING",
    },

    discount: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },

    relatedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

    customerName: { type: String },
  },
  { timestamps: true }
);

// Auto-generate invoice number
BillSchema.pre("save", async function (next) {
  if (this.invoiceNumber) return next();

  const year = new Date().getFullYear();
  let counter = await InvoiceCounter.findOne({ year });

  if (!counter) {
    counter = await InvoiceCounter.create({ year, lastNumber: 0 });
  }

  counter.lastNumber += 1;
  await counter.save();

  this.invoiceNumber = `CAF-${year}-${String(counter.lastNumber).padStart(5, "0")}`;
  next();
});

export default mongoose.models.Bill || mongoose.model("Bill", BillSchema);
