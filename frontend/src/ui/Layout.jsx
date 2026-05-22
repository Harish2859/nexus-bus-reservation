import React from 'react';

export function Container({ className = '', children }) {
  return (
    <div className={`max-w-6xl mx-auto px-4 ${className}`}>{children}</div>
  );
}

export function PageHeading({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

