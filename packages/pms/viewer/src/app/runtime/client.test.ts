import { describe, expect, test } from "bun:test";
import * as Effect from "effect/Effect";
import { decodeLibraryCatalog, type LibraryCatalogThreadResolutionState } from "./schemas";

const RESOLUTION_STATES: LibraryCatalogThreadResolutionState[] = [
  "director-ruled",
  "settled-by-cascade",
  "settled-by-triage",
  "deferred-residual",
  "invalidated",
];

function catalogPayload(threads: unknown[]): unknown {
  return {
    areas: [],
    cards: [],
    edges: [],
    gaps: [],
    meta: {
      areaCount: 0,
      cardCount: 0,
      draftOf: "x",
      edgeCount: 0,
      gapCount: 0,
      metadataIssues: [],
      planes: [],
      playRunId: "y",
    },
    threads,
  };
}

function threadPayload(
  id: string,
  options: {
    resolution?: {
      answerText?: string;
      patches?: Array<{ eventId: string; patchId: string }>;
      reason?: string;
      resolvingEventId: string;
      state: LibraryCatalogThreadResolutionState;
    };
    resolvingEventId?: string;
    status?: string;
  } = {},
): unknown {
  return {
    confidence: "high",
    concerns: [],
    emittingMove: "pass1_events",
    family: "hot_spot",
    id,
    kind: "docs_disagree",
    question: `Question for ${id}?`,
    reason: `Reason for ${id}.`,
    ...(options.resolution == null ? {} : { resolution: options.resolution }),
    ...(options.resolvingEventId == null ? {} : { resolvingEventId: options.resolvingEventId }),
    severity: "medium",
    source: "authored",
    sourceEvidence: ["fixture.md:1"],
    status: options.status ?? "open",
  };
}

describe("PMS library catalog runtime schema", () => {
  test("decodes projected durable thread resolutions", async () => {
    const decoded = await Effect.runPromise(
      decodeLibraryCatalog(
        catalogPayload(
          RESOLUTION_STATES.map((state, index) =>
            threadPayload(`thread:${state}`, {
              resolution: {
                ...(index === 0
                  ? {
                      answerText: "Director ruling text.",
                      patches: [{ eventId: "event:patch", patchId: "patch:director" }],
                    }
                  : { reason: `Machine or residual reason for ${state}.` }),
                resolvingEventId: `event:${state}`,
                state,
              },
              resolvingEventId: `event:${state}`,
              status: state === "deferred-residual" ? "residual" : "answered",
            }),
          ),
        ),
      ),
    );

    expect(decoded.threads?.map((thread) => thread.resolution?.state)).toEqual(RESOLUTION_STATES);
    expect(decoded.threads?.[0]?.resolution?.answerText).toBe("Director ruling text.");
    expect(decoded.threads?.[0]?.resolution?.patches?.[0]).toEqual({
      eventId: "event:patch",
      patchId: "patch:director",
    });
    expect(decoded.threads?.[0]?.resolvingEventId).toBe("event:director-ruled");
    expect(decoded.meta.draftOf).toBe("x");
    expect(decoded.meta.playRunId).toBe("y");
  });

  test("keeps older thread catalogs without resolution valid", async () => {
    const decoded = await Effect.runPromise(
      decodeLibraryCatalog(
        catalogPayload([
          threadPayload("thread:older-catalog", {
            resolvingEventId: "event:legacy-answer",
            status: "answered",
          }),
        ]),
      ),
    );

    expect(decoded.threads?.[0]?.resolution).toBeUndefined();
    expect(decoded.threads?.[0]?.resolvingEventId).toBe("event:legacy-answer");
  });

  // Issue #633: `horizon` is an optional card field and `"WHEN"` is accepted
  // in the closed `missingSections` allowlists. Issue #673 adds `"WHY"` to the
  // same thread + fill-readiness card allowlists. Decode is closed-world, so an
  // unrecognized value would fail the whole catalog decode.
  function catalogPayloadWithCard(card: Record<string, unknown>): unknown {
    return {
      areas: [],
      cards: [card],
      edges: [],
      gaps: [],
      meta: {
        areaCount: 0,
        cardCount: 1,
        edgeCount: 0,
        gapCount: 0,
        metadataIssues: [],
        planes: [],
      },
      threads: [],
    };
  }

  const fixtureCard = {
    confidence: "high",
    context: "library",
    edgeIds: [],
    id: "Entity - Fixture Thing",
    plane: "Product",
    prefLabel: "Fixture Thing",
    provenance: { label: "fixture", sourceRefs: ["fixture:pms-schema"] },
    status: "confirmed",
    type: "Entity",
  };

  test("decodes a card with horizon:future and retains the field", async () => {
    const decoded = await Effect.runPromise(
      decodeLibraryCatalog(catalogPayloadWithCard({ ...fixtureCard, horizon: "future" })),
    );

    expect(decoded.cards[0]?.horizon).toBe("future");
  });

  test("decodes a card without horizon as today (field absent)", async () => {
    const decoded = await Effect.runPromise(
      decodeLibraryCatalog(catalogPayloadWithCard(fixtureCard)),
    );

    expect(decoded.cards[0]?.horizon).toBeUndefined();
  });

  test("decodes a thread with missingSections containing WHY and WHEN", async () => {
    const decoded = await Effect.runPromise(
      decodeLibraryCatalog(
        catalogPayload([
          {
            confidence: "high",
            concerns: [],
            family: "hot_spot",
            id: "thread:when-gap",
            kind: "docs_disagree",
            missingSections: ["WHAT", "WHY", "WHEN"],
            reason: "Reason for thread:when-gap.",
            severity: "medium",
            source: "authored",
            status: "open",
          },
        ]),
      ),
    );

    expect(decoded.threads?.[0]?.missingSections).toEqual(["WHAT", "WHY", "WHEN"]);
  });

  test("decodes a fill-readiness card with missingSections containing WHY and WHEN", async () => {
    const decoded = await Effect.runPromise(
      decodeLibraryCatalog({
        areas: [],
        cards: [],
        edges: [],
        fillReadiness: {
          areas: [],
          cards: [
            {
              blockingThreadIds: [],
              cardId: "Entity - Fixture Thing",
              fillable: false,
              gapThreadIds: [],
              missingSections: ["WHAT", "WHY", "WHEN"],
            },
          ],
          fillableCardCount: 0,
          gapCount: 0,
          hotSpotCount: 0,
          ready: false,
          threadCount: 0,
          totalCardCount: 1,
        },
        gaps: [],
        meta: {
          areaCount: 0,
          cardCount: 0,
          edgeCount: 0,
          gapCount: 0,
          metadataIssues: [],
          planes: [],
        },
        threads: [],
      }),
    );

    expect(decoded.fillReadiness?.cards[0]?.missingSections).toEqual(["WHAT", "WHY", "WHEN"]);
  });
});
