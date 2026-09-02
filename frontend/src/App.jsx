import React, { useState, useEffect } from 'react';
import {
  fetchMetadata,
  searchSimilarCases,
  fetchAllCases,
  fetchCaseById,
  fetchSavedCases,
  toggleSaveCase
} from './services/api';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'explorer' | 'compare' | 'saved'
  const [user, setUser] = useState({
    user_id: 1,
    name: "Adv. Rajesh Varma",
    email: "rajesh.varma@lawchamber.in",
    role: "Lawyer",
    phone: "+91 98401 23456"
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: "Adv. Rajesh Varma",
    email: "rajesh.varma@lawchamber.in",
    role: "Lawyer",
    phone: "+91 98401 23456",
    otp: "8492"
  });

  // Metadata & Presets
  const [meta, setMeta] = useState({
    courts: [],
    legalProvisions: [],
    demoPresets: [],
    roles: ["Lawyer", "Legal Researcher", "Law Student", "Law Firm", "Legal Intern"]
  });

  // Case Input Form State
  const [caseForm, setCaseForm] = useState({
    title: "Robbery at Jewellery Store with Knife",
    offence: "Armed Robbery / Dacoity",
    court: "Madras High Court",
    location: "Chennai, Tamil Nadu",
    legal_provision: "IPC Section 392, Section 397 (BNS 309, 311)",
    case_description: "Two men entered a jewellery store in T. Nagar, Chennai. One brandished a 12-inch butcher knife at the owner while the other broke the counter glass and stole 350 grams of gold chains. Minor forearm cut caused to cashier. Accused arrested 2 days later with recovery of gold.",
    reason: "Finding precedents on Section 397 IPC mandatory minimum 7-year sentence applicability when injury is superficial."
  });

  // Search Results & Filter State
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterCourt, setFilterCourt] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterMinScore, setFilterMinScore] = useState(50);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modals & Detailed Views
  const [selectedCaseForWhy, setSelectedCaseForWhy] = useState(null);
  const [selectedCaseForJudgment, setSelectedCaseForJudgment] = useState(null);
  
  // Comparison Matrix State (up to 3 cases)
  const [comparisonCases, setComparisonCases] = useState([]);
  
  // Saved Cases State
  const [savedCases, setSavedCases] = useState([]);
  const [notification, setNotification] = useState(null);

  // Load initial metadata and perform default demo search
  useEffect(() => {
    async function init() {
      const metadata = await fetchMetadata();
      setMeta(metadata);
      loadSavedCases();
      // Auto-run initial demo search
      handleSearch(caseForm);
    }
    init();
  }, []);

  const showToast = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadSavedCases = async () => {
    const res = await fetchSavedCases();
    if (res && res.saved_cases) {
      setSavedCases(res.saved_cases);
    }
  };

  const handleApplyPreset = (preset) => {
    setCaseForm({
      title: preset.title,
      offence: preset.offence,
      court: preset.court,
      location: preset.location,
      legal_provision: preset.provisions,
      case_description: preset.description,
      reason: preset.reason
    });
    showToast(`Loaded Preset: ${preset.title}`);
  };

  const handleSearch = async (formToSearch = caseForm) => {
    setIsSearching(true);
    try {
      const res = await searchSimilarCases(formToSearch);
      if (res && res.results) {
        setSearchResults(res.results);
        setHasSearched(true);
        // Pre-select top 2 for comparison
        if (res.results.length >= 2) {
          setComparisonCases([res.results[0], res.results[1]]);
        } else if (res.results.length === 1) {
          setComparisonCases([res.results[0]]);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Error searching precedents", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleSave = async (caseItem) => {
    const isAlreadySaved = savedCases.some(s => s.case_id === caseItem.case_id);
    await toggleSaveCase(caseItem);
    await loadSavedCases();
    showToast(isAlreadySaved ? "Case removed from Saved Library" : "Case bookmarked to Saved Library");
  };

  const handleToggleCompare = (caseItem) => {
    const exists = comparisonCases.some(c => c.case_id === caseItem.case_id);
    if (exists) {
      setComparisonCases(comparisonCases.filter(c => c.case_id !== caseItem.case_id));
      showToast(`Removed "${caseItem.title.substring(0, 30)}..." from comparison`);
    } else {
      if (comparisonCases.length >= 3) {
        showToast("Maximum 3 cases can be compared simultaneously", "warning");
        return;
      }
      setComparisonCases([...comparisonCases, caseItem]);
      showToast(`Added to Comparison Matrix`);
    }
  };

  // Filtered Results
  const filteredResults = searchResults.filter(item => {
    if (filterCourt !== 'All' && !item.court_name.toLowerCase().includes(filterCourt.toLowerCase())) return false;
    if (filterYear !== 'All' && String(item.year) !== String(filterYear)) return false;
    if (item.similarity_score < filterMinScore) return false;
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      const match = item.title.toLowerCase().includes(kw) ||
                    item.offence.toLowerCase().includes(kw) ||
                    item.legal_provisions.some(p => p.toLowerCase().includes(kw)) ||
                    item.circumstances.toLowerCase().includes(kw);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl backdrop-blur-md border transition-all duration-300 flex items-center gap-2 ${
          notification.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' :
          notification.type === 'warning' ? 'bg-amber-950/90 border-amber-500/50 text-amber-200' :
          'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
        }`}>
          <span className="text-lg">{notification.type === 'error' ? '⚠️' : '⚖️'}</span>
          <span className="text-sm font-medium">{notification.msg}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
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
                Research AI
              </span>
            </div>
            <p className="text-xs text-slate-400">Indian Legal Precedents & Case Similarity Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            🔍 Case Search & Match
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'explorer'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            📚 Precedent Explorer
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            ⚖️ Compare Matrix
            {comparisonCases.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400/30 text-amber-300 rounded-full text-xs">
                {comparisonCases.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            ⭐ Saved Cases
            {savedCases.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400/30 text-amber-300 rounded-full text-xs">
                {savedCases.length}
              </span>
            )}
          </button>
        </nav>

        {/* User Role Profile & Auth trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all text-left group"
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
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        
        {/* TAB 1: CASE SEARCH & SIMILARITY STUDIO */}
        {activeTab === 'search' && (
          <div className="space-y-8">
            
            {/* Hero / Header Section */}
            <div className="relative rounded-3xl p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-amber-500/20 shadow-2xl overflow-hidden">
              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                    ✨ AI-Assisted Precedent Discovery
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-bold font-serif-legal text-white">
                    Enter Current Case & Discover Judicial Precedents
                  </h2>
                  <p className="text-sm text-slate-400 max-w-2xl mt-1">
                    Describe your ongoing matter in plain language. Our multi-factor similarity engine extracts statutory provisions, offence dynamics, and fact patterns to rank binding & persuasive judgments.
                  </p>
                </div>

                {/* Quick Presets Dropdown / Buttons */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-400 font-medium">Quick Demo Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {meta.demoPresets?.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleApplyPreset(p)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-slate-800/90 hover:bg-amber-500/20 hover:border-amber-500/40 border border-slate-700 text-slate-300 hover:text-amber-200 transition-all text-left"
                      >
                        ⚡ {p.title.split('(')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Form & Results 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Case Input Form (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold font-serif-legal text-amber-300 flex items-center gap-2">
                      <span>📝</span> Case Details & Parameters
                    </h3>
                    <span className="text-xs text-slate-400">Step 1 of 3</span>
                  </div>

                  {/* Offence & Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Case Matter Title / Reference</label>
                    <input
                      type="text"
                      value={caseForm.title}
                      onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                      placeholder="e.g. State vs. Accused (Robbery in Jewellery Shop)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Offence Type</label>
                      <input
                        type="text"
                        value={caseForm.offence}
                        onChange={(e) => setCaseForm({ ...caseForm, offence: e.target.value })}
                        placeholder="e.g. Armed Robbery / Section 397"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Court / Bench</label>
                      <select
                        value={caseForm.court}
                        onChange={(e) => setCaseForm({ ...caseForm, court: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm focus:border-amber-500 focus:outline-none text-slate-200"
                      >
                        <option value="Madras High Court">Madras High Court</option>
                        <option value="Madras High Court (Madurai Bench)">Madras HC (Madurai)</option>
                        <option value="Supreme Court of India">Supreme Court of India</option>
                        <option value="Bombay High Court">Bombay High Court</option>
                        <option value="Delhi High Court">Delhi High Court</option>
                        <option value="Karnataka High Court">Karnataka High Court</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Location / City</label>
                      <input
                        type="text"
                        value={caseForm.location}
                        onChange={(e) => setCaseForm({ ...caseForm, location: e.target.value })}
                        placeholder="e.g. Chennai, Tamil Nadu"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Applicable Provisions</label>
                      <input
                        type="text"
                        value={caseForm.legal_provision}
                        onChange={(e) => setCaseForm({ ...caseForm, legal_provision: e.target.value })}
                        placeholder="e.g. IPC 392, 397 (BNS 309)"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Case Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">Case Facts & Circumstances</label>
                      <span className="text-[11px] text-slate-400">Plain legal language</span>
                    </div>
                    <textarea
                      rows={4}
                      value={caseForm.case_description}
                      onChange={(e) => setCaseForm({ ...caseForm, case_description: e.target.value })}
                      placeholder="Describe what occurred, weapons involved, injuries, property taken, role of client..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Reason for Searching */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Research Focus / Core Legal Issue</label>
                    <input
                      type="text"
                      value={caseForm.reason}
                      onChange={(e) => setCaseForm({ ...caseForm, reason: e.target.value })}
                      placeholder="e.g. Challenging 7-year minimum sentence under Sec 397 IPC..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSearching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        Analyzing Case Factors & Precedents...
                      </>
                    ) : (
                      <>
                        <span>⚖️</span> Search & Rank Similar Precedents
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Search Results & Why Similar Cards (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Results Header & Quick Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🎯</span> Ranked Judicial Precedents
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {filteredResults.length} Matched
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Ranked by composite factual, statutory & jurisdictional similarity</p>
                  </div>

                  {/* Filter Controls */}
                  <div className="flex items-center gap-2">
                    <select
                      value={filterCourt}
                      onChange={(e) => setFilterCourt(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="All">All Courts</option>
                      <option value="Madras High Court">Madras HC</option>
                      <option value="Supreme Court">Supreme Court</option>
                      <option value="Bombay High Court">Bombay HC</option>
                      <option value="Delhi High Court">Delhi HC</option>
                      <option value="Karnataka High Court">Karnataka HC</option>
                    </select>

                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="Filter keyword..."
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 w-28 sm:w-36 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Results List */}
                {filteredResults.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                    <p className="text-slate-400 text-sm">No matching precedents found for the selected filter criteria.</p>
                    <button
                      onClick={() => { setFilterCourt('All'); setFilterYear('All'); setSearchKeyword(''); }}
                      className="mt-3 text-xs text-amber-400 hover:underline"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredResults.map((caseItem, idx) => {
                      const isSaved = savedCases.some(s => s.case_id === caseItem.case_id);
                      const isCompared = comparisonCases.some(c => c.case_id === caseItem.case_id);

                      return (
                        <div
                          key={caseItem.case_id}
                          className="glass-panel glass-card-hover rounded-2xl p-5 border border-slate-800/90 relative overflow-hidden group"
                        >
                          {/* Rank Badge */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                                  #{idx + 1} • {caseItem.court_name} ({caseItem.year})
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="text-[11px] text-slate-400 font-mono">{caseItem.citation}</span>
                              </div>
                              <h4 className="text-base font-bold text-amber-200 group-hover:text-amber-300 transition-colors">
                                {caseItem.title}
                              </h4>
                            </div>

                            {/* Similarity Score Radial Badge */}
                            <div className="flex flex-col items-end">
                              <div className={`px-3 py-1 rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-md ${
                                caseItem.similarity_score >= 80 ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' :
                                caseItem.similarity_score >= 60 ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' :
                                'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                              }`}>
                                <span className="text-xs">⚡</span>
                                <span>{caseItem.similarity_score}% Match</span>
                              </div>
                              <span className="text-[10px] text-slate-400 mt-1">Multi-Factor Score</span>
                            </div>
                          </div>

                          {/* Legal Provisions Tags */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-3">
                            <span className="text-xs text-slate-400 font-medium mr-1">Provisions:</span>
                            {caseItem.legal_provisions.map((prov, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-xs bg-slate-800/90 text-slate-300 border border-slate-700/60 font-mono"
                              >
                                {prov}
                              </span>
                            ))}
                          </div>

                          {/* Factual Summary */}
                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                            {caseItem.circumstances}
                          </p>

                          {/* Quick Factor Pills */}
                          {caseItem.why_similar && caseItem.why_similar.length > 0 && (
                            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 mb-4 space-y-1">
                              <div className="text-[11px] font-semibold text-amber-400/90 flex items-center gap-1">
                                <span>💡 Key Similarity Factor:</span>
                              </div>
                              <div className="text-xs text-slate-300">
                                {caseItem.why_similar[0]}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons Toolbar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                            <div className="flex items-center gap-2">
                              {/* Why Similar Button */}
                              <button
                                onClick={() => setSelectedCaseForWhy(caseItem)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5"
                              >
                                <span>🔍</span> Why Similar?
                              </button>

                              {/* View Full Judgment Button */}
                              <button
                                onClick={() => setSelectedCaseForJudgment(caseItem)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
                              >
                                <span>📜</span> View Judgment
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Add to Compare Button */}
                              <button
                                onClick={() => handleToggleCompare(caseItem)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                  isCompared
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                <span>⚖️</span> {isCompared ? 'Comparing ✓' : 'Compare'}
                              </button>

                              {/* Save Bookmark Button */}
                              <button
                                onClick={() => handleToggleSave(caseItem)}
                                className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                                  isSaved
                                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
                                }`}
                                title={isSaved ? "Remove Bookmark" : "Save Precedent"}
                              >
                                <span>{isSaved ? '★ Saved' : '☆ Save'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRECEDENTS EXPLORER (Full database view) */}
        {activeTab === 'explorer' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-xl font-bold font-serif-legal text-white">Precedents Case Law Library</h2>
                <p className="text-xs text-slate-400 mt-1">Explore verified judgments across Indian High Courts & Supreme Court</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search offences, citations, provisions..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm focus:border-amber-500 focus:outline-none w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((c) => (
                <div key={c.case_id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] text-amber-400 font-mono">{c.citation}</span>
                      <h4 className="text-base font-bold text-white">{c.title}</h4>
                    </div>
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium">{c.year}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{c.case_description}</p>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-400">{c.court_name}</span>
                    <button
                      onClick={() => setSelectedCaseForJudgment(c)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                    >
                      Read Full Judgment →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SIDE-BY-SIDE CASE COMPARISON MATRIX */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-xl font-bold font-serif-legal text-white flex items-center gap-2">
                  <span>⚖️</span> Side-by-Side Case Comparison Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Compare your ongoing matter with selected precedent rulings across facts, legal provisions, court reasoning, and final decisions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  + Add More Cases
                </button>
                {comparisonCases.length > 0 && (
                  <button
                    onClick={() => setComparisonCases([])}
                    className="px-3 py-1.5 rounded-lg text-xs bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/50"
                  >
                    Clear Comparison
                  </button>
                )}
              </div>
            </div>

            {comparisonCases.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                <p className="text-slate-400 text-sm">No precedent cases selected for comparison yet.</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Search & Select Precedents
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto pb-4">
                <table className="w-full border-collapse text-left text-xs bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-800">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800">
                      <th className="p-4 w-44 font-bold text-slate-400 uppercase tracking-wider text-[11px]">Comparison Dimension</th>
                      <th className="p-4 min-w-[280px] bg-amber-500/10 border-l border-r border-amber-500/20 text-amber-300 font-bold text-sm">
                        📌 Your Current Matter
                        <div className="text-[11px] font-normal text-slate-300 mt-0.5">{caseForm.title}</div>
                      </th>
                      {comparisonCases.map((c) => (
                        <th key={c.case_id} className="p-4 min-w-[280px] border-r border-slate-800 text-white font-bold text-sm">
                          <div className="flex items-center justify-between">
                            <span>🏛️ Precedent: {c.case_id}</span>
                            <button
                              onClick={() => handleToggleCompare(c)}
                              className="text-slate-400 hover:text-red-400 text-xs"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="text-xs font-semibold text-amber-200 mt-0.5">{c.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.citation} ({c.year})</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    
                    {/* Row 1: Offence */}
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-4 font-semibold text-slate-300 bg-slate-950/40">Offence Type</td>
                      <td className="p-4 bg-amber-500/5 border-l border-r border-amber-500/20 font-medium text-amber-200">{caseForm.offence}</td>
                      {comparisonCases.map((c) => (
                        <td key={c.case_id} className="p-4 border-r border-slate-800 text-slate-200">{c.offence}</td>
                      ))}
                    </tr>

                    {/* Row 2: Court & Jurisdiction */}
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-4 font-semibold text-slate-300 bg-slate-950/40">Court & Jurisdiction</td>
                      <td className="p-4 bg-amber-500/5 border-l border-r border-amber-500/20 text-slate-300">{caseForm.court} • {caseForm.location}</td>
                      {comparisonCases.map((c) => (
                        <td key={c.case_id} className="p-4 border-r border-slate-800 text-slate-300">{c.court_name} • {c.location}</td>
                      ))}
                    </tr>

                    {/* Row 3: Statutory Provisions */}
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-4 font-semibold text-slate-300 bg-slate-950/40">Legal Provisions Invoked</td>
                      <td className="p-4 bg-amber-500/5 border-l border-r border-amber-500/20">
                        <span className="px-2 py-1 rounded bg-slate-800 text-amber-300 font-mono text-xs">{caseForm.legal_provision}</span>
                      </td>
                      {comparisonCases.map((c) => (
                        <td key={c.case_id} className="p-4 border-r border-slate-800">
                          <div className="flex flex-wrap gap-1">
                            {c.legal_provisions.map((p, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">{p}</span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Row 4: Facts & Modus Operandi */}
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-4 font-semibold text-slate-300 bg-slate-950/40">Factual Circumstances</td>
                      <td className="p-4 bg-amber-500/5 border-l border-r border-amber-500/20 text-slate-300 leading-relaxed">{caseForm.case_description}</td>
                      {comparisonCases.map((c) => (
                        <td key={c.case_id} className="p-4 border-r border-slate-800 text-slate-300 leading-relaxed">{c.circumstances}</td>
                      ))}
                    </tr>

                    {/* Row 5: Weapon Involved */}
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-4 font-semibold text-slate-300 bg-slate-950/40">Weapon / Means</td>
                      <td className="p-4 bg-amber-500/5 border-l border-r border-amber-500/20 text-slate-300">12-inch Butcher Knife</td>
                      {comparisonCases.map((c) => (
                        <td key={c.case_id} className="p-4 border-r border-slate-800 text-slate-300">{c.weapon}</td>
                      ))}
                    </tr>

                    {/* Row 6: Court Reasoning */}
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-4 font-semibold text-slate-300 bg-slate-950/40">Court's Judicial Reasoning (Ratio)</td>
                      <td className="p-4 bg-amber-500/5 border-l border-r border-amber-500/20 text-slate-400 italic">
                        [Pending determination based on precedent analysis]
                      </td>
                      {comparisonCases.map((c) => (
                        <td key={c.case_id} className="p-4 border-r border-slate-800 text-slate-300 leading-relaxed">
                          {c.judgment ? c.judgment.court_reasoning : "Refer to complete judgment"}
                        </td>
                      ))}
                    </tr>

                    {/* Row 7: Final Decision / Ruling */}
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-4 font-semibold text-slate-300 bg-slate-950/40">Final Decision / Verdict</td>
                      <td className="p-4 bg-amber-500/5 border-l border-r border-amber-500/20 text-amber-400 font-medium">
                        Targeting relief based on matched precedents.
                      </td>
                      {comparisonCases.map((c) => (
                        <td key={c.case_id} className="p-4 border-r border-slate-800 text-emerald-300 font-medium">
                          {c.judgment ? c.judgment.final_decision : "Refer to judgment"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAVED PRECEDENTS LIBRARY */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-xl font-bold font-serif-legal text-white flex items-center gap-2">
                  <span>⭐</span> Saved Precedents Library
                </h2>
                <p className="text-xs text-slate-400 mt-1">Bookmarked court rulings and research notes for quick brief preparation</p>
              </div>
              <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {savedCases.length} Precedents Bookmarked
              </span>
            </div>

            {savedCases.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                <p className="text-slate-400 text-sm">No saved cases yet. Click the ☆ Save button on any case in search results.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedCases.map((saved) => {
                  const caseData = saved.case_details || searchResults.find(c => c.case_id === saved.case_id) || {};
                  return (
                    <div key={saved.saved_id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[11px] text-amber-400 font-mono">{caseData.citation || saved.case_id}</span>
                          <h4 className="text-base font-bold text-white">{caseData.title || "Precedent Case"}</h4>
                        </div>
                        <button
                          onClick={() => handleToggleSave({ case_id: saved.case_id })}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300">
                        <span className="font-semibold text-amber-400 block mb-1">📝 Advocate Notes:</span>
                        {saved.notes}
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-slate-400">Saved on: {new Date(saved.saved_at).toLocaleDateString()}</span>
                        <button
                          onClick={() => setSelectedCaseForJudgment(caseData)}
                          className="text-amber-400 hover:underline font-semibold"
                        >
                          View Judgment →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL 1: "WHY SIMILAR?" DEEP FACTOR BREAKDOWN */}
      {selectedCaseForWhy && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel rounded-3xl p-6 lg:p-8 max-w-2xl w-full border border-amber-500/30 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Similarity Breakdown • {selectedCaseForWhy.similarity_score}% Composite Score
                </span>
                <h3 className="text-xl font-bold font-serif-legal text-white mt-1">
                  Why is this case similar to yours?
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedCaseForWhy.title} ({selectedCaseForWhy.citation})</p>
              </div>
              <button
                onClick={() => setSelectedCaseForWhy(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Why Similar Key Points */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Executive Relevance Summary:</h4>
              <div className="space-y-2">
                {selectedCaseForWhy.why_similar?.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-amber-400 text-sm mt-0.5">✓</span>
                    <span className="text-xs text-slate-200 leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-Factor Radar / Bar Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Factor Weight Matrix:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Factor 1: Offence */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Offence Type</span>
                    <span className="text-emerald-400">{selectedCaseForWhy.factor_breakdown?.offence?.score || 90}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${selectedCaseForWhy.factor_breakdown?.offence?.score || 90}%` }}></div>
                  </div>
                </div>

                {/* Factor 2: Statutory Provisions */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Statutory Provisions</span>
                    <span className="text-amber-400">{selectedCaseForWhy.factor_breakdown?.provisions?.score || 85}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${selectedCaseForWhy.factor_breakdown?.provisions?.score || 85}%` }}></div>
                  </div>
                </div>

                {/* Factor 3: Factual Cosine */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Factual Context</span>
                    <span className="text-blue-400">{selectedCaseForWhy.similarity_score}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${selectedCaseForWhy.similarity_score}%` }}></div>
                  </div>
                </div>

                {/* Factor 4: Modus Operandi & Weapon */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Modus Operandi & Means</span>
                    <span className="text-purple-400">{selectedCaseForWhy.factor_breakdown?.circumstances?.score || 80}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${selectedCaseForWhy.factor_breakdown?.circumstances?.score || 80}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  const target = selectedCaseForWhy;
                  setSelectedCaseForWhy(null);
                  setSelectedCaseForJudgment(target);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
              >
                Proceed to View Judgment →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: FULL JUDGMENT & COURT REASONING VIEWER */}
      {selectedCaseForJudgment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel rounded-3xl p-6 lg:p-8 max-w-3xl w-full border border-slate-700 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            {/* Case Title & Court Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-xs font-mono font-semibold">
                    {selectedCaseForJudgment.citation}
                  </span>
                  <span className="text-xs text-slate-400">• {selectedCaseForJudgment.court_name} ({selectedCaseForJudgment.year})</span>
                </div>
                <h3 className="text-xl font-bold font-serif-legal text-white">
                  {selectedCaseForJudgment.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCaseForJudgment(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Judgment Sections */}
            <div className="space-y-4 text-xs">
              
              {/* Section 1: Facts */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <span>📌</span> 1. Factual Matrix & Background
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {selectedCaseForJudgment.judgment?.case_facts || selectedCaseForJudgment.circumstances}
                </p>
              </div>

              {/* Section 2: Legal Issues Framed */}
              {selectedCaseForJudgment.judgment?.legal_issues && (
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                    <span>⚖️</span> 2. Points of Law & Issues Framed
                  </h4>
                  <pre className="text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                    {selectedCaseForJudgment.judgment.legal_issues}
                  </pre>
                </div>
              )}

              {/* Section 3: Prosecution & Defence Arguments */}
              {selectedCaseForJudgment.judgment?.arguments && (
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                    <span>🗣️</span> 3. Contentions & Arguments of Counsel
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedCaseForJudgment.judgment.arguments}
                  </p>
                </div>
              )}

              {/* Section 4: Court Reasoning (Ratio Decidendi) */}
              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 space-y-1.5">
                <h4 className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <span>🏛️</span> 4. Court's Reasoning & Ratio Decidendi
                </h4>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {selectedCaseForJudgment.judgment?.court_reasoning || "Reasoning recorded in official law report."}
                </p>
              </div>

              {/* Section 5: Final Decision & Order */}
              <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 space-y-1.5">
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <span>📜</span> 5. Operative Order & Final Decision
                </h4>
                <p className="text-emerald-200 leading-relaxed font-semibold">
                  {selectedCaseForJudgment.judgment?.final_decision || "Refer to certified copy."}
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => handleToggleSave(selectedCaseForJudgment)}
                className="text-xs text-slate-300 hover:text-amber-400 flex items-center gap-1 font-semibold"
              >
                ⭐ Bookmark Precedent
              </button>
              <button
                onClick={() => setSelectedCaseForJudgment(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: AUTHENTICATION & USER ROLE SELECTOR (Figma Screen 1 & 2) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 lg:p-8 max-w-md w-full border border-amber-500/30 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold font-serif-legal text-white">User Verification & Role</h3>
                <p className="text-xs text-slate-400">Configure your LegalPrecedent profile</p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">User Name / Advocate Title</label>
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Email ID or Phone Number</label>
                <input
                  type="text"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Select User Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {meta.roles?.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAuthForm({ ...authForm, role: r })}
                      className={`p-2 rounded-xl border text-left text-xs transition-all ${
                        authForm.role === r
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      ⚖️ {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setUser({ ...user, name: authForm.name, email: authForm.email, role: authForm.role });
                setShowAuthModal(false);
                showToast(`Logged in as ${authForm.name} (${authForm.role})`);
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
            >
              Continue / Update Profile
            </button>
          </div>
        </div>
      )}

      {/* Footer & Mandatory Legal Disclaimer Banner */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 py-6 px-4 lg:px-8 text-center text-xs text-slate-400 space-y-2">
        <div className="max-w-4xl mx-auto p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-slate-300 text-[11px] leading-relaxed">
          <span className="font-bold text-amber-400">⚖️ PROTOTYPE DISCLAIMER: </span>
          LegalPrecedent is a research assistance prototype. It does not provide legal advice, predict court outcomes, or replace professional legal judgment. Demo cases and judgments are curated for legal precedent research prototyping.
        </div>
        <p className="text-[11px] text-slate-400">
          LegalPrecedent © 2026 • Powered by Multi-Factor Precedent Similarity Engine
        </p>
      </footer>

    </div>
  );
}
