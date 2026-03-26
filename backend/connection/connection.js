const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");
    await createDefaultAdmin();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  const User = require("../models/users");
  const existing = await User.findOne({ email: "admin@driveelite.com" });
  if (existing) return; // already exists, do nothing

  const hashed = await bcrypt.hash("admin123", 10);
  await User.create({
    name: "Admin User",
    email: "admin@driveelite.com",
    password: hashed,
    role: "admin",
  });
  console.log("👤 Default admin created → admin@driveelite.com / admin123");
};

module.exports = connectDB;