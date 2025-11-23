import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  IconButton,
  FormControlLabel,
  Switch,
  CircularProgress,
  MenuItem
} from "@mui/material";
import { Edit, Delete, CloudUpload } from "@mui/icons-material";

import {
  fetchAllMenu,
  createMenuItemAPI,
  updateMenuItemAPI,
  deleteMenuItemAPI,
  fetchCategoriesAPI,
  uploadImageAPI,
} from "../api";

const initialFormState = {
  name: "",
  category: "",
  subCategory: "",
  price: "",
  description: "",
  image: "",
  isAvailable: true,
};

const AdminEditMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");

  // ======================= LOAD MENU + CATEGORIES =======================
  const loadData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        fetchAllMenu(),
        fetchCategoriesAPI(),
      ]);

      setMenuItems(menuRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error("MENU LOAD ERROR:", err);
      alert("Failed to load menu items.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ======================= HANDLE CHANGE =======================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update subcategories when category changes
    if (name === "category") {
      const cat = categories.find((c) => c.name === value);
      setSubCategories(cat?.subCategories || []);
      setForm((prev) => ({ ...prev, subCategory: "" }));
    }
  };

  const handleToggleAvailable = (e) => {
    setForm((prev) => ({
      ...prev,
      isAvailable: e.target.checked,
    }));
  };

  // ======================= UPLOAD IMAGE =======================
 // ======================= UPLOAD IMAGE =======================
const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);

  try {
    const formData = new FormData();
    formData.append("image", file);

    // Call your backend API
    const res = await uploadImageAPI(formData);

    if (!res.data.success) {
      alert("Image upload failed.");
      setUploading(false);
      return;
    }

    // Backend returns:  /uploads/xxxx.png
    const relativeUrl = res.data.url;

    // Convert to full URL for frontend preview
    const fullUrl = `http://localhost:5000${relativeUrl}`;

    // Save to form
    setForm((prev) => ({ ...prev, image: fullUrl }));

    // Set preview
    setPreview(fullUrl);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    alert("Image upload failed.");
  } finally {
    setUploading(false);
  }
};


  // ======================= SUBMIT FORM =======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
      };

      if (!payload.name || !payload.category || !payload.price) {
        alert("Name, category, and price are required.");
        setLoading(false);
        return;
      }

      if (editingId) {
        await updateMenuItemAPI(editingId, payload);
        alert("Menu item updated.");
      } else {
        await createMenuItemAPI(payload);
        alert("Menu item created.");
      }

      setForm(initialFormState);
      setPreview("");
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  // ======================= EDIT =======================
  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      category: item.category,
      subCategory: item.subCategory || "",
      price: item.price.toString(),
      description: item.description,
      image: item.image,
      isAvailable: item.isAvailable,
    });

    const cat = categories.find((c) => c.name === item.category);
    setSubCategories(cat?.subCategories || []);

    setPreview(item.image);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialFormState);
    setPreview("");
  };

  // ======================= DELETE =======================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await deleteMenuItemAPI(id);
      alert("Deleted.");
      loadData();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Failed to delete.");
    }
  };

  // =====================================================================
  //                                UI
  // =====================================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0d1f1b 0%,#14312c 100%)",
        p: { xs: 3, md: 8 },
        color: "#f1e8d2",
      }}
    >
      <Typography
        variant="h3"
        textAlign="center"
        sx={{
          color: "#d6ad60",
          fontWeight: "bold",
          mb: 5,
          letterSpacing: "0.05em",
        }}
      >
        Edit Menu
      </Typography>

      {/* ========================= FORM BOX ========================= */}
      <Paper
        sx={{
          p: 4,
          mb: 5,
          backgroundColor: "#1b3a34",
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#d6ad60", mb: 3, fontWeight: "bold" }}
        >
          {editingId ? "Edit Menu Item" : "Add New Menu Item"}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          {/* ---------------- NAME ---------------- */}
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            sx={{
              gridColumn: "1 / -1",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#14312c",
                borderRadius: 2,
                "& fieldset": { borderColor: "#d6ad60" },
              },
              label: { color: "#d6ad60" },
              input: { color: "#f1e8d2" },
            }}
          />

          {/* ---------------- CATEGORY ---------------- */}
          <TextField
            select
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#14312c",
                borderRadius: 2,
                "& fieldset": { borderColor: "#d6ad60" },
              },
              label: { color: "#d6ad60" },
              "& .MuiSelect-select": { color: "#f1e8d2", padding: "14px" },
            }}
          >
            <MenuItem value="">
              <em>Select Category</em>
            </MenuItem>

            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat.name}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>

          {/* ---------------- SUB CATEGORY ---------------- */}
          <TextField
  label="Sub Category (optional)"
  name="subCategory"
  value={form.subCategory}
  onChange={handleChange}
  placeholder="Enter sub category (e.g., Small, Medium, Large)"
  fullWidth
  sx={{
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#14312c",
      borderRadius: 2,
      "& fieldset": { borderColor: "#d6ad60" },
      "&:hover fieldset": { borderColor: "#e8d5b7" },
    },
    label: { color: "#d6ad60" },
    input: { color: "#f1e8d2" },
  }}
