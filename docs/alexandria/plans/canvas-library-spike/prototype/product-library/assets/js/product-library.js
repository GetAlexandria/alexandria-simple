(function () {
  'use strict';

  const STORAGE_KEY = 'product-library-v0.1';
  const STATUS_CYCLE = ['backlog', 'in-progress', 'drafted', 'live', 'archived'];

  /* ── Load data ── */
  const baseline = JSON.parse(document.getElementById('lab-data').textContent);

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  function saveState(s) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  // shadow holds { items: { "LAB-001": { status: "..." }, ... } }
  let shadow = loadState();

  function getItemStatus(id) {
    if (shadow.items && shadow.items[id] && shadow.items[id].status) return shadow.items[id].status;
    const it = baseline.items[id] || (shadow.newItems && shadow.newItems[id]);
    return it ? (it.status || 'backlog') : 'backlog';
  }

  function setItemStatus(id, status) {
    if (!shadow.items) shadow.items = {};
    if (!shadow.items[id]) shadow.items[id] = {};
    shadow.items[id].status = status;
    shadow.items[id].lastTouched = new Date().toISOString();
    saveState(shadow);
    if (typeof renderActiveAltView === 'function') renderActiveAltView();
  }

  function getItemLastTouched(id) {
    return (shadow.items && shadow.items[id] && shadow.items[id].lastTouched) || null;
  }

  function cycleStatus(id) {
    const cur = getItemStatus(id);
    const idx = STATUS_CYCLE.indexOf(cur);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setItemStatus(id, next);
    // Phase 1.5: cycling to live or archived is the synthesis act
    // ("I now consider this done"). Auto-log to the active leg's
    // comprehend[]. Cycles to in-progress / drafted / backlog are
    // workflow noise — not logged.
    if (next === 'live' || next === 'archived') {
      logComprehendSynthesis(id, cur, next);
    }
    return next;
  }

  /* ── Badge rendering on floor areas ── */
  function computeAreaBadges(area) {
    const ids = (typeof getAreaItemIds === 'function') ? getAreaItemIds(area.id) : (area.items || []);
    let p0 = 0, inProgress = 0, done = 0;
    ids.forEach(id => {
      const item = baseline.items[id] || (shadow.newItems && shadow.newItems[id]);
      if (!item) return;
      const status = getItemStatus(id);
      if (item.priority === 'P0' && status !== 'live' && status !== 'archived') p0++;
      if (status === 'in-progress' || status === 'drafted') inProgress++;
      if (status === 'live' || status === 'archived') done++;
    });
    const gaps = (typeof getAreaGaps   === 'function') ? getAreaGaps(area.id).length   : 0;
    const ghosts = (typeof getAreaGhosts === 'function') ? getAreaGhosts(area.id).length : 0;
    return { p0, inProgress, done, total: ids.length, gaps: gaps + ghosts };
  }

  function renderFloorBadges() {
    baseline.areas.forEach(area => {
      const el = document.getElementById('badges-' + area.id);
      if (!el) return;
      const b = computeAreaBadges(area);
      const parts = [];
      if (b.p0 > 0)         parts.push(`<span class="dot dot-p0">P0:${b.p0}</span>`);
      if (b.inProgress > 0) parts.push(`<span class="dot dot-progress">WIP:${b.inProgress}</span>`);
      if (b.done > 0)       parts.push(`<span class="dot dot-done">✓${b.done}</span>`);
      if (b.gaps > 0)       parts.push(`<span class="dot dot-gap">◌${b.gaps}</span>`);
      el.innerHTML = parts.join('');
    });
  }

  /* ── Drawer state ── */
  let currentAreaId = null;
  let currentItemId = null;

  const overlay  = document.getElementById('drawer-overlay');
  const drawer   = document.getElementById('drawer');
  const titleEl  = document.getElementById('drawer-title');
  const typeEl   = document.getElementById('drawer-type-badge');
  const areaView = document.getElementById('area-view');
  const ddView   = document.getElementById('item-drilldown');

  function openDrawer(areaId) {
    const area = baseline.areas.find(a => a.id === areaId);
    if (!area) return;
    currentAreaId = areaId;
    currentItemId = null;

    titleEl.textContent = area.name;
    typeEl.textContent  = area.type;

    // Cockpit mode: rooms that have crossed bench → cockpit get a tighter render
    // (today-only recent lists; past collapsed under <details>). Toggle BEFORE
    // workshop init so the first renderRecent/dbRenderRecent call picks it up.
    const preFloorEl = document.querySelector(`[data-area="${areaId}"]`);
    const isCockpit = !!(preFloorEl && preFloorEl.getAttribute('data-cockpit-mode') === 'true');
    drawer.classList.toggle('cockpit-active', isCockpit);

    // Workshop mode: wider drawer + the right prototype form
    const wsView = document.getElementById('workshop-view');
    const floorHeading = document.querySelector('#area-view .floor-heading');
    // Frame modes are the bare .ws-mode children (not nested inside ws-debrief-content)
    const frameModes = document.querySelectorAll('#workshop-view > .ws-mode');
    const pilotContent = document.getElementById('ws-pilot-content');
    const debriefContent = document.getElementById('ws-debrief-content');
    const comprehendContent = document.getElementById('ws-comprehend-content');
    const recoveryContent = document.getElementById('ws-recovery-content');
    if (area.workshop) {
      drawer.classList.add('workshop');
      wsView.classList.add('visible');
      if (floorHeading) floorHeading.style.display = '';
      renderCourseHeader();

      if (areaId === 'pilot-check-station') {
        frameModes.forEach(el => el.style.display = 'none');
        if (pilotContent) pilotContent.style.display = 'block';
        if (debriefContent) debriefContent.style.display = 'none';
        if (comprehendContent) comprehendContent.style.display = 'none';
        if (recoveryContent) recoveryContent.style.display = 'none';
        initPilotCheckWorkshop();
      } else if (areaId === 'debrief-booth') {
        frameModes.forEach(el => el.style.display = 'none');
        if (pilotContent) pilotContent.style.display = 'none';
        if (debriefContent) debriefContent.style.display = 'block';
        if (comprehendContent) comprehendContent.style.display = 'none';
        if (recoveryContent) recoveryContent.style.display = 'none';
        initDebriefWorkshop();
      } else if (areaId === 'comprehend-station') {
        frameModes.forEach(el => el.style.display = 'none');
        if (pilotContent) pilotContent.style.display = 'none';
        if (debriefContent) debriefContent.style.display = 'none';
        if (comprehendContent) comprehendContent.style.display = 'block';
        if (recoveryContent) recoveryContent.style.display = 'none';
        initComprehendWorkshop();
      } else if (areaId === 'recovery-room') {
        frameModes.forEach(el => el.style.display = 'none');
        if (pilotContent) pilotContent.style.display = 'none';
        if (debriefContent) debriefContent.style.display = 'none';
        if (comprehendContent) comprehendContent.style.display = 'none';
        if (recoveryContent) recoveryContent.style.display = 'block';
        initRecoveryWorkshop();
      } else {
        frameModes.forEach(el => el.style.display = '');
        if (comprehendContent) comprehendContent.style.display = 'none';
        if (pilotContent) pilotContent.style.display = 'none';
        if (debriefContent) debriefContent.style.display = 'none';
        if (recoveryContent) recoveryContent.style.display = 'none';
        if (areaId === 'frame-workshop') initFrameWorkshop();
      }
    } else {
      drawer.classList.remove('workshop');
      wsView.classList.remove('visible');
      if (floorHeading) floorHeading.style.display = 'none';
      frameModes.forEach(el => el.style.display = '');
      if (pilotContent) pilotContent.style.display = 'none';
      if (debriefContent) debriefContent.style.display = 'none';
      if (comprehendContent) comprehendContent.style.display = 'none';
      if (recoveryContent) recoveryContent.style.display = 'none';
    }

    showAreaView(area);

    overlay.classList.add('open');
    drawer.classList.add('open');

    // highlight floor area
    document.querySelectorAll('.area').forEach(el => el.classList.remove('active'));
    const floorEl = document.querySelector(`[data-area="${areaId}"]`);
    if (floorEl) floorEl.classList.add('active');

    // update URL hash
    if (location.hash !== '#area=' + areaId) {
      history.replaceState(null, '', '#area=' + areaId);
    }
  }

  function closeDrawer() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    drawer.classList.remove('workshop');
    drawer.classList.remove('cockpit-active');
    document.getElementById('workshop-view').classList.remove('visible');
    document.querySelectorAll('.area').forEach(el => el.classList.remove('active'));
    currentAreaId = null;
    currentItemId = null;
    history.replaceState(null, '', location.pathname + location.search);
  }

  /* ── Server persistence (Option A) ──
     File is canonical; localStorage is the working copy.
     postSave is fire-and-forget: localStorage writes are unconditional, server POST
     is best-effort. If the user is on plain `python -m http.server` (no /api/save),
     the POST 404s and we fall back to localStorage-only — existing behavior. */
  const SERVER_SAVE_PATHS = {
    'frame-cards':   '/api/save/frame-cards',
    'debrief-cards': '/api/save/debrief-cards',
    'pilot-checks':  '/api/save/pilot-checks',
    'recoveries':    '/api/save/recoveries',
    'courses':       '/api/save/courses',
    'legs':          '/api/save/legs'
  };
  const SERVER_LOAD_PATHS = {
    'frame-cards':   '/canvas-state/frame-cards.json',
    'debrief-cards': '/canvas-state/debrief-cards.json',
    'pilot-checks':  '/canvas-state/pilot-checks.json',
    'recoveries':    '/canvas-state/recoveries.json',
    'courses':       '/canvas-state/courses.json',
    'legs':          '/canvas-state/legs.json'
  };
  function postSave(type, arr) {
    const url = SERVER_SAVE_PATHS[type];
    if (!url) return;
    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arr || [])
      }).catch(() => { /* server not running: localStorage already saved, fine */ });
    } catch { /* network blocked: localStorage already saved, fine */ }
  }
  async function loadFromServer(type) {
    const url = SERVER_LOAD_PATHS[type];
    if (!url) return null;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null; // 404 on plain http.server, or before first save
      const data = await res.json();
      return Array.isArray(data) ? data : null;
    } catch { return null; }
  }
  async function hydrateFromServer() {
    // Replace localStorage working copy with server's canonical file when present.
    const pairs = [
      ['frame-cards',   FRAME_KEY],
      ['debrief-cards', DEBRIEF_KEY],
      ['pilot-checks',  PC_KEY],
      ['recoveries',    REC_KEY],
      ['courses',       COURSE_KEY],
      ['legs',          LEG_KEY]
    ];
    await Promise.all(pairs.map(async ([type, key]) => {
      const data = await loadFromServer(type);
      if (data === null) return; // no file yet → keep localStorage as-is
      try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
    }));
  }

  /* ── Course tier (7-leg arc; ISO-week-stamped) ──
     A Course is one week's planned arc. Sub-objects:
       theme            one-line: what this week is *for*
       target_outcome   what the map looks like different by leg 7
       frontier         array of LAB item IDs currently in scope
       bail_conditions  text: when do we abandon this Course?
       legs[]           leg objects (filled progressively; shape stubbed in step 1)
       status           planning · in-progress · debriefed · archived
     ID convention: ISO-week-stamped (COURSE-2026-W18 not -2026-05-03).
     Frontier-not-itinerary: Course names what's reachable this week, not which
     leg hits which item. Frame at each leg picks from the frontier. */
  const COURSE_KEY = 'product-library-v0.1::courses';
  const COURSE_LEG_COUNT = 7; // matches book title (The 7 Turn Work Week)
  const LEG_KEY = 'product-library-v0.1::legs';

  function isoWeekId(date) {
    // ISO-8601 week-numbering: weeks start Monday; week 1 contains the first Thursday.
    const d = date ? new Date(date.getTime()) : new Date();
    d.setUTCHours(0, 0, 0, 0);
    const dayNum = d.getUTCDay() || 7; // Sunday → 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum); // jump to Thursday of this ISO week
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return 'COURSE-' + d.getUTCFullYear() + '-W' + String(weekNum).padStart(2, '0');
  }

  function loadCourses() {
    try { return JSON.parse(localStorage.getItem(COURSE_KEY) || '[]'); }
    catch { return []; }
  }
  function saveCourses(arr) {
    try { localStorage.setItem(COURSE_KEY, JSON.stringify(arr)); } catch {}
    postSave('courses', arr);
  }

  function findCourseById(id) {
    return loadCourses().find(c => c && c.id === id) || null;
  }
  function findActiveCourse() {
    // The active course is the one stamped to the current ISO week, if any.
    return findCourseById(isoWeekId());
  }
  function newCourseDraft(opts) {
    // Returns a fresh Course object stamped to the given (or current) week.
    const id = (opts && opts.id) || isoWeekId(opts && opts.date);
    const now = new Date().toISOString();
    return {
      id: id,
      theme: '',
      target_outcome: '',
      frontier: [],            // array of LAB item IDs in scope this week
      bail_conditions: '',
      legs: [],                // shape defined by Leg wrapper (step 1)
      status: 'planning',      // planning · in-progress · debriefed · archived
      // Build canvas placements (Move 3d): { item_id → {row, col} }.
      // Position the user has snapped each item to on the snap-circuit
      // grid. Legacy courses without this field default to {} on read.
      build_positions: {},
      createdAt: now,
      updatedAt: now
    };
  }
  function upsertCourse(course) {
    const arr = loadCourses();
    const idx = arr.findIndex(c => c && c.id === course.id);
    course.updatedAt = new Date().toISOString();
    if (idx >= 0) arr[idx] = course;
    else arr.push(course);
    saveCourses(arr);
    return course;
  }

  /* ── Leg wrapper (one Full Turn — Frame · Comprehend · Sync · Produce · Debrief) ──
     A Leg is one slot inside a Course. Sub-records:
       frame_card_id       → ID of the Frame card (in frame-cards.json) once framed
       comprehend[]        → 0..n on-demand notes: {at, text}
       sync                → 0..1 sync state (deferred to a later phase)
       produce             → running ledger: {selected[], bonuses[], notes[]}
       debrief_card_id     → ID of Debrief card once debriefed
       changes_to_course   → 0..1 delta written back to the Course frontier on debrief
     ID convention: LEG-YYYY-MM-DD-A (date + letter for multi-leg days).
     The leg references the Course it belongs to via course_ref. */

  function todayDateOnly(date) {
    const d = date ? new Date(date.getTime()) : new Date();
    return d.toISOString().slice(0, 10);
  }
  function nextLegLetter(courseId, dateStr) {
    // Returns 'A'/'B'/'C'/... for the next leg created on the given day in the
    // given course. Reads the dedicated `letter` field rather than parsing it
    // out of the ID, so the function stays correct if the ID format changes.
    const existing = loadLegs().filter(l =>
      l && l.course_ref === courseId && l.date === dateStr
    );
    const letters = existing.map(l => l && l.letter).filter(Boolean);
    const Z = 'Z'.charCodeAt(0);
    let code = 'A'.charCodeAt(0);
    while (letters.includes(String.fromCharCode(code))) {
      code++;
      if (code > Z) {
        // 26 legs on a single day in one course should never happen (cap is 7
        // per course total). If it does, the data is corrupt; surface it loudly
        // rather than returning a non-alpha character that breaks downstream IDs.
        throw new Error('nextLegLetter: more than 26 legs on ' + dateStr + ' in ' + courseId);
      }
    }
    return String.fromCharCode(code);
  }
  function legId(courseId, dateStr, letter) {
    return 'LEG-' + dateStr + '-' + letter;
  }

  function loadLegs() {
    try { return JSON.parse(localStorage.getItem(LEG_KEY) || '[]'); }
    catch { return []; }
  }
  function saveLegs(arr) {
    try { localStorage.setItem(LEG_KEY, JSON.stringify(arr)); } catch {}
    postSave('legs', arr);
  }

  function findLegById(id) {
    return loadLegs().find(l => l && l.id === id) || null;
  }
  function findActiveLeg() {
    // Active = the most-recently-touched leg in the active course that's not
    // archived/debriefed. Falls back to the most recent leg overall.
    const courseId = isoWeekId();
    const all = loadLegs().filter(l => l && l.course_ref === courseId);
    if (all.length === 0) return null;
    const open = all.filter(l => l.status !== 'debriefed' && l.status !== 'archived');
    const pool = open.length > 0 ? open : all;
    pool.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    return pool[0];
  }
  function findLegsForCourse(courseId) {
    return loadLegs()
      .filter(l => l && l.course_ref === courseId)
      .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  }

  function newLegDraft(opts) {
    const o = opts || {};
    const dateStr = o.date || todayDateOnly();
    const courseId = o.course_ref || isoWeekId();
    // Compute next leg_number from existing legs in the same course.
    const inCourse = findLegsForCourse(courseId);
    const legNumber = Math.min(inCourse.length + 1, COURSE_LEG_COUNT);
    const letter = o.letter || nextLegLetter(courseId, dateStr);
    const now = new Date().toISOString();
    return {
      id: legId(courseId, dateStr, letter),
      course_ref: courseId,
      leg_number: legNumber,            // 1..COURSE_LEG_COUNT
      status: 'planning',               // planning · in-progress · debriefed · archived
      date: dateStr,
      letter: letter,                   // dedicated field; nextLegLetter reads it
      frame_card_id: null,
      comprehend: [],                   // [{at: ISO, text: string}]
      sync: null,                       // {at, ...} once captured
      produce: { selected: [], bonuses: [], notes: [] },
      debrief_card_id: null,
      changes_to_course: null,          // {at, pieces_added: [...], pieces_removed: [...], notes}
      createdAt: now,
      updatedAt: now
    };
  }
  function upsertLeg(leg) {
    const arr = loadLegs();
    const idx = arr.findIndex(l => l && l.id === leg.id);
    leg.updatedAt = new Date().toISOString();
    if (idx >= 0) arr[idx] = leg;
    else arr.push(leg);
    saveLegs(arr);
    return leg;
  }

  /* ── Frame ↔ Leg bridge ──
     Frame cards are currently identified by their ISO `savedAt` timestamp
     (no explicit id field). The Leg uses that timestamp as `frame_card_id`.
     `findFrameCardForLeg` resolves it; `attachFrameToLeg` is called from the
     Frame save handler to ensure a leg exists and links the card to it. */
  function findFrameCardForLeg(leg) {
    if (!leg || !leg.frame_card_id) return null;
    return loadFrameCards().find(c => c && c.savedAt === leg.frame_card_id) || null;
  }
  function attachFrameToLeg(card) {
    // Called after a Frame card is saved. Ensures a leg exists for today, in
    // the current ISO-week's course, and links the card to it. Bumps the
    // leg from `planning` → `in-progress` if applicable. Returns the leg.
    //
    // INTENTIONAL ORPHAN BEHAVIOR: if the active leg is from a previous day
    // and was never debriefed, this function starts a fresh leg for today and
    // leaves the prior leg as `in-progress` in the data. That stale leg stays
    // findable via findLegsForCourse but is not the active leg going forward.
    // Phase 4 (Debrief) is responsible for closing stale legs (auto-archive
    // on next-day open, or surface them in a "stale legs" list). Until then,
    // multi-day, never-debriefed legs accumulate as a known data state.
    if (!card || !card.savedAt) return null;
    let leg = findActiveLeg();
    const todayStr = todayDateOnly();
    // If active leg is from a different day, start a fresh leg for today.
    if (leg && leg.date !== todayStr) leg = null;
    if (!leg) leg = newLegDraft({ date: todayStr });
    leg.frame_card_id = card.savedAt;
    if (leg.status === 'planning') leg.status = 'in-progress';
    return upsertLeg(leg);
  }

  /* ── Course Header (top strip rendered in every workshop drawer) ──
     Compact line: leg id · 7-segment LED bar · MUSTS x/3 · BONUS x · MAP n/m
     · status badge. Reads the active leg + linked Frame card + active Course. */
  function renderCourseHeader() {
    const el = document.getElementById('course-header');
    if (!el) return;
    const leg = findActiveLeg();
    const courseId = isoWeekId();
    const course = findCourseById(courseId);

    if (!leg && !course) {
      el.className = 'course-header-bar empty';
      el.innerHTML = 'No course or leg yet — open the <button type="button" class="ch-link" data-act="goto-course">Course view</button> to plan the week.';
      return;
    }

    // Header chunks. Order: leg id · LED segments · MUSTS · BONUS · MAP · status.
    const legId    = leg ? leg.id : 'No leg yet';
    // Clamp to 0 so corrupt records (legs with missing/negative leg_number)
    // render the LED bar as fully ghosted rather than walking the loop oddly.
    const legNum   = leg && typeof leg.leg_number === 'number' && leg.leg_number > 0
                       ? Math.min(leg.leg_number, COURSE_LEG_COUNT)
                       : 0;
    const status   = leg ? leg.status : 'planning';
    const card     = leg ? findFrameCardForLeg(leg) : null;
    const mustArr  = card && Array.isArray(card.must) ? card.must
                   : (card && typeof card.must === 'string' && card.must.trim() ? [{ id: 'free' }] : []);
    const bonusArr = card && Array.isArray(card.stretch) ? card.stretch
                   : (card && typeof card.stretch === 'string' && card.stretch.trim() ? [{ id: 'free' }] : []);
    const mustsCount = mustArr.length;
    const bonusCount = bonusArr.length;
    // Slice 1: scope count = pieces placed/staged on the canvas + any
    // unmigrated frontier overflow (shouldn't normally exist, but the
    // fallback keeps the count truthful if migration hasn't fully drained).
    const positionsForCount = (course && course.build_positions) || {};
    const placedOrStaged = Object.keys(positionsForCount).length;
    const overflowFrontier = course && Array.isArray(course.frontier) ? course.frontier.length : 0;
    const scopeCount = placedOrStaged + overflowFrontier;
    // allItemsArray is defined later in the script; this typeof guard is
    // load-order protection. renderCourseHeader is only called after init
    // (via openDrawer / ff-save / setView), so the function is in scope at
    // call time. Keep the guard so any earlier caller silently degrades to 0
    // rather than throwing — flagged by grepzilla2 phase-2 review as the
    // intentional shape.
    const mapTotal = (typeof allItemsArray === 'function') ? allItemsArray().length : 0;

    // 7-segment LED bar. Done = legs strictly before legNum. Current = legNum. Future = the rest.
    const segments = [];
    for (let i = 1; i <= COURSE_LEG_COUNT; i++) {
      let cls = 'ch-seg';
      if (legNum && i < legNum) cls += ' done';
      else if (legNum && i === legNum) cls += ' current';
      else cls += ' future';
      segments.push('<span class="' + cls + '" title="leg ' + i + ' of ' + COURSE_LEG_COUNT + '"></span>');
    }

    const mustsClass = mustsCount > 3 ? 'ch-counter over' : 'ch-counter';
    const parts = [];
    parts.push('<span class="ch-leg-id">' + escapeHTML(legId) + '</span>');
    parts.push('<span class="ch-segments" aria-label="leg ' + legNum + ' of ' + COURSE_LEG_COUNT + '">' + segments.join('') + '</span>');
    parts.push('<span class="' + mustsClass + '"><span class="ch-label">MUSTS</span><span class="ch-value">' + mustsCount + '/3</span></span>');
    parts.push('<span class="ch-counter"><span class="ch-label">BONUS</span><span class="ch-value">' + bonusCount + '</span></span>');
    if (course) {
      parts.push('<span class="ch-counter"><span class="ch-label">MAP</span><span class="ch-value">' + scopeCount + '/' + mapTotal + ' in scope</span></span>');
    } else {
      parts.push('<span class="ch-counter"><span class="ch-label">MAP</span><span class="ch-value">no course set</span></span>');
    }
    parts.push('<span class="ch-status">' + escapeHTML(status) + '</span>');

    el.className = 'course-header-bar';
    el.innerHTML = parts.join('');
  }

  // Course Header click handler. Use closest() so a future inner-element
  // wrap (e.g., <strong> inside the link) doesn't break the dispatch.
  document.addEventListener('click', (e) => {
    const tgt = e.target && e.target.closest ? e.target.closest('[data-act="goto-course"]') : null;
    if (tgt && tgt.classList && tgt.classList.contains('ch-link')) {
      if (typeof setView === 'function') setView('course');
    }
  });

  /* ── Frame Workshop: storage helpers ── */
  const FRAME_KEY = 'product-library-v0.1::frame-cards';
  // Rolled back to plain-textarea form (rollback 2026-05-11, LAB-058).
  // The picker / Bonus / per-slot Approach infrastructure was removed from
  // the rendered form path. Saved-card schema for legacy fields (stretch,
  // must as array, must_notes, per-slot ref fields) is preserved silently —
  // old cards' picker data stays in localStorage but is no longer rendered.
  const FF_FIELDS = ['in','out','must','miss','approach','end'];
  const FF_LABELS = { must:'Done means', in:'Doing', out:'Not Doing', approach:'How I\'ll work', miss:'What ruins this', end:'When to stop' };

  function loadFrameCards() {
    try { return JSON.parse(localStorage.getItem(FRAME_KEY) || '[]'); }
    catch { return []; }
  }
  function saveFrameCards(arr) {
    try { localStorage.setItem(FRAME_KEY, JSON.stringify(arr)); } catch {}
    postSave('frame-cards', arr);
    try { renderTodayFrameStrip(); } catch (e) { console.warn('[TFS] renderTodayFrameStrip failed:', e); }
  }

  /* ── Today's Frame Strip ──
     Pinned heart-of-day display between the morning bracket (Pilot Check) and the
     evening bracket (Recover). Shows today's most recent Frame card compactly.
     Fields: Doing · Not Doing · Done means · Bonus · When to stop. `miss` and
     `approach` are deliberately excluded — read at frame-time, not glanced all day. */
  const TFS_COLLAPSED_KEY = 'product-library-v0.1::today-frame-strip-collapsed';

  function tfsFormatHumanDate() {
    const d = new Date();
    return d.toLocaleDateString(undefined, { weekday:'long', month:'short', day:'numeric' });
  }

  function tfsRenderRefs(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return '';
    return arr.map(r => {
      const id = (r && r.id) ? String(r.id) : '';
      const title = (r && r.title) ? String(r.title) : '';
      const text = id && title ? id + ' · ' + title : (id || title || '');
      return `<span class="tfs-chip">${escapeHTML(text)}</span>`;
    }).join('');
  }

  function tfsRenderField(val) {
    if (Array.isArray(val)) return tfsRenderRefs(val);
    const s = (val == null ? '' : String(val)).trim();
    if (!s) return '';
    return escapeHTML(s);
  }

  function renderTodayFrameStrip() {
    const strip = document.getElementById('today-frame-strip');
    if (!strip) return;
    const dateEl = document.getElementById('tfs-date');
    const emptyEl = document.getElementById('tfs-empty');
    const cardEl = document.getElementById('tfs-card');
    if (!dateEl || !emptyEl || !cardEl) return;

    dateEl.textContent = tfsFormatHumanDate();

    const cards = loadFrameCards();
    const today = new Date().toISOString().slice(0,10);
    const todays = cards.filter(c => (c.date || '').slice(0,10) === today);
    if (todays.length === 0) {
      emptyEl.hidden = false;
      cardEl.hidden = true;
      strip.classList.add('is-empty');
      return;
    }
    const card = todays[todays.length - 1];
    emptyEl.hidden = true;
    cardEl.hidden = false;
    strip.classList.remove('is-empty');

    document.getElementById('tfs-doing').innerHTML     = tfsRenderField(card.in);
    document.getElementById('tfs-not-doing').innerHTML = tfsRenderField(card.out);
    document.getElementById('tfs-must').innerHTML      = tfsRenderField(card.must);
    document.getElementById('tfs-stretch').innerHTML   = tfsRenderField(card.stretch);
    document.getElementById('tfs-end').innerHTML       = tfsRenderField(card.end);

    const bonusRow = document.getElementById('tfs-row-bonus');
    const bonusEmpty = !card.stretch || (Array.isArray(card.stretch) && card.stretch.length === 0) || (typeof card.stretch === 'string' && !card.stretch.trim());
    if (bonusRow) bonusRow.style.display = bonusEmpty ? 'none' : '';

    const stopRow = document.getElementById('tfs-row-stop');
    const stopEmpty = !card.end || (typeof card.end === 'string' && !card.end.trim());
    if (stopRow) stopRow.style.display = stopEmpty ? 'none' : '';
  }

  function tfsApplyCollapsedState() {
    const strip = document.getElementById('today-frame-strip');
    const btn = document.getElementById('tfs-collapse');
    if (!strip || !btn) return;
    let collapsed = false;
    try { collapsed = localStorage.getItem(TFS_COLLAPSED_KEY) === '1'; } catch {}
    strip.classList.toggle('collapsed', collapsed);
    btn.setAttribute('aria-expanded', String(!collapsed));
    btn.title = collapsed ? 'Expand' : 'Collapse';
  }

  function initTodayFrameStrip() {
    const strip = document.getElementById('today-frame-strip');
    if (!strip) return;
    tfsApplyCollapsedState();
    renderTodayFrameStrip();

    const collapseBtn = document.getElementById('tfs-collapse');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        const collapsed = !strip.classList.contains('collapsed');
        try { localStorage.setItem(TFS_COLLAPSED_KEY, collapsed ? '1' : '0'); } catch {}
        tfsApplyCollapsedState();
      });
    }
    const openBtn = document.getElementById('tfs-open-frame');
    if (openBtn) openBtn.addEventListener('click', () => openDrawer('frame-workshop'));
    const emptyCta = document.getElementById('tfs-empty-cta');
    if (emptyCta) emptyCta.addEventListener('click', () => openDrawer('frame-workshop'));
  }
  function todayDateString() {
    const d = new Date();
    return d.toISOString().slice(0,10) + ' ' + d.toTimeString().slice(0,5);
  }

  // Frame form is a flat set of textareas (post-rollback, 2026-05-11, LAB-058).
  // Picker / Bonus / per-slot Approach infrastructure removed from the rendered
  // form path; legacy saved-card schema (must as array, stretch, must_notes,
  // per-slot ref fields) is preserved silently in localStorage but not rendered.

  function clearFrameForm() {
    FF_FIELDS.forEach(f => {
      const el = document.getElementById('ff-' + f);
      if (el) el.value = '';
    });
  }

  function loadIntoFrameForm(card) {
    FF_FIELDS.forEach(f => {
      const el = document.getElementById('ff-' + f);
      if (!el) return;
      const v = card[f];
      // Legacy `must` may be an array of typed refs from the picker era.
      // Coerce to a readable string so the user can keep editing without data
      // loss; saving will overwrite the array form with the textarea value.
      if (Array.isArray(v)) {
        el.value = v
          .filter(r => r && r.id)
          .map(r => r.id + (r.title ? ' · ' + r.title : ''))
          .join('\n');
      } else {
        el.value = v || '';
      }
    });
  }

  function readFrameForm() {
    const card = { savedAt: new Date().toISOString(), date: todayDateString() };
    FF_FIELDS.forEach(f => {
      const el = document.getElementById('ff-' + f);
      card[f] = el ? el.value.trim() : '';
    });
    return card;
  }

  // True if a given field value is "filled" (used by save validation + viewing renderer).
  function fieldIsFilled(value) {
    if (Array.isArray(value)) return value.length > 0;
    return !!(value && (typeof value === 'string') && value.trim().length > 0);
  }
  function flashSaved(id) {
    const el = document.getElementById(id || 'ff-saved');
    if (!el) return;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1800);
  }
  function escapeHTML(s) {
    return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  /* ── Pilot Check Workshop ── */
  const PC_KEY = 'product-library-v0.1::pilot-checks';
  const PC_DIMS = [
    { key: 'cog', label: 'Cognitive', long: 'cognitive' },
    { key: 'emo', label: 'Emotional', long: 'emotional' },
    { key: 'phy', label: 'Physical',  long: 'physical' }
  ];

  function loadPilotChecks() {
    try { return JSON.parse(localStorage.getItem(PC_KEY) || '[]'); }
    catch { return []; }
  }
  function savePilotChecks(arr) {
    try { localStorage.setItem(PC_KEY, JSON.stringify(arr)); } catch {}
    postSave('pilot-checks', arr);
  }

  function pcZone(v) {
    if (v <= 3) return 'red';
    if (v <= 6) return 'yellow';
    return 'green';
  }

  function pcReadValues() {
    return {
      cog: parseInt(document.getElementById('pc-cog').value, 10),
      emo: parseInt(document.getElementById('pc-emo').value, 10),
      phy: parseInt(document.getElementById('pc-phy').value, 10)
    };
  }

  function pcComputeVerdict(values) {
    const reds = PC_DIMS.filter(d => values[d.key] <= 3);
    if (reds.length === 0) {
      return {
        cleared: true,
        text: 'Cleared. Scrub in.',
        prescriptionHours: 0,
        redLabels: []
      };
    }
    const labels = reds.map(d => d.long);
    const hrs = reds.length;
    const labelText = labels.length === 1 ? labels[0]
      : labels.length === 2 ? `${labels[0]} and ${labels[1]}`
      : `${labels.slice(0,-1).join(', ')}, and ${labels.slice(-1)}`;
    return {
      cleared: false,
      text: `Grounded — <strong>${labelText}</strong> in the red. Prescription: ${hrs} hour${hrs===1?'':'s'} workday recovery (1 hour per red dimension).`,
      prescriptionHours: hrs,
      redLabels: labels
    };
  }

  function pcUpdateLive() {
    const values = pcReadValues();
    PC_DIMS.forEach(d => {
      const valEl = document.getElementById('pc-' + d.key + '-val');
      const v = values[d.key];
      valEl.textContent = v;
      valEl.classList.remove('red','yellow');
      const z = pcZone(v);
      if (z === 'red') valEl.classList.add('red');
      else if (z === 'yellow') valEl.classList.add('yellow');
    });
    const verdict = pcComputeVerdict(values);
    const vEl = document.getElementById('pc-verdict');
    vEl.classList.remove('cleared','grounded');
    vEl.classList.add(verdict.cleared ? 'cleared' : 'grounded');
    vEl.innerHTML = verdict.text;
  }

  function pcResetSliders() {
    document.getElementById('pc-cog').value = 5;
    document.getElementById('pc-emo').value = 5;
    document.getElementById('pc-phy').value = 5;
    pcUpdateLive();
  }

  function pcRenderRecent() {
    const checks = loadPilotChecks();
    const list = document.getElementById('pc-recent-list');
    const countEl = document.getElementById('pc-recent-count');
    const labelEl = document.getElementById('pc-recent-label');

    const today = new Date().toISOString().slice(0,10);
    const todayChecks = checks.filter(c => (c.date || '').slice(0,10) === today);

    if (checks.length === 0) {
      countEl.textContent = '';
      if (labelEl) labelEl.firstChild.textContent = "Today's Pilot Checks ";
      list.innerHTML = '<div class="ws-recent-empty">No pilot checks yet. Run one above.</div>';
      return;
    }
    countEl.textContent = todayChecks.length > 0 ? '(' + todayChecks.length + ')' : '';
    if (labelEl) labelEl.firstChild.textContent = todayChecks.length > 0 ? "Today's Pilot Checks " : 'Recent Pilot Checks ';

    const reverse = checks.slice().reverse();
    list.innerHTML = reverse.map((c) => {
      const time = (c.date || '').slice(11) || (c.date || '');
      const cls = c.cleared ? 'cleared' : 'grounded';
      const summary = c.cleared
        ? `Cleared · cog ${c.cog} · emo ${c.emo} · phy ${c.phy}`
        : `Grounded — ${(c.redLabels || []).join(', ')} red · ${c.prescriptionHours}hr recovery`;
      return `<div class="ws-recent-card ${cls}">
        <div class="rc-date">${escapeHTML(time)}</div>
        <div class="rc-must">${escapeHTML(summary)}</div>
      </div>`;
    }).join('');
  }

  function initPilotCheckWorkshop() {
    document.getElementById('pc-date').textContent = todayDateString();
    pcResetSliders();
    pcRenderRecent();
  }

  // Wire pilot check controls
  ['pc-cog','pc-emo','pc-phy'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', pcUpdateLive);
  });
  document.getElementById('pc-reset').addEventListener('click', pcResetSliders);
  document.getElementById('pc-save').addEventListener('click', () => {
    const values = pcReadValues();
    const verdict = pcComputeVerdict(values);
    const checks = loadPilotChecks();
    const entry = {
      id: genId(),
      date: todayDateString(),
      cog: values.cog,
      emo: values.emo,
      phy: values.phy,
      cleared: verdict.cleared,
      prescriptionHours: verdict.prescriptionHours,
      redLabels: verdict.redLabels
    };
    checks.push(entry);
    savePilotChecks(checks);
    const flashEl = document.getElementById('pc-saved');
    flashEl.classList.add('show');
    setTimeout(() => flashEl.classList.remove('show'), 1800);
    pcRenderRecent();
    // Also write to the pilot-check-station Log as an experiment
    if (currentAreaId === 'pilot-check-station') {
      const exps = getExperiments('pilot-check-station');
      const verdictWord = verdict.cleared ? 'cleared' : 'grounded';
      const titleSuffix = verdict.cleared
        ? 'cleared'
        : 'grounded — ' + verdict.redLabels.join(', ');
      exps.unshift({
        id: genId(),
        title: `Pilot Check ${todayDateString()} — ${titleSuffix}`,
        date: todayDateString(),
        observation: `Cognitive ${values.cog} · Emotional ${values.emo} · Physical ${values.phy}. Verdict: ${verdictWord}.`,
        impact: verdict.cleared
          ? 'Cleared to scrub in.'
          : `Grounded. Prescription: ${verdict.prescriptionHours} hour${verdict.prescriptionHours===1?'':'s'} workday recovery in ${verdict.redLabels.join(', ')}.`
      });
      setExperiments('pilot-check-station', exps);
      renderExperiments('pilot-check-station');
      updateShelfTile('experiments', exps.length);
    }
  });

  /* ── Recovery Room Workshop ── three-screen flow: measure / shape / plan */
  const REC_KEY = 'product-library-v0.1::recoveries';

  function loadRecoveries() {
    try { return JSON.parse(localStorage.getItem(REC_KEY) || '[]'); }
    catch { return []; }
  }
  function saveRecoveries(arr) {
    try { localStorage.setItem(REC_KEY, JSON.stringify(arr)); } catch {}
    postSave('recoveries', arr);
  }

  // In-flight state for the current 3-screen flow. Cleared on lock or area re-open.
  let recState = null;

  function recBlankState() {
    return {
      step: 1,
      // Anchor reads (from latest PC, or 5 if none)
      anchorCog: 5, anchorEmo: 5, anchorPhy: 5,
      anchorSource: null,   // { id, time } if yoked to a Pilot Check, else null
      // Current reads (where the user is now — what the sliders show)
      cog: 5, emo: 5, phy: 5,
      // Derived withdrawal (anchor − current, clamped to ≥ 0)
      diffCog: 0, diffEmo: 0, diffPhy: 0,
      tier: 'light',
      locus: '—',
      shapes: [],           // selected chips, max 2
      note: '',
      mechs: [],            // [{name, why, rule, warn?}]
      mechSuppressedMastery: false,
      zeroMech: false,
      size: 'light',
      plan: ''
    };
  }

  // Withdrawal-based tier. Operates on the diffs (anchor − current), clamped to ≥ 0.
  function recComputeTier(dCog, dEmo, dPhy) {
    const m = Math.max(dCog, dEmo, dPhy);
    const sum = dCog + dEmo + dPhy;
    if (m >= 9 || sum >= 18) return 'heavy';
    if (m >= 7) return 'large';
    if (m >= 4) return 'medium';
    return 'light';
  }

  function recComputeLocus(dCog, dEmo, dPhy) {
    const max = Math.max(dCog, dEmo, dPhy);
    if (max === 0) return '—';
    const dom = [];
    if (dCog === max) dom.push('cognitive');
    if (dEmo === max) dom.push('emotional');
    if (dPhy === max) dom.push('physical');
    if (dom.length > 1) return 'mixed';
    return dom[0];
  }

  // Find the latest pilot check from today (if any). Returns the entry or null.
  function recLatestPilotCheckToday() {
    const checks = loadPilotChecks();
    if (!checks || !checks.length) return null;
    const today = new Date().toISOString().slice(0, 10);
    const todays = checks.filter(c => (c.date || '').slice(0, 10) === today);
    if (!todays.length) return null;
    // Pilot checks are appended chronologically; the last is the latest.
    return todays[todays.length - 1];
  }

  function recApplyAnchor() {
    const latest = recLatestPilotCheckToday();
    const cogAnchorEl = document.getElementById('rec-cog-anchor');
    const emoAnchorEl = document.getElementById('rec-emo-anchor');
    const phyAnchorEl = document.getElementById('rec-phy-anchor');
    if (latest) {
      recState.anchorCog = latest.cog;
      recState.anchorEmo = latest.emo;
      recState.anchorPhy = latest.phy;
      recState.anchorSource = { id: latest.id, time: (latest.date || '').slice(11) || latest.date };
      const t = recState.anchorSource.time;
      [cogAnchorEl, emoAnchorEl, phyAnchorEl].forEach(el => el && el.classList.add('yoked'));
      if (cogAnchorEl) cogAnchorEl.innerHTML = `Started at <strong>${latest.cog}</strong> · ${escapeHTML(t)} Pilot Check`;
      if (emoAnchorEl) emoAnchorEl.innerHTML = `Started at <strong>${latest.emo}</strong> · ${escapeHTML(t)} Pilot Check`;
      if (phyAnchorEl) phyAnchorEl.innerHTML = `Started at <strong>${latest.phy}</strong> · ${escapeHTML(t)} Pilot Check`;
    } else {
      recState.anchorCog = 5;
      recState.anchorEmo = 5;
      recState.anchorPhy = 5;
      recState.anchorSource = null;
      [cogAnchorEl, emoAnchorEl, phyAnchorEl].forEach(el => {
        if (!el) return;
        el.classList.remove('yoked');
        el.textContent = 'No Pilot Check today — starting at 5.';
      });
    }
    // Seed slider positions at the anchor.
    document.getElementById('rec-cog').value = recState.anchorCog;
    document.getElementById('rec-emo').value = recState.anchorEmo;
    document.getElementById('rec-phy').value = recState.anchorPhy;
  }

  function recRenderAnchorDeltas() {
    // Append a small delta tag to the anchor line that reflects current diff direction.
    const pairs = [
      ['rec-cog-anchor', recState.anchorCog, recState.cog],
      ['rec-emo-anchor', recState.anchorEmo, recState.emo],
      ['rec-phy-anchor', recState.anchorPhy, recState.phy]
    ];
    pairs.forEach(([elId, anchor, current]) => {
      const el = document.getElementById(elId);
      if (!el) return;
      const old = el.querySelector('.rec-anchor-delta');
      if (old) old.remove();
      const delta = anchor - current; // positive = withdrawal, negative = gain
      const tag = document.createElement('span');
      tag.className = 'rec-anchor-delta';
      if (delta > 0)      { tag.classList.add('down'); tag.textContent = `−${delta} withdrawn`; }
      else if (delta < 0) { tag.classList.add('up');   tag.textContent = `+${-delta} gained`; }
      else                { tag.classList.add('flat'); tag.textContent = `±0`; }
      el.appendChild(tag);
    });
  }

  // Chip → mechanism weight map (rules of thumb from the research report).
  // Each chip lists primary mechanism(s) with weights summed across selected chips.
  const REC_SHAPE_MAP = {
    'hard-thinking':   [{ mech: 'Detach',  w: 2, why: 'Cognitive overload — switch off (Sonnentag & Fritz).' }],
    'emotional-grind': [{ mech: 'Detach',  w: 2, why: 'Emotional exhaustion clears overnight via detachment.' },
                        { mech: 'Relax',   w: 1, why: 'Pair with low-arousal to settle the system.' }],
    'wound-up':        [{ mech: 'Relax',   w: 2, why: 'Sympathetic-NS activation — low-arousal targets it.' }],
    'boring':          [{ mech: 'Mastery', w: 2, why: 'Under-use depletion — a hard new thing rebuilds.' }],
    'reactive':        [{ mech: 'Control', w: 2, why: 'Daytime autonomy was low — recover control first.' }],
    'physical':        [{ mech: 'Relax',   w: 2, why: 'Physiological relaxation — let the body unspool.' }]
  };

  const REC_MECH_RULES = {
    'Detach':  'Rule of thumb: no work talk, no work-checking. The system clears only when you let it.',
    'Relax':   'Rule of thumb: low arousal beats fun. Bath, breath, music — not stimulation.',
    'Mastery': 'Rule of thumb: a different hard thing. Skip when depleted — mastery on empty backfires.',
    'Control': 'Rule of thumb: do something you owe no one. The point is choosing, not the activity.'
  };

  function recRecommendMechanisms(shapes, tier) {
    if (!shapes || shapes.length === 0) {
      // Zero-mechanism case if tier is light. Otherwise still no recommendation but warn user.
      return { mechs: [], zeroMech: tier === 'light', suppressedMastery: false };
    }
    // Sum weights across selected chips.
    const totals = {};
    shapes.forEach(s => {
      (REC_SHAPE_MAP[s] || []).forEach(entry => {
        if (!totals[entry.mech]) totals[entry.mech] = { mech: entry.mech, w: 0, whys: [] };
        totals[entry.mech].w += entry.w;
        totals[entry.mech].whys.push(entry.why);
      });
    });

    // Suppress Mastery if depth is large or heavy.
    let suppressedMastery = false;
    if ((tier === 'large' || tier === 'heavy') && totals['Mastery']) {
      suppressedMastery = true;
      delete totals['Mastery'];
    }

    const sorted = Object.values(totals).sort((a, b) => b.w - a.w);
    // Cap at 2 mechanisms. If one chip and it lands cleanly on one mech, return one.
    const top = sorted.slice(0, 2);

    const mechs = top.map(t => ({
      name: t.mech,
      why:  t.whys[0],  // first-source why (concise); could join but stays clean
      rule: REC_MECH_RULES[t.mech] || ''
    }));

    return { mechs, zeroMech: false, suppressedMastery };
  }

  // Activity pool — keyed by mechanism + locus. Chips merged and de-duped at render time.
  const REC_ACTIVITY_POOL = {
    // mechanism-keyed picks
    'Detach':  ['no-work-talk dinner', 'novel', 'walk without phone', 'screen-off hour'],
    'Relax':   ['bath', 'breath work', 'music', 'gentle stretch'],
    'Mastery': ['hard new hobby thing', 'learn a hard chord', 'kata practice'],
    'Control': ['do something you don\'t owe anyone', 'pick-your-own meal', 'a project just for you'],
    // locus-keyed picks
    'cognitive': ['meditate', 'nap', 'gentle walk-with-detachment'],
    'emotional': ['run', 'lift', 'talk to someone', 'write it out', 'walk'],
    'physical':  ['stretch', 'ibuprofen', 'hot tub', 'massage chair', 'gentle walk']
  };

  function recBuildActivityChips() {
    const chips = [];
    const seen = new Set();
    const add = (a) => { if (a && !seen.has(a)) { seen.add(a); chips.push(a); } };
    // mechanism picks first, then locus picks
    (recState.mechs || []).forEach(m => {
      (REC_ACTIVITY_POOL[m.name] || []).forEach(add);
    });
    if (recState.locus && recState.locus !== '—' && recState.locus !== 'mixed') {
      (REC_ACTIVITY_POOL[recState.locus] || []).forEach(add);
    } else if (recState.locus === 'mixed') {
      ['cognitive','emotional','physical'].forEach(l => (REC_ACTIVITY_POOL[l] || []).forEach(add));
    }
    // Hard cap to keep it scannable (5–8).
    return chips.slice(0, 8);
  }

  function recUpdateStep1Live() {
    const c = parseInt(document.getElementById('rec-cog').value, 10);
    const e = parseInt(document.getElementById('rec-emo').value, 10);
    const p = parseInt(document.getElementById('rec-phy').value, 10);
    recState.cog = c; recState.emo = e; recState.phy = p;
    document.getElementById('rec-cog-val').textContent = c;
    document.getElementById('rec-emo-val').textContent = e;
    document.getElementById('rec-phy-val').textContent = p;
    // Color the value the same way Pilot Check does — 1–3 red, 4–6 yellow, 7+ green.
    [['rec-cog-val', c], ['rec-emo-val', e], ['rec-phy-val', p]].forEach(([id, v]) => {
      const el = document.getElementById(id);
      el.classList.remove('red','yellow');
      if (v <= 3) el.classList.add('red');
      else if (v <= 6) el.classList.add('yellow');
    });
    // Withdrawal = anchor − current, clamped to ≥ 0 (feeling better than anchor = no withdrawal).
    const dCog = Math.max(0, recState.anchorCog - c);
    const dEmo = Math.max(0, recState.anchorEmo - e);
    const dPhy = Math.max(0, recState.anchorPhy - p);
    recState.diffCog = dCog; recState.diffEmo = dEmo; recState.diffPhy = dPhy;
    const tier  = recComputeTier(dCog, dEmo, dPhy);
    const locus = recComputeLocus(dCog, dEmo, dPhy);
    recState.tier = tier;
    recState.locus = locus;
    recState.size = tier; // size default mirrors tier until user changes it in step 3
    document.getElementById('rec-diffs').textContent = `cog ${dCog} · emo ${dEmo} · phy ${dPhy}`;
    document.getElementById('rec-locus').textContent = locus;
    const tag = document.getElementById('rec-tier-tag');
    tag.textContent = tier;
    tag.classList.remove('light','medium','large','heavy');
    tag.classList.add(tier);
    recRenderAnchorDeltas();
  }

  function recResetStep1() {
    // Reset sliders back to anchor — not 0. The anchor is the "starting" position.
    document.getElementById('rec-cog').value = recState.anchorCog;
    document.getElementById('rec-emo').value = recState.anchorEmo;
    document.getElementById('rec-phy').value = recState.anchorPhy;
    recUpdateStep1Live();
  }

  function recRenderMechCards() {
    const host = document.getElementById('rec-mech-cards');
    const { mechs, zeroMech, suppressedMastery } = recRecommendMechanisms(recState.shapes, recState.tier);
    recState.mechs = mechs;
    recState.zeroMech = zeroMech;
    recState.mechSuppressedMastery = suppressedMastery;

    if (zeroMech) {
      host.innerHTML = `<div class="rec-empty-msg">Today was light. <strong>Sleep is the plan.</strong> No mechanism needed — head to step 3 and write it down.</div>`;
      return;
    }
    if (mechs.length === 0) {
      host.innerHTML = `<div class="rec-empty-msg">Pick a chip above to get a recommendation.</div>`;
      return;
    }
    let warnHTML = '';
    if (suppressedMastery) {
      warnHTML = `<div class="rec-mech-card warn">
        <div class="rec-mech-name">Mastery — suppressed</div>
        <div class="rec-mech-why">Today's depth is ${escapeHTML(recState.tier)}. Mastery on a depleted day backfires (Bakker / Stenfors). Choose another mechanism.</div>
      </div>`;
    }
    host.innerHTML = warnHTML + mechs.map(m => `
      <div class="rec-mech-card">
        <div class="rec-mech-name">${escapeHTML(m.name)}</div>
        <div class="rec-mech-why">${escapeHTML(m.why)}</div>
        <div class="rec-mech-rule">${escapeHTML(m.rule)}</div>
      </div>
    `).join('');
  }

  function recSyncShapeChips() {
    document.querySelectorAll('#rec-shape-chips .rec-chip').forEach(chip => {
      const s = chip.getAttribute('data-shape');
      chip.classList.toggle('selected', recState.shapes.includes(s));
      // Disable un-selected chips when at cap (2) so the cap is visible.
      const atCap = recState.shapes.length >= 2 && !recState.shapes.includes(s);
      chip.classList.toggle('disabled', atCap);
    });
  }

  function recRenderActivityChips() {
    const host = document.getElementById('rec-activity-chips');
    const chips = recBuildActivityChips();
    if (chips.length === 0) {
      host.innerHTML = '<div class="rec-empty-msg" style="flex:1;">No activity seeds — your plan textarea is yours to fill below.</div>';
      return;
    }
    host.innerHTML = chips.map(a => `<button class="rec-chip" data-activity="${escapeHTML(a)}">${escapeHTML(a)}</button>`).join('');
    host.querySelectorAll('.rec-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const txt = btn.getAttribute('data-activity');
        const ta = document.getElementById('rec-plan-text');
        const existing = ta.value.trim();
        ta.value = existing ? existing + '\n' + txt : txt;
        ta.focus();
        recState.plan = ta.value;
      });
    });
  }

  function recSyncSizeButtons() {
    document.querySelectorAll('#rec-size-row .rec-size-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-size') === recState.size);
    });
  }

  // ── Open-turns rendering ──
  // Collects legs not yet debriefed/archived and renders a chip-row per turn.
  // Each row: turn id, turn title (from Frame card's "in" field), and three
  // radio actions (carry / drop / defer) plus an optional note input.
  function recRenderOpenTurns() {
    const container = document.getElementById('rec-open-turns-list');
    if (!container) return;

    const openLegs = loadLegs().filter(l =>
      l && l.status !== 'debriefed' && l.status !== 'archived'
    );

    if (openLegs.length === 0) {
      container.innerHTML = '<div class="rec-open-turns-empty">No open turns to park.</div>';
      return;
    }

    container.innerHTML = openLegs.map(leg => {
      // Resolve title from Frame card "in" field, fall back to "Untitled"
      let title = 'Untitled';
      if (leg.frame_card_id) {
        const card = (loadFrameCards() || []).find(c => c && c.savedAt === leg.frame_card_id);
        if (card && card.in) {
          const raw = card.in;
          title = (typeof raw === 'string' ? raw : JSON.stringify(raw)).split('\n')[0].slice(0, 80) || 'Untitled';
        }
      }
      const escapedId = escapeHTML(leg.id);
      const escapedTitle = escapeHTML(title);
      return `<div class="rec-open-turn-row" data-turn-id="${escapedId}">
        <div class="rec-open-turn-id">${escapedId}</div>
        <div class="rec-open-turn-title">${escapedTitle}</div>
        <div class="rec-open-turn-actions">
          <label class="rec-turn-action-label"><input type="radio" name="rec-turn-action-${escapedId}" value="carry"> Carry</label>
          <label class="rec-turn-action-label"><input type="radio" name="rec-turn-action-${escapedId}" value="drop"> Drop</label>
          <label class="rec-turn-action-label"><input type="radio" name="rec-turn-action-${escapedId}" value="defer"> Defer</label>
        </div>
        <input type="text" class="rec-open-turn-note" placeholder="Optional note — e.g. 'carry into tomorrow's Frame' or 'blocked until Tuesday'" maxlength="200">
      </div>`;
    }).join('');
  }

  // Reads the open-turns UI and returns only rows where the author picked an action.
  function recCollectOpenTurns() {
    const rows = document.querySelectorAll('#rec-open-turns-list .rec-open-turn-row');
    const result = [];
    rows.forEach(row => {
      const turnId = row.getAttribute('data-turn-id');
      const checked = row.querySelector('input[type="radio"]:checked');
      if (!checked) return; // no action selected — skip
      const note = (row.querySelector('.rec-open-turn-note') || {}).value || '';
      result.push({ turnId, action: checked.value, note: note.trim() });
    });
    return result;
  }

  function recShowStep(n) {
    recState.step = n;
    document.querySelectorAll('#ws-recovery-content .rec-step').forEach(el => {
      el.classList.toggle('active', el.id === 'rec-step-' + n);
    });
    document.querySelectorAll('#rec-stepper .rec-stepper-item').forEach(el => {
      const s = parseInt(el.getAttribute('data-step'), 10);
      el.classList.toggle('active', s === n);
      el.classList.toggle('done', s < n);
    });
    if (n === 2) recRenderMechCards();
    if (n === 3) { recSyncSizeButtons(); recRenderActivityChips(); recRenderOpenTurns(); }
  }

  function recRenderRecent() {
    const recs = loadRecoveries();
    const list = document.getElementById('rec-recent-list');
    const countEl = document.getElementById('rec-recent-count');
    const labelEl = document.getElementById('rec-recent-label');

    const today = new Date().toISOString().slice(0, 10);
    const todays = recs.filter(r => (r.date || '').slice(0, 10) === today);

    if (recs.length === 0) {
      countEl.textContent = '';
      if (labelEl) labelEl.firstChild.textContent = "Today's Recoveries ";
      list.innerHTML = '<div class="ws-recent-empty">No recoveries yet. Run the flow above.</div>';
      return;
    }
    countEl.textContent = todays.length > 0 ? '(' + todays.length + ')' : '';
    if (labelEl) labelEl.firstChild.textContent = todays.length > 0 ? "Today's Recoveries " : 'Recent Recoveries ';

    const reverse = recs.slice().reverse();
    list.innerHTML = reverse.map(r => {
      const time = (r.date || '').slice(11) || (r.date || '');
      const mechs = (r.mechs && r.mechs.length) ? r.mechs.map(m => m.name).join(' + ') : (r.zeroMech ? 'Sleep' : '—');
      const planSnip = (r.plan || '').split('\n')[0].slice(0, 70);
      // Back-compat: older entries (pre-yoking) won't have diff* fields.
      const hasDiffs = (typeof r.diffCog === 'number');
      const diffSnip = hasDiffs ? `−${r.diffCog}/${r.diffEmo}/${r.diffPhy} · ` : '';
      const summary = `${diffSnip}${escapeHTML(r.size || 'light')} · ${escapeHTML(mechs)}${planSnip ? ' — ' + escapeHTML(planSnip) : ''}`;
      return `<div class="ws-recent-card">
        <div class="rc-date">${escapeHTML(time)}</div>
        <div class="rc-must">${summary}</div>
      </div>`;
    }).join('');
  }

  function initRecoveryWorkshop() {
    recState = recBlankState();
    document.getElementById('rec-date').textContent = todayDateString();
    document.getElementById('rec-shape-note').value = '';
    document.getElementById('rec-plan-text').value = '';
    recApplyAnchor();      // seeds anchor values + slider positions + anchor text
    recUpdateStep1Live();  // computes diffs (all 0 at start since slider == anchor)
    recSyncShapeChips();
    recShowStep(1);
    recRenderRecent();
  }

  // Wire controls (one-time bind on script load — DOM is in the page).
  ['rec-cog','rec-emo','rec-phy'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', recUpdateStep1Live);
  });
  const recReset1 = document.getElementById('rec-reset-1');
  if (recReset1) recReset1.addEventListener('click', recResetStep1);
  const recNext1 = document.getElementById('rec-next-1');
  if (recNext1) recNext1.addEventListener('click', () => recShowStep(2));
  const recBack2 = document.getElementById('rec-back-2');
  if (recBack2) recBack2.addEventListener('click', () => recShowStep(1));
  const recNext2 = document.getElementById('rec-next-2');
  if (recNext2) recNext2.addEventListener('click', () => {
    // Capture note before leaving step 2
    const noteEl = document.getElementById('rec-shape-note');
    if (noteEl) recState.note = noteEl.value.trim();
    recShowStep(3);
  });
  const recBack3 = document.getElementById('rec-back-3');
  if (recBack3) recBack3.addEventListener('click', () => recShowStep(2));

  document.querySelectorAll('#rec-shape-chips .rec-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (!recState) return;
      const s = chip.getAttribute('data-shape');
      const idx = recState.shapes.indexOf(s);
      if (idx >= 0) {
        recState.shapes.splice(idx, 1);
      } else if (recState.shapes.length < 2) {
        recState.shapes.push(s);
      } // else: at cap, ignored
      recSyncShapeChips();
      recRenderMechCards();
    });
  });

  document.querySelectorAll('#rec-size-row .rec-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!recState) return;
      recState.size = btn.getAttribute('data-size');
      recSyncSizeButtons();
    });
  });

  const recPlanText = document.getElementById('rec-plan-text');
  if (recPlanText) recPlanText.addEventListener('input', () => {
    if (recState) recState.plan = recPlanText.value;
  });

  const recLock = document.getElementById('rec-lock');
  if (recLock) recLock.addEventListener('click', () => {
    if (!recState) return;
    const planEl = document.getElementById('rec-plan-text');
    recState.plan = planEl ? planEl.value.trim() : '';
    if (!recState.plan) {
      planEl && planEl.focus();
      return;
    }
    // Collect open-turn parking decisions (only rows with an action selected).
    const openTurns = recCollectOpenTurns();

    const entry = {
      id: genId(),
      date: todayDateString(),
      // anchor reads (latest pilot check or 5 default)
      anchorCog: recState.anchorCog,
      anchorEmo: recState.anchorEmo,
      anchorPhy: recState.anchorPhy,
      anchorSource: recState.anchorSource, // {id, time} or null
      // current reads (where the user said they are)
      cog: recState.cog,
      emo: recState.emo,
      phy: recState.phy,
      // computed withdrawal (anchor − current, clamped ≥ 0)
      diffCog: recState.diffCog,
      diffEmo: recState.diffEmo,
      diffPhy: recState.diffPhy,
      tier: recState.tier,
      locus: recState.locus,
      shapes: recState.shapes.slice(),
      note: recState.note,
      mechs: recState.mechs.slice(),
      mechSuppressedMastery: recState.mechSuppressedMastery,
      zeroMech: recState.zeroMech,
      size: recState.size,
      plan: recState.plan,
      // open-turn parking: only rows where author picked an action
      openTurns: openTurns
    };
    const recs = loadRecoveries();
    recs.push(entry);
    saveRecoveries(recs);

    const flashEl = document.getElementById('rec-saved');
    if (flashEl) {
      flashEl.classList.add('show');
      setTimeout(() => flashEl.classList.remove('show'), 1800);
    }

    // Also log to the recovery-room Log as an experiment, mirroring Pilot Check pattern.
    if (currentAreaId === 'recovery-room') {
      const exps = getExperiments('recovery-room');
      const mechSummary = entry.zeroMech ? 'Sleep'
        : (entry.mechs.length ? entry.mechs.map(m => m.name).join(' + ') : 'no mechanism');
      const planSnip = entry.plan.split('\n')[0].slice(0, 90);
      const anchorRef = entry.anchorSource
        ? `anchored to ${entry.anchorSource.time} Pilot Check`
        : 'no Pilot Check today — anchored at 5';
      // Build open-turn parking summary if any turns were actioned.
      let turnParkingSuffix = '';
      if (entry.openTurns && entry.openTurns.length > 0) {
        const carries = entry.openTurns.filter(t => t.action === 'carry').length;
        const drops   = entry.openTurns.filter(t => t.action === 'drop').length;
        const defers  = entry.openTurns.filter(t => t.action === 'defer').length;
        const parts = [];
        if (carries) parts.push(carries + ' carry');
        if (defers)  parts.push(defers  + ' defer');
        if (drops)   parts.push(drops   + ' drop');
        turnParkingSuffix = ` + ${entry.openTurns.length} turn${entry.openTurns.length === 1 ? '' : 's'} parked (${parts.join(', ')})`;
      }
      exps.unshift({
        id: genId(),
        title: `Recovery ${todayDateString()} — ${entry.size} · ${mechSummary}`,
        date: todayDateString(),
        observation: `Now → cog ${entry.cog} · emo ${entry.emo} · phy ${entry.phy} (from ${entry.anchorCog}/${entry.anchorEmo}/${entry.anchorPhy}; ${anchorRef}). Withdrawal: cog ${entry.diffCog} · emo ${entry.diffEmo} · phy ${entry.diffPhy} → tier ${entry.tier}, locus ${entry.locus}. Day-shape: ${entry.shapes.join(', ') || '—'}.${entry.note ? ' Note: ' + entry.note : ''}`,
        impact: `Plan: ${planSnip}${entry.plan.length > 90 ? '…' : ''}${turnParkingSuffix}`
      });
      setExperiments('recovery-room', exps);
      renderExperiments('recovery-room');
      updateShelfTile('experiments', exps.length);
    }

    // Reset for next flow but stay on step 3 briefly so the flash is visible.
    setTimeout(() => {
      initRecoveryWorkshop();
    }, 600);
  });

  /* ── Workshop mode state machine ── */
  let wsMode = 'resting';
  let editingOriginalIdx = -1; // -1 = new; >=0 = editing existing card at this index

  function setWsMode(mode) {
    wsMode = mode;
    document.querySelectorAll('.ws-mode').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('ws-' + mode);
    if (target) target.classList.add('active');
  }

  function enterResting() {
    editingOriginalIdx = -1;
    setWsMode('resting');
    document.getElementById('ws-cta-date').textContent = todayDateString();
    renderRecent();
  }

  function enterEditing(card, idx) {
    editingOriginalIdx = (typeof idx === 'number') ? idx : -1;
    document.getElementById('ff-date').textContent = todayDateString();
    document.getElementById('ws-editing-title').innerHTML =
      (editingOriginalIdx >= 0 ? 'Edit Frame Card · ' : 'New Frame Card · ') +
      `<span id="ff-date">${todayDateString()}</span>`;
    if (card) loadIntoFrameForm(card); else clearFrameForm();
    setWsMode('editing');
    setTimeout(() => {
      // Focus the first field (Doing) so the user can type immediately.
      const first = document.getElementById('ff-in');
      if (first) first.focus();
    }, 50);
  }

  function enterViewing(idx) {
    const cards = loadFrameCards();
    const card = cards[idx];
    if (!card) return;
    editingOriginalIdx = idx; // remember for Edit & Re-save
    document.getElementById('ws-viewing-date').textContent = card.date || '(no date)';
    const rows = FF_FIELDS
      .filter(f => fieldIsFilled(card[f]))
      .map(f => {
        const v = card[f];
        let valHTML;
        if (Array.isArray(v)) {
          // Legacy typed-ref array from the picker era (LAB-027). The picker
          // form is gone (rollback 2026-05-11, LAB-058) but legacy data may
          // still be on saved cards. Render as read-only chips so the author
          // can still click through to the referenced lab item.
          valHTML = '<div class="ff-picker-chips">' + v.map(ref => {
            const id = escapeHTML(ref.id || '');
            const title = escapeHTML(ref.title || '');
            return `<span class="ff-chip" data-act="open-ref" data-item="${id}">
              <span class="ff-chip-id">${id}</span>
              <span class="ff-chip-title">${title}</span>
            </span>`;
          }).join('') + '</div>';
        } else {
          valHTML = escapeHTML(v).replace(/\n/g, '<br>');
        }
        return `<div class="ws-vb-row"><div class="lbl">${FF_LABELS[f]}</div><div class="val">${valHTML}</div></div>`;
      })
      .join('');
    document.getElementById('ws-viewing-body').innerHTML =
      rows || '<div style="color:#888;font-size:12px;font-style:italic;">Empty card.</div>';
    setWsMode('viewing');
  }

  function renderRecent() {
    const cards = loadFrameCards();
    const list = document.getElementById('ws-recent-list');
    const countEl = document.getElementById('ws-recent-count');
    const labelEl = document.getElementById('ws-recent-label');

    const today = new Date().toISOString().slice(0,10);
    const yest  = new Date(Date.now() - 86400000).toISOString().slice(0,10);

    // Empty state
    if (cards.length === 0) {
      countEl.textContent = '';
      if (labelEl) labelEl.firstChild.textContent = 'Today’s Framing ';
      list.innerHTML = '<div class="ws-recent-empty">No frame cards yet. Start one above.</div>';
      return;
    }

    // Group by date prefix
    const groups = {};
    cards.forEach((c, i) => {
      const dateOnly = (c.date || '').slice(0,10);
      let key, label, isToday = false;
      if (dateOnly === today)      { key = 'today';     label = 'Today';     isToday = true; }
      else if (dateOnly === yest)  { key = 'yesterday'; label = 'Yesterday'; }
      else                          { key = dateOnly || 'undated'; label = dateOnly || 'Earlier'; }
      if (!groups[key]) groups[key] = { label, isToday, cards: [] };
      groups[key].cards.push({ card: c, idx: i });
    });

    // Group order: today, yesterday, then dates desc
    const order = [];
    if (groups.today) order.push('today');
    if (groups.yesterday) order.push('yesterday');
    Object.keys(groups)
      .filter(k => k !== 'today' && k !== 'yesterday' && k !== 'undated')
      .sort().reverse()
      .forEach(k => order.push(k));
    if (groups.undated) order.push('undated');

    // Header label reflects whether there's a card today
    const todayCount = groups.today ? groups.today.cards.length : 0;
    countEl.textContent = todayCount > 0 ? '(' + todayCount + ')' : '';
    if (labelEl) {
      labelEl.firstChild.textContent = todayCount > 0 ? 'Today’s Framing ' : 'Recent Framing ';
    }

    const renderGroup = key => {
      const g = groups[key];
      const items = g.cards.slice().reverse().map(({card, idx}) => {
        const time = (card.date || '').slice(11) || '·';
        let mustSummary;
        if (Array.isArray(card.must)) {
          mustSummary = card.must.length === 0
            ? '(no must)'
            : card.must.map(r => (r.id || '') + (r.title ? ' · ' + r.title : '')).join('; ');
        } else {
          mustSummary = (card.must || '').slice(0, 110) || '(no must)';
        }
        return `<div class="ws-recent-card" data-idx="${idx}">
          <div class="rc-date">${escapeHTML(time)}</div>
          <div class="rc-must">${escapeHTML(mustSummary)}</div>
        </div>`;
      }).join('');
      const labelClass = g.isToday ? 'ws-recent-group-label today' : 'ws-recent-group-label';
      return `<div class="ws-recent-group">
        <div class="${labelClass}">${escapeHTML(g.label)}</div>
        ${items}
      </div>`;
    };

    // Cockpit mode: today inline; collapse all past groups into a single <details>.
    const drawerEl = document.getElementById('drawer');
    const cockpit = drawerEl && drawerEl.classList.contains('cockpit-active');
    if (cockpit) {
      const todayHTML = groups.today ? renderGroup('today') : '';
      const pastKeys = order.filter(k => k !== 'today');
      const pastCount = pastKeys.reduce((n, k) => n + groups[k].cards.length, 0);
      const pastHTML = pastKeys.map(renderGroup).join('');
      const pastBlock = pastCount > 0
        ? `<details class="ws-recent-past"><summary>Past frames (${pastCount})</summary>${pastHTML}</details>`
        : '';
      list.innerHTML = (todayHTML || '<div class="ws-recent-empty" style="color:#888;font-size:12px;font-style:italic;padding:6px 0;">No Frame today yet — start one above.</div>') + pastBlock;
    } else {
      list.innerHTML = order.map(renderGroup).join('');
    }
  }

  /* ── Floor shelf (items / artifacts / notes tiles) ── */
  let activeShelf = null;

  function updateShelfTile(name, count) {
    const tile = document.querySelector('.shelf-tile[data-shelf="' + name + '"]');
    const countEl = document.getElementById('shelf-' + name + '-count');
    if (countEl) countEl.textContent = String(count);
    if (tile) {
      tile.classList.toggle('has-content', count > 0);
      tile.classList.toggle('empty', count === 0);
    }
  }

  const SHELF_NAMES = ['items','experiments','chapter','sources'];

  function setActiveShelf(name) {
    activeShelf = name;
    document.querySelectorAll('.shelf-tile').forEach(el => {
      el.classList.toggle('active', el.dataset.shelf === name);
    });
    const content = document.getElementById('shelf-content');
    SHELF_NAMES.forEach(s => {
      const sec = document.getElementById(s + '-section');
      if (sec) sec.style.display = (s === name) ? 'block' : 'none';
    });
    if (name) content.classList.add('open');
    else content.classList.remove('open');
  }

  // Wire shelf-tile clicks once
  document.querySelectorAll('.shelf-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      if (tile.classList.contains('empty')) return;
      const name = tile.dataset.shelf;
      setActiveShelf(activeShelf === name ? null : name);
    });
  });

  /* ── Chunks (Chapter tile) ── */
  function genId() { return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

  function getChunks(areaId) {
    if (shadow.chunks && shadow.chunks[areaId]) return shadow.chunks[areaId];
    const area = baseline.areas.find(a => a.id === areaId);
    return (area && area.chunks) ? JSON.parse(JSON.stringify(area.chunks)) : [];
  }
  function setChunks(areaId, list) {
    if (!shadow.chunks) shadow.chunks = {};
    shadow.chunks[areaId] = list;
    saveState(shadow);
  }

  let editingChunk = null; // null | { isNew: bool, idx?: number, draft: {...} }
  let expandedChunks = new Set();

  function renderChunks(areaId) {
    const chunks = getChunks(areaId);
    const list = document.getElementById('chapter-list');
    let html = '';
    if (editingChunk && editingChunk.isNew) {
      html += renderChunkEdit(editingChunk.draft);
    }
    if (chunks.length === 0 && !editingChunk) {
      html += '<div class="chunk-empty">No chunks yet. Add one with the button above.</div>';
    } else {
      chunks.forEach((c, i) => {
        if (editingChunk && !editingChunk.isNew && editingChunk.idx === i) {
          html += renderChunkEdit(editingChunk.draft, i);
        } else {
          html += renderChunkView(c, i);
        }
      });
    }
    list.innerHTML = html;
  }
  function renderChunkView(chunk, idx) {
    const expanded = expandedChunks.has(idx);
    return `<div class="chunk-card${expanded ? ' expanded' : ''}" data-idx="${idx}">
      <div class="chunk-header" data-act="toggle" data-idx="${idx}">
        <span class="chunk-title">${escapeHTML(chunk.title || '(untitled)')}</span>
        <button class="chunk-edit-btn" data-act="edit-chunk" data-idx="${idx}" title="Edit">✎</button>
      </div>
      ${chunk.summary ? `<div class="chunk-summary">${escapeHTML(chunk.summary)}</div>` : ''}
      ${expanded ? `<div class="chunk-body">${escapeHTML(chunk.body || '(empty)')}</div>` : ''}
    </div>`;
  }
  function renderChunkEdit(draft, idx) {
    const isNew = (idx === undefined);
    return `<div class="chunk-card editing">
      <input class="chunk-edit-title" data-edit="title" value="${escapeHTML(draft.title || '')}" placeholder="Chunk title">
      <input class="chunk-edit-summary" data-edit="summary" value="${escapeHTML(draft.summary || '')}" placeholder="One-line summary (optional)">
      <textarea class="chunk-edit-body" data-edit="body" placeholder="Longform writeup">${escapeHTML(draft.body || '')}</textarea>
      <div class="chunk-actions">
        <button class="ff-btn primary" data-act="save-chunk">Save</button>
        <button class="ff-btn" data-act="cancel-chunk">Cancel</button>
        ${!isNew ? `<button class="ff-btn danger" data-act="delete-chunk" data-idx="${idx}">Delete</button>` : ''}
      </div>
    </div>`;
  }

  document.getElementById('add-chunk-btn').addEventListener('click', () => {
    if (!currentAreaId) return;
    editingChunk = { isNew: true, draft: { id: genId(), title: '', summary: '', body: '' } };
    renderChunks(currentAreaId);
    setTimeout(() => {
      const inp = document.querySelector('.chunk-card.editing [data-edit="title"]');
      if (inp) inp.focus();
    }, 30);
  });

  document.getElementById('chapter-list').addEventListener('click', (e) => {
    const tgt = e.target.closest('[data-act]');
    if (!tgt) return;
    const act = tgt.dataset.act;
    const idx = parseInt(tgt.dataset.idx, 10);

    if (act === 'toggle') {
      // ignore if click was on the edit button
      if (e.target.closest('.chunk-edit-btn')) return;
      if (expandedChunks.has(idx)) expandedChunks.delete(idx);
      else expandedChunks.add(idx);
      renderChunks(currentAreaId);
    } else if (act === 'edit-chunk') {
      e.stopPropagation();
      const chunks = getChunks(currentAreaId);
      editingChunk = { isNew: false, idx, draft: JSON.parse(JSON.stringify(chunks[idx])) };
      renderChunks(currentAreaId);
    } else if (act === 'save-chunk') {
      const card = document.querySelector('.chunk-card.editing');
      if (!card) return;
      const title   = card.querySelector('[data-edit="title"]').value.trim();
      const summary = card.querySelector('[data-edit="summary"]').value.trim();
      const body    = card.querySelector('[data-edit="body"]').value;
      const draft   = { ...(editingChunk.draft || {}), title, summary, body };
      const chunks  = getChunks(currentAreaId);
      if (editingChunk.isNew) chunks.unshift(draft);
      else chunks[editingChunk.idx] = draft;
      setChunks(currentAreaId, chunks);
      editingChunk = null;
      renderChunks(currentAreaId);
      updateShelfTile('chapter', chunks.length);
    } else if (act === 'cancel-chunk') {
      editingChunk = null;
      renderChunks(currentAreaId);
    } else if (act === 'delete-chunk') {
      if (!confirm('Delete this chunk?')) return;
      const chunks = getChunks(currentAreaId);
      chunks.splice(idx, 1);
      setChunks(currentAreaId, chunks);
      editingChunk = null;
      expandedChunks.clear();
      renderChunks(currentAreaId);
      updateShelfTile('chapter', chunks.length);
    }
  });

  /* ── Experiments (Experiments tile) ── */
  function getExperiments(areaId) {
    if (shadow.experiments && shadow.experiments[areaId]) return shadow.experiments[areaId];
    const area = baseline.areas.find(a => a.id === areaId);
    return (area && area.experiments) ? JSON.parse(JSON.stringify(area.experiments)) : [];
  }
  function setExperiments(areaId, list) {
    if (!shadow.experiments) shadow.experiments = {};
    shadow.experiments[areaId] = list;
    saveState(shadow);
  }

  let editingExp = null;
  let expandedExps = new Set();

  function renderExperiments(areaId) {
    const exps = getExperiments(areaId);
    const list = document.getElementById('experiments-list');
    let html = '';
    if (editingExp && editingExp.isNew) html += renderExpEdit(editingExp.draft);
    if (exps.length === 0 && !editingExp) {
      html += '<div class="exp-empty">No log entries yet. Add one with the button above.</div>';
    } else {
      exps.forEach((e, i) => {
        if (editingExp && !editingExp.isNew && editingExp.idx === i) html += renderExpEdit(editingExp.draft, i);
        else html += renderExpView(e, i);
      });
    }
    list.innerHTML = html;
  }
  function renderExpView(exp, idx) {
    const expanded = expandedExps.has(idx);
    const fallback = (exp.observation || '').split('\n')[0].slice(0, 80);
    const labelText = exp.title || fallback || '(no title)';
    if (!expanded) {
      return `<div class="exp-card collapsed" data-idx="${idx}">
        <div class="exp-row" data-act="toggle-exp" data-idx="${idx}">
          <span class="exp-date">${escapeHTML(exp.date || '(no date)')}</span>
          <span class="exp-title">${escapeHTML(labelText)}</span>
          <button class="exp-edit-btn" data-act="edit-exp" data-idx="${idx}" title="Edit">✎</button>
        </div>
      </div>`;
    }
    return `<div class="exp-card expanded" data-idx="${idx}">
      <div class="exp-row" data-act="toggle-exp" data-idx="${idx}">
        <span class="exp-date">${escapeHTML(exp.date || '(no date)')}</span>
        <span class="exp-title">${escapeHTML(labelText)}</span>
        <span class="exp-collapse-hint">▾</span>
        <button class="exp-edit-btn" data-act="edit-exp" data-idx="${idx}" title="Edit">✎</button>
      </div>
      ${exp.observation ? `<span class="exp-label">Observation</span><div class="exp-text">${escapeHTML(exp.observation)}</div>` : ''}
      ${exp.impact ? `<span class="exp-label">Impact</span><div class="exp-text">${escapeHTML(exp.impact)}</div>` : ''}
    </div>`;
  }
  function renderExpEdit(draft, idx) {
    const isNew = (idx === undefined);
    return `<div class="exp-card editing">
      <input class="exp-edit-title" data-edit="title" value="${escapeHTML(draft.title || '')}" placeholder="A short label for this entry (4–8 words)">
      <input class="exp-edit-date" data-edit="date" value="${escapeHTML(draft.date || todayDateString())}" placeholder="YYYY-MM-DD HH:MM">
      <textarea class="exp-edit-obs" data-edit="observation" placeholder="What happened? What did you notice?">${escapeHTML(draft.observation || '')}</textarea>
      <textarea class="exp-edit-impact" data-edit="impact" placeholder="What changed? What got updated? What's the takeaway?">${escapeHTML(draft.impact || '')}</textarea>
      <div class="chunk-actions">
        <button class="ff-btn primary" data-act="save-exp">Save</button>
        <button class="ff-btn" data-act="cancel-exp">Cancel</button>
        ${!isNew ? `<button class="ff-btn danger" data-act="delete-exp" data-idx="${idx}">Delete</button>` : ''}
      </div>
    </div>`;
  }

  document.getElementById('add-experiment-btn').addEventListener('click', () => {
    if (!currentAreaId) return;
    editingExp = { isNew: true, draft: { id: genId(), title: '', date: todayDateString(), observation: '', impact: '' } };
    renderExperiments(currentAreaId);
    setTimeout(() => {
      const t = document.querySelector('.exp-card.editing [data-edit="title"]');
      if (t) t.focus();
    }, 30);
  });

  document.getElementById('experiments-list').addEventListener('click', (e) => {
    const tgt = e.target.closest('[data-act]');
    if (!tgt) return;
    const act = tgt.dataset.act;
    const idx = parseInt(tgt.dataset.idx, 10);
    if (act === 'toggle-exp') {
      // Don't toggle if click was on edit button
      if (e.target.closest('.exp-edit-btn')) return;
      if (expandedExps.has(idx)) expandedExps.delete(idx);
      else expandedExps.add(idx);
      renderExperiments(currentAreaId);
    } else if (act === 'edit-exp') {
      const exps = getExperiments(currentAreaId);
      editingExp = { isNew: false, idx, draft: JSON.parse(JSON.stringify(exps[idx])) };
      renderExperiments(currentAreaId);
    } else if (act === 'save-exp') {
      const card = document.querySelector('.exp-card.editing');
      if (!card) return;
      const title       = card.querySelector('[data-edit="title"]').value.trim();
      const date        = card.querySelector('[data-edit="date"]').value.trim();
      const observation = card.querySelector('[data-edit="observation"]').value.trim();
      const impact      = card.querySelector('[data-edit="impact"]').value.trim();
      const draft       = { ...(editingExp.draft || {}), title, date, observation, impact };
      const exps        = getExperiments(currentAreaId);
      if (editingExp.isNew) exps.unshift(draft);
      else exps[editingExp.idx] = draft;
      setExperiments(currentAreaId, exps);
      editingExp = null;
      renderExperiments(currentAreaId);
      updateShelfTile('experiments', exps.length);
    } else if (act === 'cancel-exp') {
      editingExp = null;
      renderExperiments(currentAreaId);
    } else if (act === 'delete-exp') {
      if (!confirm('Delete this log entry?')) return;
      const exps = getExperiments(currentAreaId);
      exps.splice(idx, 1);
      setExperiments(currentAreaId, exps);
      editingExp = null;
      renderExperiments(currentAreaId);
      updateShelfTile('experiments', exps.length);
    }
  });

  /* ── Frame Workshop: typed-ref picker (LAB-027 v2) ──
        Surfaces lab items as click-to-select for Done means (single) and Bonus (multi).
        Default surfaced subset: P0 with status in {in-progress, drafted, backlog}.
        Within P0, in-progress + drafted render before backlog (the at-bat / next-up
        distinction encoded by status badge — no new tier).
        See more: expands to include P1, then P2.  ── */

  // Returns the active Course's scope set as a Set for fast membership checks.
  // Empty Set if no active course or empty scope — caller should treat that as
  // "no course set" and degrade to the full-lab scope. Slice 1: the scope is
  // derived from build_positions (every placed or staged piece is in scope).
  // Falls back to the legacy `frontier` field for unmigrated overflow so no
  // course-planning intent is lost during migration.
  function getActiveCourseScopeSet() {
    const c = (typeof findActiveCourse === 'function') ? findActiveCourse() : null;
    if (!c) return new Set();
    const fromPositions = c.build_positions ? Object.keys(c.build_positions) : [];
    const fromFrontier = Array.isArray(c.frontier) ? c.frontier : [];
    return new Set([...fromPositions, ...fromFrontier]);
  }

  // Frame picker / candidates / per-slot Approach rendering removed in the
  // 2026-05-11 rollback (LAB-058). Form is now plain textareas; legacy
  // saved-card schema is preserved silently in localStorage but not rendered.
  // Picker handlers (panel toggle, scope toggle, pick/unpick, expand tier,
  // chip-remove, per-slot input) and the helpers they called
  // (getFramePickerCandidates, renderFramePicker, shiftExpandedDown,
  // framePickerState / framePickerScope / FF_SLOT_*) are all gone. The
  // viewing-mode click handler below is kept so a saved card with legacy
  // typed-ref chips still routes to the lab item via openItemFromFrameRef.

  // Delegated handler for chips inside the viewing-mode body.
  document.getElementById('ws-viewing-body').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-act="open-ref"]');
    if (!chip) return;
    const id = chip.dataset.item;
    openItemFromFrameRef(id);
  });

  // Resolve a typed ref (LAB-###) → switch to floor view, open the area drawer,
  // and drilldown if the area isn't a workshop. Mirrors the priority-view chip behavior.
  function openItemFromFrameRef(itemId) {
    const item = baseline.items[itemId] || (shadow.newItems && shadow.newItems[itemId]);
    if (!item) return;
    const area = resolveAreaForItem(item);
    if (!area) return;
    if (typeof setView === 'function') setView('floor');
    if (typeof openDrawer === 'function') openDrawer(area.id);
    if (!area.workshop && typeof openDrilldown === 'function') {
      setTimeout(() => openDrilldown(itemId), 30);
    }
  }

  function initFrameWorkshop() { enterResting(); }

  /* ── Workshop button handlers (wired once at load) ── */
  document.getElementById('ws-start-btn').addEventListener('click', () => {
    enterEditing(null);
  });

  document.getElementById('ws-cancel-btn').addEventListener('click', () => {
    const hasContent = FF_FIELDS.some(f => {
      const el = document.getElementById('ff-' + f);
      return !!(el && el.value.trim());
    });
    if (hasContent && !confirm('Discard this card? Unsaved changes will be lost.')) return;
    enterResting();
  });

  document.getElementById('ws-back-btn').addEventListener('click', () => enterResting());

  document.getElementById('ws-edit-btn').addEventListener('click', () => {
    const cards = loadFrameCards();
    if (editingOriginalIdx < 0 || !cards[editingOriginalIdx]) return;
    enterEditing(cards[editingOriginalIdx], editingOriginalIdx);
  });

  document.getElementById('ws-delete-btn').addEventListener('click', () => {
    const cards = loadFrameCards();
    if (editingOriginalIdx < 0 || !cards[editingOriginalIdx]) return;
    if (!confirm('Delete this frame card?')) return;
    cards.splice(editingOriginalIdx, 1);
    saveFrameCards(cards);
    enterResting();
  });

  document.getElementById('ws-recent-list').addEventListener('click', e => {
    const card = e.target.closest('.ws-recent-card');
    if (!card) return;
    const idx = parseInt(card.dataset.idx, 10);
    if (!Number.isNaN(idx)) enterViewing(idx);
  });

  document.getElementById('ff-save').addEventListener('click', () => {
    const card = readFrameForm();
    const filled = FF_FIELDS.filter(f => fieldIsFilled(card[f])).length;
    if (filled === 0) return;
    const cards = loadFrameCards();
    if (editingOriginalIdx >= 0 && cards[editingOriginalIdx]) {
      // preserve original date + savedAt if user is editing an existing card,
      // so the leg-attach link by savedAt stays stable across edits
      const orig = cards[editingOriginalIdx];
      card.date = orig.date || card.date;
      card.savedAt = orig.savedAt || card.savedAt;
      cards[editingOriginalIdx] = card;
    } else {
      cards.push(card);
    }
    saveFrameCards(cards);
    // Phase 2: ensure today's leg exists in the active week's course and link
    // the just-saved Frame card to it. New cards bump the leg into in-progress;
    // edits to an already-attached card leave the link unchanged.
    attachFrameToLeg(card);
    renderCourseHeader();
    flashSaved();
    setTimeout(() => enterResting(), 600);
  });

  document.getElementById('ff-clear').addEventListener('click', () => {
    const hasAny = FF_FIELDS.some(f => {
      const el = document.getElementById('ff-' + f);
      return !!(el && el.value.trim());
    });
    if (hasAny && !confirm('Clear all fields?')) return;
    clearFrameForm();
    setTimeout(() => {
      const first = document.getElementById('ff-in');
      if (first) first.focus();
    }, 30);
  });

  /* ── Debrief Workshop ── */
  const DEBRIEF_KEY = 'product-library-v0.1::debrief-cards';
  // Rogaine shape input fields. DOM ids: db-caught, db-changed-it, db-better-moves.
  // course_held is a radio group; not in this list. Capacity gauge / "what's next"
  // was moved out of Debrief into the Recover workshop.
  const DB_FIELDS = ['caught','changed_it','better_moves'];
  // Legacy fields kept readable in view-mode for back-compat with older cards.
  // capacity sits here so cards saved before the move still show their gauge read.
  const DB_FIELDS_LEGACY = ['subject','framed','actual','diverged','sustain','improve','capacity'];
  const DB_LABELS = {
    // Phase 4 labels
    caught:        'Caught',
    course_held:   'Course held?',
    changed_it:    'What changed it',
    better_moves:  'Better moves',
    capacity:      'Capacity + next',
    // Legacy labels
    subject:       'Produce stage',
    framed:        'What we Framed',
    actual:        'What actually happened',
    diverged:      'Where they diverged',
    sustain:       'What to sustain',
    improve:       'What to improve'
  };
  const DB_COURSE_HELD_LABEL = {
    'as-set':           'Ran the course as set',
    'different':        'Ran a different course (course changed mid-leg)',
    'wrong-from-start': 'Course was wrong from the start'
  };

  function loadDebriefCards() {
    try { return JSON.parse(localStorage.getItem(DEBRIEF_KEY) || '[]'); }
    catch { return []; }
  }
  function saveDebriefCards(arr) {
    try { localStorage.setItem(DEBRIEF_KEY, JSON.stringify(arr)); } catch {}
    postSave('debrief-cards', arr);
  }
  function dbReadCourseHeld() {
    const checked = document.querySelector('input[name="db-course-held"]:checked');
    return checked ? checked.value : '';
  }
  function dbSetCourseHeld(value) {
    document.querySelectorAll('input[name="db-course-held"]').forEach(r => {
      r.checked = (value && r.value === value);
    });
  }
  function clearDebriefForm() {
    DB_FIELDS.forEach(f => { const el = document.getElementById('db-'+f.replace(/_/g, '-')); if (el) el.value = ''; });
    dbSetCourseHeld('');
    renderDebriefScore();
  }
  function loadIntoDebriefForm(card) {
    DB_FIELDS.forEach(f => {
      const el = document.getElementById('db-'+f.replace(/_/g, '-'));
      if (el) el.value = card[f] || '';
    });
    dbSetCourseHeld(card && card.course_held);
    renderDebriefScore();
  }
  function readDebriefForm() {
    const card = { savedAt: new Date().toISOString(), date: todayDateString() };
    DB_FIELDS.forEach(f => {
      const el = document.getElementById('db-'+f.replace(/_/g, '-'));
      card[f] = el ? el.value.trim() : '';
    });
    card.course_held = dbReadCourseHeld();
    return card;
  }
  function dbCardHasContent(card) {
    if (!card) return false;
    if (card.course_held) return true;
    if (DB_FIELDS.some(f => (card[f] || '').toString().trim().length > 0)) return true;
    // Also surface legacy data so a user editing an old card and hitting
    // Cancel without typing still gets the discard prompt — the card has
    // *content* even if the new form doesn't expose those fields.
    return DB_FIELDS_LEGACY.some(f => (card[f] || '').toString().trim().length > 0);
  }
  /* Score auto-derive from active leg's Frame card.
     Phase 4 only counts plan-side: Musts (from frame.must) and Bonus (from
     frame.stretch). When leg.produce.selected is populated by future phases,
     "completed" counts will replace plan counts. */
  function renderDebriefScore() {
    const el = document.getElementById('db-score-display');
    if (!el) return;
    const leg = findActiveLeg();
    if (!leg) {
      el.innerHTML = '<span class="db-score-empty">No active leg — open Frame Workshop and save a card to start one.</span>';
      return;
    }
    const card = findFrameCardForLeg(leg);
    if (!card) {
      el.innerHTML =
        '<div class="db-score-line">' +
          '<span class="db-score-label">Leg</span><span class="db-score-value">' + escapeHTML(leg.id) + '</span>' +
          '<span class="db-score-empty">No Frame card linked yet.</span>' +
        '</div>';
      return;
    }
    const mustArr  = Array.isArray(card.must) ? card.must
                   : (typeof card.must === 'string' && card.must.trim() ? [{ id: 'free' }] : []);
    const bonusArr = Array.isArray(card.stretch) ? card.stretch
                   : (typeof card.stretch === 'string' && card.stretch.trim() ? [{ id: 'free' }] : []);
    const flavors = mustArr
      .map(r => r && r.done_this_turn)
      .filter(Boolean);
    const flavorMix = flavors.length === 0 ? 'no per-Done flavors named' : flavors.join(' · ');
    el.innerHTML =
      '<div class="db-score-line">' +
        '<span class="db-score-label">Leg</span><span class="db-score-value">' + escapeHTML(leg.id) + '</span>' +
        '<span class="db-score-label">Musts planned</span><span class="db-score-value">' + mustArr.length + '/3</span>' +
        '<span class="db-score-label">Bonus planned</span><span class="db-score-value">' + bonusArr.length + '</span>' +
        '<span class="db-score-label">Flavor mix</span><span class="db-score-value">' + escapeHTML(flavorMix) + '</span>' +
      '</div>';
  }
  /* changes_to_course writeback. Phase 4 captures the Debrief outcome on the
     active leg, links the just-saved Debrief card, bumps the leg's status to
     debriefed. The frontier add/remove UI is queued for a future LAB item;
     today the writeback records the qualitative outcome only. */
  function attachDebriefToLeg(card) {
    if (!card || !card.savedAt) return null;
    const leg = findActiveLeg();
    if (!leg) {
      // Orphan Debrief: card is saved (above) but has no leg to write back
      // to. Acceptable for now; surface a console warning so phase 5+ debug
      // sessions can spot unexpected orphans without re-tracing the save path.
      console.warn('[Debrief] No active leg — card saved as orphan:', card.savedAt);
      return null;
    }
    leg.debrief_card_id = card.savedAt;
    leg.changes_to_course = {
      at: new Date().toISOString(),
      debrief_card_id: card.savedAt,
      course_held: card.course_held || '',
      summary: card.changed_it || ''
    };
    leg.status = 'debriefed';
    return upsertLeg(leg);
  }
  function flashDebriefSaved() {
    const el = document.getElementById('db-saved');
    if (!el) return;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1800);
  }

  let dbMode = 'resting';
  let dbEditingOriginalIdx = -1;
  let dbEditingOriginalCard = null; // snapshot of the card at edit-open, for dirty/cancel checks

  function setDbMode(mode) {
    dbMode = mode;
    document.querySelectorAll('#ws-debrief-content .ws-mode').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('db-' + mode);
    if (target) target.classList.add('active');
  }

  function dbEnterResting() {
    dbEditingOriginalIdx = -1;
    setDbMode('resting');
    const ctaDate = document.getElementById('db-cta-date');
    if (ctaDate) ctaDate.textContent = todayDateString();
    dbRenderRecent();
  }

  function dbEnterEditing(card, idx) {
    dbEditingOriginalIdx = (typeof idx === 'number') ? idx : -1;
    dbEditingOriginalCard = card ? JSON.parse(JSON.stringify(card)) : null;
    const dateEl = document.getElementById('db-date');
    if (dateEl) dateEl.textContent = todayDateString();
    document.getElementById('db-editing-title').innerHTML =
      (dbEditingOriginalIdx >= 0 ? 'Edit Debrief Card · ' : 'New Debrief Card · ') +
      `<span id="db-date">${todayDateString()}</span>`;
    if (card) loadIntoDebriefForm(card); else clearDebriefForm();
    setDbMode('editing');
    renderDebriefScore();
    setTimeout(() => {
      const first = document.getElementById('db-caught');
      if (first) first.focus();
    }, 50);
  }

  function dbEnterViewing(idx) {
    const cards = loadDebriefCards();
    const card = cards[idx];
    if (!card) return;
    dbEditingOriginalIdx = idx;
    document.getElementById('db-viewing-date').textContent = card.date || '(no date)';
    // Phase 4 view renderer: show new fields first, then legacy fields if they
    // exist on the card (back-compat for cards saved under the pre-rogaine shape).
    const rowParts = [];
    if (card.course_held) {
      rowParts.push(`<div class="ws-vb-row"><div class="lbl">${DB_LABELS.course_held}</div><div class="val">${escapeHTML(DB_COURSE_HELD_LABEL[card.course_held] || card.course_held)}</div></div>`);
    }
    DB_FIELDS.forEach(f => {
      const v = card[f];
      if (v && (typeof v !== 'string' || v.length > 0)) {
        rowParts.push(`<div class="ws-vb-row"><div class="lbl">${DB_LABELS[f]}</div><div class="val">${escapeHTML(v)}</div></div>`);
      }
    });
    DB_FIELDS_LEGACY.forEach(f => {
      const v = card[f];
      if (v && (typeof v !== 'string' || v.length > 0)) {
        rowParts.push(`<div class="ws-vb-row"><div class="lbl">${DB_LABELS[f]} <span class="ff-hint" style="margin-left:4px;">legacy</span></div><div class="val">${escapeHTML(v)}</div></div>`);
      }
    });
    document.getElementById('db-viewing-body').innerHTML =
      rowParts.length > 0 ? rowParts.join('') : '<div style="color:#888;font-size:12px;font-style:italic;">Empty card.</div>';
    setDbMode('viewing');
  }

  function dbRenderRecent() {
    const cards = loadDebriefCards();
    const list = document.getElementById('db-recent-list');
    const countEl = document.getElementById('db-recent-count');
    const labelEl = document.getElementById('db-recent-label');
    if (!list) return;

    const today = new Date().toISOString().slice(0,10);
    const yest  = new Date(Date.now() - 86400000).toISOString().slice(0,10);

    if (cards.length === 0) {
      if (countEl) countEl.textContent = '';
      if (labelEl) labelEl.firstChild.textContent = "Today's Debriefs ";
      list.innerHTML = '<div class="ws-recent-empty">No debrief cards yet. Start one above.</div>';
      return;
    }

    const groups = {};
    cards.forEach((c, i) => {
      const dateOnly = (c.date || '').slice(0,10);
      let key, label, isToday = false;
      if (dateOnly === today)      { key = 'today';     label = 'Today';     isToday = true; }
      else if (dateOnly === yest)  { key = 'yesterday'; label = 'Yesterday'; }
      else                          { key = dateOnly || 'undated'; label = dateOnly || 'Earlier'; }
      if (!groups[key]) groups[key] = { label, isToday, cards: [] };
      groups[key].cards.push({ card: c, idx: i });
    });

    const order = [];
    if (groups.today) order.push('today');
    if (groups.yesterday) order.push('yesterday');
    Object.keys(groups)
      .filter(k => k !== 'today' && k !== 'yesterday' && k !== 'undated')
      .sort().reverse()
      .forEach(k => order.push(k));
    if (groups.undated) order.push('undated');

    const todayCount = groups.today ? groups.today.cards.length : 0;
    if (countEl) countEl.textContent = todayCount > 0 ? '(' + todayCount + ')' : '';
    if (labelEl) {
      labelEl.firstChild.textContent = todayCount > 0 ? "Today's Debriefs " : 'Recent Debriefs ';
    }

    const renderGroup = key => {
      const g = groups[key];
      const items = g.cards.slice().reverse().map(({card, idx}) => {
        const time = (card.date || '').slice(11) || '·';
        // Phase 4: prefer the new "caught" field; fall back to legacy "subject" for older cards.
        const headline = (card.caught || card.subject || '').slice(0, 110);
        return `<div class="ws-recent-card" data-idx="${idx}">
          <div class="rc-date">${escapeHTML(time)}</div>
          <div class="rc-must">${escapeHTML(headline || '(no caught yet)')}</div>
        </div>`;
      }).join('');
      const labelClass = g.isToday ? 'ws-recent-group-label today' : 'ws-recent-group-label';
      return `<div class="ws-recent-group">
        <div class="${labelClass}">${escapeHTML(g.label)}</div>
        ${items}
      </div>`;
    };

    const drawerEl = document.getElementById('drawer');
    const cockpit = drawerEl && drawerEl.classList.contains('cockpit-active');
    if (cockpit) {
      const todayHTML = groups.today ? renderGroup('today') : '';
      const pastKeys = order.filter(k => k !== 'today');
      const pastCount = pastKeys.reduce((n, k) => n + groups[k].cards.length, 0);
      const pastHTML = pastKeys.map(renderGroup).join('');
      const pastBlock = pastCount > 0
        ? `<details class="db-recent-past"><summary>Past debriefs (${pastCount})</summary>${pastHTML}</details>`
        : '';
      list.innerHTML = (todayHTML || '<div class="ws-recent-empty" style="color:#888;font-size:12px;font-style:italic;padding:6px 0;">No Debrief today yet — start one above.</div>') + pastBlock;
    } else {
      list.innerHTML = order.map(renderGroup).join('');
    }
  }

  function initDebriefWorkshop() { dbEnterResting(); }

  /* ── Comprehend Workshop (Move 2 v0.4 build) ──
     The orientation room. Phases land here:
       2a — placeholder + open-via-workshop wiring.
       2b — "Where you are" snapshot at the top (this file).
       2c — Sidebar + main split with deck walks.
       2d — Product walks with iframe + walk-mode banner.
       2e — Walk logging + polish folds.
     Each render rebuilds the workshop content from scratch (matches
     the renderCourseHexMap pattern; cheap at this scale, no listener
     leaks). */

  // Compact relative-time formatter for the snapshot. Designed for
  // re-immerse-glance reads; not for precise reporting. Returns null
  // for missing input so callers can skip the row.
  function fmtRelativeTime(iso) {
    if (!iso) return null;
    const then = new Date(iso).getTime();
    if (!isFinite(then)) return null;
    const now = Date.now();
    const diff = now - then;
    if (diff < 0) return 'just now';
    const sec = Math.floor(diff / 1000);
    if (sec < 60)        return sec + 's ago';
    const min = Math.floor(sec / 60);
    if (min < 60)        return min + 'm ago';
    const hr = Math.floor(min / 60);
    if (hr < 24)         return hr + 'h ago';
    const day = Math.floor(hr / 24);
    if (day < 7)         return day + 'd ago';
    const wk = Math.floor(day / 7);
    if (wk < 5)          return wk + 'w ago';
    return new Date(iso).toISOString().slice(0, 10);
  }

  /* Walk Studio (Moves 2c-2e). Hardcoded WALKS for v0.1 — migrate to
     JSON when there are 5+ walks. Each entry has:
       id           unique identifier
       title        sidebar label
       kind         'deck' or 'product' (Move 2d adds product walks)
       subtitle?    short blurb under the title
       preview?     hover-tooltip text (Move 2e polish fold)
       deck_href?   for kind:'deck' — iframe src (relative path).
                    MUST be a trusted local path. The iframe loads
                    same-origin without `sandbox`, so an external or
                    untrusted URL would run with full lab privileges.
                    If a future workflow ingests external decks, gate
                    them through a sandbox allowlist before adding here.
       target_route? for kind:'product' — hash route to boot the lab
                     iframe into for the walk's first step
       steps?       for kind:'product' — array of {narrative, target_selector?}
       mutates?     for kind:'product' — true if the walk modifies state
                     (triggers the step-0 mutation warning) */
  const WALKS = []; // populated when product-library walks are defined
  // Active walk + step state. Session-scoped so a refresh resets the
  // walk's progress (per Quenton: progress is session, completion is
  // durable on the leg's comprehend log).
  const COMP_ACTIVE_WALK_KEY = 'product-library-v0.1::comp-active-walk';
  const COMP_WALK_STEP_KEY   = 'product-library-v0.1::comp-walk-step';
  function getActiveWalkId() {
    try { return sessionStorage.getItem(COMP_ACTIVE_WALK_KEY); }
    catch { return null; }
  }
  function setActiveWalkId(id) {
    try {
      if (id) sessionStorage.setItem(COMP_ACTIVE_WALK_KEY, id);
      else sessionStorage.removeItem(COMP_ACTIVE_WALK_KEY);
    } catch {}
  }
  function getWalkStep() {
    try {
      const v = parseInt(sessionStorage.getItem(COMP_WALK_STEP_KEY), 10);
      return Number.isFinite(v) && v >= 0 ? v : 0;
    } catch { return 0; }
  }
  function setWalkStep(n) {
    try { sessionStorage.setItem(COMP_WALK_STEP_KEY, String(Math.max(0, n | 0))); } catch {}
  }
  // Render `**bold**` and `code` chunks in walk narrative as HTML. Plain
  // markdown subset; nothing fancy. escapeHTML runs first so the input
  // is safe before we apply the inline transforms.
  function renderWalkMarkdownInline(text) {
    let s = escapeHTML(text || '');
    // **bold**
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // `code`
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    // newlines → <br>
    s = s.replace(/\n/g, '<br>');
    return s;
  }
  // Build the iframe URL for a product walk. Adds `?walk=1` plus the
  // walk's target_route (if set). target_route is allowlisted to safe
  // query-string characters so a stray `#` or `..` can't break URL
  // parsing or escape the iframe destination.
  function walkIframeSrc(walk) {
    let qs = 'walk=1';
    if (walk.target_route) {
      const safe = walk.target_route.replace(/[^a-zA-Z0-9=&_.%-]/g, '');
      if (safe) qs += '&' + safe;
    }
    return 'product-library-v0.1.html?' + qs;
  }

  // Snapshot collapse state — sessionStorage so a single dogfood
  // session preserves the user's preference but a new browser session
  // starts fresh (snapshot expanded by default — that's the orient case).
  const COMP_SNAP_COLLAPSED_KEY = 'product-library-v0.1::comp-snap-collapsed';
  function isCompSnapCollapsed() {
    try { return sessionStorage.getItem(COMP_SNAP_COLLAPSED_KEY) === '1'; }
    catch { return false; }
  }
  function setCompSnapCollapsed(v) {
    try { sessionStorage.setItem(COMP_SNAP_COLLAPSED_KEY, v ? '1' : '0'); } catch {}
  }

  function initComprehendWorkshop() {
    renderComprehendWorkshop();
  }
  function renderComprehendWorkshop() {
    const snapshot = document.getElementById('comp-snapshot');
    const studio = document.getElementById('comp-walk-studio');
    if (!snapshot || !studio) return;

    // ── "Where you are" snapshot (Move 2b) ──
    // Four rows: leg + course / recent comprehend / time since / last debrief.
    const leg = (typeof findActiveLeg === 'function') ? findActiveLeg() : null;
    const course = (typeof findActiveCourse === 'function') ? findActiveCourse() : null;
    const collapsed = isCompSnapCollapsed();

    const legRow = leg
      ? `<div class="comp-snap-row">
          <span class="comp-snap-label">Active leg</span>
          <span class="comp-snap-val">
            <span class="comp-snap-id">${escapeHTML(leg.id)}</span>
            <span>leg ${leg.leg_number || '?'} of ${COURSE_LEG_COUNT}</span>
            <span class="comp-snap-status">${escapeHTML(leg.status || 'unknown')}</span>
          </span>
        </div>`
      : `<div class="comp-snap-row">
          <span class="comp-snap-label">Active leg</span>
          <span class="comp-snap-val"><span class="comp-snap-empty">No active leg yet — open Frame Workshop and save a card to start one.</span></span>
        </div>`;

    const courseRow = course
      ? `<div class="comp-snap-row">
          <span class="comp-snap-label">Course</span>
          <span class="comp-snap-val">
            <span class="comp-snap-id">${escapeHTML(course.id)}</span>
            <span>${escapeHTML(course.theme || '(no theme yet)')}</span>
          </span>
        </div>`
      : '';

    // Recent comprehend entries: last 3, newest first. Each row
    // expandable (drilldown polish from Move 2e fold-in v0.2).
    const entries = (leg && Array.isArray(leg.comprehend))
      ? leg.comprehend.slice(-3).reverse()
      : [];
    const recentRow = leg
      ? `<div class="comp-snap-row">
          <span class="comp-snap-label">Last 3 acts</span>
          <span class="comp-snap-val">${
            entries.length === 0
              ? '<span class="comp-snap-empty">No comprehend activity on this leg yet.</span>'
              : `<ul class="comp-snap-recent">${entries.map((e, i) => {
                  const p = comprehendEntryParts(e);
                  // Collapsed row shows when + kind chip only — body
                  // reveals on click (drilldown polish). Avoids the
                  // double-render-on-expand issue grepzilla flagged.
                  return `<li class="cc-${p.kind}" data-idx="${i}" role="button" tabindex="0" aria-expanded="false">
                    <span class="comp-snap-when">${escapeHTML(fmtComprehendWhen(e && e.at))}</span>
                    <span class="cc-kind cc-kind-${p.kind}">${escapeHTML(p.label)}</span>
                    <div class="comp-snap-body">${p.bodyHTML}</div>
                  </li>`;
                }).join('')}</ul>`
          }</span>
        </div>`
      : '';

    const lastTouchedAt = leg ? (leg.updatedAt || leg.createdAt) : null;
    const sinceRel = fmtRelativeTime(lastTouchedAt);
    const sinceRow = sinceRel
      ? `<div class="comp-snap-row">
          <span class="comp-snap-label">Last touched</span>
          <span class="comp-snap-val">${escapeHTML(sinceRel)}</span>
        </div>`
      : '';

    // Last Debrief summary if present. Skip the row entirely when no
    // debrief — per Quenton, "no debrief yet" is noise.
    const debriefCard = leg ? findDebriefCardForLeg(leg) : null;
    const debriefRow = debriefCard
      ? `<div class="comp-snap-row">
          <span class="comp-snap-label">Last debrief</span>
          <span class="comp-snap-val">${escapeHTML((debriefCard.caught || '').slice(0, 220) || '(no caught text)')}</span>
        </div>`
      : '';

    snapshot.className = 'comp-snapshot' + (collapsed ? ' collapsed' : '');
    snapshot.innerHTML =
      `<div class="comp-snapshot-header" data-act="snap-toggle">
        ▸ Where you are
        <span class="comp-snap-toggle">▼</span>
      </div>` +
      `<div class="comp-snapshot-body">
        ${legRow}
        ${courseRow}
        ${sinceRow}
        ${recentRow}
        ${debriefRow}
      </div>`;

    // Header toggles collapse state.
    const header = snapshot.querySelector('[data-act="snap-toggle"]');
    if (header) {
      header.addEventListener('click', () => {
        const next = !snapshot.classList.contains('collapsed');
        setCompSnapCollapsed(next);
        snapshot.classList.toggle('collapsed', next);
      });
    }
    // Recent-entry drilldown (polish fold).
    snapshot.querySelectorAll('.comp-snap-recent li').forEach(li => {
      const toggle = () => {
        const next = !li.classList.contains('expanded');
        li.classList.toggle('expanded', next);
        li.setAttribute('aria-expanded', next ? 'true' : 'false');
      };
      li.addEventListener('click', toggle);
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });

    // ── Walk Studio (Move 2c) ──
    renderComprehendStudio(studio);
  }

  function renderComprehendStudio(studio) {
    const activeId = getActiveWalkId();
    const activeWalk = WALKS.find(w => w.id === activeId) || null;
    const decks = WALKS.filter(w => w.kind === 'deck');
    const products = WALKS.filter(w => w.kind === 'product');

    function itemHTML(walk) {
      const isActive = activeWalk && activeWalk.id === walk.id;
      const glyph = walk.kind === 'deck' ? '◆' : '▦';
      const previewHTML = walk.preview
        ? `<div class="comp-studio-item-preview">${escapeHTML(walk.preview)}</div>`
        : '';
      return `<button type="button"
        class="comp-studio-item kind-${walk.kind}${isActive ? ' active' : ''}"
        data-walk="${escapeHTML(walk.id)}"
        title="${escapeHTML(walk.title)}">
        <span class="comp-studio-item-title">
          <span class="comp-studio-item-glyph" aria-hidden="true">${glyph}</span>
          ${escapeHTML(walk.title)}
        </span>
        ${walk.subtitle ? `<span class="comp-studio-item-sub">${escapeHTML(walk.subtitle)}</span>` : ''}
        ${previewHTML}
      </button>`;
    }

    const sidebarHTML =
      `<div class="comp-studio-section-label">Decks (${decks.length})</div>` +
      (decks.length === 0 ? '<div class="comp-snap-empty">No decks yet.</div>' : decks.map(itemHTML).join('')) +
      (products.length > 0
        ? `<div class="comp-studio-section-label">Product walks (${products.length})</div>${products.map(itemHTML).join('')}`
        : '');

    let mainHTML;
    if (!activeWalk) {
      mainHTML =
        '<div class="comp-studio-main-empty">' +
          'Pick a <strong>deck</strong> or <strong>walk</strong> from the sidebar to load it here.<br>' +
          '<span style="opacity:0.7;">Decks open in an embedded reader · product walks layer narrative + a live lab iframe.</span>' +
        '</div>';
    } else if (activeWalk.kind === 'deck') {
      // Deck: iframe loads it directly. Bar shows title + close + open-in-tab.
      mainHTML =
        '<div class="comp-studio-iframe-wrap">' +
          '<div class="comp-studio-iframe-bar">' +
            '<span class="comp-studio-bar-title">' + escapeHTML(activeWalk.title) + '</span>' +
            '<a href="' + escapeHTML(activeWalk.deck_href) + '" target="_blank" rel="noopener" title="Open this deck in a new tab">↗ open</a>' +
            '<a href="#" data-act="walk-close" title="Close this walk">× close</a>' +
          '</div>' +
          // Sandbox the deck iframe with the same allowlist as the
          // product walk iframe. Symmetric pattern; closes the
          // window.top navigation gap if a future deck author tries
          // anything cute.
          '<iframe class="comp-studio-iframe" src="' + escapeHTML(activeWalk.deck_href) + '" title="' + escapeHTML(activeWalk.title) + '" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>' +
        '</div>';
    } else {
      // Product walk: split internal pane (narrative + Back/Next on top,
      // iframe of the lab in walk mode below).
      const steps = Array.isArray(activeWalk.steps) ? activeWalk.steps : [];
      const stepCount = steps.length;
      let stepIdx = Math.min(Math.max(getWalkStep(), 0), Math.max(stepCount - 1, 0));
      const step = steps[stepIdx] || { narrative: '(walk has no steps)' };
      const isFirst = stepIdx === 0;
      const isLast  = stepIdx >= stepCount - 1;
      const stepCounter = stepCount > 0 ? `Step ${stepIdx + 1} of ${stepCount}` : 'Step';
      const warningHTML = step.warn
        ? `<div class="comp-walk-warning"><strong>⚠ Mutation warning:</strong> this walk modifies your active Course\'s state. Open a fresh Course before continuing if you want a sandbox.</div>`
        : '';
      const narrativeBody = renderWalkMarkdownInline(step.narrative || '');
      mainHTML =
        '<div class="comp-studio-iframe-wrap">' +
          '<div class="comp-studio-iframe-bar">' +
            '<span class="comp-studio-bar-title">' + escapeHTML(activeWalk.title) + '</span>' +
            '<a href="#" data-act="walk-close" title="Close this walk">× close</a>' +
          '</div>' +
          '<div class="comp-walk-step">' +
            '<div class="comp-walk-narrative">' +
              '<div class="comp-walk-step-header">' +
                '<span class="comp-walk-step-counter">' + escapeHTML(stepCounter) + '</span>' +
              '</div>' +
              warningHTML +
              '<div class="comp-walk-step-body">' + narrativeBody + '</div>' +
              '<div class="comp-walk-actions">' +
                '<button type="button" data-act="walk-prev" ' + (isFirst ? 'disabled' : '') + '>← Back</button>' +
                (isLast
                  ? '<button type="button" class="primary" data-act="walk-done">Done</button>'
                  : '<button type="button" class="primary" data-act="walk-next">Next →</button>') +
              '</div>' +
            '</div>' +
            // sandbox attribute closes the window.top navigation gap from
            // the inner same-origin frame. allow-same-origin keeps
            // localStorage access (the whole point of a state-mutating walk);
            // allow-scripts keeps the lab interactive; allow-forms keeps
            // any form submissions inside Frame/Debrief working.
            '<iframe class="comp-studio-iframe" src="' + escapeHTML(walkIframeSrc(activeWalk)) + '" title="' + escapeHTML(activeWalk.title) + ' (walk mode)" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>' +
          '</div>' +
        '</div>';
    }

    studio.innerHTML =
      '<div class="comp-studio">' +
        '<div class="comp-studio-header">Walk Studio · ' + WALKS.length + ' available</div>' +
        '<div class="comp-studio-layout">' +
          '<div class="comp-studio-sidebar">' + sidebarHTML + '</div>' +
          '<div class="comp-studio-main">' + mainHTML + '</div>' +
        '</div>' +
      '</div>';

    // Sidebar click → activate walk. Calls logComprehendDeckOpen for
    // decks since iframe-loading doesn't fire the document-level
    // anchor-click handler that DECK_FILE_RE listens for.
    studio.querySelectorAll('.comp-studio-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.walk;
        if (!id) return;
        const walk = WALKS.find(w => w.id === id);
        if (!walk) return;
        if (getActiveWalkId() === id) {
          // Re-clicking the active walk closes it.
          setActiveWalkId(null);
          setWalkStep(0);
        } else {
          setActiveWalkId(id);
          setWalkStep(0); // start fresh
          if (walk.kind === 'deck' && walk.deck_href && typeof logComprehendDeckOpen === 'function') {
            logComprehendDeckOpen(walk.deck_href);
          } else if (walk.kind === 'product') {
            // Move 2e: log walk-start so abandoned walks register as
            // intent. Completion is logged separately via the Done
            // button (see doneBtn handler below).
            logComprehendWalkStart(walk.id);
          }
        }
        renderComprehendStudio(studio);
      });
    });
    // Close button in iframe bar.
    const closeLink = studio.querySelector('[data-act="walk-close"]');
    if (closeLink) {
      closeLink.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveWalkId(null);
        setWalkStep(0);
        renderComprehendStudio(studio);
      });
    }
    // Product walk Back / Next / Done.
    const backBtn = studio.querySelector('[data-act="walk-prev"]');
    if (backBtn) backBtn.addEventListener('click', () => {
      setWalkStep(getWalkStep() - 1);
      renderComprehendStudio(studio);
    });
    const nextBtn = studio.querySelector('[data-act="walk-next"]');
    if (nextBtn) nextBtn.addEventListener('click', () => {
      setWalkStep(getWalkStep() + 1);
      renderComprehendStudio(studio);
    });
    const doneBtn = studio.querySelector('[data-act="walk-done"]');
    if (doneBtn) doneBtn.addEventListener('click', () => {
      // Move 2e: log walk completion to leg.comprehend[]. The walk's
      // active-id state clears after; the entry is durable. Use the
      // 1-indexed step position when Done fires (== full step count
      // today since Done only renders on isLast, but this stays correct
      // if a future walk adds an early-exit Done).
      const id = getActiveWalkId();
      const walk = id ? WALKS.find(w => w.id === id) : null;
      if (walk) {
        const stepsCompleted = getWalkStep() + 1;
        logComprehendWalkComplete(walk.id, stepsCompleted);
      }
      setActiveWalkId(null);
      setWalkStep(0);
      renderComprehendStudio(studio);
    });
  }

  /* Walk start + completion logging (Move 2e). Both append to the
     active leg's comprehend[] as kind:'walk' with a status discriminator
     ('started' or 'completed'). Per Quenton: progress is session,
     completion is durable on the leg. Logging the *start* captures
     intent — abandoned walks show up as evidence the user tried, even
     if they never reached Done. */
  function logComprehendWalkStart(walkId) {
    if (typeof appendComprehendEntry !== 'function') return;
    appendComprehendEntry({
      kind: 'walk',
      walk_id: walkId,
      status: 'started'
    });
  }
  function logComprehendWalkComplete(walkId, stepsCompleted) {
    if (typeof appendComprehendEntry !== 'function') return;
    appendComprehendEntry({
      kind: 'walk',
      walk_id: walkId,
      status: 'completed',
      steps_completed: typeof stepsCompleted === 'number' ? stepsCompleted : 0
    });
  }

  // Wire debrief controls (bound once at load)
  (function wireDebrief() {
    const startBtn = document.getElementById('db-start-btn');
    if (startBtn) startBtn.addEventListener('click', () => dbEnterEditing(null));

    const cancelBtn = document.getElementById('db-cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
      const draft = readDebriefForm();
      // Treat as "has content" if the live draft has anything OR the original
      // card had legacy data the form doesn't expose (so an edit-from-legacy
      // still gets the discard prompt).
      const hasContent = dbCardHasContent(draft) || dbCardHasContent(dbEditingOriginalCard);
      if (hasContent && !confirm('Discard this card? Unsaved changes will be lost.')) return;
      dbEnterResting();
    });

    const backBtn = document.getElementById('db-back-btn');
    if (backBtn) backBtn.addEventListener('click', () => dbEnterResting());

    const editBtn = document.getElementById('db-edit-btn');
    if (editBtn) editBtn.addEventListener('click', () => {
      const cards = loadDebriefCards();
      if (dbEditingOriginalIdx < 0 || !cards[dbEditingOriginalIdx]) return;
      dbEnterEditing(cards[dbEditingOriginalIdx], dbEditingOriginalIdx);
    });

    const deleteBtn = document.getElementById('db-delete-btn');
    if (deleteBtn) deleteBtn.addEventListener('click', () => {
      const cards = loadDebriefCards();
      if (dbEditingOriginalIdx < 0 || !cards[dbEditingOriginalIdx]) return;
      if (!confirm('Delete this debrief card?')) return;
      cards.splice(dbEditingOriginalIdx, 1);
      saveDebriefCards(cards);
      dbEnterResting();
    });

    const recentList = document.getElementById('db-recent-list');
    if (recentList) recentList.addEventListener('click', e => {
      const card = e.target.closest('.ws-recent-card');
      if (!card) return;
      const idx = parseInt(card.dataset.idx, 10);
      if (!Number.isNaN(idx)) dbEnterViewing(idx);
    });

    const saveBtn = document.getElementById('db-save');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      const card = readDebriefForm();
      if (!dbCardHasContent(card)) return;
      const cards = loadDebriefCards();
      if (dbEditingOriginalIdx >= 0 && cards[dbEditingOriginalIdx]) {
        const orig = cards[dbEditingOriginalIdx];
        // Preserve date + savedAt + any legacy fields (subject, framed, actual,
        // diverged, sustain, improve) that the new form no longer edits.
        card.date = orig.date || card.date;
        card.savedAt = orig.savedAt || card.savedAt;
        DB_FIELDS_LEGACY.forEach(f => { if (orig[f] !== undefined) card[f] = orig[f]; });
        cards[dbEditingOriginalIdx] = card;
      } else {
        cards.push(card);
      }
      saveDebriefCards(cards);
      // Phase 4: link the active leg to this Debrief card and write back the
      // changes_to_course outcome. Bumps leg.status to 'debriefed'. Course
      // Header re-renders so the leg's new status shows immediately.
      attachDebriefToLeg(card);
      renderCourseHeader();
      flashDebriefSaved();
      setTimeout(() => dbEnterResting(), 600);
    });

    const clearBtn = document.getElementById('db-clear');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      const draft = readDebriefForm();
      if (dbCardHasContent(draft) && !confirm('Clear all fields?')) return;
      clearDebriefForm();
      setTimeout(() => {
        const first = document.getElementById('db-caught');
        if (first) first.focus();
      }, 30);
    });
  })();

  /* ── Area view ── */
  // Band-1 holding pens are information-storage areas, rendered as a
  // manifest-driven list. Their drawer is a different shape from the
  // Band-2 workshop drawers (Items / Chapter / Experiments). showAreaView
  // dispatches to the right renderer.
  const BAND1_HOLDING_PENS = ['library', 'archive', 'deck-theater', 'strategy'];

  // Display labels for the manifest-driven shelf, per area.
  const HOLDING_PEN_SHELF_NAMES = {
    library:        'Reports',
    'deck-theater': 'Explainers',
    strategy:       'Plans & Source Material',
  };

  // Map lab area.id → manifest slug used to look up
  // canvas-state/<slug>-manifest.json. The lab keeps legacy area IDs
  // (library / archive / deck-theater) per LAB-060's display-vs-
  // identifier split; the slug is the short, stable name.
  //
  // Note: director-desk is intentionally omitted — it has no Band-1
  // holding-pen home yet, so it routes to showWorkshopDrawer (its prior
  // behavior) until the surface gets designed.
  const AREA_TO_MANIFEST_SLUG = {
    library:        'research',
    archive:        'journal',
    'deck-theater': 'explainer',
    strategy:       'strategy',
  };

  // Fetch a manifest from product-library/canvas-state/<slug>-manifest.json.
  // Returns [] if the file is missing or unreachable (e.g., file://
  // protocol with no lab-server.py running).
  async function loadAreaManifest(areaId) {
    const slug = AREA_TO_MANIFEST_SLUG[areaId] || areaId;
    try {
      const r = await fetch(`canvas-state/${slug}-manifest.json`, { cache: 'no-store' });
      if (!r.ok) return [];
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    } catch (_e) {
      return [];
    }
  }

  // HTML escape — used uniformly for all manifest field interpolations.
  // Manifest entries come from local CLI inputs (not untrusted sources)
  // so the threat model is low, but inconsistent escaping is still a
  // footgun (e.g., a `"` in driveUrl could break out of an href attribute,
  // a `<` in format could produce malformed HTML).
  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // URL guard — escHtml prevents attribute breakout but doesn't reject
  // dangerous schemes. A hand-edited manifest with a `javascript:` entry
  // would render as a clickable link that runs script. Whitelist to
  // http(s) and same-origin relative paths. Anything else falls back to '#'.
  function safeUrl(s) {
    if (!s) return '#';
    const trimmed = String(s).trim();
    if (/^(https?:\/\/|\/|#)/i.test(trimmed)) return escHtml(trimmed);
    return '#';
  }

  // Render a single manifest row (date · format · title · summary · tags).
  function renderManifestRow(entry) {
    const title = escHtml(entry.title || '(untitled)');
    const summary = escHtml(entry.summary || '');
    const date = escHtml(entry.date || '');
    const fmt = entry.format ? `<span class="manifest-fmt">[${escHtml(entry.format)}]</span>` : '';
    const tagsHTML = (entry.tags || [])
      .map(t => `<span class="manifest-tag">#${escHtml(t)}</span>`)
      .join(' ');
    // Prefer Drive URL → Drive id → local path → no link. Local-path editions
    // resolve relative to the lab HTML (served from product-library/), so paths
    // stored as "product-library/canvas-state/..." get the product-library/ prefix
    // stripped for the served URL.
    let url = '#';
    if (entry.driveUrl) {
      url = safeUrl(entry.driveUrl);
    } else if (entry.driveId) {
      url = `https://drive.google.com/file/d/${escHtml(entry.driveId)}/view`;
    } else if (entry.path) {
      const rel = entry.path.replace(/^product-library\//, '');
      url = escHtml(rel);
    }
    return `
      <a class="manifest-row" href="${url}" target="_blank" rel="noopener">
        <div class="manifest-row-head">
          <span class="manifest-date">${date}</span>
          ${fmt}
          <span class="manifest-title">${title}</span>
          <span class="manifest-arrow">↗</span>
        </div>
        ${summary ? `<div class="manifest-summary">${summary}</div>` : ''}
        ${tagsHTML ? `<div class="manifest-tags">${tagsHTML}</div>` : ''}
      </a>`;
  }

  // Sort entries by date (string YYYY-MM-DD) descending. Falls back to title.
  function sortManifestByDateDesc(entries) {
    return [...entries].sort((a, b) => {
      const da = a.date || '';
      const db = b.date || '';
      if (da !== db) return db.localeCompare(da);
      return (a.title || '').localeCompare(b.title || '');
    });
  }

  // Hide the workshop-only shelf tiles for Band-1 drawers.
  function setWorkshopShelvesVisible(visible) {
    ['items', 'experiments', 'chapter'].forEach(name => {
      const tile = document.querySelector(`.shelf-tile[data-shelf="${name}"]`);
      if (tile) tile.style.display = visible ? '' : 'none';
    });
  }

  function showAreaView(area) {
    areaView.classList.remove('hidden');
    ddView.classList.remove('visible');

    if (area.id === 'archive') {
      setWorkshopShelvesVisible(false);
      showJournalDrawer(area);
      return;
    }
    if (BAND1_HOLDING_PENS.includes(area.id)) {
      setWorkshopShelvesVisible(false);
      showHoldingPenDrawer(area);
      return;
    }
    setWorkshopShelvesVisible(true);
    showWorkshopDrawer(area);
  }

  // Generic Band-1 holding-pen drawer: single manifest-driven shelf.
  // Used by Research Repository, Explainer Theater, Strategy & Plans.
  // The Daily Journal has its own drawer (three shelves).
  async function showHoldingPenDrawer(area) {
    const infoTip = document.getElementById('drawer-info');
    if (infoTip) infoTip.setAttribute('data-tip', area.description || '');

    const shelfName = HOLDING_PEN_SHELF_NAMES[area.id] || 'Sources';
    const entries = sortManifestByDateDesc(await loadAreaManifest(area.id));

    const srcList = document.getElementById('sources-list');
    const slug = AREA_TO_MANIFEST_SLUG[area.id] || area.id;
    if (entries.length === 0) {
      srcList.innerHTML = `
        <div class="manifest-section-label">${shelfName}</div>
        <div class="manifest-empty">No entries yet.</div>`;
    } else {
      srcList.innerHTML = `
        <div class="manifest-section-label">${shelfName} (${entries.length})</div>
        ${entries.map(renderManifestRow).join('')}`;
    }

    setActiveShelf('sources');
    updateShelfTile('sources', entries.length);
    updateShelfTile('items', 0);
    updateShelfTile('experiments', 0);
    updateShelfTile('chapter', 0);

    const gapsBadge = document.getElementById('shelf-items-gaps');
    if (gapsBadge) gapsBadge.classList.remove('show');
  }

  // The Daily Journal drawer: three shelves (Scratchpad, Decision Log,
  // Editions) read from journal-manifest.json filtered by `shelf`. Plus
  // a collapsible "Pre-Newspaper Notes" toggle for legacy labNotes /
  // decisions / shipped fields preserved in the area JSON.
  async function showJournalDrawer(area) {
    const infoTip = document.getElementById('drawer-info');
    if (infoTip) infoTip.setAttribute('data-tip', area.description || '');

    const all = await loadAreaManifest(area.id);
    const scratchpad  = sortManifestByDateDesc(all.filter(e => e.shelf === 'scratchpad'));
    const decisionLog = sortManifestByDateDesc(all.filter(e => e.shelf === 'decisionLog'));
    const editions    = sortManifestByDateDesc(all.filter(e => !e.shelf || e.shelf === 'edition'));

    const renderShelf = (label, list, hint) => {
      if (list.length === 0) {
        return `
          <div class="manifest-section-label">${label}</div>
          <div class="manifest-empty">${hint}</div>`;
      }
      return `
        <div class="manifest-section-label">${label} (${list.length})</div>
        ${list.map(renderManifestRow).join('')}`;
    };

    // Pre-Newspaper Notes (legacy fields preserved as historical record).
    let legacyHTML = '';
    const hasLegacy = (area.labNotes && area.labNotes.length) ||
                      (area.decisions && area.decisions.length) ||
                      (area.shipped && area.shipped.length);
    if (hasLegacy) {
      legacyHTML += `<details class="legacy-notes"><summary>Pre-Newspaper Notes</summary>`;
      if (area.labNotes && area.labNotes.length) {
        legacyHTML += '<div class="drawer-section-label" style="margin-top:8px;">Lab notes (archive)</div>';
        legacyHTML += area.labNotes.map(n =>
          `<div class="archive-entry"><div class="archive-date">${n.date}</div><div class="archive-text">${n.text}</div></div>`
        ).join('');
      }
      if (area.decisions && area.decisions.length) {
        legacyHTML += '<div class="drawer-section-label" style="margin-top:8px;">Decisions log</div>';
        legacyHTML += area.decisions.map(n =>
          `<div class="archive-entry"><div class="archive-date">${n.date}</div><div class="archive-text">${n.text}</div></div>`
        ).join('');
      }
      if (area.shipped && area.shipped.length) {
        legacyHTML += '<div class="drawer-section-label" style="margin-top:8px;">Shipped</div>';
        legacyHTML += area.shipped.map(s => `<div class="src-item">${s}</div>`).join('');
      }
      legacyHTML += `</details>`;
    }

    const srcList = document.getElementById('sources-list');
    srcList.innerHTML =
      renderShelf('Scratchpad',   scratchpad,  'No entries yet. Use <code>scratchpad-add.py</code> to capture a thought.') +
      renderShelf('Decision Log', decisionLog, 'No decisions logged yet. Use <code>decision-log-add.py</code>.') +
      renderShelf('Editions',     editions,    'No editions yet. End-of-day publish creates one.') +
      legacyHTML;

    setActiveShelf('sources');
    updateShelfTile('sources', scratchpad.length + decisionLog.length + editions.length);
    updateShelfTile('items', 0);
    updateShelfTile('experiments', 0);
    updateShelfTile('chapter', 0);

    const gapsBadge = document.getElementById('shelf-items-gaps');
    if (gapsBadge) gapsBadge.classList.remove('show');
  }

  // Band-2 phase-workshop drawer (Frame, Comprehend, Sync, Push, Debrief,
  // Recover, Director's Desk, Pilot Check Station, etc.). Items / Chapter
  // / Experiments / Sources shelves. Unchanged from prior behavior; only
  // the dispatch point changed.
  function showWorkshopDrawer(area) {
    // Description → moved to (i) tooltip in drawer header
    const infoTip = document.getElementById('drawer-info');
    if (infoTip) infoTip.setAttribute('data-tip', area.description || '');

    // Items + gaps + ghosts integrated into a single list,
    // gaps in slot position, ghosts at end (in situ — not a segregated pile).
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = renderIntegratedItems(area);
    const itemsCount = getAreaItemIds(area.id).length;

    // Sources (uses area.sources or falls back to area.artifacts for legacy data)
    const srcArr = (area.sources && area.sources.length) ? area.sources : (area.artifacts || []);
    const srcList = document.getElementById('sources-list');
    let sourcesCount = srcArr.length;

    // Append research refs (Library) and Archive special content into Sources for visibility
    let extraSrcHTML = '';
    if (area.refs && area.refs.length) {
      sourcesCount += area.refs.length;
      extraSrcHTML += '<div class="drawer-section-label" style="margin-top:8px;">Research refs</div>';
      extraSrcHTML += area.refs.map(r => `<div class="src-item">${r}</div>`).join('');
    }
    if (area.labNotes && area.labNotes.length) {
      sourcesCount += area.labNotes.length;
      extraSrcHTML += '<div class="drawer-section-label" style="margin-top:8px;">Lab notes (archive)</div>';
      extraSrcHTML += area.labNotes.map(n =>
        `<div class="archive-entry"><div class="archive-date">${n.date}</div><div class="archive-text">${n.text}</div></div>`
      ).join('');
    }
    if (area.decisions && area.decisions.length) {
      sourcesCount += area.decisions.length;
      extraSrcHTML += '<div class="drawer-section-label" style="margin-top:8px;">Decisions log</div>';
      extraSrcHTML += area.decisions.map(n =>
        `<div class="archive-entry"><div class="archive-date">${n.date}</div><div class="archive-text">${n.text}</div></div>`
      ).join('');
    }
    if (area.shipped && area.shipped.length) {
      sourcesCount += area.shipped.length;
      extraSrcHTML += '<div class="drawer-section-label" style="margin-top:8px;">Shipped</div>';
      extraSrcHTML += area.shipped.map(s => `<div class="src-item">${s}</div>`).join('');
    }

    if (srcArr.length === 0 && !extraSrcHTML) {
      srcList.innerHTML = '<div style="color:#888;font-size:12px;font-style:italic;">No sources.</div>';
    } else {
      srcList.innerHTML =
        srcArr.map(a => `<a class="artifact-link" href="${a.href}" target="_blank" rel="noopener">${a.label}</a>`).join('')
        + extraSrcHTML;
    }

    // Render Experiments and Chapter for this area
    renderExperiments(area.id);
    renderChunks(area.id);
    const expCount = getExperiments(area.id).length;
    const chunkCount = getChunks(area.id).length;

    // Reset shelf to closed; populate counts
    setActiveShelf(null);
    updateShelfTile('items',       itemsCount);
    updateShelfTile('experiments', expCount);
    updateShelfTile('chapter',     chunkCount);
    updateShelfTile('sources',     sourcesCount);

    // Gaps & Ghosts indicator on the To Do shelf-tile + auto-open if any
    const gapCount = getAreaGaps(area.id).length + getAreaGhosts(area.id).length;
    const gapsBadge = document.getElementById('shelf-items-gaps');
    if (gapsBadge) {
      if (gapCount > 0) {
        gapsBadge.textContent = '◌' + gapCount;
        gapsBadge.classList.add('show');
      } else {
        gapsBadge.classList.remove('show');
      }
    }
    // Auto-expand the To Do shelf when there are gaps/ghosts — but only for bench rooms.
    // Cockpit rooms stay collapsed; the gap badge is enough signal.
    const cockpitDrawer = drawer.classList.contains('cockpit-active');
    if (gapCount > 0 && !cockpitDrawer) setActiveShelf('items');

    // Item card click → drilldown; status badge click → cycle
    itemsList.querySelectorAll('.item-card').forEach(card => {
      const itemId = card.getAttribute('data-item-id');

      // Status badge: cycle on click (don't propagate to card)
      const badge = card.querySelector('[data-status-id]');
      if (badge) {
        badge.addEventListener('click', e => {
          e.stopPropagation();
          const newStatus = cycleStatus(itemId);
          badge.textContent = newStatus;
          badge.className = `badge badge-${newStatus.replace(/ /g,'-')}`;
          renderFloorBadges();
        });
      }

      // Card click → drilldown
      card.addEventListener('click', () => openDrilldown(itemId));
    });
  }

  /* ── Drilldown view ── */
  function openDrilldown(itemId) {
    const item = baseline.items[itemId] || (shadow.newItems && shadow.newItems[itemId]);
    if (!item) return;
    currentItemId = itemId;

    areaView.classList.add('hidden');
    ddView.classList.add('visible');

    document.getElementById('dd-id').textContent    = item.id;
    document.getElementById('dd-title').textContent = item.title;
    document.getElementById('dd-full').textContent  = item.full || item.brief || '';

    const status = getItemStatus(itemId);
    document.getElementById('dd-badges').innerHTML = `
      <span class="badge badge-${status.replace(/ /g,'-')}" id="dd-status-badge">${status}</span>
      <span class="badge badge-${item.priority.toLowerCase()}">${item.priority}</span>
    `;

    document.getElementById('dd-cycle-btn').onclick = () => {
      const newStatus = cycleStatus(itemId);
      const sb = document.getElementById('dd-status-badge');
      if (sb) {
        sb.textContent = newStatus;
        sb.className = `badge badge-${newStatus.replace(/ /g,'-')}`;
      }
      renderFloorBadges();
      // also refresh the area view badges (will refresh on back)
    };
  }

  /* ── Back button ── */
  document.getElementById('back-btn').addEventListener('click', () => {
    const area = baseline.areas.find(a => a.id === currentAreaId);
    if (area) showAreaView(area);
    currentItemId = null;
  });

  /* ── Drawer close targets ── */
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  /* ── Floor area clicks ──
     Stone-button tiles (data-tile-pulse="off") get a head-start press: .active goes on
     immediately so the depression begins, and the drawer opens ~220ms later. The tray
     slides in as the stone is settling into its socket. Plain tiles keep instant open.
     Guarded with a single timer so rapid clicks across stone tiles can't open two
     drawers in a row — the latest click wins. */
  let stonePressTimer = null;
  document.querySelectorAll('.area[data-area]').forEach(el => {
    el.addEventListener('click', () => {
      const areaId = el.getAttribute('data-area');
      if (el.getAttribute('data-tile-pulse') === 'off') {
        if (stonePressTimer) clearTimeout(stonePressTimer);
        document.querySelectorAll('.area').forEach(a => a.classList.remove('active'));
        el.classList.add('active');
        stonePressTimer = setTimeout(() => {
          stonePressTimer = null;
          openDrawer(areaId);
        }, 220);
      } else {
        if (stonePressTimer) { clearTimeout(stonePressTimer); stonePressTimer = null; }
        openDrawer(areaId);
      }
    });
  });

  /* ── URL hash routing ── */
  function handleHash() {
    const hash = location.hash;
    const match = hash.match(/^#area=(.+)$/);
    if (match) openDrawer(match[1]);
  }
  window.addEventListener('hashchange', handleHash);
  handleHash(); // on load

  /* ──────────────────────────────────────────────────────────────
     View toggle (Floor / Information Station)
     ────────────────────────────────────────────────────────────── */

  const VIEW_KEY = STORAGE_KEY + '::active-view';
  const VIEWS = ['floor', 'by-status'];
  let activeView = 'floor';

  function loadActiveView() {
    // Move 2d: when the lab loads inside a Walk Studio iframe, the
    // walk's target_route can override the user's persisted active
    // view via the `?view=` query param. URL > localStorage > default.
    try {
      const params = new URLSearchParams(location.search);
      const urlView = params.get('view');
      if (urlView && VIEWS.includes(urlView)) return urlView;
    } catch {}
    try {
      const v = localStorage.getItem(VIEW_KEY);
      return VIEWS.includes(v) ? v : 'floor';
    } catch { return 'floor'; }
  }
  function saveActiveView(v) {
    // Skip the write when running inside a Walk Studio iframe (?walk=1).
    // Iframe and parent share localStorage; without this guard, the
    // user's tab navigation inside the walk would silently rewrite the
    // parent's persisted view and cause a surprising view-jump after
    // the walk closes.
    try {
      if (new URLSearchParams(location.search).get('walk') === '1') return;
    } catch {}
    try { localStorage.setItem(VIEW_KEY, v); } catch {}
  }

  // Map item.area (which holds an area NAME or area id) to area record.
  // The data uses `area` strings that match either area.id or area.name; resolve both.
  function resolveAreaForItem(item) {
    if (!item) return null;
    const a = item.area;
    if (!a) return null;
    return baseline.areas.find(ar => ar.id === a)
        || baseline.areas.find(ar => ar.name === a)
        || baseline.areas.find(ar => (ar.items || []).includes(item.id))
        || null;
  }

  function allItemsArray() {
    const baseIts = Object.values(baseline.items);
    const newIts = Object.values(shadow.newItems || {});
    return baseIts.concat(newIts).map(it => {
      const area = resolveAreaForItem(it);
      return {
        id: it.id,
        title: it.title,
        brief: it.brief,
        priority: it.priority || 'P2',
        status: getItemStatus(it.id),
        lastTouched: getItemLastTouched(it.id),
        areaId: area ? area.id : null,
        areaName: area ? area.name : (it.area || '—'),
        isNew: !!it.isNew,
      };
    });
  }

  function statusRank(s) {
    // Visual rank within a priority section: in-progress first, archived last.
    return ({ 'in-progress': 0, 'drafted': 1, 'backlog': 2, 'live': 3, 'archived': 4 })[s] ?? 5;
  }
  function priorityRank(p) {
    return ({ 'P0': 0, 'P1': 1, 'P2': 2 })[p] ?? 3;
  }

  function setView(name) {
    if (!VIEWS.includes(name)) name = 'floor';
    activeView = name;
    saveActiveView(name);

    document.querySelectorAll('.vt-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.view === name);
    });

    const isAlt = name !== 'floor';
    document.body.classList.toggle('alt-view-active', isAlt);
    document.getElementById('by-status-view').classList.toggle('visible', name === 'by-status');

    renderActiveAltView();
  }

  function renderActiveAltView() {
    if (activeView === 'by-status')  renderByStatusView();
  }

  /* ── Area visuals: pull each area's icon + accent from the floor itself,
        so an item carries the visual identity of the room it lives in. ── */
  let AREA_VISUALS = {};
  function buildAreaVisuals() {
    const map = {};
    document.querySelectorAll('#lab-floor .area[data-area], #phase-rail .area[data-area]').forEach(el => {
      const id = el.dataset.area;
      const accent = el.dataset.accent || 'dark';
      const sceneEl = el.querySelector('.area-scene');
      const icon = sceneEl ? (sceneEl.textContent || '').trim() : '';
      map[id] = { icon, accent };
    });
    AREA_VISUALS = map;
  }
  function visualFor(areaId) {
    return AREA_VISUALS[areaId] || { icon: '·', accent: 'dark' };
  }

  /* ──────────────────────────────────────────────────────────────
     P0c — Gaps & Ghosts
     ─ Gaps:   declared expected slots that no item fulfills.
     ─ Ghosts: referenced-but-not-yet-captured items (seeded
                + auto-detected from unresolved LAB-### refs).
     ────────────────────────────────────────────────────────────── */

  // Each turn-cycle phase area declares the canonical slots it expects.
  // Ritual and meta areas have no declared slots (they're not on the
  // form / chapter / practice scaffold).
  // A slot is "fulfilled" if the area has any item whose title
  // contains the slot kind word (case-insensitive, word boundary).
  const PHASE_SLOTS = {
    'frame-workshop':     [
      { kind: 'form',     label: 'Frame form' },
      { kind: 'chapter',  label: 'Frame chapter' },
      { kind: 'practice', label: 'Frame practice' },
    ],
    'comprehend-station': [
      { kind: 'form',     label: 'Comprehend form' },
      { kind: 'chapter',  label: 'Comprehend chapter' },
      { kind: 'practice', label: 'Comprehend practice' },
    ],
    'sync-floor': [
      { kind: 'form',     label: 'Sync form' },
      { kind: 'chapter',  label: 'Sync chapter' },
      { kind: 'practice', label: 'Sync practice' },
    ],
    'push-bay': [
      { kind: 'form',     label: 'Produce form' },
      { kind: 'chapter',  label: 'Produce chapter' },
      { kind: 'practice', label: 'Produce practice' },
    ],
    'debrief-booth': [
      { kind: 'form',     label: 'Debrief form' },
      { kind: 'chapter',  label: 'Debrief chapter' },
      { kind: 'practice', label: 'Debrief practice' },
    ],
  };

  // Seeded ghosts — referenced concepts that aren't yet LAB-### items.
  // Demonstrates the pattern; auto-detection adds anything else.
  const SEED_GHOSTS = {
    'frame-workshop': [
      { name: 'wildcat-frame-pattern', source: 'lab note 2026-04-30' },
    ],
    'sync-floor': [
      { name: 'first-week sync ritual', source: 'sync chapter outline' },
    ],
  };

  function getAnyItem(id) {
    return baseline.items[id] || (shadow.newItems && shadow.newItems[id]) || null;
  }

  function getAreaItemIds(areaId) {
    const area = baseline.areas.find(a => a.id === areaId);
    const baseIds = (area && area.items) ? area.items.slice() : [];
    const newIds = Object.keys(shadow.newItems || {}).filter(id => {
      const it = shadow.newItems[id];
      return it && it.area === areaId;
    });
    return baseIds.concat(newIds);
  }

  function getAreaGaps(areaId) {
    const slots = PHASE_SLOTS[areaId] || [];
    if (slots.length === 0) return [];
    const ids = getAreaItemIds(areaId);
    const titles = ids.map(id => {
      const it = getAnyItem(id);
      return (it && it.title) ? it.title.toLowerCase() : '';
    });
    return slots.filter(slot => {
      const re = new RegExp('\\b' + slot.kind + '\\b', 'i');
      return !titles.some(t => re.test(t));
    });
  }

  function getAreaGhosts(areaId) {
    const seeded = SEED_GHOSTS[areaId] || [];
    const resolved = (shadow.resolvedGhosts && shadow.resolvedGhosts[areaId]) || [];
    const fromSeed = seeded.filter(g => !resolved.includes(g.name));

    // Auto-detect: scan area's own text for LAB-### refs that don't resolve.
    const auto = [];
    const area = baseline.areas.find(a => a.id === areaId);
    if (area) {
      const texts = [];
      (area.notes || []).forEach(n => texts.push(typeof n === 'string' ? n : (n && n.text) || ''));
      (area.labNotes || []).forEach(n => texts.push((n && n.text) || ''));
      (area.decisions || []).forEach(n => texts.push((n && n.text) || ''));
      texts.push(area.description || '');
      // Also scan items belonging to this area for cross-references
      getAreaItemIds(areaId).forEach(id => {
        const it = getAnyItem(id);
        if (it) { texts.push(it.brief || ''); texts.push(it.full || ''); }
      });
      const haystack = texts.join('\n');
      const found = haystack.match(/\bLAB-\d{3}\b/g) || [];
      const seen = new Set();
      found.forEach(id => {
        if (seen.has(id)) return;
        seen.add(id);
        if (!getAnyItem(id) && !resolved.includes(id)) {
          auto.push({ name: id, source: 'unresolved reference' });
        }
      });
    }
    return fromSeed.concat(auto);
  }

  function nextLabId() {
    const ids = Object.keys(baseline.items).concat(Object.keys(shadow.newItems || {}));
    let max = 0;
    ids.forEach(id => {
      const m = id.match(/^LAB-(\d+)$/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return 'LAB-' + String(max + 1).padStart(3, '0');
  }

  function promoteToItem(areaId, opts) {
    const id = nextLabId();
    const newItem = {
      id,
      title: opts.title,
      status: 'backlog',
      priority: opts.priority || 'P2',
      area: areaId,
      brief: opts.brief || '',
      full: opts.full || '',
      isNew: true,
    };
    if (!shadow.newItems) shadow.newItems = {};
    shadow.newItems[id] = newItem;
    if (!shadow.items) shadow.items = {};
    shadow.items[id] = { status: 'backlog', lastTouched: new Date().toISOString() };
    if (opts.resolveGhostName) {
      if (!shadow.resolvedGhosts) shadow.resolvedGhosts = {};
      if (!shadow.resolvedGhosts[areaId]) shadow.resolvedGhosts[areaId] = [];
      shadow.resolvedGhosts[areaId].push(opts.resolveGhostName);
    }
    saveState(shadow);
    // Rebuild caches
    if (typeof buildSearchIndex === 'function') buildSearchIndex();
    return id;
  }

  function inlineGapCardHTML(slot, areaId) {
    return `<div class="gap-card" data-type="gap" data-area="${areaId}" data-kind="${slot.kind}" data-label="${escapeHTML(slot.label)}">
      <span class="gc-glyph">◌</span>
      <span class="gc-text">
        <span class="gc-name">${escapeHTML(slot.label + ' v1')}</span>
        <span class="gc-source">expected slot · not yet</span>
      </span>
      <span class="gc-kind">gap</span>
      <span class="gc-promote">promote ▸</span>
    </div>`;
  }

  function inlineGhostCardHTML(ghost, areaId) {
    return `<div class="gap-card" data-type="ghost" data-area="${areaId}" data-name="${escapeHTML(ghost.name)}" data-source="${escapeHTML(ghost.source || '')}">
      <span class="gc-glyph">◌</span>
      <span class="gc-text">
        <span class="gc-name">${escapeHTML(ghost.name)}</span>
        <span class="gc-source">${escapeHTML(ghost.source || 'referenced, not captured')}</span>
      </span>
      <span class="gc-kind">ghost</span>
      <span class="gc-promote">promote ▸</span>
    </div>`;
  }

  function realItemCardHTML(item) {
    const status = getItemStatus(item.id);
    const isNew = !!item.isNew;
    const newFlag = isNew ? ' <span style="font-family:var(--font-px);font-size:9px;color:var(--accent);letter-spacing:1px;">· NEW</span>' : '';
    return `<div class="item-card${isNew ? ' is-new' : ''}" data-item-id="${item.id}">
      <div class="item-card-header">
        <span class="item-id">${item.id}</span>
        <span class="item-title">${escapeHTML(item.title)}${newFlag}</span>
      </div>
      <div class="badges">
        <span class="badge badge-${status.replace(/ /g,'-')}" data-status-id="${item.id}">${status}</span>
        <span class="badge badge-${item.priority.toLowerCase()}">${item.priority}</span>
      </div>
      ${item.brief ? `<div class="item-brief">${escapeHTML(item.brief)}</div>` : ''}
    </div>`;
  }

  // Build the integrated items list — real items + gaps in slot position + ghosts at end.
  // Stardew/Obra Dinn pattern: empty slots live alongside the items, not in a segregated bin.
  function renderIntegratedItems(area) {
    const ids = getAreaItemIds(area.id);
    const items = ids.map(id => baseline.items[id] || (shadow.newItems && shadow.newItems[id])).filter(Boolean);
    const slots = PHASE_SLOTS[area.id] || [];
    const ghosts = getAreaGhosts(area.id);

    if (items.length === 0 && slots.length === 0 && ghosts.length === 0) {
      return '<div style="color:#888;font-size:12px;font-style:italic;">No items assigned.</div>';
    }

    let html = '';

    if (slots.length > 0) {
      // Phase area: group items by slot kind; empty slot becomes inline gap.
      const claimed = new Set();
      slots.forEach(slot => {
        const re = new RegExp('\\b' + slot.kind + '\\b', 'i');
        const matched = items.filter(it => {
          if (claimed.has(it.id)) return false;
          if (re.test(it.title)) { claimed.add(it.id); return true; }
          return false;
        });
        html += `<div class="items-slot-h">${escapeHTML(slot.kind)}</div>`;
        if (matched.length > 0) {
          matched.forEach(it => { html += realItemCardHTML(it); });
        } else {
          html += inlineGapCardHTML(slot, area.id);
        }
      });
      const otherItems = items.filter(it => !claimed.has(it.id));
      if (otherItems.length > 0) {
        html += `<div class="items-slot-h">other</div>`;
        otherItems.forEach(it => { html += realItemCardHTML(it); });
      }
    } else {
      // Non-phase area: items in given order.
      items.forEach(it => { html += realItemCardHTML(it); });
    }

    // Ghosts at the end — they describe references, not structural slots.
    if (ghosts.length > 0) {
      html += `<div class="items-slot-h items-slot-h-ghosts">↳ referenced, not yet captured</div>`;
      ghosts.forEach(g => { html += inlineGhostCardHTML(g, area.id); });
    }

    return html;
  }

  /* Delegated promote handler — listens on items-list (where gaps now live). */
  function wireGapsHandlers() {
    document.getElementById('items-list').addEventListener('click', (e) => {
      const card = e.target.closest('.gap-card');
      if (!card) return;
      const areaId = card.dataset.area;
      const type = card.dataset.type;
      let newId;
      if (type === 'gap') {
        newId = promoteToItem(areaId, {
          title: card.dataset.label + ' v1',
          priority: 'P1',
          brief: '(promoted from gap — declared expected slot)',
        });
      } else if (type === 'ghost') {
        newId = promoteToItem(areaId, {
          title: card.dataset.name,
          priority: 'P2',
          brief: '(promoted from ghost — ' + (card.dataset.source || 'unknown source') + ')',
          resolveGhostName: card.dataset.name,
        });
      }
      if (!newId) return;
      const area = baseline.areas.find(a => a.id === areaId);
      if (area) showAreaView(area);
      renderFloorBadges();
      if (typeof renderActiveAltView === 'function') renderActiveAltView();
    });
  }

  const STATUS_LABEL = {
    'backlog':     'backlog',
    'in-progress': 'in progress',
    'drafted':     'drafted',
    'live':        'live',
    'archived':    'archived',
  };
  const STATUS_GLYPH = {
    'backlog':     '📥',
    'in-progress': '⚙️',
    'drafted':     '✏️',
    'live':        '✅',
    'archived':    '📦',
  };

  /* ── Shared: tile markup ── */
  function tileHTML(it, opts) {
    opts = opts || {};
    const v = visualFor(it.areaId);
    const archived = it.status === 'archived';
    const showStat = opts.showStat !== false;
    const showPri  = opts.showPri  !== false;
    const timeStamp = opts.timeStamp || '';
    const classes = ['lab-tile'];
    if (archived) classes.push('archived');
    if (timeStamp) classes.push('has-time');
    if (it.isNew)  classes.push('is-new');

    return `<div class="${classes.join(' ')}" data-item="${it.id}" data-accent="${v.accent}" title="${escapeHTML(it.brief || '')}">
      ${timeStamp ? `<div class="lt-time-stamp">${escapeHTML(timeStamp)}</div>` : ''}
      <div class="lt-head">
        <span class="lt-icon">${v.icon || '·'}</span>
        ${showPri ? `<span class="lt-pri ${it.priority}">${it.priority}</span>` : ''}
      </div>
      <div class="lt-id">${escapeHTML(it.id)}</div>
      <div class="lt-title">${escapeHTML(it.title)}</div>
      <div class="lt-foot">
        <span class="lt-area">${escapeHTML(it.areaName)}</span>
        ${showStat ? `<span class="lt-stat" data-s="${it.status}">
          <span class="lt-stat-dot"></span>${escapeHTML(STATUS_LABEL[it.status] || it.status)}
        </span>` : ''}
      </div>
    </div>`;
  }

  /* ── Priority view ── three different visual modes:
        P0 = Marquee, P1 = Bench, P2 = Shelf */
  const PRI_LABEL = {
    'P0': 'Do next',
    'P1': 'On the bench',
    'P2': 'Later',
  };

  function isActiveStatus(s) { return s === 'in-progress' || s === 'drafted'; }

  // Marquee tile (P0): bigger, brief visible, urgent rail when active
  function marqueeTileHTML(it) {
    const v = visualFor(it.areaId);
    const archived = it.status === 'archived';
    const active = isActiveStatus(it.status);
    const classes = ['lab-tile'];
    if (archived) classes.push('archived');
    if (active)   classes.push('is-active');
    if (it.isNew) classes.push('is-new');
    return `<div class="${classes.join(' ')}" data-item="${it.id}" data-accent="${v.accent}" title="${escapeHTML(it.brief || '')}">
      <div class="lt-head">
        <span class="lt-icon">${v.icon || '·'}</span>
        <span class="lt-pri ${it.priority}">${it.priority}</span>
      </div>
      <div class="lt-id">${escapeHTML(it.id)}</div>
      <div class="lt-title">${escapeHTML(it.title)}</div>
      ${it.brief ? `<div class="lt-brief">${escapeHTML(it.brief)}</div>` : ''}
      <div class="lt-foot">
        <span class="lt-area">${escapeHTML(it.areaName)}</span>
        <span class="lt-stat" data-s="${it.status}">
          <span class="lt-stat-dot"></span>${escapeHTML(STATUS_LABEL[it.status] || it.status)}
        </span>
      </div>
    </div>`;
  }

  // Bench tile (P1): standard tile, but highlight active items
  function benchTileHTML(it) {
    const v = visualFor(it.areaId);
    const archived = it.status === 'archived';
    const active = isActiveStatus(it.status);
    const classes = ['lab-tile'];
    if (archived) classes.push('archived');
    if (active)   classes.push('is-active');
    if (it.isNew) classes.push('is-new');
    return `<div class="${classes.join(' ')}" data-item="${it.id}" data-accent="${v.accent}" title="${escapeHTML(it.brief || '')}">
      <div class="lt-head">
        <span class="lt-icon">${v.icon || '·'}</span>
        <span class="lt-pri ${it.priority}">${it.priority}</span>
      </div>
      <div class="lt-id">${escapeHTML(it.id)}</div>
      <div class="lt-title">${escapeHTML(it.title)}</div>
      <div class="lt-foot">
        <span class="lt-area">${escapeHTML(it.areaName)}</span>
        <span class="lt-stat" data-s="${it.status}">
          <span class="lt-stat-dot"></span>${escapeHTML(STATUS_LABEL[it.status] || it.status)}
        </span>
      </div>
    </div>`;
  }

  // Shelf row (P2): single-line, dense
  function shelfRowHTML(it) {
    const v = visualFor(it.areaId);
    const archived = it.status === 'archived';
    const active = isActiveStatus(it.status);
    const classes = ['pr-shelf-row'];
    if (archived) classes.push('archived');
    if (active)   classes.push('is-active');
    return `<div class="${classes.join(' ')}" data-item="${it.id}" data-accent="${v.accent}" title="${escapeHTML(it.brief || '')}">
      <span class="pss-icon">${v.icon || '·'}</span>
      <span class="pss-id">${escapeHTML(it.id)}</span>
      <span class="pss-title">${escapeHTML(it.title)}</span>
      <span class="pss-stat-glyph" title="${escapeHTML(STATUS_LABEL[it.status] || it.status)}">${STATUS_GLYPH[it.status] || '·'}</span>
      <span class="pss-area">${escapeHTML(it.areaName)}</span>
    </div>`;
  }

  /* ── Course view (planning surface for the 7-leg arc) ──
     Form fields: theme + target_outcome above the canvas; bail_conditions
     below it (you can't honestly name bail until you've laid out the course).
     The Build canvas itself replaces the old frontier picker — placement
     IS scope declaration. Auto-loads the active week's course (or drafts
     one). Per-leg Frame picks from whatever's on the canvas. */
  let courseDraft = null; // in-memory edit buffer; flushed on save

  function getOrInitCourseDraft() {
    if (courseDraft) return courseDraft;
    const existing = findActiveCourse();
    courseDraft = existing ? JSON.parse(JSON.stringify(existing)) : newCourseDraft();
    // Slice 1 migration: legacy courses have items in `frontier` but no
    // build_positions for them. Stage those items into row 0 so the user
    // sees their planned scope on the new canvas. Idempotent: skips items
    // already placed; bails when staging row is full (overflow stays in
    // frontier, which getActiveCourseScopeSet() still reads as fallback).
    migrateFrontierToStaging(courseDraft);
    return courseDraft;
  }

  // Migration helper. Mutates the course in place and persists if anything
  // changed. Safe to call repeatedly — no-op once frontier is empty or
  // staging row is full.
  function migrateFrontierToStaging(course) {
    if (!course || !Array.isArray(course.frontier) || course.frontier.length === 0) return;
    course.build_positions = course.build_positions || {};
    const placedIds = new Set(Object.keys(course.build_positions));
    const stagingOccupied = new Set();
    Object.values(course.build_positions).forEach(p => {
      if (p && p.row === BC_STAGING_ROW) stagingOccupied.add(p.col);
    });
    const stagedThisRun = [];
    for (const id of course.frontier) {
      if (placedIds.has(id)) continue; // already on the canvas somewhere
      let placedHere = false;
      for (let col = 0; col < BC_COLS; col++) {
        if (!stagingOccupied.has(col)) {
          course.build_positions[id] = { row: BC_STAGING_ROW, col };
          stagingOccupied.add(col);
          stagedThisRun.push(id);
          placedHere = true;
          break;
        }
      }
      if (!placedHere) break; // staging row full — leave the rest in frontier
    }
    if (stagedThisRun.length > 0) {
      const stagedSet = new Set(stagedThisRun);
      course.frontier = course.frontier.filter(id => !stagedSet.has(id));
      upsertCourse(course);
    }
  }

  function renderCourseView() {
    const c = getOrInitCourseDraft();
    const body = document.getElementById('course-body');
    if (!body) return;
    const created = c.createdAt ? c.createdAt.slice(0, 10) : '—';
    const updated = c.updatedAt ? c.updatedAt.slice(0, 10) : '—';
    const legCount = (c.legs || []).length;
    body.innerHTML = `
      <div class="course-card">
        <div class="course-header">
          <span class="course-id">${escapeHTML(c.id)}</span>
          <span class="course-status">${escapeHTML(c.status || 'planning')}</span>
        </div>
        <div class="course-field">
          <label for="course-theme">Theme <span class="course-hint">one line — what this week is for</span></label>
          <input id="course-theme" type="text" value="${escapeHTML(c.theme || '')}" placeholder="e.g., Land the rogaine spine in the lab" />
        </div>
        <div class="course-field">
          <label for="course-target">Target outcome <span class="course-hint">what the map looks like different by leg 7</span></label>
          <textarea id="course-target" placeholder="e.g., Course tier shipped, Hex Map v0.1 read-only, on-demand Comprehend prototype dogfooded once">${escapeHTML(c.target_outcome || '')}</textarea>
        </div>
        <p class="course-canvas-hint">Lay out the course on the canvas below. Search the drawer, take items in hand, snap them onto the staging row (S) or the working board (A–G). Placement = scope.</p>
      </div>
    `;
    renderCourseHexMap();
    renderCourseFinalize(c, created, updated, legCount);
    renderCourseComprehend();
  }

  // The bail-conditions field + Save Course button render below the canvas:
  // bail can't be honestly named until the course is laid out, and Save is
  // ceremonial commitment to playing the course as drawn. Slice 6: first
  // Save with a complete form transitions the course from 'planning' to
  // 'in-progress' (the active week's game). Subsequent saves just update.
  function renderCourseFinalize(c, created, updated, legCount) {
    const wrap = document.getElementById('course-finalize');
    if (!wrap) return;
    const isActive = c.status && c.status !== 'planning';
    const saveLabel = isActive ? 'Update Course' : 'Activate Course';
    const activeStrip = isActive && c.activated_at
      ? `<span class="course-active-since">Active since ${escapeHTML(c.activated_at.slice(0, 10))}</span>`
      : '';
    wrap.innerHTML = `
      <div class="course-card course-card-finalize">
        <div class="course-field">
          <label for="course-bail">Bail conditions <span class="course-hint">when do we abandon this Course?</span></label>
          <textarea id="course-bail" placeholder="e.g., If Hex Map proves unreadable after one dogfood, fall back to an Information Station-style Course view.">${escapeHTML(c.bail_conditions || '')}</textarea>
        </div>
        <div class="course-actions">
          <button type="button" id="course-save" class="ff-btn primary">${escapeHTML(saveLabel)}</button>
          <span class="ff-saved" id="course-saved">✓ saved</span>
          <span class="course-save-error" id="course-save-error" hidden></span>
          ${activeStrip}
        </div>
        <div class="course-meta">
          Legs: ${legCount} of ${COURSE_LEG_COUNT} · Created ${escapeHTML(created)} · Updated ${escapeHTML(updated)}
        </div>
      </div>
    `;
  }

  /* ── Hex Map v0.3 (Course view) ──
     Concentric rings carry priority (P0 center → P1 mid → P2 outer).
     Color carries biome (area). Luminosity carries relevance. Motion
     carries attention. Hover reveals genus:species ("Frame Workshop:
     chapter draft"). Per the author's "make a real map" direction.

     Color palette: Okabe-Ito 8-color qualitative scheme. Designed to
     be distinguishable to all common color-vision profiles (protan-,
     deutan-, tritanopia). Each accent in the lab data maps to one
     Okabe-Ito hue; legend below the map shows the binding. */
  const HEX_ACCENT_FILL = {
    blue:   '#0072B2',  // Okabe-Ito blue
    amber:  '#E69F00',  // Okabe-Ito orange (warm yellow)
    green:  '#009E73',  // Okabe-Ito bluish green
    orange: '#D55E00',  // Okabe-Ito vermillion
    teal:   '#56B4E9',  // Okabe-Ito sky blue
    tan:    '#CC79A7',  // Okabe-Ito reddish purple
    warm:   '#F0E442',  // Okabe-Ito yellow
    dark:   '#888888',  // neutral gray (Okabe-Ito uses black; lighter for our dark bg)
    // Fallbacks for legacy accent keys not currently used by any area.
    // PALETTE COLLISION RISK: orange + red both map to vermillion (#D55E00),
    // and tan + purple both map to reddish purple (#CC79A7). If a future area
    // uses `red` or `purple` as its accent alongside `orange` or `tan`, the
    // legend will show duplicate colors. Audit area accents before adding new
    // ones; if a real conflict appears, remap these to a non-Okabe-Ito hue
    // (or pick one to retire). No conflict in current data (only blue, amber,
    // green, dark, tan, warm, orange, teal are in use).
    red:    '#D55E00',  // collapse to vermillion
    purple: '#CC79A7'   // collapse to reddish purple
  };
  function hexPolygonPoints(cx, cy, s) {
    // Flat-top hex centered at (cx, cy) with side length s. Six vertices.
    const h = (Math.sqrt(3) / 2) * s;
    return [
      [cx + s,     cy        ],
      [cx + s / 2, cy - h    ],
      [cx - s / 2, cy - h    ],
      [cx - s,     cy        ],
      [cx - s / 2, cy + h    ],
      [cx + s / 2, cy + h    ]
    ].map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
  }

  // Returns the set of LAB item IDs that are in the active leg's Frame
  // card's must[] (the leg's working set). Used by the Hex Map to
  // apply the .active and .breathing classes on those hexes.
  function getActiveLegWorkingSet() {
    const set = new Set();
    if (typeof findActiveLeg !== 'function') return set;
    const leg = findActiveLeg();
    if (!leg) return set;
    const card = (typeof findFrameCardForLeg === 'function') ? findFrameCardForLeg(leg) : null;
    if (!card) return set;
    const must = Array.isArray(card.must) ? card.must : [];
    must.forEach(r => { if (r && r.id) set.add(r.id); });
    return set;
  }

  /* Concentric hex spiral generator (axial coordinates).
     Yields {q, r, ring} for each hex starting at center (ring 0) and
     spiraling outward. Used to assign items to ring positions in the
     v0.3 layout: P0 fills inner positions first, P1 next, P2 last.
     Algorithm cribbed from Red Blob Games' canonical hex-grid reference.
     6 axial directions in a stable spiral order: */
  const HEX_DIRS = [
    { q:  1, r:  0 }, // 0: E
    { q:  1, r: -1 }, // 1: NE
    { q:  0, r: -1 }, // 2: NW
    { q: -1, r:  0 }, // 3: W
    { q: -1, r:  1 }, // 4: SW
    { q:  0, r:  1 }  // 5: SE
  ];
  function* hexSpiral(maxRing) {
    yield { q: 0, r: 0, ring: 0 };
    for (let ring = 1; ring <= maxRing; ring++) {
      // Start at the SW corner: `ring` steps in direction 4 from center.
      let q = HEX_DIRS[4].q * ring;
      let r = HEX_DIRS[4].r * ring;
      for (let side = 0; side < 6; side++) {
        for (let step = 0; step < ring; step++) {
          yield { q, r, ring };
          q += HEX_DIRS[side].q;
          r += HEX_DIRS[side].r;
        }
      }
    }
  }
  // Flat-top axial → pixel center.
  function hexAxialToPixel(q, r, S) {
    const x = S * (1.5 * q);
    const y = S * (Math.sqrt(3) * (r + q / 2));
    return { x, y };
  }

  /* Course view canvas dispatcher (Slice 4: lens triplet retired).
     The Build canvas is the only view of the Course now — the user owns
     placement; "By function" and "By priority" died with the rewrite. The
     biome view's job migrates to Map-scale ambient terrain (a different
     surface, not the Course view). Logged in §9 of the Course-rewrite
     follow-up list. */

  function renderCourseHexMap() {
    const wrap = document.getElementById('course-hexmap');
    if (!wrap) return;
    // Hide any visible hex tooltip — re-renders replace the SVG so no
    // mouseout fires on the detached node, leaving a stale tooltip.
    const staleTooltip = document.getElementById('hex-tooltip');
    if (staleTooltip) staleTooltip.hidden = true;
    // Clear stale chip state. The action chip's DOM is destroyed by any
    // full re-render; the in-memory ID should follow.
    bcActionItemId = null;
    const c = getOrInitCourseDraft();
    const workingSet = getActiveLegWorkingSet();
    const items = allItemsArray();
    const activeCount = workingSet.size;
    // Header counts split build_positions into placed (rows 1–7) vs staged (row 0).
    const positions = c.build_positions || {};
    let placedCount = 0;
    let stagedCount = 0;
    Object.values(positions).forEach(p => {
      if (!p) return;
      if (p.row === BC_STAGING_ROW) stagedCount++;
      else placedCount++;
    });
    const drawerCount = items.length - (placedCount + stagedCount);
    wrap.innerHTML = `
      <p class="course-hexmap-title">Course · ${placedCount} placed · ${stagedCount} staged · ${drawerCount} in drawer · ${activeCount} active in current leg</p>
      <div id="course-hexmap-content"></div>
    `;
    const slot = document.getElementById('course-hexmap-content');
    if (!items.length) {
      slot.innerHTML = '<p class="course-hexmap-sub">No items in the lab yet.</p>';
      return;
    }
    renderCourseLensBuild(slot, items);
  }

  /* Shared listener wiring used by every lens that renders an SVG with
     .hex-cell polygons. Click → single-pulse animation. Mouseover →
     instant HTML tooltip from the polygon's aria-label. */
  function wireHexSVGListeners(container) {
    const svg = container.querySelector('svg');
    if (!svg) return;
    svg.addEventListener('click', (e) => {
      const tgt = e.target;
      if (!tgt || !tgt.classList || !tgt.classList.contains('hex-cell')) return;
      tgt.classList.remove('pulse-once');
      void tgt.getBoundingClientRect();
      tgt.classList.add('pulse-once');
    });
    svg.addEventListener('animationend', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('pulse-once')) {
        e.target.classList.remove('pulse-once');
      }
    });
    let tooltip = document.getElementById('hex-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'hex-tooltip';
      tooltip.className = 'hex-tooltip';
      tooltip.hidden = true;
      document.body.appendChild(tooltip);
    }
    svg.addEventListener('mouseover', (e) => {
      const tgt = e.target;
      if (!tgt || !tgt.classList || !tgt.classList.contains('hex-cell')) return;
      const label = tgt.getAttribute('aria-label');
      if (!label) return;
      tooltip.textContent = label;
      tooltip.hidden = false;
    });
    svg.addEventListener('mousemove', (e) => {
      if (tooltip.hidden) return;
      const pad = 14;
      const tw = tooltip.offsetWidth || 240;
      const th = tooltip.offsetHeight || 32;
      let x = e.clientX + pad;
      let y = e.clientY + pad;
      if (x + tw > window.innerWidth - 8)  x = e.clientX - tw - pad;
      if (y + th > window.innerHeight - 8) y = e.clientY - th - pad;
      tooltip.style.left = x + 'px';
      tooltip.style.top  = y + 'px';
    });
    svg.addEventListener('mouseout', (e) => {
      const tgt = e.target;
      if (tgt && tgt.classList && tgt.classList.contains('hex-cell')) {
        tooltip.hidden = true;
      }
    });
  }

  /* Build lens (Moves 3b → 3e + Slice 1 staging row).
     The grid is 8 rows × 10 cols. Row 0 is the STAGING row (S) — items in
     the Course's scope but not yet placed on the working board. Rows 1–7
     are the labeled working board (A–G). The visual + click semantics are
     unified: every chip has a {row, col} coord whether it's staged or
     placed, so click-to-place / pickup / swap all work the same way. */
  const BC_STAGING_ROW = 0;
  const BC_ROWS    = 8;        // row 0 = staging, rows 1–7 = working board A–G
  const BC_COLS    = 10;
  const BC_CELL    = 52;       // pixel size of each grid cell
  const BC_LABEL_PAD = 24;     // edge padding for row/col labels
  const BC_ROW_LETTERS = ['S','A','B','C','D','E','F','G'];
  function bcCellId(row, col) {
    // "S1", "A1", "B7", etc — snap-circuit board convention. Staging cells
    // get the "S" prefix; working board cells get A–G.
    return BC_ROW_LETTERS[row] + (col + 1);
  }
  function isStagingRow(row) { return row === BC_STAGING_ROW; }
  // Move 3d module-level state. Persisted state lives on course.build_positions.
  let bcInHand = null;        // string item_id when an item is "in hand", else null
  let bcActionItemId = null;  // item_id whose action chip is currently open
  // Slice 2 drawer-control state — neither persisted (low-cost fresh on reload).
  let bcDrawerSort   = 'area';   // 'area' | 'priority' | 'status'
  let bcDrawerSearch = '';       // case-insensitive substring filter

  function getBuildPositions(course) {
    return (course && course.build_positions) || {};
  }
  function findItemAtCell(positions, row, col) {
    // Returns item_id at (row,col) or null. O(n) over placements; fine
    // at our scale (≤ 70 placements max).
    for (const id in positions) {
      const p = positions[id];
      if (p && p.row === row && p.col === col) return id;
    }
    return null;
  }
  function setBuildPosition(itemId, row, col) {
    const c = getOrInitCourseDraft();
    c.build_positions = c.build_positions || {};
    c.build_positions[itemId] = { row, col };
    upsertCourse(c);
  }
  function clearBuildPosition(itemId) {
    const c = getOrInitCourseDraft();
    if (c.build_positions && itemId in c.build_positions) {
      delete c.build_positions[itemId];
      upsertCourse(c);
    }
  }
  function clearAllBuildPositions() {
    const c = getOrInitCourseDraft();
    if (c.build_positions && Object.keys(c.build_positions).length > 0) {
      c.build_positions = {};
      upsertCourse(c);
    }
  }
  /* Move 3e template apply: takes the active course's frontier,
     resolves to actual items, sorts by priority then area, and snaps
     items into the staging row in priority+area order. Skips items
     already placed (preserves user's existing layout). Returns the
     count placed. Per Quenton: starting position, not constraint —
     every piece is individually editable after via the action chip.

     Slice 5: source is now a priority tier (P0 / P0+P1 / all) rather
     than the deprecated course.frontier. Templates land in STAGING ROW 0,
     not the working board — preserves the "owning the merge" gesture
     (the template proposes; the user promotes to A–G). */
  function applyBuildTemplate(items, tierKey) {
    const c = getOrInitCourseDraft();
    const positions = (c.build_positions = c.build_positions || {});
    const placedSet = new Set(Object.keys(positions));
    const wantedTiers = tierKey === 'all' ? ['P0','P1','P2']
                      : tierKey === 'P0+P1' ? ['P0','P1']
                      : ['P0'];
    // Active items only; exclude live/archived (they don't belong on a
    // future-week course). Sort priority → area → id for stable layout.
    const candidates = (items || [])
      .filter(it => it && wantedTiers.includes(it.priority))
      .filter(it => it.status !== 'live' && it.status !== 'archived')
      .filter(it => !placedSet.has(it.id))
      .sort((a, b) => {
        const pa = priorityRank(a.priority) - priorityRank(b.priority);
        if (pa !== 0) return pa;
        const ax = (a.areaName || '').localeCompare(b.areaName || '');
        if (ax !== 0) return ax;
        return (a.id || '').localeCompare(b.id || '');
      });
    // Stage in row 0 only. Find empty staging columns left-to-right.
    const stagingOccupied = new Set();
    Object.values(positions).forEach(p => {
      if (p && p.row === BC_STAGING_ROW) stagingOccupied.add(p.col);
    });
    let placedCount = 0;
    for (const it of candidates) {
      let snapped = false;
      for (let col = 0; col < BC_COLS; col++) {
        if (!stagingOccupied.has(col)) {
          positions[it.id] = { row: BC_STAGING_ROW, col };
          stagingOccupied.add(col);
          placedCount++;
          snapped = true;
          break;
        }
      }
      if (!snapped) break; // staging row full — stop; user can promote pieces to free slots
    }
    if (placedCount > 0) upsertCourse(c);
    return placedCount;
  }
  function renderCourseLensBuild(slot, items /*, frontierSet, workingSet */) {
    const course = getOrInitCourseDraft();
    const positions = getBuildPositions(course);
    // Build a quick lookup table: items by id (used for placed-piece render).
    const itemsById = new Map();
    (items || []).forEach(it => itemsById.set(it.id, it));

    const w = BC_LABEL_PAD * 2 + BC_COLS * BC_CELL;
    const h = BC_LABEL_PAD + BC_ROWS * BC_CELL + 8;

    // Column labels across the top
    const colLabels = [];
    for (let c = 0; c < BC_COLS; c++) {
      const x = BC_LABEL_PAD + c * BC_CELL + BC_CELL / 2;
      const y = BC_LABEL_PAD - 6;
      colLabels.push(`<text class="bc-grid-label" x="${x}" y="${y}" text-anchor="middle">${c + 1}</text>`);
    }

    // Row labels down the left
    const rowLabels = [];
    for (let r = 0; r < BC_ROWS; r++) {
      const x = BC_LABEL_PAD - 8;
      const y = BC_LABEL_PAD + r * BC_CELL + BC_CELL / 2 + 4;
      rowLabels.push(`<text class="bc-grid-label" x="${x}" y="${y}" text-anchor="end">${BC_ROW_LETTERS[r]}</text>`);
    }

    // Grid cells, wrapped in role="row" groups so the ARIA grid pattern
    // is complete (grid > row > gridcell). Cells with placements render
    // a small filled hex inside (color = area accent) + the LAB-### label.
    // Row 0 is the staging row — visually distinct (warmer tint, dashed
    // baseline) but mechanically identical (click/swap/pickup all work).
    const cells = [];
    for (let r = 0; r < BC_ROWS; r++) {
      const rowKind = isStagingRow(r) ? 'staging' : 'board';
      const rowAriaLabel = isStagingRow(r) ? 'Staging row' : `Row ${BC_ROW_LETTERS[r]}`;
      cells.push(`<g role="row" aria-label="${rowAriaLabel}">`);
      for (let c = 0; c < BC_COLS; c++) {
        const x = BC_LABEL_PAD + c * BC_CELL;
        const y = BC_LABEL_PAD + r * BC_CELL;
        const cellId = bcCellId(r, c);
        const occupiedId = findItemAtCell(positions, r, c);
        const occupiedItem = occupiedId ? itemsById.get(occupiedId) : null;
        const isOccupied = !!occupiedItem;
        const cellClasses = ['bc-cell'];
        if (isOccupied) cellClasses.push('bc-cell-occupied');
        if (rowKind === 'staging') cellClasses.push('bc-cell-staging');
        const cellNoun = rowKind === 'staging' ? 'staging slot' : 'cell';
        const ariaLabel = isOccupied
          ? `${cellNoun} ${cellId}: ${(occupiedItem.areaName || '')}: ${(occupiedItem.title || '')}`
          : `${cellNoun} ${cellId}, empty`;
        let inner = `<rect class="bc-cell-bg" x="${x}" y="${y}" width="${BC_CELL}" height="${BC_CELL}" rx="3" ry="3"/>`;
        if (!isOccupied) {
          inner += `<circle class="bc-cell-snap" cx="${x + BC_CELL / 2}" cy="${y + BC_CELL / 2}" r="3"/>`;
        } else {
          // Render the placed piece inside the cell.
          const accent = (AREA_VISUALS[occupiedItem.areaId] && AREA_VISUALS[occupiedItem.areaId].accent) || 'dark';
          const fill = HEX_ACCENT_FILL[accent] || HEX_ACCENT_FILL.dark;
          const cx = x + BC_CELL / 2;
          const cy = y + BC_CELL / 2;
          const hexSide = BC_CELL * 0.36;
          const points = hexPolygonPoints(cx, cy, hexSide);
          const numShort = (occupiedId || '').replace(/^LAB-/, '');
          inner += `<polygon class="bc-placed-hex" data-item="${escapeHTML(occupiedId)}" points="${points}" fill="${fill}"/>`;
          inner += `<text class="bc-placed-label" x="${cx.toFixed(2)}" y="${cy.toFixed(2)}">${escapeHTML(numShort)}</text>`;
        }
        cells.push(`<g class="${cellClasses.join(' ')}" data-row="${r}" data-col="${c}" data-cell="${cellId}" role="gridcell" aria-label="${escapeHTML(ariaLabel)}">${inner}</g>`);
      }
      cells.push(`</g>`);
    }

    // ── Drawer: items grouped by sort mode, with search filter ──
    // The drawer always excludes items already on the canvas (placed or staged).
    // Sort modes (Slice 2): 'area' (default — biome grouping), 'priority' (P0/P1/P2),
    // 'status' (in-progress / drafted / backlog).
    const placedSet = new Set(Object.keys(positions));
    const allDrawerItems = (items || []).filter(it => !placedSet.has(it.id));
    const totalDrawerCount = allDrawerItems.length;
    const searchTerm = (bcDrawerSearch || '').trim().toLowerCase();
    const drawerItems = searchTerm
      ? allDrawerItems.filter(it => {
          const id = (it.id || '').toLowerCase();
          const title = (it.title || '').toLowerCase();
          const area = (it.areaName || '').toLowerCase();
          return id.includes(searchTerm) || title.includes(searchTerm) || area.includes(searchTerm);
        })
      : allDrawerItems;

    // Renders one drawer item button. Pulled out so all sort modes share it.
    const renderDrawerItem = (it) => {
      const idShort = (it.id || '').replace(/^LAB-/, '');
      // Allowlist priority before injecting into class/text. Schema is
      // P0/P1/P2; anything else falls back to P2 so the class attribute
      // can't be poisoned by a hand-edited JSON value.
      const pri = ['P0','P1','P2'].includes(it.priority) ? it.priority : 'P2';
      return `<button type="button" class="bc-drawer-item" data-item="${escapeHTML(it.id)}" title="${escapeHTML(it.areaName || '')}: ${escapeHTML(it.title || '')}">
        <span class="bc-drawer-item-id">${escapeHTML(idShort)}</span>
        <span class="bc-drawer-item-title">${escapeHTML(it.title || '(no title)')}</span>
        <span class="bc-drawer-item-pri ${pri}">${pri}</span>
      </button>`;
    };

    // Group + render. Each mode produces an array of {label, swatch, items[]}
    // groups with internal sort already applied; render is uniform.
    let drawerGroups = [];
    if (bcDrawerSort === 'priority') {
      const byPri = { P0: [], P1: [], P2: [] };
      drawerItems.forEach(it => {
        const pri = ['P0','P1','P2'].includes(it.priority) ? it.priority : 'P2';
        byPri[pri].push(it);
      });
      ['P0','P1','P2'].forEach(p => {
        if (byPri[p].length === 0) return;
        byPri[p].sort((a, b) => {
          const sa = statusRank(a.status) - statusRank(b.status);
          if (sa !== 0) return sa;
          return (a.id || '').localeCompare(b.id || '');
        });
        drawerGroups.push({
          label: p + ' · ' + (PRI_LABEL[p] || ''),
          swatchClass: 'bc-drawer-area-pri ' + p,
          items: byPri[p]
        });
      });
    } else if (bcDrawerSort === 'status') {
      const byStatus = new Map();
      drawerItems.forEach(it => {
        const s = it.status || 'backlog';
        if (!byStatus.has(s)) byStatus.set(s, []);
        byStatus.get(s).push(it);
      });
      const orderedStatuses = Array.from(byStatus.keys()).sort((a, b) => statusRank(a) - statusRank(b));
      orderedStatuses.forEach(s => {
        const arr = byStatus.get(s);
        arr.sort((a, b) => {
          const pa = priorityRank(a.priority) - priorityRank(b.priority);
          if (pa !== 0) return pa;
          return (a.id || '').localeCompare(b.id || '');
        });
        drawerGroups.push({
          label: STATUS_LABEL[s] || s,
          swatchClass: 'bc-drawer-area-status s-' + s,
          items: arr
        });
      });
    } else {
      // 'area' (default) — biome grouping, the legacy shape.
      const byArea = new Map();
      drawerItems.forEach(it => {
        const aId = it.areaId || '__orphan';
        if (!byArea.has(aId)) {
          byArea.set(aId, { areaId: aId, areaName: it.areaName || aId, items: [] });
        }
        byArea.get(aId).items.push(it);
      });
      byArea.forEach(g => {
        g.items.sort((a, b) => {
          const pa = priorityRank(a.priority) - priorityRank(b.priority);
          if (pa !== 0) return pa;
          const sa = statusRank(a.status) - statusRank(b.status);
          if (sa !== 0) return sa;
          return (a.id || '').localeCompare(b.id || '');
        });
      });
      drawerGroups = Array.from(byArea.values())
        .sort((a, b) => (a.areaName || '').localeCompare(b.areaName || ''))
        .map(g => {
          const accent = (AREA_VISUALS[g.areaId] && AREA_VISUALS[g.areaId].accent) || 'dark';
          const color = HEX_ACCENT_FILL[accent] || HEX_ACCENT_FILL.dark;
          return {
            label: g.areaName,
            swatchInline: 'background:' + color,
            items: g.items
          };
        });
    }

    const emptyMessage = totalDrawerCount === 0
      ? 'All items placed.'
      : 'No items match "' + escapeHTML(searchTerm) + '". Clear the search to see all ' + totalDrawerCount + '.';
    const drawerInner = drawerGroups.length === 0
      ? '<div class="bc-drawer-empty">' + emptyMessage + '</div>'
      : drawerGroups.map(g => {
          const swatchAttrs = g.swatchInline
            ? `class="bc-drawer-area-swatch" style="${g.swatchInline}"`
            : `class="bc-drawer-area-swatch ${g.swatchClass || ''}"`;
          return `<div class="bc-drawer-area">
            <div class="bc-drawer-area-name">
              <span ${swatchAttrs}></span>
              ${escapeHTML(g.label)}
              <span class="bc-drawer-area-count">${g.items.length}</span>
            </div>
            ${g.items.map(renderDrawerItem).join('')}
          </div>`;
        }).join('');

    // Split placement counts: staging row 0 = "staged", rows 1–7 = "placed
    // on the working board". Both live in build_positions; the row distinguishes.
    let stagedCount = 0;
    let placedCount = 0;
    Object.values(positions).forEach(p => {
      if (!p) return;
      if (p.row === BC_STAGING_ROW) stagedCount++;
      else placedCount++;
    });
    const inHandHint = bcInHand
      ? `<strong>${escapeHTML((itemsById.get(bcInHand) && itemsById.get(bcInHand).title) || bcInHand)}</strong> in hand — click an empty cell to snap it. Click the same item in the drawer to drop it.`
      : `Click an item in the drawer to take it in hand, then click a cell to place it. Click a placed piece for actions (pick up · remove).`;
    slot.innerHTML = `
      <p class="course-hexmap-sub">Build · ${placedCount} placed · ${stagedCount} staged · ${drawerItems.length} in drawer. ${inHandHint}</p>
      <div class="bc-build-layout">
        <div class="bc-canvas-wrap">
          <svg class="bc-canvas${bcInHand ? ' bc-in-hand' : ''}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="grid" aria-label="Build canvas: 1 staging row + 7×${BC_COLS} working board, ${placedCount} placed, ${stagedCount} staged.">
            ${colLabels.join('')}
            ${rowLabels.join('')}
            ${cells.join('')}
          </svg>
        </div>
        <div class="bc-drawer" aria-label="Item drawer">
          <p class="bc-drawer-title">Tool drawer · ${drawerItems.length}${searchTerm && drawerItems.length !== totalDrawerCount ? ' / ' + totalDrawerCount : ''} items</p>
          <p class="bc-drawer-sub">Search, sort, and click an item to take it in hand. Click a cell to snap it.</p>
          <div class="bc-drawer-controls">
            <input type="search" class="bc-drawer-search" id="bc-drawer-search" placeholder="Search id / title / area…" value="${escapeHTML(bcDrawerSearch || '')}" aria-label="Search drawer items"/>
            <div class="bc-drawer-sort" role="group" aria-label="Sort drawer">
              <span class="bc-drawer-sort-label">Sort:</span>
              <button type="button" class="bc-drawer-sort-btn${bcDrawerSort === 'area'     ? ' active' : ''}" data-act="sort" data-sort="area"     aria-pressed="${bcDrawerSort === 'area'}">Area</button>
              <button type="button" class="bc-drawer-sort-btn${bcDrawerSort === 'priority' ? ' active' : ''}" data-act="sort" data-sort="priority" aria-pressed="${bcDrawerSort === 'priority'}">Priority</button>
              <button type="button" class="bc-drawer-sort-btn${bcDrawerSort === 'status'   ? ' active' : ''}" data-act="sort" data-sort="status"   aria-pressed="${bcDrawerSort === 'status'}">Status</button>
            </div>
          </div>
          <div class="bc-drawer-actions">
            <div class="bc-template-group" role="group" aria-label="Apply priority template">
              <button type="button" class="bc-drawer-action" data-act="apply-template" data-tier="P0"    title="Stage all P0 items (this week's release). Skips items already on the canvas."><span aria-hidden="true">▦</span> Apply P0</button>
              <button type="button" class="bc-drawer-action subtle" data-act="apply-template" data-tier="P0+P1" title="Stage P0 + P1 items.">+P1</button>
              <button type="button" class="bc-drawer-action subtle" data-act="apply-template" data-tier="all"   title="Stage P0 + P1 + P2 items.">All</button>
            </div>
            <button type="button" class="bc-drawer-action danger" data-act="clear-board" ${placedCount + stagedCount === 0 ? 'disabled' : ''} title="Remove all placements from the board and staging."><span aria-hidden="true">✕</span> Clear board</button>
          </div>
          <p class="bc-drawer-msg" id="bc-drawer-msg" hidden></p>
          ${drawerInner}
        </div>
      </div>
      <p class="bc-canvas-hint">Working board (rows A–G). Staging row (S) above — items in scope, not yet placed. Click an item to take it in hand, click a cell to snap it.</p>
    `;

    // Re-apply in-hand visual on the drawer item (rendered after the
    // drawerInner string was built, so we toggle the class imperatively).
    if (bcInHand) {
      const handBtn = slot.querySelector(`.bc-drawer-item[data-item="${bcInHand.replace(/"/g, '\\"')}"]`);
      if (handBtn) handBtn.classList.add('bc-in-hand');
    }

    // ── Canvas click handler: place / show action chip ──
    const svg = slot.querySelector('svg.bc-canvas');
    if (svg) {
      svg.addEventListener('click', (e) => {
        const cell = e.target && e.target.closest ? e.target.closest('.bc-cell') : null;
        if (!cell) return;
        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);
        const occupiedId = findItemAtCell(positions, row, col);
        if (occupiedId) {
          if (bcInHand && bcInHand !== occupiedId) {
            // Swap: in-hand piece takes this cell; the displaced piece
            // pops back to the drawer (no swap-place; a separate Move
            // affordance can come in v0.5).
            clearBuildPosition(occupiedId);
            setBuildPosition(bcInHand, row, col);
            bcInHand = null;
            bcActionItemId = null;
            renderCourseHexMap();
            return;
          }
          // Open the action chip on this cell.
          openBuildActionChip(slot, cell, occupiedId);
          return;
        }
        // Empty cell.
        if (!bcInHand) {
          // Visual ping (no in-hand item; nothing to place).
          const bg = cell.querySelector('.bc-cell-bg');
          if (bg) {
            bg.style.transition = 'none';
            bg.style.fill   = 'rgba(212,160,82,0.22)';
            bg.style.stroke = 'var(--accent)';
            setTimeout(() => {
              bg.style.transition = '';
              bg.style.fill   = '';
              bg.style.stroke = '';
            }, 180);
          }
          return;
        }
        // Place the in-hand item.
        setBuildPosition(bcInHand, row, col);
        bcInHand = null;
        bcActionItemId = null;
        renderCourseHexMap();
      });
    }
    // ── Drawer click handler: sort buttons, take/drop in hand, template actions ──
    const drawer = slot.querySelector('.bc-drawer');
    if (drawer) {
      drawer.addEventListener('click', (e) => {
        // Sort radio button — module state, no persistence.
        const sortBtn = e.target && e.target.closest ? e.target.closest('[data-act="sort"]') : null;
        if (sortBtn) {
          const next = sortBtn.dataset.sort;
          if (next && next !== bcDrawerSort) {
            bcDrawerSort = next;
            renderCourseHexMap();
          }
          return;
        }
        // Template actions take precedence over item picks (their selectors
        // don't overlap, but checking the action button first is clearer).
        const actBtn = e.target && e.target.closest ? e.target.closest('.bc-drawer-action') : null;
        if (actBtn) {
          const act = actBtn.dataset.act;
          if (act === 'apply-template') {
            const tier = actBtn.dataset.tier || 'P0';
            const placed = applyBuildTemplate(items, tier);
            if (placed === 0) {
              // Zero-cases: the tier has no eligible items, every match is
              // already on the canvas, or the staging row is full. Surface
              // a brief inline message so the user gets feedback rather
              // than silence.
              const msg = drawer.querySelector('#bc-drawer-msg');
              if (msg) {
                msg.textContent = 'Nothing new to stage — every ' + tier + ' item is already on the canvas (or staging is full).';
                msg.hidden = false;
                setTimeout(() => { msg.hidden = true; msg.textContent = ''; }, 2800);
              }
              return;
            }
            bcInHand = null;
            bcActionItemId = null;
            renderCourseHexMap();
            return;
          }
          if (act === 'clear-board') {
            const placedCountNow = Object.keys(getBuildPositions(getOrInitCourseDraft())).length;
            if (placedCountNow === 0) return;
            if (!confirm('Remove all ' + placedCountNow + ' placements from the board?')) return;
            clearAllBuildPositions();
            bcInHand = null;
            bcActionItemId = null;
            renderCourseHexMap();
            return;
          }
          return;
        }
        const btn = e.target && e.target.closest ? e.target.closest('.bc-drawer-item') : null;
        if (!btn) return;
        const id = btn.dataset.item;
        if (!id) return;
        bcInHand = (bcInHand === id) ? null : id;
        bcActionItemId = null;
        renderCourseHexMap();
      });
      // Search input — debounced via 'input' event. Re-render the drawer on
      // every keystroke; the canvas SVG is unaffected so this is cheap.
      const searchInput = slot.querySelector('#bc-drawer-search');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          bcDrawerSearch = (e.target.value || '');
          renderCourseHexMap();
          // Restore focus + cursor position after the re-render replaces the input.
          const fresh = document.getElementById('bc-drawer-search');
          if (fresh) {
            fresh.focus();
            const len = fresh.value.length;
            try { fresh.setSelectionRange(len, len); } catch (_) {}
          }
        });
      }
    }
    // Outside-click closer is registered inside openBuildActionChip (not
    // here) — that path doesn't trigger a re-render so the closer would
    // never bind if registered conditionally on bcActionItemId.
  }

  /* Build canvas action chip — shown when a placed piece is clicked
     (without an in-hand swap). Two actions today: Pick up (returns the
     piece to hand, ready for re-placement) and Remove (returns the
     piece to the drawer). Move (drag-relocation) is deferred to v0.5+
     per Quenton; today's Pick-up + place achieves the same outcome in
     two clicks. */
  function openBuildActionChip(slot, cellEl, itemId) {
    bcActionItemId = itemId;
    // Position the chip relative to the canvas-wrap (which is
    // position:relative). Use the cell's bounding rect, translated into
    // wrap-local coords.
    const wrap = slot.querySelector('.bc-canvas-wrap');
    if (!wrap) return;
    // Remove any pre-existing chip first.
    const existing = wrap.querySelector('.bc-action-chip');
    if (existing) existing.remove();
    const cellRect = cellEl.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const left = cellRect.right - wrapRect.left + 4;
    const top  = cellRect.top   - wrapRect.top;
    const chip = document.createElement('div');
    chip.className = 'bc-action-chip';
    chip.style.left = left + 'px';
    chip.style.top  = top  + 'px';
    chip.innerHTML = `
      <button data-act="pickup" type="button">⇪ Pick up</button>
      <button data-act="remove" type="button" class="danger">↩ Remove</button>
      <button data-act="cancel" type="button">×</button>
    `;
    chip.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('button[data-act]') : null;
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === 'pickup') {
        clearBuildPosition(itemId);
        bcInHand = itemId;
      } else if (act === 'remove') {
        clearBuildPosition(itemId);
        bcInHand = null;
      } // 'cancel' just closes
      bcActionItemId = null;
      renderCourseHexMap();
    });
    wrap.appendChild(chip);
    // Constrain chip horizontally if it would overflow the wrap.
    const chipRect = chip.getBoundingClientRect();
    if (chipRect.right > wrapRect.right - 4) {
      chip.style.left = (cellRect.left - wrapRect.left - chipRect.width - 4) + 'px';
    }
    // Outside-click closer. Closes over the chip element directly so that
    // chip-button clicks (which bubble to document) are correctly identified
    // as inside the chip. Bail early if some other render path already
    // cleared bcActionItemId (e.g., a lens switch); avoids the double-render
    // on lens-switch-while-chip-open that grepzilla's cumulative sweep
    // caught.
    setTimeout(() => {
      const closer = (e) => {
        if (chip.contains(e.target)) return;
        if (bcActionItemId === null) {
          document.removeEventListener('click', closer);
          return;
        }
        bcActionItemId = null;
        document.removeEventListener('click', closer);
        renderCourseHexMap();
      };
      document.addEventListener('click', closer);
    }, 0);
  }

  /* Slice 4: lens triplet retired. The Build canvas is the single Course view.
     renderCourseLensByFunction (biome regions) and renderCourseLensByPriority
     (concentric rings) both deleted; the cognitive job they served at Course-
     scale is covered by drawer sort modes (Slice 2). The biome-as-terrain
     visualization may return at Map-scale, per §9 follow-ups. */

  /* Format helper used by both the Comprehend section and the Leg view's
     Comprehend zone. Defined up here so both call sites pre-date the
     definition is impossible (function-declaration hoisting works either
     way; the explicit ordering also documents intent). */
  function fmtComprehendWhen(iso) {
    if (!iso) return '·';
    try {
      const d = new Date(iso);
      const date = d.toISOString().slice(0, 10);
      const time = d.toTimeString().slice(0, 5);
      return date + ' · ' + time;
    } catch { return iso; }
  }

  /* ── Leg view: Snap Circuit board (Phase 5) ──
     Renders the active leg as a five-zone circuit board. Each zone reads
     from the corresponding leg sub-record and the linked Frame/Debrief
     cards. Read-only; click-throughs to forms come in v0.2. */
  function renderLegView() {
    const wrap = document.getElementById('leg-body');
    if (!wrap) return;
    const leg = findActiveLeg();
    if (!leg) {
      wrap.innerHTML =
        '<div class="leg-board-empty">' +
          'No active leg this week. ' +
          '<button type="button" data-act="goto-frame">Open Frame Workshop</button> ' +
          'and save a card to start one — the circuit lights up as the leg fills out.' +
        '</div>';
      return;
    }
    const frame = findFrameCardForLeg(leg);
    const debrief = findDebriefCardForLeg(leg);

    const zones = [];
    zones.push(renderLegZoneFrame(leg, frame));
    zones.push('<div class="leg-wire" aria-hidden="true"></div>');
    zones.push(renderLegZoneComprehend(leg));
    zones.push('<div class="leg-wire" aria-hidden="true"></div>');
    zones.push(renderLegZoneSync(leg));
    zones.push('<div class="leg-wire" aria-hidden="true"></div>');
    zones.push(renderLegZoneProduce(leg));
    zones.push('<div class="leg-wire" aria-hidden="true"></div>');
    zones.push(renderLegZoneDebrief(leg, debrief));
    wrap.innerHTML =
      '<div class="leg-board-empty" style="margin-bottom:14px;text-align:left;background:transparent;border:none;padding:6px 0;">' +
        '<strong style="color:var(--accent);">' + escapeHTML(leg.id) + '</strong> · leg ' + escapeHTML(String(leg.leg_number)) + ' of ' + COURSE_LEG_COUNT +
        ' · <span style="text-transform:uppercase;letter-spacing:1px;font-size:10px;">' + escapeHTML(leg.status) + '</span>' +
      '</div>' +
      '<div class="leg-board">' + zones.join('') + '</div>';
  }
  function findDebriefCardForLeg(leg) {
    if (!leg || !leg.debrief_card_id) return null;
    return loadDebriefCards().find(c => c && c.savedAt === leg.debrief_card_id) || null;
  }
  function legZoneShell(zoneId, glyph, component, title, statusClass, statusLabel, contentHTML) {
    return `<div class="leg-zone" data-zone="${zoneId}">
      <div class="leg-zone-glyph" aria-hidden="true">${glyph}</div>
      <div class="leg-zone-body">
        <div class="leg-zone-header">
          <span class="leg-zone-title">${escapeHTML(title)}</span>
          <span class="leg-zone-component">${escapeHTML(component)}</span>
          <span class="leg-zone-status ${statusClass}">${escapeHTML(statusLabel)}</span>
        </div>
        <div class="leg-zone-content">${contentHTML}</div>
      </div>
    </div>`;
  }
  function renderLegZoneFrame(leg, card) {
    if (!card) {
      return legZoneShell('frame', '🔋', 'power source', 'Frame', '', 'unset',
        '<div class="leg-zone-empty">No Frame card linked. Open Frame Workshop and save a card to power the leg.</div>');
    }
    const mustArr  = Array.isArray(card.must) ? card.must
                   : (typeof card.must === 'string' && card.must.trim() ? [{ id: 'free', title: card.must.slice(0, 80) }] : []);
    const bonusArr = Array.isArray(card.stretch) ? card.stretch
                   : (typeof card.stretch === 'string' && card.stretch.trim() ? [{ id: 'free', title: card.stretch.slice(0, 80) }] : []);
    const mustChips = mustArr.length > 0
      ? '<div class="leg-chip-row">' + mustArr.map(r => `<span class="leg-chip"><span class="leg-chip-id">${escapeHTML((r && r.id) || '·')}</span><span>${escapeHTML((r && r.title) || '')}</span></span>`).join('') + '</div>'
      : '<div class="leg-zone-empty">No musts named yet.</div>';
    const bonusChips = bonusArr.length > 0
      ? '<div class="leg-chip-row">' + bonusArr.map(r => `<span class="leg-chip bonus"><span class="leg-chip-id">${escapeHTML((r && r.id) || '·')}</span><span>${escapeHTML((r && r.title) || '')}</span></span>`).join('') + '</div>'
      : '';
    const inLine = (card.in || '').trim();
    const inHTML = inLine
      ? `<div class="leg-zone-line"><span class="lzl-label">DOING</span><span class="lzl-value">${escapeHTML(inLine.slice(0, 240))}</span></div>`
      : '';
    return legZoneShell('frame', '🔋', 'power source', 'Frame', 'lit', mustArr.length + ' musts · ' + bonusArr.length + ' bonus',
      inHTML + mustChips + bonusChips);
  }
  function renderLegZoneComprehend(leg) {
    const entries = Array.isArray(leg.comprehend) ? leg.comprehend : [];
    if (entries.length === 0) {
      return legZoneShell('comprehend', '⚡', 'amplifier', 'Comprehend', '', 'idle',
        '<div class="leg-zone-empty">No comprehension activity yet. Capture a note from the Course view, walk a deck, or cycle an item to live/archived — they all land here.</div>');
    }
    // Phase 1.5: aggregate counts across kinds for the lit-state subtitle.
    const kindCounts = entries.reduce((acc, e) => {
      const k = (e && e.kind) || 'note';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const subtitleParts = [];
    if (kindCounts.note)      subtitleParts.push(kindCounts.note + ' note' + (kindCounts.note === 1 ? '' : 's'));
    if (kindCounts.synthesis) subtitleParts.push(kindCounts.synthesis + ' synthesis');
    if (kindCounts.deck)      subtitleParts.push(kindCounts.deck + ' deck' + (kindCounts.deck === 1 ? '' : 's'));
    if (kindCounts.walk)      subtitleParts.push(kindCounts.walk + ' walk' + (kindCounts.walk === 1 ? '' : 's'));
    const subtitle = subtitleParts.join(' · ');

    const recent = entries.slice(-3).reverse();
    const items = recent.map(e => {
      const p = comprehendEntryParts(e);
      return `<li class="cc-${p.kind}"><span class="lcl-when">${escapeHTML(fmtComprehendWhen(e && e.at))}</span><span class="cc-kind cc-kind-${p.kind}">${escapeHTML(p.label)}</span> ${p.bodyHTML}</li>`;
    }).join('');
    const more = entries.length > 3
      ? `<div class="leg-zone-line"><span class="lzl-label">+${entries.length - 3} earlier</span></div>`
      : '';
    return legZoneShell('comprehend', '⚡', 'amplifier', 'Comprehend', 'lit', subtitle,
      '<ul class="leg-comprehend-list">' + items + '</ul>' + more);
  }
  function renderLegZoneSync(leg) {
    // ≈ (U+2248) renders consistently across platforms — engineering-symbol
    // glyphs like ⏚ tofu out on Windows. Filter / capacitor evokes the same
    // signal-shaping role.
    if (!leg.sync) {
      return legZoneShell('sync', '≈', 'filter', 'Sync', '', 'deferred',
        '<div class="leg-zone-empty">Sync station deferred to a later phase. The slot exists; the form does not yet.</div>');
    }
    const summary = (leg.sync && leg.sync.summary) || '(sync data present — no summary)';
    return legZoneShell('sync', '≈', 'filter', 'Sync', 'lit', 'captured',
      `<div class="leg-zone-line"><span class="lzl-value">${escapeHTML(summary)}</span></div>`);
  }
  function renderLegZoneProduce(leg) {
    const p = leg.produce || { selected: [], bonuses: [], notes: [] };
    const selectedCount = (p.selected || []).length;
    const bonusCount    = (p.bonuses  || []).length;
    const noteCount     = (p.notes    || []).length;
    const totalActivity = selectedCount + bonusCount + noteCount;
    if (totalActivity === 0) {
      return legZoneShell('produce', '〰', 'live signal', 'Produce', '', 'quiet',
        '<div class="leg-zone-empty">No produce activity logged yet. The Produce ledger lights up as items are picked up and bonuses are claimed.</div>');
    }
    const lines = [];
    if (selectedCount > 0) lines.push(`<div class="leg-zone-line"><span class="lzl-label">SELECTED</span><span class="lzl-value">${selectedCount}</span></div>`);
    if (bonusCount > 0)    lines.push(`<div class="leg-zone-line"><span class="lzl-label">BONUSES</span><span class="lzl-value">${bonusCount}</span></div>`);
    if (noteCount > 0)     lines.push(`<div class="leg-zone-line"><span class="lzl-label">NOTES</span><span class="lzl-value">${noteCount}</span></div>`);
    return legZoneShell('produce', '〰', 'live signal', 'Produce', 'lit', 'flowing',
      lines.join(''));
  }
  function renderLegZoneDebrief(leg, card) {
    if (!card) {
      const status = leg.status === 'debriefed' ? 'done' : '';
      const label  = leg.status === 'debriefed' ? 'closed' : 'pending';
      return legZoneShell('debrief', '🔊', 'output stage', 'Debrief', status, label,
        '<div class="leg-zone-empty">No Debrief card yet. Open Debrief Booth, save a card, and the leg closes — the output stage lights green.</div>');
    }
    const courseHeld = card.course_held && DB_COURSE_HELD_LABEL[card.course_held]
      ? DB_COURSE_HELD_LABEL[card.course_held]
      : (card.course_held || '—');
    const caught = (card.caught || '').slice(0, 220);
    const caughtHTML = caught
      ? `<div class="leg-zone-line"><span class="lzl-label">CAUGHT</span><span class="lzl-value">${escapeHTML(caught)}</span></div>`
      : '';
    const heldHTML = `<div class="leg-zone-line"><span class="lzl-label">COURSE HELD</span><span class="lzl-value">${escapeHTML(courseHeld)}</span></div>`;
    const changes = leg.changes_to_course;
    const changesHTML = changes && changes.summary
      ? `<div class="leg-zone-line"><span class="lzl-label">CHANGES</span><span class="lzl-value">${escapeHTML(String(changes.summary).slice(0, 200))}</span></div>`
      : '';
    return legZoneShell('debrief', '🔊', 'output stage', 'Debrief', 'done', 'closed',
      heldHTML + caughtHTML + changesHTML);
  }

  // Leg-view click handler (jump to Frame Workshop from the empty-state).
  // Use closest() so wrapping the link's text in a child element later
  // (e.g., <strong>) doesn't silently break the dispatch.
  document.addEventListener('click', (e) => {
    const tgt = e.target && e.target.closest ? e.target.closest('[data-act="goto-frame"]') : null;
    if (tgt) {
      if (typeof setView === 'function') setView('floor');
      if (typeof openDrawer === 'function') openDrawer('frame-workshop');
    }
  });

  /* ── Comprehend Signals (Phase 1.5) ──
     The Comprehend zone aggregates three kinds of activity, all written to
     leg.comprehend[]:
       kind: 'note'       → manual capture from the textarea (Phase 3)
       kind: 'synthesis'  → status cycle to live/archived ("I now consider
                            this done") — auto-logged from cycleStatus
       kind: 'deck'       → opening a known deck file (recap-play act) —
                            auto-logged from artifact-link clicks
     Surveillance line: only acts the user *intentionally took* and
     *would expect to leave a record*. No mouse-tracking, no search-
     query logging, no item-hover. Director-of-the-lab tone.

     Entry shape (back-compat: missing `kind` → 'note'):
       { at, kind, text?, source?, item_id?, transition? } */

  // Deck-file matcher. Catches the existing two decks plus future
  // arc-comprehension decks following the *-deck-vN.M.html convention.
  const DECK_FILE_RE = /(?:^|\/)(turn-v[\d.]+-map|.*-deck-v[\d.]+|comprehension-deck-v[\d.]+)\.html$/i;

  function appendComprehendEntry(entry) {
    // Adds a comprehend entry to the active leg. No-op if no active leg
    // (orphan signals are dropped silently — by design; the leg is the
    // unit of comprehension and we don't try to back-fill).
    // Note: `at` is always authoritative — any `at` on the caller's entry
    // is overwritten with `new Date().toISOString()`. Callers should not
    // pass `at`; if you need backdating, use upsertLeg directly.
    const leg = findActiveLeg();
    if (!leg) return null;
    leg.comprehend = Array.isArray(leg.comprehend) ? leg.comprehend.slice() : [];
    leg.comprehend.push(Object.assign({}, entry, { at: new Date().toISOString() }));
    return upsertLeg(leg);
  }
  function logComprehendSynthesis(itemId, prevStatus, nextStatus) {
    // Called from cycleStatus on transitions to live/archived only.
    appendComprehendEntry({
      kind: 'synthesis',
      item_id: itemId,
      transition: (prevStatus || '?') + ' → ' + nextStatus
    });
    // If the user is on the Course or Leg view when this fires, surface
    // the new entry immediately. Best-effort: render functions guard.
    if (activeView === 'course' && typeof renderCourseComprehend === 'function') renderCourseComprehend();
    if (activeView === 'leg'    && typeof renderLegView          === 'function') renderLegView();
  }
  function logComprehendDeckOpen(href) {
    // Called when the user clicks an artifact-link whose href matches a
    // known deck file. Strips any query string / fragment for cleanliness.
    const clean = (href || '').split('?')[0].split('#')[0];
    appendComprehendEntry({
      kind: 'deck',
      source: clean
    });
    if (activeView === 'course' && typeof renderCourseComprehend === 'function') renderCourseComprehend();
    if (activeView === 'leg'    && typeof renderLegView          === 'function') renderLegView();
  }
  // Delegated click handler for any artifact-link in the lab. Fires the
  // deck-open log only when the href matches the deck file pattern. Does
  // not preventDefault — the link still opens normally in a new tab.
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a.artifact-link') : null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (DECK_FILE_RE.test(href)) {
      logComprehendDeckOpen(href);
    }
  });

  // Shared helper for rendering a single comprehend entry's payload (the
  // kind label + the body). Used by both the Course view's log and the
  // Leg view's Comprehend zone. Back-compat: an entry with no `kind` (the
  // pre-Phase-1.5 shape) renders as a 'note' with just the text body.
  function comprehendEntryParts(entry) {
    if (!entry) return { kind: 'note', label: 'note', bodyHTML: '' };
    const k = entry.kind || 'note';
    if (k === 'synthesis') {
      const id = escapeHTML(entry.item_id || '?');
      const tr = escapeHTML(entry.transition || '');
      return { kind: 'synthesis', label: 'synthesis', bodyHTML: id + (tr ? '  ' + tr : '') };
    }
    if (k === 'deck') {
      const src = escapeHTML(entry.source || '?');
      return { kind: 'deck', label: 'deck', bodyHTML: src };
    }
    if (k === 'walk') {
      // Move 2e: walk entries carry walk_id + status (started/completed)
      // and steps_completed when the user reached the Done button.
      const wid = escapeHTML(entry.walk_id || '?');
      const status = escapeHTML(entry.status || 'started');
      const stepsTxt = (typeof entry.steps_completed === 'number')
        ? '  ' + entry.steps_completed + ' steps'
        : '';
      return { kind: 'walk', label: 'walk', bodyHTML: wid + '  ' + status + stepsTxt };
    }
    // 'note' (default) — text body, newlines preserved
    const txt = escapeHTML(entry.text || '').replace(/\n/g, '<br>');
    return { kind: 'note', label: 'note', bodyHTML: txt };
  }

  /* ── On-demand Comprehend (Phase 3, extended in Phase 1.5) ──
     Single textarea + Capture button. Appends a timestamped note to the
     active leg's comprehend[]. Renders the most-recent-first log below.
     The log now also surfaces auto-logged synthesis + deck entries.
     fmtComprehendWhen is defined above (shared with the Leg view). */
  function renderCourseComprehend() {
    const wrap = document.getElementById('course-comprehend');
    if (!wrap) return;
    const leg = findActiveLeg();
    if (!leg) {
      wrap.innerHTML =
        '<p class="course-comprehend-title">Comprehend</p>' +
        '<p class="course-comprehend-sub">Re-immersion notes for the active leg. ' +
        'Capture what just changed, what to load before continuing, what surprised you.</p>' +
        '<p class="course-comprehend-empty">No active leg yet. Open Frame Workshop and save a card to start a leg, then Comprehend notes attach to it.</p>';
      return;
    }
    const entries = (leg.comprehend || []).slice().reverse(); // newest first
    const logHTML = entries.length === 0
      ? '<p class="course-comprehend-empty">No comprehension activity yet for ' + escapeHTML(leg.id) + '. Capture a note above, walk a deck, or cycle an item to live/archived.</p>'
      : entries.map(e => {
          const p = comprehendEntryParts(e);
          return `<div class="course-comprehend-entry cc-${p.kind}">
            <span class="cc-when">${escapeHTML(fmtComprehendWhen(e && e.at))}</span>
            <span class="cc-kind cc-kind-${p.kind}">${escapeHTML(p.label)}</span>
            <span class="cc-body">${p.bodyHTML}</span>
          </div>`;
        }).join('');
    wrap.innerHTML =
      '<p class="course-comprehend-title">Comprehend · ' + escapeHTML(leg.id) + '</p>' +
      '<p class="course-comprehend-sub">Activity for the active leg. Notes you write, decks you walk, items you cycle to live/archived all land here.</p>' +
      '<textarea id="course-comprehend-input" placeholder="What just changed? What do I need to load? What surprised me?"></textarea>' +
      '<div class="course-comprehend-actions">' +
        '<button type="button" id="course-comprehend-capture" class="ff-btn primary">Capture note</button>' +
        '<span class="ff-saved" id="course-comprehend-saved">✓ saved</span>' +
      '</div>' +
      '<div class="course-comprehend-log">' + logHTML + '</div>';
  }

  // Delegated handlers for the Course view (form inputs + save + comprehend
  // capture). The frontier-picker handlers were retired with Slice 3 — scope
  // is now declared by placing pieces on the Build canvas, not by toggling
  // a chip list.
  // course-view tile was removed in Phase 1; this delegated listener is kept
  // for the dead renderCourseView() body. Guarded so the lookup-null path is
  // a clean no-op rather than throwing.
  const _courseViewRoot = document.getElementById('course-view');
  if (_courseViewRoot) _courseViewRoot.addEventListener('click', (e) => {
    const tgt = e.target;
    if (tgt.id === 'course-save') {
      const c = getOrInitCourseDraft();
      const themeEl  = document.getElementById('course-theme');
      const targetEl = document.getElementById('course-target');
      const bailEl   = document.getElementById('course-bail');
      const errEl    = document.getElementById('course-save-error');
      c.theme           = themeEl  ? themeEl.value.trim()  : '';
      c.target_outcome  = targetEl ? targetEl.value.trim() : '';
      c.bail_conditions = bailEl   ? bailEl.value.trim()   : '';
      // Slice 6 ceremony: activation requires all three fields. After
      // activation, edits relax (you can update the course mid-week
      // without re-justifying every field; just keep at least the theme
      // present as a sanity check).
      const isActivating = (c.status || 'planning') === 'planning';
      const missing = [];
      if (!c.theme)           missing.push('theme');
      if (isActivating && !c.target_outcome) missing.push('target outcome');
      if (isActivating && !c.bail_conditions) missing.push('bail conditions');
      if (missing.length > 0) {
        if (errEl) {
          errEl.textContent = 'Fill in: ' + missing.join(', ') + '.';
          errEl.hidden = false;
          setTimeout(() => { if (errEl) { errEl.hidden = true; errEl.textContent = ''; } }, 3500);
        }
        return;
      }
      if (errEl) { errEl.hidden = true; errEl.textContent = ''; }
      // First save with a complete form: transition planning → in-progress.
      // The Course is now the game being played for the 7-leg arc.
      let activatedNow = false;
      if (isActivating) {
        c.status = 'in-progress';
        c.activated_at = new Date().toISOString();
        activatedNow = true;
      }
      upsertCourse(c);
      // On activation, log a comprehend note on the active leg if there
      // is one. (No leg yet on a freshly activated course is normal —
      // the first Frame of the week creates leg A. The note is durable
      // when there's somewhere durable to put it; otherwise the status
      // transition itself is the receipt.)
      if (activatedNow) {
        const placedNow = c.build_positions ? Object.values(c.build_positions).filter(p => p && p.row !== BC_STAGING_ROW).length : 0;
        const stagedNow = c.build_positions ? Object.values(c.build_positions).filter(p => p && p.row === BC_STAGING_ROW).length : 0;
        if (typeof appendComprehendEntry === 'function') {
          appendComprehendEntry({
            kind: 'course-activated',
            course_id: c.id,
            theme: c.theme,
            placed: placedNow,
            staged: stagedNow
          });
        }
      }
      flashSaved('course-saved');
      // Re-render the finalize strip to flip the button label + show
      // the "Active since" caption after activation.
      const created = c.createdAt ? c.createdAt.slice(0, 10) : '—';
      const updated = c.updatedAt ? c.updatedAt.slice(0, 10) : '—';
      const legCount = (c.legs || []).length;
      renderCourseFinalize(c, created, updated, legCount);
      // Header status pill (planning/in-progress) lives in renderCourseView's
      // top section; refresh it too so the status pill updates immediately.
      const headerStatus = document.querySelector('#course-body .course-status');
      if (headerStatus) headerStatus.textContent = c.status || 'planning';
      return;
    }
    if (tgt.id === 'course-comprehend-capture') {
      const ta = document.getElementById('course-comprehend-input');
      const text = ta ? ta.value.trim() : '';
      if (!text) return;
      const leg = findActiveLeg();
      if (!leg) return; // form is hidden when no active leg, but guard anyway
      leg.comprehend = Array.isArray(leg.comprehend) ? leg.comprehend.slice() : [];
      leg.comprehend.push({ at: new Date().toISOString(), text: text });
      upsertLeg(leg);
      flashSaved('course-comprehend-saved');
      renderCourseComprehend();
      return;
    }
  });

  /* ── Information Station — four-lane flow view ── */

  // Mock items for the four lanes (MVP: static sample content)
  const STATION_MOCK_LANES = [
    {
      id: 'incoming',
      label: 'Incoming',
      items: [
        { id: 'sm-1', title: 'pitch-deck-Q3.pdf', type: 'raw', grade: 'C',  meta: 'Dropped 2 days ago' },
        { id: 'sm-2', title: 'vision-doc.md',     type: 'raw', grade: 'B',  meta: 'Dropped yesterday' },
        { id: 'sm-3', title: 'website-hero.txt',  type: 'raw', grade: 'C',  meta: 'Dropped today' },
      ],
    },
    {
      id: 'in-discussion',
      label: 'In Discussion',
      items: [
        { id: 'sm-4', title: 'Vision SoT (draft)',     type: 'sot', grade: 'B',  meta: 'Raven is reviewing' },
        { id: 'sm-5', title: 'Bets SoT (in progress)', type: 'sot', grade: 'C',  meta: 'Awaiting your edits' },
      ],
    },
    {
      id: 'awaiting-nod',
      label: 'Awaiting Your Nod',
      items: [
        { id: 'sm-6', title: 'Bets SoT — ready for your approval', type: 'approval', grade: 'B', meta: 'Grade B+ if approved' },
      ],
    },
    {
      id: 'banked',
      label: 'Banked',
      items: [
        { id: 'sm-7', title: 'Product Thesis — Win by being only X', type: 'banked', grade: 'A', meta: 'Grade A · Vision' },
        { id: 'sm-8', title: 'Component — Onboarding Canvas',        type: 'banked', grade: 'B', meta: 'Grade B+ · Skeleton' },
        { id: 'sm-9', title: 'User — Director persona',              type: 'banked', grade: 'B', meta: 'Grade B · User research' },
      ],
    },
  ];

  const STATION_TYPE_ICON = {
    raw:      '📄',
    sot:      '📜',
    approval: '✉',
    banked:   '✦',
  };
  const STATION_TYPE_CLASS = {
    raw:      'station-item-raw',
    sot:      'station-item-sot',
    approval: 'station-item-approval',
    banked:   'station-item-banked',
  };

  function renderByStatusView() {
    const board = document.getElementById('station-board');
    if (!board) return;

    const lanesHtml = STATION_MOCK_LANES.map(lane => {
      const itemsHtml = lane.items.length === 0
        ? '<div class="station-lane-empty">Nothing here yet</div>'
        : lane.items.map(it => {
            const typeClass = STATION_TYPE_CLASS[it.type] || '';
            const icon      = STATION_TYPE_ICON[it.type] || '·';
            return `<div class="station-item ${typeClass}"
                         data-station-item="${escapeHTML(it.id)}"
                         data-grade="${escapeHTML(it.grade || 'C')}"
                         role="button" tabindex="0"
                         aria-label="${escapeHTML(it.title)}">
              <div class="station-item-title">
                <span class="station-item-type-icon" aria-hidden="true">${icon}</span>${escapeHTML(it.title)}
              </div>
              <div class="station-item-meta">${escapeHTML(it.meta || '')}</div>
            </div>`;
          }).join('');

      const countLabel = lane.items.length === 1 ? '1 item' : `${lane.items.length} items`;

      return `<div class="station-lane" data-lane="${escapeHTML(lane.id)}">
        <div class="station-lane-head">
          <div class="station-lane-label">${escapeHTML(lane.label)}</div>
          <div class="station-lane-count">${countLabel}</div>
        </div>
        <div class="station-lane-body">${itemsHtml}</div>
      </div>`;
    }).join('');

    board.innerHTML = lanesHtml;
  }

  /* ── Wire toggle clicks (legacy .vt-btn; top bar Station tab is wired separately) ── */
  document.querySelectorAll('.vt-btn').forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });

  /* ── Delegated click on station items (stub — opens console info for now) ── */
  document.getElementById('by-status-view').addEventListener('click', (e) => {
    const item = e.target.closest('[data-station-item]');
    if (!item) return;
    console.info('[Station] Item clicked:', item.dataset.stationItem);
  });
  document.getElementById('by-status-view').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const item = e.target.closest('[data-station-item]');
    if (!item) return;
    e.preventDefault();
    console.info('[Station] Item activated:', item.dataset.stationItem);
  });

  /* ──────────────────────────────────────────────────────────────
     Cmd-K search palette
     Indexes items, areas, lab notes, decisions, refs, shipped.
     Keyboard nav, teleports back to Floor + opens the right drawer.
     ────────────────────────────────────────────────────────────── */

  let SEARCH_INDEX = [];
  let cmdkOpen = false;
  let cmdkResults = [];
  let cmdkSelected = 0;

  const cmdkOverlay = document.getElementById('cmdk-overlay');
  const cmdkInput   = document.getElementById('cmdk-input');
  const cmdkResultsEl = document.getElementById('cmdk-results');

  function buildSearchIndex() {
    const idx = [];

    // Items (baseline + newly promoted)
    const allIts = Object.values(baseline.items).concat(Object.values(shadow.newItems || {}));
    allIts.forEach(it => {
      const area = resolveAreaForItem(it);
      idx.push({
        type: 'item',
        key: 'item:' + it.id,
        label: it.title,
        sub: (area ? area.name : '—') + (it.brief ? ' · ' + it.brief : ''),
        hay: [it.id, it.title, it.brief, it.full, area ? area.name : ''].filter(Boolean).join(' ').toLowerCase(),
        priority: it.priority,
        areaId: area ? area.id : null,
        itemId: it.id,
      });
    });

    // Areas
    baseline.areas.forEach(a => {
      idx.push({
        type: 'area',
        key: 'area:' + a.id,
        label: a.name,
        sub: a.description || a.type || '',
        hay: [a.id, a.name, a.type, a.description].filter(Boolean).join(' ').toLowerCase(),
        areaId: a.id,
      });
    });

    // Notes (labNotes + notes)
    baseline.areas.forEach(a => {
      (a.labNotes || []).forEach((n, i) => {
        idx.push({
          type: 'note',
          key: 'note:' + a.id + ':' + i,
          label: n.text,
          sub: a.name + (n.date ? ' · ' + n.date : ''),
          hay: [a.name, n.text, n.date].filter(Boolean).join(' ').toLowerCase(),
          areaId: a.id,
        });
      });
      (a.notes || []).forEach((n, i) => {
        const text = typeof n === 'string' ? n : (n && n.text) || '';
        const date = (n && n.date) || '';
        if (!text) return;
        idx.push({
          type: 'note',
          key: 'note2:' + a.id + ':' + i,
          label: text,
          sub: a.name + (date ? ' · ' + date : ''),
          hay: [a.name, text, date].filter(Boolean).join(' ').toLowerCase(),
          areaId: a.id,
        });
      });
    });

    // Decisions
    baseline.areas.forEach(a => {
      (a.decisions || []).forEach((d, i) => {
        idx.push({
          type: 'decision',
          key: 'dec:' + a.id + ':' + i,
          label: d.text,
          sub: a.name + (d.date ? ' · ' + d.date : ''),
          hay: [a.name, d.text, d.date].filter(Boolean).join(' ').toLowerCase(),
          areaId: a.id,
        });
      });
    });

    // Refs (Library)
    baseline.areas.forEach(a => {
      (a.refs || []).forEach((r, i) => {
        idx.push({
          type: 'ref',
          key: 'ref:' + a.id + ':' + i,
          label: r,
          sub: a.name,
          hay: [a.name, r].filter(Boolean).join(' ').toLowerCase(),
          areaId: a.id,
        });
      });
    });

    // Shipped
    baseline.areas.forEach(a => {
      (a.shipped || []).forEach((s, i) => {
        idx.push({
          type: 'shipped',
          key: 'ship:' + a.id + ':' + i,
          label: s,
          sub: a.name,
          hay: [a.name, s].filter(Boolean).join(' ').toLowerCase(),
          areaId: a.id,
        });
      });
    });

    SEARCH_INDEX = idx;
  }

  function scoreMatch(entry, tokens) {
    if (tokens.length === 0) return 0;
    let score = 0;
    for (const t of tokens) {
      const i = entry.hay.indexOf(t);
      if (i === -1) return -1;
      score += i;
    }
    const labelLow = entry.label.toLowerCase();
    if (labelLow.startsWith(tokens[0])) score -= 1000;
    else if (labelLow.includes(tokens[0])) score -= 200;
    if (entry.type === 'item') score -= 60;
    if (entry.type === 'area') score -= 40;
    return score;
  }

  function searchEntries(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      // Empty state: in-progress items first, then P0 items, capped.
      const inProg = SEARCH_INDEX
        .filter(e => e.type === 'item' && getItemStatus(e.itemId) === 'in-progress');
      const p0 = SEARCH_INDEX
        .filter(e => e.type === 'item' && e.priority === 'P0' && getItemStatus(e.itemId) !== 'in-progress' && getItemStatus(e.itemId) !== 'archived' && getItemStatus(e.itemId) !== 'live');
      const seen = new Set();
      const list = [];
      [...inProg, ...p0].forEach(e => { if (!seen.has(e.key)) { seen.add(e.key); list.push(e); } });
      return list.slice(0, 10);
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    const scored = [];
    for (const entry of SEARCH_INDEX) {
      const s = scoreMatch(entry, tokens);
      if (s >= 0 || s < 0 && s > -10000) {
        if (s !== -1) scored.push({ entry, score: s });
      }
    }
    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, 30).map(s => s.entry);
  }

  function highlightMatch(text, tokens) {
    if (!tokens || tokens.length === 0) return escapeHTML(text);
    const lower = text.toLowerCase();
    // Find earliest match for any token, then highlight all token matches non-overlapping.
    const ranges = [];
    tokens.forEach(t => {
      let from = 0;
      while (true) {
        const i = lower.indexOf(t, from);
        if (i === -1) break;
        ranges.push([i, i + t.length]);
        from = i + t.length;
      }
    });
    if (ranges.length === 0) return escapeHTML(text);
    ranges.sort((a, b) => a[0] - b[0]);
    // Merge overlapping
    const merged = [ranges[0]];
    for (let i = 1; i < ranges.length; i++) {
      const last = merged[merged.length - 1];
      if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1]);
      else merged.push(ranges[i]);
    }
    let out = '', cur = 0;
    merged.forEach(([s, e]) => {
      out += escapeHTML(text.slice(cur, s));
      out += '<mark>' + escapeHTML(text.slice(s, e)) + '</mark>';
      cur = e;
    });
    out += escapeHTML(text.slice(cur));
    return out;
  }

  function renderCmdk() {
    const q = cmdkInput.value;
    cmdkResults = searchEntries(q);
    if (cmdkSelected >= cmdkResults.length) cmdkSelected = 0;
    const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);

    if (cmdkResults.length === 0) {
      cmdkResultsEl.innerHTML = `<div class="cmdk-empty">No matches in items, areas, notes, decisions, or refs.</div>`;
      return;
    }

    const headerLabel = q.trim()
      ? `${cmdkResults.length} match${cmdkResults.length === 1 ? '' : 'es'}`
      : 'In progress · P0 next';

    let html = `<div class="cmdk-section-h">${escapeHTML(headerLabel)}</div>`;
    cmdkResults.forEach((e, i) => {
      const v = e.areaId ? visualFor(e.areaId) : { icon: '·', accent: 'dark' };
      const selected = i === cmdkSelected ? ' selected' : '';
      const priChip = (e.type === 'item' && e.priority)
        ? `<span class="ck-pri ${e.priority}">${e.priority}</span>` : '';
      html += `<div class="cmdk-row${selected}" data-i="${i}">
        <span class="ck-icon">${v.icon || '·'}</span>
        <span class="ck-type" data-t="${e.type}">${e.type}</span>
        <span class="ck-text">
          <span class="ck-label">${highlightMatch(e.label || '', tokens)}</span>
          <span class="ck-sub">${highlightMatch(e.sub || '', tokens)}</span>
        </span>
        ${priChip}
      </div>`;
    });
    cmdkResultsEl.innerHTML = html;

    // Keep selected row in view
    const selEl = cmdkResultsEl.querySelector('.cmdk-row.selected');
    if (selEl) selEl.scrollIntoView({ block: 'nearest' });
  }

  function openCmdk() {
    cmdkOpen = true;
    cmdkOverlay.classList.add('open');
    cmdkInput.value = '';
    cmdkSelected = 0;
    renderCmdk();
    setTimeout(() => cmdkInput.focus(), 0);
  }

  function closeCmdk() {
    cmdkOpen = false;
    cmdkOverlay.classList.remove('open');
  }

  function activateCmdkResult(i) {
    const e = cmdkResults[i];
    if (!e) return;
    closeCmdk();
    if (!e.areaId) return;

    setView('floor');
    openDrawer(e.areaId);

    if (e.type === 'item' && e.itemId) {
      const area = baseline.areas.find(a => a.id === e.areaId);
      if (area && !area.workshop && typeof openDrilldown === 'function') {
        setTimeout(() => openDrilldown(e.itemId), 30);
      }
    }
  }

  /* Wire up events */
  document.getElementById('cmdk-trigger').addEventListener('click', openCmdk);

  cmdkInput.addEventListener('input', () => {
    cmdkSelected = 0;
    renderCmdk();
  });

  cmdkInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdkResults.length > 0) {
        cmdkSelected = (cmdkSelected + 1) % cmdkResults.length;
        renderCmdk();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdkResults.length > 0) {
        cmdkSelected = (cmdkSelected - 1 + cmdkResults.length) % cmdkResults.length;
        renderCmdk();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activateCmdkResult(cmdkSelected);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCmdk();
    }
  });

  // Click result rows
  cmdkResultsEl.addEventListener('click', (e) => {
    const row = e.target.closest('.cmdk-row');
    if (!row) return;
    activateCmdkResult(parseInt(row.dataset.i, 10));
  });

  // Hover row updates selection (without re-render churn)
  cmdkResultsEl.addEventListener('mousemove', (e) => {
    const row = e.target.closest('.cmdk-row');
    if (!row) return;
    const i = parseInt(row.dataset.i, 10);
    if (i === cmdkSelected) return;
    cmdkSelected = i;
    cmdkResultsEl.querySelectorAll('.cmdk-row').forEach(r => r.classList.remove('selected'));
    row.classList.add('selected');
  });

  // Click overlay (outside palette) closes
  cmdkOverlay.addEventListener('click', (e) => {
    if (e.target === cmdkOverlay) closeCmdk();
  });

  // Global ⌘K / Ctrl-K hotkey + Esc when palette is closed (no-op)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (cmdkOpen) closeCmdk();
      else openCmdk();
    } else if (e.key === 'Escape' && cmdkOpen) {
      // already handled by input keydown when input has focus, but also catch when not focused
      closeCmdk();
    }
  });

  /* ── Init ──
     Hydrate localStorage from the server's canonical files first (if available),
     then bootstrap the UI. On plain `python -m http.server` the fetches 404 and
     we fall through to the existing localStorage-only behavior. */

  // Move 2d: walk-mode detection. When the lab loads inside a Walk
  // Studio iframe with `?walk=1`, mark the body and inject a banner
  // so the user has a wayfinding handle. CSS hides the Comprehend
  // Station from the floor to prevent recursive Walk Studios.
  (function applyWalkMode() {
    let walkFlag = false;
    try {
      walkFlag = new URLSearchParams(location.search).get('walk') === '1';
    } catch {}
    if (!walkFlag) return;
    document.body.classList.add('walk-mode');
    const banner = document.createElement('div');
    banner.className = 'walk-banner';
    banner.textContent = '⚑ Walk in progress — close from the Comprehend Station to return to the full lab';
    document.body.insertBefore(banner, document.body.firstChild);
    // Hide the Comprehend Station area from assistive tech as well as
    // visually — the CSS already opacity-dims it; aria-hidden suppresses
    // screen-reader announcements of the inert overlay text. The script
    // runs as deferred-inline at the bottom of <body>, so the DOM is
    // fully parsed by now and the area element is queryable directly
    // (a DOMContentLoaded wrapper would never fire — that event has
    // already passed by the time this code executes).
    const inertArea = document.querySelector('.area[data-area="comprehend-station"]');
    if (inertArea) inertArea.setAttribute('aria-hidden', 'true');
  })();

  hydrateFromServer().then(() => {
    renderFloorBadges();
    buildAreaVisuals();
    buildSearchIndex();
    wireGapsHandlers();
    setView(loadActiveView());
    initTodayFrameStrip();
  });

  // Expose setView so the new top-bar tabs (Home / Station) can drive the
  // canvas view from outside this IIFE. Without this, those tabs no-op.
  window.setView = setView;

})();
