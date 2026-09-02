/**
 * Categories Seed Data
 * Matches Legal Dictionary API Contract 3.2 Category Object
 */

const categories = [
  {
    id: "cat_maxims",
    name: "Legal Maxims",
    description: "Classical Latin principles and enduring maxims of jurisprudence",
    termCount: 6
  },
  {
    id: "cat_criminal",
    name: "Criminal Law",
    description: "Offences, procedural doctrines, bail rules, and penalties under IPC and BNS",
    termCount: 5
  },
  {
    id: "cat_contract",
    name: "Contract & Commercial Law",
    description: "Agreements, breach, damages, indemnity, and commercial liabilities",
    termCount: 4
  },
  {
    id: "cat_constitutional",
    name: "Constitutional Law",
    description: "Fundamental rights, writ jurisdictions, judicial review, and constitutional doctrines",
    termCount: 3
  },
  {
    id: "cat_cyber",
    name: "Cyber & Evidence Law",
    description: "Digital forensics, electronic records admissibility, cyber offences under IT Act",
    termCount: 3
  }
];

module.exports = categories;
