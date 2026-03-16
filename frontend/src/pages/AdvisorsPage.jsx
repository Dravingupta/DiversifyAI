import AppLayout from '../components/AppLayout';

const advisors = [
  ['Rahul Sharma', '10 years', '4.8', 'Equity Investment'],
  ['Neha Gupta', '8 years', '4.6', 'Portfolio Management'],
  ['Aman Kapoor', '7 years', '4.7', 'Risk Rebalancing'],
];

function AdvisorsPage() {
  return (
    <AppLayout
      title="Advisor Connect"
      subtitle="Move from AI analysis to expert consultation with a seamless advisor booking experience."
    >
      <section className="grid gap-5 md:grid-cols-3">
        {advisors.map(([name, exp, rating, spec], index) => (
          <article key={name} className="hover-panel enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: `${140 + index * 90}ms` }}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{spec}</p>
            <h3 className="mt-2 font-display text-3xl tracking-tight">{name}</h3>
            <p className="mt-2 text-sm text-slate-600">Experience: {exp}</p>
            <p className="mt-1 text-sm text-slate-600">Rating: {rating}</p>
            <button className="premium-btn mt-5 rounded-xl bg-ink px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
              Book Consultation
            </button>
          </article>
        ))}
      </section>
    </AppLayout>
  );
}

export default AdvisorsPage;
