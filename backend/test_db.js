const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URL).then(async () => {
const Portfolio = require('./models/Portfolio');
console.log(JSON.stringify(await Portfolio.find({}), null, 2));
process.exit(0);
});