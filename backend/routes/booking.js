const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const router = express.Router();

// Booking Schema (inline since the model import won't work with the broken routes)
const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
    car: {
      make: String,
      model: String,
      image: String,
      pricePerDay: Number,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    days: Number,
    extras: [String],
    extrasTotal: Number,
    carTotal: Number,
    totalPrice: Number,
    status: { type: String, default: "confirmed" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_, ret) => { ret.id = ret._id; delete ret.__v; return ret; } },
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

// GET /api/bookings - Get user's bookings OR all bookings (admin)
router.get("/", auth, async (req, res) => {
  try {
    let bookings;
    // If admin, return all bookings
    if (req.user.role === "admin") {
      bookings = await Booking.find().populate("userId", "name email").populate("carId");
    } else {
      // Regular user gets only their bookings
      bookings = await Booking.find({ userId: req.user.id });
    }
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings - Create a new booking
router.post("/", auth, async (req, res) => {
  try {
    const booking = await Booking.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/bookings/:id - Cancel/delete a booking
router.delete("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Admin can delete any booking, regular users only their own
    if (req.user.role !== "admin" && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bookings/:id - Update booking status (admin)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/admin/stats - Get booking statistics (admin)
router.get("/admin/stats", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const totalBookings = await Booking.countDocuments();
    const confirmed = await Booking.countDocuments({ status: "confirmed" });
    const cancelled = await Booking.countDocuments({ status: "cancelled" });
    const pending = await Booking.countDocuments({ status: "pending" });

    // Calculate total revenue
    const revenueAgg = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      totalBookings,
      confirmed,
      cancelled,
      pending,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
