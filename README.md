# LegalPrecedent — Legal Case Similarity & Research Platform

**LegalPrecedent** is an intelligent legal research platform designed to help lawyers, advocates, legal researchers, law students, and judicial interns discover, analyze, and compare previous Indian court cases that are factually and legally similar to their ongoing matters.

---

## 🏛️ System Features

1. **AI-Assisted Case Search & Input Studio**:
   - Enter case description in plain legal language.
   - Specify offence, court, location, and relevant statutory provisions (IPC, BNS, CrPC, BNSS, IT Act, Constitution).
   - 1-Click demo presets (e.g. *Robbery at Jewellery Shop using knife in Chennai*, *Cyber investment fraud in Bangalore*, *Anticipatory Bail under Sec 41A / Art 21*).

2. **Multi-Factor Similarity & Ranking Engine**:
   - Calculates weighted composite similarity based on:
     - Offence & Crime Type (30%)
     - Statutory Provisions & Section Overlap (25%)
     - Fact Pattern & Keyword Cosine Overlap (25%)
     - Weapon & Modus Operandi (10%)
     - Court Jurisdiction & Precedent Weight (10%)

3. **Interactive "Why Similar?" Breakdown**:
   - Visual factor weight matrix.
   - Plain-English bulleted justification explaining why each precedent is relevant.

4. **Comprehensive Judgment Viewer**:
   - Structured breakdown of Factual Matrix, Legal Issues Framed, Prosecution & Defence Contentions, Court Reasoning (*Ratio Decidendi*), and Final Operative Orders.

5. **Side-by-Side Case Comparison Matrix**:
   - Multi-column comparison comparing the ongoing matter against up to 3 selected precedent rulings.

6. **Saved Precedents & Research Library**:
   - Bookmark cases with custom research notes and timestamps.

7. **User Roles & Authentication**:
   - Tailored workflows for *Lawyer*, *Legal Researcher*, *Law Student*, *Law Firm*, and *Legal Intern*.

8. **Legal Dictionary & Social Share Card Studio**:
   - Searchable legal maxims and statutory definitions with social share card formatting.

---

## 🚀 Quick Start Guide

### 1. Start the Backend API Server
```bash
cd backend
npm install
npm run dev   # Or npm start
```
- Server URL: `http://localhost:5000`
- API v1 Endpoint: `http://localhost:5000/api/v1`
- Run Automated Tests: `npm test`

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Frontend URL: `http://localhost:5173` (or the port shown in terminal)

---

## 📁 Repository Structure

```
d:/Research/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express pipeline & error handling
│   │   ├── config/                 # Environment and CORS config
│   │   ├── controllers/            # Case, Auth, Court, Provision, Term controllers
│   │   ├── db/seeds/               # Precedents, Judgments, Courts, Provisions & Users
│   │   ├── middleware/             # Auth, Logger, Centralized Error Handler
│   │   ├── routes/                 # Modular API routes (/api/v1 and /api)
│   │   └── services/               # Similarity Engine, Auth, Terms & Metadata
│   ├── test/
│   │   └── api.test.js             # Automated API test suite
│   ├── package.json
│   ├── server.js                   # Server entrypoint
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI & Layout Components
│   │   ├── context/                # Auth & App State
│   │   ├── services/
│   │   │   └── api.js              # API Client with seamless fallback
│   │   ├── App.jsx                 # Complete Multi-Screen Application
│   │   ├── index.css               # Design System & Styling
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── context/
    ├── overall.md                  # Product Overview & Project Documentation
    ├── Frontend.md                 # Frontend Specs & UI Documentation
    └── backend.md                  # Database & Backend Logic Documentation
```

---

## ⚖️ Prototype Disclaimer
> *LegalPrecedent is a research assistance prototype. It does not provide legal advice, predict court outcomes, or replace professional legal judgment.*
