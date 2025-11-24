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
import {
  markOrderServed,
  createBillAPI,
  fetchAllMenu,
  fetchCategories,
} from "../api";
import axios from "axios";

// IMPORTANT — Use environment variable
const API_URL = process.env.REACT_APP_API_URL;

const Admin = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [activeOrderInfo, setActiveOrderInfo] = useState(null);

  const [confirmServeMap, setConfirmServeMap] = useState({});

  // -----------------------------
  // LOAD TABLES (instead of orders)
  // -----------------------------
  const loadTables = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/tables`);

      // filter tables that actually have active orders
      const tablesWithOrders = res.data.filter(
        (t) => t.activeOrders && t.activeOrders.length > 0
      );

      setTables(tablesWithOrders);
    } catch (err) {
      console.error("Error loading tables:", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // LOAD MENU + CATEGORIES
  // -----------------------------
  const loadMenu = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        fetchAllMenu(),
        fetchCategories(),
      ]);

      setMenuItems(menuRes.data || []);

      const names =
        catRes.data?.map((c) => c.name).filter(Boolean) || [];
      setCategories(["All", ...names]);
    } catch (err) {
      console.error("Menu Load Error", err);
    }
  };

  useEffect(() => {
    loadTables();
    loadMenu();
  }, []);

  // -----------------------------
  // FILTER MENU FOR "ADD DISH"
  // -----------------------------
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

  // -----------------------------
  // HANDLE REMOVE ITEM
  // -----------------------------
  const handleRemoveItem = async (orderId, batchId, itemId) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/remove-item`, {
        batchId,
        itemId,
      });
      loadTables();
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  // -----------------------------
  // ADD DISH
  // -----------------------------
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

      loadTables();
    } catch (err) {
      console.error("Add dish error:", err);
    }
  };

  // -----------------------------
  // MARK AS SERVED + BILL
  // -----------------------------
  const handleServe = async (table, order) => {
    try {
      await markOrderServed(order._id);

      const rawItems = order.batches.flatMap((b) => b.items || []);

      const billItems = rawItems.map((it) => ({
        name: it.name,
        price: Number(it.price),
        quantity: Number(it.quantity),
      }));

      const totalAmount = billItems.reduce(
        (sum, it) => sum + it.price * it.quantity,
        0
      );

      await createBillAPI({
        tableName: table.name,
        items: billItems,
        totalAmount,
        relatedOrders: [order._id],
        status: "PENDING",
      });

      loadTables();
    } catch (err) {
      console.error("Billing error:", err);
      alert("Billing failed.");
    }
  };

  // -----------------------------
  // RENDER UI
  // -----------------------------
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

      {loading && (
        <Typography textAlign="center" sx={{ color: "white" }}>
          Loading...
        </Typography>
      )}

      {!loading && tables.length === 0 && (
        <Typography textAlign="center" sx={{ color: "#fff" }}>
          No active tables.
        </Typography>
      )}

      {tables.map((table) => {
        const order = table.activeOrders[0]; // active order
        const total = order.batches.reduce(
          (sum, batch) =>
            sum +
            batch.items.reduce(
              (s, it) => s + it.price * it.quantity,
              0
            ),
          0
        );

        const served = order.served;
        const isConfirmed = confirmServeMap[order._id] || false;

        return (
          <Paper
            key={table._id}
            sx={{
              p: 4,
              mb: 4,
              backgroundColor: "#1b3a34",
              borderRadius: 3,
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                variant="h5"
                sx={{ color: "#d6ad60", fontWeight: "bold" }}
              >
                {table.name}
              </Typography>

              <Chip
                label={
                  served
                    ? "Served"
                    : "Active Order"
                }
                sx={{
                  backgroundColor: served ? "#2e7d32" : "#558b2f",
                  color: "white",
                }}
              />
            </Box>

            <Divider sx={{ my: 2, borderColor: "#d6ad60" }} />

            {/* Render batches */}
            {order.batches.map((batch, i) => (
              <Box key={batch._id} sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "#8bc34a",
                  }}
                >
                  Batch {i + 1}
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
                      {it.name} × {it.quantity}
                    </Typography>

                    <Box>
                      <Typography
                        sx={{ color: "#d6ad60", mr: 2 }}
                      >
                        ₹{(it.price * it.quantity).toFixed(2)}
                      </Typography>

                      {!served && (
                        <IconButton
                          sx={{ color: "#d6ad60" }}
                          onClick={() =>
                            handleRemoveItem(
                              order._id,
                              batch._id,
                              it._id
                            )
                          }
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

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{ fontWeight: "bold", color: "#d6ad60" }}>
                Total: ₹{total.toFixed(2)}
              </Typography>

              <input
                type="checkbox"
                checked={isConfirmed}
                disabled={served}
                onChange={(e) =>
                  setConfirmServeMap((prev) => ({
                    ...prev,
                    [order._id]: e.target.checked,
                  }))
                }
              />
              <Typography>Confirm</Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setActiveOrderInfo({ table, order });
                    setOpenDialog(true);
                  }}
                  sx={{
                    backgroundColor: "#d6ad60",
                    color: "#000",
                  }}
                >
                  Add Dish
                </Button>

                <Button
                  variant="outlined"
                  disabled={!isConfirmed || served}
                  onClick={() => handleServe(table, order)}
                  sx={{
                    color: "white",
                    borderColor: "white",
                  }}
                >
                  Mark Served
                </Button>
              </Box>
            </Box>
          </Paper>
        );
      })}

      {/* -----------------------------
         ADD DISH POPUP
      ----------------------------- */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            background: "linear-gradient(180deg,#0d1f1b,#14312c)",
            borderRadius: "22px",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            color: "#d6ad60",
            fontWeight: "bold",
          }}
        >
          Add Dish
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {/* Category Filter */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 1,
              mb: 3,
            }}
          >
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setSelectedCategory(cat)}
                sx={{
                  border: "1px solid #d6ad60",
                  color:
                    selectedCategory === cat ? "#000" : "#d6ad60",
                  backgroundColor:
                    selectedCategory === cat
                      ? "#d6ad60"
                      : "transparent",
                }}
              />
            ))}
          </Box>

          {/* Search */}
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
                  borderRadius: "12px",
                  color: "#fff",
                },
              }}
            />
          </Box>

          {/* Menu Grid */}
          <Grid container spacing={2}>
            {filteredMenu.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card
                  sx={{
                    background: "#14312c",
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid #244842",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={item.image}
                    alt={item.name}
                    sx={{ height: 150 }}
                  />

                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography>
                      {item.name}{" "}
                      {item.subCategory && `(${item.subCategory})`}
                    </Typography>

                    <Typography
                      sx={{ color: "#d6ad60", fontWeight: "bold" }}
                    >
                      ₹{Number(item.price).toFixed(2)}
                    </Typography>

                    <Button
                      variant="contained"
                      sx={{
                        mt: 1,
                        backgroundColor: "#d6ad60",
                        color: "#000",
                      }}
                      onClick={() =>
                        handleAddDish(
                          activeOrderInfo.order._id,
                          item
                        )
                      }
                    >
                      Add
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Admin;
