const jwt = require("jsonwebtoken");

const User = require("../models/User");

const getConfiguredAdmin = () => {
  const email = String(process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = String(process.env.ADMIN_PASSWORD || "");
  const name = String(process.env.ADMIN_NAME || "Platform Admin").trim();

  return {
    name,
    email,
    password,
    isPasswordValid: password.length >= 6,
    isConfigured: Boolean(email && password),
  };
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const configuredAdmin = getConfiguredAdmin();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (configuredAdmin.email && normalizedEmail === configuredAdmin.email) {
      return res.status(403).json({
        message: "This email is reserved for platform admin",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: "client",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("registerUser error:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

const createAdvisorByAdmin = async (req, res) => {
  try {
    const configuredAdmin = getConfiguredAdmin();
    if (!configuredAdmin.isConfigured) {
      return res.status(500).json({
        message: "Admin credentials are not configured on server",
      });
    }

    const requesterEmail =
      req.user && req.user.email ? String(req.user.email).toLowerCase().trim() : "";

    if (requesterEmail !== configuredAdmin.email) {
      return res.status(403).json({
        message: "Only the platform admin can create advisor accounts",
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (normalizedEmail === configuredAdmin.email) {
      return res.status(400).json({ message: "Cannot create advisor with admin email" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const advisor = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: "advisor",
    });

    return res.status(201).json({
      message: "Advisor account created successfully",
      advisor: {
        id: advisor._id,
        name: advisor.name,
        email: advisor.email,
        role: advisor.role,
      },
    });
  } catch (error) {
    console.error("createAdvisorByAdmin error:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    return res.status(500).json({ message: "Failed to create advisor account" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const configuredAdmin = getConfiguredAdmin();

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Single admin login driven by environment configuration.
    if (
      configuredAdmin.isConfigured &&
      normalizedEmail === configuredAdmin.email &&
      String(password) === configuredAdmin.password
    ) {
      if (!configuredAdmin.isPasswordValid) {
        return res.status(500).json({
          message:
            "Admin credentials are misconfigured: ADMIN_PASSWORD must be at least 6 characters",
        });
      }

      let adminUser = await User.findOne({ email: configuredAdmin.email });

      if (!adminUser) {
        adminUser = await User.create({
          name: configuredAdmin.name,
          email: configuredAdmin.email,
          password: configuredAdmin.password,
          role: "admin",
        });
      } else if (adminUser.role !== "admin") {
        adminUser.role = "admin";
        await adminUser.save();
      }

      const adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        token: adminToken,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAdvisorUsers = async (_req, res) => {
  try {
    const advisors = await User.find({ role: "advisor" })
      .sort({ createdAt: -1 })
      .select("name email createdAt");

    return res.status(200).json({ advisors });
  } catch (error) {
    console.error("getAdvisorUsers error:", error);
    return res.status(500).json({ message: "Failed to fetch advisors" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAdvisorUsers,
  createAdvisorByAdmin,
};
