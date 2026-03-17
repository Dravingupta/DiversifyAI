const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stockSchema = new Schema({
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  buyPrice: { type: Number, required: true },
  sector: { type: String, default: 'Miscellaneous' },
  currentValue: { type: Number, default: 0 },
});

const portfolioSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    stocks: [stockSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);