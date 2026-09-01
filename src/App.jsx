import React, { useState, useEffect } from 'react';

import {
  fetchMetadata,
  searchSimilarCases,
  fetchSavedCases,
  toggleSaveCase
} from './services/api';

/*
=========================================================
LEGALPRECEDENT
NAVY BLUE + WHITE THEME
=========================================================

Primary Navy: #0B1F3A
Dark Navy:    #07162B
Light Navy:   #EAF0F7
White:        #FFFFFF
*/

export default function App() {

  /* =========================================================
     USER / ROLE STATE
  ========================================================= */

  const [hasSelectedRole, setHasSelectedRole] = useState(false);

  const [activeTab, setActiveTab] = useState('search');

  const [user, setUser] = useState({
    user_id: 1,
    name: '',
    email: '',
    role: '',
    phone: ''
  });

  const [showAuthModal, setShowAuthModal] = useState(false);

  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    otp: ''
  });

  /* =========================================================
     METADATA
  ========================================================= */

  const [meta, setMeta] = useState({
    courts: [],
    legalProvisions: [],
    demoPresets: [],
    roles: [
      'Lawyer',
      'Legal Researcher',
      'Law Student',
      'Law Firm',
      'Legal Intern'
    ]
  });

  /* =========================================================
     CASE FORM
  ========================================================= */

  const [caseForm, setCaseForm] = useState({
    title: 'Robbery at Jewellery Store with Knife',
    offence: 'Armed Robbery / Dacoity',
    court: 'Madras High Court',
    location: 'Chennai, Tamil Nadu',
    legal_provision: 'IPC Section 392, Section 397 (BNS 309, 311)',
    case_description:
      'Two men entered a jewellery store in T. Nagar, Chennai. One brandished a 12-inch butcher knife at the owner while the other broke the counter glass and stole 350 grams of gold chains. Minor forearm cut caused to cashier. Accused arrested 2 days later with recovery of gold.',
    reason:
      'Finding precedents on Section 397 IPC mandatory minimum 7-year sentence applicability when injury is superficial.'
  });

  /* =========================================================
     SEARCH STATE
  ========================================================= */

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  /* =========================================================
     FILTER STATE
  ========================================================= */

  const [filterCourt, setFilterCourt] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterMinScore, setFilterMinScore] = useState(50);
  const [searchKeyword, setSearchKeyword] = useState('');

  /* =========================================================
     MODAL STATE
  ========================================================= */

  const [selectedCaseForWhy, setSelectedCaseForWhy] = useState(null);

  const [selectedCaseForJudgment, setSelectedCaseForJudgment] =
    useState(null);

  /* =========================================================
     SAVED / COMPARE
  ========================================================= */

  const [comparisonCases, setComparisonCases] = useState([]);
  const [savedCases, setSavedCases] = useState([]);

  /* =========================================================
     NOTIFICATION
  ========================================================= */

  const [notification, setNotification] = useState(null);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    async function init() {

      try {

        const metadata = await fetchMetadata();

        if (metadata) {

          setMeta({
            courts: metadata.courts || [],
            legalProvisions:
              metadata.legalProvisions || [],
            demoPresets:
              metadata.demoPresets || [],
            roles:
              metadata.roles?.length
                ? metadata.roles
                : [
                    'Lawyer',
                    'Legal Researcher',
                    'Law Student',
                    'Law Firm',
                    'Legal Intern'
                  ]
          });

        }

        await loadSavedCases();

      } catch (error) {

        console.error(
          'Initialization error:',
          error
        );

      }

    }

    init();

  }, []);

  /* =========================================================
     TOAST
  ========================================================= */

  const showToast = (
    msg,
    type = 'success'
  ) => {

    setNotification({
      msg,
      type
    });

    setTimeout(() => {
      setNotification(null);
    }, 3500);

  };

  /* =========================================================
     SAVED CASES
  ========================================================= */

  const loadSavedCases = async () => {

    try {

      const res = await fetchSavedCases();

      if (
        res &&
        res.saved_cases
      ) {

        setSavedCases(
          res.saved_cases
        );

      }

    } catch (error) {

      console.error(
        'Saved cases error:',
        error
      );

    }

  };

  /* =========================================================
     ROLE SELECTION
  ========================================================= */

  const handleRoleSelection = (
    role
  ) => {

    setAuthForm({
      ...authForm,
      role
    });

  };

  const handleEnterDashboard = () => {

    if (!authForm.role) {

      showToast(
        'Please select your professional role',
        'error'
      );

      return;

    }

    setUser({
      ...user,
      name:
        authForm.name ||
        'Legal Research User',
      email:
        authForm.email ||
        '',
      role:
        authForm.role,
      phone:
        authForm.phone ||
        ''
    });

    setHasSelectedRole(true);

    setActiveTab('search');

    showToast(
      `Welcome! Dashboard configured for ${authForm.role}.`
    );

  };

  /* =========================================================
     PRESET
  ========================================================= */

  const handleApplyPreset = (
    preset
  ) => {

    setCaseForm({

      title: preset.title,

      offence: preset.offence,

      court: preset.court,

      location: preset.location,

      legal_provision:
        preset.provisions,

      case_description:
        preset.description,

      reason:
        preset.reason

    });

    showToast(
      `Loaded preset: ${preset.title}`
    );

  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = async (
    formToSearch = caseForm
  ) => {

    setIsSearching(true);

    try {

      const res =
        await searchSimilarCases(
          formToSearch
        );

      if (
        res &&
        res.results
      ) {

        setSearchResults(
          res.results
        );

        setHasSearched(true);

        if (
          res.results.length >= 2
        ) {

          setComparisonCases([
            res.results[0],
            res.results[1]
          ]);

        } else if (
          res.results.length === 1
        ) {

          setComparisonCases([
            res.results[0]
          ]);

        } else {

          setComparisonCases([]);

        }

      }

    } catch (err) {

      console.error(err);

      showToast(
        'Error searching precedents',
        'error'
      );

    } finally {

      setIsSearching(false);

    }

  };

  /* =========================================================
     SAVE / UNSAVE
  ========================================================= */

  const handleToggleSave = async (
    caseItem
  ) => {

    try {

      const isAlreadySaved =
        savedCases.some(
          s =>
            s.case_id ===
            caseItem.case_id
        );

      await toggleSaveCase(
        caseItem
      );

      await loadSavedCases();

      showToast(
        isAlreadySaved
          ? 'Case removed from saved library'
          : 'Case bookmarked to saved library'
      );

    } catch (error) {

      console.error(error);

      showToast(
        'Unable to update saved case',
        'error'
      );

    }

  };

  /* =========================================================
     COMPARE
  ========================================================= */

  const handleToggleCompare = (
    caseItem
  ) => {

    const exists =
      comparisonCases.some(
        c =>
          c.case_id ===
          caseItem.case_id
      );

    if (exists) {

      setComparisonCases(
        comparisonCases.filter(
          c =>
            c.case_id !==
            caseItem.case_id
        )
      );

      showToast(
        'Removed case from comparison'
      );

      return;

    }

    if (
      comparisonCases.length >= 3
    ) {

      showToast(
        'Maximum 3 cases can be compared',
        'warning'
      );

      return;

    }

    setComparisonCases([
      ...comparisonCases,
      caseItem
    ]);

    showToast(
      'Added to comparison matrix'
    );

  };

  /* =========================================================
     FILTERS
  ========================================================= */

  const filteredResults =
    searchResults.filter(
      item => {

        if (
          filterCourt !== 'All' &&
          !item.court_name
            ?.toLowerCase()
            .includes(
              filterCourt.toLowerCase()
            )
        ) {
          return false;
        }

        if (
          filterYear !== 'All' &&
          String(item.year) !==
            String(filterYear)
        ) {
          return false;
        }

        if (
          item.similarity_score <
          filterMinScore
        ) {
          return false;
        }

        if (
          searchKeyword.trim()
        ) {

          const kw =
            searchKeyword.toLowerCase();

          const match =
            item.title
              ?.toLowerCase()
              .includes(kw) ||

            item.offence
              ?.toLowerCase()
              .includes(kw) ||

            item.legal_provisions
              ?.some(
                p =>
                  p
                    .toLowerCase()
                    .includes(kw)
              ) ||

            item.circumstances
              ?.toLowerCase()
              .includes(kw);

          if (!match) {
            return false;
          }

        }

        return true;

      }
    );

  /* =========================================================
     NAVIGATION / STYLE HELPERS
  ========================================================= */

  const navClass = (
    tab
  ) =>
    `px-4 py-2.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
      activeTab === tab
        ? 'bg-[#0B1F3A] text-white'
        : 'text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white'
    }`;

  const inputClass =
    'w-full px-3.5 py-3 rounded-md bg-white border-2 border-[#0B1F3A] text-sm text-[#0B1F3A] placeholder:text-[#0B1F3A]/40 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]';

  const secondaryButton =
    'px-3.5 py-2 rounded-md text-xs font-semibold border-2 border-[#0B1F3A] bg-white text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white transition-all';

  /* =========================================================
     ROLE SELECTION SCREEN
  ========================================================= */

  if (!hasSelectedRole) {

    return (

      <div className="min-h-screen bg-white text-[#0B1F3A] flex flex-col font-sans">

        {/* HEADER */}

        <header className="border-b-2 border-[#0B1F3A] px-5 lg:px-10 py-5">

          <div className="max-w-7xl mx-auto flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 bg-[#0B1F3A] text-white flex items-center justify-center text-2xl font-serif border-2 border-[#0B1F3A]">
                ⚖
              </div>

              <div>

                <div className="flex items-center gap-3">

                  <h1 className="text-xl lg:text-2xl font-black tracking-tight font-serif">
                    LEGAL
                    <span className="font-normal">
                      PRECEDENT
                    </span>
                  </h1>

                  <span className="hidden sm:inline-block px-2 py-1 text-[9px] font-black tracking-widest uppercase border border-[#0B1F3A]">
                    RESEARCH AI
                  </span>

                </div>

                <p className="text-[10px] uppercase tracking-widest font-medium mt-1">
                  Indian Legal Precedents & Case Similarity Engine
                </p>

              </div>

            </div>

            <div className="hidden md:block text-[10px] font-black uppercase tracking-widest">
              Secure Research Workspace
            </div>

          </div>

        </header>

        {/* ROLE DASHBOARD */}

        <main className="flex-1 flex items-center justify-center px-4 py-10 lg:py-16">

          <div className="w-full max-w-6xl">

            <div className="grid lg:grid-cols-[0.85fr_1.15fr] border-2 border-[#0B1F3A]">

              {/* LEFT PANEL */}

              <div className="bg-[#0B1F3A] text-white p-8 lg:p-12 flex flex-col justify-between">

                <div>

                  <div className="inline-block border border-white px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-7">
                    Welcome to LegalPrecedent
                  </div>

                  <h2 className="text-4xl lg:text-6xl font-black font-serif leading-tight">
                    Your legal
                    <br />
                    research
                    <br />
                    workspace.
                  </h2>

                  <p className="mt-6 text-sm leading-relaxed text-white/80 max-w-md">
                    Select your professional role to configure
                    your research dashboard and access the tools
                    most relevant to your legal workflow.
                  </p>

                </div>

                <div className="mt-12 pt-6 border-t border-white/40">

                  <div className="text-[9px] uppercase tracking-widest font-black">
                    AI-ASSISTED LEGAL RESEARCH
                  </div>

                  <p className="text-xs text-white/60 mt-2">
                    Search precedents, compare judgments,
                    analyse similarity and maintain your
                    research library.
                  </p>

                </div>

              </div>

              {/* RIGHT PANEL */}

              <div className="p-7 lg:p-12 bg-white">

                <div className="mb-8">

                  <div className="text-[10px] font-black uppercase tracking-widest">
                    Step 01 / 01
                  </div>

                  <h3 className="text-3xl lg:text-4xl font-serif font-black mt-2">
                    Select your role
                  </h3>

                  <p className="text-sm mt-3 leading-relaxed">
                    Tell us how you use LegalPrecedent.
                    Your role helps personalize the research
                    workspace.
                  </p>

                </div>

                {/* NAME */}

                <div className="mb-5">

                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                    Your Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm({
                        ...authForm,
                        name: e.target.value
                      })
                    }
                    className={inputClass}
                  />

                </div>

                {/* EMAIL */}

                <div className="mb-7">

                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                    Email / Phone
                  </label>

                  <input
                    type="text"
                    placeholder="Enter email or phone"
                    value={authForm.email}
                    onChange={(e) =>
                      setAuthForm({
                        ...authForm,
                        email: e.target.value
                      })
                    }
                    className={inputClass}
                  />

                </div>

                {/* ROLE */}

                <div>

                  <div className="flex items-center justify-between mb-3">

                    <label className="block text-[10px] font-black uppercase tracking-widest">
                      Professional Role
                    </label>

                    {authForm.role && (

                      <span className="text-[10px] font-black">
                        SELECTED: {authForm.role.toUpperCase()}
                      </span>

                    )}

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {meta.roles.map(
                      (role) => (

                        <button
                          key={role}
                          type="button"
                          onClick={() =>
                            handleRoleSelection(
                              role
                            )
                          }
                          className={`p-4 border-2 border-[#0B1F3A] text-left transition-all ${
                            authForm.role ===
                            role
                              ? 'bg-[#0B1F3A] text-white shadow-[5px_5px_0px_#07162B]'
                              : 'bg-white text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white'
                          }`}
                        >

                          <div className="flex items-center justify-between">

                            <span className="text-xs font-black">
                              {role}
                            </span>

                            <span className="text-sm">
                              {authForm.role ===
                              role
                                ? '✓'
                                : '→'}
                            </span>

                          </div>

                          <div
                            className={`text-[10px] mt-2 ${
                              authForm.role ===
                              role
                                ? 'text-white/70'
                                : 'text-[#0B1F3A]/50'
                            }`}
                          >

                            {role ===
                              'Lawyer' &&
                              'Case preparation & precedent research'}

                            {role ===
                              'Legal Researcher' &&
                              'Judicial research & legal analysis'}

                            {role ===
                              'Law Student' &&
                              'Academic research & case learning'}

                            {role ===
                              'Law Firm' &&
                              'Firm-wide legal research workspace'}

                            {role ===
                              'Legal Intern' &&
                              'Assisted research & case discovery'}

                          </div>

                        </button>

                      )
                    )}

                  </div>

                </div>

                {/* CONTINUE */}

                <button
                  onClick={
                    handleEnterDashboard
                  }
                  className="w-full mt-8 py-4 bg-[#0B1F3A] text-white border-2 border-[#0B1F3A] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-[#0B1F3A] transition-all"
                >
                  ENTER MY DASHBOARD →
                </button>

                <p className="text-[9px] text-[#0B1F3A]/50 text-center mt-4 uppercase tracking-wider">
                  You can change your role later from Profile & Role
                </p>

              </div>

            </div>

          </div>

        </main>

        {/* FOOTER */}

        <footer className="border-t-2 border-[#0B1F3A] py-5 px-4">

          <div className="max-w-6xl mx-auto flex justify-between text-[9px] uppercase tracking-widest font-bold">

            <span>
              LEGALPRECEDENT © 2026
            </span>

            <span>
              AI LEGAL RESEARCH SYSTEM
            </span>

          </div>

        </footer>

      </div>

    );

  }

  /* =========================================================
     MAIN APPLICATION
  ========================================================= */

  return (

    <div className="min-h-screen bg-white text-[#0B1F3A] flex flex-col font-sans">

      {/* =====================================================
          TOAST
      ===================================================== */}

      {notification && (

        <div
          className={`fixed top-5 right-5 z-[100] max-w-sm px-5 py-4 bg-white text-[#0B1F3A] border-2 border-[#0B1F3A] shadow-[6px_6px_0px_#07162B]`}
        >

          <div className="flex items-start gap-3">

            <div className="w-6 h-6 bg-[#0B1F3A] text-white flex items-center justify-center text-xs font-bold">
              !
            </div>

            <span className="text-xs font-bold">
              {notification.msg}
            </span>

          </div>

        </div>

      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 bg-white border-b-2 border-[#0B1F3A] px-4 lg:px-8 py-4">

        <div className="flex items-center justify-between gap-4">

          {/* BRAND */}

          <div className="flex items-center gap-4">

            <div className="w-11 h-11 bg-[#0B1F3A] text-white flex items-center justify-center text-2xl font-serif border-2 border-[#0B1F3A]">
              ⚖
            </div>

            <div>

              <div className="flex items-center gap-3">

                <h1 className="text-xl lg:text-2xl font-black tracking-tight font-serif">
                  LEGAL
                  <span className="font-normal">
                    PRECEDENT
                  </span>
                </h1>

                <span className="hidden sm:inline-block px-2 py-1 text-[9px] font-black tracking-widest uppercase border border-[#0B1F3A]">
                  RESEARCH AI
                </span>

              </div>

              <p className="text-[10px] uppercase tracking-widest font-medium mt-1">
                Indian Legal Precedents & Case Similarity Engine
              </p>

            </div>

          </div>

          {/* USER */}

          <button
            onClick={() =>
              setShowAuthModal(true)
            }
            className="flex items-center gap-3 px-3 py-2 border-2 border-[#0B1F3A] bg-white hover:bg-[#0B1F3A] hover:text-white transition-all"
          >

            <div className="w-8 h-8 bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-xs">
              {user.name
                ? user.name
                    .split(' ')
                    .map(
                      n => n[0]
                    )
                    .join('')
                    .substring(0, 2)
                : 'LP'}
            </div>

            <div className="hidden md:block text-left">

              <div className="text-xs font-bold">
                {user.name}
              </div>

              <div className="text-[10px] uppercase tracking-wider">
                {user.role}
              </div>

            </div>

            <span className="text-sm">
              ⚙
            </span>

          </button>

        </div>

        {/* NAV */}

        <nav className="mt-4 flex flex-wrap items-center gap-1 border-t border-[#0B1F3A] pt-3">

          <button
            onClick={() =>
              setActiveTab('search')
            }
            className={navClass('search')}
          >
            SEARCH & MATCH
          </button>

          <button
            onClick={() =>
              setActiveTab('explorer')
            }
            className={navClass('explorer')}
          >
            CASE LIBRARY
          </button>

          <button
            onClick={() =>
              setActiveTab('compare')
            }
            className={navClass('compare')}
          >
            COMPARE

            {comparisonCases.length >
              0 && (

              <span className="ml-2 px-1.5 py-0.5 bg-white text-[#0B1F3A] rounded-sm">
                {comparisonCases.length}
              </span>

            )}

          </button>

          <button
            onClick={() =>
              setActiveTab('saved')
            }
            className={navClass('saved')}
          >
            SAVED CASES

            {savedCases.length >
              0 && (

              <span className="ml-2 px-1.5 py-0.5 bg-white text-[#0B1F3A] rounded-sm">
                {savedCases.length}
              </span>

            )}

          </button>

        </nav>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 lg:p-8">

        {/* =====================================================
            SEARCH
        ===================================================== */}

        {activeTab === 'search' && (

          <div className="space-y-8">

            {/* DASHBOARD WELCOME */}

            <section className="border-2 border-[#0B1F3A] p-6">

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                <div>

                  <div className="text-[10px] font-black uppercase tracking-widest">
                    {user.role} WORKSPACE
                  </div>

                  <h2 className="text-3xl lg:text-4xl font-black font-serif mt-2">
                    Welcome,{' '}
                    {user.name ||
                      'Legal Researcher'}.
                  </h2>

                  <p className="text-sm mt-2">
                    Your legal research dashboard is ready.
                    Search judicial precedents, compare decisions,
                    and manage your research library.
                  </p>

                </div>

                <div className="border-2 border-[#0B1F3A] p-4 min-w-[190px]">

                  <div className="text-[9px] font-black uppercase tracking-widest">
                    Current Role
                  </div>

                  <div className="text-lg font-serif font-black mt-1">
                    {user.role}
                  </div>

                  <button
                    onClick={() =>
                      setShowAuthModal(true)
                    }
                    className="text-[10px] font-black underline mt-2"
                  >
                    CHANGE ROLE
                  </button>

                </div>

              </div>

            </section>

            {/* HERO */}

            <section className="border-2 border-[#0B1F3A] p-6 lg:p-10">

              <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end">

                <div>

                  <div className="inline-block px-3 py-1 bg-[#0B1F3A] text-white text-[10px] font-black uppercase tracking-widest mb-4">
                    AI-ASSISTED LEGAL RESEARCH
                  </div>

                  <h2 className="text-3xl lg:text-5xl font-black font-serif leading-tight max-w-4xl">
                    Find the precedents
                    <br />
                    that matter.
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-relaxed">
                    Describe your current matter and identify
                    judicial precedents using factual, statutory
                    and jurisdictional similarity.
                  </p>

                </div>

                {/* PRESETS */}

                <div className="border-l-2 border-[#0B1F3A] pl-6">

                  <div className="text-[10px] font-black uppercase tracking-widest mb-3">
                    Quick Research
                  </div>

                  <div className="flex flex-wrap lg:flex-col gap-2">

                    {meta.demoPresets?.map(
                      p => (

                        <button
                          key={p.id}
                          onClick={() =>
                            handleApplyPreset(p)
                          }
                          className="px-3 py-2 text-left text-xs font-semibold border border-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white transition-all"
                        >
                          {p.title.split(
                            '('
                          )[0]}
                        </button>

                      )
                    )}

                  </div>

                </div>

              </div>

            </section>

            {/* FORM / RESULTS */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* FORM */}

              <div className="lg:col-span-5">

                <div className="border-2 border-[#0B1F3A]">

                  <div className="bg-[#0B1F3A] text-white p-5">

                    <div className="flex items-center justify-between">

                      <h3 className="font-serif font-bold text-lg">
                        Case Research Brief
                      </h3>

                      <span className="text-[10px] tracking-widest">
                        STEP 01 / 03
                      </span>

                    </div>

                  </div>

                  <div className="p-6 space-y-5">

                    <div>

                      <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                        Case Matter / Reference
                      </label>

                      <input
                        type="text"
                        value={
                          caseForm.title
                        }
                        onChange={e =>
                          setCaseForm({
                            ...caseForm,
                            title:
                              e.target.value
                          })
                        }
                        className={
                          inputClass
                        }
                      />

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <div>

                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                          Offence
                        </label>

                        <input
                          type="text"
                          value={
                            caseForm.offence
                          }
                          onChange={e =>
                            setCaseForm({
                              ...caseForm,
                              offence:
                                e.target.value
                            })
                          }
                          className={
                            inputClass
                          }
                        />

                      </div>

                      <div>

                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                          Court
                        </label>

                        <select
                          value={
                            caseForm.court
                          }
                          onChange={e =>
                            setCaseForm({
                              ...caseForm,
                              court:
                                e.target.value
                            })
                          }
                          className={
                            inputClass
                          }
                        >

                          <option>
                            Madras High Court
                          </option>

                          <option>
                            Madras High Court (Madurai Bench)
                          </option>

                          <option>
                            Supreme Court of India
                          </option>

                          <option>
                            Bombay High Court
                          </option>

                          <option>
                            Delhi High Court
                          </option>

                          <option>
                            Karnataka High Court
                          </option>

                        </select>

                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <div>

                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                          Location
                        </label>

                        <input
                          type="text"
                          value={
                            caseForm.location
                          }
                          onChange={e =>
                            setCaseForm({
                              ...caseForm,
                              location:
                                e.target.value
                            })
                          }
                          className={
                            inputClass
                          }
                        />

                      </div>

                      <div>

                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                          Legal Provisions
                        </label>

                        <input
                          type="text"
                          value={
                            caseForm.legal_provision
                          }
                          onChange={e =>
                            setCaseForm({
                              ...caseForm,
                              legal_provision:
                                e.target.value
                            })
                          }
                          className={
                            inputClass
                          }
                        />

                      </div>

                    </div>

                    <div>

                      <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                        Factual Matrix
                      </label>

                      <textarea
                        rows={6}
                        value={
                          caseForm.case_description
                        }
                        onChange={e =>
                          setCaseForm({
                            ...caseForm,
                            case_description:
                              e.target.value
                          })
                        }
                        className={`${inputClass} resize-none leading-relaxed`}
                      />

                    </div>

                    <div>

                      <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                        Research Question
                      </label>

                      <input
                        type="text"
                        value={
                          caseForm.reason
                        }
                        onChange={e =>
                          setCaseForm({
                            ...caseForm,
                            reason:
                              e.target.value
                          })
                        }
                        className={
                          inputClass
                        }
                      />

                    </div>

                    <button
                      onClick={() =>
                        handleSearch()
                      }
                      disabled={
                        isSearching
                      }
                      className="w-full py-4 bg-[#0B1F3A] text-white border-2 border-[#0B1F3A] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-[#0B1F3A] transition-all disabled:opacity-50"
                    >
                      {isSearching
                        ? 'ANALYSING PRECEDENTS...'
                        : 'SEARCH & RANK PRECEDENTS →'}
                    </button>

                  </div>

                </div>

              </div>

              {/* RESULTS */}

              <div className="lg:col-span-7 space-y-5">

                <div className="border-2 border-[#0B1F3A] p-5">

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div>

                      <div className="text-[10px] font-black uppercase tracking-widest">
                        Search Results
                      </div>

                      <h3 className="text-xl font-serif font-bold mt-1">
                        Ranked Judicial Precedents
                      </h3>

                      <p className="text-xs mt-1">
                        {filteredResults.length}{' '}
                        matching precedents
                        identified
                      </p>

                    </div>

                    <div className="flex gap-2">

                      <select
                        value={
                          filterCourt
                        }
                        onChange={e =>
                          setFilterCourt(
                            e.target.value
                          )
                        }
                        className="px-3 py-2 border-2 border-[#0B1F3A] text-xs bg-white"
                      >

                        <option>
                          All
                        </option>

                        <option>
                          Madras High Court
                        </option>

                        <option>
                          Supreme Court
                        </option>

                        <option>
                          Bombay High Court
                        </option>

                        <option>
                          Delhi High Court
                        </option>

                        <option>
                          Karnataka High Court
                        </option>

                      </select>

                      <input
                        type="text"
                        value={
                          searchKeyword
                        }
                        onChange={e =>
                          setSearchKeyword(
                            e.target.value
                          )
                        }
                        placeholder="Filter..."
                        className="w-28 px-3 py-2 border-2 border-[#0B1F3A] text-xs"
                      />

                    </div>

                  </div>

                </div>

                {filteredResults.length ===
                0 ? (

                  <div className="border-2 border-[#0B1F3A] p-12 text-center">

                    <div className="text-4xl font-serif mb-4">
                      §
                    </div>

                    <p className="text-sm font-semibold">
                      {hasSearched
                        ? 'No matching precedents found.'
                        : 'Run a search to find matching precedents.'}
                    </p>

                    <button
                      onClick={() => {

                        setFilterCourt(
                          'All'
                        );

                        setFilterYear(
                          'All'
                        );

                        setSearchKeyword(
                          ''
                        );

                        setFilterMinScore(
                          50
                        );

                      }}
                      className="mt-4 text-xs font-black underline"
                    >
                      RESET FILTERS
                    </button>

                  </div>

                ) : (

                  <div className="space-y-5">

                    {filteredResults.map(
                      (
                        caseItem,
                        idx
                      ) => {

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

                          <article
                            key={
                              caseItem.case_id
                            }
                            className="border-2 border-[#0B1F3A] bg-white hover:shadow-[7px_7px_0px_#07162B] transition-all"
                          >

                            <div className="p-5 border-b-2 border-[#0B1F3A]">

                              <div className="flex items-start justify-between gap-5">

                                <div>

                                  <div className="text-[10px] font-black uppercase tracking-widest mb-2">

                                    PRECEDENT{' '}
                                    {String(
                                      idx + 1
                                    ).padStart(
                                      2,
                                      '0'
                                    )}

                                    {' • '}

                                    {
                                      caseItem.court_name
                                    }

                                    {' • '}

                                    {
                                      caseItem.year
                                    }

                                  </div>

                                  <h4 className="text-lg font-serif font-bold leading-tight">
                                    {
                                      caseItem.title
                                    }
                                  </h4>

                                  <div className="text-[11px] font-mono mt-2">
                                    {
                                      caseItem.citation
                                    }
                                  </div>

                                </div>

                                <div className="flex-shrink-0 text-center">

                                  <div className="w-20 h-20 border-4 border-[#0B1F3A] flex flex-col items-center justify-center">

                                    <span className="text-xl font-black">
                                      {
                                        caseItem.similarity_score
                                      }
                                      %
                                    </span>

                                    <span className="text-[8px] uppercase tracking-widest font-bold">
                                      Match
                                    </span>

                                  </div>

                                </div>

                              </div>

                            </div>

                            <div className="p-5">

                              <div className="mb-4">

                                <div className="text-[9px] font-black uppercase tracking-widest mb-2">
                                  Statutory Provisions
                                </div>

                                <div className="flex flex-wrap gap-2">

                                  {caseItem.legal_provisions?.map(
                                    (
                                      prov,
                                      i
                                    ) => (

                                      <span
                                        key={
                                          i
                                        }
                                        className="px-2 py-1 border border-[#0B1F3A] text-[10px] font-mono"
                                      >
                                        {
                                          prov
                                        }
                                      </span>

                                    )
                                  )}

                                </div>

                              </div>

                              <div className="border-l-4 border-[#0B1F3A] pl-4 mb-5">

                                <div className="text-[9px] font-black uppercase tracking-widest mb-1">
                                  Factual Relevance
                                </div>

                                <p className="text-xs leading-relaxed">
                                  {
                                    caseItem.circumstances
                                  }
                                </p>

                              </div>

                              {caseItem.why_similar?.length >
                                0 && (

                                <div className="bg-[#0B1F3A] text-white p-4 mb-5">

                                  <div className="text-[9px] font-black uppercase tracking-widest mb-2">
                                    Why This Case Matters
                                  </div>

                                  <p className="text-xs leading-relaxed">
                                    {
                                      caseItem
                                        .why_similar[0]
                                    }
                                  </p>

                                </div>

                              )}

                              <div className="flex flex-wrap justify-between gap-3 pt-4 border-t-2 border-[#0B1F3A]">

                                <div className="flex flex-wrap gap-2">

                                  <button
                                    onClick={() =>
                                      setSelectedCaseForWhy(
                                        caseItem
                                      )
                                    }
                                    className={
                                      secondaryButton
                                    }
                                  >
                                    WHY SIMILAR?
                                  </button>

                                  <button
                                    onClick={() =>
                                      setSelectedCaseForJudgment(
                                        caseItem
                                      )
                                    }
                                    className={
                                      secondaryButton
                                    }
                                  >
                                    VIEW JUDGMENT
                                  </button>

                                </div>

                                <div className="flex gap-2">

                                  <button
                                    onClick={() =>
                                      handleToggleCompare(
                                        caseItem
                                      )
                                    }
                                    className={`px-3 py-2 border-2 border-[#0B1F3A] text-xs font-bold ${
                                      isCompared
                                        ? 'bg-[#0B1F3A] text-white'
                                        : 'bg-white text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white'
                                    }`}
                                  >
                                    {isCompared
                                      ? '✓ COMPARING'
                                      : 'COMPARE'}
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleToggleSave(
                                        caseItem
                                      )
                                    }
                                    className={`px-3 py-2 border-2 border-[#0B1F3A] text-xs font-bold ${
                                      isSaved
                                        ? 'bg-[#0B1F3A] text-white'
                                        : 'bg-white text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white'
                                    }`}
                                  >
                                    {isSaved
                                      ? '★ SAVED'
                                      : '☆ SAVE'}
                                  </button>

                                </div>

                              </div>

                            </div>

                          </article>

                        );

                      }
                    )}

                  </div>

                )}

              </div>

            </div>

          </div>

        )}

        {/* =====================================================
            EXPLORER
        ===================================================== */}

        {activeTab === 'explorer' && (

          <div className="space-y-6">

            <div className="border-2 border-[#0B1F3A] p-6">

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">

                <div>

                  <div className="text-[10px] font-black uppercase tracking-widest">
                    Legal Research Database
                  </div>

                  <h2 className="text-3xl font-serif font-black mt-2">
                    Precedent Case Library
                  </h2>

                  <p className="text-xs mt-2">
                    Explore judicial decisions across Indian courts.
                  </p>

                </div>

                <input
                  type="text"
                  placeholder="Search cases..."
                  value={
                    searchKeyword
                  }
                  onChange={e =>
                    setSearchKeyword(
                      e.target.value
                    )
                  }
                  className="px-4 py-3 border-2 border-[#0B1F3A] text-sm w-full md:w-72"
                />

              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {searchResults
                .filter(c => {

                  if (
                    !searchKeyword.trim()
                  )
                    return true;

                  const kw =
                    searchKeyword.toLowerCase();

                  return (
                    c.title
                      ?.toLowerCase()
                      .includes(kw) ||

                    c.citation
                      ?.toLowerCase()
                      .includes(kw) ||

                    c.offence
                      ?.toLowerCase()
                      .includes(kw)
                  );

                })
                .map(c => (

                  <article
                    key={c.case_id}
                    className="border-2 border-[#0B1F3A] p-5 hover:bg-[#0B1F3A] hover:text-white transition-all"
                  >

                    <div className="flex justify-between gap-4">

                      <div>

                        <div className="text-[10px] font-mono font-bold">
                          {
                            c.citation
                          }
                        </div>

                        <h4 className="text-lg font-serif font-bold mt-1">
                          {
                            c.title
                          }
                        </h4>

                      </div>

                      <div className="text-xs font-black border-2 border-current px-2 py-1 h-fit">
                        {c.year}
                      </div>

                    </div>

                    <p className="text-xs leading-relaxed mt-4">
                      {
                        c.case_description ||
                        c.circumstances
                      }
                    </p>

                    <div className="mt-5 pt-4 border-t-2 border-current flex justify-between items-center">

                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {
                          c.court_name
                        }
                      </span>

                      <button
                        onClick={() =>
                          setSelectedCaseForJudgment(
                            c
                          )
                        }
                        className="text-xs font-black underline"
                      >
                        READ JUDGMENT →
                      </button>

                    </div>

                  </article>

                ))}

            </div>

          </div>

        )}

        {/* =====================================================
            COMPARE
        ===================================================== */}

        {activeTab === 'compare' && (

          <div className="space-y-6">

            <div className="border-2 border-[#0B1F3A] p-6">

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div>

                  <div className="text-[10px] font-black uppercase tracking-widest">
                    Legal Analysis
                  </div>

                  <h2 className="text-3xl font-serif font-black mt-2">
                    Comparison Matrix
                  </h2>

                  <p className="text-xs mt-2">
                    Compare facts, law, reasoning and outcomes.
                  </p>

                </div>

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      setActiveTab(
                        'search'
                      )
                    }
                    className={
                      secondaryButton
                    }
                  >
                    + ADD CASE
                  </button>

                  {comparisonCases.length >
                    0 && (

                    <button
                      onClick={() =>
                        setComparisonCases(
                          []
                        )
                      }
                      className="px-3 py-2 border-2 border-[#0B1F3A] bg-[#0B1F3A] text-white text-xs font-bold"
                    >
                      CLEAR
                    </button>

                  )}

                </div>

              </div>

            </div>

            {comparisonCases.length ===
            0 ? (

              <div className="border-2 border-[#0B1F3A] p-16 text-center">

                <div className="text-5xl font-serif mb-4">
                  ⚖
                </div>

                <p className="text-sm font-bold">
                  No precedents selected.
                </p>

                <button
                  onClick={() =>
                    setActiveTab(
                      'search'
                    )
                  }
                  className="mt-5 px-5 py-3 bg-[#0B1F3A] text-white text-xs font-black"
                >
                  SEARCH PRECEDENTS
                </button>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full border-collapse border-2 border-[#0B1F3A] text-xs">

                  <thead>

                    <tr>

                      <th className="p-4 border border-[#0B1F3A] bg-[#0B1F3A] text-white text-left min-w-[180px]">
                        DIMENSION
                      </th>

                      <th className="p-4 border border-[#0B1F3A] bg-white text-left min-w-[300px] font-black">
                        CURRENT MATTER

                        <div className="font-normal mt-1">
                          {
                            caseForm.title
                          }
                        </div>

                      </th>

                      {comparisonCases.map(
                        c => (

                          <th
                            key={
                              c.case_id
                            }
                            className="p-4 border border-[#0B1F3A] bg-[#0B1F3A] text-white text-left min-w-[300px]"
                          >

                            <div className="flex justify-between">

                              <span>
                                PRECEDENT
                              </span>

                              <button
                                onClick={() =>
                                  handleToggleCompare(
                                    c
                                  )
                                }
                              >
                                ✕
                              </button>

                            </div>

                            <div className="font-serif text-sm mt-2">
                              {
                                c.title
                              }
                            </div>

                            <div className="text-[10px] mt-1">
                              {
                                c.citation
                              }
                            </div>

                          </th>

                        )
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {[
                      [
                        'Offence Type',
                        caseForm.offence,
                        c => c.offence
                      ],

                      [
                        'Court & Jurisdiction',
                        `${caseForm.court} • ${caseForm.location}`,
                        c =>
                          `${c.court_name} • ${c.location}`
                      ],

                      [
                        'Legal Provisions',
                        caseForm.legal_provision,
                        c =>
                          c.legal_provisions?.join(
                            ', '
                          )
                      ],

                      [
                        'Factual Circumstances',
                        caseForm.case_description,
                        c =>
                          c.circumstances
                      ],

                      [
                        'Weapon / Means',
                        '12-inch Butcher Knife',
                        c =>
                          c.weapon ||
                          'Not specified'
                      ],

                      [
                        'Court Reasoning',
                        '[Pending determination]',
                        c =>
                          c.judgment
                            ?.court_reasoning ||
                          'Refer to judgment'
                      ],

                      [
                        'Final Decision',
                        'Targeting relief based on matched precedents.',
                        c =>
                          c.judgment
                            ?.final_decision ||
                          'Refer to judgment'
                      ]

                    ].map(
                      ([
                        label,
                        current,
                        getValue
                      ]) => (

                        <tr
                          key={label}
                        >

                          <td className="p-4 border border-[#0B1F3A] bg-[#0B1F3A] text-white font-black uppercase text-[10px] tracking-wider">
                            {label}
                          </td>

                          <td className="p-4 border border-[#0B1F3A] font-medium leading-relaxed align-top">
                            {
                              current
                            }
                          </td>

                          {comparisonCases.map(
                            c => (

                              <td
                                key={
                                  c.case_id
                                }
                                className="p-4 border border-[#0B1F3A] align-top leading-relaxed"
                              >
                                {
                                  getValue(
                                    c
                                  )
                                }
                              </td>

                            )
                          )}

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        )}

        {/* =====================================================
            SAVED
        ===================================================== */}

        {activeTab === 'saved' && (

          <div className="space-y-6">

            <div className="border-2 border-[#0B1F3A] p-6">

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div>

                  <div className="text-[10px] font-black uppercase tracking-widest">
                    Research Collection
                  </div>

                  <h2 className="text-3xl font-serif font-black mt-2">
                    Saved Precedents
                  </h2>

                  <p className="text-xs mt-2">
                    Bookmarked decisions for future legal research.
                  </p>

                </div>

                <div className="px-4 py-2 bg-[#0B1F3A] text-white text-xs font-black">
                  {
                    savedCases.length
                  }{' '}
                  SAVED
                </div>

              </div>

            </div>

            {savedCases.length ===
            0 ? (

              <div className="border-2 border-[#0B1F3A] p-16 text-center">

                <div className="text-4xl font-serif mb-3">
                  ☆
                </div>

                <p className="text-sm font-bold">
                  No saved precedents.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {savedCases.map(
                  saved => {

                    const caseData =
                      saved.case_details ||
                      searchResults.find(
                        c =>
                          c.case_id ===
                          saved.case_id
                      ) ||
                      {};

                    return (

                      <article
                        key={
                          saved.saved_id
                        }
                        className="border-2 border-[#0B1F3A] p-5"
                      >

                        <div className="flex justify-between gap-4">

                          <div>

                            <div className="text-[10px] font-mono font-bold">
                              {
                                caseData.citation ||
                                saved.case_id
                              }
                            </div>

                            <h4 className="text-lg font-serif font-black mt-1">
                              {
                                caseData.title ||
                                'Precedent Case'
                              }
                            </h4>

                          </div>

                          <button
                            onClick={() =>
                              handleToggleSave(
                                {
                                  case_id:
                                    saved.case_id
                                }
                              )
                            }
                            className="text-xs font-black underline"
                          >
                            REMOVE
                          </button>

                        </div>

                        <div className="mt-5 bg-[#0B1F3A] text-white p-4">

                          <div className="text-[9px] uppercase tracking-widest font-black mb-2">
                            Advocate Notes
                          </div>

                          <p className="text-xs leading-relaxed">
                            {
                              saved.notes ||
                              'No notes available.'
                            }
                          </p>

                        </div>

                        <div className="mt-4 pt-4 border-t-2 border-[#0B1F3A] flex justify-between items-center">

                          <span className="text-[10px] font-bold">
                            SAVED:{' '}
                            {saved.saved_at
                              ? new Date(
                                  saved.saved_at
                                ).toLocaleDateString()
                              : 'N/A'}
                          </span>

                          <button
                            onClick={() =>
                              setSelectedCaseForJudgment(
                                caseData
                              )
                            }
                            className="text-xs font-black underline"
                          >
                            VIEW JUDGMENT →
                          </button>

                        </div>

                      </article>

                    );

                  }
                )}

              </div>

            )}

          </div>

        )}

      </main>

      {/* =====================================================
          WHY SIMILAR MODAL
      ===================================================== */}

      {selectedCaseForWhy && (

        <div className="fixed inset-0 z-50 bg-[#07162B]/80 flex items-center justify-center p-4">

          <div className="bg-white border-4 border-[#0B1F3A] max-w-2xl w-full max-h-[90vh] overflow-y-auto">

            <div className="bg-[#0B1F3A] text-white p-6 flex justify-between gap-4">

              <div>

                <div className="text-[10px] font-black uppercase tracking-widest">
                  Similarity Analysis
                </div>

                <h3 className="text-xl font-serif font-black mt-2">
                  Why is this case similar?
                </h3>

                <p className="text-xs mt-1">
                  {
                    selectedCaseForWhy.title
                  }
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedCaseForWhy(
                    null
                  )
                }
                className="text-xl"
              >
                ✕
              </button>

            </div>

            <div className="p-6 space-y-6">

              <div>

                <div className="text-[10px] font-black uppercase tracking-widest mb-3">
                  Executive Relevance
                </div>

                <div className="space-y-2">

                  {selectedCaseForWhy.why_similar?.map(
                    (
                      point,
                      idx
                    ) => (

                      <div
                        key={idx}
                        className="border-2 border-[#0B1F3A] p-3 text-xs leading-relaxed"
                      >

                        <strong className="mr-2">
                          {String(
                            idx + 1
                          ).padStart(
                            2,
                            '0'
                          )}
                        </strong>

                        {point}

                      </div>

                    )
                  )}

                </div>

              </div>

              <div>

                <div className="text-[10px] font-black uppercase tracking-widest mb-3">
                  Factor Weight Matrix
                </div>

                <div className="grid sm:grid-cols-2 gap-3">

                  {[
                    {
                      name: 'Offence Type',
                      key: 'offence',
                      defaultScore: 90
                    },

                    {
                      name: 'Statutory Provisions',
                      key: 'provisions',
                      defaultScore: 85
                    },

                    {
                      name: 'Factual Context',
                      key: 'facts',
                      defaultScore:
                        selectedCaseForWhy.similarity_score
                    },

                    {
                      name: 'Modus Operandi',
                      key: 'circumstances',
                      defaultScore: 80
                    }

                  ].map(
                    factor => {

                      const score =
                        factor.key ===
                        'facts'
                          ? factor.defaultScore
                          : selectedCaseForWhy
                              .factor_breakdown?.[
                              factor.key
                            ]?.score ||
                            factor.defaultScore;

                      return (

                        <div
                          key={
                            factor.key
                          }
                          className="border-2 border-[#0B1F3A] p-4"
                        >

                          <div className="flex justify-between text-xs font-black mb-3">

                            <span>
                              {
                                factor.name
                              }
                            </span>

                            <span>
                              {score}%
                            </span>

                          </div>

                          <div className="h-3 border-2 border-[#0B1F3A]">

                            <div
                              className="bg-[#0B1F3A] h-full"
                              style={{
                                width: `${score}%`
                              }}
                            />

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              </div>

              <div className="flex justify-end">

                <button
                  onClick={() => {

                    const target =
                      selectedCaseForWhy;

                    setSelectedCaseForWhy(
                      null
                    );

                    setSelectedCaseForJudgment(
                      target
                    );

                  }}
                  className="px-5 py-3 bg-[#0B1F3A] text-white text-xs font-black uppercase tracking-widest"
                >
                  VIEW JUDGMENT →
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          JUDGMENT MODAL
      ===================================================== */}

      {selectedCaseForJudgment && (

        <div className="fixed inset-0 z-50 bg-[#07162B]/80 flex items-center justify-center p-4">

          <div className="bg-white border-4 border-[#0B1F3A] max-w-4xl w-full max-h-[92vh] overflow-y-auto">

            <div className="bg-[#0B1F3A] text-white p-6">

              <div className="flex justify-between gap-5">

                <div>

                  <div className="text-[10px] font-mono">
                    {
                      selectedCaseForJudgment.citation
                    }
                    {' • '}
                    {
                      selectedCaseForJudgment.year
                    }
                  </div>

                  <h3 className="text-2xl font-serif font-black mt-2">
                    {
                      selectedCaseForJudgment.title
                    }
                  </h3>

                  <div className="text-xs mt-2">
                    {
                      selectedCaseForJudgment.court_name
                    }
                  </div>

                </div>

                <button
                  onClick={() =>
                    setSelectedCaseForJudgment(
                      null
                    )
                  }
                  className="text-xl"
                >
                  ✕
                </button>

              </div>

            </div>

            <div className="p-6 space-y-5">

              <div className="border-2 border-[#0B1F3A]">

                <div className="bg-[#0B1F3A] text-white p-3 text-[10px] font-black uppercase tracking-widest">
                  01 — Factual Matrix
                </div>

                <div className="p-5 text-xs leading-relaxed">
                  {
                    selectedCaseForJudgment.judgment
                      ?.case_facts ||
                    selectedCaseForJudgment.circumstances
                  }
                </div>

              </div>

              {selectedCaseForJudgment.judgment
                ?.legal_issues && (

                <div className="border-2 border-[#0B1F3A]">

                  <div className="bg-[#0B1F3A] text-white p-3 text-[10px] font-black uppercase tracking-widest">
                    02 — Points of Law
                  </div>

                  <pre className="p-5 text-xs font-sans whitespace-pre-wrap leading-relaxed">
                    {
                      selectedCaseForJudgment
                        .judgment
                        .legal_issues
                    }
                  </pre>

                </div>

              )}

              {selectedCaseForJudgment.judgment
                ?.arguments && (

                <div className="border-2 border-[#0B1F3A]">

                  <div className="bg-[#0B1F3A] text-white p-3 text-[10px] font-black uppercase tracking-widest">
                    03 — Counsel Arguments
                  </div>

                  <p className="p-5 text-xs leading-relaxed">
                    {
                      selectedCaseForJudgment
                        .judgment
                        .arguments
                    }
                  </p>

                </div>

              )}

              <div className="border-4 border-[#0B1F3A]">

                <div className="bg-[#0B1F3A] text-white p-3 text-[10px] font-black uppercase tracking-widest">
                  04 — Ratio Decidendi
                </div>

                <p className="p-5 text-sm leading-relaxed font-medium">
                  {
                    selectedCaseForJudgment
                      .judgment
                      ?.court_reasoning ||
                    'Reasoning recorded in official law report.'
                  }
                </p>

              </div>

              <div className="border-4 border-[#0B1F3A]">

                <div className="bg-[#0B1F3A] text-white p-3 text-[10px] font-black uppercase tracking-widest">
                  05 — Operative Order
                </div>

                <p className="p-5 text-sm leading-relaxed font-bold">
                  {
                    selectedCaseForJudgment
                      .judgment
                      ?.final_decision ||
                    'Refer to certified copy.'
                  }
                </p>

              </div>

            </div>

            <div className="border-t-2 border-[#0B1F3A] p-5 flex justify-between">

              <button
                onClick={() =>
                  handleToggleSave(
                    selectedCaseForJudgment
                  )
                }
                className="text-xs font-black underline"
              >
                ☆ BOOKMARK PRECEDENT
              </button>

              <button
                onClick={() =>
                  setSelectedCaseForJudgment(
                    null
                  )
                }
                className="px-4 py-2 bg-[#0B1F3A] text-white text-xs font-black"
              >
                CLOSE
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          AUTH / PROFILE MODAL
      ===================================================== */}

      {showAuthModal && (

        <div className="fixed inset-0 z-50 bg-[#07162B]/80 flex items-center justify-center p-4">

          <div className="bg-white border-4 border-[#0B1F3A] max-w-md w-full">

            <div className="bg-[#0B1F3A] text-white p-5 flex justify-between">

              <div>

                <div className="text-[10px] font-black uppercase tracking-widest">
                  Account
                </div>

                <h3 className="text-xl font-serif font-black mt-1">
                  Profile & Role
                </h3>

              </div>

              <button
                onClick={() =>
                  setShowAuthModal(
                    false
                  )
                }
              >
                
              </button>

            </div>

            <div className="p-6 space-y-5">

              <div>

                <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                  Name
                </label>

                <input
                  type="text"
                  value={
                    authForm.name
                  }
                  onChange={e =>
                    setAuthForm({
                      ...authForm,
                      name:
                        e.target.value
                    })
                  }
                  className={
                    inputClass
                  }
                />

              </div>

              <div>

                <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                  Email / Phone
                </label>

                <input
                  type="text"
                  value={
                    authForm.email
                  }
                  onChange={e =>
                    setAuthForm({
                      ...authForm,
                      email:
                        e.target.value
                    })
                  }
                  className={
                    inputClass
                  }
                />

              </div>

              <div>

                <label className="block text-[10px] font-black uppercase tracking-widest mb-2">
                  Professional Role
                </label>

                <div className="grid grid-cols-2 gap-2">

                  {meta.roles?.map(
                    r => (

                      <button
                        key={r}
                        type="button"
                        onClick={() =>
                          setAuthForm({
                            ...authForm,
                            role: r
                          })
                        }
                        className={`p-3 border-2 border-[#0B1F3A] text-left text-xs font-bold ${
                          authForm.role ===
                          r
                            ? 'bg-[#0B1F3A] text-white'
                            : 'bg-white text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white'
                        }`}
                      >
                        {r}
                      </button>

                    )
                  )}

                </div>

              </div>

              <button
                onClick={() => {

                  if (
                    !authForm.role
                  ) {

                    showToast(
                      'Please select a role',
                      'error'
                    );

                    return;

                  }

                  setUser({
                    ...user,
                    name:
                      authForm.name ||
                      user.name,
                    email:
                      authForm.email ||
                      user.email,
                    role:
                      authForm.role
                  });

                  setShowAuthModal(
                    false
                  );

                  showToast(
                    `Profile updated: ${authForm.role}`
                  );

                }}
                className="w-full py-4 bg-[#0B1F3A] text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-[#0B1F3A] border-2 border-[#0B1F3A] transition-all"
              >
                SAVE PROFILE
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t-2 border-[#0B1F3A] bg-white py-7 px-4 lg:px-8">

        <div className="max-w-5xl mx-auto">

          <div className="border-2 border-[#0B1F3A] p-4">

            <div className="text-[10px] font-black uppercase tracking-widest mb-2">
              Prototype Disclaimer
            </div>

            <p className="text-[11px] leading-relaxed">
              LegalPrecedent is a research assistance prototype.
              It does not provide legal advice, predict court
              outcomes, or replace professional legal judgment.
              Demo cases and judgments are curated for legal
              precedent research prototyping.
            </p>

          </div>

          <div className="flex justify-between items-center mt-5 text-[10px] uppercase tracking-widest font-bold">

            <span>
              LEGALPRECEDENT © 2026
            </span>

            <span>
              AI LEGAL RESEARCH SYSTEM
            </span>

          </div>

        </div>

      </footer>

    </div>

  );

}
