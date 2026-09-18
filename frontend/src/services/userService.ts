import { api } from './api';

export const userService = {
  getPreferences: async () => {
    const res = await api.get('/users/preferences/');
    return res.data;
  },

  updatePreferences: async (payload: any) => {
    const res = await api.put('/users/preferences/', payload);
    return res.data;
  },

  exportData: async () => {
    const res = await api.get('/users/export/');
    return res.data;
  },

  updateProfile: async (payload: { first_name?: string; last_name?: string; avatar_url?: string }) => {
    const res = await api.put('/auth/me/', payload);
    return res.data;
  },
};
