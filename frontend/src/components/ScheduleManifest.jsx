import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ScheduleManifest({ scheduleId, onClose }) {
    const { token } = useAuth();
    const [manifest, setManifest] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_BASE = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        if (!scheduleId) return;
        const fetchManifest = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/buses/manifest/${scheduleId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) setManifest(data.manifest);
            } catch (err) {
                console.error('Manifest fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchManifest();
    }, [scheduleId, token, API_BASE]);

    const exportCSV = () => {
        if (manifest.length === 0) return;
        const headers = ['Seat', 'Passenger Name', 'Age', 'Gender', 'PNR', 'Booked By', 'Status'];
        const rows = manifest.map(p => [
            p.seat_number || '—',
            `"${(p.passenger_name || '—').replace(/"/g, '""')}"`,
            p.passenger_age || '—',
            p.passenger_gender || '—',
            p.pnr_number,
            p.booked_by_email,
            p.ticket_status
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `manifest_schedule_${scheduleId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl mt-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Passenger Manifest — Schedule #{scheduleId}</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportCSV}
                        disabled={manifest.length === 0}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                    >
                        Export CSV
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-gray-400 text-sm">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Loading manifest...
                </div>
            ) : manifest.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No passengers booked for this schedule yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                                <th className="px-4 py-3">Seat</th>
                                <th className="px-4 py-3">Passenger</th>
                                <th className="px-4 py-3">Age / Gender</th>
                                <th className="px-4 py-3">PNR</th>
                                <th className="px-4 py-3">Booked By</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {manifest.map((p, i) => {
                                const isCancelled = p.ticket_status === 'CANCELLED';
                                return (
                                    <tr key={i} className={`transition-colors ${ isCancelled ? 'bg-red-50/60' : 'hover:bg-gray-50' }`}>
                                        <td className={`px-4 py-3 font-bold ${ isCancelled ? 'text-red-300 line-through' : 'text-gray-800' }`}>
                                            {p.seat_number ? p.seat_number.replace('S', '') : '—'}
                                        </td>
                                        <td className={`px-4 py-3 font-medium ${ isCancelled ? 'text-red-400 line-through' : 'text-gray-900' }`}>
                                            {p.passenger_name || '—'}
                                        </td>
                                        <td className={`px-4 py-3 ${ isCancelled ? 'text-red-300' : 'text-gray-600' }`}>
                                            {p.passenger_age ? `${p.passenger_age} yrs · ${p.passenger_gender}` : '—'}
                                        </td>
                                        <td className={`px-4 py-3 font-mono font-bold ${ isCancelled ? 'text-red-400' : 'text-blue-600' }`}>
                                            {p.pnr_number}
                                        </td>
                                        <td className={`px-4 py-3 ${ isCancelled ? 'text-red-300' : 'text-gray-500' }`}>
                                            {p.booked_by_email}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                                                isCancelled
                                                    ? 'bg-red-50 text-red-600 border-red-200'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                                {isCancelled ? '✕ Cancelled' : '✓ Confirmed'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <p className="text-xs text-gray-400 px-4 py-3 border-t border-gray-100">
                        {manifest.filter(p => p.ticket_status !== 'CANCELLED').length} confirmed
                        {manifest.some(p => p.ticket_status === 'CANCELLED') &&
                            ` · ${manifest.filter(p => p.ticket_status === 'CANCELLED').length} cancelled`
                        } &nbsp;&mdash;&nbsp; {manifest.length} total record{manifest.length !== 1 ? 's' : ''}
                    </p>
                </div>
            )}
        </div>
    );
}
