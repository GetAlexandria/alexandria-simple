/**
 * Play-workshop record grouping. The studio records API returns a flat,
 * recursive file list (records[].path) under studio/plays/<slug>/. The
 * workshop curates that into a small set of human groups so a Director can
 * swim a play front-to-back. Defensive: a play may carry only some of
 * these; empty groups are dropped by the caller.
 */

export interface PlayRecord {
  bytes: number;
  path: string;
}

export interface RecordEntry {
  /** the file path relative to the play dir (FileBody appends to plays/<slug>/) */
  path: string;
  /** short label shown in the rail */
  label: string;
  /** optional dim note on the right */
  note?: string;
}

export interface FixtureCase {
  /** the path segment after fixtures/, e.g. "golden", "saddle", "advanced" */
  name: string;
  /** the bound-behavior README, if the case has one */
  readme: RecordEntry | null;
  /** the case's input/record files */
  files: RecordEntry[];
}

export interface RunGroup {
  /** the run id, e.g. "run-1" */
  id: string;
  /** top-level run files surfaced flat (RECORD.md, run.log, etc.) */
  top: RecordEntry[];
  /** count of collapsed deep artifacts/stages/checkpoints files */
  deepCount: number;
  /** the collapsed deep files (lazy-expanded by the caller) */
  deep: RecordEntry[];
}

export interface GroupedRecords {
  /** diagram.svg, if present */
  diagram: RecordEntry | null;
  /** story.md, if present */
  story: RecordEntry | null;
  /** the logic: workflow.fabro, prompts/* (story/diagram handled above) */
  logic: RecordEntry[];
  /** front of house: research/* and elicitation/source files */
  frontOfHouse: RecordEntry[];
  /** fixtures grouped by case */
  fixtures: FixtureCase[];
  /** design & proof: brief.md, hardening.md, lint.md, etc. */
  designProof: RecordEntry[];
  /** top-level dry-run files (read-out.md etc.) */
  dryRunTop: RecordEntry[];
  /** dry-runs grouped by run id */
  runs: RunGroup[];
  /** anything that didn't match a rule */
  other: RecordEntry[];
}

const FIXTURE_INPUT_HINTS = [
  "transcript",
  "surface_map",
  "surface-map",
  "users",
  "prior_brief",
  "prior-brief",
  "prior-map",
];

function baseName(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

function tidyLabel(name: string): string {
  return name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]/g, " ");
}

/** Order fixture-case files: README first, then known inputs, then the rest. */
function rankFixtureFile(name: string): number {
  const lower = name.toLowerCase();
  if (lower === "readme.md") {
    return 0;
  }
  if (FIXTURE_INPUT_HINTS.some((hint) => lower.includes(hint))) {
    return 1;
  }
  return 2;
}

