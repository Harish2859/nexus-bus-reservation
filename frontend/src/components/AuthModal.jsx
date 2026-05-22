import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose }) {
    const { login } = useAuth();
    const [tab, setTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
                body: JSON.stringify(payload)
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

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-6 pb-8 relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                                <span className="text-white text-lg font-black">N</span>
                            </div>
                            <h2 className="text-lg font-extrabold text-white tracking-tight">
                                {tab === 'login' ? 'Welcome back' : 'Create account'}
                            </h2>
                            <p className="text-blue-200 text-xs mt-0.5">
                                {tab === 'login' ? 'Sign in to your NexusBus account' : 'Join thousands of travellers'}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors text-xl leading-none mt-1">✕</button>
                    </div>
                </div>

                <div className="px-6 pb-6 -mt-4">
                    {/* Tabs */}
                    <div className="flex bg-slate-100 rounded-xl p-1 mb-5 shadow-inner">
                        {['login', 'register'].map(t => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setError(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {t === 'login' ? 'Sign in' : 'Register'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {tab === 'register' && (
                            <input name="name" type="text" placeholder="Full name" required
                                value={form.name} onChange={handleChange} className={inputClass} />
                        )}

                        <input name="email" type="email" placeholder="Email address" required
                            value={form.email} onChange={handleChange} className={inputClass} />

                        <input name="password" type="password" placeholder="Password" required
                            value={form.password} onChange={handleChange} className={inputClass} />

                        {tab === 'register' && (
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2">Account type</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: 'PASSENGER', label: '🎫 Passenger', desc: 'Search & book tickets' },
                                        { value: 'OPERATOR', label: '⚙️ Operator', desc: 'Manage buses & routes' }
                                    ].map(r => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setForm(prev => ({ ...prev, role: r.value }))}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                                                form.role === r.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                                            }`}
                                        >
                                            <p className={`text-xs font-bold ${form.role === r.value ? 'text-blue-700' : 'text-slate-700'}`}>
                                                {r.label}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                                <span>⚠️</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 transition-all shadow-md shadow-blue-200 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {loading
                                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Please wait...</>
                                : tab === 'login' ? 'Sign in →' : 'Create account →'
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
