(function initCanvasBridge() {
  const pip = document.getElementById('live-pip');
  const body = document.getElementById('tfs-body');
  if (!body) return;

  let currentStep = null;
  let evtSource = null;
  let reconnectAttempts = 0;
  let lastState = null;
  // Auto-advance threshold: any navigation event with a ts STRICTLY
  // GREATER than this is treated as "happened during this page session,
  // act on it." Anything older is stale (likely from a prior session)
  // and we leave the user where the rail's localStorage put them.
  // Initialized to page load time.
  let lastSeenNavTs = new Date().toISOString();
  // First-state guard for the freshness check below — only runs once
  // per page load.
  let firstStateChecked = false;

  function setLive(state) {
    if (!pip) return;
    pip.className = state;
    pip.textContent = '';
    pip.title = state === 'connected' ? 'live' : state === 'connecting' ? 'connecting…' : 'offline';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // Per-step renderers. Each takes the latest server state and writes into
  // #tfs-body. Build 1 ships placeholders for 1.1 and 1.2; build 2 and 3
  // replace them with the real surfaces.
  function renderStep(stepId, state) {
    body.className = 'tfs-body tfs-' + stepId.replace('.', '-');
    document.body.dataset.step = stepId;
    document.body.classList.toggle('kb-mode-vision-only', stepId === '1.4');
    if (stepId !== '1.4') stopRavenAttract();
    if (stepId === '1.1') return render1_1(state);
    if (stepId === '1.2') return render1_2(state);
    if (stepId === '1.3') return render1_3(state);
    if (stepId === '1.4') return render1_4(state);
    return renderOther(stepId, state);
  }

  function render1_4(_state) {
    // If the Vision Builder iframe is currently mounted in #tfs-body,
    // don't re-render — that would tear it down. SSE can fire renderStep
    // for the same step on reconnect / initial-state-echo / heartbeat-
    // recovery, and we don't want every blip to evict the form the
    // director is actively typing into. Same dedup pattern render1_2
    // uses for the contenteditable Story So Far.
    if (body.querySelector('.vision-embed-frame')) return;
    const active = (window.alexandriaModules && window.alexandriaModules.getActive()) || null;
    const visionBanked = window.alexandriaModules &&
      window.alexandriaModules.get('vision') &&
      window.alexandriaModules.get('vision').status === 'banked';

    if (!visionBanked) {
      body.innerHTML = `
        <div class="welcome-prose">
          <p>This is where Raven goes from idle to working. Her <strong>Knowledge Bank</strong> is everything she'll come to know about your product — and you fill it together.</p>
          <p>Raven is on the bench below, pulsing. <strong>Click her coin</strong> to see what she can do, then choose <strong>Raven's Knowledge Bank</strong>. <em>Vision</em> is the first subject — that's where you start.</p>
        </div>
      `;
      startRavenAttract();
      return;
    }

    // Post-bank: Vision is done. Surface the next subject.
    const nextTitle = active ? active.title : 'next subject';
    const nextId = active ? active.id : null;
    body.innerHTML = `
      <div class="welcome-prose">
        <p><strong>Vision is banked.</strong> Bridget has atomized it into the library — it's now a source-of-truth document the agents read from.</p>
        <p>Next up: <strong>${escapeAttr(nextTitle)}</strong>. Same flow as Vision — open Raven's Knowledge Bank from her coin and click ${escapeAttr(nextTitle)} to start.</p>
        ${nextId ? `<p class="s14-meta">First level of Raven: <strong>1 of 5</strong> subjects banked.</p>` : ''}
      </div>
    `;
    startRavenAttract();
  }

  // Called by vision-embed.js after the celebration beat fades.
  // Rerenders step 1.4 (which is now post-bank-aware) so the
  // director sees what comes next.
  window.renderPostBankIntro = function (_result) {
    if (currentStep === '1.4') render1_4(null);
  };

  // Pulse the Raven coin to draw the director's eye to the next move.
  // Loop with a long-ish gap; stop the moment the director engages with the
  // coin (its data-state flips off "dormant" once a Raven surface opens).
  let ravenAttractTimer = null;
  function startRavenAttract() {
    stopRavenAttract();
    pulseRavenCoin();
    ravenAttractTimer = setInterval(() => {
      const coin = document.getElementById('raven-coin');
      if (!coin) { stopRavenAttract(); return; }
      // If a Raven surface is open, the user already found the coin.
      const overlay = document.getElementById('raven-surface-overlay');
      if (overlay && !overlay.hasAttribute('hidden')) { stopRavenAttract(); return; }
      // If we've embedded Vision into tfs-body, the moment has passed.
      if (document.body.classList.contains('vision-embedded')) { stopRavenAttract(); return; }
      pulseRavenCoin();
    }, 5500);
  }
  function stopRavenAttract() {
    if (ravenAttractTimer) { clearInterval(ravenAttractTimer); ravenAttractTimer = null; }
    const coin = document.getElementById('raven-coin');
    if (coin) coin.classList.remove('s14-pulse');
  }
  function pulseRavenCoin() {
    const coin = document.getElementById('raven-coin');
    if (!coin) return;
    coin.classList.remove('s14-pulse');
    void coin.offsetWidth;
    coin.classList.add('s14-pulse');
    setTimeout(() => coin.classList.remove('s14-pulse'), 2400);
  }

  function render1_1(state) {
    const hasLogo = !!(state && state.logo);
    const acknowledged = !!(state && state.logo && state.logo.acknowledged_by_raven);
    // Three states in step 1.1:
    //   (a) No logo → drop ask
    //   (b) Logo placed, Raven hasn't seen it → "tell Raven" hint, no controls
    //   (c) Logo placed AND Raven acknowledged → controls (Keep/Replace/Save)
    let inner = '';
    if (!hasLogo) {
      inner = '<div class="welcome-cta">Drag your product\'s logo into the <strong>Source Materials</strong> tile above.</div>';
    } else if (!acknowledged) {
      // Spike artifact: the "tell Raven" hint is a cross-surface contract
      // leak. Kept terse here until the interaction model is reworked.
      inner = '<div class="welcome-cta">Logo committed. Ask Raven to look.</div>';
    } else {
      inner = `
        <div class="logo-panel">
          <div class="panel-label">Your product logo</div>
          <div class="panel-row">
            <img src="${escapeAttr(state.logo.dataUrl)}" alt="" />
            <span class="panel-note">Showing in the page header.</span>
            <div class="panel-actions">
              <button class="tfs-btn-quiet" id="logo-replace">Replace</button>
              <button class="tfs-btn-quiet danger" id="logo-delete">Delete</button>
              <button class="tfs-btn-primary" id="step-save">Save &amp; continue</button>
            </div>
          </div>
        </div>`;
    }
    body.innerHTML = `
      <div class="welcome-prose">
        <p>This is the canvas Raven and you will share while you set up your product's library. Keep this window open next to Claude Code while you work.</p>
        ${inner}
      </div>
    `;
    if (hasLogo && acknowledged) {
      document.getElementById('logo-replace').addEventListener('click', async () => {
        await fetch('/api/canvas/logo', { method: 'DELETE' });
      });
      document.getElementById('logo-delete').addEventListener('click', async () => {
        await fetch('/api/canvas/logo', { method: 'DELETE' });
      });
      document.getElementById('step-save').addEventListener('click', () => saveStep('1.1', '1.2'));
    }
  }

  function escapeAttr(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  async function saveStep(step, nextStep) {
    await fetch('/api/canvas/save/' + step, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nextStep }),
    });
    // SSE push will deliver the navigation event; handler below acts on it.
  }

  // Cache the recap text we just sent so the SSE echo doesn't re-render
  // and yank the cursor mid-edit.
  let _s12_lastSent = null;

  function render1_2(state) {
    if (!state || !state.available) {
      body.innerHTML = '<div class="placeholder">Loading…</div>';
      return;
    }
    const recap = state.what_you_told_me;

    // If the recap is the same text we just POSTed (server echoing it
    // back via SSE), skip the re-render so we don't disrupt editing.
    // We compare against _s12_lastSent only — the previous textContent
    // equality check was buggy because POST trims and contenteditable
    // preserves trailing whitespace/newlines, so an exact match would
    // miss its own echo and yank the cursor on every pause.
    const existing = document.getElementById('s12-story-body');
    if (existing && recap === _s12_lastSent) return;

    if (!recap) {
      // Empty state — no recap captured yet.
      body.innerHTML = '<div class="welcome-cta">Tell Raven your product\'s name and a short description. She\'ll capture both here as <strong>The Story So Far</strong>.</div>';
      return;
    }

    // Recap exists — render as editable Story So Far.
    body.innerHTML = `
      <div class="draft-recap">
        <div class="label">The Story So Far</div>
        <div class="body" id="s12-story-body" contenteditable="true" spellcheck="false">${escapeHtml(recap)}</div>
        <div class="edit-hint">Click the text to edit directly.</div>
      </div>
      <div class="continue-row">
        <button id="s12-review" class="tfs-btn-ghost" title="Ask Raven to react to the current draft without advancing">Get Raven's take</button>
        <button id="s12-save" class="tfs-btn-primary">Save &amp; continue</button>
      </div>
    `;

    const storyBody = document.getElementById('s12-story-body');
    let saveTimer = null;
    storyBody.addEventListener('input', () => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        const newText = storyBody.textContent.trim();
        if (!newText) return;
        _s12_lastSent = newText;
        await fetch('/api/canvas/recap/1.2', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text: newText, by: 'director' }),
        });
      }, 800);
    });

    document.getElementById('s12-save').addEventListener('click', () => saveStep('1.2', '1.3'));
    document.getElementById('s12-review').addEventListener('click', () => requestReview('1.2'));
  }

  async function requestReview(step) {
    await fetch('/api/canvas/review/' + step, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    // The watcher will wake Raven with a review-request notice.
    // Canvas stays where it is — no navigation.
  }

  // Step 1.3 — Wells / Sources
  function render1_3(state) {
    if (!state || !state.available) {
      body.innerHTML = '<div class="placeholder">Loading…</div>';
      return;
    }
    const wells = state.wells || { website:5, productDocs:5, planDocs:5, github:5 };
    const wellRow = (key, label) => {
      const v = wells[key] ?? 5;
      const skipClass = v === 0 ? ' skip' : '';
      return `
        <div class="well-row${skipClass}" data-well="${key}">
          <div class="well-name">${escapeHtml(label)}</div>
          <input type="range" min="0" max="10" step="1" value="${v}" data-well="${key}" />
          <div class="well-val">${v === 0 ? 'skip' : v + '/10'}</div>
        </div>
      `;
    };
    body.innerHTML = `
      <div class="wells">
        ${wellRow('website',     'Website')}
        ${wellRow('productDocs', 'Product docs')}
        ${wellRow('planDocs',    'Plan docs')}
        ${wellRow('github',      'GitHub repo')}
      </div>
      <div class="wells-legend">0 means skip.</div>
      <div class="continue-row">
        <button id="s13-save" class="tfs-btn-primary">Save &amp; continue</button>
      </div>
    `;
    body.querySelectorAll('input[type=range][data-well]').forEach(slider => {
      // 'input' fires on every micro-movement during drag — use it for
      // live UI feedback only (badge text + skip class). DO NOT POST here:
      // the server SSE response would re-render this whole panel and
      // detach the slider mid-drag, making the gesture feel like a click.
      slider.addEventListener('input', () => {
        const val = parseInt(slider.value, 10);
        const row = slider.closest('.well-row');
        if (row) {
          row.classList.toggle('skip', val === 0);
          row.querySelector('.well-val').textContent = val === 0 ? 'skip' : val + '/10';
        }
      });
      // 'change' fires only on drag release (or arrow-key commit) — safe
      // to POST and trigger the SSE round-trip here.
      slider.addEventListener('change', async () => {
        const key = slider.getAttribute('data-well');
        const val = parseInt(slider.value, 10);
        await fetch('/api/canvas/wells', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ [key]: val }),
        });
      });
    });
    const saveBtn = document.getElementById('s13-save');
    if (saveBtn) saveBtn.addEventListener('click', () => saveStep('1.3', '1.4'));
  }

  // Update the rail label for a given step ID. Called when the director types
  // in the product-name field so the rail reflects the change in real time
  // without waiting for the SSE roundtrip.
  function updateRailLabel(stepId, newTitle) {
    const btn = document.querySelector(`.phase-step[data-step-id="${stepId}"] .ps-title`);
    if (btn) btn.textContent = newTitle;
    // Also update Today's Frame title if the user's currently on that step.
    if (stepId === currentStep) {
      const t = document.getElementById('tfs-label');
      if (t) t.textContent = newTitle;
    }
  }

  function renderOther(stepId, state) {
    body.innerHTML = `<div class="placeholder">Step ${escapeHtml(stepId)} — not part of this spike. Active step is wired; surface lands later.</div>`;
  }

  function connectStream(stepId) {
    if (evtSource) { try { evtSource.close(); } catch (_) {} }
    setLive('connecting');
    evtSource = new EventSource('/api/canvas-stream/' + stepId);
    evtSource.onopen = () => { setLive('connected'); reconnectAttempts = 0; };
    evtSource.onmessage = (e) => {
      try {
        const state = JSON.parse(e.data);
        const prev = lastState;
        lastState = state;
        // On the FIRST state delivery of the page load, if the canvas
        // appears to be on a fresh demo (no logo, no product name, no
        // touched wells), force the rail to 1.1. Otherwise we'd start
        // wherever localStorage last left us — wrong for a fresh
        // /canvasdemo, fine for "picking up where you left off."
        if (!firstStateChecked) {
          firstStateChecked = true;
          const wellsTouched = state && state.wells && state.wells.ts;
          const isFresh = state && state.available && !state.logo && !state.productMeta && !wellsTouched;
          if (isFresh && currentStep !== '1.1') {
            const btn = document.querySelector('.phase-step[data-step-id="1.1"]');
            if (btn) { btn.click(); return; } // re-renders on the new stream
          }
        }
        if (stepId === currentStep) renderStep(stepId, state);
        // Logo lives in Band 1 — independent of which step is active.
        renderLogo(state, prev);
        // Product name drives the 1.2 rail label regardless of active step.
        const pn = state && state.productMeta && state.productMeta.name;
        updateRailLabel('1.2', pn ? `${pn} Orientation` : 'Product Orientation');
        // Navigation: act only on save events that happened DURING this
        // page session — i.e., nav.ts strictly greater than the
        // page-load timestamp we stored in lastSeenNavTs. Anything older
        // is stale (prior session) and ignored, so clicking back to a
        // previous rail step doesn't get yanked forward.
        const nav = state && state.navigation;
        if (nav && nav.ts && nav.ts > lastSeenNavTs) {
          lastSeenNavTs = nav.ts;
          if (nav.to && nav.to !== currentStep) {
            const btn = document.querySelector(`.phase-step[data-step-id="${nav.to}"]`);
            if (btn) btn.click();
          }
        }
      } catch (_) {}
    };
    evtSource.onerror = () => {
      setLive('offline');
      try { evtSource.close(); } catch (_) {}
      const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts++), 10_000);
      setTimeout(() => { if (currentStep === stepId) connectStream(stepId); }, delay);
    };
  }

  // ── Logo ──────────────────────────────────────────────────────────
  // Flow:
  //   1. Drop image on Source Materials tile → local preview shown on
  //      tile with Confirm / Cancel buttons. Nothing posted yet.
  //   2. Confirm → POST to server. SSE pushes the logo state.
  //   3. The logo is rendered in the HEADER, not the tile. The tile
  //      preview goes away.
  // (Variable name `productTile` is historical — the drop target moved
  // from the archive tile (now "Atomic Library", position 3) to the
  // library/microscope tile ("Source Materials", position 1) so the
  // logo enters as a piece of source material, matching the renamed
  // tile semantics.)
  const productTile = document.querySelector('.area[data-area="library"]');
  const headerSlot = document.getElementById('header-logo-slot');
  let pendingPreview = null; // { dataUrl, filename } awaiting confirm

  const modal = document.getElementById('logo-preview-modal');
  const modalImg = document.getElementById('modal-img');
  const modalFilename = document.getElementById('modal-filename');
  if (modal) {
    document.getElementById('modal-confirm').addEventListener('click', confirmPreview);
    document.getElementById('modal-cancel').addEventListener('click', cancelPreview);
  }

  function showPreview(file, dataUrl) {
    if (!modal) return;
    modalImg.src = dataUrl;
    modalFilename.textContent = file.name;
    modal.classList.add('shown');
    pendingPreview = { dataUrl, filename: file.name };
    updateDropTarget();
  }

  function hidePreview() {
    if (modal) modal.classList.remove('shown');
    pendingPreview = null;
    updateDropTarget();
  }

  async function confirmPreview() {
    if (!pendingPreview) return;
    const { filename, dataUrl } = pendingPreview;
    await fetch('/api/canvas/logo', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ filename, dataUrl, by: 'director' }),
    });
    hidePreview();
    // SSE push will render the header slot.
  }
  function cancelPreview() { hidePreview(); }

  function renderLogo(state, prev) {
    if (!productTile || !headerSlot) return;
    const logo = state && state.logo;
    const prevTs = prev && prev.logo && prev.logo.ts;
    const newTs = logo && logo.ts;
    const changed = newTs && newTs !== prevTs;

    // Render in the header
    if (logo) {
      let img = headerSlot.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.alt = '';
        headerSlot.appendChild(img);
      }
      img.src = logo.dataUrl;
      requestAnimationFrame(() => headerSlot.classList.add('shown'));
      if (changed && prev) {
        headerSlot.classList.remove('just-landed');
        void headerSlot.offsetWidth;
        headerSlot.classList.add('just-landed');
      }
    } else {
      headerSlot.classList.remove('shown');
      const img = headerSlot.querySelector('img');
      if (img) img.remove();
    }

    updateDropTarget();
  }

  // Drop-target on tile: active only when step 1.1 is current AND there's
  // no logo yet AND no preview is pending. Extracted so it can be called
  // immediately from step:change (without waiting for an SSE frame) and
  // from preview show/hide — otherwise the affordance silently fails to
  // appear on first 1.1 visit until something else triggers a re-render.
  function updateDropTarget() {
    if (!productTile) return;
    const logo = lastState && lastState.logo;
    const shouldShow = currentStep === '1.1' && !logo && !pendingPreview;
    productTile.classList.toggle('drop-target', shouldShow);
  }

  // ── Drag/drop on the Product tile ─────────────────────────────────
  // The tile already has an existing click handler that opens the
  // right-side drawer. To prevent that from firing during a drop, we
  // capture clicks at the capture phase while a drop is in progress
  // or just settled, and stop them before the tile's normal listener
  // sees them.
  let suppressTileClickUntil = 0;
  if (productTile) {
    // Lazy-create the drop pip (a real DOM child rather than a pseudo —
    // see the CSS rationale above). Toggled visible by the .drop-target
    // class; text swapped between idle and drag-over states.
    if (!productTile.querySelector('.drop-pip')) {
      const pip = document.createElement('span');
      pip.className = 'drop-pip';
      pip.textContent = 'drop your logo here';
      pip.setAttribute('aria-hidden', 'true');
      productTile.appendChild(pip);
    }
    const dropPip = productTile.querySelector('.drop-pip');

    productTile.addEventListener('click', (e) => {
      if (Date.now() < suppressTileClickUntil || pendingPreview || modal.classList.contains('shown')) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }, true); // capture phase

    productTile.addEventListener('dragover', (e) => {
      if (!productTile.classList.contains('drop-target')) return;
      e.preventDefault();
      productTile.classList.add('drag-over');
      if (dropPip) dropPip.textContent = 'drop to upload';
    });
    productTile.addEventListener('dragleave', () => {
      productTile.classList.remove('drag-over');
      if (dropPip) dropPip.textContent = 'drop your logo here';
    });
    productTile.addEventListener('drop', (e) => {
      if (!productTile.classList.contains('drop-target')) return;
      e.preventDefault();
      e.stopPropagation();
      productTile.classList.remove('drag-over');
      // Block any synthetic click within ~700ms of the drop.
      suppressTileClickUntil = Date.now() + 700;
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => showPreview(file, reader.result);
      reader.readAsDataURL(file);
    });
  }

  document.addEventListener('step:change', (e) => {
    const stepId = e.detail && e.detail.stepId;
    if (!stepId) return;
    const isSameStep = stepId === currentStep;
    currentStep = stepId;
    lastState = null;
    // If the Library is currently embedded in tfs-body, park it back in the
    // overlay before the phase renderer overwrites the body's innerHTML.
    if (typeof window.unembedLibrary === 'function') window.unembedLibrary();
    // Preserve the Vision Builder iframe across same-step refires. SSE
    // reconnects or echoed step:change events would otherwise wipe the
    // form the director is typing into. On a real step CHANGE we still
    // unmount via the vision-embed.js listener; here we only guard
    // the body.innerHTML wipe for same-step refires.
    const visionFrameMounted = !!body.querySelector('.vision-embed-frame');
    if (!(isSameStep && visionFrameMounted)) {
      body.innerHTML = '<div class="placeholder">Loading…</div>';
    }
    connectStream(stepId);
    // Render again once state lands; for now show structure
    renderStep(stepId, null);
    // Re-evaluate drop-target immediately — don't wait for the next SSE
    // frame. On a fresh /canvasdemo arrival on 1.1, the SSE initial state
    // lands a beat later; without this call the drop affordance silently
    // fails to appear until the user navigates away and back.
    updateDropTarget();
  });
})();
