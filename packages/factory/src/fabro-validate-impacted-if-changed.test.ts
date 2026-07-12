import { describe, expect, test } from "bun:test";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const validatorScript = resolve(repoRoot, "scripts/fabro-validate-impacted-if-changed");

const conformanceTestPaths = [
  "packages/pms/viewer/src/components/studio/bankConformance.test.ts",
  "packages/pms/viewer/src/components/studio/riskMapConformance.test.ts",
  "packages/pms/viewer/src/components/studio/placeholderConformance.test.ts",
] as const;

const conformanceCommand = `bun test ${conformanceTestPaths.join(" ")}`;

type Fixture = {
  binDir: string;
  logPath: string;
  repoDir: string;
  rootDir: string;
};

const writeExecutable = (path: string, contents: string): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  chmodSync(path, 0o755);
};

const runGit = (repoDir: string, args: string[]): void => {
  const result = spawnSync("git", args, { cwd: repoDir, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(
      `git ${args.join(" ")} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
};

const initGitRepo = (repoDir: string): void => {
  const init = spawnSync("git", ["init", "-b", "main"], { cwd: repoDir, encoding: "utf8" });
  if (init.status === 0) {
    return;
  }

  runGit(repoDir, ["init"]);
  runGit(repoDir, ["checkout", "-b", "main"]);
};

const createFixture = (): Fixture => {
  const rootDir = mkdtempSync(join(tmpdir(), "fabro-validate-impacted-"));
  const repoDir = join(rootDir, "repo");
  const binDir = join(rootDir, "bin");
  const logPath = join(rootDir, "commands.log");

  mkdirSync(repoDir, { recursive: true });
  mkdirSync(binDir, { recursive: true });
  initGitRepo(repoDir);

  mkdirSync(join(repoDir, "scripts"), { recursive: true });
  copyFileSync(validatorScript, join(repoDir, "scripts/fabro-validate-impacted-if-changed"));

  writeExecutable(
    join(repoDir, "scripts/fabro-validate-plugin-if-changed"),
    `#!/usr/bin/env bash
set -euo pipefail
printf 'plugin-validator\\n' >>"$COMMAND_LOG"
`,
  );

  writeExecutable(
    join(repoDir, "studio/tools/check.sh"),
    `#!/usr/bin/env sh
set -eu
printf 'studio-check\\n' >>"$COMMAND_LOG"
`,
  );

  writeExecutable(
    join(binDir, "pnpm"),
    `#!/usr/bin/env bash
set -euo pipefail
printf 'pnpm %s\\n' "$*" >>"$COMMAND_LOG"
`,
  );

  writeExecutable(
    join(binDir, "bun"),
    `#!/usr/bin/env bash
set -euo pipefail
printf 'bun %s\\n' "$*" >>"$COMMAND_LOG"
if [ "\${BUN_FAIL_CONFORMANCE:-}" = "1" ]; then
\tprintf 'fake conformance failure: build-atomic-card > prompts/draft_or_repair.md\\n' >&2
\texit 1
fi
`,
  );

  runGit(repoDir, ["add", "."]);
  runGit(repoDir, [
    "-c",
    "user.name=Fabro Test",
    "-c",
    "user.email=fabro-test@example.com",
    "commit",
    "-m",
    "baseline",
  ]);

  return { binDir, logPath, repoDir, rootDir };
};

const removeFixture = (fixture: Fixture): void => {
  rmSync(fixture.rootDir, { recursive: true, force: true });
};

const addChangedFile = (fixture: Fixture, path: string): void => {
  const fullPath = join(fixture.repoDir, path);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, "changed\n");
};

const runValidator = (
  fixture: Fixture,
  options: { bunFailConformance?: boolean } = {},
): SpawnSyncReturns<string> =>
  spawnSync("bash", ["scripts/fabro-validate-impacted-if-changed"], {
    cwd: fixture.repoDir,
    encoding: "utf8",
    env: {
      ...process.env,
      BUN_FAIL_CONFORMANCE: options.bunFailConformance ? "1" : "",
      COMMAND_LOG: fixture.logPath,
      FABRO_VALIDATE_BASE_REF: "HEAD",
      PATH: `${fixture.binDir}${delimiter}${process.env.PATH ?? ""}`,
    },
  });

const readCommandLog = (fixture: Fixture): string[] => {
  if (!existsSync(fixture.logPath)) {
    return [];
  }
  return readFileSync(fixture.logPath, "utf8").split(/\r?\n/).filter(Boolean);
};

const countConformanceRuns = (commands: string[]): number =>
  commands.filter((command) => command === conformanceCommand).length;

describe("fabro-validate-impacted-if-changed branch selection", () => {
  test("plugin-only changes run plugin validation and the Studio/plugin conformance gate", () => {
    const fixture = createFixture();
    try {
      addChangedFile(
        fixture,
        "packages/alexandria-plugin/workflows/build-atomic-card/prompts/draft_or_repair.md",
      );

      const result = runValidator(fixture);
      const commands = readCommandLog(fixture);

      expect(result.status).toBe(0);
      expect(commands.filter((command) => command === "plugin-validator")).toHaveLength(1);
      expect(countConformanceRuns(commands)).toBe(1);
      expect(commands).toContain("pnpm run lint:markdown");
      expect(commands).not.toContain("studio-check");
      expect(commands).not.toContain("pnpm --filter @alexandria/viewer run test");
    } finally {
      removeFixture(fixture);
    }
  });

  test("plugin-only conformance failures exit nonzero and preserve gate output", () => {
    const fixture = createFixture();
    try {
      addChangedFile(
        fixture,
        "packages/alexandria-plugin/workflows/build-atomic-card/prompts/draft_or_repair.md",
      );

      const result = runValidator(fixture, { bunFailConformance: true });
      const commands = readCommandLog(fixture);

      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toContain(
        "fake conformance failure: build-atomic-card > prompts/draft_or_repair.md",
      );
      expect(commands.filter((command) => command === "plugin-validator")).toHaveLength(1);
      expect(countConformanceRuns(commands)).toBe(1);
    } finally {
      removeFixture(fixture);
    }
  });

  test("Studio-only changes run Studio checks and the Studio/plugin conformance gate", () => {
    const fixture = createFixture();
    try {
      addChangedFile(fixture, "studio/plays/build-atomic-card/prompts/draft_or_repair.md");

      const result = runValidator(fixture);
      const commands = readCommandLog(fixture);

      expect(result.status).toBe(0);
      expect(commands.filter((command) => command === "studio-check")).toHaveLength(1);
      expect(commands).toContain("pnpm run lint:library-stories");
      expect(commands).toContain("pnpm run lint:markdown");
      expect(countConformanceRuns(commands)).toBe(1);
      expect(commands).not.toContain("plugin-validator");
    } finally {
      removeFixture(fixture);
    }
  });

  test("viewer-touching changes run the full viewer suite without rerunning the subset", () => {
    const fixture = createFixture();
    try {
      addChangedFile(fixture, "packages/viewer/src/components/studio/PlayTrackerTab.tsx");

      const result = runValidator(fixture);
      const commands = readCommandLog(fixture);

      expect(result.status).toBe(0);
      expect(commands).toContain("pnpm --filter @alexandria/viewer run format:check");
      expect(commands).toContain("pnpm --filter @alexandria/viewer run check");
      expect(commands).toContain("pnpm --filter @alexandria/viewer run build");
      expect(commands).toContain("pnpm --filter @alexandria/viewer run test");
      expect(commands).toContain("pnpm --filter @alexandria/viewer run test:e2e");
      expect(countConformanceRuns(commands)).toBe(0);
      expect(commands).not.toContain("plugin-validator");
      expect(commands).not.toContain("studio-check");
    } finally {
      removeFixture(fixture);
    }
  });

  test("plugin and Studio changes together run the conformance gate once", () => {
    const fixture = createFixture();
    try {
      addChangedFile(
        fixture,
        "packages/alexandria-plugin/workflows/build-atomic-card/prompts/draft_or_repair.md",
      );
      addChangedFile(fixture, "studio/plays/build-atomic-card/prompts/draft_or_repair.md");

      const result = runValidator(fixture);
      const commands = readCommandLog(fixture);

      expect(result.status).toBe(0);
      expect(commands.filter((command) => command === "plugin-validator")).toHaveLength(1);
      expect(commands.filter((command) => command === "studio-check")).toHaveLength(1);
      expect(commands).toContain("pnpm run lint:library-stories");
      expect(countConformanceRuns(commands)).toBe(1);
    } finally {
      removeFixture(fixture);
    }
  });

  test("unrelated non-markdown changes skip package validators and the conformance gate", () => {
    const fixture = createFixture();
    try {
      addChangedFile(fixture, "docs/example.txt");

      const result = runValidator(fixture);
      const commands = readCommandLog(fixture);

      expect(result.status).toBe(0);
      expect(commands).toEqual([]);
      expect(result.stdout).toContain(
        "No package-specific validators matched changed files; relying on review and verification stages.",
      );
    } finally {
      removeFixture(fixture);
    }
  });

  test("unrelated markdown changes run markdown lint but skip the conformance gate", () => {
    const fixture = createFixture();
    try {
      addChangedFile(fixture, "docs/example.md");

      const result = runValidator(fixture);
      const commands = readCommandLog(fixture);

      expect(result.status).toBe(0);
      expect(commands).toEqual(["pnpm run lint:markdown"]);
      expect(countConformanceRuns(commands)).toBe(0);
    } finally {
      removeFixture(fixture);
    }
  });
});
