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

    const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm";

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-6">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🔍</span>
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Find your bus</h1>
            </div>
            <p className="text-sm text-slate-500 mb-5 ml-7">Search routes across India</p>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-3 items-end">
                    <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">From</label>
                        <input
                            type="text"
                            placeholder="Departure city"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <button
                        onClick={handleSwap}
                        type="button"
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 text-slate-500 hover:text-blue-600 transition-all shadow-sm mb-0.5 group"
                        title="Swap cities"
                    >
                        <span className="block group-hover:rotate-180 transition-transform duration-300">⇄</span>
                    </button>

                    <div className="flex-1 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">To</label>
                        <input
                            type="text"
                            placeholder="Arrival city"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="w-full md:w-44 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
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
                        className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-7 py-3 rounded-xl text-sm transition-all shadow-md shadow-blue-200 hover:shadow-blue-300 whitespace-nowrap"
                    >
                        Search buses
                    </button>
                </div>

                {error && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
}
