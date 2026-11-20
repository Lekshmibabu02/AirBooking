import React from 'react';
import { Plane, ShieldCheck, Mail, Phone, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Plane className="w-4 h-4 -rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                AirBooking
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AirBooking is an enterprise-grade commercial flight reservation, seat allocation, and live ADS-B telemetry system designed for global travelers and fleet managers.
            </p>
            <div className="flex items-center space-x-2 text-xs text-brand-400">
              <Award className="w-4 h-4" />
              <span>YUAI Soft Solutions Assignment Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Explore Routes
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/flights?departure=JFK&arrival=LHR" className="hover:text-white transition-colors">New York (JFK) → London (LHR)</a></li>
              <li><a href="/flights?departure=DXB&arrival=SIN" className="hover:text-white transition-colors">Dubai (DXB) → Singapore (SIN)</a></li>
              <li><a href="/flights?departure=DEL&arrival=BOM" className="hover:text-white transition-colors">New Delhi (DEL) → Mumbai (BOM)</a></li>
              <li><a href="/flights?departure=SFO&arrival=HND" className="hover:text-white transition-colors">San Francisco (SFO) → Tokyo (HND)</a></li>
            </ul>
          </div>

          {/* Platform Security */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Architecture & Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>JWT Authentication & RBAC</span>
              </li>
              <li>Atomic DB Row Locking (Select-For-Update)</li>
              <li>Celery & Redis Asynchronous Mail Workers</li>
              <li>OpenSky Network ADS-B Telemetry Integration</li>
              <li>Simulated Payment Gateway</li>
            </ul>
          </div>

          {/* Support / Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Contact & Evaluation
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>support@airbooking.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>+1 (800) 555-AIR-BOOK</span>
              </div>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-[11px] font-mono">
                  Stack: Django 5 + React 18 + SimpleJWT
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; 2026 AirBooking Inc. Developed for YUAI Soft Solutions Pvt. Ltd. Python Full Stack Assessment.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Carriage</span>
            <span>API Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
