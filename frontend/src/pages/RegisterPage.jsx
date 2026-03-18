import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser } from '../../services/api';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const authResponse = await registerUser(
        formData.name,
        formData.email,
        formData.password
      );
      const nextRoute = authResponse?.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(nextRoute);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center bg-[#fffdfa] px-6 text-ink">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-4 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700"
        >
          <span className="mr-2 text-sm leading-none">←</span>
          Back to Home
        </Link>
        <div className="hover-panel rounded-3xl border border-slate-200 bg-white p-8 shadow-glow">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Get Started</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">Create your account</h1>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              className="input-shell"
              placeholder="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              className="input-shell"
              placeholder="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              className="input-shell"
              placeholder="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              className="premium-btn w-full rounded-xl bg-emerald-500 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="mt-5 text-sm text-slate-600">
            Already have an account? <Link className="font-semibold text-emerald-700" to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
