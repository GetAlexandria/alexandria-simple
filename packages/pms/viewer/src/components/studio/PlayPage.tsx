import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Effect from "effect/Effect";
import {
  fetchStudioComposition,
  fetchStudioFile,
  fetchStudioRecords,
  type StudioComposition,
  type StudioRung,
} from "../../app/runtime/studio";
import { DiagramOverlay } from "./DiagramOverlay";
import { StudioMarkdown } from "./StudioMarkdown";
import { stageBadgeColor, stageLabel } from "./StudioApp";
import {
  groupPlayRecords,
  type FixtureCase,
  type GroupedRecords,
  type PlayRecord,
  type RecordEntry,
} from "./playRecords";
import {
  parseMoves,
  parseRoutes,
  parseStoryNarrative,
  type PlayMove,
  type PlayRoute,
} from "./playNarrative";
import { bindBranches, parseMoveProse, type MoveBranch, type MoveProse } from "./playMoves";
import {
  parseImprovements,
  type ImprovementColumn,
  type ImprovementItem,
} from "./playImprovements";
import {
  gatesAfterModule,
  isModularComposition,
  moduleLegsByNode,
  unplacedGates,
  type StudioCompositionGate,
  type StudioCompositionModule,
} from "./playModules";
import { parseSynopsis, type PlaySynopsis } from "./playSynopsis";
import { PlayTesting, TESTING_TABS, type TabKey } from "./PlayTesting";

/**
 * The Play page — one articulate template for every play (Studio play-page
 * plan). Inspired by the frozen `frame-the-problem` workshop: an authored
 * walk-through lands first (spec card → the play drawn → the play in use → one
 * run end to end → the moves), plus a living Improvement Plan board and a
 * zoom-in left nav over the play's design history (grounding → claims → brief →
 * hardening → lint) and its fixtures. Everything is rendered from files that
 * already exist under studio/plays/<slug>/ — no per-play
 * hand-assembly, so it scales to every play. Records stay files; the viewer
 * renders, it does not own them.
 */

const fileUrl = (path: string): string => `/api/studio/file?path=${encodeURIComponent(path)}`;

// ─── shared file renderer (markdown / svg / text) ──────────────────────────

