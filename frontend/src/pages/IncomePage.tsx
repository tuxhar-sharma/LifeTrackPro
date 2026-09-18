import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Trash2,
  Briefcase,
  Layers,
  DollarSign,
  Repeat,
  ArrowUpRight
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { incomeService } from '../services/incomeService';
import type { Income, IncomeSource, IncomeSummary, StreamType, RecurrenceInterval } from '../types/income';
import { formatCurrency, getStoredCurrency, getCurrencySymbol } from '../utils/currency';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const IncomePage: React.FC = () => {
  useDocumentTitle('Income Streams');
  const toast = useToast();

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [summary, setSummary] = useState<IncomeSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('');

  // Modal State: Record Income
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const currency = getStoredCurrency();
  const [payerName, setPayerName] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>('monthly');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal State: Create Source
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newStreamType, setNewStreamType] = useState<StreamType>('freelance');
  const [newSourceColor, setNewSourceColor] = useState('#10B981');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incomeRes, sourcesRes, summaryRes] = await Promise.all([
        incomeService.getIncome({
          search: search || undefined,
          source: selectedSource || undefined,
        }),
        incomeService.getSources(),
        incomeService.getSummary(),
      ]);

      setIncomes(incomeRes.results);
      setSources(sourcesRes);
      setSummary(summaryRes);

      if (sourcesRes.length > 0 && !sourceId) {
        setSourceId(sourcesRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load income telemetry:', err);
      toast.error('Ledger Error', 'Failed to retrieve income stream records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSource]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleCreateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !payerName) {
      toast.warning('Incomplete Form', 'Please specify an amount and payer name.');
      return;
    }

    try {
      setSubmitting(true);
      await incomeService.createIncome({
        amount: parseFloat(amount),
        currency,
        source: sourceId || undefined,
        payer_name: payerName,
        received_date: receivedDate,
        is_recurring: isRecurring,
        recurrence_interval: isRecurring ? recurrenceInterval : undefined,
        notes: notes || undefined,
      });

      toast.success('Inflow Recorded', `Added ${formatCurrency(parseFloat(amount), currency)} from ${payerName}`);
      setIsIncomeModalOpen(false);
      setAmount('');
      setPayerName('');
      setNotes('');
      fetchData();
    } catch (err) {
      console.error('Failed to record income:', err);
      toast.error('Recording Error', 'Could not save income transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;

    try {
      setSubmitting(true);
      const created = await incomeService.createSource({
        name: newSourceName,
        stream_type: newStreamType,
        color_hex: newSourceColor,
      });

      toast.success('Channel Created', `Stream "${created.name}" is now active.`);
      setIsSourceModalOpen(false);
      setNewSourceName('');
      fetchData();
    } catch (err) {
      console.error('Failed to create channel:', err);
      toast.error('Channel Error', 'Could not create new income channel.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIncome = async (id: string, merchant: string) => {
    if (!confirm(`Are you sure you want to delete this income entry from ${merchant}?`)) return;

    try {
      await incomeService.deleteIncome(id);
      toast.info('Entry Removed', 'Transaction has been deleted from your ledger.');
      fetchData();
    } catch {
      toast.error('Action Failed', 'Could not delete income entry.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Income & Inflow Telemetry
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
              Live Inflow
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor institutional compensation, freelance retainers, dividends, and recurring cash flow.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => setIsSourceModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:text-white dark:hover:border-slate-700 transition-all shadow-xs cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Manage Channels
          </button>
          <button
            onClick={() => setIsIncomeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Income
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
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
            title="Total Inflow (MTD)"
            value={formatCurrency(summary?.total || 0, currency)}
            subtitle="Gross income received this month"
            icon={<TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
            color="emerald"
          />
          <StatCard
            title="Recurring Inflow"
            value={formatCurrency(summary?.recurring_total || 0, currency)}
            subtitle="Automated salary & retainers"
            icon={<Repeat className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            color="indigo"
          />
          <StatCard
            title="Inflow Events"
            value={summary?.count || 0}
            subtitle="Individual deposit events"
            icon={<ArrowUpRight className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
            color="cyan"
          />
          <StatCard
            title="Active Streams"
            value={sources.length}
            subtitle="Diversified revenue channels"
            icon={<Briefcase className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
            color="amber"
          />
        </div>
      )}

      {/* Stream Distribution Badges */}
      {summary && summary.source_breakdown.length > 0 && (
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs transition-colors">
          <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
            Inflow Channel Distribution
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {summary.source_breakdown.map((src) => (
              <div
                key={src.source_id || src.source_name}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: src.source_color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-[120px]">
                      {src.source_name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {src.percentage}%
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shrink-0 ml-2">
                  {formatCurrency(src.total, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payer, client, or notes..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all shadow-xs"
          />
        </form>

        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="px-3.5 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
        >
          <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Channels</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : incomes.length === 0 ? (
        <EmptyState
          icon={<DollarSign className="w-7 h-7" />}
          title="No Income Recorded"
          description="Your income ledger is currently empty. Record your primary salary, freelance payouts, or investment dividends to calculate your savings rate."
          actionText="Record First Inflow"
          onAction={() => setIsIncomeModalOpen(true)}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs dark:shadow-xl transition-colors">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 sm:px-6 py-3.5">Payer / Channel</th>
                  <th className="px-5 sm:px-6 py-3.5">Date</th>
                  <th className="px-5 sm:px-6 py-3.5">Recurrence</th>
                  <th className="px-5 sm:px-6 py-3.5">Notes</th>
                  <th className="px-5 sm:px-6 py-3.5 text-right">Amount</th>
                  <th className="px-5 sm:px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {incomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{
                            backgroundColor: inc.source_details?.color_hex || '#10B981',
                          }}
                        >
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white tracking-tight">
                            {inc.payer_name || 'Direct Deposit'}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {inc.source_details?.name || 'Uncategorized Channel'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">
                      {inc.received_date}
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      {inc.is_recurring ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-medium">
                          <Repeat className="w-2.5 h-2.5" />
                          {inc.recurrence_interval}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">One-time</span>
                      )}
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {inc.notes || '—'}
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-right">
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm">
                        +{formatCurrency(inc.amount, inc.currency)}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteIncome(inc.id, inc.payer_name || 'Income')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Transaction"
                        aria-label="Delete Transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Income Modal */}
      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title="Record Inflow Transaction"
      >
        <form onSubmit={handleCreateIncome} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Amount ({getCurrencySymbol(currency)})
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                {getCurrencySymbol(currency)}
              </span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="4500.00"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Payer / Source Entity
            </label>
            <input
              type="text"
              required
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              placeholder="Alphabet / Stripe / Client Retainer"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Income Channel
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Channel</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Deposit Date
              </label>
              <input
                type="date"
                required
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Recurring Inflow</span>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-slate-900 cursor-pointer"
              />
            </div>

            {isRecurring && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Recurrence Cadence
                </label>
                <select
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(e.target.value as RecurrenceInterval)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contract milestone, equity dividend, bonus payout..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsIncomeModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Recording...' : 'Commit Inflow'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Channels Modal */}
      <Modal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        title="Configure Inflow Channel"
      >
        <form onSubmit={handleCreateSource} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Channel Name
            </label>
            <input
              type="text"
              required
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              placeholder="e.g. Angel Investments / Substack / Retainer"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Stream Category
            </label>
            <select
              value={newStreamType}
              onChange={(e) => setNewStreamType(e.target.value as StreamType)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="salary" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Primary Salary / W2</option>
              <option value="freelance" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Freelance & Consulting</option>
              <option value="business" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Business & SaaS Revenue</option>
              <option value="investment" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Dividends & Capital Gains</option>
              <option value="rental" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Real Estate & Rental</option>
              <option value="other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Other Capital Inflow</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Telemetry Accent Color
            </label>
            <div className="flex gap-3">
              {['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewSourceColor(c)}
                  className={`w-8 h-8 rounded-xl border-2 transition-all cursor-pointer ${
                    newSourceColor === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent opacity-70'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSourceModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Establish Channel'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IncomePage;
