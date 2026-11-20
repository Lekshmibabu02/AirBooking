import React, { useState, useEffect } from 'react';
import { 
  X, 
  Radio, 
  RefreshCw, 
  Plane, 
  Compass, 
  Gauge, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';
import { flightService } from '../services/flightService';

export const LiveTrackerModal = ({ flight, onClose }) => {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await flightService.getRealtimeStatus(flight.id);
      setTelemetry(data);
    } catch (err) {
      console.error("Telemetry fetch error:", err);
      setError("Unable to establish link with flight telemetry server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (flight?.id) {
      fetchStatus();
    }
  }, [flight?.id]);

  const isLive = telemetry?.source === 'LIVE_API';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isLive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Live Radar: {flight.flight_number}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {flight.airline_name}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {flight.departure_code} ({flight.departure_city || flight.departure_airport}) → {flight.arrival_code} ({flight.arrival_city || flight.arrival_airport})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchStatus}
              disabled={loading}
              title="Refresh radar signal"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-slate-400 font-mono animate-pulse">
                Pinging ADS-B satellite receivers & transponders...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-sm flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          ) : telemetry ? (
            <div className="space-y-6">
              {/* Prominent Distinction: Live vs Demonstration */}
              <div className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
                isLive
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
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
                      {telemetry.source === 'LIVE_API' ? 'LIVE RADAR FEED' : 'DEMONSTRATION SIMULATOR'}
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

              {/* Cockpit Gauge Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Altitude */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="flex items-center justify-center text-slate-400 mb-1">
                    <Gauge className="w-4 h-4 mr-1 text-sky-400" />
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Altitude</span>
                  </div>
                  <p className="text-xl font-mono font-bold text-white">
                    {telemetry.altitude_ft ? `${telemetry.altitude_ft.toLocaleString()} ft` : '32,000 ft'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">Barometric Sensor</span>
                </div>

                {/* Ground Speed */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="flex items-center justify-center text-slate-400 mb-1">
                    <Plane className="w-4 h-4 mr-1 text-emerald-400" />
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Speed</span>
                  </div>
                  <p className="text-xl font-mono font-bold text-white">
                    {telemetry.speed_kmh ? `${telemetry.speed_kmh} km/h` : '840 km/h'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">Ground Velocity</span>
                </div>

                {/* Flight Status */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="flex items-center justify-center text-slate-400 mb-1">
                    <Radio className="w-4 h-4 mr-1 text-brand-400" />
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Status</span>
                  </div>
                  <p className="text-base font-bold text-white uppercase truncate">
                    {telemetry.status || flight.flight_status}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">Active State</span>
                </div>

                {/* Country / Airspace */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="flex items-center justify-center text-slate-400 mb-1">
                    <Globe className="w-4 h-4 mr-1 text-indigo-400" />
                    <span className="text-[11px] uppercase tracking-wider font-semibold">Airspace</span>
                  </div>
                  <p className="text-sm font-bold text-white truncate">
                    {telemetry.country || 'International'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">FIR Sector</span>
                </div>
              </div>

              {/* Coordinate Telemetry */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>
                    Lat: <strong className="text-white">{telemetry.latitude || '28.5562'}° N</strong> • 
                    Lng: <strong className="text-white">{telemetry.longitude || '77.1000'}° E</strong>
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Last telemetry sync: {new Date(telemetry.updated_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Close Radar View
          </button>
        </div>
      </div>
    </div>
  );
};
