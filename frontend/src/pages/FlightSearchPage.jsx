import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Filter, 
  SlidersHorizontal, 
  Plane, 
  Radio, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Search
} from 'lucide-react';
import { flightService } from '../services/flightService';
import { FlightSearchBox } from '../components/FlightSearchBox';
import { FlightCard } from '../components/FlightCard';
import { BookingModal } from '../components/BookingModal';
import { LiveTrackerModal } from '../components/LiveTrackerModal';
import { useAuth } from '../hooks/useAuth';

export const FlightSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active filters
  const [priceRange, setPriceRange] = useState(1500);
  const [selectedAirline, setSelectedAirline] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('departure_time');

  // Modals state
  const [bookingFlight, setBookingFlight] = useState(null);
  const [trackingFlight, setTrackingFlight] = useState(null);

  // Query values from URL
  const departure = searchParams.get('departure') || '';
  const arrival = searchParams.get('arrival') || '';
  const date = searchParams.get('date') || '';
  const passengers = parseInt(searchParams.get('passengers') || '1', 10);
  const seatClass = searchParams.get('seatClass') || 'ECONOMY';

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        departure,
        arrival,
        date,
        passengers,
        max_price: priceRange,
        sort_by: sortBy,
      };
      if (selectedAirline) params.airline = selectedAirline;
      if (statusFilter) params.status = statusFilter;

      const data = await flightService.searchFlights(params);
      setFlights(data.flights);
    } catch (err) {
      console.error("Flight search error:", err);
      setError("Failed to load flights. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [departure, arrival, date, passengers, priceRange, selectedAirline, statusFilter, sortBy]);

  const handleSearchBoxSubmit = (newCriteria) => {
    setSearchParams(newCriteria);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header Form */}
      <div>
        <FlightSearchBox
          compact={true}
          initialValues={{ departure, arrival, date, passengers, seatClass }}
          onSearch={handleSearchBoxSubmit}
        />
      </div>

      {/* Main Grid: Sidebar Filters & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              <span>Filters</span>
            </h3>
            {(selectedAirline || statusFilter || priceRange < 1500) && (
              <button
                onClick={() => {
                  setSelectedAirline('');
                  setStatusFilter('');
                  setPriceRange(1500);
                }}
                className="text-xs text-brand-600 hover:underline font-semibold"
              >
                Reset
              </button>
            )}
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
              <span>Maximum Price</span>
              <span className="text-brand-600 font-mono text-sm">${priceRange}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1500"
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(parseInt(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>$100</span>
              <span>$1500+</span>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Flight Status
            </label>
            <div className="space-y-1.5 text-xs">
              {[
                { label: 'All Statuses', val: '' },
                { label: 'On-Time Only', val: 'ON_TIME' },
                { label: 'Delayed', val: 'DELAYED' },
              ].map((item) => (
                <label key={item.val} className="flex items-center space-x-2 cursor-pointer text-slate-700 hover:text-slate-900">
                  <input
                    type="radio"
                    name="status"
                    checked={statusFilter === item.val}
                    onChange={() => setStatusFilter(item.val)}
                    className="accent-brand-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Airlines Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Airline
            </label>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Airlines</option>
              <option value="British Airways">British Airways</option>
              <option value="Emirates">Emirates</option>
              <option value="Air India">Air India</option>
              <option value="Delta Air Lines">Delta Air Lines</option>
              <option value="United Airlines">United Airlines</option>
              <option value="Air France">Air France</option>
              <option value="Singapore Airlines">Singapore Airlines</option>
              <option value="Lufthansa">Lufthansa</option>
            </select>
          </div>
        </aside>

        {/* Results Stream */}
        <main className="lg:col-span-9 space-y-4">
          {/* Top Sort / Counter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <p className="font-bold text-slate-700">
              Showing <span className="text-brand-600 font-extrabold">{flights.length}</span> flight{flights.length === 1 ? '' : 's'}
              {departure && ` departing ${departure}`}
              {arrival && ` to ${arrival}`}
            </p>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-medium">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="departure_time">Departure Time (Earliest)</option>
                <option value="ticket_price">Price (Lowest first)</option>
                <option value="-ticket_price">Price (Highest first)</option>
              </select>
            </div>
          </div>

          {/* List or Loading State */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-slate-600">
                Searching real-time airline schedules...
              </p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h4 className="text-base font-bold text-rose-800">{error}</h4>
              <button
                onClick={fetchFlights}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
              >
                Retry Search
              </button>
            </div>
          ) : flights.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Plane className="w-8 h-8 -rotate-45" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No flights matched your search criteria</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try broadening your departure or arrival airports, adjusting date filters, or resetting the price slider.
              </p>
              <button
                onClick={() => {
                  setSearchParams({});
                  setSelectedAirline('');
                  setStatusFilter('');
                  setPriceRange(1500);
                }}
                className="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-colors"
              >
                Clear All Search Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {flights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  selectedPassengers={passengers}
                  selectedClass={seatClass}
                  onBook={(f) => {
                    if (!isAuthenticated) {
                      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                    } else {
                      setBookingFlight(f);
                    }
                  }}
                  onOpenTracker={(f) => setTrackingFlight(f)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {bookingFlight && (
        <BookingModal
          flight={bookingFlight}
          initialPassengersCount={passengers}
          initialClass={seatClass}
          currentUser={user}
          onClose={() => setBookingFlight(null)}
        />
      )}

      {/* Live ADS-B Radar Modal */}
      {trackingFlight && (
        <LiveTrackerModal
          flight={trackingFlight}
          onClose={() => setTrackingFlight(null)}
        />
      )}
    </div>
  );
};
