export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color_hex: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  category: string | null;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
  amount_cents: number;
  amount_display: number;
  currency: string;
  amount_base_currency_cents: number;
  merchant_name: string;
  transaction_date: string;
  payment_method: string;
  is_recurring: boolean;
  is_tax_deductible: boolean;
  notes: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExpensePayload {
  category?: string;
  amount: string | number;
  merchant_name: string;
  transaction_date: string;
  payment_method?: string;
  is_recurring?: boolean;
  is_tax_deductible?: boolean;
  notes?: string;
}

export interface Budget {
  id: string;
  category: string;
  category_name?: string;
  category_color?: string;
  limit_cents: number;
  limit_display: number;
  period_start: string;
  period_end: string;
  rollover_enabled: boolean;
  spent_cents: number;
  spent_display: number;
  remaining_cents: number;
  remaining_display: number;
  percentage_used: number;
}

export interface ExpenseCategoryBreakdown {
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  total_cents: number;
  total: number;
  percentage: number;
}

export interface ExpenseSummary {
  period: {
    start_date: string;
    end_date: string;
  };
  total_cents: number;
  total: number;
  count: number;
  category_breakdown: ExpenseCategoryBreakdown[];
  active_budgets: Budget[];
  recent_expenses: Expense[];
}
