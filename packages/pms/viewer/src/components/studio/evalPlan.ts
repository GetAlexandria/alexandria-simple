/**
 * Parser for a play's `risk-map.md` — the per-play source of truth the **Play
 * Testing** surface renders from (plan: docs/alexandria/plans/
 * testing-center-viewer-port/plan.md §2, §5). The file is the real plan: which
 * risks apply, which real fixture covers each, what's still open, and — once
 * evals run — the measured runs per test. The viewer **renders from this file;
 * it never owns or re-authors the content** (§1, the faithful-port mandate).
 *
 * This module is the *parse* half of that contract: text → typed rows, every
 * display string carried **verbatim**. It computes nothing — labels, scope
 * fill-circles, and the binding-constraint Status are *derived* by
 * `measurement.ts` (§3, the source→derived→display split). Keeping the two
 * apart is what the §8 source/derived audit enforces.
 *
 * The file's shape (see the exemplar, frame-the-problem/risk-map.md):
 *
 *   ---
 *   slug: frame-the-problem
 *   spine: research/testing/
 *   results: none-yet
 *   ---
 *
 *   ## Coverage — which risks apply
 *   | risk | state | where it's tested / why |
 *   |---|---|---|
 *   | IN-1 Buried signal | ○ gap | hard-case scatters evidence… |
 *
 *   ## Eval plan — tests per risk
 *   | risk | test | scope | type | built | target | runs | result |
 *   |---|---|---|---|---|---|---|---|
 *   | IN-1 | positional-invariance … | whole | metamorphic | no | 30 | 0 | — |
 *
 * The family a risk belongs to (Input / Reasoning / Output / Adversarial /
 * Chain) is encoded in its id prefix — canon from the spine (`research/testing/
 * RISKS.md`). We do **not** parse the spine here: the MVP renders one play from
 * its own file (§7); the shared-spine parser arrives when the master center is
 * abstracted (§4). `riskFamily()` exposes the prefix convention so the UI can
 * band rows without a second source.
 */

/** Coverage state — hand-authored in the file (source), the §6 vocabulary. */
export type CoverageState = "covered" | "partial" | "gap" | "n/a";

/** A test's scope — which seam of the play it exercises. */
export type TestScope = "node" | "seam" | "whole";

/** A test's method. */
export type TestType = "example" | "metamorphic" | "statistical" | "red-team";

/**
 * The intended sample size for a test (run-count policy, TESTING.md):
 * `count` — a stochastic eval's target k (smoke≈5 / estimate≈30 / ship-gate≥100).
 * `deterministic` — a mechanical check; n=1 is statistically sufficient.
 * `tbd` — not yet decided (the file carries `TBD`).
 */
export type EvalTarget =
  | { kind: "count"; n: number }
  | { kind: "deterministic"; n: number }
  | { kind: "tbd" };

/** One row of the Coverage table — which risks apply and their authored state. */
export interface CoverageRow {
  /** stable risk id, e.g. "IN-1", "CHN-1…5" — verbatim from the file */
  id: string;
  /** plain risk name, e.g. "Buried signal" — display, verbatim */
  name: string;
  /** hand-authored coverage state (source, never derived here) */
  state: CoverageState;
  /** the "where it's tested / why" prose — display, verbatim */
  rationale: string;
}

/** One row of the Eval plan table — a planned or built test against a risk. */
export interface EvalRow {
  /** the risk id this test covers — joins to CoverageRow.id */
  risk: string;
  /** the test description — display, verbatim */
  test: string;
  scope: TestScope;
  type: TestType;
  /** does the fixture exist today? (the file's `built` = yes/no) */
  built: boolean;
  /** intended sample size */
  target: EvalTarget;
  /** runs completed — `0` for everything until real evals run (source) */
  runs: number;
  /** the measured result cell, verbatim — `—` until a run fills it (source) */
  result: string;
}

export interface RiskMapFrontmatter {
  slug: string;
  spine: string;
  results: string;
}

export interface RiskMap {
  frontmatter: RiskMapFrontmatter;
  /** the Coverage table, in file order */
  coverage: CoverageRow[];
  /** the Eval plan table, in file order (a risk may carry several tests) */
  evals: EvalRow[];
}

