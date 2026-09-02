"""
LegalPrecedent - Automated Backend Test Suite
Tests all routes, database operations, models, schemas, and similarity algorithms.
Can run against SQLite test database or active MySQL connection.
"""

import os
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set test environment to use SQLite test database
os.environ["USE_SQLITE_FALLBACK"] = "True"
os.environ["SQLITE_DB_URL"] = "sqlite:///./test_legalprecedent.db"

from app.database import Base, get_db
from app.main import app
from app.models.court import Court
from app.models.legal_provision import LegalProvision
from app.models.case import Case
from app.models.judgment import Judgment
from app.services.similarity import (
    calculate_text_similarity,
    calculate_offence_similarity,
    calculate_court_similarity,
    calculate_provision_similarity,
    calculate_location_similarity
)

# Setup test DB engine & session
TEST_DB_URL = "sqlite:///./test_legalprecedent.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

def setup_test_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

def teardown_test_database():
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_legalprecedent.db"):
        try:
            os.remove("./test_legalprecedent.db")
        except Exception:
            pass

client = TestClient(app)

# -----------------------------------------------------------
# 1. Test General Endpoints
# -----------------------------------------------------------
def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "LegalPrecedent"
    assert data["status"] == "online"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data

# -----------------------------------------------------------
# 2. Test User Endpoints
# -----------------------------------------------------------
def test_user_registration_and_retrieval():
    payload = {
        "Name": "Adv. Ramesh Varma",
        "Email": "ramesh.varma@example.com",
        "Password": "securepassword123",
        "Role": "Lawyer"
    }
    response = client.post("/users/register", json=payload)
    assert response.status_code == 201
    user_data = response.json()
    assert user_data["Email"] == "ramesh.varma@example.com"
    assert user_data["Role"] == "Lawyer"
    assert "Password" not in user_data  # Password must never be exposed
    user_id = user_data["User_ID"]

    # Retrieve User by ID
    get_res = client.get(f"/users/{user_id}")
    assert get_res.status_code == 200
    assert get_res.json()["Name"] == "Adv. Ramesh Varma"

    # Test Duplicate Email Rejection
    dup_res = client.post("/users/register", json=payload)
    assert dup_res.status_code == 400

    # Test Login
    login_res = client.post("/users/login", json={"Email": "ramesh.varma@example.com", "Password": "securepassword123"})
    assert login_res.status_code == 200

# -----------------------------------------------------------
# 3. Test Court Endpoints
# -----------------------------------------------------------
def test_court_endpoints():
    court_payload = {
        "Court_Name": "High Court of Delhi",
        "Location": "New Delhi",
        "Court_Level": "High Court"
    }
    response = client.post("/courts", json=court_payload)
    assert response.status_code == 201
    court_data = response.json()
    assert court_data["Court_Name"] == "High Court of Delhi"
    court_id = court_data["Court_ID"]

    # List Courts
    list_res = client.get("/courts")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Get Single Court
    get_res = client.get(f"/courts/{court_id}")
    assert get_res.status_code == 200
    assert get_res.json()["Location"] == "New Delhi"

# -----------------------------------------------------------
# 4. Test Legal Provision Endpoints
# -----------------------------------------------------------
def test_legal_provision_endpoints():
    prov_payload = {
        "Law_Name": "Bharatiya Nyaya Sanhita (BNS)",
        "Section": "Section 303",
        "Article": None,
        "Description": "Theft: Dishonest taking of movable property out of possession without consent."
    }
    response = client.post("/legal-provisions", json=prov_payload)
    assert response.status_code == 201
    prov_data = response.json()
    assert prov_data["Section"] == "Section 303"
    prov_id = prov_data["Provision_ID"]

    # List Legal Provisions
    list_res = client.get("/legal-provisions")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Get Single Provision
    get_res = client.get(f"/legal-provisions/{prov_id}")
    assert get_res.status_code == 200
    assert get_res.json()["Law_Name"] == "Bharatiya Nyaya Sanhita (BNS)"

