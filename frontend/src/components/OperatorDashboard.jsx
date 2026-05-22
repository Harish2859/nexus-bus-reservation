import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ScheduleManifest from './ScheduleManifest';

const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all";

function Field({ label, hint, children }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">{label}</label>
                {hint && <span className="text-xs text-gray-400">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

function StatCard({ icon, label, value, sub, accent = 'blue' }) {
    const colors = {
        blue:   { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-700 border-blue-200', shadow: 'shadow-blue-100' },
        indigo: { bg: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50 text-indigo-700 border-indigo-200', shadow: 'shadow-indigo-100' },
        amber:  { bg: 'from-amber-500 to-orange-500', light: 'bg-amber-50 text-amber-700 border-amber-200', shadow: 'shadow-amber-100' },
        emerald:{ bg: 'from-emerald-500 to-teal-500', light: 'bg-emerald-50 text-emerald-700 border-emerald-200', shadow: 'shadow-emerald-100' },
    };
    const c = colors[accent];
    return (
        <div className={`group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${c.shadow}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center text-lg mb-4 shadow-sm group-hover:scale-110 transition-transform`}>{icon}</div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
            {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
            <span className="text-base">{icon}</span>
            {label}
        </button>
    );
}

export default function OperatorDashboard() {
    const { user, token } = useAuth();
    const resolvedToken = token || localStorage.getItem('nexus_token');
    const API_BASE = import.meta.env.VITE_API_URL || '';
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [busForm, setBusForm] = useState({ bus_number: '', bus_type: 'Seater', total_seats: '' });
    const [scheduleForm, setScheduleForm] = useState({
        bus_id: '', origin: '', destination: '',
        departure_date: '', departure_time_val: '',
        arrival_date: '', arrival_time_val: '',
        base_price_seater: '', base_price_sleeper: ''
    });
    const [manifestScheduleId, setManifestScheduleId] = useState('');
    const [stats, setStats] = useState(null);
    const [myBuses, setMyBuses] = useState([]);
    const [activeSchedules, setActiveSchedules] = useState([]);

    useEffect(() => {
        const authHeaders = { 'Authorization': `Bearer ${resolvedToken}` };
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/buses/stats`, { headers: authHeaders });
                const data = await res.json();
                if (data.success) setStats(data.stats);
            } catch (err) { console.error('Stats fetch error:', err); }
        };
        const fetchFleet = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/buses/fleet`, { headers: authHeaders });
                const data = await res.json();
                if (data.success) setMyBuses(data.buses || []);
            } catch (err) { console.error('Fleet fetch error:', err); }
        };
        const fetchActiveSchedules = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/buses/active-schedules`, { headers: authHeaders });
                const data = await res.json();
                if (data.success) setActiveSchedules(data.schedules || []);
            } catch (err) { console.error('Active schedules fetch error:', err); }
        };
        fetchStats();
        fetchFleet();
        fetchActiveSchedules();
    }, [resolvedToken, API_BASE]);

    if (!resolvedToken) return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            Session expired. Please sign out and sign in again.
        </div>
    );

    const handleBusChange = (e) => setBusForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleScheduleChange = (e) => setScheduleForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resolvedToken}` };

    const submitBus = async (e) => {
        e.preventDefault();
        setLoading(true); setResult(null);
        try {
            const res = await fetch(`${API_BASE}/api/buses/add`, {
                method: 'POST', headers: authHeaders,
                body: JSON.stringify({ ...busForm, total_seats: parseInt(busForm.total_seats) })
            });
            const data = await res.json();
            if (!res.ok) setResult({ type: 'error', message: data.error });
            else {
                setResult({ type: 'success', message: `Bus registered successfully — ID: ${data.bus.bus_id} · ${data.bus.bus_number}` });
                setBusForm({ bus_number: '', bus_type: 'Seater', total_seats: '' });
            }
        } catch { setResult({ type: 'error', message: 'Network error. Please try again.' }); }
        finally { setLoading(false); }
    };

    const submitSchedule = async (e) => {
        e.preventDefault();
        setLoading(true); setResult(null);
        try {
            const payload = {
                ...scheduleForm,
                departure_time: `${scheduleForm.departure_date} ${scheduleForm.departure_time_val}:00`,
                arrival_time: `${scheduleForm.arrival_date} ${scheduleForm.arrival_time_val}:00`
            };
            const res = await fetch(`${API_BASE}/api/buses/schedule`, {
                method: 'POST', headers: authHeaders, body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) setResult({ type: 'error', message: data.error });
            else {
                setResult({ type: 'success', message: `Schedule deployed — ${data.schedule.origin} → ${data.schedule.destination}` });
                setScheduleForm({ bus_id: '', origin: '', destination: '', departure_date: '', departure_time_val: '', arrival_date: '', arrival_time_val: '', base_price_seater: '', base_price_sleeper: '' });
            }
        } catch { setResult({ type: 'error', message: 'Network error. Please try again.' }); }
        finally { setLoading(false); }
    };

    const navItems = [
        { key: 'overview', icon: '📊', label: 'Overview' },
        { key: 'add-bus', icon: '🚌', label: 'Register Bus' },
        { key: 'create-schedule', icon: '🗓️', label: 'Create Schedule' },
        { key: 'manifest', icon: '📋', label: 'Passenger Manifest' },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Page header band — matches UserProfile */}
            <div className="w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 h-36 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-indigo-400/20 blur-2xl" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-end pb-4 relative z-10 justify-between">
                    <div>
                        <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Operator Portal</p>
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            Welcome back, {user?.name?.split(' ')[0]} ✨
                        </h1>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1.5 pb-0.5">
                        <span className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            System online
                        </span>
                        <span className="text-xs text-blue-300 font-medium">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* Sidebar */}
                <aside className="w-full lg:w-72 shrink-0 space-y-4">

                    {/* Operator card */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="h-16 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                            <div className="absolute -bottom-8 left-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-black border-4 border-white shadow-lg">
                                    🚌
                                </div>
                            </div>
                        </div>
                        <div className="pt-10 px-5 pb-5">
                            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{user?.name}</h2>
                            <p className="text-xs text-slate-500 mt-0.5 break-all">{user?.email}</p>
                            <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                                🏢 Operator
                            </span>
                        </div>
                    </div>

                    {/* Stats pills */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Fleet Overview</p>
                        <div className="flex gap-2 mb-2">
                            <div className="flex-1 rounded-2xl p-3 text-center bg-slate-50 border border-slate-100">
                                <p className="text-xl font-black text-slate-900">{stats ? stats.buses : '—'}</p>
                                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Buses</p>
                            </div>
                            <div className="flex-1 rounded-2xl p-3 text-center bg-blue-50 border border-blue-100">
                                <p className="text-xl font-black text-slate-900">{stats ? stats.schedules : '—'}</p>
                                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Routes</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 rounded-2xl p-3 text-center bg-amber-50 border border-amber-100">
                                <p className="text-xl font-black text-slate-900">{stats ? stats.bookings : '—'}</p>
                                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Bookings</p>
                            </div>
                            <div className="flex-1 rounded-2xl p-3 text-center bg-emerald-50 border border-emerald-100">
                                <p className="text-xl font-black text-slate-900">{stats ? `₹${Number(stats.revenue).toLocaleString('en-IN')}` : '—'}</p>
                                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mt-0.5">Revenue</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Navigation</p>
                        {navItems.map(item => (
                            <SidebarItem
                                key={item.key}
                                icon={item.icon}
                                label={item.label}
                                active={activeTab === item.key}
                                onClick={() => { setActiveTab(item.key); setResult(null); }}
                            />
                        ))}
                    </div>

                    {/* Help tip */}
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs font-semibold text-blue-800 mb-1">💡 Quick tip</p>
                        <p className="text-xs text-blue-600 leading-relaxed">
                            Register your bus first, then use its ID to create a schedule.
                        </p>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 min-w-0">

                    {/* Mobile tabs */}
                    <div className="lg:hidden mb-4">
                        <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-sm">
                            {navItems.map(t => (
                                <button key={t.key}
                                    onClick={() => { setActiveTab(t.key); setResult(null); }}
                                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                                        activeTab === t.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {t.icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Result banner */}
                    {result && (
                        <div className={`flex items-start gap-3 p-4 rounded-2xl border text-sm mb-6 ${
                            result.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                            <span>{result.type === 'success' ? '✅' : '⚠️'}</span>
                            <div className="flex-1">{result.message}</div>
                            <button onClick={() => setResult(null)} className="text-gray-400 hover:text-gray-600 text-base leading-none">✕</button>
                        </div>
                    )}

                    {/* Overview */}
                    {activeTab === 'overview' && (
                        <div className="animate-fade-up">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                <StatCard icon="🚌" label="Buses Registered" value={stats ? stats.buses : '—'} sub="Total fleet size" accent="blue" />
                                <StatCard icon="🗓️" label="Active Schedules" value={stats ? stats.schedules : '—'} sub="Deployed routes" accent="indigo" />
                                <StatCard icon="🎫" label="Total Bookings" value={stats ? stats.bookings : '—'} sub="Confirmed tickets" accent="amber" />
                                <StatCard icon="💰" label="Revenue" value={stats ? `₹${stats.revenue.toLocaleString('en-IN')}` : '—'} sub="All confirmed bookings" accent="emerald" />
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                                <h3 className="text-sm font-bold text-slate-900 mb-4">Quick actions</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setActiveTab('add-bus')}
                                        className="flex items-center gap-4 p-4 border border-slate-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">🚌</div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Register a bus</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Add a new vehicle to your fleet</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('create-schedule')}
                                        className="flex items-center gap-4 p-4 border border-slate-200 rounded-2xl hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">🗓️</div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Create a schedule</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Deploy a new route for passengers</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Live Dispatch Table */}
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mt-6 shadow-sm">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Active Schedules & Passenger Load</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">Upcoming routes with real-time seat capacity.</p>
                                    </div>
                                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-xs border border-emerald-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-semibold text-[10px] uppercase tracking-wider">
                                                <th className="p-4">ID</th>
                                                <th className="p-4">Vehicle</th>
                                                <th className="p-4">Route</th>
                                                <th className="p-4">Departure</th>
                                                <th className="p-4">Load</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                                            {activeSchedules.length === 0 ? (
                                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No upcoming routes deployed.</td></tr>
                                            ) : activeSchedules.map(sched => {
                                                const load = Math.round(((sched.booked_seats || 0) / (sched.total_seats || 40)) * 100);
                                                return (
                                                    <tr key={sched.schedule_id} className="hover:bg-gray-50/70 transition">
                                                        <td className="p-4 font-mono font-bold text-gray-400">#{sched.schedule_id}</td>
                                                        <td className="p-4">
                                                            <div className="font-bold text-gray-800">🚌 {sched.bus_number}</div>
                                                            <div className="text-[10px] text-gray-400">{sched.bus_type}</div>
                                                        </td>
                                                        <td className="p-4 font-semibold text-gray-800">{sched.origin} → {sched.destination}</td>
                                                        <td className="p-4 text-gray-500">
                                                            {new Date(sched.departure_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="space-y-1.5 max-w-[140px]">
                                                                <div className="flex justify-between text-[10px] font-bold">
                                                                    <span className="text-blue-600">{sched.booked_seats || 0}/{sched.total_seats} Booked</span>
                                                                    <span className={load > 80 ? 'text-amber-600' : 'text-gray-400'}>{load}%</span>
                                                                </div>
                                                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-500 ${load > 80 ? 'bg-amber-500' : 'bg-blue-600'}`}
                                                                        style={{ width: `${Math.min(load, 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 mb-1">Getting started</h3>
                                <p className="text-xs text-gray-500 mb-4">Follow these steps to get your first booking.</p>
                                <div className="space-y-3">
                                    {[
                                        { step: '1', title: 'Register your bus', desc: 'Add your vehicle with its license plate, type, and seat count.', tab: 'add-bus' },
                                        { step: '2', title: 'Create a schedule', desc: 'Set the route, date, time, and pricing for your bus.', tab: 'create-schedule' },
                                        { step: '3', title: 'Passengers book seats', desc: 'Your route goes live and passengers can search and book instantly.', tab: null },
                                    ].map(item => (
                                        <div key={item.step} className="flex items-start gap-4">
                                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                {item.step}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                            </div>
                                            {item.tab && (
                                                <button
                                                    onClick={() => setActiveTab(item.tab)}
                                                    className="text-xs font-medium text-blue-600 hover:underline shrink-0"
                                                >
                                                    Go →
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Register Bus */}
                    {activeTab === 'add-bus' && (
                        <div className="animate-fade-up">
                            <div className="mb-6">
                                <h2 className="text-lg font-extrabold text-slate-900">Register a bus</h2>
                                <p className="text-sm text-slate-500 mt-1">Add a new vehicle to your fleet. You'll get a Bus ID to use when creating schedules.</p>
                            </div>

                            <form onSubmit={submitBus} className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm">
                                <div className="p-6 space-y-5">
                                    <h3 className="text-sm font-semibold text-gray-900">Vehicle information</h3>

                                    <Field label="Bus number / license plate">
                                        <input name="bus_number" type="text" placeholder="e.g. KA-51-Z-9999" required
                                            value={busForm.bus_number} onChange={handleBusChange} className={inputClass} />
                                    </Field>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Bus type">
                                            <select name="bus_type" value={busForm.bus_type} onChange={handleBusChange} className={inputClass}>
                                                <option>Seater</option>
                                                <option>Sleeper</option>
                                                <option>Sleeper + Seater</option>
                                                <option>AC Seater</option>
                                                <option>AC Sleeper</option>
                                            </select>
                                        </Field>
                                        <Field label="Total seats" hint="Max 60">
                                            <input name="total_seats" type="number" placeholder="e.g. 40" min="1" max="60" required
                                                value={busForm.total_seats} onChange={handleBusChange} className={inputClass} />
                                        </Field>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex items-center justify-between">
                                    <p className="text-xs text-slate-400">Bus ID will be shown after registration</p>
                                    <button type="submit" disabled={loading}
                                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 transition-all shadow-sm flex items-center gap-2">
                                        {loading ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : 'Register bus'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Create Schedule */}
                    {activeTab === 'create-schedule' && (
                        <div className="animate-fade-up">
                            <div className="mb-6">
                                <h2 className="text-lg font-extrabold text-slate-900">Create a schedule</h2>
                                <p className="text-sm text-slate-500 mt-1">Deploy a new route. Passengers will see it immediately in search results.</p>
                            </div>

                            <form onSubmit={submitSchedule} className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm">

                                {/* Bus selection */}
                                <div className="p-6 space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900">Bus assignment</h3>
                                    <Field label="Select Bus" hint="From your registered fleet">
                                        <select name="bus_id" value={scheduleForm.bus_id} onChange={handleScheduleChange} className={inputClass} required>
                                            <option value="">— Choose a vehicle —</option>
                                            {myBuses.map(bus => (
                                                <option key={bus.bus_id} value={bus.bus_id}>
                                                    🚌 {bus.bus_number} ({bus.bus_type}) — {bus.total_seats} seats
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                                {/* Route */}
                                <div className="p-6 space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900">Route</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Origin city">
                                            <input name="origin" type="text" placeholder="e.g. Chennai" required
                                                value={scheduleForm.origin} onChange={handleScheduleChange} className={inputClass} />
                                        </Field>
                                        <Field label="Destination city">
                                            <input name="destination" type="text" placeholder="e.g. Bangalore" required
                                                value={scheduleForm.destination} onChange={handleScheduleChange} className={inputClass} />
                                        </Field>
                                    </div>
                                </div>

                                {/* Timing */}
                                <div className="p-6 space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900">Timing</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Departure date">
                                            <input name="departure_date" type="date" required
                                                value={scheduleForm.departure_date} onChange={handleScheduleChange} className={inputClass} />
                                        </Field>
                                        <Field label="Departure time">
                                            <input name="departure_time_val" type="time" required
                                                value={scheduleForm.departure_time_val} onChange={handleScheduleChange} className={inputClass} />
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Arrival date">
                                            <input name="arrival_date" type="date" required
                                                value={scheduleForm.arrival_date} onChange={handleScheduleChange} className={inputClass} />
                                        </Field>
                                        <Field label="Arrival time">
                                            <input name="arrival_time_val" type="time" required
                                                value={scheduleForm.arrival_time_val} onChange={handleScheduleChange} className={inputClass} />
                                        </Field>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="p-6 space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900">Pricing</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Seater price (₹)">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                                <input name="base_price_seater" type="number" placeholder="550" min="1" required
                                                    value={scheduleForm.base_price_seater} onChange={handleScheduleChange}
                                                    className={`${inputClass} pl-7`} />
                                            </div>
                                        </Field>
                                        <Field label="Sleeper price (₹)" hint="Optional">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                                <input name="base_price_sleeper" type="number" placeholder="950"
                                                    value={scheduleForm.base_price_sleeper} onChange={handleScheduleChange}
                                                    className={`${inputClass} pl-7`} />
                                            </div>
                                        </Field>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex items-center justify-between">
                                    <p className="text-xs text-slate-400">Schedule goes live immediately after creation</p>
                                    <button type="submit" disabled={loading}
                                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 transition-all shadow-sm flex items-center gap-2">
                                        {loading ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : 'Deploy schedule'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    {/* Manifest */}
                    {activeTab === 'manifest' && (
                        <div className="animate-fade-up">
                            <div className="mb-6">
                                <h2 className="text-lg font-extrabold text-slate-900">Passenger Manifest</h2>
                                <p className="text-sm text-slate-500 mt-1">View all passengers booked for a schedule. Enter a Schedule ID to load the manifest.</p>
                            </div>
                            <div className="flex gap-3 mb-2">
                                <input
                                    type="number"
                                    placeholder="Schedule ID"
                                    value={manifestScheduleId}
                                    onChange={e => setManifestScheduleId(e.target.value)}
                                    className={inputClass}
                                    style={{ maxWidth: 200 }}
                                />
                            </div>
                            {manifestScheduleId && <ScheduleManifest scheduleId={manifestScheduleId} />}
                        </div>
                    )}

                </div>
            </div>
            </div>
        </div>
    );
}
