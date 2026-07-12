export const MAKE_A_PLAY_MODULE_IDS = [
  "make-a-play:design",
  "make-a-play:build",
  "make-a-play:prove",
] as const;

export type MakeAPlayModulePlayId = (typeof MAKE_A_PLAY_MODULE_IDS)[number];
export type MakeAPlayModule = "build" | "design" | "prove";
export type MakeAPlayDoerTag = "command" | "contract" | "human-gate" | "judgment";

export const MAKE_A_PLAY_DOER_TAGS = [
  "judgment",
  "command",
  "human-gate",
  "contract",
] as const satisfies readonly MakeAPlayDoerTag[];

const MAKE_A_PLAY_DOER_TAG_SET = new Set<string>(MAKE_A_PLAY_DOER_TAGS);

export const MAKE_A_PLAY_PHASES = {
  design: ["Ground", "Draft", "Harden", "Gate 1"],
  build: ["Derive", "Lint", "Fixtures", "Register-to-run"],
  prove: ["Run", "Grade", "Write-back", "Advance/Hold", "Register-live"],
} as const satisfies Record<MakeAPlayModule, readonly string[]>;

export const MAKE_A_PLAY_RESTING_STAGE = {
  design: "designed",
  build: "built",
  prove: "live",
} as const satisfies Record<MakeAPlayModule, string>;

export function isMakeAPlayModulePlayId(value: string): value is MakeAPlayModulePlayId {
  return (MAKE_A_PLAY_MODULE_IDS as readonly string[]).includes(value);
}

export function makeAPlayModuleFromPlayId(playId: MakeAPlayModulePlayId): MakeAPlayModule {
  return playId.slice("make-a-play:".length) as MakeAPlayModule;
}

export interface MakeAPlayGraphValidation {
  doerTags: Record<string, MakeAPlayDoerTag>;
  errors: string[];
}

export function extractMakeAPlayDoerTags(brief: string): MakeAPlayGraphValidation {
  const sectionStart = brief.indexOf("## 4.");
  const sectionEnd = brief.indexOf("## 5.", sectionStart < 0 ? 0 : sectionStart);
  const section =
    sectionStart < 0 ? "" : brief.slice(sectionStart, sectionEnd < 0 ? brief.length : sectionEnd);
  const errors: string[] = [];
  const doerTags: Record<string, MakeAPlayDoerTag> = {};
  let currentNode: string | null = null;
  let currentDoerCount = 0;
  let inGraphFence = false;

  for (const rawLine of section.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+$/, "");
    if (line.trim() === "```") {
      if (inGraphFence && currentNode != null && currentDoerCount !== 1) {
        errors.push(`${currentNode} must declare exactly one doer tag.`);
      }
      inGraphFence = !inGraphFence;
      currentNode = null;
      currentDoerCount = 0;
      continue;
    }
    if (!inGraphFence) {
      continue;
    }

    const nodeMatch = /^([a-z][a-z0-9_]*):(?:\s|$)/.exec(line);
    if (nodeMatch?.[1] != null) {
      if (currentNode != null && currentDoerCount !== 1) {
        errors.push(`${currentNode} must declare exactly one doer tag.`);
      }
      currentNode = nodeMatch[1];
      currentDoerCount = 0;
      continue;
    }

    const doerMatch = /^\s+doer:\s+(.+?)\s*$/.exec(line);
    if (doerMatch?.[1] == null || currentNode == null) {
      continue;
    }
    currentDoerCount += 1;
    const rawDoer = doerMatch[1].replace(/\s*\(.*$/, "").trim();
    if (!MAKE_A_PLAY_DOER_TAG_SET.has(rawDoer)) {
      errors.push(
        `${currentNode} declares invalid doer tag "${rawDoer}" (valid: ${MAKE_A_PLAY_DOER_TAGS.join(", ")}).`,
      );
      continue;
    }
    doerTags[currentNode] = rawDoer as MakeAPlayDoerTag;
  }

  if (currentNode != null && currentDoerCount !== 1) {
    errors.push(`${currentNode} must declare exactly one doer tag.`);
  }
  if (Object.keys(doerTags).length === 0) {
    errors.push("No §4 move graph nodes with doer tags were found.");
  }

  return { doerTags, errors };
}

