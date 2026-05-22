import React from 'react';

export default function ModalShell({
  children,
  onClose,
  title,
  footer,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-[92%] max-w-lg rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-xl p-5 text-white shadow-2xl">
        {title && (
          <div className="mb-4">
            <h2 className="text-base font-bold">{title}</h2>
          </div>
        )}
        {children}
        {footer && <div className="mt-5">{footer}</div>}
      </div>
    </div>
  );
}

