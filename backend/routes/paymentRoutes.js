const express = require("express");

const {
  createOrder,
  verifyPayment,
  getAdvisorEarnings,
} = require("../controllers/paymentController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/advisor/earnings", protect, requireRole("advisor"), getAdvisorEarnings);

module.exports = router;