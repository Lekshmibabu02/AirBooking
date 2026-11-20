import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Plane, 
  User, 
  Calendar, 
  AlertCircle, 
  Lock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { bookingService } from '../services/bookingService';

export const BookingModal = ({ 
  flight, 
  initialPassengersCount = 1,
  initialClass = 'ECONOMY',
  onClose,
  currentUser
}) => {
  const navigate = useNavigate();

  const [passengersCount, setPassengersCount] = useState(initialPassengersCount);
  const [seatClass, setSeatClass] = useState(initialClass);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Passenger state array
  const [passengers, setPassengers] = useState(() => {
    return Array.from({ length: initialPassengersCount }, (_, idx) => ({
      full_name: idx === 0 && currentUser ? currentUser.full_name : '',
      age: 30,
      gender: 'MALE',
      passport_or_id: '',
      seat_number: `${14 + idx}${chr(65 + (idx % 6))}`,
    }));
  });

  function chr(code) {
    return String.fromCharCode(code);
  }

  // Handle passenger count change
  const handleCountChange = (newCount) => {
    const count = parseInt(newCount, 10);
    setPassengersCount(count);
    setPassengers((prev) => {
      if (count > prev.length) {
        const extra = Array.from({ length: count - prev.length }, (_, i) => ({
          full_name: '',
          age: 28,
          gender: 'MALE',
          passport_or_id: '',
          seat_number: `${15 + prev.length + i}${chr(65 + ((prev.length + i) % 6))}`,
        }));
        return [...prev, ...extra];
      } else {
        return prev.slice(0, count);
      }
    });
  };

  const handlePassengerFieldChange = (index, field, value) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Pricing calculation
  let classMultiplier = 1.0;
  if (seatClass === 'PREMIUM_ECONOMY') classMultiplier = 1.3;
  if (seatClass === 'BUSINESS') classMultiplier = 2.0;
  if (seatClass === 'FIRST') classMultiplier = 3.2;

  const baseFare = parseFloat(flight.ticket_price || 0);
  const unitFare = Math.round(baseFare * classMultiplier);
  const subtotal = unitFare * passengersCount;
  const taxes = Math.round(subtotal * 0.12);
  const finalTotal = subtotal + taxes;

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validations
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].full_name.trim()) {
        setErrorMessage(`Please enter the full name for Passenger #${i + 1}`);
        return;
      }
    }

    if (passengersCount > flight.available_seats) {
      setErrorMessage(`Only ${flight.available_seats} seats remaining on this flight.`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        flight_id: flight.id,
        number_of_passengers: passengersCount,
        seat_class: seatClass,
        payment_method: paymentMethod,
        passengers: passengers,
      };

      const res = await bookingService.createBooking(payload);
      if (res.success && res.booking) {
        onClose();
        navigate(`/booking-confirmation/${res.booking.booking_reference}`, {
          state: { booking: res.booking, justBooked: true },
        });
      }
    } catch (err) {
      console.error("Booking error:", err);
      const detail = err.response?.data?.detail || 
                     err.response?.data?.flight_id || 
                     err.response?.data?.number_of_passengers || 
                     err.response?.data?.message || 
                     "Failed to complete reservation. Please try again.";
      setErrorMessage(Array.isArray(detail) ? detail[0] : detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-sky-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-white">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Complete Flight Reservation</h3>
              <p className="text-xs text-sky-100">
                {flight.airline_name} • Flight {flight.flight_number} ({flight.departure_code} → {flight.arrival_code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmitBooking} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Cabin & Passenger Count Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Number of Passengers
              </label>
              <select
                value={passengersCount}
                onChange={(e) => handleCountChange(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} Passenger{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Cabin Class
              </label>
              <select
                value={seatClass}
                onChange={(e) => setSeatClass(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:ring-2 focus:ring-brand-500"
              >
                <option value="ECONOMY">Economy Class</option>
                <option value="PREMIUM_ECONOMY">Premium Economy (+30%)</option>
                <option value="BUSINESS">Business Class (+100%)</option>
                <option value="FIRST">First Class (+220%)</option>
              </select>
            </div>
          </div>

          {/* Passenger Information Inputs */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Passenger Information</span>
            </h4>

            <div className="space-y-3">
              {passengers.map((passenger, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-100 pb-2">
                    <span>Passenger #{index + 1}</span>
                    <span className="font-mono text-brand-600">Assigned Seat: {passenger.seat_number}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Full Name (as per Passport/ID) *
                      </label>
                      <input
                        type="text"
                        value={passenger.full_name}
                        onChange={(e) => handlePassengerFieldChange(index, 'full_name', e.target.value)}
                        placeholder="e.g. Alex Miller"
                        required
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={passenger.age}
                        onChange={(e) => handlePassengerFieldChange(index, 'age', parseInt(e.target.value) || 1)}
                        required
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Gender
                      </label>
                      <select
                        value={passenger.gender}
                        onChange={(e) => handlePassengerFieldChange(index, 'gender', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Simulation Section */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-sky-400" />
                <h4 className="text-sm font-bold tracking-wide">Simulated Payment Gateway</h4>
              </div>
              <span className="text-[11px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-mono">
                Test Mode • Instant Clearance
              </span>
            </div>

            {/* Payment Method Select */}
            <div className="grid grid-cols-3 gap-2">
              {['Credit Card', 'UPI / QR', 'Net Banking'].map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                    paymentMethod === method
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Simulated Card Fields */}
            {paymentMethod === 'Credit Card' && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
                    <span>Card Number</span>
                    <span>Visa / MasterCard</span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value="4242 •••• •••• 4242"
                    className="w-full bg-white/10 border border-white/10 rounded-lg p-2 font-mono text-white text-xs tracking-wider"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                    <input
                      type="text"
                      readOnly
                      value="Exp: 12/28"
                      className="bg-white/10 border border-white/10 rounded-lg p-2 text-slate-300 text-xs"
                    />
                    <input
                      type="text"
                      readOnly
                      value="CVV: 888"
                      className="bg-white/10 border border-white/10 rounded-lg p-2 text-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="border-t border-white/10 pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Base Fare ({passengersCount} × ${unitFare})</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Airport Fees & Taxes</span>
                <span>${taxes}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-1">
                <span>Total Amount</span>
                <span className="text-xl text-sky-400 font-mono">${finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl shadow-lg shadow-brand-600/30 flex items-center space-x-2 text-sm transition-all transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize & Pay ${finalTotal}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
