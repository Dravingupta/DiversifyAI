import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { getPortfolio, addStockToPortfolio } from '../../services/api';

function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState({ stocks: [], totalInvestment: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({ symbol: '', quantity: '', buyPrice: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      const data = await getPortfolio();
      setPortfolioData(data);
    } catch (err) {
      console.error('Failed to fetch portfolio', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!formData.symbol || !formData.quantity || !formData.buyPrice) {
      setErrorMsg('Please fill all fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await addStockToPortfolio(
        formData.symbol, 
        Number(formData.quantity), 
        Number(formData.buyPrice)
      );
      setFormData({ symbol: '', quantity: '', buyPrice: '' });
      await fetchPortfolio(); // Refresh table
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AppLayout
      title="Portfolio Management"
      subtitle="Add holdings, review stock-level exposure, and monitor allocation quality before triggering analysis."
    >
      <section className="enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '130ms' }}>
        <h2 className="font-display text-2xl tracking-tight">Add New Holding</h2>
        {errorMsg && <div className="mt-4 text-sm text-red-500 font-semibold">{errorMsg}</div>}
        <form className="mt-5 grid gap-4 md:grid-cols-4" onSubmit={handleAddStock}>
          <input 
            className="input-shell" 
            placeholder="Stock Symbol" 
            name="symbol"
            value={formData.symbol}
            onChange={handleInputChange}
          />
          <input 
            type="number"
            className="input-shell" 
            placeholder="Quantity" 
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={handleInputChange}
          />
          <input 
            type="number"
            className="input-shell" 
            placeholder="Buy Price" 
            name="buyPrice"
            min="0.01"
            step="0.01"
            value={formData.buyPrice}
            onChange={handleInputChange}
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`premium-btn rounded-xl bg-emerald-500 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white ${isSubmitting ? 'opacity-50' : ''}`}
          >
            {isSubmitting ? 'Adding...' : 'Add Stock'}
          </button>
        </form>
      </section>

      <section className="enter-up mt-6 rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '220ms' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Current Holdings</h2>
            {!isLoading && (
              <p className="mt-1 text-sm text-slate-500">
                Total Investment: ₹{portfolioData.totalInvestment?.toLocaleString() || 0}
              </p>
            )}
          </div>
          <button className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            Upload CSV
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          {isLoading ? (
             <div className="py-6 text-center text-slate-500">Loading portfolio...</div>
          ) : (
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Qty</th>
                  <th className="pb-3">Buy Price</th>
                  <th className="pb-3">Sector</th>
                  <th className="pb-3">Current Value</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.stocks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No holdings yet. Add your first stock above!
                    </td>
                  </tr>
                ) : (
                  portfolioData.stocks.map((stock, i) => (
                    <tr key={i} className="table-row border-b border-slate-100">
                      <td className="py-4 font-bold text-slate-700">{stock.symbol}</td>
                      <td className="py-4 text-slate-600">{stock.quantity}</td>
                      <td className="py-4 text-slate-600">₹{stock.buyPrice}</td>
                      <td className="py-4 text-slate-600">
                         <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                           {stock.sector}
                         </span>
                      </td>
                      <td className="py-4 font-semibold text-emerald-600">
                         ₹{stock.currentValue?.toLocaleString() || (stock.buyPrice * stock.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AppLayout>
  );
}

export default PortfolioPage;
