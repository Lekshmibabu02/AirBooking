import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, 
  ShieldCheck, 
  Clock, 
  Award, 
  Globe2, 
  Radio, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  MapPin
} from 'lucide-react';
import { FlightSearchBox } from '../components/FlightSearchBox';

export const HomePage = () => {
  const navigate = useNavigate();

  const featuredDestinations = [
    {
      city: 'London',
      country: 'United Kingdom',
      airport: 'LHR',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
      price: '$680',
      tag: 'Most Popular',
    },
    {
      city: 'Dubai',
      country: 'United Arab Emirates',
      airport: 'DXB',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
      price: '$740',
      tag: 'Trending',
    },
    {
      city: 'Tokyo',
      country: 'Japan',
      airport: 'HND',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
      price: '$895',
      tag: 'Direct Route',
    },
    {
      city: 'Paris',
      country: 'France',
      airport: 'CDG',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
      price: '$780',
      tag: 'Non-stop',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 text-white overflow-hidden py-16 lg:py-24">
        {/* Subtle grid pattern & glow */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold tracking-wide uppercase mb-4 animate-in fade-in slide-in-from-bottom-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Flight Booking & Radar</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
              Fly Anywhere. Track in <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-white bg-clip-text text-transparent">Real Time</span>.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Explore global domestic and international routes, enjoy guaranteed seat reservations, simulated instant checkout, and live ADS-B satellite telemetry.
            </p>
          </div>

          {/* Flight Search Widget in Hero */}
          <div className="max-w-5xl mx-auto">
            <FlightSearchBox />
          </div>

          {/* Quick Value Highlights */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
              <p className="text-2xl font-black text-brand-400">100%</p>
              <p className="text-xs text-slate-300">Live Seat Availability</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
              <p className="text-2xl font-black text-sky-400">&lt; 30s</p>
              <p className="text-xs text-slate-300">Instant E-Ticket Delivery</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
              <p className="text-2xl font-black text-emerald-400">ADS-B</p>
              <p className="text-xs text-slate-300">OpenSky Live Telemetry</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
              <p className="text-2xl font-black text-indigo-400">JWT</p>
              <p className="text-xs text-slate-300">Role-Based Secure API</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
              Popular Routes
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Global Destinations
            </h2>
          </div>
          <button
            onClick={() => navigate('/flights')}
            className="mt-3 sm:mt-0 inline-flex items-center space-x-1.5 text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            <span>View all scheduled flights</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDestinations.map((dest) => (
            <div
              key={dest.city}
              onClick={() => navigate(`/flights?arrival=${dest.airport}`)}
              className="group cursor-pointer rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur text-[11px] font-bold text-slate-900 rounded-full shadow">
                  {dest.tag}
                </span>
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="text-xl font-black">{dest.city}</h3>
                  <p className="text-xs text-slate-200 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-brand-400" />
                    <span>{dest.country} ({dest.airport})</span>
                  </p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Starting from</span>
                  <span className="text-lg font-black text-slate-900">{dest.price}</span>
                </div>
                <span className="px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  Book Now
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose AirBooking */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
              Why AirBooking
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              A Superior Commercial Airline Experience
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Designed according to modern aviation engineering best practices and strict technical assignment specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                <Radio className="w-6 h-6 text-brand-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Real-Time ADS-B Radar</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Direct integration with OpenSky Network telemetry API. Track live aircraft altitude, velocity, coordinates, and transponder status in flight.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Overbooking Protection</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Atomic database row locking with <code className="text-xs bg-slate-100 p-1 rounded font-mono">select_for_update()</code> prevents duplicate bookings and guarantees seat inventory consistency.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Admin Approval & Celery</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Enterprise user verification workflow. Once administrator approves an applicant, Celery background workers automatically dispatch verified email notifications.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
