import React, { useEffect } from 'react';

export default function Toast({ message, type = 'error', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm ${
            type === 'error'
                ? 'bg-white border-red-200 text-red-700'
                : 'bg-white border-green-200 text-green-700'
        }`}>
            <span>{type === 'error' ? '⚠️' : '✓'}</span>
            <p className="flex-1">{message}</p>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-2 text-base leading-none">✕</button>
        </div>
    );
}
