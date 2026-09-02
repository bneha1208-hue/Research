# LegalPrecedent & Legal Dictionary — Backend API

Industry-standard Node.js / Express REST API and Multi-factor Legal Similarity Engine powering the **LegalPrecedent** research platform and **Legal Dictionary**.

---

## 🏛️ System Architecture

Built according to layered MVC and clean architecture principles:

```
backend/
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore patterns
├── package.json                # Dependencies, test scripts & metadata
├── server.js                   # Server entrypoint & HTTP listener
├── test/
│   └── api.test.js             # Automated endpoint test suite (51+ assertions)
└── src/
    ├── app.js                  # Express middleware pipeline & error handling
    ├── config/
    │   └── index.js            # Environment config & CORS setup
    ├── controllers/
    │   ├── auth.controller.js     # User authentication, profiles & roles
    │   ├── case.controller.js     # Case search, compare, saved library & presets
    │   ├── court.controller.js    # Indian courts hierarchy
    │   ├── provision.controller.js# Statutory provisions (IPC, BNS, CrPC, BNSS)
    │   ├── term.controller.js     # Legal dictionary terms & social share
    │   ├── category.controller.js # Legal term taxonomy
    │   ├── favorite.controller.js # User favorited dictionary terms
    │   └── admin.controller.js    # Term management & administration
    ├── db/
    │   └── seeds/
    │       ├── users.seed.js       # User Table seed (Lawyer, Researcher, Student, etc.)
    │       ├── courts.seed.js      # Indian Judicial Hierarchy seed
    │       ├── provisions.seed.js  # Statutory Provisions seed
    │       ├── precedents.seed.js  # Precedent Cases & Judgments seed
    │       ├── categories.seed.js  # Dictionary Categories seed
    │       └── terms.seed.js       # Legal Terms seed
    ├── middleware/
    │   ├── auth.middleware.js     # Bearer token validation & RBAC
    │   ├── error.middleware.js    # Centralized JSON error formatting
    │   └── logger.middleware.js   # HTTP request logging with duration
    ├── routes/
    │   ├── index.js               # Master router (/api/v1 and /api)
    │   ├── auth.routes.js         # /api/v1/auth
    │   ├── case.routes.js         # /api/v1/cases
    │   ├── court.routes.js        # /api/v1/courts
    │   ├── provision.routes.js    # /api/v1/provisions
    │   ├── term.routes.js         # /api/v1/terms
    │   ├── category.routes.js     # /api/v1/categories
    │   ├── favorite.routes.js     # /api/v1/favorites
    │   └── admin.routes.js        # /api/v1/admin
    └── services/
        ├── similarity.service.js  # Multi-factor Similarity Engine & Justifications
        ├── auth.service.js        # User auth business logic
        ├── court.service.js       # Court queries & filtering
        ├── provision.service.js   # Legal provision queries
        ├── meta.service.js        # System metadata aggregator
        ├── term.service.js        # Term queries, pagination & search
        ├── favorite.service.js    # Favorites storage
        ├── image.service.js       # Social card image metadata
        └── admin.service.js       # Term creation & modification
```

---

## 🗄️ Database Tables (Seed Schema)

1. **User Table (`users`)**:
   - `user_id` (PK), `name`, `email`, `password`, `role` (`Lawyer`, `Legal Researcher`, `Law Student`, `Law Firm`, `Legal Intern`), `phone`, `court_jurisdiction`.
2. **Case Table (`precedents`)**:
   - `case_id` (PK), `title`, `citation`, `court_id`, `court_name`, `year`, `location`, `offence`, `legal_provisions`, `weapon`, `victim`, `circumstances`, `case_description`.
3. **Court Table (`courts`)**:
   - `court_id` (PK), `court_name`, `location`, `court_level` (`Apex Court`, `High Court`, `Sessions Court`).
4. **Legal Provision Table (`provisions`)**:
   - `provision_id` (PK), `law_name`, `section`, `article`, `title`, `description`.
5. **Judgment Table (`judgments`)**:
   - `judgment_id` (PK), `case_id` (FK), `case_facts`, `legal_issues`, `arguments`, `court_reasoning`, `final_decision`, `citations`.
6. **Similar Case Engine & Matching Factors**:
   - Multi-factor cosine, Jaccard tokenization, section matching, modus operandi overlap, and jurisdiction weighting.

---

## 🚀 Quick Start

### 1. Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 2. Environment Variables

Create `.env` (optional, defaults to port 5000):

```env
PORT=5000
NODE_ENV=development
```

### 3. Run Development Server

```bash
# Start with auto-restart on file changes
npm run dev

# Or standard start
npm start
```

### 4. Run Automated Test Suite

```bash
npm test
```

---

## 📡 API Endpoints Catalog

All routes are available under `/api/v1` and aliased under `/api`.

