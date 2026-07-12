(() => {
  const libSurface   = document.getElementById('raven-surface-library');
  const tfsBody      = document.getElementById('tfs-body');
  const overlay      = document.getElementById('raven-surface-overlay');
  const overlayBody  = document.getElementById('raven-overlay-body');

  if (!libSurface || !tfsBody || !overlayBody) return;

  let isEmbedded = false;
  let savedLabel = '';
  const tfsLabel = document.getElementById('tfs-label');

  function embedLibraryInCenter() {
    if (isEmbedded) return; // already embedded — idempotent

    // Fully close any active surface first (clears .raven-active state on
    // whatever was showing — KB, Playbook — so there's no dual-render flash
    // when the embed mounts).
    if (typeof window.ravenCloseSurface === 'function') {
      window.ravenCloseSurface();
    } else if (overlay) {
      overlay.setAttribute('hidden', '');
    }

    // Ensure library is initialized before we move it. ravenShowSurface
    // toggles the overlay visible as a side-effect; we close it again.
    if (typeof window.ravenShowSurface === 'function') {
      window.ravenShowSurface('library');
      if (typeof window.ravenCloseSurface === 'function') window.ravenCloseSurface();
      else if (overlay) overlay.setAttribute('hidden', '');
    }

    // Make the library visible.
    libSurface.style.display = 'block';

    // Update the strip's label so the user knows what's in the pane.
    if (tfsLabel) {
      savedLabel = tfsLabel.textContent;
      tfsLabel.textContent = 'Library';
    }

    // Clear current phase content and embed the library node.
    tfsBody.innerHTML = '';
    tfsBody.appendChild(libSurface);
    libSurface.classList.add('raven-library-embedded');
    document.body.classList.add('library-active');

    // Inject back button as first child of the library surface.
    const backBtn = document.createElement('button');
    backBtn.id = 'raven-library-back-btn';
    backBtn.type = 'button';
    backBtn.textContent = '← Back to onboarding';
    backBtn.addEventListener('click', unembedLibrary);
    libSurface.insertBefore(backBtn, libSurface.firstChild);

    isEmbedded = true;
  }

  function unembedLibrary() {
    if (!isEmbedded) return; // nothing to unembed — idempotent

    // Restore the strip's label.
    if (tfsLabel && savedLabel !== '') {
      tfsLabel.textContent = savedLabel;
    }

    // Remove the injected back button.
    const backBtn = document.getElementById('raven-library-back-btn');
    if (backBtn) backBtn.remove();

    // Park the library back in the overlay body.
    libSurface.classList.remove('raven-library-embedded');
    libSurface.style.display = '';
    overlayBody.appendChild(libSurface);
    document.body.classList.remove('library-active');

    isEmbedded = false;

    // Re-fire the current phase step so the center pane re-renders.
    if (typeof window.__activeStep === 'function') {
      const { stepId, step } = window.__activeStep();
      if (stepId) {
        document.dispatchEvent(new CustomEvent('step:change', { detail: { stepId, step } }));
      }
    }
  }

  // Expose so the ravenCanvas sub-button handler and the phase-rail can reach them.
  window.embedLibraryInCenter = embedLibraryInCenter;
  window.unembedLibrary = unembedLibrary;

  // ── The Library tile intercept ─────────────────────────────────────────
  // Naming note: the floor tile labeled "The Library" still carries the
  // legacy attribute data-area="archive" (the journal-stone tile). The
  // separate data-area="library" tile is the microscope/source-materials
  // intake. Don't conflate the two — the attribute names are inverted from
  // the director-facing labels. Here we intercept the journal-stone tile
  // (the user-visible "The Library") in the capture phase so the prototype's
  // bubble-phase handlers never fire, and embed the Library in the center
  // pane instead.
  const tile = document.querySelector('.area[data-area="archive"]');
  if (tile) {
    tile.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      embedLibraryInCenter();
    }, true); // capture phase
  }
})();
