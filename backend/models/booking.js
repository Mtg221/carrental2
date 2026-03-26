const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    carId:  { type: mongoose.Schema.Types.ObjectId, ref: "Car",  required: true },
    car: {
      make:        String,
      model:       String,
      image:       String,
      pricePerDay: Number,
    },
    startDate:   { type: String, required: true },
    endDate:     { type: String, required: true },
    days:        Number,
    extras:      [String],
    extrasTotal: Number,
    carTotal:    Number,
    totalPrice:  Number,
    status:      { type: String, default: "confirmed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);