import AppLayout from '../components/AppLayout';

function AnalysisPage() {
  return (
    <AppLayout
      title="DiversifyAI Analysis"
      subtitle="Trigger portfolio intelligence and get scores, explanations, and action-oriented recommendations."
    >
      <section className="grid gap-5 md:grid-cols-3">
        {[
          ['Diversification Score', '68', 'Moderate diversification, improve sector spread.'],
          ['Risk Score', '55', 'Balanced profile with concentration pressure in banking.'],
          ['Portfolio Health', '72', 'Strong baseline with room for rebalancing upgrades.'],
        ].map(([title, value, text], index) => (
          <article key={title} className="hover-panel enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: `${140 + index * 80}ms` }}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{title}</p>
            <p className="mt-2 font-display text-5xl tracking-tight">{value}</p>
            <p className="mt-3 text-sm text-slate-600">{text}</p>
          </article>
        ))}
      </section>

      <section className="enter-up mt-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-ink via-slate-900 to-slate-700 p-6 text-white" style={{ animationDelay: '320ms' }}>
        <h2 className="font-display text-3xl tracking-tight">AI Recommendation Panel</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/20 bg-white/10 p-4">Reduce banking weight by 10% over the next 2 rebalance cycles.</div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4">Increase healthcare and FMCG exposure for defensive balance.</div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4">Allocate a stable portion to index ETFs for long-term consistency.</div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4">Set alerts for concentration above 40% in any single sector.</div>
        </div>
      </section>
    </AppLayout>
  );
}

export default AnalysisPage;
