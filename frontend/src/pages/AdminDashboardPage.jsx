import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { createAdvisorByAdmin, getAdvisors, getStoredUser } from '../../services/api';

function AdminDashboardPage() {
  const user = useMemo(() => getStoredUser(), []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [advisors, setAdvisors] = useState([]);
  const [isLoadingAdvisors, setIsLoadingAdvisors] = useState(true);

  const fetchAdvisors = async () => {
    try {
      setIsLoadingAdvisors(true);
      const response = await getAdvisors();
      setAdvisors(Array.isArray(response?.advisors) ? response.advisors : []);
    } catch (_error) {
      setAdvisors([]);
    } finally {
      setIsLoadingAdvisors(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdvisors();
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCreateAdvisor = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const response = await createAdvisorByAdmin(formData);
      setSuccessMessage(
        `Advisor created: ${response?.advisor?.name || formData.name}. Share email and password securely with advisor.`
      );
      setFormData({
        name: '',
        email: '',
        password: '',
      });
      await fetchAdvisors();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || apiError?.message || 'Unable to create advisor account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <AppLayout
        title="Admin Access"
        subtitle="Only admin accounts can create advisor logins and onboard consultants."
      >
        <section className="enter-up rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: '120ms' }}>
          <p className="text-slate-600">Please login with an admin account to continue.</p>
          <Link
            to="/login"
            className="premium-btn mt-4 inline-flex rounded-xl bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white"
          >
            Go to Login
          </Link>
        </section>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Admin Advisor Onboarding"
      subtitle="Create advisor credentials centrally, so only verified experts are onboarded by your team."
    >
      <section className="enter-up grid gap-6 lg:grid-cols-[1.15fr_1fr]" style={{ animationDelay: '120ms' }}>
        <article className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">Create Advisor Account</h2>
          <p className="mt-1 text-sm text-slate-600">
            Enter advisor details and set an initial password. Share credentials with the advisor through secure internal channels.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleCreateAdvisor}>
            <input
              className="input-shell"
              name="name"
              type="text"
              placeholder="Advisor Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              className="input-shell"
              name="email"
              type="email"
              placeholder="Advisor Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              className="input-shell"
              name="password"
              type="password"
              placeholder="Initial Password (min 6 chars)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

            <button
              type="submit"
              className="premium-btn rounded-xl bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Advisor'}
            </button>
          </form>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">Onboarded Advisors</h2>
          <p className="mt-1 text-sm text-slate-600">Current advisor accounts available for login.</p>

          {isLoadingAdvisors ? (
            <p className="mt-5 text-sm text-slate-600">Loading advisors...</p>
          ) : advisors.length === 0 ? (
            <p className="mt-5 text-sm text-slate-600">No advisors created yet.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {advisors.map((advisor) => (
                <div key={advisor._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">{advisor.name}</p>
                  <p className="mt-1 text-xs text-slate-600">{advisor.email}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </AppLayout>
  );
}

export default AdminDashboardPage;
