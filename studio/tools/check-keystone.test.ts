import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  checkKeystoneBundle,
  compareKeystoneSets,
  discoverSweepBundleRoots,
  extractKeystoneStoryNames,
  formatKeystoneResult,
  normalizeKeystoneName,
  repoDir,
  type KeystoneName,
  type KeystoneViolation,
} from "./check-keystone.ts";

const fixtureDir = path.join(repoDir, "studio/tools/fixtures/keystone");
const smallEl2Bundle = path.join(
  repoDir,
  "studio/plays/front-of-house-walk/fixtures/small-el2/bundle",
);
const playmakerBundle = path.join(repoDir, "studio/sweeps/playmaker-studio");

function fixture(name: string): string {
  return path.join(fixtureDir, name);
}

function mustName(value: string): KeystoneName {
  const name = normalizeKeystoneName(value);
  if (name == null) {
    throw new Error(`Expected ${value} to normalize`);
  }
  return name;
}

function text(value: string | Uint8Array | null): string {
  if (value == null) {
    return "";
  }
  return typeof value === "string" ? value : new TextDecoder().decode(value);
}

function runCli(args: string[]) {
  const result = Bun.spawnSync({
    cmd: ["bun", "studio/tools/check-keystone.ts", ...args],
    cwd: repoDir,
    stderr: "pipe",
    stdout: "pipe",
  });

  return {
    exitCode: result.exitCode,
    stderr: text(result.stderr).trimEnd(),
    stdout: text(result.stdout).trimEnd(),
  };
}

const playmakerViolationLines = [
  "named-but-empty: make-a-play",
  "named-but-empty: operations",
  "named-but-empty: production-line",
  "named-but-empty: workflow",
  "unnamed: authoring",
  "unnamed: production-ladder",
  "unnamed: runs",
];

describe("keystone set comparison", () => {
  test("uses catalog wikilink extraction and resolver-style normalization", () => {
    // Noun-in-sentence idiom (ruled 2026-07-08): the piped alias is the name
    // the story calls the thing; the target is where the link goes.
    expect(
      extractKeystoneStoryNames("---\nnote: [[ignored]]\n---\n[[Role - Big Box#WHAT|the box]]"),
    ).toEqual([{ key: "the box", name: "the-box" }]);
  });

  test("a bare link that resolves to a card is a citation, not a container naming", () => {
    const cardKey = mustName("Measure - Golden Metric").key;
    expect(
      extractKeystoneStoryNames("[[Measure - Golden Metric]] and [[ghost-shelf]]", {
        resolvesToCard: (key) => key === cardKey,
      }),
    ).toEqual([mustName("ghost-shelf")]);
  });

  test("container naming wins over card resolution for bare links", () => {
    const containerKey = mustName("library").key;
    expect(
      extractKeystoneStoryNames("[[library]]", {
        isContainer: (key) => key === containerKey,
        resolvesToCard: () => true,
      }),
    ).toEqual([mustName("library")]);
  });

  test("reports both directions with deterministic direction/name order", () => {
    const violations = compareKeystoneSets({
      containerNames: [mustName("Beta"), mustName("alpha")],
      storyNames: [mustName("Ghost"), mustName("ALPHA")],
    });

    expect(violations.map((violation) => `${violation.direction}: ${violation.name}`)).toEqual([
      "named-but-empty: ghost",
      "unnamed: beta",
    ]);
  });
});

