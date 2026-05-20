import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose }) {
    const { login } = useAuth();
    const [tab, setTab] = useState('login'); // 'login' | 'register'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'PASSENGER'
    });

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
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

            if (!res.ok) {
                setError(data.error || 'Something went wrong.');
                return;
            }

            login(data.user, data.token);
            onClose();
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                        {tab === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl transition-colors">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-950 rounded-xl p-1 mb-6">
                    {['login', 'register'].map(t => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setError(''); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                                tab === t
                                    ? 'bg-cyan-500 text-slate-950'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Name — register only */}
                    {tab === 'register' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                required
                                value={form.name}
                                onChange={handleChange}
                                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                        </div>
                    )}

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={form.email}
                            onChange={handleChange}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={form.password}
                            onChange={handleChange}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                    </div>

                    {/* Role — register only */}
                    {tab === 'register' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Account Type</label>
                            <div className="flex gap-2">
                                {['PASSENGER', 'OPERATOR'].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, role: r }))}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                            form.role === r
                                                ? r === 'OPERATOR'
                                                    ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                                                    : 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                        }`}
                                    >
                                        {r === 'PASSENGER' ? '🧳 Passenger' : '🚌 Operator'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 text-xs">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/20 disabled:bg-slate-800 disabled:text-slate-600 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : tab === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}
