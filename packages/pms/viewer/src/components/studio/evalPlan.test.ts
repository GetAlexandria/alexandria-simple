import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseRiskMap, riskFamily, testsForRisk } from "./evalPlan";

// A self-contained sample mirroring the real risk-map.md shape, exercising every
// edge: a commented frontmatter field, all four coverage states, the id/name
// split, the `CHN-1…5` range id, every scope/type, built yes/no, the three
// target forms (count / `1 (det)` / `TBD`), and two tests for one risk.
const SAMPLE = `---
slug: sample-play
spine: research/testing/   # the studio canon these risk ids come from
results: none-yet
---

# Play Testing — risk map (sample)

Prose that is not a table, and must be ignored by the parser.

## Coverage — which risks apply

| risk | state | where it's tested / why |
|---|---|---|
| IN-1 Buried signal | ○ gap | no controlled positional-invariance fixture |
| IN-2 Distraction | ● covered | hard-case (Storm scene) + the budget block |
| OUT-2 Refusal calibration | ◐ partial | under covered; over has no minimal-pair |
| ADV-3 Insecure output handling | n/a | markdown a human reads — no code sink |
| CHN-1…5 Chain / composition | ○ gap | 8-node chain not yet tested for compounding |

## Eval plan — tests per risk

| risk | test | scope | type | built | target | runs | result |
|---|---|---|---|---|---|---|---|
| IN-1 | positional-invariance (vary where gold sits) | whole | metamorphic | no | 30 | 0 | — |
| IN-2 | hard-case · Storm scene (noise excluded) | whole | example | yes | 30 | 0 | — |
| OUT-1 | ground-check (quotes char-exact, fields present) | node | example | yes | 1 (det) | 0 | — |
| OUT-2 | refusal · under (a non-build input is refused) | whole | red-team | yes | 100 | 0 | — |
| OUT-2 | minimal-pair · over (valid vs invalid near-pair) | whole | red-team | no | 100 | 0 | — |
| CHN-1…5 | chain frontier (compounding / interference) | whole | statistical | no | TBD | 0 | — |
`;

describe("parseRiskMap — frontmatter", () => {
  const map = parseRiskMap(SAMPLE);

  it("reads the fields and strips trailing comments", () => {
    expect(map.frontmatter.slug).toBe("sample-play");
    expect(map.frontmatter.spine).toBe("research/testing/");
    expect(map.frontmatter.results).toBe("none-yet");
  });
});

describe("parseRiskMap — coverage table", () => {
  const map = parseRiskMap(SAMPLE);

  it("parses every row in file order", () => {
    expect(map.coverage.map((r) => r.id)).toEqual(["IN-1", "IN-2", "OUT-2", "ADV-3", "CHN-1…5"]);
  });

  it("splits the id from the plain name, verbatim", () => {
    expect(map.coverage[0]).toEqual({
      id: "IN-1",
      name: "Buried signal",
      rationale: "no controlled positional-invariance fixture",
      state: "gap",
    });
  });

  it("decodes all four fill-circle states", () => {
    expect(map.coverage.map((r) => r.state)).toEqual(["gap", "covered", "partial", "n/a", "gap"]);
  });

  it("keeps a range id and a slashed name intact", () => {
    const chn = map.coverage[4];
    expect(chn?.id).toBe("CHN-1…5");
    expect(chn?.name).toBe("Chain / composition");
  });
});

describe("parseRiskMap — eval plan table", () => {
  const map = parseRiskMap(SAMPLE);

  it("parses every test row in file order", () => {
    expect(map.evals).toHaveLength(6);
    expect(map.evals[0]).toEqual({
      built: false,
      result: "—",
      risk: "IN-1",
      runs: 0,
      scope: "whole",
      target: { kind: "count", n: 30 },
      test: "positional-invariance (vary where gold sits)",
      type: "metamorphic",
    });
  });

  it("decodes the three target forms", () => {
    const det = map.evals.find((r) => r.risk === "OUT-1");
    const tbd = map.evals.find((r) => r.risk === "CHN-1…5");
    expect(det?.target).toEqual({ kind: "deterministic", n: 1 });
    expect(tbd?.target).toEqual({ kind: "tbd" });
  });

  it("decodes built yes/no", () => {
    expect(map.evals.find((r) => r.test.startsWith("hard-case"))?.built).toBe(true);
    expect(map.evals[0]?.built).toBe(false);
  });

  it("carries multiple tests for one risk", () => {
    expect(testsForRisk(map, "OUT-2")).toHaveLength(2);
    expect(testsForRisk(map, "IN-1")).toHaveLength(1);
    expect(testsForRisk(map, "ADV-3")).toHaveLength(0);
  });
});

