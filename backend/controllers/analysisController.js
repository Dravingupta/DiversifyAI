const { OpenAI } = require('openai');
const Portfolio = require('../models/Portfolio');
const AnalysisSnapshot = require('../models/AnalysisSnapshot');

const client = new OpenAI({
  baseURL: 'https://ai.megallm.io/v1',
  apiKey: process.env.MEGALLM_API_KEY
});

const getAnalysisDateKey = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const analyzePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    const analysisDate = getAnalysisDateKey();

    const cachedSnapshot = await AnalysisSnapshot.findOne({
      user: req.user._id,
      analysisDate,
    }).lean();

    if (cachedSnapshot) {
      return res.status(200).json({
        diversificationScore: cachedSnapshot.diversificationScore,
        riskScore: cachedSnapshot.riskScore,
        portfolioHealth: cachedSnapshot.portfolioHealth,
        marketCapMix: cachedSnapshot.marketCapMix,
        recommendations: cachedSnapshot.recommendations,
        generatedAt: cachedSnapshot.generatedAt,
        isCached: true,
      });
    }

    if (!portfolio || portfolio.stocks.length === 0) {
      return res.status(200).json({
        diversificationScore: 0,
        riskScore: 0,
        portfolioHealth: 0,
        marketCapMix: {
          'Large Cap': 0,
          'Mid Cap': 0,
          'Small Cap': 0,
        },
        recommendations: [
          'Add stocks to your portfolio to unlock AI analysis and advisor-ready insights.'
        ],
      });
    }

    // Format the portfolio to send to the LLM
    const portfolioContext = portfolio.stocks.map(stock => 
      `- ${stock.symbol} (Sector: ${stock.sector}): ${stock.quantity} shares bought @ ₹${stock.buyPrice}, currently worth ₹${stock.currentValue}`
    ).join('\n');

    const prompt = `
You are an expert Indian financial advisor AI. Analyze the following stock portfolio and provide actionable insights.
Portfolio breakdown:
${portfolioContext}

You must return ONLY a strictly valid JSON object matching the exact format below, with no markdown formatting like \`\`\`json:
{
  "diversificationScore": <number 0-100>,
  "riskScore": <number 0-100 indicating risk level>,
  "portfolioHealth": <number 0-100>,
  "marketCapMix": {
    "Large Cap": <number 0-100 percentage>,
    "Mid Cap": <number 0-100 percentage>,
    "Small Cap": <number 0-100 percentage>
  },
  "recommendations": ["<specific actionable recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}
Limit recommendations to exactly 3 or 4 concise, extremely specific and professional insights. Ensure marketCapMix percentages sum exactly to 100 based on realistic Indian stock market capitalizations.
`;

    const response = await client.chat.completions.create({
      model: 'gpt-5.1',
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const aiOutput = response.choices[0].message.content.trim();
    
    let parsedData;
    try {
      // Remove any erroneous markdown blocks that might get appended just in case
      const cleanJsonStr = aiOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI output:", aiOutput);
      return res.status(500).json({ message: 'Error formatting AI response. Please try again.' });
    }

    const generatedAt = new Date();

    await AnalysisSnapshot.create({
      user: req.user._id,
      analysisDate,
      diversificationScore: parsedData.diversificationScore,
      riskScore: parsedData.riskScore,
      portfolioHealth: parsedData.portfolioHealth,
      marketCapMix: parsedData.marketCapMix,
      recommendations: parsedData.recommendations,
      generatedAt,
    });

    res.status(200).json({
      diversificationScore: parsedData.diversificationScore,
      riskScore: parsedData.riskScore,
      portfolioHealth: parsedData.portfolioHealth,
      marketCapMix: parsedData.marketCapMix,
      recommendations: parsedData.recommendations,
      generatedAt,
      isCached: false,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      try {
        const fallbackSnapshot = await AnalysisSnapshot.findOne({
          user: req.user._id,
          analysisDate: getAnalysisDateKey(),
        }).lean();

        if (fallbackSnapshot) {
          return res.status(200).json({
            diversificationScore: fallbackSnapshot.diversificationScore,
            riskScore: fallbackSnapshot.riskScore,
            portfolioHealth: fallbackSnapshot.portfolioHealth,
            marketCapMix: fallbackSnapshot.marketCapMix,
            recommendations: fallbackSnapshot.recommendations,
            generatedAt: fallbackSnapshot.generatedAt,
            isCached: true,
          });
        }
      } catch (fallbackError) {
        console.error('Analysis snapshot fallback error:', fallbackError);
      }
    }

    console.error("AI Analysis Error:", error);
    res.status(500).json({ message: 'Server error during AI portfolio analysis', error: error.message });
  }
};

const getLatestAnalysis = async (req, res) => {
  try {
    const latestSnapshot = await AnalysisSnapshot.findOne({ user: req.user._id })
      .sort({ analysisDate: -1, generatedAt: -1 })
      .lean();

    if (!latestSnapshot) {
      return res.status(200).json({
        diversificationScore: 0,
        riskScore: 0,
        portfolioHealth: 0,
        marketCapMix: {
          'Large Cap': 0,
          'Mid Cap': 0,
          'Small Cap': 0,
        },
        recommendations: [],
        generatedAt: null,
        isCached: true,
      });
    }

    return res.status(200).json({
      diversificationScore: latestSnapshot.diversificationScore,
      riskScore: latestSnapshot.riskScore,
      portfolioHealth: latestSnapshot.portfolioHealth,
      marketCapMix: latestSnapshot.marketCapMix,
      recommendations: latestSnapshot.recommendations,
      generatedAt: latestSnapshot.generatedAt,
      isCached: true,
    });
  } catch (error) {
    console.error('getLatestAnalysis error:', error);
    return res.status(500).json({ message: 'Failed to fetch latest analysis' });
  }
};

module.exports = {
  analyzePortfolio,
  getLatestAnalysis,
};