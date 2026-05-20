import React, { useEffect, useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import PassengerForm from './PassengerForm';

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
                const response = await fetch(`/api/schedules/${scheduleId}/seats`);
                const data = await response.json();
                if (data.success) setOccupiedSeats(data.booked_seats);
            } catch (error) {
                console.error('Error synchronizing seat map states:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOccupancy();
        setSelectedSeats([]);
        setShowPassengerForm(false);
        setSuccessReceipt(null);
    }, [scheduleId, setSelectedSeats]);

    const seats = Array.from({ length: totalSeats }, (_, i) => `S${i + 1}`);

    if (loading) {
        return (
            <div className="w-full text-center py-6 font-mono text-xs text-slate-500 animate-pulse">
                Synchronizing dynamic seat configuration maps...
            </div>
        );
    }

    if (successReceipt) {
        return (
            <div className="w-full max-w-xl mx-auto p-8 rounded-2xl bg-emerald-950/10 border border-emerald-900/40 text-center my-6">
                <span className="text-4xl">🎟️</span>
                <h3 className="text-xl font-extrabold text-emerald-400 mt-3 tracking-tight">Reservation Authorized!</h3>
                <p className="text-sm text-slate-400 mt-2">Your data packet has been committed securely to PostgreSQL.</p>
                <div className="my-6 p-4 rounded-xl bg-slate-950 border border-slate-800 text-left font-mono text-xs text-slate-400 flex flex-col gap-2">
                    <div><span className="text-slate-600">TICKET NO:</span> NXS-00{successReceipt.booking_id}</div>
                    <div><span className="text-slate-600">SEATS RECORDED:</span> {successReceipt.seats_booked.join(', ')}</div>
                    <div><span className="text-slate-600">SECURITY LEDGER STATUS:</span> CONFIRMED / ATOMIC_COMMIT</div>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition-colors"
                >
                    Return to Search Manifests
                </button>
            </div>
        );
    }

    if (showPassengerForm) {
        return (
            <div>
                <button
                    onClick={() => setShowPassengerForm(false)}
                    className="text-xs font-mono font-bold text-slate-500 hover:text-cyan-400 mb-4 transition-colors flex items-center gap-1"
                >
                    ← Back to Seat Layout Selector
                </button>
                <PassengerForm onBookingSuccess={(receipt) => setSuccessReceipt(receipt)} />
            </div>
        );
    }

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

            {/* Seat Grid */}
            <div className="md:col-span-2 p-6 rounded-xl bg-slate-950 border border-slate-800/80 max-w-md mx-auto w-full">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Front / Entrance</span>
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-sm" title="Driver Position">
                        🛞
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {seats.map((seatId) => {
                        const isOccupied = occupiedSeats.includes(seatId);
                        const isSelected = selectedSeats.includes(seatId);

                        return (
                            <button
                                key={seatId}
                                disabled={isOccupied}
                                onClick={() => toggleSeatSelection(seatId)}
                                className={`h-11 rounded-lg border flex items-center justify-center font-mono text-xs font-semibold tracking-wider transition-all duration-150 ${
                                    isOccupied
                                        ? 'bg-slate-900 border-slate-950 text-slate-700 cursor-not-allowed line-through shadow-inner'
                                        : isSelected
                                            ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold scale-95 shadow-md shadow-cyan-500/20'
                                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900'
                                }`}
                            >
                                {seatId}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-900 text-xs font-medium text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-slate-900 border border-slate-800" /> Available
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-cyan-500 border border-cyan-400" /> Selected
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-slate-900 border border-slate-950" /> Taken
                    </div>
                </div>
            </div>

            {/* Fare Summary Panel */}
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <h4 className="text-sm font-bold uppercase tracking-tight text-slate-400 mb-4">Fare Summary</h4>

                <div className="flex flex-col gap-3 font-medium text-sm text-slate-400 border-b border-slate-800 pb-4 mb-4">
                    <div className="flex justify-between">
                        <span>Selected Seats</span>
                        <span className="font-mono text-slate-200 font-bold">
                            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Seat Rate Unit</span>
                        <span className="text-slate-200">₹{basePrice}</span>
                    </div>
                </div>

                <div className="flex justify-between items-baseline mb-6">
                    <span className="text-xs font-bold uppercase text-slate-400">Total Payable</span>
                    <span className="text-2xl font-black text-cyan-400 tracking-tight">
                        ₹{selectedSeats.length * parseFloat(basePrice)}
                    </span>
                </div>

                <button
                    disabled={selectedSeats.length === 0}
                    onClick={() => {
                        if (!user) {
                            alert('Please sign in to book seats.');
                            return;
                        }
                        setShowPassengerForm(true);
                    }}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-cyan-500 text-slate-950 disabled:bg-slate-900 disabled:text-slate-600 disabled:border disabled:border-slate-800 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/10 transition-all active:scale-95"
                >
                    {!user && selectedSeats.length > 0 ? 'Sign In to Book' : 'Proceed to Passenger Details'}
                </button>
            </div>

        </div>
    );
}
