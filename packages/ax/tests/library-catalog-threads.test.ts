import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import {
  buildLibraryCatalog,
  CANONICAL_THREAD_KINDS,
  PRODUCT_CARD_SCHEMA_VERSION,
} from "../src/domain/library-catalog.js";
import {
  projectLibraryCatalogAuthoredThreads,
  type LibraryCatalogAuthoredThreadScope,
} from "../src/domain/library-thread-events.js";
import {
  validateAlexandriaStateEvent,
  type AlexandriaStateEvent,
} from "../src/domain/state-events.js";

const PROJECT_ROOT = "/tmp/project";
const LIBRARY_ROOT = "/tmp/project/docs/alexandria/library";
const OLD_PRODUCT_BUNDLE = "docs/alexandria/sweeps/alexandria-product";
const PRODUCT_LEDGER_THREAD_EVENTS_FIXTURE = join(
  import.meta.dir,
  "fixtures/library-backfill/product-ledger-thread-events.jsonl",
);
const PRODUCT_SCOPE = { kind: "product" } as const satisfies LibraryCatalogAuthoredThreadScope;
const NONE_SCOPE = { kind: "none" } as const satisfies LibraryCatalogAuthoredThreadScope;
const LIBRARY_BUNDLE_SCOPE = {
  kind: "bundle",
  libraryRoot: LIBRARY_ROOT,
  projectRoot: PROJECT_ROOT,
} as const satisfies LibraryCatalogAuthoredThreadScope;

function event(
  type: AlexandriaStateEvent["type"],
  payload: Record<string, unknown>,
  id: string,
): AlexandriaStateEvent {
  return {
    actor: { kind: "process", host: "ax", process: "cli" },
    at: "2026-07-08T00:00:00.000Z",
    id,
    payload,
    schemaVersion: 1,
    type,
  };
}

function openedPayload(threadId: string, overrides: Record<string, unknown> = {}) {
  return {
    threadId,
    family: "hot_spot",
    kind: "out_of_scope_suspect",
    concerns: [{ type: "context", context: "runs" }],
    confidence: "medium",
    severity: "medium",
    question:
      "The scan found a substantive Runs pile outside the declared scope. Is this part of this product?",
    reason: "Proposed disposition: suspend for director ruling; do not card in this bundle.",
    emittingMove: "pass2_carve",
    sourceEvidence: ["studio/plays/RUNTIME.md:31"],
    backfill: {
      bundle: "docs/alexandria/library",
      sourceKey: threadId,
      sourcePath: "runtime/front-of-house/thread-events.jsonl",
    },
    ...overrides,
  };
}

function readFixtureEvents(path: string): AlexandriaStateEvent[] {
  return readFileSync(path, "utf8")
    .trim()
    .split("\n")
    .map((line) => {
      const event = validateAlexandriaStateEvent(JSON.parse(line) as unknown);
      if (event instanceof Error) {
        throw event;
      }
      return event;
    });
}

