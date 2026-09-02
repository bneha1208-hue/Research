# LegalPrecedent — Legal Case Similarity & Precedent Research Platform

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-51%20Passed-brightgreen.svg)](#-automated-testing)

**LegalPrecedent** is an intelligent Indian legal research platform designed to help lawyers, advocates, legal researchers, law students, and judicial interns discover, analyze, and compare previous Indian court cases that are factually and legally similar to their ongoing matters.

---

## 🎯 Problem Statement & Proposed Solution

### The Problem
Lawyers often spend countless hours sifting through thousands of unindexed judgments to find cases that match their specific factual and statutory matrix. A robbery case involving a weapon at a jewellery store in Chennai requires researching relevant Madras High Court precedents, Section 397 IPC mandatory minimum sentence jurisprudence, and BNS provisions.

### The Solution
LegalPrecedent allows advocates to enter their case in simple legal language. The platform:
1. Extracts key factual factors, offences, weapon/modus operandi, location, and statutory sections.
2. Computes a multi-factor similarity score against verified Indian court precedents.
3. Provides an interactive **"Why Similar?"** card justifying why each ruling applies.
4. Offers side-by-side case comparison matrices and structured judgment breakdowns (*Ratio Decidendi*).

---

## 👥 Target Users & Personas

- **Primary Users**: Lawyers and Advocates preparing strategy and arguments for court hearings.
- **Secondary Users**: Legal Researchers, Law Students, Law Firms, and Judicial Interns analyzing case law.

---

## 🏛️ System Architecture

```
Research/
├── backend/                        # Node.js / Express REST API & Engine
│   ├── src/
│   │   ├── app.js                  # Express middleware pipeline
│   │   ├── config/                 # Environment config & CORS
│   │   ├── controllers/            # Case, Auth, Court, Provision, Term controllers
│   │   ├── db/seeds/               # Precedents, Judgments, Courts, Provisions & Users
│   │   ├── middleware/             # Auth, Logger, Error handler
│   │   ├── routes/                 # API Routes (/api/v1 and /api)
│   │   └── services/               # Multi-factor Similarity Engine & Auth
│   ├── test/
│   │   └── api.test.js             # Automated API Test Suite (51 passed assertions)
│   ├── package.json
│   ├── server.js                   # Server entrypoint (Port 5000)
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                       # React 19 / Vite / Tailwind CSS v4 UI
│   ├── src/
│   │   ├── components/common/      # Header, Footer, AuthModal, Toast
│   │   ├── services/api.js         # API Client with instant offline fallbacks
│   │   ├── App.jsx                 # Multi-Screen Research Studio & Explorer
│   │   ├── index.css               # Design System, Glassmorphism & Themes
│   │   └── main.jsx                # React Entrypoint
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── README.md
│
├── context/                        # Original Specifications & Guides
│   ├── overall.md                  # Project overview & requirements
│   ├── Frontend.md                 # UI/UX & screens specification
│   └── backend.md                  # Database & similarity algorithm docs
│
├── docker-compose.yml              # One-command full-stack containerization
├── package.json                    # Workspace scripts
└── README.md                       # Master documentation
```

---

## 🧠 Multi-Factor Similarity Calculation Model

The similarity engine computes a composite weighted score across 5 key legal dimensions:

$$\text{Similarity Score} = (0.30 \times S_{\text{offence}}) + (0.25 \times S_{\text{provisions}}) + (0.25 \times S_{\text{facts}}) + (0.10 \times S_{\text{weapon}}) + (0.10 \times S_{\text{court}})$$

1. **Offence Category (30%)**: Matches specific crime classification (e.g. Armed Robbery vs Cheating).
2. **Statutory Provisions (25%)**: Detects section overlap across IPC, BNS, CrPC, BNSS, IT Act, and Constitution.
3. **Factual Matrix & Keywords (25%)**: Jaccard & Cosine token overlap on case facts.
4. **Modus Operandi & Weapon (10%)**: Identifies specific weapons (knife, firearm, rod) or digital vectors.
5. **Court Jurisdiction (10%)**: Gives weight to binding jurisdiction (Supreme Court > High Court > Sessions).

---

## 🖥️ Screen & Workflow Catalog

```
Login / Persona Select ➡️ Dashboard Studio ➡️ Enter Case Details / 1-Click Preset
          ⬇️
Search Results & Similarity Scores ➡️ Filter (Court / Year / Min Score)
          ⬇️
"Why Similar?" Explanation ➡️ Side-by-Side Comparison ➡️ Full Judgment View ➡️ Bookmark to Saved Library
```

1. **1-Click Demo Scenarios**:
   - *Robbery at Jewellery Store with Knife (Madras High Court / Section 397 IPC)*
   - *Cyber Investment Fraud & Cryptocurrency (Karnataka High Court / Section 420 IPC / 318 BNS)*
   - *Anticipatory Bail & Section 41A Notice Violation (Supreme Court / Arnesh Kumar)*
2. **"Why Similar?" Factor Breakdown**:
   - Visual factor weight matrix and plain-English bulleted reasons why each case matches.
3. **Structured Judgment Viewer**:
   - Breakdown into *Factual Matrix*, *Legal Issues Framed*, *Prosecution & Defence Contentions*, *Court Reasoning*, and *Final Operative Orders*.
4. **Comparison Matrix**:
   - Compare up to 3 precedent cases side-by-side against the user's ongoing matter.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://npmjs.com/) (v9 or higher)

### Option 1: Local Development

```bash
# 1. Clone repository
git clone https://github.com/bneha1208-hue/Research.git
cd Research

# 2. Install dependencies
npm --prefix backend install
npm --prefix frontend install

# 3. Start Backend Server (Port 5000)
npm --prefix backend run dev

# 4. In a separate terminal, start Frontend (Port 5173)
npm --prefix frontend run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api/v1`

---

### Option 2: Docker Compose (Turnkey Full Stack)

```bash
docker-compose up --build
```
- App will be running at `http://localhost` (Port 80) with backend automatically proxied at `/api/`.

---

## 🧪 Automated Testing

The backend includes a comprehensive automated test suite testing all 20+ endpoints:

```bash
cd backend
npm test
```

### Test Suite Output:
```
=================================================
  LegalPrecedent Backend API Test Runner
=================================================
  1. System Health & Discovery
  2. User & Auth Endpoints (context/backend.md User Table)
  3. Courts & Legal Provisions (Court Table & Provision Table)
  4. Precedent Search & Similarity Engine (context/backend.md Process)
  5. Precedent Retrieval & Comparison
  6. Saved Cases Library
  7. Legal Dictionary Endpoints
  8. Error Handling & 404 Route

=================================================
  Test Results: 51 PASSED, 0 FAILED
=================================================
```

---

## 📡 API Contract Summary

All endpoints are available under `/api/v1` and aliased under `/api`:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/cases/search` | Multi-factor similarity search and ranking |
| `GET` | `/api/v1/cases` | List all precedents (filters: `court`, `year`, `offence`, `q`) |
| `GET` | `/api/v1/cases/:id` | Get single precedent with complete judgment and reasoning |
| `POST` | `/api/v1/cases/compare` | Side-by-side comparison of current case against precedents |
| `GET` | `/api/v1/cases/presets` | Get pre-configured demo scenarios |
| `GET` | `/api/v1/cases/saved` | List saved case library |
| `POST` | `/api/v1/cases/saved` | Save precedent to library |
| `DELETE` | `/api/v1/cases/saved/:id` | Remove precedent from library |
| `POST` | `/api/v1/auth/login` | Authenticate user and select role |
| `POST` | `/api/v1/auth/register` | Register new user profile |
| `GET` | `/api/v1/courts` | List Indian court hierarchy |
| `GET` | `/api/v1/provisions` | List statutory sections (IPC, BNS, CrPC, BNSS) |
| `GET` | `/api/v1/meta` | System metadata endpoint |
| `GET` | `/api/v1/terms` | Search legal dictionary terms |
| `GET` | `/api/v1/terms/random` | Word of the Day |

---

## ⚖️ Prototype Disclaimer

> *LegalPrecedent is a research assistance prototype. It does not provide legal advice, predict court outcomes, or replace professional legal judgment.*

---

## 📦 Push to GitHub

To push the entire codebase to GitHub:

```bash
git add -A
git commit -m "feat: complete LegalPrecedent platform with backend API, frontend UI, similarity engine, and tests"
git push origin main
```
