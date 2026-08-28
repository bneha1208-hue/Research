/**
 * Automated API Verification Test Suite
 * Tests all endpoints against context/backend.md and Legal Dictionary specs
 */

const http = require('http');
const app = require('../src/app');

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await res.json();
  return { status: res.status, data };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("=================================================");
  console.log("  LegalPrecedent Backend API Test Runner");
  console.log("=================================================\n");

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  try {
    // 1. Health & Discovery
    console.log("1. System Health & Discovery:");
    {
      const res = await request('/');
      assert(res.status === 200, "GET / returns 200 OK");
      assert(res.data.success === true, "GET / returns success=true");
      assert(res.data.data.endpoints.precedents.length > 0, "Root lists precedent endpoints");
    }
    {
      const res = await request('/api/v1/info');
      assert(res.status === 200, "GET /api/v1/info returns 200");
    }
    {
      const res = await request('/api/v1/meta');
      assert(res.status === 200, "GET /api/v1/meta returns 200");
      assert(res.data.data.courts.length > 0, "Metadata returns courts list");
      assert(res.data.data.legalProvisions.length > 0, "Metadata returns legal provisions list");
      assert(res.data.data.roles.includes("Lawyer"), "Metadata includes Lawyer role");
    }

    // 2. Authentication & Roles
    console.log("\n2. User & Auth Endpoints (context/backend.md User Table):");
    let authToken = "";
    {
      const res = await request('/api/v1/auth/roles');
      assert(res.status === 200, "GET /api/v1/auth/roles returns 200");
      assert(res.data.data.length >= 5, "Returns all required roles (Lawyer, Researcher, Student, etc.)");
    }
    {
      const res = await request('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: "rajesh.varma@lawchamber.in", role: "Lawyer" })
      });
      assert(res.status === 200, "POST /api/v1/auth/login returns 200");
      assert(res.data.data.user.role === "Lawyer", "User authenticated with Lawyer role");
      assert(Boolean(res.data.data.token), "Auth returns JWT bearer token");
      authToken = res.data.data.token;
    }
    {
      const res = await request('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: "Adv. Meenakshi Sundaram", email: "meenakshi@lawfirm.in", role: "Law Firm" })
      });
      assert(res.status === 201, "POST /api/v1/auth/register returns 201 Created");
      assert(res.data.data.user.name === "Adv. Meenakshi Sundaram", "Registered user profile correct");
    }
    {
      const res = await request('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      assert(res.status === 200, "GET /api/v1/auth/me with Bearer token returns 200");
    }

    // 3. Courts & Legal Provisions
    console.log("\n3. Courts & Legal Provisions (Court Table & Provision Table):");
    {
      const res = await request('/api/v1/courts');
      assert(res.status === 200, "GET /api/v1/courts returns 200");
      assert(res.data.data.some(c => c.name.includes("Madras High Court")), "Courts include Madras High Court");
    }
    {
      const res = await request('/api/v1/courts/court_002');
      assert(res.status === 200, "GET /api/v1/courts/:id returns specific court");
    }
    {
      const res = await request('/api/v1/provisions');
      assert(res.status === 200, "GET /api/v1/provisions returns 200");
      assert(res.data.data.some(p => p.section === "Section 397"), "Provisions include Section 397 IPC");
    }

    // 4. Precedent Case Search & Similarity Engine
    console.log("\n4. Precedent Search & Similarity Engine (context/backend.md Process):");
    {
      const res = await request('/api/v1/cases/search', {
        method: 'POST',
        body: JSON.stringify({
          case_description: "Robbery at jewellery shop in Chennai. Accused used butcher knife to threaten staff and stole gold ornaments.",
          offence: "Armed Robbery / Dacoity",
          court: "Madras High Court",
          location: "Chennai, Tamil Nadu",
          legal_provision: "IPC Section 397, Section 392"
        })
      });
      assert(res.status === 200, "POST /api/v1/cases/search returns 200");
      assert(res.data.data.length > 0, "Similarity engine returns ranked matching cases");
      const topMatch = res.data.data[0];
      assert(topMatch.similarityScore >= 75, `Top match scored high similarity (${topMatch.similarityScore}%)`);
      assert(topMatch.whySimilar && topMatch.whySimilar.length > 0, "Top match contains structured 'Why Similar?' reasons");
      assert(Boolean(topMatch.factorBreakdown.offence), "Factor breakdown contains Offence score");
      assert(Boolean(topMatch.factorBreakdown.provisions), "Factor breakdown contains Statutory Provisions score");
      assert(Boolean(topMatch.factorBreakdown.facts), "Factor breakdown contains Fact Cosine score");
      assert(Boolean(topMatch.judgment), "Top match includes full Judgment details");
    }

    // 5. Precedent Retrieval & Compare
    console.log("\n5. Precedent Retrieval & Comparison:");
    {
      const res = await request('/api/v1/cases');
      assert(res.status === 200, "GET /api/v1/cases returns 200");
      assert(res.data.data.length >= 5, "Returns all seeded precedent cases");
    }
    {
      const res = await request('/api/v1/cases/case_001');
      assert(res.status === 200, "GET /api/v1/cases/:id returns 200");
      assert(Boolean(res.data.data.judgment.courtReasoning), "Case includes detailed Court Reasoning");
      assert(Boolean(res.data.data.judgment.finalDecision), "Case includes Final Decision");
    }
    {
      const res = await request('/api/v1/cases/presets');
      assert(res.status === 200, "GET /api/v1/cases/presets returns 200");
      assert(res.data.data.length >= 3, "Returns demo scenario presets");
    }
    {
      const res = await request('/api/v1/cases/compare', {
        method: 'POST',
        body: JSON.stringify({
          currentCase: {
            title: "Current Matter Under Research",
            offence: "Robbery with Knife",
            court: "Madras High Court"
          },
          precedentIds: ["case_001", "case_002"]
        })
      });
      assert(res.status === 200, "POST /api/v1/cases/compare returns 200");
      assert(res.data.data.precedents.length === 2, "Comparison returns both compared precedents");
    }

    // 6. Saved Cases Library
    console.log("\n6. Saved Cases Library:");
    let savedId = "";
    {
      const res = await request('/api/v1/cases/saved', {
        method: 'POST',
        body: JSON.stringify({ caseId: "case_003", notes: "Precedent for attempted robbery" })
      });
      assert(res.status === 201, "POST /api/v1/cases/saved returns 201 Created");
      savedId = res.data.data.saved_id;
    }
    {
      const res = await request('/api/v1/cases/saved');
      assert(res.status === 200, "GET /api/v1/cases/saved returns 200");
      assert(res.data.data.some(s => s.case_id === "case_003"), "Saved cases contains saved precedent");
    }
    {
      const res = await request(`/api/v1/cases/saved/${savedId}`, { method: 'DELETE' });
      assert(res.status === 200, "DELETE /api/v1/cases/saved/:id returns 200");
    }

    // 7. Legal Dictionary Endpoints
    console.log("\n7. Legal Dictionary Endpoints:");
    {
      const res = await request('/api/v1/categories');
      assert(res.status === 200, "GET /api/v1/categories returns 200");
      assert(res.data.data.length >= 5, "Returns legal categories");
    }
    {
      const res = await request('/api/v1/terms');
      assert(res.status === 200, "GET /api/v1/terms returns 200");
      assert(res.data.data.length > 0, "Returns legal terms list");
    }
    {
      const res = await request('/api/v1/terms/random');
      assert(res.status === 200, "GET /api/v1/terms/random returns 200");
      assert(Boolean(res.data.data.word), "Word of the day returns valid term");
    }
    {
      const res = await request('/api/v1/favorites', {
        headers: { Authorization: `Bearer user_token_demo_001` }
      });
      assert(res.status === 200, "GET /api/v1/favorites with token returns 200");
    }

    // 8. 404 Route Handling
    console.log("\n8. Error Handling & 404 Route:");
    {
      const res = await request('/api/v1/non-existent-endpoint');
      assert(res.status === 404, "404 route returns HTTP 404");
      assert(res.data.error.code === "ROUTE_NOT_FOUND", "404 returns structured error object");
    }

    console.log("\n=================================================");
    console.log(`  Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error("Test Suite crashed:", err);
  if (server) server.close();
  process.exit(1);
});
