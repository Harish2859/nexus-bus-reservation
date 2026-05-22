import React from 'react';

export default function Select({ className = '', ...props }) {
  return (
    <select
      className={`w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-transparent transition ${className}`}
      {...props}
    />
  );
}

