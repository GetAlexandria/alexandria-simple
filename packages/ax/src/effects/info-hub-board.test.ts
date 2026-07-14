import { afterEach, describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { mkdtempSync, readFileSync, realpathSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { infoHubBoardPathForWorkspacePath } from "../domain/paths.js";
import { NodeFileSystem } from "./filesystem.js";
import {
  DEFAULT_INFO_HUB_BOARD_COMMENT,
  InfoHubBoardValidationError,
  defaultInfoHubBoard,
  mergeInfoHubCards,
  normalizeCardStatusTransition,
  readInfoHubBoard,
  validateInfoHubCards,
  writeInfoHubBoard,
  type InfoHubCard,
} from "./info-hub-board.js";

const tempDirs = new Set<string>();

// realpathSync the mkdtemp dir: on macOS /var and /tmp are symlinks, and the
// filesystem effect's containment-adjacent path handling compares resolved
// paths. Linux CI masks this; realpath keeps the local run honest.
function makeWorkspacePath(): string {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "ax-info-hub-board-")));
  tempDirs.add(dir);
  return join(dir, "docs/alexandria");
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

function runRead(workspacePath: string) {
  return Effect.runPromise(
    readInfoHubBoard({ workspacePath }).pipe(Effect.provide(NodeFileSystem)),
  );
}

function baseCard(overrides: Partial<InfoHubCard> = {}): InfoHubCard {
  return {
    id: "wo-example",
    type: "task",
    status: "open",
    domainId: "alexandria",
    priority: 15,
    source: "board:director",
    created: "2026-07-01",
    ...overrides,
  };
}

