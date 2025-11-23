import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Grid,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

import {
  fetchCategoriesAPI,
  createCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI,
} from "../api";

const initialFormState = {
  name: "",
  subCategories: [],
};

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [subInput, setSubInput] = useState("");

  const loadCategories = async () => {
    try {
      const res = await fetchCategoriesAPI();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error loading categories:", err);
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ---------------------- Add subcategory ----------------------
  const handleAddSub = () => {
    if (!subInput.trim()) return;

    setForm((prev) => ({
      ...prev,
      subCategories: [...prev.subCategories, subInput],
    }));

    setSubInput("");
  };

  // ---------------------- Remove subcategory ----------------------
  const handleRemoveSub = (sub) => {
    setForm((prev) => ({
      ...prev,
      subCategories: prev.subCategories.filter((s) => s !== sub),
    }));
  };

  // ---------------------- Submit form ----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      if (editingId) {
        await updateCategoryAPI(editingId, form);
        alert("Category updated successfully");
      } else {
        await createCategoryAPI(form);
        alert("Category created successfully");
      }

      setForm(initialFormState);
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category");
    }
  };

  // ---------------------- Edit Category ----------------------
  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name,
      subCategories: cat.subCategories || [],
    });
  };

  // ---------------------- Delete Category ----------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await deleteCategoryAPI(id);
      alert("Category deleted");
      await loadCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialFormState);
    setSubInput("");
  };

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
        Manage Categories
      </Typography>

      {/* ---------------------- FORM ---------------------- */}
      <Paper
        sx={{
          p: 4,
          mb: 5,
          backgroundColor: "#1b3a34",
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <Typography variant="h6" sx={{ color: "#d6ad60", mb: 2 }}>
          {editingId ? "Edit Category" : "Add New Category"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Category Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#d6ad60" },
                "&:hover fieldset": { borderColor: "#e8d5b7" },
              },
              label: { color: "#d6ad60" },
              input: { color: "#f1e8d2" },
            }}
          />

          {/* ---------------------- Subcategory input ---------------------- */}
          <TextField
            label="Add Sub-category"
            value={subInput}
            onChange={(e) => setSubInput(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#d6ad60" },
              },
              label: { color: "#d6ad60" },
              input: { color: "#f1e8d2" },
            }}
          />

          <Button
            variant="outlined"
            onClick={handleAddSub}
            sx={{ color: "#d6ad60", borderColor: "#d6ad60" }}
          >
            Add Sub-category
          </Button>

          {/* ---------------------- Show subcategories ---------------------- */}
          {form.subCategories.map((sub, index) => (
            <Box
              key={index}
              sx={{
                background: "#14312c",
                p: 1,
                borderRadius: 2,
                mt: 1,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography>{sub}</Typography>

              <Button
                sx={{ color: "red" }}
                onClick={() => handleRemoveSub(sub)}
              >
                Remove
              </Button>
            </Box>
          ))}

          {/* ---------------------- Save + Cancel ---------------------- */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            {editingId && (
              <Button
                variant="outlined"
                onClick={handleCancelEdit}
                sx={{ color: "#e8d5b7", borderColor: "#e8d5b7" }}
              >
                Cancel
              </Button>
            )}

            <Button
              variant="contained"
              type="submit"
              sx={{
                backgroundColor: "#d6ad60",
                color: "#1b3a34",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#e8d5b7" },
              }}
            >
              {editingId ? "Update Category" : "Add Category"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ---------------------- CATEGORY LIST ---------------------- */}
      <Paper
        sx={{
          p: 4,
          backgroundColor: "#1b3a34",
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <Typography variant="h6" sx={{ color: "#d6ad60", mb: 2 }}>
          Existing Categories
        </Typography>

        <Grid container spacing={2}>
          {categories.map((cat) => (
            <Grid item xs={12} md={6} key={cat._id}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#14312c",
                }}
              >
                <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                  {cat.name}
                </Typography>

                {cat.subCategories?.map((sub, index) => (
                  <Typography key={index} sx={{ ml: 2, color: "#cfc7b1" }}>
                    • {sub}
                  </Typography>
                ))}

                <Box sx={{ textAlign: "right", mt: 2 }}>
                  <IconButton onClick={() => handleEdit(cat)} sx={{ color: "#d6ad60" }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(cat._id)} sx={{ color: "#e57373" }}>
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ManageCategories;
