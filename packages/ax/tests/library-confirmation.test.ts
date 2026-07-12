import { afterEach, describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import {
  computeEmptyLibraryBundleHash,
  deriveLibraryConfirmation,
  isOperationalEmptyLibraryBundlePath,
  libraryConfirmedIdempotencyKey,
  validateLibraryConfirmationActor,
  validateLibraryConfirmationEditList,
} from "../src/domain/library-confirmation.js";
import { NodeFileSystem } from "../src/effects/filesystem.js";
import type { AlexandriaStateEvent } from "../src/domain/state-events.js";

const tempDirs = new Set<string>();

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-confirm-domain-"));
  tempDirs.add(dir);
  return dir;
}

function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function hashBundle(bundle: string): Promise<string> {
  return Effect.runPromise(
    computeEmptyLibraryBundleHash(bundle).pipe(Effect.provide(NodeFileSystem)),
  );
}

function event(input: {
  actorKind: "agent" | "process" | "user";
  id: string;
  libraryVersion: number;
  type: AlexandriaStateEvent["type"];
}): AlexandriaStateEvent {
  return {
    schemaVersion: 1,
    id: input.id,
    at: "2026-06-24T00:00:00.000Z",
    actor: { kind: input.actorKind },
    payload: {
      product: "alexandria",
      bundlePath: "/project/bundle",
      libraryVersion: input.libraryVersion,
    },
    type: input.type,
  };
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("library confirmation domain", () => {
  test("derives approval only from matching user-authored library.confirmed events", () => {
    const criteria = {
      product: "alexandria",
      bundlePath: "/project/bundle",
      libraryVersion: 1,
    };

    expect(
      deriveLibraryConfirmation({
        criteria,
        events: [
          event({
            actorKind: "process",
            id: "00000000-0000-4000-8000-000000000001",
            libraryVersion: 1,
            type: "library.confirmed",
          }),
          event({
            actorKind: "user",
            id: "00000000-0000-4000-8000-000000000002",
            libraryVersion: 2,
            type: "library.confirmed",
          }),
          event({
            actorKind: "user",
            id: "00000000-0000-4000-8000-000000000003",
            libraryVersion: 1,
            type: "library.confirmation_rejected",
          }),
        ],
      }).approved,
    ).toBe(false);

    const approved = deriveLibraryConfirmation({
      criteria,
      events: [
        event({
          actorKind: "user",
          id: "00000000-0000-4000-8000-000000000004",
          libraryVersion: 1,
          type: "library.confirmed",
        }),
      ],
    });
    expect(approved.approved).toBe(true);
    expect(approved.event?.id).toBe("00000000-0000-4000-8000-000000000004");
  });

  test("uses an exact product/path/version idempotency key", () => {
    expect(
      libraryConfirmedIdempotencyKey({
        product: "alexandria",
        bundlePath: "/project/bundle",
        libraryVersion: 7,
      }),
    ).toBe("library.confirmed:alexandria:/project/bundle:v7");
  });

  test("requires user actors and structure-only rejection edit lists", () => {
    expect(validateLibraryConfirmationActor({ kind: "user" })).toBeNull();
    expect(validateLibraryConfirmationActor({ kind: "agent", host: "claude-code" })?.message).toBe(
      "Library confirmation requires actor.kind=user.",
    );

    const editList = validateLibraryConfirmationEditList([
      {
        kind: "relationship_topology",
        target: "Agent - Raven",
        requestedChange: "Connect Raven to the Director role.",
      },
    ]);
    expect(editList).not.toBeInstanceOf(Error);

    const bodyEdit = validateLibraryConfirmationEditList([
      {
        kind: "context_boundary",
        target: "Agent - Raven",
        requestedChange: "Rewrite the card body.",
      },
    ]);
    expect(bodyEdit).toBeInstanceOf(Error);
  });

  test("empty-library hash covers reviewed thread-events content", async () => {
    const bundle = join(makeTempDir(), "bundle");
    writeFile(
      join(bundle, "product/agents/Agent - Raven.md"),
      `---
type: Agent
prefLabel: Raven
context: Product
plane: Product
status: stub
---
Body.
`,
    );
    writeFile(
      join(bundle, "thread-events"),
      `${JSON.stringify(
        {
          schemaVersion: "library-threads.v1",
          threads: [
            {
              id: "gap-raven",
              family: "gap",
              kind: "missing_card",
              concerns: [{ type: "card", cardId: "Agent - Raven" }],
              confidence: "high",
              severity: "medium",
              status: "open",
              question: "Confirm Raven?",
              reason: "Confirm Raven.",
            },
          ],
        },
        null,
        2,
      )}\n`,
    );
    const before = await hashBundle(bundle);

    writeFile(
      join(bundle, "thread-events"),
      `${JSON.stringify(
        {
          schemaVersion: "library-threads.v1",
          threads: [
            {
              id: "gap-raven",
              family: "gap",
              kind: "missing_card",
              concerns: [{ type: "card", cardId: "Agent - Raven" }],
              confidence: "high",
              severity: "medium",
              status: "open",
              question: "Confirm Raven?",
              reason: "Confirm Raven as the product-facing agent.",
            },
          ],
        },
        null,
        2,
      )}\n`,
    );

    expect(await hashBundle(bundle)).not.toBe(before);
  });

  test("thread-events is not an operational empty-library path", () => {
    expect(isOperationalEmptyLibraryBundlePath("thread-events")).toBeFalse();
  });

  test("operational empty-library paths remain excluded from the confirmation hash", async () => {
    const bundle = join(makeTempDir(), "bundle");
    writeFile(
      join(bundle, "product/agents/Agent - Raven.md"),
      `---
type: Agent
prefLabel: Raven
context: Product
plane: Product
status: stub
---
Body.
`,
    );
    const before = await hashBundle(bundle);

    writeFile(join(bundle, "runtime/front-of-house/agenda.json"), "{}\n");
    writeFile(join(bundle, "HOT-SPOTS.md"), "# Hot Spots\n");
    writeFile(join(bundle, "READ-COHERENCE.md"), "# Read Coherence\n");
    writeFile(join(bundle, "RESIDUAL-GAPS.md"), "# Residual Gaps\n");
    writeFile(join(bundle, "STAGE-2-BRIEF.md"), "# Stage 2 Brief\n");

    expect(isOperationalEmptyLibraryBundlePath("runtime/front-of-house/agenda.json")).toBeTrue();
    expect(isOperationalEmptyLibraryBundlePath("HOT-SPOTS.md")).toBeTrue();
    expect(isOperationalEmptyLibraryBundlePath("READ-COHERENCE.md")).toBeTrue();
    expect(isOperationalEmptyLibraryBundlePath("RESIDUAL-GAPS.md")).toBeTrue();
    expect(isOperationalEmptyLibraryBundlePath("STAGE-2-BRIEF.md")).toBeTrue();
    expect(await hashBundle(bundle)).toBe(before);
  });
});
