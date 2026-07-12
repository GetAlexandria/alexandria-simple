import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

// The root CLAUDE.md package map is the single doc statement of which library
// the product surface reads. alexandria-simple's rewrite (the pared personal
// architecture) must still name docs/alexandria/library as the working product
// library, keep the no-freehand-edit guard, and keep the retired legacy-oracle
// wording out. Assertions run against whitespace-normalized text so a markdown
// re-wrap or indent change never fails the guard — only a meaning change does.
const repoRoot = resolve(import.meta.dir, "../../../..");
const claudeMd = readFileSync(resolve(repoRoot, "CLAUDE.md"), "utf8");
const normalized = claudeMd.replace(/\s+/g, " ");
const retiredSweepPath = ["docs/alexandria/sweeps", "alexandria-product/"].join("/");

describe("CLAUDE.md library package map", () => {
  test("names docs/alexandria/library as the working product library", () => {
    expect(normalized).toContain("`docs/alexandria/library/` — the working product library");
    expect(normalized).toContain("Library viewer section reads");
  });

  test("does not reintroduce the old sweep path or legacy-oracle wording", () => {
    expect(normalized).not.toContain(retiredSweepPath);
    expect(normalized).not.toContain("coverage oracle");
    expect(normalized).not.toContain("?libraryRoot=docs/alexandria/library");
    expect(normalized).not.toContain("retained legacy library");
  });

  test("keeps the live-library no-freehand-edit guard", () => {
    expect(normalized).toContain("Do not freehand-edit `docs/alexandria/library/`");
    expect(normalized).toContain("it is the live product library");
    expect(normalized).toContain("plays and `ax` commands, which own validation and idempotency");
  });
});
