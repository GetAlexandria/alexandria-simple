import { relative, sep } from "path";
import { normalizeResolverKey } from "@alexandria/library-card-resolver";
import type { LibraryConfirmationStatus } from "./library-confirmation.js";
import {
  LIBRARY_CATALOG_LINK_KEYS,
  LIBRARY_CATALOG_TYPE_MAPPING_DISPOSITIONS,
  isLibraryCatalogLinkKey,
  isLibraryCatalogTypeMappingDisposition,
  type LibraryCatalogLinks,
  type LibraryCatalogTypeMappingEntry,
} from "./library-catalog-links.js";
import { markdownCardName, type LibraryMarkdownFile } from "./library-graph.js";
import {
  applyCatalogStoryResolution,
  createCatalogCardResolver,
  extractCatalogMarkdownSections,
  extractCatalogLegacyStory,
  extractCatalogStoryBuckets,
  extractCatalogWikilinks,
  LIBRARY_CATALOG_ALTITUDE_WORDS,
  splitFrontmatter,
  STORY_SECTION_NAMES,
  type LibraryCatalogDiagram,
  type LibraryCatalogStoryBuckets,
} from "./library-catalog-story.js";
import { isRecord } from "./state-events.js";

export const LIBRARY_CATALOG_GAPS_FILE = "gaps.json";
export const LIBRARY_CATALOG_WORKFLOWS_FILE = "workflows.json";
export const LIBRARY_CATALOG_WORKFLOWS_SCHEMA_VERSION = "library-workflows.v1";
// Standing-library root manifest. Named distinctly from the empty-library
// confirmation bundle manifest (EMPTY_LIBRARY_BUNDLE_MANIFEST_FILE,
// "runtime/empty-library/bundle.json") so the two `schemaVersion`-keyed files
// are not confused: this one gates catalog projection mode for a library root.
export const LIBRARY_CATALOG_MANIFEST_FILE = "library.json";
export const LIBRARY_CATALOG_DRAFT_MANIFEST_FILE = "library-draft.json";
export const PRODUCT_CARD_SCHEMA_VERSION = "product-card.v1";
export const RETIRED_PRODUCT_CARD_CONNECTORS_ISSUE_PREFIX = "Retired Product-card field connectors";
export const PRODUCT_CARD_IDENTITY_MISMATCH_ISSUE_PREFIX = "Library card identity mismatch";
export const RESERVED_LIBRARY_CONTEXT_ISSUE_PREFIX = "Reserved library context";
export const DUPLICATE_LIBRARY_CARD_STEM_ISSUE_PREFIX = "Duplicate library card stem";
export const RESERVED_LIBRARY_CONTEXTS = ["runtime"] as const;
// A `horizon: future` card with no citations still loads (soft, like the
// retired-connectors warning above) — `source_evidence` is already
// hard-required non-empty on the product path, so this fires only if that
// hard requirement is ever relaxed. Kept as an explicit acceptance criterion
// of issue #633.
export const FUTURE_HORIZON_MISSING_CITATION_ISSUE_PREFIX =
  'Horizon "future" requires at least one source_evidence entry';

export type LibraryCatalogSchemaMode = "legacy" | typeof PRODUCT_CARD_SCHEMA_VERSION;

export interface LibraryCatalogManifestMeta {
  draftOf?: string;
  playRunId?: string;
}

export type LibraryCatalogConfidence = "high" | "medium" | "low";
export type LibraryCatalogPlane = "strategy" | "product" | "learning";
export const PRODUCT_CARD_STATUS_VALUES = ["stub", "confirmed", "deprecated"] as const;
export type ProductCardStatus = (typeof PRODUCT_CARD_STATUS_VALUES)[number];
// A card's temporal footing — a second axis orthogonal to `status` (the
// two-axis precedent: status tracks confirmation lifecycle, horizon tracks
// whether the thing described exists yet). Absent is equivalent to "now";
// "future" is how a card says "I'm a plan, not a built thing" without a date
// (issue #633). No `past`/`scheduled` values — those need Ledger lifecycle
// events this slice does not add.
export const PRODUCT_CARD_HORIZON_VALUES = ["now", "future"] as const;
export type ProductCardHorizon = (typeof PRODUCT_CARD_HORIZON_VALUES)[number];
export type LibraryCatalogThreadFamily = "gap" | "hot_spot";
export type LibraryCatalogGapThreadKind = "missing_card" | "missing_context" | "missing_material";
export type LibraryCatalogHotSpotThreadKind =
  | "docs_disagree"
  | "judgment_punt"
  | "polysemy"
  | "runtime_vs_design"
  | "demotion"
  | "split"
  | "out_of_scope_suspect";
export type LibraryCatalogThreadKind =
  | LibraryCatalogGapThreadKind
  | LibraryCatalogHotSpotThreadKind;
export type LibraryCatalogThreadSource = "authored" | "derived";
// Reference lifecycle values the product understands. Authored status input is
// normalized to this set, but unknown values are not rejected.
export const CANONICAL_THREAD_STATUSES = ["open", "answered", "residual"] as const;
export type LibraryCatalogThreadStatus = (typeof CANONICAL_THREAD_STATUSES)[number];
export const LIBRARY_CATALOG_THREAD_RESOLUTION_STATES = [
  "director-ruled",
  "settled-by-cascade",
  "settled-by-triage",
  "deferred-residual",
  "invalidated",
] as const;
export type LibraryCatalogThreadResolutionState =
  (typeof LIBRARY_CATALOG_THREAD_RESOLUTION_STATES)[number];
export type LibraryCatalogRequiredSection = "WHAT" | "WHY" | "WHERE" | "HOW" | "WHEN";
export type LibraryCatalogDraftSetField = "context" | "plane" | "prefLabel" | "status";

export interface LibraryCatalogProvenanceActor {
  host?: string;
  kind: "agent" | "process" | "user";
  name?: string;
  process?: string;
}

export interface LibraryCatalogProvenance {
  actor?: LibraryCatalogProvenanceActor;
  label: string;
  sourceRefs: string[];
}

export interface LibraryCatalogDraftTrailEntry {
  agendaItemId: string;
  answerEventId: string;
  cardPath: string;
  fields: LibraryCatalogDraftSetField[];
  patchId: string;
  relationships: string[];
}

export interface LibraryCatalogCard {
  altLabels?: string[];
  altitude?: string;
  /** Lead-card labeled connectors as "verb -> Target prefLabel" (drives the how-it-works diagram). */
  connectors?: string[];
  confidence: LibraryCatalogConfidence;
  context: string;
  /**
   * Bet vitals: forward cost alongside `confidence`. Free-string like
   * `altitude` (the issue's `low`/`med`/`high` set is a reference, not an
   * enforced enum) so an unexpected value is stored, not rejected.
   */
  cost?: string;
  /** Type-keyed diagram normalized from connectors/flow after card labels resolve. */
  diagram?: LibraryCatalogDiagram;
  draftTrail?: LibraryCatalogDraftTrailEntry[];
  edgeIds: string[];
  /** Ordered lifecycle stages for a lead card (drives the functional flow diagram). */
  flow?: string[];
  /**
   * Experiment/Research: Evidence Strength stage — reported | demonstrated |
   * piloted | at-scale, per card-contract.md. Free-string, verdict-neutral,
   * never an enforced enum (same reasoning as `cost`/`strength`).
   */
  grade?: string;
  /** Experiment: pre-run prediction, written before `state` leaves "planned". Free string. */
  expected?: string;
  /** Experiment/Research/Measure: the arc (was `milestone`) a card belongs to. Free string. */
  arc?: string;
  /** Experiment: `{tag, note}` guardrails that must not worsen regardless of verdict — mirror-shape of `risks`/`stop`. */
  guardrails?: LibraryCatalogTagNote[];
  /** Corporate Bet/Principle: where the card transfers to (e.g. `company-library`). Stored, not rendered. */
  home?: string;
  /** Temporal footing; absent ≡ "now". See `ProductCardHorizon`. */
  horizon?: ProductCardHorizon;
  id: string;
  /**
   * Principle: `refusal` | `experience-goal` | `standard`. Experiment:
   * `probe` | `experiment`. Research: `founding-lesson` | `result` |
   * `observation` | `distilled`. As authored — reference, not enforced.
   */
  kind?: string;
  /** Typed Product-card relationships; diagrams derive from this for schema-aware roots. */
  links?: LibraryCatalogLinks;
  /** Research: where the evidence came from — desk-research | run-result | signal | emerged-from-build. Free string. */
  origin?: string;
  path?: string;
  plane: string;
  prefLabel: string;
  provenance: LibraryCatalogProvenance;
  /** Bet: named risks in file order, each rendered as "(tag) note". */
  risks?: LibraryCatalogBetRisk[];
  /** Experiment/Research/Measure: `headline` | `supporting` on the `arc` above (was `gate`). Free string. */
  role?: string;
  /** Experiment: `planned` | `running` | `called` lifecycle, orthogonal to card `status`. Free string. */
  state?: string;
  status: string;
  /** Experiment: `{tag, note}` pre-committed stopping rule — mirror-shape of `risks`. */
  stop?: LibraryCatalogTagNote[];
  /** Raw `## WHAT` story with `[[wikilinks]]` PRESERVED (synopsis strips them). */
  story?: string;
  /** Director-facing two-bucket story composed only from WHAT / WHERE / HOW. */
  storyBuckets?: LibraryCatalogStoryBuckets;
  /** Principle: `hard` | `soft`, as authored — reference, not enforced. */
  strength?: string;
  synopsis?: string;
  /** Measure: the quantity's target free-string, e.g. a threshold or aspiration. */
  target?: string;
  /**
   * Corporate Bet/Principle: currently only meaningful value is `pending`,
   * which drives the "Transfer pending" badge. Stored as authored (not a
   * locked literal) so a future lifecycle value doesn't need a parser change.
   */
  transfer?: string;
  /** Measure: free-string narration of current direction, updated by living-updates. */
  trend?: string;
  type: string;
  /** Experiment: `confirms` | `denies` | `mixed` | `inconclusive`, only once `state: called`. Free string. */
  verdict?: string;
}

/**
 * Shared `{tag, note}` shape: a Bet's named `risks`, an Experiment's `stop`
 * and `guardrails` entries. `tag` is a free string, rendered verbatim, no
 * special-casing.
 */
export interface LibraryCatalogTagNote {
  note: string;
  tag: string;
}

/** A Bet's named risk — identical shape to `LibraryCatalogTagNote`, kept as its own name for existing call sites. */
export type LibraryCatalogBetRisk = LibraryCatalogTagNote;

export interface LibraryCatalogGap {
  confidence: LibraryCatalogConfidence;
  context: string;
  id: string;
  label: string;
  plane: string;
  provenance: LibraryCatalogProvenance;
  reason: string;
}

export interface LibraryCatalogThreadConcern {
  cardId?: string;
  context?: string;
  label?: string;
  plane?: string;
  sourceCardId?: string;
  type: "card" | "context" | "noun";
}

export interface LibraryCatalogThreadResolution {
  answerText?: string;
  patches?: Array<{ eventId: string; patchId: string }>;
  reason?: string;
  resolvingEventId: string;
  state: LibraryCatalogThreadResolutionState;
}

export interface LibraryCatalogThread {
  confidence: LibraryCatalogConfidence;
  concerns: LibraryCatalogThreadConcern[];
  family: LibraryCatalogThreadFamily;
  id: string;
  /**
   * Free-string thread kind, preserved as authored (lowercased). The exported
   * `CANONICAL_THREAD_KINDS` set documents the kinds the Back-of-House sweep is
   * expected to emit and the viewer renders natively, but it is a reference set,
   * never enforced — an unrecognized kind still loads so no swept finding is lost.
   */
  kind: string;
  /**
   * Director-register agenda text. `reason` remains the builder-register detail.
   */
  question?: string;
  missingSections?: LibraryCatalogRequiredSection[];
  reason: string;
  emittingMove?: string;
  resolution?: LibraryCatalogThreadResolution;
  resolvingEventId?: string;
  severity: LibraryCatalogConfidence;
  sourceEvidence?: string[];
  source: LibraryCatalogThreadSource;
  status: LibraryCatalogThreadStatus;
}

export interface LibraryCatalogWorkflowStep {
  activity: string;
  cardRefs?: string[];
  context: string;
  doer?: string;
  evidence?: string;
  gate?: boolean;
  order: number;
  stateAfter?: string;
  stateBefore?: string;
}

export interface LibraryCatalogWorkflow {
  id: string;
  /** Plane of the owning aggregate card. Absent for sidecar-file workflows. */
  plane?: string;
  steps: LibraryCatalogWorkflowStep[];
  unit: string;
}

export interface LibraryCatalogFillReadinessCard {
  blockingThreadIds: string[];
  cardId: string;
  fillable: boolean;
  gapThreadIds: string[];
  missingSections: LibraryCatalogRequiredSection[];
}