describe("library catalog thread event projection", () => {
  test("projects product-ledger authored threads even when provenance names the old path", () => {
    const threads = projectLibraryCatalogAuthoredThreads({
      events: readFixtureEvents(PRODUCT_LEDGER_THREAD_EVENTS_FIXTURE),
      scope: PRODUCT_SCOPE,
    });

    expect(threads.map((thread) => thread.id)).toEqual([
      "gap-living-business-plan",
      "gap-operating-plane-category",
      "gap-federation-mechanism",
    ]);
    expect(threads.every((thread) => thread.source === "authored")).toBeTrue();
    expect(threads.every((thread) => thread.status === "open")).toBeTrue();

    const catalog = buildLibraryCatalog({
      authoredThreads: threads,
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [],
      libraryRoot: LIBRARY_ROOT,
    });

    expect(catalog.threads?.map((thread) => thread.id)).toEqual([
      "gap-living-business-plan",
      "gap-operating-plane-category",
      "gap-federation-mechanism",
    ]);
    expect(catalog.fillReadiness).toMatchObject({
      gapCount: 3,
      hotSpotCount: 0,
      threadCount: 3,
    });
  });

  test("suppresses product authored threads for builder/non-product catalog scopes", () => {
    const events = readFixtureEvents(PRODUCT_LEDGER_THREAD_EVENTS_FIXTURE);

    expect(
      projectLibraryCatalogAuthoredThreads({
        events,
        scope: NONE_SCOPE,
      }),
    ).toEqual([]);
    expect(
      projectLibraryCatalogAuthoredThreads({
        events,
        scope: LIBRARY_BUNDLE_SCOPE,
      }),
    ).toEqual([]);
  });

  test("accepts out-of-scope suspects as canonical hot-spot-family threads", () => {
    const threads = projectLibraryCatalogAuthoredThreads({
      events: [
        event(
          "library.thread_opened",
          openedPayload("out-of-scope-suspect-runs"),
          "00000000-0000-4000-8000-000000000101",
        ),
      ],
      scope: PRODUCT_SCOPE,
    });

    expect(CANONICAL_THREAD_KINDS).toContain("out_of_scope_suspect");
    expect(threads).toEqual([
      expect.objectContaining({
        concerns: [{ type: "context", context: "runs" }],
        family: "hot_spot",
        id: "out-of-scope-suspect-runs",
        kind: "out_of_scope_suspect",
        sourceEvidence: ["studio/plays/RUNTIME.md:31"],
      }),
    ]);

    const catalog = buildLibraryCatalog({
      authoredThreads: threads,
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [],
      libraryRoot: "/tmp/el2-bundle",
    });

    expect(catalog.threads?.map((thread) => thread.id)).toEqual(["out-of-scope-suspect-runs"]);
    expect(catalog.fillReadiness).toMatchObject({
      gapCount: 0,
      hotSpotCount: 1,
      ready: true,
      threadCount: 1,
      totalCardCount: 0,
    });
  });

  test("dedupes duplicate thread_opened events by threadId", () => {
    const threads = projectLibraryCatalogAuthoredThreads({
      events: [
        event(
          "library.thread_opened",
          openedPayload("gap-duplicate", { reason: "First reason." }),
          "00000000-0000-4000-8000-000000000102",
        ),
        event(
          "library.thread_opened",
          openedPayload("gap-duplicate", { reason: "Second reason." }),
          "00000000-0000-4000-8000-000000000103",
        ),
      ],
      scope: PRODUCT_SCOPE,
    });

    expect(threads).toHaveLength(1);
    expect(threads[0]).toMatchObject({ id: "gap-duplicate", reason: "First reason." });
  });

  test("keeps sourceStatus provenance open until a thread_resolved event closes it", () => {
    const threads = projectLibraryCatalogAuthoredThreads({
      events: [
        event(
          "library.thread_opened",
          openedPayload("gap-backfilled-answered", {
            sourceResolution: "Historical answer text.",
            sourceResolvingEventId: "event:historical",
            sourceStatus: "answered",
          }),
          "00000000-0000-4000-8000-000000000104",
        ),
      ],
      scope: PRODUCT_SCOPE,
    });

    expect(threads).toEqual([
      expect.objectContaining({
        id: "gap-backfilled-answered",
        status: "open",
      }),
    ]);
  });

  test("removes a thread_resolved event from the open authored set", () => {
    const threads = projectLibraryCatalogAuthoredThreads({
      events: [
        event(
          "library.thread_opened",
          openedPayload("gap-resolved"),
          "00000000-0000-4000-8000-000000000105",
        ),
        event(
          "library.thread_resolved",
          {
            threadId: "gap-resolved",
            rulingEventId: "ruling:event:1",
            resolution: "Director ruled this thread closed.",
          },
          "00000000-0000-4000-8000-000000000106",
        ),
      ],
      scope: PRODUCT_SCOPE,
    });

    expect(threads).toEqual([]);
  });

  test("supports bundle-scoped thread fixtures for Front-of-House agenda prep", () => {
    const threads = projectLibraryCatalogAuthoredThreads({
      events: [
        event(
          "library.thread_opened",
          openedPayload("gap-bundle", {
            backfill: {
              bundle: "docs/alexandria/library",
              sourceKey: "gap-bundle",
              sourcePath: "runtime/front-of-house/thread-events.jsonl",
            },
          }),
          "00000000-0000-4000-8000-000000000107",
        ),
        event(
          "library.thread_opened",
          openedPayload("gap-old-product-path", {
            backfill: {
              bundle: OLD_PRODUCT_BUNDLE,
              sourceKey: "gap-old-product-path",
              sourcePath: "runtime/front-of-house/thread-events.jsonl",
            },
          }),
          "00000000-0000-4000-8000-000000000108",
        ),
      ],
      scope: LIBRARY_BUNDLE_SCOPE,
    });

    expect(threads.map((thread) => thread.id)).toEqual(["gap-bundle"]);
  });

  test("projects zero authored threads from a ledger with no thread events", () => {
    expect(
      projectLibraryCatalogAuthoredThreads({
        events: [],
        scope: PRODUCT_SCOPE,
      }),
    ).toEqual([]);
  });
});
