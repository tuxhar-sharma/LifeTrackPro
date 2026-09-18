import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Download,
  DollarSign,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { userService } from '../services/userService';
import type { CashFlowData, FinancialHealthScore, HistoricalTrends } from '../types/analytics';
import { formatCurrency, getStoredCurrency } from '../utils/currency';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';
import { StatCard } from '../components/ui/StatCard';
import { CardSkeleton, Skeleton } from '../components/ui/Skeleton';

export const AnalyticsPage: React.FC = () => {
  useDocumentTitle('Financial Analytics & Cash Flow');
  const toast = useToast();

  const [cashFlow, setCashFlow] = useState<CashFlowData | null>(null);
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [trends, setTrends] = useState<HistoricalTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const currency = getStoredCurrency();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cfRes, hsRes, trRes] = await Promise.all([
        analyticsService.getCashFlow(),
        analyticsService.getHealthScore(),
        analyticsService.getTrends(),
      ]);

      setCashFlow(cfRes);
      setHealthScore(hsRes);
      setTrends(trRes);
    } catch (err) {
      console.error('Failed to load analytics telemetry:', err);
      toast.error('Analytics Alert', 'Failed to retrieve unified financial telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportData = async () => {
    try {
      setExporting(true);
      const data = await userService.exportData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lifetrack-telemetry-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Archive Exported', 'Full GDPR-compliant JSON archive downloaded.');
    } catch (err) {
      toast.error('Export Error', 'Failed to generate data export archive.');
    } finally {
      setExporting(false);
    }
  };

  // Maximum value for SVG chart height scaling
  const maxMonthlyVal = Math.max(
    ...(trends?.history.map((m) => Math.max(m.income, m.expense)) || [1000])
  );

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Financial & Behavioral Telemetry
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
              Synergy Engine
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Algorithmic cash flow analysis, automated capital retention scoring, and 6-month trajectory models.
          </p>
        </div>

        <button
          onClick={handleExportData}
          disabled={exporting}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all shadow-lg cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          {exporting ? 'Generating JSON...' : 'Export Telemetry Archive (GDPR)'}
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Net Capital Savings (MTD)"
            value={formatCurrency(cashFlow?.net_savings || 0, currency)}
            subtitle={cashFlow?.net_savings && cashFlow.net_savings >= 0 ? "Positive Cash Flow Retention" : "Deficit Burn Velocity"}
            icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
            color={cashFlow?.net_savings && cashFlow.net_savings >= 0 ? "emerald" : "rose"}
          />
          <StatCard
            title="Capital Savings Rate"
            value={`${cashFlow?.savings_rate || 0}%`}
            subtitle="Percentage of gross inflow retained"
            icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
            color="indigo"
          />
          <StatCard
            title="Total Monthly Inflow"
            value={formatCurrency(cashFlow?.total_income || 0, currency)}
            subtitle="Gross intake across all streams"
            icon={<ArrowUpRight className="w-5 h-5 text-cyan-400" />}
            color="cyan"
          />
          <StatCard
            title="Total Monthly Outflow"
            value={formatCurrency(cashFlow?.total_expense || 0, currency)}
            subtitle="Discretionary & fixed ledger burn"
            icon={<TrendingDown className="w-5 h-5 text-rose-400" />}
            color="rose"
          />
        </div>
      )}

      {/* Financial Health Score & Advice Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Institutional Health Metric
              </span>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {healthScore?.grade || 'Analyzing'}
              </span>
            </div>

            {loading ? (
              <Skeleton className="w-24 h-16 mb-4" />
            ) : (
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-extrabold font-mono text-white tracking-tight">
                  {healthScore?.score || 0}
                </span>
                <span className="text-slate-500 text-sm font-semibold">/ 100</span>
              </div>
            )}

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {healthScore?.recommendation ||
                'Telemetry scoring based on savings velocity, budget containment, and daily habit consistency.'}
            </p>
          </div>

          {/* Sub-score breakdown bars */}
          {healthScore && (
            <div className="space-y-3 pt-4 border-t border-slate-800/80 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Savings Rate Score</span>
                  <span className="font-mono text-slate-200">
                    {healthScore.breakdown.savings_score}/{healthScore.breakdown.max_savings_score}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(healthScore.breakdown.savings_score / healthScore.breakdown.max_savings_score) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Budget Adherence Score</span>
                  <span className="font-mono text-slate-200">
                    {healthScore.breakdown.budget_score}/{healthScore.breakdown.max_budget_score}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(healthScore.breakdown.budget_score / healthScore.breakdown.max_budget_score) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Habit Discipline Synergy</span>
                  <span className="font-mono text-slate-200">
                    {healthScore.breakdown.habit_score}/{healthScore.breakdown.max_habit_score}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(healthScore.breakdown.habit_score / healthScore.breakdown.max_habit_score) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6-Month Inflow vs Outflow Historical Visualizer */}
        <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                6-Month Cash Flow Trajectory
              </h2>
              <p className="text-xs text-slate-400">
                Comparison of Monthly Inflow (Green) vs Outflow Burn (Rose)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Inflow
              </span>
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Outflow
              </span>
            </div>
          </div>

          {/* Interactive Visual Bar Columns */}
          {loading ? (
            <Skeleton className="w-full h-52 rounded-xl" />
          ) : (
            <div className="h-56 flex items-end justify-between gap-4 pt-6 px-2 border-b border-slate-800">
              {trends?.history.map((m) => {
                const incomePct = maxMonthlyVal > 0 ? (m.income / maxMonthlyVal) * 100 : 0;
                const expensePct = maxMonthlyVal > 0 ? (m.expense / maxMonthlyVal) * 100 : 0;

                return (
                  <div
                    key={m.month_key}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 p-2 rounded-lg text-[10px] text-white pointer-events-none shadow-xl z-20 whitespace-nowrap">
                      <p className="font-bold">{m.month_label}</p>
                      <p className="text-emerald-400">In: {formatCurrency(m.income, currency)}</p>
                      <p className="text-rose-400">Out: {formatCurrency(m.expense, currency)}</p>
                      <p className="text-indigo-300 font-semibold">Rate: {m.savings_rate}%</p>
                    </div>

                    <div className="w-full flex items-end justify-center gap-1.5 h-44">
                      {/* Income Bar */}
                      <div
                        className="w-1/2 max-w-[18px] bg-emerald-500/80 hover:bg-emerald-400 rounded-t transition-all duration-300"
                        style={{ height: `${Math.max(4, incomePct)}%` }}
                      />
                      {/* Expense Bar */}
                      <div
                        className="w-1/2 max-w-[18px] bg-rose-500/80 hover:bg-rose-400 rounded-t transition-all duration-300"
                        style={{ height: `${Math.max(4, expensePct)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {m.short_label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Hover over columns for detailed month-over-month ledger totals
            </span>
            <span className="font-mono text-[11px]">
              Average Savings Rate: {cashFlow?.savings_rate || 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
