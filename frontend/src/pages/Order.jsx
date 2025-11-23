import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";

import burgerImg from "../assets/burger.jpg";
import pizzaImg from "../assets/pizza.jpg";
import momosImg from "../assets/momos.jpg";
import pastaImg from "../assets/pasta.jpg";
import mojitoImg from "../assets/mojito.jpg";
import lavaCakeImg from "../assets/lava_cake.jpg";

const menuItems = [
  { id: 1, name: "Cheese Burger", price: 6.99, image: burgerImg },
  { id: 2, name: "Paneer Pizza", price: 8.49, image: pizzaImg },
  { id: 3, name: "Veg Momos", price: 5.99, image: momosImg },
  { id: 4, name: "White Sauce Pasta", price: 7.25, image: pastaImg },
  { id: 5, name: "Virgin Mojito", price: 3.99, image: mojitoImg },
  { id: 6, name: "Chocolate Lava Cake", price: 4.75, image: lavaCakeImg },
];

const tables = Array.from({ length: 10 }, (_, i) => `Table ${i + 1}`);

const Order = () => {
  const [selectedTable, setSelectedTable] = useState("");
  const [cart, setCart] = useState([]);

  const handleAdd = (item) => {
    if (!selectedTable) return alert("Please select a table first!");
    const exist = cart.find((c) => c.id === item.id);
    if (exist)
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    else setCart([...cart, { ...item, quantity: 1 }]);
  };

  const handleMinus = (item) => {
    const exist = cart.find((c) => c.id === item.id);
    if (exist.quantity === 1)
      setCart(cart.filter((c) => c.id !== item.id));
    else
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c
        )
      );
  };

  const handleDelete = (item) => setCart(cart.filter((c) => c.id !== item.id));

  const totalQuantity = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalCost = cart
    .reduce((sum, i) => sum + i.price * i.quantity, 0)
    .toFixed(2);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 8, md: 10 },
        px: { xs: 3, md: 10 },
        background: "linear-gradient(135deg, #0d1f1c 0%, #1b3a34 100%)",
        color: "#f5e6c8",
      }}
    >
      <Typography
        variant="h3"
        textAlign="center"
        fontWeight="bold"
        sx={{ mb: 5, color: "#d6ad60" }}
      >
        Place Your Order
      </Typography>

      {/* === TABLE SELECTION === */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select Your Table
        </Typography>
        <Stack direction="row" flexWrap="wrap" justifyContent="center" spacing={1.5}>
          {tables.map((table) => (
            <Button
              key={table}
              variant={selectedTable === table ? "contained" : "outlined"}
              onClick={() => setSelectedTable(table)}
              sx={{
                borderColor: "#d6ad60",
                color: selectedTable === table ? "#1b3a34" : "#d6ad60",
                backgroundColor: selectedTable === table ? "#d6ad60" : "transparent",
                "&:hover": { backgroundColor: "#c49a50", color: "#1b3a34" },
              }}
            >
              {table}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* === MENU GRID === */}
      <Grid container spacing={4}>
        {menuItems.map((item) => {
          const inCart = cart.find((c) => c.id === item.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card
                sx={{
                  borderRadius: 5,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: 180,
                    overflow: "hidden",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={item.image}
                    alt={item.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.6s ease, filter 0.6s ease",
                      "&:hover": {
                        transform: "scale(1.08)",
                        filter: "brightness(0.9)",
                      },
                    }}
                  />
                </Box>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h6" fontWeight="bold">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#d8d2be", mb: 1 }}>
                    ${item.price.toFixed(2)}
                  </Typography>

                  {/* ADD / REMOVE SECTION */}
                  {inCart ? (
                    <Stack
                      direction="row"
                      justifyContent="center"
                      alignItems="center"
                      spacing={1}
                    >
                      <IconButton
                        onClick={() => handleMinus(item)}
                        sx={{ color: "#d6ad60" }}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ color: "#d6ad60", fontWeight: "bold" }}>
                        {inCart.quantity}
                      </Typography>
                      <IconButton
                        onClick={() => handleAdd(item)}
                        sx={{ color: "#d6ad60" }}
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(item)}
                        sx={{ color: "#d6ad60" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => handleAdd(item)}
                      sx={{
                        backgroundColor: "#d6ad60",
                        color: "#1b3a34",
                        fontWeight: "bold",
                        textTransform: "none",
                        borderRadius: 3,
                        px: 3,
                        py: 0.6,
                        "&:hover": { backgroundColor: "#c49a50" },
                      }}
                    >
                      Add to Cart
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* === CART SUMMARY === */}
      {cart.length > 0 && (
        <Box mt={8} textAlign="center">
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ color: "#d6ad60", mb: 2 }}
          >
            Your Order — {selectedTable}
          </Typography>
          {cart.map((c) => (
            <Typography key={c.id} sx={{ color: "#f5e6c8" }}>
              {c.name} × {c.quantity} — ${(c.price * c.quantity).toFixed(2)}
            </Typography>
          ))}
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mt: 2, color: "#d6ad60" }}
          >
            Total Items: {totalQuantity} | Total: ${totalCost}
          </Typography>
          <Button
            variant="contained"
            sx={{
              mt: 3,
              backgroundColor: "#d6ad60",
              color: "#1b3a34",
              fontWeight: "bold",
              borderRadius: 3,
              px: 5,
              py: 1.2,
              "&:hover": { backgroundColor: "#c49a50" },
            }}
          >
            Confirm Order
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Order;
