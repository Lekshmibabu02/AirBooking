import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Search, 
  Plane, 
  Gauge, 
  Compass, 
  Globe, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { flightService } from '../services/flightService';

export const LiveTrackerPage = () => {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadFlights = async () => {
      try {
        const res = await flightService.searchFlights({});
        setFlights(res.flights);
        if (res.flights.length > 0) {
          setSelectedFlight(res.flights[0]);
        }
      } catch (err) {
        console.error("Flights load error:", err);
      } finally {
        setLoadingFlights(false);
      }
    };
    loadFlights();
  }, []);

  useEffect(() => {
    if (selectedFlight) {
      const fetchTelemetry = async () => {
        setLoadingTelemetry(true);
        try {
          const data = await flightService.getRealtimeStatus(selectedFlight.id);
          setTelemetry(data);
        } catch (err) {
          console.error("Telemetry error:", err);
        } finally {
          setLoadingTelemetry(false);
        }
      };
      fetchTelemetry();
    }
  }, [selectedFlight]);

  const filteredFlights = flights.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.flight_number.toLowerCase().includes(q) ||
      f.airline_name.toLowerCase().includes(q) ||
      f.departure_code.toLowerCase().includes(q) ||
      f.arrival_code.toLowerCase().includes(q)
    );
  });

  const isLive = telemetry?.source === 'LIVE_API';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>OpenSky Network & AirLabs ADS-B Telemetry</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Live Global Flight Radar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track active transponders, true airspeed, barometric altitude, and flight paths in real time.
          </p>
        </div>
      </div>

      {/* Main Grid: Left selector & Right cockpit telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Flight Selector */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by flight # or route..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="max-h-[550px] overflow-y-auto space-y-2">
            {loadingFlights ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading flight manifest...</div>
            ) : filteredFlights.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No matching aircraft found.</div>
            ) : (
              filteredFlights.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFlight(f)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedFlight?.id === f.id
                      ? 'bg-brand-50/80 border-brand-500 shadow-sm'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-900">{f.flight_number}</span>
                    <span className="font-semibold text-brand-700">{f.airline_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>{f.departure_code} → {f.arrival_code}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      f.flight_status === 'ON_TIME'
                        ? 'bg-emerald-100 text-emerald-800'
                        : f.flight_status === 'DELAYED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {f.flight_status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Cockpit Radar Console */}
        <div className="lg:col-span-8 bg-slate-950 text-white rounded-3xl border border-slate-800 p-6 lg:p-8 shadow-2xl space-y-6">
          {selectedFlight ? (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    isLive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    <Plane className="w-6 h-6 -rotate-45" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{selectedFlight.flight_number}</h2>
                    <p className="text-xs text-slate-400">
                      {selectedFlight.airline_name} • {selectedFlight.aircraft_type || 'Boeing 777-300ER'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400 block">Flight Corridor</span>
                  <span className="text-base font-extrabold text-sky-400">
                    {selectedFlight.departure_code} → {selectedFlight.arrival_code}
                  </span>
                </div>
              </div>

              {/* Distinction Banner */}
              {telemetry && (
                <div className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
                  isLive
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                }`}>
                  {isLive ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isLive ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                      }`}>
                        {telemetry.source === 'LIVE_API' ? 'LIVE ADS-B STREAM' : 'DEMONSTRATION SIMULATOR'}
                      </span>
                      <span className="text-xs font-mono opacity-80">
                        Provider: {telemetry.provider}
                      </span>
                    </div>
                    <p className="text-xs mt-1.5 opacity-90 leading-relaxed">
                      {telemetry.disclaimer}
                    </p>
                  </div>
                </div>
              )}

              {/* Gauges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                    Altitude
                  </span>
                  <p className="text-2xl font-black font-mono text-white">
                    {telemetry?.altitude_ft ? `${telemetry.altitude_ft.toLocaleString()} ft` : '34,000 ft'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">Flight Level FL340</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                    True Airspeed
                  </span>
                  <p className="text-2xl font-black font-mono text-white">
                    {telemetry?.speed_kmh ? `${telemetry.speed_kmh} km/h` : '850 km/h'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">Mach 0.82</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                    Callsign
                  </span>
                  <p className="text-2xl font-black font-mono text-white">
                    {telemetry?.callsign || selectedFlight.flight_number.replace('-', '')}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">ADS-B Mode S</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                    Airspace
                  </span>
                  <p className="text-lg font-black font-mono text-white truncate">
                    {telemetry?.country || 'International'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">Sector Controller</span>
                </div>
              </div>

              {/* Simulated Map / Waypoints Radar Panel */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>Coordinates: {telemetry?.latitude || '40.6413'}° N, {telemetry?.longitude || '-73.7781'}° W</span>
                  </div>
                  <span className="font-mono text-[11px]">Route Status: Airborne / En Route</span>
                </div>

                {/* Radar Route Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{selectedFlight.departure_code} ({selectedFlight.departure_city || 'Origin'})</span>
                    <span className="text-sky-400 font-mono">68% En Route</span>
                    <span>{selectedFlight.arrival_code} ({selectedFlight.arrival_city || 'Dest'})</span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-gradient-to-r from-brand-500 via-sky-400 to-emerald-400 rounded-full w-[68%]"></div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-slate-500">
              Select a flight from the left list to begin telemetry stream.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
