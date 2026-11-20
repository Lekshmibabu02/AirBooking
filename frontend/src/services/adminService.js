import api from './api';

export const adminService = {
  async getStats() {
    const res = await api.get('/admin/stats/');
    return res.data;
  },

  async getPendingUsers() {
    const res = await api.get('/admin/users/pending/');
    return Array.isArray(res.data) ? res.data : (res.data.results || []);
  },

  async getAllUsers(params = {}) {
    const res = await api.get('/admin/users/', { params });
    return Array.isArray(res.data) ? res.data : (res.data.results || []);
  },

  async approveUser(id) {
    const res = await api.post(`/admin/users/${id}/approve/`);
    return res.data;
  },

  async rejectUser(id, reason = '') {
    const res = await api.post(`/admin/users/${id}/reject/`, { reason });
    return res.data;
  },

  async getFlights(params = {}) {
    const res = await api.get('/admin/flights/', { params });
    return Array.isArray(res.data) ? res.data : (res.data.results || []);
  },

  async createFlight(flightData) {
    const res = await api.post('/admin/flights/', flightData);
    return res.data;
  },

  async updateFlight(id, flightData) {
    const res = await api.put(`/admin/flights/${id}/`, flightData);
    return res.data;
  },

  async deleteFlight(id) {
    const res = await api.delete(`/admin/flights/${id}/`);
    return res.data;
  },

  async updateFlightStatus(id, statusData) {
    const res = await api.put(`/admin/flights/${id}/status/`, statusData);
    return res.data;
  },

  async getBookings() {
    const res = await api.get('/admin/bookings/');
    return Array.isArray(res.data) ? res.data : (res.data.results || []);
  },
};
