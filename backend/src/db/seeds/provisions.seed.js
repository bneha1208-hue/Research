/**
 * Legal Provision Seed Data
 * Matches Legal Provision Table in context/backend.md:
 * - Provision_ID (PK)
 * - Law_Name
 * - Section
 * - Article
 * - Description
 */

const provisions = [
  {
    id: "prov_001",
    provision_id: 1,
    law_name: "Indian Penal Code (IPC)",
    section: "Section 392",
    article: null,
    title: "Punishment for Robbery",
    description: "Whoever commits robbery shall be punished with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine."
  },
  {
    id: "prov_002",
    provision_id: 2,
    law_name: "Indian Penal Code (IPC)",
    section: "Section 397",
    article: null,
    title: "Robbery or dacoity, with attempt to cause death or grievous hurt",
    description: "If, at the time of committing robbery or dacoity, the offender uses any deadly weapon, or causes grievous hurt to any person, or attempts to cause death or grievous hurt to any person, the imprisonment with which such offender shall be punished shall not be less than seven years."
  },
  {
    id: "prov_003",
    provision_id: 3,
    law_name: "Bharatiya Nyaya Sanhita (BNS)",
    section: "Section 309",
    article: null,
    title: "Robbery - definition and punishment",
    description: "Covers robbery definition, theft/extortion converted into robbery, and prescribed punishment under the new criminal code."
  },
  {
    id: "prov_004",
    provision_id: 4,
    law_name: "Bharatiya Nyaya Sanhita (BNS)",
    section: "Section 311",
    article: null,
    title: "Robbery or dacoity with attempt to cause death or grievous hurt",
    description: "Modern equivalent of IPC Section 397 prescribing mandatory minimum 7-year imprisonment for armed robbery using deadly weapons."
  },
  {
    id: "prov_005",
    provision_id: 5,
    law_name: "Indian Penal Code (IPC)",
    section: "Section 420",
    article: null,
    title: "Cheating and dishonestly inducing delivery of property",
    description: "Punishment of imprisonment up to seven years and fine for dishonestly inducing any person to deliver property or alter valuable security."
  },
  {
    id: "prov_006",
    provision_id: 6,
    law_name: "Bharatiya Nyaya Sanhita (BNS)",
    section: "Section 318(4)",
    article: null,
    title: "Cheating and dishonestly inducing delivery of property",
    description: "BNS replacement for Section 420 IPC dealing with aggravated commercial and cyber cheating."
  },
  {
    id: "prov_007",
    provision_id: 7,
    law_name: "Information Technology Act, 2000",
    section: "Section 66D",
    article: null,
    title: "Punishment for cheating by personation by using computer resource",
    description: "Imprisonment up to three years and fine up to one lakh rupees for cheating by personating via computer or digital communication device."
  },
  {
    id: "prov_008",
    provision_id: 8,
    law_name: "Code of Criminal Procedure (CrPC)",
    section: "Section 439",
    article: null,
    title: "Special powers of High Court or Court of Session regarding bail",
    description: "Discretionary jurisdiction of Sessions Courts and High Courts to grant regular or interim bail in non-bailable offences."
  },
  {
    id: "prov_009",
    provision_id: 9,
    law_name: "Bharatiya Nagarik Suraksha Sanhita (BNSS)",
    section: "Section 483",
    article: null,
    title: "Special powers of High Court or Sessions Court regarding bail",
    description: "BNSS replacement for CrPC Section 439 governing bail procedures and judicial conditions."
  },
  {
    id: "prov_010",
    provision_id: 10,
    law_name: "Constitution of India",
    section: null,
    article: "Article 21",
    title: "Protection of life and personal liberty",
    description: "No person shall be deprived of his life or personal liberty except according to procedure established by law."
  },
  {
    id: "prov_011",
    provision_id: 11,
    law_name: "Code of Criminal Procedure (CrPC)",
    section: "Section 41A",
    article: null,
    title: "Notice of appearance before police officer",
    description: "Mandatory notice of appearance in all cases where arrest of a person is not required under the provisions of sub-section (1) of section 41."
  },
  {
    id: "prov_012",
    provision_id: 12,
    law_name: "Indian Penal Code (IPC)",
    section: "Section 307",
    article: null,
    title: "Attempt to Murder",
    description: "Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder."
  }
];

module.exports = provisions;
