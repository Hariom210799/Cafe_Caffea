// backend/controllers/historyController.js
import Bill from "../models/Bill.js";

// ----------------------------------------------------
// 📌 1. GET FILTERED BILLS (for table list)
// ----------------------------------------------------
export const getHistoryBills = async (req, res) => {
  try {
    const { range, from, to, search, payment, status } = req.query;

    let filter = {};

    // STATUS filter
    if (status && status !== "ALL") {
      filter.status = status;
    }

    // PAYMENT filter
    if (payment && payment !== "ALL") {
      filter.paymentMethod = payment;
    }

    // SEARCH filter
    if (search) {
      filter.$or = [
        { invoiceNumber: new RegExp(search, "i") },
        { tableName: new RegExp(search, "i") },
        { customerName: new RegExp(search, "i") },
      ];
    }

    // DATE RANGE filter
    const now = new Date();
    let startDate = null;

    switch (range) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;

      case "week":
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;

      case "month":
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        break;

      case "quarter":
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 3);
        break;

      case "half-year":
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 6);
        break;

      case "year":
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
        break;

      case "custom":
        if (from && to) {
          filter.createdAt = {
            $gte: new Date(from),
            $lte: new Date(to),
          };
        }
        break;

      default:
        break;
    }

    if (startDate) {
      filter.createdAt = {
        $gte: startDate,
        $lte: now,
      };
    }

    const bills = await Bill.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, bills });
  } catch (err) {
    console.error("History Bills Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ----------------------------------------------------
// 📌 2. SUMMARY (with date-range support)
// ----------------------------------------------------
export const getHistorySummary = async (req, res) => {
  try {
    const { range, from, to } = req.query;

    let filter = { status: "PAID" };
    const now = new Date();
    let startDate = null;

    switch (range) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;

      case "week":
        startDate = new Date();
        startDate.setDate(now.getDate() - 7);
        break;

      case "month":
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 1);
        break;

      case "quarter":
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 3);
        break;

      case "half-year":
        startDate = new Date();
        startDate.setMonth(now.getMonth() - 6);
        break;

      case "year":
        startDate = new Date();
        startDate.setFullYear(now.getFullYear() - 1);
        break;

      case "custom":
        if (from && to) {
          filter.createdAt = {
            $gte: new Date(from),
            $lte: new Date(to),
          };
        }
        break;

      default:
        break;
    }

    if (startDate) {
      filter.createdAt = {
        $gte: startDate,
        $lte: now,
      };
    }

    const bills = await Bill.find(filter);

    // SUMMARY FIELDS
    const totalRevenue = bills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalOrders = bills.length;
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    // Best-selling item
    const itemStats = {};

    bills.forEach((bill) => {
      bill.items.forEach((item) => {
        if (!itemStats[item.name]) itemStats[item.name] = 0;
        itemStats[item.name] += item.quantity;
      });
    });

    const bestItem =
      Object.entries(itemStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    res.json({
      success: true,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      bestItem,
    });
  } catch (err) {
    console.error("History Summary Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ----------------------------------------------------
// 📌 3. REVENUE TREND FOR LINE GRAPH
// ----------------------------------------------------
export const getHistoryTrend = async (req, res) => {
  try {
    const bills = await Bill.find({ status: "PAID" }).sort({ createdAt: 1 });

    const trendMap = {};

    bills.forEach((bill) => {
      const date = bill.createdAt.toISOString().slice(0, 10); // yyyy-mm-dd
      if (!trendMap[date]) trendMap[date] = 0;
      trendMap[date] += bill.totalAmount;
    });

    const trend = Object.entries(trendMap).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    res.json({ success: true, trend });
  } catch (err) {
    console.error("Trend Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
