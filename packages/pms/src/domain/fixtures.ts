import { existsSync, readdirSync, statSync } from "fs";
import { basename, extname, join, resolve } from "path";

// Fixture-case resolution for PMS operations. Adapted from ax's fixtures
// domain at the PMS/Alexandria split: instead of looking a play up in
// Alexandria's PLAY_MANIFEST, the caller declares its fixtures directory and
// input keys directly — PMS operations own their metadata.

export class FixtureResolutionError extends Error {
  readonly operationId: string;

  constructor(operationId: string, message: string) {
    super(message);
    this.name = "FixtureResolutionError";
    this.operationId = operationId;
  }
}

export interface ResolveFixtureInputsOptions {
  caseName: string;
  cwd: string;
  operationId: string;
  fixturesDir: string;
  requiredInputs: readonly string[];
  /**
   * Every input key the operation understands. Defaults to `requiredInputs`.
   * Each declared key the case does not provide is bound to an empty string,
   * so an optional input can be legitimately omitted.
   */
  declaredInputs?: readonly string[];
}

// Resolve a named fixture case into a map of input bindings. Each entry
// `<key>.<ext>` (file) or `<key>` (directory) in the case directory binds
// input `<key>` to that entry's absolute path.
export function resolveFixtureInputs(
  options: ResolveFixtureInputsOptions,
): Record<string, string> | FixtureResolutionError {
  const requiredInputs = options.requiredInputs;
  const declaredKeys = options.declaredInputs ?? requiredInputs;

  const fixturesRoot = resolve(options.cwd, options.fixturesDir);
  const caseDir = join(fixturesRoot, options.caseName);

  if (!existsSync(caseDir) || !statSync(caseDir).isDirectory()) {
    const available = listCaseDirs(fixturesRoot);
    const availableHint =
      available.length > 0
        ? `Available cases: ${available.join(", ")}.`
        : `No fixture cases found under ${options.fixturesDir}.`;
    return new FixtureResolutionError(
      options.operationId,
      `Fixture case "${options.caseName}" not found for ${options.operationId} under ${options.fixturesDir}. ${availableHint}`,
    );
  }

  const caseEntries = readdirSync(caseDir, { withFileTypes: true }).filter(
    (entry) => (entry.isFile() || entry.isDirectory()) && !entry.name.startsWith("."),
  );
  if (caseEntries.length === 0) {
    return new FixtureResolutionError(
      options.operationId,
      `Fixture case "${options.caseName}" for ${options.operationId} has no files (looked in ${caseDir}).`,
    );
  }

  const declaredSet = new Set(declaredKeys);

  const inputs: Record<string, string> = {};
  // Pre-seed every declared input with an empty string so an optional input
  // the case omits never leaves an unresolved binding.
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
    // Only entries whose name matches a declared input key bind; a stray or
    // misspelled entry must not become a phantom input.
    if (!declaredSet.has(key)) {
      ignored.push(entry.name);
      continue;
    }
    if (bound.has(key)) {
      return new FixtureResolutionError(
        options.operationId,
        `Fixture case "${options.caseName}" for ${options.operationId} has more than one file for input "${key}" (${entry.name}); keep exactly one.`,
      );
    }
    bound.add(key);
    inputs[key] = join(caseDir, entry.name);
  }

  // A required input the case did not provide is an error — never run with an
  // empty required path.
  const missingRequired = requiredInputs.filter((key) => !bound.has(key));
  if (missingRequired.length > 0) {
    return new FixtureResolutionError(
      options.operationId,
      `Fixture case "${options.caseName}" for ${options.operationId} is missing required input(s): ${missingRequired.join(
        ", ",
      )} (expected ${missingRequired.map((key) => `${key}.<ext>`).join(", ")} in ${caseDir}).`,
    );
  }

  if (ignored.length > 0) {
    // Diagnostics on stderr (data stays on stdout).
    process.stderr.write(
      `pms --fixture ${options.caseName}: ignored entry(ies) not matching a declared input (${declaredKeys.join(
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
