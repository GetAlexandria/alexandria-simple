import { existsSync, readdirSync, statSync } from "fs";
import { basename, extname, join, resolve } from "path";
import { declaredWorkflowInputKeys } from "./orchestration.js";
import { PLAY_MANIFEST, type PlayId } from "./plays.js";

export class FixtureResolutionError extends Error {
  readonly playId: PlayId;

  constructor(playId: PlayId, message: string) {
    super(message);
    this.name = "FixtureResolutionError";
    this.playId = playId;
  }
}

export interface ResolveFixtureInputsOptions {
  caseName: string;
  cwd: string;
  env?: NodeJS.ProcessEnv | undefined;
  playId: PlayId;
}

// Resolve a named fixture case for a play into a map of workflow input
// bindings. Each file `<key>.<ext>` in the case directory binds workflow
// input `<key>` to that file's absolute path. Inputs are consumed as file
// paths, so the absolute path keeps the binding valid inside the sandboxed
// run regardless of the process cwd.
//
// Every input the play declares (via `__AX_INPUT_<KEY>__` placeholders in
// its package prompts) that the case does NOT provide is bound to an empty
// string, so no placeholder is left unresolved. The prompts treat an empty
// path as "input not provided", which is how a case can legitimately omit an
// optional input (e.g. `golden` with no `prior_brief.md`).
export function resolveFixtureInputs(
  options: ResolveFixtureInputsOptions,
): Record<string, string> | FixtureResolutionError {
  const env = options.env ?? process.env;
  // The manifest is declared `as const`, so the `fixturesDir` field only
  // appears in the literal type of entries that set it. Read it through the
  // optional-field view so plays without one resolve to `undefined`.
  const manifestEntry = PLAY_MANIFEST[options.playId] as {
    fixturesDir?: string;
    requiredInputs?: readonly string[];
  };
  const fixturesDir = manifestEntry.fixturesDir;
  const requiredInputs = manifestEntry.requiredInputs ?? [];

  if (fixturesDir == null) {
    return new FixtureResolutionError(
      options.playId,
      `Play ${options.playId} has no fixtures directory in the play manifest, so --fixture is not supported for it.`,
    );
  }

  const fixturesRoot = resolve(options.cwd, fixturesDir);
  const caseDir = join(fixturesRoot, options.caseName);

  if (!existsSync(caseDir) || !statSync(caseDir).isDirectory()) {
    const available = listCaseDirs(fixturesRoot);
    const availableHint =
      available.length > 0
        ? `Available cases: ${available.join(", ")}.`
        : `No fixture cases found under ${fixturesDir}.`;
    return new FixtureResolutionError(
      options.playId,
      `Fixture case "${options.caseName}" not found for play ${options.playId} under ${fixturesDir}. ${availableHint}`,
    );
  }

  const caseEntries = readdirSync(caseDir, { withFileTypes: true }).filter(
    (entry) => (entry.isFile() || entry.isDirectory()) && !entry.name.startsWith("."),
  );
  if (caseEntries.length === 0) {
    return new FixtureResolutionError(
      options.playId,
      `Fixture case "${options.caseName}" for play ${options.playId} has no files (looked in ${caseDir}).`,
    );
  }

  const declaredKeys = declaredWorkflowInputKeys(options.playId, env, options.cwd);
  const declaredSet = new Set(declaredKeys);

  const inputs: Record<string, string> = {};
  // Pre-seed every declared input with an empty string so an optional input the
  // case omits never leaves an unresolved placeholder; the prompts treat an
  // empty path as "input not provided".
  for (const key of declaredKeys) {
    inputs[key] = "";
  }

  const bound = new Set<string>();
  const ignored: string[] = [];
  for (const entry of caseEntries) {
    // README is the case's bound-behavior doc, not an input.
    if (entry.name.toLowerCase() === "readme.md") {
      continue;
    }
    const key = entry.isDirectory() ? entry.name : basename(entry.name, extname(entry.name));
    if (key.length === 0) {
      continue;
    }
    // Only entries (files or directories) whose name matches a declared input
    // key bind. A stray or misspelled entry must not become a phantom input —
    // and must not shadow the real key (the empty pre-seed) with an unrelated
    // path.
    if (!declaredSet.has(key)) {
      ignored.push(entry.name);
      continue;
    }
    if (bound.has(key)) {
      return new FixtureResolutionError(
        options.playId,
        `Fixture case "${options.caseName}" for play ${options.playId} has more than one file for input "${key}" (${entry.name}); keep exactly one.`,
      );
    }
    bound.add(key);
    inputs[key] = join(caseDir, entry.name);
  }

  // A required input the case did not provide is an error — never run with an
  // empty required path and rely on the agent voluntarily refusing.
  const missingRequired = requiredInputs.filter((key) => !bound.has(key));
  if (missingRequired.length > 0) {
    return new FixtureResolutionError(
      options.playId,
      `Fixture case "${options.caseName}" for play ${options.playId} is missing required input(s): ${missingRequired.join(
        ", ",
      )} (expected ${missingRequired.map((key) => `${key}.<ext>`).join(", ")} in ${caseDir}).`,
    );
  }

  if (ignored.length > 0) {
    // Diagnostics on stderr (data stays on stdout): surface stray/misspelled
    // entries so a typo'd input name is visible rather than silently dropped.
    process.stderr.write(
      `ax run --fixture ${options.caseName}: ignored entry(ies) not matching a declared input (${declaredKeys.join(
        ", ",
      )}): ${ignored.join(", ")}\n`,
    );
  }

  return inputs;
}

function listCaseDirs(fixturesRoot: string): string[] {
  if (!existsSync(fixturesRoot)) {
    return [];
  }

  try {
    return readdirSync(fixturesRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}
