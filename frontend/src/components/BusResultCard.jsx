import React from 'react';

export default function BusResultCard({ schedule, isSelected, onSelectToggle }) {
    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const calculateDuration = (depart, arrive) => {
        const diffMs = new Date(arrive) - new Date(depart);
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${diffHrs}h ${diffMins}m`;
    };

    const lowestFare = Math.min(
        parseFloat(schedule.base_price_seater),
        schedule.base_price_sleeper > 0 ? parseFloat(schedule.base_price_sleeper) : Infinity
    );

    return (
        <div className={`w-full bg-slate-900/60 border rounded-2xl p-6 transition-all duration-200 mb-4 ${
            isSelected ? 'border-cyan-500 shadow-xl shadow-cyan-950/20' : 'border-slate-800 hover:border-slate-700'
        }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                {/* Operator & Bus Info */}
                <div className="flex-1">
                    <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400 bg-cyan-950/40 border border-cyan-900 px-3 py-1 rounded-full">
                        {schedule.bus_type}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 mt-2 tracking-tight">Express Transit Corporation</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{schedule.bus_number}</p>
                </div>

                {/* Timeline */}
                <div className="flex-1 flex items-center gap-6 w-full md:w-auto">
                    <div className="text-left">
                        <p className="text-xl font-bold text-slate-200">{formatTime(schedule.departure_time)}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{schedule.origin}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center min-w-[60px]">
                        <span className="text-[10px] font-mono text-slate-500 tracking-wide">
                            {calculateDuration(schedule.departure_time, schedule.arrival_time)}
                        </span>
                        <div className="w-full h-[2px] bg-slate-800 relative my-1">
                            <span className="absolute w-1.5 h-1.5 rounded-full bg-cyan-500 -top-[2px] left-0" />
                            <span className="absolute w-1.5 h-1.5 rounded-full bg-cyan-500 -top-[2px] right-0" />
                        </div>
                        <span className="text-[9px] font-medium uppercase text-slate-600 tracking-wider">Direct</span>
                    </div>

                    <div className="text-right">
                        <p className="text-xl font-bold text-slate-200">{formatTime(schedule.arrival_time)}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{schedule.destination}</p>
                    </div>
                </div>

                {/* Pricing */}
                <div className="text-left md:text-right">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Fares From</p>
                    <p className="text-2xl font-black text-slate-100 mt-0.5">₹{lowestFare}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Seat inventory active</p>
                </div>

                {/* CTA */}
                <button
                    onClick={onSelectToggle}
                    className={`w-full md:w-auto px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                        isSelected
                            ? 'bg-slate-800 text-cyan-400 border border-cyan-800/40'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/10'
                    }`}
                >
                    {isSelected ? 'Close Layout' : 'Select Seats'}
                </button>

            </div>
        </div>
    );
}
