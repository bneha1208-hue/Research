import React from 'react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 py-6 px-4 lg:px-8 text-center text-xs text-slate-400 space-y-2">
      <div className="max-w-4xl mx-auto p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-slate-300 text-[11px] leading-relaxed">
        <span className="font-bold text-amber-400">⚖️ PROTOTYPE DISCLAIMER: </span>
        LegalPrecedent & Legal Dictionary is a research assistance prototype designed for legal professionals and students. It does not provide formal legal counsel or replace professional judgment.
      </div>
      <p className="text-[11px] text-slate-500">
        LegalPrecedent © 2026 • REST API v1 Specification • Multi-Factor Precedent Engine
      </p>
    </footer>
  );
}
