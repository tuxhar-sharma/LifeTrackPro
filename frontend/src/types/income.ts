export type StreamType = 'salary' | 'freelance' | 'business' | 'investment' | 'rental' | 'other';
export type RecurrenceInterval = 'none' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface IncomeSource {
  id: string;
  name: string;
  stream_type: StreamType;
  color_hex: string;
  icon: string;
  is_active: boolean;
  created_at?: string;
}

export interface Income {
  id: string;
  source?: string;
  source_details?: IncomeSource;
  amount: number;
  amount_cents: number;
  currency: string;
  amount_base_currency_cents: number;
  received_date: string;
  is_recurring: boolean;
  recurrence_interval: RecurrenceInterval;
  payer_name: string;
  notes: string;
  created_at?: string;
}

export interface IncomeSourceBreakdown {
  source_id: string | null;
  source_name: string;
  source_color: string;
  source_icon: string;
  stream_type: StreamType;
  total_cents: number;
  total: number;
  percentage: number;
}

export interface IncomeSummary {
  period: {
    start_date: string;
    end_date: string;
  };
  total_cents: number;
  total: number;
  count: number;
  recurring_total_cents: number;
  recurring_total: number;
  source_breakdown: IncomeSourceBreakdown[];
  recent_incomes: Income[];
}