export type RiskFamily = "Input" | "Reasoning" | "Output" | "Adversarial" | "Chain";

/**
 * The canonical prefix → family map — the single source of truth the surface
 * bands by. Exported so the drift-conformance gate (`riskMapConformance.test.ts`)
 * can assert it agrees with the spine (`RISKS.md`) and every per-play risk-map.
 */
export const FAMILY_BY_PREFIX: Record<string, RiskFamily> = {
  ADV: "Adversarial",
  CHN: "Chain",
  IN: "Input",
  OUT: "Output",
  RE: "Reasoning",
};

/**
 * The canonical family a risk id belongs to — its prefix (`IN-1` → Input), the
 * spine's phases (RISKS.md). Returns `null` for a prefix outside the canonical
 * taxonomy: there is **no "play-specific" family**. Tests are *shaped* to fit a
 * play, but every risk still classifies into a canonical family — a row whose id
 * has no canonical prefix (e.g. the legacy `FTP-*`, which are input/output/
 * adversarial/systemic risks in disguise) is *misfiled at source*. The surface
 * flags those as unclassified rather than legitimising a catch-all band.
 */
export function riskFamily(id: string): RiskFamily | null {
  const prefix = id.split("-")[0]?.toUpperCase() ?? "";
  return FAMILY_BY_PREFIX[prefix] ?? null;
}

interface MarkdownTable {
  header: string[];
  rows: string[][];
}

/** Split one `| a | b | c |` line into trimmed cells (drops the outer pipes). */
function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

/** A markdown separator row, e.g. `|---|:--:|---|`. */
function isSeparatorRow(line: string): boolean {
  return /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/.test(line);
}

/**
 * Extract every GitHub-style table from markdown: a header row, a `---`
 * separator, then body rows, all starting with `|`. Tables are matched
 * structurally (not by heading) so a reordering of the file's prose can't lose
 * one; callers pick the table they want by its header columns.
 */
function parseTables(text: string): MarkdownTable[] {
  const lines = text.split("\n");
  const tables: MarkdownTable[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const header = lines[i] ?? "";
    const separator = lines[i + 1] ?? "";
    const isTableHead =
      header.trim().startsWith("|") && !isSeparatorRow(header) && isSeparatorRow(separator);
    if (!isTableHead) {
      continue;
    }

    const rows: string[][] = [];
    let j = i + 2;
    for (; j < lines.length; j += 1) {
      const row = lines[j] ?? "";
      if (!row.trim().startsWith("|")) {
        break;
      }
      rows.push(splitRow(row));
    }
    tables.push({ header: splitRow(header), rows });
    i = j - 1;
  }

  return tables;
}

/** True when a table's header begins with exactly these column names. */
function headerMatches(table: MarkdownTable, columns: string[]): boolean {
  if (table.header.length < columns.length) {
    return false;
  }
  return columns.every((col, idx) => table.header[idx]?.toLowerCase() === col.toLowerCase());
}

const ID_AND_NAME = /^([A-Za-z]{2,5}-[0-9]+(?:…[0-9]+)?)\s+(.+)$/;

function parseCoverageState(cell: string): CoverageState {
  // Cells carry a fill-circle then the word, e.g. "○ gap"; "n/a" stands alone.
  const word = cell
    .replace(/[^a-zA-Z/]/g, " ")
    .trim()
    .split(/\s+/)
    .pop();
  switch (word) {
    case "covered":
      return "covered";
    case "partial":
      return "partial";
    case "gap":
      return "gap";
    case "n/a":
      return "n/a";
    default:
      throw new Error(`risk-map: unparseable coverage state "${cell}"`);
  }
}

function parseCoverageRow(cells: string[]): CoverageRow {
  const riskCell = cells[0] ?? "";
  const match = ID_AND_NAME.exec(riskCell);
  if (match == null) {
    throw new Error(`risk-map: coverage risk cell missing "<id> <name>": "${riskCell}"`);
  }
  return {
    id: match[1] ?? "",
    name: (match[2] ?? "").trim(),
    rationale: cells[2] ?? "",
    state: parseCoverageState(cells[1] ?? ""),
  };
}