export interface LibraryCatalogFillReadinessArea {
  areaId: string;
  cardCount: number;
  context: string;
  fillableCount: number;
  gapCount: number;
  hotSpotCount: number;
  plane: string;
  threadIds: string[];
}

export interface LibraryCatalogFillReadiness {
  areas: LibraryCatalogFillReadinessArea[];
  cards: LibraryCatalogFillReadinessCard[];
  fillableCardCount: number;
  gapCount: number;
  hotSpotCount: number;
  ready: boolean;
  threadCount: number;
  totalCardCount: number;
}

export interface LibraryCatalogArea {
  cardIds: string[];
  context: string;
  gapIds: string[];
  id: string;
  label: string;
  plane: string;
  status: "empty" | "filled" | "gap" | "partial";
}

export interface LibraryCatalogEdge {
  confidence?: LibraryCatalogConfidence;
  from: string;
  id: string;
  provenance?: LibraryCatalogProvenance;
  to: string;
  type: string;
}

export interface LibraryCatalogDraftUnresolvedUpdate {
  agendaItemId: string;
  answerEventId: string;
  cardPath: string;
  patchId: string;
  reason: string;
}

export interface LibraryCatalogDraftInvalidPatch {
  patchIndex: number;
  reason: string;
}

export interface LibraryCatalogDraftSectionConfirmation {
  answerEventId: string;
  cards: string[];
  context: string;
  eventId: string;
  plane: string;
  playRunId: string;
  prefLabel: string;
  scope?: string;
  summary: string;
  unknowns: string[];
}

export type LibraryCatalogDraftContainerDisposition =
  | "keep"
  | "rename"
  | "merge"
  | "demote"
  | "hold";

export interface LibraryCatalogDraftContainerMappingEntry {
  basis: string;
  disposition: LibraryCatalogDraftContainerDisposition;
  from: string;
  to?: string;
}

export interface LibraryCatalogDraftKeystoneDraft {
  body: string;
  context?: string;
  plane?: string;
  prefLabel?: string;
  status?: string;
}

export interface LibraryCatalogDraftRulingEntry {
  agendaItemId: string;
  answerEventId: string;
  cardUpdateCount: number;
  containerMapping: LibraryCatalogDraftContainerMappingEntry[];
  keystoneDraft?: LibraryCatalogDraftKeystoneDraft;
  patchId: string;
  rulingExcerpt?: string;
}

export interface LibraryCatalogDraftOverlay {
  appliedPatchCount: number;
  appliedUpdateCount: number;
  invalidPatches: LibraryCatalogDraftInvalidPatch[];
  patchLogPath: string;
  rulings: LibraryCatalogDraftRulingEntry[];
  sectionConfirmations: LibraryCatalogDraftSectionConfirmation[];
  unresolvedUpdates: LibraryCatalogDraftUnresolvedUpdate[];
}

export interface LibraryCatalog {
  areas: LibraryCatalogArea[];
  cards: LibraryCatalogCard[];
  draftOverlay?: LibraryCatalogDraftOverlay;
  edges: LibraryCatalogEdge[];
  fillReadiness?: LibraryCatalogFillReadiness;
  gaps: LibraryCatalogGap[];
  gate?: LibraryConfirmationStatus;
  meta: {
    areaCount: number;
    cardCount: number;
    draftOf?: string;
    edgeCount: number;
    gapCount: number;
    metadataIssues: string[];
    planes: string[];
    playRunId?: string;
  };
  threads?: LibraryCatalogThread[];
  typeMapping: LibraryCatalogTypeMappingEntry[];
  workflows?: LibraryCatalogWorkflow[];
}

export interface LibraryCatalogExplicitArea {
  context: string;
  id: string;
  label: string;
  plane: string;
}

export interface LibraryCatalogExtras {
  areas: LibraryCatalogExplicitArea[];
  gaps: LibraryCatalogGap[];
  metadataIssues: string[];
  typeMapping: LibraryCatalogTypeMappingEntry[];
}

export interface LibraryCatalogWorkflowsFile {
  metadataIssues: string[];
  workflows: LibraryCatalogWorkflow[];
}

interface CatalogCardBuildRecord {
  card: LibraryCatalogCard;
  content: string;
  metadataIssues: string[];
  pathIdentity?: ProductCardPathIdentity;
  workflowFlow?: ProductCardWorkflowFlow;
}

type FrontmatterValue = string | string[];
type LibraryFrontmatter = Record<string, FrontmatterValue>;

interface ProductCardWorkflowFlowStepDraft {
  activity?: string;
  context?: string;
  doer?: string;
  evidence?: string;
  gate?: boolean;
  invalid: boolean;
  refs?: string[];
  stateAfter?: string;
}

interface ProductCardWorkflowFlow {
  relativePath: string;
  steps: ProductCardWorkflowFlowStepDraft[];
}

interface ProductCardFlowParseResult {
  declared: boolean;
  stagedFlow: string[];
  workflowFlow?: ProductCardWorkflowFlow;
  workflowFlowDeclared: boolean;
}

interface ProductCardPathIdentity {
  context: string | null;
  isIdentitySource: boolean;
  isIndexShape: boolean;
  isRegularShape: boolean;
  prefLabel: string | null;
  relativePath: string;
  stem: string;
  type: string | null;
}

const REQUIRED_CARD_FIELDS = ["type", "prefLabel", "plane", "status"] as const;
const WIKILINK_PATTERN = /\[\[([^\]]+)\]\]/g;
export const PRODUCT_CARD_PLANES: LibraryCatalogPlane[] = ["strategy", "product", "learning"];
const PRODUCT_PLANE_RANK = new Map<string, number>(
  PRODUCT_CARD_PLANES.map((plane, index) => [plane, index]),
);
const CONFIDENCE_VALUES: LibraryCatalogConfidence[] = ["high", "medium", "low"];
const CONFIDENCE_VALUE_SET = new Set<LibraryCatalogConfidence>(CONFIDENCE_VALUES);
const REQUIRED_FILL_SECTIONS: LibraryCatalogRequiredSection[] = ["WHAT", "WHY", "WHERE", "HOW"];
// Canonical section ordering including the conditionally-required WHEN, used
// wherever sections need a stable order regardless of whether WHEN applies to
// a given card (e.g. normalizing an authored thread's `missingSections`).
// WHEN is NOT in REQUIRED_FILL_SECTIONS above - it is only required when a
// card's horizon is "future" (see `missingFillSections`).
const CANONICAL_FILL_SECTIONS: LibraryCatalogRequiredSection[] = [
  ...REQUIRED_FILL_SECTIONS,
  "WHEN",
];
// The canonical thread-kind vocabulary the Back-of-House sweep is expected to
// emit and the viewer renders natively. Like CANONICAL_CARD_TYPES, this is a
// REFERENCE constant, never a hard enum (the Alexandria-safe constant-not-enum
// rule): a thread whose `kind` falls outside this set still loads, with its raw
// lowercased kind preserved, so no swept finding is ever dropped. Settling the
// sweep's emit vocabulary (§5b) retired the brittle per-kind alias bridge that
// previously mapped compound sweep words onto these atoms — kinds now load
// as-authored, and the precise finding always survives in the thread `reason`.
export const CANONICAL_THREAD_KINDS: readonly LibraryCatalogThreadKind[] = [
  "missing_card",
  "missing_context",
  "missing_material",
  "docs_disagree",
  "judgment_punt",
  "polysemy",
  "runtime_vs_design",
  "demotion",
  "split",
  "out_of_scope_suspect",
];
// Display rank derived from CANONICAL_THREAD_KINDS — used only to order threads
// for presentation (see compareThreads). Free-string kinds outside the canonical
// set share the trailing rank and then fall back to alphabetical, so an
// unrecognized kind still sorts deterministically without being treated as
// special. This is the constant's only behavioral consumer; it is never a gate.
const CANONICAL_THREAD_KIND_RANK = new Map<string, number>(
  CANONICAL_THREAD_KINDS.map((kind, index) => [kind, index]),
);
const SEVERITY_RANK: Record<LibraryCatalogConfidence, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function toPosixPath(path: string): string {
  return path.split(sep).join("/");
}

function sortedUnique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

// Schema-aware roots use the canonical plane order (strategy, product, learning)
// that the rest of the app reads top-down, so plane buttons and the default
// selection are intentional rather than alphabetical. Any unexpected plane
// (e.g. a gap with a non-contract plane) sorts after the canonical set.
export function compareProductPlanes(left: string, right: string): number {
  const leftRank = PRODUCT_PLANE_RANK.get(left) ?? PRODUCT_CARD_PLANES.length;
  const rightRank = PRODUCT_PLANE_RANK.get(right) ?? PRODUCT_CARD_PLANES.length;
  return leftRank === rightRank ? left.localeCompare(right) : leftRank - rightRank;
}

export function orderProductCardPlanes(values: Iterable<string>): string[] {
  return [...new Set(values)].sort(compareProductPlanes);
}

function stableAreaId(plane: string, context: string): string {
  return `area:${plane}:${context}`;
}

// Display fallback for areas that never declared a `label`: a context slug like
// "knowledge-organization" reads as "Knowledge Organization" instead of leaking
// the raw slug (and its dash) into the Index tiles and context peek title.
function humanizeContextLabel(context: string): string {
  return context
    .split(/[\s_-]+/)
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

// Reserved context holding a plane's thesis ("keystone") card — the highest
// altitude "what it does / how it does it" read, one level up from a context.
// Its cards stay in `catalog.cards` (the Index renders the thesis from them) but
// are kept out of the area grid, coverage, readiness, and thread derivation:
// the thesis names *containers*, so its prose wikilinks point at contexts rather
// than cards and would otherwise raise spurious "missing card" gaps.
export const LIBRARY_INDEX_CONTEXT = "_index";

export function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseInlineList(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return [unquote(trimmed)].filter((item) => item.length > 0);
  }

  return trimmed
    .slice(1, -1)
    .split(",")
    .map((item) => unquote(item))
    .filter((item) => item.length > 0);
}

export function parseFrontmatterValue(value: string): FrontmatterValue {
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return parseInlineList(trimmed);
  }
  return unquote(trimmed);
}

type BlockScalarStyle = "folded" | "literal";

// Recognizes a YAML block-scalar indicator (`>`, `>-`, `>+`, `|`, `|-`, `|+`,
// optionally followed by an explicit indentation-indicator digit like `|2`,
// which is ignored — indentation is inferred from the first content line
// instead). Returns null for anything else so the caller falls through to the
// existing inline-scalar/list handling unchanged.
function parseBlockScalarIndicator(rawValue: string): BlockScalarStyle | null {
  const match = /^([|>])[+-]?[0-9]*$/.exec(rawValue.trim());
  if (match?.[1] == null) {
    return null;
  }
  return match[1] === "|" ? "literal" : "folded";
}

// Consumes the indented lines that follow a block-scalar indicator, starting
// at `startIndex`, and returns the assembled text plus the index of the first
// line past the block. A folded scalar (`>`) joins lines with spaces (YAML
// line-folding); a literal scalar (`|`) preserves the line breaks. Both
// chomping variants (`-` strip, default clip, `+` keep) collapse to the same
// stored value here: catalog vitals are consumed as trimmed display strings
// (see `frontmatterString`), so a trailing-newline distinction doesn't change
// what gets stored. Blank lines inside the block are already stripped
// upstream by `splitFrontmatter`, so an authored blank paragraph collapses —
// acceptable for the free-string vitals this exists to serve today.
function consumeBlockScalar(
  lines: string[],
  startIndex: number,
  style: BlockScalarStyle,
): { text: string; nextIndex: number } {
  const contentLines: string[] = [];
  let index = startIndex;
  while (index < lines.length) {
    const line = lines[index];
    if (line == null || !/^\s/.test(line)) {
      break;
    }
    contentLines.push(line.trim());
    index += 1;
  }

  return {
    nextIndex: index,
    text: contentLines.join(style === "literal" ? "\n" : " "),
  };
}

// Deliberately separate from `parseFrontmatter` in `knowledge-artifacts.ts`:
// that one is a scalar-only (`Record<string, string>`) parser on the
// load-bearing atomic-card discovery path. The catalog needs list-valued fields
// (e.g. `source_evidence`), so it keeps its own list-aware parser rather than
// changing the behavior of the atomic-card parser.
export function parseLibraryFrontmatter(content: string): LibraryFrontmatter {
  const lines = splitFrontmatter(content)?.lines ?? null;
  if (lines == null) {
    return {};
  }

  const fields: LibraryFrontmatter = {};
  let currentListKey: string | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line == null) {
      continue;
    }

    const listItemMatch = /^\s*-\s*(.+?)\s*$/.exec(line);
    if (listItemMatch?.[1] != null && currentListKey != null) {
      const current = fields[currentListKey];
      const values = Array.isArray(current) ? current : current == null ? [] : [current];
      fields[currentListKey] = [...values, unquote(listItemMatch[1])];
      continue;
    }

    const fieldMatch = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
    if (fieldMatch?.[1] == null) {
      currentListKey = null;
      continue;
    }

    const key = fieldMatch[1];
    const rawValue = fieldMatch[2] ?? "";
    const blockScalarStyle = parseBlockScalarIndicator(rawValue);
    if (blockScalarStyle != null) {
      const block = consumeBlockScalar(lines, index + 1, blockScalarStyle);
      fields[key] = block.text;
      currentListKey = null;
      index = block.nextIndex - 1;
      continue;
    }

    if (rawValue.trim().length === 0) {
      fields[key] = [];
      currentListKey = key;
      continue;
    }

    fields[key] = parseFrontmatterValue(rawValue);
    currentListKey = null;
  }

  return fields;
}

