// src/pages/Admin.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import {
  markOrderServed,
  createBillAPI,
  fetchAllMenu,
  fetchCategories,
} from "../api";

const API_URL = "http://localhost:5000/api";

const Admin = () => {
  // Orders
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Menu for "Add Dish"
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);

  // Confirm per order
  const [confirmServeMap, setConfirmServeMap] = useState({});

  // ===========================
  // LOAD ORDERS
  // ===========================
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // LOAD MENU + CATEGORIES
  // ===========================
  const loadMenuAndCategories = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        fetchAllMenu(),
        fetchCategories(),
      ]);

      const menuData = menuRes.data || [];
      setMenuItems(menuData);

      const catData = catRes.data || [];
      const catNames = catData.map((c) => c.name).filter(Boolean);
      setCategories(["All", ...catNames]);
    } catch (err) {
      console.error("Menu / categories load error:", err);
    }
  };

  useEffect(() => {
    loadOrders();
    loadMenuAndCategories();
  }, []);

  // ===========================
  // HELPERS
  // ===========================
  const calcTotal = (order) => {
    return order.batches.reduce(
      (sum, batch) =>
        sum + batch.items.reduce((s, i) => s + i.price * i.quantity, 0),
      0
    );
  };

  // Filter menu for dialog (by category + search + availability)
  const filteredMenu = useMemo(() => {
    return (menuItems || [])
      .filter((item) => item.isAvailable !== false)
      .filter((item) =>
        selectedCategory === "All"
          ? true
          : item.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
      .filter((item) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.subCategory?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
        );
      });
  }, [menuItems, selectedCategory, search]);

  // ===========================
  // BILLING: MARK TABLE SERVED + CREATE BILL
  // ===========================
  const handleServeSingleTable = async (orderId, tableName, order) => {
    try {
      // 1) mark order served
      await markOrderServed(orderId);

      // 2) flatten batches -> items
      const rawItems = order.batches.flatMap((b) => b.items || []);

      const billItems = rawItems.map((it) => ({
        name: it.name,
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 0,
      }));

      const totalAmount = billItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // 3) create bill as PENDING
      await createBillAPI({
        tableName,
        items: billItems,
        totalAmount,
        relatedOrders: [orderId],
        status: "PENDING",
      });

      // 4) remove table from active order list
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      console.error("Billing error:", err.response?.data || err);
      alert("Billing failed. Check console.");
    }
  };

  // ===========================
  // MODIFY ORDER ITEMS
  // ===========================
  const handleRemoveItem = async (orderId, batchId, itemId) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/remove-item`, {
        batchId,
        itemId,
      });
      await loadOrders();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const handleAddDish = async (orderId, item) => {
    if (!orderId || !item) return;
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/add-item`, {
        item: {
          name: item.name,
          price: item.price,
          subCategory: item.subCategory || "",
          quantity: 1,
        },
      });
      await loadOrders();
    } catch (err) {
      console.error("Add dish error:", err);
    }
  };

  // ===========================
  // RENDER
  // ===========================
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0d1f1b,#14312c)",
        p: 5,
      }}
    >
      <Typography
        variant="h3"
        textAlign="center"
        sx={{ color: "#d6ad60", fontWeight: "bold", mb: 4 }}
      >
        Admin Dashboard
      </Typography>

      {loading && <Typography textAlign="center">Loading orders...</Typography>}

      {!loading && orders.length === 0 && (
        <Typography textAlign="center" sx={{ color: "white" }}>
          No active tables.
        </Typography>
      )}

      {orders.map((order) => {
        const total = calcTotal(order);
        const served = order.served;
        const hasPending = order.batches.some((b) => !b.confirmed);
        const isConfirmed = confirmServeMap[order._id] || false;

        return (
          <Paper
            key={order._id}
            sx={{
              p: 4,
              mb: 4,
              backgroundColor: "#1b3a34",
              borderRadius: 3,
              color: "white",
            }}
          >
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                variant="h5"
                sx={{ color: "#d6ad60", fontWeight: "bold" }}
              >
                {order.tableName}
              </Typography>

              <Chip
                label={
                  served
                    ? "Served ✅"
                    : hasPending
                    ? "Pending Orders 🕒"
                    : "All Confirmed ✅"
                }
                sx={{
                  backgroundColor: served
                    ? "#2e7d32"
                    : hasPending
                    ? "#ffb300"
                    : "#558b2f",
                  color: "white",
                }}
              />
            </Box>

            <Divider sx={{ my: 2, borderColor: "#d6ad60" }} />

            {/* Batches */}
            {order.batches.map((batch, idx) => (
              <Box key={batch._id} sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: batch.confirmed ? "#8bc34a" : "#ffb300",
                  }}
                >
                  Batch {idx + 1} — {batch.confirmed ? "Confirmed" : "Pending"}
                </Typography>

                <Divider sx={{ my: 1, borderColor: "#d6ad60" }} />

                {batch.items.map((it) => (
                  <Box
                    key={it._id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography>
                      {it.name} {it.subCategory && `(${it.subCategory})`} ×{" "}
                      {it.quantity}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography sx={{ color: "#d6ad60", mr: 2 }}>
                        ₹{(it.price * it.quantity).toFixed(2)}
                      </Typography>

                      {!served && (
                        <IconButton
                          onClick={() =>
                            handleRemoveItem(order._id, batch._id, it._id)
                          }
                          sx={{ color: "#d6ad60" }}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}

            <Divider sx={{ my: 2, borderColor: "#d6ad60" }} />

            {/* Footer */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{ color: "#d6ad60", fontWeight: "bold" }}>
                Total: ₹{total.toFixed(2)}
              </Typography>

              {!served && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <input
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) =>
                      setConfirmServeMap((prev) => ({
                        ...prev,
                        [order._id]: e.target.checked,
                      }))
                    }
                  />
                  <Typography sx={{ color: "white" }}>
                    Confirm order completed
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  disabled={served}
                  onClick={() => {
                    setActiveOrderId(order._id);
                    setOpenDialog(true);
                  }}
                  sx={{
                    backgroundColor: "#d6ad60",
                    color: "#1b3a34",
                  }}
                >
                  Add Dish
                </Button>

                <Tooltip
                  title={
                    !isConfirmed
                      ? "Tick the checkbox first"
                      : served
                      ? "Already served"
                      : ""
                  }
                >
                  <span>
                    <Button
                      variant="outlined"
                      disabled={!isConfirmed || served}
                      onClick={() =>
                        handleServeSingleTable(
                          order._id,
                          order.tableName,
                          order
                        )
                      }
                      sx={{
                        color: "white",
                        borderColor: "white",
                        "&.Mui-disabled": {
                          color: "#cccccc",
                          borderColor: "#666666",
                        },
                      }}
                    >
                      {served ? "Served" : "Mark as Served"}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        );
      })}

      {/* ===========================
          ADD DISH DIALOG (REAL MENU)
          =========================== */}
    {/* ===========================
    ADD DISH DIALOG (THEMED UI)
   =========================== */}
<Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  fullWidth
  maxWidth="md"
  PaperProps={{
    sx: {
      background: "linear-gradient(180deg,#0d1f1b,#14312c)",
      borderRadius: "22px",
      overflow: "hidden",
      border: "1px solid #2b4a44",
    },
  }}
>
  <DialogTitle
    sx={{
      color: "#d6ad60",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "1.6rem",
      pt: 3,
      pb: 1,
    }}
  >
    Select Dish to Add
  </DialogTitle>

  <DialogContent
    dividers
    sx={{
      background: "transparent",
      p: 3,
      maxHeight: "75vh",
    }}
  >
    {/* CATEGORY TABS */}
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        mb: 2,
        gap: 1,
      }}
    >
      {categories.map((cat) => (
        <Chip
          key={cat}
          label={cat}
          onClick={() => setSelectedCategory(cat)}
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: "12px",
            fontSize: "14px",
            border: "1px solid #d6ad60",
            backgroundColor: selectedCategory === cat ? "#d6ad60" : "transparent",
            color: selectedCategory === cat ? "#1b1b1b" : "#d6ad60",
            fontWeight: selectedCategory === cat ? 600 : 400,
            "&:hover": {
              backgroundColor: "#d6ad60",
              color: "#1b1b1b",
            },
          }}
        />
      ))}
    </Box>

    {/* SEARCH BAR */}
    <Box sx={{ maxWidth: 350, mx: "auto", mb: 3 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search dishes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#d6ad60" }} />
            </InputAdornment>
          ),
          sx: {
            background: "#102b27",
            color: "white",
            borderRadius: "12px",
            "& fieldset": { borderColor: "#32554f" },
          },
        }}
      />
    </Box>

    {/* MENU GRID */}
    <Grid container spacing={2}>
      {filteredMenu.length === 0 ? (
        <Typography
          sx={{
            textAlign: "center",
            width: "100%",
            my: 3,
            color: "#c7d5cf",
          }}
        >
          No dishes found.
        </Typography>
      ) : (
        filteredMenu.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card
              sx={{
                background: "#14312c",
                borderRadius: "18px",
                overflow: "hidden",
                color: "white",
                boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                border: "1px solid #244842",
                transition: "0.2s",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.55)",
                },
              }}
            >
              <CardMedia
                component="img"
                image={item.image}
                alt={item.name}
                sx={{ height: 150, objectFit: "cover" }}
              />

              <CardContent sx={{ textAlign: "center", pb: "20px" }}>
                <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
                  {item.name}
                  {item.subCategory && ` (${item.subCategory})`}
                </Typography>

                <Typography
                  sx={{
                    color: "#d6ad60",
                    fontWeight: 600,
                    mt: 0.5,
                    mb: 1.5,
                  }}
                >
                  ${Number(item.price).toFixed(2)}
                </Typography>

                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#d6ad60",
                    color: "#1b1b1b",
                    fontWeight: "bold",
                    borderRadius: "10px",
                    px: 4,
                    py: 0.7,
                    "&:hover": {
                      backgroundColor: "#e8d5b7",
                    },
                  }}
                  onClick={() => handleAddDish(activeOrderId, item)}
                >
                  Add
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  </DialogContent>
</Dialog>

    </Box>
  );
};

export default Admin;
