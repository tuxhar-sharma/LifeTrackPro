import { api } from './api';
import type {
  Expense,
  ExpenseCategory,
  Budget,
  ExpenseSummary,
  CreateExpensePayload
} from '../types/expenses';

export const expenseService = {
  async getCategories(): Promise<ExpenseCategory[]> {
    const response = await api.get('/expenses/categories/');
    return response.data.results || response.data;
  },

  async createCategory(data: { name: string; icon?: string; color_hex?: string }): Promise<ExpenseCategory> {
    const response = await api.post('/expenses/categories/', data);
    return response.data;
  },

  async getExpenses(params?: {
    category?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }): Promise<Expense[]> {
    const response = await api.get('/expenses/', { params });
    return response.data.results || response.data;
  },

  async createExpense(data: CreateExpensePayload): Promise<Expense> {
    const response = await api.post('/expenses/', data);
    return response.data;
  },

  async deleteExpense(id: string): Promise<void> {
    await api.delete(`/expenses/${id}/`);
  },

  async getBudgets(): Promise<Budget[]> {
    const response = await api.get('/expenses/budgets/');
    return response.data.results || response.data;
  },

  async createBudget(data: {
    category: string;
    limit: string | number;
    period_start: string;
    period_end: string;
  }): Promise<Budget> {
    const response = await api.post('/expenses/budgets/', data);
    return response.data;
  },

  async getSummary(params?: { start_date?: string; end_date?: string }): Promise<ExpenseSummary> {
    const response = await api.get('/expenses/summary/', { params });
    return response.data;
  },
};