function frontmatterString(fields: LibraryFrontmatter, key: string): string | null {
  const value = fields[key];
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }

  if (Array.isArray(value) && value.length === 1 && value[0] != null) {
    const trimmed = value[0].trim();
    return trimmed.length === 0 ? null : trimmed;
  }

  return null;
}

function frontmatterStringList(fields: LibraryFrontmatter, key: string): string[] {
  const value = fields[key];
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter((item) => item.length > 0);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(";")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

const RESERVED_LIBRARY_CONTEXT_SET = new Set<string>(RESERVED_LIBRARY_CONTEXTS);

function productCardStemIdentity(stem: string): { prefLabel: string; type: string } | null {
  const stemSeparator = stem.indexOf(" - ");
  if (stemSeparator <= 0) {
    return null;
  }

  const type = stem.slice(0, stemSeparator).trim();
  const prefLabel = stem.slice(stemSeparator + 3).trim();
  return type.length === 0 || prefLabel.length === 0 ? null : { prefLabel, type };
}

function productCardPathIdentity(relativePath: string, fileName: string): ProductCardPathIdentity {
  const parts = relativePath.split("/");
  const stem = markdownCardName(fileName);
  const stemIdentity = productCardStemIdentity(stem);
  const context = parts.length > 1 ? (parts[0] ?? null) : null;
  const isIndexShape =
    parts.length === 2 && context === LIBRARY_INDEX_CONTEXT && stemIdentity != null;
  const isRegularShape =
    parts.length === 3 && stemIdentity != null && parts[1] === stemIdentity.type;
  const isIdentitySource = isIndexShape || isRegularShape;

  return {
    context,
    isIdentitySource,
    isIndexShape,
    isRegularShape,
    prefLabel: isIdentitySource ? (stemIdentity?.prefLabel ?? null) : null,
    relativePath,
    stem,
    type: isIdentitySource ? (stemIdentity?.type ?? null) : null,
  };
}

function appendLegacyIdentityMismatchIssues(
  fields: LibraryFrontmatter,
  pathIdentity: ProductCardPathIdentity,
  metadataIssues: string[],
): void {
  if (!pathIdentity.isIdentitySource) {
    return;
  }

  for (const [field, pathValue] of [
    ["type", pathIdentity.type],
    ["prefLabel", pathIdentity.prefLabel],
    ["context", pathIdentity.context],
  ] as const) {
    const frontmatterValue = frontmatterString(fields, field);
    if (frontmatterValue == null || pathValue == null || frontmatterValue === pathValue) {
      continue;
    }
    metadataIssues.push(
      `${PRODUCT_CARD_IDENTITY_MISMATCH_ISSUE_PREFIX} in ${pathIdentity.relativePath}: frontmatter ${field} "${frontmatterValue}" vs path "${pathValue}"`,
    );
  }
}

function appendReservedContextIssue(
  pathIdentity: ProductCardPathIdentity,
  metadataIssues: string[],
): void {
  if (
    !pathIdentity.isIdentitySource ||
    pathIdentity.context == null ||
    !RESERVED_LIBRARY_CONTEXT_SET.has(pathIdentity.context)
  ) {
    return;
  }

  metadataIssues.push(
    `${RESERVED_LIBRARY_CONTEXT_ISSUE_PREFIX} in ${pathIdentity.relativePath}: context "${pathIdentity.context}" is reserved for operational runtime state`,
  );
}

function normalizeConfidence(value: unknown): LibraryCatalogConfidence | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return CONFIDENCE_VALUE_SET.has(normalized as LibraryCatalogConfidence)
    ? (normalized as LibraryCatalogConfidence)
    : null;
}

function actorFromProposedBy(proposedBy: string | null): LibraryCatalogProvenanceActor | null {
  if (proposedBy == null) {
    return null;
  }

  const normalized = proposedBy.toLowerCase();
  if (normalized.includes("director") || normalized.includes("user")) {
    return { kind: "user", name: proposedBy };
  }

  if (normalized.includes("raven") || normalized.includes("agent")) {
    return { kind: "agent", name: proposedBy };
  }

  return { kind: "process", name: proposedBy };
}

function provenanceFromFrontmatter(fields: LibraryFrontmatter): LibraryCatalogProvenance | null {
  const proposedBy = frontmatterString(fields, "proposed_by");
  const sourceRefs = frontmatterStringList(fields, "source_evidence");

  if (proposedBy == null && sourceRefs.length === 0) {
    return null;
  }

  const actor = actorFromProposedBy(proposedBy);
  // `label` is the human-readable provenance label only. The source count is
  // composed for display by the viewer (see `provenanceText`), so it must not
  // be baked in here — otherwise cards render "scanner / 1 source / 1 source".
  const label = proposedBy ?? "source evidence";

  return {
    ...(actor == null ? {} : { actor }),
    label,
    sourceRefs,
  };
}

function normalizeWikilinkTarget(rawTarget: string): string {
  const withoutAlias = rawTarget.split("|")[0] ?? rawTarget;
  const withoutSection = withoutAlias.split("#")[0] ?? withoutAlias;
  return withoutSection.trim();
}

function normalizeEdgeType(rawType: string): string {
  const type = rawType
    .replace(/^\s*[-*]\s*/, "")
    .replace(/^#+\s*/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return type.length === 0 ? "related" : type;
}

function extractTypedOutboundEdges(content: string): Array<{ to: string; type: string }> {
  const edges: Array<{ to: string; type: string }> = [];

  for (const line of content.split(/\r?\n/)) {
    const colonIndex = line.indexOf(":");
    const firstLinkIndex = line.indexOf("[[");
    // Only treat a leading "Type:" prefix as the edge type when the colon
    // precedes the first wikilink. Otherwise a prose line such as
    // "see [[X]] for details: y" would mint a bogus edge type.
    const type =
      colonIndex > 0 && (firstLinkIndex < 0 || colonIndex < firstLinkIndex)
        ? normalizeEdgeType(line.slice(0, colonIndex))
        : "related";

    for (const match of line.matchAll(WIKILINK_PATTERN)) {
      const rawTarget = match[1];
      if (rawTarget == null) {
        continue;
      }

      const to = normalizeWikilinkTarget(rawTarget);
      if (to.length > 0) {
        edges.push({ to, type });
      }
    }
  }

  return edges;
}

function compareCards(left: LibraryCatalogCard, right: LibraryCatalogCard): number {
  return (
    left.plane.localeCompare(right.plane) ||
    left.context.localeCompare(right.context) ||
    left.prefLabel.localeCompare(right.prefLabel) ||
    left.id.localeCompare(right.id)
  );
}

function compareGaps(left: LibraryCatalogGap, right: LibraryCatalogGap): number {
  return (
    left.plane.localeCompare(right.plane) ||
    left.context.localeCompare(right.context) ||
    left.label.localeCompare(right.label) ||
    left.id.localeCompare(right.id)
  );
}

function compareEdges(left: LibraryCatalogEdge, right: LibraryCatalogEdge): number {
  return (
    left.from.localeCompare(right.from) ||
    left.type.localeCompare(right.type) ||
    left.to.localeCompare(right.to) ||
    left.id.localeCompare(right.id)
  );
}

function compareAreas(left: LibraryCatalogArea, right: LibraryCatalogArea): number {
  return (
    left.plane.localeCompare(right.plane) ||
    left.context.localeCompare(right.context) ||
    left.label.localeCompare(right.label) ||
    left.id.localeCompare(right.id)
  );
}

function concernSortKey(thread: LibraryCatalogThread): string {
  return (
    thread.concerns
      .map((concern) =>
        [
          concern.plane ?? "",
          concern.context ?? "",
          concern.cardId ?? concern.sourceCardId ?? "",
          concern.label ?? "",
          concern.type,
        ].join("\u0000"),
      )
      .sort((left, right) => left.localeCompare(right))[0] ?? ""
  );
}

function compareThreads(left: LibraryCatalogThread, right: LibraryCatalogThread): number {
  return (
    left.family.localeCompare(right.family) ||
    (CANONICAL_THREAD_KIND_RANK.get(left.kind) ?? CANONICAL_THREAD_KINDS.length) -
      (CANONICAL_THREAD_KIND_RANK.get(right.kind) ?? CANONICAL_THREAD_KINDS.length) ||
    left.kind.localeCompare(right.kind) ||
    SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity] ||
    concernSortKey(left).localeCompare(concernSortKey(right)) ||
    left.id.localeCompare(right.id)
  );
}

function compareWorkflows(left: LibraryCatalogWorkflow, right: LibraryCatalogWorkflow): number {
  return left.id.localeCompare(right.id);
}

/**
 * Pull a short, human-readable synopsis from the card body's `## WHAT` section
 * so the catalog can show "what this is" without opening the card. Strips the
 * stub marker, wikilink syntax, and markdown emphasis; caps length.
 */
function extractCatalogSynopsis(content: string): string {
  const whatMatch = content.match(/(?:^|\n)##\s+WHAT\b[^\n]*\n([\s\S]*?)(?=\n##\s|$)/);
  if (whatMatch == null) {
    return "";
  }
  let text = (whatMatch[1] ?? "")
    .replace(/_Stub\s*[—-]_/gi, "")
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length > 200) {
    const cut = text.slice(0, 200);
    const lastSpace = cut.lastIndexOf(" ");
    text = `${cut.slice(0, lastSpace > 120 ? lastSpace : 200).trim()}…`;
  }
  return text;
}

