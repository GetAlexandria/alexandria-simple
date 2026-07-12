/* ───────────────────────────────────────────────────────────────────────
   SINGLE SOURCE OF TRUTH for play IDENTITY + catalog filing + criticality
   Tier (`prio`) — NOT the production stage. The viewer catalog and Board
   both render play identity from this file; edit identity and
   Division/Function filing here and nowhere else. The
   production STAGE lives in board-state.json, which is its own single
   source of truth (README, "The Board is the single source of truth for
   production progress").

   Catalog spine: Alexandria_Prime → Division → Function → Play.
   The face agent (Raven, William) is derived from the Division definition;
   it is not stored on individual plays. Functions validate only against
   the declaring play's Division function set. Operations and Library
   Operations are present in every Division, but they are not a global
   lookup path for play filing.

   - status : LEGACY / archeological — the early-era proving ladder
              (slot → designed → hardened → derived → proven →
              registered) that predates BOTH the Board and the current
              risk-map/fixture testing system (IN1 ruling, 2026-06-21).
              It is NO LONGER the source of truth for production stage —
              board-state.json owns that. Retained on each row only as a
              degraded fallback seed for tools that need to bootstrap from
              older records; a later cleanup drops the field once that
              fallback is removed (out of scope here). The HARDENING STEP is
              alive and well (README Step 2; frame-the-problem/hardening.md is
              the worked example) — only the legacy status NAME "hardened" is
              archeological, not the step.
   - The Board's play-stage column + priority order and work-order cards live
     in board-state.json (the mutable workflow state — the Board page persists
     edits there, agents edit it directly). Play stages are Backlog → Sourced
     → Designed → Built → Proven → Live; work orders keep a separate
     open / in-progress / done status.
   - prio 'parked': pulled from the golden path and the Board by the
     source-canon audit (Director ruling, 2026-06-12 — see
     AUDIT-2026-06-12-source-canon.md and PARKING-LOT.md). Identity entries
     stay here; the Board does not render them.
   - prio 'studio': PlaymakerStudio catalog seeds that point at existing
     design artifacts. They belong in the catalog views (index/registry) but
     not on the production Board, which tracks build lifecycle — see
     appearsOnBoard() and BOARD_EXCLUDED_PRIOS below.
──────────────────────────────────────────────────────────────────────── */

const COMPANY='Alexandria_Prime';
const DIVISIONS={
  Product:{
    face:'Raven',
    functions:[
      'Insight',
      'Strategy',
      'Definition',
      'Delivery',
      'Launch',
      'Analytics',
      'Communication',
      'Operations',
      'Library Operations',
    ],
  },
  PlaymakerStudio:{
    face:'William',
    functions:[
      'Production',
      'Proving',
      'Operations',
      'Library Operations',
    ],
  },
};
const UNIVERSAL_FUNCTIONS=['Operations','Library Operations'];
// The production Board tracks build lifecycle only. Parked plays and
// most PlaymakerStudio catalog seeds are catalog identity, not production cards.
// A Studio seed can opt into the Board with board:true when it becomes an
// active production card — see appearsOnBoard().
const BOARD_EXCLUDED_PRIOS=['parked','studio'];
const RETIRED_PLAY_FIELDS=[
  'job',
  'face',
  'faceAgent',
  'agent',
  'ownerAgent',
  'builtBy',
  'built_by',
  'builtByDivision',
  'builderDivision',
  'authorDivision',
];

