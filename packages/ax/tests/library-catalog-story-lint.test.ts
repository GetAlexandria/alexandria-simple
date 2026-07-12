import { describe, expect, test } from "bun:test";
import { mkdirSync, writeFileSync } from "fs";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Effect } from "effect";
import { NodeFileSystem } from "../src/effects/filesystem.js";
import { runLibraryCatalogStoryLint } from "../src/tools/library-catalog-story-lint.js";

const testDir = dirname(fileURLToPath(import.meta.url));

interface CardInput {
  altitude?: string;
  body: string;
  connectors?: string[];
  fileStem: string;
  flow?: string[];
  links?: Record<string, string[]>;
  prefLabel: string;
  type: string;
}

function writeCard(root: string, input: CardInput): void {
  const lines = [
    "---",
    `type: ${input.type}`,
    `prefLabel: "${input.prefLabel}"`,
    "plane: Product",
    "context: board",
    ...(input.altitude == null ? [] : [`altitude: ${input.altitude}`]),
    "status: stub",
    "confidence: medium",
  ];

  if (input.connectors != null && input.connectors.length > 0) {
    lines.push("connectors:");
    for (const connector of input.connectors) {
      lines.push(`  - "${connector}"`);
    }
  }

  if (input.links != null && Object.keys(input.links).length > 0) {
    lines.push("links:");
    for (const [key, values] of Object.entries(input.links)) {
      lines.push(`  ${key}:`);
      for (const value of values) {
        lines.push(`    - "${value}"`);
      }
    }
  }

  if (input.flow != null && input.flow.length > 0) {
    lines.push("flow:");
    for (const stage of input.flow) {
      lines.push(`  - ${stage}`);
    }
  }

  lines.push("proposed_by: scanner", "source_evidence:", "  - fixture.md", "---", "", input.body);

  writeFileSync(join(root, "studio/library/board", `${input.fileStem}.md`), lines.join("\n"));
}

function makeProject(): string {
  const cwd = mkdtempSync(join(tmpdir(), "ax-story-lint-"));
  mkdirSync(join(cwd, "studio/library/board"), { recursive: true });
  writeFileSync(
    join(cwd, "studio/library/library.json"),
    JSON.stringify({ schemaVersion: "product-card.v1" }, null, 2),
  );
  writeCard(cwd, {
    altitude: "pillar",
    body: `## WHAT
What it does. The Work Board keeps play-making visible.

How it does it. It moves each play through [[Stage]] and records position in [[Board State]] from the [[Play Registry]].`,
    fileStem: "Aggregate - Board",
    links: {
      contains: ["[[Read-Model - Play Registry]]", "[[Aggregate - Board State]]"],
      operates_on: ["[[Value - Stage]]"],
    },
    prefLabel: "Work Board",
    type: "Aggregate",
  });
  writeCard(cwd, {
    altitude: "aggregate",
    body: `## WHAT
_Stub —_ Board State records the [[Work Board]] positions.`,
    fileStem: "Aggregate - Board State",
    prefLabel: "Board State",
    type: "Aggregate",
  });
  writeCard(cwd, {
    altitude: "value",
    body: `## WHAT
What it does. Stage describes the column.

How it does it. Stage is Backlog → Sourced and writes to [[Board State]].`,
    fileStem: "Value - Stage",
    flow: ["Backlog", "Sourced"],
    prefLabel: "Stage",
    type: "Value",
  });
  writeCard(cwd, {
    altitude: "component",
    body: `## WHAT
What it does. Play Registry gives each play one identity.

How it does it. The [[Work Board]] and [[Board State]] read identity from it.`,
    fileStem: "Read-Model - Play Registry",
    links: {
      produces: ["[[Aggregate - Board]]", "[[Aggregate - Board State]]"],
    },
    prefLabel: "Play Registry",
    type: "Read-Model",
  });
  return cwd;
}

async function runStoryLint(cwd: string, extraArgs: readonly string[] = []) {
  return Effect.runPromise(
    runLibraryCatalogStoryLint(["--library-root", "studio/library", ...extraArgs], cwd).pipe(
      Effect.provide(NodeFileSystem),
    ),
  );
}

function makeOrphanProject(): string {
  const cwd = makeProject();
  writeCard(cwd, {
    body: `## WHAT
_Stub —_ Status is intentionally unreferenced in this fixture.`,
    fileStem: "Value - Status",
    prefLabel: "Status",
    type: "Value",
  });
  return cwd;
}

function makeRetiredConnectorProject(): string {
  const cwd = makeProject();
  // Re-emit the lead card verbatim but with the retired `connectors:` field, so
  // the only violation is the retired-connector metadata issue — no orphan
  // confound (a lead is never an orphan) and the story still names Stage, so no
  // diagram-parity violation either.
  writeCard(cwd, {
    altitude: "pillar",
    body: `## WHAT
What it does. The Work Board keeps play-making visible.

How it does it. It moves each play through [[Stage]] and records position in [[Board State]] from the [[Play Registry]].`,
    connectors: ["moves through -> Stage"],
    fileStem: "Aggregate - Board",
    links: {
      contains: ["[[Read-Model - Play Registry]]", "[[Aggregate - Board State]]"],
      operates_on: ["[[Value - Stage]]"],
    },
    prefLabel: "Work Board",
    type: "Aggregate",
  });
  return cwd;
}

