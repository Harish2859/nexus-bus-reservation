import React from 'react';

const variants = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400',
  secondary:
    'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 disabled:text-gray-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${className}`}
      {...props}
    />
  );
}

