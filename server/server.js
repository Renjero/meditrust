
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import cors from "cors";

import connectDB from "./config/dbConfig.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import pathologistRoutes from "./routes/pathologistRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// 1. Initialize Express FIRST
const app = express();

// 2. Configure CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 3. Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Connect to MongoDB
connectDB();

// 5. AUTH ROUTES
app.use("/api/auth", authRoutes);

// 6. ADMIN ROUTES
app.use("/api/admin", adminRoutes);

// 7. AI ROUTES
app.use("/api/ai", aiRoutes);

// 8. PRODUCT ROUTES
app.use("/api/products", productRoutes);

// 9. PATHOLOGIST ROUTES
app.use("/api/pathologist", pathologistRoutes);

// 10. DOCTOR ROUTES
app.use("/api/doctor", doctorRoutes);

// 11. ERROR HANDLER
app.use(errorHandler);

// 12. START SERVER
app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING AT PORT : ${PORT}`.bgBlue);
});
