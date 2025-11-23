import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AdminCategories from "./AdminCategories";
import AdminItems from "./AdminItems";

const AdminMenu = () => {
  const [screen, setScreen] = useState("NONE"); // NONE | CAT | ITEM

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
          mb: 4,
          fontWeight: "bold",
          color: "#d6ad60",
          letterSpacing: "0.05em",
        }}
      >
        Manage Menu
      </Typography>

      {/* TWO BUTTONS */}
      {screen === "NONE" && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            mt: 10,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            onClick={() => setScreen("CAT")}
            sx={{
              backgroundColor: "#d6ad60",
              color: "#1b3a34",
              px: 6,
              py: 2,
              fontSize: "1.2rem",
              borderRadius: "1rem",
              "&:hover": { backgroundColor: "#e8d5b7" },
            }}
          >
            Category
          </Button>

          <Button
            variant="contained"
            onClick={() => setScreen("ITEM")}
            sx={{
              backgroundColor: "#d6ad60",
              color: "#1b3a34",
              px: 6,
              py: 2,
              fontSize: "1.2rem",
              borderRadius: "1rem",
              "&:hover": { backgroundColor: "#e8d5b7" },
            }}
          >
            Item
          </Button>
        </Box>
      )}

      {/* CATEGORY SCREEN */}
      {screen === "CAT" && (
        <AdminCategories goBack={() => setScreen("NONE")} />
      )}

      {/* ITEM SCREEN */}
      {screen === "ITEM" && <AdminItems goBack={() => setScreen("NONE")} />}
    </Box>
  );
};

export default AdminMenu;
