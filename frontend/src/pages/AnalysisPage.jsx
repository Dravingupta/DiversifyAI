import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { analyzePortfolio } from '../../services/api';
import { Activity, ShieldAlert, HeartPulse, Sparkles, Loader2 } from 'lucide-react';

function AnalysisPage() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRunAnalysis = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const data = await analyzePortfolio();
      setAnalysisData(data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to analyze portfolio. Ensure you have stocks added.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout
      title="DiversifyAI Analysis"
      subtitle="Trigger portfolio intelligence and get scores, explanations, and action-oriented recommendations."
    >
      {!analysisData ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 px-6 text-center shadow-sm">
          <Sparkles className="h-16 w-16 text-emerald-500 mb-4 opacity-80" />
          <h2 className="text-2xl font-display font-bold text-slate-800">Ready to Analyze Your Portfolio?</h2>
          <p className="mt-2 max-w-md text-slate-500">
            Our AI engine will scan your holdings, evaluate risk, determine diversification quality, and give you actionable rebalancing steps.
          </p>
          <p className="mt-2 max-w-md text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
            Analysis is user-triggered only and capped to one generation per day.
          </p>
          {errorMsg && <p className="mt-4 text-sm font-semibold text-red-500">{errorMsg}</p>}
          <button 
            onClick={handleRunAnalysis}
            disabled={isLoading}
            className="mt-8 flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-emerald-700 hover:shadow-lg disabled:opacity-70"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              'Run AI Analysis'
            )}
          </button>
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
          <section className="grid gap-5 md:grid-cols-3">
            <article className="hover-panel enter-up rounded-3xl border border-slate-200 bg-white p-6 relative overflow-hidden" style={{ animationDelay: '100ms' }}>
              <div className="absolute right-[-10%] top-[-10%] h-32 w-32 rounded-full bg-cyan-50 blur-2xl -z-10" />
              <div className="flex items-center gap-2 text-slate-500">
                <Activity className="h-5 w-5 text-cyan-500" />
                <p className="text-xs font-bold uppercase tracking-[0.16em]">Diversification Score</p>
              </div>
              <p className="mt-4 font-display text-6xl tracking-tight text-slate-900">{analysisData.diversificationScore}</p>
              <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${analysisData.diversificationScore}%` }} />
              </div>
            </article>

            <article className="hover-panel enter-up rounded-3xl border border-slate-200 bg-white p-6 relative overflow-hidden" style={{ animationDelay: '180ms' }}>
               <div className="absolute right-[-10%] top-[-10%] h-32 w-32 rounded-full bg-amber-50 blur-2xl -z-10" />
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <p className="text-xs font-bold uppercase tracking-[0.16em]">Risk Score</p>
              </div>
              <p className="mt-4 font-display text-6xl tracking-tight text-slate-900">{analysisData.riskScore}</p>
               <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${analysisData.riskScore}%` }} />
              </div>
            </article>

            <article className="hover-panel enter-up rounded-3xl border border-slate-200 bg-white p-6 relative overflow-hidden" style={{ animationDelay: '260ms' }}>
               <div className="absolute right-[-10%] top-[-10%] h-32 w-32 rounded-full bg-emerald-50 blur-2xl -z-10" />
              <div className="flex items-center gap-2 text-slate-500">
                <HeartPulse className="h-5 w-5 text-emerald-500" />
                <p className="text-xs font-bold uppercase tracking-[0.16em]">Portfolio Health</p>
              </div>
              <p className="mt-4 font-display text-6xl tracking-tight text-slate-900">{analysisData.portfolioHealth}</p>
               <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analysisData.portfolioHealth}%` }} />
              </div>
            </article>
          </section>

          <section className="enter-up mt-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl relative overflow-hidden" style={{ animationDelay: '320ms' }}>
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-3xl tracking-tight flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-emerald-400" /> AI Recommendations
              </h2>
              <button onClick={() => setAnalysisData(null)} className="text-xs text-slate-400 hover:text-white uppercase tracking-wider font-bold underline underline-offset-4">
                Re-run Analysis
              </button>
            </div>

            <p className="mb-5 text-xs uppercase tracking-[0.12em] text-emerald-200/90">
              {analysisData?.isCached
                ? 'Showing cached daily analysis. New generation available after next day reset.'
                : 'Fresh analysis generated for today.'}
            </p>
            
            <div className="grid gap-4 md:grid-cols-2 relative z-10">
              {analysisData.recommendations.map((rec, i) => (
                <div key={i} className="group relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-all hover:bg-white/10 hover:border-white/20">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-slate-200 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </AppLayout>
  );
}

export default AnalysisPage;
