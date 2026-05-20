import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function FormField({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
            {children}
        </div>
    );
}

const inputClass = "bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors";

export default function OperatorDashboard() {
    const { token } = useAuth();
    const resolvedToken = token || localStorage.getItem('nexus_token');
    const [activeTab, setActiveTab] = useState('add-bus');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [busForm, setBusForm] = useState({ bus_number: '', bus_type: 'Seater', total_seats: '' });
    const [scheduleForm, setScheduleForm] = useState({
        bus_id: '', origin: '', destination: '',
        departure_date: '', departure_time_val: '',
        arrival_date: '', arrival_time_val: '',
        base_price_seater: '', base_price_sleeper: ''
    });

    // All hooks above — safe to early return now
    if (!resolvedToken) {
        return (
            <div className="w-full max-w-3xl mx-auto my-8 p-6 rounded-2xl bg-red-950/20 border border-red-900/40 text-red-400 text-sm font-medium">
                ⚠️ Session expired. Please sign out and log in again as an Operator.
            </div>
        );
    }

    const handleBusChange = (e) => setBusForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleScheduleChange = (e) => setScheduleForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resolvedToken}`
    };

    const submitBus = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('/api/buses/add', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ ...busForm, total_seats: parseInt(busForm.total_seats) })
            });
            const data = await res.json();
            if (!res.ok) {
                setResult({ type: 'error', message: data.error });
            } else {
                setResult({ type: 'success', message: `Bus registered! ID: ${data.bus.id} — ${data.bus.bus_number}` });
                setBusForm({ bus_number: '', bus_type: 'Seater', total_seats: '' });
            }
        } catch {
            setResult({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const submitSchedule = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const payload = {
                ...scheduleForm,
                departure_time: `${scheduleForm.departure_date} ${scheduleForm.departure_time_val}:00`,
                arrival_time: `${scheduleForm.arrival_date} ${scheduleForm.arrival_time_val}:00`
            };
            const res = await fetch('/api/buses/schedule', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) {
                setResult({ type: 'error', message: data.error });
            } else {
                setResult({ type: 'success', message: `Schedule deployed! Route: ${data.schedule.origin} → ${data.schedule.destination}` });
                setScheduleForm({ bus_id: '', origin: '', destination: '', departure_date: '', departure_time_val: '', arrival_date: '', arrival_time_val: '', base_price_seater: '', base_price_sleeper: '' });
            }
        } catch {
            setResult({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto my-8">

            {/* Dashboard Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-lg">🚌</div>
                <div>
                    <h2 className="text-lg font-bold text-slate-100 tracking-tight">Operator Dashboard</h2>
                    <p className="text-xs text-slate-500">Manage your fleet and deploy schedules</p>
                </div>
                <span className="ml-auto text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/30 px-3 py-1 rounded-full">
                    OPERATOR
                </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-950 rounded-xl p-1 mb-6 border border-slate-800">
                {[
                    { key: 'add-bus', label: '🚍 Register Bus' },
                    { key: 'create-schedule', label: '🗓️ Deploy Schedule' }
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => { setActiveTab(t.key); setResult(null); }}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === t.key
                                ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Result Banner */}
            {result && (
                <div className={`p-4 rounded-xl border text-sm font-medium mb-6 ${
                    result.type === 'success'
                        ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400'
                        : 'bg-red-950/30 border-red-900/50 text-red-400'
                }`}>
                    {result.type === 'success' ? '✅' : '❌'} {result.message}
                </div>
            )}

            {/* Add Bus Form */}
            {activeTab === 'add-bus' && (
                <form onSubmit={submitBus} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Vehicle Registration</h3>

                    <FormField label="Bus Number / License Plate">
                        <input name="bus_number" type="text" placeholder="e.g. KA-51-Z-9999" required
                            value={busForm.bus_number} onChange={handleBusChange} className={inputClass} />
                    </FormField>

                    <FormField label="Bus Type">
                        <select name="bus_type" value={busForm.bus_type} onChange={handleBusChange} className={inputClass}>
                            <option value="Seater">Seater</option>
                            <option value="Sleeper">Sleeper</option>
                            <option value="Sleeper + Seater">Sleeper + Seater</option>
                            <option value="AC Seater">AC Seater</option>
                            <option value="AC Sleeper">AC Sleeper</option>
                        </select>
                    </FormField>

                    <FormField label="Total Seats">
                        <input name="total_seats" type="number" placeholder="e.g. 40" min="1" max="60" required
                            value={busForm.total_seats} onChange={handleBusChange} className={`${inputClass} font-mono`} />
                    </FormField>

                    <button type="submit" disabled={loading}
                        className="w-full py-3 rounded-xl font-bold text-sm bg-violet-500 hover:bg-violet-400 text-white transition-all shadow-lg shadow-violet-500/20 disabled:bg-slate-800 disabled:text-slate-600 flex items-center justify-center gap-2">
                        {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registering...</> : '🚍 Register Vehicle'}
                    </button>
                </form>
            )}

            {/* Create Schedule Form */}
            {activeTab === 'create-schedule' && (
                <form onSubmit={submitSchedule} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Schedule Deployment</h3>

                    <FormField label="Bus ID">
                        <input name="bus_id" type="number" placeholder="Enter registered Bus ID" required
                            value={scheduleForm.bus_id} onChange={handleScheduleChange} className={`${inputClass} font-mono`} />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Origin City">
                            <input name="origin" type="text" placeholder="e.g. Chennai" required
                                value={scheduleForm.origin} onChange={handleScheduleChange} className={inputClass} />
                        </FormField>
                        <FormField label="Destination City">
                            <input name="destination" type="text" placeholder="e.g. Bangalore" required
                                value={scheduleForm.destination} onChange={handleScheduleChange} className={inputClass} />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Departure Date">
                            <input name="departure_date" type="date" required
                                value={scheduleForm.departure_date} onChange={handleScheduleChange} className={inputClass} />
                        </FormField>
                        <FormField label="Departure Time">
                            <input name="departure_time_val" type="time" required
                                value={scheduleForm.departure_time_val} onChange={handleScheduleChange} className={inputClass} />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Arrival Date">
                            <input name="arrival_date" type="date" required
                                value={scheduleForm.arrival_date} onChange={handleScheduleChange} className={inputClass} />
                        </FormField>
                        <FormField label="Arrival Time">
                            <input name="arrival_time_val" type="time" required
                                value={scheduleForm.arrival_time_val} onChange={handleScheduleChange} className={inputClass} />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Seater Price (₹)">
                            <input name="base_price_seater" type="number" placeholder="e.g. 550" min="1" required
                                value={scheduleForm.base_price_seater} onChange={handleScheduleChange} className={`${inputClass} font-mono`} />
                        </FormField>
                        <FormField label="Sleeper Price (₹) — optional">
                            <input name="base_price_sleeper" type="number" placeholder="e.g. 950"
                                value={scheduleForm.base_price_sleeper} onChange={handleScheduleChange} className={`${inputClass} font-mono`} />
                        </FormField>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-3 rounded-xl font-bold text-sm bg-violet-500 hover:bg-violet-400 text-white transition-all shadow-lg shadow-violet-500/20 disabled:bg-slate-800 disabled:text-slate-600 flex items-center justify-center gap-2">
                        {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deploying...</> : '🗓️ Deploy Schedule'}
                    </button>
                </form>
            )}
        </div>
    );
}
