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
                setErrorMessage(`Please fill in all details for seat ${seatId.replace('S', '')} .`);
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

    const inputClass = "w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

    return (
        <form onSubmit={handleSubmit} className="max-w-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Passenger details</h3>

            <div className="space-y-3 mb-5">
                {selectedSeats.map((seatId) => (
                    <div key={seatId} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-7 h-7 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center justify-center">
                                {seatId.replace('S', '')}
                            </span>
                            <span className="text-sm font-medium text-gray-700">Seat {seatId.replace('S', '')}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-1">
                                <input
                                    type="text"
                                    placeholder="Full name"
                                    required
                                    value={passengerData[seatId].name}
                                    onChange={(e) => handleInputChange(seatId, 'name', e.target.value)}
                                    className={`${inputClass} col-span-1`}
                                />
                            </div>
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
                <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                ) : 'Confirm booking'}
            </button>
        </form>
    );
}
