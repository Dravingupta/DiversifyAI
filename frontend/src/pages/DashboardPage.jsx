import AppLayout from '../components/AppLayout';

const topCards = [
  ['Total Investment', 'Rs 24,80,000', '+6.2% this month'],
  ['Current Value', 'Rs 27,34,400', 'Unrealized gain Rs 2,54,400'],
  ['Portfolio Health', '74 / 100', 'Strong but improvable'],
  ['Diversification', '68 / 100', 'Moderate spread'],
  ['Risk Score', '55 / 100', 'Controlled risk zone'],
  ['Active Alerts', '03', '2 concentration, 1 volatility'],
];

const sectorAllocation = [
  ['Banking', 35, 'bg-slate-800'],
  ['IT', 25, 'bg-cyan-500'],
  ['Energy', 20, 'bg-amber-500'],
  ['Pharma', 10, 'bg-emerald-500'],
  ['FMCG', 10, 'bg-orange-400'],
];

const stockAllocation = [
  ['HDFCBANK', 22, 'Banking', 'bg-slate-800'],
  ['ICICIBANK', 13, 'Banking', 'bg-slate-600'],
  ['TCS', 15, 'IT', 'bg-cyan-500'],
  ['INFY', 10, 'IT', 'bg-cyan-400'],
  ['RELIANCE', 14, 'Energy', 'bg-amber-500'],
  ['SUNPHARMA', 8, 'Pharma', 'bg-emerald-500'],
  ['ITC', 6, 'FMCG', 'bg-orange-400'],
  ['Others', 12, 'Mixed', 'bg-slate-400'],
];

const marketCapMix = [
  ['Large Cap', 56, 'bg-emerald-500'],
  ['Mid Cap', 29, 'bg-cyan-500'],
  ['Small Cap', 15, 'bg-amber-500'],
];

const recs = [
  'Trim banking exposure by 8-10% to reduce concentration pressure.',
  'Increase healthcare and FMCG to improve defensive balance.',
  'Shift 5-7% to index ETFs to smooth volatility and improve health score.',
  'Keep small-cap allocation below 20% for your current risk profile.',
];

function DashboardPage() {
  return (
    <AppLayout
      title="Investment Command Dashboard"
      subtitle="A high-clarity overview of portfolio value, risk posture, diversification quality, and recommendation momentum."
    >
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
              <div className="relative h-48 w-48 rounded-full bg-[conic-gradient(#1e293b_0_35%,#06b6d4_35%_60%,#f59e0b_60%_80%,#10b981_80%_90%,#fb923c_90%_100%)]">
                <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white grid place-items-center text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Diversify</p>
                  <p className="font-display text-2xl leading-none">68</p>
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
              <div className="relative h-40 w-40 rounded-full bg-[conic-gradient(#10b981_0_56%,#06b6d4_56%_85%,#f59e0b_85%_100%)]">
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
              <div className="grid place-items-center bg-slate-800" style={{ width: '35%' }}>Banking 35</div>
              <div className="grid place-items-center bg-cyan-500" style={{ width: '25%' }}>IT 25</div>
              <div className="grid place-items-center bg-amber-500" style={{ width: '20%' }}>Energy 20</div>
              <div className="grid place-items-center bg-emerald-500" style={{ width: '10%' }}>Pharma 10</div>
              <div className="grid place-items-center bg-orange-400" style={{ width: '10%' }}>FMCG 10</div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Concentration Risk</p>
              <p className="mt-1 font-semibold">High in Banking (35%)</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Underweight Sector</p>
              <p className="mt-1 font-semibold">Healthcare / Pharma</p>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="hover-panel enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '520ms' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-tight">Performance Pulse</h2>
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">6M Trend</span>
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
