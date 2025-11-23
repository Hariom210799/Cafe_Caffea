// src/pages/AdminHome.jsx
import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import CategoryIcon from "@mui/icons-material/Category";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import BarChartIcon from "@mui/icons-material/BarChart";

const AdminHome = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Order Control",
      desc: "View, edit, and manage customer orders.",
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 60, color: "#d6ad60" }} />,
      path: "/admin/orders",
    },
    {
      title: "Inventory Management",
      desc: "Track and update cafe stock and supplies.",
      icon: <Inventory2Icon sx={{ fontSize: 60, color: "#d6ad60" }} />,
      path: "/admin/inventory",
    },
    {
      title: "Edit Menu",
      desc: "Add or edit categories and dishes.",
      icon: <RestaurantMenuIcon sx={{ fontSize: 60, color: "#d6ad60" }} />,
      path: "/admin/edit-menu",
    },
    {
      title: "Manage Categories",
      desc: "Add or edit item categories.",
      icon: <CategoryIcon sx={{ fontSize: 60, color: "#d6ad60" }} />,
      path: "/admin/categories",
    },
    {
      title: "Billing",
      desc: "Generate invoices and view table bills.",
      icon: <ReceiptLongIcon sx={{ fontSize: 60, color: "#d6ad60" }} />,
      path: "/admin/billing",
    },
    {
      title: "History & Analytics",
      desc: "View revenue trends and item-wise sales.",
      icon: <BarChartIcon sx={{ fontSize: 60, color: "#d6ad60" }} />,
      path: "/admin/history",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0d1f1b 0%,#14312c 100%)",
        p: { xs: 4, md: 8 },
      }}
    >
      <Typography
        variant="h3"
        textAlign="center"
        sx={{
          color: "#d6ad60",
          fontWeight: "bold",
          mb: 8,
          letterSpacing: "0.05em",
        }}
      >
        Admin Control Panel
      </Typography>

      <Grid container spacing={6} justifyContent="center">
        {features.map((f) => (
          <Grid item key={f.title} xs={12} sm={6} md={4} display="flex" justifyContent="center">
            <Card
              sx={{
                width: 300, // <<<<<< REAL FIX
                backgroundColor: "#1b3a34",
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                transition: "0.3s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardActionArea onClick={() => navigate(f.path)}>
                <CardContent
                  sx={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", py: 4 }}
                >
                  {f.icon}
                  <Typography variant="h5" sx={{ color: "#f1e8d2", fontWeight: "bold", mt: 2 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#cfc7b1", mt: 1 }}>
                    {f.desc}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminHome;
