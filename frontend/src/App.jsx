import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Navbar from "./components/Navbar";
import HomePage from "./pages/Home";
import Order from "./pages/Order";
import ConfirmOrder from "./pages/ConfirmOrder";
import { CartProvider } from "./context/CartContext";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminHome from "./pages/AdminHome";
import AdminInventory  from "./pages/AdminInventory";
import AdminBilling from "./pages/AdminBilling";
import AdminHistory from "./pages/AdminHistory";
import AdminCategories from "./pages/AdminCategories";
import AdminEditMenu from "./pages/AdminEditMenu";
const MenuPage = React.lazy(() => import("./pages/MenuPage"));
const CategoryItems = React.lazy(() => import("./pages/CategoryItems"));

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* ✅ Wrap the entire app inside CartProvider */}
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <React.Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/admin/billing" element={<AdminBilling />} />
              <Route path="/menu/:category" element={<CategoryItems />} />
              <Route path="/confirm-order" element={<ConfirmOrder />} />
              <Route path="/order" element={<Order />} />
              <Route path="/admin/history" element={<AdminHistory />} />
              <Route path="/admin-login" element={<AdminLogin />} /> 
              <Route path="/admin-home" element={<AdminHome />} />
              <Route path="/admin/orders" element={<Admin />} />
              <Route path="/admin/inventory" element={<AdminInventory  />} />
              <Route path="/admin/edit-menu" element={<AdminEditMenu />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </CartProvider>
    </ThemeProvider>
  );
}
