import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlaneTakeoff, 
  PlaneLanding, 
  Calendar as CalendarIcon, 
  Users, 
  ArrowLeftRight, 
  Search,
  ChevronDown
} from 'lucide-react';

export const FlightSearchBox = ({ 
  initialValues = {}, 
  onSearch = null, 
  compact = false 
}) => {
  const navigate = useNavigate();

  const [tripType, setTripType] = useState('oneWay'); // oneWay or roundTrip
  const [departure, setDeparture] = useState(initialValues.departure || 'JFK');
  const [arrival, setArrival] = useState(initialValues.arrival || 'LHR');
  const [travelDate, setTravelDate] = useState(
    initialValues.date || new Date().toISOString().split('T')[0]
  );
  const [passengers, setPassengers] = useState(initialValues.passengers || 1);
  const [seatClass, setSeatClass] = useState(initialValues.seatClass || 'ECONOMY');

  const popularAirports = [
    { code: 'JFK', name: 'New York (JFK)', city: 'New York' },
    { code: 'LHR', name: 'London Heathrow (LHR)', city: 'London' },
    { code: 'DXB', name: 'Dubai Intl (DXB)', city: 'Dubai' },
    { code: 'SIN', name: 'Singapore Changi (SIN)', city: 'Singapore' },
    { code: 'DEL', name: 'New Delhi (DEL)', city: 'New Delhi' },
    { code: 'BOM', name: 'Mumbai (BOM)', city: 'Mumbai' },
    { code: 'SFO', name: 'San Francisco (SFO)', city: 'San Francisco' },
    { code: 'HND', name: 'Tokyo Haneda (HND)', city: 'Tokyo' },
    { code: 'CDG', name: 'Paris Charles de Gaulle (CDG)', city: 'Paris' },
    { code: 'FRA', name: 'Frankfurt (FRA)', city: 'Frankfurt' },
  ];

  const handleSwapAirports = () => {
    const temp = departure;
    setDeparture(arrival);
    setArrival(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams({
      departure: departure.trim(),
      arrival: arrival.trim(),
      date: travelDate,
      passengers: passengers.toString(),
      seatClass: seatClass,
    });

    if (onSearch) {
      onSearch({
        departure: departure.trim(),
        arrival: arrival.trim(),
        date: travelDate,
        passengers,
        seatClass,
      });
    } else {
      navigate(`/flights?${queryParams.toString()}`);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-slate-200/80 ${compact ? 'p-4' : 'p-6 lg:p-8'}`}>
      {/* Top Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
        <div className="flex items-center space-x-2 bg-slate-100/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTripType('oneWay')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tripType === 'oneWay'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            One-way
          </button>
          <button
            type="button"
            onClick={() => setTripType('roundTrip')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tripType === 'roundTrip'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Round-trip
          </button>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5">
            <span className="font-medium text-slate-500">Cabin:</span>
            <select
              value={seatClass}
              onChange={(e) => setSeatClass(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ECONOMY">Economy</option>
              <option value="PREMIUM_ECONOMY">Premium Economy</option>
              <option value="BUSINESS">Business Class</option>
              <option value="FIRST">First Class</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Departure Airport */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              From (Departure)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <PlaneTakeoff className="w-5 h-5 text-brand-600" />
              </div>
              <input
                type="text"
                value={departure}
                onChange={(e) => setDeparture(e.target.value.toUpperCase())}
                placeholder="e.g. JFK or New York"
                list="airports-list"
                required
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center -my-2 md:my-0">
            <button
              type="button"
              onClick={handleSwapAirports}
              title="Swap Departure and Arrival"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-transform hover:rotate-180 duration-200 shadow-sm"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Arrival Airport */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              To (Destination)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <PlaneLanding className="w-5 h-5 text-emerald-600" />
              </div>
              <input
                type="text"
                value={arrival}
                onChange={(e) => setArrival(e.target.value.toUpperCase())}
                placeholder="e.g. LHR or London"
                list="airports-list"
                required
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Travel Date */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Departure Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <CalendarIcon className="w-4 h-4 text-brand-600" />
              </div>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Passengers Count */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Passengers
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Users className="w-4 h-4 text-brand-600" />
              </div>
              <select
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value))}
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Adult' : 'Adults'}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Datalist for Autocomplete */}
        <datalist id="airports-list">
          {popularAirports.map((airport) => (
            <option key={airport.code} value={airport.code}>
              {airport.name}
            </option>
          ))}
        </datalist>

        {/* Submit Button Row */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Popular:</span>
            {['JFK → LHR', 'DXB → SIN', 'DEL → BOM', 'SFO → HND'].map((route) => {
              const [dep, arr] = route.split(' → ');
              return (
                <button
                  type="button"
                  key={route}
                  onClick={() => {
                    setDeparture(dep);
                    setArrival(arr);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[11px] transition-colors"
                >
                  {route}
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 hover:from-brand-700 hover:to-brand-900 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <Search className="w-4 h-4" />
            <span>Search Available Flights</span>
          </button>
        </div>
      </form>
    </div>
  );
};
