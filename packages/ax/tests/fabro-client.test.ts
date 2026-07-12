import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, realpathSync, rmSync, symlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { FABRO_LABEL_PROJECT_ID } from "../src/domain/fabro-labels.js";
import {
  alexandriaRunBelongsToProject,
  mapLifecycle,
  pendingQuestionsFrom,
} from "../src/effects/fabro-client.js";

const tempDirs = new Set<string>();

function makeTempDir(prefix = "ax-fabro-client-"): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.add(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("mapLifecycle", () => {
  test("folds Fabro run status kinds into the bridge lifecycle", () => {
    expect(mapLifecycle("succeeded")).toBe("succeeded");
    expect(mapLifecycle("failed")).toBe("failed");
    expect(mapLifecycle("dead")).toBe("failed");
    expect(mapLifecycle("submitted")).toBe("submitted");
    expect(mapLifecycle("running")).toBe("running");
    // Pending interviews (read from /state) mark a run "needs human", not the
    // status kind — so blocked/paused fold to "running" here.
    expect(mapLifecycle("blocked")).toBe("running");
    expect(mapLifecycle("paused")).toBe("running");
    expect(mapLifecycle("anything-else")).toBe("running");
  });
});

describe("pendingQuestionsFrom", () => {
  test("returns [] for missing or empty pending_interviews", () => {
    expect(pendingQuestionsFrom(null)).toEqual([]);
    expect(pendingQuestionsFrom({})).toEqual([]);
    expect(pendingQuestionsFrom({ pending_interviews: {} })).toEqual([]);
  });

  test("parses the /state shape: question.text + option keys, keyed by question id", () => {
    const state = {
      pending_interviews: {
        q1: {
          question: {
            id: "q1",
            options: [
              { key: "approve", label: "Approve" },
              { key: "revise", label: "Revise" },
            ],
            text: "React to the draft",
          },
          started_at: "2026-06-18T12:00:00.000Z",
        },
      },
    };
    expect(pendingQuestionsFrom(state)).toEqual([
      { choices: ["approve", "revise"], prompt: "React to the draft", questionId: "q1" },
    ]);
  });

  test("falls back to a default prompt and omits choices when the question lacks them", () => {
    const state = { pending_interviews: { q2: { question: { id: "q2" } } } };
    expect(pendingQuestionsFrom(state)).toEqual([
      { prompt: "Human input requested", questionId: "q2" },
    ]);
  });

  test("ignores option entries without a string key", () => {
    const state = {
      pending_interviews: {
        q3: { question: { options: [{ key: "yes" }, { label: "no key here" }], prompt: "Pick" } },
      },
    };
    expect(pendingQuestionsFrom(state)).toEqual([
      { choices: ["yes"], prompt: "Pick", questionId: "q3" },
    ]);
  });
});

describe("alexandriaRunBelongsToProject", () => {
  test("includes runs with this project's explicit label", () => {
    const projectRoot = realpathSync(makeTempDir());

    expect(
      alexandriaRunBelongsToProject(
        { labels: { [FABRO_LABEL_PROJECT_ID]: projectRoot } },
        projectRoot,
      ),
    ).toBe(true);
  });

  test("excludes another checkout's explicit label even when source_directory matches", () => {
    const projectRoot = realpathSync(makeTempDir());
    const foreignRoot = realpathSync(makeTempDir());

    expect(
      alexandriaRunBelongsToProject(
        {
          labels: { [FABRO_LABEL_PROJECT_ID]: foreignRoot },
          source_directory: projectRoot,
        },
        projectRoot,
      ),
    ).toBe(false);
  });

  test("includes legacy rows whose canonical source_directory is this project", () => {
    const projectRoot = realpathSync(makeTempDir());

    expect(
      alexandriaRunBelongsToProject({ labels: {}, source_directory: projectRoot }, projectRoot),
    ).toBe(true);
  });

  test("canonicalizes a legacy symlink source_directory before comparing", () => {
    const projectRoot = makeTempDir();
    const linkParent = makeTempDir("ax-fabro-client-link-");
    const projectLink = join(linkParent, "project-link");
    symlinkSync(projectRoot, projectLink, "dir");

    expect(
      alexandriaRunBelongsToProject(
        { labels: {}, source_directory: projectLink },
        realpathSync(projectRoot),
      ),
    ).toBe(true);
  });

  test("excludes rows with no project label and no source_directory", () => {
    const projectRoot = realpathSync(makeTempDir());

    expect(alexandriaRunBelongsToProject({ labels: {} }, projectRoot)).toBe(false);
  });

  test("excludes rows with an unresolvable legacy source_directory without throwing", () => {
    const projectRoot = realpathSync(makeTempDir());

    expect(
      alexandriaRunBelongsToProject(
        { labels: {}, source_directory: join(projectRoot, "missing") },
        projectRoot,
      ),
    ).toBe(false);
  });
});
