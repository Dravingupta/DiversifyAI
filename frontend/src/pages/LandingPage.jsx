import allocationVisionImg from '../assets/allocation-vision.svg';
import signalEngineImg from '../assets/signal-engine.svg';
import advisorBridgeImg from '../assets/advisor-bridge.svg';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Live Allocation Vision',
    text: 'See exact sector and stock concentration in one cinematic dashboard before market open.',
    accent: 'from-mint/70 to-sky/70',
    image: allocationVisionImg,
  },
  {
    title: 'DiversifyAI Signal Engine',
    text: 'Get portfolio health, risk pressure, and diversification intelligence tailored to your holdings.',
    accent: 'from-peach/70 to-orange-200/70',
    image: signalEngineImg,
  },
  {
    title: 'Advisor Bridge',
    text: 'Move from insights to action with direct advisor booking when your strategy needs expert input.',
    accent: 'from-emerald-200/80 to-cyan-200/80',
    image: advisorBridgeImg,
  },
];

const metrics = [
  { label: 'Avg. diversification lift', value: '+27%' },
  { label: 'Faster risk visibility', value: '3.8x' },
  { label: 'Portfolio confidence score', value: '91/100' },
];

const productHighlights = [
  {
    title: 'Know Exactly Where Money Is Parked',
    text: 'PortfolioPilot maps each holding by sector and stock so users understand concentration instantly.',
  },
  {
    title: 'Detect Risk Before It Becomes Damage',
    text: 'The platform scores risk pressure using allocation quality, concentration level, and volatility context.',
  },
  {
    title: 'Turn AI Insights Into Action',
    text: 'From rebalancing prompts to advisor bookings, every recommendation includes a next step.',
  },
];

const journeySteps = [
  {
    step: '01',
    title: 'Upload Portfolio',
    text: 'Add stocks manually today and CSV import next, with broker statement support on roadmap.',
  },
  {
    step: '02',
    title: 'Analyze & Score',
    text: 'Get diversification score, risk score, health score, and sector exposure in one clear dashboard.',
  },
  {
    step: '03',
    title: 'Improve Allocation',
    text: 'Follow AI recommendations or book a financial advisor to optimize your strategy.',
  },
];

const outcomes = [
  'Understand investment distribution at a glance',
  'Reduce one-sector dependency and concentration risk',
  'Build stronger diversification for long-term stability',
  'Make decisions with AI + advisor confidence',
];

