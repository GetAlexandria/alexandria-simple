/* ──────────────────────────────────────────────────────────────
   Vision-builder embed for the canvas onboarding flow (step 1.4).

   Mirrors library-embed.js: clicking the Vision subject inside
   Raven's Knowledge Bank closes the overlay and mounts the
   vision-builder as an iframe inside #tfs-body. A back button
   returns to step 1.4's instruction view.

   The handler is delegated on document so it survives the
   ravenInitKnowledgeBank() rerender that paints the KB markup
   only when the surface is first opened.
   ────────────────────────────────────────────────────────────── */
(() => {
  const tfsBody = document.getElementById('tfs-body');
  const tfsLabel = document.getElementById('tfs-label');
  const overlay = document.getElementById('raven-surface-overlay');
  if (!tfsBody) return;

  let isEmbedded = false;
  let savedLabel = '';
  let savedBodyClassName = '';

  // Reconcile the sticky isEmbedded flag with the actual DOM. Any path
  // that takes the iframe down without going through unembedVisionBuilder
  // (e.g., brand-home click, an external setView call, hard re-render of
  // tfs-body) leaves isEmbedded=true but no iframe present — then the
  // next embed attempt silently bails on the early return. Call this
  // before every embed/unembed to keep flag and DOM in sync.
  function reconcileEmbedFlag() {
    const hasFrame = !!tfsBody.querySelector('.vision-embed-frame');
    if (isEmbedded && !hasFrame) {
      isEmbedded = false;
      document.body.classList.remove('vision-embedded');
    }
  }

  function embedVisionBuilder() {
    reconcileEmbedFlag();
    if (isEmbedded) return;

    // Close the KB overlay so the embed has the screen.
    if (typeof window.ravenCloseSurface === 'function') {
      window.ravenCloseSurface();
    } else if (overlay) {
      overlay.setAttribute('hidden', '');
    }

    if (tfsLabel) {
      savedLabel = tfsLabel.textContent;
      tfsLabel.textContent = 'Vision Builder';
    }

    savedBodyClassName = tfsBody.className;
    tfsBody.className = (tfsBody.className + ' has-vision-embed').trim();
    tfsBody.innerHTML = '';

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'vision-embed-back';
    backBtn.textContent = '← Back to onboarding';
    backBtn.addEventListener('click', unembedVisionBuilder);
    tfsBody.appendChild(backBtn);

    const frame = document.createElement('iframe');
    frame.className = 'vision-embed-frame';
    frame.src = 'vision-builder.html';
    frame.title = 'Vision Builder';
    tfsBody.appendChild(frame);

    document.body.classList.add('vision-embedded');
    isEmbedded = true;
  }

  function unembedVisionBuilder() {
    if (!isEmbedded) return;

    if (tfsLabel && savedLabel !== '') tfsLabel.textContent = savedLabel;
    tfsBody.className = savedBodyClassName || 'tfs-body';
    document.body.classList.remove('vision-embedded');
    isEmbedded = false;

    // Re-fire the current phase step so canvas-bridge repaints the body
    // (back to render1_4's instruction view, typically).
    if (typeof window.__activeStep === 'function') {
      const { stepId, step } = window.__activeStep();
      if (stepId) {
        document.dispatchEvent(new CustomEvent('step:change', { detail: { stepId, step } }));
      }
    }
  }

  // ── Delegated click on the current active subject inside KB ──
  // Until other modules ship, only Vision actually mounts. Bets /
  // Guardrails / etc. show a "coming soon" stub so the click still
  // feels alive after Vision is banked.
  document.addEventListener('click', (e) => {
    if (!document.body.classList.contains('kb-mode-vision-only')) return;
    const subject = e.target.closest('[data-subject]');
    if (!subject) return;
    if (!subject.closest('#raven-surface-knowledge-bank')) return;
    const subjectId = subject.dataset.subject;
    const activeId = document.body.dataset.activeSubject;
    // Vision always works — it's the only module that's actually built,
    // and we want re-entry to work even if module state thinks Vision
    // is already banked. Other subjects require they're the active one.
    if (subjectId !== 'vision' && subjectId !== activeId) return;
    e.preventDefault();
    e.stopPropagation();
    if (subjectId === 'vision') {
      embedVisionBuilder();
    } else {
      showSubjectComingSoon(subjectId, subject);
    }
  }, true);

  function showSubjectComingSoon(id, subjectEl) {
    const title = subjectEl.querySelector('.subject-name')
      ? subjectEl.querySelector('.subject-name').textContent.trim()
      : id;
    // Close the KB overlay and pivot the canvas to a stub view.
    if (typeof window.ravenCloseSurface === 'function') window.ravenCloseSurface();
    if (!tfsBody) return;
    if (tfsLabel) tfsLabel.textContent = title;
    tfsBody.innerHTML = `
      <div class="welcome-prose">
        <p><strong>${title}</strong> is open next.</p>
        <p>Each subject has its own shape and texture — picking <em>Vocabulary</em> will feel completely different from filling <em>Vision</em>. The interactive tool for ${title} is the next thing on the build list.</p>
        <p>For now, you've completed the Vision motion end-to-end: work → approve → bank → atomize → unlock. Same flow lives ahead for ${title}.</p>
      </div>`;
  }

  // ── Other escape hatches that should unembed cleanly ────────
  // The Alexandria brand-home button calls setView('floor') and
  // closes Raven surfaces but doesn't know to unembed the form.
  // Hook it here. Same for any top-bar tab click — those swap the
  // active view (Library/Playbook/Station/Ledger) and the
  // Vision Builder shouldn't linger underneath. Without these,
  // isEmbedded stays stuck true and a later click on Vision
  // hits the early return in embedVisionBuilder.
  const brandHome = document.getElementById('ctb-brand-home');
  if (brandHome) {
    brandHome.addEventListener('click', () => {
      if (isEmbedded) unembedVisionBuilder();
    });
  }
  document.querySelectorAll('.ctb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (isEmbedded) unembedVisionBuilder();
    });
  });

  // ── If the director navigates to another phase, unembed ────
  document.addEventListener('step:change', (e) => {
    if (!isEmbedded) return;
    const incoming = e && e.detail && e.detail.stepId;
    // step:change is dispatched by us during unembed; ignore the echo by
    // checking the embedded flag *after* the dispatch in unembedVisionBuilder
    // (which sets isEmbedded = false before firing). Here we're guarding the
    // case where the director clicks a different rail step while the embed
    // is mounted.
    if (incoming && incoming !== '1.4') {
      unembedVisionBuilder();
    }
  });

  // ── Bank message from inside the iframe ─────────────────────
  // The Vision Builder's Bank button has already POSTed
  // /api/canvas/vision/bank (server marks banked + persists state
  // + emits the vision-banked wake event for Raven). It then sends
  // a payloadless { type: 'alexandria.bankVision' } message up to
  // us as the "server confirmed — advance the UI" signal.
  //
  // We don't trust the postMessage as a source of truth: we POST
  // to the bank endpoint ourselves as a safety net (idempotent —
  // server clamps to banked: true) so the kanban + library card
  // never advance without the server having actually persisted
  // the banked state. Then we mirror the kanban locally via
  // modules.bank('vision') (no payload — library-sync.js fetches
  // the authoritative slot content from /api/canvas/vision).
  window.addEventListener('message', async (e) => {
    if (!e || !e.data || e.data.type !== 'alexandria.bankVision') return;
    let serverOk = true;
    try {
      const res = await fetch('/api/canvas/vision/bank', { method: 'POST' });
      if (!res.ok) serverOk = false;
    } catch (_) {
      serverOk = false;
    }
    let result = null;
    if (serverOk && window.alexandriaModules) {
      result = window.alexandriaModules.bank('vision');
    }
    showBankBeat(result, serverOk);
  });

  function showBankBeat(result, serverOk) {
    let overlay = document.getElementById('vision-bank-beat');
    if (overlay) overlay.remove();
    overlay = document.createElement('div');
    overlay.id = 'vision-bank-beat';
    overlay.innerHTML = `
      <div class="vbeat-panel">
        <div class="vbeat-mark">✦</div>
        <div class="vbeat-eyebrow">Vision banked</div>
        <div class="vbeat-title">Bridget is atomizing now.</div>
        <div class="vbeat-sub">${serverOk ? 'Writing to the library · 9 slots' : 'Bank queued — server didn\'t confirm.'}</div>
      </div>`;
    document.body.appendChild(overlay);

    // After the beat, dismiss the iframe and route the canvas
    // to the next-subject intro view.
    setTimeout(() => {
      overlay.classList.add('vbeat-fading');
      setTimeout(() => {
        overlay.remove();
        unembedVisionBuilder();
        if (typeof window.renderPostBankIntro === 'function') {
          window.renderPostBankIntro(result);
        }
      }, 400);
    }, 2400);
  }
  window.embedVisionBuilder = embedVisionBuilder;
  window.unembedVisionBuilder = unembedVisionBuilder;
})();
