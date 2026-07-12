import { useEffect, useMemo, useState } from "react";
import * as Effect from "effect/Effect";
import { fetchStudioFile, fetchStudioRecords, fetchStudioValidate } from "../../app/runtime/studio";
import {
  parseRiskMap,
  riskFamily,
  type CoverageRow,
  type EvalRow,
  type EvalTarget,
  type RiskFamily,
  type RiskMap,
} from "./evalPlan";
import {
  bindingLabel,
  labelTest,
  statusGlyph,
  type FillStatus,
  type MeasurementInput,
  type TestLabel,
} from "./measurement";
import {
  contractsFromFiles,
  runPreflight,
  type CheckStatus,
  type FabroValidation,
  type GateStatus,
  type PreflightReport,
} from "./preflight";
import { runDiagnostics, type DiagnosticLevel, type DiagnosticsReport } from "./diagnostics";
import { filePointers, parseWorkflowGraph, type WorkflowGraph } from "./workflowGraph";
import { type PromptContract } from "./promptContract";

/**
 * Play Testing — the projection that replaces the old "Fixtures & behaviors"
 * file-tree with the testing surface (plan: docs/alexandria/plans/
 * testing-center-viewer-port/plan.md §6). It renders **from the play's own
 * `risk-map.md`** via `parseRiskMap`, and derives every label/Status via
 * `measurement.ts` — it holds **zero canon strings** (§7): all risk names and
 * descriptions come from the file, only the surface vocabulary is literal here.
 *
 * The three lenses (Preflight / Diagnostics / Coverage) are chosen in the play
 * page's **left nav**, the same gesture as Design's sub-nav — `PlayPage` owns
 * which tab is active and passes it in. This component renders that one tab.
 *
 * Two axes, shown honestly (a deliberate divergence from the plan's single
 * derived "Status", flagged for review). In the MVP no evals have run, so a
 * hand-assessed "covered" and a measured pass rate genuinely disagree —
 * collapsing them into one circle would fabricate validation. So each risk
 * carries both:
 *   - **Coverage** — *authored* (source): does a fixture exist and pass in
 *     development? The hand-assessed `state` from the file's Coverage table.
 *   - **Validation** — *derived* (measurement.ts): the measured pass rate across
 *     real runs, rolled up by the binding constraint, never pooled. Reads "not
 *     yet measured" everywhere until Project B's runs land in `risk-map.md`.
 *
 * There is **no "play-specific" family**: tests are *shaped* to fit a play but
 * still classify into a canonical family (`riskFamily`). A row whose id has no
 * canonical prefix is surfaced as misfiled, never given a catch-all band.
 *
 * Preflight & Diagnostics derive from `workflow.fabro` (+ the move prompts'
 * contracts) via `preflight.ts` / `diagnostics.ts` — Preflight is the
 * build-validity gate, Diagnostics the reference-free health lens. Coverage is
 * the one `risk-map.md` feeds. The deeper `fabro validate` check stays deferred
 * (§9.5); these are what the play's own files prove with no factory.
 */

const fileForSlug = (slug: string): string => `plays/${slug}/risk-map.md`;

export type TabKey = "preflight" | "diagnostics" | "coverage";

export const TESTING_TABS: { key: TabKey; label: string; blurb: string }[] = [
  { blurb: "does it run?", key: "preflight", label: "Preflight" },
  { blurb: "where is it fragile?", key: "diagnostics", label: "Diagnostics" },
  { blurb: "what's covered?", key: "coverage", label: "Coverage" },
];

// Per-tab main-pane heading — each lens gets its own title + lede (the same
// gold display h2 + italic teal lede the Play Walk and Design sections use), so
// the pane never reads a generic "Play Testing" on all three tabs.
const TAB_HEADING: Record<TabKey, { title: string; lede: string }> = {
  coverage: {
    lede: "What’s covered — every risk that applies to this play, banded by family. Rendered from this play’s risk-map.md.",
    title: "🧪 Coverage",
  },
  diagnostics: {
    lede: "Where is it fragile? Reference-free system health that runs on any play, with no test cases.",
    title: "🩺 Diagnostics",
  },
  preflight: {
    lede: "Does it run? The deterministic build-validity gate — free, and it blocks the other lenses until green.",
    title: "🛫 Preflight",
  },
};

// ─── family bands — colour + plain sub, ordered behavioral → systemic (§6) ──

interface FamilyTone {
  head: string;
  bar: string;
}

