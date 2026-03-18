const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  // User's full name shown in the app.
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // Unique login email, normalized for consistent lookups.
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  // Stores the hashed password (never plain text).
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["client", "advisor", "admin"],
    default: "client",
    required: true,
    index: true,
  },
  // Timestamp for when the user account was created.
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function () {
  // Hash password only when it is newly set or modified.
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  // Compare a plain password with the stored hash.
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