describe("no drift — display strings are carried verbatim", () => {
  const map = parseRiskMap(SAMPLE);

  it("finds every coverage name and rationale in the source, byte-for-byte", () => {
    for (const row of map.coverage) {
      expect(SAMPLE).toContain(row.name);
      expect(SAMPLE).toContain(row.rationale);
    }
  });

  it("finds every test description in the source, byte-for-byte", () => {
    for (const row of map.evals) {
      expect(SAMPLE).toContain(row.test);
    }
  });

  it("reconstructs each risk cell from id + name without loss", () => {
    for (const row of map.coverage) {
      expect(SAMPLE).toContain(`${row.id} ${row.name}`);
    }
  });
});

describe("riskFamily — the id-prefix convention", () => {
  it("maps each spine prefix to its family", () => {
    expect(riskFamily("IN-1")).toBe("Input");
    expect(riskFamily("RE-2")).toBe("Reasoning");
    expect(riskFamily("OUT-3")).toBe("Output");
    expect(riskFamily("ADV-1")).toBe("Adversarial");
    expect(riskFamily("CHN-1…5")).toBe("Chain");
  });

  it("returns null for a non-canonical prefix — there is no play-specific family", () => {
    expect(riskFamily("FTP-2")).toBeNull();
  });
});

describe("malformed tables fail loudly, never render a guess", () => {
  const withCoverageRow = (row: string): string =>
    SAMPLE.replace(
      "| IN-1 Buried signal | ○ gap | no controlled positional-invariance fixture |",
      row,
    );

  it("throws on a coverage cell without an id", () => {
    expect(() => parseRiskMap(withCoverageRow("| just prose | ○ gap | x |"))).toThrow();
  });

  it("throws on an unknown coverage state", () => {
    expect(() => parseRiskMap(withCoverageRow("| IN-1 Buried signal | ??? | x |"))).toThrow();
  });

  it("throws on an unknown scope", () => {
    const bad = SAMPLE.replace("| whole | metamorphic |", "| galaxy | metamorphic |");
    expect(() => parseRiskMap(bad)).toThrow();
  });
});

// The real exemplar as a fixture (plan §8: "files as fixtures"). Robust to
// Project B's data edits — it asserts structural invariants and the verbatim
// no-drift guarantee, never specific run counts.
describe("the real frame-the-problem exemplar", () => {
  const path = join(
    import.meta.dir,
    "../../../../../../studio/plays/frame-the-problem/risk-map.md",
  );
  const text = readFileSync(path, "utf8");
  const map = parseRiskMap(text);

  it("parses cleanly", () => {
    expect(map.frontmatter.slug).toBe("frame-the-problem");
    expect(map.coverage.length).toBeGreaterThan(0);
    expect(map.evals.length).toBeGreaterThan(0);
  });

  it("carries the open gaps the handoff names (IN-1, ADV-1)", () => {
    const ids = new Set(map.coverage.map((r) => r.id));
    expect(ids.has("IN-1")).toBe(true);
    expect(ids.has("ADV-1")).toBe(true);
  });

  it("renders no drift — every display string is verbatim in the file", () => {
    for (const row of map.coverage) {
      expect(text).toContain(row.name);
      expect(text).toContain(row.rationale);
    }
    for (const row of map.evals) {
      expect(text).toContain(row.test);
    }
  });

  it("the render hardcodes no canon strings (§8.1 grep-guard)", () => {
    // PlayTesting.tsx must render names/descriptions from the file, never hold
    // them as literals (the faithful-port mandate). The guard targets the render
    // layer only — evalPlan.ts's own doc comments legitimately carry examples.
    const surface = readFileSync(join(import.meta.dir, "PlayTesting.tsx"), "utf8");
    for (const row of map.coverage) {
      expect(surface).not.toContain(row.name);
      expect(surface).not.toContain(row.rationale);
    }
    for (const row of map.evals) {
      expect(surface).not.toContain(row.test);
    }
  });
});
