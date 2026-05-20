import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';

export default function PassengerForm({ onBookingSuccess }) {
    const { selectedSchedule, selectedSeats, clearBookingState } = useBooking();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [passengerData, setPassengerData] = useState(
        selectedSeats.reduce((acc, seatId) => {
            acc[seatId] = { name: '', age: '', gender: 'Male' };
            return acc;
        }, {})
    );

    const handleInputChange = (seatId, field, value) => {
        setPassengerData(prev => ({
            ...prev,
            [seatId]: { ...prev[seatId], [field]: value }
        }));
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        for (const seatId of selectedSeats) {
            const p = passengerData[seatId];
            if (!p.name.trim() || !p.age) {
                setErrorMessage(`Please provide complete name and age details for seat ${seatId}.`);
                setIsSubmitting(false);
                return;
            }
        }

        const formattedPassengers = selectedSeats.map(seatId => ({
            seat_number: seatId,
            passenger_name: passengerData[seatId].name.trim(),
            passenger_age: parseInt(passengerData[seatId].age),
            passenger_gender: passengerData[seatId].gender
        }));

        const totalAmount = selectedSeats.length * parseFloat(selectedSchedule.base_price_seater);

        try {
            const response = await fetch('/api/bookings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schedule_id: selectedSchedule.schedule_id,
                    total_amount: totalAmount,
                    passengers: formattedPassengers
                })
            });

            const data = await response.json();

            if (data.success) {
                clearBookingState();
                onBookingSuccess(data);
            } else {
                setErrorMessage(data.error || 'The reservation transaction was rejected.');
            }
        } catch (error) {
            console.error('Checkout pipeline error:', error);
            setErrorMessage('Network timeout processing request. Please retry.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleCheckoutSubmit} className="w-full max-w-2xl mx-auto my-12">
            <h3 className="text-lg font-bold text-slate-200 mb-6 tracking-tight flex items-center gap-2">
                📂 Passenger Document Manifest
            </h3>

            {selectedSeats.map((seatId) => (
                <div key={seatId} className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 mb-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-12 h-12 rounded-lg bg-cyan-950/40 border border-cyan-900/60 flex items-center justify-center font-mono font-bold text-sm text-cyan-400">
                        {seatId}
                    </div>
                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            value={passengerData[seatId].name}
                            onChange={(e) => handleInputChange(seatId, 'name', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                        />
                        <input
                            type="number"
                            placeholder="Age"
                            min="1"
                            max="115"
                            required
                            value={passengerData[seatId].age}
                            onChange={(e) => handleInputChange(seatId, 'age', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                        />
                        <select
                            value={passengerData[seatId].gender}
                            onChange={(e) => handleInputChange(seatId, 'gender', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            ))}

            {errorMessage && (
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs mb-4">
                    ❌ {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:bg-slate-900 disabled:text-slate-700 flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Authorizing Secure Transaction Locks...
                    </>
                ) : 'Confirm & Commit Reservation'}
            </button>
        </form>
    );
}
