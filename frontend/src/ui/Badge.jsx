import React from 'react';

const palette = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  green: 'bg-green-50 text-green-700 border-green-100',
  red: 'bg-red-50 text-red-700 border-red-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
  gray: 'bg-gray-50 text-gray-700 border-gray-100',
};

export default function Badge({
  tone = 'gray',
  className = '',
  children,
  ...props
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        palette[tone] || palette.gray
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

