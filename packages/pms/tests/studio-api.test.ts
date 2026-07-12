import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { createServer, type RequestListener, type Server } from "http";
import { tmpdir } from "os";
import { join } from "path";
import { handleStudioRequest } from "../src/server/studio-api.js";

const tempDirs = new Set<string>();
const servers = new Set<Server>();
const STAGES = ["backlog", "sourced", "designed", "built", "proven", "live"] as const;
const LEGACY_STAGES = ["empty", "sourced", "designed", "built", "proven", "live"] as const;
const originalEnv = { ...process.env };

function boardStages(overrides: Record<string, readonly string[]> = {}): Record<string, string[]> {
  const stages: Record<string, string[]> = {};
  for (const stage of STAGES) {
    stages[stage] = [...(overrides[stage] ?? [])];
  }
  return stages;
}

function legacyBoardStages(
  overrides: Record<string, readonly string[]> = {},
): Record<string, string[]> {
  const stages: Record<string, string[]> = {};
  for (const stage of LEGACY_STAGES) {
    stages[stage] = [...(overrides[stage] ?? [])];
  }
  return stages;
}

function boardSlugs(stages: Record<string, readonly string[]>): string[] {
  return Object.values(stages).flat();
}

function testingCard(
  play: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    checklist: [{ done: false, text: `Prove ${play}` }],
    created: "2026-06-23",
    division: "Product",
    function: "Insight",
    id: `wo-${play}-testing`,
    play,
    priority: 15,
    source: "test:studio-api",
    status: "open",
    title: "Testing campaign",
    type: "testing",
    ...overrides,
  };
}

function improvementCard(
  id: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    created: "2026-06-23",
    detail: "Tighten the behavior.",
    division: "Product",
    function: "Insight",
    id,
    priority: 20,
    source: "test:studio-api",
    status: "open",
    title: "Improvement campaign",
    type: "improvement",
    ...overrides,
  };
}

function bugCard(id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    created: "2026-06-23",
    detail: "Fix the regression.",
    division: "Product",
    function: "Insight",
    id,
    priority: 10,
    source: "test:studio-api",
    status: "open",
    title: "Bug campaign",
    type: "bug",
    ...overrides,
  };
}

function testingCardsForStages(
  stages: Record<string, readonly string[]>,
): Record<string, unknown>[] {
  return boardSlugs(stages).map((slug) => testingCard(slug));
}

function makeProjectWithStudio(): { boardPath: string; projectRoot: string } {
  const projectRoot = mkdtempSync(join(tmpdir(), "ax-studio-"));
  tempDirs.add(projectRoot);
  const playsDir = join(projectRoot, "studio", "plays");
  mkdirSync(playsDir, { recursive: true });
  return { boardPath: join(playsDir, "board-state.json"), projectRoot };
}

function boardRequest(body: unknown): Request {
  return new Request("http://localhost/api/studio/board", {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

async function postBoard(projectRoot: string, body: unknown): Promise<Response> {
  const response = await handleStudioRequest(
    new URL("http://localhost/api/studio/board"),
    boardRequest(body),
    { projectRoot },
  );
  if (response == null) {
    throw new Error("handleStudioRequest returned null for the board endpoint");
  }
  return response;
}

async function getRegistry(projectRoot: string): Promise<Response> {
  const response = await handleStudioRequest(
    new URL("http://localhost/api/studio/registry"),
    new Request("http://localhost/api/studio/registry", { method: "GET" }),
    { projectRoot },
  );
  if (response == null) {
    throw new Error("handleStudioRequest returned null for the registry endpoint");
  }
  return response;
}

function readBoard(boardPath: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(readFileSync(boardPath, "utf8"));
  if (typeof parsed !== "object" || parsed == null || Array.isArray(parsed)) {
    throw new Error("board-state.json did not contain an object");
  }
  return parsed as Record<string, unknown>;
}

// Hermetic default: never let a test silently read a REAL Alexandria
// runtime that happens to be listening on this machine's port 4321.
beforeEach(() => {
  process.env.PMS_ALEXANDRIA_ORIGIN = "http://127.0.0.1:9";
});

afterEach(async () => {
  for (const server of stubAlexandriaServers) {
    server.stop(true);
  }
  stubAlexandriaServers.clear();
  await Promise.all(
    [...servers].map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error != null) {
              reject(error);
              return;
            }
            resolve();
          });
        }),
    ),
  );
  servers.clear();
  for (const dir of tempDirs) {
    rmSync(dir, { force: true, recursive: true });
  }
  tempDirs.clear();
  process.env = { ...originalEnv };
});

