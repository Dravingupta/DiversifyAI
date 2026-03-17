const Portfolio = require('../models/Portfolio');
const { default: YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance();

const searchStocks = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(200).json([]);
  try {
    const results = await yahooFinance.search(q);
    const indianStocks = results.quotes
      .filter(quote => quote.symbol && (quote.symbol.endsWith('.NS') || quote.symbol.endsWith('.BO')))
      .map(quote => ({
        symbol: quote.symbol.replace('.NS', '').replace('.BO', ''),
        name: quote.shortname || quote.longname || quote.symbol,
        fullSymbol: quote.symbol,
        type: quote.quoteType,
        sector: quote.sectordisplay || quote.sector || 'Equities' 
      }));
    res.status(200).json(indianStocks);
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

const getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio || portfolio.stocks.length === 0) {
      return res.status(200).json({
        totalInvestment: 0,
        totalStocks: 0,
        stocks: [],
      });
    }

    let isModified = false;

    const pricePromises = portfolio.stocks.map(async (stock) => {
      try {
        const quote = await yahooFinance.quote(stock.symbol + '.NS');
        if (quote && quote.regularMarketPrice) {
          const livePricePerShare = quote.regularMarketPrice;
          const newCurrentValue = livePricePerShare * stock.quantity;
          
          if (stock.currentValue !== newCurrentValue) {
            stock.currentValue = newCurrentValue;
            isModified = true;
          }
        }
      } catch (err) {
        console.error('Error fetching price for', stock.symbol, err.message);
      }
    });

    await Promise.all(pricePromises);
    if (isModified) await portfolio.save();

    let totalInvestment = 0;
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
  const { stockSymbol, quantity, buyPrice, sector } = req.body;

  if (!stockSymbol || !quantity || !buyPrice) {
    return res.status(400).json({ message: 'Please provide all stock fields' });
  }

  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) portfolio = new Portfolio({ user: req.user._id, stocks: [] });

    const normalizedSymbol = stockSymbol.trim().toUpperCase();
    let currentPrice = buyPrice;
    let actualSector = sector || 'Equities';

    try {
      const quote = await yahooFinance.quote(normalizedSymbol + '.NS');
      if (quote && quote.regularMarketPrice) currentPrice = quote.regularMarketPrice;
      
      const summary = await yahooFinance.quoteSummary(normalizedSymbol + '.NS', { modules: ['assetProfile'] }).catch(() => null);
      if (summary && summary.assetProfile && summary.assetProfile.sector) {
        actualSector = summary.assetProfile.sector;
      }
    } catch (e) {
      console.error('Could not fetch live price on add', normalizedSymbol);
    }

    const newStock = {
      symbol: normalizedSymbol,
      quantity,
      buyPrice,
      sector: actualSector,
      currentValue: currentPrice * quantity
    };

    portfolio.stocks.push(newStock);
    await portfolio.save();

    res.status(201).json({ message: 'Stock added', stock: newStock });
  } catch (error) {
    res.status(500).json({ message: 'Server error saving stock', error: error.message });
  }
};

const getSectorDistribution = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio || portfolio.stocks.length === 0) return res.status(200).json({});

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
    res.status(200).json(Object.fromEntries(sorted));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving sectors', error: error.message });
  }
};

const removeStockFromPortfolio = async (req, res) => {
  const { symbol } = req.params;
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.stocks = portfolio.stocks.filter(stock => stock.symbol !== symbol.toUpperCase());
    await portfolio.save();

    res.status(200).json({ message: 'Stock removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error removing stock', error: error.message });
  }
};
module.exports = { searchStocks, getPortfolio, addStockToPortfolio, getSectorDistribution, removeStockFromPortfolio };
