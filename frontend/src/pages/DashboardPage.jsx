import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { getPortfolio, getSectorDistribution, getLatestAnalysis } from '../../services/api';

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [portfolioData, setPortfolioData] = useState(null);
  const [sectorData, setSectorData] = useState({});
  const [analysisData, setAnalysisData] = useState(null);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

  const fetchData = async (options = {}) => {
    try {
      setLoading(true);
      const [portfolio, sectors, analysis] = await Promise.all([
        getPortfolio({ forceRefresh: options.forceRefresh }),
        getSectorDistribution(),
        getLatestAnalysis().catch(err => {
          console.error('Latest analysis fetch failed:', err);
          return null;
        })
      ]);

      setPortfolioData(portfolio);
      setSectorData(sectors);
      setAnalysisData(analysis);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualPriceRefresh = async () => {
    try {
      setIsRefreshingPrices(true);
      await fetchData({ forceRefresh: true });
    } finally {
      setIsRefreshingPrices(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) {
      return 'Not updated yet';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 'Not updated yet';
    }

    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AppLayout title="Investment Command Dashboard">
        <div className="flex h-64 items-center justify-center">
          <div className="text-xl font-semibold text-slate-500">Loading your portfolio data...</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Investment Command Dashboard">
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <div className="text-xl font-semibold text-red-500">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="rounded-lg bg-slate-900 px-6 py-2 text-white hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  // Calculate topCards data
  const totalInvestment = portfolioData?.totalInvestment || 0;
  
  let currentValue = 0;
  const stocks = portfolioData?.portfolio?.stocks || portfolioData?.stocks || [];
  
  stocks.forEach(stock => {
    currentValue += (stock.currentValue || (stock.buyPrice * stock.quantity));
  });

  const unrealizedGain = currentValue - totalInvestment;
  const gainPercentage = totalInvestment > 0 ? ((unrealizedGain / totalInvestment) * 100).toFixed(2) : 0;
  const gainSign = unrealizedGain >= 0 ? '+' : '';

  const healthScore = analysisData?.portfolioHealth || 0;
  const healthLabel = healthScore > 70 ? 'Strong' : healthScore > 50 ? 'Moderate' : 'Needs attention';

  const divScore = analysisData?.diversificationScore || 0;
  const divLabel = divScore > 70 ? 'Well diversified' : 'Moderate spread';

  const riskScore = analysisData?.riskScore || 0;
  const riskLabel = riskScore > 70 ? 'High risk' : riskScore > 40 ? 'Moderate risk' : 'Controlled risk zone';

  const topCards = [
    ['Total Investment', `Rs ${totalInvestment.toLocaleString()}`, `${stocks.length} assets`],
    ['Current Value', `Rs ${currentValue.toLocaleString()}`, `Unrealized gain Rs ${unrealizedGain.toLocaleString()} (${gainSign}${gainPercentage}%)`],
    ['Portfolio Health', `${healthScore} / 100`, healthLabel],
    ['Diversification', `${divScore} / 100`, divLabel],
    ['Risk Score', `${riskScore} / 100`, riskLabel],
    ['Active Alerts', analysisData?.alerts?.length || '0', 'Based on recent analysis'],
  ];

  // Colors for charts
  const colors = ['bg-slate-800', 'bg-cyan-500', 'bg-amber-500', 'bg-emerald-500', 'bg-orange-400', 'bg-indigo-500', 'bg-rose-500'];

  // Sector allocation
  const sectorAllocation = Object.entries(sectorData || {}).map(([sector, percentage], index) => [
    sector, 
    Math.round(percentage), 
    colors[index % colors.length]
  ]).sort((a, b) => b[1] - a[1]);

  // Stock allocation
  let sortedStocks = [...stocks].sort((a, b) => {
    const valA = a.currentValue || (a.buyPrice * a.quantity);
    const valB = b.currentValue || (b.buyPrice * b.quantity);
    return valB - valA;
  });
  
  const stockAllocation = sortedStocks.map((stock, index) => {
    const value = stock.currentValue || (stock.buyPrice * stock.quantity);
    const percentage = currentValue > 0 ? Math.round((value / currentValue) * 100) : 0;
    return [
      stock.symbol, 
      percentage, 
      stock.sector || 'Unknown', 
      colors[index % colors.length]
    ];
  });

  // Default market cap mix if not from API
  const marketCapMix = analysisData?.marketCapMix ? Object.entries(analysisData.marketCapMix).map(([name, val], i) => [
    name, Math.round(val), colors[i % 3]
  ]) : [
    ['Large Cap', 56, 'bg-emerald-500'],
    ['Mid Cap', 29, 'bg-cyan-500'],
    ['Small Cap', 15, 'bg-amber-500'],
  ];

  // Sector Allocation view colors (CSS classes to hex for gradient)
  const hexColors = {
    'bg-slate-800': '#1e293b',
    'bg-cyan-500': '#06b6d4',
    'bg-amber-500': '#f59e0b',
    'bg-emerald-500': '#10b981',
    'bg-orange-400': '#fb923c',
    'bg-indigo-500': '#6366f1',
    'bg-rose-500': '#f43f5e'
  };

  // Generate Conic Gradient for Sector Allocation
  let currentSectorPct = 0;
  const sectorGradientStops = sectorAllocation.length > 0 
    ? sectorAllocation.map(([_, pct, colorClass]) => {
        const hex = hexColors[colorClass] || '#cbd5e1';
        const start = currentSectorPct;
        currentSectorPct += pct;
        return `${hex} ${start}% ${currentSectorPct}%`;
      }).join(', ')
    : '#cbd5e1 0% 100%';

  // Generate Conic Gradient for Market Cap
  let currentCapPct = 0;
  const capGradientStops = marketCapMix.map(([_, pct, colorClass]) => {
      const hex = hexColors[colorClass] || '#cbd5e1';
      const start = currentCapPct;
      currentCapPct += pct;
      return `${hex} ${start}% ${currentCapPct}%`;
    }).join(', ');

  // Identify concentration & underweight
  const topSectorName = sectorAllocation.length > 0 ? sectorAllocation[0][0] : 'None';
  const topSectorPct = sectorAllocation.length > 0 ? sectorAllocation[0][1] : 0;
  const bottomSectorName = sectorAllocation.length > 0 ? sectorAllocation[sectorAllocation.length - 1][0] : 'None';

  const recs = analysisData?.recommendations || analysisData?.actionableInsights || [
    'Add more stocks to generate specific analysis recommendations.'
  ];

  return (
    <AppLayout
      title="Investment Command Dashboard"
      subtitle="A high-clarity overview of portfolio value, risk posture, diversification quality, and recommendation momentum."
    >
      <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">
          Prices last refreshed:{' '}
          <span className="font-semibold text-slate-800">{formatDateTime(portfolioData?.pricesLastUpdatedAt)}</span>
        </p>
        <button
          onClick={handleManualPriceRefresh}
          disabled={isRefreshingPrices}
          className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRefreshingPrices ? 'Refreshing...' : 'Refresh Prices Now'}
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topCards.map(([label, value, helper], index) => (
          <article key={label} className="hover-panel enter-up rounded-2xl border border-slate-200 bg-white p-5" style={{ animationDelay: `${120 + index * 60}ms` }}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight">{value}</p>
            <p className="mt-2 text-xs text-slate-500">{helper}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="hover-panel enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '220ms' }}>
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-2xl tracking-tight">Sector Allocation View</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
              Visual Summary
            </span>
          </div>

          <div className="mt-5 grid gap-6 sm:grid-cols-[0.95fr_1.05fr]">
            <div className="grid place-items-center rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div 
                className="relative h-48 w-48 rounded-full" 
                style={{ background: `conic-gradient(${sectorGradientStops})` }}
              >
                <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white grid place-items-center text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Diversify</p>
                  <p className="font-display text-2xl leading-none">{analysisData?.diversificationScore || 0}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              {sectorAllocation.map(([sector, value, bar]) => (
                <div key={sector}>
                  <div className="mb-1 flex justify-between"><span>{sector}</span><span>{value}%</span></div>
                  <div className="h-2 rounded-full bg-slate-200"><div className={`h-2 rounded-full ${bar}`} style={{ width: `${value}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="hover-panel enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '300ms' }}>
          <h2 className="font-display text-2xl tracking-tight">Stock-wise Allocation</h2>
          <p className="mt-2 text-sm text-slate-600">Layman-friendly view of where each stock is taking your portfolio weight.</p>
          <div className="mt-5 space-y-3">
            {stockAllocation.map(([stock, value, sector, color]) => (
              <div key={stock} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                    <span className="font-semibold">{stock}</span>
                    <span className="text-xs text-slate-500">{sector}</span>
                  </div>
                  <span className="font-bold">{value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200"><div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="hover-panel enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '380ms' }}>
          <h2 className="font-display text-2xl tracking-tight">Market-Cap Balance</h2>
          <p className="mt-2 text-sm text-slate-600">Understand allocation by Large, Mid, and Small Cap in seconds.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-[0.85fr_1.15fr]">
            <div className="grid place-items-center rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div 
                className="relative h-40 w-40 rounded-full" 
                style={{ background: `conic-gradient(${capGradientStops})` }}
              >
                <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
              </div>
            </div>
            <div className="space-y-4">
              {marketCapMix.map(([name, value, color]) => (
                <div key={name}>
                  <div className="mb-1 flex justify-between text-sm"><span>{name}</span><span>{value}%</span></div>
                  <div className="h-2.5 rounded-full bg-slate-200"><div className={`h-2.5 rounded-full ${color}`} style={{ width: `${value}%` }} /></div>
                </div>
              ))}
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                Recommendation: Keep small-cap under 20% for your current risk tolerance.
              </p>
            </div>
          </div>
        </article>

        <article className="hover-panel enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '450ms' }}>
          <h2 className="font-display text-2xl tracking-tight">If You Invest Rs 100</h2>
          <p className="mt-2 text-sm text-slate-600">A simple visual breakdown that any beginner can understand instantly.</p>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="flex h-10 w-full text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              {sectorAllocation.map(([sector, pct, color]) => (
                pct > 0 ? (
                  <div key={sector} className={`grid place-items-center ${color} overflow-hidden whitespace-nowrap`} style={{ width: `${pct}%` }}>
                    {pct > 15 ? `${sector} ${pct}` : pct > 5 ? pct : ''}
                  </div>
                ) : null
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Concentration Risk</p>
              <p className="mt-1 font-semibold">{topSectorPct > 30 ? `High in ${topSectorName} (${topSectorPct}%)` : `Moderate (${topSectorName} ${topSectorPct}%)`}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Underweight Sector</p>
              <p className="mt-1 font-semibold">{bottomSectorName}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="hover-panel enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '520ms' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-tight">Performance Pulse</h2>
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">Illustrative</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">Visual path of portfolio value movement to build confidence and context.</p>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <svg viewBox="0 0 600 180" className="h-40 w-full">
              <path d="M20 140 C 80 110, 120 120, 170 95 C 220 70, 270 82, 320 62 C 370 42, 430 58, 500 36 C 540 24, 570 30, 580 22" fill="none" stroke="#10b981" strokeWidth="7" strokeLinecap="round" />
              <path d="M20 145 C 100 130, 170 118, 250 98 C 320 84, 400 74, 580 28" fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray="7 8" strokeLinecap="round" />
              <circle cx="580" cy="22" r="6" fill="#10b981" />
            </svg>
            <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-slate-600">
              <p className="rounded-lg bg-white px-3 py-2">1M: +2.1%</p>
              <p className="rounded-lg bg-white px-3 py-2">3M: +5.4%</p>
              <p className="rounded-lg bg-white px-3 py-2">6M: +10.8%</p>
            </div>
          </div>
        </article>

        <article className="hover-panel enter-up rounded-3xl border border-slate-200 bg-gradient-to-br from-ink via-slate-900 to-slate-700 p-6 text-white" style={{ animationDelay: '590ms' }}>
          <h2 className="font-display text-2xl tracking-tight">Top AI Recommendations</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-100">
            {recs.map((item) => (
              <li key={item} className="rounded-xl border border-white/20 bg-white/10 p-3">{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </AppLayout>
  );
}

export default DashboardPage;
