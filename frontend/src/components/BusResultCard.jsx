import React from 'react';

export default function BusResultCard({ schedule, isSelected, onSelectToggle }) {
    const formatTime = (isoString) => new Date(isoString).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    const calculateDuration = (depart, arrive) => {
        const diffMs = new Date(arrive) - new Date(depart);
        const h = Math.floor(diffMs / (1000 * 60 * 60));
        const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${h}h ${m}m`;
    };

    const lowestFare = Math.min(
        parseFloat(schedule.base_price_seater),
        schedule.base_price_sleeper > 0 ? parseFloat(schedule.base_price_sleeper) : Infinity
    );

    const isAC = schedule.bus_type.includes('AC');

    return (
        <div className={`bg-white border transition-all duration-200 ${
            isSelected
                ? 'border-blue-400 border-b-0 rounded-t-2xl shadow-lg shadow-blue-100'
                : 'border-slate-200 rounded-2xl mb-3 hover:border-blue-300 hover:shadow-md hover:shadow-slate-100 hover:-translate-y-0.5'
        }`}>
            <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">

                {/* Bus info */}
                <div className="min-w-[150px]">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${
                        isAC
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                        {isAC ? '❄️' : '🚌'} {schedule.bus_type}
                    </span>
                    <p className="text-sm font-bold text-slate-900">Express Transit</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{schedule.bus_number}</p>
                </div>

                {/* Timeline */}
                <div className="flex-1 flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{formatTime(schedule.departure_time)}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{schedule.origin}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1">
                        <p className="text-xs text-slate-400 font-medium">{calculateDuration(schedule.departure_time, schedule.arrival_time)}</p>
                        <div className="w-full flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-100" />
                            <div className="flex-1 h-px bg-gradient-to-r from-blue-300 via-slate-300 to-slate-300 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300" />
                            </div>
                            <div className="w-2 h-2 rounded-full bg-slate-400 ring-2 ring-slate-100" />
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Direct
                        </span>
                    </div>

                    <div className="text-center">
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{formatTime(schedule.arrival_time)}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{schedule.destination}</p>
                    </div>
                </div>

                {/* Price + CTA */}
                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 ml-auto">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">from</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">₹{lowestFare}</p>
                    </div>
                    <button
                        onClick={onSelectToggle}
                        className={`text-sm font-bold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                            isSelected
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200 hover:shadow-blue-300'
                        }`}
                    >
                        {isSelected ? '↑ Hide seats' : 'View seats →'}
                    </button>
                </div>
            </div>
        </div>
    );
}
