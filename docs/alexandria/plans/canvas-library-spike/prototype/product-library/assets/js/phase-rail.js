(function initPhaseRail() {
  const PHASES = [
    {
      id: 1,
      color: '#e2a04a',
      steps: [
        { id: '1.1', icon: '☉︎', title: 'Opening' },
        { id: '1.2', icon: '⚹︎', title: 'Product Orientation' },
        { id: '1.3', icon: '⚭︎', title: 'Sources' },
        { id: '1.4', icon: '⚙︎', title: 'Knowledge Bank' },
        // 1.5 (Engine Run) retired — Knowledge Bank covers it.
        // Step ids 1.6+ kept as-is so deep links survive.
        { id: '1.6', icon: '△',       title: 'Gap Analysis' },
        { id: '1.7', icon: '□',       title: 'Initialize Artifacts' },
        { id: '1.8', icon: '▦',       title: 'Initialize Tracker' },
        { id: '1.9', icon: '⚖︎', title: 'Source Assessment' },
      ],
    },
  ];

  const STORAGE_KEY = 'roadmap.activeStep';
  const track = document.getElementById('phase-rail-track');
  if (!track) return;

  const allStepIds = PHASES.flatMap(p => p.steps.map(s => s.id));
  let activeStepId = null;
  try { activeStepId = localStorage.getItem(STORAGE_KEY); } catch (_) {}
  if (!activeStepId || !allStepIds.includes(activeStepId)) {
    activeStepId = allStepIds[0];
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function findActiveStep() {
    for (const phase of PHASES) {
      for (const step of phase.steps) {
        if (step.id === activeStepId) return step;
      }
    }
    return null;
  }

  function updateFrameTitle() {
    const titleEl = document.getElementById('tfs-label');
    if (!titleEl) return;
    const step = findActiveStep();
    titleEl.textContent = step ? step.title : '';
  }

  function render() {
    track.innerHTML = '';
    for (const phase of PHASES) {
      for (const step of phase.steps) {
        const el = document.createElement('button');
        el.type = 'button';
        const isActive = step.id === activeStepId;
        el.className = 'phase-step' + (isActive ? ' active' : '');
        el.style.setProperty('--phase-color', phase.color);
        el.dataset.stepId = step.id;
        el.dataset.phaseId = String(phase.id);
        el.setAttribute('role', 'tab');
        el.setAttribute('aria-selected', String(isActive));
        el.innerHTML =
          '<span class="ps-icon" aria-hidden="true">' + escapeHtml(step.icon || '') + '</span>' +
          '<span class="ps-title">' + escapeHtml(step.title) + '</span>' +
          '<span class="ps-num">' + escapeHtml(step.id) + '</span>';
        el.addEventListener('click', () => setActive(step.id));
        track.appendChild(el);
      }
    }
    updateFrameTitle();
  }

  function centerActive(behavior) {
    const el = track.querySelector('.phase-step.active');
    if (!el) return;
    el.scrollIntoView({ behavior: behavior || 'smooth', block: 'nearest', inline: 'center' });
  }

  function setActive(stepId) {
    if (stepId === activeStepId) return;
    activeStepId = stepId;
    try { localStorage.setItem(STORAGE_KEY, stepId); } catch (_) {}
    render();
    centerActive('smooth');
    // Broadcast so the Today's Frame renderer can swap content.
    document.dispatchEvent(new CustomEvent('step:change', { detail: { stepId, step: findActiveStep() }}));
  }

  // Expose the current step for late-loading subscribers.
  window.__activeStep = () => ({ stepId: activeStepId, step: findActiveStep() });

  render();
  // First paint: center without animation so we don't see a scroll on load.
  requestAnimationFrame(() => {
    centerActive('auto');
    // Fire an initial step:change so the renderer wires up.
    document.dispatchEvent(new CustomEvent('step:change', { detail: { stepId: activeStepId, step: findActiveStep() }}));
  });
})();