const RUNGS=[
  {n:1,name:'Frame the Problem (frozen baseline)',slug:'frame-the-problem-baseline',glyph:'🔍',g:1,tier:'PM',division:'Product',function:'Insight',prio:'parked',status:'proven',ws:1,rulings:0,surface:'banked',
   d:'State the job-to-be-done and exactly who has it — recover the problem behind the pitched solution. Emits a <b>problem brief</b>. Banked 2026-06-11 (Gate 2: approved by Jess, relayed by the Director) after the pre-bank full re-lint; hard-case tested at the 5+ tangled-problem ceiling, cold-reader gate passes. <b>FROZEN read-only 2026-06-12</b> (Slice 3 of the Studio → Fabro plan, at repo commit 4ca2286502a): the monolith-era bank stands as the comparison baseline. <b>Retired as rung 1 on 2026-06-15</b>; the carve below was promoted to the canonical <code>frame-the-problem</code> on 2026-06-18 and this baseline moved to <code>frame-the-problem-baseline/</code>. Parked here as the frozen monolith-era baseline and the prompt-craft + curriculum exemplar. Files stay read-only (the live brief incorporates §§1–3/5–11 from here by reference).'},
  {n:1,name:'Frame the Problem',slug:'frame-the-problem',glyph:'🧬',g:0,doc:'frame-the-problem/brief.md',tier:'PM',division:'Product',function:'Insight',prio:'core',status:'registered',rulings:0,surface:'registered',
   d:'The active rung 1, carved and registered: the proven logic re-rendered through the reshaped ladder — §4 as a move graph, derived workflow package, registered in Alexandria. <b>Registered + runnable 2026-06-18</b>: promoted from <code>frame-the-problem-next/</code> to the canonical <code>frame-the-problem/</code>; <code>ax run frame-the-problem</code> runs the Riff build live (4-node pre_fill → review ⇄ revise → exit); diagram + story re-derived from the workflow, fixtures trimmed to the single declared input (transcript). <b>Pre-bank (smoke):</b> a Riff N=1 smoke ran 2026-06-18 (pre_fill only, auto-approve); the surfaced defects were then chased and fixed — prompt output-discipline (reliable file writes), verbatim/completeness/skeleton rules, and a dead <code>__AX2_</code> placeholder corrected to <code>__AX_</code> (studio+plugin; PROJECTION §3 updated). On re-run, 8/8 problem fixtures emitted a deliverable and every previously-failing case passed (two minor residuals). Riff hardening + lint re-audited (graph clean). The 9-move-carve runs are archived under dry-runs/archive-9move-carve/. Owed before bank: a k≈30 graded campaign, the interactive review⇄revise loop, and the IN-1/IN-2 invariance pairings — see risk-map.md and dry-runs/read-out.md. Content unchanged by law; brief carved 2026-06-12 (§§1–3/5–11 incorporated by reference from the frozen baseline, parked above). Supersedes the monolith-era bank as rung 1.'},
  {n:2,name:'Write the One-Pager / PRD',slug:'write-the-one-pager',glyph:'📜',g:1,tier:'PM',division:'Product',function:'Definition',prio:'core',status:'slot',ws:1,rulings:4,surface:'full sketch',
   d:'Define what we are building and why — consumes the problem brief, builds up solution parameters against the shape of the problem space. <b>Ruled a compound play</b> (Director, 2026-06-11): its context inputs are each owned by an input play (below), compounded in when their artifact is missing; in the demo they are declared TBD. Drafted 2026-06-12 under the elicitation-review experiment (§6 proposed; 2026-06-11 rulings stand verbatim); Director review owed at the workshop. Source-canon audit (2026-06-12): the compound trimmed — 2b/2c/2f remain input plays; business-context questions absorbed as elicitation moves; market scan and sizing parked, summoned on demand.'},
  {n:3,name:'Scope an MVP',slug:'scope-an-mvp',glyph:'✂️',g:1,tier:'PM',division:'Product',function:'Definition',prio:'core',status:'slot',ws:1,rulings:4,surface:'full sketch',
   d:'Cut to the smallest valuable slice. Step-0 grounded 2026-06-11 (research/ + decision briefs in its play dir). Drafted 2026-06-12 under the elicitation-review experiment; frame ratification + queued decision briefs owed at Director review. Re-scoped to the startup floor (source-canon audit, 2026-06-12): DSDM/GDS governance machinery dropped for Shape Up-native mechanisms; hypothesis gate re-grounded in Mom Test.'},
  {n:4,name:'Architecture-Aware Build Plan',slug:'architecture-aware-build-plan',glyph:'🏗️',g:1,tier:'PM',division:'Product',function:'Delivery',prio:'core',status:'slot',ws:1,rulings:3,surface:'full sketch',
   d:'Sequence the work against the real codebase — the hand-off to Fabro. Step-0 grounded 2026-06-11; its compound inputs all map to existing plays (2b/2c/2f + delivery slots) — no new gaps. Drafted 2026-06-12 under the elicitation-review experiment; frame ratification owed at Director review.'},
  {n:'0',name:'Run Internal Feature Discovery',slug:'run-internal-feature-discovery',glyph:'💬',g:1,tier:'PM',division:'Product',function:'Insight',prio:'stretch',status:'slot',ws:1,rulings:5,surface:'full sketch',
   d:'Solution → problem, interactively — the conversational on-ramp before rung 1. Step-0 grounded + drafted 2026-06-12 (elicitation-review experiment); the rung-1 seam question (separate play vs interactive mode) leads its decision queue; Director review owed at the workshop.'},
  {n:'2a',name:'Elicit Business Context',slug:'elicit-business-context',glyph:'🗣️',g:1,tier:'PM',division:'Product',function:'Insight',prio:'parked',status:'slot',ws:1,rulings:4,surface:'full sketch',
   d:'Draw out why-now, strategic fit, and appetite from the stakeholders in the room. Slot added 2026-06-11 — the inventory gap rung 2 exposed. Step-0 grounded same day. Drafted 2026-06-12 (elicitation-review experiment). <b>Pulled from the golden path</b> (source-canon audit, 2026-06-12): BABOK-shaped stakeholder machinery; at startup scale this is three questions inside the rung 1–2 conversation, absorbed there — see PARKING-LOT.md.'},
  {n:'2b',name:'Feasibility Check',slug:'feasibility-check',glyph:'🧪',g:1,tier:'PM',division:'Product',function:'Insight',prio:'input',status:'slot',ws:1,rulings:3,surface:'full sketch',
   d:'Validate the idea against the architecture before committing resources. Step-0 grounded 2026-06-11. Drafted 2026-06-12 (elicitation-review experiment); Director review owed at the workshop.'},
  {n:'2c',name:'Survey the Existing System',slug:'survey-the-existing-system',glyph:'🗺️',g:1,tier:'PM',division:'Product',function:'Definition',prio:'input',status:'slot',ws:1,rulings:4,surface:'full sketch',
   d:'Tour the surface and audit what is load-bearing in the current build — the saddle\'s surface map, in-fiction. Step-0 grounded 2026-06-11. Drafted 2026-06-12 (elicitation-review experiment); Director review owed at the workshop. Re-scoped to the startup floor (source-canon audit, 2026-06-12): one context sketch + hotspot/risk list + discrepancy note; doc-governance metadata and due-diligence overlay dropped.'},
  {n:'2d',name:'Market & Competitor Scan',slug:'market-competitor-scan',glyph:'🔭',g:1,tier:'PM',division:'Product',function:'Insight',prio:'parked',status:'slot',ws:1,rulings:3,surface:'full sketch',
   d:'Summarize what competitors shipped and where the gaps are. <b>Pulled from the golden path</b> (source-canon audit, 2026-06-12): CI-vendor canon prescribed a standing corporate intelligence function; for a feature addition this play does not fire by default. On-demand repertoire after rebalance — see PARKING-LOT.md.'},
  {n:'2e',name:'Size the Opportunity',slug:'size-the-opportunity',glyph:'📐',g:1,tier:'PM',division:'Product',function:'Insight',prio:'parked',status:'slot',ws:1,rulings:5,surface:'full sketch',
   d:'Estimate the value of solving this versus the alternatives. <b>Pulled from the golden path</b> (source-canon audit, 2026-06-12): sizing serves framing a new bet, not scoping a feature; canon is already VC bottoms-up and survives intact. On-demand repertoire; trim 11 moves to ~6 on revival — see PARKING-LOT.md.'},
  {n:'2f',name:'Capture Technical Constraints',slug:'capture-technical-constraints',glyph:'⛓️',g:1,tier:'PM',division:'Product',function:'Insight',prio:'input',status:'slot',ws:1,rulings:3,surface:'full sketch',
   d:'File the eng constraints and feasibility notes raised in discussion — rung 2\'s constraints input. The worked example brief at plays/examples/ is this play. Step-0 grounded 2026-06-11. Drafted 2026-06-12 (elicitation-review experiment); Director review owed at the workshop.'},
  {n:'3b',name:'Write Acceptance Criteria',slug:'write-acceptance-criteria',glyph:'✅',g:1,tier:'PM',division:'Product',function:'Definition',prio:'stretch',status:'slot',ws:1,rulings:6,surface:'full sketch',
   d:'Spell out what "done" means — tightens the hand-off into rung 4. Step-0 grounded + drafted 2026-06-12 (elicitation-review experiment); cardinal sin designed in: criteria may never smuggle scope rung 3 already cut; Director review owed at the workshop.'},
  /* discovered compounds — grounded only; pulled from the Board by the
     source-canon audit (2026-06-12), see PARKING-LOT.md */
  {n:'c1',name:'Frame a Bet',slug:'frame-a-bet',glyph:'🎲',g:1,tier:'PM',division:'Product',function:'Strategy',prio:'parked',status:'slot',rulings:null,surface:'grounding only',
   d:'Problem → hypothesis → success metric. Step-0 grounded 2026-06-11. <b>Pulled from the golden path</b> (source-canon audit, 2026-06-12): hypothesis, one metric, and kill condition already live in rungs 2–3; the Calibration Ledger and roadmap-gating mandates were enterprise machinery — see PARKING-LOT.md.'},
  {n:'c2',name:'Prioritize the Backlog',slug:'prioritize-the-backlog',glyph:'🧮',g:1,tier:'PM',division:'Product',function:'Strategy',prio:'parked',status:'slot',rulings:null,surface:'grounding only',
   d:'Order the work from appetite and evidence. Step-0 grounded 2026-06-11. <b>Pulled from the golden path</b> (source-canon audit, 2026-06-12): a DSDM/SAFe-skeleton portfolio play; a startup running bets keeps no scored standing backlog. Revival would re-skeleton on Shape Up\'s betting table — see PARKING-LOT.md.'},
  {n:'c3',name:'Riskiest-Assumption Test',slug:'riskiest-assumption-test',glyph:'🧨',g:1,tier:'PM',division:'Product',function:'Strategy',prio:'parked',status:'slot',rulings:null,surface:'grounding only',
   d:'Test the assumption that kills the bet fastest. Step-0 grounded 2026-06-11. <b>Pulled from the golden path</b> (source-canon audit, 2026-06-12): the riskiest-assumption question is absorbed by rung 3\'s hypothesis gate and 2b; the GDS scoring workshop and ≥30-sample rule were the enterprise layer — see PARKING-LOT.md.'},
  /* reverse-derive PoC (2026-06-16) — Product / Library Operations, fronted
     by Raven. The Studio rendering is QA/provenance, not the filing key. */
  {n:'EL2',name:'Back-of-House Walk',slug:'back-of-house-walk',glyph:'BOH',g:0,doc:'back-of-house-walk/brief.md',tier:'senior',division:'Product',function:'Library Operations',prio:'core',status:'built',rulings:1,surface:'derived + banked + registered 2026-07-03 (make-a-play dogfood); graded run owed',
   d:'<b>Product / Library Operations.</b> Detached elicitation/product-walk play that reads an EL1 source manifest and an operator scope and emits a draft empty-library bundle (part-first bounded-context stub cards + an _index keystone story) plus workflows.json, threads.json, STAGE-2-BRIEF, HOT-SPOTS, and READ-COHERENCE. The middle link of the <b>Power Up Product Library</b> compound play (Basic Product Description → Back-of-House → Front-of-House). <b>Gate 1 approved 2026-06-24; derived 2026-07-03 by dogfooding make-a-play</b> (workflow.fabro + 7 prompts, banked to the plugin, registered for run); graded run owed. EL1 is not yet built, so the manifest is authored by director ruling as the documented interim input path. Built by PlaymakerStudio as provenance only.'},
  {n:'EL3',name:'Front-of-House Walk',slug:'front-of-house-walk',glyph:'FOH',g:0,doc:'front-of-house-walk/brief.md',tier:'senior',division:'Product',function:'Library Operations',prio:'core',status:'built',rulings:0,surface:'workflow package implemented; proof owed',
   d:'<b>Product / Library Operations.</b> Raven-fronted customer/product-facing elicitation walk that consumes the EL2 draft bundle, Stage-2 brief, and Hot Spots; banks director answers as Ledger events; applies only section/shape-level corrections to Small-floor stub cards; and writes RESIDUAL-GAPS.md for unresolved items. Built by PlaymakerStudio as provenance only; filing remains Product / Library Operations.'},
  {n:'EL4',name:'Empty Library Confirm',slug:'empty-library-confirm',glyph:'EL4',g:0,doc:'empty-library-confirm/brief.md',tier:'senior',division:'Product',function:'Library Operations',prio:'core',status:'built',rulings:0,surface:'confirm gate implemented; proof owed',
   d:'<b>Product / Library Operations.</b> Raven-fronted director gate that opens the post-EL3 empty-library bundle as a catalog, confirms the exact product/path/version with one user-authored <code>library.confirmed</code> Ledger event, or records a structure-only rejection edit list routed back to EL3. Built by PlaymakerStudio as provenance only; filing remains Product / Library Operations.'},
  {n:'EL5a',name:'Atomic Card Planning',slug:'atomic-card-planning',glyph:'EL5P',g:0,doc:'atomic-card-planning/brief.md',tier:'senior',division:'Product',function:'Library Operations',prio:'studio',status:'built',rulings:0,surface:'EL5 contract scaffold implemented',
   d:'<b>Product / Library Operations.</b> Raven-fronted EL5 planning play that consumes an EL4-confirmed empty-library bundle, the Vocabulary lexicon, and the EL1 source manifest; it emits <code>atomic-card-build-plan.v1</code> with write_new contracts only for confirmed stubs and gap_report entries for missing shelves or names. Built by PlaymakerStudio as provenance only; filing remains Product / Library Operations.'},
  {n:'EL5b',name:'Atomic Card Creation',slug:'atomic-card-creation',glyph:'EL5C',g:0,doc:'atomic-card-creation/brief.md',tier:'senior',division:'Product',function:'Library Operations',prio:'studio',status:'built',rulings:0,surface:'EL5 execution scaffold implemented',
   d:'<b>Product / Library Operations.</b> Raven-fronted EL5 creation play that validates a build plan, publishes prepared card bodies by appending to confirmed stubs, writes <code>atomic_card.created</code> Ledger events with an agent actor, and renders the coverage audit. Built by PlaymakerStudio as provenance only; filing remains Product / Library Operations.'},
  {n:'LO1',name:'Build Atomic Card (reverse-derived PoC)',slug:'build-atomic-card',glyph:'⚛️',g:0,doc:'build-atomic-card/brief.md',tier:'—',division:'Product',function:'Library Operations',prio:'core',status:'derived',rulings:0,surface:'reverse-derived from a shipped Fabro build',
   d:'<b>Product / Library Operations.</b> The shipped atomic-card workflow (<code>build-atomic-card/workflow.fabro</code>, parked on <code>restore-atomic-card-plays</code>, #228) is rendered here so the Library Operations play can be read, analyzed, and tested: a GPT-5.4 <b>draft → validate → grade (PUBLISH/REVISE/BAIL) → publish</b> loop that turns a card contract + a frozen source into one published atomic card. Its story + design were reverse-derived from the build for QA; the risk-map + the existing eval suite (conan/sam/bridget/solomon) are the testing phase.'},

  /* PlaymakerStudio catalog seeds — existing specs/design artifacts only. */
  {n:'PS1',name:'Make a Play',slug:'make-a-play',glyph:'✒️',g:0,doc:'make-a-play/brief.md',tier:'Coordinator',division:'PlaymakerStudio',function:'Production',prio:'studio',board:true,status:'built',rulings:1,surface:'self-hosting meta-play',
   d:'The PlaymakerStudio production loop as a self-hosting play: Design → Build → Prove. Gate 1 approved 2026-06-23; files under PlaymakerStudio / Production, fronted by William, and remains outside Product’s golden-path chain.'},
  {n:'PS2',name:'Review Levels',slug:'review-levels',glyph:'☷',g:0,href:'doc.html?repo=docs/alexandria/plans/studio-fixes/F7-review-levels.md',tier:'Coordinator',division:'PlaymakerStudio',function:'Proving',prio:'studio',status:'slot',rulings:null,surface:'specced design artifact',
   d:'The proving-cycle design for low, medium, and high review levels: compositions of play-writing step-plays with specific Director gates. This is William\'s Proving catalog seed and remains a design artifact until built.'},
  {n:'PS3',name:'Play Re-sync',slug:'play-re-sync',glyph:'↻',g:0,href:'doc.html?repo=docs/alexandria/plans/studio-fixes/play-re-sync.md',tier:'Coordinator',division:'PlaymakerStudio',function:'Operations',prio:'studio',status:'slot',rulings:null,surface:'specced design artifact',
   d:'The Studio operations play that computes which play artifacts went stale after an edit, re-derives the mechanical outputs, and flags the rest as work. This is William\'s Operations catalog seed and remains a design artifact until built.'},
  {n:'PS4',name:'Capture',slug:'capture',glyph:'CAP',g:0,doc:'capture/brief.md',tier:'Coordinator',division:'PlaymakerStudio',function:'Operations',prio:'studio',status:'registered',rulings:0,surface:'runtime/CLI operations play',
   d:'William-fronted Operations play that records a Studio rulebook learning with provenance. It appends a typed capture event, writes an autopsy projection, flags unsubstantiated learnings instead of inventing support, and changes no load-bearing rule.'},
  {n:'PS5',name:'Deprecate',slug:'deprecate',glyph:'DEP',g:0,doc:'deprecate/brief.md',tier:'Coordinator',division:'PlaymakerStudio',function:'Operations',prio:'studio',status:'registered',rulings:0,surface:'runtime/CLI operations play',
   d:'William-fronted Operations play that retires a verified stale Studio rule only after a Director gate. Approval appends a typed deprecate ruling, refreshes the disposition projection, and removes only the approved rule text; decline leaves the rulebook untouched.'},
  {n:'PS6',name:'Quarantine',slug:'quarantine',glyph:'QTN',g:0,doc:'quarantine/brief.md',tier:'Coordinator',division:'PlaymakerStudio',function:'Operations',prio:'studio',status:'registered',rulings:0,surface:'runtime/CLI operations play',
   d:'William-fronted Operations play that sequesters inherited material as untrusted data. It writes a quarantined copy with provenance, appends a typed quarantine event, and does not reference the copy from active rulebook docs.'},
];

