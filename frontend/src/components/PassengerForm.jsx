import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

export default function PassengerForm({ onBookingSuccess }) {
    const { selectedSchedule, selectedSeats, clearBookingState } = useBooking();
    const { token } = useAuth();
    const resolvedToken = token || localStorage.getItem('nexus_token');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [passengerData, setPassengerData] = useState(
        selectedSeats.reduce((acc, seatId) => {
            acc[seatId] = { name: '', age: '', gender: 'Male' };
            return acc;
        }, {})
    );

    const handleInputChange = (seatId, field, value) => {
        setPassengerData(prev => ({ ...prev, [seatId]: { ...prev[seatId], [field]: value } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        for (const seatId of selectedSeats) {
            const p = passengerData[seatId];
            if (!p.name.trim() || !p.age) {
                setErrorMessage(`Please fill in all details for seat ${seatId.replace('S', '')}.`);
                setIsSubmitting(false);
                return;
            }
        }

        const passengers = selectedSeats.map(seatId => ({
            seat_number: seatId,
            passenger_name: passengerData[seatId].name.trim(),
            passenger_age: parseInt(passengerData[seatId].age),
            passenger_gender: passengerData[seatId].gender
        }));

        const API_BASE = import.meta.env.VITE_API_URL || '';
        try {
            const res = await fetch(`${API_BASE}/api/bookings/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resolvedToken}`
                },
                body: JSON.stringify({
                    schedule_id: selectedSchedule.schedule_id,
                    total_amount: selectedSeats.length * parseFloat(selectedSchedule.base_price_seater),
                    passengers
                })
            });
            const data = await res.json();
            if (data.success) {
                clearBookingState();
                onBookingSuccess(data);
            } else {
                setErrorMessage(data.error || 'Booking failed. Please try again.');
            }
        } catch {
            setErrorMessage('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all";

    return (
        <form onSubmit={handleSubmit} className="max-w-xl">
            <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-base">👤</div>
                <h3 className="text-base font-extrabold text-slate-900">Passenger details</h3>
            </div>

            <div className="space-y-3 mb-5">
                {selectedSeats.map((seatId) => (
                    <div key={seatId} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-black rounded-lg flex items-center justify-center shadow-sm">
                                {seatId.replace('S', '')}
                            </span>
                            <span className="text-sm font-semibold text-slate-700">Seat {seatId.replace('S', '')}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                type="text"
                                placeholder="Full name"
                                required
                                value={passengerData[seatId].name}
                                onChange={(e) => handleInputChange(seatId, 'name', e.target.value)}
                                className={inputClass}
                            />
                            <input
                                type="number"
                                placeholder="Age"
                                min="1" max="115"
                                required
                                value={passengerData[seatId].age}
                                onChange={(e) => handleInputChange(seatId, 'age', e.target.value)}
                                className={inputClass}
                            />
                            <select
                                value={passengerData[seatId].gender}
                                onChange={(e) => handleInputChange(seatId, 'gender', e.target.value)}
                                className={inputClass}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            {errorMessage && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
                    <span>⚠️</span>
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 transition-all shadow-md shadow-blue-200 disabled:shadow-none flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                ) : 'Confirm booking →'}
            </button>
        </form>
    );
}
