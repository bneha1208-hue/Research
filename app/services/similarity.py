import re
import json
import logging
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.judgment import Judgment
from app.models.similar_case import SimilarCase
from app.schemas.similar_case import SimilarCaseResultItem, CaseSimilarityAnalysisResponse
from app.schemas.judgment import JudgmentResponse

logger = logging.getLogger("legalprecedent.similarity")

def clean_text(text: str) -> str:
    """Helper to clean and normalize text for vectorization."""
    if not text:
        return ""
    # Lowercase and remove excessive whitespace/special characters
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def calculate_text_similarity(doc1: str, doc2: str) -> float:
    """
    Calculate TF-IDF Cosine Similarity between two text descriptions.
    Returns a score between 0.0 and 1.0.
    """
    clean_d1 = clean_text(doc1)
    clean_d2 = clean_text(doc2)

    if not clean_d1 or not clean_d2:
        return 0.0

    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform([clean_d1, clean_d2])
        sim_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        score = float(sim_matrix[0][0])
        return max(0.0, min(1.0, score))
    except Exception as e:
        logger.warning(f"Error calculating TF-IDF similarity: {e}")
        return 0.0

def calculate_offence_similarity(offence1: str, offence2: str) -> (float, Optional[str]):
    """Calculate similarity between two offences."""
    o1 = clean_text(offence1)
    o2 = clean_text(offence2)

    if not o1 or not o2:
        return 0.0, None

    if o1 == o2:
        return 1.0, f"Exact matching offence: '{offence1}'"

    # Token overlap check (e.g. 'theft of motor vehicle' vs 'vehicle theft')
    set1 = set(o1.split())
    set2 = set(o2.split())
    overlap = set1.intersection(set2)

    if overlap:
        jaccard = len(overlap) / len(set1.union(set2))
        if jaccard >= 0.5:
            return 0.8, f"Substantially similar offence ('{offence1}' and '{offence2}')"
        elif jaccard >= 0.2:
            return 0.4, f"Related offence category ('{offence1}' and '{offence2}')"

    return 0.0, None

def calculate_court_similarity(court1, court2) -> (float, Optional[str]):
    """Calculate similarity based on court name and hierarchy level."""
    if not court1 or not court2:
        return 0.0, None

    if court1.Court_ID == court2.Court_ID:
        return 1.0, f"Same court: '{court1.Court_Name}'"

    if court1.Court_Level.lower() == court2.Court_Level.lower():
        return 0.6, f"Same judicial hierarchy level: '{court1.Court_Level}'"

    return 0.0, None

def calculate_provision_similarity(prov1, prov2) -> (float, Optional[str]):
    """Calculate similarity based on legal provision / section / law name."""
    if not prov1 or not prov2:
        return 0.0, None

    if prov1.Provision_ID == prov2.Provision_ID:
        section_label = prov1.Section or prov1.Article or ""
        return 1.0, f"Same legal provision: {prov1.Law_Name} {section_label}".strip()

    # Same section or article under different act or same law name
    if (prov1.Section and prov1.Section.lower() == (prov2.Section or "").lower()) or \
       (prov1.Article and prov1.Article.lower() == (prov2.Article or "").lower()):
        return 0.8, f"Matching legal section/article: {prov1.Section or prov1.Article}"

    if prov1.Law_Name.lower() == prov2.Law_Name.lower():
        return 0.4, f"Governed under the same legislation: '{prov1.Law_Name}'"

    return 0.0, None

def calculate_location_similarity(loc1: str, loc2: str) -> (float, Optional[str]):
    """Calculate similarity based on geographic location/jurisdiction."""
    l1 = clean_text(loc1)
    l2 = clean_text(loc2)

    if not l1 or not l2:
        return 0.0, None

    if l1 == l2:
        return 1.0, f"Same jurisdictional location: '{loc1}'"

    return 0.0, None

