const Portfolio = require('../models/Portfolio');

// Mock data to map symbol to sector and slight random current value variation.
const MOCK_STOCK_DATA = {
  'RELIANCE': { sector: 'Energy', basePrice: 2800 },
  'TCS': { sector: 'IT', basePrice: 3800 },
  'HDFCBANK': { sector: 'Banking', basePrice: 1600 },
  'INFY': { sector: 'IT', basePrice: 1500 },
  'ITC': { sector: 'FMCG', basePrice: 450 },
  'SUNPHARMA': { sector: 'Pharma', basePrice: 1100 },
};

const getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio) {
      return res.status(200).json({
        totalInvestment: 0,
        totalStocks: 0,
        stocks: [],
      });
    }

    let totalInvestment = 0;
    
    // Transform stocks data and calculate total investment
    const processedStocks = portfolio.stocks.map((stock) => {
      totalInvestment += stock.buyPrice * stock.quantity;
      return {
        symbol: stock.symbol,
        quantity: stock.quantity,
        sector: stock.sector,
        currentValue: stock.currentValue,
        buyPrice: stock.buyPrice
      };
    });

    res.status(200).json({
      totalInvestment,
      totalStocks: processedStocks.length,
      stocks: processedStocks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving portfolio', error: error.message });
  }
};

const addStockToPortfolio = async (req, res) => {
  const { stockSymbol, quantity, buyPrice } = req.body;

  if (!stockSymbol || !quantity || !buyPrice) {
    return res.status(400).json({ message: 'Please provide all stock fields' });
  }

  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user._id, stocks: [] });
    }

    // Determine sector and current mock value
    const normalizedSymbol = stockSymbol.trim().toUpperCase();
    const mockRef = MOCK_STOCK_DATA[normalizedSymbol] || { sector: 'Other', basePrice: buyPrice };
    
    // Creating some random fluctuation for current value for realism (-5% to +5%)
    const variation = mockRef.basePrice * ((Math.random() * 0.1) - 0.05);
    const simulatedCurrentValuePerUnit = Math.max(1, mockRef.basePrice + variation);
    const totalCurrentValue = Math.round(simulatedCurrentValuePerUnit * quantity);

    const newStock = {
      symbol: normalizedSymbol,
      quantity,
      buyPrice,
      sector: mockRef.sector,
      currentValue: totalCurrentValue
    };

    portfolio.stocks.push(newStock);
    await portfolio.save();

    res.status(201).json({ message: 'Stock added successfully', stock: newStock });
  } catch (error) {
    res.status(500).json({ message: 'Server error saving stock', error: error.message });
  }
};

module.exports = {
  getPortfolio,
  addStockToPortfolio,
};