export type AutoAdvanceConditionName =
  | "independent-grade"
  | "no-regression"
  | "no-unclassified-failure"
  | "proof-spec"
  | "tier-bar";

export interface CoverageRow {
  risk: string;
  state: "covered" | "gap" | "na" | "partial";
}

export interface EvalRow {
  built: boolean | null;
  result: string;
  risk: string;
  runs: number | null;
  targetRuns: number | null;
  test: string;
}

export interface GradeItem {
  classification: "classified" | "unclassified";
  id: string;
}

export interface BaselineComparison {
  currentPassRate: number;
  requiredPassRate: number;
}

export interface AutoAdvanceInput {
  authorIdentity: string | null;
  authorRunId: string | null;
  baseline?: BaselineComparison | undefined;
  coverageRows: readonly CoverageRow[];
  evalRows: readonly EvalRow[];
  factoryAgent?: string | undefined;
  factoryDivision?: string | undefined;
  factoryFunction?: string | undefined;
  gradeItems?: readonly GradeItem[] | undefined;
  graderIdentity: string | null;
  graderRunId: string | null;
  play: string;
  playRunId: string;
  producedByPlayId?: string | undefined;
}

export interface AutoAdvanceConditionResult {
  pass: boolean;
  reason?: string;
}

export interface AutoAdvanceHeldItem {
  conditions: AutoAdvanceConditionName[];
  play: string;
  reason: string;
}

export interface AutoAdvanceProvenanceFact {
  idempotencyKey: string;
  payload: {
    factoryAgent: string;
    factoryDivision: string;
    factoryFunction: string;
    playId: string;
    playRunId: string;
    producedByPlayId: string;
  };
  type: "play.provenance_recorded";
}

export interface AutoAdvanceResult {
  conditions: Record<AutoAdvanceConditionName, AutoAdvanceConditionResult>;
  decision: "held" | "register_live";
  failingConditions: AutoAdvanceConditionName[];
  held: AutoAdvanceHeldItem[];
  play: string;
  provenanceFact?: AutoAdvanceProvenanceFact;
  tag: "auto" | "held";
}

function condition(pass: boolean, reason?: string): AutoAdvanceConditionResult {
  return {
    pass,
    ...(reason == null || reason.length === 0 ? {} : { reason }),
  };
}

function firstInteger(value: string): number | null {
  const match = value.match(/\d+/);
  return match == null ? null : Number(match[0]);
}

function splitMarkdownRow(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return [];
  }
  return trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim().replace(/\s+/g, " "));
}

function parseCoverageState(value: string): CoverageRow["state"] | null {
  const normalized = value.toLowerCase();
  if (normalized.includes("n/a")) {
    return "na";
  }
  if (normalized.includes("gap") || normalized.includes("○")) {
    return "gap";
  }
  if (normalized.includes("partial") || normalized.includes("◐")) {
    return "partial";
  }
  if (normalized.includes("covered") || normalized.includes("●")) {
    return "covered";
  }
  return null;
}

function parseBuilt(value: string): boolean | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "yes") {
    return true;
  }
  if (normalized === "no") {
    return false;
  }
  return null;
}

export function parseRiskMapForAutoAdvance(source: string): {
  coverageRows: CoverageRow[];
  evalRows: EvalRow[];
} {
  const coverageRows: CoverageRow[] = [];
  const evalRows: EvalRow[] = [];
  let table: "coverage" | "eval" | null = null;

  for (const line of source.split(/\r?\n/)) {
    const cells = splitMarkdownRow(line);
    if (cells.length === 0) {
      continue;
    }

    const header = cells.map((cell) => cell.toLowerCase()).join("|");
    if (header === "risk|state|where it's tested / why") {
      table = "coverage";
      continue;
    }
    if (header === "risk|test|scope|type|built|target|runs|result") {
      table = "eval";
      continue;
    }
    if (cells.every((cell) => /^:?-+:?$/.test(cell))) {
      continue;
    }

    if (table === "coverage" && cells.length >= 2) {
      const state = parseCoverageState(cells[1] ?? "");
      const risk = cells[0]?.trim();
      if (risk != null && risk.length > 0 && state != null) {
        coverageRows.push({ risk, state });
      }
      continue;
    }

    if (table === "eval" && cells.length >= 8) {
      const risk = cells[0]?.trim();
      const test = cells[1]?.trim();
      if (risk == null || risk.length === 0 || test == null || test.length === 0) {
        continue;
      }
      evalRows.push({
        built: parseBuilt(cells[4] ?? ""),
        result: cells[7] ?? "",
        risk,
        runs: firstInteger(cells[6] ?? ""),
        targetRuns: firstInteger(cells[5] ?? ""),
        test,
      });
    }
  }

  return { coverageRows, evalRows };
}