def find_similar_cases(
    current_case: Case,
    db: Session,
    top_n: int = 10,
    save_to_db: bool = True
) -> CaseSimilarityAnalysisResponse:
    """
    Search all previous cases in database, compute multi-factor similarity scores,
    identify matching factors, rank them descending, and optionally save top matches
    to the `similar_cases` table.
    """
    # Fetch all other cases from the database
    all_other_cases = db.query(Case).filter(Case.Case_ID != current_case.Case_ID).all()

    results: List[SimilarCaseResultItem] = []

    # Pre-clean current case text
    current_text = f"{current_case.Case_Description} {current_case.Offence}"

    for prev_case in all_other_cases:
        matching_factors = []

        # 1. Text Similarity on Facts / Description (Weight: 45%)
        prev_text = f"{prev_case.Case_Description} {prev_case.Offence}"
        text_sim = calculate_text_similarity(current_text, prev_text)
        if text_sim >= 0.20:
            matching_factors.append(f"Similar case facts (TF-IDF similarity: {round(text_sim * 100, 1)}%)")

        # 2. Offence Similarity (Weight: 25%)
        offence_sim, offence_factor = calculate_offence_similarity(current_case.Offence, prev_case.Offence)
        if offence_factor:
            matching_factors.append(offence_factor)

        # 3. Legal Provision Similarity (Weight: 15%)
        prov_sim, prov_factor = calculate_provision_similarity(current_case.legal_provision, prev_case.legal_provision)
        if prov_factor:
            matching_factors.append(prov_factor)

        # 4. Court Similarity (Weight: 10%)
        court_sim, court_factor = calculate_court_similarity(current_case.court, prev_case.court)
        if court_factor:
            matching_factors.append(court_factor)

        # 5. Location Similarity (Weight: 5%)
        loc_sim, loc_factor = calculate_location_similarity(current_case.Location, prev_case.Location)
        if loc_factor:
            matching_factors.append(loc_factor)

        # Compute weighted composite score (0 to 100)
        composite_score = (
            (text_sim * 0.45) +
            (offence_sim * 0.25) +
            (prov_sim * 0.15) +
            (court_sim * 0.10) +
            (loc_sim * 0.05)
        ) * 100.0

        # Normalize score
        final_score = round(max(0.0, min(100.0, composite_score)), 1)

        # Prepare judgment response if present
        judgment_res = None
        if prev_case.judgment:
            judgment_res = JudgmentResponse(
                Judgment_ID=prev_case.judgment.Judgment_ID,
                Case_ID=prev_case.judgment.Case_ID,
                Case_Facts=prev_case.judgment.Case_Facts,
                Legal_Provisions=prev_case.judgment.Legal_Provisions,
                Court_Reasoning=prev_case.judgment.Court_Reasoning,
                Final_Decision=prev_case.judgment.Final_Decision,
                Created_At=prev_case.judgment.Created_At
            )

        court_name = prev_case.court.Court_Name if prev_case.court else "Unknown"
        court_level = prev_case.court.Court_Level if prev_case.court else "Unknown"
        provision_label = "Unknown"
        if prev_case.legal_provision:
            sec_art = prev_case.legal_provision.Section or prev_case.legal_provision.Article or ""
            provision_label = f"{prev_case.legal_provision.Law_Name} ({sec_art})".strip()

        item = SimilarCaseResultItem(
            previous_case_id=prev_case.Case_ID,
            case_title=prev_case.Case_Title or f"Case #{prev_case.Case_ID}",
            case_description=prev_case.Case_Description,
            offence=prev_case.Offence,
            location=prev_case.Location,
            court_name=court_name,
            court_level=court_level,
            legal_provision=provision_label,
            similarity_score=final_score,
            similarity_percentage=f"{final_score}%",
            matching_factors=matching_factors if matching_factors else ["General legal precedent comparison"],
            judgment=judgment_res
        )
        results.append(item)

    # Rank results descending by similarity score
    results.sort(key=lambda x: x.similarity_score, reverse=True)
    top_results = results[:top_n]

    # Save to similar_cases table if requested
    if save_to_db and top_results:
        try:
            # Remove prior computed similarities for this current case to avoid duplicates
            db.query(SimilarCase).filter(SimilarCase.Current_Case_ID == current_case.Case_ID).delete()
            for res in top_results:
                record = SimilarCase(
                    Current_Case_ID=current_case.Case_ID,
                    Previous_Case_ID=res.previous_case_id,
                    Similarity_Score=res.similarity_score,
                    Matching_Factors=json.dumps(res.matching_factors)
                )
                db.add(record)
            db.commit()
        except Exception as e:
            logger.error(f"Error saving similar cases to database: {e}")
            db.rollback()

    court_display = current_case.court.Court_Name if current_case.court else "Unknown"
    prov_display = "Unknown"
    if current_case.legal_provision:
        sec = current_case.legal_provision.Section or current_case.legal_provision.Article or ""
        prov_display = f"{current_case.legal_provision.Law_Name} ({sec})".strip()

    return CaseSimilarityAnalysisResponse(
        current_case_id=current_case.Case_ID,
        current_case_title=current_case.Case_Title,
        current_offence=current_case.Offence,
        current_location=current_case.Location,
        current_court=court_display,
        current_legal_provision=prov_display,
        total_precedents_evaluated=len(all_other_cases),
        total_matches_found=len(top_results),
        similar_cases=top_results
    )
