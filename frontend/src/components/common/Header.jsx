import React from 'react';
import { useAuth } from '../../context/AuthContext';

export function Header({ activeTab, onTabChange, favoritesCount = 0, compareCount = 0 }) {
  const { user, setIsAuthModalOpen } = useAuth();

  const navItems = [
    { id: 'dictionary', label: '📖 Legal Dictionary' },
    { id: 'search', label: '🔍 Precedent Match' },
    { id: 'compare', label: '⚖️ Case Matrix', badge: compareCount },
    { id: 'favorites', label: '⭐ Saved & Favorites', badge: favoritesCount }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/85 backdrop-blur-md border-b border-slate-800/90 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold text-xl">
          ⚖
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-wider font-serif-legal text-white">
              Legal<span className="text-amber-400">Precedent</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">
              v1 API Ready
            </span>
          </div>
          <p className="text-xs text-slate-400">Dictionary • Precedent Similarity • Share Cards</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === item.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{item.label}</span>
            {Boolean(item.badge) && (
              <span className="px-1.5 py-0.2 bg-amber-400/30 text-amber-950 text-[10px] font-bold rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User Role Profile Button */}
      <button
        onClick={() => setIsAuthModalOpen(true)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all text-left group"
        title="Switch user role or update profile"
      >
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>
        <div className="hidden sm:block">
          <div className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</div>
          <div className="text-[11px] text-amber-400/90 leading-tight">{user.role}</div>
        </div>
        <span className="text-xs text-slate-400">⚙️</span>
      </button>
    </header>
  );
}
