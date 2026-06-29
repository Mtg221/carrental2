require('dotenv').config();
const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./connection/connection");
const authRoutes    = require("./routes/auth");
const carRoutes     = require("./routes/cars");
const bookingRoutes = require("./routes/booking");

const app  = express();
const PORT = process.env.PORT || 3001;

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET manquant dans .env");

connectDB();

app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",").map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS non autorisé"));
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives, réessayez dans 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);

app.use("/api/auth",     authRoutes);
app.use("/api/cars",     carRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => res.json({ message: "API is running" }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
