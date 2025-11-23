import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // ✅ You can later replace this with real authentication
    if (username === "admin" && password === "cafe123") {
      navigate("/admin-home");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0d1f1b 0%,#14312c 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 5,
          borderRadius: 4,
          maxWidth: 400,
          width: "100%",
          backgroundColor: "#1b3a34",
          color: "#f1e8d2",
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight="bold"
          sx={{ color: "#d6ad60", mb: 3 }}
        >
          Admin Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              mb: 3,
              input: { color: "#f1e8d2" },
              label: { color: "#d6ad60" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#d6ad60" },
                "&:hover fieldset": { borderColor: "#e8d5b7" },
              },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 4,
              input: { color: "#f1e8d2" },
              label: { color: "#d6ad60" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#d6ad60" },
                "&:hover fieldset": { borderColor: "#e8d5b7" },
              },
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={!username || !password}
            sx={{
              backgroundColor: "#d6ad60",
              color: "#1b3a34",
              fontWeight: "bold",
              borderRadius: "1rem",
              py: 1.2,
              "&:hover": { backgroundColor: "#e8d5b7" },
            }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminLogin;
