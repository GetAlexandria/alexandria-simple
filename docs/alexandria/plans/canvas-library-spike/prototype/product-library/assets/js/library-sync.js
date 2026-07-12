/* ──────────────────────────────────────────────────────────────
   Library sync — push banked module artifacts into the library
   graph data so they appear in the constellation / folder views.

   Phase-1 mock of the atomization pipeline: when a module banks,
   we add a single library card representing the whole banked
   artifact. Phase 2 will replace this with real card-shaped
   atomization across rationale / product / experience / temporal.

   The canvas-server is the source of truth for module content;
   we fetch /api/canvas/vision rather than reading any client-side
   payload, so the library card is always built from the same
   bytes the server persisted (and the same bytes Raven would see).
   ────────────────────────────────────────────────────────────── */
(() => {
  function makeVisionCard(vision) {
    return {
      id: 'vision-statement',
      title: 'Vision Statement',
      type: 'product-thesis',
      territory: 'rationale',
      subfolder: 'product-theses',
      outbound: [],
      body: stitchVisionBody(vision),
      banked_at: vision.bankedAt || null,
      source_module: 'vision'
    };
  }

  // Slot order matches the canonical Vision template — 1, 2, 3a, 3b, 4–8.
  const VISION_SLOT_ORDER = ['1', '2', '3a', '3b', '4', '5', '6', '7', '8'];
  const SLOT_TITLES = {
    '1': 'The Shift',
    '2': 'The Person',
    '3a': 'Named pain',
    '3b': 'Discovered pain',
    '4': 'The Inadequacy',
    '5': 'The Mechanism',
    '6': 'The Felt Experience',
    '7': 'The Proof',
    '8': 'The Refusal'
  };
  const NOTCH_LABELS = ['—', 'Build', 'Tune', 'Approved'];

  function stitchVisionBody(vision) {
    if (!vision || !vision.slots) return '';
    return VISION_SLOT_ORDER.map(id => {
      const slot = vision.slots[id];
      if (!slot) return null;
      const head = '## ' + id + '. ' + (SLOT_TITLES[id] || id);
      const notch = NOTCH_LABELS[slot.notch || 0];
      const meta = '_' + notch + '_';
      const body = slot.text
        ? slot.text
        : '_(empty — approved as a deliberate refusal of content)_';
      const scratch = slot.scratch
        ? ('\n\n> Scratch: ' + slot.scratch)
        : '';
      return [head, meta, '', body + scratch].join('\n');
    }).filter(Boolean).join('\n\n---\n\n');
  }

  function addCardToLibrary(card) {
    const data = window.RAVEN_LIBRARY_DATA;
    if (!data || !Array.isArray(data.cards)) return false;
    const idx = data.cards.findIndex(c => c.id === card.id);
    if (idx >= 0) data.cards[idx] = card;
    else data.cards.push(card);
    return true;
  }

  function reinitLibraryIfPossible() {
    if (typeof window.ravenInitConstellation === 'function') {
      try { window.ravenInitConstellation(); } catch (_) {}
    }
    if (typeof window.ravenInitFolders === 'function') {
      try { window.ravenInitFolders(); } catch (_) {}
    }
  }

  async function fetchVisionFromServer() {
    try {
      const res = await fetch('/api/canvas/vision', { cache: 'no-cache' });
      if (!res.ok) return null;
      return await res.json();
    } catch (_) {
      return null;
    }
  }

  document.addEventListener('module:banked', async (e) => {
    const banked = e.detail && e.detail.banked;
    if (!banked) return;
    if (banked.id !== 'vision') return; // Phase 1: only Vision atomizes
    const vision = await fetchVisionFromServer();
    if (!vision) return; // server unreachable — skip silently
    const card = makeVisionCard({ ...vision, bankedAt: banked.bankedAt });
    addCardToLibrary(card);
    reinitLibraryIfPossible();
  });
})();