function frontmatterList(fields: LibraryFrontmatter, key: string): string[] {
  const value = fields[key];
  if (Array.isArray(value)) {
    return value.map((entry) => entry.trim()).filter((entry) => entry.length > 0);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
}

function hasFrontmatterField(fields: LibraryFrontmatter, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(fields, key);
}

// Appends a deduped `Invalid card <path>: <message>` entry to the soft
// metadataIssues channel. Shared by the frontmatter list parsers
// (`parseProductCardLinks`, `parseProductCardRisks`) so a malformed entry is
// reported once, never a hard card-reject.
function reportCardIssue(issues: string[], relativePath: string, message: string): void {
  const full = `Invalid card ${relativePath}: ${message}`;
  if (!issues.includes(full)) {
    issues.push(full);
  }
}

const LIBRARY_CATALOG_ALTITUDE_WORD_SET = new Set<string>(LIBRARY_CATALOG_ALTITUDE_WORDS);

function warnUnknownAltitude(
  altitude: string | null,
  relativePath: string,
  issues: string[],
): void {
  if (altitude == null) {
    return;
  }
  if (LIBRARY_CATALOG_ALTITUDE_WORD_SET.has(altitude.trim().toLowerCase())) {
    return;
  }
  reportCardIssue(
    issues,
    relativePath,
    `altitude "${altitude}" is not one of ${LIBRARY_CATALOG_ALTITUDE_WORDS.join(", ")}`,
  );
}

// Parses the nested `links:` mapping into typed relationship lists.
//
// Indentation contract: relationship keys sit two spaces under `links:` and
// list items four spaces (`    - "[[Card]]"`); an inline list
// (`  contains: ["[[Card]]"]`) is also accepted. This mirrors the single
// canonical writer — `renderFrontmatter` in `library-front-of-house.ts` — and
// the scanner that emits these cards. The strictness is deliberate: the corpus
// is machine-authored, so an off-contract line is reported as a "malformed
// links entry" issue rather than silently reshaped. Drift between the writer
// and this reader must be loud, not absorbed.
function parseProductCardLinks(
  content: string,
  relativePath: string,
  issues: string[],
): LibraryCatalogLinks {
  const lines = splitFrontmatter(content)?.lines ?? null;
  if (lines == null) {
    return {};
  }

  const valuesByKey = new Map<string, string[]>();
  let inLinks = false;
  let currentKey: string | null = null;

  const addIssue = (message: string): void => reportCardIssue(issues, relativePath, message);

  function setLinkValues(key: string, values: string[]): void {
    const current = valuesByKey.get(key) ?? [];
    valuesByKey.set(key, [...current, ...values]);
  }

  for (const line of lines) {
    if (inLinks) {
      if (/^\S/.test(line)) {
        inLinks = false;
        currentKey = null;
      } else {
        const relationshipMatch = /^  ([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
        if (relationshipMatch?.[1] != null) {
          const key = relationshipMatch[1];
          const raw = relationshipMatch[2] ?? "";
          if (!isLibraryCatalogLinkKey(key)) {
            addIssue(
              `unknown links key "${key}" (expected ${LIBRARY_CATALOG_LINK_KEYS.join(", ")})`,
            );
            currentKey = null;
            continue;
          }

          currentKey = key;
          if (raw.trim().length === 0) {
            valuesByKey.set(key, valuesByKey.get(key) ?? []);
            continue;
          }

          const trimmed = raw.trim();
          if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
            addIssue(`links.${key} must be a list of strings`);
            continue;
          }
          setLinkValues(key, parseInlineList(trimmed));
          continue;
        }

        const itemMatch = /^    -\s*(.+?)\s*$/.exec(line);
        if (itemMatch?.[1] != null) {
          if (currentKey != null) {
            setLinkValues(currentKey, [unquote(itemMatch[1])]);
          }
          continue;
        }

        addIssue(`malformed links entry "${line.trim()}"`);
        currentKey = null;
        continue;
      }
    }

    const fieldMatch = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
    if (fieldMatch?.[1] !== "links") {
      continue;
    }

    const rawValue = fieldMatch[2] ?? "";
    if (rawValue.trim().length > 0) {
      addIssue("links must be a nested mapping");
      continue;
    }

    inLinks = true;
    currentKey = null;
  }

  const links: LibraryCatalogLinks = {};
  for (const key of LIBRARY_CATALOG_LINK_KEYS) {
    const seen = new Set<string>();
    const values = (valuesByKey.get(key) ?? [])
      .map((entry) => entry.trim())
      .filter((entry) => {
        if (entry.length === 0 || seen.has(entry)) {
          return false;
        }
        seen.add(entry);
        return true;
      });
    if (values.length > 0) {
      links[key] = values;
    }
  }

  return links;
}

// Parses a `<fieldKey>:` list — a Bet's named `risks`, or an Experiment's
// pre-committed `stop`/`guardrails` (design-log.md D3: "mirror-shape of Bet
// risks") — each a fixed `{tag, note}` map (never a third key, never a
// nested list-of-values — the reason `parseProductCardLinks`'s more general
// key/value-list machinery next door doesn't fit here).
//
// Indentation contract: each entry starts with `  - <key>: value` (two-space
// indent, dash) and its second key continues at `    <key>: value`
// (four-space indent, no dash) — mirroring the same two-space/four-space
// convention `parseProductCardLinks` uses for a relationship's list items.
// Tolerant like that sibling parser: a malformed entry is reported into
// `issues` (the soft metadataIssues channel) and dropped, never a hard
// card-reject — the whole point of "must never error the load". `tag` is
// preserved exactly as authored (e.g. "Feasibility — retired" is valid); no
// vocabulary is enforced.
function parseProductCardTagNoteList(
  content: string,
  relativePath: string,
  issues: string[],
  fieldKey: string,
): LibraryCatalogTagNote[] {
  const lines = splitFrontmatter(content)?.lines ?? null;
  if (lines == null) {
    return [];
  }

  const addIssue = (message: string): void => reportCardIssue(issues, relativePath, message);

  const entries: LibraryCatalogTagNote[] = [];
  let current: { note?: string; tag?: string } | null = null;
  let flushedCount = 0;
  let inList = false;

  function flushCurrent(): void {
    if (current == null) {
      return;
    }
    const { note, tag } = current;
    if (tag == null || note == null) {
      addIssue(`${fieldKey}[${flushedCount}] missing ${tag == null ? "tag" : "note"}`);
    } else {
      entries.push({ note, tag });
    }
    flushedCount += 1;
    current = null;
  }

  function setEntryField(key: string, rawValue: string): void {
    if (key !== "note" && key !== "tag") {
      addIssue(`unknown ${fieldKey} key "${key}" (expected note, tag)`);
      return;
    }
    current = { ...current, [key]: unquote(rawValue) };
  }

  for (const line of lines) {
    if (inList) {
      const itemMatch = /^ {2}-\s*([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
      if (itemMatch?.[1] != null) {
        flushCurrent();
        setEntryField(itemMatch[1], itemMatch[2] ?? "");
        continue;
      }

      const continuationMatch = /^ {4}([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
      if (continuationMatch?.[1] != null) {
        if (current == null) {
          addIssue(`malformed ${fieldKey} entry "${line.trim()}"`);
        } else {
          setEntryField(continuationMatch[1], continuationMatch[2] ?? "");
        }
        continue;
      }

      if (/^\S/.test(line)) {
        inList = false;
      } else {
        addIssue(`malformed ${fieldKey} entry "${line.trim()}"`);
        continue;
      }
    }

    const fieldMatch = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
    if (fieldMatch?.[1] !== fieldKey) {
      continue;
    }

    const rawValue = fieldMatch[2] ?? "";
    if (rawValue.trim().length > 0) {
      addIssue(`${fieldKey} must be a list`);
      continue;
    }

    inList = true;
  }

  flushCurrent();

  return entries;
}

// A Bet's `risks:` — the original, still-named call site (existing tests
// pin the exact `risks[...]`/`unknown risks key`/`malformed risks entry`
// message shapes this thin wrapper preserves).
function parseProductCardRisks(
  content: string,
  relativePath: string,
  issues: string[],
): LibraryCatalogBetRisk[] {
  return parseProductCardTagNoteList(content, relativePath, issues, "risks");
}

function parseProductCardFlow(
  content: string,
  relativePath: string,
  issues: string[],
): ProductCardFlowParseResult {
  const lines = splitFrontmatter(content)?.lines ?? null;
  if (lines == null) {
    return {
      declared: false,
      stagedFlow: [],
      workflowFlowDeclared: false,
    };
  }

  const addIssue = (message: string): void => reportCardIssue(issues, relativePath, message);
  const stagedFlow: string[] = [];
  const workflowSteps: ProductCardWorkflowFlowStepDraft[] = [];
  let declared = false;
  let inFlow = false;
  let mode: "unknown" | "staged" | "workflow" = "unknown";
  let currentStep: ProductCardWorkflowFlowStepDraft | null = null;
  let currentWorkflowField: string | null = null;
  let workflowStepIndex = -1;
  let workflowFlowDeclared = false;

  function flushStep(): void {
    if (currentStep == null) {
      return;
    }
    workflowSteps.push(currentStep);
    currentStep = null;
    currentWorkflowField = null;
  }

  function ensureWorkflowMode(): void {
    workflowFlowDeclared = true;
    if (mode === "staged") {
      addIssue("flow mixes staged strings and workflow step objects");
    }
    mode = "workflow";
  }

  function setWorkflowField(
    step: ProductCardWorkflowFlowStepDraft,
    stepIndex: number,
    key: string,
    rawValue: string,
  ): void {
    if (
      key !== "activity" &&
      key !== "context" &&
      key !== "doer" &&
      key !== "evidence" &&
      key !== "gate" &&
      key !== "stateAfter" &&
      key !== "refs"
    ) {
      addIssue(
        `flow[${stepIndex}] unknown key "${key}" (expected activity, context, doer, evidence, gate, stateAfter, refs)`,
      );
      step.invalid = true;
      currentWorkflowField = null;
      return;
    }

    if (key === "gate") {
      currentWorkflowField = null;
      const value = rawValue.trim();
      if (value !== "true" && value !== "false") {
        addIssue(`flow[${stepIndex}].gate must be true or false`);
        step.invalid = true;
        return;
      }
      step.gate = value === "true";
      return;
    }

    if (key === "refs") {
      currentWorkflowField = "refs";
      const trimmed = rawValue.trim();
      if (trimmed.length === 0) {
        step.refs = step.refs ?? [];
        return;
      }
      if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
        addIssue(`flow[${stepIndex}].refs must be a list of strings`);
        step.invalid = true;
        return;
      }
      step.refs = parseInlineList(trimmed);
      return;
    }

    currentWorkflowField = key;
    const value = unquote(rawValue);
    if (value.trim().length === 0) {
      addIssue(`flow[${stepIndex}].${key} must be a non-empty string`);
      step.invalid = true;
      return;
    }
    if (key === "activity") {
      step.activity = value;
    } else if (key === "context") {
      step.context = value;
    } else if (key === "doer") {
      step.doer = value;
    } else if (key === "evidence") {
      step.evidence = value;
    } else {
      step.stateAfter = value;
    }
  }

  for (const line of lines) {
    if (inFlow) {
      if (/^\S/.test(line)) {
        flushStep();
        inFlow = false;
        currentWorkflowField = null;
      } else {
        const itemMatch = /^ {2}-\s*(.*?)\s*$/.exec(line);
        if (itemMatch?.[1] != null) {
          flushStep();
          const rawItem = itemMatch[1];
          const fieldMatch = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(rawItem);
          if (fieldMatch?.[1] != null) {
            ensureWorkflowMode();
            workflowStepIndex += 1;
            currentStep = { invalid: false };
            setWorkflowField(currentStep, workflowStepIndex, fieldMatch[1], fieldMatch[2] ?? "");
            continue;
          }

          if (workflowFlowDeclared) {
            workflowStepIndex += 1;
            addIssue(`flow[${workflowStepIndex}] expected object`);
            continue;
          }

          mode = "staged";
          const value = unquote(rawItem);
          if (value.trim().length > 0) {
            stagedFlow.push(value);
          }
          continue;
        }

        const continuationMatch = /^ {4}([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
        if (continuationMatch?.[1] != null && currentStep != null) {
          ensureWorkflowMode();
          setWorkflowField(
            currentStep,
            workflowStepIndex,
            continuationMatch[1],
            continuationMatch[2] ?? "",
          );
          continue;
        }

        const nestedRefMatch = /^ {6}-\s*(.+?)\s*$/.exec(line);
        if (nestedRefMatch?.[1] != null && currentStep != null && currentWorkflowField === "refs") {
          ensureWorkflowMode();
          const value = unquote(nestedRefMatch[1]);
          if (value.trim().length === 0) {
            addIssue(`flow[${workflowStepIndex}].refs must contain non-empty strings`);
            currentStep.invalid = true;
          } else {
            currentStep.refs = [...(currentStep.refs ?? []), value];
          }
          continue;
        }

        if (workflowFlowDeclared && currentStep != null) {
          addIssue(`flow[${workflowStepIndex}] malformed entry "${line.trim()}"`);
          currentStep.invalid = true;
        } else if (mode === "staged") {
          addIssue(`malformed flow entry "${line.trim()}"`);
        }
        continue;
      }
    }

    const fieldMatch = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
    if (fieldMatch?.[1] !== "flow") {
      continue;
    }

    declared = true;
    const rawValue = fieldMatch[2] ?? "";
    if (rawValue.trim().length === 0) {
      inFlow = true;
      mode = "unknown";
      continue;
    }

    const trimmed = rawValue.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      stagedFlow.push(...parseInlineList(trimmed));
    } else {
      const scalar = unquote(trimmed);
      if (scalar.length > 0) {
        stagedFlow.push(scalar);
      }
    }
  }

  flushStep();

  return {
    declared,
    stagedFlow,
    ...(workflowFlowDeclared
      ? {
          workflowFlow: {
            relativePath,
            steps: workflowSteps,
          },
        }
      : {}),
    workflowFlowDeclared,
  };
}

function hasProductCardFlowDeclaration(file: LibraryMarkdownFile, libraryRoot: string): boolean {
  const relativePath = toPosixPath(relative(libraryRoot, file.path));
  return parseProductCardFlow(file.content, relativePath, []).declared;
}

function isStagedFlowOwner(type: string): boolean {
  const normalized = type.trim().toLowerCase();
  return normalized === "pattern" || normalized === "mechanism";
}

function allowedListText(values: readonly string[]): string {
  return values.join(", ");
}

function includesAllowedValue<T extends string>(values: readonly T[], value: string): value is T {
  return (values as readonly string[]).includes(value);
}

function productCardString(
  fields: LibraryFrontmatter,
  key: string,
  relativePath: string,
  issues: string[],
): string | null {
  const value = frontmatterString(fields, key);
  if (value == null) {
    issues.push(`Invalid card ${relativePath}: missing ${key}`);
  }
  return value;
}

function productCardEnum<T extends string>(
  fields: LibraryFrontmatter,
  key: string,
  values: readonly T[],
  relativePath: string,
  issues: string[],
): T | null {
  const rawValue = frontmatterString(fields, key);
  if (rawValue == null) {
    issues.push(`Invalid card ${relativePath}: missing ${key}`);
    return null;
  }

  const normalized = rawValue.toLowerCase();
  if (includesAllowedValue(values, normalized)) {
    return normalized;
  }

  issues.push(
    `Invalid card ${relativePath}: ${key} "${rawValue}" is not one of ${allowedListText(values)}`,
  );
  return null;
}

// Optional counterpart to `productCardEnum`: a missing key is not an issue
// (undefined, no field on the card), but a present-and-invalid value is a
// hard parse issue with the same message shape as the required variant. Used
// for fields like `horizon` where absence is a meaningful default rather
// than incomplete metadata.
function optionalProductCardEnum<T extends string>(
  fields: LibraryFrontmatter,
  key: string,
  values: readonly T[],
  relativePath: string,
  issues: string[],
): T | undefined {
  if (!hasFrontmatterField(fields, key)) {
    return undefined;
  }

  const rawValue = frontmatterString(fields, key);
  if (rawValue != null) {
    const normalized = rawValue.toLowerCase();
    if (includesAllowedValue(values, normalized)) {
      return normalized;
    }
  }

  issues.push(
    `Invalid card ${relativePath}: ${key} "${rawValue ?? ""}" is not one of ${allowedListText(values)}`,
  );
  return undefined;
}

// `proposed_by:` is dropped from frontmatter under the product-card.v2
// convention (library-migration plan.md §2.2: creation provenance moves to
// the card's creation ledger event) — cards authored that way have no
// `proposed_by:` at all. Mirrors the legacy-schema fallback label
// (`provenanceFromFrontmatter` above) rather than hard-failing the card.
function productCardProvenance(
  proposedBy: string | null,
  sourceRefs: string[],
): LibraryCatalogProvenance {
  const actor = actorFromProposedBy(proposedBy);
  return {
    ...(actor == null ? {} : { actor }),
    label: proposedBy ?? "source evidence",
    sourceRefs,
  };
}

function createProductCatalogCardRecord(
  file: LibraryMarkdownFile,
  libraryRoot: string,
): CatalogCardBuildRecord | string[] {
  const relativePath = toPosixPath(relative(libraryRoot, file.path));
  const fileName = relativePath.split("/").at(-1);

  if (fileName == null || !fileName.endsWith(".md")) {
    return [`Not a markdown catalog path: ${relativePath}`];
  }

  const fields = parseLibraryFrontmatter(file.content);
  const issues: string[] = [];
  const metadataIssues: string[] = [];
  // v2 card contract (library-migration plan §2.2, ruled 2026-07-08):
  // identity derives from the path — `<context>/<Type>/<Type> - <Name>.md` —
  // so type/prefLabel/context frontmatter is optional and falls back to the
  // path; `proposed_by` moved to creation events; `source_evidence` renamed
  // `evidence`. v1 cards that still carry the fields read exactly as before.
  const stem = markdownCardName(fileName);
  const stemIdentity = productCardStemIdentity(stem);
  const pathIdentity = productCardPathIdentity(relativePath, fileName);
  const pathIdentityContext = pathIdentity.isIdentitySource ? pathIdentity.context : null;
  appendLegacyIdentityMismatchIssues(fields, pathIdentity, metadataIssues);
  appendReservedContextIssue(pathIdentity, metadataIssues);
  const type =
    pathIdentity.type ??
    frontmatterString(fields, "type") ??
    stemIdentity?.type ??
    productCardString(fields, "type", relativePath, issues);
  const prefLabel =
    pathIdentity.prefLabel ??
    frontmatterString(fields, "prefLabel") ??
    stemIdentity?.prefLabel ??
    productCardString(fields, "prefLabel", relativePath, issues);
  const plane = productCardEnum(fields, "plane", PRODUCT_CARD_PLANES, relativePath, issues);
  const context =
    pathIdentityContext ??
    frontmatterString(fields, "context") ??
    (relativePath.includes("/") ? relativePath.split("/")[0]! : null) ??
    productCardString(fields, "context", relativePath, issues);
  const status = productCardEnum(
    fields,
    "status",
    PRODUCT_CARD_STATUS_VALUES,
    relativePath,
    issues,
  );
  // Confidence is an optional claim qualifier under the v2 contract; an
  // unstated confidence projects conservatively as "low" (don't lean on it).
  const confidence =
    frontmatterString(fields, "confidence") == null
      ? ("low" as const)
      : productCardEnum(fields, "confidence", CONFIDENCE_VALUES, relativePath, issues);
  const proposedBy = frontmatterString(fields, "proposed_by") ?? "unattributed";
  const explicitSourceRefs = frontmatterStringList(fields, "source_evidence");
  const sourceRefs =
    explicitSourceRefs.length > 0 ? explicitSourceRefs : frontmatterStringList(fields, "evidence");
  const horizon = optionalProductCardEnum(
    fields,
    "horizon",
    PRODUCT_CARD_HORIZON_VALUES,
    relativePath,
    issues,
  );

  if (issues.length > 0) {
    return issues;
  }

  if (
    type == null ||
    prefLabel == null ||
    plane == null ||
    context == null ||
    status == null ||
    confidence == null
  ) {
    // `confidence` can only be null here via the `!usesPathIdentity` branch
    // above, which already pushed an issue and returned earlier — this
    // check exists for type narrowing, not because it can fire on its own.
    return [`Invalid card ${relativePath}: incomplete product card metadata`];
  }

  const id = markdownCardName(fileName);
  const altLabels = frontmatterList(fields, "altLabels");
  const synopsis = extractCatalogSynopsis(file.content);
  const story = extractCatalogLegacyStory(file.content);
  const storyBuckets = extractCatalogStoryBuckets(file.content);
  const altitude = frontmatterString(fields, "altitude");
  const cost = frontmatterString(fields, "cost");
  const home = frontmatterString(fields, "home");
  const kind = frontmatterString(fields, "kind");
  const strength = frontmatterString(fields, "strength");
  const transfer = frontmatterString(fields, "transfer");
  // Learning-plane vitals (issue #675, mirroring the Bet `risks`/#628
  // precedent): tolerant free strings and `{tag, note}` lists, never closed
  // enums, so an author's word choice is stored rather than rejected. Not
  // type-gated — like `cost`/`strength`/`kind` above, any card may carry
  // them; only Experiment/Research/Measure cards are expected to in
  // practice.
  const grade = frontmatterString(fields, "grade");
  const state = frontmatterString(fields, "state");
  const expected = frontmatterString(fields, "expected");
  const arc = frontmatterString(fields, "arc");
  const role = frontmatterString(fields, "role");
  const verdict = frontmatterString(fields, "verdict");
  const origin = frontmatterString(fields, "origin");
  const target = frontmatterString(fields, "target");
  const trend = frontmatterString(fields, "trend");
  warnUnknownAltitude(altitude, relativePath, metadataIssues);
  const parsedFlow = parseProductCardFlow(file.content, relativePath, metadataIssues);
  const flow = parsedFlow.stagedFlow;
  if (parsedFlow.declared && flow.length > 0 && !isStagedFlowOwner(type)) {
    reportCardIssue(
      metadataIssues,
      relativePath,
      "staged flow is valid only on Pattern or Mechanism cards",
    );
  }
  const links = parseProductCardLinks(file.content, relativePath, metadataIssues);
  const risks = parseProductCardRisks(file.content, relativePath, metadataIssues);
  const stop = parseProductCardTagNoteList(file.content, relativePath, metadataIssues, "stop");
  const guardrails = parseProductCardTagNoteList(
    file.content,
    relativePath,
    metadataIssues,
    "guardrails",
  );
  if (hasFrontmatterField(fields, "connectors")) {
    metadataIssues.push(
      `${RETIRED_PRODUCT_CARD_CONNECTORS_ISSUE_PREFIX} in ${relativePath}; migrate to links.`,
    );
  }
  if (horizon === "future" && sourceRefs.length === 0) {
    metadataIssues.push(`${FUTURE_HORIZON_MISSING_CITATION_ISSUE_PREFIX} in ${relativePath}.`);
  }

  return {
    card: {
      ...(altLabels.length > 0 ? { altLabels } : {}),
      ...(altitude != null ? { altitude } : {}),
      ...(arc != null ? { arc } : {}),
      confidence,
      context,
      ...(cost != null ? { cost } : {}),
      edgeIds: [],
      ...(expected != null ? { expected } : {}),
      ...(flow.length > 0 ? { flow } : {}),
      ...(grade != null ? { grade } : {}),
      ...(guardrails.length > 0 ? { guardrails } : {}),
      ...(home != null ? { home } : {}),
      ...(horizon != null ? { horizon } : {}),
      id,
      ...(kind != null ? { kind } : {}),
      ...(Object.keys(links).length > 0 ? { links } : {}),
      ...(origin != null ? { origin } : {}),
      path: relativePath,
      plane,
      prefLabel,
      provenance: productCardProvenance(proposedBy, sourceRefs),
      ...(risks.length > 0 ? { risks } : {}),
      ...(role != null ? { role } : {}),
      ...(state != null ? { state } : {}),
      status,
      ...(stop.length > 0 ? { stop } : {}),
      ...(story.length > 0 ? { story } : {}),
      ...(storyBuckets.what.length > 0 ||
      storyBuckets.how.length > 0 ||
      storyBuckets.why.length > 0 ||
      storyBuckets.when.length > 0
        ? { storyBuckets }
        : {}),
      ...(strength != null ? { strength } : {}),
      ...(synopsis.length > 0 ? { synopsis } : {}),
      ...(target != null ? { target } : {}),
      ...(transfer != null ? { transfer } : {}),
      ...(trend != null ? { trend } : {}),
      type,
      ...(verdict != null ? { verdict } : {}),
    },
    content: file.content,
    metadataIssues,
    ...(pathIdentity.isIdentitySource ? { pathIdentity } : {}),
    ...(parsedFlow.workflowFlow == null ? {} : { workflowFlow: parsedFlow.workflowFlow }),
  };
}

function createCatalogCardRecord(
  file: LibraryMarkdownFile,
  libraryRoot: string,
  catalogSchema: LibraryCatalogSchemaMode,
): CatalogCardBuildRecord | string[] {
  if (catalogSchema === PRODUCT_CARD_SCHEMA_VERSION) {
    return createProductCatalogCardRecord(file, libraryRoot);
  }

  const relativePath = toPosixPath(relative(libraryRoot, file.path));
  const fileName = relativePath.split("/").at(-1);

  if (fileName == null || !fileName.endsWith(".md")) {
    return [`Not a markdown catalog path: ${relativePath}`];
  }

  const fields = parseLibraryFrontmatter(file.content);
  const missingSmallFloor = REQUIRED_CARD_FIELDS.filter(
    (field) => frontmatterString(fields, field) == null,
  );
  const confidence = normalizeConfidence(frontmatterString(fields, "confidence"));
  const provenance = provenanceFromFrontmatter(fields);
  const status = frontmatterString(fields, "status");
  const issues = [
    ...missingSmallFloor.map((field) => `missing ${field}`),
    ...(confidence == null ? ["missing confidence"] : []),
    ...(provenance == null ? ["missing provenance"] : []),
    ...(status?.toLowerCase() === "gap" ? ["markdown status gap is not a catalog card"] : []),
  ];

  if (issues.length > 0) {
    return [`Invalid catalog card ${relativePath}: ${issues.join(", ")}`];
  }

  const id = markdownCardName(fileName);
  const type = frontmatterString(fields, "type");
  const prefLabel = frontmatterString(fields, "prefLabel");
  const context = frontmatterString(fields, "context");
  const plane = frontmatterString(fields, "plane");

  if (
    type == null ||
    prefLabel == null ||
    plane == null ||
    status == null ||
    confidence == null ||
    provenance == null
  ) {
    return [`Invalid catalog card ${relativePath}: incomplete catalog metadata`];
  }

  const altLabels = frontmatterList(fields, "altLabels");
  const synopsis = extractCatalogSynopsis(file.content);
  const story = extractCatalogLegacyStory(file.content);
  const altitude = frontmatterString(fields, "altitude");
  const flow = frontmatterList(fields, "flow");
  const connectors = frontmatterList(fields, "connectors");
  const metadataIssues =
    context == null ? [`Invalid catalog card ${relativePath}: missing context`] : [];
  warnUnknownAltitude(altitude, relativePath, metadataIssues);

  return {
    card: {
      ...(altLabels.length > 0 ? { altLabels } : {}),
      ...(altitude != null ? { altitude } : {}),
      ...(connectors.length > 0 ? { connectors } : {}),
      confidence,
      context: context ?? "",
      edgeIds: [],
      ...(flow.length > 0 ? { flow } : {}),
      id,
      path: relativePath,
      plane,
      prefLabel,
      provenance,
      status,
      ...(story.length > 0 ? { story } : {}),
      ...(synopsis.length > 0 ? { synopsis } : {}),
      type,
    },
    content: file.content,
    metadataIssues,
  };
}

function recordString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function recordStringList(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];
  if (Array.isArray(value)) {
    return value.flatMap((item) => (typeof item === "string" && item.trim() ? [item.trim()] : []));
  }

  if (typeof value === "string") {
    return value
      .split(";")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

function provenanceFromRecord(record: Record<string, unknown>): LibraryCatalogProvenance | null {
  const provenance = record.provenance;
  if (isRecord(provenance)) {
    const label = recordString(provenance, "label");
    const sourceRefs = recordStringList(provenance, "sourceRefs");
    if (label != null) {
      return {
        label,
        sourceRefs,
      };
    }
  }

  const proposedBy = recordString(record, "proposed_by");
  const sourceRefs = recordStringList(record, "source_evidence");
  if (proposedBy == null && sourceRefs.length === 0) {
    return null;
  }

  const actor = actorFromProposedBy(proposedBy);
  return {
    ...(actor == null ? {} : { actor }),
    label: proposedBy ?? "source evidence",
    sourceRefs,
  };
}

function parseExplicitArea(record: unknown, index: number): LibraryCatalogExplicitArea | string {
  if (!isRecord(record)) {
    return `Invalid catalog area ${index}: expected object`;
  }

  const context = recordString(record, "context");
  const plane = recordString(record, "plane");
  if (context == null || plane == null) {
    return `Invalid catalog area ${index}: missing context or plane`;
  }

  return {
    context,
    id: recordString(record, "id") ?? stableAreaId(plane, context),
    label: recordString(record, "label") ?? humanizeContextLabel(context),
    plane,
  };
}

function parseTypeMappingEntry(
  record: unknown,
  index: number,
): LibraryCatalogTypeMappingEntry | string {
  if (!isRecord(record)) {
    return `Invalid type mapping entry ${index}: expected object`;
  }

  const basis = recordString(record, "basis");
  const dispositionValue = recordString(record, "disposition");
  const from = recordString(record, "from");
  const to = recordString(record, "to");
  if (basis == null || dispositionValue == null || from == null) {
    return `Invalid type mapping entry ${index}: missing basis, disposition, or from`;
  }

  if (!isLibraryCatalogTypeMappingDisposition(dispositionValue)) {
    return `Invalid type mapping entry ${index}: disposition must be one of ${LIBRARY_CATALOG_TYPE_MAPPING_DISPOSITIONS.join(", ")}`;
  }

  return {
    basis,
    disposition: dispositionValue,
    from,
    ...(to == null ? {} : { to }),
  };
}

function parseGap(record: unknown, index: number): LibraryCatalogGap | string {
  if (!isRecord(record)) {
    return `Invalid catalog gap ${index}: expected object`;
  }

  const confidence = normalizeConfidence(recordString(record, "confidence"));
  const context = recordString(record, "context");
  const label = recordString(record, "label");
  const plane = recordString(record, "plane");
  const provenance = provenanceFromRecord(record);
  const reason = recordString(record, "reason");
  const issues = [
    ...(context == null ? ["missing context"] : []),
    ...(label == null ? ["missing label"] : []),
    ...(plane == null ? ["missing plane"] : []),
    ...(reason == null ? ["missing reason"] : []),
    ...(confidence == null ? ["missing confidence"] : []),
    ...(provenance == null ? ["missing provenance"] : []),
  ];

  if (issues.length > 0) {
    return `Invalid catalog gap ${index}: ${issues.join(", ")}`;
  }

  if (
    context == null ||
    label == null ||
    plane == null ||
    reason == null ||
    confidence == null ||
    provenance == null
  ) {
    return `Invalid catalog gap ${index}: incomplete gap metadata`;
  }

  return {
    confidence,
    context,
    id: recordString(record, "id") ?? `gap:${plane}:${context}:${label}`,
    label,
    plane,
    provenance,
    reason,
  };
}

function optionalWorkflowString(
  record: Record<string, unknown>,
  key: string,
  issues: string[],
): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(record, key)) {
    return undefined;
  }
  const value = recordString(record, key);
  if (value == null) {
    issues.push(`${key} must be a non-empty string`);
    return undefined;
  }
  return value;
}

function optionalWorkflowBoolean(
  record: Record<string, unknown>,
  key: string,
  issues: string[],
): boolean | undefined {
  if (!Object.prototype.hasOwnProperty.call(record, key)) {
    return undefined;
  }
  const value = record[key];
  if (typeof value !== "boolean") {
    issues.push(`${key} must be a boolean`);
    return undefined;
  }
  return value;
}

function optionalWorkflowStringArray(
  record: Record<string, unknown>,
  key: string,
  issues: string[],
): string[] | undefined {
  if (!Object.prototype.hasOwnProperty.call(record, key)) {
    return undefined;
  }
  const value = record[key];
  if (!Array.isArray(value)) {
    issues.push(`${key} must be an array of strings`);
    return undefined;
  }
  const items: string[] = [];
  value.forEach((item, index) => {
    if (typeof item !== "string" || item.trim().length === 0) {
      issues.push(`${key}[${index}] must be a non-empty string`);
      return;
    }
    items.push(item.trim());
  });
  return items;
}

// Stable, human-readable locators shared by every workflow diagnostic so a
// parse error and a coverage error point at the same thing the same way:
// a workflow by its `id` (or `#<position>` when the id is missing/malformed),
// a step by its authored `order` (or `#<position>` when the order is missing).
function workflowLocator(id: string | null | undefined, index: number): string {
  return id == null ? `#${index}` : `"${id}"`;
}

function stepLocator(order: unknown, index: number): string {
  return typeof order === "number" && Number.isFinite(order) ? `${order}` : `#${index}`;
}

function parseWorkflowStep(
  record: unknown,
  stepIndex: number,
): LibraryCatalogWorkflowStep | string {
  if (!isRecord(record)) {
    return `step ${stepLocator(undefined, stepIndex)}: expected object`;
  }

  const orderValue = record.order;
  const activity = recordString(record, "activity");
  const context = recordString(record, "context");
  const issues = [
    ...(typeof orderValue !== "number" || !Number.isFinite(orderValue) ? ["missing order"] : []),
    ...(activity == null ? ["missing activity"] : []),
    ...(context == null ? ["missing context"] : []),
  ];
  const doer = optionalWorkflowString(record, "doer", issues);
  const stateBefore = optionalWorkflowString(record, "stateBefore", issues);
  const stateAfter = optionalWorkflowString(record, "stateAfter", issues);
  const gate = optionalWorkflowBoolean(record, "gate", issues);
  const cardRefs = optionalWorkflowStringArray(record, "cardRefs", issues);
  const evidence = optionalWorkflowString(record, "evidence", issues);

  if (issues.length > 0) {
    return `step ${stepLocator(orderValue, stepIndex)}: ${issues.join(", ")}`;
  }

  if (typeof orderValue !== "number" || activity == null || context == null) {
    return `step ${stepLocator(orderValue, stepIndex)}: incomplete step metadata`;
  }

  return {
    activity,
    ...(cardRefs == null ? {} : { cardRefs }),
    context,
    ...(doer == null ? {} : { doer }),
    ...(evidence == null ? {} : { evidence }),
    ...(gate == null ? {} : { gate }),
    order: orderValue,
    ...(stateAfter == null ? {} : { stateAfter }),
    ...(stateBefore == null ? {} : { stateBefore }),
  };
}

function parseWorkflow(record: unknown, index: number): LibraryCatalogWorkflow | string[] {
  if (!isRecord(record)) {
    return [
      `Invalid ${LIBRARY_CATALOG_WORKFLOWS_FILE}: workflow ${workflowLocator(undefined, index)}: expected object`,
    ];
  }

  const id = recordString(record, "id");
  const unit = recordString(record, "unit");
  const workflow = workflowLocator(id, index);
  const issues: string[] = [];
  const workflowIssues = [
    ...(id == null ? ["missing id"] : []),
    ...(unit == null ? ["missing unit"] : []),
    ...(!Array.isArray(record.steps) ? ["steps must be an array"] : []),
  ];
  if (workflowIssues.length > 0) {
    issues.push(
      `Invalid ${LIBRARY_CATALOG_WORKFLOWS_FILE}: workflow ${workflow}: ${workflowIssues.join(", ")}`,
    );
  }
  const stepRecords = Array.isArray(record.steps) ? record.steps : [];
  const steps: LibraryCatalogWorkflowStep[] = [];

  stepRecords.forEach((stepRecord, stepIndex) => {
    const step = parseWorkflowStep(stepRecord, stepIndex);
    if (typeof step === "string") {
      issues.push(`Invalid ${LIBRARY_CATALOG_WORKFLOWS_FILE}: workflow ${workflow} ${step}`);
      return;
    }
    steps.push(step);
  });

  if (issues.length > 0) {
    return issues;
  }

  if (id == null || unit == null) {
    return [
      `Invalid ${LIBRARY_CATALOG_WORKFLOWS_FILE}: workflow ${workflow}: incomplete workflow metadata`,
    ];
  }

  return {
    id,
    steps: steps
      .map((step, stepIndex) => ({ step, stepIndex }))
      .sort((left, right) => left.step.order - right.step.order || left.stepIndex - right.stepIndex)
      .map(({ step }) => step),
    unit,
  };
}

export function parseLibraryCatalogExtras(content: string): LibraryCatalogExtras {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return {
      areas: [],
      gaps: [],
      metadataIssues: [
        `Invalid ${LIBRARY_CATALOG_GAPS_FILE}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
      typeMapping: [],
    };
  }

  if (!isRecord(parsed)) {
    return {
      areas: [],
      gaps: [],
      metadataIssues: [`Invalid ${LIBRARY_CATALOG_GAPS_FILE}: expected object`],
      typeMapping: [],
    };
  }

  const metadataIssues: string[] = [];
  const areaRecords = Array.isArray(parsed.areas) ? parsed.areas : [];
  const gapRecords = Array.isArray(parsed.gaps) ? parsed.gaps : [];
  const typeMappingRecords = Array.isArray(parsed.typeMapping) ? parsed.typeMapping : [];
  const areas: LibraryCatalogExplicitArea[] = [];
  const gaps: LibraryCatalogGap[] = [];
  const typeMapping: LibraryCatalogTypeMappingEntry[] = [];

  areaRecords.forEach((record, index) => {
    const area = parseExplicitArea(record, index);
    if (typeof area === "string") {
      metadataIssues.push(area);
      return;
    }
    areas.push(area);
  });

  gapRecords.forEach((record, index) => {
    const gap = parseGap(record, index);
    if (typeof gap === "string") {
      metadataIssues.push(gap);
      return;
    }
    gaps.push(gap);
  });

  typeMappingRecords.forEach((record, index) => {
    const entry = parseTypeMappingEntry(record, index);
    if (typeof entry === "string") {
      metadataIssues.push(entry);
      return;
    }
    typeMapping.push(entry);
  });

  return { areas, gaps, metadataIssues, typeMapping };
}

export function parseLibraryCatalogWorkflows(content: string): LibraryCatalogWorkflowsFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return {
      metadataIssues: [
        `Invalid ${LIBRARY_CATALOG_WORKFLOWS_FILE}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
      workflows: [],
    };
  }

  if (!isRecord(parsed)) {
    return {
      metadataIssues: [`Invalid ${LIBRARY_CATALOG_WORKFLOWS_FILE}: expected object`],
      workflows: [],
    };
  }

  if (parsed.schemaVersion !== LIBRARY_CATALOG_WORKFLOWS_SCHEMA_VERSION) {
    return {
      metadataIssues: [
        `Invalid ${LIBRARY_CATALOG_WORKFLOWS_FILE}: schemaVersion must be ${LIBRARY_CATALOG_WORKFLOWS_SCHEMA_VERSION}`,
      ],
      workflows: [],
    };
  }

  const metadataIssues: string[] = [];
  if (parsed.workflows !== undefined && !Array.isArray(parsed.workflows)) {
    metadataIssues.push(`Invalid ${LIBRARY_CATALOG_WORKFLOWS_FILE}: workflows must be an array`);
  }
  const workflowRecords = Array.isArray(parsed.workflows) ? parsed.workflows : [];
  const workflows: LibraryCatalogWorkflow[] = [];
  const seenIds = new Set<string>();

  workflowRecords.forEach((record, index) => {
    const workflow = parseWorkflow(record, index);
    if (Array.isArray(workflow)) {
      metadataIssues.push(...workflow);
      return;
    }
    if (seenIds.has(workflow.id)) {
      metadataIssues.push(
        `Invalid ${LIBRARY_CATALOG_WORKFLOWS_FILE}: duplicate workflow id "${workflow.id}"`,
      );
      return;
    }
    seenIds.add(workflow.id);
    workflows.push(workflow);
  });

  return { metadataIssues, workflows: workflows.sort(compareWorkflows) };
}

function compactSectionText(value: string): string {
  return value.replace(/<!--[\s\S]*?-->/g, "").trim();
}

function isWhyFillSectionExempt(
  card: Pick<LibraryCatalogCard, "altitude" | "context" | "status">,
): boolean {
  return (
    card.status === "deprecated" ||
    card.context === LIBRARY_INDEX_CONTEXT ||
    card.altitude?.toLowerCase() === "keystone"
  );
}

function requiredFillSections(
  card: Pick<LibraryCatalogCard, "altitude" | "context" | "horizon" | "plane" | "status">,
): LibraryCatalogRequiredSection[] {
  // WHEN is required for every `plane: learning` card regardless of horizon
  // (design-log.md D3, ruled: "WHEN is the card's biography" — a shipped
  // card always has a past and present to narrate, not only a planned
  // future one) — in addition to the pre-existing `horizon: future` trigger,
  // which is unchanged for product/strategy cards.
  const whenRequired = card.horizon === "future" || card.plane === "learning";
  const required = whenRequired ? CANONICAL_FILL_SECTIONS : REQUIRED_FILL_SECTIONS;
  return required.filter((section) => section !== "WHY" || !isWhyFillSectionExempt(card));
}

// WHAT/WHY/WHERE/HOW are required unconditionally; WHEN joins the
// requirement when the card's horizon is "future", OR unconditionally for
// any `plane: learning` card (issue #675) - read live from the parsed card
// each pass, so flipping horizon or plane drops/adds the requirement on the
// next parse. Deprecated, `_index`, and keystone cards are exempt from WHY
// only. Output order comes from the canonical list.
function missingFillSections(
  content: string,
  card: LibraryCatalogCard,
): LibraryCatalogRequiredSection[] {
  const sections = extractCatalogMarkdownSections(content);
  const sectionText: Record<LibraryCatalogRequiredSection, string> = {
    WHAT: sections.what,
    WHY: sections.why,
    WHERE: sections.where,
    HOW: sections.how,
    WHEN: sections.when,
  };
  return requiredFillSections(card).filter(
    (section) => compactSectionText(sectionText[section]).length === 0,
  );
}

function sectionListText(sections: readonly LibraryCatalogRequiredSection[]): string {
  if (sections.length <= 1) {
    return sections[0] ?? "";
  }
  if (sections.length === 2) {
    return `${sections[0]} and ${sections[1]}`;
  }
  return `${sections.slice(0, -1).join(", ")}, and ${sections.at(-1)}`;
}

type CatalogCardResolver = (label: string) => LibraryCatalogCard | undefined;

function cardConcern(card: LibraryCatalogCard): LibraryCatalogThreadConcern {
  return {
    cardId: card.id,
    context: card.context,
    label: card.prefLabel,
    plane: card.plane,
    type: "card",
  };
}

function derivedMissingMaterialThread(
  card: LibraryCatalogCard,
  missingSections: readonly LibraryCatalogRequiredSection[],
): LibraryCatalogThread {
  return {
    confidence: "high",
    concerns: [cardConcern(card)],
    family: "gap",
    id: `thread:derived:missing-material:${card.id}`,
    kind: "missing_material",
    missingSections: [...missingSections],
    reason: `Missing ${sectionListText(missingSections)} for ${card.prefLabel}.`,
    severity: "high",
    source: "derived",
    status: "open",
  };
}

function derivedMissingCardThread(
  sourceCard: LibraryCatalogCard,
  targetLabel: string,
): LibraryCatalogThread {
  return {
    confidence: "high",
    concerns: [
      cardConcern(sourceCard),
      {
        context: sourceCard.context,
        label: targetLabel,
        plane: sourceCard.plane,
        sourceCardId: sourceCard.id,
        type: "noun",
      },
    ],
    family: "gap",
    id: `thread:derived:missing-card:${sourceCard.id}:${targetLabel}`,
    kind: "missing_card",
    reason: `${sourceCard.prefLabel} links to ${targetLabel}, but no matching card exists.`,
    severity: "high",
    source: "derived",
    status: "open",
  };
}

function deriveLibraryCatalogThreads(
  records: readonly CatalogCardBuildRecord[],
  resolveCard: CatalogCardResolver,
): {
  missingSectionsByCardId: Map<string, LibraryCatalogRequiredSection[]>;
  threads: LibraryCatalogThread[];
} {
  const threads: LibraryCatalogThread[] = [];
  const missingSectionsByCardId = new Map<string, LibraryCatalogRequiredSection[]>();
  const missingCardKeys = new Set<string>();

  for (const record of records) {
    if (record.card.context === LIBRARY_INDEX_CONTEXT) {
      continue;
    }
    const sections = missingFillSections(record.content, record.card);
    missingSectionsByCardId.set(record.card.id, sections);
    if (sections.length > 0) {
      threads.push(derivedMissingMaterialThread(record.card, sections));
    }

    const markdownSections = extractCatalogMarkdownSections(record.content);
    for (const sectionName of STORY_SECTION_NAMES) {
      for (const wikilink of extractCatalogWikilinks(markdownSections[sectionName])) {
        if (resolveCard(wikilink.target) != null) {
          continue;
        }
        const key = `${record.card.id}\u0000${wikilink.target}`;
        if (missingCardKeys.has(key)) {
          continue;
        }
        missingCardKeys.add(key);
        threads.push(derivedMissingCardThread(record.card, wikilink.target));
      }
    }
  }

  return {
    missingSectionsByCardId,
    threads: threads.sort(compareThreads),
  };
}

function sortedThreadIds(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

// Thread ids must be unique across the catalog so the top-level counts agree
// with the per-card/area rollups (which de-dup ids through Sets). Derived
// threads are listed first at the call site, so they win an id collision with
// an authored thread that squats a derived id.
function dedupeThreadsById(threads: readonly LibraryCatalogThread[]): LibraryCatalogThread[] {
  const byId = new Map<string, LibraryCatalogThread>();
  for (const thread of threads) {
    if (!byId.has(thread.id)) {
      byId.set(thread.id, thread);
    }
  }
  return [...byId.values()];
}

function threadAreaIds(
  thread: LibraryCatalogThread,
  resolveCard: CatalogCardResolver,
  areaByKey: ReadonlyMap<string, LibraryCatalogArea>,
): string[] {
  const areaIds = new Set<string>();
  const addCardArea = (cardId: string | undefined) => {
    if (cardId == null) {
      return;
    }
    const card = resolveCard(cardId);
    if (card == null) {
      return;
    }
    const area = areaByKey.get(stableAreaId(card.plane, card.context));
    if (area != null) {
      areaIds.add(area.id);
    }
  };

  for (const concern of thread.concerns) {
    if (concern.type === "card") {
      addCardArea(concern.cardId);
      continue;
    }
    if (concern.type === "noun") {
      addCardArea(concern.sourceCardId);
      continue;
    }
    if (concern.type === "context" && concern.plane != null && concern.context != null) {
      const area = areaByKey.get(stableAreaId(concern.plane, concern.context));
      if (area != null) {
        areaIds.add(area.id);
      }
    }
  }

  return [...areaIds];
}

function threadCardIds(thread: LibraryCatalogThread, resolveCard: CatalogCardResolver): string[] {
  const cardIds = new Set<string>();
  const addCard = (ref: string | undefined) => {
    if (ref == null) {
      return;
    }
    const card = resolveCard(ref);
    if (card != null) {
      cardIds.add(card.id);
    }
  };
  for (const concern of thread.concerns) {
    if (concern.type === "card") {
      addCard(concern.cardId);
    }
    if (concern.type === "noun") {
      addCard(concern.sourceCardId);
    }
  }
  return [...cardIds];
}

function buildFillReadiness(input: {
  areas: readonly LibraryCatalogArea[];
  cards: readonly LibraryCatalogCard[];
  missingSectionsByCardId: ReadonlyMap<string, LibraryCatalogRequiredSection[]>;
  resolveCard: CatalogCardResolver;
  threads: readonly LibraryCatalogThread[];
}): LibraryCatalogFillReadiness {
  const areaByKey = new Map(
    input.areas.map((area) => [stableAreaId(area.plane, area.context), area]),
  );
  const areaById = new Map(input.areas.map((area) => [area.id, area]));
  const blockingThreadIdsByCardId = new Map<string, string[]>();
  const gapThreadIdsByCardId = new Map<string, string[]>();
  const threadIdsByAreaId = new Map<string, string[]>();

  for (const thread of input.threads) {
    for (const cardId of threadCardIds(thread, input.resolveCard)) {
      if (thread.family === "gap") {
        gapThreadIdsByCardId.set(cardId, [...(gapThreadIdsByCardId.get(cardId) ?? []), thread.id]);
      }
      // A thread blocks a card's fill when it names missing required sections —
      // a structural signal, not a magic kind word. Derived missing-material gaps
      // always carry `missingSections`; an authored sweep thread may declare them
      // too. `kind` is free-string and is never consulted here, so blocking-ness
      // never depends on the (reference-only) canonical kind vocabulary.
      if ((thread.missingSections?.length ?? 0) > 0) {
        blockingThreadIdsByCardId.set(cardId, [
          ...(blockingThreadIdsByCardId.get(cardId) ?? []),
          thread.id,
        ]);
      }
    }

    for (const areaId of threadAreaIds(thread, input.resolveCard, areaByKey)) {
      threadIdsByAreaId.set(areaId, [...(threadIdsByAreaId.get(areaId) ?? []), thread.id]);
    }
  }

  // The reserved _index keystone cards stay out of the area grid, so keep them
  // out of every readiness rollup too — counting them in the totals but never in
  // the per-area/fillable rollups would mean `ready` could never settle.
  const contentCards = input.cards.filter((card) => card.context !== LIBRARY_INDEX_CONTEXT);
  const readinessCards = contentCards
    .map((card) => {
      const missingSections = input.missingSectionsByCardId.get(card.id) ?? [];
      const gapThreadIds = sortedThreadIds(gapThreadIdsByCardId.get(card.id) ?? []);
      return {
        blockingThreadIds: sortedThreadIds(blockingThreadIdsByCardId.get(card.id) ?? []),
        cardId: card.id,
        fillable: missingSections.length === 0,
        gapThreadIds,
        missingSections: [...missingSections],
      };
    })
    .sort((left, right) => left.cardId.localeCompare(right.cardId));
  const readinessByCardId = new Map(readinessCards.map((card) => [card.cardId, card]));
  const threadById = new Map(input.threads.map((thread) => [thread.id, thread]));
  const readinessAreas = input.areas
    .map((area) => {
      const threadIds = sortedThreadIds(threadIdsByAreaId.get(area.id) ?? []);
      const threads = threadIds.flatMap((threadId) => {
        const thread = threadById.get(threadId);
        return thread == null ? [] : [thread];
      });
      return {
        areaId: area.id,
        cardCount: area.cardIds.length,
        context: area.context,
        fillableCount: area.cardIds.filter(
          (cardId) => readinessByCardId.get(cardId)?.fillable === true,
        ).length,
        gapCount: threads.filter((thread) => thread.family === "gap").length,
        hotSpotCount: threads.filter((thread) => thread.family === "hot_spot").length,
        plane: area.plane,
        threadIds,
      };
    })
    .sort((left, right) => {
      const leftArea = areaById.get(left.areaId);
      const rightArea = areaById.get(right.areaId);
      return (
        (leftArea?.plane ?? left.plane).localeCompare(rightArea?.plane ?? right.plane) ||
        (leftArea?.context ?? left.context).localeCompare(rightArea?.context ?? right.context) ||
        left.areaId.localeCompare(right.areaId)
      );
    });
  const fillableCardCount = readinessCards.filter((card) => card.fillable).length;

  return {
    areas: readinessAreas,
    cards: readinessCards,
    fillableCardCount,
    gapCount: input.threads.filter((thread) => thread.family === "gap").length,
    hotSpotCount: input.threads.filter((thread) => thread.family === "hot_spot").length,
    ready: fillableCardCount === contentCards.length,
    threadCount: input.threads.length,
    totalCardCount: contentCards.length,
  };
}

function sortWorkflowSteps(
  steps: readonly LibraryCatalogWorkflowStep[],
): LibraryCatalogWorkflowStep[] {
  return steps
    .map((step, index) => ({ index, step }))
    .sort((left, right) => left.step.order - right.step.order || left.index - right.index)
    .map(({ step }) => ({
      ...step,
      ...(step.cardRefs == null ? {} : { cardRefs: [...step.cardRefs] }),
    }));
}

function sortWorkflows(workflows: readonly LibraryCatalogWorkflow[]): LibraryCatalogWorkflow[] {
  return workflows
    .map((workflow) => ({
      ...workflow,
      steps: sortWorkflowSteps(workflow.steps),
    }))
    .sort(compareWorkflows);
}

function validateCatalogWorkflows(input: {
  resolveCard: CatalogCardResolver;
  workflows: readonly LibraryCatalogWorkflow[];
}): string[] {
  const metadataIssues: string[] = [];

  // A step's `context` is the *place where the work happens*, which is a
  // superset of the card-bearing library areas: the work legitimately moves
  // through contexts that hold no cards yet — surfacing those is the whole
  // point of capturing the work. So contexts are self-defining and are NOT
  // validated against existing areas (the lens renders one column per step
  // context regardless, and an uncovered context is a coverage signal, not
  // malformed data). Only `cardRefs`, which name specific catalog cards, are
  // validated here as genuine references.
  for (const workflow of input.workflows) {
    // id/order are guaranteed present on a built workflow; the index fallbacks
    // never fire here, but routing through the shared locators keeps coverage
    // messages byte-identical to parse messages.
    const at = workflowLocator(workflow.id, 0);
    for (const step of workflow.steps) {
      const stepAt = stepLocator(step.order, 0);
      for (const cardRef of step.cardRefs ?? []) {
        if (input.resolveCard(cardRef) == null) {
          metadataIssues.push(
            `Invalid ${LIBRARY_CATALOG_WORKFLOWS_FILE}: workflow ${at} step ${stepAt} references unknown card "${cardRef}"`,
          );
        }
      }
    }
  }

  return metadataIssues;
}

function slugifyWorkflowId(cardId: string): string {
  const slug = cardId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : cardId.trim().toLowerCase();
}

function projectCardFlowWorkflows(
  records: readonly CatalogCardBuildRecord[],
  metadataIssues: string[],
): LibraryCatalogWorkflow[] {
  const workflows: LibraryCatalogWorkflow[] = [];
  const seenWorkflowIds = new Set<string>();

  for (const record of records) {
    const flow = record.workflowFlow;
    if (flow == null) {
      continue;
    }

    if (record.card.altitude?.toLowerCase() !== "aggregate") {
      reportCardIssue(
        metadataIssues,
        flow.relativePath,
        "workflow flow is valid only on altitude aggregate cards",
      );
      continue;
    }

    const steps: LibraryCatalogWorkflowStep[] = [];
    flow.steps.forEach((step, index) => {
      if (step.invalid) {
        return;
      }
      if (step.activity == null || step.activity.trim().length === 0) {
        reportCardIssue(metadataIssues, flow.relativePath, `flow[${index}] missing activity`);
        return;
      }

      steps.push({
        activity: step.activity,
        ...(step.refs == null ? {} : { cardRefs: [...step.refs] }),
        // A step may name the surface (context) it happens on; the owning
        // card's context is only the fallback. Restores the per-step lanes
        // the retired workflows.json sidecar carried (#690).
        context: step.context ?? record.card.context,
        ...(step.doer == null ? {} : { doer: step.doer }),
        ...(step.evidence == null ? {} : { evidence: step.evidence }),
        ...(step.gate == null ? {} : { gate: step.gate }),
        order: index,
        ...(step.stateAfter == null ? {} : { stateAfter: step.stateAfter }),
      });
    });

    if (steps.length === 0) {
      reportCardIssue(metadataIssues, flow.relativePath, "flow produced no valid workflow steps");
      continue;
    }

    const workflowId = slugifyWorkflowId(record.card.id);
    if (seenWorkflowIds.has(workflowId)) {
      reportCardIssue(
        metadataIssues,
        flow.relativePath,
        `derived workflow id "${workflowId}" duplicates another card flow`,
      );
      continue;
    }
    seenWorkflowIds.add(workflowId);

    workflows.push({
      id: workflowId,
      plane: record.card.plane,
      steps,
      unit: record.card.prefLabel,
    });
  }

  return workflows;
}

function appendDuplicateProductCardStemIssues(
  records: readonly CatalogCardBuildRecord[],
  metadataIssues: string[],
): void {
  const recordsByStem = new Map<
    string,
    { paths: Set<string>; records: CatalogCardBuildRecord[]; stem: string }
  >();

  for (const record of records) {
    const pathIdentity = record.pathIdentity;
    if (pathIdentity == null || !pathIdentity.isIdentitySource) {
      continue;
    }
    const key = normalizeResolverKey(pathIdentity.stem);
    if (key.length === 0) {
      continue;
    }
    const group = recordsByStem.get(key) ?? {
      paths: new Set<string>(),
      records: [],
      stem: pathIdentity.stem,
    };
    group.paths.add(pathIdentity.relativePath);
    group.records.push(record);
    recordsByStem.set(key, group);
  }

  for (const group of recordsByStem.values()) {
    if (group.paths.size < 2) {
      continue;
    }
    const paths = [...group.paths].sort((left, right) => left.localeCompare(right));
    for (const record of group.records) {
      const relativePath = record.pathIdentity?.relativePath;
      if (relativePath == null) {
        continue;
      }
      metadataIssues.push(
        `${DUPLICATE_LIBRARY_CARD_STEM_ISSUE_PREFIX} "${group.stem}" in ${relativePath}: stem is shared by ${paths.join(", ")}`,
      );
    }
  }
}

export function buildLibraryCatalog(input: {
  authoredThreads?: LibraryCatalogThread[];
  catalogSchema?: LibraryCatalogSchemaMode;
  explicitAreas?: LibraryCatalogExplicitArea[];
  files: LibraryMarkdownFile[];
  gaps?: LibraryCatalogGap[];
  gate?: LibraryConfirmationStatus;
  libraryRoot: string;
  manifestMeta?: LibraryCatalogManifestMeta;
  metadataIssues?: string[];
  typeMapping?: LibraryCatalogTypeMappingEntry[];
  workflowMetadataIssues?: string[];
  workflows?: LibraryCatalogWorkflow[];
}): LibraryCatalog {
  const records: CatalogCardBuildRecord[] = [];
  const metadataIssues = [...(input.metadataIssues ?? [])];
  const catalogSchema = input.catalogSchema ?? "legacy";
  const cardFlowDeclared =
    catalogSchema === PRODUCT_CARD_SCHEMA_VERSION &&
    input.files.some((file) => hasProductCardFlowDeclaration(file, input.libraryRoot));

  for (const file of input.files) {
    const record = createCatalogCardRecord(file, input.libraryRoot, catalogSchema);
    if (Array.isArray(record)) {
      metadataIssues.push(...record);
      continue;
    }
    metadataIssues.push(...record.metadataIssues);
    records.push(record);
  }

  if (catalogSchema === PRODUCT_CARD_SCHEMA_VERSION) {
    appendDuplicateProductCardStemIssues(records, metadataIssues);
  }

  records.sort((left, right) => compareCards(left.card, right.card));
  const cards = records.map((record) => record.card);
  if (catalogSchema === PRODUCT_CARD_SCHEMA_VERSION) {
    applyCatalogStoryResolution(cards, input.typeMapping ?? []);
  }
  const edgesByKey = new Map<string, LibraryCatalogEdge>();

  for (const record of records) {
    for (const candidate of extractTypedOutboundEdges(record.content)) {
      const key = `${record.card.id}\u0000${candidate.type}\u0000${candidate.to}`;
      if (edgesByKey.has(key)) {
        continue;
      }

      const edge: LibraryCatalogEdge = {
        from: record.card.id,
        id: `edge:${record.card.id}:${candidate.type}:${candidate.to}`,
        to: candidate.to,
        type: candidate.type,
      };
      edgesByKey.set(key, edge);
      record.card.edgeIds.push(edge.id);
    }
  }

  for (const card of cards) {
    card.edgeIds.sort((left, right) => left.localeCompare(right));
  }

  const edges = [...edgesByKey.values()].sort(compareEdges);
  const gaps = [...(input.gaps ?? [])].sort(compareGaps);
  const areaMap = new Map<string, LibraryCatalogArea>();

  function ensureArea(areaInput: {
    context: string;
    id?: string;
    label?: string;
    plane: string;
  }): LibraryCatalogArea {
    const key = stableAreaId(areaInput.plane, areaInput.context);
    const id = areaInput.id ?? key;
    const existing = areaMap.get(key);
    if (existing != null) {
      if (areaInput.label != null) {
        existing.label = areaInput.label;
      }
      if (areaInput.id != null) {
        existing.id = areaInput.id;
      }
      return existing;
    }

    const area: LibraryCatalogArea = {
      cardIds: [],
      context: areaInput.context,
      gapIds: [],
      id,
      label: areaInput.label ?? humanizeContextLabel(areaInput.context),
      plane: areaInput.plane,
      status: "empty",
    };
    areaMap.set(key, area);
    return area;
  }

  for (const explicitArea of input.explicitAreas ?? []) {
    ensureArea(explicitArea);
  }

  for (const card of cards) {
    if (card.context === LIBRARY_INDEX_CONTEXT) {
      continue;
    }
    ensureArea({ context: card.context, plane: card.plane }).cardIds.push(card.id);
  }

  for (const gap of gaps) {
    ensureArea({ context: gap.context, plane: gap.plane }).gapIds.push(gap.id);
  }

  const areas = [...areaMap.values()].map((area) => {
    const cardCount = area.cardIds.length;
    const gapCount = area.gapIds.length;
    const status: LibraryCatalogArea["status"] =
      cardCount > 0 && gapCount > 0
        ? "partial"
        : cardCount > 0
          ? "filled"
          : gapCount > 0
            ? "gap"
            : "empty";

    return {
      ...area,
      cardIds: [...area.cardIds].sort((left, right) => left.localeCompare(right)),
      gapIds: [...area.gapIds].sort((left, right) => left.localeCompare(right)),
      status,
    };
  });
  areas.sort(compareAreas);

  const cardFlowWorkflows =
    catalogSchema === PRODUCT_CARD_SCHEMA_VERSION && cardFlowDeclared
      ? projectCardFlowWorkflows(records, metadataIssues)
      : [];
  if (catalogSchema === PRODUCT_CARD_SCHEMA_VERSION && !cardFlowDeclared) {
    metadataIssues.push(...(input.workflowMetadataIssues ?? []));
  }
  const workflows =
    catalogSchema === PRODUCT_CARD_SCHEMA_VERSION
      ? sortWorkflows(cardFlowDeclared ? cardFlowWorkflows : (input.workflows ?? []))
      : [];

  const authoredThreads = input.authoredThreads ?? [];
  const readinessProjection =
    catalogSchema === PRODUCT_CARD_SCHEMA_VERSION || authoredThreads.length > 0
      ? (() => {
          const resolveCard = createCatalogCardResolver(cards);
          const derived =
            catalogSchema === PRODUCT_CARD_SCHEMA_VERSION
              ? deriveLibraryCatalogThreads(records, resolveCard)
              : {
                  missingSectionsByCardId: new Map<string, LibraryCatalogRequiredSection[]>(),
                  threads: [],
                };
          // A context concern's plane is optional in the file; backfill it from
          // the referenced context's area when it resolves to a single plane, so
          // the concern links to its area and renders with a plane label.
          const planesByContext = new Map<string, Set<string>>();
          for (const area of areas) {
            const planes = planesByContext.get(area.context) ?? new Set<string>();
            planes.add(area.plane);
            planesByContext.set(area.context, planes);
          }
          for (const thread of authoredThreads) {
            for (const concern of thread.concerns) {
              if (concern.type === "context" && concern.plane == null && concern.context != null) {
                const planes = planesByContext.get(concern.context);
                const onlyPlane = planes != null && planes.size === 1 ? [...planes][0] : undefined;
                if (onlyPlane != null) {
                  concern.plane = onlyPlane;
                }
              }
              const cardRef = concern.cardId ?? concern.sourceCardId;
              if (cardRef != null && resolveCard(cardRef) == null) {
                metadataIssues.push(
                  `Invalid library thread event: thread "${thread.id}" references unknown card "${cardRef}"`,
                );
              }
            }
          }
          metadataIssues.push(
            ...(catalogSchema === PRODUCT_CARD_SCHEMA_VERSION
              ? validateCatalogWorkflows({
                  resolveCard,
                  workflows,
                })
              : []),
          );
          const threads = dedupeThreadsById([...derived.threads, ...authoredThreads]).sort(
            compareThreads,
          );
          return {
            fillReadiness: buildFillReadiness({
              areas,
              cards,
              missingSectionsByCardId: derived.missingSectionsByCardId,
              resolveCard,
              threads,
            }),
            threads,
          };
        })()
      : null;

  return {
    areas,
    cards,
    edges,
    ...(readinessProjection == null
      ? {}
      : {
          fillReadiness: readinessProjection.fillReadiness,
          threads: readinessProjection.threads,
        }),
    gaps,
    ...(input.gate == null ? {} : { gate: input.gate }),
    typeMapping: input.typeMapping ?? [],
    ...(workflows.length === 0 ? {} : { workflows }),
    meta: {
      areaCount: areas.length,
      cardCount: cards.length,
      ...(input.manifestMeta?.draftOf == null ? {} : { draftOf: input.manifestMeta.draftOf }),
      edgeCount: edges.length,
      gapCount: gaps.length,
      metadataIssues,
      planes: (catalogSchema === PRODUCT_CARD_SCHEMA_VERSION
        ? orderProductCardPlanes
        : sortedUnique)([
        ...areas.map((area) => area.plane),
        ...cards.map((card) => card.plane),
        ...gaps.map((gap) => gap.plane),
      ]),
      ...(input.manifestMeta?.playRunId == null ? {} : { playRunId: input.manifestMeta.playRunId }),
    },
  };
}

export function emptyLibraryCatalog(): LibraryCatalog {
  return buildLibraryCatalog({
    files: [],
    libraryRoot: "",
  });
}
