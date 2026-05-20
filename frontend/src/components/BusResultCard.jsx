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

    return (
        <div className={`bg-white border rounded-t-xl transition-all ${
            isSelected ? 'border-blue-500 border-b-0' : 'border-gray-200 rounded-b-xl mb-4 hover:border-gray-300 hover:shadow-sm'
        }`}>
            <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">

                {/* Bus info */}
                <div className="min-w-[140px]">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1.5 ${
                        schedule.bus_type.includes('AC')
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                    }`}>
                        {schedule.bus_type}
                    </span>
                    <p className="text-sm font-semibold text-gray-900">Express Transit</p>
                    <p className="text-xs text-gray-400 mt-0.5">{schedule.bus_number}</p>
                </div>

                {/* Timeline */}
                <div className="flex-1 flex items-center gap-4">
                    <div>
                        <p className="text-lg font-bold text-gray-900">{formatTime(schedule.departure_time)}</p>
                        <p className="text-xs text-gray-500">{schedule.origin}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center">
                        <p className="text-xs text-gray-400 mb-1">{calculateDuration(schedule.departure_time, schedule.arrival_time)}</p>
                        <div className="w-full flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <div className="flex-1 h-px bg-gray-300" />
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Direct</p>
                    </div>

                    <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatTime(schedule.arrival_time)}</p>
                        <p className="text-xs text-gray-500">{schedule.destination}</p>
                    </div>
                </div>

                {/* Price + CTA */}
                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 ml-auto">
                    <div className="text-right">
                        <p className="text-xs text-gray-400">from</p>
                        <p className="text-xl font-bold text-gray-900">₹{lowestFare}</p>
                    </div>
                    <button
                        onClick={onSelectToggle}
                        className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                            isSelected
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {isSelected ? 'Hide seats' : 'View seats'}
                    </button>
                </div>
            </div>
        </div>
    );
}
