const express = require('express');
const { analyzePortfolio, getLatestAnalysis } = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/portfolio', protect, analyzePortfolio);
router.get('/latest', protect, getLatestAnalysis);

module.exports = router;