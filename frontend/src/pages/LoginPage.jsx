import { Link } from 'react-router-dom';

function LoginPage() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center bg-[#fffdfa] px-6 text-ink">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-4 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700"
        >
          Back to Home
        </Link>
        <div className="hover-panel rounded-3xl border border-slate-200 bg-white p-8 shadow-glow">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Welcome Back</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Login to PortfolioPilot</h1>
        <form className="mt-6 space-y-4">
          <input className="input-shell" placeholder="Email" type="email" />
          <input className="input-shell" placeholder="Password" type="password" />
          <button className="premium-btn w-full rounded-xl bg-ink px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
            Sign In
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-600">
          New investor? <Link className="font-semibold text-emerald-700" to="/register">Create an account</Link>
        </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
