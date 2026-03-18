import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PieChart, TrendingUp, Users, Menu, X, Leaf, Briefcase, Shield } from 'lucide-react';
import { getStoredUser, logoutUser } from '../../services/api';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className="group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300"
  >
    {({ isActive }) => (
      <>
        {/* Animated Highlight Background */}
        <span
          className={`absolute inset-0 -z-10 rounded-full transition-all duration-300 ease-out ${
            isActive
              ? 'scale-100 bg-white opacity-100 shadow-sm ring-1 ring-slate-900/5'
              : 'scale-95 bg-white/50 opacity-0 group-hover:scale-100 group-hover:opacity-100'
          }`}
        />
        <Icon
          className={`h-4 w-4 transition-colors duration-300 ${
            isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'
          }`}
        />
        <span
          className={`relative z-10 transition-colors duration-300 ${
            isActive ? 'text-emerald-900' : 'text-slate-600 group-hover:text-emerald-800'
          }`}
        >
          {label}
        </span>
      </>
    )}
  </NavLink>
);

function AppLayout({ title, subtitle, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentUserRole = (currentUser && currentUser.role) || 'client';

  useEffect(() => {
    setCurrentUser(getStoredUser());
    setIsMobileMenuOpen(false);
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

      <header className="sticky top-6 z-50 mx-auto w-full max-w-6xl px-4 opacity-0 [animation:slideInDown_800ms_cubic-bezier(0.22,1,0.36,1)_forwards]">
        <div className="flex items-center justify-between rounded-full border border-white/60 bg-white/40 px-3 pl-6 py-2 shadow-[0_8px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-all duration-500 hover:bg-white/50 hover:shadow-[0_8px_40px_rgba(15,23,42,0.08)]">
          
          {/* Logo Section */}
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-inner transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-800 transition-colors group-hover:text-emerald-700">
              Portfolio<span className="text-emerald-600">Pilot</span>
            </span>
          </Link>

          {/* Desktop Navigation Center Floating Pill */}
          <nav className="hidden items-center md:flex">
            <div className="flex items-center gap-1 rounded-full bg-slate-400/10 p-1 ring-1 ring-slate-900/5 backdrop-blur-md">
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/portfolio" icon={PieChart} label="Portfolio" />
              <NavItem to="/analysis" icon={TrendingUp} label="Analysis" />
              {currentUserRole === 'admin' ? (
                <NavItem to="/admin/dashboard" icon={Shield} label="Admin Desk" />
              ) : currentUserRole === 'advisor' ? (
                <NavItem to="/advisor/dashboard" icon={Briefcase} label="Advisor Desk" />
              ) : (
                <NavItem to="/advisors" icon={Users} label="Advisors" />
              )}
            </div>
          </nav>

          {/* User Auth / Profile Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/50 py-1.5 pl-3 pr-1.5 backdrop-blur-sm">
                  <span className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-800">
                    {currentUser.name}
                  </span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200/50 text-emerald-700 text-[10px] font-black">
                    {currentUser.name.charAt(0)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-slate-200 bg-white/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-600 transition-all duration-300 hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-slate-600 transition-all duration-300 hover:text-emerald-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="premium-btn group relative overflow-hidden rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white shadow-md transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-900/20"
                >
                  <span className="relative z-10">Get Started</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/50 text-slate-700 backdrop-blur-sm transition-all active:scale-95"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`absolute left-4 right-4 top-full mt-2 overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 md:hidden ${
            isMobileMenuOpen ? 'max-h-[400px] opacity-100' : 'pointer-events-none max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-1 p-4">
            <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-3 rounded-xl p-3 text-sm font-semibold transition-colors ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}>
              <LayoutDashboard className="h-4 w-4 opacity-70" /> Dashboard
            </NavLink>
            <NavLink to="/portfolio" className={({isActive}) => `flex items-center gap-3 rounded-xl p-3 text-sm font-semibold transition-colors ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}>
              <PieChart className="h-4 w-4 opacity-70" /> Portfolio
            </NavLink>
            <NavLink to="/analysis" className={({isActive}) => `flex items-center gap-3 rounded-xl p-3 text-sm font-semibold transition-colors ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}>
              <TrendingUp className="h-4 w-4 opacity-70" /> Analysis
            </NavLink>
            {currentUserRole === 'admin' ? (
              <NavLink to="/admin/dashboard" className={({isActive}) => `flex items-center gap-3 rounded-xl p-3 text-sm font-semibold transition-colors ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Shield className="h-4 w-4 opacity-70" /> Admin Desk
              </NavLink>
            ) : currentUserRole === 'advisor' ? (
              <NavLink to="/advisor/dashboard" className={({isActive}) => `flex items-center gap-3 rounded-xl p-3 text-sm font-semibold transition-colors ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Briefcase className="h-4 w-4 opacity-70" /> Advisor Desk
              </NavLink>
            ) : (
              <NavLink to="/advisors" className={({isActive}) => `flex items-center gap-3 rounded-xl p-3 text-sm font-semibold transition-colors ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Users className="h-4 w-4 opacity-70" /> Advisors
              </NavLink>
            )}
            
            <div className="my-2 h-px w-full bg-slate-200/50" />
            
            {currentUser ? (
              <button onClick={handleLogout} className="flex items-center justify-center rounded-xl bg-slate-100 p-3 text-sm font-bold uppercase tracking-wider text-slate-700">
                Logout ({currentUser.name})
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" className="flex items-center justify-center rounded-xl border border-slate-200 p-3 text-sm font-bold uppercase tracking-wider text-slate-700">
                  Login
                </Link>
                <Link to="/register" className="flex items-center justify-center rounded-xl bg-slate-900 p-3 text-sm font-bold uppercase tracking-wider text-white">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-10 md:px-10">
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
