import { Link, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { advisors } from '../data/advisors';

function AdvisorDetailPage() {
  const { advisorId } = useParams();
  const advisor = advisors.find((item) => item.id === advisorId);

  if (!advisor) {
    return (
      <AppLayout title="Advisor Not Found" subtitle="The requested consultant profile could not be found.">
        <div className="enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '140ms' }}>
          <p className="text-slate-600">Please go back to the advisor list and select a valid consultant profile.</p>
          <Link to="/advisors" className="premium-btn mt-5 inline-flex rounded-xl bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
            Back to Advisors
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={`${advisor.name} Profile`}
      subtitle="Detailed consultant view with profile depth, investment focus, and booking actions."
    >
      <section className="enter-up rounded-3xl border border-slate-200 bg-white p-6 md:p-8" style={{ animationDelay: '140ms' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${advisor.avatarTone} text-2xl font-extrabold text-white`}>
              {advisor.initials}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{advisor.specialization}</p>
              <h2 className="mt-1 font-display text-4xl tracking-tight">{advisor.name}</h2>
              <p className="mt-2 text-slate-600">{advisor.bio}</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">Rating {advisor.rating} / 5</span>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Experience</p>
            <p className="mt-1 text-xl font-bold">{advisor.experience}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Clients Guided</p>
            <p className="mt-1 text-xl font-bold">{advisor.clients}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Languages</p>
            <p className="mt-1 text-xl font-bold">{advisor.languages}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Consultation Fee</p>
            <p className="mt-1 text-xl font-bold">{advisor.fee}</p>
          </article>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button className="premium-btn rounded-xl bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
            Book Consultation
          </button>
          <button className="rounded-xl border border-slate-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            Start Chat
          </button>
          <Link to="/advisors" className="rounded-xl border border-slate-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
            Back to All Advisors
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}

export default AdvisorDetailPage;
