import React from 'react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
    error: 'bg-red-950/90 border-red-500/50 text-red-200',
    warning: 'bg-amber-950/90 border-amber-500/50 text-amber-200'
  }[toast.type || 'success'];

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 flex items-center gap-2.5 ${bgStyles}`}>
      <span className="text-base">{toast.type === 'error' ? '⚠️' : '⚖️'}</span>
      <span className="text-xs font-semibold">{toast.message}</span>
      <button onClick={onClose} className="text-xs opacity-70 hover:opacity-100 ml-2">✕</button>
    </div>
  );
}
