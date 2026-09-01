# LegalPrecedent — Frontend Application

Modern, responsive React & Vite frontend for the **LegalPrecedent** Indian Law Research Platform and **Legal Dictionary**.

---

## 🏛️ Features & Screen Catalog

Strictly matches the specifications defined in [`context/Frontend.md`](../context/Frontend.md):

1. **Dashboard & Case Studio**:
   - Case input studio with structured fields: Offence, Court, Location, Legal Provisions (IPC / BNS / CrPC / BNSS), and Plain-language Case Description.
   - 1-Click Demo Scenario Presets (e.g. *Chennai Jewellery Knife Robbery*, *Bengaluru Cyber Cheating*, *Arnesh Kumar Bail Guidelines*).

2. **Search Results & Similarity Engine**:
   - Displays matching precedent rulings with percentage similarity badges.
   - Highlights jurisdiction, court, year, citations, and statutory overlap.

3. **"Why Similar?" Deep-Dive Factor Breakdown**:
   - Modal/Card explaining the exact factual and statutory reasons why each case matches (Offence category, Modus Operandi, Weapon, Section numbers, Cosine text keywords).

4. **Multi-Column Side-by-Side Comparison Matrix**:
   - Compare up to 3 precedent cases alongside the active matter.
   - Side-by-side comparison across Facts, Legal Provisions, Court, Year, Circumstances, Reasoning, and Final Decision.

5. **Structured Judgment Viewer**:
   - Comprehensive case breakdown:
     - Factual Matrix
     - Legal Issues Framed
     - Prosecution & Defence Arguments
     - Court Reasoning (*Ratio Decidendi*)
     - Final Operative Decision & Sentences
     - Authoritative Law Citations

6. **Saved Precedents & Research Library**:
   - Bookmark cases with custom research notes, timestamps, and quick retrieval.

7. **User Authentication & Role Switcher**:
   - Supports all 5 platform personas: *Lawyer*, *Legal Researcher*, *Law Student*, *Law Firm*, and *Legal Intern*.

8. **Seamless Backend Fallback**:
   - Automatically connects to the backend API (`http://localhost:5000/api/v1`), with built-in instant local data fallbacks if the backend server is offline.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler / Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom Glassmorphism & Legal Palette
- **Icons & Typography**: Clean SVG icons with Outfit & Serif typography

---

## 🚀 Quick Start

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env` (defaults to port 5000 backend):

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be accessible at: **`http://localhost:5173`**

### 4. Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Directory Layout

```
frontend/
├── src/
│   ├── components/
│   │   └── common/
│   │       ├── Header.jsx       # App bar with active role & navigation
│   │       ├── Footer.jsx       # Disclaimer & legal copyright
│   │       ├── AuthModal.jsx    # Persona selection & login
│   │       └── Toast.jsx        # Notification alert
│   ├── services/
│   │   └── api.js               # REST API client with full offline fallbacks
│   ├── App.jsx                  # Main application orchestrator & screens
│   ├── index.css                # Tailwind CSS v4 & theme variables
│   └── main.jsx                 # React root entrypoint
├── index.html                   # HTML template with Google Fonts
├── package.json                 # Dependencies & build scripts
├── vite.config.js               # Vite React & Tailwind plugin config
└── README.md
```
