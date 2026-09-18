import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Flame,
  CheckCircle2,
  ReceiptText,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Circle,
  Coins,
  ChevronRight,
  Lock,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const LandingPage: React.FC = () => {
  useDocumentTitle('High-Performance Life & Financial Telemetry');
  const { isAuthenticated } = useAuth();

  // Interactive playground state on landing page
  const [playgroundHabits, setPlaygroundHabits] = useState([
    { id: 1, name: 'Morning Cold Hydration (500ml)', done: true, streak: 14 },
    { id: 2, name: '90-Min Deep Work Focus Block', done: true, streak: 8 },
    { id: 3, name: '45-Min Physical Training / Run', done: false, streak: 21 },
    { id: 4, name: 'Zero Impulsive Spending Review', done: false, streak: 5 },
  ]);

  const togglePlaygroundHabit = (id: number) => {
    setPlaygroundHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, done: !h.done, streak: h.done ? h.streak - 1 : h.streak + 1 } : h
      )
    );
  };

  const completedCount = playgroundHabits.filter((h) => h.done).length;
  const disciplinePercent = Math.round((completedCount / playgroundHabits.length) * 100);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-300 font-sans">
      {/* Top Notification Announcement Bar */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-indigo-900/40 to-slate-950 border-b border-indigo-500/20 py-2 px-4 text-center text-xs font-medium text-indigo-300">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>LifeTrack Pro v1.0 Public Release: Multi-Currency Ledger & Atomic Habit Engine Live</span>
          <Link to="/register" className="underline font-bold text-white hover:text-indigo-200 ml-1">
            Claim Free Account →
          </Link>
        </span>
      </div>

      {/* Sticky Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              LifeTrack <span className="text-indigo-400">Pro</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/app/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all"
              >
                <span>Launch App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-medium text-indigo-300 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>The Unified Personal Telemetry OS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
            Master Your Capital.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
              Architect Daily Discipline.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop juggling fragmented spreadsheets, disconnected habit apps, and finance trackers. 
            LifeTrack Pro synchronizes your transactions, budget burn rates, and atomic habits into a single, cohesive command center.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Explore Demo Account</span>
            </Link>
          </div>

          {/* Quick Stats Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Argon2id & JWT Auth</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-indigo-400" />
              <span>10 Global Currencies ($, ₹, €, £)</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Streaks & Momentum Engine</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive UI Preview Mockup */}
        <div className="relative max-w-5xl mx-auto mt-14 rounded-3xl border border-slate-800 bg-slate-950/80 p-3 sm:p-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 mb-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-slate-400">https://lifetrackpro.app/dashboard</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Live Telemetry
            </span>
          </div>

          {/* Mini Dashboard Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Discipline Index</span>
              <div className="text-2xl font-bold text-white mt-1">87.5%</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Optimal Execution Cadence</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Best Active Streak</span>
              <div className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1.5">
                <Flame className="w-6 h-6 fill-amber-400" />
                <span>21 Days</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Diamond Tier Momentum</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Monthly Spend</span>
              <div className="text-2xl font-bold text-indigo-300 mt-1">$1,420.50</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Under Category Limits</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-3">
                <span>Today's Habit Checklist</span>
                <span className="text-emerald-400">3 of 4 Complete</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Hydration Protocol</span>
                  </div>
                  <span className="text-[11px] text-amber-400 font-bold">14d 🔥</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>90m Deep Work Block</span>
                  </div>
                  <span className="text-[11px] text-amber-400 font-bold">8d 🔥</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-3">
                <span>Budget Burn Rate Pacing</span>
                <span className="text-slate-400">Groceries: 54%</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                    <span>Food & Dining</span>
                    <span className="text-white font-medium">$215 / $400</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-[54%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                    <span>Tech & Subscriptions</span>
                    <span className="text-white font-medium">$45 / $100</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full w-[45%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="py-20 bg-slate-950/60 border-y border-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              The Cognitive Fragmentation Problem
            </h2>
            <p className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Why Your Current Productivity Stack Is Failing You
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-rose-950/10 border border-rose-500/20 rounded-3xl p-7 space-y-4">
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                ❌ Fragmented Conventional Stack
              </div>
              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><b>Isolated Habit Apps:</b> Track check-ins but have zero awareness of your energy, focus blocks, or budget allocations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><b>Clunky Bank Aggregators:</b> Delay transactions by days, crash constantly, and sell your private financial telemetry.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><b>Spreadsheet Fatigue:</b> Hundreds of manual formulas that break and consume hours of weekend maintenance.</span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-3xl p-7 space-y-4">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                ⚡ The LifeTrack Pro Telemetry OS
              </div>
              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><b>Unified Synergy Matrix:</b> Single platform correlating daily discipline directly with financial sovereignty.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><b>Microsecond Precision:</b> Integer cents accounting, instant offline check-offs, and multi-currency formatting.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><b>Privacy Sovereign:</b> Argon2id hashing, encrypted sessions, and zero ad networks or analytics trackers.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Playground Showcase */}
      <section id="demo" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Live Interactive Prototype
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Test Drive Atomic Discipline In Real Time
            </h2>
            <p className="text-xs text-slate-400">
              Click the checkmark circles below to test how streaks and the Discipline Index calculate dynamically.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Calculated Discipline Score</span>
                <div className="text-3xl font-extrabold text-white mt-1 flex items-baseline gap-2">
                  <span>{disciplinePercent}%</span>
                  <span className="text-xs font-medium text-slate-400">({completedCount} of {playgroundHabits.length} finished)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span>Interactive Playground</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {playgroundHabits.map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => togglePlaygroundHabit(habit.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    habit.done
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <button className="text-slate-400 hover:text-emerald-400 transition-colors">
                      {habit.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                    <span className={`text-sm font-medium ${habit.done ? 'line-through text-slate-400' : 'text-white'}`}>
                      {habit.name}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    {habit.streak}d
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Save your custom habit protocol forever — Create free account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="py-20 bg-slate-950/40 border-t border-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Core Architecture & Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered For High-Performance Living
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ReceiptText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Financial Sovereign Ledger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clean integer-precision accounting with zero floating-point errors. Track expenses with custom categories, payment methods, and instant search.
              </p>
            </div>

            {/* Bento Card 2 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Atomic Discipline Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Build behavioral momentum with consecutive streaks, milestone tiers (Diamond, Gold, Silver), and 7-day consistency cadence matrices.
              </p>
            </div>

            {/* Bento Card 3 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Multi-Currency & Global</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamlessly toggle between USD ($), INR (₹), EUR (€), GBP (£), CAD, and more. All ledger totals and budget meters adapt instantly.
              </p>
            </div>

            {/* Bento Card 4 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Category Budget Pacing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enforce proactive spending limits with live visual burn-rate progress bars. Receive warnings before overspending occurs.
              </p>
            </div>

            {/* Bento Card 5 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Argon2id & JWT Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Password hashing with memory-hard Argon2id, automated JWT refresh token rotation, and strict multi-tenant row isolation.
              </p>
            </div>

            {/* Bento Card 6 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-7 space-y-4 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Synergy Dashboard</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Single executive cockpit giving you real-time Month-to-Date spend, today's discipline index, active streaks, and recent entries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Invest In Your Life Momentum
            </h2>
            <p className="text-xs text-slate-400">
              Start free today with no credit card required. Upgrade when you are ready to scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Starter Telemetry</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400">Perfect for individuals starting their discipline journey.</p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2">✓ Core Habit Tracking</li>
                  <li className="flex items-center gap-2">✓ Monthly Expense Ledger</li>
                  <li className="flex items-center gap-2">✓ 7-Day Consistency Cadence</li>
                  <li className="flex items-center gap-2">✓ Multi-Currency Support</li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white text-center transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier (Featured) */}
            <div className="relative bg-gradient-to-b from-indigo-950/70 to-slate-900 border-2 border-indigo-500 rounded-3xl p-7 space-y-6 flex flex-col justify-between shadow-2xl shadow-indigo-500/15">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-500 text-[10px] font-extrabold uppercase tracking-wider text-white">
                Most Popular
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Pro Sovereign</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$9.99</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400">For self-optimizers requiring complete financial & habit mastery.</p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2 font-medium text-white">✓ Everything in Starter</li>
                  <li className="flex items-center gap-2">✓ Unlimited Category Budgets</li>
                  <li className="flex items-center gap-2">✓ Streak Freeze Allowances</li>
                  <li className="flex items-center gap-2">✓ Deep Work Focus Tracking</li>
                  <li className="flex items-center gap-2">✓ Full Historical Export (CSV/JSON)</li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white text-center shadow-lg shadow-indigo-600/30 transition-all"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Lifetime / Enterprise */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-7 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Lifetime Access</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$149</span>
                  <span className="text-xs text-slate-400">/ one-time</span>
                </div>
                <p className="text-xs text-slate-400">Pay once, own your personal telemetry workspace forever.</p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2">✓ All Current & Future Pro Features</li>
                  <li className="flex items-center gap-2">✓ Priority Support Channel</li>
                  <li className="flex items-center gap-2">✓ Early Access to AI Copilot</li>
                  <li className="flex items-center gap-2">✓ Zero Subscription Recurring Fees</li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white text-center transition-colors"
              >
                Claim Lifetime Deal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-950/60 border-t border-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Everything You Need To Know
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-white text-sm">How is LifeTrack Pro different from Notion or spreadsheet templates?</h4>
              <p className="text-slate-400 leading-relaxed">
                Notion and spreadsheets lack real-time streak engines, integer financial validation, and automatic budget burn rate pacing. LifeTrack Pro is a dedicated, production-grade telemetry OS designed for speed, sub-100ms API responses, and zero formula maintenance.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-white text-sm">Can I use LifeTrack Pro with currencies other than USD?</h4>
              <p className="text-slate-400 leading-relaxed">
                Yes! LifeTrack Pro includes first-class multi-currency support including USD ($), INR (₹), EUR (€), GBP (£), CAD, AUD, JPY, and AED with instant toggle and persistent preferences.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-white text-sm">Is my data secure and private?</h4>
              <p className="text-slate-400 leading-relaxed">
                Absolutely. We use memory-hard Argon2id password hashing, rotating JWT bearer tokens, and PostgreSQL tenant isolation. We never sell your data, display ads, or use third-party tracking scripts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-indigo-950/40 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Take Full Command Of Your Personal Telemetry Today.
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Join knowledge workers, founders, and students building discipline and financial momentum.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-2xl shadow-indigo-600/40 transition-all hover:scale-105"
            >
              <span>Get Started Now — It's Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300">LifeTrack Pro</span>
            <span>— Precision Personal Telemetry OS</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/tuxhar-sharma/LifeTrackPro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
