import { describe, expect, test } from "bun:test";
import {
  RAVEN_LEGACY_VISION_SLOT_IDS,
  RAVEN_VISION_SLOT_MANIFEST,
  RAVEN_VISION_SLOT_IDS,
  buildRavenSourceOfTruthMarkdown,
  createInitialRavenVisionState,
  isRavenVisionSlotId,
  projectRavenVision,
  projectRavenKnowledgeBank,
  reduceRavenKnowledgeBankState,
  reduceRavenSourceOfTruthState,
  reduceRavenVisionEvents,
  reduceRavenVisionState,
  type RavenVisionEventType,
  type RavenVisionReducerEvent,
  type RavenVisionSlotId,
} from "../src/domain/raven-vision.js";
import type { AlexandriaActor, AlexandriaStateEvent } from "../src/domain/state-events.js";

const VIEWER_ACTOR = { kind: "user", host: "viewer" } as const;
const RAVEN_ACTOR = {
  kind: "agent",
  host: "claude-code",
  name: "Raven",
} as const;

const EXPECTED_VISION_SLOT_MANIFEST = [
  {
    id: "person",
    label: "The Person",
    order: 1,
    purpose: "The person the product is built for",
  },
  {
    id: "mechanism",
    label: "The Mechanism",
    order: 2,
    purpose: "What the product does",
  },
  {
    id: "the-work",
    label: "The Work",
    order: 3,
    purpose: "How the product works, from beginning to end",
  },
  {
    id: "refusal",
    label: "What It's Not",
    order: 4,
    purpose: "What the product is not, and who it does not serve",
  },
] as const;

function visionEvent(
  type: RavenVisionEventType,
  payload: Record<string, unknown> = {},
  at = "2026-05-30T00:00:00.000Z",
  actor: AlexandriaActor = VIEWER_ACTOR,
): RavenVisionReducerEvent {
  return {
    actor,
    at,
    payload,
    type,
  };
}

function stateEvent(
  index: number,
  type: RavenVisionEventType,
  payload: Record<string, unknown> = {},
  at = `2026-05-30T00:00:${String(index).padStart(2, "0")}.000Z`,
  actor: AlexandriaActor = VIEWER_ACTOR,
): AlexandriaStateEvent {
  return {
    schemaVersion: 1,
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    actor,
    at,
    payload,
    type,
  };
}

function approvedReadyState() {
  let state = createInitialRavenVisionState("2026-05-30T00:00:00.000Z");
  const update = reduceRavenVisionState(
    state,
    visionEvent(
      "raven.vision.slot.updated",
      { slotId: "person", text: "A clear product vision." },
      "2026-05-30T00:00:01.000Z",
    ),
  );
  expect(update).not.toBeInstanceOf(Error);
  state = update as typeof state;

  const approved = reduceRavenVisionState(
    state,
    visionEvent("raven.vision.slot.approved", { slotId: "person" }, "2026-05-30T00:00:02.000Z"),
  );
  expect(approved).not.toBeInstanceOf(Error);
  state = approved as typeof state;

  for (const slotId of RAVEN_VISION_SLOT_IDS.filter((id) => id !== "person")) {
    const skipped = reduceRavenVisionState(
      state,
      visionEvent(
        "raven.vision.slot.skipped",
        { slotId },
        `2026-05-30T00:00:${String(RAVEN_VISION_SLOT_IDS.indexOf(slotId) + 3).padStart(2, "0")}.000Z`,
      ),
    );
    expect(skipped).not.toBeInstanceOf(Error);
    state = skipped as typeof state;
  }

  return state;
}