function FileBody(props: { path: string }): React.ReactElement {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const isSvg = props.path.endsWith(".svg");
  useEffect(() => {
    let cancelled = false;
    setImgError(false);
    if (isSvg) {
      return () => {
        cancelled = true;
      };
    }
    setContent(null);
    setError(null);
    void Effect.runPromise(fetchStudioFile(props.path)).then(
      (text) => {
        if (!cancelled) {
          setContent(text);
        }
      },
      (cause: unknown) => {
        if (!cancelled) {
          setError(String(cause));
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [props.path, isSvg]);

  if (isSvg) {
    return imgError ? (
      <p className="text-[12px] text-[#e08a8a]">Couldn’t load image — {props.path}</p>
    ) : (
      <img
        alt={props.path}
        className="max-w-full rounded bg-[#0e0a06] p-2"
        onError={() => setImgError(true)}
        src={fileUrl(props.path)}
      />
    );
  }
  if (error != null) {
    return <p className="text-[12px] text-[#e08a8a]">{error}</p>;
  }
  if (content == null) {
    return <p className="text-[12px] text-[#8f806c]">loading…</p>;
  }
  if (props.path.endsWith(".md")) {
    return <StudioMarkdown content={content} />;
  }
  return (
    <pre className="max-w-full overflow-x-auto whitespace-pre-wrap text-[12px] leading-5 text-[#c9bba2]">
      {content}
    </pre>
  );
}

/**
 * A lazy peek at the head of a play file — the prototype hard-coded excerpts;
 * we derive them. Fetches the file, drops blank lines, and shows the first
 * `lines` of real content as a monospace teaser. The full file is one click
 * further (the caller renders the deep-link).
 */
function InlineExcerpt(props: { lines?: number; path: string; slug: string }): React.ReactElement {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const full = `plays/${props.slug}/${props.path}`;
  useEffect(() => {
    let cancelled = false;
    setText(null);
    setError(false);
    void Effect.runPromise(fetchStudioFile(full)).then(
      (t) => {
        if (!cancelled) {
          setText(t);
        }
      },
      () => {
        if (!cancelled) {
          setError(true);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [full]);

  if (error) {
    return <p className="text-[11px] text-[#e08a8a]">couldn’t load the excerpt.</p>;
  }
  if (text == null) {
    return <p className="text-[11px] text-[#8f806c]">loading…</p>;
  }
  const excerpt = text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .slice(0, props.lines ?? 9)
    .join("\n");
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-[4px] border border-[#d4a052]/18 bg-black/40 px-3.5 py-2.5 font-mono text-[11px] leading-6 text-[#cfc4b0]">
      {excerpt}
    </pre>
  );
}

// ─── left-nav primitives ───────────────────────────────────────────────────

function RailEntry(props: {
  entry: RecordEntry;
  onSelect: (path: string) => void;
  selected: string | null;
}): React.ReactElement {
  const on = props.selected === props.entry.path;
  return (
    <button
      className={[
        "block w-full border-l-[3px] px-3 py-1.5 text-left text-[12px] leading-5 transition-colors",
        on
          ? "border-l-[#d4a052] bg-[#d4a052]/10 text-[#e8b86d]"
          : "border-l-transparent text-[#9a8c78] hover:bg-[#4fb8a8]/06 hover:text-[#d6c9b4]",
      ].join(" ")}
      onClick={() => props.onSelect(props.entry.path)}
      title={props.entry.path}
      type="button"
    >
      <span className="truncate">{props.entry.label}</span>
      {props.entry.note != null ? (
        <span className="float-right pl-2 pt-0.5 text-[8.5px] uppercase tracking-[0.1em] text-[#6a5e4e]">
          {props.entry.note}
        </span>
      ) : null}
    </button>
  );
}

function CollapsibleRailGroup(props: {
  children: React.ReactNode;
  count: number;
  onToggle: () => void;
  open: boolean;
  title: string;
}): React.ReactElement {
  return (
    <div className="mt-1">
      <button
        aria-expanded={props.open}
        className="flex w-full items-baseline gap-2 px-3 pb-1.5 pt-3 text-left transition-colors hover:text-[#e8b86d]"
        onClick={props.onToggle}
        type="button"
      >
        <span className="text-[9px] text-[#8f806c]">{props.open ? "▾" : "▸"}</span>
        <span className="font-display text-[14px] leading-none text-[#d4a052]">{props.title}</span>
        <span className="ml-auto rounded-full border border-[#d4a052]/25 px-1.5 text-[9px] leading-4 text-[#9a8c78]">
          {props.count}
        </span>
      </button>
      {props.open ? props.children : null}
    </div>
  );
}

// ─── improvement plan — the play's living backlog (kanban) ──────────────────

interface ImpTone {
  bar: string;
  dot: string;
  head: string;
}
const TONE_BACKLOG: ImpTone = {
  bar: "border-l-[#d4a052]/55",
  dot: "bg-[#d4a052]",
  head: "text-[#e8b86d]",
};
const TONE_PROGRESS: ImpTone = {
  bar: "border-l-[#4fb8a8]/55",
  dot: "bg-[#4fb8a8]",
  head: "text-[#7ad4c4]",
};
const TONE_SHIPPED: ImpTone = {
  bar: "border-l-[#78dc82]/50",
  dot: "bg-[#78dc82]",
  head: "text-[#9be8a0]",
};

/** Colour a column by its name — backlog gold, in-progress teal, shipped green. */
function columnTone(title: string): ImpTone {
  const t = title.toLowerCase();
  if (/progress|doing|wip|active/.test(t)) {
    return TONE_PROGRESS;
  }
  if (/shipped|done|closed|landed/.test(t)) {
    return TONE_SHIPPED;
  }
  return TONE_BACKLOG;
}

function ImprovementCard(props: { item: ImprovementItem; tone: ImpTone }): React.ReactElement {
  const { item, tone } = props;
  return (
    <div
      className={`rounded-[5px] border border-[#33271d] border-l-[3px] ${tone.bar} bg-black/20 px-3 py-2`}
    >
      <div className="flex flex-wrap items-baseline gap-1.5">
        {item.tag != null ? (
          <span className="rounded-[3px] border border-[#e8a64f]/45 px-1 text-[8px] uppercase tracking-[0.1em] text-[#e8a64f]">
            {item.tag === "decision" ? "⚖ decision" : item.tag}
          </span>
        ) : null}
        <span className="text-[12.5px] font-semibold text-[#e8e0d4]">{item.title}</span>
      </div>
      {item.detail.length > 0 ? (
        <p className="mt-0.5 text-[11.5px] leading-5 text-[#9a8c78]">{item.detail}</p>
      ) : null}
    </div>
  );
}

/**
 * The play's Improvement Plan — a living backlog rendered as a kanban from the
 * authored `improvements.md`. It absorbs what the old "Decision queue" tracked:
 * an open decision is just an improvement card (tag `decision`), and closing it
 * moves it to Shipped. Read-only for now; the file is the source of truth.
 */
function ImprovementBoard(props: {
  columns: ImprovementColumn[] | null;
  loading: boolean;
}): React.ReactElement {
  return (
    <div>
      <h2 className="font-display text-[21px] font-semibold text-[#e8b86d]">⚒ Improvement Plan</h2>
      <p className="mb-4 mt-1 text-[12px] italic text-[#7ad4c4]">
        A living backlog of what would make this play better — anyone can pull a card. Open
        decisions live here too: closing one is an improvement.
      </p>
      {props.loading ? (
        <p className="text-[12px] text-[#8f806c]">loading…</p>
      ) : props.columns == null || props.columns.length === 0 ? (
        <p className="text-[12px] text-[#8f806c]">
          No improvement plan yet — add an <code className="text-[#caa15f]">improvements.md</code>{" "}
          to this play (Backlog / In progress / Shipped).
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {props.columns.map((col) => {
            const tone = columnTone(col.title);
            return (
              <div key={col.title}>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${tone.dot}`} />
                  <span
                    className={`text-[12px] font-semibold uppercase tracking-[0.1em] ${tone.head}`}
                  >
                    {col.title}
                  </span>
                  <span className="text-[10px] text-[#6a5e4e]">{col.items.length}</span>
                </div>
                <div className="space-y-2">
                  {col.items.length === 0 ? (
                    <p className="text-[11px] italic text-[#6a5e4e]">—</p>
                  ) : (
                    col.items.map((item, i) => (
                      <ImprovementCard item={item} key={`${col.title}-${i}`} tone={tone} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// The collapsible nav file-groups (below the three first-class views), under
// human-readable names. The design history is NOT here — it's promoted into the
// Design view's sub-nav; the logic (workflow.fabro + prompts) reads in the
// moves' "In Fabro" lens.
type NavGroupKey = "other";

const NAV_GROUP_TITLES: Readonly<Record<NavGroupKey, string>> = {
  other: "Other files",
};

// The Design view's history files, in the order the work happened: research
// grounding → the extracted-claims trail → the brief. (Hardening, lint, and any
// other design-area docs are parked under Fixtures for now — see below.)
const DESIGN_ORDER = ["grounding", "extracted-claims", "brief"];
const designRank = (entry: RecordEntry): number =>
  DESIGN_ORDER.findIndex((k) => entry.path.toLowerCase().includes(k));

function designHistoryEntries(grouped: GroupedRecords): RecordEntry[] {
  return [...grouped.frontOfHouse, ...grouped.designProof]
    .map((entry, i) => ({ entry, i, rank: designRank(entry) }))
    .filter((x) => x.rank !== -1)
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .map((x) => x.entry);
}

// Design-area files that aren't the narrative spine (hardening, lint, …) —
// shown in the Design sub-nav alongside grounding/claims/brief.
function parkedDesignEntries(grouped: GroupedRecords): RecordEntry[] {
  return [...grouped.frontOfHouse, ...grouped.designProof].filter((e) => designRank(e) === -1);
}

/** Which file group owns a path, so the rail auto-expands to keep it visible. */
function navGroupForPath(grouped: GroupedRecords, path: string): NavGroupKey | null {
  if (grouped.other.some((e) => e.path === path)) {
    return "other";
  }
  return null;
}

// ─── the authored sections ─────────────────────────────────────────────────

// The three first-class views (blue main categories). Overview is the explainer
// landing; Play Walk is the move-by-move of an actual run; Design is the play's
// history + its living Improvement Plan board. Overview/Play Walk render
// reading-order spines of anchors (computed in WalkThrough); Design renders the
// board and a sub-nav of its history files.
type SectionView = "overview" | "playwalk" | "design" | "testing";

const OVERVIEW_SPINE: { id: string; label: string }[] = [
  { id: "spec", label: "What it does" },
  { id: "drawn", label: "The play, drawn" },
  { id: "inuse", label: "The play in use" },
  { id: "trigger", label: "When it fires" },
];

const PLAYWALK_SPINE: { id: string; label: string }[] = [
  { id: "run", label: "One run, end to end" },
  { id: "moves", label: "Inside the play" },
];

// The section ids that belong to Play Walk — used to tell whether that section
// has any content (and so whether to offer its nav entry).
const PLAYWALK_IDS = new Set(PLAYWALK_SPINE.map((s) => s.id));

function SectionTitle(props: { children: React.ReactNode }): React.ReactElement {
  return (
    <h2 className="mb-3 mt-10 font-display text-[21px] font-semibold text-[#e8b86d] first:mt-0">
      {props.children}
    </h2>
  );
}

function OpenChip(props: { label: string; onClick: () => void }): React.ReactElement {
  return (
    <button
      className="text-[11px] text-[#7ad4c4] underline-offset-2 hover:underline"
      onClick={props.onClick}
      type="button"
    >
      {props.label} ↗
    </button>
  );
}

function doerClasses(doer: string | null): string {
  if (doer === "mechanical") {
    return "border-[#4fb8a8]/50 text-[#7ad4c4]";
  }
  if (doer === "human") {
    return "border-[#f0c060]/50 text-[#f0c060]";
  }
  return "border-[#d4a052]/45 text-[#d4a052]"; // judgment / default
}

// ─── off-the-golden-path branches — the "problems happen" callouts ──────────

// One tone per kind of branch, mirroring the prototype's red/blue exit boxes
// (and adding amber for the fix-loops the next-era plays lean on). decline =
// a terminal refusal/exit (red); soft = an honest empty / no-op landing
// (blue); loop = a bounce back to an earlier move to fix and retry (amber).
type BranchTone = "decline" | "loop" | "soft";

const BRANCH_TONE: Readonly<
  Record<BranchTone, { arrow: string; bar: string; bg: string; chip: string; title: string }>
> = {
  decline: {
    arrow: "text-[#e0896f]",
    bar: "border-l-[#e0896f]/70",
    bg: "bg-[#e0896f]/06",
    chip: "border-[#e0896f]/45 text-[#e0896f]",
    title: "text-[#eaa088]",
  },
  loop: {
    arrow: "text-[#e0b25a]",
    bar: "border-l-[#e0b25a]/70",
    bg: "bg-[#e0b25a]/06",
    chip: "border-[#e0b25a]/45 text-[#e0b25a]",
    title: "text-[#e8c074]",
  },
  soft: {
    arrow: "text-[#7ab4d4]",
    bar: "border-l-[#7ab4d4]/70",
    bg: "bg-[#7ab4d4]/06",
    chip: "border-[#7ab4d4]/45 text-[#7ab4d4]",
    title: "text-[#93c4de]",
  },
};

/** Classify a branch by its label/title/target keywords (red/blue/amber). */
function branchTone(label: string, title: string, target: string | null): BranchTone {
  const s = `${label} ${title} ${target ?? ""}`.toLowerCase();
  if (/refus|declin|misfire|abort|\bexit\b|\bstop\b|builds nothing/.test(s)) {
    return "decline";
  }
  if (/empty|none voiced|honest|nothing found|no problem|soft land/.test(s)) {
    return "soft";
  }
  return "loop"; // fix / bounce / retry / over budget / confused
}

interface RenderedBranch {
  branch: MoveBranch;
  target: string | null;
  tone: BranchTone;
}

/**
 * Bind authored branches to the move's derived routes (shared `bindBranches`),
 * then colour each by tone for the callout. `uncovered` carries the routes no
 * branch claimed, so the section never silently hides an exit the play has.
 */
function mergeBranches(
  branches: readonly MoveBranch[],
  routes: readonly PlayRoute[],
): { rendered: RenderedBranch[]; uncovered: PlayRoute[] } {
  const { bound, uncovered } = bindBranches(branches, routes);
  const rendered = bound.map(({ branch, target }) => ({
    branch,
    target,
    tone: branchTone(branch.label, branch.title, target),
  }));
  return { rendered, uncovered };
}

/** One off-the-golden-path branch: an arrow into a tone-keyed story box. */
function BranchCallout(props: { rendered: RenderedBranch }): React.ReactElement {
  const { branch, target, tone } = props.rendered;
  const t = BRANCH_TONE[tone];
  return (
    <div className="mt-2 flex gap-2">
      <span aria-hidden className={`select-none pt-1.5 text-[15px] leading-none ${t.arrow}`}>
        ↳
      </span>
      <div className={`flex-1 rounded-[5px] border-l-[3px] ${t.bar} ${t.bg} px-3.5 py-2.5`}>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className={`text-[12px] font-semibold ${t.title}`}>{branch.title}</span>
          {target != null ? (
            <span
              className={`rounded-[3px] border px-1.5 text-[8.5px] uppercase tracking-[0.1em] ${t.chip}`}
            >
              → {target}
            </span>
          ) : null}
        </div>
        <div className="mt-1 [&_li]:text-[12px] [&_li]:leading-6 [&_li]:text-[#bcae90] [&_p:last-child]:mb-0 [&_p]:text-[12px] [&_p]:leading-6 [&_p]:text-[#bcae90]">
          <StudioMarkdown content={branch.body} />
        </div>
      </div>
    </div>
  );
}

/**
 * The diagram's key. Mirrors the colours theme-diagram.py bakes into the SVG
 * (studio/tools): gold = judgment, teal = mechanical, dashed = off the golden
 * path. Kept in sync by convention — both sides encode the same doer taxonomy.
 */
function DiagramLegend(): React.ReactElement {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-[#9a8c78]">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full border border-[#d4a052] bg-[#2a2014]" />
        judgment
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full border border-[#4fb8a8] bg-[#16221f]" />
        mechanical check
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block w-5 border-t border-dashed border-[#7d6f59]" />
        off the golden path — refusals, fixes, the meeting loop
      </span>
    </div>
  );
}

/** Pick the showcase fixture case: prefer "golden", else the first. */
function showcaseCase(fixtures: readonly FixtureCase[]): FixtureCase | null {
  if (fixtures.length === 0) {
    return null;
  }
  return fixtures.find((fx) => fx.name === "golden") ?? fixtures[0] ?? null;
}

function findByHint(entries: readonly RecordEntry[], hint: string): RecordEntry | null {
  return entries.find((e) => e.path.toLowerCase().includes(hint)) ?? null;
}

/** In-section jump links for the active section's live anchors. */
function SpineNav(props: {
  ids: readonly { id: string; label: string }[];
  onJump: (id: string) => void;
  present: ReadonlySet<string>;
}): React.ReactElement | null {
  const live = props.ids.filter((s) => props.present.has(s.id));
  if (live.length === 0) {
    return null;
  }
  return (
    <div className="mb-1 ml-2 border-l border-[#d4a052]/15 pl-2">
      {live.map((s) => (
        <button
          className="block w-full px-2 py-0.5 text-left text-[11px] text-[#9a8c78] hover:text-[#e8b86d]"
          key={s.id}
          onClick={() => props.onJump(s.id)}
          type="button"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ─── inside the play — one collapsible card per move ────────────────────────

/**
 * A move's "source" is whatever drives its doer: an AI move runs a **prompt**
 * (`prompts/<id>.md`); a deterministic move runs a **script** (a node in
 * `workflow.fabro`, no prompt file). We label it by which it is — the doer
 * chip already says judgment/mechanical; this says prompt/script, i.e. whether
 * there's a prompt to read at all.
 */
function moveSourceLabel(hasPrompt: boolean): string {
  return hasPrompt ? "prompt" : "script";
}

type MoveView = "story" | "source";

/** A lens chip for a move — the same gesture as One run's step chips. */
function MoveTab(props: {
  active: boolean;
  label: string;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      aria-pressed={props.active}
      className={[
        "rounded-[4px] px-2.5 py-1 text-[11px] transition-colors",
        props.active ? "bg-[#4fb8a8]/15 text-[#7ad4c4]" : "text-[#9a8c78] hover:text-[#d6c9b4]",
      ].join(" ")}
      onClick={props.onClick}
      type="button"
    >
      {props.label}
    </button>
  );
}

/**
 * One move, collapsed to its top line by default — number · id · doer · job —
 * so the section scans instead of walling. Open it and two lens chips appear
 * (the same gesture as One run's step chips): **The story** — the golden path
 * and its off-path branches — and **In Fabro** — the move's own source. Both
 * key off the same node: an AI move's source is its prompt (rendered inline);
 * a deterministic move's source is the node itself, which lives in Fabro.
 */
function MoveCard(props: {
  hasPrompt: boolean;
  move: PlayMove;
  prose: MoveProse | null;
  slug: string;
}): React.ReactElement {
  const { hasPrompt, move, prose, slug } = props;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<MoveView>("story");
  const promptPath = `prompts/${move.id}.md`;
  const { rendered, uncovered } = mergeBranches(prose?.branches ?? [], parseRoutes(move.routes));
  const hasStory =
    (prose?.golden != null && prose.golden.length > 0) ||
    rendered.length > 0 ||
    uncovered.length > 0;
  const sourceLabel = moveSourceLabel(hasPrompt);

  return (
    <div className="border-b border-[#d4a052]/12 py-2 last:border-b-0">
      <button
        aria-expanded={open}
        className="flex w-full flex-wrap items-baseline gap-2 text-left"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span className="w-3 shrink-0 text-[11px] text-[#8f806c]">{open ? "▾" : "▸"}</span>
        <span className="font-display text-[16px] text-[#d4a052]">{move.n}</span>
        <span className="font-semibold text-[13.5px] text-[#e8e0d4]">{move.id}</span>
        {move.doer != null ? (
          <span
            className={`rounded-[3px] border px-1.5 text-[8.5px] uppercase tracking-[0.1em] ${doerClasses(move.doer)}`}
          >
            {move.doer}
          </span>
        ) : null}
        <span className="text-[12.5px] text-[#9a8c78]">— {move.title}</span>
      </button>

      {open ? (
        <div className="ml-3 mt-2 border-l-2 border-[#d4a052]/20 pl-4">
          {/* lens chips — pick a view, the panel below updates (One run's gesture) */}
          <div className="mb-2.5 inline-flex gap-0.5 rounded-[6px] border border-[#33271d] p-0.5">
            <MoveTab active={view === "story"} label="The story" onClick={() => setView("story")} />
            <MoveTab
              active={view === "source"}
              label="In Fabro"
              onClick={() => setView("source")}
            />
          </div>

          {view === "story" ? (
            <>
              {prose?.golden != null && prose.golden.length > 0 ? (
                <div className="[&_li]:text-[13px] [&_li]:leading-6 [&_li]:text-[#d6c8b0] [&_ol]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p:last-child]:mb-0 [&_p]:text-[13px] [&_p]:leading-6 [&_p]:text-[#d6c8b0] [&_strong]:text-[#e8d8b8] [&_ul]:mt-1">
                  <StudioMarkdown content={prose.golden} />
                </div>
              ) : null}
              {rendered.map((r, i) => (
                <BranchCallout key={`${move.id}-b${i}`} rendered={r} />
              ))}
              {uncovered.map((route, i) => (
                <p className="mt-1.5 text-[11px] text-[#8f806c]" key={`${move.id}-u${i}`}>
                  <span className="text-[#6a5e4e]">off-path: </span>
                  {route.label} <span className="text-[#6a5e4e]">→</span> {route.target}
                </p>
              ))}
              {!hasStory ? (
                <p className="text-[12px] italic text-[#8f806c]">
                  No authored story for this move yet.
                </p>
              ) : null}
            </>
          ) : hasPrompt ? (
            <div className="max-h-[440px] overflow-y-auto rounded-[5px] border border-[#4fb8a8]/25 bg-black/30 p-3">
              <FileBody path={`plays/${slug}/${promptPath}`} />
            </div>
          ) : (
            <p className="text-[12px] text-[#8f806c]">
              A deterministic move — its {sourceLabel} is the node itself, in{" "}
              <code className="text-[#caa15f]">workflow.fabro</code>.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ─── composed plays — module workflow + tracker legs + gates ───────────────

function moveKindClasses(kind: string | undefined): string {
  if (kind === "command" || kind === "tool") {
    return "border-[#4fb8a8]/50 text-[#7ad4c4]";
  }
  if (kind === "human") {
    return "border-[#f0c060]/50 text-[#f0c060]";
  }
  if (kind === "conditional" || kind === "parallel" || kind === "parallel.fan_in") {
    return "border-[#7ab4d4]/50 text-[#93c4de]";
  }
  return "border-[#d4a052]/45 text-[#d4a052]";
}

function compactSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  if (seconds % 60 === 0) {
    return `${seconds / 60}m`;
  }
  return `${Math.round(seconds / 60)}m`;
}

function shortMoveId(id: string): string {
  const parts = id.split(":");
  return parts[parts.length - 1] ?? id;
}

function ModuleWorkflowGraph(props: { module: StudioCompositionModule }): React.ReactElement {
  const transitionsByFrom = new Map<
    string,
    Array<StudioCompositionModule["transitions"][number]>
  >();
  for (const transition of props.module.transitions) {
    const bucket = transitionsByFrom.get(transition.fromMoveId) ?? [];
    bucket.push(transition);
    transitionsByFrom.set(transition.fromMoveId, bucket);
  }

  return (
    <div
      className="rounded-[6px] border border-[#4fb8a8]/18 bg-[#10201d]/28 p-3"
      data-testid={`module-${props.module.module}-workflow`}
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7ad4c4]">
          Workflow graph
        </div>
        <div className="text-[10px] text-[#6a5e4e]">
          {props.module.moves.length} moves · {props.module.transitions.length} transitions
        </div>
      </div>
      {props.module.moves.length === 0 ? (
        <p className="text-[12px] text-[#8f806c]">No derived moves for this module.</p>
      ) : (
        <div className="flex flex-wrap items-stretch gap-2">
          {props.module.moves.map((move, index) => {
            const outgoing = transitionsByFrom.get(move.id) ?? [];
            return (
              <div className="flex min-w-[190px] max-w-[260px] flex-1 items-stretch" key={move.id}>
                <div className="flex-1 rounded-[5px] border border-[#d4a052]/18 bg-black/24 px-3 py-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-display text-[15px] text-[#e8b86d]">{index + 1}</span>
                    <span className="font-semibold text-[12.5px] text-[#e8e0d4]">{move.label}</span>
                    <span
                      className={`rounded-[3px] border px-1.5 text-[8px] uppercase tracking-[0.1em] ${moveKindClasses(move.kind)}`}
                    >
                      {move.kind}
                    </span>
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-[#8f806c]">
                    {shortMoveId(move.id)}
                  </div>
                  {outgoing.length > 0 ? (
                    <div className="mt-2 space-y-1">
                      {outgoing.map((transition) => (
                        <div
                          className="text-[10.5px] leading-4 text-[#9a8c78]"
                          key={`${transition.fromMoveId}-${transition.toMoveId}-${transition.label ?? ""}`}
                        >
                          <span className="text-[#6a5e4e]">→</span>{" "}
                          <span className="text-[#c9bba2]">{shortMoveId(transition.toMoveId)}</span>
                          {transition.label != null || transition.condition != null ? (
                            <span className="text-[#6a5e4e]">
                              {" "}
                              {transition.label ?? transition.condition}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ModuleTrackerLegs(props: { module: StudioCompositionModule }): React.ReactElement {
  const legsByNode = moduleLegsByNode(props.module);
  return (
    <div
      className="rounded-[6px] border border-[#d4a052]/18 bg-black/20 p-3"
      data-testid={`module-${props.module.module}-legs`}
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8b86d]">
          Tracker legs
        </div>
        <div className="text-[10px] text-[#6a5e4e]">{props.module.trackerLegs.length} legs</div>
      </div>
      {props.module.trackerLegsWarning != null ? (
        <p className="mb-2 text-[11px] text-[#e08a8a]">{props.module.trackerLegsWarning}</p>
      ) : null}
      {props.module.moves.length === 0 ? (
        <p className="text-[12px] text-[#8f806c]">No derived moves for tracker placement.</p>
      ) : (
        <div className="space-y-2">
          {props.module.moves.map((move) => {
            const leg = legsByNode.get(move.nodeId);
            return (
              <div className="border-l-2 border-[#d4a052]/30 pl-3" key={move.id}>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-[12.5px] font-semibold text-[#e8e0d4]">
                    {leg?.label ?? move.label}
                  </span>
                  <span className="font-mono text-[10px] text-[#6a5e4e]">{move.nodeId}</span>
                  {leg != null ? (
                    <span className="rounded-[3px] border border-[#4fb8a8]/40 px-1.5 text-[8.5px] uppercase tracking-[0.1em] text-[#7ad4c4]">
                      {compactSeconds(leg.typicalSeconds)}
                    </span>
                  ) : (
                    <span className="text-[10px] italic text-[#6a5e4e]">no leg</span>
                  )}
                </div>
                {leg?.lead != null ? (
                  <p className="mt-0.5 text-[11.5px] leading-5 text-[#c9bba2]">{leg.lead}</p>
                ) : leg?.description != null ? (
                  <p className="mt-0.5 text-[11.5px] leading-5 text-[#9a8c78]">{leg.description}</p>
                ) : null}
                {leg?.beats != null && leg.beats.length > 0 ? (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    {leg.beats.map((beat) => (
                      <li className="text-[11px] leading-5 text-[#9a8c78]" key={beat}>
                        {beat}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GateSeparator(props: {
  gate: StudioCompositionGate;
  onOpen: (path: string) => void;
  slug: string;
}): React.ReactElement {
  const { gate } = props;
  return (
    <div
      className="my-3 rounded-[6px] border border-[#e0b25a]/30 bg-[#e0b25a]/08 px-4 py-3"
      data-testid={`gate-${gate.id}`}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-display text-[16px] font-semibold text-[#e8b86d]">{gate.label}</span>
        {gate.decision != null ? (
          <span className="rounded-[3px] border border-[#78dc82]/40 px-1.5 text-[8.5px] uppercase tracking-[0.1em] text-[#9be8a0]">
            {gate.decision}
          </span>
        ) : null}
        {gate.decidedBy != null || gate.decidedAt != null ? (
          <span className="text-[11px] text-[#9a8c78]">
            {gate.decidedBy ?? "recorded"} {gate.decidedAt != null ? `· ${gate.decidedAt}` : ""}
          </span>
        ) : null}
      </div>
      {gate.basis != null ? (
        <p className="mt-1 text-[11.5px] leading-5 text-[#c9bba2]">{gate.basis}</p>
      ) : null}
      {gate.notes != null ? (
        <p className="mt-1 text-[11.5px] leading-5 text-[#9a8c78]">{gate.notes}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-3">
        {gate.files.json != null ? (
          <OpenChip label="gate JSON" onClick={() => props.onOpen(gate.files.json?.path ?? "")} />
        ) : null}
        {gate.files.review != null ? (
          <OpenChip
            label="review packet"
            onClick={() => props.onOpen(gate.files.review?.path ?? "")}
          />
        ) : null}
        {gate.files.other.map((file) => (
          <OpenChip key={file.path} label={file.path} onClick={() => props.onOpen(file.path)} />
        ))}
      </div>
      {gate.files.review != null ? (
        <div className="mt-3 max-h-[220px] overflow-y-auto rounded-[5px] border border-[#d4a052]/18 bg-black/24 px-3 py-2">
          <FileBody path={`plays/${props.slug}/${gate.files.review.path}`} />
        </div>
      ) : null}
    </div>
  );
}

function ComposedPlayWalk(props: {
  composition: StudioComposition;
  onOpen: (path: string) => void;
  slug: string;
}): React.ReactElement {
  const unplaced = unplacedGates(props.composition);
  return (
    <div className="max-w-[980px]" data-testid="composed-play-walk">
      <section id="moves">
        <SectionTitle>Composed play — modules</SectionTitle>
        <div className="space-y-3">
          {props.composition.modules.map((module, index) => (
            <div key={module.module}>
              <div
                className="rounded-[6px] border border-[#33271d] bg-[#16100a]/70 p-4"
                data-testid={`module-${module.module}`}
              >
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#b8863a]">
                      Module {index + 1}
                    </div>
                    <h3 className="font-display text-[22px] font-semibold text-[#e8b86d]">
                      {module.label}
                    </h3>
                    {module.playId != null ? (
                      <div className="font-mono text-[10px] text-[#6a5e4e]">{module.playId}</div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <OpenChip
                      label="workflow.fabro"
                      onClick={() => props.onOpen(module.workflowPath)}
                    />
                    {module.legsPath != null ? (
                      <OpenChip
                        label="legs.json"
                        onClick={() => props.onOpen(module.legsPath ?? "")}
                      />
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
                  <ModuleWorkflowGraph module={module} />
                  <ModuleTrackerLegs module={module} />
                </div>
              </div>
              {gatesAfterModule(props.composition, index).map((gate) => (
                <GateSeparator gate={gate} key={gate.id} onOpen={props.onOpen} slug={props.slug} />
              ))}
            </div>
          ))}
          {unplaced.length > 0 ? (
            <div>
              {unplaced.map((gate) => (
                <GateSeparator gate={gate} key={gate.id} onOpen={props.onOpen} slug={props.slug} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

// ─── one run, end to end — the chip-flow ────────────────────────────────────

// One palette per step of the run. Mirrors the prototype's coloured chips:
// input = gold, conversion = teal, output = green.
type RunStep = "input" | "conversion" | "output";

const RUN_PALETTE: Record<RunStep, { cell: string; off: string; on: string }> = {
  conversion: {
    cell: "border-[#4fb8a8]/50",
    off: "border-[#4fb8a8]/40 text-[#7ad4c4] hover:bg-[#4fb8a8]/10",
    on: "border-[#4fb8a8] bg-[#4fb8a8]/14 text-[#7ad4c4]",
  },
  input: {
    cell: "border-[#d4a052]/50",
    off: "border-[#d4a052]/40 text-[#e8b86d] hover:bg-[#d4a052]/10",
    on: "border-[#d4a052] bg-[#d4a052]/14 text-[#e8b86d]",
  },
  output: {
    cell: "border-[#78dc82]/50",
    off: "border-[#78dc82]/40 text-[#9be8a0] hover:bg-[#78dc82]/10",
    on: "border-[#78dc82] bg-[#78dc82]/12 text-[#9be8a0]",
  },
};

function RunChip(props: {
  active: boolean;
  label: string;
  mark: string;
  onClick: () => void;
  step: RunStep;
  sub?: string;
}): React.ReactElement {
  const p = RUN_PALETTE[props.step];
  return (
    <button
      aria-pressed={props.active}
      className={[
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[14px] border px-3 py-1.5 text-[11px] transition-colors",
        props.active ? p.on : p.off,
      ].join(" ")}
      onClick={props.onClick}
      type="button"
    >
      <span className="font-bold opacity-85">{props.mark}</span>
      <span>{props.label}</span>
      {props.sub != null ? <span className="opacity-60">{props.sub}</span> : null}
    </button>
  );
}

function CellLabel(props: { children: React.ReactNode }): React.ReactElement {
  return <div className="mb-2 text-[11.5px] leading-6 text-[#9a8c78]">{props.children}</div>;
}

const RunArrow = (props: { glyph?: string }): React.ReactElement => (
  <span className="text-[14px] text-[#6a5e4e]">{props.glyph ?? "→"}</span>
);

/**
 * "One run, end to end" — a single left-to-right path of clickable chips, each
 * revealing an inline excerpt beneath (one open at a time). The conversion step
 * is the no-monolith adaptation: instead of one prompt, it reveals the move
 * graph inline — every node links to its own prompt.
 */
function OneRunFlow(props: {
  grouped: GroupedRecords;
  moves: readonly PlayMove[];
  onOpen: (path: string) => void;
  onScrollTo: (id: string) => void;
  slug: string;
}): React.ReactElement {
  const { grouped, moves, onOpen, onScrollTo, slug } = props;
  const fixtureCase = showcaseCase(grouped.fixtures);
  const transcript = fixtureCase ? findByHint(fixtureCase.files, "transcript") : null;
  const inputExtras = fixtureCase
    ? fixtureCase.files.filter(
        (f) => f !== transcript && !f.path.toLowerCase().endsWith("readme.md"),
      )
    : [];
  const readOut = findByHint(grouped.dryRunTop, "read-out") ?? grouped.dryRunTop[0] ?? null;
  const fabro = grouped.logic.find((e) => e.path.endsWith(".fabro")) ?? null;

  // Start with every step closed — the path reads as a path first; the reader
  // chooses what to open.
  const [open, setOpen] = useState<RunStep | null>(null);
  const toggle = (step: RunStep) => setOpen((prev) => (prev === step ? null : step));

  return (
    <section id="run">
      <SectionTitle>One run, end to end</SectionTitle>
      <p className="mb-3 text-[12px] italic text-[#7ad4c4]">
        The play as one functional example: the real input, the conversion, and the real output.
        Click any step to open it inline; the full file is one click further.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {fixtureCase != null ? (
          <RunChip
            active={open === "input"}
            label="Real input"
            mark="1"
            onClick={() => toggle("input")}
            step="input"
          />
        ) : null}
        {moves.length > 0 ? (
          <>
            <RunArrow />
            <RunChip
              active={open === "conversion"}
              label="The conversion"
              mark="2"
              onClick={() => toggle("conversion")}
              step="conversion"
              sub="(the move graph)"
            />
          </>
        ) : null}
        {readOut != null ? (
          <>
            <RunArrow />
            <RunChip
              active={open === "output"}
              label="Real output"
              mark="3"
              onClick={() => toggle("output")}
              step="output"
            />
          </>
        ) : null}
      </div>

      {/* 1 · Real input — the conversation (and product context) a run consumes */}
      {open === "input" && fixtureCase != null ? (
        <div className={`mt-3 border-l-2 ${RUN_PALETTE.input.cell} pl-3.5`}>
          <CellLabel>
            The “{fixtureCase.name}” fixture — the conversation a run consumes as files
            {transcript != null ? (
              <>
                {". "}
                <OpenChip label="open the transcript" onClick={() => onOpen(transcript.path)} />
              </>
            ) : null}
            {inputExtras.map((f) => (
              <span key={f.path}>
                {" · "}
                <OpenChip label={f.label} onClick={() => onOpen(f.path)} />
              </span>
            ))}
          </CellLabel>
          {transcript != null ? (
            <InlineExcerpt path={transcript.path} slug={slug} />
          ) : (
            <p className="text-[11px] italic text-[#8f806c]">No transcript file in this fixture.</p>
          )}
        </div>
      ) : null}

      {/* 2 · The conversion — the move graph inline (no monolith) */}
      {open === "conversion" && moves.length > 0 ? (
        <div className={`mt-3 border-l-2 ${RUN_PALETTE.conversion.cell} pl-3.5`}>
          <CellLabel>
            No monolith — the conversion is a graph of {moves.length} node prompts, each a single
            move. Open any move’s prompt, or see them all below.
          </CellLabel>
          <ol className="space-y-1.5">
            {moves.map((move) => {
              const promptPath = `prompts/${move.id}.md`;
              const hasPrompt = grouped.logic.some((e) => e.path === promptPath);
              return (
                <li
                  className="flex flex-wrap items-baseline gap-2 text-[12px]"
                  key={`${move.n}-${move.id}`}
                >
                  <span className="w-4 font-display text-[13px] text-[#4fb8a8]">{move.n}</span>
                  <span className="font-semibold text-[#e8e0d4]">{move.id}</span>
                  {move.doer != null ? (
                    <span
                      className={`rounded-[3px] border px-1 text-[8px] uppercase tracking-[0.1em] ${doerClasses(move.doer)}`}
                    >
                      {move.doer}
                    </span>
                  ) : null}
                  {hasPrompt ? (
                    <OpenChip label="prompt" onClick={() => onOpen(promptPath)} />
                  ) : null}
                </li>
              );
            })}
          </ol>
          <div className="mt-2.5 flex flex-wrap gap-3">
            <OpenChip label="see each move in full" onClick={() => onScrollTo("moves")} />
            {fabro != null ? (
              <OpenChip label="open workflow.fabro" onClick={() => onOpen(fabro.path)} />
            ) : null}
          </div>
        </div>
      ) : null}

      {/* 3 · Real output — the graded read-out */}
      {open === "output" && readOut != null ? (
        <div className={`mt-3 border-l-2 ${RUN_PALETTE.output.cell} pl-3.5`}>
          <CellLabel>
            What the play produced on its fixtures, graded against the proof spec.{" "}
            <OpenChip label="open the graded read-out" onClick={() => onOpen(readOut.path)} />
          </CellLabel>
          <InlineExcerpt lines={12} path={readOut.path} slug={slug} />
        </div>
      ) : null}
    </section>
  );
}

function WalkThrough(props: {
  grouped: GroupedRecords;
  moveProse: Map<string, MoveProse> | null;
  narrative: string | null;
  onOpen: (path: string) => void;
  onOpenOverlay: (path: string) => void;
  onScrollTo: (id: string) => void;
  rung: StudioRung | undefined;
  slug: string;
  story: string | null;
  synopsis: PlaySynopsis | null;
  view: SectionView;
}): React.ReactElement {
  const { grouped, moveProse, narrative, rung, slug, story, synopsis, view } = props;
  const moves = useMemo(() => (story != null ? parseMoves(story) : []), [story]);
  // `fixtureCase` / `readOut` only gate whether the run section renders; the
  // chip-flow (OneRunFlow) recomputes what it needs internally.
  const fixtureCase = showcaseCase(grouped.fixtures);
  const readOut = findByHint(grouped.dryRunTop, "read-out") ?? grouped.dryRunTop[0] ?? null;
  const diagramPath = grouped.diagram != null ? `plays/${slug}/${grouped.diagram.path}` : null;
  // The play-in-use scene: prefer the authored fictional one, fall back to the
  // derived narrative. The section renders only when this is non-null.
  const scene = synopsis?.story ?? narrative;

  return (
    <div className="max-w-[860px]">
      {/* 1 · What it does — the authored synopsis, registry blurb as fallback */}
      {view === "overview" ? (
        <section id="spec">
          <div className="rounded-[6px] border border-[#d4a052]/25 bg-[#d4a052]/06 p-5">
            <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b8863a]">
              {rung?.prio === "core" ? "Golden path" : (rung?.surface ?? "Play")}
              {rung?.job != null ? ` · ${rung.job}` : ""}
            </div>
            <h1 className="font-display text-[26px] font-semibold leading-tight text-[#e8b86d]">
              {rung?.glyph ?? "▫"} {rung?.name ?? slug}
            </h1>
            {rung?.builtBy != null ? (
              <div className="mt-1 text-[11px] text-[#9a8c78]">Built by {rung.builtBy.agent}</div>
            ) : null}
            {synopsis?.whatItDoes != null ? (
              <div className="mt-2 [&_p]:text-[14px] [&_p]:leading-7 [&_p]:text-[#e0d3ba]">
                <StudioMarkdown content={synopsis.whatItDoes} />
              </div>
            ) : rung?.d != null ? (
              <p
                className="mt-3 text-[13.5px] leading-7 text-[#cdbfa6] [&_b]:font-semibold [&_b]:text-[#e8d8b8]"
                // Trusted studio-owned registry data (may carry inline <b>),
                // rendered verbatim as the Raven cards do.
                dangerouslySetInnerHTML={{ __html: rung.d }}
              />
            ) : (
              <p className="mt-3 text-[13px] italic text-[#8f806c]">
                No synopsis or registry description for this play yet.
              </p>
            )}
          </div>
          {synopsis?.reachForItWhen != null ? (
            <div className="mt-4">
              <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b8863a]">
                Reach for it when
              </div>
              <StudioMarkdown content={synopsis.reachForItWhen} />
            </div>
          ) : null}
        </section>
      ) : null}

      {/* 2 · The play, drawn */}
      {view === "overview" && diagramPath != null ? (
        <section id="drawn">
          <SectionTitle>The play, drawn</SectionTitle>
          <div
            aria-label="open diagram full-screen"
            className="flex cursor-zoom-in justify-center rounded-[6px] border border-[#d4a052]/20 bg-[#0e0a06] p-4"
            onClick={() => props.onOpenOverlay(diagramPath)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                props.onOpenOverlay(diagramPath);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <img
              alt="The play, drawn"
              className="max-h-[560px] w-auto max-w-full object-contain"
              src={fileUrl(diagramPath)}
            />
          </div>
          <DiagramLegend />
          <div className="mt-1.5 flex items-center gap-3">
            <button
              className="text-[11px] text-[#7ad4c4] hover:underline"
              onClick={() => props.onOpenOverlay(diagramPath)}
              type="button"
            >
              ⤢ open full-screen — zoom &amp; pan
            </button>
            <span className="text-[10px] text-[#6a5e4e]">click to zoom in &amp; pan</span>
          </div>
        </section>
      ) : null}

      {/* 3 · The play in use — the authored fictional scene; narrative fallback */}
      {view === "overview" && scene != null ? (
        <section id="inuse">
          <SectionTitle>The play in use</SectionTitle>
          <p className="mb-3 text-[12px] italic text-[#7ad4c4]">
            {synopsis?.story != null
              ? "A concrete example — the play firing in a real-feeling meeting."
              : "The whole play as one story — what the agent does, start to finish."}
          </p>
          <StudioMarkdown content={scene} />
          {story != null ? (
            <div className="mt-2">
              <OpenChip
                label="read the move-by-move story"
                onClick={() => props.onOpen("story.md")}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {/* 3b · When it fires — the trigger callout */}
      {view === "overview" && synopsis?.trigger != null ? (
        <section id="trigger">
          <SectionTitle>When it fires</SectionTitle>
          <div className="rounded-[6px] border border-dashed border-[#d4a052]/45 bg-[#d4a052]/06 px-4 py-1 [&_p]:text-[13.5px] [&_p]:leading-7 [&_strong]:text-[#e8b86d]">
            <StudioMarkdown content={synopsis.trigger} />
          </div>
        </section>
      ) : null}

      {/* 4 · One run, end to end — the chip-flow */}
      {view === "playwalk" && (fixtureCase != null || readOut != null) ? (
        <OneRunFlow
          grouped={grouped}
          moves={moves}
          onOpen={props.onOpen}
          onScrollTo={props.onScrollTo}
          slug={slug}
        />
      ) : null}

      {/* 5 · Inside the play — the moves (golden path + "problems happen") */}
      {view === "playwalk" && moves.length > 0 ? (
        <section id="moves">
          <SectionTitle>Inside the play — the moves</SectionTitle>
          <p className="mb-4 text-[12px] italic text-[#7ad4c4]">
            The golden path, move by move — each collapsed to its doer (
            <span className="text-[#d4a052]">judgment</span> or{" "}
            <span className="text-[#7ad4c4]">mechanical</span>) and one-line job. Open one for two
            lenses: its story — what it does and where it can{" "}
            <span className="text-[#eaa088]">↳ branch</span> off the golden path — or{" "}
            <span className="text-[#7ad4c4]">In Fabro</span>, the move&apos;s own source.
          </p>
          <div className="ml-1 border-l-2 border-[#d4a052]/25 pl-4">
            {moves.map((move) => (
              <MoveCard
                hasPrompt={grouped.logic.some((e) => e.path === `prompts/${move.id}.md`)}
                key={`${move.n}-${move.id}`}
                move={move}
                prose={moveProse?.get(move.id) ?? null}
                slug={slug}
              />
            ))}
          </div>
          <div className="mt-1">
            {grouped.logic.some((e) => e.path.endsWith(".fabro")) ? (
              <OpenChip
                label="open workflow.fabro"
                onClick={() =>
                  props.onOpen(
                    grouped.logic.find((e) => e.path.endsWith(".fabro"))?.path ?? "workflow.fabro",
                  )
                }
              />
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

// ─── the page ──────────────────────────────────────────────────────────────

export function PlayPage(props: {
  onBack: () => void;
  ready: boolean;
  rung: StudioRung | undefined;
  slug: string;
  stage: string | undefined;
}): React.ReactElement {
  const { ready, rung, slug, stage } = props;
  const [records, setRecords] = useState<readonly PlayRecord[] | null>(null);
  const [composition, setComposition] = useState<StudioComposition | null>(null);
  const [story, setStory] = useState<string | null>(null);
  const [synopsis, setSynopsis] = useState<PlaySynopsis | null>(null);
  const [moveProse, setMoveProse] = useState<Map<string, MoveProse> | null>(null);
  const [improvements, setImprovements] = useState<ImprovementColumn[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  // selected === null → a rendered section (Overview / Play Walk); else a file.
  const [selected, setSelected] = useState<string | null>(null);
  // which rendered section is active when no file is selected.
  const [view, setView] = useState<SectionView>("overview");
  // which Play Testing lens is active (its tabs live in the left nav).
  const [testingTab, setTestingTab] = useState<TabKey>("coverage");
  const [overlayPath, setOverlayPath] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<NavGroupKey>>(new Set());
  const [pendingAnchor, setPendingAnchor] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Guard against a stale-slug race: a slower response for the previous slug
    // must not overwrite the current one (the nested story fetch makes this
    // worse — A's story could land on B's view).
    let cancelled = false;
    setRecords(null);
    setComposition(null);
    setStory(null);
    setSynopsis(null);
    setMoveProse(null);
    setImprovements(null);
    setSelected(null);
    setView("overview");
    setOverlayPath(null);
    setExpandedGroups(new Set());
    setError(null);
    void Effect.runPromise(fetchStudioRecords(slug)).then(
      (value) => {
        if (cancelled) {
          return;
        }
        setRecords(value.records);
        const loadOptionalFile = <T,>(
          path: string,
          parse: (text: string) => T,
          update: (next: T | null) => void,
        ): void => {
          if (!value.records.some((r) => r.path === path)) {
            return;
          }
          void Effect.runPromise(fetchStudioFile(`plays/${slug}/${path}`)).then(
            (text) => {
              if (!cancelled) {
                update(parse(text));
              }
            },
            () => {
              if (!cancelled) {
                update(null);
              }
            },
          );
        };
        loadOptionalFile("story.md", (text) => text, setStory);
        loadOptionalFile("synopsis.md", parseSynopsis, setSynopsis);
        loadOptionalFile("moves.md", parseMoveProse, setMoveProse);
        loadOptionalFile("improvements.md", parseImprovements, setImprovements);
      },
      (cause: unknown) => {
        if (!cancelled) {
          setError(String(cause));
        }
      },
    );
    void Effect.runPromise(fetchStudioComposition(slug)).then(
      (value) => {
        if (!cancelled) {
          setComposition(value);
          if (value.modules.length > 0) {
            setView("playwalk");
          }
        }
      },
      (cause: unknown) => {
        if (!cancelled) {
          setError(String(cause));
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const grouped = useMemo(() => (records != null ? groupPlayRecords(records) : null), [records]);
  const modular = isModularComposition(composition);

  const designEntries = useMemo(
    () => (grouped != null ? designHistoryEntries(grouped) : []),
    [grouped],
  );

  // Hardening, lint, etc. — parked under Fixtures for now.
  const parkedEntries = useMemo(
    () => (grouped != null ? parkedDesignEntries(grouped) : []),
    [grouped],
  );

  // Open work = everything not in a Shipped/Done column — the rail badge.
  const openImprovementCount = useMemo(
    () =>
      (improvements ?? [])
        .filter((c) => !/shipped|done|closed|landed/i.test(c.title))
        .reduce((n, c) => n + c.items.length, 0),
    [improvements],
  );

  // improvements.md is present in the records but not yet parsed.
  const improvementsLoading =
    records?.some((r) => r.path === "improvements.md") === true && improvements == null;

  const narrative = useMemo(() => (story != null ? parseStoryNarrative(story) : null), [story]);

  // Which walk-through sections actually render — so the spine nav only shows
  // anchors that lead somewhere (mirrors WalkThrough's per-section conditions).
  const presentSections = useMemo(() => {
    const present = new Set<string>(["spec"]);
    if (grouped == null) {
      return present;
    }
    if (grouped.diagram != null) {
      present.add("drawn");
    }
    if (synopsis?.story != null || narrative != null) {
      present.add("inuse");
    }
    if (synopsis?.trigger != null) {
      present.add("trigger");
    }
    // A modular play renders ComposedPlayWalk, whose only walk anchor is #moves
    // (there is no #run). Return before the run check so the spine never offers a
    // "One run, end to end" jump that would scroll nowhere.
    if (isModularComposition(composition)) {
      present.add("moves");
      return present;
    }
    if (showcaseCase(grouped.fixtures) != null || grouped.dryRunTop.length > 0) {
      present.add("run");
    }
    const moves = story != null ? parseMoves(story) : [];
    if (moves.length > 0) {
      present.add("moves");
    }
    return present;
  }, [composition, grouped, narrative, story, synopsis]);

  // Play Walk earns a nav entry only when it has at least one live section.
  const playwalkPresent = useMemo(
    () => [...PLAYWALK_IDS].some((id) => presentSections.has(id)),
    [presentSections],
  );

  // Design earns its blue category when the play has any history file or an
  // Improvement Plan to show.
  const designPresent =
    designEntries.length > 0 ||
    parkedEntries.length > 0 ||
    improvements != null ||
    improvementsLoading;

  // Play Testing earns its first-class view when the play has authored a
  // risk-map.md — the surface renders from that file (PlayTesting.tsx).
  const hasRiskMap = records?.some((r) => r.path === "risk-map.md") === true;

  const select = useCallback((path: string) => {
    setSelected(path);
  }, []);

  const scrollTo = useCallback((id: string) => {
    setSelected(null);
    setPendingAnchor(id);
  }, []);

  // After returning to the walk-through, scroll to the requested section.
  useEffect(() => {
    if (pendingAnchor == null || selected != null) {
      return;
    }
    const el = mainRef.current?.querySelector(`#${pendingAnchor}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setPendingAnchor(null);
  }, [pendingAnchor, selected]);

  const toggleGroup = useCallback((key: NavGroupKey) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // Keep the file group that owns the current selection open.
  useEffect(() => {
    if (grouped == null || selected == null) {
      return;
    }
    const key = navGroupForPath(grouped, selected);
    if (key == null) {
      return;
    }
    setExpandedGroups((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, [grouped, selected]);

  const isSvgSelected = selected != null && selected.endsWith(".svg");

  return (
    <div>
      {/* header plate */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#4b3827] pb-3">
        <div className="flex items-center gap-3">
          <button
            className="rounded-[3px] border border-[#33271d] px-2 py-1 text-[11px] uppercase tracking-[0.1em] text-[#8f806c] hover:text-[#d6c9b4]"
            onClick={props.onBack}
            type="button"
          >
            ← Raven
          </button>
          <h1 className="font-display text-[22px] text-[#d4a052]">
            {rung?.glyph ?? "▫"} {rung?.name ?? slug}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {rung?.n != null ? (
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#c9a878]">
              #{rung.n}
            </span>
          ) : null}
          {rung?.prio != null ? (
            <span className="rounded-[3px] border border-[#6a5e4e]/60 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-[#b9aa91]">
              {rung.prio}
            </span>
          ) : null}
          <span
            className={`rounded-[3px] border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] ${stageBadgeColor(stage ?? "backlog")}`}
          >
            {stageLabel(stage)}
          </span>
          {ready ? (
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.1em] text-[#7ad4c4]">
              <span aria-hidden>●</span> ready
            </span>
          ) : null}
        </div>
      </div>

      {error != null ? (
        <p className="mt-4 text-[12px] text-[#e08a8a]">{error}</p>
      ) : grouped == null || records == null || composition == null ? (
        <p className="mt-4 text-[12px] text-[#8f806c]">loading play…</p>
      ) : records.length === 0 ? (
        <p className="mt-4 text-[12px] text-[#8f806c]">
          No records yet — this play has no files under studio/plays/{slug}/.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-[260px_minmax(0,1fr)] gap-5">
          {/* left nav: three first-class views, then the file groups */}
          <nav className="max-h-[74vh] overflow-y-auto border-r border-[#d4a052]/18 pr-1">
            {/* Overview — the explainer (the landing) */}
            <button
              className={[
                "mb-1 block w-full rounded-[4px] border px-3 py-2 text-left transition-colors",
                selected === null && view === "overview"
                  ? "border-[#4fb8a8]/60 bg-[#4fb8a8]/10 text-[#7ad4c4]"
                  : "border-[#4fb8a8]/30 text-[#7ad4c4] hover:bg-[#4fb8a8]/08",
              ].join(" ")}
              onClick={() => {
                setSelected(null);
                setView("overview");
              }}
              type="button"
            >
              <span className="block font-display text-[15px]">⊕ Overview</span>
              <span className="block text-[9.5px] uppercase tracking-[0.1em] text-[#6a5e4e]">
                what the play is
              </span>
            </button>
            {selected === null && view === "overview" ? (
              <SpineNav ids={OVERVIEW_SPINE} onJump={scrollTo} present={presentSections} />
            ) : null}

            {/* Play Walk — the move-by-move of an actual run */}
            {playwalkPresent ? (
              <>
                <button
                  className={[
                    "mb-1 block w-full rounded-[4px] border px-3 py-2 text-left transition-colors",
                    selected === null && view === "playwalk"
                      ? "border-[#4fb8a8]/60 bg-[#4fb8a8]/10 text-[#7ad4c4]"
                      : "border-[#4fb8a8]/30 text-[#7ad4c4] hover:bg-[#4fb8a8]/08",
                  ].join(" ")}
                  onClick={() => {
                    setSelected(null);
                    setView("playwalk");
                  }}
                  type="button"
                >
                  <span className="block font-display text-[15px]">⊞ Play Walk</span>
                  <span className="block text-[9.5px] uppercase tracking-[0.1em] text-[#6a5e4e]">
                    {modular ? "modules & gates" : "one run, move by move"}
                  </span>
                </button>
                {selected === null && view === "playwalk" ? (
                  <SpineNav ids={PLAYWALK_SPINE} onJump={scrollTo} present={presentSections} />
                ) : null}
              </>
            ) : null}

            {/* Design — the play's history + its living Improvement Plan */}
            {designPresent ? (
              <>
                <button
                  className={[
                    "mb-1 block w-full rounded-[4px] border px-3 py-2 text-left transition-colors",
                    view === "design"
                      ? "border-[#4fb8a8]/60 bg-[#4fb8a8]/10 text-[#7ad4c4]"
                      : "border-[#4fb8a8]/30 text-[#7ad4c4] hover:bg-[#4fb8a8]/08",
                  ].join(" ")}
                  onClick={() => {
                    setSelected(null);
                    setView("design");
                  }}
                  type="button"
                >
                  <span className="block font-display text-[15px]">◆ Design</span>
                  <span className="block text-[9.5px] uppercase tracking-[0.1em] text-[#6a5e4e]">
                    the plan &amp; how it was made
                  </span>
                </button>
                {view === "design" ? (
                  <div className="mb-1 ml-2 border-l border-[#4fb8a8]/20 pl-2">
                    {[...designEntries, ...parkedEntries].map((entry) => (
                      <button
                        className={[
                          "block w-full px-2 py-0.5 text-left text-[11px]",
                          selected === entry.path
                            ? "text-[#e8b86d]"
                            : "text-[#9a8c78] hover:text-[#e8b86d]",
                        ].join(" ")}
                        key={entry.path}
                        onClick={() => setSelected(entry.path)}
                        type="button"
                      >
                        {entry.label}
                      </button>
                    ))}
                    <button
                      className={[
                        "block w-full px-2 py-0.5 text-left text-[11px]",
                        selected === null
                          ? "text-[#e8a64f]"
                          : "text-[#9a8c78] hover:text-[#e8b86d]",
                      ].join(" ")}
                      onClick={() => setSelected(null)}
                      type="button"
                    >
                      ⚒ Improvement Plan
                      {openImprovementCount > 0 ? (
                        <span className="float-right pt-0.5 text-[10px] text-[#6a5e4e]">
                          {openImprovementCount}
                        </span>
                      ) : null}
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}

            {/* Play Testing — the testing surface, rendered from risk-map.md.
                Its three lenses live here in the left nav (like Design's). */}
            {hasRiskMap ? (
              <>
                <button
                  className={[
                    "mb-1 block w-full rounded-[4px] border px-3 py-2 text-left transition-colors",
                    view === "testing"
                      ? "border-[#4fb8a8]/60 bg-[#4fb8a8]/10 text-[#7ad4c4]"
                      : "border-[#4fb8a8]/30 text-[#7ad4c4] hover:bg-[#4fb8a8]/08",
                  ].join(" ")}
                  onClick={() => {
                    setSelected(null);
                    setView("testing");
                  }}
                  type="button"
                >
                  <span className="block font-display text-[15px]">🧪 Play Testing</span>
                  <span className="block text-[9.5px] uppercase tracking-[0.1em] text-[#6a5e4e]">
                    fixtures, risks &amp; evals
                  </span>
                </button>
                {view === "testing" ? (
                  <div className="mb-1 ml-2 border-l border-[#4fb8a8]/20 pl-2">
                    {TESTING_TABS.map((t) => (
                      <button
                        className={[
                          "block w-full px-2 py-0.5 text-left text-[11px]",
                          testingTab === t.key
                            ? "text-[#e8b86d]"
                            : "text-[#9a8c78] hover:text-[#e8b86d]",
                        ].join(" ")}
                        key={t.key}
                        onClick={() => {
                          setSelected(null);
                          setTestingTab(t.key);
                        }}
                        type="button"
                      >
                        {t.label}
                        <span className="float-right pt-0.5 text-[9px] text-[#6a5e4e]">
                          {t.blurb}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}

            {grouped.other.length > 0 ? (
              <CollapsibleRailGroup
                count={grouped.other.length}
                onToggle={() => toggleGroup("other")}
                open={expandedGroups.has("other")}
                title={NAV_GROUP_TITLES.other}
              >
                {grouped.other.map((entry) => (
                  <RailEntry entry={entry} key={entry.path} onSelect={select} selected={selected} />
                ))}
              </CollapsibleRailGroup>
            ) : null}
          </nav>

          {/* main pane */}
          <div className="max-h-[74vh] overflow-y-auto pr-2" ref={mainRef}>
            {selected !== null ? (
              <div>
                {isSvgSelected ? (
                  <button
                    className="mb-3 text-[11px] text-[#7ad4c4] hover:underline"
                    onClick={() => setOverlayPath(`plays/${slug}/${selected}`)}
                    type="button"
                  >
                    ⤢ open full-screen — scroll to zoom · drag to pan
                  </button>
                ) : null}
                <FileBody path={`plays/${slug}/${selected}`} />
              </div>
            ) : view === "design" ? (
              <ImprovementBoard columns={improvements} loading={improvementsLoading} />
            ) : view === "testing" ? (
              <PlayTesting slug={slug} tab={testingTab} />
            ) : modular && view === "playwalk" ? (
              <ComposedPlayWalk composition={composition} onOpen={select} slug={slug} />
            ) : (
              <WalkThrough
                grouped={grouped}
                moveProse={moveProse}
                narrative={narrative}
                onOpen={select}
                onOpenOverlay={setOverlayPath}
                onScrollTo={scrollTo}
                rung={rung}
                slug={slug}
                story={story}
                synopsis={synopsis}
                view={view}
              />
            )}
          </div>
        </div>
      )}

      {overlayPath != null ? (
        <DiagramOverlay onClose={() => setOverlayPath(null)} path={overlayPath} />
      ) : null}
    </div>
  );
}
