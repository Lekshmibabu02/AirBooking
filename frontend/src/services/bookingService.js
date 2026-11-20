import api from './api';

export const bookingService = {
  async createBooking(bookingData) {
    const res = await api.post('/bookings/', bookingData);
    return res.data;
  },

  async getMyTrips(status = '') {
    const res = await api.get('/bookings/', {
      params: status ? { status } : {},
    });
    return Array.isArray(res.data) ? res.data : (res.data.results || []);
  },

  async getBooking(idOrRef) {
    const res = await api.get(`/bookings/${idOrRef}/`);
    return res.data;
  },

  async cancelBooking(id, reason = '') {
    const res = await api.post(`/bookings/${id}/cancel/`, { reason });
    return res.data;
  },
};
