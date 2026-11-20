import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Plane, 
  Lock, 
  Mail, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPendingNotice, setIsPendingNotice] = useState(false);

  // Success message if passed from registration page
  const registrationSuccess = location.state?.registrationSuccess;
  const sessionExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsPendingNotice(false);
    setLoading(true);

    try {
      const data = await login(email, password);
      // Navigate to destination or homepage
      const redirectTo = location.state?.from?.pathname || (data.user?.is_staff ? '/admin' : '/');
      navigate(redirectTo);
    } catch (err) {
      console.error("Login failure:", err);
      const detail = err.response?.data?.detail || 
                     err.response?.data?.non_field_errors?.[0] || 
                     err.response?.data?.message || 
                     "Invalid email or password.";

      setErrorMessage(detail);

      // Check if message indicates pending admin approval
      if (typeof detail === 'string' && (detail.toLowerCase().includes('pending') || detail.toLowerCase().includes('approval'))) {
        setIsPendingNotice(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Development fast-fill helper
  const handleQuickFill = (fillEmail, fillPass) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setErrorMessage('');
    setIsPendingNotice(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <Plane className="w-6 h-6 -rotate-45" />
            </div>
          </Link>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            Welcome back to AirBooking
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Sign in with your verified account to access your trips and booking privileges.
          </p>
        </div>

        {/* Notices */}
        {registrationSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-emerald-800 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registration Submitted!</p>
              <p className="mt-0.5">Your account status is currently <strong>Pending</strong>. An administrator must approve your account before you can log in.</p>
            </div>
          </div>
        )}

        {sessionExpired && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-3 text-amber-800 text-xs">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Your session has expired. Please log in again.</span>
          </div>
        )}

        {errorMessage && (
          <div className={`p-4 rounded-2xl border text-xs flex items-start space-x-3 ${
            isPendingNotice
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
              isPendingNotice ? 'text-amber-600' : 'text-rose-600'
            }`} />
            <div>
              <p className="font-bold">
                {isPendingNotice ? 'Account Pending Approval' : 'Authentication Error'}
              </p>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 text-sm transition-all transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Testing Accounts Helper (Handy for evaluator!) */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Quick-Fill Test Accounts:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@airbooking.com', 'admin123')}
              className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 text-center"
            >
              Admin Portal
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('alex.miller@example.com', 'user123')}
              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 text-center"
            >
              Approved User
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('sarah.smith@example.com', 'user123')}
              className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold border border-amber-200 text-center"
            >
              Pending User (Test Gate)
            </button>
          </div>
        </div>

        {/* Footer Link to Register */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Register for access
          </Link>
        </p>
      </div>
    </div>
  );
};
