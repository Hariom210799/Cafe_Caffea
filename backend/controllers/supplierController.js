import Supplier from "../models/Supplier.js";
import { createNotification } from "./notificationController.js";

// GET all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ supplierName: 1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD new supplier
export const addSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();

    res.json({ message: "Supplier added", supplier });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE supplier
export const updateSupplier = async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE supplier
export const deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: "Supplier deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD a purchase entry (Admin logs a new supply)
export const addPurchase = async (req, res) => {
  try {
    const { supplierId, items, totalAmount, paymentStatus } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    // Add purchase entry
    supplier.purchaseHistory.push({
      items,
      totalAmount,
      paymentStatus,
      date: new Date(),
    });

    supplier.lastOrderAmount = totalAmount;
    supplier.totalAmountPurchased += totalAmount;
    supplier.paymentStatus = paymentStatus;

    // Update outstanding amount
    if (paymentStatus === "Pending") {
      supplier.outstandingAmount += totalAmount;
    } else if (paymentStatus === "Partially Paid") {
      supplier.outstandingAmount += totalAmount / 2;
    }

    await supplier.save();

    // Create notification
    await createNotification({
      type: "SUPPLIER_ALERT",
      level: "info",
      message: `New purchase added from ${supplier.supplierName}.`,
      data: { supplierId: supplier._id, totalAmount },
    });

    res.json({ success: true, supplier });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PAY supplier
export const paySupplier = async (req, res) => {
  try {
    const { supplierId, amountPaid } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    supplier.outstandingAmount -= amountPaid;

    if (supplier.outstandingAmount <= 0) {
      supplier.outstandingAmount = 0;
      supplier.paymentStatus = "Paid";
    } else {
      supplier.paymentStatus = "Partially Paid";
    }

    await supplier.save();

    await createNotification({
      type: "SUPPLIER_ALERT",
      level: "success",
      message: `Payment of ₹${amountPaid} made to ${supplier.supplierName}.`,
      data: { supplierId: supplier._id },
    });

    res.json({ success: true, supplier });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
