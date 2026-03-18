const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  currency: {
    type: String,
    required: true,
    default: "INR",
    trim: true,
    uppercase: true,
  },
  razorpay_order_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  razorpay_payment_id: {
    type: String,
    default: null,
    trim: true,
  },
  razorpay_signature: {
    type: String,
    default: null,
    trim: true,
  },
  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);