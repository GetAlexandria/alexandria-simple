import { describe, expect, test } from "bun:test";
import type { LibraryCatalogThread } from "../src/domain/library-catalog.js";
import {
  deriveFrontOfHouseLifecycle,
  frontOfHouseFrameRulingResidualReason,
  frontOfHouseTriageResidualReason,
} from "../src/domain/library-front-of-house.js";
import { projectLibraryCatalogThreadResolutions } from "../src/domain/library-thread-resolution.js";
import type { AlexandriaStateEvent } from "../src/domain/state-events.js";

const projectRoot = "/tmp/alexandria-project";
const libraryRoot = "/tmp/alexandria-project/bundle";

function thread(input: Partial<LibraryCatalogThread> & Pick<LibraryCatalogThread, "id">) {
  const { id, ...rest } = input;
  return {
    confidence: "high",
    concerns: [{ type: "card", cardId: "Card - Raven" }],
    family: "gap",
    id,
    kind: "missing_card",
    reason: "Thread fixture reason.",
    severity: "medium",
    source: "authored",
    status: "open",
    ...rest,
  } satisfies LibraryCatalogThread;
}

function stateEvent(input: {
  actor?: AlexandriaStateEvent["actor"];
  at?: string;
  id: string;
  payload: Record<string, unknown>;
  type: AlexandriaStateEvent["type"];
}): AlexandriaStateEvent {
  return {
    schemaVersion: 1,
    id: input.id,
    at: input.at ?? "2026-07-02T00:00:00.000Z",
    actor: input.actor ?? { kind: "process", host: "ax", process: "cli" },
    type: input.type,
    payload: input.payload,
  };
}

function answerEvent(input: {
  actor?: AlexandriaStateEvent["actor"];
  at?: string;
  id: string;
  threadId: string;
}): AlexandriaStateEvent {
  return stateEvent({
    actor: input.actor ?? { kind: "user", host: "claude-code", name: "Director" },
    id: input.id,
    ...(input.at == null ? {} : { at: input.at }),
    type: "library.front_of_house.answer_recorded",
    payload: {
      playRunId: "foh-run-1",
      fabroRunId: "fab-1",
      questionId: `question:${input.threadId}`,
      agendaItemId: input.threadId,
      agendaItemKind: "stage2_question",
      answerText: `Answer for ${input.threadId}.`,
    },
  });
}

function residualEvent(input: {
  actor?: AlexandriaStateEvent["actor"];
  at?: string;
  id: string;
  reason: string;
  threadId: string;
}): AlexandriaStateEvent {
  return stateEvent({
    id: input.id,
    ...(input.actor == null ? {} : { actor: input.actor }),
    ...(input.at == null ? {} : { at: input.at }),
    type: "library.front_of_house.residual_gap_recorded",
    payload: {
      playRunId: "foh-run-1",
      bundlePath: "bundle",
      agendaItemId: input.threadId,
      agendaItemKind: "stage2_question",
      reason: input.reason,
    },
  });
}

function patchEvent(input: {
  answerEventId: string;
  id: string;
  patchId: string;
}): AlexandriaStateEvent {
  return stateEvent({
    id: input.id,
    type: "library.front_of_house.bundle_patch_applied",
    payload: {
      playRunId: "foh-run-1",
      bundlePath: "bundle",
      patchId: input.patchId,
      answerEventId: input.answerEventId,
      touchedCardPaths: ["product/Card - Raven.md"],
      contentHash: "sha256:patch",
    },
  });
}