describe("validateInfoHubCards", () => {
  test("accepts a valid card list", () => {
    const result = validateInfoHubCards([baseCard()]);
    expect(result).not.toBeInstanceOf(InfoHubBoardValidationError);
    expect((result as InfoHubCard[])[0]?.id).toBe("wo-example");
  });

  test("allows checklist on any card type, not just testing", () => {
    const result = validateInfoHubCards([
      baseCard({ type: "improvement", checklist: [{ done: false, text: "step one" }] }),
    ]);
    expect(result).not.toBeInstanceOf(InfoHubBoardValidationError);
  });

  test("accepts the optional map-join fields contextId and entityId (Map tab M1)", () => {
    const result = validateInfoHubCards([
      baseCard({ contextId: "viewer", entityId: "prj-map-tab" }),
    ]);
    expect(result).not.toBeInstanceOf(InfoHubBoardValidationError);
    const card = (result as InfoHubCard[])[0];
    expect(card?.contextId).toBe("viewer");
    expect(card?.entityId).toBe("prj-map-tab");
  });

  test("keeps cards without contextId/entityId valid (no migration)", () => {
    const result = validateInfoHubCards([baseCard()]);
    expect(result).not.toBeInstanceOf(InfoHubBoardValidationError);
    const card = (result as InfoHubCard[])[0];
    expect(card?.contextId).toBeUndefined();
    expect(card?.entityId).toBeUndefined();
  });

  test("rejects non-string contextId/entityId values", () => {
    const badContextId = validateInfoHubCards([{ ...baseCard(), contextId: 7 }]);
    expect(badContextId).toBeInstanceOf(InfoHubBoardValidationError);
    const badEntityId = validateInfoHubCards([{ ...baseCard(), entityId: true }]);
    expect(badEntityId).toBeInstanceOf(InfoHubBoardValidationError);
    const emptyContextId = validateInfoHubCards([baseCard({ contextId: "" })]);
    expect(emptyContextId).toBeInstanceOf(InfoHubBoardValidationError);
    expect((emptyContextId as InfoHubBoardValidationError).message).toContain(
      "contextId must be a non-empty string",
    );
    const emptyEntityId = validateInfoHubCards([baseCard({ entityId: "" })]);
    expect(emptyEntityId).toBeInstanceOf(InfoHubBoardValidationError);
  });

  test("accepts an optional assignee (prefix-style) and rejects an empty one", () => {
    const assigned = validateInfoHubCards([baseCard({ assignee: "human:danvers" })]);
    expect(assigned).not.toBeInstanceOf(InfoHubBoardValidationError);
    expect((assigned as InfoHubCard[])[0]?.assignee).toBe("human:danvers");

    // Unassigned stays valid — the field is simply absent.
    const unassigned = validateInfoHubCards([baseCard()]);
    expect((unassigned as InfoHubCard[])[0]?.assignee).toBeUndefined();

    const empty = validateInfoHubCards([baseCard({ assignee: "" })]);
    expect(empty).toBeInstanceOf(InfoHubBoardValidationError);
    expect((empty as InfoHubBoardValidationError).message).toContain(
      "assignee must be a non-empty string",
    );

    const nonString = validateInfoHubCards([{ ...baseCard(), assignee: 7 }]);
    expect(nonString).toBeInstanceOf(InfoHubBoardValidationError);
  });

  test("a pre-M1 board (frozen snapshot, no contextId/entityId) still validates unmodified", () => {
    // A frozen snapshot of docs/alexandria/info-hub/board-state.json as it
    // stood when the map-join fields landed (Map tab M1) — the one-time
    // no-migration check, kept hermetic so later duty-loop board edits
    // cannot break this suite.
    const boardPath = join(
      import.meta.dir,
      "../../tests/fixtures/info-hub/board-state.snapshot.json",
    );
    const board = JSON.parse(readFileSync(boardPath, "utf8")) as { cards: unknown };
    expect(validateInfoHubCards(board.cards)).not.toBeInstanceOf(InfoHubBoardValidationError);
  });

  test("rejects unknown fields", () => {
    const result = validateInfoHubCards([{ ...baseCard(), play: "some-play" }]);
    expect(result).toBeInstanceOf(InfoHubBoardValidationError);
    expect((result as InfoHubBoardValidationError).message).toContain("unknown fields");
  });

  test("requires a non-empty domainId (the shared Map/Board spine)", () => {
    const missing: Record<string, unknown> = { ...baseCard() };
    delete missing.domainId;
    const missingResult = validateInfoHubCards([missing]);
    expect(missingResult).toBeInstanceOf(InfoHubBoardValidationError);
    expect((missingResult as InfoHubBoardValidationError).message).toContain("missing fields");

    const empty = validateInfoHubCards([baseCard({ domainId: "" })]);
    expect(empty).toBeInstanceOf(InfoHubBoardValidationError);
    expect((empty as InfoHubBoardValidationError).message).toContain(
      "domainId must be a non-empty string",
    );

    const nonString = validateInfoHubCards([{ ...baseCard(), domainId: 7 }]);
    expect(nonString).toBeInstanceOf(InfoHubBoardValidationError);
    expect((nonString as InfoHubBoardValidationError).message).toContain(
      "domainId must be a non-empty string",
    );
  });

  test("rejects a bad type enum", () => {
    const result = validateInfoHubCards([baseCard({ type: "chore" as InfoHubCard["type"] })]);
    expect(result).toBeInstanceOf(InfoHubBoardValidationError);
    expect((result as InfoHubBoardValidationError).message).toContain("type must be one of");
  });

  test("rejects a bad status enum", () => {
    const result = validateInfoHubCards([baseCard({ status: "blocked" as InfoHubCard["status"] })]);
    expect(result).toBeInstanceOf(InfoHubBoardValidationError);
    expect((result as InfoHubBoardValidationError).message).toContain("status must be one of");
  });

  test("rejects duplicate ids", () => {
    const result = validateInfoHubCards([baseCard(), baseCard()]);
    expect(result).toBeInstanceOf(InfoHubBoardValidationError);
    expect((result as InfoHubBoardValidationError).message).toContain("duplicate card id");
  });

  test("rejects a malformed created date", () => {
    const result = validateInfoHubCards([baseCard({ created: "07/01/2026" })]);
    expect(result).toBeInstanceOf(InfoHubBoardValidationError);
    expect((result as InfoHubBoardValidationError).message).toContain("created must be YYYY-MM-DD");
  });

  test("rejects a malformed terminalAt date", () => {
    const result = validateInfoHubCards([baseCard({ status: "done", terminalAt: "not-a-date" })]);
    expect(result).toBeInstanceOf(InfoHubBoardValidationError);
    expect((result as InfoHubBoardValidationError).message).toContain(
      "terminalAt must be YYYY-MM-DD",
    );
  });

  test("rejects a non-integer priority", () => {
    const result = validateInfoHubCards([baseCard({ priority: 1.5 })]);
    expect(result).toBeInstanceOf(InfoHubBoardValidationError);
  });

  test("rejects missing required fields", () => {
    const withoutSource: Record<string, unknown> = { ...baseCard() };
    delete withoutSource.source;
    const result = validateInfoHubCards([withoutSource]);
    expect(result).toBeInstanceOf(InfoHubBoardValidationError);
    expect((result as InfoHubBoardValidationError).message).toContain("missing fields");
  });

  test("rejects checklist items with unknown fields", () => {
    const result = validateInfoHubCards([
      baseCard({ checklist: [{ done: false, text: "x", extra: true } as never] }),
    ]);
    expect(result).toBeInstanceOf(InfoHubBoardValidationError);
  });
});