function faceForDivision(division){
  return DIVISIONS[division] ? DIVISIONS[division].face : '';
}

function faceForPlay(play){
  return faceForDivision(play.division);
}

function catalogPath(play){
  return `${play.division} / ${play.function} / ${faceForPlay(play)}`;
}

function playHref(play){
  if(play.href) return play.href;
  if(play.ws) return `${play.slug}/`;
  if(play.doc) return `doc.html?f=${play.doc}`;
  return `doc.html?f=${play.slug}/research/research-brief.md`;
}

function playHrefFromRoot(play){
  const href=playHref(play);
  if(href.startsWith('/')||href.startsWith('#')||/^[a-z][a-z0-9+.-]*:/i.test(href)) return href;
  return `plays/${href}`;
}

function groupCatalogByDivision(records=RUNGS,divisions=DIVISIONS){
  const grouped={};
  Object.entries(divisions).forEach(([name,division])=>{
    grouped[name]={
      name,
      face:division.face,
      functions:division.functions.map(functionName=>({name:functionName,plays:[]})),
    };
  });
  records.forEach(play=>{
    const division=grouped[play.division];
    if(!division) return;
    const bucket=division.functions.find(fn=>fn.name===play.function);
    if(bucket) bucket.plays.push(play);
  });
  return grouped;
}