export function evaluateAutoAdvanceContract(input: AutoAdvanceInput): AutoAdvanceResult {
  const tierFailures = input.evalRows.filter(
    (row) =>
      row.built === true &&
      (row.targetRuns == null || row.runs == null || row.runs < row.targetRuns),
  );
  const proofSpecFailures = input.coverageRows.filter(
    (row) => row.state === "gap" || row.state === "partial",
  );
  const gradeReportMissing = input.gradeItems == null || input.gradeItems.length === 0;
  const unclassifiedFailures = (input.gradeItems ?? []).filter(
    (item) => item.classification === "unclassified",
  );
  const baseline = input.baseline;
  const baselineMissing = baseline == null;
  const regressionFailed = baseline == null || baseline.currentPassRate < baseline.requiredPassRate;
  const independentGradeFailed =
    input.authorRunId == null ||
    input.graderRunId == null ||
    input.authorRunId === input.graderRunId ||
    input.authorIdentity == null ||
    input.graderIdentity == null ||
    input.authorIdentity === input.graderIdentity;

  const conditions: Record<AutoAdvanceConditionName, AutoAdvanceConditionResult> = {
    "tier-bar": condition(
      tierFailures.length === 0,
      tierFailures.length === 0
        ? undefined
        : `${tierFailures.length} built eval row(s) are below the required estimate/ship gate or missing run counts.`,
    ),
    "proof-spec": condition(
      proofSpecFailures.length === 0,
      proofSpecFailures.length === 0
        ? undefined
        : `${proofSpecFailures.length} applicable risk row(s) remain partial or gap.`,
    ),
    "no-unclassified-failure": condition(
      !gradeReportMissing && unclassifiedFailures.length === 0,
      gradeReportMissing
        ? "Independent grade report is required."
        : unclassifiedFailures.length === 0
          ? undefined
          : `${unclassifiedFailures.length} grade item(s) are unclassified.`,
    ),
    "no-regression": condition(
      !regressionFailed,
      baselineMissing
        ? "Baseline comparison is required."
        : regressionFailed
          ? `Current pass rate ${baseline.currentPassRate} is below baseline ${baseline.requiredPassRate}.`
          : undefined,
    ),
    "independent-grade": condition(
      !independentGradeFailed,
      independentGradeFailed
        ? "Author and grader run identity must both be present and distinct."
        : undefined,
    ),
  };

  const failingConditions = (Object.keys(conditions) as AutoAdvanceConditionName[]).filter(
    (name) => !conditions[name].pass,
  );

  if (failingConditions.length > 0) {
    return {
      conditions,
      decision: "held",
      failingConditions,
      held: [
        {
          conditions: failingConditions,
          play: input.play,
          reason: failingConditions.map((name) => conditions[name].reason ?? name).join(" "),
        },
      ],
      play: input.play,
      tag: "held",
    };
  }

  const producedByPlayId = input.producedByPlayId ?? "make-a-play";
  const provenanceFact: AutoAdvanceProvenanceFact = {
    idempotencyKey: `${producedByPlayId}:${input.play}:${input.playRunId}:built-by`,
    payload: {
      factoryAgent: input.factoryAgent ?? "William",
      factoryDivision: input.factoryDivision ?? "PlaymakerStudio",
      factoryFunction: input.factoryFunction ?? "Production",
      playId: input.play,
      playRunId: input.playRunId,
      producedByPlayId,
    },
    type: "play.provenance_recorded",
  };

  return {
    conditions,
    decision: "register_live",
    failingConditions,
    held: [],
    play: input.play,
    provenanceFact,
    tag: "auto",
  };
}