describe("normalizeCardStatusTransition", () => {
  test("auto-sets terminalAt to today when a card newly becomes done", () => {
    const next = normalizeCardStatusTransition(
      undefined,
      baseCard({ status: "done" }),
      "2026-07-09",
    );
    expect(next.terminalAt).toBe("2026-07-09");
  });

  test("clears terminalAt when a card leaves terminal status", () => {
    const existing = baseCard({ status: "done", terminalAt: "2026-07-01" });
    const next = normalizeCardStatusTransition(
      existing,
      baseCard({ status: "open" }),
      "2026-07-09",
    );
    expect(next.terminalAt).toBeUndefined();
  });

  test("preserves the prior terminalAt when re-affirming an already-terminal card", () => {
    const existing = baseCard({ status: "done", terminalAt: "2026-06-15" });
    const next = normalizeCardStatusTransition(
      existing,
      baseCard({ status: "wont-do" }),
      "2026-07-09",
    );
    expect(next.terminalAt).toBe("2026-06-15");
  });

  test("does not touch terminalAt when the posted card already sets one", () => {
    const next = normalizeCardStatusTransition(
      undefined,
      baseCard({ status: "done", terminalAt: "2026-05-01" }),
      "2026-07-09",
    );
    expect(next.terminalAt).toBe("2026-05-01");
  });
});

describe("mergeInfoHubCards", () => {
  test("preserves on-disk cards not present in the posted set", () => {
    const existing = [baseCard({ id: "wo-a" }), baseCard({ id: "wo-b" })];
    const posted = [baseCard({ id: "wo-a", title: "Updated A" })];
    const merged = mergeInfoHubCards(existing, posted, "2026-07-09");
    expect(merged).not.toBeInstanceOf(InfoHubBoardValidationError);
    const cards = merged as InfoHubCard[];
    expect(cards.map((card) => card.id)).toEqual(["wo-a", "wo-b"]);
    expect(cards.find((card) => card.id === "wo-a")?.title).toBe("Updated A");
  });

  test("appends newly posted cards not previously on disk", () => {
    const existing = [baseCard({ id: "wo-a" })];
    const posted = [baseCard({ id: "wo-new" })];
    const merged = mergeInfoHubCards(existing, posted, "2026-07-09");
    const cards = merged as InfoHubCard[];
    expect(cards.map((card) => card.id)).toEqual(["wo-a", "wo-new"]);
  });

  test("normalizes terminalAt across the merge for a card transitioning to done", () => {
    const existing = [baseCard({ id: "wo-a", status: "open" })];
    const posted = [baseCard({ id: "wo-a", status: "done" })];
    const merged = mergeInfoHubCards(existing, posted, "2026-07-09");
    const cards = merged as InfoHubCard[];
    expect(cards[0]?.terminalAt).toBe("2026-07-09");
  });

  test("clears terminalAt across the merge for a card reopened from done", () => {
    const existing = [baseCard({ id: "wo-a", status: "done", terminalAt: "2026-06-01" })];
    const posted = [baseCard({ id: "wo-a", status: "open" })];
    const merged = mergeInfoHubCards(existing, posted, "2026-07-09");
    const cards = merged as InfoHubCard[];
    expect(cards[0]?.terminalAt).toBeUndefined();
  });

  test("rejects the merge when the posted set is invalid", () => {
    const existing = [baseCard({ id: "wo-a" })];
    const posted = [{ ...baseCard({ id: "wo-a" }), play: "nope" }];
    const merged = mergeInfoHubCards(existing, posted, "2026-07-09");
    expect(merged).toBeInstanceOf(InfoHubBoardValidationError);
  });
});

describe("readInfoHubBoard / writeInfoHubBoard", () => {
  test("returns a default empty board when the file is missing, without creating it", async () => {
    const workspacePath = makeWorkspacePath();
    const board = await runRead(workspacePath);
    expect(board.comment).toBe(DEFAULT_INFO_HUB_BOARD_COMMENT);
    expect(board.cards).toEqual([]);
    const { existsSync } = await import("fs");
    expect(existsSync(infoHubBoardPathForWorkspacePath(workspacePath))).toBeFalse();
  });

  test("writes and reads back a board, creating the info-hub directory", async () => {
    const workspacePath = makeWorkspacePath();
    const board = { ...defaultInfoHubBoard(), cards: [baseCard()] };
    await Effect.runPromise(
      writeInfoHubBoard({ board, workspacePath }).pipe(Effect.provide(NodeFileSystem)),
    );

    const boardPath = infoHubBoardPathForWorkspacePath(workspacePath);
    const raw = readFileSync(boardPath, "utf8");
    expect(raw.endsWith("\n")).toBeTrue();
    const parsed = JSON.parse(raw) as { cards: unknown[]; comment: string; updated: string };
    expect(parsed.comment).toBe(DEFAULT_INFO_HUB_BOARD_COMMENT);
    expect(parsed.cards).toHaveLength(1);

    const reread = await runRead(workspacePath);
    expect(reread.cards).toHaveLength(1);
    expect(reread.cards[0]?.id).toBe("wo-example");
  });

  test("fails the read effect for a malformed on-disk board", async () => {
    const workspacePath = makeWorkspacePath();
    await Effect.runPromise(
      writeInfoHubBoard({
        board: {
          comment: "x",
          updated: "2026-07-09",
          cards: [{ id: "" } as unknown as InfoHubCard],
        },
        workspacePath,
      }).pipe(Effect.provide(NodeFileSystem)),
    );

    await expect(runRead(workspacePath)).rejects.toBeDefined();
  });
});
