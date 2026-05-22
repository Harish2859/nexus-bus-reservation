import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'error', onClose }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isError = type === 'error';

    return (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-300 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
            <div className={`flex items-start gap-3 bg-white rounded-2xl shadow-xl border px-4 py-3.5 ${
                isError ? 'border-red-200 shadow-red-100' : 'border-emerald-200 shadow-emerald-100'
            }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                    isError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                    {isError ? '⚠️' : '✓'}
                </div>
                <p className={`flex-1 text-sm font-medium pt-1 ${isError ? 'text-red-700' : 'text-emerald-700'}`}>
                    {message}
                </p>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-base leading-none mt-1">✕</button>
            </div>
        </div>
    );
}
