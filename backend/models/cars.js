const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    make:         { type: String, required: true },
    model:        { type: String, required: true },
    year:         { type: Number, required: true },
    category:     { type: String, required: true },
    seats:        Number,
    transmission: String,
    fuel:         String,
    pricePerDay:  { type: Number, required: true },
    image:        String,
    available:    { type: Boolean, default: true },
    description:  String,
    mileage:      String,
    features:     [String],
  },
  { timestamps: true, toJSON: { virtuals: true, transform: (_, ret) => { ret.id = ret._id; delete ret.__v; return ret; } } }
);

module.exports = mongoose.model("Car", carSchema);