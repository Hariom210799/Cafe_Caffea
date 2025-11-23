import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
  {
    supplierName: { type: String, required: true, unique: true },

    categoriesSupplied: {
      type: [String], // ["Veggies", "Milk Product"]
      default: [],
    },

    contactNo: { type: String },
    shopAddress: { type: String },

    // Total amount of the last order made from this supplier
    lastOrderAmount: { type: Number, default: 0 },

    // NEW — Track outstanding balance (auto alerts)
    outstandingAmount: { type: Number, default: 0 },

    // NEW — Track how much we have purchased from this supplier overall
    totalAmountPurchased: { type: Number, default: 0 },

    // NEW — Track payment status
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Partially Paid"],
      default: "Pending",
    },

    // NEW — Full purchase history, used in analytics
    purchaseHistory: [
      {
        date: { type: Date, default: Date.now },
        items: [
          {
            itemName: String,
            quantity: Number,
            unit: String,
            pricePerUnit: Number,
          },
        ],
        totalAmount: Number,
        paymentStatus: String,
      },
    ],

    // NEW — Rating supplier performance (optional for admin)
    rating: { type: Number, min: 1, max: 5, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", SupplierSchema);