describe("Product card story lint tool", () => {
  test("passes a valid schema-aware board fixture", async () => {
    const result = await runStoryLint(makeProject());

    expect(result).toEqual({
      exitCode: 0,
      stderr: "",
      stdout: "Product card story lint passed.",
    });
  });

  test("passes the walk-shaped links-only fixture bundle", async () => {
    const result = await runStoryLint(join(testDir, "fixtures/walk-links-bundle"));

    expect(result).toEqual({
      exitCode: 0,
      stderr: "",
      stdout: "Product card story lint passed.",
    });
  });

  test("the real library bundle passes lead-coverage (no-orphans) on every plane, learning included", async () => {
    // The durable lead-coverage gate (#625) ran against the product bundle;
    // after the #680 promotion the bundle is docs/alexandria/library and holds
    // the product, strategy, AND learning planes in one root. This pins the
    // rule for all of them at once: every context lead — research,
    // measurement, experiments, and any learning context added later — must
    // narrate and wikilink each of its members, because the linter derives
    // contexts from the bundle itself rather than from an enumerated list.
    // Keystones are exempt by construction: each plane's `_index` group holds
    // a single card, below the two-card floor a context lead requires.
    const repoRoot = join(testDir, "../../..");
    const result = await runStoryLint(repoRoot, [
      "--library-root",
      "docs/alexandria/library",
      "--rule",
      "no-orphans",
    ]);

    expect(result).toEqual({
      exitCode: 0,
      stderr: "",
      stdout: "Product card story lint passed.",
    });
  });

  test("uses a keystone card as the context lead over a pillar card", async () => {
    const cwd = makeProject();
    writeCard(cwd, {
      altitude: "keystone",
      body: `## WHAT
What it does. Board Keystone frames the board story.

## HOW
It names [[Work Board]] and intentionally leaves the board pieces out.`,
      fileStem: "Concept - Board Keystone",
      prefLabel: "Board Keystone",
      type: "Concept",
    });

    const result = await runStoryLint(cwd);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain(
      'board / Board Keystone: orphan card "Aggregate - Board State" is not linked from the lead how-it-does-it story',
    );
    expect(result.stderr).not.toContain(
      'board / Work Board: orphan card "Concept - Board Keystone"',
    );
  });

  test("fails and names a card defined in the context but not linked by the lead", async () => {
    const cwd = makeOrphanProject();

    const result = await runStoryLint(cwd);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain(
      'orphan card "Value - Status" is not linked from the lead how-it-does-it story',
    );
  });

  test("fails and names retired Product-card connectors", async () => {
    const cwd = makeProject();
    writeCard(cwd, {
      altitude: "pillar",
      body: `## WHAT
What it does. The legacy board card still authors connectors.

How it does it. It points at [[Stage]].`,
      connectors: ["moves through -> Stage"],
      fileStem: "Aggregate - Legacy Board",
      prefLabel: "Legacy Board",
      type: "Aggregate",
    });

    const result = await runStoryLint(cwd);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain(
      "Retired Product-card field connectors in board/Aggregate - Legacy Board.md; migrate to links.",
    );
  });

  test("--rule no-orphans still flags an orphan", async () => {
    const result = await runStoryLint(makeOrphanProject(), ["--rule", "no-orphans"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      'orphan card "Value - Status" is not linked from the lead how-it-does-it story',
    );
  });

  test("--rule diagram-parity passes a bundle whose only violation is an orphan", async () => {
    const result = await runStoryLint(makeOrphanProject(), ["--rule", "diagram-parity"]);

    expect(result).toEqual({
      exitCode: 0,
      stderr: "",
      stdout: "Product card story lint passed.",
    });
  });

  test("both rules together behave like the default (orphan still fails)", async () => {
    const result = await runStoryLint(makeOrphanProject(), [
      "--rule",
      "no-orphans",
      "--rule",
      "diagram-parity",
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('orphan card "Value - Status"');
  });

  test("--rule no-orphans does not report retired-connector issues", async () => {
    const result = await runStoryLint(makeRetiredConnectorProject(), ["--rule", "no-orphans"]);

    expect(result).toEqual({
      exitCode: 0,
      stderr: "",
      stdout: "Product card story lint passed.",
    });
  });

  test("--rule diagram-parity reports retired-connector issues", async () => {
    const result = await runStoryLint(makeRetiredConnectorProject(), ["--rule", "diagram-parity"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain(
      "Retired Product-card field connectors in board/Aggregate - Board.md; migrate to links.",
    );
  });

  test("an unknown --rule value exits 2 with usage and does not lint", async () => {
    const result = await runStoryLint(makeOrphanProject(), ["--rule", "bogus"]);

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Unknown --rule value: bogus");
    expect(result.stderr).toContain("Valid rules: no-orphans, diagram-parity");
  });
});
