import { api } from './api';
import type { Habit, HabitStats, CreateHabitPayload } from '../types/habits';

export const habitService = {
  async getHabits(dateStr?: string): Promise<Habit[]> {
    const response = await api.get('/habits/', {
      params: dateStr ? { date: dateStr } : undefined,
    });
    return response.data.results || response.data;
  },

  async createHabit(data: CreateHabitPayload): Promise<Habit> {
    const response = await api.post('/habits/', data);
    return response.data;
  },

  async toggleHabit(habitId: string, dateStr?: string, loggedValue?: number): Promise<{ completed: boolean; habit: Habit }> {
    const response = await api.post(`/habits/${habitId}/toggle/`, {
      date: dateStr,
      logged_value: loggedValue,
    });
    return response.data;
  },

  async deleteHabit(habitId: string): Promise<void> {
    await api.delete(`/habits/${habitId}/`);
  },

  async getStats(): Promise<HabitStats> {
    const response = await api.get('/habits/stats/');
    return response.data;
  },
};
