/**
 * Legal Terms Seed Data
 * Conforms to Legal Dictionary API Contract 3.1 Term Object
 */

const terms = [
  {
    id: "term_0192",
    word: "Habeas Corpus",
    slug: "habeas-corpus",
    meaning: "A prerogative writ requiring a detained person to be brought before a court to determine the lawfulness of their detention.",
    example: "The advocate filed a writ of habeas corpus before the High Court challenging the unlawful preventive detention.",
    origin: "Latin (lit. 'You shall have the body')",
    categoryId: "cat_maxims",
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-01-10T09:00:00Z"
  },
  {
    id: "term_0193",
    word: "Bona Fide",
    slug: "bona-fide",
    meaning: "In good faith; genuine, sincere, and without any intention to deceive or defraud.",
    example: "The purchaser was declared a bona fide buyer for value without notice of prior mortgage.",
    origin: "Latin",
    categoryId: "cat_maxims",
    createdAt: "2026-01-12T10:00:00Z",
    updatedAt: "2026-01-12T10:00:00Z"
  },
  {
    id: "term_0194",
    word: "Mens Rea",
    slug: "mens-rea",
    meaning: "The mental element or guilty mind required to establish criminal liability alongside the actus reus.",
    example: "The prosecution failed to prove mens rea as the accused acted under an honest mistake of fact.",
    origin: "Latin (lit. 'Guilty mind')",
    categoryId: "cat_criminal",
    createdAt: "2026-01-14T11:00:00Z",
    updatedAt: "2026-01-14T11:00:00Z"
  },
  {
    id: "term_0195",
    word: "Res Judicata",
    slug: "res-judicata",
    meaning: "A matter that has already been adjudicated by a competent court and may not be pursued again by the same parties.",
    example: "The civil court dismissed the fresh suit, holding that the claim was barred by res judicata.",
    origin: "Latin (lit. 'A matter judged')",
    categoryId: "cat_maxims",
    createdAt: "2026-01-15T08:30:00Z",
    updatedAt: "2026-01-15T08:30:00Z"
  },
  {
    id: "term_0196",
    word: "Force Majeure",
    slug: "force-majeure",
    meaning: "An unforeseeable, unavoidable event (e.g. natural disaster, war) that excuses a party from performing contractual obligations.",
    example: "The supplier invoked the force majeure clause when floods disrupted the nationwide supply chain.",
    origin: "French (lit. 'Superior force')",
    categoryId: "cat_contract",
    createdAt: "2026-01-18T14:20:00Z",
    updatedAt: "2026-01-18T14:20:00Z"
  },
  {
    id: "term_0197",
    word: "Quid Pro Quo",
    slug: "quid-pro-quo",
    meaning: "A favor or advantage granted in return for something of value; the essence of consideration in contracts.",
    example: "An enforceable contract requires a lawful quid pro quo between the contracting parties.",
    origin: "Latin (lit. 'Something for something')",
    categoryId: "cat_contract",
    createdAt: "2026-01-20T09:45:00Z",
    updatedAt: "2026-01-20T09:45:00Z"
  },
  {
    id: "term_0198",
    word: "Audi Alteram Partem",
    slug: "audi-alteram-partem",
    meaning: "The fundamental rule of natural justice that no person should be condemned unheard; listen to the other side.",
    example: "The order terminating the license was quashed because the authority violated the principle of audi alteram partem.",
    origin: "Latin (lit. 'Hear the other side')",
    categoryId: "cat_maxims",
    createdAt: "2026-01-22T16:00:00Z",
    updatedAt: "2026-01-22T16:00:00Z"
  },
  {
    id: "term_0199",
    word: "Stare Decisis",
    slug: "stare-decisis",
    meaning: "The legal doctrine requiring courts to adhere to precedent and not disturb settled points of law.",
    example: "Under the doctrine of stare decisis, High Court benches are bound by previous rulings of co-equal benches.",
    origin: "Latin (lit. 'To stand by things decided')",
    categoryId: "cat_maxims",
    createdAt: "2026-01-25T11:15:00Z",
    updatedAt: "2026-01-25T11:15:00Z"
  },
  {
    id: "term_0200",
    word: "Anticipatory Bail",
    slug: "anticipatory-bail",
    meaning: "A pre-arrest judicial direction granting bail to a person in anticipation of potential arrest on accusation of a non-bailable offence.",
    example: "The Sessions Court granted anticipatory bail subject to cooperating with the investigating officer under Section 438 CrPC.",
    origin: "Indian Procedural Jurisprudence",
    categoryId: "cat_criminal",
    createdAt: "2026-01-28T13:00:00Z",
    updatedAt: "2026-01-28T13:00:00Z"
  },
  {
    id: "term_0201",
    word: "Corpus Delicti",
    slug: "corpus-delicti",
    meaning: "The body or objective evidence proving that a specific crime has actually been committed before a person can be convicted.",
    example: "Even in the absence of the victim's physical body, corpus delicti can be proven through strong circumstantial evidence.",
    origin: "Latin (lit. 'Body of the crime')",
    categoryId: "cat_criminal",
    createdAt: "2026-02-01T10:30:00Z",
    updatedAt: "2026-02-01T10:30:00Z"
  },
  {
    id: "term_0202",
    word: "Prima Facie",
    slug: "prima-facie",
    meaning: "Based on first impression; accepted as correct until proven otherwise by contrary evidence.",
    example: "The magistrate found a prima facie case against the accused and issued summons.",
    origin: "Latin (lit. 'At first face')",
    categoryId: "cat_maxims",
    createdAt: "2026-02-05T09:00:00Z",
    updatedAt: "2026-02-05T09:00:00Z"
  },
  {
    id: "term_0203",
    word: "Locus Standi",
    slug: "locus-standi",
    meaning: "The legal right or capacity of a party to bring an action or appear before a court.",
    example: "In Public Interest Litigation (PIL), the traditional requirement of strict locus standi is relaxed by the Supreme Court.",
    origin: "Latin (lit. 'Place of standing')",
    categoryId: "cat_constitutional",
    createdAt: "2026-02-08T12:00:00Z",
    updatedAt: "2026-02-08T12:00:00Z"
  },
  {
    id: "term_0204",
    word: "Section 65B Certificate",
    slug: "section-65b-certificate",
    meaning: "A mandatory evidentiary certificate required under the Indian Evidence Act (BSA Sec 63) to admit electronic records as secondary evidence.",
    example: "The CCTV footage was held inadmissible because the prosecution failed to produce a valid Section 65B certificate.",
    origin: "Indian Evidence Jurisprudence",
    categoryId: "cat_cyber",
    createdAt: "2026-02-10T15:30:00Z",
    updatedAt: "2026-02-10T15:30:00Z"
  }
];

module.exports = terms;
