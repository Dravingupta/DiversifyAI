const crypto = require("crypto");

const Payment = require("../models/Payment");
const razorpay = require("../services/razorpayService");

const createOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { amount } = req.body;
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a valid number greater than 0" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res
        .status(500)
        .json({ message: "Razorpay keys are not configured on the server" });
    }

    const receipt = `receipt_${Date.now()}_${crypto
      .randomBytes(4)
      .toString("hex")}`;

    const order = await razorpay.orders.create({
      amount: Math.round(parsedAmount * 100),
      currency: "INR",
      receipt,
    });

    const payment = await Payment.create({
      user: req.user._id,
      amount: parsedAmount,
      currency: order.currency,
      razorpay_order_id: order.id,
      status: "created",
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message:
          "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res
        .status(500)
        .json({ message: "Razorpay key secret is not configured on the server" });
    }

    const payment = await Payment.findOne({
      razorpay_order_id,
      user: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature)
      );

    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.status = isSignatureValid ? "paid" : "failed";
    await payment.save();

    if (!isSignatureValid) {
      return res.status(400).json({
        message: "Payment signature verification failed",
        status: payment.status,
      });
    }

    return res.status(200).json({
      message: "Payment verified successfully",
      status: payment.status,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({ message: "Failed to verify payment" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};