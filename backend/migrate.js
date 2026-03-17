const mongoose = require('mongoose');
require('dotenv').config();
const { default: YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
   const Portfolio = require('./models/Portfolio');
   const portfolios = await Portfolio.find({});
   
   for (let p of portfolios) {
       let updated = false;
       for (let stock of p.stocks) {
           if (stock.sector === 'Equities' || stock.sector === 'Other') {
               try {
                   const summary = await yahooFinance.quoteSummary(stock.symbol + '.NS', { modules: ['assetProfile'] }).catch(()=>null);
                   if (summary && summary.assetProfile && summary.assetProfile.sector) {
                       stock.sector = summary.assetProfile.sector;
                       updated = true;
                   } else {
                       const boSummary = await yahooFinance.quoteSummary(stock.symbol + '.BO', { modules: ['assetProfile'] }).catch(()=>null);
                       if (boSummary && boSummary.assetProfile && boSummary.assetProfile.sector) {
                           stock.sector = boSummary.assetProfile.sector;
                           updated = true;
                       }
                   }
               } catch (e) {}
           }
       }
       if (updated) {
           await p.save();
           console.log("Updated portfolio for user:", p.user);
       }
   }
   console.log("Migration complete");
   process.exit(0);
}).catch(console.error);