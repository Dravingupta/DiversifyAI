const Payment = require("../models/Payment");

const checkPaymentAccess = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const paidPayment = await Payment.findOne({
      user: userId,
      status: "paid",
    });

    if (!paidPayment) {
      return res.status(403).json({
        message: "Access denied. Please complete payment to start chat.",
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  checkPaymentAccess,
};