function LandingPage() {
  return (
    <div className="page-shell min-h-screen overflow-x-hidden bg-[#fffdfa] text-ink">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="hero-orb hero-orb--one absolute left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-mint/60 to-sky/25 blur-3xl" />
        <div className="hero-orb hero-orb--two absolute bottom-[-14rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-peach/60 to-amber-100 blur-3xl" />
        <div className="hero-orb hero-orb--three absolute right-[22%] top-[24%] h-[14rem] w-[14rem] rounded-full bg-gradient-to-br from-cyan-200/45 to-emerald-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.8),transparent_40%),repeating-linear-gradient(120deg,rgba(16,24,40,0.03)_0px,rgba(16,24,40,0.03)_1px,transparent_1px,transparent_22px)]" />
      </div>

      <header className="enter-fade mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10" style={{ animationDelay: '60ms' }}>
        <div className="font-display text-2xl font-bold tracking-tight">
          Portfolio<span className="text-emerald-600">Pilot</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <a href="#features" className="story-link">Features</a>
          <a href="#insights" className="story-link">Insights</a>
          <a href="#advisor" className="story-link">Advisors</a>
        </nav>
        <Link to="/login" className="premium-btn rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-700">
          Start Analysis
        </Link>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 pb-20 md:px-10">
        <section className="grid items-center gap-10 py-12 md:grid-cols-[1.2fr_0.8fr] md:py-20">
          <div className="enter-left space-y-8" style={{ animationDelay: '140ms' }}>
            <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              AI Portfolio Intelligence
            </p>
            <h1 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
              Built for investors who want returns with <span className="headline-accent">rhythm</span>, not chaos.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">
              PortfolioPilot transforms raw holdings into a sharp visual strategy map. Spot concentration risk,
              improve diversification, and make confident next moves with AI-backed clarity.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard" className="premium-btn rounded-full bg-emerald-500 px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-glow transition hover:-translate-y-1 hover:bg-emerald-600">
                Launch Dashboard
              </Link>
              <Link to="/analysis" className="rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-bold uppercase tracking-wider text-slate-700 transition hover:-translate-y-1 hover:border-slate-500">
                Watch Preview
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map((item, index) => (
                <div
                  key={item.label}
                  className="metric-card animate-riseIn rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <p className="text-2xl font-extrabold tracking-tight">{item.value}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="enter-right relative mx-auto w-full max-w-md md:-mt-24" style={{ animationDelay: '260ms' }}>
            <div className="hover-panel rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-glow backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Portfolio Health</h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Strong</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-sand p-4">
                  <div className="mb-2 flex justify-between text-sm font-semibold">
                    <span>Health Score</span>
                    <span>74 / 100</span>
                  </div>
                  <div className="h-2 rounded-full bg-amber-100">
                    <div className="h-2 w-[74%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-slate-500">Diversification</p>
                    <p className="text-xl font-bold">68</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-slate-500">Risk Score</p>
                    <p className="text-xl font-bold">55</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Sector Exposure</p>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="mb-1 flex justify-between"><span>Banking</span><span>35%</span></div>
                      <div className="h-1.5 rounded-full bg-slate-200"><div className="h-1.5 w-[35%] rounded-full bg-slate-700" /></div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between"><span>IT</span><span>25%</span></div>
                      <div className="h-1.5 rounded-full bg-slate-200"><div className="h-1.5 w-[25%] rounded-full bg-cyan-500" /></div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between"><span>Energy</span><span>20%</span></div>
                      <div className="h-1.5 rounded-full bg-slate-200"><div className="h-1.5 w-[20%] rounded-full bg-amber-500" /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="insight-card absolute -bottom-6 -left-6 rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">AI Insight</p>
              <p className="mt-1 max-w-[13rem] text-sm font-semibold text-slate-700">
                Add healthcare exposure to stabilize long-term volatility.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="enter-up py-12 md:py-20" style={{ animationDelay: '340ms' }}>
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Why PortfolioPilot</p>
              <h2 className="font-display text-4xl tracking-tight md:text-5xl">Designed like a product, not a dashboard template.</h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="feature-card group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-2 hover:shadow-glow"
              >
                <div className={`mb-6 overflow-hidden rounded-2xl bg-gradient-to-br ${feature.accent} p-1 transition duration-500 group-hover:scale-[1.02]`}>
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="h-24 w-full rounded-xl object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">0{index + 1}</p>
                <h3 className="mb-3 font-display text-2xl tracking-tight">{feature.title}</h3>
                <p className="leading-relaxed text-slate-600">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="insights" className="enter-up py-12 md:py-20" style={{ animationDelay: '440ms' }}>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">What PortfolioPilot Solves</p>
            <h2 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">
              A marketing page that tells investors exactly why this product matters.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {productHighlights.map((item) => (
              <article key={item.title} className="feature-card group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-2 hover:shadow-glow">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">PortfolioPilot Value</p>
                <h3 className="mb-3 font-display text-2xl tracking-tight">{item.title}</h3>
                <p className="leading-relaxed text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="enter-up grid gap-6 py-4 md:grid-cols-[1.05fr_0.95fr] md:py-10" style={{ animationDelay: '520ms' }}>
          <article className="hover-panel rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">How It Works</p>
            <div className="mt-5 space-y-4">
              {journeySteps.map((item) => (
                <div key={item.step} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/60">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Step {item.step}</p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-800">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="hover-panel rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Expected Outcomes</p>
            <h3 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
              Better investing behavior, not just prettier charts.
            </h3>
            <div className="mt-5 space-y-3">
              {outcomes.map((item) => (
                <p key={item} className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-slate-100 backdrop-blur">
                  {item}
                </p>
              ))}
            </div>
          </article>
        </section>

        <section
          id="advisor"
          className="enter-up hover-panel relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-ink via-slate-900 to-slate-700 p-8 text-white md:p-12"
          style={{ animationDelay: '620ms' }}
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Human + AI</p>
              <h2 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">When the stakes get real, connect to real advisors.</h2>
              <p className="mt-4 max-w-2xl text-slate-200">
                From strategy checks to rebalance consultations, PortfolioPilot helps users go beyond charts and
                take action with expert guidance.
              </p>
            </div>
            <Link to="/advisors" className="rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-wider text-slate-900 transition hover:-translate-y-1 hover:bg-emerald-100">
              Book Consultation
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
