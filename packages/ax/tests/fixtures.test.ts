import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { FixtureResolutionError, resolveFixtureInputs } from "../src/domain/fixtures.js";
import { declaredWorkflowInputKeys } from "../src/domain/orchestration.js";

const tempDirs = new Set<string>();

function makeTempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.add(dir);
  return dir;
}

function writeFile(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, "utf8");
}

// frame-the-problem's fixtures dir as named in the play manifest. The case
// directory is created beneath a temp cwd so the manifest-relative path
// resolves into the test sandbox.
const FIXTURES_DIR = "studio/plays/frame-the-problem/fixtures";

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("resolveFixtureInputs", () => {
  test("binds the declared transcript input and ignores non-declared files", () => {
    const cwd = makeTempDir("ax-fixtures-cwd-");
    const goldenDir = join(cwd, FIXTURES_DIR, "golden");
    writeFile(join(goldenDir, "transcript.md"), "transcript body");
    // Leftover context files from the old multi-input pipeline: the Riff play
    // declares only `transcript`, so these are not inputs and must not bind.
    writeFile(join(goldenDir, "surface_map.md"), "surface map body");
    writeFile(join(goldenDir, "users.md"), "users body");

    const result = resolveFixtureInputs({
      caseName: "golden",
      cwd,
      playId: "frame-the-problem",
    });

    expect(result).not.toBeInstanceOf(FixtureResolutionError);
    const inputs = result as Record<string, string>;

    // The single declared input resolves to an absolute path inside the case dir.
    expect(inputs.transcript).toBe(join(goldenDir, "transcript.md"));
    expect(inputs.transcript?.startsWith("/")).toBeTrue();

    // The Riff play narrowed inputs to the handed-in material alone (brief §3);
    // product context and users are drawn from the director live, not supplied.
    const declared = declaredWorkflowInputKeys("frame-the-problem", process.env, cwd);
    expect(declared).toContain("transcript");
    expect(declared).not.toContain("surface_map");
    expect(declared).not.toContain("users");
    expect(declared).not.toContain("prior_brief");

    // The non-declared leftover files are ignored, never bound as inputs.
    expect(Object.hasOwn(inputs, "surface_map")).toBeFalse();
    expect(Object.hasOwn(inputs, "users")).toBeFalse();

    // Every declared input is present in the resolved map (none left to become
    // an unresolved __AX_INPUT_*__ placeholder).
    for (const key of declared) {
      expect(Object.hasOwn(inputs, key)).toBeTrue();
    }
  });

  test("an unknown case errors and lists the available cases", () => {
    const cwd = makeTempDir("ax-fixtures-cwd-");
    writeFile(join(cwd, FIXTURES_DIR, "golden", "transcript.md"), "transcript body");
    writeFile(join(cwd, FIXTURES_DIR, "edge-case", "transcript.md"), "transcript body");

    const result = resolveFixtureInputs({
      caseName: "does-not-exist",
      cwd,
      playId: "frame-the-problem",
    });

    expect(result).toBeInstanceOf(FixtureResolutionError);
    const error = result as FixtureResolutionError;
    expect(error.message).toContain("does-not-exist");
    expect(error.message).toContain("Available cases:");
    expect(error.message).toContain("golden");
    expect(error.message).toContain("edge-case");
  });

  test("an empty case directory errors", () => {
    const cwd = makeTempDir("ax-fixtures-cwd-");
    mkdirSync(join(cwd, FIXTURES_DIR, "empty"), { recursive: true });

    const result = resolveFixtureInputs({
      caseName: "empty",
      cwd,
      playId: "frame-the-problem",
    });

    expect(result).toBeInstanceOf(FixtureResolutionError);
    expect((result as FixtureResolutionError).message).toContain("has no files");
  });

  test("a play with no fixturesDir in the manifest errors clearly", () => {
    const cwd = makeTempDir("ax-fixtures-cwd-");

    const result = resolveFixtureInputs({
      caseName: "golden",
      cwd,
      playId: "source-assessment",
    });

    expect(result).toBeInstanceOf(FixtureResolutionError);
    expect((result as FixtureResolutionError).message).toContain("no fixtures directory");
  });

  test("a case missing a required input (transcript) errors instead of binding it empty", () => {
    const cwd = makeTempDir("ax-fixtures-cwd-");
    const dir = join(cwd, FIXTURES_DIR, "no-transcript");
    // Optional inputs present, but the required transcript.md is absent.
    writeFile(join(dir, "surface_map.md"), "surface map body");
    writeFile(join(dir, "users.md"), "users body");

    const result = resolveFixtureInputs({
      caseName: "no-transcript",
      cwd,
      playId: "frame-the-problem",
    });

    expect(result).toBeInstanceOf(FixtureResolutionError);
    expect((result as FixtureResolutionError).message).toContain("transcript");
    expect((result as FixtureResolutionError).message).toContain("required");
  });

  test("ignores README.md and files not matching a declared input key", () => {
    const cwd = makeTempDir("ax-fixtures-cwd-");
    const dir = join(cwd, FIXTURES_DIR, "golden");
    writeFile(join(dir, "transcript.md"), "transcript body");
    writeFile(join(dir, "README.md"), "bound behavior doc");
    writeFile(join(dir, "notes.md"), "a stray doc with no matching input");

    const result = resolveFixtureInputs({
      caseName: "golden",
      cwd,
      playId: "frame-the-problem",
    });

    expect(result).not.toBeInstanceOf(FixtureResolutionError);
    const inputs = result as Record<string, string>;
    expect(inputs.transcript).toBe(join(dir, "transcript.md"));
    // README and the stray doc must NOT become phantom inputs.
    expect(Object.hasOwn(inputs, "readme")).toBeFalse();
    expect(Object.hasOwn(inputs, "notes")).toBeFalse();
  });

  test("errors when two files map to the same input key", () => {
    const cwd = makeTempDir("ax-fixtures-cwd-");
    const dir = join(cwd, FIXTURES_DIR, "dup");
    writeFile(join(dir, "transcript.md"), "one");
    writeFile(join(dir, "transcript.txt"), "two");

    const result = resolveFixtureInputs({
      caseName: "dup",
      cwd,
      playId: "frame-the-problem",
    });

    expect(result).toBeInstanceOf(FixtureResolutionError);
    expect((result as FixtureResolutionError).message).toContain("more than one file");
  });

  test("binds a declared directory input for front-of-house bundle fixtures", () => {
    const cwd = makeTempDir("ax-fixtures-cwd-");
    const caseDir = join(cwd, "studio/plays/front-of-house-walk/fixtures/small-el2");
    writeFile(
      join(cwd, "packages/alexandria-plugin/workflows/front-of-house-walk/workflow.fabro"),
      "cmd ax internal front-of-house prepare-agenda --bundle '__AX_INPUT_BUNDLE__' --draft-log='__AX_INPUT_DRAFTLOG__'\n",
    );
    writeFile(join(caseDir, "bundle/thread-events.jsonl"), "");
    writeFile(join(caseDir, "README.md"), "fixture notes");

    const result = resolveFixtureInputs({
      caseName: "small-el2",
      cwd,
      playId: "front-of-house-walk",
    });

    expect(result).not.toBeInstanceOf(FixtureResolutionError);
    const inputs = result as Record<string, string>;
    expect(inputs.bundle).toBe(join(caseDir, "bundle"));
    expect(inputs.draftlog).toBe("");
  });
});

describe("ax run --fixture composition", () => {
  test("--input overrides a fixture-provided key", () => {
    const cwd = makeTempDir("ax-fixtures-cwd-");
    const goldenDir = join(cwd, FIXTURES_DIR, "golden");
    writeFile(join(goldenDir, "transcript.md"), "transcript body");

    const fixtureInputs = resolveFixtureInputs({
      caseName: "golden",
      cwd,
      playId: "frame-the-problem",
    }) as Record<string, string>;

    // runPlay merges as { ...fixtureInputs, ...explicitInputs }; the explicit
    // --input value wins for an overlapping key.
    const explicitInputs: Record<string, string> = {
      transcript: "/custom/override.md",
    };
    const merged = { ...fixtureInputs, ...explicitInputs };

    expect(fixtureInputs.transcript).toBe(join(goldenDir, "transcript.md"));
    expect(merged.transcript).toBe("/custom/override.md");
  });
});
