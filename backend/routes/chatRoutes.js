const express = require("express");

const {
  createChatRoom,
  sendMessage,
  getMessages,
  getAdvisorChatRooms,
} = require("../controllers/chatController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { checkPaymentAccess } = require("../middleware/paymentMiddleware");

const router = express.Router();

router.post("/create-room", protect, checkPaymentAccess, createChatRoom);
router.post("/send", protect, checkPaymentAccess, sendMessage);
router.get("/messages/:chatId", protect, checkPaymentAccess, getMessages);
router.get("/advisor/rooms", protect, requireRole("advisor"), getAdvisorChatRooms);

module.exports = router;