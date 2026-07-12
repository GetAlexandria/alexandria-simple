import { afterEach, describe, expect, it } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";

/**
 * Bank conformance gate — the plugin runs exactly what the studio authored.
 * The capstone of workstream A (`playmaker-testing-streamline` §3.A), in the
 * studio drift-gate family next to `placeholderConformance.test.ts`.
 *
 * A play is authored in `studio/plays/<slug>/`, but the runtime executes a
 * SEPARATE copy — the plugin payload `packages/alexandria-plugin/workflows/
 * <slug>/`. Nothing kept them in sync, so a studio prompt edit could leave the
 * factory running the stale plugin copy, silently (plan §1.1). `studio/tools/
 * bank.sh` now copies the deployable package across; this gate asserts the
 * result holds and fails the build the moment they diverge.
 *
 * A play is "banked" iff it exists in BOTH trees. Only the deployable package
 * is compared — `workflow.fabro` + `prompts/`, the surfaces the runtime loads.
 * `legs.json` (plugin-only hand-authored tracker metadata) and the studio's
 * authoring files (brief, audits, fixtures, derived renderings) are excluded.
 * Plugin-only plays (e.g. `source-assessment`, no studio source) and unbanked
 * studio plays are correctly out of scope.
 */

const REPO_ROOT = join(import.meta.dir, "../../../../../..");
const STUDIO_DIR = join(REPO_ROOT, "studio/plays");
const PLUGIN_DIR = join(REPO_ROOT, "packages/alexandria-plugin/workflows");

type BankedPlay = {
  plugin: string;
  slug: string;
  studio: string;
};

/** Slugs present in BOTH trees — a studio source and a plugin payload. */
function bankedPlays(studioRoot = STUDIO_DIR, pluginRoot = PLUGIN_DIR): BankedPlay[] {
  if (!existsSync(pluginRoot)) {
    return [];
  }
  return readdirSync(pluginRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => existsSync(join(studioRoot, slug, "workflow.fabro")))
    .sort()
    .map((slug) => ({
      plugin: join(pluginRoot, slug),
      slug,
      studio: join(studioRoot, slug),
    }));
}

/** Every file under `dir`, returned as sorted prompt-relative paths. */
function walkRelativeFiles(dir: string): string[] {
  const found: string[] = [];
  function walk(current: string): void {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else if (entry.isFile()) {
        found.push(relative(dir, path).replaceAll("\\", "/"));
      }
    }
  }
  walk(dir);
  return found.sort();
}

/** The list of prompt file paths under a play's `prompts/`, sorted. */
function promptFiles(playDir: string): string[] {
  const promptsDir = join(playDir, "prompts");
  if (!existsSync(promptsDir)) {
    return [];
  }
  return walkRelativeFiles(promptsDir);
}

function bytesMatch(left: string, right: string): boolean {
  return readFileSync(left).equals(readFileSync(right));
}

function compareBankedPlay(play: BankedPlay): string[] {
  const errors: string[] = [];
  const studioWorkflow = join(play.studio, "workflow.fabro");
  const pluginWorkflow = join(play.plugin, "workflow.fabro");

  if (!existsSync(studioWorkflow)) {
    errors.push(`${play.slug}/workflow.fabro: missing in studio`);
  } else if (!existsSync(pluginWorkflow)) {
    errors.push(`${play.slug}/workflow.fabro: missing in plugin`);
  } else if (!bytesMatch(studioWorkflow, pluginWorkflow)) {
    errors.push(`${play.slug}/workflow.fabro: body differs between studio and plugin`);
  }

  const studioPrompts = promptFiles(play.studio);
  const pluginPrompts = promptFiles(play.plugin);
  const studioSet = new Set(studioPrompts);
  const pluginSet = new Set(pluginPrompts);

  for (const name of studioPrompts) {
    if (!pluginSet.has(name)) {
      errors.push(`${play.slug}/prompts/${name}: prompt exists only in studio`);
    }
  }
  for (const name of pluginPrompts) {
    if (!studioSet.has(name)) {
      errors.push(`${play.slug}/prompts/${name}: prompt exists only in plugin`);
    }
  }
  for (const name of studioPrompts) {
    if (!pluginSet.has(name)) {
      continue;
    }
    const studioPrompt = join(play.studio, "prompts", name);
    const pluginPrompt = join(play.plugin, "prompts", name);
    if (!bytesMatch(studioPrompt, pluginPrompt)) {
      errors.push(`${play.slug}/prompts/${name}: prompt body differs between studio and plugin`);
    }
  }

  return errors;
}

