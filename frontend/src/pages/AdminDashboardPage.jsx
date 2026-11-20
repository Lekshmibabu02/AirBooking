import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Plane, 
  Calendar, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  Filter, 
  Search,
  RefreshCw,
  MailCheck,
  ShieldCheck
} from 'lucide-react';
import { adminService } from '../services/adminService';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('PENDING_USERS'); // PENDING_USERS, ALL_USERS, FLIGHTS, BOOKINGS, STATUS_MGMT
  const [loading, setLoading] = useState(true);

  // Tab Data States
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Flight Add/Edit Modal
  const [flightModalOpen, setFlightModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [flightFormData, setFlightFormData] = useState({
    flight_number: '',
    airline_name: '',
    airline_code: '',
    departure_airport: '',
    departure_code: '',
    departure_city: '',
    arrival_airport: '',
    arrival_code: '',
    arrival_city: '',
    departure_time: '',
    arrival_time: '',
    ticket_price: '500.00',
    total_seats: 180,
    available_seats: 180,
    flight_status: 'ON_TIME',
    delay_reason: '',
    aircraft_type: 'Boeing 737-800',
    terminal: 'T1',
    gate: 'G10',
  });

  // Action status feedback
  const [actionMessage, setActionMessage] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const statsData = await adminService.getStats();
      setStats(statsData);

      const [pendingRes, allUsersRes, flightsRes, bookingsRes] = await Promise.all([
        adminService.getPendingUsers(),
        adminService.getAllUsers(),
        adminService.getFlights(),
        adminService.getBookings(),
      ]);

      setPendingUsers(pendingRes);
      setAllUsers(allUsersRes);
      setFlights(flightsRes);
      setBookings(bookingsRes);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const showNotification = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // User Actions
  const handleApproveUser = async (id, email) => {
    try {
      await adminService.approveUser(id);
      showNotification(`User ${email} approved! Celery approval notification dispatched.`);
      fetchOverview();
    } catch (err) {
      showNotification(`Approval failed: ${err.message}`, 'error');
    }
  };

  const handleRejectUser = async (id, email) => {
    const reason = prompt(`Enter rejection reason for ${email}:`, "Documentation could not be verified");
    if (reason === null) return;
    try {
      await adminService.rejectUser(id, reason);
      showNotification(`User ${email} has been rejected.`, 'info');
      fetchOverview();
    } catch (err) {
      showNotification(`Rejection failed: ${err.message}`, 'error');
    }
  };

  // Flight Actions
  const handleOpenAddFlight = () => {
    setEditingFlight(null);
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowLater = new Date(now.getTime() + 30 * 60 * 60 * 1000);

    setFlightFormData({
      flight_number: 'AB-' + Math.floor(100 + Math.random() * 900),
      airline_name: 'AirBooking Airlines',
      airline_code: 'AB',
      departure_airport: 'John F. Kennedy Intl',
      departure_code: 'JFK',
      departure_city: 'New York',
      arrival_airport: 'Heathrow Airport',
      arrival_code: 'LHR',
      arrival_city: 'London',
      departure_time: tomorrow.toISOString().slice(0, 16),
      arrival_time: tomorrowLater.toISOString().slice(0, 16),
      ticket_price: '650.00',
      total_seats: 180,
      available_seats: 180,
      flight_status: 'ON_TIME',
      delay_reason: '',
      aircraft_type: 'Boeing 787 Dreamliner',
      terminal: 'T4',
      gate: 'B12',
    });
    setFlightModalOpen(true);
  };

  const handleOpenEditFlight = (flight) => {
    setEditingFlight(flight);
    setFlightFormData({
      flight_number: flight.flight_number,
      airline_name: flight.airline_name,
      airline_code: flight.airline_code || '',
      departure_airport: flight.departure_airport,
      departure_code: flight.departure_code,
      departure_city: flight.departure_city || '',
      arrival_airport: flight.arrival_airport,
      arrival_code: flight.arrival_code,
      arrival_city: flight.arrival_city || '',
      departure_time: flight.departure_time ? flight.departure_time.slice(0, 16) : '',
      arrival_time: flight.arrival_time ? flight.arrival_time.slice(0, 16) : '',
      ticket_price: flight.ticket_price,
      total_seats: flight.total_seats,
      available_seats: flight.available_seats,
      flight_status: flight.flight_status,
      delay_reason: flight.delay_reason || '',
      aircraft_type: flight.aircraft_type || '',
      terminal: flight.terminal || '',
      gate: flight.gate || '',
    });
    setFlightModalOpen(true);
  };

  const handleSaveFlight = async (e) => {
    e.preventDefault();
    try {
      if (editingFlight) {
        await adminService.updateFlight(editingFlight.id, flightFormData);
        showNotification(`Flight ${flightFormData.flight_number} updated successfully!`);
      } else {
        await adminService.createFlight(flightFormData);
        showNotification(`New flight ${flightFormData.flight_number} added to schedule!`);
      }
      setFlightModalOpen(false);
      fetchOverview();
    } catch (err) {
      console.error("Flight save error:", err);
      alert(err.response?.data ? JSON.stringify(err.response.data) : "Failed to save flight.");
    }
  };

  const handleDeleteFlight = async (id, flightNumber) => {
    if (!confirm(`Are you sure you want to delete flight ${flightNumber}?`)) return;
    try {
      await adminService.deleteFlight(id);
      showNotification(`Flight ${flightNumber} deleted.`);
      fetchOverview();
    } catch (err) {
      alert("Cannot delete flight with active bookings.");
    }
  };

  const handleQuickStatusChange = async (flightId, newStatus) => {
    let reason = '';
    if (newStatus === 'DELAYED') {
      reason = prompt("Enter delay advisory reason:", "Air Traffic Control congestion");
      if (reason === null) return;
    } else if (newStatus === 'CANCELLED') {
      reason = prompt("Enter cancellation advisory reason:", "Adverse weather forecast");
      if (reason === null) return;
    }

    try {
      await adminService.updateFlightStatus(flightId, {
        flight_status: newStatus,
        delay_reason: reason,
      });
      showNotification(`Flight status updated to ${newStatus}.`);
      fetchOverview();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Control Console</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            AirBooking Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time management of user approvals, flight inventory, passenger manifests, and revenue streams.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Floating Action Alert */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center space-x-3 shadow-md animate-in fade-in slide-in-from-top-2 ${
          actionMessage.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.users?.total || 0}</p>
          <span className="text-[10px] text-slate-400">Registered Accounts</span>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-700">{stats?.users?.pending || 0}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Awaiting Verification</span>
        </div>

        {/* Approved Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Approved</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{stats?.users?.approved || 0}</p>
          <span className="text-[10px] text-slate-400">Active Customers</span>
        </div>

        {/* Total Flights */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Flights</span>
            <Plane className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.flights?.total || 0}</p>
          <span className="text-[10px] text-slate-400">{stats?.flights?.on_time || 0} On-Time</span>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Bookings</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.bookings?.total || 0}</p>
          <span className="text-[10px] text-slate-400">{stats?.bookings?.confirmed || 0} Confirmed</span>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Revenue</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            ${stats?.revenue?.total ? stats.revenue.total.toLocaleString() : '0'}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Cleared Payments</span>
        </div>
      </div>

      {/* Navigation Tabs for Admin Sections */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'PENDING_USERS', label: `Pending Approvals (${pendingUsers.length})` },
          { key: 'FLIGHTS', label: `Flight Management (${flights.length})` },
          { key: 'BOOKINGS', label: `Passenger Bookings (${bookings.length})` },
          { key: 'ALL_USERS', label: `User Directory (${allUsers.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PENDING USERS (Approval Workflow) */}
      {activeTab === 'PENDING_USERS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Pending User Registrations</h3>
              <p className="text-xs text-slate-500">
                Approving an applicant will instantly enable their login ability and trigger an automated approval notification via Celery.
              </p>
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">All user accounts reviewed!</p>
              <p className="text-xs">There are no pending registrations waiting for admin approval.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Applicant Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Registered At</th>
                    <th className="p-3">Current Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-900">{u.full_name}</td>
                      <td className="p-3 font-mono text-slate-600">{u.email}</td>
                      <td className="p-3 text-slate-500">{u.phone_number || 'N/A'}</td>
                      <td className="p-3 text-slate-400">{new Date(u.date_joined).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                          Pending Approval
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleApproveUser(u.id, u.email)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs transition-colors"
                        >
                          Approve (Celery Mail)
                        </button>
                        <button
                          onClick={() => handleRejectUser(u.id, u.email)}
                          className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FLIGHT MANAGEMENT */}
      {activeTab === 'FLIGHTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">Scheduled Flight Inventory</h3>
              <p className="text-xs text-slate-500">
                Create new flights, edit routes and fares, manage seat allocations, and broadcast real-time flight status updates.
              </p>
            </div>
            <button
              onClick={handleOpenAddFlight}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Flight</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Flight #</th>
                  <th className="p-3">Airline</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Departure</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Seats (Avail/Total)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Quick Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flights.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-slate-900">{f.flight_number}</td>
                    <td className="p-3 font-semibold text-slate-800">{f.airline_name}</td>
                    <td className="p-3 text-brand-700 font-bold">
                      {f.departure_code} → {f.arrival_code}
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(f.departure_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                      {new Date(f.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-mono font-bold">${f.ticket_price}</td>
                    <td className="p-3">
                      <span className={`font-mono font-bold ${
                        f.available_seats <= 10 ? 'text-amber-600' : 'text-slate-800'
                      }`}>
                        {f.available_seats} / {f.total_seats}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.flight_status === 'ON_TIME'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.flight_status === 'DELAYED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {f.flight_status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => handleQuickStatusChange(f.id, 'ON_TIME')}
                        title="Set On-Time"
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold"
                      >
                        On-Time
                      </button>
                      <button
                        onClick={() => handleQuickStatusChange(f.id, 'DELAYED')}
                        title="Set Delayed"
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-[10px] font-bold"
                      >
                        Delay
                      </button>
                      <button
                        onClick={() => handleQuickStatusChange(f.id, 'CANCELLED')}
                        title="Set Cancelled"
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[10px] font-bold"
                      >
                        Cancel
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditFlight(f)}
                        className="p-1 text-slate-500 hover:text-brand-600"
                        title="Edit Flight"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFlight(f.id, f.flight_number)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete Flight"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PASSENGER BOOKINGS */}
      {activeTab === 'BOOKINGS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">All Confirmed Customer Bookings</h3>
            <p className="text-xs text-slate-500">
              Audit booking references, traveler details, seat classes, and financial transaction records.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Reference (PNR)</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Flight</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Passengers</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Booked Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-brand-700">{b.booking_reference}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{b.user?.full_name}</p>
                      <p className="text-slate-400 text-[11px] font-mono">{b.user?.email}</p>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {b.flight?.flight_number} ({b.flight?.airline_name})
                    </td>
                    <td className="p-3 text-slate-600 font-bold">
                      {b.flight?.departure_code} → {b.flight?.arrival_code}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold">{b.number_of_passengers} ({b.seat_class})</span>
                    </td>
                    <td className="p-3 font-mono font-black text-slate-900">${b.total_price}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {b.payment_status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.booking_status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {b.booking_status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {new Date(b.booking_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ALL USERS DIRECTORY */}
      {activeTab === 'ALL_USERS' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">User Directory</h3>
            <p className="text-xs text-slate-500">
              Overview of all registered accounts and their verification status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">{u.full_name}</td>
                    <td className="p-3 font-mono text-slate-600">{u.email}</td>
                    <td className="p-3 text-slate-500">{u.phone_number || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-600">
                        {u.is_superuser ? 'Superadmin' : u.is_staff ? 'Staff' : 'Customer'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{new Date(u.date_joined).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Flight Add / Edit Modal */}
      {flightModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-900">
              {editingFlight ? `Edit Flight: ${editingFlight.flight_number}` : 'Schedule New Flight'}
            </h3>

            <form onSubmit={handleSaveFlight} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flight Number *</label>
                  <input
                    type="text"
                    value={flightFormData.flight_number}
                    onChange={(e) => setFlightFormData({ ...flightFormData, flight_number: e.target.value.toUpperCase() })}
                    placeholder="e.g. BA-117"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Airline Name *</label>
                  <input
                    type="text"
                    value={flightFormData.airline_name}
                    onChange={(e) => setFlightFormData({ ...flightFormData, airline_name: e.target.value })}
                    placeholder="e.g. British Airways"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Route segment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-extrabold text-brand-700">Departure</span>
                  <input
                    type="text"
                    value={flightFormData.departure_code}
                    onChange={(e) => setFlightFormData({ ...flightFormData, departure_code: e.target.value.toUpperCase() })}
                    placeholder="Airport Code (e.g. JFK)"
                    required
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                  />
                  <input
                    type="text"
                    value={flightFormData.departure_airport}
                    onChange={(e) => setFlightFormData({ ...flightFormData, departure_airport: e.target.value })}
                    placeholder="Airport Full Name"
                    required
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={flightFormData.departure_city}
                    onChange={(e) => setFlightFormData({ ...flightFormData, departure_city: e.target.value })}
                    placeholder="City (e.g. New York)"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <div>
                    <label className="block font-semibold text-slate-500 mb-0.5">Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={flightFormData.departure_time}
                      onChange={(e) => setFlightFormData({ ...flightFormData, departure_time: e.target.value })}
                      required
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-extrabold text-emerald-700">Arrival</span>
                  <input
                    type="text"
                    value={flightFormData.arrival_code}
                    onChange={(e) => setFlightFormData({ ...flightFormData, arrival_code: e.target.value.toUpperCase() })}
                    placeholder="Airport Code (e.g. LHR)"
                    required
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                  />
                  <input
                    type="text"
                    value={flightFormData.arrival_airport}
                    onChange={(e) => setFlightFormData({ ...flightFormData, arrival_airport: e.target.value })}
                    placeholder="Airport Full Name"
                    required
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={flightFormData.arrival_city}
                    onChange={(e) => setFlightFormData({ ...flightFormData, arrival_city: e.target.value })}
                    placeholder="City (e.g. London)"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <div>
                    <label className="block font-semibold text-slate-500 mb-0.5">Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={flightFormData.arrival_time}
                      onChange={(e) => setFlightFormData({ ...flightFormData, arrival_time: e.target.value })}
                      required
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Price & Seats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ticket Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={flightFormData.ticket_price}
                    onChange={(e) => setFlightFormData({ ...flightFormData, ticket_price: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Seats *</label>
                  <input
                    type="number"
                    value={flightFormData.total_seats}
                    onChange={(e) => setFlightFormData({ ...flightFormData, total_seats: parseInt(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Seats *</label>
                  <input
                    type="number"
                    value={flightFormData.available_seats}
                    onChange={(e) => setFlightFormData({ ...flightFormData, available_seats: parseInt(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Flight status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flight Status</label>
                  <select
                    value={flightFormData.flight_status}
                    onChange={(e) => setFlightFormData({ ...flightFormData, flight_status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="ON_TIME">On-time</option>
                    <option value="DELAYED">Delayed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aircraft Type</label>
                  <input
                    type="text"
                    value={flightFormData.aircraft_type}
                    onChange={(e) => setFlightFormData({ ...flightFormData, aircraft_type: e.target.value })}
                    placeholder="e.g. Boeing 777-300ER"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFlightModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow"
                >
                  Save Flight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
