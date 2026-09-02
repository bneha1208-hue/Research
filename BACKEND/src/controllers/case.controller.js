/**
 * Case & Precedent Controller
 * Matches Section 2, 5, 6, 7 in context/backend.md
 */

const { calculateSimilarity } = require('../services/similarity.service');
const { precedents, demoPresets } = require('../db/seeds/precedents.seed');
const courts = require('../db/seeds/courts.seed');

// In-memory store for saved precedents
let savedPrecedentsStore = [
  {
    saved_id: "SAVE-001",
    case_id: "case_001",
    user_id: 1,
    saved_at: "2026-01-15T10:30:00.000Z",
    notes: "Direct precedent on 7-year mandatory minimum under Section 397 IPC in knife shop robbery."
  }
];

async function search(req, res, next) {
  try {
    const inputCase = req.body;
    if (!inputCase.case_description && !inputCase.description && !inputCase.offence) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "BAD_REQUEST",
          message: "Please provide a case description or offence to search."
        }
      });
    }

    const results = calculateSimilarity(inputCase);

    res.status(200).json({
      success: true,
      data: results,
      meta: {
        totalItems: results.length,
        total_matching: results.length,
        query: inputCase
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { q, court, year, offence } = req.query;
    let list = [...precedents];

    if (court) {
      list = list.filter(c => (c.courtName || c.court_name).toLowerCase().includes(court.toLowerCase()));
    }
    if (year) {
      list = list.filter(c => String(c.year) === String(year));
    }
    if (offence) {
      list = list.filter(c => c.offence.toLowerCase().includes(offence.toLowerCase()));
    }
    if (q) {
      const term = q.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.offence.toLowerCase().includes(term) ||
        (c.description || "").toLowerCase().includes(term) ||
        (c.circumstances || "").toLowerCase().includes(term)
      );
    }

    res.status(200).json({
      success: true,
      data: list,
      meta: {
        totalItems: list.length,
        total: list.length,
        courts
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const caseItem = precedents.find(c => c.id === id || c.case_id === id || c.citation === id);

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: "CASE_NOT_FOUND",
          message: "No precedent case found with this ID."
        }
      });
    }

    res.status(200).json({
      success: true,
      data: caseItem,
      case: caseItem,
      judgment: caseItem.judgment || null,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function compare(req, res, next) {
  try {
    const { currentCase, current_case, precedentIds, precedent_ids } = req.body;
    const ids = precedentIds || precedent_ids;

    if (!ids || !Array.isArray(ids) || !ids.length) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "BAD_REQUEST",
          message: "Please provide an array of precedentIds to compare."
        }
      });
    }

    const selected = ids
      .map(id => precedents.find(p => p.id === id || p.case_id === id))
      .filter(Boolean);

    const cCase = currentCase || current_case || {
      title: "Current Matter Under Research",
      offence: "Robbery / Armed Offence",
      court: "Madras High Court",
      description: "Robbery at commercial establishment with knife."
    };

    res.status(200).json({
      success: true,
      data: {
        currentCase: cCase,
        precedents: selected
      },
      comparison: {
        current_case: cCase,
        precedents: selected
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function getPresets(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      data: demoPresets,
      meta: { total: demoPresets.length },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function listSaved(req, res, next) {
  try {
    const detailed = savedPrecedentsStore.map(s => {
      const caseItem = precedents.find(p => p.id === s.case_id || p.case_id === s.case_id);
      return {
        ...s,
        caseDetails: caseItem || null,
        case_details: caseItem || null
      };
    });

    res.status(200).json({
      success: true,
      data: detailed,
      meta: { total: detailed.length },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function addSaved(req, res, next) {
  try {
    const { caseId, case_id, notes, userId, user_id } = req.body;
    const targetCaseId = caseId || case_id;

    if (!targetCaseId) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "BAD_REQUEST",
          message: "caseId or case_id is required."
        }
      });
    }

    const existing = savedPrecedentsStore.find(s => s.case_id === targetCaseId);
    if (existing) {
      if (notes) existing.notes = notes;
      return res.status(200).json({
        success: true,
        message: "Saved case notes updated.",
        data: existing,
        error: null
      });
    }

    const newSave = {
      saved_id: `SAVE-${Date.now()}`,
      case_id: targetCaseId,
      user_id: userId || user_id || 1,
      saved_at: new Date().toISOString(),
      notes: notes || "Important precedent for current case research."
    };

    savedPrecedentsStore.unshift(newSave);

    res.status(201).json({
      success: true,
      message: "Precedent saved to research library.",
      data: newSave,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function removeSaved(req, res, next) {
  try {
    const { id } = req.params;
    const initialLen = savedPrecedentsStore.length;
    savedPrecedentsStore = savedPrecedentsStore.filter(s => s.saved_id !== id && s.case_id !== id);

    if (savedPrecedentsStore.length === initialLen) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Saved precedent record not found."
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "Precedent removed from saved library.",
      data: { deleted: true },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  search,
  list,
  getById,
  compare,
  getPresets,
  listSaved,
  addSaved,
  removeSaved
};
