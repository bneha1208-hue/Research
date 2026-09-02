/**
 * Legal Case Similarity Engine
 * Matches Section 6 & 7 of context/backend.md:
 * - Identifies offence, facts, court, location, legal provisions
 * - Calculates multi-factor weighted similarity score
 * - Extracts "Why Similar?" justification cards
 * - Provides factor breakdown (Offence, Statutory, Facts, Modus Operandi, Court)
 */

const { precedents, courts } = require('../db/seeds/precedents.seed');

// Stopwords to filter out generic English & legal boilerplate
const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can", "client", "court", "did", "do", "does", "doing", "don't", "down", "during", "each", "few",
  "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
  "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "its", "itself",
  "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
  "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she",
  "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
  "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until",
  "up", "very", "was", "wasn't", "we", "were", "weren't", "what", "when", "where", "which", "while",
  "who", "whom", "why", "with", "won't", "would", "you", "your", "yours", "yourself", "yourselves",
  "accused", "case", "matter", "section", "act", "state", "honourable"
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOPWORDS.has(token));
}

function extractSectionNumbers(str) {
  if (!str) return [];
  const matches = str.match(/\b\d+[a-zA-Z]?\b/g) || [];
  return Array.from(new Set(matches.map(s => s.toLowerCase())));
}

function calculateSimilarity(inputCase) {
  const userDescTokens = tokenize(inputCase.case_description || inputCase.description || "");
  const userOffenceTokens = tokenize(inputCase.offence || "");
  const userCourtTokens = tokenize(inputCase.court || inputCase.courtName || "");
  const userLocationTokens = tokenize(inputCase.location || "");
  const userSections = extractSectionNumbers(
    (inputCase.legal_provision || inputCase.legalProvisions || "") + " " +
    (inputCase.case_description || inputCase.description || "")
  );

  const results = precedents.map(precedent => {
    const precDescTokens = tokenize((precedent.description || "") + " " + (precedent.circumstances || ""));
    const precOffenceTokens = tokenize(precedent.offence || "");
    const precCourtTokens = tokenize(precedent.courtName || precedent.court_name || "");
    const precLocationTokens = tokenize(precedent.location || "");
    const precSections = extractSectionNumbers((precedent.legalProvisions || precedent.legal_provisions || []).join(" "));

    // 1. Offence Match (Weight: 30%)
    let offenceScore = 0;
    const offenceIntersect = userOffenceTokens.filter(t => precOffenceTokens.includes(t));
    if (offenceIntersect.length > 0) {
      offenceScore = Math.min(1, offenceIntersect.length / Math.max(1, userOffenceTokens.length));
    } else {
      const descOffenceOverlap = userDescTokens.filter(t => precOffenceTokens.includes(t));
      if (descOffenceOverlap.length > 0) offenceScore = 0.6;
    }

    // 2. Provisions Match (Weight: 25%)
    let provisionScore = 0;
    const matchedSections = [];
    userSections.forEach(sec => {
      if (precSections.includes(sec)) matchedSections.push(sec);
    });
    if (userSections.length > 0) {
      provisionScore = matchedSections.length > 0 ? Math.min(1, matchedSections.length / userSections.length) : 0;
    } else {
      provisionScore = 0.5; // neutral if not provided
    }

    // 3. Factual Cosine / Token Match (Weight: 25%)
    const sharedTokens = userDescTokens.filter(t => precDescTokens.includes(t));
    const uniqueTokens = Array.from(new Set(sharedTokens)).slice(0, 8);
    const factScore = Math.min(1, (uniqueTokens.length / Math.max(3, userDescTokens.length)) * 2.5);

    // 4. Modus Operandi / Weapon (Weight: 10%)
    const keyWeapons = ["knife", "dagger", "rod", "pistol", "gun", "jewellery", "gold", "shop", "digital", "crypto", "bail", "telegram", "bank"];
    const matchedFactors = [];
    keyWeapons.forEach(w => {
      const userHas = (inputCase.case_description || inputCase.description || "").toLowerCase().includes(w) || (inputCase.offence || "").toLowerCase().includes(w);
      const precHas = (precedent.weapon || "").toLowerCase().includes(w) || (precedent.circumstances || "").toLowerCase().includes(w);
      if (userHas && precHas) matchedFactors.push(w.toUpperCase());
    });
    const weaponScore = matchedFactors.length > 0 ? Math.min(1, 0.4 + matchedFactors.length * 0.3) : 0.2;

    // 5. Court & Jurisdiction (Weight: 10%)
    let courtScore = 0;
    if (userCourtTokens.filter(t => precCourtTokens.includes(t)).length > 0) courtScore += 0.6;
    if (userLocationTokens.filter(t => precLocationTokens.includes(t)).length > 0) courtScore += 0.4;
    courtScore = Math.min(1, courtScore);

    // Composite Weighted Score
    let composite = (
      (offenceScore * 0.30) +
      (provisionScore * 0.25) +
      (factScore * 0.25) +
      (weaponScore * 0.10) +
      (courtScore * 0.10)
    );

    if (matchedSections.length > 0 && uniqueTokens.length >= 2) {
      composite = Math.max(composite, 0.76 + (uniqueTokens.length * 0.03));
    }
    composite = Math.min(0.98, Math.max(0.30, composite));
    const similarityPercentage = Math.round(composite * 100);

    // Build "Why Similar?" justification cards
    const whySimilarPoints = [];
    if (offenceScore > 0.4) {
      whySimilarPoints.push(`Matching Offence: Both matters involve ${precedent.offence}.`);
    }
    if (matchedSections.length > 0) {
      whySimilarPoints.push(`Statutory Overlap: Both invoke Section(s) ${matchedSections.join(", ")} (${(precedent.legalProvisions || precedent.legal_provisions || []).join(", ")}).`);
    }
    if (matchedFactors.length > 0) {
      whySimilarPoints.push(`Factual Modus Operandi: Shared elements: ${matchedFactors.join(", ")}.`);
    }
    if (uniqueTokens.length > 0) {
      whySimilarPoints.push(`Shared Factual Pattern: Keywords matched [${uniqueTokens.join(", ")}].`);
    }
    if (courtScore > 0.5) {
      whySimilarPoints.push(`Binding Precedent: Decided by ${precedent.courtName || precedent.court_name}.`);
    }

    return {
      ...precedent,
      similarityScore: similarityPercentage,
      similarity_score: similarityPercentage,
      factorBreakdown: {
        offence: { score: Math.round(offenceScore * 100), label: "Offence Type" },
        provisions: { score: Math.round(provisionScore * 100), label: "Statutory Provisions", matched: matchedSections },
        facts: { score: Math.round(factScore * 100), label: "Factual Context", keywords: uniqueTokens },
        circumstances: { score: Math.round(weaponScore * 100), label: "Modus Operandi", matched: matchedFactors },
        court: { score: Math.round(courtScore * 100), label: "Jurisdiction" }
      },
      factor_breakdown: {
        offence: { score: Math.round(offenceScore * 100), label: "Offence Category" },
        provisions: { score: Math.round(provisionScore * 100), label: "Statutory Provisions", matched: matchedSections },
        facts: { score: Math.round(factScore * 100), label: "Factual Matrix", matched_keywords: uniqueTokens },
        circumstances: { score: Math.round(weaponScore * 100), label: "Modus Operandi", matched_elements: matchedFactors },
        court: { score: Math.round(courtScore * 100), label: "Jurisdiction" }
      },
      whySimilar: whySimilarPoints,
      why_similar: whySimilarPoints
    };
  });

  return results.sort((a, b) => b.similarityScore - a.similarityScore);
}

module.exports = {
  calculateSimilarity,
  tokenize,
  extractSectionNumbers,
  courts
};
