// backend/models/InvoiceCounter.js
import mongoose from "mongoose";

const InvoiceCounterSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  lastNumber: { type: Number, default: 0 }
});

export default mongoose.models.InvoiceCounter ||
  mongoose.model("InvoiceCounter", InvoiceCounterSchema);