### Case & Precedent Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/cases/search` | Multi-factor similarity search and ranking |
| `GET` | `/api/v1/cases` | List all precedents (filters: `court`, `year`, `offence`, `q`) |
| `GET` | `/api/v1/cases/:id` | Get single precedent with full judgment and court reasoning |
| `POST` | `/api/v1/cases/compare` | Side-by-side comparison of current case against precedents |
| `GET` | `/api/v1/cases/presets` | Get demo case scenarios |
| `GET` | `/api/v1/cases/saved` | List saved case library |
| `POST` | `/api/v1/cases/saved` | Save precedent to library |
| `DELETE` | `/api/v1/cases/saved/:id` | Remove precedent from library |

### Authentication & Users
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Login and obtain JWT token |
| `POST` | `/api/v1/auth/register` | Register new user account |
| `GET` | `/api/v1/auth/me` | Current authenticated user profile |
| `GET` | `/api/v1/auth/roles` | List available user roles |
| `GET` | `/api/v1/auth/users` | List registered user directory |

### Indian Judicial System & Provisions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/courts` | List courts with optional level filter (`Apex Court`, `High Court`, `Sessions Court`) |
| `GET` | `/api/v1/courts/:id` | Get specific court details |
| `GET` | `/api/v1/provisions` | List statutory provisions (IPC, BNS, CrPC, BNSS, IT Act, Constitution) |
| `GET` | `/api/v1/provisions/:id` | Get specific legal provision |
| `GET` | `/api/v1/meta` | Aggregated metadata (courts, provisions, presets, roles, laws) |

### Legal Dictionary Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/categories` | List dictionary categories with term counts |
| `GET` | `/api/v1/terms` | Search and paginate legal terms (`q`, `categoryId`, `page`, `limit`) |
| `GET` | `/api/v1/terms/random` | Word of the Day endpoint |
| `GET` | `/api/v1/terms/:id` | Get legal term details |
| `GET` | `/api/v1/terms/:id/image` | Multi-ratio social share card image metadata |
| `POST` | `/api/v1/terms/:id/share` | Record term share event |
| `GET` | `/api/v1/favorites` | List user favorited terms (requires Bearer token) |
| `POST` | `/api/v1/favorites` | Add term to favorites |
| `DELETE` | `/api/v1/favorites/:id` | Remove term from favorites |

---

## 🧪 Example API Request

### Similarity Search
```bash
curl -X POST http://localhost:5000/api/v1/cases/search \
  -H "Content-Type: application/json" \
  -d '{
    "case_description": "Robbery at jewellery shop in T. Nagar, Chennai using butcher knife.",
    "offence": "Armed Robbery / Dacoity",
    "court": "Madras High Court",
    "location": "Chennai, Tamil Nadu",
    "legal_provision": "IPC Section 397, Section 392"
  }'
```

### Standard Response Envelope
```json
{
  "success": true,
  "data": [
    {
      "id": "case_001",
      "title": "State of Tamil Nadu vs. Ramesh @ Suresh Kumar",
      "citation": "2021 SCC OnLine Mad 4521",
      "courtName": "Madras High Court",
      "year": 2021,
      "similarityScore": 98,
      "whySimilar": [
        "Matching Offence: Both matters involve Armed Robbery / Dacoity.",
        "Statutory Overlap: Both invoke Section(s) 392, 397 (IPC Section 392, IPC Section 397, BNS Section 309, BNS Section 311).",
        "Factual Modus Operandi: Shared elements: KNIFE, SHOP, JEWELLERY, GOLD.",
        "Shared Factual Pattern: Keywords matched [robbery, jewellery, shop, nagar, chennai, knife].",
        "Binding Precedent: Decided by Madras High Court."
      ],
      "factorBreakdown": {
        "offence": { "score": 100, "label": "Offence Type" },
        "provisions": { "score": 100, "label": "Statutory Provisions" },
        "facts": { "score": 95, "label": "Factual Context" },
        "circumstances": { "score": 100, "label": "Modus Operandi" },
        "court": { "score": 100, "label": "Jurisdiction" }
      },
      "judgment": {
        "facts": "Two assailants entered Sri Mahalaxmi Jewellers in T. Nagar...",
        "courtReasoning": "Section 397 does not require grievous hurt if a deadly weapon is used...",
        "finalDecision": "Conviction under IPC Section 392 r/w 397 upheld. 7 years RI."
      }
    }
  ],
  "meta": {
    "totalItems": 1
  },
  "error": null
}
```

---

## 🔒 Security & Best Practices

- **Zero Unhandled Rejections**: Centralized error middleware wraps all failures into structured error responses.
- **Input Sanitization**: Password fields and sensitive tokens are stripped before serialization.
- **CORS Configured**: Fully configurable allowed origins and headers.
- **Graceful Shutdown**: Handles `SIGTERM` signals cleanly.
