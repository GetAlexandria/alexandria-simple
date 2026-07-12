(function initPracticeCave() {
  'use strict';

  // ── State ──
  let logoDone     = false;
  let sentenceDone = false;
  let caveDone     = false;

  const SENTENCE_DEFAULT = 'This product helps directors build better software faster.';

  // ── Elements (resolved after DOM ready) ──
  let tfsBody, tfsLabel, logoPip, dropTile, microscopeOverlay;
  let logoSlot, modalEl, modalImg, modalFilename;
  let pendingFile = null;

  function el(id) { return document.getElementById(id); }

  function init() {
    tfsBody        = el('tfs-body');
    tfsLabel       = el('tfs-label');
    logoSlot       = el('header-logo-slot');
    modalEl        = el('logo-preview-modal');
    modalImg       = el('modal-img');
    modalFilename  = el('modal-filename');

    dropTile       = document.querySelector('.area[data-area="library"]');

    if (!tfsBody) return;

    renderPracticeCave();
    wireLogoModal();
    wireDropZone();
    injectMicroscopeLock();
  }

  // ── Render the practice cave into #tfs-body ──
  function renderPracticeCave() {
    if (tfsLabel) {
      tfsLabel.textContent = 'Stage 0 · Practice Cave';
    }
    tfsBody.innerHTML = `
      <div class="practice-cave" id="practice-cave-panel">
        <div class="practice-rail" id="practice-rail" aria-label="Progress">
          <span class="practice-rail-dot" data-step="logo" title="Step 1: Drop logo"></span>
          <span class="practice-rail-line"></span>
          <span class="practice-rail-dot" data-step="sentence" title="Step 2: Redline sentence"></span>
          <span class="practice-rail-line"></span>
          <span class="practice-rail-dot" data-step="done" title="Complete"></span>
        </div>
        <p class="practice-cave-intro">
          Let's get you oriented. Two small gestures — then the real work begins.
        </p>
        <div class="practice-cave-squad-note">
          This is your senior squad. Raven — your head of Product — is who you're hiring first.
          Click her coin whenever you're ready to start.
        </div>
        <div class="practice-cave-tasks">
          <div class="cave-task" id="cave-task-logo">
            <div class="cave-task-check" aria-hidden="true"></div>
            <div class="cave-task-body">
              <div class="cave-task-label">Drop your product's logo</div>
              <div class="cave-task-hint">Drag any image file onto the Source Materials tile above.</div>
            </div>
          </div>
          <div class="cave-task" id="cave-task-sentence">
            <div class="cave-task-check" aria-hidden="true"></div>
            <div class="cave-task-body">
              <div class="cave-task-label">Redline this sentence — make it yours</div>
              <textarea class="cave-sentence" id="cave-sentence" rows="2"
                aria-label="Edit this sentence to describe your product">${SENTENCE_DEFAULT}</textarea>
              <div class="cave-sentence-note">Edit it. Delete it. Rewrite it entirely.</div>
            </div>
          </div>
        </div>
      </div>`;

    wireSentenceTask();
  }

  // ── Wire the sentence-edit task ──
  function wireSentenceTask() {
    const sentenceEl = el('cave-sentence');
    if (!sentenceEl) return;
    sentenceEl.addEventListener('input', () => {
      const val = sentenceEl.value.trim();
      // Mark done if the director has changed the sentence from the default
      const changed = val !== SENTENCE_DEFAULT.trim() && val.length > 5;
      if (changed && !sentenceDone) {
        sentenceDone = true;
        markTaskDone('cave-task-sentence');
        markRailDot('sentence', true);
        checkRailComplete();
        checkCaveComplete();
      } else if (!changed && sentenceDone) {
        sentenceDone = false;
        markTaskDone('cave-task-sentence', false);
        markRailDot('sentence', false);
      }
    });
  }

  function markTaskDone(taskId, done = true) {
    const task = el(taskId);
    if (!task) return;
    task.classList.toggle('done', done);
    const check = task.querySelector('.cave-task-check');
    if (check) check.textContent = done ? '✓' : '';
  }

  // ── Practice rail progress ──
  function markRailDot(step, done) {
    const rail = el('practice-rail');
    if (!rail) return;
    const dot = rail.querySelector(`.practice-rail-dot[data-step="${step}"]`);
    if (dot) dot.classList.toggle('done', done);
  }

  function checkRailComplete() {
    if (!logoDone || !sentenceDone) return;
    markRailDot('done', true);
    const rail = el('practice-rail');
    if (rail) {
      rail.classList.add('all-done');
      // Remove glow class after animation
      rail.addEventListener('animationend', () => rail.classList.remove('all-done'), { once: true });
    }
  }

  // ── Logo drop zone ──
  function wireDropZone() {
    if (!dropTile) return;

    // Create the drop pip if not already present
    if (!dropTile.querySelector('.drop-pip')) {
      const pip = document.createElement('span');
      pip.className = 'drop-pip';
      pip.textContent = 'Drop logo here';
      dropTile.appendChild(pip);
    }

    dropTile.classList.add('drop-target');

    dropTile.addEventListener('dragover', (e) => {
      if (!e.dataTransfer.types.includes('Files')) return;
      e.preventDefault();
      dropTile.classList.add('drag-over');
    });
    dropTile.addEventListener('dragleave', () => dropTile.classList.remove('drag-over'));
    dropTile.addEventListener('drop', (e) => {
      e.preventDefault();
      dropTile.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      showLogoModal(file);
    });
  }

  function showLogoModal(file) {
    pendingFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (modalImg)       modalImg.src = ev.target.result;
      if (modalFilename)  modalFilename.textContent = file.name;
      if (modalEl)        modalEl.classList.add('shown');
    };
    reader.readAsDataURL(file);
  }

  function wireLogoModal() {
    const confirmBtn = el('modal-confirm');
    const cancelBtn  = el('modal-cancel');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        modalEl && modalEl.classList.remove('shown');
        if (pendingFile) applyLogo(pendingFile, modalImg ? modalImg.src : null);
        pendingFile = null;
      });
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modalEl && modalEl.classList.remove('shown');
        pendingFile = null;
      });
    }
  }

  function applyLogo(file, dataUrl) {
    // Show in the header logo slot
    if (logoSlot) {
      let img = logoSlot.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.alt = 'Product logo';
        logoSlot.appendChild(img);
      }
      img.src = dataUrl || '';
      logoSlot.classList.add('shown', 'just-landed');
      logoSlot.addEventListener('animationend', () => logoSlot.classList.remove('just-landed'), { once: true });
    }
    // Remove the drop target treatment
    if (dropTile) {
      dropTile.classList.remove('drop-target', 'drag-over');
    }
    logoDone = true;
    markTaskDone('cave-task-logo');
    markRailDot('logo', true);
    checkRailComplete();
    checkCaveComplete();
  }

  // ── Check if both tasks done → lift microscope lock ──
  function checkCaveComplete() {
    if (caveDone || !logoDone || !sentenceDone) return;
    caveDone = true;
    console.info('[PracticeCave] Stage 0 complete — microscope unlocked.');
    liftMicroscopeLock();
  }

  // ── Microscope lock overlay ──
  function injectMicroscopeLock() {
    if (!dropTile) return;
    // Only inject if the lock overlay doesn't already exist
    if (dropTile.querySelector('.microscope-lock-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'microscope-lock-overlay';
    overlay.id = 'microscope-lock';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="microscope-lock-icon" aria-hidden="true">🔒</div>
      <div class="microscope-lock-label">Unlocks after the practice cave — drop your logo and redline a sentence to begin.</div>
    `;
    dropTile.appendChild(overlay);
  }

  function liftMicroscopeLock() {
    const overlay = el('microscope-lock');
    if (overlay) {
      overlay.classList.add('lifted');
      // After the fade, remove entirely so the tile is fully interactive
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }
    // Update the tfs-body to show the "you're ready" transition message
    if (tfsLabel) tfsLabel.textContent = 'Stage 1 · Microscope';
    if (tfsBody) {
      tfsBody.innerHTML = `
        <div class="practice-cave">
          <p class="practice-cave-intro">
            Nice work. Raven noticed.
          </p>
          <p style="font:14px/1.6 var(--font-px); color:var(--fg-dim); margin-bottom:1em;">
            The Source Materials tile is now open. Drop in everything you have — website, deck, docs, GitHub,
            Figma, anything. When you're done sharing, tell Raven you're ready and she'll take it from there.
          </p>
          <button class="tfs-btn-primary" id="cave-im-done-btn">I've shared everything — let's start talking</button>
        </div>`;
      const doneBtn = el('cave-im-done-btn');
      if (doneBtn) {
        doneBtn.addEventListener('click', () => {
          console.info('[PracticeCave] Director declared done sharing — Stage 1 complete, first form unlocks.');
          doneBtn.disabled = true;
          doneBtn.textContent = 'Raven is ready for you in the coding tool.';
        });
      }
    }
  }

  // Run after DOM is ready. Defer one animation frame so any synchronous
  // sibling init (phase-rail, KB) has settled before practice cave reads
  // from the DOM — more reliable than the prior 80ms timeout kludge.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(init));
  } else {
    requestAnimationFrame(init);
  }

})();
