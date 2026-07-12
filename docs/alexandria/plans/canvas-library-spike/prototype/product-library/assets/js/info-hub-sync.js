/* ──────────────────────────────────────────────────────────────
   Info Hub sync — moves real module cards across the kanban
   without touching product-library.js's 5500-line file.

   product-library.js renders the Info Hub board from
   STATION_MOCK_LANES, then exits. This script:
     1. Watches for the board to render (the Info Hub tab is
        opened or the alt-view becomes active).
     2. On render — and on every module:banked event — patches
        the DOM directly: moves the Vision card into the right
        lane, adds a "Banked" badge, swaps the card type.

   Phase 2: replace this with a proper exported re-render hook on
   product-library.js (replace STATION_MOCK_LANES with a getter).
   ────────────────────────────────────────────────────────────── */
(() => {
  const STATION_BOARD = '#station-board';
  const STATION_VIEW = '#by-status-view';

  // Card spec: id, lane id, label, optional grade, type.
  function moduleToCardSpec(mod) {
    if (mod.status === 'banked') {
      return {
        id: 'mod-' + mod.id,
        lane: 'banked',
        type: 'banked',
        grade: 'A',
        title: mod.cardLabelBanked || (mod.title + '.md'),
        meta: 'Banked · atomized into library'
      };
    }
    if (mod.status === 'in-discussion') {
      return {
        id: 'mod-' + mod.id,
        lane: 'in-discussion',
        type: 'sot',
        grade: 'B',
        title: mod.cardLabel || (mod.title + '.md (draft)'),
        meta: 'In progress'
      };
    }
    return null; // locked / awaiting-nod / incoming → no canonical card yet
  }

  function findLane(laneId) {
    const board = document.querySelector(STATION_BOARD);
    if (!board) return null;
    return board.querySelector('.station-lane[data-lane="' + laneId + '"]')
        || board.querySelector('[data-lane="' + laneId + '"]')
        || board.querySelector('.station-column[data-lane="' + laneId + '"]');
  }

  function ensureCardEl(spec) {
    let el = document.querySelector('.station-item[data-station-item="' + spec.id + '"]');
    if (el) return el;
    el = document.createElement('div');
    el.className = 'station-item station-item-' + spec.type;
    el.setAttribute('data-station-item', spec.id);
    el.setAttribute('data-grade', spec.grade || '');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    const iconMap = { raw: '📄', sot: '📜', approval: '✉', banked: '✦' };
    const icon = iconMap[spec.type] || '·';
    el.innerHTML =
      '<div class="station-item-title">' +
        '<span class="station-item-type-icon">' + icon + '</span>' + escapeHtml(spec.title) +
      '</div>' +
      (spec.meta ? '<div class="station-item-meta">' + escapeHtml(spec.meta) + '</div>' : '');
    return el;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function syncBoard() {
    const board = document.querySelector(STATION_BOARD);
    if (!board) return;
    if (!window.alexandriaModules) return;
    const modules = window.alexandriaModules.all();
    Object.values(modules).forEach(mod => {
      const spec = moduleToCardSpec(mod);
      if (!spec) {
        // No card belongs in any lane — remove any stale instance.
        const stale = document.querySelector('.station-item[data-station-item="mod-' + mod.id + '"]');
        if (stale) stale.remove();
        return;
      }
      // Remove any duplicates first (e.g., a mock "Vision.md (draft)" that
      // ships in STATION_MOCK_LANES — we replace it with ours).
      removeMockDuplicates(mod, spec);
      const el = ensureCardEl(spec);
      const lane = findLane(spec.lane);
      if (!lane) return;
      // Find the body of the lane (the list container).
      const body = lane.querySelector('.station-lane-items')
                || lane.querySelector('.station-items')
                || lane;
      if (el.parentElement !== body) body.appendChild(el);
    });
  }

  // Remove any mock card whose title clearly references this module
  // (so we don't double up after our authored card lands).
  function removeMockDuplicates(mod, spec) {
    const lowerTitleNeedles = [mod.title.toLowerCase()];
    document.querySelectorAll('.station-item').forEach(el => {
      const ourId = el.getAttribute('data-station-item');
      if (ourId === spec.id) return; // ours, keep
      const titleEl = el.querySelector('.station-item-title');
      if (!titleEl) return;
      const text = titleEl.textContent.toLowerCase();
      if (lowerTitleNeedles.some(n => text.includes(n + '.md') || text.includes(n + ' '))) {
        el.remove();
      }
    });
  }

  // Watch for the board to appear / re-render.
  const observer = new MutationObserver(() => {
    // Debounce — multiple mutations fire close together.
    if (observer._pending) return;
    observer._pending = true;
    setTimeout(() => {
      observer._pending = false;
      syncBoard();
    }, 30);
  });
  function startObserver() {
    const view = document.querySelector(STATION_VIEW);
    if (!view) return false;
    observer.observe(view, { childList: true, subtree: true });
    syncBoard();
    return true;
  }

  if (!startObserver()) {
    document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  }

  // Re-sync on every bank.
  document.addEventListener('module:banked', () => {
    // The board may not be rendered yet (Info Hub tab not opened).
    // syncBoard is a no-op in that case; the observer will re-sync
    // when the tab opens and the board materializes.
    syncBoard();
  });
})();
