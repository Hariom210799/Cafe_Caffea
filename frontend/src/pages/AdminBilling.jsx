// src/pages/AdminBilling.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Paper, Divider, Button, Chip } from "@mui/material";
import axios from "axios";
import { fetchAllBills } from "../api";
import { useCart } from "../context/CartContext";

const API_URL = "http://localhost:5000/api";

const AdminBilling = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  const { clearTable } = useCart();

  // ============================
  // LOAD ONLY PENDING BILLS
  // ============================
  const loadBills = async () => {
    try {
      setLoading(true);
      const res = await fetchAllBills();

      // ⭐ SHOW ONLY PENDING BILLS
      const pendingBills = (res.data || []).filter(
        (b) => b.status === "PENDING"
      );

      setBills(pendingBills);
    } catch (err) {
      console.error("Error loading bills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  // ============================
  // GROUP BILLS BY TABLE NAME
  // ============================
  const groupedBills = useMemo(() => {
    const map = new Map();

    bills.forEach((bill) => {
      const tableName = bill.tableName || "Unknown Table";

      if (!map.has(tableName)) {
        map.set(tableName, {
          tableName,
          bills: [],
          mergedItemsMap: new Map(),
        });
      }

      const group = map.get(tableName);
      group.bills.push(bill);

      (bill.items || []).forEach((it) => {
        const key = `${it.name}`;
        const existing = group.mergedItemsMap.get(key);

        if (!existing) {
          group.mergedItemsMap.set(key, { ...it });
        } else {
          existing.quantity += it.quantity;
        }
      });
    });

    return Array.from(map.values()).map((group) => {
      const mergedItems = Array.from(group.mergedItemsMap.values());
      const totalAmount = mergedItems.reduce(
        (sum, it) => sum + it.price * it.quantity,
        0
      );

      return {
        tableName: group.tableName,
        bills: group.bills,
        items: mergedItems,
        totalAmount,
      };
    });
  }, [bills]);

  // ============================
  // PRINT & PAY HANDLER
  // ============================
  const handlePrintAndPay = async (group) => {
    const { tableName, items, totalAmount, bills: groupBills } = group;

    const now = new Date();
    const dateDisplay = now.toLocaleString();

    // ---------- PRINT BILL ----------
    let html = `
      <html>
        <head>
          <title>Cafe Caffea Bill</title>
          <style>
            body { font-family: Arial; padding: 20px; color: #333; }
            h2 { text-align: center; margin-bottom: 5px; }
            .center { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;}
            th, td { padding: 8px; border-bottom: 1px solid #ccc; }
            th { background: #f4f4f4; }
            .total-row td { font-weight: bold; border-top: 2px solid #000; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <h2>Cafe Caffea</h2>
          <div class="center">Where Flavor Meets Comfort</div>
          <div class="center">------------------------------------</div>

          <p><strong>Table:</strong> ${tableName}</p>
          <p><strong>Date:</strong> ${dateDisplay}</p>

          <table>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Amount (₹)</th>
            </tr>
    `;

    items.forEach((it) => {
      html += `
        <tr>
          <td>${it.name}</td>
          <td>${it.quantity}</td>
          <td>${(it.price * it.quantity).toFixed(2)}</td>
        </tr>
      `;
    });

    html += `
          <tr class="total-row">
            <td>Total</td>
            <td></td>
            <td>₹ ${totalAmount.toFixed(2)}</td>
          </tr>
        </table>

        <div class="footer">
          Thank you for dining with Cafe Caffea!<br/>
          Visit Again 🤎
        </div>
      </body>
    </html>
    `;

    const printWindow = window.open("", "", "width=600,height=800");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }

    // ---------- UPDATE STATUS TO PAID ----------
    try {
      await Promise.all(
        groupBills.map((b) =>
          axios.patch(`${API_URL}/billing/markPaid/${b._id}`)
        )
      );

      // ⭐ Remove the card instantly (NO DELAY)
      setBills((prev) => prev.filter((b) => b.tableName !== tableName));

      // Clear the cart for that table
      clearTable(tableName);

      // Sync after 300ms
      setTimeout(() => loadBills(), 300);
    } catch (err) {
      console.error("Error marking bill as paid:", err);
      alert("Bills were printed but payment failed to update status.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0d1f1b,#14312c)",
        p: { xs: 3, md: 8 },
        color: "#f1e8d2",
      }}
    >
      <Typography
        variant="h3"
        textAlign="center"
        sx={{ fontWeight: "bold", color: "#d6ad60", mb: 4 }}
      >
        Pending Bills
      </Typography>

      {loading && (
        <Typography textAlign="center" sx={{ color: "#cfc7b1" }}>
          Loading bills...
        </Typography>
      )}

      {!loading && groupedBills.length === 0 && (
        <Typography textAlign="center" sx={{ color: "#cfc7b1" }}>
          No pending bills 🎉
        </Typography>
      )}

      {!loading &&
        groupedBills.map((group) => (
          <Paper
            key={group.tableName}
            sx={{
              p: 4,
              mb: 4,
              backgroundColor: "#1b3a34",
              borderRadius: 3,
              color: "#f1e8d2",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Typography variant="h5" sx={{ color: "#d6ad60" }}>
                {group.tableName}
              </Typography>

              <Chip
                label="Pending Payment"
                sx={{
                  backgroundColor: "#ffb300",
                  color: "#1b1b1b",
                  fontWeight: "bold",
                }}
              />
            </Box>

            <Divider sx={{ mb: 2, borderColor: "#d6ad60" }} />

            {group.items.map((item) => (
              <Box
                key={item.name}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1.2,
                }}
              >
                <Typography>{item.name} × {item.quantity}</Typography>
                <Typography sx={{ color: "#d6ad60" }}>
                  ₹ {(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ mb: 2, mt: 2, borderColor: "#d6ad60" }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" sx={{ color: "#d6ad60" }}>
                Total: ₹ {group.totalAmount.toFixed(2)}
              </Typography>

              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#d6ad60",
                  color: "#1b3a34",
                  fontWeight: "bold",
                }}
                onClick={() => handlePrintAndPay(group)}
              >
                Print & Pay
              </Button>
            </Box>
          </Paper>
        ))}
    </Box>
  );
};

export default AdminBilling;
