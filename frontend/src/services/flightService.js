import api from './api';

export const flightService = {
  async searchFlights(params = {}) {
    const res = await api.get('/flights/', { params });
    // In case DRF paginates, normalize results array
    if (res.data && Array.isArray(res.data.results)) {
      return {
        flights: res.data.results,
        count: res.data.count,
        next: res.data.next,
        previous: res.data.previous,
      };
    }
    return {
      flights: Array.isArray(res.data) ? res.data : [],
      count: res.data?.length || 0,
    };
  },

  async getFlight(id) {
    const res = await api.get(`/flights/${id}/`);
    return res.data;
  },

  async getRealtimeStatus(id) {
    const res = await api.get(`/flights/${id}/realtime-status/`);
    return res.data;
  },
};
