// src/pages/ConfirmOrder.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api"; // ✅ correct API

const ConfirmOrder = () => {
  const navigate = useNavigate();

  // only use confirmOrder from CartContext to update local state
  const { tables, selectedTable, confirmOrder: confirmLocalOrder } = useCart();

  const [checked, setChecked] = useState(false);

  const tableData = tables[selectedTable];

  // ================= NO TABLE / NO ORDER STATE =================
  if (!selectedTable || !tableData)
    return (
      <Box sx={{ p: 5, color: "#f1e8d2", textAlign: "center" }}>
        <Typography variant="h5">No table or order found.</Typography>
        <Button
          sx={{ mt: 3, backgroundColor: "#d6ad60", color: "#1b3a34" }}
          // ⬅ here we ONLY navigate, NO reset
          onClick={() => navigate("/menu")}
        >
          Back to Menu
        </Button>
      </Box>
    );

  const activeBatch = tableData.orders.find((b) => !b.confirmed);
  const confirmedBatches = tableData.orders.filter((b) => b.confirmed);

  const calcTotal = (orders) =>
    orders.reduce(
      (sum, batch) =>
        sum +
        Object.values(batch.items).reduce(
          (s, i) => s + i.price * i.quantity,
          0
        ),
      0
    );

  const totalAmount = calcTotal(tableData.orders);

  // ================= CONFIRM HANDLER =================
  const handleConfirm = async () => {
    try {
      if (activeBatch && Object.keys(activeBatch.items).length > 0) {
        const itemsArray = Object.values(activeBatch.items).map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          subCategory: i.subCategory || null,
          menuItem: i._id,
        }));

        console.log("📤 Sending to backend:", itemsArray);

        // send to backend
        await createOrder(selectedTable, itemsArray);
      }

      // update local cart state (marks batch as confirmed in context)
      confirmLocalOrder(selectedTable);

      // 🔥 HARD REFRESH: everything in MenuPage resets
      window.location.href = "/menu"; // full reload, not SPA navigate
    } catch (err) {
      console.error("❌ Error confirming order:", err);
      alert("Something went wrong while placing your order. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0d1f1b 0%,#14312c 100%)",
        p: { xs: 3, md: 8 },
      }}
    >
      <Typography
        variant="h3"
        sx={{
          textAlign: "center",
          mb: 4,
          color: "#d6ad60",
          fontWeight: "bold",
        }}
      >
        Confirm Your Order
      </Typography>

      {/* ========= PREVIOUS CONFIRMED BATCHES ========= */}
      {confirmedBatches.map((batch, idx) => (
        <Paper
          key={batch.id}
          sx={{
            p: 4,
            mb: 3,
            backgroundColor: "#1b3a34",
            color: "#f1e8d2",
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: "#d6ad60" }}>
            Batch {idx + 1} (Confirmed)
          </Typography>
          <Divider sx={{ my: 1, borderColor: "#d6ad60" }} />
          {Object.values(batch.items).map((it) => (
            <Box
              key={it.name}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography>{it.name}</Typography>
              <Typography>
                ×{it.quantity} — ${(it.price * it.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}
        </Paper>
      ))}

      {/* ========= ACTIVE BATCH TO CONFIRM ========= */}
      {activeBatch && Object.keys(activeBatch.items).length > 0 && (
        <Paper
          sx={{
            p: 4,
            backgroundColor: "#1b3a34",
            color: "#f1e8d2",
            borderRadius: 3,
            mb: 4,
          }}
        >
          <Typography variant="h6" sx={{ color: "#d6ad60" }}>
            New Items To Confirm
          </Typography>
          <Divider sx={{ my: 1, borderColor: "#d6ad60" }} />

          {Object.values(activeBatch.items).map((it) => (
            <Box
              key={it.name}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography>{it.name}</Typography>
              <Typography>
                ×{it.quantity} — ₹{(it.price * it.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}

          <Divider sx={{ borderColor: "#d6ad60", mt: 2, mb: 2 }} />

          <Typography
            variant="h6"
            sx={{
              color: "#d6ad60",
              textAlign: "right",
              mb: 2,
              fontWeight: "bold",
            }}
          >
            Total Amount: ₹{totalAmount.toFixed(2)}
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                sx={{
                  color: "#d6ad60",
                  "&.Mui-checked": { color: "#d6ad60" },
                }}
              />
            }
            label={
              <Typography sx={{ color: "#f1e8d2" }}>
                Please re-check your order before placing it.
              </Typography>
            }
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3,
              gap: 2,
            }}
          >
            {/* SOFT RETURN: keep table & cart state */}
            <Button
              variant="outlined"
              onClick={() => navigate("/menu")}
              sx={{
                color: "#d6ad60",
                borderColor: "#d6ad60",
                fontWeight: "bold",
                borderRadius: "1rem",
                "&:hover": { borderColor: "#e8d5b7", color: "#e8d5b7" },
              }}
            >
              ⬅ Back to Menu
            </Button>

            {/* HARD RETURN: full reset via reload */}
            <Button
              variant="contained"
              disabled={!checked}
              onClick={handleConfirm}
              sx={{
                backgroundColor: checked ? "#d6ad60" : "#857a58",
                color: "#1b3a34",
                fontWeight: "bold",
                borderRadius: "1rem",
                px: 3,
                "&:hover": {
                  backgroundColor: checked ? "#e8d5b7" : "#857a58",
                },
              }}
            >
              Confirm This Order
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ConfirmOrder;
