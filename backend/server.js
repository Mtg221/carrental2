require('dotenv').config();
const express   = require("express");
const cors      = require("cors");
const path      = require("path");
const jwt       = require("jsonwebtoken");

const connectDB = require("./connection/connection");

const authRoutes    = require("./routes/auth");
const carRoutes     = require("./routes/cars");
const bookingRoutes = require("./routes/booking");

const app  = express();
const PORT = process.env.PORT || 3001;

// ✅ Check JWT_SECRET (important)
if (!process.env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is missing in .env");
}

// ─── Database ─────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/public")));

// ─── Routes ───────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/cars",     carRoutes);
app.use("/api/bookings", bookingRoutes);

// ─── Catch-all (SPA) ──────────────────────────────────
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

// ─── Start server ─────────────────────────────────────
app.listen(PORT, () =>
  console.log(`🚗 DriveElite API running on http://localhost:${PORT}`)
);
