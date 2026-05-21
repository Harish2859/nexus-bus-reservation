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

    const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6" onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-gray-900">
                        {tab === 'login' ? 'Sign in to NexusBus' : 'Create your account'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
                    {['login', 'register'].map(t => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setError(''); }}
                            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
                            <p className="text-xs font-medium text-gray-500 mb-2">Account type</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { value: 'PASSENGER', label: 'Passenger', desc: 'Search & book tickets' },
                                    { value: 'OPERATOR', label: 'Operator', desc: 'Manage buses & routes' }
                                ].map(r => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, role: r.value }))}
                                        className={`p-3 rounded-lg border text-left transition-all ${
                                            form.role === r.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <p className={`text-xs font-semibold ${form.role === r.value ? 'text-blue-700' : 'text-gray-700'}`}>
                                            {r.label}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading
                            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Please wait...</>
                            : tab === 'login' ? 'Sign in' : 'Create account'
                        }
                    </button>
                </form>
            </div>
        </div>
    );
}