const BEHAVIORAL: FamilyTone = {
  bar: "border-l-[#d4a052]/60",
  head: "text-[#e8b86d]",
};
const ADVERSARIAL: FamilyTone = {
  bar: "border-l-[#e8a64f]/60",
  head: "text-[#e8a64f]",
};
const SYSTEMIC: FamilyTone = {
  bar: "border-l-[#b89cd8]/60",
  head: "text-[#b89cd8]",
};

// Display metadata per family. The `sub` lines are surface chrome (not risk
// canon): a plain gloss on what the band asks. `Chain` shows as "Systemic" to
// match the §6 vocabulary the surface settled on.
const FAMILY_META: Record<RiskFamily, { title: string; sub: string; tone: FamilyTone }> = {
  Adversarial: {
    sub: "when someone tries to trick it",
    title: "Adversarial",
    tone: ADVERSARIAL,
  },
  Chain: {
    sub: "did the right information make it from step to step?",
    title: "Systemic",
    tone: SYSTEMIC,
  },
  Input: {
    sub: "how it handles what it's given",
    title: "Input",
    tone: BEHAVIORAL,
  },
  Output: {
    sub: "is the output well-formed and honest?",
    title: "Output",
    tone: BEHAVIORAL,
  },
  Reasoning: {
    sub: "is the model's thinking sound?",
    title: "Reasoning",
    tone: BEHAVIORAL,
  },
};

// Behavioral families first, Adversarial next, Systemic last (§6).
const FAMILY_ORDER: RiskFamily[] = ["Reasoning", "Input", "Output", "Adversarial", "Chain"];

// ─── derived helpers (all real derivation lives in measurement.ts) ──────────

/** Parse a `result` cell like "28/30" into a pass count; `—` / unmeasured → null. */
function parsePasses(result: string): number | null {
  const match = /^(\d+)\s*\/\s*\d+/.exec(result.trim());
  return match != null ? Number(match[1]) : null;
}

function toMeasurementInput(row: EvalRow): MeasurementInput {
  return {
    built: row.built,
    deterministic: row.target.kind === "deterministic",
    passes: parsePasses(row.result),
    runs: row.runs,
  };
}

function targetLabel(target: EvalTarget): string {
  switch (target.kind) {
    case "count":
      return `${target.n} runs`;
    case "deterministic":
      return "deterministic (n=1)";
    case "tbd":
      return "target TBD";
  }
}

const STATUS_WORD: Record<FillStatus, string> = {
  covered: "covered",
  gap: "gap",
  "n/a": "n/a",
  partial: "partial",
};

function statusColor(status: FillStatus): string {
  switch (status) {
    case "covered":
      return "text-[#9be8a0]";
    case "partial":
      return "text-[#e8c074]";
    case "gap":
      return "text-[#6a5e4e]";
    case "n/a":
      return "text-[#5a4f42]";
  }
}

const LABEL_COLOR: Record<TestLabel, string> = {
  deterministic: "text-[#7ad4c4]",
  "needs work": "text-[#eaa088]",
  "not yet measured": "text-[#8f806c]",
  passing: "text-[#9be8a0]",
  provisional: "text-[#e8c074]",
  "to build": "text-[#6a5e4e]",
};

// A stable empty array for risks with no planned tests — a fresh `[]` per render
// would defeat RiskRow's labels memo.
const EMPTY_TESTS: EvalRow[] = [];

// ─── one risk row, both axes + an expandable per-test breakdown ─────────────