/>


          {/* ---------------- PRICE ---------------- */}
          <TextField
            label="Price (USD)"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            fullWidth
            sx={{
              gridColumn: "1 / -1",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#14312c",
                borderRadius: 2,
                "& fieldset": { borderColor: "#d6ad60" },
              },
              label: { color: "#d6ad60" },
              input: { color: "#f1e8d2" },
            }}
          />

          {/* ---------------- IMAGE UPLOAD ---------------- */}
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUpload />}
              sx={{
                backgroundColor: "#d6ad60",
                color: "#1b3a34",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#e8d5b7" },
              }}
            >
              {uploading ? (
                <>
                  Uploading... <CircularProgress size={20} sx={{ ml: 2 }} />
                </>
              ) : (
                "Upload Image"
              )}
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </Button>

            {preview && (
  <Box sx={{ mt: 2 }}>
    <img
      src={preview}
      alt="Preview"
      style={{
        width: "180px",
        height: "140px",
        borderRadius: "12px",
        objectFit: "cover",
        border: "2px solid #d6ad60",
      }}
    />
  </Box>
)}

          </Box>

          {/* ---------------- DESCRIPTION ---------------- */}
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
            sx={{
              gridColumn: "1 / -1",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#14312c",
                borderRadius: 2,
                "& fieldset": { borderColor: "#d6ad60" },
              },
              label: { color: "#d6ad60" },
              textarea: { color: "#f1e8d2" },
            }}
          />

          {/* ---------------- AVAILABLE ---------------- */}
          <FormControlLabel
            control={
              <Switch
                checked={form.isAvailable}
                onChange={handleToggleAvailable}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#d6ad60" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#d6ad60",
                  },
                }}
              />
            }
            label="Available"
            sx={{ color: "#f1e8d2", gridColumn: "1 / -1" }}
          />

          {/* ---------------- BUTTONS ---------------- */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gridColumn: "1 / -1",
              gap: 2,
            }}
          >
            {editingId && (
              <Button
                variant="outlined"
                onClick={handleCancelEdit}
                sx={{
                  color: "#d6ad60",
                  borderColor: "#d6ad60",
                  "&:hover": { color: "#e8d5b7", borderColor: "#e8d5b7" },
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: "#d6ad60",
                color: "#1b3a34",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#e8d5b7" },
              }}
            >
              {editingId ? "Update Item" : "Add Item"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ========================= EXISTING MENU ========================= */}
      <Paper
        sx={{
          p: 4,
          backgroundColor: "#1b3a34",
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#d6ad60", mb: 3, fontWeight: "bold" }}
        >
          Existing Menu Items
        </Typography>

        {menuItems.length === 0 ? (
          <Typography>No menu items found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {menuItems.map((item) => (
              <Grid item xs={12} md={6} key={item._id}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#14312c",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: "bold", color: "#cfc7b1"  }}>
                      {item.name}
                      {!item.isAvailable && (
                        <span style={{ fontSize: 12, color: "#e57373" }}>
                          {" "}
                          (Not Available)
                        </span>
                      )}
                    </Typography>

                    <Typography variant="body2" sx={{ color: "#cfc7b1" }}>
                      {item.category}
                      {item.subCategory && ` • ${item.subCategory}`}
                      {" • ₹"}
                      {item.price.toFixed(2)}
                    </Typography>

                    {item.image && (
                      <img
                        src={item.image}
                        alt="item"
                        style={{
                          width: 60,
                          height: 50,
                          objectFit: "cover",
                          borderRadius: 6,
                          marginTop: 6,
                          border: "1px solid #d6ad60"
                        }}
                      />
                    )}
                  </Box>

                  <Box>
                    <IconButton
                      onClick={() => handleEdit(item)}
                      sx={{ color: "#d6ad60" }}
                    >
                      <Edit />
                    </IconButton>

                    <IconButton
                      onClick={() => handleDelete(item._id)}
                      sx={{ color: "#e57373" }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default AdminEditMenu;
