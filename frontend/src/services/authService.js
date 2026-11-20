import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register/', data);
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login/', { email, password });
    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('airbooking_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getCurrentUser() {
    const res = await api.get('/auth/me/');
    if (res.data) {
      localStorage.setItem('airbooking_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('airbooking_user');
  },

  getStoredUser() {
    const stored = localStorage.getItem('airbooking_user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
};
