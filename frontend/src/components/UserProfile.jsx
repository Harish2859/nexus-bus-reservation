import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

/* ── tiny helpers ─────────────────────────────────────────────────────────── */
function StatPill({ value, label, color }) {
    return (
        <div className={`flex-1 rounded-2xl p-4 text-center ${color}`}>
            <p className="text-xl font-black text-slate-900">{value}</p>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mt-0.5">{label}</p>
        </div>
    );
}

function SideNavItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
            <span className="text-base">{icon}</span>
            {label}
        </button>
    );
}

/* ── ticket card ──────────────────────────────────────────────────────────── */
function BookingTicket({ b, onCancel }) {
    const isConfirmed = b.ticket_status === 'CONFIRMED';
    const depDate = new Date(b.departure_time);

    return (
        <div className={`bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
            isConfirmed ? 'border-slate-200' : 'border-red-200'
        }`}>
            {/* Top colour bar */}
            <div className={`h-1.5 w-full ${isConfirmed ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-red-400'}`} />

            <div className="p-5">
                {/* Row 1 — route + status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <div className="flex items-center gap-2 text-base font-extrabold text-slate-900 tracking-tight">
                            <span>{b.origin}</span>
                            <span className="text-slate-300 font-normal text-sm">→</span>
                            <span>{b.destination}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{b.bus_number} · {b.bus_type}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1.5 rounded-full border ${
                            isConfirmed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            {isConfirmed ? '✓ Confirmed' : '✕ Cancelled'}
                        </span>
                        {isConfirmed && (
                            <button
                                onClick={() => onCancel(b.booking_id)}
                                className="text-[11px] font-bold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white border border-red-200 px-2.5 py-1.5 rounded-full transition-all duration-150"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Divider with notch effect */}
                <div className="relative flex items-center gap-2 my-4">
                    <div className="flex-1 border-t border-dashed border-slate-200" />
                    <span className="text-slate-300 text-xs">✂</span>
                    <div className="flex-1 border-t border-dashed border-slate-200" />
                </div>

                {/* Row 2 — 4 data cells */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1">PNR</p>
                        <p className="text-xs font-mono font-black text-blue-600">{b.pnr_number}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1">Seats</p>
                        <p className="text-xs font-bold text-slate-800">
                            {b.seats?.map(s => s.replace('S', '')).join(', ') || '—'}
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1">Departure</p>
                        <p className="text-xs font-semibold text-slate-700">
                            {depDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                            {depDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1">Fare paid</p>
                        <p className="text-sm font-black text-slate-900">₹{parseFloat(b.total_amount).toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── main component ───────────────────────────────────────────────────────── */
export default function UserProfile({ onNavigateHome }) {
    const { user, token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bookings');
    const API_BASE = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/auth/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success) setBookings(data.bookings);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [token, API_BASE]);

    const handleCancelTicket = async (bookingId) => {
        if (!window.confirm('Cancel this booking? Your seats will be released immediately.')) return;
        try {
            const res = await fetch(`${API_BASE}/api/auth/cancel-booking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ bookingId })
            });
            const data = await res.json();
            if (data.success) {
                setBookings(prev => prev.map(b =>
                    b.booking_id === bookingId ? { ...b, ticket_status: 'CANCELLED' } : b
                ));
            } else {
                alert(data.message || 'Unable to cancel ticket.');
            }
        } catch (err) {
            console.error('Cancel error:', err);
        }
    };

    const confirmed  = bookings.filter(b => b.ticket_status === 'CONFIRMED');
    const cancelled  = bookings.filter(b => b.ticket_status !== 'CONFIRMED');
    const totalSpent = confirmed.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);

    const visibleBookings =
        activeTab === 'bookings'   ? bookings  :
        activeTab === 'confirmed'  ? confirmed :
        cancelled;

    const initials = user?.name
        ?.split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?';

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center gap-3 text-slate-400 text-sm">
            <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading your profile...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Page header band */}
            <div className="w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 h-36 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-indigo-400/20 blur-2xl" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-end pb-4 relative z-10">
                    <div>
                        <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">My Account</p>
                        <h1 className="text-2xl font-black text-white tracking-tight">Passenger Profile</h1>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ── LEFT SIDEBAR ── */}
                    <aside className="w-full lg:w-72 shrink-0 space-y-4">

                        {/* Avatar card */}
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            {/* Gradient strip */}
                            <div className="h-16 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                                <div className="absolute -bottom-8 left-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-black border-4 border-white shadow-lg">
                                        {initials}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-10 px-5 pb-5">
                                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{user?.name}</h2>
                                <p className="text-xs text-slate-500 mt-0.5 break-all">{user?.email}</p>
                                <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                                    🎫 Passenger
                                </span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Overview</p>
                            <div className="flex gap-2 mb-2">
                                <StatPill value={bookings.length}  label="Total"     color="bg-slate-50 border border-slate-100" />
                                <StatPill value={confirmed.length} label="Confirmed" color="bg-emerald-50 border border-emerald-100" />
                            </div>
                            <div className="flex gap-2">
                                <StatPill value={cancelled.length} label="Cancelled" color="bg-red-50 border border-red-100" />
                                <StatPill
                                    value={`₹${totalSpent.toLocaleString('en-IN')}`}
                                    label="Spent"
                                    color="bg-blue-50 border border-blue-100"
                                />
                            </div>
                        </div>

                        {/* Sidebar nav */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Navigation</p>
                            <SideNavItem icon="🎫" label="All Bookings"      active={activeTab === 'bookings'}  onClick={() => setActiveTab('bookings')} />
                            <SideNavItem icon="✅" label="Confirmed"         active={activeTab === 'confirmed'} onClick={() => setActiveTab('confirmed')} />
                            <SideNavItem icon="❌" label="Cancelled"         active={activeTab === 'cancelled'} onClick={() => setActiveTab('cancelled')} />
                        </div>

                        {/* Account info card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Details</p>
                            {[
                                { label: 'Full Name',     value: user?.name },
                                { label: 'Email',         value: user?.email },
                                { label: 'Account Type',  value: 'Passenger' },
                                { label: 'Member Since',  value: 'NexusBus Platform' },
                            ].map(row => (
                                <div key={row.label} className="flex flex-col gap-0.5">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">{row.label}</span>
                                    <span className="text-xs font-semibold text-slate-800 break-all">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* ── RIGHT MAIN AREA ── */}
                    <div className="flex-1 min-w-0">

                        {/* Section header */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                                    {activeTab === 'bookings'  ? 'All Bookings'  :
                                     activeTab === 'confirmed' ? 'Confirmed Tickets' : 'Cancelled Tickets'}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {visibleBookings.length} ticket{visibleBookings.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Tab pills — mobile friendly */}
                            <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-sm">
                                {[
                                    { key: 'bookings',  label: 'All' },
                                    { key: 'confirmed', label: 'Confirmed' },
                                    { key: 'cancelled', label: 'Cancelled' },
                                ].map(t => (
                                    <button
                                        key={t.key}
                                        onClick={() => setActiveTab(t.key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            activeTab === t.key
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Booking list */}
                        {visibleBookings.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                                <div className="text-5xl mb-4">
                                    {activeTab === 'cancelled' ? '❌' : '🎫'}
                                </div>
                                <p className="text-slate-700 font-bold text-sm">
                                    {activeTab === 'cancelled' ? 'No cancelled tickets' : 'No bookings yet'}
                                </p>
                                <p className="text-slate-400 text-xs mt-1">
                                    {activeTab === 'cancelled'
                                        ? 'All your tickets are active.'
                                        : 'Search for a bus and book your first ticket!'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {visibleBookings.map(b => (
                                    <BookingTicket key={b.booking_id} b={b} onCancel={handleCancelTicket} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
