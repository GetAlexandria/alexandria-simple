import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, renameSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { handleStudioRequest } from "../src/server/studio-api.js";
import { deriveStudioPlayComposition } from "../src/server/studio-play-composition.js";

const tempDirs = new Set<string>();

function makeProject(): { playDir: string; projectRoot: string; studioRoot: string } {
  const projectRoot = mkdtempSync(join(tmpdir(), "ax-studio-composition-"));
  tempDirs.add(projectRoot);
  const studioRoot = join(projectRoot, "studio");
  const playDir = join(studioRoot, "plays", "make-a-play");
  mkdirSync(playDir, { recursive: true });
  return { playDir, projectRoot, studioRoot };
}

function workflow(name: string, nodes: readonly string[]): string {
  const nodeLines = nodes.map((node) => `    ${node} [label="${node}"]`).join("\n");
  const edgeLines = [
    `    start -> ${nodes[0] ?? "exit"}`,
    ...nodes.slice(0, -1).map((node, index) => `    ${node} -> ${nodes[index + 1]}`),
    `    ${nodes[nodes.length - 1] ?? "start"} -> exit`,
  ].join("\n");
  return `digraph ${name} {
    start [shape=Mdiamond, label="Start"]
    exit [shape=Msquare, label="Exit"]
${nodeLines}
${edgeLines}
}
`;
}

function writeModule(options: {
  legs?: Record<string, unknown>;
  module: "build" | "design" | "prove";
  nodes: readonly string[];
  playDir: string;
}): void {
  const moduleDir = join(options.playDir, "modules", options.module);
  mkdirSync(moduleDir, { recursive: true });
  writeFileSync(
    join(moduleDir, "workflow.fabro"),
    workflow(`MakeAPlay${options.module}`, options.nodes),
    "utf8",
  );
  if (options.legs != null) {
    writeFileSync(
      join(moduleDir, "legs.json"),
      `${JSON.stringify(options.legs, null, 2)}\n`,
      "utf8",
    );
  }
}

function legs(playId: string, nodeId: string, label: string): Record<string, unknown> {
  return {
    legs: [
      {
        kind: "agent",
        label,
        nodeId,
        typicalSeconds: 60,
      },
    ],
    playId,
  };
}

function writeMakeAPlayFixture(playDir: string): void {
  writeModule({
    legs: legs("make-a-play:design", "ground", "Ground"),
    module: "design",
    nodes: ["ground", "gate_design"],
    playDir,
  });
  writeModule({
    legs: legs("make-a-play:build", "derive", "Derive"),
    module: "build",
    nodes: ["derive", "lint"],
    playDir,
  });
  writeModule({
    legs: legs("make-a-play:prove", "run_campaign", "Run Campaign"),
    module: "prove",
    nodes: ["run_campaign", "grade"],
    playDir,
  });
  mkdirSync(join(playDir, "gates"), { recursive: true });
  writeFileSync(
    join(playDir, "gates", "gate-1.json"),
    `${JSON.stringify(
      {
        basis: "approved plan",
        decidedAt: "2026-06-23",
        decidedBy: "director",
        decision: "approved",
        gate: "gate-1",
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  writeFileSync(join(playDir, "gates", "gate-1-review.md"), "# Gate 1 Review\n", "utf8");
}

async function getComposition(projectRoot: string, slug: string): Promise<Response> {
  const url = new URL(`http://localhost/api/studio/plays/${slug}/composition`);
  const response = await handleStudioRequest(url, new Request(url.toString(), { method: "GET" }), {
    projectRoot,
  });
  if (response == null) {
    throw new Error("handleStudioRequest returned null for composition endpoint");
  }
  return response;
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { force: true, recursive: true });
  }
  tempDirs.clear();
});

describe("deriveStudioPlayComposition", () => {
  test("orders make-a-play modules by manifest and derives moves, legs, and gates", async () => {
    const { playDir, studioRoot } = makeProject();
    writeMakeAPlayFixture(playDir);

    const composition = await deriveStudioPlayComposition(studioRoot, "make-a-play");

    expect(composition.modules.map((module) => module.label)).toEqual(["Design", "Build", "Prove"]);
    expect(composition.modules.map((module) => module.playId)).toEqual([
      "make-a-play:design",
      "make-a-play:build",
      "make-a-play:prove",
    ]);
    expect(composition.modules[0]?.moves.map((move) => move.nodeId)).toEqual([
      "ground",
      "gate_design",
    ]);
    expect(composition.modules[0]?.trackerLegs.map((leg) => leg.label)).toEqual(["Ground"]);
    expect(composition.gates).toHaveLength(1);
    expect(composition.gates[0]).toMatchObject({
      afterModuleOrdinal: 1,
      decidedBy: "director",
      decision: "approved",
      id: "gate-1",
      label: "Gate 1",
    });
    expect(composition.gates[0]?.files.json?.path).toBe("gates/gate-1.json");
    expect(composition.gates[0]?.files.review?.path).toBe("gates/gate-1-review.md");
  });

  test("changes the module list when a module workflow is renamed", async () => {
    const { playDir, studioRoot } = makeProject();
    writeMakeAPlayFixture(playDir);
    renameSync(
      join(playDir, "modules", "build", "workflow.fabro"),
      join(playDir, "modules", "build", "workflow.fabro.off"),
    );

    const composition = await deriveStudioPlayComposition(studioRoot, "make-a-play");

    expect(composition.modules.map((module) => module.label)).toEqual(["Design", "Prove"]);
  });

  test("drops invalid tracker legs without dropping the module graph", async () => {
    const { playDir, studioRoot } = makeProject();
    writeModule({
      legs: legs("make-a-play:build", "ground", "wrong play id"),
      module: "design",
      nodes: ["ground"],
      playDir,
    });

    const composition = await deriveStudioPlayComposition(studioRoot, "make-a-play");

    expect(composition.modules).toHaveLength(1);
    expect(composition.modules[0]?.moves.map((move) => move.nodeId)).toEqual(["ground"]);
    expect(composition.modules[0]?.trackerLegs).toEqual([]);
    expect(composition.modules[0]?.trackerLegsWarning).toContain("must set playId");
  });

  test("returns no modules for a single play", async () => {
    const { studioRoot } = makeProject();
    mkdirSync(join(studioRoot, "plays", "frame-the-problem"), { recursive: true });

    const composition = await deriveStudioPlayComposition(studioRoot, "frame-the-problem");

    expect(composition).toEqual({
      gates: [],
      modules: [],
      slug: "frame-the-problem",
    });
  });
});

describe("studio composition endpoint", () => {
  test("serves the derived composition response", async () => {
    const { playDir, projectRoot } = makeProject();
    writeMakeAPlayFixture(playDir);

    const response = await getComposition(projectRoot, "make-a-play");
    const body = (await response.json()) as {
      modules: Array<{ label: string; moves: Array<{ nodeId: string }> }>;
      slug: string;
    };

    expect(response.status).toBe(200);
    expect(body.slug).toBe("make-a-play");
    expect(body.modules.map((module) => module.label)).toEqual(["Design", "Build", "Prove"]);
    expect(body.modules[0]?.moves[0]?.nodeId).toBe("ground");
  });
});
