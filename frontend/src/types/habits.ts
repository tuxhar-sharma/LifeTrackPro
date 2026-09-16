export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekdays' | 'target_days_per_week' | 'custom';
  target_days_per_week: number;
  type: 'boolean' | 'numeric';
  target_value: number;
  unit: string;
  preferred_time_window: 'morning' | 'afternoon' | 'evening' | 'anytime';
  color_hex: string;
  icon: string;
  current_streak: number;
  best_streak: number;
  is_archived: boolean;
  is_completed_today: boolean;
  today_logged_value: number | null;
  today_log_id: string | null;
  streak_tier: 'diamond' | 'gold' | 'silver' | 'bronze' | 'starting';
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit: string;
  log_date: string;
  logged_value: number;
  is_frozen: boolean;
  friction_rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHabitPayload {
  name: string;
  description?: string;
  frequency?: string;
  target_days_per_week?: number;
  type?: 'boolean' | 'numeric';
  target_value?: number;
  unit?: string;
  preferred_time_window?: string;
  color_hex?: string;
}

export interface DayProgress {
  date: string;
  day_name: string;
  completed_count: number;
  total_habits: number;
  rate: number;
}

export interface HabitStats {
  total_habits: number;
  today_completed_count: number;
  discipline_index: number;
  best_current_streak: number;
  weekly_grid: DayProgress[];
}
