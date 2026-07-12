import type { LibraryCatalog, LibraryCatalogThread } from "./types";

type ThreadInput = Omit<
  LibraryCatalogThread,
  "confidence" | "concerns" | "family" | "severity" | "sourceEvidence"
> &
  Partial<
    Pick<LibraryCatalogThread, "confidence" | "concerns" | "family" | "severity" | "sourceEvidence">
  >;

function fixtureThread(input: ThreadInput): LibraryCatalogThread {
  return {
    confidence: input.confidence ?? "high",
    concerns: input.concerns ?? [{ cardId: "Surface - Library Notepad", type: "card" }],
    family: input.family ?? "hot_spot",
    severity: input.severity ?? "medium",
    sourceEvidence: input.sourceEvidence ?? ["docs/alexandria/sweeps/fixture/source.md:1"],
    ...input,
  };
}

const notepadThreads: LibraryCatalogThread[] = [
  fixtureThread({
    emittingMove: "pass1_events",
    id: "thread:notepad:director-owner",
    kind: "runtime_vs_design",
    question: "Should the Director own Notepad rulings?",
    reason: "The scan found unclear ownership between the Director and the runtime.",
    resolution: {
      answerText: "The Director owns rulings that change the library frame.",
      patches: [{ eventId: "event:patch:director-owner", patchId: "patch-director-owner" }],
      resolvingEventId: "event:director-owner-ruled",
      state: "director-ruled",
    },
    resolvingEventId: "event:director-owner-ruled",
    source: "authored",
    sourceEvidence: ["docs/alexandria/sweeps/fixture/director.md:12"],
    status: "answered",
  }),
  fixtureThread({
    emittingMove: "pass1_events",
    id: "thread:notepad:cascade-settlement",
    kind: "docs_disagree",
    question: "Does the frame ruling settle the stage vocabulary clash?",
    reason: "Stage and status were both used as production vocabulary.",
    resolution: {
      reason: "settled by frame ruling stage remains production position",
      resolvingEventId: "event:cascade-stage-vocabulary",
      state: "settled-by-cascade",
    },
    resolvingEventId: "event:cascade-stage-vocabulary",
    source: "authored",
    sourceEvidence: ["docs/alexandria/sweeps/fixture/stage.md:4"],
    status: "answered",
  }),
  fixtureThread({
    emittingMove: "pass2_carve",
    id: "thread:notepad:triage-settlement",
    kind: "judgment_punt",
    question: "Can triage settle the duplicate glossary concern?",
    reason: "The duplicate glossary concern repeats a settled frame decision.",
    resolution: {
      reason: "settled by triage: duplicate of the frame guidance",
      resolvingEventId: "event:triage-glossary",
      state: "settled-by-triage",
    },
    resolvingEventId: "event:triage-glossary",
    source: "authored",
    sourceEvidence: ["docs/alexandria/sweeps/fixture/glossary.md:8"],
    status: "answered",
  }),
  fixtureThread({
    emittingMove: "pass2_carve",
    family: "gap",
    id: "thread:notepad:deferred-residual",
    kind: "missing_material",
    question: "What residual evidence should the confirm gate carry?",
    reason: "The scan found evidence that belongs in EL5 after confirmation.",
    resolution: {
      reason: "Carry the evidence question as a residual for EL5.",
      resolvingEventId: "event:deferred-residual-evidence",
      state: "deferred-residual",
    },
    resolvingEventId: "event:deferred-residual-evidence",
    source: "authored",
    sourceEvidence: ["docs/alexandria/sweeps/fixture/residual.md:18"],
    status: "residual",
  }),
  fixtureThread({
    emittingMove: "check_bundle",
    family: "gap",
    id: "thread:notepad:invalidated-miss",
    kind: "missing_context",
    question: "Was the old agenda reset path still active?",
    reason: "The scan treated retired agenda reset code as load-bearing.",
    resolution: {
      reason: "invalidated by ruling the reset path is retired.",
      resolvingEventId: "event:invalidated-reset-path",
      state: "invalidated",
    },
    resolvingEventId: "event:invalidated-reset-path",
    source: "authored",
    sourceEvidence: ["docs/alexandria/sweeps/fixture/retired.md:22"],
    status: "answered",
  }),
  fixtureThread({
    emittingMove: "pass1_events",
    id: "thread:notepad:open-live-update",
    kind: "docs_disagree",
    question: "Should living updates regrow this Notepad thread?",
    reason: "The future living-update path is not settled in the bundle.",
    source: "authored",
    sourceEvidence: ["docs/alexandria/sweeps/fixture/living-updates.md:6"],
    status: "open",
  }),
  fixtureThread({
    emittingMove: "survey",
    id: "thread:notepad:open-bundle-root",
    kind: "split",
    question: "Should the Notepad root split by product bundle?",
    reason: "The surface renders one bundle at a time and should not merge roots.",
    source: "authored",
    sourceEvidence: ["docs/alexandria/sweeps/fixture/root.md:3"],
    status: "open",
  }),
  fixtureThread({
    emittingMove: "check_bundle",
    family: "gap",
    id: "thread:notepad:derived-excluded",
    kind: "missing_material",
    question: "Derived fill-readiness question should stay out of the Notepad baseline.",
    reason: "Derived readiness rows are not authored thread-events records.",
    resolution: {
      answerText: "Derived rows are excluded.",
      resolvingEventId: "event:derived-excluded",
      state: "director-ruled",
    },
    resolvingEventId: "event:derived-excluded",
    source: "derived",
    sourceEvidence: ["docs/alexandria/sweeps/fixture/derived.md:1"],
    status: "answered",
  }),
];

function stripResolution(thread: LibraryCatalogThread): LibraryCatalogThread {
  const { resolution: _resolution, resolvingEventId: _resolvingEventId, ...openThread } = thread;
  return {
    ...openThread,
    status: "open",
  };
}

export const sampleDurableNotepadCatalog: LibraryCatalog = {
  areas: [],
  cards: [],
  edges: [],
  gaps: [],
  meta: {
    areaCount: 0,
    cardCount: 0,
    edgeCount: 0,
    gapCount: 0,
    metadataIssues: [],
    planes: [],
  },
  threads: notepadThreads,
};

export const sampleEmptyLedgerNotepadCatalog: LibraryCatalog = {
  ...sampleDurableNotepadCatalog,
  threads: notepadThreads.map(stripResolution),
};