# -----------------------------------------------------------
# 5. Test Case & Judgment Endpoints + Similarity Engine
# -----------------------------------------------------------
def test_case_judgment_and_similarity_flow():
    # 1. Create a second court and provision for diverse matching
    c2 = client.post("/courts", json={"Court_Name": "Supreme Court of India", "Location": "New Delhi", "Court_Level": "Supreme Court"}).json()
    p2 = client.post("/legal-provisions", json={"Law_Name": "Bharatiya Nyaya Sanhita (BNS)", "Section": "Section 103", "Description": "Punishment for Murder."}).json()

    # 2. Add Precedent Case 1 (Warehouse Theft)
    case1_res = client.post("/cases", json={
        "Case_Title": "State v. Ramesh (Warehouse Theft Precedent)",
        "Case_Description": "The accused broke into a locked commercial warehouse at night and dishonestly stole electronics and laptops.",
        "Offence": "Theft",
        "Location": "New Delhi",
        "Court_ID": 1,
        "Legal_Provision_ID": 1
    })
    assert case1_res.status_code == 201
    case1_id = case1_res.json()["Case_ID"]

    # Add Judgment for Case 1
    j1_res = client.post("/judgments", json={
        "Case_ID": case1_id,
        "Case_Facts": "Accused broke into commercial warehouse and stole electronic goods.",
        "Legal_Provisions": "BNS Section 303 (Theft).",
        "Court_Reasoning": "Discovery of stolen goods at residence confirmed guilt beyond reasonable doubt.",
        "Final_Decision": "Convicted and sentenced to 2 years rigorous imprisonment."
    })
    assert j1_res.status_code == 201

    # 3. Add Precedent Case 2 (Murder Case - Unrelated)
    case2_res = client.post("/cases", json={
        "Case_Title": "State v. Sunil (Murder Precedent)",
        "Case_Description": "The accused committed intentional homicide using a sharp knife during a violent property confrontation.",
        "Offence": "Murder",
        "Location": "New Delhi",
        "Court_ID": c2["Court_ID"],
        "Legal_Provision_ID": p2["Provision_ID"]
    })
    assert case2_res.status_code == 201
    case2_id = case2_res.json()["Case_ID"]

    # 4. Add Current Case (New Case entered by Lawyer: Commercial Warehouse Theft)
    current_case_res = client.post("/cases", json={
        "Case_Title": "Current Investigation: Okhla Godown Break-in",
        "Case_Description": "Suspect forced entry into a warehouse at night and took laptops and computer equipment without owner permission.",
        "Offence": "Theft",
        "Location": "New Delhi",
        "Court_ID": 1,
        "Legal_Provision_ID": 1
    })
    assert current_case_res.status_code == 201
    current_case_id = current_case_res.json()["Case_ID"]

    # 5. Call Similarity API: GET /cases/{current_case_id}/similar
    sim_res = client.get(f"/cases/{current_case_id}/similar")
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    
    assert sim_data["current_case_id"] == current_case_id
    assert len(sim_data["similar_cases"]) >= 2

    # The Warehouse Theft precedent should rank #1 with high score
    top_match = sim_data["similar_cases"][0]
    assert top_match["previous_case_id"] == case1_id
    assert top_match["similarity_score"] > 60.0  # High multi-factor similarity
    assert any("Theft" in factor or "offence" in factor.lower() for factor in top_match["matching_factors"])
    assert top_match["judgment"] is not None
    assert "2 years" in top_match["judgment"]["Final_Decision"]

    # Test Judgment retrieval endpoint specifically
    judgment_by_case = client.get(f"/cases/{case1_id}/judgment")
    assert judgment_by_case.status_code == 200
    assert judgment_by_case.json()["Case_ID"] == case1_id

# -----------------------------------------------------------
# 6. Test Unit Functions for Similarity
# -----------------------------------------------------------
def test_similarity_functions():
    text1 = "Accused committed theft of motor vehicle from residential driveway at night"
    text2 = "Accused stole a parked car from outside a home during night time"
    score = calculate_text_similarity(text1, text2)
    assert score > 0.1

    offence_score, factor = calculate_offence_similarity("Theft", "Theft")
    assert offence_score == 1.0
    assert "Exact matching offence" in factor

    loc_score, loc_factor = calculate_location_similarity("New Delhi", "New Delhi")
    assert loc_score == 1.0
    assert "Same jurisdictional location" in loc_factor

if __name__ == "__main__":
    print("==================================================")
    print("Running LegalPrecedent Backend Test Suite...")
    print("==================================================")
    
    # 1. Clean & setup DB
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    
    tests = [
        ("Root Endpoint", test_root_endpoint),
        ("Health Endpoint", test_health_endpoint),
        ("User Registration, Login & Duplicates", test_user_registration_and_retrieval),
        ("Court Endpoints", test_court_endpoints),
        ("Legal Provision Endpoints", test_legal_provision_endpoints),
        ("Case, Judgment & Multi-factor Similarity Flow", test_case_judgment_and_similarity_flow),
        ("Similarity Unit Logic", test_similarity_functions),
    ]

    passed = 0
    for name, test_fn in tests:
        try:
            test_fn()
            print(f"[PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"[FAIL] {name} - {e}")
            import traceback
            traceback.print_exc()

    print("==================================================")
    print(f"Results: {passed}/{len(tests)} tests passed successfully!")
    print("==================================================")
    
    # Clean up test DB
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_legalprecedent.db"):
        try:
            os.remove("./test_legalprecedent.db")
        except Exception:
            pass