describe("check-keystone bundle validator", () => {
  test("discovers every immediate sweep bundle root deterministically", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "keystone-sweeps-"));
    const sweepsRoot = path.join(tempRoot, "sweeps");
    fs.mkdirSync(sweepsRoot);
    fs.mkdirSync(path.join(sweepsRoot, "zeta"));
    fs.mkdirSync(path.join(sweepsRoot, "alpha"));
    fs.writeFileSync(path.join(sweepsRoot, "README.md"), "not a bundle");

    try {
      expect(discoverSweepBundleRoots(sweepsRoot).map((root) => path.basename(root))).toEqual([
        "alpha",
        "zeta",
      ]);
    } finally {
      fs.rmSync(tempRoot, { force: true, recursive: true });
    }
  });

  test("passes a conforming fixture", async () => {
    const result = await checkKeystoneBundle(fixture("good"), { allowGrandfather: false });

    expect(result.grandfathered).toBeFalse();
    expect(result.storyNames.map((name) => name.name)).toEqual(["alpha", "beta"]);
    expect(result.containerNames.map((name) => name.name)).toEqual(["alpha", "beta"]);
    expect(result.violations).toEqual([]);
    expect(formatKeystoneResult(result)).toBe(
      "Keystone check passed: studio/tools/fixtures/keystone/good (2 container(s)).",
    );
  });

  test("passes a conforming fixture with only library-draft.json", async () => {
    const tempParent = path.join(repoDir, ".tmp");
    fs.mkdirSync(tempParent, { recursive: true });
    const tempRoot = fs.mkdtempSync(path.join(tempParent, "keystone-draft-manifest-"));
    const bundle = path.join(tempRoot, "bundle");

    try {
      fs.cpSync(fixture("good"), bundle, { recursive: true });
      fs.rmSync(path.join(bundle, "library.json"));
      fs.writeFileSync(
        path.join(bundle, "library-draft.json"),
        `${JSON.stringify(
          {
            schemaVersion: "product-card.v1",
            draftOf: "fixture-good",
            playRunId: "run-fixture-good",
          },
          null,
          2,
        )}\n`,
        "utf8",
      );

      const result = await checkKeystoneBundle(bundle, { allowGrandfather: false });

      expect(result.grandfathered).toBeFalse();
      expect(result.storyNames.map((name) => name.name)).toEqual(["alpha", "beta"]);
      expect(result.containerNames.map((name) => name.name)).toEqual(["alpha", "beta"]);
      expect(result.violations).toEqual([]);
    } finally {
      fs.rmSync(tempRoot, { force: true, recursive: true });
    }
  });

  test("fails for a story link with no card-bearing container", async () => {
    const result = await checkKeystoneBundle(fixture("bad-named-but-empty"), {
      allowGrandfather: false,
    });

    expect(result.violations).toEqual<KeystoneViolation[]>([
      { direction: "named-but-empty", key: "ghost", name: "ghost" },
    ]);
  });

  test("fails for a card-bearing container not named by the story", async () => {
    const result = await checkKeystoneBundle(fixture("bad-unnamed"), {
      allowGrandfather: false,
    });

    expect(result.violations).toEqual<KeystoneViolation[]>([
      { direction: "unnamed", key: "beta", name: "beta" },
    ]);
  });

  test("ignores directories that contain only non-card files", () => {
    const result = runCli(["studio/tools/fixtures/keystone/empty-non-card-dir"]);

    expect(result).toEqual({
      exitCode: 0,
      stderr: "",
      stdout:
        "Keystone check passed: studio/tools/fixtures/keystone/empty-non-card-dir (1 container(s)).",
    });
  });

  test("matches story links and containers case- and slug-insensitively across plane layout", () => {
    const result = runCli(["studio/tools/fixtures/keystone/slug-case-alias"]);

    expect(result).toEqual({
      exitCode: 0,
      stderr: "",
      stdout:
        "Keystone check passed: studio/tools/fixtures/keystone/slug-case-alias (1 container(s)).",
    });
  });

  test("returns exit 2 for a bundle without a keystone card", () => {
    const result = runCli(["studio/tools/fixtures/keystone/missing-keystone"]);

    expect(result).toEqual({
      exitCode: 2,
      stderr: "missing-keystone: studio/tools/fixtures/keystone/missing-keystone",
      stdout: "",
    });
  });

  test("produces byte-identical CLI output and exit code across runs", () => {
    const args = ["--no-grandfather", "studio/tools/fixtures/keystone/bad-both-directions"];
    expect(runCli(args)).toEqual(runCli(args));
  });

  test("passes the small-el2 bundle after the fixture's keystone story is conforming", () => {
    const result = runCli([smallEl2Bundle]);

    expect(result).toEqual({
      exitCode: 0,
      stderr: "",
      stdout:
        "Keystone check passed: studio/plays/front-of-house-walk/fixtures/small-el2/bundle (3 container(s)).",
    });
  });

  test("grandfathers only the exact current Playmaker Studio violation list", () => {
    const result = runCli([playmakerBundle]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout.split("\n")).toEqual([
      "Keystone check grandfathered: studio/sweeps/playmaker-studio",
      ...playmakerViolationLines,
    ]);
  });

  test("fails the Playmaker Studio sweep with all seven violations when grandfathering is disabled", () => {
    const result = runCli(["--no-grandfather", playmakerBundle]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toBe("");
    expect(result.stdout.split("\n")).toEqual([
      "Keystone check failed: studio/sweeps/playmaker-studio",
      ...playmakerViolationLines,
    ]);
  });
});