export function groupPlayRecords(records: readonly PlayRecord[]): GroupedRecords {
  let diagram: RecordEntry | null = null;
  let story: RecordEntry | null = null;
  const logic: RecordEntry[] = [];
  const frontOfHouse: RecordEntry[] = [];
  const designProof: RecordEntry[] = [];
  const dryRunTop: RecordEntry[] = [];
  const other: RecordEntry[] = [];

  const fixtureBuckets = new Map<string, PlayRecord[]>();
  const runBuckets = new Map<string, PlayRecord[]>();

  for (const record of records) {
    const path = record.path;
    const name = baseName(path);

    if (path === "synopsis.md" || path === "moves.md" || path === "improvements.md") {
      // Authored overlays — each surfaced as its own rendered surface (the
      // explainer, the moves section, the Improvement Plan board), never as a
      // raw file in the dig-in rail.
      continue;
    }
    if (path === "diagram.svg") {
      diagram = { label: "The play, drawn", note: "diagram", path };
      continue;
    }
    if (path === "story.md") {
      story = { label: "The play, as one story", note: "story", path };
      continue;
    }
    if (path === "workflow.fabro" || path === "graph.fabro") {
      logic.push({ label: name, note: "workflow", path });
      continue;
    }
    if (path.startsWith("prompts/")) {
      logic.push({ label: tidyLabel(name), note: "prompt", path });
      continue;
    }
    if (path === "prompt.md") {
      logic.push({ label: "prompt", note: "deployable", path });
      continue;
    }

    if (path.startsWith("research/")) {
      frontOfHouse.push({ label: tidyLabel(name), note: "research", path });
      continue;
    }

    if (path.startsWith("fixtures/")) {
      const rest = path.slice("fixtures/".length);
      const segs = rest.split("/");
      // case = first segment if there's nesting, else "(loose)"
      const caseName = segs.length > 1 ? (segs[0] ?? "(loose)") : "(loose)";
      const bucket = fixtureBuckets.get(caseName) ?? [];
      bucket.push(record);
      fixtureBuckets.set(caseName, bucket);
      continue;
    }

    if (path.startsWith("dry-runs/")) {
      const rest = path.slice("dry-runs/".length);
      const segs = rest.split("/");
      if (segs.length === 1) {
        // top-level dry-run file, e.g. dry-runs/read-out.md
        dryRunTop.push({ label: tidyLabel(name), path });
      } else {
        const runId = segs[0] ?? "(run)";
        const bucket = runBuckets.get(runId) ?? [];
        bucket.push(record);
        runBuckets.set(runId, bucket);
      }
      continue;
    }

    // Front-of-house docs matched by name — AFTER the fixtures/ and dry-runs/
    // prefix checks, so a fixture or run file whose path happens to contain
    // "source"/"grounding"/"elicit" isn't pulled out of its group.
    if (/elicit|grounding|source|extracted-claims/i.test(path)) {
      frontOfHouse.push({ label: tidyLabel(name), path });
      continue;
    }

    if (path === "brief.md") {
      designProof.push({ label: "design brief", note: "rationale", path });
      continue;
    }
    if (path === "hardening.md") {
      designProof.push({ label: "hardening", note: "interview", path });
      continue;
    }
    if (path === "lint.md") {
      designProof.push({ label: "lint verdict", path });
      continue;
    }
    if (path.endsWith(".md") && !path.includes("/")) {
      // other top-level docs (e.g. known-fps.md)
      designProof.push({ label: tidyLabel(name), path });
      continue;
    }

    other.push({ label: path, path });
  }

  const fixtures: FixtureCase[] = [...fixtureBuckets.entries()]
    .map(([caseName, files]): FixtureCase => {
      const sorted = [...files].sort(
        (a, b) => rankFixtureFile(baseName(a.path)) - rankFixtureFile(baseName(b.path)),
      );
      let readme: RecordEntry | null = null;
      const fileEntries: RecordEntry[] = [];
      const prefix = caseName === "(loose)" ? "fixtures/" : `fixtures/${caseName}/`;
      for (const file of sorted) {
        const fname = baseName(file.path);
        if (fname.toLowerCase() === "readme.md" && readme == null) {
          readme = { label: "bound behavior", note: "README", path: file.path };
        } else {
          // show the path within the case for clarity on nested cases
          const within = file.path.startsWith(prefix) ? file.path.slice(prefix.length) : fname;
          fileEntries.push({ label: within || fname, path: file.path });
        }
      }
      return { files: fileEntries, name: caseName, readme };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const runs: RunGroup[] = [...runBuckets.entries()]
    .map(([id, files]): RunGroup => {
      const top: RecordEntry[] = [];
      const deep: RecordEntry[] = [];
      for (const file of files) {
        const within = file.path.slice(`dry-runs/${id}/`.length);
        const depth = within.split("/").length;
        const entry: RecordEntry = { label: within, path: file.path };
        if (depth === 1) {
          top.push(entry);
        } else {
          deep.push(entry);
        }
      }
      top.sort((a, b) => a.label.localeCompare(b.label));
      deep.sort((a, b) => a.label.localeCompare(b.label));
      return { deep, deepCount: deep.length, id, top };
    })
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return {
    designProof,
    diagram,
    dryRunTop,
    fixtures,
    frontOfHouse,
    logic,
    other,
    runs,
    story,
  };
}

/**
 * Best-effort extraction of a decision-queue section from brief.md text.
 * Matches a heading like "## Carve decision queue …" / "## … decision
 * queue" and returns through the next same-or-higher heading. Returns null
 * if absent.
 */
export function extractDecisionQueue(briefText: string): string | null {
  const lines = briefText.split("\n");
  let start = -1;
  let headingLevel = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const match = /^(#{1,6})\s+(.*decision queue.*)$/i.exec(line);
    if (match != null) {
      start = i;
      headingLevel = (match[1] ?? "#").length;
      break;
    }
  }
  if (start === -1) {
    return null;
  }
  const out: string[] = [lines[start] ?? ""];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const heading = /^(#{1,6})\s+/.exec(line);
    if (heading != null && (heading[1] ?? "").length <= headingLevel) {
      break;
    }
    out.push(line);
  }
  return out.join("\n").trim();
}