function RiskRow(props: { risk: CoverageRow; tests: EvalRow[] }): React.ReactElement {
  const { risk, tests } = props;
  const [open, setOpen] = useState(false);

  const labels = useMemo(() => tests.map((t) => labelTest(toMeasurementInput(t))), [tests]);
  // Validation axis: the binding (weakest) constraint across the risk's tests,
  // never pooled — shown as that test's label, a vocabulary distinct from the
  // authored Coverage state so the two axes never read as the same thing.
  const validation: TestLabel | null = bindingLabel(labels);

  return (
    <div className="border-b border-[#33271d] last:border-b-0">
      <button
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-2 py-2.5 text-left hover:bg-[#d4a052]/04"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {/* Coverage axis — authored, the headline fill-circle */}
        <span
          aria-hidden
          className={`mt-0.5 w-4 shrink-0 text-center text-[15px] leading-5 ${statusColor(
            risk.state,
          )}`}
          title={`coverage: ${STATUS_WORD[risk.state]} — hand-assessed (does a fixture exist and pass in development)`}
        >
          {statusGlyph(risk.state)}
        </span>
        <span className="sr-only">coverage: {STATUS_WORD[risk.state]}.</span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[13px] font-semibold text-[#e8e0d4]">{risk.name}</span>
            <span className="text-[9px] uppercase tracking-[0.12em] text-[#6a5e4e]">{risk.id}</span>
          </span>
          <span className="mt-0.5 block text-[11.5px] leading-5 text-[#9a8c78]">
            {risk.rationale}
          </span>
        </span>

        {/* Validation axis — derived/measured, distinct from coverage */}
        <span className="shrink-0 self-center text-right">
          {risk.state === "n/a" ? (
            <span className="text-[10px] text-[#5a4f42]">n/a</span>
          ) : validation == null ? (
            <span className="text-[10px] text-[#6a5e4e]">no test yet</span>
          ) : (
            <span className={`text-[10px] ${LABEL_COLOR[validation]}`}>{validation}</span>
          )}
          <span className="mt-0.5 block text-[8.5px] uppercase tracking-[0.1em] text-[#5a4f42]">
            validation
          </span>
        </span>

        <span className="mt-0.5 w-3 shrink-0 text-[10px] text-[#6a5e4e]">
          {tests.length > 0 ? (open ? "▾" : "▸") : ""}
        </span>
      </button>

      {open && tests.length > 0 ? (
        <div className="mb-2 ml-9 border-l border-[#33271d] pl-3">
          {tests.map((t, i) => {
            const label = labels[i] ?? "not yet measured";
            return (
              <div
                className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-1 text-[11px]"
                key={`${risk.id}-${i}`}
              >
                <span className="text-[#cfc4b0]">{t.test}</span>
                <span className="text-[9px] uppercase tracking-[0.1em] text-[#6a5e4e]">
                  {t.scope} · {t.type}
                </span>
                <span className="text-[10px] text-[#8f806c]">
                  {t.built ? "built" : "to build"} · {targetLabel(t.target)} · {t.runs}/
                  {t.target.kind === "count" ? t.target.n : "—"} runs
                </span>
                <span className={`text-[10px] font-semibold ${LABEL_COLOR[label]}`}>{label}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

// ─── the Coverage tab — risks banded by family, rendered from the file ──────

function CoverageTab(props: { map: RiskMap }): React.ReactElement {
  const { map } = props;

  // One pass: band the classified rows, collect the misfiled, and tally states.
  // The tally counts only classified rows, so it sums to the bands shown.
  const { byFamily, unclassified, tally } = useMemo(() => {
    const groups = new Map<RiskFamily, CoverageRow[]>();
    const misfiled: CoverageRow[] = [];
    const counts = { covered: 0, gap: 0, "n/a": 0, partial: 0 };
    for (const row of map.coverage) {
      const family = riskFamily(row.id);
      if (family == null) {
        misfiled.push(row);
        continue;
      }
      counts[row.state] += 1;
      const bucket = groups.get(family) ?? [];
      bucket.push(row);
      groups.set(family, bucket);
    }
    return { byFamily: groups, tally: counts, unclassified: misfiled };
  }, [map]);

  // Group tests by risk once, so each RiskRow gets a stable array reference (its
  // labels memo actually caches) instead of a fresh filter per render.
  const testsByRisk = useMemo(() => {
    const groups = new Map<string, EvalRow[]>();
    for (const test of map.evals) {
      const bucket = groups.get(test.risk) ?? [];
      bucket.push(test);
      groups.set(test.risk, bucket);
    }
    return groups;
  }, [map]);

  const totalRuns = useMemo(() => map.evals.reduce((sum, e) => sum + e.runs, 0), [map]);

  return (
    <div>
      {/* the two-axis honesty banner */}
      <div className="mb-4 rounded-[6px] border border-[#33271d] bg-black/20 px-4 py-3">
        <p className="text-[12px] leading-6 text-[#bcae90]">
          Two axes, shown honestly. <span className="font-semibold text-[#e8b86d]">Coverage</span>{" "}
          is hand-assessed — does a fixture exist and pass in development.{" "}
          <span className="font-semibold text-[#9be8a0]">Validation</span> is measured — the pass
          rate across real runs.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
          <span className="text-[#9a8c78]">
            <span className="text-[#9be8a0]">● {tally.covered} covered</span> ·{" "}
            <span className="text-[#e8c074]">◐ {tally.partial} partial</span> ·{" "}
            <span className="text-[#8f806c]">○ {tally.gap} gap</span> ·{" "}
            <span className="text-[#5a4f42]">– {tally["n/a"]} n/a</span>
          </span>
          <span className="text-[#6a5e4e]">·</span>
          <span className="text-[#8f806c]">
            {totalRuns === 0
              ? "0 runs measured — nothing is validated until evals run"
              : `${totalRuns} runs measured`}
          </span>
        </div>
      </div>

      {FAMILY_ORDER.map((family) => {
        const rows = byFamily.get(family);
        if (rows == null || rows.length === 0) {
          return null;
        }
        const meta = FAMILY_META[family];
        return (
          <section className="mb-5" key={family}>
            <div className={`mb-1 border-l-[3px] ${meta.tone.bar} pl-2.5`}>
              <h3 className={`font-display text-[15px] font-semibold ${meta.tone.head}`}>
                {meta.title}
              </h3>
              <p className="text-[10.5px] text-[#7d6f59]">{meta.sub}</p>
            </div>
            <div className="rounded-[6px] border border-[#33271d] bg-black/10">
              {rows.map((row) => (
                <RiskRow key={row.id} risk={row} tests={testsByRisk.get(row.id) ?? EMPTY_TESTS} />
              ))}
            </div>
          </section>
        );
      })}

      {/* misfiled rows — surfaced, never silently dropped, never a real band */}
      {unclassified.length > 0 ? (
        <div className="mt-4 rounded-[6px] border border-dashed border-[#e0896f]/30 bg-[#e0896f]/04 px-4 py-3">
          <p className="text-[11.5px] leading-6 text-[#bcae90]">
            <span className="font-semibold text-[#eaa088]">
              {unclassified.length} risk
              {unclassified.length === 1 ? "" : "s"} outside the canonical taxonomy
            </span>{" "}
            ({unclassified.map((r) => r.id).join(", ")}) — these look misfiled at source (input /
            output / adversarial / systemic risks in disguise). Reclassify them in{" "}
            <code className="text-[#caa15f]">risk-map.md</code>; they are not shown as a band.
          </p>
        </div>
      ) : null}
    </div>
  );
}

// ─── the Preflight tab — the build-validity gate, computed from the graph ────
//
// Renders the five §6 checks from the play's `workflow.fabro` + its prompt
// contracts, via `runPreflight` (all derivation lives in preflight.ts — this
// holds zero check logic). The deeper `fabro validate` is still deferred (§9.5);
// these are the structural checks the play's own files prove with no factory.

const CHECK_GLYPH: Record<CheckStatus, string> = {
  fail: "✗",
  pass: "✓",
  unknown: "○",
};

const CHECK_COLOR: Record<CheckStatus, string> = {
  fail: "text-[#eaa088]",
  pass: "text-[#7ad4c4]",
  unknown: "text-[#8f806c]",
};

const GATE_META: Record<GateStatus, { label: string; note: string; color: string; bar: string }> = {
  blocked: {
    bar: "border-[#eaa088]/40 bg-[#eaa088]/06",
    color: "text-[#eaa088]",
    label: "Preflight blocked",
    note: "fix the failures below before the play can run — Preflight gates the other lenses.",
  },
  incomplete: {
    bar: "border-[#e8c074]/40 bg-[#e8c074]/06",
    color: "text-[#e8c074]",
    label: "Preflight incomplete",
    note: "some checks need a source not yet wired in; nothing here is a failure.",
  },
  pass: {
    bar: "border-[#4fb8a8]/40 bg-[#4fb8a8]/06",
    color: "text-[#7ad4c4]",
    label: "Preflight passed",
    note: "the play builds and is wired correctly — the other lenses are unblocked.",
  },
};

const workflowForSlug = (slug: string): string => `plays/${slug}/workflow.fabro`;

// Diagnostics share the same neutral palette; level (not pass/fail — Diagnostics
// informs) drives the dot colour.
const DIAG_GLYPH: Record<DiagnosticLevel, string> = {
  info: "•",
  ok: "✓",
  watch: "⚠",
};

const DIAG_COLOR: Record<DiagnosticLevel, string> = {
  info: "text-[#8f806c]",
  ok: "text-[#7ad4c4]",
  watch: "text-[#e8c074]",
};

// Gather the records + parsed move contracts for a play's graph — the shared
// data both Preflight and Diagnostics derive from. Fetches each pointed-at move
// prompt that exists (a missing one is the pointer check's to flag, not a fetch
// error) and parses its consumes/emits contract.
async function fetchGraphFiles(
  slug: string,
  graph: WorkflowGraph,
): Promise<{ files: Set<string>; contracts: Map<string, PromptContract> }> {
  const records = await Effect.runPromise(fetchStudioRecords(slug));
  const files = new Set(records.records.map((r) => r.path));
  const promptPaths = [
    ...new Set(
      filePointers(graph)
        .filter((p) => files.has(p.path))
        .map((p) => p.path),
    ),
  ];
  const loaded = await Promise.all(
    promptPaths.map(async (path) => ({
      path,
      text: await Effect.runPromise(fetchStudioFile(`plays/${slug}/${path}`)),
    })),
  );
  return { contracts: contractsFromFiles(loaded), files };
}

// Build the Preflight report. The caller passes the already-fetched
// `workflow.fabro` text (it fetched it to tell "not derived yet" apart from a
// real failure), so we don't re-fetch it. A graph that doesn't parse becomes an
// honest "Builds cleanly" failure rather than a thrown render (preflight.ts §10
// leaves that to the render layer).
async function loadPreflight(slug: string, graphText: string): Promise<PreflightReport> {
  let graph: WorkflowGraph;
  try {
    graph = parseWorkflowGraph(graphText);
  } catch (cause) {
    return {
      checks: [
        {
          detail: `the workflow graph did not parse — ${String(cause)}`,
          id: "builds",
          status: "fail",
          title: "Builds cleanly",
        },
      ],
      gate: "blocked",
    };
  }
  const { files, contracts } = await fetchGraphFiles(slug, graph);
  const validation = await loadValidation(slug);
  return runPreflight(graph, { contracts, files, validation });
}

// Run `fabro validate` via the studio endpoint and normalize it for the builds
// check. Tolerant: if the endpoint can't run (no binary, e.g.) we return null
// and Preflight falls back to the structural "Builds cleanly" check.
async function loadValidation(slug: string): Promise<FabroValidation | null> {
  try {
    const raw = await Effect.runPromise(fetchStudioValidate(slug));
    return {
      edges: raw.edges,
      errors: raw.diagnostics.filter((d) => d.severity === "Error").map((d) => d.message),
      nodes: raw.nodes,
      valid: raw.valid,
      warnings: raw.diagnostics.filter((d) => d.severity === "Warning").map((d) => d.message),
    };
  } catch {
    return null;
  }
}

// Build the Diagnostics report. A graph that doesn't parse has nothing to
// diagnose — re-throw so the tab surfaces it as an error (Preflight is where a
// parse failure reads as a real finding).
async function loadDiagnostics(slug: string, graphText: string): Promise<DiagnosticsReport> {
  const graph = parseWorkflowGraph(graphText);
  const { contracts } = await fetchGraphFiles(slug, graph);
  return runDiagnostics(graph, { contracts });
}

// Both graph-derived tabs share the load lifecycle: fetch workflow.fabro (its
// absence means the play isn't derived yet), then run the tab's loader. The
// loader is a stable module-level reference, so it's a safe effect dependency.
function useGraphTab<T>(
  slug: string,
  load: (slug: string, graphText: string) => Promise<T>,
): { data: T | null; error: string | null; missing: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    setMissing(false);
    Effect.runPromise(fetchStudioFile(workflowForSlug(slug))).then(
      (graphText) => {
        load(slug, graphText).then(
          (next) => {
            if (!cancelled) {
              setData(next);
            }
          },
          (cause) => {
            if (!cancelled) {
              setError(String(cause));
            }
          },
        );
      },
      () => {
        if (!cancelled) {
          setMissing(true);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [slug, load]);

  return { data, error, missing };
}

function NotDerived(props: { what: string }): React.ReactElement {
  return (
    <p className="text-[12px] text-[#8f806c]">
      No <code className="text-[#caa15f]">workflow.fabro</code> for this play yet — {props.what}{" "}
      once the play is derived.
    </p>
  );
}

function PreflightTab(props: { slug: string }): React.ReactElement {
  const { data: report, error, missing } = useGraphTab(props.slug, loadPreflight);

  if (missing) {
    return <NotDerived what="Preflight runs on the workflow graph" />;
  }
  if (error != null) {
    return <p className="text-[12px] text-[#e08a8a]">Couldn’t run Preflight — {error}</p>;
  }
  if (report == null) {
    return <p className="text-[12px] text-[#8f806c]">checking…</p>;
  }

  const gate = GATE_META[report.gate];
  return (
    <div>
      <div className={`mb-4 rounded-[6px] border ${gate.bar} px-4 py-3`}>
        <p className={`text-[13px] font-semibold ${gate.color}`}>● {gate.label}</p>
        <p className="mt-0.5 text-[11.5px] leading-5 text-[#bcae90]">{gate.note}</p>
      </div>
      <div className="rounded-[6px] border border-[#33271d] bg-black/10">
        {report.checks.map((check) => (
          <div
            className="flex items-start gap-3 border-b border-[#33271d] px-3 py-2.5 last:border-b-0"
            key={check.id}
          >
            <span
              aria-hidden
              className={`mt-0.5 w-4 shrink-0 text-center text-[14px] leading-5 ${CHECK_COLOR[check.status]}`}
            >
              {CHECK_GLYPH[check.status]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-[12.5px] font-semibold text-[#e8e0d4]">{check.title}</span>
              <span className="mt-0.5 block text-[11px] leading-5 text-[#9a8c78]">
                {check.detail}
              </span>
            </span>
            <span className="sr-only">: {check.status}.</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiagnosticsTab(props: { slug: string }): React.ReactElement {
  const { data: report, error, missing } = useGraphTab(props.slug, loadDiagnostics);

  if (missing) {
    return <NotDerived what="Diagnostics read the workflow graph" />;
  }
  if (error != null) {
    return <p className="text-[12px] text-[#e08a8a]">Couldn’t run Diagnostics — {error}</p>;
  }
  if (report == null) {
    return <p className="text-[12px] text-[#8f806c]">checking…</p>;
  }

  return (
    <div className="rounded-[6px] border border-[#33271d] bg-black/10">
      {report.diagnostics.map((diag) => (
        <div
          className="flex items-start gap-3 border-b border-[#33271d] px-3 py-2.5 last:border-b-0"
          key={diag.id}
        >
          <span
            aria-hidden
            className={`mt-0.5 w-4 shrink-0 text-center text-[14px] leading-5 ${DIAG_COLOR[diag.level]}`}
          >
            {DIAG_GLYPH[diag.level]}
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-[12.5px] font-semibold text-[#e8e0d4]">{diag.title}</span>
            <span className="mt-0.5 block text-[11px] leading-5 text-[#9a8c78]">{diag.detail}</span>
          </span>
          <span className="sr-only">: {diag.level}.</span>
        </div>
      ))}
    </div>
  );
}

// ─── the section ────────────────────────────────────────────────────────────

export function PlayTesting(props: { slug: string; tab: TabKey }): React.ReactElement {
  const { slug, tab } = props;
  const [map, setMap] = useState<RiskMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMap(null);
    setError(null);
    setMissing(false);
    void Effect.runPromise(fetchStudioFile(fileForSlug(slug))).then(
      (text) => {
        if (cancelled) {
          return;
        }
        try {
          setMap(parseRiskMap(text));
        } catch (cause) {
          setError(String(cause));
        }
      },
      () => {
        if (!cancelled) {
          // No risk-map.md for this play — the surface is authored per play.
          setMissing(true);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Coverage renders from risk-map.md; Preflight derives from workflow.fabro and
  // Diagnostics is still deferred — so the risk-map's missing/error/loading
  // states gate only the Coverage body, never the other two lenses.
  const coverageBody = (): React.ReactElement => {
    if (missing) {
      return (
        <p className="text-[12px] text-[#8f806c]">
          No <code className="text-[#caa15f]">risk-map.md</code> for this play yet — Coverage is
          authored per play (see{" "}
          <code className="text-[#caa15f]">
            docs/alexandria/plans/_archive/testing-center-viewer-port/AUTHORING-EVALS.md
          </code>
          ).
        </p>
      );
    }
    if (error != null) {
      return <p className="text-[12px] text-[#e08a8a]">Couldn’t read the risk map — {error}</p>;
    }
    if (map == null) {
      return <p className="text-[12px] text-[#8f806c]">loading…</p>;
    }
    return <CoverageTab map={map} />;
  };

  return (
    <div className="max-w-[860px]">
      <h2 className="mb-1 font-display text-[21px] font-semibold text-[#e8b86d]">
        {TAB_HEADING[tab].title}
      </h2>
      <p className="mb-4 text-[12px] italic text-[#7ad4c4]">{TAB_HEADING[tab].lede}</p>

      {tab === "coverage" ? (
        coverageBody()
      ) : tab === "preflight" ? (
        <PreflightTab slug={slug} />
      ) : (
        <DiagnosticsTab slug={slug} />
      )}
    </div>
  );
}
