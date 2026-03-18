const express = require("express");

const {
  createChatRoom,
  sendMessage,
  getMessages,
  getAdvisorChatRooms,
  getClientChatRooms,
} = require("../controllers/chatController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { checkPaymentAccess } = require("../middleware/paymentMiddleware");

const router = express.Router();

router.post("/create-room", protect, checkPaymentAccess, createChatRoom);
router.post("/send", protect, checkPaymentAccess, sendMessage);
router.get("/messages/:chatId", protect, getMessages);
router.get("/advisor/rooms", protect, requireRole("advisor"), getAdvisorChatRooms);
router.get("/client/rooms", protect, requireRole("client"), getClientChatRooms);

module.exports = router;