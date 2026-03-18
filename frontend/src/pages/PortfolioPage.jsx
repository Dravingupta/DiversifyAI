import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { getPortfolio, addStockToPortfolio, searchIndianStocks, removeStockFromPortfolio } from '../../services/api';

function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState({ stocks: [], totalInvestment: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({ symbol: '', sector: '', quantity: '', buyPrice: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        try {
          const results = await searchIndianStocks(searchQuery);
          setSuggestions(results.slice(0, 6)); // show top 6 Yahoo results
        } catch (err) {
          console.error('Yahoo search failed', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const selectStock = (stock) => {
    setFormData({ ...formData, symbol: stock.symbol, sector: stock.sector });
    setSearchQuery(stock.symbol);
    setShowSuggestions(false);
    setErrorMsg('');
  };

  const handleRemoveStock = async (symbol) => {
    if (window.confirm(`Are you sure you want to remove ${symbol} from your portfolio?`)) {
      try {
        await removeStockFromPortfolio(symbol);
        await fetchPortfolio();
      } catch (err) {
        console.error('Failed to remove stock', err);
        setErrorMsg('Failed to remove stock. Please try again.');
      }
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!formData.symbol || !formData.quantity || !formData.buyPrice) {
      setErrorMsg('Please search and select a valid stock and fill all fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await addStockToPortfolio(
        formData.symbol, 
        Number(formData.quantity), 
        Number(formData.buyPrice),
        formData.sector
      );
      setFormData({ symbol: '', sector: '', quantity: '', buyPrice: '' });
      setSearchQuery('');
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
      <section className="enter-up relative z-20 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" style={{ animationDelay: '130ms' }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Add New Holding</h2>
            <p className="mt-1 text-sm text-slate-600">Search on NSE/BSE, pick a stock, then enter quantity and buy price.</p>
          </div>
          {formData.symbol ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
              Selected: {formData.symbol}
            </span>
          ) : (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              No Stock Selected
            </span>
          )}
        </div>

        {errorMsg && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{errorMsg}</div>}
        <form className="mt-5 grid gap-4 md:grid-cols-4" onSubmit={handleAddStock}>
          
          {/* Autocomplete Input Field */}
          <div className="relative z-50 col-span-1">
            <input 
              className="input-shell w-full" 
              placeholder="Search Stock (e.g. RELI)" 
              value={searchQuery}
              onChange={(e) => {
                 setSearchQuery(e.target.value);
                 setShowSuggestions(true);
                 setFormData({ ...formData, symbol: '' }); // reset firm selection validation until explicitly clicked
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && searchQuery && (
              <div className="absolute top-full z-[80] mt-2 w-full min-w-[240px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-100">
                {isSearching ? (
                  <div className="p-3 text-sm text-slate-500 text-center flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching Yahoo...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((stock) => (
                    <div 
                      key={stock.symbol}
                      className="cursor-pointer border-b border-slate-100 p-3 transition-colors hover:bg-emerald-50 text-left last:border-0"
                      onMouseDown={() => selectStock(stock)}
                    >
                      <div className="font-bold text-slate-800">{stock.symbol}</div>
                      <div className="text-xs text-slate-500 truncate">{stock.name} • {stock.sector}</div>
                    </div>
                  ))
                ) : (
                  searchQuery.length > 1 && <div className="p-3 text-sm text-slate-500 text-center">No precise matches found on NSE/BSE.</div>
                )}
              </div>
            )}
          </div>

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
            className={`premium-btn rounded-xl bg-emerald-500 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-600 ${isSubmitting ? 'opacity-50' : ''}`}
          >
            {isSubmitting ? 'Adding...' : 'Add Stock'}
          </button>
        </form>
      </section>

      <section className="enter-up relative z-10 mt-6 rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '220ms' }}>
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
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500 text-left">
                  <th className="pb-3 pr-2">Symbol</th>
                  <th className="pb-3 px-2">Qty</th>
                  <th className="pb-3 px-2">Buy Price</th>
                  <th className="pb-3 px-2">Sector</th>
                  <th className="pb-3 px-2">Current Value</th>
                  <th className="pb-3 pl-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.stocks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No holdings yet. Add your first stock above!
                    </td>
                  </tr>
                ) : (
                  portfolioData.stocks.map((stock, i) => (
                    <tr key={i} className="table-row border-b border-slate-100">
                      <td className="py-4 font-bold text-slate-700 pr-2">{stock.symbol}</td>
                      <td className="py-4 text-slate-600 px-2">{stock.quantity}</td>
                      <td className="py-4 text-slate-600 px-2">₹{stock.buyPrice}</td>
                      <td className="py-4 text-slate-600 px-2">
                         <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                           {stock.sector}
                         </span>
                      </td>
                      <td className="py-4 font-semibold text-emerald-600 px-2">
                         ₹{stock.currentValue?.toLocaleString() || (stock.buyPrice * stock.quantity).toLocaleString()}
                      </td>
                      <td className="py-4 text-right pl-2">
                        <button
                          onClick={() => handleRemoveStock(stock.symbol)}
                          className="flex items-center gap-1 ml-auto text-xs font-bold uppercase tracking-[0.1em] text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                          title="Remove from portfolio"
                        >
                          <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
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
