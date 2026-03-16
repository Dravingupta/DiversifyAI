import AppLayout from '../components/AppLayout';

const stocks = [
  ['RELIANCE', 10, 'Energy', 'Rs 2,62,000'],
  ['TCS', 5, 'IT', 'Rs 1,96,000'],
  ['HDFCBANK', 8, 'Banking', 'Rs 1,34,000'],
  ['SUNPHARMA', 6, 'Pharma', 'Rs 82,000'],
];

function PortfolioPage() {
  return (
    <AppLayout
      title="Portfolio Management"
      subtitle="Add holdings, review stock-level exposure, and monitor allocation quality before triggering analysis."
    >
      <section className="enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '130ms' }}>
        <h2 className="font-display text-2xl tracking-tight">Add New Holding</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-4">
          <input className="input-shell" placeholder="Stock Symbol" />
          <input className="input-shell" placeholder="Quantity" />
          <input className="input-shell" placeholder="Buy Price" />
          <button className="premium-btn rounded-xl bg-emerald-500 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
            Add Stock
          </button>
        </form>
      </section>

      <section className="enter-up mt-6 rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '220ms' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-tight">Current Holdings</h2>
          <button className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            Upload CSV
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500">
                <th className="pb-3">Symbol</th>
                <th className="pb-3">Qty</th>
                <th className="pb-3">Sector</th>
                <th className="pb-3">Current Value</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((row) => (
                <tr key={row[0]} className="table-row border-b border-slate-100">
                  {row.map((cell) => (
                    <td key={`${row[0]}-${cell}`} className="py-4">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}

export default PortfolioPage;
