(function initVisionBuilder() {
  'use strict';

  // ── Field schema (parsed from vision/1-page-template.md) ──
  const VISION_FIELDS = [
    {
      id: '1', number: '1', title: 'The Shift', subtitle: 'what changed in the world',
      schemaLine: { length: '1 paragraph', pullingFor: 'the external change in the world creating demand for this product', quickTest: 'would a stranger agree based on what they see in the world?' },
      prompt: 'What’s the shift in the world that creates the demand for this product now? Name the external change — capability, behavior, infrastructure, regulation, demographic, cost curve — that would have made this product premature or unnecessary before. Be specific: not “AI got better” but “AI agents can now do load-bearing senior-human work at a cost-per-unit that isn’t flattening.”',
      pointer: 'deep-guidance.md § 1 · examples.md § 1'
    },
    {
      id: '2', number: '2', title: 'The Person', subtitle: 'who is exposed to the shift',
      schemaLine: { length: '1 short paragraph', pullingFor: 'a specific named composite — not a segment', quickTest: 'could a stranger predict what they say yes/no to on a Thursday?' },
      prompt: 'Name a specific composite person. First name. Backstory in one phrase. Current situation in one phrase. Scene-level pain in their week in one phrase. Someone you could pick out at a conference — not a segment, not a demographic, not “small business owners.” If the answer reads like a market category, you haven’t gotten to a person yet.',
      pointer: 'deep-guidance.md § 2 · examples.md § 2'
    },
    {
      id: '3a', number: '3', title: 'Named pain', subtitle: 'the pain that sells — what they’d say if asked',
      group: '3', groupTitle: 'The Problem', groupSubtitle: 'what the shift produced for them (named + discovered)',
      schemaLine: { length: '1 paragraph in the person’s voice', pullingFor: 'the pain that sells — what they’d say if asked', quickTest: 'would they nod if you read this back to them?' },
      prompt: 'What would the person say is broken if you asked them right now? A scene from their week, not a complaint. Specific to their situation. This is the pain that sells — the front door. Buyers can name it; marketing can lead with it.',
      pointer: 'deep-guidance.md § 3a · examples.md § 3a'
    },
    {
      id: '3b', number: '3', title: 'Discovered pain', subtitle: 'the pain that retains — recognized only after the alternative exists',
      group: '3',
      schemaLine: { length: '1 paragraph', pullingFor: 'the pain that retains — recognized only after the alternative exists', quickTest: 'would they say “I didn’t know that was bothering me until I didn’t have to do it anymore”?' },
      prompt: 'What pain would they NOT name today, but recognize as the bigger problem once they’ve experienced the alternative? This is the pain that retains — the backend revelation. Important: don’t lead marketing with this. Many buyers can’t recognize the discovered pain before they’ve experienced the fix; pitching it to them confirms their bias against your product instead of selling them on it.',
      pointer: 'deep-guidance.md § 3b · examples.md § 3b'
    },
    {
      id: '4', number: '4', title: 'The Inadequacy', subtitle: 'why existing tools fail at it',
      schemaLine: { length: '3–5 bullet points', pullingFor: 'structural reasons existing tools fail — gap is durable', quickTest: 'could the competitor close the gap with a 2-week sprint?' },
      prompt: 'Name the existing tools or categories users currently reach for. For each, explain in one sentence why it STRUCTURALLY fails — not “it’s bad” but “it was designed for a different shape of the world.” The point isn’t to insult the competition; it’s to show the failures are structural, which means the gap is durable, not closeable by your competitor’s next release.',
      pointer: 'deep-guidance.md § 4 · examples.md § 4'
    },
    {
      id: '5', number: '5', title: 'The Mechanism', subtitle: 'what we do that resolves the failure',
      schemaLine: { length: '1 positioning sentence + 2–3 supporting sentences', pullingFor: 'the exclusive claim — what we are that no one else is', quickTest: 'can a stranger predict your next 5 features AND next 5 refusals from this sentence?' },
      prompt: 'Write a single positioning sentence in the form [Company] is the only [X] that [Y] or [Company] turns [X] into [Y]. The sentence should be specific enough that a stranger reading it could predict your next 5 features AND your next 5 refusals.\n\nThen 2–3 sentences naming the primitives that produce the claim. How does the mechanism work? Usually 1–3 components that together produce the categorical shift the positioning sentence promises.',
      pointer: 'deep-guidance.md § 5 · examples.md § 5'
    },
    {
      id: '6', number: '6', title: 'The Felt Experience', subtitle: 'what life looks like when it works',
      schemaLine: { length: 'a story, 250–400 words', pullingFor: 'a vivid scene that makes the Mechanism concrete, with GASP and absences', quickTest: 'could the same scene be told about a different product?' },
      prompt: 'Tell a story — not a list — about a moment in the user’s life once the product is successfully installed and they’re a power user. Two requirements: A GASP moment (something the user does in this scene that’s not possible today) and Conspicuous absences (things in today’s life that are NOT in this future day: standups that don’t happen, tools that aren’t open, conversations that don’t have to be re-had). If the story could be told about a different product, you haven’t gotten specific enough.',
      pointer: 'deep-guidance.md § 6 · examples.md § 6'
    },
    {
      id: '7', number: '7', title: 'The Proof', subtitle: 'what we’d observe if we’re right',
      schemaLine: { length: '2–3 markers', pullingFor: 'observable, falsifiable, distinctive signals — story-truth not market-thesis', quickTest: 'could a competitor with a different Mechanism accidentally hit this marker?' },
      prompt: 'Observable signals in customer companies that would tell us the Vision held. Story-truth markers — not adoption metrics, not revenue, not NPS. The question isn’t “do we have scale”; it’s “is the Vision observably real for the customers we have.” Each marker should test a distinctive claim from slot 5 (Mechanism) or slot 6 (Felt Experience), be falsifiable (describe a real number or behavior we could fail to hit), and be sharp enough that a different product couldn’t accidentally hit it.',
      pointer: 'deep-guidance.md § 7 · examples.md § 7'
    },
    {
      id: '8', number: '8', title: 'The Refusal', subtitle: 'what we won’t be, and why',
      schemaLine: { length: '2–3 anti-positions', pullingFor: 'trap-shaped refusals — what LOOKS aligned but would undermine the Vision', quickTest: 'would you sell to them with a $1M check in hand?' },
      prompt: 'Name customer types, product directions, or buying motions that LOOK aligned with this Vision but would undermine it if served. For each, name the structural reason — what would this product AMPLIFY in that case that would be harm, not help? Diagnostic: if you’d sell to them with money in hand, it’s not a real refusal. A refusal you’d break for a check isn’t a refusal; it’s a preference.',
      pointer: 'deep-guidance.md § 8 · examples.md § 8'
    }
  ];

  // ── Example content (extracted from vision/draft-vision.md) ──
  const ALEXANDRIA_EXAMPLE = {
    '1': 'AI coding agents have, in the last 18–24 months, crossed from autocomplete into doing load-bearing implementation work — writing real features, reasoning across files, completing tickets. The shape of software work has flipped: one human can now direct many AI agents in parallel, and small teams are routinely shipping at a pace that two years ago required a full org. But the agents themselves are stateless and isolated — they live in a thousand open tabs, forget between sessions, and operate one-on-one when the work is many-to-many. The bottleneck has moved off of "can the agent write the code" and onto "does the agent know enough about this product to make the decision a senior teammate would have made." That gap didn’t exist at this scale five years ago because the agents weren’t trusted with the decisions in the first place.',
    '2': 'Devon, a technical founder or staff-engineer-turned-tech-lead at a 3–8 person AI-native company. Two years out of a senior IC role at a bigger shop, currently running three or four Claude Code agents in parallel against a product he holds the whole shape of in his head. Scene-level pain: by Thursday afternoon he’s spent more time re-explaining the product to agents — naming, UX patterns, why-we-don’t-do-X — than actually directing them, and the agents keep shipping code that compiles but doesn’t fit.',
    '3a': '"The agents are fast but they don’t know my product. Every time I kick off a task I’m pasting the same context — naming conventions, the way we do auth, why we don’t use modals, the three things that look like duplicates but aren’t. Half my Claude Code sessions are me re-onboarding the agent before any work happens. And when I forget to do that re-onboarding, the agent produces code that’s technically fine and product-wrong, and I have to throw it out or rewrite it. I’m becoming a full-time context-pasting service for my own agents."',
    '3b': 'The pain Devon doesn’t know to name today: the product itself only exists inside his head, and every hire and every agent has been re-deriving it from scratch in pieces. After a few weeks with Alexandria, what he realizes is that he wasn’t slow at directing agents — he was the single point of failure for product coherence, and the company couldn’t outgrow his attention because there was no shared substrate the agents and humans were both reading from. The "context-pasting" pain was a symptom; the deeper one was that the company had no externalized product mind.',
    '4': '• CLAUDE.md and project-level system prompts were designed to give one agent a flat brief at the start of a session. They have no internal structure to query, no graph of relationships, no concept of "the relevant slice for this task" — they’re a single document that gets longer and noisier until the agent stops reading it carefully.\n• Notion, Confluence, and Google Docs wikis were designed for humans to browse and skim. They assume a reader with judgment who can ignore stale pages and infer relationships. Agents have neither: they read literally, can’t tell which page is canonical, and have no way to traverse from "feature I’m building" to "principles that govern it."\n• Vector-DB / RAG context retrieval treats the codebase or docs as an undifferentiated bag of chunks. It returns similar text, not relevant claims, and has no model of card types, rationale layers, or which dimension the agent actually needs. Similarity isn’t structure.\n• In-context "just paste the spec" works until it doesn’t — when the spec is too big, when two specs contradict, when the relevant constraint is on a different page. It scales linearly with attention, which is exactly the resource that’s bottlenecked.\n• Generic AI project-management tools were built on top of human ticketing workflows. They assume the human still owns the decisions and the agent helps with the writing. They don’t have a substrate for the product itself — only for tasks about it.',
    '5': 'Alexandria is the only product-knowledge system designed for AI agents to read from and write to as a first-class user — a typed, graph-shaped library of the product that lives in the repo alongside the code.\n\nThe mechanism has three primitives. First, typed markdown cards — 21 card types across rationale, product, experience, and temporal layers, each making exactly one kind of claim, so agents (and humans) can reason about what kind of thing a piece of knowledge is. Second, a wikilink graph encoded in the filesystem — folders are types, filenames are identities, [[wikilinks]] are edges — so the structure is queryable by ordinary file tools and survives outside any one app. Third, a team of role-separated agents (Conan grades, Sam writes, Bridget assembles briefings, Raven thinks, Solomon triages) so the library is built and maintained by AI, not just consumed by it.',
    '6': 'Tuesday, 10:14 AM. Devon has three Claude Code sessions running across three branches and a fourth window open with Raven, his product-thinking partner. A new request landed overnight from a design partner: they want the onboarding flow to handle a class of user — operators who already have an existing library — that nobody had thought through. A year ago, this would have been Devon’s whole Tuesday: re-read the spec, write a mini-brief for himself, talk it through with a co-founder, write tickets, then start pasting context into agents one by one.\n\nInstead, he opens the library room and tells Raven what landed. Raven pulls in the relevant cards — the onboarding journey, the principle that says first-visit and return-visit are the same room, the standard that defines what counts as an existing library, the decision card explaining why they refused a different version of this six months ago. She names two tensions she sees with the existing thesis and proposes three resolutions; Devon picks one and edits one card’s WHY himself. Bridget assembles a context briefing for the implementing agent in the second window. The agent writes the change, lints clean against the standards in the library, and Conan grades it. By 11:30 the change is in review on a branch, and the library itself is one card richer because Sam added a new Decision card recording why they took this shape and not the others.\n\nConspicuously absent from Devon’s Tuesday: the 40-minute "let me re-explain the product" call that used to start every new feature. The Notion page nobody updates. The Slack thread where three people relitigate naming. The doc Devon used to write himself at 11 PM because it was the only way the agents would get it right by Wednesday. The agent has not asked him "what should I name this?" The agent has not invented a modal. The agent has not duplicated an existing concept under a new name. Devon hasn’t pasted anything.\n\nBy Thursday the design partner is using it. Devon hasn’t been the bottleneck once.',
    '7': '• Agents read from and write to the library as part of normal work. In customer repos, the library is touched (read via Bridget briefings, written via Sam, graded via Conan) in the same week-over-week rhythm as the code itself. If the library exists but only humans touch it, the Mechanism has failed — it became wiki, not substrate.\n• The "re-explain the product to the agent" step drops out of the workflow. Observable in customer behavior: implementing agents are invoked without a hand-pasted product brief in the prompt because the briefing comes from the library. A competitor doing fancier RAG over docs could not hit this — they’d still be retrieving chunks, not assembling typed briefings from a graph.\n• New hires and new agents onboard from the same artifact. In customer companies that have grown past the founder’s head, both a human joining the team and a new AI agent being instantiated bootstrap from the library. If only humans use it for onboarding, it’s documentation; if only agents use it, it’s a prompt-config file. Both, and it’s the externalized product mind the Discovered Pain points at.',
    '8': '• Not for the enterprise knowledge-management buyer. Companies that want "an AI-powered Confluence" or a documentation portal for human readers will ask for permissioning, audit trails, page-level approvals, and a rich human editor — all of which would push the library back toward a wiki for humans to browse. The moment the primary reader is a human compliance officer, the typed-graph-for-agents primitive becomes overhead.\n• Not for teams that want a one-shot context dump. A team that says "we already have a great spec — just point the AI at it" is looking for better RAG, not a living library. There’s no way to make the Discovered Pain materialize for a customer who never builds the substrate.\n• Not for shops where humans, not agents, are doing essentially all the load-bearing implementation work. If AI agents in the org are still autocomplete-level and a senior human is in the loop for every meaningful decision, the cost of maintaining a typed library outweighs the benefit — the agent isn’t trusted with the decisions the library exists to inform.'
  };

  // ── Raven scratchpad example notes (extracted from vision/draft-vision.md
  //    inline asides and "Notes from drafting" — sparse on purpose) ──
  const ALEXANDRIA_SCRATCH = {
    '2': 'Could not infer from source material with confidence. Public site names two audiences ("software factories" and "business operators with domain expertise") but never names a person. Proposed Devon as a plausible composite from README framing — director should ratify or replace.',
    '3b': 'Lower confidence — extrapolated from the README’s "implicit product knowledge made explicit" framing, not from any customer voice in the source material. The reframe ("no externalized product mind") is consistent but is a drafter’s guess at what customers realize on the back end.',
    '4': 'Five alternatives are named but none came from direct customer interviews — all inferred from the README’s implicit contrasts. Competitor descriptions are structurally sound but the director should confirm these are the actual tools Devon reaches for today.',
    '5': 'Conflict in source material: website foregrounds Raven as "your senior product manager" as the singular hook; README treats her as one of five role-separated agents. Draft went with the five-agent primitive as more concrete and falsifiable. If Raven is the real product hook, this slot needs reworking.',
    '8': 'Third refusal flagged lower confidence inline. Cannot tell from public material whether early-stage AI-adoption shops are a real refusal or an intended on-ramp. Director should confirm before this becomes a sales filter.'
  };

  // ── State ──
  //   notch: 0 = unset, 1 = Build, 2 = Tune, 3 = Approved
  //   text:  director's answer
  //   scratch: Raven's margin notes (also editable by director)
  const STORAGE_KEY = 'vision-builder:v2';
  const STORAGE_KEY_OLD = 'vision-builder:v1';
  const STATE_LABELS = ['—', 'Build', 'Tune', 'Approved'];
  let state = loadState();
  let saveDebounce = null;
  let allScratchOpen = false;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
      // Migrate from v1 if present.
      const rawOld = localStorage.getItem(STORAGE_KEY_OLD);
      if (rawOld) {
        const parsedOld = JSON.parse(rawOld);
        const migrated = {};
        Object.keys(parsedOld || {}).forEach(id => {
          const entry = parsedOld[id] || {};
          // Old notch was 0=Needs Work, 1=Decent, 2=Solid.
          // Map to new: 0(NW)→1(Build), 1(Decent)→2(Tune), 2(Solid)→3(Approved).
          const oldNotch = typeof entry.notch === 'number' ? entry.notch : 0;
          const newNotch = Math.min(3, oldNotch + 1);
          migrated[id] = {
            text: entry.text || '',
            notch: newNotch,
            scratch: ''
          };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch (_) { /* fall through to empty */ }
    return {};
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function debouncedSave() {
    if (saveDebounce) clearTimeout(saveDebounce);
    saveDebounce = setTimeout(() => { saveState(); flashSaved(); }, 250);
  }

  function getField(id) {
    if (!state[id]) state[id] = { text: '', notch: 0, scratch: '', instructionsCollapsed: false };
    if (typeof state[id].scratch !== 'string') state[id].scratch = '';
    if (typeof state[id].notch !== 'number') state[id].notch = 0;
    if (typeof state[id].text !== 'string') state[id].text = '';
    if (typeof state[id].instructionsCollapsed !== 'boolean') state[id].instructionsCollapsed = false;
    return state[id];
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ── Rendering ──
  function renderRequirements(schema) {
    return (
      '<div class="vb-req">' +
        '<span class="vb-req-label">Length</span><span class="vb-req-val">' + escapeHtml(schema.length) + '</span>' +
        '<span class="vb-req-label">Pulling for</span><span class="vb-req-val">' + escapeHtml(schema.pullingFor) + '</span>' +
        '<span class="vb-req-label">Quick test</span><span class="vb-req-val">' + escapeHtml(schema.quickTest) + '</span>' +
      '</div>'
    );
  }

  function stateClassFor(notch) {
    if (notch === 1) return 'is-build';
    if (notch === 2) return 'is-tune';
    if (notch === 3) return 'is-approved';
    return '';
  }

  function renderSlider(field, f) {
    return (
      '<div class="vb-slider-block" data-state="' + f.notch + '">' +
        '<input type="range" class="vb-slider" data-id="' + field.id + '" ' +
               'min="0" max="3" step="1" value="' + f.notch + '" ' +
               'aria-label="Assessment for ' + escapeHtml(field.title) + '. Position 0 unset, 1 Build, 2 Tune, 3 Approved.">' +
        '<div class="vb-slider-scale" aria-hidden="true">' +
          '<span data-pos="0">—</span>' +
          '<span data-pos="1">Build</span>' +
          '<span data-pos="2">Tune</span>' +
          '<span data-pos="3">Approved</span>' +
        '</div>' +
        '<span class="vb-slider-state" data-id-state="' + field.id + '">' + escapeHtml(STATE_LABELS[f.notch]) + '</span>' +
      '</div>'
    );
  }

  function renderSection(field) {
    const f = getField(field.id);
    const isSub = !!field.group;
    const hasScratch = !!(f.scratch && f.scratch.trim());
    const scratchCount = hasScratch ? '<span class="vb-scratch-count">· note</span>' : '';
    const instructionsOpen = f.instructionsCollapsed !== true;
    const collapsedClass = instructionsOpen ? '' : ' instructions-collapsed';
    return (
      '<article class="vb-section ' + stateClassFor(f.notch) + collapsedClass + '" data-id="' + field.id + '">' +
        '<div class="vb-sec-head">' +
          '<span class="vb-sec-num' + (isSub ? ' is-sub' : '') + '">' + escapeHtml(isSub ? field.id : field.number) + '</span>' +
          '<div class="vb-sec-title-block">' +
            '<span class="vb-sec-title">' + escapeHtml(field.title) + '</span>' +
            '<span class="vb-sec-subtitle">' + escapeHtml(field.subtitle) + '</span>' +
          '</div>' +
          renderSlider(field, f) +
        '</div>' +
        '<div class="vb-instructions-bar">' +
          '<button type="button" class="vb-instructions-toggle" data-instructions-toggle="' + field.id + '" aria-expanded="' + instructionsOpen + '">' +
            '<span class="vb-chev">▾</span>' +
            'Instructions' +
          '</button>' +
          '<button type="button" class="vb-more-guidance" data-guidance="' + field.id + '">' +
            '<span class="vb-info-glyph">i</span>' +
            'More guidance' +
          '</button>' +
        '</div>' +
        '<div class="vb-instructions">' +
          renderRequirements(field.schemaLine) +
          '<p class="vb-prompt">' + escapeHtml(field.prompt) + '</p>' +
        '</div>' +
        '<textarea class="vb-input" data-id="' + field.id + '" placeholder="Your answer here…" rows="4">' + escapeHtml(f.text) + '</textarea>' +
        '<div class="vb-belowbar">' +
          '<button type="button" class="vb-scratch-toggle" data-scratch-toggle="' + field.id + '" aria-expanded="false">' +
            '<span class="vb-chev">›</span>' +
            'Raven’s scratch' +
            scratchCount +
          '</button>' +
        '</div>' +
        '<div class="vb-scratch" data-scratch-body="' + field.id + '">' +
          '<div class="vb-scratch-label">Notes from Raven (and you)</div>' +
          '<textarea class="vb-scratch-input" data-scratch-id="' + field.id + '" ' +
                    'placeholder="Confidence flags, conflicts in sources, things to bring to the director — Raven leaves notes here as she works. You can write here too.">' +
            escapeHtml(f.scratch) +
          '</textarea>' +
        '</div>' +
      '</article>'
    );
  }

  function renderForm() {
    const container = document.getElementById('vb-form');
    const parts = [];
    let i = 0;
    while (i < VISION_FIELDS.length) {
      const field = VISION_FIELDS[i];
      if (field.group) {
        const groupId = field.group;
        const groupOpener = VISION_FIELDS[i];
        const groupSections = [];
        while (i < VISION_FIELDS.length && VISION_FIELDS[i].group === groupId) {
          groupSections.push(VISION_FIELDS[i]);
          i++;
        }
        parts.push(
          '<section class="vb-section-group" data-group="' + groupId + '">' +
            '<header class="vb-section-group-head">' +
              '<span class="vb-section-group-num">' + escapeHtml(groupId) + '</span>' +
              '<div>' +
                '<div class="vb-section-group-title">' + escapeHtml(groupOpener.groupTitle || 'Section ' + groupId) + '</div>' +
                '<div class="vb-section-group-subtitle">' + escapeHtml(groupOpener.groupSubtitle || '') + '</div>' +
              '</div>' +
            '</header>' +
            groupSections.map(renderSection).join('') +
          '</section>'
        );
      } else {
        parts.push(renderSection(field));
        i++;
      }
    }
    container.innerHTML = parts.join('');
    wireSections();
    updateProgress();
    updateGroupStates();
  }

  // Debounced server POSTers — one per (id, field) so concurrent
  // edits to different slots don't fight each other.
  const remotePushTimers = new Map();
  function pushRemote(kind, id, payload, ms) {
    if (!serverAvailable) return;
    const key = kind + '|' + id;
    if (remotePushTimers.has(key)) clearTimeout(remotePushTimers.get(key));
    remotePushTimers.set(key, setTimeout(() => {
      remotePushTimers.delete(key);
      fetch('/api/canvas/vision/' + kind + '/' + encodeURIComponent(id), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.assign({ by: 'director' }, payload))
      }).catch(() => {});
    }, ms == null ? 350 : ms));
  }

  // ── Wiring ──
  function wireSections() {
    document.querySelectorAll('.vb-input').forEach(el => {
      el.addEventListener('input', () => {
        const id = el.dataset.id;
        getField(id).text = el.value;
        debouncedSave();
        pushRemote('slot', id, { text: el.value });
      });
    });
    document.querySelectorAll('.vb-scratch-input').forEach(el => {
      el.addEventListener('input', () => {
        const id = el.dataset.scratchId;
        const f = getField(id);
        f.scratch = el.value;
        updateScratchCount(id);
        debouncedSave();
        pushRemote('scratch', id, { scratch: el.value });
      });
    });
    document.querySelectorAll('.vb-slider').forEach(el => {
      el.addEventListener('input', () => onSlider(el.dataset.id, parseInt(el.value, 10)));
    });
    document.querySelectorAll('[data-scratch-toggle]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.scratchToggle;
        const section = document.querySelector('.vb-section[data-id="' + id + '"]');
        if (!section) return;
        const open = !section.classList.contains('scratch-open');
        section.classList.toggle('scratch-open', open);
        el.setAttribute('aria-expanded', String(open));
      });
    });
    document.querySelectorAll('[data-instructions-toggle]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.instructionsToggle;
        const section = document.querySelector('.vb-section[data-id="' + id + '"]');
        if (!section) return;
        const collapsed = !section.classList.contains('instructions-collapsed');
        section.classList.toggle('instructions-collapsed', collapsed);
        el.setAttribute('aria-expanded', String(!collapsed));
        getField(id).instructionsCollapsed = collapsed;
        debouncedSave();
      });
    });
    document.querySelectorAll('[data-guidance]').forEach(el => {
      el.addEventListener('click', () => openGuidance(el.dataset.guidance));
    });
  }

  function onSlider(id, value) {
    const f = getField(id);
    f.notch = value;
    const block = document.querySelector('.vb-slider-block input[data-id="' + id + '"]').parentElement;
    if (block) block.dataset.state = String(value);
    const stateLabel = document.querySelector('[data-id-state="' + id + '"]');
    if (stateLabel) stateLabel.textContent = STATE_LABELS[value];
    const section = document.querySelector('.vb-section[data-id="' + id + '"]');
    if (section) {
      section.classList.remove('is-build', 'is-tune', 'is-approved');
      const cls = stateClassFor(value);
      if (cls) section.classList.add(cls);
    }
    debouncedSave();
    pushRemote('notch', id, { notch: value }, 120);
    updateProgress();
    updateGroupStates();
  }

  function updateScratchCount(id) {
    const f = getField(id);
    const toggle = document.querySelector('[data-scratch-toggle="' + id + '"]');
    if (!toggle) return;
    const existing = toggle.querySelector('.vb-scratch-count');
    if (existing) existing.remove();
    if (f.scratch && f.scratch.trim()) {
      const span = document.createElement('span');
      span.className = 'vb-scratch-count';
      span.textContent = '· note';
      toggle.appendChild(span);
    }
  }

  function updateProgress() {
    const counts = [0, 0, 0, 0];
    VISION_FIELDS.forEach(field => { counts[getField(field.id).notch]++; });
    document.getElementById('vb-count-unset').textContent = counts[0];
    document.getElementById('vb-count-build').textContent = counts[1];
    document.getElementById('vb-count-tune').textContent = counts[2];
    document.getElementById('vb-count-approved').textContent = counts[3];
    document.getElementById('vb-bank').disabled = counts[3] !== VISION_FIELDS.length;
  }

  function updateGroupStates() {
    document.querySelectorAll('.vb-section-group').forEach(group => {
      const sections = group.querySelectorAll('.vb-section');
      const allApproved = Array.from(sections).every(s => s.classList.contains('is-approved'));
      group.classList.toggle('is-all-approved', allApproved);
    });
  }

  // ── Saved-flash ──
  let flashTimer = null;
  function flashSaved() {
    const flash = document.getElementById('vb-saved');
    if (!flash) return;
    flash.classList.add('shown');
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => flash.classList.remove('shown'), 900);
  }

  // ── Guidance modal ──
  // In-memory cache of the two source docs so re-opens are instant.
  const _docCache = {};
  async function loadDoc(name) {
    if (_docCache[name]) return _docCache[name];
    const res = await fetch('vision-docs/' + name, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load ' + name);
    _docCache[name] = await res.text();
    return _docCache[name];
  }
  // Pull a single `## <id>. ...` section out of a markdown doc.
  function extractSection(md, sectionId) {
    const lines = md.split('\n');
    let start = -1, end = lines.length;
    const startRe = new RegExp('^## ' + sectionId.replace('.', '\\.') + '\\.\\s', 'i');
    for (let i = 0; i < lines.length; i++) {
      if (startRe.test(lines[i])) { start = i; break; }
    }
    if (start === -1) return null;
    for (let i = start + 1; i < lines.length; i++) {
      if (/^## /.test(lines[i])) { end = i; break; }
    }
    return lines.slice(start, end).join('\n');
  }
  // Minimal markdown → HTML. Handles the subset deep-guidance.md /
  // examples.md actually use: ##/### headings, **bold**, *italic*,
  // `code`, > blockquote, - bullet list, paragraphs.
  function renderMarkdown(md) {
    const lines = md.split('\n');
    const out = [];
    let inList = false;
    let inQuote = false;
    let para = [];
    function flushPara() {
      if (para.length) {
        out.push('<p>' + inline(para.join(' ')) + '</p>');
        para = [];
      }
    }
    function closeList() { if (inList) { out.push('</ul>'); inList = false; } }
    function closeQuote() { if (inQuote) { out.push('</blockquote>'); inQuote = false; } }
    function inline(s) {
      // Escape first, then re-introduce specific patterns.
      let t = s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
      t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
      return t;
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (/^### /.test(trimmed)) {
        flushPara(); closeList(); closeQuote();
        out.push('<h4>' + inline(trimmed.replace(/^### /, '')) + '</h4>');
      } else if (/^## /.test(trimmed)) {
        flushPara(); closeList(); closeQuote();
        out.push('<h3>' + inline(trimmed.replace(/^## /, '')) + '</h3>');
      } else if (/^# /.test(trimmed)) {
        flushPara(); closeList(); closeQuote();
        out.push('<h2>' + inline(trimmed.replace(/^# /, '')) + '</h2>');
      } else if (/^[-•]\s/.test(trimmed)) {
        flushPara(); closeQuote();
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push('<li>' + inline(trimmed.replace(/^[-•]\s/, '')) + '</li>');
      } else if (/^>/.test(trimmed)) {
        flushPara(); closeList();
        if (!inQuote) { out.push('<blockquote>'); inQuote = true; }
        out.push('<p>' + inline(trimmed.replace(/^>\s?/, '')) + '</p>');
      } else if (trimmed === '' || trimmed === '---') {
        flushPara();
        if (trimmed === '---') { closeList(); closeQuote(); out.push('<hr>'); }
      } else {
        closeList(); closeQuote();
        para.push(trimmed);
      }
    }
    flushPara(); closeList(); closeQuote();
    return out.join('\n');
  }
  async function openGuidance(id) {
    const field = VISION_FIELDS.find(f => f.id === id);
    if (!field) return;
    const title = (field.group ? field.id + '. ' : field.number + '. ') + field.title;
    document.getElementById('vb-guidance-title').textContent = title;
    document.getElementById('vb-guidance-body').innerHTML =
      '<p class="vb-guidance-loading">Loading guidance…</p>';
    document.getElementById('vb-guidance-pointer').innerHTML =
      '<a href="vision-docs/deep-guidance.md" target="_blank" rel="noopener">deep-guidance.md</a>' +
      ' · ' +
      '<a href="vision-docs/examples.md" target="_blank" rel="noopener">examples.md</a>';
    document.getElementById('vb-guidance').classList.add('shown');
    try {
      const [deep, ex] = await Promise.all([loadDoc('deep-guidance.md'), loadDoc('examples.md')]);
      const deepSection = extractSection(deep, field.id) || '*No matching section in deep-guidance.md*';
      const exSection = extractSection(ex, field.id) || '*No matching section in examples.md*';
      document.getElementById('vb-guidance-body').innerHTML =
        '<div class="vb-guidance-tabbed">' +
          '<div class="vb-guidance-pane">' +
            '<div class="vb-guidance-pane-label">Deep guidance</div>' +
            '<div class="vb-guidance-pane-body">' + renderMarkdown(deepSection) + '</div>' +
          '</div>' +
          '<div class="vb-guidance-pane">' +
            '<div class="vb-guidance-pane-label">Worked examples</div>' +
            '<div class="vb-guidance-pane-body">' + renderMarkdown(exSection) + '</div>' +
          '</div>' +
        '</div>';
    } catch (err) {
      document.getElementById('vb-guidance-body').innerHTML =
        '<p>Couldn\'t load the docs. The files live at <code>vision-docs/deep-guidance.md</code> and <code>vision-docs/examples.md</code>.</p>';
    }
  }
  function closeGuidance() {
    document.getElementById('vb-guidance').classList.remove('shown');
  }

  // ── Header utilities ──
  function wireHeader() {
    document.getElementById('vb-load-example').addEventListener('click', () => {
      const confirmed = !hasAnyContent() ||
        confirm('Replace your current Vision content with the Alexandria draft example?');
      if (!confirmed) return;
      VISION_FIELDS.forEach(field => {
        const f = getField(field.id);
        if (ALEXANDRIA_EXAMPLE[field.id]) f.text = ALEXANDRIA_EXAMPLE[field.id];
        if (ALEXANDRIA_SCRATCH[field.id]) f.scratch = ALEXANDRIA_SCRATCH[field.id];
      });
      saveState();
      renderForm();
      // Keep the global expand-all state coherent after rerender.
      if (allScratchOpen) document.body.classList.add('scratch-all-open');
      flashSaved();
    });
    document.getElementById('vb-clear').addEventListener('click', () => {
      if (!confirm('Wipe all sections, sliders, and scratchpads?')) return;
      state = {};
      saveState();
      renderForm();
      if (allScratchOpen) document.body.classList.add('scratch-all-open');
      flashSaved();
    });
    document.getElementById('vb-toggle-scratch').addEventListener('click', () => {
      allScratchOpen = !allScratchOpen;
      document.body.classList.toggle('scratch-all-open', allScratchOpen);
      const btn = document.getElementById('vb-toggle-scratch');
      btn.textContent = allScratchOpen ? 'Collapse all scratch' : 'Expand all scratch';
      btn.classList.toggle('is-active', allScratchOpen);
    });
    document.getElementById('vb-bank').addEventListener('click', async () => {
      const payload = assembleVisionPayload();
      const embedded = window.parent && window.parent !== window;
      if (!embedded) {
        alert(
          'Bank Vision (standalone mode)\n\n' +
          'Atomized output assembled from ' + payload.slots.length +
          ' slots. In the embedded flow, the canvas will move the Vision card to Banked and atomize into the library.'
        );
        console.info('[vision-builder] Banked payload:', payload);
        return;
      }
      // Embedded flow: server is the source of truth. POST to the bank
      // endpoint FIRST so vision.json is marked banked + the
      // vision-banked event lands in step-events.jsonl for Raven's
      // watcher. Only then show the local ack + signal the parent
      // (no payload — parent fetches /api/canvas/vision when it
      // builds the library card, so we never duplicate slot content
      // client-side). Ack is gated on server success so the iframe
      // never displays "atomizing" for a Bank the server didn't see.
      let serverOk = false;
      if (serverAvailable) {
        try {
          const res = await fetch('/api/canvas/vision/bank', { method: 'POST' });
          serverOk = res.ok;
        } catch (_) { /* serverOk stays false */ }
      }
      if (serverOk) {
        showLocalBankAck();
      } else {
        console.warn('[vision-builder] Bank: server bank endpoint failed or unreachable; parent will retry.');
      }
      try {
        window.parent.postMessage({ type: 'alexandria.bankVision' }, '*');
      } catch (_) {}
    });
    document.getElementById('vb-guidance-close').addEventListener('click', closeGuidance);
    document.getElementById('vb-guidance').addEventListener('click', (e) => {
      if (e.target.id === 'vb-guidance') closeGuidance();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeGuidance();
    });
  }

  function hasAnyContent() {
    return Object.values(state).some(v =>
      v && ((v.text && v.text.trim()) || (v.scratch && v.scratch.trim()) || v.notch));
  }

  // ── Bank: assemble the atomized payload for the library ─────
  // Walks the canonical field order, emits each slot's text +
  // notch state + scratch. The parent canvas turns this into a
  // library card (mocked in Phase 1; real atomization comes in
  // Phase 2 — typed cards across rationale/product/etc layers).
  function assembleVisionPayload() {
    const slots = VISION_FIELDS.map(field => {
      const f = getField(field.id);
      return {
        id: field.id,
        title: field.title,
        number: field.number,
        subtitle: field.subtitle,
        text: f.text || '',
        notch: f.notch,
        notchLabel: STATE_LABELS[f.notch] || '—',
        scratch: f.scratch || ''
      };
    });
    return {
      moduleId: 'vision',
      bankedAt: new Date().toISOString(),
      slots
    };
  }

  // ── Local visual ack after Bank ─────────────────────────────
  // Dims the form and shows a "Vision banked — Bridget is
  // atomizing…" panel until the parent dismisses the iframe.
  function showLocalBankAck() {
    let panel = document.getElementById('vb-bank-ack');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'vb-bank-ack';
      panel.innerHTML = `
        <div class="vb-bank-ack-inner">
          <div class="vb-bank-ack-eyebrow">Vision banked</div>
          <div class="vb-bank-ack-title">Bridget is atomizing now.</div>
          <div class="vb-bank-ack-spinner"><span></span><span></span><span></span></div>
        </div>`;
      panel.style.cssText = [
        'position:fixed', 'inset:0',
        'background:rgba(20,14,8,0.78)',
        'backdrop-filter:blur(2px)',
        'display:flex', 'align-items:center', 'justify-content:center',
        'z-index:200',
        'animation:vb-bank-fade-in 0.3s ease forwards'
      ].join(';');
      document.body.appendChild(panel);
      // Inline keyframe + ack styles
      const style = document.createElement('style');
      style.textContent = `
        @keyframes vb-bank-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes vb-bank-dot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1.1); }
        }
        .vb-bank-ack-inner {
          max-width: 420px;
          padding: 28px 32px;
          background: var(--vb-slate-2);
          border: 1px solid var(--vb-accent-dim);
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 12px 40px rgba(0,0,0,0.55);
        }
        .vb-bank-ack-eyebrow {
          font: 600 11px/1 'Inter', sans-serif;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--vb-accent);
          margin-bottom: 10px;
        }
        .vb-bank-ack-title {
          font: italic 400 22px/1.3 'Cormorant Garamond', serif;
          color: var(--vb-fg-bright);
          margin-bottom: 18px;
        }
        .vb-bank-ack-spinner {
          display: inline-flex;
          gap: 6px;
        }
        .vb-bank-ack-spinner span {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--vb-accent);
          animation: vb-bank-dot 1.2s ease-in-out infinite;
        }
        .vb-bank-ack-spinner span:nth-child(2) { animation-delay: 0.18s; }
        .vb-bank-ack-spinner span:nth-child(3) { animation-delay: 0.36s; }
      `;
      document.head.appendChild(style);
    }
  }

  // ── Canvas-server bridge ────────────────────────────────────
  // The Vision Builder can run in two modes:
  //   1. Standalone — directly served from canvas-server but with
  //      no listener (the form is the whole world). localStorage
  //      drives state.
  //   2. Embedded — inside the canvas onboarding iframe. Here the
  //      canvas-server tracks vision state in vision.json so
  //      Raven (Claude Code) can write into it. The form
  //      subscribes to SSE and applies remote writes.
  // We auto-detect server availability and wire SSE if it answers.
  let evtSource = null;
  let serverAvailable = false;
  let lastWrittenByLocal = new Map(); // id → ts-ish marker to ignore SSE echoes

  async function detectServer() {
    try {
      const res = await fetch('/api/canvas/vision', { cache: 'no-cache' });
      if (!res.ok) return false;
      const remote = await res.json();
      serverAvailable = true;
      // Merge any remote state into local — if the server has slot text
      // newer than what's in localStorage, accept it.
      mergeRemoteState(remote, /*flash=*/false);
      // Re-render after merge so initial paint reflects server truth.
      renderForm();
      // Surface the sources panel; it's hidden until we know we have
      // a server to talk to.
      const panel = document.getElementById('vb-sources');
      if (panel) panel.hidden = false;
      // Render any existing sources.
      renderSourcesList(remote.sources || []);
      // Subscribe to the live stream.
      try {
        evtSource = new EventSource('/api/vision-stream');
        evtSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            mergeRemoteState(data, /*flash=*/true);
            renderSourcesList(data.sources || []);
          } catch (_) {}
        };
      } catch (_) { /* no SSE support — fall through */ }
      return true;
    } catch (_) {
      return false;
    }
  }

  function mergeRemoteState(remote, flash) {
    if (!remote || !remote.slots) return;
    Object.keys(remote.slots).forEach(id => {
      const rs = remote.slots[id];
      if (!rs) return;
      const f = getField(id);
      let touched = false;
      // Accept remote text if it differs and the remote was written
      // (lastWritten exists). We don't blow away local text the
      // director may have typed while disconnected.
      if (rs.lastWritten && typeof rs.text === 'string' && rs.text !== f.text) {
        const marker = id + '|' + rs.lastWritten.ts;
        if (!lastWrittenByLocal.has(marker)) {
          f.text = rs.text;
          touched = true;
        }
      }
      if (rs.lastWritten && typeof rs.scratch === 'string' && rs.scratch !== f.scratch) {
        const marker = 'scratch|' + id + '|' + rs.lastWritten.ts;
        if (!lastWrittenByLocal.has(marker)) {
          f.scratch = rs.scratch;
          touched = true;
        }
      }
      if (rs.lastWritten && typeof rs.notch === 'number' && rs.notch !== f.notch) {
        const marker = 'notch|' + id + '|' + rs.lastWritten.ts;
        if (!lastWrittenByLocal.has(marker)) {
          f.notch = rs.notch;
          touched = true;
        }
      }
      if (touched) {
        // Update the visible DOM for this slot without a full re-render
        // so the director's other cursor positions don't get wiped.
        applyFieldToDom(id);
        if (flash && rs.lastWritten.by === 'raven') {
          const section = document.querySelector('.vb-section[data-id="' + id + '"]');
          if (section) {
            section.classList.remove('remote-flash');
            void section.offsetWidth;
            section.classList.add('remote-flash');
          }
        }
      }
    });
    saveState();
    updateProgress();
    updateGroupStates();
  }

  function applyFieldToDom(id) {
    const f = getField(id);
    const ta = document.querySelector('.vb-input[data-id="' + id + '"]');
    if (ta && ta.value !== f.text) ta.value = f.text;
    const sa = document.querySelector('.vb-scratch-input[data-scratch-id="' + id + '"]');
    if (sa && sa.value !== f.scratch) sa.value = f.scratch;
    const slider = document.querySelector('.vb-slider[data-id="' + id + '"]');
    if (slider && String(f.notch) !== slider.value) slider.value = String(f.notch);
    const block = slider ? slider.parentElement : null;
    if (block) block.dataset.state = String(f.notch);
    const stateLabel = document.querySelector('[data-id-state="' + id + '"]');
    if (stateLabel) stateLabel.textContent = STATE_LABELS[f.notch];
    const section = document.querySelector('.vb-section[data-id="' + id + '"]');
    if (section) {
      section.classList.remove('is-build', 'is-tune', 'is-approved');
      const cls = stateClassFor(f.notch);
      if (cls) section.classList.add(cls);
    }
    const toggle = document.querySelector('[data-scratch-toggle="' + id + '"]');
    if (toggle) {
      const existing = toggle.querySelector('.vb-scratch-count');
      if (existing) existing.remove();
      if (f.scratch && f.scratch.trim()) {
        const span = document.createElement('span');
        span.className = 'vb-scratch-count';
        span.textContent = '· note';
        toggle.appendChild(span);
      }
    }
  }

  function renderSourcesList(sources) {
    const list = document.getElementById('vb-sources-list');
    if (!list) return;
    if (!sources || !sources.length) {
      list.innerHTML = '<span style="font-style:italic;color:var(--vb-fg-dimmer);font-size:11px;">No sources yet — paste a few above and hand them off.</span>';
      return;
    }
    list.innerHTML = sources.map(s => {
      const raw = String(s.raw || '').replace(/[<>&]/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
      const by = s.addedBy === 'raven' ? 'Raven' : 'You';
      return '<span class="vb-source-chip" title="' + raw + '">' +
        '<span class="vb-source-chip-text">' + raw + '</span>' +
        '<span class="vb-source-chip-by">' + by + '</span>' +
        '</span>';
    }).join('');
  }

  function wireSources() {
    const handBtn = document.getElementById('vb-sources-hand');
    const input = document.getElementById('vb-sources-input');
    const status = document.getElementById('vb-sources-status');
    const toggle = document.getElementById('vb-sources-toggle');
    const panel = document.getElementById('vb-sources');
    if (handBtn) {
      handBtn.addEventListener('click', async () => {
        const raw = input.value || '';
        const sources = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        if (!sources.length) {
          status.textContent = 'Paste at least one URL or path first.';
          return;
        }
        handBtn.disabled = true;
        status.textContent = 'Handing ' + sources.length + ' source' + (sources.length === 1 ? '' : 's') + ' to Raven…';
        try {
          await fetch('/api/canvas/vision/sources', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sources, by: 'director' })
          });
          input.value = '';
          status.textContent = 'Handed. Raven will wake when this session ends — check her chat in Claude Code.';
        } catch (e) {
          status.textContent = 'Couldn\'t reach the canvas-server. Is it running on :4322?';
        } finally {
          handBtn.disabled = false;
        }
      });
    }
    if (toggle && panel) {
      toggle.addEventListener('click', () => {
        panel.classList.toggle('is-collapsed');
      });
    }
  }

  // ── Boot ──
  renderForm();
  wireHeader();
  wireSources();
  detectServer();
})();
