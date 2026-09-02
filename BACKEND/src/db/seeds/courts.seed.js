/**
 * Court Seed Data - Indian Judicial Hierarchy
 * Matches Court Table in context/backend.md:
 * - Court_ID (PK)
 * - Court_Name
 * - Location
 * - Court_Level
 */

const courts = [
  {
    id: "court_001",
    court_id: 1,
    name: "Supreme Court of India",
    court_name: "Supreme Court of India",
    location: "New Delhi",
    level: "Apex Court",
    court_level: "Apex Court",
    description: "Highest judicial forum and final court of appeal under the Constitution of India."
  },
  {
    id: "court_002",
    court_id: 2,
    name: "Madras High Court",
    court_name: "Madras High Court",
    location: "Chennai, Tamil Nadu",
    level: "High Court",
    court_level: "High Court",
    description: "Principal High Court exercising jurisdiction over Tamil Nadu and Puducherry."
  },
  {
    id: "court_003",
    court_id: 3,
    name: "Madras High Court (Madurai Bench)",
    court_name: "Madras High Court (Madurai Bench)",
    location: "Madurai, Tamil Nadu",
    level: "High Court",
    court_level: "High Court",
    description: "Permanent bench of the Madras High Court covering southern districts of Tamil Nadu."
  },
  {
    id: "court_004",
    court_id: 4,
    name: "Bombay High Court",
    court_name: "Bombay High Court",
    location: "Mumbai, Maharashtra",
    level: "High Court",
    court_level: "High Court",
    description: "Charter High Court exercising jurisdiction over Maharashtra, Goa, and UTs."
  },
  {
    id: "court_005",
    court_id: 5,
    name: "Delhi High Court",
    court_name: "Delhi High Court",
    location: "New Delhi",
    level: "High Court",
    court_level: "High Court",
    description: "High Court for the National Capital Territory of Delhi."
  },
  {
    id: "court_006",
    court_id: 6,
    name: "Karnataka High Court",
    court_name: "Karnataka High Court",
    location: "Bengaluru, Karnataka",
    level: "High Court",
    court_level: "High Court",
    description: "High Court exercising jurisdiction over the state of Karnataka."
  },
  {
    id: "court_007",
    court_id: 7,
    name: "Principal Sessions Court, Chennai",
    court_name: "Principal Sessions Court, Chennai",
    location: "Chennai, Tamil Nadu",
    level: "Sessions Court",
    court_level: "Sessions Court",
    description: "District & Sessions Court trying criminal trials and heinous offences."
  }
];

module.exports = courts;
