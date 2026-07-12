/* ──────────────────────────────────────────────────────────────
   Alexandria modules — the central registry for KB subjects.

   A "module" is the interactive workspace for a Knowledge Bank
   subject (Vision, Bets, Guardrails, etc.). Each one has:
     - a card representation on the Info Hub kanban
     - a status that flows Incoming → In Discussion → Banked
     - an atomized artifact written into the library on bank

   Modules differ in shape (Vision = 9-slot form; Vocabulary =
   word-tetris) but share this lifecycle.

   This file is intentionally small. Most of the heavy work
   (atomization, kanban re-render, library card injection) is
   handled by listeners on the module:banked event.
   ────────────────────────────────────────────────────────────── */
(() => {
  const STORAGE_KEY = 'alexandria-modules:v1';

  // Canonical subject order. Bank unlocks the next one in line.
  const SUBJECT_ORDER = [
    'vision',
    'bets',
    'guardrails',
    'vocabulary',
    'user-research'
  ];

  // Module records. `status` ∈ locked | incoming | in-discussion |
  // awaiting-nod | banked. Vision starts in-discussion (the very
  // first onboarding subject); everything else is locked.
  const DEFAULTS = {
    vision: {
      id: 'vision',
      title: 'Vision',
      cardLabel: 'Vision.md (draft)',
      cardLabelBanked: 'Vision.md',
      kbSubject: 'vision',
      status: 'in-discussion',
      banked: false,
      bankedAt: null,
      atomized: null
    },
    bets: {
      id: 'bets',
      title: 'Bets',
      cardLabel: 'Bets.md',
      cardLabelBanked: 'Bets.md',
      kbSubject: 'bets',
      status: 'locked',
      banked: false,
      bankedAt: null,
      atomized: null
    },
    guardrails: {
      id: 'guardrails',
      title: 'Guardrails',
      cardLabel: 'Guardrails.md',
      cardLabelBanked: 'Guardrails.md',
      kbSubject: 'guardrails',
      status: 'locked',
      banked: false,
      bankedAt: null,
      atomized: null
    },
    vocabulary: {
      id: 'vocabulary',
      title: 'Vocabulary',
      cardLabel: 'Vocabulary.md',
      cardLabelBanked: 'Vocabulary.md',
      kbSubject: 'vocabulary',
      status: 'locked',
      banked: false,
      bankedAt: null,
      atomized: null
    },
    'user-research': {
      id: 'user-research',
      title: 'User Research',
      cardLabel: 'User-research.md',
      cardLabelBanked: 'User-research.md',
      kbSubject: 'user-research',
      status: 'locked',
      banked: false,
      bankedAt: null,
      atomized: null
    }
  };

  function clone(obj) {
    try { return JSON.parse(JSON.stringify(obj)); } catch (_) { return obj; }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULTS);
      const parsed = JSON.parse(raw);
      // Backfill any new modules added to DEFAULTS since last save.
      const merged = clone(DEFAULTS);
      Object.keys(parsed || {}).forEach(id => {
        if (merged[id]) Object.assign(merged[id], parsed[id]);
      });
      return merged;
    } catch (_) {
      return clone(DEFAULTS);
    }
  }

  function save(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  let state = load();

  // ── Public API ───────────────────────────────────────────────
  function get(id) { return state[id] ? clone(state[id]) : null; }
  function all() { return clone(state); }
  function order() { return SUBJECT_ORDER.slice(); }

  // The single subject currently expected to be worked on. Returns
  // the first in-discussion module, falling back to the first
  // unbanked module in order. Used by the KB to set its pulse
  // target.
  function getActive() {
    for (const id of SUBJECT_ORDER) {
      const m = state[id];
      if (m && m.status === 'in-discussion') return clone(m);
    }
    for (const id of SUBJECT_ORDER) {
      const m = state[id];
      if (m && !m.banked) return clone(m);
    }
    return null;
  }

  // Bank a module. Marks it banked + advances kanban state + unlocks
  // the next-in-line + fires module:banked. We deliberately do NOT
  // store the atomized content here — the canvas-server's vision.json
  // is the authoritative source of slot text / scratch / notch values.
  // Listeners that need the actual atomized content (e.g. library-sync.js
  // when it builds a library card) fetch /api/canvas/vision rather than
  // reading a duplicated copy here.
  //
  // NOTE: bank() previously accepted a (id, payload) signature where
  // payload was stored on mod.atomized for client-side reading. That
  // duplicated the server's authoritative state. The new signature is
  // (id) only — any extra args are ignored, but old callers passing
  // a payload won't error. If you find yourself reaching for a
  // payload here, fetch /api/canvas/vision instead.
  function bank(id) {
    const mod = state[id];
    if (!mod) return null;
    mod.status = 'banked';
    mod.banked = true;
    mod.bankedAt = new Date().toISOString();

    let next = null;
    const idx = SUBJECT_ORDER.indexOf(id);
    if (idx >= 0 && idx + 1 < SUBJECT_ORDER.length) {
      const nextId = SUBJECT_ORDER[idx + 1];
      const nextMod = state[nextId];
      if (nextMod && nextMod.status === 'locked') {
        nextMod.status = 'in-discussion';
        next = clone(nextMod);
      }
    }

    save(state);
    document.dispatchEvent(new CustomEvent('module:banked', {
      detail: { banked: clone(mod), next }
    }));
    return { banked: clone(mod), next };
  }

  // Reset everything — useful for demo / testing.
  function reset() {
    state = clone(DEFAULTS);
    save(state);
    document.dispatchEvent(new CustomEvent('module:reset'));
  }

  // ── Sync body[data-active-subject] for CSS targeting ──
  // The KB's pulse + status badges read this attribute to know
  // which subject is the current BEGIN-HERE.
  function syncBodyActive() {
    const active = getActive();
    if (active) {
      document.body.dataset.activeSubject = active.id;
    } else {
      delete document.body.dataset.activeSubject;
    }
    // Also expose a banked-subjects class list for CSS to settle
    // already-banked rows in the KB.
    Object.values(state).forEach(m => {
      document.body.classList.toggle(
        'subject-banked-' + m.id,
        m.status === 'banked'
      );
    });
  }
  document.addEventListener('DOMContentLoaded', syncBodyActive, { once: true });
  document.addEventListener('module:banked', syncBodyActive);
  document.addEventListener('module:reset', syncBodyActive);
  // In case DOMContentLoaded has already fired by the time this
  // script runs (it's loaded near the end of the document).
  if (document.readyState !== 'loading') syncBodyActive();

  window.alexandriaModules = { get, all, order, getActive, bank, reset };
})();
