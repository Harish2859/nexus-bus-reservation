import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';

export default function SearchDashboard({ onSearchExecute }) {
    const { updateSearch, searchCriteria } = useBooking();
    const [origin, setOrigin] = useState(searchCriteria.origin);
    const [destination, setDestination] = useState(searchCriteria.destination);
    const [date, setDate] = useState(searchCriteria.date);
    const [error, setError] = useState('');

    const handleSwap = (e) => {
        e.preventDefault();
        const temp = origin;
        setOrigin(destination);
        setDestination(temp);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!origin.trim() || !destination.trim() || !date) {
            setError('Please fill in all fields.');
            return;
        }
        if (origin.toLowerCase().trim() === destination.toLowerCase().trim()) {
            setError('Origin and destination cannot be the same.');
            return;
        }
        updateSearch(origin, destination, date);
        onSearchExecute({ origin, destination, date });
    };

    const inputClass = "w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Find your bus</h1>
            <p className="text-sm text-gray-500 mb-5">Search routes across India</p>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-3 items-end">
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">From</label>
                        <input
                            type="text"
                            placeholder="City or stop"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <button
                        onClick={handleSwap}
                        type="button"
                        className="p-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-500 transition mb-0.5"
                        title="Swap"
                    >
                        ⇄
                    </button>

                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">To</label>
                        <input
                            type="text"
                            placeholder="City or stop"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="w-full md:w-44 flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">Date</label>
                        <input
                            type="date"
                            value={date}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDate(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition whitespace-nowrap"
                    >
                        Search
                    </button>
                </div>

                {error && (
                    <p className="mt-3 text-sm text-red-500">{error}</p>
                )}
            </form>
        </div>
    );
}