describe("library thread resolution projection", () => {
  test("preserves explicit thread_resolved metadata when no later enrichment overrides it", () => {
    const projected = projectLibraryCatalogThreadResolutions({
      events: [],
      libraryRoot,
      projectRoot,
      threads: [
        thread({
          id: "thread:explicit",
          resolution: {
            reason: "Director ruled the thread closed.",
            resolvingEventId: "event:thread-resolved",
            state: "director-ruled",
          },
          resolvingEventId: "event:thread-resolved",
          status: "answered",
        }),
      ],
    });

    expect(projected).toEqual([
      expect.objectContaining({
        id: "thread:explicit",
        resolution: {
          reason: "Director ruled the thread closed.",
          resolvingEventId: "event:thread-resolved",
          state: "director-ruled",
        },
        resolvingEventId: "event:thread-resolved",
        status: "answered",
      }),
    ]);
  });

  test("projects every durable state and leaves unmatched threads open", () => {
    const threads = [
      thread({ id: "thread:director" }),
      thread({ id: "thread:cascade" }),
      thread({ id: "thread:triage" }),
      thread({ id: "thread:deferred" }),
      thread({ id: "thread:invalidated" }),
      thread({ id: "thread:unknown-process" }),
      thread({ id: "thread:open" }),
      thread({
        id: "thread:stale-authored",
        resolvingEventId: "event:stale",
        status: "answered",
      }),
    ];
    const events = [
      answerEvent({ id: "event:director-answer", threadId: "thread:director" }),
      patchEvent({
        answerEventId: "event:director-answer",
        id: "event:director-patch",
        patchId: "patch:director",
      }),
      residualEvent({
        id: "event:cascade",
        reason: "settled by frame ruling event:director-answer",
        threadId: "thread:cascade",
      }),
      residualEvent({
        id: "event:triage",
        reason: "settled by triage from event:director-answer and event:other-answer",
        threadId: "thread:triage",
      }),
      residualEvent({
        id: "event:deferred",
        reason: "Carry this unknown forward.",
        threadId: "thread:deferred",
      }),
      residualEvent({
        id: "event:invalidated",
        reason: "invalidated by ruling event:overturning-answer",
        threadId: "thread:invalidated",
      }),
      residualEvent({
        id: "event:unknown-process",
        reason: "settled by future machine contract",
        threadId: "thread:unknown-process",
      }),
    ];

    const projected = projectLibraryCatalogThreadResolutions({
      events,
      libraryRoot,
      projectRoot,
      threads,
    });
    const byId = new Map(projected.map((projectedThread) => [projectedThread.id, projectedThread]));

    expect(byId.get("thread:director")).toMatchObject({
      resolvingEventId: "event:director-answer",
      resolution: {
        answerText: "Answer for thread:director.",
        patches: [{ eventId: "event:director-patch", patchId: "patch:director" }],
        resolvingEventId: "event:director-answer",
        state: "director-ruled",
      },
      status: "answered",
    });
    expect(byId.get("thread:cascade")?.resolution).toMatchObject({
      reason: "settled by frame ruling event:director-answer",
      resolvingEventId: "event:cascade",
      state: "settled-by-cascade",
    });
    expect(byId.get("thread:triage")?.resolution).toMatchObject({
      reason: "settled by triage from event:director-answer and event:other-answer",
      resolvingEventId: "event:triage",
      state: "settled-by-triage",
    });
    expect(byId.get("thread:deferred")).toMatchObject({
      resolution: {
        reason: "Carry this unknown forward.",
        resolvingEventId: "event:deferred",
        state: "deferred-residual",
      },
      status: "residual",
    });
    expect(byId.get("thread:invalidated")?.resolution).toMatchObject({
      reason: "invalidated by ruling event:overturning-answer",
      resolvingEventId: "event:invalidated",
      state: "invalidated",
    });
    expect(byId.get("thread:unknown-process")?.resolution).toMatchObject({
      reason: "settled by future machine contract",
      resolvingEventId: "event:unknown-process",
      state: "settled-by-cascade",
    });
    expect(byId.get("thread:unknown-process")?.resolution?.state).not.toBe("director-ruled");
    expect(byId.get("thread:open")).toMatchObject({ status: "open" });
    expect(byId.get("thread:open")?.resolution).toBeUndefined();
    expect(byId.get("thread:open")?.resolvingEventId).toBeUndefined();
    expect(byId.get("thread:stale-authored")).toMatchObject({ status: "open" });
    expect(byId.get("thread:stale-authored")?.resolution).toBeUndefined();
    expect(byId.get("thread:stale-authored")?.resolvingEventId).toBeUndefined();
  });

  test("replaying the same ledger twice is deterministic", () => {
    const threads = [thread({ id: "thread:director" })];
    const events = [
      answerEvent({ id: "event:director-answer", threadId: "thread:director" }),
      patchEvent({
        answerEventId: "event:director-answer",
        id: "event:director-patch",
        patchId: "patch:director",
      }),
    ];

    const first = projectLibraryCatalogThreadResolutions({
      events,
      libraryRoot,
      projectRoot,
      threads,
    });
    const second = projectLibraryCatalogThreadResolutions({
      events,
      libraryRoot,
      projectRoot,
      threads,
    });

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  test("flat answer and patch event spellings project like front-of-house spellings", () => {
    const threads = [thread({ id: "thread:director" })];
    const oldEvents = [
      answerEvent({ id: "event:director-answer", threadId: "thread:director" }),
      patchEvent({
        answerEventId: "event:director-answer",
        id: "event:director-patch",
        patchId: "patch:director",
      }),
    ];
    const flatEvents = oldEvents.map((event) => ({
      ...event,
      type:
        event.type === "library.front_of_house.answer_recorded"
          ? "library.answer_recorded"
          : "library.card_patch_applied",
    })) satisfies AlexandriaStateEvent[];

    expect(
      projectLibraryCatalogThreadResolutions({
        events: oldEvents,
        libraryRoot,
        projectRoot,
        threads,
      }),
    ).toEqual(
      projectLibraryCatalogThreadResolutions({
        events: flatEvents,
        libraryRoot,
        projectRoot,
        threads,
      }),
    );
  });

  test("latest matching ledger event wins", () => {
    const projected = projectLibraryCatalogThreadResolutions({
      events: [
        answerEvent({ id: "event:first-answer", threadId: "thread:latest" }),
        residualEvent({
          at: "2026-07-02T00:01:00.000Z",
          id: "event:later-invalidated",
          reason: "invalidated by ruling event:later-answer",
          threadId: "thread:latest",
        }),
      ],
      libraryRoot,
      projectRoot,
      threads: [thread({ id: "thread:latest" })],
    });

    expect(projected[0]?.resolution).toMatchObject({
      resolvingEventId: "event:later-invalidated",
      state: "invalidated",
    });
  });

  test("durable thread projection survives a play-run relaunch while agenda state resets", () => {
    const events = [
      answerEvent({
        id: "event:old-run-answer",
        threadId: "thread:director",
      }),
    ];
    const relaunchedLifecycle = deriveFrontOfHouseLifecycle(events, "foh-run-2");
    const projected = projectLibraryCatalogThreadResolutions({
      events,
      libraryRoot,
      projectRoot,
      threads: [thread({ id: "thread:director" })],
    });

    expect([...relaunchedLifecycle.resolvedAgendaItemIds]).toEqual([]);
    expect(projected[0]).toMatchObject({
      resolvingEventId: "event:old-run-answer",
      resolution: {
        resolvingEventId: "event:old-run-answer",
        state: "director-ruled",
      },
      status: "answered",
    });
  });

  test("a frontOfHouseFrameRulingResidualReason reason classifies as settled-by-cascade", () => {
    // Producer (front-of-house) -> classifier (this module) round-trip: the
    // reason text frontOfHouseFrameRulingResidualReason emits must still be
    // recognized by this module's SETTLED_BY_FRAME_RULING_REASON_PREFIX match.
    const reason = frontOfHouseFrameRulingResidualReason({
      answerEventId: "event:director-answer",
      basis: "one play among thousands",
    });
    const projected = projectLibraryCatalogThreadResolutions({
      events: [
        answerEvent({ id: "event:director-answer", threadId: "thread:other" }),
        residualEvent({
          id: "event:cascade-round-trip",
          reason,
          threadId: "thread:cascade-round-trip",
        }),
      ],
      libraryRoot,
      projectRoot,
      threads: [thread({ id: "thread:cascade-round-trip" })],
    });

    expect(projected[0]?.resolution).toMatchObject({
      reason,
      resolvingEventId: "event:cascade-round-trip",
      state: "settled-by-cascade",
    });
  });

  test("item_reopened reopens only a matching triage settlement in catalog projection", () => {
    const triageReason = frontOfHouseTriageResidualReason({
      rulingEventIds: ["event:director-answer"],
    });
    const reopened = stateEvent({
      id: "event:reopen-triage",
      type: "library.front_of_house.item_reopened",
      payload: {
        playRunId: "foh-run-1",
        bundlePath: "bundle",
        agendaItemId: "thread:triage",
        reopenedSettlementEventId: "event:triage-settlement",
        reason: "director requested reopen",
      },
    });
    const projected = projectLibraryCatalogThreadResolutions({
      events: [
        answerEvent({ id: "event:director-answer", threadId: "thread:other" }),
        residualEvent({
          id: "event:triage-settlement",
          reason: triageReason,
          threadId: "thread:triage",
        }),
        reopened,
      ],
      libraryRoot,
      projectRoot,
      threads: [thread({ id: "thread:triage" })],
    });

    expect(projected[0]).toMatchObject({
      id: "thread:triage",
      status: "open",
    });
    expect(projected[0]?.resolution).toBeUndefined();
  });
});
