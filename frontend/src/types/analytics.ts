export interface CashFlowData {
  period: {
    start_date: string;
    end_date: string;
  };
  total_income_cents: number;
  total_income: number;
  total_expense_cents: number;
  total_expense: number;
  net_savings_cents: number;
  net_savings: number;
  savings_rate: number;
  cash_flow_status: 'positive' | 'negative';
}

export interface FinancialHealthScore {
  score: number;
  grade: string;
  breakdown: {
    savings_score: number;
    max_savings_score: number;
    budget_score: number;
    max_budget_score: number;
    habit_score: number;
    max_habit_score: number;
  };
  metrics: {
    current_savings_rate: number;
    active_budgets_tracked: number;
    habits_tracked: number;
  };
  recommendation: string;
}

export interface HistoricalMonth {
  month_key: string;
  month_label: string;
  short_label: string;
  income_cents: number;
  income: number;
  expense_cents: number;
  expense: number;
  savings_cents: number;
  savings: number;
  savings_rate: number;
}

export interface HistoricalTrends {
  history: HistoricalMonth[];
}
