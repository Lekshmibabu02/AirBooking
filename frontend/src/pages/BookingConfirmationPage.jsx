import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Printer, 
  Plane, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  QrCode,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { bookingService } from '../services/bookingService';

export const BookingConfirmationPage = () => {
  const { ref } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fire confetti celebration if just booked!
    if (location.state?.justBooked) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }

    if (!booking && ref) {
      const fetchBooking = async () => {
        try {
          const data = await bookingService.getBooking(ref);
          setBooking(data);
        } catch (err) {
          console.error("Booking lookup error:", err);
          setError("Booking reference not found or unauthorized access.");
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [ref, booking, location.state]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading flight reservation...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-rose-100 rounded-3xl shadow-sm text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Reservation Not Found</h2>
        <p className="text-slate-600 mb-6">{error || "Unable to display ticket details."}</p>
        <Link
          to="/my-trips"
          className="inline-block px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl"
        >
          Go to My Trips
        </Link>
      </div>
    );
  }

  const { flight, passengers = [] } = booking;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Success Banner (hidden when printing) */}
      <div className="no-print bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Booking Confirmed & Guaranteed!
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Your e-ticket has been generated with verified seat allocation. A digital confirmation receipt has been saved to your account.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save E-Ticket</span>
          </button>
          <Link
            to="/my-trips"
            className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all"
          >
            View in My Trips
          </Link>
        </div>
      </div>

      {/* Printable Boarding Pass / E-Ticket */}
      <div className="printable-ticket bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-brand-800 via-brand-700 to-sky-600 p-6 sm:p-8 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-white">
              <Plane className="w-6 h-6 -rotate-45" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-sky-200">
                Official Electronic Ticket & Boarding Pass
              </span>
              <h2 className="text-2xl font-black tracking-tight">{flight.airline_name}</h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-sky-200 block">Booking Reference (PNR)</span>
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-white">
              {booking.booking_reference}
            </span>
          </div>
        </div>

        {/* Flight Route Banner */}
        <div className="p-6 sm:p-8 border-b border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between">
            {/* Origin */}
            <div>
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {flight.departure_code}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                {flight.departure_city || flight.departure_airport}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(flight.departure_time).toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="text-lg font-black text-brand-700 mt-0.5">
                {new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Flight Symbol */}
            <div className="text-center px-4">
              <span className="text-xs font-mono font-bold text-slate-400 block mb-1">
                Flight {flight.flight_number}
              </span>
              <div className="w-24 sm:w-40 border-t-2 border-brand-500 border-dashed relative">
                <Plane className="w-5 h-5 text-brand-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 block mt-1">
                {booking.seat_class} Class
              </span>
            </div>

            {/* Destination */}
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {flight.arrival_code}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                {flight.arrival_city || flight.arrival_airport}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(flight.arrival_time).toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="text-lg font-black text-brand-700 mt-0.5">
                {new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Flight Logistics Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Terminal</span>
            <span className="text-base font-bold text-slate-800">{flight.terminal || 'T1'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Boarding Gate</span>
            <span className="text-base font-bold text-slate-800">{flight.gate || 'G12'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Aircraft</span>
            <span className="text-base font-bold text-slate-800">{flight.aircraft_type || 'Boeing 737'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Payment Status</span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {booking.payment_status} ({booking.payment_method})
            </span>
          </div>
        </div>

        {/* Passenger Seat Allocation */}
        <div className="p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <User className="w-4 h-4 text-brand-600" />
            <span>Manifest & Seat Allocations</span>
          </h3>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {passengers.map((p, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between bg-white text-xs">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">{p.full_name}</p>
                  <p className="text-slate-500">
                    Age: {p.age} • Gender: {p.gender} {p.passport_or_id ? `• ID: ${p.passport_or_id}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Seat</span>
                  <span className="text-lg font-black font-mono text-brand-700 bg-brand-50 px-3 py-1 rounded-lg border border-brand-200">
                    {p.seat_number || 'Auto'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Footer / Barcode */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <QrCode className="w-12 h-12 text-slate-800" />
            <div>
              <p className="font-mono text-[11px] text-slate-800 font-bold">
                TXN: {booking.transaction_id || 'PAY-4892019'}
              </p>
              <p className="text-[11px]">Show this barcode at airport check-in & security counters.</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Fare Paid</span>
            <p className="text-2xl font-black text-slate-900 font-mono">${booking.total_price}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