function mixedReviewState() {
  let state = createInitialRavenVisionState("2026-05-30T00:00:00.000Z");

  function apply(event: RavenVisionReducerEvent): void {
    const next = reduceRavenVisionState(state, event);
    expect(next).not.toBeInstanceOf(Error);
    state = next as typeof state;
  }

  for (const event of [
    visionEvent(
      "raven.vision.slot.updated",
      { slotId: "mechanism", text: "Approved mechanism." },
      "2026-05-30T00:00:01.000Z",
    ),
    visionEvent("raven.vision.slot.approved", { slotId: "mechanism" }, "2026-05-30T00:00:02.000Z"),
    visionEvent(
      "raven.vision.slot.updated",
      { slotId: "the-work", text: "Work context to skip." },
      "2026-05-30T00:00:03.000Z",
    ),
    visionEvent("raven.vision.slot.skipped", { slotId: "the-work" }, "2026-05-30T00:00:04.000Z"),
    visionEvent(
      "raven.vision.slot.updated",
      { slotId: "refusal", text: "Still waiting for review." },
      "2026-05-30T00:00:05.000Z",
    ),
  ] as const) {
    apply(event);
  }

  return state;
}

function legacyOldReadyEvents(): AlexandriaStateEvent[] {
  return [
    stateEvent(1, "raven.vision.started", {}),
    stateEvent(2, "raven.vision.slot.skipped", { slotId: "person" }),
    stateEvent(3, "raven.vision.slot.skipped", { slotId: "mechanism" }),
    stateEvent(4, "raven.vision.slot.skipped", { slotId: "the-work" }),
    stateEvent(5, "raven.vision.slot.skipped", { slotId: "refusal" }),
    stateEvent(6, "raven.vision.slot.skipped", { slotId: "named-pain" }),
    stateEvent(7, "raven.vision.slot.skipped", { slotId: "discovered-pain" }),
    stateEvent(8, "raven.vision.slot.updated", {
      slotId: "shift",
      text: "Legacy shift carried the approved product description.",
    }),
    stateEvent(9, "raven.vision.slot.approved", { slotId: "shift" }),
    stateEvent(10, "raven.vision.slot.skipped", { slotId: "inadequacy" }),
    stateEvent(11, "raven.vision.slot.skipped", { slotId: "shape" }),
    stateEvent(12, "raven.vision.slot.skipped", { slotId: "felt-experience" }),
    stateEvent(13, "raven.vision.slot.skipped", { slotId: "proof" }),
  ];
}

