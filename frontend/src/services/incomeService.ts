import { api } from './api';
import type { Income, IncomeSource, IncomeSummary } from '../types/income';

export const incomeService = {
  getIncome: async (params?: {
    source?: string;
    stream_type?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    is_recurring?: boolean;
    page?: number;
  }): Promise<{ results: Income[]; count: number }> => {
    const res = await api.get('/income/', { params });
    if (res.data && Array.isArray(res.data.results)) {
      return res.data;
    }
    return { results: Array.isArray(res.data) ? res.data : [], count: 0 };
  },

  createIncome: async (payload: Partial<Income>): Promise<Income> => {
    const res = await api.post('/income/', payload);
    return res.data;
  },

  deleteIncome: async (id: string): Promise<void> => {
    await api.delete(`/income/${id}/`);
  },

  getSources: async (): Promise<IncomeSource[]> => {
    const res = await api.get('/income/sources/');
    return res.data.results || (Array.isArray(res.data) ? res.data : []);
  },

  createSource: async (payload: Partial<IncomeSource>): Promise<IncomeSource> => {
    const res = await api.post('/income/sources/', payload);
    return res.data;
  },

  getSummary: async (startDate?: string, endDate?: string): Promise<IncomeSummary> => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const res = await api.get('/income/summary/', { params });
    return res.data;
  },
};