function parseScope(cell: string): TestScope {
  const value = cell.trim().toLowerCase();
  if (value === "node" || value === "seam" || value === "whole") {
    return value;
  }
  throw new Error(`risk-map: unknown scope "${cell}"`);
}

function parseType(cell: string): TestType {
  const value = cell.trim().toLowerCase();
  if (
    value === "example" ||
    value === "metamorphic" ||
    value === "statistical" ||
    value === "red-team"
  ) {
    return value;
  }
  throw new Error(`risk-map: unknown test type "${cell}"`);
}

function parseTarget(cell: string): EvalTarget {
  const value = cell.trim();
  if (/^tbd$/i.test(value)) {
    return { kind: "tbd" };
  }
  const deterministic = /^(\d+)\s*\(det\)$/i.exec(value);
  if (deterministic != null) {
    return { kind: "deterministic", n: Number(deterministic[1]) };
  }
  if (/^\d+$/.test(value)) {
    return { kind: "count", n: Number(value) };
  }
  throw new Error(`risk-map: unparseable target "${cell}"`);
}

function parseBuilt(cell: string): boolean {
  const value = cell.trim().toLowerCase();
  if (value === "yes") {
    return true;
  }
  if (value === "no") {
    return false;
  }
  throw new Error(`risk-map: built must be yes/no, got "${cell}"`);
}

function parseRuns(cell: string): number {
  const value = cell.trim();
  if (!/^\d+$/.test(value)) {
    throw new Error(`risk-map: runs must be a count, got "${cell}"`);
  }
  return Number(value);
}

function parseEvalRow(cells: string[]): EvalRow {
  return {
    built: parseBuilt(cells[4] ?? ""),
    result: cells[7] ?? "",
    risk: (cells[0] ?? "").trim(),
    runs: parseRuns(cells[6] ?? ""),
    scope: parseScope(cells[2] ?? ""),
    target: parseTarget(cells[5] ?? ""),
    test: cells[1] ?? "",
    type: parseType(cells[3] ?? ""),
  };
}

function parseFrontmatter(text: string): RiskMapFrontmatter {
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  const fields = new Map<string, string>();
  if (match != null) {
    for (const line of (match[1] ?? "").split("\n")) {
      const kv = /^([a-zA-Z][\w-]*):\s*(.*)$/.exec(line);
      if (kv != null) {
        // Drop a trailing `# comment` (the exemplar annotates its fields).
        const value = (kv[2] ?? "").replace(/\s+#.*$/, "").trim();
        fields.set((kv[1] ?? "").toLowerCase(), value);
      }
    }
  }
  return {
    results: fields.get("results") ?? "",
    slug: fields.get("slug") ?? "",
    spine: fields.get("spine") ?? "",
  };
}

const COVERAGE_HEADER = ["risk", "state"];
const EVAL_HEADER = ["risk", "test", "scope", "type", "built", "target", "runs", "result"];

/**
 * Parse a play's `risk-map.md` into typed rows. Throws on a malformed table or
 * an unparseable cell rather than rendering a guess (plan §10: "a malformed
 * table fails loudly, never renders a guess"). Display strings (name,
 * rationale, test, result) are carried verbatim — the no-drift guarantee.
 */
export function parseRiskMap(text: string): RiskMap {
  const tables = parseTables(text);
  const coverageTable = tables.find((t) => headerMatches(t, COVERAGE_HEADER));
  const evalTable = tables.find((t) => headerMatches(t, EVAL_HEADER));

  if (coverageTable == null) {
    throw new Error("risk-map: no Coverage table (| risk | state | … |)");
  }
  if (evalTable == null) {
    throw new Error("risk-map: no Eval plan table (| risk | test | scope | … |)");
  }

  return {
    coverage: coverageTable.rows.map(parseCoverageRow),
    evals: evalTable.rows.map(parseEvalRow),
    frontmatter: parseFrontmatter(text),
  };
}

/** The eval-plan tests that cover a given risk id (a risk may carry several). */
export function testsForRisk(map: RiskMap, riskId: string): EvalRow[] {
  return map.evals.filter((row) => row.risk === riskId);
}