describe("Raven Vision reducer", () => {
  test("defines the frozen four-slot manifest contract", () => {
    expect(RAVEN_VISION_SLOT_IDS).toEqual(["person", "mechanism", "the-work", "refusal"]);
    expect(RAVEN_VISION_SLOT_MANIFEST).toEqual(EXPECTED_VISION_SLOT_MANIFEST);
    expect(RAVEN_VISION_SLOT_MANIFEST.map((slot) => slot.id)).toEqual([...RAVEN_VISION_SLOT_IDS]);
    expect(isRavenVisionSlotId("the-work")).toBeTrue();
    expect(isRavenVisionSlotId("refusal")).toBeTrue();
    expect(isRavenVisionSlotId("shape")).toBeFalse();
    expect(RAVEN_LEGACY_VISION_SLOT_IDS).toEqual([
      "named-pain",
      "discovered-pain",
      "shift",
      "inadequacy",
      "shape",
      "felt-experience",
      "proof",
    ]);
  });

  test("starts with all four manifest slots empty", () => {
    const state = reduceRavenVisionState(undefined, visionEvent("raven.vision.started"));

    expect(state).not.toBeInstanceOf(Error);
    const projection = projectRavenVision(state as never);
    expect(projection.status).toBe("in_progress");
    expect(projection.readyToBank).toBeFalse();
    expect(projection.sourceItemIds).toEqual([]);
    expect(projection.sourceItems).toEqual([]);
    expect(projection.manifest.map((slot) => slot.id)).toEqual([...RAVEN_VISION_SLOT_IDS]);
    expect(projection.slots).toHaveLength(4);
    expect(
      projection.slots.every((slot) => slot.status === "empty" && slot.text === ""),
    ).toBeTrue();
    expect(projection.legacy).toBeUndefined();
  });

  test("records retired legacy slot events without mutating current slots", () => {
    let state = createInitialRavenVisionState("2026-05-30T00:00:00.000Z");

    const updated = reduceRavenVisionState(
      state,
      visionEvent(
        "raven.vision.slot.updated",
        {
          slotId: "shift",
          text: "Legacy shift text.",
        },
        "2026-05-30T00:00:01.000Z",
      ),
    );
    expect(updated).not.toBeInstanceOf(Error);
    state = updated as typeof state;

    const approved = reduceRavenVisionState(
      state,
      visionEvent("raven.vision.slot.approved", { slotId: "shift" }, "2026-05-30T00:00:02.000Z"),
    );
    expect(approved).not.toBeInstanceOf(Error);
    state = approved as typeof state;

    expect(state.slots.person.status).toBe("empty");
    expect(state.slots.mechanism.status).toBe("empty");
    expect(state.slots["the-work"].status).toBe("empty");
    expect(state.slots.refusal.status).toBe("empty");
    expect(state.legacy?.slots.shift).toMatchObject({
      disposition: "retired",
      id: "shift",
      status: "approved",
      text: "Legacy shift text.",
    });

    const projection = projectRavenVision(state);
    expect(projection.status).toBe("in_progress");
    expect(projection.readyToBank).toBeFalse();
    expect(projection.legacy).toMatchObject({
      schemaVersion: 1,
      status: "legacy_present",
      wasReadyToBank: false,
      needsReconfirmation: false,
      retiredSlotIds: ["shift"],
    });
  });

  test("folds legacy shape approval into the-work as a backfill", () => {
    let state = createInitialRavenVisionState("2026-05-30T00:00:00.000Z");

    for (const event of [
      visionEvent(
        "raven.vision.slot.updated",
        {
          slotId: "shape",
          text: "The work is a review loop that turns source notes into banked context.",
        },
        "2026-05-30T00:00:01.000Z",
      ),
      visionEvent("raven.vision.slot.approved", { slotId: "shape" }, "2026-05-30T00:00:02.000Z"),
    ] as const) {
      const next = reduceRavenVisionState(state, event);
      expect(next).not.toBeInstanceOf(Error);
      state = next as typeof state;
    }

    expect(state.slots["the-work"]).toMatchObject({
      status: "approved",
      text: "The work is a review loop that turns source notes into banked context.",
      reviewedAt: "2026-05-30T00:00:02.000Z",
    });
    expect(state.legacy?.slots.shape).toMatchObject({
      disposition: "folded",
      foldedInto: "the-work",
      status: "approved",
      text: "The work is a review loop that turns source notes into banked context.",
    });

    const projection = projectRavenVision(state);
    expect(projection.legacy?.foldedSlotIds).toEqual(["shape"]);
    expect(projection.legacy?.slots.find((slot) => slot.id === "shape")).toMatchObject({
      foldedInto: "the-work",
      status: "approved",
    });
  });

  test("current the-work authorship wins over later legacy shape events", () => {
    const state = reduceRavenVisionEvents([
      stateEvent(1, "raven.vision.started", {}),
      stateEvent(2, "raven.vision.slot.updated", {
        slotId: "shape",
        text: "Legacy shape first.",
      }),
      stateEvent(3, "raven.vision.slot.approved", { slotId: "shape" }),
      stateEvent(4, "raven.vision.slot.updated", {
        slotId: "the-work",
        text: "Current the-work description.",
      }),
      stateEvent(5, "raven.vision.slot.approved", { slotId: "the-work" }),
      stateEvent(6, "raven.vision.slot.updated", {
        slotId: "shape",
        text: "Later legacy shape must not overwrite current text.",
      }),
      stateEvent(7, "raven.vision.slot.approved", { slotId: "shape" }),
    ]);

    expect(state).toBeDefined();
    expect(state?.slots["the-work"]).toMatchObject({
      status: "approved",
      text: "Current the-work description.",
      reviewedAt: "2026-05-30T00:00:05.000Z",
      updatedAt: "2026-05-30T00:00:05.000Z",
    });
    expect(state?.legacy?.slots.shape).toMatchObject({
      status: "approved",
      text: "Later legacy shape must not overwrite current text.",
      updatedAt: "2026-05-30T00:00:07.000Z",
    });
  });

  test("typing into empty, approved, or skipped slots sets needs_review", () => {
    let state = createInitialRavenVisionState("2026-05-30T00:00:00.000Z");

    const typed = reduceRavenVisionState(
      state,
      visionEvent("raven.vision.slot.updated", {
        slotId: "person",
        text: "The market changed.",
      }),
    );
    expect(typed).not.toBeInstanceOf(Error);
    state = typed as typeof state;
    expect(state.slots.person.status).toBe("needs_review");

    const approved = reduceRavenVisionState(
      state,
      visionEvent("raven.vision.slot.approved", { slotId: "person" }),
    );
    expect(approved).not.toBeInstanceOf(Error);
    state = approved as typeof state;
    expect(state.slots.person.status).toBe("approved");

    const editedApproved = reduceRavenVisionState(
      state,
      visionEvent("raven.vision.slot.updated", {
        slotId: "person",
        text: "The market changed again.",
      }),
    );
    expect(editedApproved).not.toBeInstanceOf(Error);
    state = editedApproved as typeof state;
    expect(state.slots.person.status).toBe("needs_review");
    expect(state.slots.person.reviewedAt).toBeUndefined();

    const skipped = reduceRavenVisionState(
      state,
      visionEvent("raven.vision.slot.skipped", { slotId: "person" }),
    );
    expect(skipped).not.toBeInstanceOf(Error);
    state = skipped as typeof state;
    expect(state.slots.person.status).toBe("skipped");
    expect(state.slots.person.text).toBe("");

    const reopened = reduceRavenVisionState(
      state,
      visionEvent("raven.vision.slot.updated", {
        slotId: "person",
        text: "Reopened after skip.",
      }),
    );
    expect(reopened).not.toBeInstanceOf(Error);
    state = reopened as typeof state;
    expect(state.slots.person.status).toBe("needs_review");
    expect(state.slots.person.text).toBe("Reopened after skip.");
    expect(state.slots.person.reviewedAt).toBeUndefined();
  });

  test("stores Raven notes on agent drafts and preserves them through user edits", () => {
    let state = createInitialRavenVisionState("2026-05-30T00:00:00.000Z");

    const drafted = reduceRavenVisionState(
      state,
      visionEvent(
        "raven.vision.slot.updated",
        {
          slotId: "mechanism",
          text: "Raven's first draft.",
          ravenNotes: "Drawn from founder notes; the mechanism is inferred.",
        },
        "2026-05-30T00:00:01.000Z",
        RAVEN_ACTOR,
      ),
    );
    expect(drafted).not.toBeInstanceOf(Error);
    state = drafted as typeof state;
    expect(state.slots.mechanism).toMatchObject({
      ravenDraftedAt: "2026-05-30T00:00:01.000Z",
      ravenNotes: "Drawn from founder notes; the mechanism is inferred.",
      ravenNotesUpdatedAt: "2026-05-30T00:00:01.000Z",
      status: "needs_review",
      text: "Raven's first draft.",
    });

    const edited = reduceRavenVisionState(
      state,
      visionEvent(
        "raven.vision.slot.updated",
        {
          slotId: "mechanism",
          text: "User edits Raven's draft.",
        },
        "2026-05-30T00:00:02.000Z",
        VIEWER_ACTOR,
      ),
    );
    expect(edited).not.toBeInstanceOf(Error);
    state = edited as typeof state;
    expect(state.slots.mechanism).toMatchObject({
      ravenDraftedAt: "2026-05-30T00:00:01.000Z",
      ravenNotes: "Drawn from founder notes; the mechanism is inferred.",
      ravenNotesUpdatedAt: "2026-05-30T00:00:01.000Z",
      status: "needs_review",
      text: "User edits Raven's draft.",
    });

    const skipped = reduceRavenVisionState(
      state,
      visionEvent(
        "raven.vision.slot.skipped",
        {
          slotId: "mechanism",
        },
        "2026-05-30T00:00:03.000Z",
        VIEWER_ACTOR,
      ),
    );
    expect(skipped).not.toBeInstanceOf(Error);
    state = skipped as typeof state;
    expect(state.slots.mechanism).toMatchObject({
      reviewedAt: "2026-05-30T00:00:03.000Z",
      status: "skipped",
      text: "",
    });
    expect(state.slots.mechanism.ravenDraftedAt).toBeUndefined();
    expect(state.slots.mechanism.ravenNotes).toBeUndefined();
    expect(state.slots.mechanism.ravenNotesUpdatedAt).toBeUndefined();
  });

  test("computes ready_to_bank from reviewed slots and approved text", () => {
    const state = approvedReadyState();

    expect(state.status).toBe("ready_to_bank");
    expect(projectRavenVision(state).readyToBank).toBeTrue();
    expect(projectRavenVision(state).legacy).toBeUndefined();
    expect(state.slots.mechanism.status).toBe("skipped");
    expect(state.slots["the-work"].status).toBe("skipped");
    const markdown = buildRavenSourceOfTruthMarkdown(state);
    expect(markdown.split("\n")).not.toContain("### The Mechanism");
    expect(markdown.split("\n")).not.toContain("### The Work");
  });

  test("reports old-ready legacy Vision as needs_reconfirmation instead of plain in_progress", () => {
    const state = reduceRavenVisionEvents(legacyOldReadyEvents());

    expect(state).toBeDefined();
    expect(state?.status).toBe("needs_reconfirmation");
    const projection = projectRavenVision(state);
    expect(projection.status).toBe("needs_reconfirmation");
    expect(projection.readyToBank).toBeFalse();
    expect(projection.slots.every((slot) => slot.status === "skipped")).toBeTrue();
    expect(projection.legacy).toMatchObject({
      status: "needs_reconfirmation",
      wasReadyToBank: true,
      needsReconfirmation: true,
      retiredSlotIds: [
        "named-pain",
        "discovered-pain",
        "shift",
        "inadequacy",
        "felt-experience",
        "proof",
      ],
    });
    expect(projection.legacy?.slots.find((slot) => slot.id === "shift")).toMatchObject({
      disposition: "retired",
      status: "approved",
      text: "Legacy shift carried the approved product description.",
    });
  });

  test("replaying the same legacy ledger twice is idempotent", () => {
    const once = reduceRavenVisionEvents(legacyOldReadyEvents());
    const twice = reduceRavenVisionEvents([...legacyOldReadyEvents(), ...legacyOldReadyEvents()]);

    expect(once).toBeDefined();
    expect(twice).toBeDefined();
    expect(projectRavenVision(twice)).toEqual(projectRavenVision(once));
  });

  test("builds deterministic Source of Truth Markdown from approved slot text", () => {
    let state = approvedReadyState();
    const updated = reduceRavenVisionState(
      state,
      visionEvent(
        "raven.vision.slot.updated",
        {
          slotId: "mechanism",
          text: "\r\n  Mechanism line one.\r\n\r\nLine two.\r\n",
        },
        "2026-05-30T00:00:20.000Z",
      ),
    );
    expect(updated).not.toBeInstanceOf(Error);
    state = updated as typeof state;
    const approved = reduceRavenVisionState(
      state,
      visionEvent(
        "raven.vision.slot.approved",
        { slotId: "mechanism" },
        "2026-05-30T00:00:21.000Z",
      ),
    );
    expect(approved).not.toBeInstanceOf(Error);
    state = approved as typeof state;

    expect(buildRavenSourceOfTruthMarkdown(state)).toBe(
      [
        "# Raven Product Context",
        "",
        "Generated from approved Raven Vision slots.",
        "",
        "## Vision",
        "",
        "### The Person",
        "",
        "A clear product vision.",
        "",
        "### The Mechanism",
        "",
        "  Mechanism line one.",
        "",
        "Line two.",
        "",
      ].join("\n"),
    );
  });

  test("banks the-work and reshaped refusal sections in manifest order", () => {
    let state = approvedReadyState();

    for (const [slotId, text] of [
      [
        "the-work",
        "Unit: play. Path: intake -> staged -> produced -> shipped. Status: board status. Places: Studio board and play folder. Advances: Director gates.",
      ],
      ["refusal", "Do not chase the atomizer, external chat hosts, or a CRUD admin-console shape."],
    ] as const) {
      const updated = reduceRavenVisionState(
        state,
        visionEvent(
          "raven.vision.slot.updated",
          {
            slotId,
            text,
          },
          `2026-05-30T00:01:${String(RAVEN_VISION_SLOT_IDS.indexOf(slotId) + 1).padStart(2, "0")}.000Z`,
        ),
      );
      expect(updated).not.toBeInstanceOf(Error);
      state = updated as typeof state;

      const approved = reduceRavenVisionState(
        state,
        visionEvent(
          "raven.vision.slot.approved",
          { slotId },
          `2026-05-30T00:02:${String(RAVEN_VISION_SLOT_IDS.indexOf(slotId) + 1).padStart(2, "0")}.000Z`,
        ),
      );
      expect(approved).not.toBeInstanceOf(Error);
      state = approved as typeof state;
    }

    const markdown = buildRavenSourceOfTruthMarkdown(state);
    expect(markdown).toBe(
      [
        "# Raven Product Context",
        "",
        "Generated from approved Raven Vision slots.",
        "",
        "## Vision",
        "",
        "### The Person",
        "",
        "A clear product vision.",
        "",
        "### The Work",
        "",
        "Unit: play. Path: intake -> staged -> produced -> shipped. Status: board status. Places: Studio board and play folder. Advances: Director gates.",
        "",
        "### What It's Not",
        "",
        "Do not chase the atomizer, external chat hosts, or a CRUD admin-console shape.",
        "",
      ].join("\n"),
    );
    expect(markdown.split("\n")).not.toContain("### The Shape");
  });

  test("banks ready Vision and projects Knowledge Bank Vision as ready for atomization", () => {
    const ready = approvedReadyState();
    const sourceEvent = {
      at: "2026-05-30T00:00:20.000Z",
      payload: {
        path: "docs/alexandria/source-of-truth/raven-product-context.md",
        contentHash: "sha256:source",
      },
      type: "raven.source_of_truth.updated" as const,
    };
    const sourceOfTruth = reduceRavenSourceOfTruthState(undefined, sourceEvent);
    expect(sourceOfTruth).not.toBeInstanceOf(Error);

    const bankEvent = visionEvent(
      "raven.vision.banked",
      {
        sourceOfTruthPath: "docs/alexandria/source-of-truth/raven-product-context.md",
        contentHash: "sha256:source",
      },
      "2026-05-30T00:00:21.000Z",
    );
    const banked = reduceRavenVisionState(ready, bankEvent);
    expect(banked).not.toBeInstanceOf(Error);
    expect((banked as typeof ready).status).toBe("banked");
    expect((banked as typeof ready).bankedAt).toBe("2026-05-30T00:00:21.000Z");
    expect(projectRavenVision(banked as typeof ready).readyToBank).toBeFalse();

    const knowledgeBank = reduceRavenKnowledgeBankState(undefined, {
      at: bankEvent.at,
      payload: bankEvent.payload,
      type: "raven.vision.banked",
    });
    expect(knowledgeBank).not.toBeInstanceOf(Error);
    expect(projectRavenKnowledgeBank(knowledgeBank as never).subjects.vision).toMatchObject({
      id: "vision",
      label: "Vision",
      status: "ready_for_atomization",
      persistedStatus: "ready_for_atomization",
      readyForAtomizationAt: "2026-05-30T00:00:21.000Z",
    });
  });

  test("preserves historical bank events that were valid under legacy readiness", () => {
    const state = reduceRavenVisionEvents([
      ...legacyOldReadyEvents(),
      stateEvent(
        14,
        "raven.vision.banked",
        {
          sourceOfTruthPath: "docs/alexandria/source-of-truth/raven-product-context.md",
          contentHash: "sha256:legacy-source",
        },
        "2026-05-30T00:00:14.000Z",
      ),
    ]);

    expect(state).toBeDefined();
    expect(state?.status).toBe("banked");
    expect(state?.bankedAt).toBe("2026-05-30T00:00:14.000Z");
    const projection = projectRavenVision(state);
    expect(projection.status).toBe("banked");
    expect(projection.readyToBank).toBeFalse();
    expect(projection.legacy).toMatchObject({
      status: "legacy_present",
      wasReadyToBank: true,
      needsReconfirmation: false,
    });
  });

  test("attaches source IDs without changing slot text or status", () => {
    const ready = approvedReadyState();
    const beforeSlots = structuredClone(ready.slots);

    const attached = reduceRavenVisionState(
      ready,
      visionEvent(
        "raven.vision.source_attached",
        { sourceId: "src_product_notes" },
        "2026-05-30T00:00:20.000Z",
      ),
    );
    expect(attached).not.toBeInstanceOf(Error);
    const state = attached as typeof ready;

    expect(state.sourceItemIds).toEqual(["src_product_notes"]);
    expect(state.slots).toEqual(beforeSlots);
    expect(state.status).toBe("ready_to_bank");
    expect(state.updatedAt).toBe("2026-05-30T00:00:20.000Z");

    const duplicate = reduceRavenVisionState(
      state,
      visionEvent(
        "raven.vision.source_attached",
        { sourceId: "src_product_notes" },
        "2026-05-30T00:00:21.000Z",
      ),
    );
    expect(duplicate).not.toBeInstanceOf(Error);
    expect((duplicate as typeof ready).sourceItemIds).toEqual(["src_product_notes"]);
  });

  test("source attachment preserves a mixed review slot snapshot", () => {
    const mixed = mixedReviewState();
    const beforeSlots = structuredClone(mixed.slots);

    expect(mixed.status).toBe("in_progress");
    expect(beforeSlots.mechanism).toMatchObject({
      status: "approved",
      text: "Approved mechanism.",
      reviewedAt: "2026-05-30T00:00:02.000Z",
      updatedAt: "2026-05-30T00:00:02.000Z",
    });
    expect(beforeSlots["the-work"]).toMatchObject({
      status: "skipped",
      text: "",
      reviewedAt: "2026-05-30T00:00:04.000Z",
      updatedAt: "2026-05-30T00:00:04.000Z",
    });
    expect(beforeSlots.refusal).toMatchObject({
      status: "needs_review",
      text: "Still waiting for review.",
      updatedAt: "2026-05-30T00:00:05.000Z",
    });

    const attached = reduceRavenVisionState(
      mixed,
      visionEvent(
        "raven.vision.source_attached",
        { sourceId: "src_late_review" },
        "2026-05-30T00:00:10.000Z",
      ),
    );
    expect(attached).not.toBeInstanceOf(Error);
    const next = attached as typeof mixed;

    expect(next.sourceItemIds).toEqual(["src_late_review"]);
    expect(next.slots).toEqual(beforeSlots);
    expect(next.status).toBe("in_progress");
    expect(next.updatedAt).toBe("2026-05-30T00:00:10.000Z");

    const duplicate = reduceRavenVisionState(
      next,
      visionEvent(
        "raven.vision.source_attached",
        { sourceId: "src_late_review" },
        "2026-05-30T00:00:11.000Z",
      ),
    );
    expect(duplicate).not.toBeInstanceOf(Error);
    expect((duplicate as typeof mixed).sourceItemIds).toEqual(["src_late_review"]);
    expect((duplicate as typeof mixed).slots).toEqual(beforeSlots);
  });

  test("approving only empty text does not become ready_to_bank", () => {
    let state = createInitialRavenVisionState("2026-05-30T00:00:00.000Z");

    for (const slotId of RAVEN_VISION_SLOT_IDS) {
      const reviewed = reduceRavenVisionState(
        state,
        visionEvent("raven.vision.slot.approved", { slotId }),
      );
      expect(reviewed).not.toBeInstanceOf(Error);
      state = reviewed as typeof state;
    }

    expect(state.status).toBe("in_progress");
    expect(projectRavenVision(state).readyToBank).toBeFalse();
  });

  test("reopening a skipped ready slot disables ready_to_bank", () => {
    const ready = approvedReadyState();
    expect(ready.status).toBe("ready_to_bank");

    const reopened = reduceRavenVisionState(
      ready,
      visionEvent("raven.vision.slot.updated", {
        slotId: "mechanism",
        text: "A reopened mechanism slot.",
      }),
    );

    expect(reopened).not.toBeInstanceOf(Error);
    expect((reopened as typeof ready).slots.mechanism.status).toBe("needs_review");
    expect((reopened as typeof ready).status).toBe("in_progress");
  });

  test("slot updates preserve unrelated review and source state", () => {
    let state = createInitialRavenVisionState("2026-05-30T00:00:00.000Z");

    for (const [slotId, text] of [
      ["person", "Approved person."],
      ["the-work", "Skipped work."],
      ["refusal", "Still waiting."],
    ] as const) {
      const updated = reduceRavenVisionState(
        state,
        visionEvent("raven.vision.slot.updated", { slotId, text }),
      );
      expect(updated).not.toBeInstanceOf(Error);
      state = updated as typeof state;
    }

    const approved = reduceRavenVisionState(
      state,
      visionEvent("raven.vision.slot.approved", { slotId: "person" }),
    );
    expect(approved).not.toBeInstanceOf(Error);
    state = approved as typeof state;

    const skipped = reduceRavenVisionState(
      state,
      visionEvent("raven.vision.slot.skipped", { slotId: "the-work" }),
    );
    expect(skipped).not.toBeInstanceOf(Error);
    state = skipped as typeof state;

    const attached = reduceRavenVisionState(
      state,
      visionEvent("raven.vision.source_attached", {
        sourceId: "src_fixture",
      }),
    );
    expect(attached).not.toBeInstanceOf(Error);
    state = attached as typeof state;

    const ravenUpdate = reduceRavenVisionState(
      state,
      visionEvent("raven.vision.slot.updated", {
        slotId: "mechanism",
        text: "Raven writes one mechanism draft.",
      }),
    );

    expect(ravenUpdate).not.toBeInstanceOf(Error);
    const next = ravenUpdate as typeof state;
    expect(next.sourceItemIds).toEqual(["src_fixture"]);
    expect(next.slots.person).toMatchObject({
      status: "approved",
      text: "Approved person.",
    });
    expect(next.slots["the-work"]).toMatchObject({
      status: "skipped",
      text: "",
    });
    expect(next.slots.refusal).toMatchObject({
      status: "needs_review",
      text: "Still waiting.",
    });
    expect(next.slots.mechanism).toMatchObject({
      status: "needs_review",
      text: "Raven writes one mechanism draft.",
    });
  });

  test("rejects unknown slot IDs", () => {
    const state = createInitialRavenVisionState("2026-05-30T00:00:00.000Z");
    const result = reduceRavenVisionState(
      state,
      visionEvent("raven.vision.slot.updated", {
        slotId: "unknown" as RavenVisionSlotId,
        text: "Nope.",
      }),
    );

    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain("Valid slot ids");
  });
});
