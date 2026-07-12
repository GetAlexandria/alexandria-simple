import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

// The root CLAUDE.md package map is the single doc statement of which library
// the product surface reads. alexandria-simple's rewrite (the pared personal
// architecture) must still name docs/alexandria/library as the working product
// library, keep the no-freehand-edit guard, and keep the retired legacy-oracle
// wording out.
const repoRoot = resolve(import.meta.dir, "../../../..");
const claudeMd = readFileSync(resolve(repoRoot, "CLAUDE.md"), "utf8");
const retiredSweepPath = ["docs/alexandria/sweeps", "alexandria-product/"].join("/");

describe("CLAUDE.md library package map", () => {
  test("names docs/alexandria/library as the working product library", () => {
    expect(claudeMd).toContain("`docs/alexandria/library/` — the working product library");
    expect(claudeMd).toContain("Library\n  viewer section reads");
  });

  test("does not reintroduce the old sweep path or legacy-oracle wording", () => {
    expect(claudeMd).not.toContain(retiredSweepPath);
    expect(claudeMd).not.toContain("coverage oracle");
    expect(claudeMd).not.toContain("?libraryRoot=docs/alexandria/library");
    expect(claudeMd).not.toContain("retained legacy library");
  });

  test("keeps the live-library no-freehand-edit guard", () => {
    expect(claudeMd).toContain("Do not freehand-edit `docs/alexandria/library/`");
    expect(claudeMd).toContain("it is the live product library");
    expect(claudeMd).toContain("plays and\n  `ax` commands, which own validation and idempotency");
  });
});
