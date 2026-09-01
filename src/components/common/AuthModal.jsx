import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function AuthModal({ onToast }) {
  const { user, roles, isAuthModalOpen, setIsAuthModalOpen, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "+91 98401 23456"
  });

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser(formData);
    setIsAuthModalOpen(false);
    onToast?.(`Profile updated: ${formData.name} (${formData.role})`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl p-6 lg:p-8 max-w-md w-full border border-amber-500/30 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold font-serif-legal text-white">User Verification & Role</h3>
            <p className="text-xs text-slate-400">Configure your advocate / student profile</p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Full Name / Advocate Title</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Select User Category (Figma Screen 2)</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    formData.role === r
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  ⚖️ {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all mt-2"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
