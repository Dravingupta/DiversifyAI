const crypto = require("crypto");
const mongoose = require("mongoose");

const Payment = require("../models/Payment");
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const Portfolio = require("../models/Portfolio");
const razorpay = require("../services/razorpayService");

const SESSION_DURATION_HOURS = 24;

const buildPortfolioSnapshot = (portfolio) => {
  const stocks = Array.isArray(portfolio && portfolio.stocks) ? portfolio.stocks : [];

  if (stocks.length === 0) {
    return {
      text: "Consultation started: client portfolio is currently empty.",
      payload: {
        holdingsCount: 0,
        totalInvestment: 0,
        totalCurrentValue: 0,
        sectors: [],
        holdings: [],
      },
    };
  }

  let totalInvestment = 0;
  let totalCurrentValue = 0;
  const sectorValues = {};

  const holdings = stocks.map((stock) => {
    const quantity = Number(stock.quantity || 0);
    const buyPrice = Number(stock.buyPrice || 0);
    const invested = buyPrice * quantity;
    const currentValue = Number(stock.currentValue || invested);

    totalInvestment += invested;
    totalCurrentValue += currentValue;

    const sectorName = stock.sector || "Misc";
    sectorValues[sectorName] = (sectorValues[sectorName] || 0) + currentValue;

    return {
      symbol: stock.symbol,
      sector: sectorName,
      quantity,
      buyPrice,
      currentValue,
    };
  });

  const sortedHoldings = holdings
    .slice()
    .sort((a, b) => b.currentValue - a.currentValue)
    .map((holding) => ({
      ...holding,
      weight: totalCurrentValue > 0 ? Math.round((holding.currentValue / totalCurrentValue) * 100) : 0,
    }))
    .slice(0, 8);

  const sectors = Object.entries(sectorValues)
    .map(([name, value]) => ({
      name,
      allocation: totalCurrentValue > 0 ? Math.round((value / totalCurrentValue) * 100) : 0,
    }))
    .sort((a, b) => b.allocation - a.allocation)
    .slice(0, 6);

  return {
    text: `Consultation started: portfolio snapshot shared (${stocks.length} holdings, invested INR ${Math.round(totalInvestment).toLocaleString("en-IN")}).`,
    payload: {
      holdingsCount: stocks.length,
      totalInvestment,
      totalCurrentValue,
      sectors,
      holdings: sortedHoldings,
    },
  };
};

const createOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { amount, advisorId } = req.body;
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a valid number greater than 0" });
    }

    if (!advisorId) {
      return res.status(400).json({ message: "advisorId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(advisorId)) {
      return res.status(400).json({ message: "advisorId must be a valid ID" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res
        .status(500)
        .json({ message: "Razorpay keys are not configured on the server" });
    }

    const receipt = `receipt_${Date.now()}_${crypto
      .randomBytes(4)
      .toString("hex")}`;

    const order = await razorpay.orders.create({
      amount: Math.round(parsedAmount * 100),
      currency: "INR",
      receipt,
    });

    const payment = await Payment.create({
      user: req.user._id,
      advisor: advisorId,
      amount: parsedAmount,
      currency: order.currency,
      razorpay_order_id: order.id,
      status: "created",
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      advisorId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !advisorId) {
      return res.status(400).json({
        message:
          "razorpay_order_id, razorpay_payment_id, razorpay_signature and advisorId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(advisorId)) {
      return res.status(400).json({ message: "advisorId must be a valid ID" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res
        .status(500)
        .json({ message: "Razorpay key secret is not configured on the server" });
    }

    const payment = await Payment.findOne({
      razorpay_order_id,
      user: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature)
      );

    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.advisor = advisorId;

    if (isSignatureValid) {
      const paidAt = new Date();
      const accessExpiresAt = new Date(
        paidAt.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000
      );

      payment.status = "paid";
      payment.paidAt = paidAt;
      payment.accessExpiresAt = accessExpiresAt;
    } else {
      payment.status = "failed";
      payment.paidAt = null;
      payment.accessExpiresAt = null;
    }

    await payment.save();

    if (!isSignatureValid) {
      return res.status(400).json({
        message: "Payment signature verification failed",
        status: payment.status,
      });
    }

    let chatRoom = await ChatRoom.findOne({
      user: req.user._id,
      advisor: advisorId,
    });

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        user: req.user._id,
        advisor: advisorId,
      });
    }

    chatRoom.sessionUnlockedAt = payment.paidAt;
    chatRoom.sessionExpiresAt = payment.accessExpiresAt;
    await chatRoom.save();

    const portfolio = await Portfolio.findOne({ user: req.user._id }).select("stocks");
    const snapshot = buildPortfolioSnapshot(portfolio);

    await Message.create({
      chat: chatRoom._id,
      sender: req.user._id,
      message: snapshot.text,
      messageType: "portfolio_snapshot",
      payload: snapshot.payload,
    });

    return res.status(200).json({
      message: "Payment verified successfully",
      status: payment.status,
      paymentId: payment._id,
      chatId: chatRoom._id,
      accessExpiresAt: payment.accessExpiresAt,
    });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({ message: "Failed to verify payment" });
  }
};

const getAdvisorEarnings = async (req, res) => {
  try {
    const advisorId = req.user && req.user._id;
    const role = (req.user && req.user.role) || "client";

    if (!advisorId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (role !== "advisor") {
      return res.status(403).json({ message: "Only advisors can access earnings" });
    }

    const [summary] = await Payment.aggregate([
      {
        $match: {
          advisor: new mongoose.Types.ObjectId(String(advisorId)),
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$amount" },
          paidConsultations: { $sum: 1 },
          uniqueClientIds: { $addToSet: "$user" },
        },
      },
      {
        $project: {
          _id: 0,
          totalEarnings: 1,
          paidConsultations: 1,
          uniqueClients: { $size: "$uniqueClientIds" },
        },
      },
    ]);

    const recentPayments = await Payment.find({ advisor: advisorId, status: "paid" })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email")
      .select("amount currency createdAt user");

    return res.status(200).json({
      stats: {
        totalEarnings: summary && summary.totalEarnings ? summary.totalEarnings : 0,
        paidConsultations:
          summary && summary.paidConsultations ? summary.paidConsultations : 0,
        uniqueClients: summary && summary.uniqueClients ? summary.uniqueClients : 0,
      },
      recentPayments,
    });
  } catch (error) {
    console.error("getAdvisorEarnings error:", error);
    return res.status(500).json({ message: "Failed to fetch advisor earnings" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getAdvisorEarnings,
};