// src/pages/OrderSuccess.jsx
import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/menu"); // redirect to menu page after 10 sec
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg,#0d1f1b,#14312c)",
        color: "white",
        textAlign: "center",
        padding: 3,
      }}
    >
      <Typography variant="h3" sx={{ color: "#d6ad60", mb: 2 }}>
        🎉 Order Placed!
      </Typography>

      <Typography variant="h6" sx={{ maxWidth: 500, opacity: 0.9 }}>
        Your order has been successfully placed.
        <br /> Redirecting you back to the menu...
      </Typography>
    </Box>
  );
};

export default OrderSuccess;
