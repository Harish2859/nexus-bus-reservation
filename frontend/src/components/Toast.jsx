import React, { useEffect } from 'react';

export default function Toast({ message, type = 'error', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl border shadow-2xl flex items-center gap-3 font-medium text-sm backdrop-blur-md ${
            type === 'error'
                ? 'bg-red-950/90 border-red-800 text-red-200'
                : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
        }`}>
            <span>{type === 'error' ? '🚨' : '✅'}</span>
            <p>{message}</p>
            <button
                onClick={onClose}
                className="ml-4 text-xs opacity-50 hover:opacity-100 transition-opacity font-mono"
            >
                ✕
            </button>
        </div>
    );
}
