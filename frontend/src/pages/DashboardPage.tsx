import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Flame,
  CheckCircle2,
  Circle,
  TrendingDown,
  ArrowUpRight,
  PieChart,
  Plus,
  Zap,
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { expenseService } from '../services/expenseService';
import { habitService } from '../services/habitService';
import type { ExpenseSummary } from '../types/expenses';
import type { Habit, HabitStats } from '../types/habits';
import { formatCurrency, getStoredCurrency } from '../utils/currency';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitStats, setHabitStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingHabitId, setTogglingHabitId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumData, habitsData, statsData] = await Promise.all([
        expenseService.getSummary(),
        habitService.getHabits(),
        habitService.getStats(),
      ]);
      setSummary(sumData);
      setHabits(habitsData);
      setHabitStats(statsData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleHabit = async (habitId: string) => {
    try {
      setTogglingHabitId(habitId);
      const res = await habitService.toggleHabit(habitId);
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? res.habit : h))
      );
      // Refresh stats
      const updatedStats = await habitService.getStats();
      setHabitStats(updatedStats);
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    } finally {
      setTogglingHabitId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Loading Telemetry Overview...</span>
        </div>
      </div>
    );
  }

  const disciplineIndex = habitStats?.discipline_index ?? 0;
  const bestStreak = habitStats?.best_current_streak ?? 0;
  const totalSpent = summary?.total ?? 0;
  const expenseCount = summary?.count ?? 0;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Synergy Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time synchronization of financial burn rate and behavioral discipline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/expenses"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            Log Expense
          </Link>
          <Link
            to="/app/habits"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            Habit Grid
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Spend"
          value={formatCurrency(totalSpent, getStoredCurrency())}
          subtitle={`${expenseCount} transactions recorded`}
          icon={<DollarSign className="w-5 h-5" />}
          trend="Month to Date"
          trendPositive={true}
        />

        <StatCard
          title="Discipline Index"
          value={`${disciplineIndex}%`}
          subtitle={`${habitStats?.today_completed_count || 0} of ${habitStats?.total_habits || 0} habits completed`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          trend={disciplineIndex >= 75 ? 'Optimal' : 'Needs Focus'}
          trendPositive={disciplineIndex >= 75}
        />

        <StatCard
          title="Best Active Streak"
          value={`${bestStreak} Days`}
          subtitle="Consecutive habit execution"
          icon={<Flame className="w-5 h-5 text-amber-400" />}
          trend="Momentum"
          trendPositive={bestStreak > 3}
        />

        <StatCard
          title="Active Budgets"
          value={summary?.active_budgets?.length || 0}
          subtitle="Enforced category limits"
          icon={<TrendingDown className="w-5 h-5 text-emerald-400" />}
          trend="Protected"
          trendPositive={true}
        />
      </div>

      {/* 2-Column Section: Habits & Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Today's Habit Execution */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-white">
                Today's Habit Discipline
              </h2>
            </div>
            <Link
              to="/app/habits"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {habits.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No active habits defined yet.
              </p>
            ) : (
              habits.slice(0, 5).map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    habit.is_completed_today
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      disabled={togglingHabitId === habit.id}
                      className="text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {habit.is_completed_today ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                    <div>
                      <span
                        className={`text-sm font-medium ${
                          habit.is_completed_today ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {habit.name}
                      </span>
                      <p className="text-[11px] text-slate-500 capitalize">
                        {habit.preferred_time_window} • {habit.frequency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      {habit.current_streak}d
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Category Breakdown */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <PieChart className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-white">
                  Monthly Category Allocation
                </h2>
              </div>
              <Link
                to="/app/expenses"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                Ledger
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {(!summary?.category_breakdown || summary.category_breakdown.length === 0) ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No categorized expenses recorded this month.
                </p>
              ) : (
                summary.category_breakdown.slice(0, 4).map((cat) => (
                  <div key={cat.category_id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.category_color }}
                        />
                        <span className="font-medium text-slate-300">
                          {cat.category_name}
                        </span>
                      </div>
                      <span className="font-semibold text-white">
                        {formatCurrency(cat.total, getStoredCurrency())} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(cat.percentage, 100)}%`,
                          backgroundColor: cat.category_color,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Total Filtered Volume</span>
            <span className="font-bold text-white">{formatCurrency(totalSpent, getStoredCurrency())}</span>
          </div>
        </div>
      </div>

      {/* Recent Ledger Stream */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">
            Recent Financial Telemetry
          </h2>
          <Link
            to="/app/expenses"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            View full ledger
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="pb-3 px-3">Merchant / Description</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Payment</th>
                <th className="pb-3 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {(!summary?.recent_expenses || summary.recent_expenses.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No recent expenses found.
                  </td>
                </tr>
              ) : (
                summary.recent_expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-medium text-white">
                      {exp.merchant_name}
                      {exp.notes && (
                        <p className="text-[11px] text-slate-500 font-normal truncate max-w-xs">
                          {exp.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium"
                        style={{
                          backgroundColor: `${exp.category_color || '#6366F1'}20`,
                          color: exp.category_color || '#818CF8',
                        }}
                      >
                        {exp.category_name || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{exp.transaction_date}</td>
                    <td className="py-3 px-3 text-slate-400 capitalize">{exp.payment_method.replace('_', ' ')}</td>
                    <td className="py-3 px-3 text-right font-semibold text-white">
                      {formatCurrency(exp.amount_display, exp.currency || getStoredCurrency())}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
