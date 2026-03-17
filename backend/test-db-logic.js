require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Portfolio = require('./models/Portfolio');
const User = require('./models/User');

const test = async () => {
  await connectDB();
  const user = await User.findOne();
  if (!user) { console.log('No user'); process.exit(0); }
  
  const portfolio = await Portfolio.findOne({ user: user._id });
  if (!portfolio) { console.log('No portfolio for user', user.email); process.exit(0); }
  console.log('Portfolio stocks length:', portfolio.stocks.length);
  
  // Test getSectorDistribution logic
  let totalValue = 0;
  const sectorValues = {};
  portfolio.stocks.forEach((stock) => {
    const value = stock.currentValue || (stock.buyPrice * stock.quantity);
    totalValue += value;
    sectorValues[stock.sector] = (sectorValues[stock.sector] || 0) + value;
  });
  const sectorPercentages = {};
  for (const sector in sectorValues) {
    sectorPercentages[sector] = Math.round((sectorValues[sector] / totalValue) * 100);
  }
  const sorted = Object.entries(sectorPercentages).sort((a, b) => b[1] - a[1]);
  console.log('Sector sorted:', sorted);
  process.exit(0);
};
test();
