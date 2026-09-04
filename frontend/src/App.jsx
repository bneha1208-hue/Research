import React, { useState, useEffect } from 'react';
import {
  fetchMetadata,
  searchSimilarCases,
  fetchSavedCases,
  toggleSaveCase
} from './services/api';

export default function App() {
  // ============================================================
  // PROFILE / NAVIGATION STATE
  // ============================================================
  const [profileVerified, setProfileVerified] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  // 'dashboard' | 'search' | 'explorer' | 'compare' | 'saved'

  const [user, setUser] = useState({
    user_id: 1,
    name: "",
    email: "",
    role: "",
    phone: ""
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState("");

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    otp: ""
  });

  // ============================================================
  // METADATA
  // ============================================================
  const [meta, setMeta] = useState({
    courts: [],
    legalProvisions: [],
    demoPresets: [],
    roles: [
      "Lawyer",
      "Legal Researcher",
      "Law Student",
      "Law Firm",
      "Legal Intern"
    ]
  });

  // ============================================================
  // CASE INPUT FORM
  // ============================================================
  const [caseForm, setCaseForm] = useState({
    title: "Robbery at Jewellery Store with Knife",
    offence: "Armed Robbery / Dacoity",
    court: "Madras High Court",
    location: "Chennai, Tamil Nadu",
    legal_provision: "IPC Section 392, Section 397 (BNS 309, 311)",
    case_description:
      "Two men entered a jewellery store in T. Nagar, Chennai. One brandished a 12-inch butcher knife at the owner while the other broke the counter glass and stole 350 grams of gold chains. Minor forearm cut caused to cashier. Accused arrested 2 days later with recovery of gold.",
    reason:
      "Finding precedents on Section 397 IPC mandatory minimum 7-year sentence applicability when injury is superficial."
  });

  // ============================================================
  // SEARCH STATE
  // ============================================================
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [filterCourt, setFilterCourt] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterMinScore, setFilterMinScore] = useState(50);
  const [searchKeyword, setSearchKeyword] = useState('');

  // ============================================================
  // MODALS
  // ============================================================
  const [selectedCaseForWhy, setSelectedCaseForWhy] = useState(null);
  const [selectedCaseForJudgment, setSelectedCaseForJudgment] =
    useState(null);

  // ============================================================
  // COMPARISON
  // ============================================================
  const [comparisonCases, setComparisonCases] = useState([]);

  // ============================================================
  // SAVED CASES
  // ============================================================
  const [savedCases, setSavedCases] = useState([]);
  const [notification, setNotification] = useState(null);

  // ============================================================
  // INITIAL LOAD
  // ============================================================
  useEffect(() => {
    async function init() {
      try {
        const metadata = await fetchMetadata();

        if (metadata) {
          setMeta(metadata);
        }

        await loadSavedCases();
      } catch (err) {
        console.error("Initialization error:", err);
      }
    }

    init();
  }, []);

  // ============================================================
  // TOAST
  // ============================================================
  const showToast = (msg, type = "success") => {
    setNotification({ msg, type });

    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // ============================================================
  // LOAD SAVED CASES
  // ============================================================
  const loadSavedCases = async () => {
    try {
      const res = await fetchSavedCases();

      if (res && res.saved_cases) {
        setSavedCases(res.saved_cases);
      }
    } catch (err) {
      console.error("Error loading saved cases:", err);
    }
  };

  // ============================================================
  // PROFILE VERIFICATION
  // ============================================================
  const handleProfileContinue = () => {
    setAuthError("");

    if (!authForm.name.trim()) {
      setAuthError("Please enter your name / advocate title.");
      return;
    }

    if (!authForm.email.trim()) {
      setAuthError("Please enter your email ID or phone number.");
      return;
    }

    if (!authForm.role) {
      setAuthError("Please select your user category.");
      return;
    }

    setUser({
      ...user,
      name: authForm.name.trim(),
      email: authForm.email.trim(),
      role: authForm.role,
      phone: authForm.phone
    });

    setProfileVerified(true);
    setActiveTab('dashboard');
    setShowAuthModal(false);
    setAuthError("");

    showToast(
      `Welcome ${authForm.name.trim()}! Logged in as ${authForm.role}.`
    );
  };

  // ============================================================
  // PRESET
  // ============================================================
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

  // ============================================================
  // SEARCH
  // ============================================================
  const handleSearch = async (formToSearch = caseForm) => {
    setIsSearching(true);

    try {
      const res = await searchSimilarCases(formToSearch);

      if (res && res.results) {
        setSearchResults(res.results);
        setHasSearched(true);

        if (res.results.length >= 2) {
          setComparisonCases([
            res.results[0],
            res.results[1]
          ]);
        } else if (res.results.length === 1) {
          setComparisonCases([res.results[0]]);
        }
      }
    } catch (err) {
      console.error(err);
      showToast(
        "Error searching precedents",
        "error"
      );
    } finally {
      setIsSearching(false);
    }
  };

  // ============================================================
  // SAVE / UNSAVE
  // ============================================================
  const handleToggleSave = async (caseItem) => {
    try {
      const isAlreadySaved = savedCases.some(
        s => s.case_id === caseItem.case_id
      );

      await toggleSaveCase(caseItem);
      await loadSavedCases();

      showToast(
        isAlreadySaved
          ? "Case removed from Saved Library"
          : "Case bookmarked to Saved Library"
      );
    } catch (err) {
      console.error(err);
      showToast(
        "Unable to update saved case",
        "error"
      );
    }
  };

  // ============================================================
  // COMPARISON
  // ============================================================
  const handleToggleCompare = (caseItem) => {
    const exists = comparisonCases.some(
      c => c.case_id === caseItem.case_id
    );

    if (exists) {
      setComparisonCases(
        comparisonCases.filter(
          c => c.case_id !== caseItem.case_id
        )
      );

      showToast(
        `Removed "${caseItem.title.substring(
          0,
          30
        )}..." from comparison`
      );
    } else {
      if (comparisonCases.length >= 3) {
        showToast(
          "Maximum 3 cases can be compared simultaneously",
          "warning"
        );
        return;
      }

      setComparisonCases([
        ...comparisonCases,
        caseItem
      ]);

      showToast(
        "Added to Comparison Matrix"
      );
    }
  };

  // ============================================================
  // FILTERED RESULTS
  // ============================================================
  const filteredResults = searchResults.filter(item => {
    if (
      filterCourt !== 'All' &&
      !item.court_name
        .toLowerCase()
        .includes(filterCourt.toLowerCase())
    ) {
      return false;
    }

    if (
      filterYear !== 'All' &&
      String(item.year) !== String(filterYear)
    ) {
      return false;
    }

    if (
      item.similarity_score < filterMinScore
    ) {
      return false;
    }

    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();

      const match =
        item.title
          .toLowerCase()
          .includes(kw) ||
        item.offence
          .toLowerCase()
          .includes(kw) ||
        item.legal_provisions.some(
          p =>
            p.toLowerCase().includes(kw)
        ) ||
        item.circumstances
          .toLowerCase()
          .includes(kw);

      if (!match) {
        return false;
      }
    }

    return true;
  });

  // ============================================================
  // NAV BUTTON CLASS
  // ============================================================
  const navButtonClass = (tab) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      activeTab === tab
        ? 'bg-[#0B1F3A] text-white font-semibold shadow-md'
        : 'text-slate-600 hover:text-[#0B1F3A] hover:bg-slate-100'
    }`;

  // ============================================================
  // FIRST PAGE - USER VERIFICATION
  // ============================================================
  if (!profileVerified) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">

        {/* HEADER */}
        <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">

          <div className="max-w-6xl mx-auto w-full flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-[#0B1F3A] flex items-center justify-center text-white font-bold text-xl shadow-md">
              ⚖
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide font-serif-legal text-[#0B1F3A]">
                Legal<span className="text-blue-700">Precedent</span>
              </h1>

              <p className="text-xs text-slate-500">
                Indian Legal Precedents & Case Similarity Engine
              </p>
            </div>

          </div>

        </header>

        {/* VERIFICATION PAGE */}
        <main className="flex-1 flex items-center justify-center px-4 py-10">

          <div className="w-full max-w-lg">

            {/* CARD */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-7 lg:p-9">

              {/* TITLE */}
              <div className="text-center mb-8">

                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl mb-5">
                  ⚖️
                </div>

                <h2 className="text-2xl lg:text-3xl font-bold font-serif-legal text-[#0B1F3A]">
                  User Verification & Role
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Configure your LegalPrecedent profile
                </p>

              </div>

              {/* FORM */}
              <div className="space-y-5">

                {/* NAME */}
                <div className="space-y-2">

                  <label className="text-sm font-semibold text-slate-700">
                    User Name / Advocate Title
                  </label>

                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(e) => {
                      setAuthForm({
                        ...authForm,
                        name: e.target.value
                      });
                      setAuthError("");
                    }}
                    placeholder="e.g. Adv. Rajesh Varma"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* EMAIL / PHONE */}
                <div className="space-y-2">

                  <label className="text-sm font-semibold text-slate-700">
                    Email ID or Phone Number
                  </label>

                  <input
                    type="text"
                    value={authForm.email}
                    onChange={(e) => {
                      setAuthForm({
                        ...authForm,
                        email: e.target.value
                      });
                      setAuthError("");
                    }}
                    placeholder="Enter email or phone number"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* ROLE */}
                <div className="space-y-2">

                  <label className="text-sm font-semibold text-slate-700">
                    Select User Category
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {meta.roles?.map((r) => (

                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setAuthForm({
                            ...authForm,
                            role: r
                          });
                          setAuthError("");
                        }}
                        className={`p-3.5 rounded-xl border text-left text-sm transition-all ${
                          authForm.role === r
                            ? 'bg-blue-50 border-[#0B1F3A] text-[#0B1F3A] font-bold shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >

                        <div className="flex items-center gap-2">

                          <span className="text-lg">
                            ⚖️
                          </span>

                          <span>
                            {r}
                          </span>

                          {authForm.role === r && (
                            <span className="ml-auto text-blue-700">
                              ✓
                            </span>
                          )}

                        </div>

                      </button>

                    ))}

                  </div>

                </div>

                {/* ERROR */}
                {authError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    ⚠️ {authError}
                  </div>
                )}

                {/* CONTINUE */}
                <button
                  onClick={handleProfileContinue}
                  className="w-full py-3.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132E52] text-white font-bold text-sm shadow-lg transition-all"
                >
                  Continue / Update Profile →
                </button>

              </div>

              {/* NOTE */}
              <div className="mt-6 p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-center">

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Your selected role helps customize your legal research workspace.
                </p>

              </div>

            </div>

            {/* DISCLAIMER */}
            <p className="text-center text-[11px] text-slate-400 mt-5">
              LegalPrecedent is a legal research assistance prototype.
            </p>

          </div>

        </main>

      </div>
    );
  }

  // ============================================================
  // MAIN APPLICATION
  // ============================================================
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">

      {/* ========================================================
          TOAST NOTIFICATION
      ======================================================== */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center gap-2 ${
            notification.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-700'
              : notification.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-emerald-50 border-emerald-300 text-emerald-700'
          }`}
        >
          <span className="text-lg">
            {notification.type === 'error'
              ? '⚠️'
              : '⚖️'}
          </span>

          <span className="text-sm font-medium">
            {notification.msg}
          </span>
        </div>
      )}

      {/* ========================================================
          TOP HEADER
      ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-sm">

        {/* LOGO */}
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] flex items-center justify-center shadow-md text-white font-bold text-xl">
            ⚖
          </div>

          <div>

            <div className="flex items-center gap-2">

              <h1 className="text-xl font-bold tracking-wider font-serif-legal text-[#0B1F3A]">
                Legal<span className="text-blue-700">
                  Precedent
                </span>
              </h1>

              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 rounded-full">
                Research AI
              </span>

            </div>

            <p className="text-xs text-slate-500">
              Indian Legal Precedents & Case Similarity Engine
            </p>

          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">

          {/* DASHBOARD */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={navButtonClass('dashboard')}
          >
            🏠 Dashboard
          </button>

          {/* SEARCH */}
          <button
            onClick={() => setActiveTab('search')}
            className={navButtonClass('search')}
          >
            🔍 Case Search
          </button>

          {/* EXPLORER */}
          <button
            onClick={() => setActiveTab('explorer')}
            className={navButtonClass('explorer')}
          >
            📚 Explorer
          </button>

          {/* COMPARE */}
          <button
            onClick={() => setActiveTab('compare')}
            className={`${navButtonClass('compare')} flex items-center gap-1.5`}
          >
            ⚖️ Compare

            {comparisonCases.length > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                {comparisonCases.length}
              </span>
            )}

          </button>

          {/* SAVED */}
          <button
            onClick={() => setActiveTab('saved')}
            className={`${navButtonClass('saved')} flex items-center gap-1.5`}
          >
            ⭐ Saved

            {savedCases.length > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                {savedCases.length}
              </span>
            )}

          </button>

        </nav>

        {/* USER PROFILE */}
        <div className="flex items-center gap-3">

          <button
            onClick={() => {
              setAuthForm({
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                otp: ""
              });
              setAuthError("");
              setShowAuthModal(true);
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all text-left group"
          >

            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-[#0B1F3A] flex items-center justify-center font-bold text-xs">
              {user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)}
            </div>

            <div className="hidden sm:block">

              <div className="text-xs font-semibold text-[#0B1F3A] leading-tight">
                {user.name}
              </div>

              <div className="text-[11px] text-blue-700 leading-tight">
                {user.role}
              </div>

            </div>

            <span className="text-xs text-slate-400">
              ⚙️
            </span>

          </button>

        </div>

      </header>

      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">

        {/* ======================================================
            DASHBOARD
        ====================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">

            {/* WELCOME HERO */}
            <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-lg p-8 lg:p-10">

              <div className="absolute right-0 top-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative">

                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-4">
                  ⚖️ Legal Research Workspace
                </span>

                <h2 className="text-3xl lg:text-4xl font-bold font-serif-legal text-[#0B1F3A]">
                  Welcome, {user.name}
                </h2>

                <p className="mt-3 text-slate-600 max-w-2xl leading-relaxed">
                  Your intelligent legal research dashboard.
                  Search judicial precedents, compare similar
                  cases, explore case law and manage your saved
                  research from one place.
                </p>

                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500">
                    Current Role:
                  </span>

                  <span className="text-xs font-bold text-[#0B1F3A]">
                    {user.role}
                  </span>
                </div>

              </div>

            </div>

            {/* DASHBOARD CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* SEARCH */}
              <button
                onClick={() => setActiveTab('search')}
                className="group text-left bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all"
              >

                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B1F3A] flex items-center justify-center text-xl mb-5 group-hover:scale-105 transition-transform">
                  🔍
                </div>

                <h3 className="text-lg font-bold text-[#0B1F3A]">
                  Case Search
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Enter your current case and discover similar judicial precedents using AI-assisted similarity matching.
                </p>

                <div className="mt-5 text-xs font-semibold text-blue-700">
                  Start Research →
                </div>

              </button>

              {/* EXPLORER */}
              <button
                onClick={() => setActiveTab('explorer')}
                className="group text-left bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all"
              >

                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B1F3A] flex items-center justify-center text-xl mb-5 group-hover:scale-105 transition-transform">
                  📚
                </div>

                <h3 className="text-lg font-bold text-[#0B1F3A]">
                  Precedent Explorer
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Browse and explore judicial case law, citations, courts and legal provisions.
                </p>

                <div className="mt-5 text-xs font-semibold text-blue-700">
                  Explore Cases →
                </div>

              </button>

              {/* COMPARE */}
              <button
                onClick={() => setActiveTab('compare')}
                className="group text-left bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all"
              >

                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B1F3A] flex items-center justify-center text-xl mb-5 group-hover:scale-105 transition-transform">
                  ⚖️
                </div>

                <h3 className="text-lg font-bold text-[#0B1F3A]">
                  Compare Matrix
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Compare your case with up to three judicial precedents across important legal dimensions.
                </p>

                <div className="mt-5 text-xs font-semibold text-blue-700">
                  Compare Cases →
                </div>

              </button>

              {/* SAVED */}
              <button
                onClick={() => setActiveTab('saved')}
                className="group text-left bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all"
              >

                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B1F3A] flex items-center justify-center text-xl mb-5 group-hover:scale-105 transition-transform">
                  ⭐
                </div>

                <h3 className="text-lg font-bold text-[#0B1F3A]">
                  Saved Cases
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Access your bookmarked precedents and previously saved legal research.
                </p>

                <div className="mt-5 text-xs font-semibold text-blue-700">
                  View Library →
                </div>

              </button>

            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Saved Precedents
                </p>

                <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                  {savedCases.length}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Comparison Cases
                </p>

                <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                  {comparisonCases.length}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Search Results
                </p>

                <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                  {searchResults.length}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================
            TAB 1: CASE SEARCH
        ====================================================== */}
        {activeTab === 'search' && (
          <div className="space-y-8">

            {/* HERO */}
            <div className="relative rounded-3xl p-6 lg:p-8 bg-[#0B1F3A] border border-blue-900 shadow-xl overflow-hidden">

              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-blue-100 border border-white/20 mb-2">
                    ✨ AI-Assisted Precedent Discovery
                  </span>

                  <h2 className="text-2xl lg:text-3xl font-bold font-serif-legal text-white">
                    Enter Current Case & Discover Judicial Precedents
                  </h2>

                  <p className="text-sm text-blue-100/80 max-w-2xl mt-1">
                    Describe your ongoing matter in plain language.
                    Our multi-factor similarity engine extracts
                    statutory provisions, offence dynamics, and
                    fact patterns to rank binding & persuasive
                    judgments.
                  </p>

                </div>

                {/* PRESETS */}
                <div className="flex flex-col gap-2">

                  <span className="text-xs text-blue-100/70 font-medium">
                    Quick Demo Presets:
                  </span>

                  <div className="flex flex-wrap gap-2">

                    {meta.demoPresets?.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleApplyPreset(p)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-blue-50 transition-all text-left"
                      >
                        ⚡ {p.title.split('(')[0]}
                      </button>
                    ))}

                  </div>

                </div>

              </div>

            </div>

            {/* FORM + RESULTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* FORM */}
              <div className="lg:col-span-5 space-y-6">

                <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm">

                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">

                    <h3 className="text-base font-bold font-serif-legal text-[#0B1F3A] flex items-center gap-2">
                      <span>📝</span>
                      Case Details & Parameters
                    </h3>

                    <span className="text-xs text-slate-500">
                      Step 1 of 3
                    </span>

                  </div>

                  {/* TITLE */}
                  <div className="space-y-1.5">

                    <label className="text-xs font-semibold text-slate-700">
                      Case Matter Title / Reference
                    </label>

                    <input
                      type="text"
                      value={caseForm.title}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          title: e.target.value
                        })
                      }
                      placeholder="e.g. State vs. Accused"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                    />

                  </div>

                  {/* OFFENCE + COURT */}
                  <div className="grid grid-cols-2 gap-3">

                    <div className="space-y-1.5">

                      <label className="text-xs font-semibold text-slate-700">
                        Offence Type
                      </label>

                      <input
                        type="text"
                        value={caseForm.offence}
                        onChange={(e) =>
                          setCaseForm({
                            ...caseForm,
                            offence: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                      />

                    </div>

                    <div className="space-y-1.5">

                      <label className="text-xs font-semibold text-slate-700">
                        Court / Bench
                      </label>

                      <select
                        value={caseForm.court}
                        onChange={(e) =>
                          setCaseForm({
                            ...caseForm,
                            court: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                      >

                        <option value="Madras High Court">
                          Madras High Court
                        </option>

                        <option value="Madras High Court (Madurai Bench)">
                          Madras HC (Madurai)
                        </option>

                        <option value="Supreme Court of India">
                          Supreme Court of India
                        </option>

                        <option value="Bombay High Court">
                          Bombay High Court
                        </option>

                        <option value="Delhi High Court">
                          Delhi High Court
                        </option>

                        <option value="Karnataka High Court">
                          Karnataka High Court
                        </option>

                      </select>

                    </div>

                  </div>

                  {/* LOCATION + PROVISIONS */}
                  <div className="grid grid-cols-2 gap-3">

                    <div className="space-y-1.5">

                      <label className="text-xs font-semibold text-slate-700">
                        Location / City
                      </label>

                      <input
                        type="text"
                        value={caseForm.location}
                        onChange={(e) =>
                          setCaseForm({
                            ...caseForm,
                            location: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                      />

                    </div>

                    <div className="space-y-1.5">

                      <label className="text-xs font-semibold text-slate-700">
                        Applicable Provisions
                      </label>

                      <input
                        type="text"
                        value={caseForm.legal_provision}
                        onChange={(e) =>
                          setCaseForm({
                            ...caseForm,
                            legal_provision: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                      />

                    </div>

                  </div>

                  {/* DESCRIPTION */}
                  <div className="space-y-1.5">

                    <div className="flex items-center justify-between">

                      <label className="text-xs font-semibold text-slate-700">
                        Case Facts & Circumstances
                      </label>

                      <span className="text-[11px] text-slate-400">
                        Plain legal language
                      </span>

                    </div>

                    <textarea
                      rows={4}
                      value={caseForm.case_description}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          case_description: e.target.value
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 resize-none leading-relaxed"
                    />

                  </div>

                  {/* REASON */}
                  <div className="space-y-1.5">

                    <label className="text-xs font-semibold text-slate-700">
                      Research Focus / Core Legal Issue
                    </label>

                    <input
                      type="text"
                      value={caseForm.reason}
                      onChange={(e) =>
                        setCaseForm({
                          ...caseForm,
                          reason: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />

                  </div>

                  {/* SEARCH BUTTON */}
                  <button
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="w-full py-3.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132E52] text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >

                    {isSearching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analyzing Case Factors...
                      </>
                    ) : (
                      <>
                        <span>⚖️</span>
                        Search & Rank Similar Precedents
                      </>
                    )}

                  </button>

                </div>

              </div>

              {/* RESULTS */}
              <div className="lg:col-span-7 space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">

                  <div>

                    <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">

                      <span>🎯</span>

                      Ranked Judicial Precedents

                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        {filteredResults.length} Matched
                      </span>

                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Ranked by composite factual, statutory & jurisdictional similarity
                    </p>

                  </div>

                  <div className="flex items-center gap-2">

                    <select
                      value={filterCourt}
                      onChange={(e) =>
                        setFilterCourt(e.target.value)
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 focus:outline-none"
                    >

                      <option value="All">
                        All Courts
                      </option>

                      <option value="Madras High Court">
                        Madras HC
                      </option>

                      <option value="Supreme Court">
                        Supreme Court
                      </option>

                      <option value="Bombay High Court">
                        Bombay HC
                      </option>

                      <option value="Delhi High Court">
                        Delhi HC
                      </option>

                      <option value="Karnataka High Court">
                        Karnataka HC
                      </option>

                    </select>

                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) =>
                        setSearchKeyword(e.target.value)
                      }
                      placeholder="Filter keyword..."
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-700 w-28 sm:w-36 focus:outline-none"
                    />

                  </div>

                </div>

                {filteredResults.length === 0 ? (

                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">

                    <p className="text-slate-500 text-sm">
                      {hasSearched
                        ? "No matching precedents found for the selected filter criteria."
                        : "Run a case search to view matching judicial precedents."}
                    </p>

                    <button
                      onClick={() => {
                        setFilterCourt('All');
                        setFilterYear('All');
                        setSearchKeyword('');
                      }}
                      className="mt-3 text-xs text-blue-700 hover:underline"
                    >
                      Reset Filters
                    </button>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {filteredResults.map((caseItem, idx) => {

                      const isSaved =
                        savedCases.some(
                          s =>
                            s.case_id ===
                            caseItem.case_id
                        );

                      const isCompared =
                        comparisonCases.some(
                          c =>
                            c.case_id ===
                            caseItem.case_id
                        );

                      return (
                        <div
                          key={caseItem.case_id}
                          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                        >

                          <div className="flex items-start justify-between gap-4 mb-3">

                            <div>

                              <div className="flex items-center gap-2 mb-1">

                                <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                                  #{idx + 1} • {caseItem.court_name} ({caseItem.year})
                                </span>

                                <span className="text-slate-300">
                                  •
                                </span>

                                <span className="text-[11px] text-slate-500 font-mono">
                                  {caseItem.citation}
                                </span>

                              </div>

                              <h4 className="text-base font-bold text-[#0B1F3A]">
                                {caseItem.title}
                              </h4>

                            </div>

                            <div className="flex flex-col items-end">

                              <div
                                className={`px-3 py-1 rounded-xl font-bold text-sm flex items-center gap-1.5 ${
                                  caseItem.similarity_score >= 80
                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                    : caseItem.similarity_score >= 60
                                    ? 'bg-amber-50 border border-amber-200 text-amber-700'
                                    : 'bg-blue-50 border border-blue-200 text-blue-700'
                                }`}
                              >

                                <span>⚡</span>

                                <span>
                                  {caseItem.similarity_score}% Match
                                </span>

                              </div>

                              <span className="text-[10px] text-slate-400 mt-1">
                                Multi-Factor Score
                              </span>

                            </div>

                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mb-3">

                            <span className="text-xs text-slate-500 font-medium mr-1">
                              Provisions:
                            </span>

                            {caseItem.legal_provisions.map(
                              (prov, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-md text-xs bg-slate-50 text-slate-700 border border-slate-200 font-mono"
                                >
                                  {prov}
                                </span>
                              )
                            )}

                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed mb-4">
                            {caseItem.circumstances}
                          </p>

                          {caseItem.why_similar &&
                            caseItem.why_similar.length > 0 && (
                              <div className="bg-blue-50 rounded-xl p-2.5 border border-blue-100 mb-4">

                                <div className="text-[11px] font-semibold text-blue-800 flex items-center gap-1">
                                  💡 Key Similarity Factor:
                                </div>

                                <div className="text-xs text-slate-700 mt-1">
                                  {caseItem.why_similar[0]}
                                </div>

                              </div>
                            )}

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">

                            <div className="flex items-center gap-2">

                              <button
                                onClick={() =>
                                  setSelectedCaseForWhy(
                                    caseItem
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-all"
                              >
                                🔍 Why Similar?
                              </button>

                              <button
                                onClick={() =>
                                  setSelectedCaseForJudgment(
                                    caseItem
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all"
                              >
                                📜 View Judgment
                              </button>

                            </div>

                            <div className="flex items-center gap-2">

                              <button
                                onClick={() =>
                                  handleToggleCompare(
                                    caseItem
                                  )
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                  isCompared
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                                }`}
                              >
                                ⚖️ {isCompared
                                  ? 'Comparing ✓'
                                  : 'Compare'}
                              </button>

                              <button
                                onClick={() =>
                                  handleToggleSave(
                                    caseItem
                                  )
                                }
                                className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                                  isSaved
                                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300'
                                }`}
                              >
                                {isSaved
                                  ? '★ Saved'
                                  : '☆ Save'}
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

        {/* ======================================================
            TAB 2: PRECEDENT EXPLORER
        ====================================================== */}
        {activeTab === 'explorer' && (
          <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

              <div>

                <h2 className="text-xl font-bold font-serif-legal text-[#0B1F3A]">
                  Precedents Case Law Library
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Explore verified judgments across Indian High Courts & Supreme Court
                </p>

              </div>

              <input
                type="text"
                placeholder="Search offences, citations, provisions..."
                value={searchKeyword}
                onChange={(e) =>
                  setSearchKeyword(e.target.value)
                }
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-sm w-64 focus:border-blue-600 focus:outline-none"
              />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {searchResults.map(c => (

                <div
                  key={c.case_id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <span className="text-[11px] text-blue-700 font-mono">
                        {c.citation}
                      </span>

                      <h4 className="text-base font-bold text-[#0B1F3A]">
                        {c.title}
                      </h4>

                    </div>

                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium">
                      {c.year}
                    </span>

                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {c.case_description}
                  </p>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">

                    <span className="text-xs text-slate-500">
                      {c.court_name}
                    </span>

                    <button
                      onClick={() =>
                        setSelectedCaseForJudgment(c)
                      }
                      className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
                    >
                      Read Full Judgment →
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>
        )}

        {/* ======================================================
            TAB 3: COMPARE MATRIX
        ====================================================== */}
        {activeTab === 'compare' && (
          <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

              <div>

                <h2 className="text-xl font-bold font-serif-legal text-[#0B1F3A] flex items-center gap-2">
                  <span>⚖️</span>
                  Side-by-Side Case Comparison Matrix
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Compare your ongoing matter with selected precedent rulings across facts, legal provisions, court reasoning, and final decisions.
                </p>

              </div>

              <div className="flex items-center gap-2">

                <button
                  onClick={() =>
                    setActiveTab('search')
                  }
                  className="px-3 py-1.5 rounded-lg text-xs bg-[#0B1F3A] hover:bg-[#132E52] text-white"
                >
                  + Add More Cases
                </button>

                {comparisonCases.length > 0 && (
                  <button
                    onClick={() =>
                      setComparisonCases([])
                    }
                    className="px-3 py-1.5 rounded-lg text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                  >
                    Clear Comparison
                  </button>
                )}

              </div>

            </div>

            {comparisonCases.length === 0 ? (

              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">

                <p className="text-slate-500 text-sm">
                  No precedent cases selected for comparison yet.
                </p>

                <button
                  onClick={() =>
                    setActiveTab('search')
                  }
                  className="mt-4 px-4 py-2 rounded-xl bg-[#0B1F3A] text-white font-bold text-xs"
                >
                  Search & Select Precedents
                </button>

              </div>

            ) : (

              <div className="overflow-x-auto pb-4">

                <table className="w-full border-collapse text-left text-xs bg-white rounded-2xl overflow-hidden border border-slate-200">

                  <thead>

                    <tr className="bg-slate-50 border-b border-slate-200">

                      <th className="p-4 w-44 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                        Comparison Dimension
                      </th>

                      <th className="p-4 min-w-[280px] bg-blue-50 border-l border-r border-blue-200 text-[#0B1F3A] font-bold text-sm">

                        📌 Your Current Matter

                        <div className="text-[11px] font-normal text-slate-600 mt-0.5">
                          {caseForm.title}
                        </div>

                      </th>

                      {comparisonCases.map(c => (

                        <th
                          key={c.case_id}
                          className="p-4 min-w-[280px] border-r border-slate-200 text-[#0B1F3A] font-bold text-sm"
                        >

                          <div className="flex items-center justify-between">

                            <span>
                              🏛️ Precedent: {c.case_id}
                            </span>

                            <button
                              onClick={() =>
                                handleToggleCompare(c)
                              }
                              className="text-slate-400 hover:text-red-500 text-xs"
                            >
                              ✕
                            </button>

                          </div>

                          <div className="text-xs font-semibold text-blue-800 mt-0.5">
                            {c.title}
                          </div>

                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {c.citation} ({c.year})
                          </div>

                        </th>

                      ))}

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-200">

                    <tr className="hover:bg-slate-50">

                      <td className="p-4 font-semibold text-slate-700 bg-slate-50">
                        Offence Type
                      </td>

                      <td className="p-4 bg-blue-50/50 border-l border-r border-blue-200 font-medium text-[#0B1F3A]">
                        {caseForm.offence}
                      </td>

                      {comparisonCases.map(c => (
                        <td
                          key={c.case_id}
                          className="p-4 border-r border-slate-200 text-slate-700"
                        >
                          {c.offence}
                        </td>
                      ))}

                    </tr>

                    <tr className="hover:bg-slate-50">

                      <td className="p-4 font-semibold text-slate-700 bg-slate-50">
                        Court & Jurisdiction
                      </td>

                      <td className="p-4 bg-blue-50/50 border-l border-r border-blue-200 text-slate-700">
                        {caseForm.court} • {caseForm.location}
                      </td>

                      {comparisonCases.map(c => (
                        <td
                          key={c.case_id}
                          className="p-4 border-r border-slate-200 text-slate-700"
                        >
                          {c.court_name} • {c.location}
                        </td>
                      ))}

                    </tr>

                    <tr className="hover:bg-slate-50">

                      <td className="p-4 font-semibold text-slate-700 bg-slate-50">
                        Legal Provisions Invoked
                      </td>

                      <td className="p-4 bg-blue-50/50 border-l border-r border-blue-200">

                        <span className="px-2 py-1 rounded bg-slate-100 text-blue-800 font-mono text-xs">
                          {caseForm.legal_provision}
                        </span>

                      </td>

                      {comparisonCases.map(c => (

                        <td
                          key={c.case_id}
                          className="p-4 border-r border-slate-200"
                        >

                          <div className="flex flex-wrap gap-1">

                            {c.legal_provisions.map(
                              (p, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]"
                                >
                                  {p}
                                </span>
                              )
                            )}

                          </div>

                        </td>

                      ))}

                    </tr>

                    <tr className="hover:bg-slate-50">

                      <td className="p-4 font-semibold text-slate-700 bg-slate-50">
                        Factual Circumstances
                      </td>

                      <td className="p-4 bg-blue-50/50 border-l border-r border-blue-200 text-slate-700 leading-relaxed">
                        {caseForm.case_description}
                      </td>

                      {comparisonCases.map(c => (
                        <td
                          key={c.case_id}
                          className="p-4 border-r border-slate-200 text-slate-700 leading-relaxed"
                        >
                          {c.circumstances}
                        </td>
                      ))}

                    </tr>

                    <tr className="hover:bg-slate-50">

                      <td className="p-4 font-semibold text-slate-700 bg-slate-50">
                        Weapon / Means
                      </td>

                      <td className="p-4 bg-blue-50/50 border-l border-r border-blue-200 text-slate-700">
                        12-inch Butcher Knife
                      </td>

                      {comparisonCases.map(c => (
                        <td
                          key={c.case_id}
                          className="p-4 border-r border-slate-200 text-slate-700"
                        >
                          {c.weapon}
                        </td>
                      ))}

                    </tr>

                    <tr className="hover:bg-slate-50">

                      <td className="p-4 font-semibold text-slate-700 bg-slate-50">
                        Court's Judicial Reasoning (Ratio)
                      </td>

                      <td className="p-4 bg-blue-50/50 border-l border-r border-blue-200 text-slate-500 italic">
                        [Pending determination based on precedent analysis]
                      </td>

                      {comparisonCases.map(c => (
                        <td
                          key={c.case_id}
                          className="p-4 border-r border-slate-200 text-slate-700 leading-relaxed"
                        >
                          {c.judgment
                            ? c.judgment.court_reasoning
                            : "Refer to complete judgment"}
                        </td>
                      ))}

                    </tr>

                    <tr className="hover:bg-slate-50">

                      <td className="p-4 font-semibold text-slate-700 bg-slate-50">
                        Final Decision / Verdict
                      </td>

                      <td className="p-4 bg-blue-50/50 border-l border-r border-blue-200 text-blue-800 font-medium">
                        Targeting relief based on matched precedents.
                      </td>

                      {comparisonCases.map(c => (
                        <td
                          key={c.case_id}
                          className="p-4 border-r border-slate-200 text-emerald-700 font-medium"
                        >
                          {c.judgment
                            ? c.judgment.final_decision
                            : "Refer to judgment"}
                        </td>
                      ))}

                    </tr>

                  </tbody>

                </table>

              </div>
            )}

          </div>
        )}

        {/* ======================================================
            TAB 4: SAVED PRECEDENTS
        ====================================================== */}
        {activeTab === 'saved' && (
          <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">

              <div>

                <h2 className="text-xl font-bold font-serif-legal text-[#0B1F3A] flex items-center gap-2">
                  <span>⭐</span>
                  Saved Precedents Library
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Bookmarked court rulings and research notes for quick brief preparation
                </p>

              </div>

              <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {savedCases.length} Precedents Bookmarked
              </span>

            </div>

            {savedCases.length === 0 ? (

              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">

                <p className="text-slate-500 text-sm">
                  No saved cases yet. Click the ☆ Save button on any case in search results.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {savedCases.map(saved => {

                  const caseData =
                    saved.case_details ||
                    searchResults.find(
                      c =>
                        c.case_id ===
                        saved.case_id
                    ) ||
                    {};

                  return (

                    <div
                      key={saved.saved_id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
                    >

                      <div className="flex items-start justify-between">

                        <div>

                          <span className="text-[11px] text-blue-700 font-mono">
                            {caseData.citation ||
                              saved.case_id}
                          </span>

                          <h4 className="text-base font-bold text-[#0B1F3A]">
                            {caseData.title ||
                              "Precedent Case"}
                          </h4>

                        </div>

                        <button
                          onClick={() =>
                            handleToggleSave({
                              case_id:
                                saved.case_id
                            })
                          }
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>

                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">

                        <span className="font-semibold text-[#0B1F3A] block mb-1">
                          📝 Advocate Notes:
                        </span>

                        {saved.notes}

                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">

                        <span className="text-slate-500">
                          Saved on:{" "}
                          {new Date(
                            saved.saved_at
                          ).toLocaleDateString()}
                        </span>

                        <button
                          onClick={() =>
                            setSelectedCaseForJudgment(
                              caseData
                            )
                          }
                          className="text-blue-700 hover:underline font-semibold"
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

      {/* ========================================================
          MODAL 1: WHY SIMILAR
      ======================================================== */}
      {selectedCaseForWhy && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">

          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-start justify-between border-b border-slate-200 pb-4">

              <div>

                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  Similarity Breakdown •{" "}
                  {selectedCaseForWhy.similarity_score}% Composite Score
                </span>

                <h3 className="text-xl font-bold font-serif-legal text-[#0B1F3A] mt-1">
                  Why is this case similar to yours?
                </h3>

                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {selectedCaseForWhy.title} (
                  {selectedCaseForWhy.citation})
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedCaseForWhy(null)
                }
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm"
              >
                ✕
              </button>

            </div>

            <div className="space-y-3">

              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                Executive Relevance Summary:
              </h4>

              <div className="space-y-2">

                {selectedCaseForWhy.why_similar?.map(
                  (point, idx) => (

                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200"
                    >

                      <span className="text-blue-700 text-sm mt-0.5">
                        ✓
                      </span>

                      <span className="text-xs text-slate-700 leading-relaxed">
                        {point}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

            <div className="space-y-3">

              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Factor Weight Matrix:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">

                  <div className="flex justify-between text-xs font-semibold mb-1">

                    <span className="text-slate-700">
                      Offence Type
                    </span>

                    <span className="text-emerald-700">
                      {selectedCaseForWhy.factor_breakdown?.offence?.score || 90}%
                    </span>

                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5">

                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{
                        width: `${
                          selectedCaseForWhy.factor_breakdown?.offence?.score ||
                          90
                        }%`
                      }}
                    ></div>

                  </div>

                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">

                  <div className="flex justify-between text-xs font-semibold mb-1">

                    <span className="text-slate-700">
                      Statutory Provisions
                    </span>

                    <span className="text-amber-700">
                      {selectedCaseForWhy.factor_breakdown?.provisions?.score || 85}%
                    </span>

                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5">

                    <div
                      className="bg-amber-500 h-1.5 rounded-full"
                      style={{
                        width: `${
                          selectedCaseForWhy.factor_breakdown?.provisions?.score ||
                          85
                        }%`
                      }}
                    ></div>

                  </div>

                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">

                  <div className="flex justify-between text-xs font-semibold mb-1">

                    <span className="text-slate-700">
                      Factual Context
                    </span>

                    <span className="text-blue-700">
                      {selectedCaseForWhy.similarity_score}%
                    </span>

                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5">

                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{
                        width: `${selectedCaseForWhy.similarity_score}%`
                      }}
                    ></div>

                  </div>

                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">

                  <div className="flex justify-between text-xs font-semibold mb-1">

                    <span className="text-slate-700">
                      Modus Operandi & Means
                    </span>

                    <span className="text-purple-700">
                      {selectedCaseForWhy.factor_breakdown?.circumstances?.score || 80}%
                    </span>

                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5">

                    <div
                      className="bg-purple-600 h-1.5 rounded-full"
                      style={{
                        width: `${
                          selectedCaseForWhy.factor_breakdown?.circumstances?.score ||
                          80
                        }%`
                      }}
                    ></div>

                  </div>

                </div>

              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">

              <button
                onClick={() => {

                  const target =
                    selectedCaseForWhy;

                  setSelectedCaseForWhy(null);

                  setSelectedCaseForJudgment(
                    target
                  );

                }}
                className="px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#132E52] text-white font-bold text-xs"
              >
                Proceed to View Judgment →
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          MODAL 2: FULL JUDGMENT
      ======================================================== */}
      {selectedCaseForJudgment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">

          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-3xl w-full border border-slate-200 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">

            <div className="flex items-start justify-between border-b border-slate-200 pb-4">

              <div>

                <div className="flex items-center gap-2 mb-1">

                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-xs font-mono font-semibold">
                    {selectedCaseForJudgment.citation}
                  </span>

                  <span className="text-xs text-slate-500">
                    • {selectedCaseForJudgment.court_name} (
                    {selectedCaseForJudgment.year})
                  </span>

                </div>

                <h3 className="text-xl font-bold font-serif-legal text-[#0B1F3A]">
                  {selectedCaseForJudgment.title}
                </h3>

              </div>

              <button
                onClick={() =>
                  setSelectedCaseForJudgment(null)
                }
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4 text-xs">

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">

                <h4 className="font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <span>📌</span>
                  1. Factual Matrix & Background
                </h4>

                <p className="text-slate-700 leading-relaxed">
                  {selectedCaseForJudgment.judgment?.case_facts ||
                    selectedCaseForJudgment.circumstances}
                </p>

              </div>

              {selectedCaseForJudgment.judgment?.legal_issues && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">

                  <h4 className="font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                    <span>⚖️</span>
                    2. Points of Law & Issues Framed
                  </h4>

                  <pre className="text-slate-700 font-sans whitespace-pre-wrap leading-relaxed">
                    {selectedCaseForJudgment.judgment.legal_issues}
                  </pre>

                </div>
              )}

              {selectedCaseForJudgment.judgment?.arguments && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">

                  <h4 className="font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                    <span>🗣️</span>
                    3. Contentions & Arguments of Counsel
                  </h4>

                  <p className="text-slate-700 leading-relaxed">
                    {selectedCaseForJudgment.judgment.arguments}
                  </p>

                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1.5">

                <h4 className="font-bold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <span>🏛️</span>
                  4. Court's Reasoning & Ratio Decidendi
                </h4>

                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedCaseForJudgment.judgment?.court_reasoning ||
                    "Reasoning recorded in official law report."}
                </p>

              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5">

                <h4 className="font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <span>📜</span>
                  5. Operative Order & Final Decision
                </h4>

                <p className="text-emerald-800 leading-relaxed font-semibold">
                  {selectedCaseForJudgment.judgment?.final_decision ||
                    "Refer to certified copy."}
                </p>

              </div>

            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">

              <button
                onClick={() =>
                  handleToggleSave(
                    selectedCaseForJudgment
                  )
                }
                className="text-xs text-slate-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
              >
                ⭐ Bookmark Precedent
              </button>

              <button
                onClick={() =>
                  setSelectedCaseForJudgment(null)
                }
                className="px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#132E52] text-white text-xs font-semibold"
              >
                Close Viewer
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          MODAL 3: UPDATE PROFILE
      ======================================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">

            <div className="flex items-start justify-between border-b border-slate-200 pb-3">

              <div>

                <h3 className="text-lg font-bold font-serif-legal text-[#0B1F3A]">
                  User Verification & Role
                </h3>

                <p className="text-xs text-slate-500">
                  Update your LegalPrecedent profile
                </p>

              </div>

              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError("");
                }}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs"
              >
                ✕
              </button>

            </div>

            <div className="space-y-3 text-xs">

              {/* NAME */}
              <div className="space-y-1">

                <label className="text-slate-700 font-medium">
                  User Name / Advocate Title
                </label>

                <input
                  type="text"
                  value={authForm.name}
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      name: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                />

              </div>

              {/* EMAIL */}
              <div className="space-y-1">

                <label className="text-slate-700 font-medium">
                  Email ID or Phone Number
                </label>

                <input
                  type="text"
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      email: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
                />

              </div>

              {/* ROLE */}
              <div className="space-y-1">

                <label className="text-slate-700 font-medium">
                  Select User Category
                </label>

                <div className="grid grid-cols-2 gap-2">

                  {meta.roles?.map(r => (

                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setAuthForm({
                          ...authForm,
                          role: r
                        })
                      }
                      className={`p-2 rounded-xl border text-left text-xs transition-all ${
                        authForm.role === r
                          ? 'bg-blue-50 border-[#0B1F3A] text-[#0B1F3A] font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      ⚖️ {r}
                    </button>

                  ))}

                </div>

              </div>

              {authError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700">
                  ⚠️ {authError}
                </div>
              )}

            </div>

            <button
              onClick={handleProfileContinue}
              className="w-full py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#132E52] text-white font-bold text-xs transition-all"
            >
              Continue / Update Profile
            </button>

          </div>

        </div>
      )}

      {/* ========================================================
          FOOTER
      ======================================================== */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-6 px-4 lg:px-8 text-center text-xs text-slate-500 space-y-2">

        <div className="max-w-4xl mx-auto p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-slate-600 text-[11px] leading-relaxed">

          <span className="font-bold text-[#0B1F3A]">
            ⚖️ PROTOTYPE DISCLAIMER:
          </span>{" "}

          LegalPrecedent is a research assistance prototype.
          It does not provide legal advice, predict court outcomes,
          or replace professional legal judgment. Demo cases and
          judgments are curated for legal precedent research
          prototyping.

        </div>

        <p className="text-[11px] text-slate-500">
          LegalPrecedent © 2026 • Powered by Multi-Factor Precedent Similarity Engine
        </p>

      </footer>

    </div>
  );
}