// src/pages/AdminCategories.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  fetchCategoriesAPI,
  createCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI,
} from "../api";

const initialState = { name: "" };

const gold = "#d6ad60";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    try {
      const res = await fetchCategoriesAPI();
      setCategories(res.data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Category name required");
      return;
    }

    try {
      if (editingId) {
        await updateCategoryAPI(editingId, form);
        alert("Category updated");
      } else {
        await createCategoryAPI(form);
        alert("Category added");
      }

      setForm(initialState);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category.");
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteCategoryAPI(id);
      loadData();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialState);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0d1f1b 0%,#14312c 100%)",
        p: { xs: 3, md: 8 },
        color: "white",
      }}
    >
      <Typography
        variant="h3"
        textAlign="center"
        sx={{
          mb: 5,
          fontWeight: "bold",
          color: gold,
          letterSpacing: "0.05em",
        }}
      >
        Manage Categories
      </Typography>

      {/* Add/Edit Category Form */}
      <Paper
        sx={{
          p: 4,
          mb: 5,
          backgroundColor: "#1b3a34",
          borderRadius: 3,
          color: "white",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <Typography variant="h6" sx={{ color: gold, mb: 2 }}>
          {editingId ? "Edit Category" : "Add New Category"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Category Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: gold },
                "&:hover fieldset": { borderColor: "#e8d5b7" },
              },
              input: { color: "white" },
              label: { color: gold },
            }}
          />

          {editingId && (
            <Button
              variant="outlined"
              onClick={cancelEdit}
              sx={{
                color: gold,
                borderColor: gold,
                "&:hover": { borderColor: "#e8d5b7", color: "#e8d5b7" },
              }}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: gold,
              color: "#1b3a34",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#e8d5b7" },
            }}
          >
            {editingId ? "Update" : "Add"}
          </Button>
        </Box>
      </Paper>

      {/* Existing Categories */}
      <Paper
        sx={{
          p: 4,
          backgroundColor: "#1b3a34",
          borderRadius: 3,
          color: "white",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <Typography variant="h6" sx={{ color: gold, mb: 2 }}>
          Existing Categories
        </Typography>

        {categories.length === 0 ? (
          <Typography sx={{ color: "white" }}>No categories added yet.</Typography>
        ) : (
          <Grid container spacing={2}>
            {categories.map((cat) => (
              <Grid item xs={12} md={6} key={cat._id}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#14312c",
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "white",
                  }}
                >
                  <Typography sx={{ color: "white" }}>{cat.name}</Typography>

                  <Box>
                    <IconButton
                      onClick={() => handleEdit(cat)}
                      sx={{ color: gold }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(cat._id)}
                      sx={{ color: "#ff6b6b" }}
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

export default AdminCategories;
