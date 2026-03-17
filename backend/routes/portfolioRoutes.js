const express = require('express');
const { getPortfolio, addStockToPortfolio } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getPortfolio);
router.post('/add', protect, addStockToPortfolio);

module.exports = router;