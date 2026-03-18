const mongoose = require("mongoose");

const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const Payment = require("../models/Payment");
const User = require("../models/User");

const SESSION_DURATION_HOURS = 24;

const getActivePaymentQuery = (userId, advisorId, now) => {
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

const isParticipant = (chatRoom, userId) => {
  return (
    String(chatRoom.user) === String(userId) ||
    String(chatRoom.advisor) === String(userId)
  );
};

const hasPaidAccess = async (userId, advisorId) => {
  const now = new Date();

  const paidRecord = await Payment.findOne({
    ...getActivePaymentQuery(userId, advisorId, now),
  }).select("_id");

  return Boolean(paidRecord);
};

const createChatRoom = async (req, res) => {
  try {
    const { advisorId } = req.body;
    const userId = req.user._id;
    const userRole = (req.user && req.user.role) || "client";

    if (userRole !== "client") {
      return res.status(403).json({ message: "Only clients can create consultation chats" });
    }

    if (!advisorId) {
      return res.status(400).json({
        message: "Advisor ID is required to create chat",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(String(advisorId))) {
      return res.status(400).json({ message: "Invalid advisor ID" });
    }

    const advisor = await User.findById(advisorId).select("role");
    if (!advisor || advisor.role !== "advisor") {
      return res.status(404).json({ message: "Advisor account not found" });
    }

    let room = await ChatRoom.findOne({ user: userId, advisor: advisorId });

    if (!room) {
      room = await ChatRoom.create({ user: userId, advisor: advisorId });
    }

    return res.status(200).json({
      chatId: room._id,
      message: "Chat room ready",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId, message } = req.body;
    const senderId = req.user._id;
    const userRole = (req.user && req.user.role) || "client";

    if (!chatId || !message) {
      return res.status(400).json({ message: "chatId and message are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(String(chatId))) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    const chatRoom = await ChatRoom.findById(chatId).select("user advisor");
    if (!chatRoom) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!isParticipant(chatRoom, senderId)) {
      return res.status(403).json({ message: "Not authorized for this chat" });
    }

    if (userRole === "client") {
      const paid = await hasPaidAccess(senderId, chatRoom.advisor);
      if (!paid) {
        return res.status(403).json({
          message: "Consultation session expired. Please complete payment to unlock chat for 24 hours.",
        });
      }
    }

    await Message.create({
      chat: chatId,
      sender: senderId,
      message: String(message).trim(),
    });

    return res.status(201).json({ message: "Message sent" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const requesterId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(String(chatId))) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    const chatRoom = await ChatRoom.findById(chatId).select("user advisor");
    if (!chatRoom) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!isParticipant(chatRoom, requesterId)) {
      return res.status(403).json({ message: "Not authorized for this chat" });
    }

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .populate("sender", "name email role");

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const getClientChatRooms = async (req, res) => {
  try {
    const clientId = req.user._id;
    const now = new Date();

    const chatRooms = await ChatRoom.find({ user: clientId, isActive: true })
      .sort({ createdAt: -1 })
      .populate("advisor", "name email")
      .select("user advisor createdAt sessionUnlockedAt sessionExpiresAt");

    const rooms = await Promise.all(
      chatRooms.map(async (room) => {
        const lastMessage = await Message.findOne({ chat: room._id })
          .sort({ createdAt: -1 })
          .select("message createdAt sender")
          .populate("sender", "name");

        const latestPayment = await Payment.findOne({
          user: clientId,
          advisor: room.advisor && room.advisor._id,
          status: "paid",
        })
          .sort({ paidAt: -1, createdAt: -1 })
          .select("accessExpiresAt paidAt createdAt");

        const accessExpiresAt =
          (latestPayment && latestPayment.accessExpiresAt) ||
          room.sessionExpiresAt ||
          null;

        const isSessionActive =
          Boolean(accessExpiresAt) && new Date(accessExpiresAt).getTime() > now.getTime();

        return {
          chatId: room._id,
          advisor: room.advisor,
          createdAt: room.createdAt,
          accessExpiresAt,
          isSessionActive,
          lastMessage: lastMessage
            ? {
                text: lastMessage.message,
                senderName: lastMessage.sender && lastMessage.sender.name,
                createdAt: lastMessage.createdAt,
              }
            : null,
        };
      })
    );

    return res.status(200).json({ rooms });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const getAdvisorChatRooms = async (req, res) => {
  try {
    const advisorId = req.user._id;

    const chatRooms = await ChatRoom.find({ advisor: advisorId, isActive: true })
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .select("user advisor createdAt");

    const roomsWithLastMessage = await Promise.all(
      chatRooms.map(async (room) => {
        const lastMessage = await Message.findOne({ chat: room._id })
          .sort({ createdAt: -1 })
          .select("message createdAt sender")
          .populate("sender", "name");

        return {
          chatId: room._id,
          client: room.user,
          createdAt: room.createdAt,
          lastMessage: lastMessage
            ? {
                text: lastMessage.message,
                senderName: lastMessage.sender && lastMessage.sender.name,
                createdAt: lastMessage.createdAt,
              }
            : null,
        };
      })
    );

    return res.status(200).json({ rooms: roomsWithLastMessage });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createChatRoom,
  sendMessage,
  getMessages,
  getAdvisorChatRooms,
  getClientChatRooms,
};