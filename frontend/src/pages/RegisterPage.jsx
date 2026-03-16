import { Link } from 'react-router-dom';

function RegisterPage() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center bg-[#fffdfa] px-6 text-ink">
      <div className="hover-panel w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-glow">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Get Started</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Create your account</h1>
        <form className="mt-6 space-y-4">
          <input className="input-shell" placeholder="Full Name" type="text" />
          <input className="input-shell" placeholder="Email" type="email" />
          <input className="input-shell" placeholder="Password" type="password" />
          <button className="premium-btn w-full rounded-xl bg-emerald-500 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white">
            Register
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-600">
          Already have an account? <Link className="font-semibold text-emerald-700" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
