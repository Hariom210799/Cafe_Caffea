import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "LOW_STOCK",
        "ORDER_DELAY",
        "BILL_PAID",
        "INVENTORY_UPDATED",
        "SUPPLIER_ALERT",
        "HIGH_REVENUE",
        "NEW_ORDER",
        "SYSTEM_ALERT",
      ],
      required: true,
    },

    message: { type: String, required: true },

    level: {
      type: String,
      enum: ["info", "warning", "success", "error"],
      default: "info",
    },

    data: { type: Object }, // Extra info (tableName, orderId, itemId, stock, billId)

    isRead: { type: Boolean, default: false },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // auto-delete after 7 days
    },
  },
  { timestamps: true }
);

// Auto-delete expired notifications
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Notification", NotificationSchema);
