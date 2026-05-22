import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const TRUST_POINTS = [
    { icon: '⚡', text: 'Book any route in under 60 seconds' },
    { icon: '🗺️', text: 'Live seat maps before you pay' },
    { icon: '🔒', text: 'Bank-grade encrypted transactions' },
    { icon: '🎫', text: 'Instant PNR confirmation on every booking' },
];

export default function AuthModal({ onClose }) {
    const { login } = useAuth();
    const [tab, setTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'PASSENGER' });

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const base = import.meta.env.VITE_API_URL || '';
        const endpoint = `${base}${tab === 'login' ? '/api/auth/login' : '/api/auth/register'}`;
        const payload = tab === 'login'
            ? { email: form.email, password: form.password }
            : { name: form.name, email: form.email, password: form.password, role: form.role };
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
            login(data.user, data.token);
            onClose();
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputBase = "w-full bg-white border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4 py-6"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex"
                style={{ minHeight: 520 }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Left: branded panel ── */}
                <div className="hidden md:flex flex-col w-80 shrink-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 p-8 relative overflow-hidden">
                    {/* decorative circles */}
                    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
                    <div className="absolute top-1/2 right-0 w-24 h-24 rounded-full bg-indigo-500/30 blur-2xl" />

                    {/* Logo */}
                    <div className="relative z-10 flex items-center gap-2.5 mb-10">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                            <span className="text-white font-black text-base">N</span>
                        </div>
                        <span className="text-white font-extrabold text-lg tracking-tight">NexusBus</span>
                    </div>

                    {/* Headline */}
                    <div className="relative z-10 flex-1">
                        <h2 className="text-2xl font-black text-white leading-tight tracking-tight mb-2">
                            {tab === 'login' ? 'Good to see\nyou again.' : 'Start your\njourney today.'}
                        </h2>
                        <p className="text-blue-200 text-xs leading-relaxed mb-8">
                            {tab === 'login'
                                ? 'Sign in to access your bookings, seat history, and upcoming trips.'
                                : 'Create a free account and book your first ticket in under a minute.'}
                        </p>

                        {/* Trust points */}
                        <ul className="space-y-3">
                            {TRUST_POINTS.map(p => (
                                <li key={p.text} className="flex items-start gap-3">
                                    <span className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-sm shrink-0">{p.icon}</span>
                                    <span className="text-blue-100 text-xs leading-relaxed pt-1">{p.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Bottom badge */}
                    <div className="relative z-10 mt-8 flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-blue-100 text-[11px] font-medium">1.2M+ passengers trust NexusBus</span>
                    </div>
                </div>

                {/* ── Right: form panel ── */}
                <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                    {/* Close */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                {tab === 'login' ? 'Sign in' : 'Create account'}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                                <button
                                    type="button"
                                    onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
                                    className="text-blue-600 font-semibold hover:underline"
                                >
                                    {tab === 'login' ? 'Register free' : 'Sign in'}
                                </button>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors text-sm"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Tab pills */}
                    <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                        {[
                            { key: 'login',    label: 'Sign in' },
                            { key: 'register', label: 'Register' },
                        ].map(t => (
                            <button
                                key={t.key}
                                onClick={() => { setTab(t.key); setError(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    tab === t.key
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 flex-1">

                        {/* Full name — register only */}
                        {tab === 'register' && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Full name</label>
                                <input
                                    name="name" type="text" placeholder="e.g. Priya Sharma" required
                                    value={form.name} onChange={handleChange}
                                    className={`${inputBase} border-slate-200`}
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email address</label>
                            <input
                                name="email" type="email" placeholder="you@example.com" required
                                value={form.email} onChange={handleChange}
                                className={`${inputBase} border-slate-200`}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Password</label>
                                {tab === 'login' && (
                                    <button type="button" className="text-xs text-blue-600 hover:underline font-medium">
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={tab === 'register' ? 'Min. 8 characters' : 'Your password'}
                                    required
                                    value={form.password} onChange={handleChange}
                                    className={`${inputBase} border-slate-200 pr-11`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* Role selector — register only */}
                        {tab === 'register' && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">I am a</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        {
                                            value: 'PASSENGER',
                                            icon: '🎫',
                                            label: 'Passenger',
                                            desc: 'Search & book tickets',
                                        },
                                        {
                                            value: 'OPERATOR',
                                            icon: '🚌',
                                            label: 'Bus Operator',
                                            desc: 'Manage fleet & routes',
                                        },
                                    ].map(r => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setForm(prev => ({ ...prev, role: r.value }))}
                                            className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                                                form.role === r.value
                                                    ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100'
                                                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                                            }`}
                                        >
                                            {form.role === r.value && (
                                                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-[9px] font-black">✓</span>
                                                </span>
                                            )}
                                            <span className="text-xl block mb-2">{r.icon}</span>
                                            <p className={`text-sm font-bold ${form.role === r.value ? 'text-blue-700' : 'text-slate-700'}`}>
                                                {r.label}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                <span className="shrink-0">⚠️</span>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-blue-200/60 disabled:shadow-none flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Please wait...</>
                            ) : tab === 'login' ? 'Sign in to NexusBus →' : 'Create my account →'}
                        </button>

                        {/* Legal note */}
                        {tab === 'register' && (
                            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                                By creating an account you agree to our{' '}
                                <span className="text-slate-600 hover:underline cursor-pointer">Terms of Service</span>
                                {' '}and{' '}
                                <span className="text-slate-600 hover:underline cursor-pointer">Privacy Policy</span>.
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