const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

function writeFixtureFile(root: string, path: string, body: string): void {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, body);
}

function fixturePlay(
  studioFiles: Record<string, string>,
  pluginFiles: Record<string, string>,
): BankedPlay {
  const root = mkdtempSync(join(tmpdir(), "alexandria-bank-conformance-"));
  tempRoots.push(root);
  const studio = join(root, "studio/plays/build-atomic-card");
  const plugin = join(root, "packages/alexandria-plugin/workflows/build-atomic-card");
  for (const [path, body] of Object.entries(studioFiles)) {
    writeFixtureFile(studio, path, body);
  }
  for (const [path, body] of Object.entries(pluginFiles)) {
    writeFixtureFile(plugin, path, body);
  }
  return { plugin, slug: "build-atomic-card", studio };
}

describe("bank conformance — the plugin runs exactly what the studio authored", () => {
  const plays = bankedPlays();
  const slugs = plays.map((play) => play.slug);

  it("discovers at least one banked play", () => {
    // A silently-empty glob would make every per-play assertion vacuously pass.
    expect(slugs.length).toBeGreaterThan(0);
  });

  it("guards build-atomic-card, the play whose prompt consumes SECTION_SUMMARY", () => {
    expect(slugs).toContain("build-atomic-card");
  });

  for (const play of plays) {
    describe(play.slug, () => {
      it("workflow.fabro and prompts/ are byte-identical to the studio source", () => {
        expect(compareBankedPlay(play)).toEqual([]);
      });
    });
  }
});

describe("bank conformance prompt parity negative cases", () => {
  const baseFiles = {
    "prompts/draft_or_repair.md": "same prompt body\n",
    "workflow.fabro": "workflow body\n",
  };

  it("passes when workflow and prompt bodies are equal", () => {
    expect(compareBankedPlay(fixturePlay(baseFiles, baseFiles))).toEqual([]);
  });

  it("fails when Studio is missing the SECTION_SUMMARY prompt block", () => {
    const pluginDraft = `Read only:

- Optional section summary prior: __AX_INPUT_SECTION_SUMMARY__

If the optional section summary prior path is non-empty, read that JSON file
before drafting. Treat it as a prior, not an override.
`;
    const studioDraft = `Read only:

- Contract: __AX_INPUT_CONTRACT_PATH__
`;

    const errors = compareBankedPlay(
      fixturePlay(
        { ...baseFiles, "prompts/draft_or_repair.md": studioDraft },
        { ...baseFiles, "prompts/draft_or_repair.md": pluginDraft },
      ),
    );

    expect(errors).toContain(
      "build-atomic-card/prompts/draft_or_repair.md: prompt body differs between studio and plugin",
    );
  });

  it("fails when a prompt exists only in Studio", () => {
    const errors = compareBankedPlay(
      fixturePlay({ ...baseFiles, "prompts/studio_only.md": "studio only\n" }, baseFiles),
    );

    expect(errors).toContain(
      "build-atomic-card/prompts/studio_only.md: prompt exists only in studio",
    );
  });

  it("fails when a prompt exists only in the plugin", () => {
    const errors = compareBankedPlay(
      fixturePlay(baseFiles, { ...baseFiles, "prompts/plugin_only.md": "plugin only\n" }),
    );

    expect(errors).toContain(
      "build-atomic-card/prompts/plugin_only.md: prompt exists only in plugin",
    );
  });

  it("fails when a nested prompt body differs", () => {
    const errors = compareBankedPlay(
      fixturePlay(
        { ...baseFiles, "prompts/nested/repair.md": "studio nested\n" },
        { ...baseFiles, "prompts/nested/repair.md": "plugin nested\n" },
      ),
    );

    expect(errors).toContain(
      "build-atomic-card/prompts/nested/repair.md: prompt body differs between studio and plugin",
    );
  });
});
