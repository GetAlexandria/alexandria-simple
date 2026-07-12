import { existsSync, readdirSync, readFileSync } from "fs";
import { join, relative, resolve } from "path";

const RUNNER_ID = "el5-atomic-card-eval.v1";
const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const CASES_ROOT = join(REPO_ROOT, "packages/ax/tests/eval-cases");

interface EvalCheckConfig {
  description: string;
  file: string;
  contains?: string[];
  notContains?: string[];
}

interface EvalCaseConfig {
  caseId: string;
  description: string;
  checks: EvalCheckConfig[];
}

interface CheckResult {
  description: string;
  file: string;
  ok: boolean;
  failures: string[];
}

interface CaseResult {
  caseId: string;
  description: string;
  ok: boolean;
  checks: CheckResult[];
}

function usage(): string {
  return [
    "Usage: pnpm eval -- <command> [target]",
    "",
    "EL5 atomic-card workflow eval substitute for this checkout.",
    "",
    "Commands:",
    "  list                         List available eval cases.",
    "  run <target>                 Run one case, <surface>/all, or all.",
    "",
    "Targets:",
    "  atomic-card-planning/all",
    "  atomic-card-creation/all",
    "  build-atomic-card/all",
    "  all",
  ].join("\n");
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] | undefined {
  if (value == null) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error("Expected an array of strings.");
  }
  return value;
}

function parseCase(path: string): EvalCaseConfig {
  const value = readJson(path);
  if (!isRecord(value)) {
    throw new Error(`Eval case ${path} must be an object.`);
  }
  if (typeof value.caseId !== "string" || value.caseId.length === 0) {
    throw new Error(`Eval case ${path} is missing caseId.`);
  }
  if (typeof value.description !== "string" || value.description.length === 0) {
    throw new Error(`Eval case ${path} is missing description.`);
  }
  if (!Array.isArray(value.checks)) {
    throw new Error(`Eval case ${path} is missing checks.`);
  }
  return {
    caseId: value.caseId,
    description: value.description,
    checks: value.checks.map((check, index) => {
      if (!isRecord(check)) {
        throw new Error(`Eval case ${path} check ${index} must be an object.`);
      }
      if (typeof check.description !== "string" || check.description.length === 0) {
        throw new Error(`Eval case ${path} check ${index} is missing description.`);
      }
      if (typeof check.file !== "string" || check.file.length === 0) {
        throw new Error(`Eval case ${path} check ${index} is missing file.`);
      }
      const contains = stringArray(check.contains);
      const notContains = stringArray(check.notContains);
      return {
        description: check.description,
        file: check.file,
        ...(contains == null ? {} : { contains }),
        ...(notContains == null ? {} : { notContains }),
      };
    }),
  };
}

function findCaseFiles(dir = CASES_ROOT): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findCaseFiles(path));
    } else if (entry.isFile() && entry.name === "config.json") {
      out.push(path);
    }
  }
  return out.sort();
}

function loadCases(): EvalCaseConfig[] {
  return findCaseFiles()
    .map(parseCase)
    .sort((a, b) => a.caseId.localeCompare(b.caseId));
}

function selectCases(cases: EvalCaseConfig[], target: string): EvalCaseConfig[] {
  if (target === "all") return cases;
  if (target.endsWith("/all")) {
    const prefix = target.slice(0, -"/all".length);
    return cases.filter((candidate) => candidate.caseId.startsWith(`${prefix}/`));
  }
  return cases.filter((candidate) => candidate.caseId === target);
}

function runCase(testCase: EvalCaseConfig): CaseResult {
  const checks = testCase.checks.map((check) => {
    const path = resolve(REPO_ROOT, check.file);
    const failures: string[] = [];
    if (!existsSync(path)) {
      failures.push(`missing file ${check.file}`);
      return {
        description: check.description,
        file: check.file,
        failures,
        ok: false,
      };
    }

    const content = readFileSync(path, "utf8");
    for (const expected of check.contains ?? []) {
      if (!content.includes(expected)) {
        failures.push(`missing required text: ${JSON.stringify(expected)}`);
      }
    }
    for (const forbidden of check.notContains ?? []) {
      if (content.includes(forbidden)) {
        failures.push(`forbidden text present: ${JSON.stringify(forbidden)}`);
      }
    }
    return {
      description: check.description,
      file: relative(REPO_ROOT, path),
      failures,
      ok: failures.length === 0,
    };
  });
  return {
    caseId: testCase.caseId,
    checks,
    description: testCase.description,
    ok: checks.every((check) => check.ok),
  };
}

function listCases(cases: EvalCaseConfig[]): void {
  for (const testCase of cases) {
    console.log(`${testCase.caseId}\t${testCase.description}`);
  }
}

function run(target: string): number {
  const cases = loadCases();
  const selected = selectCases(cases, target);
  if (selected.length === 0) {
    console.error(`No eval cases match target: ${target}`);
    return 2;
  }

  const results = selected.map(runCase);
  const checkCount = results.reduce((sum, result) => sum + result.checks.length, 0);
  const failedCases = results.filter((result) => !result.ok).length;
  console.log(
    JSON.stringify(
      {
        runner: RUNNER_ID,
        target,
        totals: {
          cases: results.length,
          checks: checkCount,
          failedCases,
        },
        cases: results,
      },
      null,
      2,
    ),
  );
  return failedCases === 0 ? 0 : 1;
}

function main(): number {
  const [command, target] = process.argv.slice(2);
  if (command == null || command === "--help" || command === "-h") {
    console.log(usage());
    return 0;
  }
  if (command === "list") {
    listCases(loadCases());
    return 0;
  }
  if (command === "run") {
    if (target == null) {
      console.error("Missing eval target.\n\n" + usage());
      return 2;
    }
    return run(target);
  }
  console.error(`Unsupported eval command: ${command}\n\n${usage()}`);
  return 2;
}

process.exit(main());
