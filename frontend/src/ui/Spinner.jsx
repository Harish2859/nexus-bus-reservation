import React from 'react';

export default function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent ${className}`}
    />
  );
}

