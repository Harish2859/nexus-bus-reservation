import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
    const { user, token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_BASE = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/auth/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
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

    if (loading) return (
        <div className="flex items-center justify-center gap-2 py-20 text-slate-400 text-sm">
            <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading your bookings...
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Profile header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 shadow-lg shadow-blue-200">
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-black text-2xl border border-white/30 shadow-inner">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-lg font-extrabold text-white tracking-tight">{user?.name}</h2>
                        <p className="text-blue-200 text-sm">{user?.email}</p>
                    </div>
                    <span className="ml-auto text-xs font-bold bg-white/20 text-white border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        🎫 Passenger
                    </span>
                </div>
                <div className="relative z-10 mt-4 pt-4 border-t border-white/20 flex items-center gap-4 text-sm text-blue-200">
                    <span><span className="font-bold text-white">{bookings.length}</span> booking{bookings.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Booking history */}
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>My Bookings</span>
                {bookings.length > 0 && (
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                        {bookings.length}
                    </span>
                )}
            </h3>

            {bookings.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                    <div className="text-4xl mb-3">🎫</div>
                    <p className="text-slate-700 font-semibold text-sm">No bookings yet</p>
                    <p className="text-slate-400 text-xs mt-1">Search for a bus to get started!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map((b) => (
                        <div key={b.booking_id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <p className="text-base font-extrabold text-slate-900 tracking-tight">
                                        {b.origin} <span className="text-slate-300 font-normal">→</span> {b.destination}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">{b.bus_number} · {b.bus_type}</p>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1.5 rounded-full shrink-0 border ${
                                    b.ticket_status === 'CONFIRMED'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                    {b.ticket_status === 'CONFIRMED' ? '✓ ' : '✕ '}{b.ticket_status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'PNR', value: b.pnr_number, mono: true, accent: true },
                                    { label: 'Seats', value: b.seats?.map(s => s.replace('S', '')).join(', ') },
                                    { label: 'Departure', value: new Date(b.departure_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
                                    { label: 'Fare paid', value: `₹${parseFloat(b.total_amount).toLocaleString()}`, bold: true },
                                ].map(({ label, value, mono, accent, bold }) => (
                                    <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1">{label}</p>
                                        <p className={`text-xs ${mono ? 'font-mono' : ''} ${accent ? 'text-blue-600 font-black' : bold ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
