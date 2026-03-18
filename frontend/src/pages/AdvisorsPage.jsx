import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { advisors } from '../data/advisors';
import { getAdvisors } from '../../services/api';

function mergeAdvisorProfile(advisorAccount, index) {
  const template = advisors[index % advisors.length] || advisors[0];

  return {
    id: advisorAccount?._id || template.id,
    _id: advisorAccount?._id || template._id,
    name: advisorAccount?.name || template.name,
    initials: (advisorAccount?.name || template.name)
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || template.initials,
    avatarTone: template.avatarTone,
    experience: template.experience,
    rating: template.rating,
    specialization: template.specialization,
    languages: template.languages,
    clients: template.clients,
    fee: template.fee,
    bio: template.bio,
    email: advisorAccount?.email || null,
  };
}

function AdvisorsPage() {
  const [advisorAccounts, setAdvisorAccounts] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchAdvisors = async () => {
      try {
        const response = await getAdvisors();
        if (!mounted) {
          return;
        }

        setAdvisorAccounts(Array.isArray(response?.advisors) ? response.advisors : []);
      } catch (_error) {
        if (mounted) {
          setAdvisorAccounts([]);
        }
      }
    };

    fetchAdvisors();

    return () => {
      mounted = false;
    };
  }, []);

  const displayedAdvisors = useMemo(() => {
    if (advisorAccounts.length === 0) {
      return advisors;
    }

    return advisorAccounts.map((advisorAccount, index) =>
      mergeAdvisorProfile(advisorAccount, index)
    );
  }, [advisorAccounts]);

  return (
    <AppLayout
      title="Advisor Connect"
      subtitle="Move from AI analysis to expert consultation with a seamless advisor booking experience."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Available Consultants', `${displayedAdvisors.length}`],
          ['Average Rating', '4.7 / 5'],
          ['Avg Response Time', '< 2 hours'],
        ].map(([label, value], index) => (
          <article key={label} className="hover-panel enter-up rounded-2xl border border-slate-200 bg-white p-5" style={{ animationDelay: `${120 + index * 80}ms` }}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {displayedAdvisors.map((advisor, index) => (
          <Link
            key={advisor._id || advisor.id}
            to={`/advisors/${advisor._id || advisor.id}`}
            className="hover-panel enter-up block rounded-3xl border border-slate-200 bg-white p-6"
            style={{ animationDelay: `${170 + index * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${advisor.avatarTone} text-sm font-extrabold text-white`}>
                  {advisor.initials}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{advisor.specialization}</p>
                  <p className="mt-1 inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-sm font-extrabold text-emerald-800">
                    {advisor.fee}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">{advisor.rating}</span>
            </div>
            <h3 className="mt-2 font-display text-3xl tracking-tight">{advisor.name}</h3>
            {advisor.email ? <p className="mt-1 text-sm text-slate-500">{advisor.email}</p> : null}
            <p className="mt-2 text-sm text-slate-600">Experience: {advisor.experience}</p>
            <p className="mt-1 text-sm text-slate-600">Clients: {advisor.clients}</p>
            <p className="mt-1 text-sm text-slate-600">Languages: {advisor.languages}</p>

            <div className="mt-5">
              <span className="premium-btn inline-flex w-full justify-center rounded-xl bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white">
                Book Now
              </span>
            </div>
          </Link>
        ))}
      </section>
    </AppLayout>
  );
}

export default AdvisorsPage;
