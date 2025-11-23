// src/pages/AdminInventory.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Button,
  Modal,
  TextField,
  MenuItem,
} from "@mui/material";

import {
  fetchInventory,
  fetchLowStock,
  createInventoryItem,
} from "../api";

const gold = "#d6ad60";
const darkCard = "#0d423a";
const darkBg = "linear-gradient(180deg,#0d1f1b 0%,#14312c 100%)";

const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);

  const [formData, setFormData] = useState({
    itemName: "",
    quantityAvailable: "",
    unit: "",
    category: "",
  });

  // -------------------------------------------------------
  // LOAD DATA
  // -------------------------------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const [invRes, lowRes] = await Promise.all([
          fetchInventory(),
          fetchLowStock(),
        ]);

        setItems(invRes.data || []);
        setLowStock(lowRes.data || []);
      } catch (err) {
        console.error("Error loading inventory:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // -------------------------------------------------------
  // HANDLE INPUT
  // -------------------------------------------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -------------------------------------------------------
  // ADD ITEM
  // -------------------------------------------------------
  const handleAddItem = async () => {
    if (!formData.itemName || !formData.quantityAvailable) {
      alert("Please fill all fields!");
      return;
    }

    try {
      await createInventoryItem(formData);
      window.location.reload();
    } catch (err) {
      console.error("Add item error:", err);
      alert("Failed to add item");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: darkBg,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: gold }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: darkBg,
        p: { xs: 3, md: 8 },
        color: "white",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 5,
          alignItems: "center",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: gold,
            fontWeight: "bold",
            letterSpacing: "0.05em",
          }}
        >
          Inventory Overview
        </Typography>

        <Button
          variant="contained"
          sx={{
            background: gold,
            color: "#000",
            borderRadius: "20px",
            px: 3,
            fontWeight: "bold",
            textTransform: "none",
            "&:hover": { background: "#e9c77c" },
          }}
          onClick={() => setOpenModal(true)}
        >
          + Add Item
        </Button>
      </Box>

      {/* ALL ITEMS CARD */}
      <Paper
        sx={{
          background: darkCard,
          borderRadius: "25px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          p: 4,
          mb: 5,
          color: "white",
          maxWidth: "900px",
          mx: "auto",
        }}
      >
        <Typography variant="h5" sx={{ color: gold, fontWeight: "bold", mb: 2 }}>
          All Stock Items
        </Typography>

        {items.length === 0 ? (
          <Typography>No inventory records yet.</Typography>
        ) : (
          items.map((it) => (
            <Box
              key={it._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #ffffff22",
                py: 1.5,
              }}
            >
              <Typography>
                {it.itemName} ({it.category}) — {it.unit}
              </Typography>
              <Typography sx={{ color: gold }}>
                {it.quantityAvailable}
              </Typography>
            </Box>
          ))
        )}
      </Paper>

      {/* LOW STOCK CARD */}
      <Paper
        sx={{
          background: darkCard,
          borderRadius: "25px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          p: 4,
          color: "white",
          maxWidth: "900px",
          mx: "auto",
        }}
      >
        <Typography variant="h5" sx={{ color: gold, fontWeight: "bold", mb: 2 }}>
          Low Stock Alerts
        </Typography>

        {lowStock.length === 0 ? (
          <Typography>All good. No low stock items 💚</Typography>
        ) : (
          lowStock.map((it) => (
            <Box
              key={it._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.5,
              }}
            >
              <Typography>{it.itemName}</Typography>
              <Chip
                label={`${it.quantityAvailable} left`}
                sx={{
                  background: gold,
                  color: "#000",
                  fontWeight: "bold",
                }}
              />
            </Box>
          ))
        )}
      </Paper>

      {/* =======================================================
          ADD ITEM MODAL
      ======================================================== */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            width: "450px",
            background: darkCard,
            color: "white",
            borderRadius: "25px",
            p: 4,
            mx: "auto",
            mt: "10vh",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <Typography variant="h5" sx={{ color: gold, mb: 3 }}>
            Add Inventory Item
          </Typography>

          {/* Item Name */}
          <TextField
            label="Item Name"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: "white" } }}
            inputProps={{ style: { color: "white" } }}
          />

          {/* Quantity */}
          <TextField
            label="Quantity"
            name="quantityAvailable"
            value={formData.quantityAvailable}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: "white" } }}
            inputProps={{ style: { color: "white" } }}
          />

          {/* UNIT */}
          <TextField
            label="Unit"
            name="unit"
            value={formData.unit}
            select
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: "white" } }}
            SelectProps={{
              sx: {
                color: "white",
              },
              MenuProps: {
                PaperProps: {
                  sx: {
                    backgroundColor: darkCard,
                    color: "white",
                  },
                },
              },
            }}
          >
            <MenuItem value="Kg">Kg</MenuItem>
            <MenuItem value="Packets">Packets</MenuItem>
            <MenuItem value="Bottles">Bottles</MenuItem>
            <MenuItem value="Net">Net</MenuItem>
          </TextField>

          {/* CATEGORY */}
          <TextField
            label="Category"
            name="category"
            value={formData.category}
            select
            onChange={handleChange}
            fullWidth
            sx={{ mb: 3 }}
            InputLabelProps={{ style: { color: "white" } }}
            SelectProps={{
              sx: {
                color: "white",
              },
              MenuProps: {
                PaperProps: {
                  sx: {
                    backgroundColor: darkCard,
                    color: "white",
                  },
                },
              },
            }}
          >
            <MenuItem value="Veggies">Veggies</MenuItem>
            <MenuItem value="Milk Product">Milk Product</MenuItem>
            <MenuItem value="Sauces">Sauces</MenuItem>
            <MenuItem value="Bread">Bread</MenuItem>
            <MenuItem value="Misc">Misc</MenuItem>
          </TextField>

          {/* BUTTON */}
          <Button
            fullWidth
            variant="contained"
            sx={{
              background: gold,
              color: "#000",
              py: 1.5,
              fontWeight: "bold",
              borderRadius: "14px",
              "&:hover": { background: "#e5c37c" },
            }}
            onClick={handleAddItem}
          >
            Add Item
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminInventory;