function appearsOnBoard(play){
  return play.board===true || !BOARD_EXCLUDED_PRIOS.includes(play.prio);
}

function validateCatalog(records=RUNGS,divisions=DIVISIONS){
  const errors=[];
  const seenSlugs=new Set();

  Object.entries(divisions).forEach(([divisionName,division])=>{
    if(!division.face){
      errors.push({code:'missing-face',division:divisionName,message:`${divisionName} is missing a face agent`});
    }
    if(!Array.isArray(division.functions)||!division.functions.length){
      errors.push({code:'missing-functions',division:divisionName,message:`${divisionName} has no functions`});
      return;
    }
    UNIVERSAL_FUNCTIONS.forEach(functionName=>{
      if(!division.functions.includes(functionName)){
        errors.push({code:'missing-universal-function',division:divisionName,function:functionName,message:`${divisionName} is missing ${functionName}`});
      }
    });
  });

  records.forEach((play,index)=>{
    const ref=play.slug||play.name||`record ${index+1}`;
    if(!play.slug){
      errors.push({code:'missing-slug',slug:ref,message:`${ref} is missing slug`});
    }else if(seenSlugs.has(play.slug)){
      errors.push({code:'duplicate-slug',slug:play.slug,message:`Duplicate slug ${play.slug}`});
    }else{
      seenSlugs.add(play.slug);
    }

    RETIRED_PLAY_FIELDS.forEach(field=>{
      if(Object.prototype.hasOwnProperty.call(play,field)){
        errors.push({code:'retired-field',slug:ref,field,message:`${ref} declares retired field ${field}`});
      }
    });

    if(!play.division){
      errors.push({code:'missing-division',slug:ref,message:`${ref} is missing division`});
      return;
    }
    const division=divisions[play.division];
    if(!division){
      errors.push({code:'unknown-division',slug:ref,division:play.division,message:`${ref} declares unknown division ${play.division}`});
      return;
    }
    if(!play.function){
      errors.push({code:'missing-function',slug:ref,message:`${ref} is missing function`});
      return;
    }
    if(!division.functions.includes(play.function)){
      errors.push({
        code:'invalid-function',
        slug:ref,
        division:play.division,
        function:play.function,
        message:`${ref} declares ${play.division} / ${play.function}, but ${play.function} is not in ${play.division}'s function set`,
      });
    }
  });

  return errors;
}

const StudioCatalog={
  COMPANY,
  DIVISIONS,
  UNIVERSAL_FUNCTIONS,
  RETIRED_PLAY_FIELDS,
  BOARD_EXCLUDED_PRIOS,
  RUNGS,
  faceForDivision,
  faceForPlay,
  catalogPath,
  playHref,
  playHrefFromRoot,
  groupCatalogByDivision,
  appearsOnBoard,
  validateCatalog,
};

if(typeof globalThis!=='undefined'){
  globalThis.StudioCatalog=StudioCatalog;
}
