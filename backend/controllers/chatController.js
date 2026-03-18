const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");

const createChatRoom = async (req, res) => {
  try {
    const { advisorId } = req.body;
    const userId = req.user._id;

    if (!advisorId) {
      return res.status(400).json({ message: "advisorId is required" });
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

    if (!chatId || !message) {
      return res.status(400).json({ message: "chatId and message are required" });
    }

    await Message.create({
      chat: chatId,
      sender: senderId,
      message,
    });

    return res.status(201).json({ message: "Message sent" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .populate("sender", "name");

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createChatRoom,
  sendMessage,
  getMessages,
};