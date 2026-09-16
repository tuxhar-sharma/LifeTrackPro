import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  TrendingDown,
  Tag,
  Coins
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { expenseService } from '../services/expenseService';
import type { Expense, ExpenseCategory, Budget } from '../types/expenses';
import {
  CURRENCIES,
  getStoredCurrency,
  setStoredCurrency,
  formatCurrency,
  getCurrencySymbol
} from '../utils/currency';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Currency Selection
  const [currentCurrency, setCurrentCurrency] = useState<string>(getStoredCurrency);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // New Expense Form State
  const [amount, setAmount] = useState('');
  const [expenseCurrency, setExpenseCurrency] = useState<string>(getStoredCurrency);
  const [merchant, setMerchant] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New Budget Form State
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetStart, setBudgetStart] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [budgetEnd, setBudgetEnd] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, exps, bgs] = await Promise.all([
        expenseService.getCategories(),
        expenseService.getExpenses({
          search: search || undefined,
          category: selectedCategory || undefined,
        }),
        expenseService.getBudgets(),
      ]);
      setCategories(cats);
      setExpenses(exps);
      setBudgets(bgs);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
        setBudgetCategory(cats[0].id);
      }
    } catch (err) {
      console.error('Error loading expenses data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleCurrencyChange = (newCode: string) => {
    setCurrentCurrency(newCode);
    setStoredCurrency(newCode);
    setExpenseCurrency(newCode);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenAddExpense = () => {
    setExpenseCurrency(currentCurrency);
    setIsModalOpen(true);
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !merchant) return;

    try {
      setSubmitting(true);
      await expenseService.createExpense({
        amount: parseFloat(amount),
        currency: expenseCurrency,
        merchant_name: merchant,
        category: categoryId || undefined,
        transaction_date: date,
        payment_method: paymentMethod,
        notes,
      });

      // Reset form
      setAmount('');
      setMerchant('');
      setNotes('');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to create expense:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetLimit || !budgetCategory) return;

    try {
      setSubmitting(true);
      await expenseService.createBudget({
        category: budgetCategory,
        limit: parseFloat(budgetLimit),
        period_start: budgetStart,
        period_end: budgetEnd,
      });

      setBudgetLimit('');
      setIsBudgetModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to create budget:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseService.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount_cents, 0) / 100.0;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Financial Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track transactions, inspect cash flow allocations, and enforce category budgets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Switcher Selector */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
            <Coins className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[11px] uppercase font-semibold text-slate-400">Currency:</span>
            <select
              value={currentCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="bg-transparent font-bold text-xs text-white focus:outline-none cursor-pointer pr-1"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            Set Budget
          </button>

          <button
            onClick={handleOpenAddExpense}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Active Budgets Carousel / Grid */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <div
              key={b.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: b.category_color || '#6366F1' }}
                  />
                  <span className="font-semibold text-white">{b.category_name}</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {b.percentage_used}% used
                </span>
              </div>

              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    b.percentage_used > 90
                      ? 'bg-rose-500'
                      : b.percentage_used > 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(b.percentage_used, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Spent: <b className="text-white">{formatCurrency(b.spent_display, currentCurrency)}</b>
                </span>
                <span>
                  Limit: <b className="text-white">{formatCurrency(b.limit_display, currentCurrency)}</b>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search merchant or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pl-3 border-l border-slate-800 text-xs text-slate-400">
            Filtered Total: <b className="text-white">{formatCurrency(totalSpent, currentCurrency)}</b>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Merchant</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white">
                      {exp.merchant_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium"
                        style={{
                          backgroundColor: `${exp.category_color || '#6366F1'}20`,
                          color: exp.category_color || '#818CF8',
                        }}
                      >
                        {exp.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{exp.transaction_date}</td>
                    <td className="py-3.5 px-4 capitalize text-slate-400">
                      {exp.payment_method.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 truncate max-w-xs">
                      {exp.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-white">
                      {formatCurrency(exp.amount_display, exp.currency || currentCurrency)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Financial Transaction"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {/* Currency Option */}
            <div className="col-span-1">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Currency
              </label>
              <select
                value={expenseCurrency}
                onChange={(e) => setExpenseCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Amount ({getCurrencySymbol(expenseCurrency)})
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  {getCurrencySymbol(expenseCurrency)}
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="45.50"
                  className="w-full pl-8 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Merchant / Counterparty
            </label>
            <input
              type="text"
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Whole Foods / Amazon / Local Cafe"
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="upi">UPI / Instant Pay</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tax deductible, recurring subscription, etc."
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
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
              {submitting ? 'Saving...' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Set Budget Modal */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title="Configure Monthly Category Budget"
      >
        <form onSubmit={handleCreateBudget} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={budgetCategory}
              onChange={(e) => setBudgetCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Monthly Limit ({getCurrencySymbol(currentCurrency)})
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                {getCurrencySymbol(currentCurrency)}
              </div>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                placeholder="500"
                className="w-full pl-8 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Period Start
              </label>
              <input
                type="date"
                required
                value={budgetStart}
                onChange={(e) => setBudgetStart(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Period End
              </label>
              <input
                type="date"
                required
                value={budgetEnd}
                onChange={(e) => setBudgetEnd(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Set Budget Limit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
