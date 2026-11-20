import React from 'react';
import { 
  Plane, 
  Clock, 
  MapPin, 
  Radio, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Armchair,
  ArrowRight
} from 'lucide-react';

export const FlightCard = ({ 
  flight, 
  onBook, 
  onOpenTracker, 
  selectedPassengers = 1,
  selectedClass = 'ECONOMY'
}) => {
  // Format departure & arrival dates & times
  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'ON_TIME':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>On-Time</span>
          </span>
        );
      case 'DELAYED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Delayed</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  // Price multiplier for selected class
  let classMultiplier = 1.0;
  if (selectedClass === 'PREMIUM_ECONOMY') classMultiplier = 1.3;
  if (selectedClass === 'BUSINESS') classMultiplier = 2.0;
  if (selectedClass === 'FIRST') classMultiplier = 3.2;

  const basePrice = parseFloat(flight.ticket_price || 0);
  const adjustedPrice = Math.round(basePrice * classMultiplier);
  const totalPrice = adjustedPrice * selectedPassengers;

  const isSoldOut = flight.available_seats < selectedPassengers;
  const isCancelled = flight.flight_status === 'CANCELLED';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-brand-300 transition-all shadow-sm hover:shadow-md overflow-hidden">
      {/* Airline Header Bar */}
      <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs tracking-wider">
            {flight.airline_code || flight.airline_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">
              {flight.airline_name}
            </h4>
            <span className="text-xs font-mono text-slate-500 font-medium">
              Flight {flight.flight_number} • {flight.aircraft_type || 'Boeing 737'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {renderStatusBadge(flight.flight_status)}
          <button
            type="button"
            onClick={() => onOpenTracker && onOpenTracker(flight)}
            title="Track Real-time Flight Radar"
            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors shadow-2xs"
          >
            <Radio className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
            <span>Live Radar</span>
          </button>
        </div>
      </div>

      {/* Flight Schedule & Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Times and Route Segment */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between">
              {/* Departure */}
              <div className="text-left min-w-[100px]">
                <p className="text-2xl font-black text-slate-900">
                  {formatTime(flight.departure_time)}
                </p>
                <p className="text-sm font-extrabold text-brand-700">
                  {flight.departure_code}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-[130px]">
                  {flight.departure_city || flight.departure_airport}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formatDate(flight.departure_time)}
                </p>
              </div>

              {/* Duration and Visual Flight Line */}
              <div className="flex-1 px-6 text-center">
                <span className="text-xs font-semibold text-slate-500 flex items-center justify-center space-x-1 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{flight.duration_display || 'Direct Flight'}</span>
                </span>
                
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t-2 border-slate-200 border-dashed"></div>
                  <div className="absolute w-7 h-7 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                    <Plane className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>

                <span className="block text-[11px] text-emerald-600 font-semibold mt-1">
                  Non-stop • Terminal {flight.terminal || 'T1'}
                </span>
              </div>

              {/* Arrival */}
              <div className="text-right min-w-[100px]">
                <p className="text-2xl font-black text-slate-900">
                  {formatTime(flight.arrival_time)}
                </p>
                <p className="text-sm font-extrabold text-brand-700">
                  {flight.arrival_code}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-[130px]">
                  {flight.arrival_city || flight.arrival_airport}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formatDate(flight.arrival_time)}
                </p>
              </div>
            </div>

            {/* Delay notice if delayed */}
            {flight.flight_status === 'DELAYED' && flight.delay_reason && (
              <div className="mt-4 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>Advisory:</strong> {flight.delay_reason}</span>
              </div>
            )}
          </div>

          {/* Pricing & Booking CTA */}
          <div className="lg:col-span-4 lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-between h-full space-y-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium block">
                {selectedPassengers > 1 ? `Total for ${selectedPassengers} passengers` : 'Fare per passenger'}
              </span>
              <div className="flex items-baseline justify-end space-x-1">
                <span className="text-xs font-semibold text-slate-500">USD</span>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  ${selectedPassengers > 1 ? totalPrice : adjustedPrice}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Taxes and airport charges included
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <Armchair className="w-3.5 h-3.5 text-slate-400" />
                  <span>Available Seats:</span>
                </span>
                <span className={`font-bold ${
                  flight.available_seats <= 10 ? 'text-amber-600' : 'text-slate-800'
                }`}>
                  {flight.available_seats} of {flight.total_seats}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onBook && onBook(flight)}
                disabled={isSoldOut || isCancelled}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
                  isCancelled
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : isSoldOut
                    ? 'bg-rose-100 text-rose-500 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20 hover:shadow-brand-600/40'
                }`}
              >
                <span>
                  {isCancelled
                    ? 'Flight Cancelled'
                    : isSoldOut
                    ? 'Fully Booked'
                    : 'Select Flight'}
                </span>
                {!isCancelled && !isSoldOut && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
