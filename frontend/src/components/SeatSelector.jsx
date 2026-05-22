import React, { useEffect, useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import PassengerForm from './PassengerForm';

function Seat({ id, status, onClick }) {
    const base = "w-10 h-10 rounded-t-xl border-2 text-xs font-bold flex items-center justify-center transition-all select-none";
    const styles = {
        available: `${base} bg-white border-slate-300 text-slate-500 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 cursor-pointer hover:scale-105`,
        selected:  `${base} bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-500 text-white cursor-pointer scale-95 shadow-md shadow-blue-200`,
        occupied:  `${base} bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed`
    };
    return (
        <button
            disabled={status === 'occupied'}
            onClick={onClick}
            className={styles[status]}
            title={status === 'occupied' ? 'Booked' : id}
        >
            {status === 'occupied' ? '✕' : id.replace('S', '')}
        </button>
    );
}

export default function SeatSelector({ scheduleId, busType, totalSeats, basePrice }) {
    const { selectedSeats, toggleSeatSelection, setSelectedSeats } = useBooking();
    const { user } = useAuth();
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPassengerForm, setShowPassengerForm] = useState(false);
    const [successReceipt, setSuccessReceipt] = useState(null);

    useEffect(() => {
        const API_BASE = import.meta.env.VITE_API_URL || '';
        const fetchOccupancy = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/schedules/${scheduleId}/seats`);
                const data = await res.json();
                if (data.success) setOccupiedSeats(data.booked_seats);
            } catch (e) {
                console.error('Seat fetch error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchOccupancy();
        setSelectedSeats([]);
        setShowPassengerForm(false);
        setSuccessReceipt(null);
    }, [scheduleId, setSelectedSeats]);

    const totalRows = Math.ceil(totalSeats / 4);
    const rows = Array.from({ length: totalRows }, (_, r) => {
        const base = r * 4;
        return [base + 1, base + 2, null, base + 3, base + 4].map(n =>
            n === null ? null : n <= totalSeats ? `S${n}` : null
        );
    });

    const getSeatStatus = (id) => {
        if (!id) return null;
        if (occupiedSeats.includes(id)) return 'occupied';
        if (selectedSeats.includes(id)) return 'selected';
        return 'available';
    };

    if (loading) return (
        <div className="py-12 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Loading seat map...
            </div>
        </div>
    );

    if (successReceipt) return (
        <div className="py-10 text-center">
            <div className="inline-flex flex-col items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl px-10 py-8 shadow-sm">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-200">
                    ✓
                </div>
                <div>
                    <h3 className="text-base font-extrabold text-emerald-800">Booking Confirmed!</h3>
                    <p className="text-xs text-emerald-600 mt-0.5">Your ticket has been reserved</p>
                </div>
                <div className="bg-white border border-emerald-200 rounded-xl px-6 py-3 text-sm text-emerald-700 space-y-1 w-full">
                    <p>PNR: <span className="font-mono font-black text-emerald-900">{successReceipt.pnr_number}</span></p>
                    <p>Seats: <span className="font-bold">{successReceipt.seats_booked.join(', ')}</span></p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                >
                    Search another bus →
                </button>
            </div>
        </div>
    );

    if (showPassengerForm) return (
        <div className="pt-4">
            <button
                onClick={() => setShowPassengerForm(false)}
                className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-5 group transition-colors"
            >
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                Back to seat selection
            </button>
            <PassengerForm onBookingSuccess={(r) => setSuccessReceipt(r)} />
        </div>
    );

    const availableCount = totalSeats - occupiedSeats.length;

    return (
        <div className="pt-5 flex flex-col lg:flex-row gap-6">

            {/* Seat map */}
            <div className="flex-1">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm mx-auto lg:mx-0 shadow-sm">

                    {/* Bus front */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-sm">🚌</div>
                            <span className="text-xs font-bold text-slate-600">{busType}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                            {availableCount} seats left
                        </span>
                    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-5 gap-2 mb-2 px-1">
                        {['A', 'B', '', 'C', 'D'].map((col, i) => (
                            <div key={i} className="text-center text-xs font-bold text-slate-400">{col}</div>
                        ))}
                    </div>

                    {/* Seat rows */}
                    <div className="flex flex-col gap-2">
                        {rows.map((row, rowIdx) => (
                            <div key={rowIdx} className="grid grid-cols-5 gap-2 items-center">
                                {row.map((seatId, colIdx) =>
                                    seatId === null ? (
                                        <div key={colIdx} className="w-10" />
                                    ) : seatId === undefined ? (
                                        <div key={colIdx} className="w-10 h-10" />
                                    ) : (
                                        <Seat
                                            key={seatId}
                                            id={seatId}
                                            status={getSeatStatus(seatId)}
                                            onClick={() => toggleSeatSelection(seatId)}
                                        />
                                    )
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-md border-2 border-slate-300 bg-white" />
                            Available
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600" />
                            Selected
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-md border-2 border-slate-200 bg-slate-100" />
                            Booked
                        </div>
                    </div>
                </div>
            </div>

            {/* Fare summary */}
            <div className="lg:w-64">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-20 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-sm">🎫</span>
                        Fare summary
                    </h4>

                    <div className="space-y-2.5 text-sm mb-4">
                        <div className="flex justify-between text-slate-600">
                            <span>Seats</span>
                            <span className="font-semibold text-slate-900">
                                {selectedSeats.length > 0 ? selectedSeats.map(s => s.replace('S', '')).join(', ') : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Price / seat</span>
                            <span className="font-semibold text-slate-900">₹{parseFloat(basePrice).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mb-5">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-slate-600 font-medium">Total</span>
                            <span className="text-2xl font-black text-slate-900">
                                ₹{(selectedSeats.length * parseFloat(basePrice)).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <button
                        disabled={selectedSeats.length === 0}
                        onClick={() => {
                            if (!user) { alert('Please sign in to book seats.'); return; }
                            setShowPassengerForm(true);
                        }}
                        className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200 disabled:shadow-none"
                    >
                        {selectedSeats.length === 0
                            ? 'Select seats to continue'
                            : !user
                                ? 'Sign in to book'
                                : `Book ${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} →`}
                    </button>
                </div>
            </div>
        </div>
    );
}
