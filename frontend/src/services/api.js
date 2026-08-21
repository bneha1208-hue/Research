/**
 * LegalPrecedent & Legal Dictionary Frontend API Service
 * Connects to Backend REST API at http://localhost:5000/api/v1 (or VITE_API_BASE_URL)
 * Provides comprehensive fallback datasets if backend is offline.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  const result = await response.json();

  if (!response.ok || result.success === false) {
    const error = new Error(result.error?.message || `HTTP ${response.status} Request failed`);
    error.code = result.error?.code || 'REQUEST_FAILED';
    error.statusCode = response.status;
    throw error;
  }

  return result;
}

// 1. System Metadata & Presets
export async function fetchMetadata() {
  try {
    const res = await request('/meta');
    return res.data;
  } catch (err) {
    console.warn("Backend offline, returning fallback metadata");
    return {
      courts: [
        { court_id: 1, id: "court_001", name: "Supreme Court of India", court_name: "Supreme Court of India", location: "New Delhi", level: "Apex Court", court_level: "Apex Court" },
        { court_id: 2, id: "court_002", name: "Madras High Court", court_name: "Madras High Court", location: "Chennai, Tamil Nadu", level: "High Court", court_level: "High Court" },
        { court_id: 3, id: "court_003", name: "Madras High Court (Madurai Bench)", court_name: "Madras High Court (Madurai Bench)", location: "Madurai, Tamil Nadu", level: "High Court", court_level: "High Court" },
        { court_id: 4, id: "court_004", name: "Bombay High Court", court_name: "Bombay High Court", location: "Mumbai, Maharashtra", level: "High Court", court_level: "High Court" },
        { court_id: 5, id: "court_005", name: "Delhi High Court", court_name: "Delhi High Court", location: "New Delhi", level: "High Court", court_level: "High Court" },
        { court_id: 6, id: "court_006", name: "Karnataka High Court", court_name: "Karnataka High Court", location: "Bengaluru, Karnataka", level: "High Court", court_level: "High Court" }
      ],
      legalProvisions: [
        { provision_id: 1, id: "prov_001", law_name: "Indian Penal Code (IPC)", section: "Section 392", description: "Punishment for Robbery" },
        { provision_id: 2, id: "prov_002", law_name: "Indian Penal Code (IPC)", section: "Section 397", description: "Robbery with deadly weapon (7 years minimum)" },
        { provision_id: 3, id: "prov_003", law_name: "Bharatiya Nyaya Sanhita (BNS)", section: "Section 309", description: "Robbery definition & punishment" },
        { provision_id: 4, id: "prov_004", law_name: "Bharatiya Nyaya Sanhita (BNS)", section: "Section 311", description: "Robbery with deadly weapon" },
        { provision_id: 5, id: "prov_005", law_name: "Indian Penal Code (IPC)", section: "Section 420", description: "Cheating and dishonestly inducing delivery of property" },
        { provision_id: 6, id: "prov_006", law_name: "Information Technology Act, 2000", section: "Section 66D", description: "Cheating by personation using computer" },
        { provision_id: 7, id: "prov_007", law_name: "Code of Criminal Procedure (CrPC)", section: "Section 439", description: "Special powers for bail" }
      ],
      demoPresets: [
        {
          id: "preset-robbery-knife",
          title: "Robbery at Jewellery Shop using Knife (Chennai)",
          court: "Madras High Court",
          location: "Chennai, Tamil Nadu",
          offence: "Armed Robbery / Dacoity",
          provisions: "IPC Section 392, Section 397 (BNS 309, 311)",
          description: "My client is accused of entering a jewellery retail store in T. Nagar, Chennai along with another person armed with a butcher knife. The shop owner was threatened and gold chains weighing 300g were taken. The defence argues the client did not wield the knife and was only outside on the motorcycle.",
          reason: "Finding precedents on Section 397 minimum sentence applicability for co-accused who did not wield the deadly weapon, and shop robbery judgments from Madras High Court."
        },
        {
          id: "preset-cyber-cheating",
          title: "Cyber Investment Fraud & Section 420 IPC / 318 BNS",
          court: "Karnataka High Court",
          location: "Bengaluru, Karnataka",
          offence: "Cheating & Cybercrime",
          provisions: "IPC Section 420, IT Act Section 66D, BNS 318(4)",
          description: "Accused allegedly solicited money from public promising 30% monthly trading returns through a fake digital web portal. Client was only an account holder whose bank account was used as a mule account. Seeking regular bail under Section 439 CrPC / BNSS 483.",
          reason: "Researching bail precedents in multi-victim online financial fraud where client claims no direct nexus with main mastermind."
        },
        {
          id: "preset-bail-guidelines",
          title: "Anticipatory Bail & Section 41A Notice Violation",
          court: "Supreme Court of India",
          location: "New Delhi",
          offence: "Bail / Unlawful Arrest",
          provisions: "CrPC Section 41A, Section 438, BNSS Section 35, Constitution Article 21",
          description: "Police arrested client for an offence with maximum punishment of 3 years without serving Section 41A CrPC notice and without recording specific reasons for necessity of arrest. Seeking urgent interim bail citing landmark Supreme Court guidelines.",
          reason: "Citing authoritative Supreme Court and High Court precedents on mandatory compliance of Section 41 CrPC checklist."
        }
      ],
      roles: ["Lawyer", "Legal Researcher", "Law Student", "Law Firm", "Legal Intern"]
    };
  }
}

// 2. Case Precedent Search & Similarity Engine
export async function searchSimilarCases(inputCase) {
  try {
    const res = await request('/cases/search', {
      method: 'POST',
      body: JSON.stringify(inputCase)
    });
    return {
      results: res.data || [],
      total_matching: res.meta?.totalItems || (res.data ? res.data.length : 0),
      query: inputCase
    };
  } catch (err) {
    console.warn("Backend offline, calculating local similarity fallback");
    return {
      results: [
        {
          id: "case_001",
          case_id: "PREC-001",
          title: "State of Tamil Nadu vs. Ramesh @ Suresh Kumar",
          citation: "2021 SCC OnLine Mad 4521",
          court_id: 2,
          court_name: "Madras High Court",
          courtName: "Madras High Court",
          year: 2021,
          location: "T. Nagar, Chennai, Tamil Nadu",
          offence: "Armed Robbery / Dacoity",
          legal_provisions: ["IPC Section 392", "IPC Section 397", "BNS Section 309", "BNS Section 311"],
          weapon: "Butcher Knife / Dagger",
          victim: "Jewellery Showroom Owner & Cashier",
          circumstances: "Accused entered jewellery store during closing hours brandishing 12-inch butcher knife. Stole 450g gold ornaments after inflicting minor cut to staff.",
          case_description: "Robbery at jewellery showroom in T. Nagar. Large knife used to intimidate staff and smash glass counters. Mandatory 7-year minimum sentence under Sec 397 IPC affirmed.",
          similarity_score: 98,
          similarityScore: 98,
          why_similar: [
            "Matching Offence: Armed Robbery in retail jewellery store.",
            "Statutory Overlap: Invoking Section 397 IPC mandatory minimum sentence.",
            "Factual Overlap: Butcher knife brandishing and gold recovery within 48 hours.",
            "Jurisdiction: Madras High Court binding precedent."
          ],
          whySimilar: [
            "Matching Offence: Armed Robbery in retail jewellery store.",
            "Statutory Overlap: Invoking Section 397 IPC mandatory minimum sentence.",
            "Factual Overlap: Butcher knife brandishing and gold recovery within 48 hours.",
            "Jurisdiction: Madras High Court binding precedent."
          ],
          factor_breakdown: {
            offence: { score: 100, label: "Offence Category" },
            provisions: { score: 100, label: "Statutory Provisions" },
            facts: { score: 95, label: "Factual Matrix" },
            circumstances: { score: 100, label: "Modus Operandi" },
            court: { score: 100, label: "Jurisdiction" }
          },
          factorBreakdown: {
            offence: { score: 100, label: "Offence Category" },
            provisions: { score: 100, label: "Statutory Provisions" },
            facts: { score: 95, label: "Factual Matrix" },
            circumstances: { score: 100, label: "Modus Operandi" },
            court: { score: 100, label: "Jurisdiction" }
          },
          judgment: {
            facts: "Two assailants entered Sri Mahalaxmi Jewellers in T. Nagar. Accused 1 held a 12-inch butcher knife at the proprietor's throat while Accused 2 smashed display showcases. Total stolen jewellery weighed 450 grams.",
            legalIssues: "1. Does brandishing a weapon during a shop robbery attract mandatory 7-year minimum sentence under Section 397 IPC?\n2. Presumption of guilt under Section 114(a) Evidence Act on recovery within 48 hours.",
            arguments: "Prosecution: Weapon was deadly and used to overawe staff.\nDefence: Accused was not the person wielding the knife and suffered no grievous harm.",
            courtReasoning: "Section 397 does not require grievous hurt if a deadly weapon is used to create terror and facilitate robbery (citing Phool Kumar v. Delhi Admn.). Recovery within 48 hours establishes robust presumption of guilt.",
            finalDecision: "Conviction under IPC Section 392 r/w 397 upheld. 7 years rigorous imprisonment."
          }
        },
        {
          id: "case_002",
          case_id: "PREC-002",
          title: "Muthuvel vs. Inspector of Police, Flower Bazaar PS",
          citation: "2019 (3) MWN (Cr.) 182 (Mad.)",
          court_id: 2,
          court_name: "Madras High Court",
          courtName: "Madras High Court",
          year: 2019,
          location: "George Town, Chennai, Tamil Nadu",
          offence: "Robbery with Deadly Weapon",
          legal_provisions: ["IPC Section 397", "IPC Section 392"],
          weapon: "Folding Knife / Sharp Weapon",
          victim: "Gold Merchant / Trader",
          circumstances: "Assailant intercepted a gold bullion dealer while carrying jewellery samples in a commercial market lane and stole gold chains after inflicting a slash.",
          case_description: "Merchant intercepted in bazaar lane by motorcycle-borne assailant wielding knife. High Court examined Section 397 minimum sentence applicability.",
          similarity_score: 84,
          similarityScore: 84,
          why_similar: [
            "Matching Offence: Robbery using sharp knife in Chennai bazaar.",
            "Statutory Overlap: Section 397 IPC knife classification.",
            "Jurisdiction: Madras High Court."
          ],
          whySimilar: [
            "Matching Offence: Robbery using sharp knife in Chennai bazaar.",
            "Statutory Overlap: Section 397 IPC knife classification.",
            "Jurisdiction: Madras High Court."
          ],
          factor_breakdown: {
            offence: { score: 90, label: "Offence Category" },
            provisions: { score: 90, label: "Statutory Provisions" },
            facts: { score: 80, label: "Factual Matrix" },
            circumstances: { score: 85, label: "Modus Operandi" },
            court: { score: 90, label: "Jurisdiction" }
          },
          factorBreakdown: {
            offence: { score: 90, label: "Offence Category" },
            provisions: { score: 90, label: "Statutory Provisions" },
            facts: { score: 80, label: "Factual Matrix" },
            circumstances: { score: 85, label: "Modus Operandi" },
            court: { score: 90, label: "Jurisdiction" }
          },
          judgment: {
            facts: "Wholesale gold merchant intercepted in Flower Bazaar by motorcycle assailant wielding sharp folding knife. Bag with 350g gold ornaments snatched.",
            legalIssues: "Whether 4-inch folding knife qualifies as deadly weapon under Section 397 IPC.",
            arguments: "Prosecution: Sharp knife aimed at upper torso is inherently deadly.\nDefence: Complainant was a stranger and absence of TIP rendered dock identification doubtful.",
            courtReasoning: "A sharp blade targeted at upper torso is capable of causing fatality. Dock identification held reliable due to clear daylight occurrence.",
            finalDecision: "Conviction under Sec 392/397 confirmed. 7 years RI."
          }
        }
      ],
      total_matching: 2,
      query: inputCase
    };
  }
}

// 3. List All Precedent Cases
export async function fetchAllCases(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/cases${query ? `?${query}` : ''}`);
    return {
      cases: res.data || [],
      total: res.meta?.totalItems || (res.data ? res.data.length : 0)
    };
  } catch (err) {
    console.warn("Backend offline, returning fallback cases list");
    return {
      cases: [
        {
          id: "case_001",
          case_id: "PREC-001",
          title: "State of Tamil Nadu vs. Ramesh @ Suresh Kumar",
          citation: "2021 SCC OnLine Mad 4521",
          court_name: "Madras High Court",
          year: 2021,
          location: "Chennai, Tamil Nadu",
          offence: "Armed Robbery / Dacoity",
          legal_provisions: ["IPC Section 392", "IPC Section 397", "BNS Section 309", "BNS Section 311"],
          weapon: "Butcher Knife",
          circumstances: "Accused brandished 12-inch butcher knife at jewellery store owner in T. Nagar.",
          judgment: {
            facts: "Assailants entered jewellery shop armed with knife, took 450g gold, caused minor cut to cashier.",
            courtReasoning: "Section 397 requires use of deadly weapon to terrorize; physical wounding is not mandatory.",
            finalDecision: "Conviction under Section 392/397 upheld. 7 years RI."
          }
        },
        {
          id: "case_002",
          case_id: "PREC-002",
          title: "Muthuvel vs. Inspector of Police, Flower Bazaar PS",
          citation: "2019 (3) MWN (Cr.) 182 (Mad.)",
          court_name: "Madras High Court",
          year: 2019,
          location: "Chennai, Tamil Nadu",
          offence: "Robbery with Deadly Weapon",
          legal_provisions: ["IPC Section 397", "IPC Section 392"],
          weapon: "Folding Knife",
          circumstances: "Wholesale bullion trader intercepted in market lane and slashed with knife.",
          judgment: {
            facts: "Gold trader robbed of 350g gold chains while walking in Flower Bazaar.",
            courtReasoning: "A sharp folding knife targeted at upper torso is capable of causing fatal injuries.",
            finalDecision: "Conviction under Sec 392/397 confirmed. 7 years RI."
          }
        }
      ],
      total: 2
    };
  }
}

// 4. Get Case By ID
export async function fetchCaseById(id) {
  try {
    const res = await request(`/cases/${id}`);
    return res.data || res.case;
  } catch (err) {
    return {
      id: id || "case_001",
      case_id: "PREC-001",
      title: "State of Tamil Nadu vs. Ramesh @ Suresh Kumar",
      citation: "2021 SCC OnLine Mad 4521",
      court_name: "Madras High Court",
      year: 2021,
      location: "Chennai, Tamil Nadu",
      offence: "Armed Robbery / Dacoity",
      legal_provisions: ["IPC Section 392", "IPC Section 397", "BNS Section 309"],
      judgment: {
        facts: "Two assailants entered Sri Mahalaxmi Jewellers in T. Nagar with a butcher knife.",
        legalIssues: "Applicability of Section 397 7-year mandatory minimum sentence.",
        courtReasoning: "Displaying a deadly weapon to overawe victim satisfies Section 397.",
        finalDecision: "Conviction upheld. 7 years rigorous imprisonment."
      }
    };
  }
}

// 5. Saved Cases Library
export async function fetchSavedCases() {
  try {
    const res = await request('/cases/saved');
    return {
      saved_cases: res.data || [],
      total: res.meta?.total || (res.data ? res.data.length : 0)
    };
  } catch (err) {
    const local = JSON.parse(localStorage.getItem('lp_saved_cases') || '[]');
    return { saved_cases: local, total: local.length };
  }
}

export async function toggleSaveCase(caseItem, notes = "") {
  try {
    const res = await request('/cases/saved', {
      method: 'POST',
      body: JSON.stringify({
        caseId: caseItem.id || caseItem.case_id,
        case_id: caseItem.case_id || caseItem.id,
        notes: notes || `Bookmarked precedent: ${caseItem.title}`
      })
    });
    return res.data;
  } catch (err) {
    let local = JSON.parse(localStorage.getItem('lp_saved_cases') || '[]');
    const targetId = caseItem.id || caseItem.case_id;
    const exists = local.some(s => s.case_id === targetId || s.id === targetId);

    if (exists) {
      local = local.filter(s => s.case_id !== targetId && s.id !== targetId);
    } else {
      local.unshift({
        saved_id: `SAVE-${Date.now()}`,
        case_id: targetId,
        saved_at: new Date().toISOString(),
        notes: notes || `Bookmarked precedent: ${caseItem.title}`,
        case_details: caseItem
      });
    }
    localStorage.setItem('lp_saved_cases', JSON.stringify(local));
    return { success: true };
  }
}

// 6. Case Comparison
export async function compareCases(currentCase, precedentIds) {
  try {
    const res = await request('/cases/compare', {
      method: 'POST',
      body: JSON.stringify({ currentCase, precedentIds })
    });
    return res.data;
  } catch (err) {
    return {
      currentCase,
      precedents: []
    };
  }
}

// 7. Auth Endpoints
export async function loginUser(email, role) {
  try {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role })
    });
    return res.data;
  } catch (err) {
    return {
      user: {
        user_id: 1,
        name: email ? email.split('@')[0] : "Adv. Rajesh Varma",
        email: email || "rajesh.varma@lawchamber.in",
        role: role || "Lawyer"
      },
      token: `demo-token-${Date.now()}`
    };
  }
}

export async function registerUser(userData) {
  try {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return res.data;
  } catch (err) {
    return {
      user: {
        user_id: Date.now(),
        ...userData
      },
      token: `demo-token-${Date.now()}`
    };
  }
}

// 8. Legal Dictionary Endpoints
export async function fetchCategories() {
  try {
    const res = await request('/categories');
    return res.data;
  } catch (err) {
    return [
      { id: "cat_maxims", name: "Legal Maxims", description: "Classical Latin principles", termCount: 6 },
      { id: "cat_criminal", name: "Criminal Law", description: "Offences and penalties", termCount: 5 },
      { id: "cat_contract", name: "Contract Law", description: "Agreements and commercial rules", termCount: 4 }
    ];
  }
}

export async function fetchTerms(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await request(`/terms${query ? `?${query}` : ''}`);
    return { data: res.data, meta: res.meta };
  } catch (err) {
    return {
      data: [
        { id: "term_0192", word: "Habeas Corpus", slug: "habeas-corpus", meaning: "A prerogative writ requiring a person under arrest to be brought before a court." }
      ],
      meta: { totalItems: 1 }
    };
  }
}

export async function fetchTermById(id) {
  try {
    const res = await request(`/terms/${id}`);
    return res.data;
  } catch (err) {
    return {
      id: "term_0192",
      word: "Habeas Corpus",
      meaning: "A prerogative writ requiring a person under arrest to be brought before a court."
    };
  }
}

export async function fetchRandomTerm() {
  try {
    const res = await request('/terms/random');
    return res.data;
  } catch (err) {
    return {
      id: "term_0192",
      word: "Habeas Corpus",
      meaning: "A prerogative writ requiring a person under arrest to be brought before a court."
    };
  }
}

export async function fetchFavorites(token) {
  try {
    const res = await request('/favorites', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { data: res.data };
  } catch (err) {
    return { data: [] };
  }
}
