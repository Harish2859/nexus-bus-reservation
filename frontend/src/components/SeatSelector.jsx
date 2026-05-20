import React, { useEffect, useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import PassengerForm from './PassengerForm';

function Seat({ id, status, onClick }) {
    const base = "w-10 h-10 rounded-t-lg border-2 text-xs font-semibold flex items-center justify-center transition-all select-none";
    const styles = {
        available: `${base} bg-white border-gray-300 text-gray-600 hover:border-blue-500 hover:bg-blue-50 cursor-pointer`,
        selected:  `${base} bg-blue-600 border-blue-600 text-white cursor-pointer scale-95`,
        occupied:  `${base} bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed`
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
        const fetchOccupancy = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/schedules/${scheduleId}/seats`);
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

    // Build rows of 4 seats with aisle gap between col 2 and 3
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
        <div className="py-10 text-center text-sm text-gray-400">Loading seat map...</div>
    );

    if (successReceipt) return (
        <div className="py-10 text-center">
            <div className="inline-flex flex-col items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-8 py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">✓</div>
                <h3 className="text-base font-bold text-green-800">Booking Confirmed!</h3>
                <div className="text-sm text-green-700 space-y-1">
                    <p>Ticket: <span className="font-mono font-bold">NXS-{String(successReceipt.booking_id).padStart(4, '0')}</span></p>
                    <p>Seats: <span className="font-semibold">{successReceipt.seats_booked.join(', ')}</span></p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm font-medium text-green-700 hover:text-green-900 underline"
                >
                    Search another bus
                </button>
            </div>
        </div>
    );

    if (showPassengerForm) return (
        <div className="pt-4">
            <button
                onClick={() => setShowPassengerForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
            >
                ← Back to seat selection
            </button>
            <PassengerForm onBookingSuccess={(r) => setSuccessReceipt(r)} />
        </div>
    );

    return (
        <div className="pt-5 flex flex-col lg:flex-row gap-6">

            {/* Seat map */}
            <div className="flex-1">
                <div className="bg-white border border-gray-200 rounded-xl p-5 max-w-sm mx-auto lg:mx-0">

                    {/* Bus front */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                        <span className="text-xs text-gray-400 font-medium">FRONT</span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <span>🚌</span>
                            <span>{busType}</span>
                        </div>
                    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-5 gap-2 mb-2 px-1">
                        {['A', 'B', '', 'C', 'D'].map((col, i) => (
                            <div key={i} className="text-center text-xs font-medium text-gray-400">{col}</div>
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
                    <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white" />
                            Available
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-600" />
                            Selected
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded border-2 border-gray-200 bg-gray-100" />
                            Booked
                        </div>
                    </div>
                </div>
            </div>

            {/* Fare summary */}
            <div className="lg:w-64">
                <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-20">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Fare summary</h4>

                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between text-gray-600">
                            <span>Seats selected</span>
                            <span className="font-medium text-gray-900">
                                {selectedSeats.length > 0 ? selectedSeats.map(s => s.replace('S', '')).join(', ') : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Price per seat</span>
                            <span className="font-medium text-gray-900">₹{parseFloat(basePrice).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 mb-5">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-gray-600">Total</span>
                            <span className="text-xl font-bold text-gray-900">
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
                        className="w-full py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {selectedSeats.length === 0
                            ? 'Select seats to continue'
                            : !user
                                ? 'Sign in to book'
                                : `Book ${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
