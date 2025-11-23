// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6EC7C0" },        // Café Blue
    secondary: { main: "#F5C542" },      // Soft Mustard
    success: { main: "#355C3E" },        // Deep Plant Green
    info: { main: "#C07B42" },           // Warm Wood
    text: {
      primary: "#1E1E1E",                // Charcoal
      secondary: "#3a3a3a",
    },
    background: {
      default: "#F9F9F9",                // Off-White
      paper: "rgba(255,255,255,0.7)",
    },
  },
  typography: {
    fontFamily: `"Inter", "Poppins", "Segoe UI", Roboto, Arial, sans-serif`,
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

export default theme;
// Tailwind reusable class
const styles = `.inputField {
  @apply w-full p-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300;
}`;
