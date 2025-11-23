// src/components/Navbar.jsx
import React from "react";
import { AppBar, Toolbar, Button, Box, Stack, Typography } from "@mui/material";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import LocalCafeRoundedIcon from "@mui/icons-material/LocalCafeRounded";
import cafeLogo from "../assets/cafe_logo.jpg";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = () => {
    if (location.pathname === "/menu") {
      // 🔥 Force refresh MENU PAGE
      navigate(0);
    } else {
      navigate("/menu");
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(30,30,30,0.75)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Toolbar sx={{ minHeight: 72 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          onClick={() => navigate("/")}
          sx={{ cursor: "pointer" }}
        >
          <img
              src={cafeLogo}
              alt="Cafe Caffea Logo"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                objectFit: "contain",
                marginRight: 10,
              }}
            />

          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: 800,
              letterSpacing: "0.02em",
            }}
          >
            CAFE CAFFEA
          </Typography>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={1.5}>

          {/* HOME BUTTON */}
          <Button
            component={NavLink}
            to="/"
            sx={{
              color: "white",
              "&.active": {
                bgcolor: "primary.main",
                color: "#0d1b1e",
              },
            }}
          >
            Home
          </Button>

          {/* MENU BUTTON — WITH PAGE REFRESH LOGIC */}
          <Button
            component={NavLink}
            to="/menu"
            onClick={handleMenuClick}
            sx={{
              color: "white",
              "&.active": {
                bgcolor: "primary.main",
                color: "#0d1b1e",
              },
            }}
          >
            Menu
          </Button>

          {/* ADMIN BUTTON */}
          <Button
            component={NavLink}
            to="/admin-login"
            sx={{
              color: "white",
              "&.active": {
                bgcolor: "primary.main",
                color: "#0d1b1e",
              },
            }}
          >
            Admin
          </Button>

        </Stack>
      </Toolbar>
    </AppBar>
  );
}
