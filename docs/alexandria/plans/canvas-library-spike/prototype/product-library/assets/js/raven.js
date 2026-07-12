(function ravenCanvas() {
  'use strict';

  // ── State ────────────────────────────────────────
  let ravenSubOpen     = false;
  let ravenActiveSurf  = null;   // 'knowledge-bank' | 'playbook' | null
  let ravenSurfInited  = {};

  const SURFACE_NAMES = {
    'knowledge-bank': "Raven's Knowledge Bank",
    'playbook':       "Raven's Playbook",
  };

  // HTML / attribute escapers for any innerHTML that interpolates
  // library-derived strings (card titles, types, territory names, ids).
  // Today's library content is team-owned, but the same renderer will
  // eventually run against customer libraries — escape now while the
  // code is fresh and inputs are controlled.
  function escHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[ch]));
  }
  function escAttr(s) {
    return String(s ?? '').replace(/[&<>"']/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[ch]));
  }

  // ── Elements ─────────────────────────────────────
  const ravenCoin       = document.getElementById('raven-coin');
  const subButtons      = document.getElementById('raven-sub-buttons');
  const overlay         = document.getElementById('raven-surface-overlay');
  const overlayTitle    = document.getElementById('raven-overlay-title');
  const overlayClose    = document.getElementById('raven-overlay-close');

  function getSurface(name) {
    return document.getElementById('raven-surface-' + name);
  }

  // ── Surface show/hide ────────────────────────────
  function ravenShowSurface(name) {
    // Hide underlying home/floor content while a Raven surface is open.
    document.body.classList.add('raven-overlay-open');
    // Deactivate all
    document.querySelectorAll('.raven-surface').forEach(el => el.classList.remove('raven-active'));
    // Activate target
    const target = getSurface(name);
    if (target) target.classList.add('raven-active');

    overlayTitle.textContent = SURFACE_NAMES[name] || name;
    overlay.hidden = false;
    ravenActiveSurf = name;

    // Lazy init
    if (!ravenSurfInited[name]) {
      ravenSurfInited[name] = true;
      if (name === 'knowledge-bank') ravenInitKnowledgeBank();
      if (name === 'library') ravenInitLibrary();
    }
  }

  function ravenCloseSurface() {
    overlay.hidden = true;
    document.querySelectorAll('.raven-surface').forEach(el => el.classList.remove('raven-active'));
    ravenActiveSurf = null;
    // Restore underlying home/floor content.
    document.body.classList.remove('raven-overlay-open');
    // Dim coin if no surface active
    if (!ravenSubOpen) ravenCoin.classList.remove('raven-lit');
  }

  // ── Sub-button open/close ────────────────────────
  function ravenOpenSubs() {
    ravenSubOpen = true;
    subButtons.classList.add('open');
    document.body.classList.add('subs-open');
    ravenCoin.classList.add('raven-lit');
    // Transition coin state from dormant to surfacing — she's engaged.
    if (ravenCoin.dataset.state === 'dormant') ravenCoin.dataset.state = 'surfacing';
    ravenCoin.setAttribute('aria-expanded', 'true');
  }
  function ravenCloseSubs() {
    ravenSubOpen = false;
    subButtons.classList.remove('open');
    document.body.classList.remove('subs-open');
    if (!ravenActiveSurf) ravenCoin.classList.remove('raven-lit');
    // Return to dormant when sub-buttons close and no surface is active.
    if (!ravenActiveSurf && ravenCoin.dataset.state === 'surfacing') ravenCoin.dataset.state = 'dormant';
    ravenCoin.setAttribute('aria-expanded', 'false');
  }

  // ── Coin click ───────────────────────────────────
  ravenCoin.addEventListener('click', (e) => {
    e.stopPropagation();
    if (ravenSubOpen) ravenCloseSubs();
    else ravenOpenSubs();
  });
  ravenCoin.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ravenCoin.click(); }
  });

  // ── Sub-button clicks ────────────────────────────
  subButtons.querySelectorAll('.raven-sub-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const surf = btn.dataset.ravenSurface;
      if (surf === 'ping') {
        // Ping Raven: emit a ping event to step-events.jsonl. The
        // canvas-watcher Stop hook picks it up on the director's
        // next idle turn and wakes Raven with the event + any
        // other accumulated activity. Rate-limited server-side
        // (PING_DEBOUNCE_MS) so spamming the button costs nothing.
        ravenCloseSubs();
        const stepInfo = typeof window.__activeStep === 'function'
          ? window.__activeStep()
          : null;
        const step = (stepInfo && stepInfo.stepId) || '?';
        btn.classList.add('raven-sub-btn-pinged');
        const label = btn.querySelector('.raven-wake-label');
        const originalText = label ? label.textContent : null;
        if (label) label.textContent = 'Pinging…';
        fetch('/api/canvas/ping', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ step }),
        }).then((res) => {
          if (label) label.textContent = res.ok ? 'Ping sent ✓' : 'Ping failed';
        }).catch(() => {
          if (label) label.textContent = 'Ping failed';
        }).finally(() => {
          setTimeout(() => {
            if (label && originalText) label.textContent = originalText;
            btn.classList.remove('raven-sub-btn-pinged');
          }, 1800);
        });
        return;
      }
      ravenShowSurface(surf);
      ravenCloseSubs();
      ravenCoin.classList.add('raven-lit');
    });
  });

  // ── Overlay close ────────────────────────────────
  overlayClose.addEventListener('click', ravenCloseSurface);

  // ── Escape key ───────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!overlay.hidden) { ravenCloseSurface(); return; }
      if (ravenSubOpen) ravenCloseSubs();
    }
  });

  // ── Click outside subs ───────────────────────────
  document.addEventListener('click', () => {
    if (ravenSubOpen) ravenCloseSubs();
    ravenCloseAllUpgrades();
  });

  // ── Face-down coin → upgrade tooltip ─────────────
  function ravenCloseAllUpgrades() {
    document.querySelectorAll('.raven-coin-with-plate.upgrade-open').forEach(el => {
      el.classList.remove('upgrade-open');
      const tip = el.querySelector('.raven-upgrade-msg');
      if (tip) tip.setAttribute('aria-hidden', 'true');
    });
  }
  document.querySelectorAll('.raven-coin-with-plate[data-agent] .raven-facedown-coin').forEach(coin => {
    const wrap = coin.closest('.raven-coin-with-plate');
    const tip = wrap.querySelector('.raven-upgrade-msg');
    const open = () => {
      ravenCloseAllUpgrades();
      ravenCloseSubs();
      wrap.classList.add('upgrade-open');
      if (tip) tip.setAttribute('aria-hidden', 'false');
    };
    coin.addEventListener('click', (e) => {
      e.stopPropagation();
      if (wrap.classList.contains('upgrade-open')) {
        wrap.classList.remove('upgrade-open');
        if (tip) tip.setAttribute('aria-hidden', 'true');
      } else {
        open();
      }
    });
    coin.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); coin.click(); }
    });
  });

  // ── Library view toggle ──────────────────────────
  document.querySelectorAll('.raven-view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.raven-view-toggle-btn').forEach(b => b.classList.remove('raven-view-active'));
      btn.classList.add('raven-view-active');
      const view = btn.dataset.ravenView;
      document.getElementById('raven-view-constellation').style.display = view === 'constellation' ? 'block' : 'none';
      document.getElementById('raven-view-folders').style.display = view === 'folders' ? 'block' : 'none';
    });
  });

  // ═══════════════════════════════════════════════════
  // KNOWLEDGE BANK
  // ═══════════════════════════════════════════════════
  function ravenInitKnowledgeBank() {
    const el = document.getElementById('raven-surface-knowledge-bank');
    el.innerHTML = `
<div class="sheet">
  <div class="kb-header">
    <div class="kb-crest">Raven's Knowledge Bank <small>library build · first-session view</small></div>
    <div class="header-stats">
      <div class="stat core"><b>5</b><span>Core unlocked</span></div>
      <div class="stat plays"><b>2/8</b><span>plays earned</span></div>
      <div class="stat awaiting"><b>1</b><span>awaiting you</span></div>
      <div class="stat"><b>8</b><span>locked</span></div>
    </div>
  </div>

  <div class="kb-beacon">
    <div class="beacon-mark"></div>
    <div><b>Begin here.</b> &nbsp; The five glowing subjects activate basic Raven — spread across Strategy, Product, and Learning. <em>Each Core subject earns one play; together they unlock three more.</em></div>
    <div class="beacon-tip">→ click any play to see its path · click bands to collapse</div>
  </div>

  <div class="bands-column">
    <div class="filter-status" id="raven-kb-filter-status" hidden>
      <div>Showing <b id="raven-kb-fs-subjects">0 subjects</b> required for <b id="raven-kb-fs-plays">0 plays</b></div>
      <button class="filter-clear" id="raven-kb-filter-clear">← Back to full view</button>
    </div>

    <section class="band" data-band-id="strategy">
      <div class="band-header">
        <span class="band-chevron">▾</span>
        <div class="band-title">I · Strategy <small>the rationale — how we think we win</small></div>
        <div class="band-collapsed-mini-bars">
          <div class="mini-bar core"><span class="mini-seg"></span><span class="mini-seg"></span><span class="mini-seg"></span><span class="mini-seg"></span></div>
          <div class="mini-bar core"><span class="mini-seg"></span><span class="mini-seg"></span><span class="mini-seg"></span><span class="mini-seg"></span></div>
          <div class="mini-bar core"><span class="mini-seg"></span><span class="mini-seg"></span><span class="mini-seg"></span><span class="mini-seg"></span></div>
          <div class="mini-bar locked"></div>
        </div>
        <div class="band-progress"><b>3</b> Core glowing · <b>1</b> locked</div>
      </div>
      <div class="band-empty-note">No requirements in this band for the selected plays.</div>
      <div class="band-subjects">
        <div class="subject core" data-subject="vision">
          <div class="subject-text">
            <div class="subject-name"><span class="core-mark"></span> Vision</div>
            <div class="subject-desc">Where we're going. The end-state we're building toward.</div>
          </div>
          <div class="bar-wrap"><div class="bar"><div class="seg"></div><div class="seg"></div><div class="seg"></div><div class="seg"></div></div><div class="bar-labels"><span>Shared</span><span>Read</span><span>Discussed</span><span>Banked</span></div></div>
          <div class="status">&nbsp;</div>
        </div>
        <div class="subject core" data-subject="bets">
          <div class="subject-text">
            <div class="subject-name"><span class="core-mark"></span> Bets</div>
            <div class="subject-desc">The testable theses — and the assumptions each one rests on.</div>
          </div>
          <div class="bar-wrap"><div class="bar"><div class="seg"></div><div class="seg"></div><div class="seg"></div><div class="seg"></div></div><div class="bar-labels"><span>Shared</span><span>Read</span><span>Discussed</span><span>Banked</span></div></div>
          <div class="status">&nbsp;</div>
        </div>
        <div class="subject core untouched" data-subject="guardrails">
          <div class="subject-text">
            <div class="subject-name"><span class="core-mark"></span> Guardrails</div>
            <div class="subject-desc">What we'll always do (principles). What we'll never do (anti-patterns).</div>
          </div>
          <div class="bar-wrap"><div class="bar"><div class="seg"></div><div class="seg"></div><div class="seg"></div><div class="seg"></div></div><div class="bar-labels"><span>Shared</span><span>Read</span><span>Discussed</span><span>Banked</span></div></div>
          <div class="status begin">Begin here</div>
        </div>
        <div class="subject locked" data-subject="standards" data-unlock="Unlocks when Guardrails reaches Discussed">
          <div class="subject-text">
            <div class="subject-name"><svg class="lock-icon" viewBox="0 0 16 16"><path d="M5 7V5a3 3 0 016 0v2m-7 0h8a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg> Standards</div>
            <div class="subject-desc">The bars we hold ourselves to — voice, quality, accessibility.</div>
          </div>
          <div class="bar-wrap"><div class="bar"><div class="seg"></div><div class="seg"></div><div class="seg"></div><div class="seg"></div></div><div class="bar-labels"><span>Shared</span><span>Read</span><span>Discussed</span><span>Banked</span></div></div>
          <div class="status">Locked</div>
        </div>
      </div>
    </section>

    <section class="band" data-band-id="product">
      <div class="band-header">
        <span class="band-chevron">▾</span>
        <div class="band-title">II · Product <small>the nouns — what we're actually making</small></div>
        <div class="band-collapsed-mini-bars">
          <div class="mini-bar core"><span class="mini-seg filled"></span><span class="mini-seg awaiting"></span><span class="mini-seg"></span><span class="mini-seg"></span></div>
          <div class="mini-bar locked"></div><div class="mini-bar locked"></div><div class="mini-bar locked"></div><div class="mini-bar locked"></div>
        </div>
        <div class="band-progress"><b>1</b> Core in progress · <b>4</b> locked</div>
      </div>
      <div class="band-empty-note">No requirements in this band for the selected plays.</div>
      <div class="band-subjects">
        <div class="subject core" data-subject="vocabulary">
          <div class="subject-text">
            <div class="subject-name"><span class="core-mark"></span> Vocabulary</div>
            <div class="subject-desc">What we call things. The core objects and their relationships.</div>
          </div>
          <div class="bar-wrap"><div class="bar"><div class="seg filled"></div><div class="seg filled awaiting"></div><div class="seg"></div><div class="seg"></div></div><div class="bar-labels"><span>Shared</span><span>Read</span><span>Discussed</span><span>Banked</span></div></div>
          <div class="status awaiting">Raven's read · click to resume</div>
        </div>
        <div class="subject locked" data-subject="skeleton" data-unlock="Unlocks when Vocabulary reaches Discussed">
          <div class="subject-text">
            <div class="subject-name"><svg class="lock-icon" viewBox="0 0 16 16"><path d="M5 7V5a3 3 0 016 0v2m-7 0h8a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg> Skeleton</div>
            <div class="subject-desc">The structural bones — information architecture, system design.</div>
          </div>
          <div class="bar-wrap"><div class="bar"><div class="seg"></div><div class="seg"></div><div class="seg"></div><div class="seg"></div></div><div class="bar-labels"><span>Shared</span><span>Read</span><span>Discussed</span><span>Banked</span></div></div>
          <div class="status">Locked</div>
        </div>
        <div class="subject locked" data-subject="experience" data-unlock="Unlocks when Vocabulary reaches Discussed">
          <div class="subject-text">
            <div class="subject-name"><svg class="lock-icon" viewBox="0 0 16 16"><path d="M5 7V5a3 3 0 016 0v2m-7 0h8a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg> Experience</div>
            <div class="subject-desc">Journeys, emotion, loops, progression — how the product lands over time.</div>
          </div>
          <div class="bar-wrap"><div class="bar"><div class="seg"></div><div class="seg"></div><div class="seg"></div><div class="seg"></div></div><div class="bar-labels"><span>Shared</span><span>Read</span><span>Discussed</span><span>Banked</span></div></div>
          <div class="status">Locked</div>
        </div>
        <div class="subject locked" data-subject="surface" data-unlock="Unlocks when Vocabulary reaches Discussed">
          <div class="subject-text">
            <div class="subject-name"><svg class="lock-icon" viewBox="0 0 16 16"><path d="M5 7V5a3 3 0 016 0v2m-7 0h8a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg> Surface</div>
            <div class="subject-desc">Design system, interaction patterns, mockups, accessibility.</div>
          </div>
          <div class="bar-wrap"><div class="bar"><div class="seg"></div><div class="seg"></div><div class="seg"></div><div class="seg"></div></div><div class="bar-labels"><span>Shared</span><span>Read</span><span>Discussed</span><span>Banked</span></div></div>
          <div class="status">Locked</div>
        </div>
        <div class="subject locked" data-subject="forward-plan" data-unlock="Unlocks when all 5 Core subjects reach Discussed">
          <div class="subject-text">
            <div class="subject-name"><svg class="lock-icon" viewBox="0 0 16 16"><path d="M5 7V5a3 3 0 016 0v2m-7 0h8a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg> Forward plan</div>
            <div class="subject-desc">What's coming. What's deferred. The release sequence.</div>
          </div>
          <div class="bar-wrap"><div class="bar"><div class="seg"></div><div class="seg"></div><div class="seg"></div><div class="seg"></div></div><div class="bar-labels"><span>Shared</span><span>Read</span><span>Discussed</span><span>Banked</span></div></div>
          <div class="status">Locked</div>
        </div>
      </div>
    </section>

    <section class="band" data-band-id="learning">
      <div class="band-header">
        <span class="band-chevron">▾</span>
        <div class="band-title">III · Learning <small>the evidence — what we actually know</small></div>
        <div class="band-collapsed-mini-bars">
          <div class="mini-bar core"><span class="mini-seg filled"></span><span class="mini-seg filled"></span><span class="mini-seg filled"></span><span class="mini-seg filled"></span></div>
          <div class="mini-bar locked"></div><div class="mini-bar locked"></div><div class="mini-bar locked"></div>
        </div>
        <div class="band-progress"><b>1</b> banked · <b>3</b> locked</div>
      </div>
      <div class="band-empty-note">No requirements in this band for the selected plays.</div>
      <div class="band-subjects">
        <div class="subject core" data-subject="user-research">
          <div class="subject-text">
            <div class="subject-name"><span class="core-mark"></span> User research</div>
            <div class="subject-desc">Who they are, what they want, what they do.</div>
          </div>
          <div class="bar-wrap"><div class="bar"><div class="seg filled"></div><div class="seg filled"></div><div class="seg filled"></div><div class="seg filled atomized"></div></div><div class="bar-labels"><span>Shared</span><span>Read</span><span>Discussed</span><span>Banked</span></div></div>
          <div class="status atomized">Banked</div>
        </div>
        <div class="subject locked" data-subject="competitive-intel" data-unlock="Unlocks when User research reaches Discussed">
          <div class="subject-text">
            <div class="subject-name"><svg class="lock-icon" viewBox="0 0 16 16"><path d="M5 7V5a3 3 0 016 0v2m-7 0h8a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg> Competitive intel</div>
            <div class="subject-desc">What else exists. What users could choose instead.</div>
          </div>
          <div class="bar-wrap"><div class="bar"><div class="seg"></div><div class="seg"></div><div class="seg"></div><div class="seg"></div></div><div class="bar-labels"><span>Shared</span><span>Read</span><span>Discussed</span><span>Banked</span></div></div>
          <div class="status">Locked</div>
        </div>
        <div class="subject locked" data-subject="decision-trail" data-unlock="Unlocks when User research reaches Discussed">
          <div class="subject-text">
            <div class="subject-name"><svg class="lock-icon" viewBox="0 0 16 16"><path d="M5 7V5a3 3 0 016 0v2m-7 0h8a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg> Decision trail</div>
            <div class="subject-desc">What was decided, when, why. Lessons from failures.</div>
          </div>
          <div class="bar-wrap"><div class="bar"><div class="seg"></div><div class="seg"></div><div class="seg"></div><div class="seg"></div></div><div class="bar-labels"><span>Shared</span><span>Read</span><span>Discussed</span><span>Banked</span></div></div>
          <div class="status">Locked</div>
        </div>
        <div class="subject locked" data-subject="product-evidence" data-unlock="Unlocks when all 5 Core subjects reach Discussed">
          <div class="subject-text">
            <div class="subject-name"><svg class="lock-icon" viewBox="0 0 16 16"><path d="M5 7V5a3 3 0 016 0v2m-7 0h8a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg> Product evidence</div>
            <div class="subject-desc">What the product is actually doing in the wild — analytics, retention, feedback.</div>
          </div>
          <div class="bar-wrap"><div class="bar"><div class="seg"></div><div class="seg"></div><div class="seg"></div><div class="seg"></div></div><div class="bar-labels"><span>Shared</span><span>Read</span><span>Discussed</span><span>Banked</span></div></div>
          <div class="status">Locked</div>
        </div>
      </div>
    </section>
  </div>

  <aside class="playbook-column">
    <section class="kb-playbook">
      <div class="playbook-header">
        <div class="playbook-title">Raven's Playbook</div>
        <div class="playbook-sub">click to see required subjects · click multiple to combine</div>
        <div class="playbook-progress">
          <span><b>2 of 8</b> plays earned</span>
          <button class="playbook-clear" id="raven-kb-playbook-clear" hidden>Clear</button>
        </div>
      </div>
      <div class="playbook-grid">
        <article class="play-card earned" data-play="jtbd-mirror" data-requires="user-research"><span class="info-btn">i</span><div class="card-glyph">⚐</div><div class="card-name">What They Need Mirror</div><div class="card-prereq"><em>User research</em> · earned</div></article>
        <article class="play-card earned" data-play="audience-sharpener" data-requires="user-research"><span class="info-btn">i</span><div class="card-glyph">◉</div><div class="card-name">Audience Sharpener</div><div class="card-prereq"><em>User research</em> · earned</div></article>
        <article class="play-card" data-play="surface-tour" data-requires="vocabulary"><span class="info-btn">i</span><div class="card-glyph">◇</div><div class="card-name">Surface Tour</div><div class="card-prereq"><em>Vocabulary</em> → Discussed</div></article>
        <article class="play-card" data-play="load-bearing-audit" data-requires="skeleton"><span class="info-btn">i</span><div class="card-glyph">▤</div><div class="card-name">Load-Bearing Audit</div><div class="card-prereq"><em>Skeleton</em> → Discussed</div></article>
        <article class="play-card" data-play="anti-position-pressure" data-requires="guardrails"><span class="info-btn">i</span><div class="card-glyph">⨯</div><div class="card-name">What We Refuse to Be</div><div class="card-prereq"><em>Guardrails</em> → Discussed</div></article>
        <article class="play-card" data-play="pre-mortem" data-requires="user-research,guardrails,bets"><span class="info-btn">i</span><div class="card-glyph">⚔</div><div class="card-name">Adversarial Pre-Mortem</div><div class="card-prereq"><em>User research · Guardrails · Bets</em></div></article>
        <article class="play-card" data-play="vocab-triage" data-requires="vocabulary,skeleton"><span class="info-btn">i</span><div class="card-glyph">✎</div><div class="card-name">Vocabulary Triage</div><div class="card-prereq"><em>Vocabulary · Skeleton</em></div></article>
        <article class="play-card" data-play="prd-critique" data-requires="vision,bets,guardrails,vocabulary,user-research"><span class="info-btn">i</span><div class="card-glyph">❦</div><div class="card-name">Product Spec Critique</div><div class="card-prereq"><em>All 5 Core</em> → Banked</div></article>
      </div>
    </section>
  </aside>

  <footer class="kb-legend">
    <div class="legend-row">
      <span><span class="legend-swatch core"></span> Core 5 · begin here</span>
      <span><span class="legend-swatch swept"></span> In progress</span>
      <span><span class="legend-swatch atomized"></span> Banked</span>
      <span><span class="legend-swatch awaiting"></span> Awaiting you</span>
      <span><span class="legend-swatch locked"></span> Locked</span>
    </div>
  </footer>
</div>`;

    // KB interaction
    const kbEl = el;
    const selectedPlays = new Set();
    const userToggled   = new Set();
    const defaultCollapsed = new Set();
    const $  = (sel, ctx) => (ctx || kbEl).querySelector(sel);
    const $$ = (sel, ctx) => Array.from((ctx || kbEl).querySelectorAll(sel));

    function computeRequired() {
      const req = new Set();
      selectedPlays.forEach(pid => {
        const card = $(`.play-card[data-play="${pid}"]`);
        if (!card) return;
        (card.dataset.requires || '').split(',').map(s => s.trim()).filter(Boolean).forEach(s => req.add(s));
      });
      return req;
    }

    function updateKB() {
      const required = computeRequired();
      const filtering = selectedPlays.size > 0;
      kbEl.classList.toggle('filter-mode', filtering);
      $$('.play-card').forEach(c => c.classList.toggle('selected', selectedPlays.has(c.dataset.play)));
      $$('.subject').forEach(r => r.classList.toggle('highlighted', filtering && required.has(r.dataset.subject)));
      $$('.band').forEach(band => {
        const bandId = band.dataset.bandId;
        const hasReq = $$('.subject', band).some(s => required.has(s.dataset.subject));
        band.classList.remove('filter-has-prereqs', 'filter-empty');
        if (filtering) {
          band.classList.add(hasReq ? 'filter-has-prereqs' : 'filter-empty');
        } else {
          const shouldCollapse = defaultCollapsed.has(bandId) !== userToggled.has(bandId);
          band.classList.toggle('collapsed', shouldCollapse);
        }
      });
      const fsEl = $('#raven-kb-filter-status');
      if (filtering) {
        fsEl.hidden = false;
        $('#raven-kb-fs-plays').textContent = selectedPlays.size + ' play' + (selectedPlays.size === 1 ? '' : 's');
        $('#raven-kb-fs-subjects').textContent = required.size + ' subject' + (required.size === 1 ? '' : 's');
      } else {
        fsEl.hidden = true;
      }
      const clearBtn = $('#raven-kb-playbook-clear');
      if (clearBtn) clearBtn.hidden = !filtering;
    }

    $$('.play-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('info-btn')) return;
        const pid = card.dataset.play;
        if (selectedPlays.has(pid)) selectedPlays.delete(pid); else selectedPlays.add(pid);
        updateKB();
      });
    });

    function clearAll() { selectedPlays.clear(); updateKB(); }
    const filterClearBtn   = $('#raven-kb-filter-clear');
    const playbookClearBtn = $('#raven-kb-playbook-clear');
    if (filterClearBtn)   filterClearBtn.addEventListener('click',   (e) => { e.stopPropagation(); clearAll(); });
    if (playbookClearBtn) playbookClearBtn.addEventListener('click', (e) => { e.stopPropagation(); clearAll(); });

    $$('.band-header').forEach(header => {
      header.addEventListener('click', () => {
        if (kbEl.classList.contains('filter-mode')) return;
        const band = header.closest('.band');
        const bandId = band.dataset.bandId;
        if (userToggled.has(bandId)) userToggled.delete(bandId); else userToggled.add(bandId);
        updateKB();
      });
    });

    updateKB();
  }

  // ═══════════════════════════════════════════════════
  // LIBRARY
  // ═══════════════════════════════════════════════════
  function ravenInitLibrary() {
    ravenInitConstellation();
    ravenInitFolders();
  }

  function ravenInitConstellation() {
    const container = document.getElementById('raven-view-constellation');
    container.innerHTML = `
<div class="sky-main">
  <div class="sky-frame"><svg id="raven-sky" viewBox="0 0 2000 1400" preserveAspectRatio="xMidYMid meet"></svg></div>
  <aside>
    <h3>Hover a star</h3>
    <div id="raven-c-hover-info"><span class="placeholder">Mouse over any card to see its title, type, and connections.</span></div>
    <h3>Territories</h3>
    <div id="raven-c-territory-legend"></div>
  </aside>
</div>`;

    const DATA = window.RAVEN_LIBRARY_DATA;
    if (!DATA) {
      document.getElementById('raven-c-hover-info').innerHTML = '<span class="placeholder">Library data not loaded — check raven-assets/library-graph.json.</span>';
      return;
    }

    const CLUSTER_CENTERS = {
      'experience/user-goals':    [200, 300],  'experience/flows':         [420, 180],
      'experience/sessions':      [600, 320],  'experience/interactions':  [340, 480],
      'experience/outcomes':      [180, 580],  'rationale/decisions':      [900, 120],
      'rationale/constraints':    [1100, 240], 'rationale/principles':     [780, 280],
      'rationale/product-theses': [1020, 420], 'product/artifacts':        [1020, 770],
      'product/capabilities':     [320, 760],  'product/systems':          [1520, 200],
      'product/agents':           [310, 1050], 'product/sections':         [1320, 200],
      'product/components':       [1620, 430], 'product/domains':          [690, 200],
      'product/primitives':       [1620, 1170],'product/governance':       [1420, 1230],
      'product/templates':        [560, 1180], 'temporal/root':            [80, 1300],
    };
    const TERRITORY_COLORS = { experience: '#e8b86d', product: '#d4a052', rationale: '#b88a3a', temporal: '#7a9eb0' };
    const TERRITORY_BG     = { experience: 'rgba(232,184,109,0.04)', product: 'rgba(212,160,82,0.05)', rationale: 'rgba(184,138,58,0.04)', temporal: 'rgba(122,158,176,0.05)' };

    const GOLDEN = Math.PI * (3 - Math.sqrt(5));
    const positions = {};
    const cardsByCluster = {};
    DATA.cards.forEach(c => {
      const key = c.territory + '/' + c.subfolder;
      (cardsByCluster[key] = cardsByCluster[key] || []).push(c);
    });

    Object.entries(cardsByCluster).forEach(([key, cards]) => {
      const center = CLUSTER_CENTERS[key];
      if (!center) return;
      const n = cards.length;
      const sc = n > 60 ? 18 : n > 20 ? 16 : n > 8 ? 18 : 22;
      cards.forEach((card, i) => {
        const r = sc * Math.sqrt(i + 0.5);
        const theta = i * GOLDEN;
        positions[card.id] = [center[0] + r * Math.cos(theta), center[1] + r * Math.sin(theta)];
      });
    });

    const cardLookup = Object.fromEntries(DATA.cards.map(c => [c.id, c]));
    const edges = DATA.edges.filter(e => positions[e.from] && positions[e.to]);
    edges.forEach(e => {
      const a = cardLookup[e.from], b = cardLookup[e.to];
      e.cross = a && b && (a.territory + '/' + a.subfolder) !== (b.territory + '/' + b.subfolder);
    });

    const svg = document.getElementById('raven-sky');
    const NS = 'http://www.w3.org/2000/svg';
    function svgEl(tag, attrs) {
      const e = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
      return e;
    }

    // Territory tints
    const terrBounds = {};
    Object.entries(CLUSTER_CENTERS).forEach(([key, [x, y]]) => {
      const terr = key.split('/')[0];
      if (!terrBounds[terr]) terrBounds[terr] = { minX: x, maxX: x, minY: y, maxY: y };
      terrBounds[terr].minX = Math.min(terrBounds[terr].minX, x);
      terrBounds[terr].maxX = Math.max(terrBounds[terr].maxX, x);
      terrBounds[terr].minY = Math.min(terrBounds[terr].minY, y);
      terrBounds[terr].maxY = Math.max(terrBounds[terr].maxY, y);
    });
    Object.entries(terrBounds).forEach(([terr, b]) => {
      const cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
      const rx = (b.maxX - b.minX) / 2 + 200, ry = (b.maxY - b.minY) / 2 + 200;
      svg.appendChild(svgEl('ellipse', { cx, cy, rx, ry, fill: TERRITORY_BG[terr] || 'transparent' }));
    });

    // Cluster boundaries
    Object.entries(cardsByCluster).forEach(([key, cards]) => {
      const center = CLUSTER_CENTERS[key];
      if (!center) return;
      const n = cards.length;
      const sc = n > 60 ? 18 : n > 20 ? 16 : n > 8 ? 18 : 22;
      svg.appendChild(svgEl('circle', { class: 'raven-c-cluster-boundary', cx: center[0], cy: center[1], r: sc * Math.sqrt(n) + 18 }));
    });

    // Edges
    const edgeGroup = svgEl('g');
    edges.forEach(e => {
      const [x1, y1] = positions[e.from], [x2, y2] = positions[e.to];
      edgeGroup.appendChild(svgEl('line', { class: 'raven-c-edge' + (e.cross ? ' cross' : ''), x1, y1, x2, y2, 'data-from': e.from, 'data-to': e.to }));
    });
    svg.appendChild(edgeGroup);

    // Stars
    const starGroup = svgEl('g');
    const starsByCard = {};
    DATA.cards.forEach(c => {
      const pos = positions[c.id];
      if (!pos) return;
      const [x, y] = pos;
      const color = TERRITORY_COLORS[c.territory] || '#e8b86d';
      const g = svgEl('g', { class: 'raven-c-star', 'data-id': c.id });
      g.appendChild(svgEl('circle', { class: 'raven-c-star-glow', cx: x, cy: y, r: 12, fill: color }));
      g.appendChild(svgEl('circle', { class: 'raven-c-star-halo', cx: x, cy: y, r: 5.5, fill: color }));
      g.appendChild(svgEl('circle', { class: 'raven-c-star-core', cx: x, cy: y, r: 2.4, fill: color }));
      starGroup.appendChild(g);
      starsByCard[c.id] = g;
    });
    svg.appendChild(starGroup);

    // Labels
    const labelGroup = svgEl('g');
    Object.entries(cardsByCluster).forEach(([key, cards]) => {
      const center = CLUSTER_CENTERS[key];
      if (!center) return;
      const n = cards.length;
      const sc = n > 60 ? 18 : n > 20 ? 16 : n > 8 ? 18 : 22;
      const r = sc * Math.sqrt(n) + 40;
      const subname = key.split('/')[1];
      const lEl = svgEl('text', { class: 'raven-c-cluster-label', x: center[0], y: center[1] - r });
      lEl.textContent = subname;
      labelGroup.appendChild(lEl);
      const cEl = svgEl('text', { class: 'raven-c-cluster-count', x: center[0], y: center[1] - r + 14 });
      cEl.textContent = n + ' card' + (n === 1 ? '' : 's');
      labelGroup.appendChild(cEl);
    });
    svg.appendChild(labelGroup);

    // Hover
    const hoverInfo = document.getElementById('raven-c-hover-info');
    function highlightStar(card) {
      Object.values(starsByCard).forEach(s => s.classList.remove('highlight', 'faded'));
      Array.from(edgeGroup.children).forEach(e => e.classList.remove('highlight'));
      if (!card) { hoverInfo.innerHTML = '<span class="placeholder">Mouse over any card to see its title, type, and connections.</span>'; return; }
      starsByCard[card.id] && starsByCard[card.id].classList.add('highlight');
      const connected = new Set();
      Array.from(edgeGroup.children).forEach(line => {
        const f = line.getAttribute('data-from'), t = line.getAttribute('data-to');
        if (f === card.id) { connected.add(t); line.classList.add('highlight'); }
        if (t === card.id) { connected.add(f); line.classList.add('highlight'); }
      });
      Object.values(starsByCard).forEach(s => {
        if (s.getAttribute('data-id') !== card.id && !connected.has(s.getAttribute('data-id'))) s.classList.add('faded');
      });
      hoverInfo.innerHTML = `<div class="c-label">Title</div><b>${escHtml(card.title)}</b><div class="c-label">Type</div>${escHtml(card.type)}<div class="c-label">Where</div>${escHtml(card.territory)} / ${escHtml(card.subfolder)}<div class="c-label">Connections</div>${connected.size} neighbors`;
    }
    starGroup.addEventListener('mouseover', e => { const s = e.target.closest('.raven-c-star'); if (s) highlightStar(cardLookup[s.getAttribute('data-id')]); });
    starGroup.addEventListener('mouseleave', () => highlightStar(null));

    // Territory legend
    const terrLegend = document.getElementById('raven-c-territory-legend');
    const terrCounts = {};
    DATA.cards.forEach(c => terrCounts[c.territory] = (terrCounts[c.territory] || 0) + 1);
    Object.entries(terrCounts).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => {
      const row = document.createElement('div');
      row.className = 'raven-c-territory-row';
      row.innerHTML = `<span><span class="raven-c-dot" style="background:${TERRITORY_COLORS[t]};color:${TERRITORY_COLORS[t]}"></span>${escHtml(t)}</span><span><b>${n}</b><em>cards</em></span>`;
      terrLegend.appendChild(row);
    });
  }

  function ravenInitFolders() {
    const container = document.getElementById('raven-view-folders');
    const DATA = window.RAVEN_LIBRARY_DATA;
    if (!DATA) {
      container.innerHTML = '<p style="padding:24px;color:var(--fg-dim);font-family:var(--font-display);font-style:italic;">Library data not loaded.</p>';
      return;
    }

    container.innerHTML = `
<div id="raven-vf-search-bar">
  <input id="raven-vf-search" type="text" placeholder="Search cards, subfolders, types…" />
  <div id="raven-vf-results"></div>
</div>
<div id="raven-vf-library-pane"></div>
<div id="raven-vf-drawer">
  <div class="raven-vf-drawer-head"><h2>Card Detail</h2><button class="raven-vf-drawer-close" id="raven-vf-drawer-close">×</button></div>
  <div id="raven-vf-detail-title"></div>
  <div id="raven-vf-detail-meta"></div>
  <div id="raven-vf-detail-connections"></div>
</div>`;

    const pane = document.getElementById('raven-vf-library-pane');
    const byTerritory = {};
    DATA.cards.forEach(c => {
      (byTerritory[c.territory] = byTerritory[c.territory] || {})[c.subfolder] = (byTerritory[c.territory][c.subfolder] || []);
      byTerritory[c.territory][c.subfolder].push(c);
    });

    let openStack = null;

    Object.entries(byTerritory).sort().forEach(([territory, subfolders]) => {
      const totalCards = Object.values(subfolders).reduce((a, b) => a + b.length, 0);
      const terrDiv = document.createElement('div');
      terrDiv.className = 'raven-vf-territory';
      terrDiv.innerHTML = `
        <div class="raven-vf-territory-header">
          <span class="raven-vf-terr-chevron">▾</span>
          <div><span class="raven-vf-territory-name">${escHtml(territory)}</span><span class="raven-vf-territory-sub">· ${Object.keys(subfolders).length} subfolders</span></div>
          <div class="raven-vf-territory-count"><b>${totalCards}</b> cards</div>
        </div>
        <div class="raven-vf-shelf"></div>`;

      terrDiv.querySelector('.raven-vf-territory-header').addEventListener('click', () => {
        terrDiv.classList.toggle('collapsed');
      });

      const shelf = terrDiv.querySelector('.raven-vf-shelf');
      Object.entries(subfolders).sort().forEach(([subfolder, cards]) => {
        const peek = cards.slice(0, 4);
        const stackDiv = document.createElement('div');
        stackDiv.className = 'raven-vf-stack';
        stackDiv.dataset.subfolder = subfolder;
        stackDiv.innerHTML = `
          <div class="raven-vf-folder-form">
            <div class="raven-vf-folder-layer back-3"></div>
            <div class="raven-vf-folder-layer back-2"></div>
            <div class="raven-vf-folder-layer back-1"></div>
            <div class="raven-vf-folder-layer raven-vf-folder-front">
              <h3>${escHtml(subfolder)}</h3>
              <div class="raven-vf-type">${escHtml(territory)}</div>
              <ul class="raven-vf-peek">${peek.map(c => `<li>${escHtml(c.title)}</li>`).join('')}${cards.length > 4 ? `<li class="more">+${cards.length - 4} more</li>` : ''}</ul>
              <div class="raven-vf-count">${cards.length}</div>
            </div>
          </div>
          <div class="raven-vf-open-form">
            <header class="raven-vf-folder-bar">
              <div>
                <h3>${escHtml(subfolder)}</h3>
                <div class="raven-vf-folder-meta"><b>${cards.length}</b> cards · ${escHtml(territory)}</div>
              </div>
              <button class="raven-vf-close-btn" aria-label="Close folder">×</button>
            </header>
            <div class="raven-vf-cards-grid">${cards.map(c => `<div class="raven-vf-doc-card" data-card-id="${escAttr(c.id)}"><div class="raven-vf-doc-title">${escHtml(c.title)}</div><div class="raven-vf-doc-meta">${escHtml(c.type)}</div></div>`).join('')}</div>
          </div>`;

        stackDiv.querySelector('.raven-vf-folder-form').addEventListener('click', () => {
          if (openStack && openStack !== stackDiv) openStack.classList.remove('opened');
          stackDiv.classList.add('opened');
          openStack = stackDiv;
        });
        stackDiv.querySelector('.raven-vf-close-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          stackDiv.classList.remove('opened');
          openStack = null;
        });

        stackDiv.querySelectorAll('.raven-vf-doc-card').forEach(docCard => {
          docCard.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = docCard.dataset.cardId;
            const card = DATA.cards.find(c => c.id === id);
            if (!card) return;
            document.querySelectorAll('.raven-vf-doc-card').forEach(d => d.classList.remove('selected'));
            docCard.classList.add('selected');
            const outbound = DATA.edges.filter(e => e.from === id).length;
            const inbound  = DATA.edges.filter(e => e.to   === id).length;
            document.getElementById('raven-vf-detail-title').textContent = card.title;
            document.getElementById('raven-vf-detail-meta').innerHTML = `<b>${escHtml(card.type)}</b> · ${escHtml(card.territory)} / ${escHtml(card.subfolder)}`;
            document.getElementById('raven-vf-detail-connections').textContent = `${outbound + inbound} connections (${outbound} out · ${inbound} in)`;
            document.getElementById('raven-vf-drawer').classList.add('open');
          });
        });

        shelf.appendChild(stackDiv);
      });
      pane.appendChild(terrDiv);
    });

    document.getElementById('raven-vf-drawer-close').addEventListener('click', () => {
      document.getElementById('raven-vf-drawer').classList.remove('open');
      document.querySelectorAll('.raven-vf-doc-card').forEach(d => d.classList.remove('selected'));
    });

    // Search
    const searchInput = document.getElementById('raven-vf-search');
    const resultsEl   = document.getElementById('raven-vf-results');
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        resultsEl.textContent = '';
        document.querySelectorAll('.raven-vf-stack, .raven-vf-doc-card, .raven-vf-territory').forEach(el => { el.style.opacity = ''; el.style.filter = ''; });
        return;
      }
      let matchCount = 0;
      document.querySelectorAll('.raven-vf-stack').forEach(stack => {
        const sf    = stack.dataset.subfolder || '';
        const cards = Array.from(stack.querySelectorAll('.raven-vf-doc-card'));
        const stackMatch = sf.toLowerCase().includes(q);
        cards.forEach(dc => {
          const title = dc.querySelector('.raven-vf-doc-title')?.textContent.toLowerCase() || '';
          const type  = dc.querySelector('.raven-vf-doc-meta')?.textContent.toLowerCase() || '';
          const match = title.includes(q) || type.includes(q) || stackMatch;
          dc.style.opacity = match ? '' : '0.3';
          if (match) matchCount++;
        });
        stack.style.opacity = stackMatch ? '' : '0.6';
      });
      resultsEl.textContent = matchCount + ' match' + (matchCount === 1 ? '' : 'es');
    });
  }

  // ─── Load library graph ──────────────────────────
  // Fetch from raven-assets/ (relative to this HTML file)
  fetch('raven-assets/library-graph.json')
    .then(r => r.json())
    .then(data => { window.RAVEN_LIBRARY_DATA = data; })
    .catch(err => console.warn('[Raven] library-graph.json not loaded:', err));

  // Expose for external entry points (e.g. Atomic Library tile wire-up below)
  // and for the top-bar tab handler which needs to close any open surface or
  // sub-button tray when the director switches tabs.
  window.ravenShowSurface = ravenShowSurface;
  window.ravenCloseSurface = ravenCloseSurface;
  window.ravenCloseSubs = ravenCloseSubs;

  // ══════════════════════════════════════════════════════
  // TOP BAR — tab navigation + crest home anchor
  // ══════════════════════════════════════════════════════

  // Tab click handler
  document.querySelectorAll('.ctb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.canvasTab;

      // Locked tabs: no navigation (Agent 3 wires unlock logic)
      if (tab.classList.contains('ctb-tab-locked')) return;

      // Clicking a top-bar tab always exits any open Raven surface AND
      // closes the sub-button tray. Tabs and surfaces are different
      // navigation registers — clicking one shouldn't leave the other
      // hanging open.
      if (typeof window.ravenCloseSurface === 'function') window.ravenCloseSurface();
      if (typeof window.ravenCloseSubs === 'function') window.ravenCloseSubs();

      // Update active state
      document.querySelectorAll('.ctb-tab').forEach(t => {
        t.classList.remove('ctb-tab-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('ctb-tab-active');
      tab.setAttribute('aria-selected', 'true');

      // Route to underlying view. setView lives in the outer IIFE and is
      // exposed as window.setView — referencing it bare here would silently
      // no-op because it's not in scope.
      if (tabId === 'home') {
        if (typeof window.setView === 'function') window.setView('floor');
      } else if (tabId === 'station') {
        if (typeof window.setView === 'function') window.setView('by-status');
      } else if (tabId === 'library') {
        // Library: open Raven's Library surface via overlay
        ravenShowSurface('library');
      } else if (tabId === 'playbook') {
        // Playbook: open Raven's Playbook surface via overlay
        ravenShowSurface('playbook');
      }
    });
  });



  // Brand-as-home: clicking "Alexandria" returns to floor view and exits
  // any open Raven surface or sub-button tray.
  const brandHome = document.getElementById('ctb-brand-home');
  if (brandHome) {
    brandHome.addEventListener('click', () => {
      if (typeof window.ravenCloseSurface === 'function') window.ravenCloseSurface();
      if (typeof window.ravenCloseSubs === 'function') window.ravenCloseSubs();
      // Clear active tab state since brand-home isn't a tab.
      document.querySelectorAll('.ctb-tab').forEach(t => {
        t.classList.remove('ctb-tab-active');
        t.setAttribute('aria-selected', 'false');
      });
      if (typeof window.setView === 'function') window.setView('floor');
    });
  }

  // Keep top-bar tab active state in sync with underlying setView changes.
  // Patch the existing setView function after it is defined (it lives in the
  // parent IIFE and is exposed globally only via window.setView if it is).
  // A simple MutationObserver on the by-status-view .visible class is simpler.
  (function syncTabWithView() {
    const byStatusView = document.getElementById('by-status-view');
    if (!byStatusView) return;
    const observer = new MutationObserver(() => {
      const stationActive = byStatusView.classList.contains('visible');
      document.querySelectorAll('.ctb-tab').forEach(t => {
        if (t.classList.contains('ctb-tab-locked')) return;
        const isStation = t.dataset.canvasTab === 'station';
        const isHome    = t.dataset.canvasTab === 'home';
        if (stationActive) {
          t.classList.toggle('ctb-tab-active', isStation);
          t.setAttribute('aria-selected', isStation ? 'true' : 'false');
        } else if (!document.getElementById('raven-surface-overlay') || document.getElementById('raven-surface-overlay').hidden) {
          // Floor view active and no overlay — Home tab
          t.classList.toggle('ctb-tab-active', isHome);
          t.setAttribute('aria-selected', isHome ? 'true' : 'false');
        }
      });
    });
    observer.observe(byStatusView, { attributes: true, attributeFilter: ['class'] });
  })();

  // ══════════════════════════════════════════════════════
  // BENCH MINIMIZE TOGGLE
  // ══════════════════════════════════════════════════════
  (function initBenchMinimize() {
    const bench = document.getElementById('raven-bench');
    const btn   = document.getElementById('bench-minimize-btn');
    if (!bench || !btn) return;

    const LS_KEY = 'raven-bench-minimized';

    function applyMinimized(minimized) {
      bench.classList.toggle('bench-minimized', minimized);
      document.body.classList.toggle('bench-minimized', minimized);
      btn.setAttribute('aria-expanded', minimized ? 'false' : 'true');
      btn.title = minimized ? 'Expand bench' : 'Minimize bench';
      btn.setAttribute('aria-label', minimized ? 'Expand agent bench' : 'Minimize agent bench');
      // Sync CSS variable so tray-zone, phase-rail, etc. reposition correctly
      document.documentElement.style.setProperty(
        '--raven-bench-h', minimized ? '60px' : '240px'
      );
    }

    // Restore persisted state
    const saved = localStorage.getItem(LS_KEY);
    if (saved === 'true') applyMinimized(true);

    btn.addEventListener('click', () => {
      const nowMinimized = !bench.classList.contains('bench-minimized');
      applyMinimized(nowMinimized);
      try { localStorage.setItem(LS_KEY, String(nowMinimized)); } catch (_) { /* quota */ }
    });
  })();

})();
