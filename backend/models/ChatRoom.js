const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

chatRoomSchema.index({ user: 1, advisor: 1 }, { unique: true });

module.exports = mongoose.model("ChatRoom", chatRoomSchema);