describe("studio board write endpoint", () => {
  test("persists stages and a valid ready array symmetrically", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const stages = boardStages({
      built: ["alpha-play"],
      sourced: ["beta-play"],
    });
    const response = await postBoard(projectRoot, {
      cards: testingCardsForStages(stages),
      ready: ["alpha-play", "beta-play"],
      stages,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(typeof body.updated).toBe("string");

    const board = readBoard(boardPath);
    expect(board.ready).toEqual(["alpha-play", "beta-play"]);
    expect(board.stages).toEqual(stages);
    expect(board.cards).toEqual(testingCardsForStages(stages));
    expect(typeof board.updated).toBe("string");
  });

  test("preserves the on-disk ready when the body omits ready", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const existingStages = boardStages({ sourced: ["kept-play"] });
    const existingCards = testingCardsForStages(existingStages);
    writeFileSync(
      boardPath,
      `${JSON.stringify(
        {
          comment: "existing board",
          cards: existingCards,
          ready: ["kept-play"],
          stages: existingStages,
          updated: "2026-01-01",
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    const response = await postBoard(projectRoot, {
      stages: boardStages({ built: ["kept-play"] }),
    });
    expect(response.status).toBe(200);

    const board = readBoard(boardPath);
    expect(board.ready).toEqual(["kept-play"]);
    expect(board.stages).toEqual(boardStages({ built: ["kept-play"] }));
    expect(board.cards).toEqual(existingCards);
    // unrelated existing fields survive the `{ ...existing }` spread.
    expect(board.comment).toBe("existing board");
  });

  test("400s when ready is present but malformed", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();

    const notAnArray = await postBoard(projectRoot, {
      ready: "alpha-play",
      stages: boardStages({ built: ["alpha-play"] }),
    });
    expect(notAnArray.status).toBe(400);

    const emptySlug = await postBoard(projectRoot, {
      ready: ["alpha-play", ""],
      stages: boardStages({ built: ["alpha-play"] }),
    });
    expect(emptySlug.status).toBe(400);

    const nonStringSlug = await postBoard(projectRoot, {
      ready: [1, 2],
      stages: boardStages({ built: ["alpha-play"] }),
    });
    expect(nonStringSlug.status).toBe(400);

    // a malformed ready must not write the board at all.
    expect(existsSync(boardPath)).toBeFalse();
  });

  test("still 400s when stages is malformed", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const response = await postBoard(projectRoot, {
      ready: ["alpha-play"],
      stages: "not-an-object",
    });
    expect(response.status).toBe(400);
    expect(existsSync(boardPath)).toBeFalse();
  });

  test("400s when stages are partial, mistyped, or duplicate slugs", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();

    const partial = await postBoard(projectRoot, {
      stages: { built: ["alpha-play"] },
    });
    expect(partial.status).toBe(400);

    const typo = await postBoard(projectRoot, {
      stages: {
        ...boardStages({ built: ["alpha-play"] }),
        done: [],
      },
    });
    expect(typo.status).toBe(400);

    const duplicate = await postBoard(projectRoot, {
      stages: boardStages({
        built: ["alpha-play"],
        sourced: ["alpha-play"],
      }),
    });
    expect(duplicate.status).toBe(400);

    expect(existsSync(boardPath)).toBeFalse();
  });

  test("400s when ready references a slug that is not on the board", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const response = await postBoard(projectRoot, {
      ready: ["missing-play"],
      stages: boardStages({ built: ["alpha-play"] }),
    });

    expect(response.status).toBe(400);
    expect(existsSync(boardPath)).toBeFalse();
  });

  test("accepts legacy empty as backlog and writes canonical stages", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const response = await postBoard(projectRoot, {
      cards: [testingCard("alpha-play")],
      ready: [],
      stages: legacyBoardStages({ empty: ["alpha-play"] }),
    });

    expect(response.status).toBe(200);
    const board = readBoard(boardPath);
    expect(board.stages).toEqual(boardStages({ backlog: ["alpha-play"] }));
  });

  test("400s when stages include both empty and backlog", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const response = await postBoard(projectRoot, {
      cards: [testingCard("alpha-play")],
      ready: [],
      stages: {
        ...boardStages({ backlog: ["alpha-play"] }),
        empty: [],
      },
    });

    expect(response.status).toBe(400);
    expect(existsSync(boardPath)).toBeFalse();
  });

  test("writes cards and preserves them through a stage-only post", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const firstStages = boardStages({ backlog: ["alpha-play"] });
    const cards = [
      testingCard("alpha-play"),
      improvementCard("wo-alpha-improvement", { play: "alpha-play", status: "in-progress" }),
      bugCard("wo-system-bug"),
    ];

    const created = await postBoard(projectRoot, {
      cards,
      ready: [],
      stages: firstStages,
    });
    expect(created.status).toBe(200);

    const moved = await postBoard(projectRoot, {
      ready: [],
      stages: boardStages({ built: ["alpha-play"] }),
    });
    expect(moved.status).toBe(200);

    const board = readBoard(boardPath);
    expect(board.stages).toEqual(boardStages({ built: ["alpha-play"] }));
    expect(board.cards).toEqual(cards);
  });

  test("stage-only posts preserve invalid historical cards without Testing revalidation", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const stages = boardStages({ backlog: ["alpha-play"] });
    const historicalCards = [improvementCard("wo-alpha-improvement", { play: "alpha-play" })];
    writeFileSync(
      boardPath,
      `${JSON.stringify(
        {
          cards: historicalCards,
          ready: [],
          stages,
          updated: "2026-01-01",
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    const response = await postBoard(projectRoot, {
      ready: [],
      stages: boardStages({ built: ["alpha-play"] }),
    });

    expect(response.status).toBe(200);
    const board = readBoard(boardPath);
    expect(board.stages).toEqual(boardStages({ built: ["alpha-play"] }));
    expect(board.cards).toEqual(historicalCards);
  });

  test("submitted invalid cards still 400 with the validation reason", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const stages = boardStages({ backlog: ["alpha-play"] });

    const response = await postBoard(projectRoot, {
      cards: [improvementCard("wo-alpha-improvement", { play: "alpha-play" })],
      ready: [],
      stages,
    });

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toContain("play alpha-play must have exactly one testing card");
    expect(existsSync(boardPath)).toBeFalse();
  });

  test("merges stale card posts without dropping on-disk cards", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const stages = boardStages({ backlog: ["alpha-play"] });
    const existingCards = [
      testingCard("alpha-play"),
      improvementCard("wo-alpha-improvement", { play: "alpha-play" }),
      bugCard("wo-system-bug"),
    ];
    writeFileSync(
      boardPath,
      `${JSON.stringify(
        {
          cards: existingCards,
          ready: [],
          stages,
          updated: "2026-01-01",
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    const response = await postBoard(projectRoot, {
      cards: [testingCard("alpha-play", { status: "done" })],
      ready: [],
      stages,
    });
    expect(response.status).toBe(200);

    const board = readBoard(boardPath);
    expect(board.stages).toEqual(stages);
    expect(board.cards).toEqual([
      testingCard("alpha-play", { status: "done", terminalAt: todayDateOnly() }),
      improvementCard("wo-alpha-improvement", { play: "alpha-play" }),
      bugCard("wo-system-bug"),
    ]);
  });

  test("400s on duplicate testing cards after merge", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const stages = boardStages({ backlog: ["alpha-play"] });
    writeFileSync(
      boardPath,
      `${JSON.stringify(
        {
          cards: [testingCard("alpha-play")],
          ready: [],
          stages,
          updated: "2026-01-01",
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    const response = await postBoard(projectRoot, {
      cards: [testingCard("alpha-play", { id: "wo-alpha-play-testing-second" })],
      ready: [],
      stages,
    });

    expect(response.status).toBe(400);
    expect(readBoard(boardPath).cards).toEqual([testingCard("alpha-play")]);
  });

  test("400s on malformed cards", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const stages = boardStages({ backlog: ["alpha-play"] });

    const missingChecklist = await postBoard(projectRoot, {
      cards: [testingCard("alpha-play", { checklist: undefined })],
      ready: [],
      stages,
    });
    expect(missingChecklist.status).toBe(400);

    const unknownPlay = await postBoard(projectRoot, {
      cards: [testingCard("ghost-play")],
      ready: [],
      stages,
    });
    expect(unknownPlay.status).toBe(400);

    const nonTestingChecklist = await postBoard(projectRoot, {
      cards: [
        testingCard("alpha-play"),
        improvementCard("wo-alpha-improvement", {
          checklist: [{ done: false, text: "not allowed" }],
          play: "alpha-play",
        }),
      ],
      ready: [],
      stages,
    });
    expect(nonTestingChecklist.status).toBe(400);
    expect(existsSync(boardPath)).toBeFalse();
  });

  test("card status updates do not change play stages", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const stages = boardStages({ sourced: ["alpha-play"] });
    const response = await postBoard(projectRoot, {
      cards: [testingCard("alpha-play", { status: "done" })],
      ready: [],
      stages,
    });

    expect(response.status).toBe(200);
    const board = readBoard(boardPath);
    expect(board.stages).toEqual(stages);
    expect(board.cards).toEqual([
      testingCard("alpha-play", { status: "done", terminalAt: todayDateOnly() }),
    ]);
  });

  test("accepts wont-do and card archive lifecycle fields", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const stages = boardStages({ backlog: ["alpha-play"] });
    const card = testingCard("alpha-play", {
      archived: true,
      pinned: false,
      status: "wont-do",
      terminalAt: "2026-06-24",
    });

    const response = await postBoard(projectRoot, {
      cards: [card],
      ready: [],
      stages,
    });

    expect(response.status).toBe(200);
    const board = readBoard(boardPath);
    expect(board.cards).toEqual([card]);
    expect("archive" in board).toBeFalse();
  });

  test("terminal statuses set terminalAt and reopening clears it", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const stages = boardStages({ backlog: ["alpha-play"] });

    const done = await postBoard(projectRoot, {
      cards: [testingCard("alpha-play", { status: "done" })],
      ready: [],
      stages,
    });
    expect(done.status).toBe(200);
    expect(readBoard(boardPath).cards).toEqual([
      testingCard("alpha-play", { status: "done", terminalAt: todayDateOnly() }),
    ]);

    const reopened = await postBoard(projectRoot, {
      cards: [
        testingCard("alpha-play", {
          status: "in-progress",
          terminalAt: "2026-01-01",
        }),
      ],
      ready: [],
      stages,
    });
    expect(reopened.status).toBe(200);
    expect(readBoard(boardPath).cards).toEqual([
      testingCard("alpha-play", { status: "in-progress" }),
    ]);

    const wontDo = await postBoard(projectRoot, {
      cards: [testingCard("alpha-play", { status: "wont-do" })],
      ready: [],
      stages,
    });
    expect(wontDo.status).toBe(200);
    expect(readBoard(boardPath).cards).toEqual([
      testingCard("alpha-play", { status: "wont-do", terminalAt: todayDateOnly() }),
    ]);
  });

  test("terminal-to-terminal status changes preserve terminalAt", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const stages = boardStages({ backlog: ["alpha-play"] });
    writeFileSync(
      boardPath,
      `${JSON.stringify(
        {
          cards: [testingCard("alpha-play", { status: "done", terminalAt: "2026-06-01" })],
          ready: [],
          stages,
          updated: "2026-06-01",
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    const response = await postBoard(projectRoot, {
      cards: [testingCard("alpha-play", { status: "wont-do" })],
      ready: [],
      stages,
    });

    expect(response.status).toBe(200);
    expect(readBoard(boardPath).cards).toEqual([
      testingCard("alpha-play", { status: "wont-do", terminalAt: "2026-06-01" }),
    ]);
  });

  test("legacy terminal cards use created as terminalAt when resaved terminal-to-terminal", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const stages = boardStages({ backlog: ["alpha-play"] });
    writeFileSync(
      boardPath,
      `${JSON.stringify(
        {
          cards: [testingCard("alpha-play", { status: "done" })],
          ready: [],
          stages,
          updated: "2026-06-01",
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    const response = await postBoard(projectRoot, {
      cards: [testingCard("alpha-play", { status: "wont-do" })],
      ready: [],
      stages,
    });

    expect(response.status).toBe(200);
    expect(readBoard(boardPath).cards).toEqual([
      testingCard("alpha-play", { status: "wont-do", terminalAt: "2026-06-23" }),
    ]);
  });

  test("status-change persists by id and repeated writes do not duplicate cards", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const stages = boardStages({ backlog: ["alpha-play"] });
    writeFileSync(
      boardPath,
      `${JSON.stringify(
        {
          cards: [testingCard("alpha-play")],
          ready: [],
          stages,
          updated: "2026-06-01",
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
    const body = {
      cards: [testingCard("alpha-play", { status: "done" })],
      ready: [],
      stages,
    };

    const first = await postBoard(projectRoot, body);
    expect(first.status).toBe(200);
    const once = readBoard(boardPath);
    expect(
      (once.cards as unknown[]).filter(
        (card) => (card as { id?: string }).id === "wo-alpha-play-testing",
      ),
    ).toHaveLength(1);

    const second = await postBoard(projectRoot, body);
    expect(second.status).toBe(200);
    const twice = readBoard(boardPath);
    expect(
      (twice.cards as unknown[]).filter(
        (card) => (card as { id?: string }).id === "wo-alpha-play-testing",
      ),
    ).toHaveLength(1);
    expect(twice.cards).toEqual([
      testingCard("alpha-play", { status: "done", terminalAt: todayDateOnly() }),
    ]);
  });

  test("graduating a play removes it from stages and ready while retaining cards", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    const stages = boardStages({ live: ["alpha-play"] });
    writeFileSync(
      boardPath,
      `${JSON.stringify(
        {
          cards: [testingCard("alpha-play")],
          ready: ["alpha-play"],
          stages,
          updated: "2026-06-01",
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    const graduated = await postBoard(projectRoot, {
      graduated: ["alpha-play", "alpha-play"],
      ready: ["alpha-play"],
      stages,
    });

    expect(graduated.status).toBe(200);
    const board = readBoard(boardPath);
    expect(board.graduated).toEqual(["alpha-play"]);
    expect(board.graduatedAt).toEqual({ "alpha-play": todayDateOnly() });
    expect(board.ready).toEqual([]);
    expect(board.stages).toEqual(boardStages({}));
    expect(board.cards).toEqual([testingCard("alpha-play")]);
  });

  test("graduatedAt preserves existing dates and prunes stale submitted dates", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    writeFileSync(
      boardPath,
      `${JSON.stringify(
        {
          cards: [testingCard("alpha-play")],
          graduated: ["alpha-play"],
          graduatedAt: {
            "alpha-play": "2026-06-01",
          },
          ready: [],
          stages: boardStages({}),
          updated: "2026-06-01",
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    const response = await postBoard(projectRoot, {
      graduated: ["alpha-play"],
      graduatedAt: {
        "alpha-play": "2026-06-01",
        // A malformed date on a stale slug must be pruned, not rejected: the
        // save does not keep this slug, so its date is irrelevant.
        "stale-play": "not-a-date",
      },
      ready: [],
      stages: boardStages({}),
    });

    expect(response.status).toBe(200);
    const board = readBoard(boardPath);
    expect(board.graduated).toEqual(["alpha-play"]);
    expect(board.graduatedAt).toEqual({ "alpha-play": "2026-06-01" });
  });

  test("a malformed date on a graduated slug still 400s", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();

    const response = await postBoard(projectRoot, {
      cards: [testingCard("alpha-play")],
      graduated: ["alpha-play"],
      graduatedAt: { "alpha-play": "not-a-date" },
      ready: [],
      stages: boardStages({}),
    });

    expect(response.status).toBe(400);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toContain("body.graduatedAt.alpha-play must be YYYY-MM-DD");
    expect(existsSync(boardPath)).toBeFalse();
  });

  test("restoring a graduated play moves it back to live", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    writeFileSync(
      boardPath,
      `${JSON.stringify(
        {
          cards: [testingCard("alpha-play")],
          graduated: ["alpha-play"],
          graduatedAt: { "alpha-play": "2026-06-01" },
          ready: [],
          stages: boardStages({}),
          updated: "2026-06-01",
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    const restored = await postBoard(projectRoot, {
      graduated: [],
      ready: [],
      stages: boardStages({ live: ["alpha-play"] }),
    });

    expect(restored.status).toBe(200);
    const board = readBoard(boardPath);
    expect(board.graduated).toEqual([]);
    expect(board.graduatedAt).toEqual({});
    expect(board.stages).toEqual(boardStages({ live: ["alpha-play"] }));
    expect(board.cards).toEqual([testingCard("alpha-play")]);
  });
});

describe("studio registry endpoint", () => {
  test("returns divisions, rungs, and the unchanged board payload", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    writeFileSync(
      join(projectRoot, "studio", "plays", "registry.js"),
      `
const COMPANY = "Alexandria_Prime";
const DIVISIONS = {
  Product: {
    face: "Raven",
    functions: ["Insight", "Strategy", "Definition", "Delivery", "Launch", "Analytics", "Communication", "Operations", "Library Operations"],
  },
  PlaymakerStudio: {
    face: "William",
    functions: ["Production", "Proving", "Operations", "Library Operations"],
  },
};
const RUNGS = [
  {
    n: 1,
    name: "Frame the Problem",
    slug: "frame-the-problem",
    glyph: "F",
    division: "Product",
    function: "Insight",
    tier: "PM",
    prio: "core",
    status: "registered",
  },
  {
    n: "PS1",
    name: "Make a Play",
    slug: "make-a-play",
    glyph: "M",
    division: "PlaymakerStudio",
    function: "Production",
    tier: "Coordinator",
    prio: "studio",
    status: "slot",
  },
];
`,
      "utf8",
    );
    const boardPayload = {
      ready: ["frame-the-problem"],
      stages: boardStages({ proven: ["frame-the-problem"] }),
      updated: "2026-06-23",
    };
    writeFileSync(boardPath, `${JSON.stringify(boardPayload, null, 2)}\n`, "utf8");

    const response = await getRegistry(projectRoot);
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      board: unknown;
      company?: { name: string };
      divisions: Record<string, { face: string; functions: string[] }>;
      rungs: Array<{
        division?: string;
        function?: string;
        glyph?: string;
        name: string;
        slug: string;
        tier?: string;
      }>;
    };
    expect(body.board).toEqual(boardPayload);
    expect(body.company).toEqual({ name: "Alexandria_Prime" });
    expect(body.divisions.Product?.face).toBe("Raven");
    expect(body.divisions.PlaymakerStudio?.functions).toEqual([
      "Production",
      "Proving",
      "Operations",
      "Library Operations",
    ]);
    expect(body.rungs).toHaveLength(2);
    expect(body.rungs[0]).toMatchObject({
      division: "Product",
      function: "Insight",
      glyph: "F",
      name: "Frame the Problem",
      slug: "frame-the-problem",
      tier: "PM",
    });
  });

  test("tolerates a registry.js that predates DIVISIONS without 500ing", async () => {
    const { projectRoot } = makeProjectWithStudio();
    writeFileSync(
      join(projectRoot, "studio", "plays", "registry.js"),
      `const RUNGS = [{ n: 1, name: "Frame the Problem", slug: "frame-the-problem" }];\n`,
      "utf8",
    );

    const response = await getRegistry(projectRoot);
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      company?: unknown;
      divisions: unknown;
      rungs: unknown[];
    };
    expect("company" in body).toBeFalse();
    expect(body.divisions).toEqual({});
    expect(body.rungs).toHaveLength(1);
  });

  test("decorates rungs with built-by projected from play.provenance_recorded", async () => {
    const { boardPath, projectRoot } = makeProjectWithStudio();
    writeFileSync(
      join(projectRoot, "studio", "plays", "registry.js"),
      `
const DIVISIONS = { PlaymakerStudio: { face: "William", functions: ["Production", "Proving", "Operations", "Library Operations"] } };
const RUNGS = [
  { n: "PS1", name: "Make a Play", slug: "make-a-play", division: "PlaymakerStudio", function: "Production", prio: "studio", status: "built" },
  { n: 1, name: "Frame the Problem", slug: "frame-the-problem", division: "Product", function: "Insight", prio: "core", status: "registered" },
];
`,
      "utf8",
    );
    writeFileSync(
      boardPath,
      `${JSON.stringify({ stages: boardStages({}), updated: "2026-06-23" }, null, 2)}\n`,
      "utf8",
    );
    // Seed a PMS provenance record — after the boundary migration, new
    // built-by facts live under studio/records/provenance (Alexandria's
    // ledger history arrives via the public API and is absent here).
    mkdirSync(join(projectRoot, "studio", "records", "provenance"), { recursive: true });
    writeFileSync(
      join(projectRoot, "studio", "records", "provenance", "make-a-play-built-by.json"),
      `${JSON.stringify({
        actor: { kind: "process", id: "pms" },
        at: new Date(Date.now() - 10_000).toISOString(),
        idempotencyKey: "make-a-play:frame-the-problem:01RUNMAKEAPLAY:built-by",
        payload: {
          factoryAgent: "William",
          factoryDivision: "PlaymakerStudio",
          factoryFunction: "Production",
          playId: "make-a-play",
          playRunId: "01RUNMAKEAPLAY",
          producedByPlayId: "make-a-play",
        },
        type: "play.provenance_recorded",
      })}\n`,
    );

    const response = await getRegistry(projectRoot);
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      rungs: Array<{
        builtBy?: { agent: string; division: string; function: string };
        slug: string;
      }>;
    };
    const makeAPlay = body.rungs.find((rung) => rung.slug === "make-a-play");
    const frame = body.rungs.find((rung) => rung.slug === "frame-the-problem");
    expect(makeAPlay?.builtBy).toEqual({
      agent: "William",
      division: "PlaymakerStudio",
      function: "Production",
    });
    // A play with no provenance event carries no built-by decoration.
    expect(frame?.builtBy).toBeUndefined();
  });
});

describe("studio validate endpoint", () => {
  async function getValidate(projectRoot: string, slug: string): Promise<Response> {
    const url = new URL(`http://localhost/api/studio/plays/${slug}/validate`);
    const response = await handleStudioRequest(
      url,
      new Request(url.toString(), { method: "GET" }),
      {
        projectRoot,
      },
    );
    if (response == null) {
      throw new Error("handleStudioRequest returned null for the validate endpoint");
    }
    return response;
  }

  // The fabro-invocation success path is environment-dependent (needs the
  // binary) and is covered by the viewer's preflight tests + live verification;
  // here we assert the deterministic guards that never shell out.
  test("404s when the play has no workflow.fabro", async () => {
    const { projectRoot } = makeProjectWithStudio();
    mkdirSync(join(projectRoot, "studio", "plays", "some-play"), { recursive: true });
    const response = await getValidate(projectRoot, "some-play");
    expect(response.status).toBe(404);
  });

  test("404s when the play directory does not exist", async () => {
    const { projectRoot } = makeProjectWithStudio();
    const response = await getValidate(projectRoot, "ghost-play");
    expect(response.status).toBe(404);
  });
});

function writeExecutable(path: string, content: string): void {
  writeFileSync(path, content, { mode: 0o755 });
}

function shellSingleQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

async function getActiveRuns(projectRoot: string): Promise<Response> {
  const response = await handleStudioRequest(
    new URL("http://localhost/api/studio/runs"),
    new Request("http://localhost/api/studio/runs"),
    { projectRoot },
  );
  if (response == null) {
    throw new Error("handleStudioRequest returned null for the active-runs endpoint");
  }
  return response;
}

async function getRunEvents(projectRoot: string, runId: string): Promise<Response> {
  const response = await handleStudioRequest(
    new URL(`http://localhost/api/studio/runs/${runId}/events`),
    new Request(`http://localhost/api/studio/runs/${runId}/events`),
    { projectRoot },
  );
  if (response == null) {
    throw new Error("handleStudioRequest returned null for the run-events endpoint");
  }
  return response;
}

async function listenOnUnixSocket(socketPath: string, handler: RequestListener): Promise<Server> {
  const server = createServer(handler);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(socketPath, () => {
      server.off("error", reject);
      resolve();
    });
  });
  servers.add(server);
  return server;
}

// Stub Alexandria runtimes: after the boundary migration (Slice 2) the
// studio server reads Alexandria state through the PUBLIC runtime API, so
// these tests serve /api/state from a throwaway HTTP server and point
// PMS_ALEXANDRIA_ORIGIN at it. The origin env is restored by afterEach.
const stubAlexandriaServers = new Set<ReturnType<typeof Bun.serve>>();

function serveAlexandriaState(projectRoot: string, state: Record<string, unknown>): void {
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: (request) => {
      const url = new URL(request.url);
      if (url.pathname === "/api/state") {
        return Response.json({
          workspace: { path: join(projectRoot, "docs", "alexandria") },
          ...state,
        });
      }
      return new Response("not found", { status: 404 });
    },
  });
  stubAlexandriaServers.add(server);
  process.env.PMS_ALEXANDRIA_ORIGIN = `http://127.0.0.1:${server.port}`;
}

function serveAlexandriaRun(projectRoot: string, options: { blocked?: boolean } = {}): void {
  serveAlexandriaState(projectRoot, {
    playbook: { plays: [{ id: "source-assessment", name: "Source Assessment" }] },
    playRuns: [
      {
        fabroRunId: "01LEDGER",
        playId: "source-assessment",
        playRunId: "play-run-1",
        status: options.blocked ? "needs_human_feedback" : "running",
      },
    ],
  });
}

function serveAlexandriaReviewRun(projectRoot: string, fabroRunId: string): void {
  serveAlexandriaState(projectRoot, {
    playbook: { plays: [] },
    playRuns: [
      {
        fabroRunId,
        playId: "make-a-play",
        playRunId: "review-run-1",
        review: {
          compositionId: "make-a-play:review:medium",
          gateSeams: ["harden", "derive", "run"],
          gates: [
            {
              afterStep: "harden",
              confirmedAt: "2026-07-01T00:00:00.000Z",
              confirmedBy: "auto",
              gateId: "gate_1_confirm_design",
              questionId: "gate_1_confirm_design",
              status: "confirmed",
            },
            {
              afterStep: "derive",
              confirmedAt: "2026-07-01T00:01:00.000Z",
              confirmedBy: "director",
              gateId: "review_after_derive",
              questionId: "review_after_derive",
              status: "confirmed",
            },
            { afterStep: "run", gateId: "gate_2_confirm_proven", status: "pending" },
          ],
          label: "Medium Review",
          level: "medium",
        },
        status: "running",
      },
    ],
  });
}

describe("studio active runs endpoint", () => {
  test("returns active runs from the Alexandria runtime projection", async () => {
    const { projectRoot } = makeProjectWithStudio();
    serveAlexandriaRun(projectRoot);

    const response = await getActiveRuns(projectRoot);
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      runs: Array<{ playId: string; runId: string; status: string; trackerPath: string }>;
      source: string;
    };
    expect(body.source).toBe("projection");
    expect(body.runs.map((run) => run.runId)).toEqual(["01LEDGER"]);
    expect(body.runs[0]?.status).toBe("running");
    expect(body.runs[0]?.playId).toBe("source-assessment");
    expect(body.runs[0]?.trackerPath).toBe("/?tab=tracker&run=01LEDGER");
  });

  test("surfaces a run blocked on human input as needs_human_feedback", async () => {
    const { projectRoot } = makeProjectWithStudio();
    serveAlexandriaRun(projectRoot, { blocked: true });

    const response = await getActiveRuns(projectRoot);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { runs: Array<{ runId: string; status: string }> };
    expect(body.runs.map((run) => run.runId)).toEqual(["01LEDGER"]);
    expect(body.runs[0]?.status).toBe("needs_human_feedback");
  });

  test("degrades to an empty list with a warning when Alexandria is unreachable", async () => {
    // No Alexandria runtime at the configured origin — the studio surface must
    // stay up with an empty runs list and say why, not fail.
    const { projectRoot } = makeProjectWithStudio();
    process.env.PMS_ALEXANDRIA_ORIGIN = "http://127.0.0.1:9";

    const response = await getActiveRuns(projectRoot);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { runs: unknown[]; warning?: string };
    expect(body.runs).toEqual([]);
    expect(body.warning).toContain("unreachable");
  });

  test("degrades when the runtime's workspace merely extends the project root path", async () => {
    // …/proj vs …/proj-worktree: separator-less prefix matching would leak
    // the sibling checkout's runs into this project's tracker.
    const { projectRoot } = makeProjectWithStudio();
    serveAlexandriaState(`${projectRoot}-worktree`, {
      playRuns: [{ fabroRunId: "01OTHER", playId: "source-assessment", status: "running" }],
    });

    const response = await getActiveRuns(projectRoot);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { runs: unknown[]; warning?: string };
    expect(body.runs).toEqual([]);
    expect(body.warning).toContain("different project");
  });
});

describe("studio run events endpoint", () => {
  test("returns raw run state as inspect projection when fabro inspect returns a wrapper", async () => {
    const { projectRoot } = makeProjectWithStudio();
    serveAlexandriaReviewRun(projectRoot, "01STATE");
    const toolDir = mkdtempSync(join(tmpdir(), "ax-studio-tools-"));
    tempDirs.add(toolDir);
    const socketPath = join(toolDir, "fabro.sock");
    const runProjection = {
      checkpoints: [],
      conclusion: null,
      last_event_at: "2026-06-18T12:00:00.000Z",
      pending_control: null,
      pending_interviews: {},
      pull_request: null,
      sandbox: null,
      spec: {
        graph: {
          edges: [
            { attrs: {}, from: "start", to: "assess" },
            { attrs: { label: "Done" }, from: "assess", to: "exit" },
          ],
          name: "SourceAssessment",
          nodes: {
            assess: { attrs: { label: "Assess source material", type: "agent" }, id: "assess" },
            exit: { attrs: { label: "Exit", shape: "Msquare" }, id: "exit" },
            start: { attrs: { label: "Start", shape: "Mdiamond" }, id: "start" },
          },
        },
        run_id: "01STATE",
        workflow_slug: "source-assessment",
      },
      stages: {
        "assess@1": {
          first_event_seq: 1,
          started_at: "2026-06-18T11:59:00.000Z",
          state: "running",
        },
      },
      start: null,
      status: { kind: "running" },
      status_updated_at: "2026-06-18T12:00:00.000Z",
      superseded_by: null,
      title: "Source Assessment",
    };
    await listenOnUnixSocket(socketPath, (request, response) => {
      if (request.url === "/api/v1/runs/01STATE/state") {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify(runProjection));
        return;
      }
      response.writeHead(404, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "not found" }));
    });

    const inspectWrapper = [
      {
        checkpoint: { completed_nodes: [], current_node: "assess", node_visits: { assess: 1 } },
        conclusion: null,
        parent_id: null,
        run_id: "01STATE",
        run_spec: {
          graph: {
            edges: [],
            name: "WrapperOnly",
            nodes: {},
          },
          run_id: "01STATE",
          workflow_slug: "source-assessment",
        },
        sandbox: null,
        start_record: null,
        status: { kind: "running" },
      },
    ];
    const fakeFabro = join(toolDir, "fabro");
    writeExecutable(
      fakeFabro,
      `#!/bin/sh
if [ "$1" = "server" ] && [ "$2" = "status" ]; then
  printf '%s\\n' ${shellSingleQuote(JSON.stringify({ bind: { unix: socketPath }, pid: 123 }))}
  exit 0
fi
if [ "$1" = "inspect" ]; then
  printf '%s\\n' ${shellSingleQuote(JSON.stringify(inspectWrapper))}
  exit 0
fi
if [ "$1" = "events" ]; then
  printf 'run 01STATE created\\nstage assess@1 running\\n'
  exit 0
fi
exit 2
`,
    );
    process.env.ALEXANDRIA_FABRO_BIN = fakeFabro;
    process.env.ALEXANDRIA_HOME = join(toolDir, "runtime");

    const response = await getRunEvents(projectRoot, "01STATE");
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      events: string[];
      inspect: unknown;
      inspectError: string | null;
      review: null | {
        compositionId: string;
        gates: Array<{
          afterStep: string;
          confirmedAt?: string;
          confirmedBy?: "director" | "auto";
          gateId: string;
          questionId?: string;
          status: string;
        }>;
        label: string;
        level: string;
      };
      runId: string;
    };
    expect(body.runId).toBe("01STATE");
    expect(body.inspectError).toBeNull();
    expect(body.events).toContain("stage assess@1 running");
    expect(Array.isArray(body.inspect)).toBeTrue();
    if (!Array.isArray(body.inspect)) {
      throw new Error("inspect should be an array");
    }
    const first = body.inspect[0] as {
      run_spec?: unknown;
      spec?: { workflow_slug?: string };
      stages?: Record<string, { state?: string }>;
    };
    expect(first.run_spec).toBeUndefined();
    expect(first.spec?.workflow_slug).toBe("source-assessment");
    expect(first.stages?.["assess@1"]?.state).toBe("running");
    expect(body.review).toMatchObject({
      compositionId: "make-a-play:review:medium",
      label: "Medium Review",
      level: "medium",
    });
    expect(body.review?.gates).toEqual([
      {
        afterStep: "harden",
        confirmedAt: expect.any(String),
        confirmedBy: "auto",
        gateId: "gate_1_confirm_design",
        questionId: "gate_1_confirm_design",
        status: "confirmed",
      },
      {
        afterStep: "derive",
        confirmedAt: expect.any(String),
        confirmedBy: "director",
        gateId: "review_after_derive",
        questionId: "review_after_derive",
        status: "confirmed",
      },
      { afterStep: "run", gateId: "gate_2_confirm_proven", status: "pending" },
    ]);
  });
});
