import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
  AlexandriaProjectRootNotFoundError,
  canonicalizeExistingPath,
  findAlexandriaProjectRoot,
} from "../src/domain/project-root.js";

const tempDirs = new Set<string>();

function makeTempDir(prefix = "ax-project-root-"): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.add(dir);
  return dir;
}

function makeAlexandriaProject(): string {
  const root = makeTempDir();
  mkdirSync(join(root, ".alexandria"), { recursive: true });
  return root;
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("findAlexandriaProjectRoot", () => {
  test("returns the canonical root when started at the project root", () => {
    const root = makeAlexandriaProject();

    expect(findAlexandriaProjectRoot(root)).toBe(realpathSync(root));
  });

  test("walks up from a project subdirectory", () => {
    const root = makeAlexandriaProject();
    const nested = join(root, "docs/alexandria");
    mkdirSync(nested, { recursive: true });

    expect(findAlexandriaProjectRoot(nested)).toBe(realpathSync(root));
  });

  test("resolves a symlinked launch path to the real project root", () => {
    const root = makeAlexandriaProject();
    const nested = join(root, "nested/leaf");
    mkdirSync(nested, { recursive: true });
    const linkParent = makeTempDir("ax-project-root-link-");
    const projectLink = join(linkParent, "project-link");
    symlinkSync(root, projectLink, "dir");

    expect(findAlexandriaProjectRoot(join(projectLink, "nested/leaf"))).toBe(realpathSync(root));
  });

  test("returns a structured error when no Alexandria root is present", () => {
    const root = makeTempDir();
    const result = findAlexandriaProjectRoot(root);

    expect(result).toBeInstanceOf(AlexandriaProjectRootNotFoundError);
    expect(result).toBeInstanceOf(Error);
    if (!(result instanceof Error)) {
      throw new Error("Expected findAlexandriaProjectRoot to return an error.");
    }
    expect(result.message).toBe("Alexandria is not initialized. Run `ax init`.");
  });
});

describe("canonicalizeExistingPath", () => {
  test("returns null when realpath cannot resolve the path", () => {
    const root = makeTempDir();

    expect(canonicalizeExistingPath(join(root, "missing"))).toBeNull();
  });
});
