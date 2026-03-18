const mongoose = require("mongoose");

const Payment = require("../models/Payment");
const ChatRoom = require("../models/ChatRoom");

const SESSION_DURATION_HOURS = 24;

const buildActivePaymentQuery = ({ userId, advisorId, now }) => {
  const fallbackWindowStart = new Date(now.getTime() - SESSION_DURATION_HOURS * 60 * 60 * 1000);

  return {
    user: userId,
    advisor: advisorId,
    status: "paid",
    $or: [
      { accessExpiresAt: { $gt: now } },
      {
        accessExpiresAt: null,
        paidAt: { $gte: fallbackWindowStart },
      },
      {
        accessExpiresAt: null,
        paidAt: null,
        createdAt: { $gte: fallbackWindowStart },
      },
    ],
  };
};

const checkPaymentAccess = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;
    const userRole = (req.user && req.user.role) || "client";
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (userRole === "advisor") {
      return next();
    }

    let advisorId = req.body && req.body.advisorId;
    const chatId = (req.params && req.params.chatId) || (req.body && req.body.chatId);

    if (!advisorId && chatId) {
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ message: "Invalid chat ID" });
      }

      const chat = await ChatRoom.findOne({ _id: chatId, user: userId }).select("advisor");
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      advisorId = chat.advisor;
    }

    if (!advisorId) {
      return res.status(400).json({
        message: "Advisor ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(String(advisorId))) {
      return res.status(400).json({ message: "Invalid advisor ID" });
    }

    const now = new Date();

    const payment = await Payment.findOne(
      buildActivePaymentQuery({ userId, advisorId, now })
    ).sort({ paidAt: -1, createdAt: -1 });

    if (!payment) {
      return res.status(403).json({
        message: "Session expired or payment missing. Please complete payment to unlock chat for 24 hours.",
      });
    }

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error in payment middleware",
    });
  }
};

module.exports = {
  checkPaymentAccess,
};