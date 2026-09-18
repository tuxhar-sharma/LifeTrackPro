import { api } from './api';
import type { CashFlowData, FinancialHealthScore, HistoricalTrends } from '../types/analytics';

export const analyticsService = {
  getCashFlow: async (startDate?: string, endDate?: string): Promise<CashFlowData> => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const res = await api.get('/analytics/cashflow/', { params });
    return res.data;
  },

  getHealthScore: async (): Promise<FinancialHealthScore> => {
    const res = await api.get('/analytics/health-score/');
    return res.data;
  },

  getTrends: async (): Promise<HistoricalTrends> => {
    const res = await api.get('/analytics/trends/');
    return res.data;
  },
};
