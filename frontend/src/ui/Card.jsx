import React from 'react';

export default function Card({ className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-xl shadow-sm ${className}`}
      {...props}
    />
  );
}

