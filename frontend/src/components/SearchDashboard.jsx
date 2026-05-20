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
            setError('Please fill out all search fields to discover available routes.');
            return;
        }

        if (origin.toLowerCase().trim() === destination.toLowerCase().trim()) {
            setError('Origin and Destination points cannot be identical.');
            return;
        }

        updateSearch(origin, destination, date);
        onSearchExecute({ origin, destination, date });
    };

    return (
        <div className="w-full max-w-4xl mx-auto my-8 p-8 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 shadow-2xl shadow-cyan-950/20">
            <h2 className="text-xl font-semibold text-slate-200 mb-6 tracking-tight">
                Find Your Next Journey
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
                <div className="w-full flex-1 flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">From</label>
                    <input
                        type="text"
                        placeholder="E.g., Chennai"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>

                <div className="flex justify-center mb-1">
                    <button
                        onClick={handleSwap}
                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-cyan-400 hover:bg-slate-800 hover:text-cyan-300 transition-all active:scale-95"
                        title="Swap Routes"
                    >
                        ⇄
                    </button>
                </div>

                <div className="w-full flex-1 flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">To</label>
                    <input
                        type="text"
                        placeholder="E.g., Bangalore"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>

                <div className="w-full md:w-48 flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Date of Journey</label>
                    <input
                        type="date"
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-8 py-3 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all whitespace-nowrap mb-[1px]"
                >
                    Search Buses
                </button>
            </form>

            {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 text-sm">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
}
