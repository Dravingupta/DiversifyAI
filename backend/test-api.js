const { default: YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance();
async function test() {
  try {
    const q = await yahooFinance.quote('RELIANCE.NS');
    console.log("Pricing fetches are working:", q.regularMarketPrice);
  } catch (err) {
    console.log("Yahoo finance failed:", err.message);
  }
}
test();
