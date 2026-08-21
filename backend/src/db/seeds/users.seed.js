/**
 * User Seed Data
 * Matches User Table in context/backend.md:
 * - User_ID (PK)
 * - Name
 * - Email
 * - Password
 * - Role: Lawyer, Legal Researcher, Law Student, Law Firm, Legal Intern
 */

const ROLES = [
  "Lawyer",
  "Legal Researcher",
  "Law Student",
  "Law Firm",
  "Legal Intern",
  "Admin"
];

const users = [
  {
    id: "user_001",
    user_id: 1,
    name: "Adv. Rajesh Varma",
    email: "rajesh.varma@lawchamber.in",
    password: "hashed_password_demo_1",
    role: "Lawyer",
    bar_council_id: "TN/1423/2014",
    phone: "+91 98401 23456",
    practice_areas: ["Criminal Law", "Constitutional Law"],
    court_jurisdiction: "Madras High Court",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "user_002",
    user_id: 2,
    name: "Kavitha Sundaram",
    email: "kavitha.s@nls.ac.in",
    password: "hashed_password_demo_2",
    role: "Law Student",
    phone: "+91 97890 54321",
    institution: "National Law School of India University",
    practice_areas: ["Cyber Law", "Criminal Jurisprudence"],
    court_jurisdiction: "Karnataka High Court",
    createdAt: "2026-01-05T00:00:00.000Z"
  },
  {
    id: "user_003",
    user_id: 3,
    name: "Siddharth Menon",
    email: "siddharth@menonassociates.com",
    password: "hashed_password_demo_3",
    role: "Legal Researcher",
    phone: "+91 94440 98765",
    practice_areas: ["Commercial Arbitration", "Contract Law"],
    court_jurisdiction: "Bombay High Court",
    createdAt: "2026-01-10T00:00:00.000Z"
  },
  {
    id: "user_004",
    user_id: 4,
    name: "Ananya Iyer",
    email: "ananya.iyer@intern.law",
    password: "hashed_password_demo_4",
    role: "Legal Intern",
    phone: "+91 98840 11223",
    institution: "Madras Law College",
    practice_areas: ["Criminal Appeals", "Bail Jurisprudence"],
    court_jurisdiction: "Madras High Court",
    createdAt: "2026-01-15T00:00:00.000Z"
  },
  {
    id: "user_005",
    user_id: 5,
    name: "Chambers of D. Sengupta",
    email: "contact@senguptalaw.in",
    password: "hashed_password_demo_5",
    role: "Law Firm",
    phone: "+91 98110 99887",
    practice_areas: ["Supreme Court Litigation", "High Court Writs"],
    court_jurisdiction: "Supreme Court of India",
    createdAt: "2026-01-20T00:00:00.000Z"
  }
];

module.exports = {
  users,
  ROLES
};
