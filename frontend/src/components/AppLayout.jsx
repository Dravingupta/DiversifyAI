import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getStoredUser, logoutUser } from '../../services/api';

function AppLayout({ title, subtitle, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="page-shell min-h-screen bg-[#fffdfa] text-ink">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="hero-orb hero-orb--one absolute left-[-14rem] top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-mint/50 to-sky/20 blur-3xl" />
        <div className="hero-orb hero-orb--three absolute right-[16%] top-[18%] h-[14rem] w-[14rem] rounded-full bg-gradient-to-br from-cyan-200/35 to-emerald-200/35 blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight">
          Portfolio<span className="text-emerald-600">Pilot</span>
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-pill ${isActive ? 'nav-pill--active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/portfolio" className={({ isActive }) => `nav-pill ${isActive ? 'nav-pill--active' : ''}`}>
            Portfolio
          </NavLink>
          <NavLink to="/analysis" className={({ isActive }) => `nav-pill ${isActive ? 'nav-pill--active' : ''}`}>
            Analysis
          </NavLink>
          <NavLink to="/advisors" className={({ isActive }) => `nav-pill ${isActive ? 'nav-pill--active' : ''}`}>
            Advisors
          </NavLink>
        </nav>
        {currentUser ? (
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-800">
              {currentUser.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login" className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
              Login
            </Link>
            <Link to="/register" className="premium-btn rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white">
              Register
            </Link>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 pb-20 md:px-10">
        <section className="enter-up mb-8 rounded-3xl border border-slate-200/80 bg-white/80 p-6 backdrop-blur md:p-8" style={{ animationDelay: '90ms' }}>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">PortfolioPilot Workspace</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-slate-600">{subtitle}</p>
        </section>
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
