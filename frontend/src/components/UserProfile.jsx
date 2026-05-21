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
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400 text-sm">
            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading your bookings...
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Profile header */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <span className="ml-auto text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                        Passenger
                    </span>
                </div>
            </div>

            {/* Booking history */}
            <h3 className="text-sm font-semibold text-gray-900 mb-3">My Bookings</h3>

            {bookings.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                    <p className="text-gray-400 text-sm">No bookings yet. Search for a bus to get started!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map((b) => (
                        <div key={b.booking_id} className="bg-white border border-gray-200 rounded-xl p-5">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{b.origin} → {b.destination}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{b.bus_number} · {b.bus_type}</p>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                                    b.ticket_status === 'CONFIRMED'
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                    {b.ticket_status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div>
                                    <p className="text-gray-400 mb-0.5">PNR</p>
                                    <p className="font-mono font-bold text-blue-600">{b.pnr_number}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-0.5">Seats</p>
                                    <p className="font-semibold text-gray-800">{b.seats?.map(s => s.replace('S', '')).join(', ')}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-0.5">Departure</p>
                                    <p className="text-gray-700">{new Date(b.departure_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-0.5">Fare paid</p>
                                    <p className="font-bold text-gray-900">₹{parseFloat(b.total_amount).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
