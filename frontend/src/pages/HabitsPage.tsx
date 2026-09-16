import React, { useState, useEffect } from 'react';
import {
  Plus,
  Flame,
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  Sparkles
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { habitService } from '../services/habitService';
import type { Habit, HabitStats } from '../types/habits';

export const HabitsPage: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [timeWindow, setTimeWindow] = useState('morning');
  const [frequency, setFrequency] = useState('daily');
  const [type, setType] = useState<'boolean' | 'numeric'>('boolean');
  const [targetValue, setTargetValue] = useState('1');
  const [unit, setUnit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsData, statsData] = await Promise.all([
        habitService.getHabits(),
        habitService.getStats(),
      ]);
      setHabits(habitsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading habits data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (habitId: string) => {
    try {
      setTogglingId(habitId);
      const res = await habitService.toggleHabit(habitId);
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? res.habit : h))
      );
      const updatedStats = await habitService.getStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      setSubmitting(true);
      await habitService.createHabit({
        name,
        description,
        type,
        target_value: parseFloat(targetValue) || 1.0,
        unit: unit || undefined,
        preferred_time_window: timeWindow,
        frequency,
      });

      setName('');
      setDescription('');
      setUnit('');
      setType('boolean');
      setTargetValue('1');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to create habit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    try {
      await habitService.deleteHabit(habitId);
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      const updatedStats = await habitService.getStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'gold':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'silver':
        return 'bg-slate-300/10 text-slate-300 border-slate-400/30';
      case 'bronze':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Atomic Discipline & Habits
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build unshakeable behavioral momentum through continuous daily execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Habit
          </button>
        </div>
      </div>

      {/* 7-Day Consistency Matrix */}
      {stats && stats.weekly_grid && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">
                7-Day Consistency Cadence
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Today's Discipline:</span>
              <span className="font-bold text-indigo-400">{stats.discipline_index}%</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {stats.weekly_grid.map((day) => (
              <div
                key={day.date}
                className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 text-center space-y-2"
              >
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  {day.day_name}
                </span>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      day.rate === 100
                        ? 'bg-emerald-400'
                        : day.rate >= 50
                        ? 'bg-indigo-500'
                        : day.rate > 0
                        ? 'bg-amber-500'
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${day.rate}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  {day.completed_count}/{day.total_habits}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-xs text-slate-500">
            Loading habit telemetry...
          </div>
        ) : habits.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-xs text-slate-500">
            No habits defined yet. Click "Create Habit" to begin.
          </div>
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className={`relative bg-slate-900/70 border rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between ${
                habit.is_completed_today
                  ? 'border-emerald-500/40 bg-gradient-to-br from-slate-900/90 to-emerald-950/15'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {habit.preferred_time_window}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${getTierBadge(
                        habit.streak_tier
                      )}`}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      {habit.streak_tier}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="text-slate-600 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Name & Description */}
                <h3 className="text-base font-bold text-white mb-1 leading-snug">
                  {habit.name}
                </h3>
                {habit.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {habit.description}
                  </p>
                )}
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{habit.current_streak} streak</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Best: {habit.best_streak}d
                  </span>
                </div>

                <button
                  onClick={() => handleToggle(habit.id)}
                  disabled={togglingId === habit.id}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    habit.is_completed_today
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {habit.is_completed_today ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-slate-400" />
                      <span>Check In</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Habit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Formulate New Habit Protocol"
      >
        <form onSubmit={handleCreateHabit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Habit Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Sunlight / Cold Shower / 20m Meditation"
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Why this matters (Implementation Intention)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Grounding intention, psychological cue, or trigger event..."
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'boolean' | 'numeric')}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="boolean">Check-off (Yes/No)</option>
                <option value="numeric">Numeric Target</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Value
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Preferred Time
              </label>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Cadence
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Activate Habit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
