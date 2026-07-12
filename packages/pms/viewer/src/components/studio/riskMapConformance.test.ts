import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { FAMILY_BY_PREFIX, parseRiskMap, riskFamily, type RiskFamily } from "./evalPlan";

/**
 * Drift-conformance gate — the anti-drift instrument for the risk taxonomy.
 *
 * The taxonomy (Input / Reasoning / Output / Adversarial / Chain, keyed by the
 * id prefix) lives in three homes that MUST agree:
 *
 *   1. **the spine** — `studio/plays/research/testing/RISKS.md`: the canonical
 *      columns + the in-family convention (bespoke risks file under a canonical
 *      prefix — `RE-4`, `OUT-4` — never a separate, non-canonical band);
 *   2. **the viewer** — `FAMILY_BY_PREFIX` / `riskFamily()` in `evalPlan.ts`,
 *      which bands every row on the Play Testing surface;
 *   3. **every per-play `studio/plays/<slug>/risk-map.md`** — the files the
 *      surface actually renders.
 *
 * Promoted from the louisville mesh-validator (`.context/validate-risk-map.ts`)
 * and generalised to all risk-maps. It fails the build when any home diverges:
 * a misfiled row (an id with no canonical prefix → "misfiled at source" on the
 * surface), a family the spine teaches but the viewer can't band (or vice
 * versa), or a risk-map that no longer parses. This is the gate that keeps the
 * `FTP-*`-style drift this convention retired from recurring silently. See
 * `testing-center-viewer-port/plan.md` §8 (the no-drift guarantee). It lands
 * with Phase 0 (the in-family convention) and closes Phase 1 — every
 * golden-path risk-map (#270) gated against that convention.
 */

const REPO_ROOT = join(import.meta.dir, "../../../../../..");
const RISKS_MD = join(REPO_ROOT, "studio/plays/research/testing/RISKS.md");
const PLAYS_DIR = join(REPO_ROOT, "studio/plays");

/** The taxonomy's canonical families — the documented set both homes must hold. */
const CANONICAL_FAMILIES: RiskFamily[] = ["Adversarial", "Chain", "Input", "Output", "Reasoning"];

/** Every `risk-map.md` under `studio/plays/`, found by walking the play dirs. */
function findRiskMaps(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const sub = join(dir, entry.name);
    const candidate = join(sub, "risk-map.md");
    if (existsSync(candidate)) {
      found.push(candidate);
    }
    found.push(...findRiskMaps(sub));
  }
  return found;
}

/**
 * The set of risk-id prefixes the spine teaches — read from RISKS.md's tables,
 * where the id is always the first cell. Only `|`-led table rows are scanned, so
 * the convention prose's `RE-4` / `IN-1..4` examples don't count and a stray
 * non-table id can't smuggle a prefix into the taxonomy.
 */
function spinePrefixes(markdown: string): Set<string> {
  const prefixes = new Set<string>();
  for (const line of markdown.split("\n")) {
    if (!line.trimStart().startsWith("|")) {
      continue;
    }
    const firstCell = line.replace(/^\s*\|/, "").split("|")[0] ?? "";
    const match = /^\s*\**\s*([A-Za-z]{2,5})-\d+/.exec(firstCell);
    if (match != null) {
      prefixes.add((match[1] ?? "").toUpperCase());
    }
  }
  return prefixes;
}

const sorted = (xs: Iterable<string>): string[] => [...new Set(xs)].sort();

describe("risk-map drift-conformance — the taxonomy agrees across its three homes", () => {
  const riskMaps = findRiskMaps(PLAYS_DIR);

  it("discovers at least one per-play risk-map.md", () => {
    // A silently-empty glob would make every per-map assertion vacuously pass.
    expect(riskMaps.length).toBeGreaterThan(0);
  });

  it("the viewer's family set is exactly the canonical taxonomy", () => {
    expect(sorted(Object.values(FAMILY_BY_PREFIX))).toEqual([...CANONICAL_FAMILIES].sort());
  });

  it("the spine (RISKS.md) and the viewer (FAMILY_BY_PREFIX) declare the same families", () => {
    const spine = spinePrefixes(readFileSync(RISKS_MD, "utf8"));
    // Same prefixes both ways: an off-taxonomy prefix left in the spine (e.g. a
    // legacy `FTP-*`) fails here, as does a viewer prefix the spine never teaches.
    expect(sorted(spine)).toEqual(sorted(Object.keys(FAMILY_BY_PREFIX)));
    const spineFamilies = [...spine].map((prefix) => riskFamily(`${prefix}-1`));
    expect(sorted(spineFamilies.filter((f): f is RiskFamily => f != null))).toEqual(
      sorted(Object.values(FAMILY_BY_PREFIX)),
    );
  });

  for (const path of riskMaps) {
    const rel = path.slice(REPO_ROOT.length + 1);

    describe(rel, () => {
      const text = readFileSync(path, "utf8");

      it("parses (the surface renders it, never fails loudly mid-render)", () => {
        expect(() => parseRiskMap(text)).not.toThrow();
      });

      it("has zero misfiled rows — every coverage id bands into a canonical family", () => {
        const map = parseRiskMap(text);
        const misfiled = map.coverage.filter((row) => riskFamily(row.id) == null).map((r) => r.id);
        expect(misfiled).toEqual([]);
      });

      it("every eval-plan risk id also bands into a canonical family", () => {
        const map = parseRiskMap(text);
        const misfiled = [...new Set(map.evals.map((e) => e.risk))].filter(
          (id) => riskFamily(id) == null,
        );
        expect(misfiled).toEqual([]);
      });
    });
  }
});
