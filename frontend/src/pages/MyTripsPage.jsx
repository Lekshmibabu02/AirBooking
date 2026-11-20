import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Plane, 
  MapPin, 
  Radio, 
  Printer, 
  XCircle, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { LiveTrackerModal } from '../components/LiveTrackerModal';

export const MyTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, CONFIRMED, CANCELLED
  const [trackingFlight, setTrackingFlight] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getMyTrips();
      setTrips(data);
    } catch (err) {
      console.error("Trips error:", err);
      setError("Failed to load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancelLoading(true);
    try {
      await bookingService.cancelBooking(cancelModalBooking.id, cancelReason);
      setCancelModalBooking(null);
      setCancelReason('');
      await fetchTrips();
    } catch (err) {
      console.error("Cancel error:", err);
      alert(err.response?.data?.message || "Could not cancel booking.");
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    if (activeTab === 'CONFIRMED') return trip.booking_status === 'CONFIRMED';
    if (activeTab === 'CANCELLED') return trip.booking_status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            My Trips & Reservations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your scheduled flights, download electronic boarding passes, and track live radar telemetry.
          </p>
        </div>

        <Link
          to="/flights"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition-all self-start"
        >
          <Plane className="w-4 h-4" />
          <span>Book a New Flight</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {[
          { key: 'ALL', label: `All Bookings (${trips.length})` },
          { key: 'CONFIRMED', label: `Confirmed (${trips.filter(t => t.booking_status === 'CONFIRMED').length})` },
          { key: 'CANCELLED', label: `Cancelled (${trips.filter(t => t.booking_status === 'CANCELLED').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trips Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Retrieving customer reservations...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h4 className="text-base font-bold text-rose-800">{error}</h4>
          <button
            onClick={fetchTrips}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No trips found in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any bookings matching this filter. Browse our scheduled flights and plan your next journey!
          </p>
          <Link
            to="/flights"
            className="inline-block px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-colors"
          >
            Explore Routes
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTrips.map((trip) => {
            const isCancelled = trip.booking_status === 'CANCELLED';
            const flight = trip.flight;

            return (
              <div
                key={trip.id}
                className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden ${
                  isCancelled
                    ? 'border-slate-200 opacity-75'
                    : 'border-slate-200 hover:border-brand-300'
                }`}
              >
                {/* Trip Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-500">Booking Reference:</span>
                    <span className="font-mono font-extrabold text-sm text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {trip.booking_reference}
                    </span>
                    <span className="text-slate-400">
                      Booked on {new Date(trip.booking_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      isCancelled
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {trip.booking_status}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[11px] font-semibold">
                      Payment: {trip.payment_status}
                    </span>
                  </div>
                </div>

                {/* Trip Body */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Airline & Route */}
                    <div className="lg:col-span-8 space-y-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900">{flight.airline_name}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-slate-600 font-semibold">Flight {flight.flight_number}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-brand-600 font-bold">{trip.seat_class} Class</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-black text-slate-900">{flight.departure_code}</p>
                          <p className="text-xs text-slate-500">{flight.departure_city || flight.departure_airport}</p>
                          <p className="text-xs font-bold text-brand-700 mt-1">
                            {new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(flight.departure_time).toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
                          </p>
                        </div>

                        <div className="flex-1 px-8 text-center">
                          <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                            {flight.duration_display || 'Direct'}
                          </span>
                          <div className="w-full border-t border-slate-200 border-dashed relative">
                            <Plane className="w-4 h-4 text-brand-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white" />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block mt-1">
                            Aircraft: {flight.aircraft_type || 'B737'}
                          </span>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-900">{flight.arrival_code}</p>
                          <p className="text-xs text-slate-500">{flight.arrival_city || flight.arrival_airport}</p>
                          <p className="text-xs font-bold text-brand-700 mt-1">
                            {new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(flight.arrival_time).toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
                          </p>
                        </div>
                      </div>

                      {/* Passenger Seats Badge */}
                      <div className="pt-2 flex flex-wrap gap-2 text-xs">
                        {trip.passengers?.map((p, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium">
                            {p.full_name} (Seat {p.seat_number || 'Unassigned'})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Fare and Actions */}
                    <div className="lg:col-span-4 lg:border-l lg:border-slate-100 lg:pl-6 space-y-4">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Paid</span>
                        <p className="text-2xl font-black text-slate-900 font-mono">${trip.total_price}</p>
                        <span className="text-[11px] text-slate-400">
                          {trip.number_of_passengers} passenger{trip.number_of_passengers > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Link
                          to={`/booking-confirmation/${trip.booking_reference}`}
                          className="w-full py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View & Print E-Ticket</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setTrackingFlight(flight)}
                          className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>Track Flight Radar</span>
                        </button>

                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => setCancelModalBooking(trip)}
                            className="w-full py-2 px-3 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold transition-colors"
                          >
                            Cancel Reservation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Radar Modal */}
      {trackingFlight && (
        <LiveTrackerModal
          flight={trackingFlight}
          onClose={() => setTrackingFlight(null)}
        />
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Cancel Flight Reservation?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Booking <strong>{cancelModalBooking.booking_reference}</strong> ({cancelModalBooking.flight.flight_number}) will be cancelled. Your ${cancelModalBooking.total_price} payment will be marked as Refunded, and seats will be released back to inventory.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for cancellation (optional):
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="w-1/2 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center space-x-1"
              >
                {cancelLoading ? (
                  <span>Cancelling...</span>
                ) : (
                  <span>Confirm Cancel</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
