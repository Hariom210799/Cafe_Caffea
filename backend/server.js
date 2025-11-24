console.log("🔍 USING CORRECT SERVER FILE");
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

/* -----------------------------------------------------
   ✅ FIXED CORS — ALLOW VERCEL FRONTEND
----------------------------------------------------- */
app.use(
  cors({
    origin: [
      "https://cafe-caffea.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

/* -----------------------------------------------------
   BODY PARSER & LOGGER
----------------------------------------------------- */
app.use(express.json());
app.use(morgan("dev"));

/* -----------------------------------------------------
   HEALTH CHECK
----------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("☕ Cafe Caffea Backend Running!");
});

/* -----------------------------------------------------
   START SERVER AFTER DB CONNECTS
----------------------------------------------------- */
const startServer = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();
    console.log("🚀 MongoDB connected. Starting server...");

    // Routes
    app.use("/api/menu", menuRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api/inventory", inventoryRoutes);
    app.use("/api/billing", billingRoutes);
    app.use("/api/history", historyRoutes);
    app.use("/api/suppliers", supplierRoutes);
    app.use("/api/employees", employeeRoutes);
    app.use("/api/upload", uploadRoutes);
    app.use("/api/tables", tableRoutes);
    app.use("/api/notifications", notificationRoutes);
    app.use("/api/categories", categoryRoutes);

    // Serve static uploads (old system)
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🔥 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
  }
};

startServer();
