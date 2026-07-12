import { useEffect, useMemo, useState } from "react";
import * as Effect from "effect/Effect";
import {
  buildCardResolverIndex,
  normalizeResolverKey,
  normalizeWikilinkTarget,
  resolveCardFromIndex,
} from "@alexandria/library-card-resolver";
import type { ViewerRuntimeClient } from "../../app/runtime/client";
import { DraftOverlaySummary, DraftTrail, testIdPart } from "./DraftOverlayViews";
import type {
  LibraryCatalog,
  LibraryCatalogArea,
  LibraryCatalogCard,
  LibraryCatalogEdge,
  LibraryCatalogFillReadinessArea,
  LibraryCatalogGap,
  LibraryCatalogTypeMappingEntry,
  LibraryCatalogWorkflow,
  LibraryCatalogWorkflowStep,
  LibraryConfirmationEdit,
  LibraryConfirmationEditKind,
} from "./types";
import { engineTypeDescriptor } from "./engine-view-model";
import { formatPlaneLabel } from "./plane";
import {
  deriveStepActivations,
  humanizeLinkKey,
  type LibraryPeekModel,
  peekHasContent,
  pickContextLead,
  storyBucketsForCard,
  storyTextForOrdering,
} from "./library-peek-view-model";
import { NotepadView } from "./NotepadView";
import { hotSpotLabel, threadStatusLabel } from "./notepad-view-model";
import { usePlaneStats } from "./PlaneSidebar";
import { TypeLegend } from "./TypeLegend";
import { typeTooltip } from "./TypeSwatch";
import { useLibraryPeek } from "./useLibraryPeek";

interface EmptyLibraryViewProps {
  catalog: LibraryCatalog;
  emptyStatePath?: string;
  // Test-only override for which workbench tab renders first (default
  // behavior when omitted: "index" when fillReadiness is present, else
  // "catalog" — unchanged). Lets a static render target a specific tab (e.g.
  // "readiness") without needing a DOM interaction harness, mirroring how the
  // PMS NotepadView takes an `initialLens` prop for the same reason.
  initialTab?: CatalogTab;
  // Test-only override for which catalog card/gap starts expanded (default:
  // none). Same rationale as `initialTab` — lets a static render reach
  // CardDetail's expanded content (e.g. the risks list) without a DOM
  // interaction harness.
  initialSelectedItem?: SelectedCatalogItem;
  onCatalogRefresh?: () => Promise<void>;
  runtimeClient?: ViewerRuntimeClient;
}

type CatalogTab = "catalog" | "coverage" | "gaps" | "index" | "issues" | "readiness" | "workflow";
// Exported for the standalone CatalogView (issue #611 promotion).
export type SelectedCatalogItem = { id: string; kind: "card" } | { id: string; kind: "gap" } | null;
// Exported for the standalone IndexView (issue #611 promotion).
export type LibraryIndexSection = {
  areas: LibraryCatalogArea[];
  lead: LibraryCatalogCard | null;
  plane: string;
};

const LEGACY_CATALOG_TABS: Array<{ id: CatalogTab; label: string }> = [
  { id: "catalog", label: "Catalog" },
  { id: "coverage", label: "Coverage" },
  { id: "gaps", label: "Gaps" },
  { id: "issues", label: "Issues" },
];

const SCHEMA_INDEX_PLANES = ["strategy", "product", "learning"] as const;
// Reserved context holding a plane's thesis card (the keystone one altitude up).
// It seeds the plane lead story and is hidden from the context grid.
const LIBRARY_INDEX_CONTEXT = "_index";
const WORKFLOW_LEFT_GUTTER = 230;
const WORKFLOW_COLUMN_WIDTH = 150;
const WORKFLOW_HEADER_HEIGHT = 66;
const WORKFLOW_ROW_HEIGHT = 128;

const REJECTION_EDIT_KINDS: Array<{ id: LibraryConfirmationEditKind; label: string }> = [
  { id: "context_boundary", label: "Context boundary" },
  { id: "noun_placement", label: "Noun placement" },
  { id: "plane_assignment", label: "Plane assignment" },
  { id: "relationship_topology", label: "Relationship topology" },
];

const READING_PANEL_STRONG_CLASS =
  "border border-[color:var(--viewer-canvas-panel-bd)] bg-[color:var(--viewer-canvas-slate-2)]";
const READING_PANEL_MUTED_CLASS =
  "border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate-3)]";
const READING_LABEL_CLASS =
  "font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--viewer-canvas-fg-dim)]";
const READING_LABEL_AMBER_CLASS =
  "font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--viewer-canvas-amber)]";
const READING_ID_TEXT_CLASS = "font-mono text-[11px] text-[color:var(--viewer-canvas-fg-dim)]";
const DARK_BUTTON_BASE =
  "border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] text-[color:var(--viewer-canvas-fg-dim)] hover:border-[color:var(--viewer-canvas-amber-dim)] hover:text-[color:var(--viewer-canvas-fg)]";
const DARK_BUTTON_ACTIVE =
  "border-[color:var(--viewer-canvas-amber)] bg-[color:var(--viewer-canvas-slate-2)] text-[color:var(--viewer-canvas-amber-glow)]";
const NEUTRAL_CHIP_CLASS =
  "border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] text-[color:var(--viewer-canvas-fg-dim)]";
const SUCCESS_CHIP_CLASS =
  "border-[color:var(--viewer-canvas-success)] bg-[color:var(--viewer-engine-confidence-high-bg)] text-[color:var(--viewer-engine-confidence-high-text)]";
const AMBER_CHIP_CLASS =
  "border-[color:var(--viewer-canvas-amber)] bg-[color:var(--viewer-engine-confidence-medium-bg)] text-[color:var(--viewer-engine-confidence-medium-text)]";
const DANGER_CHIP_CLASS =
  "border-[color:var(--viewer-canvas-danger)] bg-[color:var(--viewer-engine-confidence-low-bg)] text-[color:var(--viewer-engine-confidence-low-text)]";
const VITALS_CHIP_CLASS =
  "shrink-0 border border-[color:var(--viewer-engine-type-principle-border)] bg-[color:var(--viewer-engine-type-principle-bg)] px-2 py-0.5 font-sans text-[10px] uppercase text-[color:var(--viewer-engine-type-principle-accent)]";
const EXTERNAL_NOUN_STYLE =
  "border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] text-[color:var(--viewer-canvas-fg-dimmer)]";

function statusClass(status: LibraryCatalogArea["status"]): string {
  switch (status) {
    case "filled":
      return SUCCESS_CHIP_CLASS;
    case "partial":
      return AMBER_CHIP_CLASS;
    case "gap":
      return DANGER_CHIP_CLASS;
    case "empty":
      return NEUTRAL_CHIP_CLASS;
  }
}

function darkConfidenceClass(confidence: "high" | "low" | "medium"): string {
  switch (confidence) {
    case "high":
      return SUCCESS_CHIP_CLASS;
    case "medium":
      return AMBER_CHIP_CLASS;
    case "low":
      return DANGER_CHIP_CLASS;
  }
}

function darkThreadStatusClass(status: string): string {
  switch (status.trim().toLowerCase()) {
    case "open":
      return DANGER_CHIP_CLASS;
    case "answered":
      return SUCCESS_CHIP_CLASS;
    case "residual":
      return AMBER_CHIP_CLASS;
    default:
      return NEUTRAL_CHIP_CLASS;
  }
}

function darkTypeStyle(
  type: string | undefined,
  typeMapping: readonly LibraryCatalogTypeMappingEntry[],
): { backgroundColor: string; borderColor: string; color: string } {
  const descriptor = engineTypeDescriptor(type ?? "", typeMapping);
  return {
    backgroundColor: descriptor.background,
    borderColor: descriptor.border,
    color: descriptor.accent,
  };
}

// The card row's leading glyph. Types with ruled palette identity get their
// matching ENGINE_TYPE_ICON_SET glyph; every other type keeps the shared "C"
// generic-card fallback.
function cardTypeIcon(type: string): string {
  switch (type) {
    case "Bet":
    case "Principle":
    case "Experiment":
    case "Measure":
    case "Arc":
      return engineTypeDescriptor(type).icon;
    default:
      return "C";
  }
}

function provenanceText(item: LibraryCatalogCard | LibraryCatalogGap): string {
  const sourceCount = item.provenance.sourceRefs.length;
  return `${item.provenance.label} / ${sourceCount} source${sourceCount === 1 ? "" : "s"}`;
}

function itemCountLabel(cardCount: number, gapCount: number): string {
  return `${cardCount} card${cardCount === 1 ? "" : "s"} / ${gapCount} gap${
    gapCount === 1 ? "" : "s"
  }`;
}

function simpleCardCountLabel(cardCount: number): string {
  return `${cardCount} card${cardCount === 1 ? "" : "s"}`;
}

function simpleFillableCountLabel(fillableCount: number): string {
  return `${fillableCount} fillable`;
}

function indexPlaneKey(plane: string): string {
  return plane.trim().toLowerCase();
}

// Exported for the standalone IndexView (issue #611 promotion): the Index
// mode reuses this projection unchanged rather than recomputing it.
export function buildLibraryIndexSections(
  areas: readonly LibraryCatalogArea[],
  cardsById: Map<string, LibraryCatalogCard>,
): LibraryIndexSection[] {
  const areasByPlane = new Map<string, LibraryCatalogArea[]>();
  for (const area of areas) {
    const planeKey = indexPlaneKey(area.plane);
    const planeAreas = areasByPlane.get(planeKey) ?? [];
    planeAreas.push(area);
    areasByPlane.set(planeKey, planeAreas);
  }

  // The keystone thesis cards are kept out of the catalog's areas (so they never
  // show as a context tile, in coverage, or in readiness), so pull each plane's
  // lead straight from the cards. Sort by id so the choice is stable if a plane
  // ever holds more than one.
  const leadByPlane = new Map<string, LibraryCatalogCard>();
  for (const card of [...cardsById.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  )) {
    if (card.context !== LIBRARY_INDEX_CONTEXT) {
      continue;
    }
    const planeKey = indexPlaneKey(card.plane);
    if (!leadByPlane.has(planeKey)) {
      leadByPlane.set(planeKey, card);
    }
  }

  const sectionPlanes = new Set<string>(SCHEMA_INDEX_PLANES);
  for (const plane of areasByPlane.keys()) {
    sectionPlanes.add(plane);
  }
  for (const plane of leadByPlane.keys()) {
    sectionPlanes.add(plane);
  }

  return Array.from(sectionPlanes)
    .sort((left, right) => {
      const leftRank = SCHEMA_INDEX_PLANES.indexOf(left as (typeof SCHEMA_INDEX_PLANES)[number]);
      const rightRank = SCHEMA_INDEX_PLANES.indexOf(right as (typeof SCHEMA_INDEX_PLANES)[number]);
      if (leftRank >= 0 || rightRank >= 0) {
        return (
          (leftRank < 0 ? Number.POSITIVE_INFINITY : leftRank) -
          (rightRank < 0 ? Number.POSITIVE_INFINITY : rightRank)
        );
      }
      return left.localeCompare(right);
    })
    .map((plane) => ({
      // Defensive: an `_index` area should never reach the grid, but keep it out
      // even if a catalog still emits one.
      areas: (areasByPlane.get(plane) ?? [])
        .filter((area) => area.context !== LIBRARY_INDEX_CONTEXT)
        .sort((left, right) => left.label.localeCompare(right.label)),
      lead: leadByPlane.get(plane) ?? null,
      plane,
    }));
}

// Exported for the standalone Index/Catalog/Workflow views (issue #611
// promotion).
export function byId<T extends { id: string }>(items: readonly T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

function sourceList(sourceRefs: readonly string[]) {
  if (sourceRefs.length === 0) {
    return (
      <span className="text-[color:var(--viewer-canvas-fg-dimmer)]">
        No source references projected.
      </span>
    );
  }

  return (
    <ul className="mt-1 space-y-1">
      {sourceRefs.map((sourceRef) => (
        <li className={`${READING_ID_TEXT_CLASS} break-words`} key={sourceRef}>
          {sourceRef}
        </li>
      ))}
    </ul>
  );
}

// This card-detail renderer intentionally shows raw frontmatter `card.links` as
// static wikilink labels. It has no resolved targets or navigation; see
// EngineCardDrawer for the navigable edge-projected counterpart.
function TypedLinks({ cardId, links }: { cardId: string; links: LibraryCatalogCard["links"] }) {
  const entries: Array<{ key: string; values: string[] }> = [];
  for (const [key, values] of Object.entries(links ?? {})) {
    if (Array.isArray(values) && values.length > 0) {
      entries.push({ key, values });
    }
  }

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="mt-3" data-testid={`catalog-card-typed-links-${testIdPart(cardId)}`}>
      <div className={READING_LABEL_AMBER_CLASS}>Typed links</div>
      <dl className="mt-1 grid gap-1 font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
        {entries.map((entry) => (
          <div className="grid grid-cols-[94px_1fr] gap-x-3" key={entry.key}>
            <dt className="text-[color:var(--viewer-canvas-amber-dim)]">
              {humanizeLinkKey(entry.key)}
            </dt>
            <dd className="break-words font-mono">
              {entry.values.map((value) => wikilinkLabel(value)).join(", ")}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function WorkbenchTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick(): void;
}) {
  return (
    <button
      aria-pressed={active}
      className={[
        "h-8 px-3 font-sans text-[12px] font-medium transition-colors",
        active ? DARK_BUTTON_ACTIVE : DARK_BUTTON_BASE,
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

// Exported for the standalone CatalogView/WorkflowView (issue #611
// promotion): both reuse the plane-sidebar chrome unchanged.
export function PlaneButton({
  active,
  areaCount,
  cardCount,
  gapCount,
  onClick,
  plane,
}: {
  active: boolean;
  areaCount: number;
  cardCount: number;
  gapCount: number;
  onClick(): void;
  plane: string;
}) {
  return (
    <button
      aria-pressed={active}
      className={[
        "w-full px-3 py-2 text-left font-sans text-[12px] transition-colors",
        active
          ? "border border-[color:var(--viewer-canvas-amber)] bg-[color:var(--viewer-canvas-slate-2)] text-[color:var(--viewer-canvas-amber-glow)] shadow-[0_8px_18px_rgba(0,0,0,0.2)]"
          : "border border-transparent text-[color:var(--viewer-canvas-fg-dim)] hover:border-[color:var(--viewer-canvas-rule)] hover:bg-[color:var(--viewer-canvas-slate)] hover:text-[color:var(--viewer-canvas-fg)]",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="min-w-0 break-words font-semibold">{formatPlaneLabel(plane)}</span>
        <span className="shrink-0 text-[color:var(--viewer-canvas-fg-dimmer)]">{areaCount}</span>
      </span>
      <span className="mt-1 block text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
        {itemCountLabel(cardCount, gapCount)}
      </span>
    </button>
  );
}

function CardDetail({
  card,
  edgesById,
  onSelectPiece,
  pieceByLabel,
  typeMapping,
}: {
  card: LibraryCatalogCard;
  edgesById: Map<string, LibraryCatalogEdge>;
  onSelectPiece(id: string): void;
  pieceByLabel: Map<string, LibraryCatalogCard>;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  const edges = card.edgeIds.flatMap((edgeId) => {
    const edge = edgesById.get(edgeId);
    return edge == null ? [] : [edge];
  });

  return (
    <div
      className={[
        "mx-3 mb-2 px-4 py-3 text-[13px] text-[color:var(--viewer-canvas-fg)]",
        READING_PANEL_MUTED_CLASS,
      ].join(" ")}
    >
      <ProductCardStory
        card={card}
        onSelectPiece={onSelectPiece}
        pieceByLabel={pieceByLabel}
        typeMapping={typeMapping}
      />
      <div className="mt-4 grid gap-3 border-t border-[color:var(--viewer-canvas-rule)] pt-3 md:grid-cols-[1fr_1fr]">
        <div>
          <div className={READING_LABEL_AMBER_CLASS}>Provenance</div>
          <div className="mt-1 break-words font-mono text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
            {provenanceText(card)}
          </div>
          {sourceList(card.provenance.sourceRefs)}
        </div>
        <div>
          <div className={READING_LABEL_AMBER_CLASS}>Catalog fields</div>
          <dl className="mt-1 grid grid-cols-[88px_1fr] gap-x-3 gap-y-1 font-mono text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
            <dt className="text-[color:var(--viewer-canvas-amber-dim)]">type</dt>
            <dd className="break-words">{card.type}</dd>
            <dt className="text-[color:var(--viewer-canvas-amber-dim)]">status</dt>
            <dd className="break-words">{card.status}</dd>
            <dt className="text-[color:var(--viewer-canvas-amber-dim)]">path</dt>
            <dd className="break-words">{card.path ?? "not projected"}</dd>
            <dt className="text-[color:var(--viewer-canvas-amber-dim)]">edges</dt>
            <dd>{card.edgeIds.length}</dd>
          </dl>
        </div>
      </div>
      {edges.length > 0 ? (
        <div className="mt-3">
          <div className={READING_LABEL_AMBER_CLASS}>Typed edges</div>
          <ul className="mt-1 space-y-1" data-testid={`catalog-card-edges-${testIdPart(card.id)}`}>
            {edges.map((edge) => (
              <li
                className="break-words font-mono text-[11px] text-[color:var(--viewer-canvas-fg-dim)]"
                key={edge.id}
              >
                {edge.type} → {edge.to}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {card.risks != null && card.risks.length > 0 ? (
        <div className="mt-3" data-testid={`catalog-card-risks-${testIdPart(card.id)}`}>
          <div className={READING_LABEL_AMBER_CLASS}>Risks</div>
          <ul className="mt-1 space-y-1">
            {card.risks.map((risk, index) => (
              <li
                className="break-words text-[12px] text-[color:var(--viewer-canvas-fg-dim)]"
                key={`${risk.tag}-${index}`}
              >
                <span className="font-sans font-semibold text-[color:var(--viewer-canvas-amber)]">
                  ({risk.tag})
                </span>{" "}
                {risk.note}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <TypedLinks cardId={card.id} links={card.links} />
      <DraftTrail card={card} />
    </div>
  );
}

function GapDetail({ gap }: { gap: LibraryCatalogGap }) {
  return (
    <div className="raven-etched-note raven-etched-note-danger mx-3 mb-2 px-4 py-3 text-[13px]">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
        <div>
          <div className={READING_LABEL_AMBER_CLASS}>Gap reason</div>
          <p className="mt-1 break-words text-[color:var(--viewer-canvas-fg)]">{gap.reason}</p>
        </div>
        <div>
          <div className={READING_LABEL_AMBER_CLASS}>Provenance</div>
          <div className="mt-1 break-words font-mono text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
            {provenanceText(gap)}
          </div>
          {sourceList(gap.provenance.sourceRefs)}
        </div>
      </div>
    </div>
  );
}

function CardRow({
  card,
  edgesById,
  isSelected,
  onSelect,
  onSelectPiece,
  pieceByLabel,
  typeMapping,
}: {
  card: LibraryCatalogCard;
  edgesById: Map<string, LibraryCatalogEdge>;
  isSelected: boolean;
  onSelect(): void;
  onSelectPiece(id: string): void;
  pieceByLabel: Map<string, LibraryCatalogCard>;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  return (
    <>
      <button
        aria-expanded={isSelected}
        className="flex w-full items-center gap-2 border-l-2 border-[color:var(--viewer-canvas-success)] px-3 py-2 text-left font-sans text-[12px] text-[color:var(--viewer-canvas-fg)] hover:bg-[color:var(--viewer-canvas-slate-3)]"
        data-testid={`catalog-card-${testIdPart(card.id)}`}
        onClick={onSelect}
        type="button"
      >
        <span className="w-4 shrink-0 text-center text-[color:var(--viewer-canvas-success)]">
          {cardTypeIcon(card.type)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block break-words font-semibold">{card.prefLabel}</span>
          {card.synopsis != null && card.synopsis.length > 0 ? (
            <span className="mt-1 block break-words text-[12px] not-italic leading-snug text-[color:var(--viewer-canvas-fg-dim)]">
              {card.synopsis}
            </span>
          ) : null}
          {card.altLabels != null && card.altLabels.length > 0 ? (
            <span className="mt-1 block break-words text-[11px] text-[color:var(--viewer-canvas-amber)]">
              also called: {card.altLabels.join(", ")}
            </span>
          ) : null}
          {card.transfer === "pending" ? (
            <span
              className={`mt-1 inline-block px-2 py-0.5 text-[11px] ${AMBER_CHIP_CLASS}`}
              data-testid={`catalog-card-transfer-${testIdPart(card.id)}`}
            >
              Transfer pending → Company Library
            </span>
          ) : null}
        </span>
        <span
          className={[
            "shrink-0 border px-2 py-0.5 font-sans text-[10px] uppercase",
            darkConfidenceClass(card.confidence),
          ].join(" ")}
        >
          {card.confidence}
        </span>
        {(
          [
            ["cost", card.cost],
            ["kind", card.kind],
            ["strength", card.strength],
          ] as const
        ).map(([label, value]) =>
          value == null ? null : (
            <span
              className={VITALS_CHIP_CLASS}
              data-testid={`catalog-card-${label}-${testIdPart(card.id)}`}
              key={label}
            >
              {label}: {value}
            </span>
          ),
        )}
      </button>
      {isSelected ? (
        <CardDetail
          card={card}
          edgesById={edgesById}
          onSelectPiece={onSelectPiece}
          pieceByLabel={pieceByLabel}
          typeMapping={typeMapping}
        />
      ) : null}
    </>
  );
}

function GapRow({
  gap,
  isSelected,
  onSelect,
}: {
  gap: LibraryCatalogGap;
  isSelected: boolean;
  onSelect(): void;
}) {
  return (
    <>
      <button
        aria-expanded={isSelected}
        className="flex w-full items-center gap-2 border-l-2 border-dashed border-[color:var(--viewer-canvas-danger)] bg-[color:var(--viewer-canvas-slate)] px-3 py-2 text-left font-sans text-[12px] text-[color:var(--viewer-canvas-fg)] hover:bg-[color:var(--viewer-canvas-slate-3)]"
        data-testid={`catalog-gap-${testIdPart(gap.id)}`}
        onClick={onSelect}
        type="button"
      >
        <span className="w-4 shrink-0 text-center text-[color:var(--viewer-engine-confidence-low-text)]">
          G
        </span>
        <span className="min-w-0 flex-1">
          <span className="block break-words font-semibold">{gap.label}</span>
          <span className="mt-0.5 block break-words text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
            explicit gap / {provenanceText(gap)}
          </span>
        </span>
        <span
          className={[
            "shrink-0 border px-2 py-0.5 font-sans text-[10px] uppercase",
            darkConfidenceClass(gap.confidence),
          ].join(" ")}
        >
          {gap.confidence}
        </span>
      </button>
      {isSelected ? <GapDetail gap={gap} /> : null}
    </>
  );
}

function EmptyAreaGap({ area }: { area: LibraryCatalogArea }) {
  return (
    <div
      className="raven-etched-note raven-etched-note-danger mx-3 mb-2 px-3 py-2 font-sans text-[12px]"
      data-testid={`catalog-area-empty-${testIdPart(area.id)}`}
    >
      <span className="font-semibold">Explicit empty area</span>
      <span className="ml-2 text-[color:var(--viewer-canvas-fg-dim)]">
        No filled cards or gap records projected yet.
      </span>
    </div>
  );
}

function wikilinkLabel(rawTarget: string): string {
  const parts = rawTarget.split("|");
  const label = parts.length > 1 ? parts.at(-1) : parts[0];
  return (label ?? rawTarget).split("#")[0]?.trim() ?? rawTarget.trim();
}

// The author's `[[Target|alias]]` display text, or null for a bare `[[Target]]`.
// Atomic-writing ruling (2026-07-08): the key noun lives in the sentence — an
// authored alias is what the reader must see, while a bare link keeps showing
// the resolved card's prefLabel (never the raw "Type - Name" stem).
function wikilinkAlias(rawTarget: string): string | null {
  const parts = rawTarget.split("|");
  if (parts.length < 2) {
    return null;
  }
  const alias = parts.at(-1)?.split("#")[0]?.trim() ?? "";
  return alias.length > 0 ? alias : null;
}

// The Viewer builds the resolver index (a Map) and threads it through its
// components, resolving against it per label; `resolvePiece` is the shared
// resolve function under the name the existing call sites already use.
const resolvePiece = resolveCardFromIndex;

type StorySegment =
  | { kind: "text"; text: string }
  | { alias: string | null; kind: "link"; label: string; target: string };

function parseStory(story: string): StorySegment[] {
  const segments: StorySegment[] = [];
  const pattern = /\[\[([^\]]+)\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(story);
  while (match != null) {
    if (match.index > lastIndex) {
      segments.push({ kind: "text", text: story.slice(lastIndex, match.index) });
    }
    segments.push({
      alias: wikilinkAlias(match[1] ?? ""),
      kind: "link",
      label: wikilinkLabel(match[1] ?? ""),
      target: normalizeWikilinkTarget(match[1] ?? ""),
    });
    lastIndex = match.index + match[0].length;
    match = pattern.exec(story);
  }
  if (lastIndex < story.length) {
    segments.push({ kind: "text", text: story.slice(lastIndex) });
  }
  return segments;
}

// Pieces in the order they first appear in the lead's story; unmentioned last.
function orderPiecesByStory(
  story: string | undefined,
  pieces: readonly LibraryCatalogCard[],
): LibraryCatalogCard[] {
  if (story == null || story.length === 0) {
    return [...pieces];
  }
  const byLabel = buildCardResolverIndex(pieces);
  const ordered: LibraryCatalogCard[] = [];
  const seen = new Set<string>();
  for (const segment of parseStory(story)) {
    if (segment.kind !== "link") {
      continue;
    }
    const piece = resolvePiece(byLabel, segment.target);
    if (piece != null && !seen.has(piece.id)) {
      seen.add(piece.id);
      ordered.push(piece);
    }
  }
  for (const piece of pieces) {
    if (!seen.has(piece.id)) {
      ordered.push(piece);
    }
  }
  return ordered;
}

function StoryParagraph({
  onSelectPiece,
  paragraph,
  pieceByLabel,
  typeMapping,
}: {
  onSelectPiece(id: string): void;
  paragraph: string;
  pieceByLabel: Map<string, LibraryCatalogCard>;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  return (
    <p className="text-[15px] leading-7 text-[color:var(--viewer-canvas-fg-dim)]">
      {parseStory(paragraph).map((segment, index) => {
        if (segment.kind === "text") {
          return <span key={index}>{segment.text}</span>;
        }
        const piece = resolvePiece(pieceByLabel, segment.target);
        if (piece == null) {
          return (
            <span
              className={[
                "mx-0.5 inline-block border px-1 align-baseline text-[13px]",
                EXTERNAL_NOUN_STYLE,
              ].join(" ")}
              key={index}
              title="Mentioned concept — not a card on this shelf"
            >
              {segment.label}
            </span>
          );
        }
        const descriptor = engineTypeDescriptor(piece.type, typeMapping);
        return (
          <button
            className="mx-0.5 inline-block border px-1 align-baseline text-[13px] font-semibold hover:brightness-110"
            key={index}
            onClick={() => onSelectPiece(piece.id)}
            style={{
              backgroundColor: descriptor.background,
              borderColor: descriptor.border,
              color: descriptor.accent,
            }}
            title={typeTooltip(descriptor)}
            type="button"
          >
            {segment.alias ?? piece.prefLabel}
          </button>
        );
      })}
    </p>
  );
}

function StoryProse({
  onSelectPiece,
  pieceByLabel,
  story,
  typeMapping,
}: {
  onSelectPiece(id: string): void;
  pieceByLabel: Map<string, LibraryCatalogCard>;
  story: string;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  const paragraphs = story.split(/\n{2,}/).filter((paragraph) => paragraph.trim().length > 0);
  return (
    <div className="max-w-[820px] space-y-3">
      {paragraphs.map((paragraph, index) => (
        <StoryParagraph
          key={index}
          onSelectPiece={onSelectPiece}
          paragraph={paragraph}
          pieceByLabel={pieceByLabel}
          typeMapping={typeMapping}
        />
      ))}
    </div>
  );
}

function StoryBucket({
  bucket,
  card,
  label,
  onSelectPiece,
  pieceByLabel,
  story,
  typeMapping,
}: {
  bucket: "how" | "what" | "when" | "why";
  card: LibraryCatalogCard;
  label: string;
  onSelectPiece(id: string): void;
  pieceByLabel: Map<string, LibraryCatalogCard>;
  story: string;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  if (story.trim().length === 0) {
    return null;
  }

  return (
    <section
      className="border-t border-[color:var(--viewer-canvas-rule)] pt-3 first:border-t-0 first:pt-0"
      data-testid={`catalog-story-${testIdPart(card.id)}-${bucket}`}
    >
      <div className={READING_LABEL_CLASS}>{label}</div>
      <StoryProse
        onSelectPiece={onSelectPiece}
        pieceByLabel={pieceByLabel}
        story={story}
        typeMapping={typeMapping}
      />
    </section>
  );
}

interface DiagramConnectorViewModel {
  targetCardId?: string;
  to: string;
  verb: string;
}

// Legacy non-schema catalogs may ship raw connectors as "verb -> Target prefLabel".
function parseLegacyConnectors(raw: readonly string[] | undefined): DiagramConnectorViewModel[] {
  if (raw == null) {
    return [];
  }
  return raw.flatMap((entry) => {
    const index = entry.indexOf("->");
    if (index < 0) {
      return [];
    }
    return [{ to: entry.slice(index + 2).trim(), verb: entry.slice(0, index).trim() }];
  });
}

// The "how it works" diagram: the lead piece, labeled connectors to the big
// pieces it works with, and (if present) the lifecycle flow underneath.
function FunctionalDiagram({
  diagram,
  flow,
  lead,
  legacyConnectors,
  onSelectPiece,
  pieceByLabel,
  typeMapping,
}: {
  diagram: LibraryCatalogCard["diagram"] | undefined;
  flow: readonly string[] | undefined;
  lead: LibraryCatalogCard;
  legacyConnectors: readonly string[] | undefined;
  onSelectPiece(id: string): void;
  pieceByLabel: Map<string, LibraryCatalogCard>;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  const conns: DiagramConnectorViewModel[] =
    diagram?.connectors?.map((connector) => ({
      ...(connector.targetCardId == null ? {} : { targetCardId: connector.targetCardId }),
      to: connector.targetLabel,
      verb: connector.label,
    })) ?? parseLegacyConnectors(legacyConnectors);
  // Group by verb so one relationship with several targets (e.g. "sorts &
  // filters plays by" -> Status, Prio, Tier, Job Category) reads as a single
  // labeled connector with stacked targets — keeping the diagram in parity with
  // the how-it-works sentence.
  const verbGroups: Array<{ targets: Array<{ cardId?: string; label: string }>; verb: string }> =
    [];
  for (const conn of conns) {
    const group = verbGroups.find((entry) => entry.verb === conn.verb);
    const target = {
      ...(conn.targetCardId == null ? {} : { cardId: conn.targetCardId }),
      label: conn.to,
    };
    if (group == null) {
      verbGroups.push({ targets: [target], verb: conn.verb });
    } else {
      group.targets.push(target);
    }
  }
  // For schema-aware libraries the server resolves `diagram` (and its kind) in
  // ax `library-catalog-story.ts` `diagramForCatalogCard`, the canonical source
  // the story lint checks against. This fallback only fires for legacy /
  // non-schema catalogs that ship no `diagram`; keep it in step with that rule.
  const diagramKind =
    diagram?.kind ??
    (flow != null && flow.length >= 2 ? "lifecycle" : conns.length > 0 ? "hub" : null);
  const flowStages = diagram?.flow ?? flow ?? [];
  const hasFlow = diagramKind === "lifecycle" && flowStages.length >= 2;
  if (conns.length === 0 && !hasFlow) {
    return null;
  }
  const diagramLabel =
    diagramKind === "feeds" ? "feeds" : diagramKind === "lifecycle" ? "lifecycle" : "connectors";
  return (
    <div className="mt-4 border-t border-[color:var(--viewer-canvas-rule)] pt-3">
      <div className={`${READING_LABEL_CLASS} mb-3`}>{diagramLabel}</div>
      {verbGroups.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          <div className="border border-[color:var(--viewer-canvas-amber)] bg-[color:var(--viewer-canvas-slate-2)] px-3 py-1.5 font-sans text-[13px] font-semibold text-[color:var(--viewer-canvas-amber-glow)]">
            {lead.prefLabel}
          </div>
          <div
            className="grid w-full gap-3"
            style={{ gridTemplateColumns: `repeat(${verbGroups.length}, minmax(0, 1fr))` }}
          >
            {verbGroups.map((group, groupIndex) => (
              <div className="flex flex-col items-center gap-1 text-center" key={groupIndex}>
                <div className="text-[11px] leading-tight text-[color:var(--viewer-canvas-fg-dim)]">
                  {group.verb}
                </div>
                <div aria-hidden className="text-[color:var(--viewer-canvas-amber-dim)]">
                  ▼
                </div>
                <div className="flex flex-col items-center gap-1">
                  {group.targets.map((target) => {
                    const piece =
                      target.cardId == null
                        ? resolvePiece(pieceByLabel, target.label)
                        : (resolvePiece(pieceByLabel, target.cardId) ??
                          resolvePiece(pieceByLabel, target.label));
                    return piece != null ? (
                      <button
                        className="border px-2 py-1 font-sans text-[12px] font-semibold hover:brightness-110"
                        key={`${group.verb}-${target.label}`}
                        onClick={() => onSelectPiece(piece.id)}
                        style={darkTypeStyle(piece.type, typeMapping)}
                        type="button"
                      >
                        {target.label}
                      </button>
                    ) : (
                      <span
                        className={[
                          "border px-2 py-1 font-sans text-[12px]",
                          EXTERNAL_NOUN_STYLE,
                        ].join(" ")}
                        key={`${group.verb}-${target.label}`}
                        title="Mentioned concept — not a card on this shelf"
                      >
                        {target.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {hasFlow ? (
        <div className="mt-4">
          <div className={READING_LABEL_CLASS}>lifecycle</div>
          <div className="flex flex-wrap items-center gap-1.5">
            {flowStages.map((stage, index) => (
              <span className="flex items-center gap-1.5" key={stage}>
                {index > 0 ? (
                  <span aria-hidden className="text-[color:var(--viewer-canvas-amber-dim)]">
                    →
                  </span>
                ) : null}
                <span className={`border px-2.5 py-1 font-sans text-[12px] ${AMBER_CHIP_CLASS}`}>
                  {stage}
                </span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProductCardStory({
  card,
  onSelectPiece,
  pieceByLabel,
  typeMapping,
}: {
  card: LibraryCatalogCard;
  onSelectPiece(id: string): void;
  pieceByLabel: Map<string, LibraryCatalogCard>;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  const buckets = storyBucketsForCard(card);
  const hasBuckets =
    buckets != null &&
    (buckets.what.trim().length > 0 ||
      buckets.how.trim().length > 0 ||
      buckets.why.trim().length > 0 ||
      buckets.when.trim().length > 0);

  return (
    <>
      {hasBuckets ? (
        <div
          className="max-w-[860px] space-y-3"
          data-testid={`catalog-story-${testIdPart(card.id)}`}
        >
          <StoryBucket
            bucket="what"
            card={card}
            label="what it does"
            onSelectPiece={onSelectPiece}
            pieceByLabel={pieceByLabel}
            story={buckets?.what ?? ""}
            typeMapping={typeMapping}
          />
          <StoryBucket
            bucket="how"
            card={card}
            label="how it does it"
            onSelectPiece={onSelectPiece}
            pieceByLabel={pieceByLabel}
            story={buckets?.how ?? ""}
            typeMapping={typeMapping}
          />
          <StoryBucket
            bucket="why"
            card={card}
            label="why it matters"
            onSelectPiece={onSelectPiece}
            pieceByLabel={pieceByLabel}
            story={buckets?.why ?? ""}
            typeMapping={typeMapping}
          />
          <StoryBucket
            bucket="when"
            card={card}
            label="when"
            onSelectPiece={onSelectPiece}
            pieceByLabel={pieceByLabel}
            story={buckets?.when ?? ""}
            typeMapping={typeMapping}
          />
        </div>
      ) : null}
      <FunctionalDiagram
        diagram={card.diagram}
        flow={card.flow}
        lead={card}
        legacyConnectors={card.connectors}
        onSelectPiece={onSelectPiece}
        pieceByLabel={pieceByLabel}
        typeMapping={typeMapping}
      />
    </>
  );
}

function ContextStory({
  allCards,
  lead,
  onSelectPiece,
  pieces,
  typeMapping,
}: {
  allCards: readonly LibraryCatalogCard[];
  lead: LibraryCatalogCard;
  onSelectPiece(id: string): void;
  pieces: readonly LibraryCatalogCard[];
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  const orderedPieces = orderPiecesByStory(storyTextForOrdering(lead), pieces);
  // A story reference can name any card in the served catalog, not just this
  // shelf's own pieces (director QA: cross-context/cross-plane refs were
  // falling back to the gray "not a card on this shelf" chip). Listing the
  // shelf cards first keeps a same-named local card winning its keys.
  const pieceByLabel = buildCardResolverIndex([lead, ...orderedPieces, ...allCards]);
  return (
    <div
      className={["mx-3 mb-3 p-4", READING_PANEL_MUTED_CLASS].join(" ")}
      data-testid={`context-story-${testIdPart(lead.context)}`}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        {lead.altitude != null ? (
          <span className={READING_LABEL_AMBER_CLASS}>{lead.altitude}</span>
        ) : null}
        <h3 className="break-words font-display text-[16px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
          {lead.prefLabel}
        </h3>
      </div>
      <div className="mt-3">
        <ProductCardStory
          card={lead}
          onSelectPiece={onSelectPiece}
          pieceByLabel={pieceByLabel}
          typeMapping={typeMapping}
        />
      </div>
    </div>
  );
}

// The plane lead one altitude up: its nouns are the plane's *containers*, so
// resolve each context name to that context's lead (no gray container names)
// and route a noun click to the context tile — the same drill the tiles do.
function PlaneLeadStory({
  areas,
  cardsById,
  lead,
  onSelectArea,
  onSelectPiece,
  typeMapping,
}: {
  areas: readonly LibraryCatalogArea[];
  cardsById: Map<string, LibraryCatalogCard>;
  lead: LibraryCatalogCard;
  onSelectArea(areaId: string): void;
  onSelectPiece(cardId: string): void;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  const areaByContext = new Map(areas.map((area) => [area.context, area] as const));
  const cardsForArea = (area: LibraryCatalogArea): LibraryCatalogCard[] =>
    area.cardIds
      .map((id) => cardsById.get(id))
      .filter((card): card is LibraryCatalogCard => card != null);

  // A thesis noun can also name a card outside this plane's own areas (e.g. a
  // Strategy-plane reference from the Product thesis), so fall back to the
  // whole catalog after the plane's own areas — same first-claim-wins order
  // as ContextStory.
  const resolver = new Map(
    buildCardResolverIndex([lead, ...areas.flatMap(cardsForArea), ...cardsById.values()]),
  );
  for (const area of areas) {
    const areaCards = cardsForArea(area);
    const areaLead = pickContextLead(areaCards) ?? areaCards[0];
    if (areaLead == null) {
      continue;
    }
    // A thesis noun names a *container*, so a context/label key must route to its
    // own context — override any same-named card that claimed the key first,
    // otherwise a sibling card's name could silently misroute the noun.
    for (const name of [area.context, area.label]) {
      const key = normalizeResolverKey(name);
      if (key.length > 0) {
        resolver.set(key, areaLead);
      }
    }
  }

  function routeNoun(cardId: string): void {
    const card = cardsById.get(cardId);
    const area = card == null ? undefined : areaByContext.get(card.context);
    if (area != null) {
      onSelectArea(area.id);
      return;
    }
    onSelectPiece(cardId);
  }

  return (
    <div
      className={["mx-3 mb-3 p-4", READING_PANEL_MUTED_CLASS].join(" ")}
      data-testid={`context-story-${testIdPart(lead.context)}`}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        {lead.altitude != null ? (
          <span className={READING_LABEL_AMBER_CLASS}>{lead.altitude}</span>
        ) : null}
        <h3 className="break-words font-display text-[16px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
          {lead.prefLabel}
        </h3>
      </div>
      <div className="mt-3">
        <ProductCardStory
          card={lead}
          onSelectPiece={routeNoun}
          pieceByLabel={resolver}
          typeMapping={typeMapping}
        />
      </div>
    </div>
  );
}

// Exported for the standalone CatalogView (issue #611 promotion).
export function CatalogAreaTree({
  allCards,
  area,
  cards,
  edgesById,
  gaps,
  isOpen,
  onToggle,
  onSelect,
  selectedItem,
  typeMapping,
}: {
  allCards: readonly LibraryCatalogCard[];
  area: LibraryCatalogArea;
  cards: LibraryCatalogCard[];
  edgesById: Map<string, LibraryCatalogEdge>;
  gaps: LibraryCatalogGap[];
  isOpen: boolean;
  onSelect(item: SelectedCatalogItem): void;
  onToggle(): void;
  selectedItem: SelectedCatalogItem;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  const lead = pickContextLead(cards);
  const pieceCards =
    lead == null
      ? cards
      : orderPiecesByStory(
          storyTextForOrdering(lead),
          cards.filter((card) => card.id !== lead.id),
        );
  // Same catalog-wide resolver scope as ContextStory (this area's cards keep
  // first-claim priority over the rest of the catalog).
  const areaPieceByLabel = buildCardResolverIndex([...cards, ...allCards]);

  return (
    <section
      className={READING_PANEL_STRONG_CLASS}
      data-testid={`catalog-area-${testIdPart(area.id)}`}
    >
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 border-b border-[color:var(--viewer-canvas-rule)] px-3 py-2 text-left hover:bg-[color:var(--viewer-canvas-slate-3)]"
        onClick={onToggle}
        type="button"
      >
        <span className="w-4 shrink-0 font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
          {isOpen ? "v" : ">"}
        </span>
        <span className="min-w-0 flex-1">
          <span className={READING_LABEL_AMBER_CLASS}>Context</span>
          <span className="block break-words font-display text-[14px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
            {area.label}
          </span>
          <span className="mt-0.5 block break-words font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
            Plane: {formatPlaneLabel(area.plane)}
          </span>
        </span>
        <span
          className={[
            "shrink-0 border px-2 py-0.5 font-sans text-[10px] uppercase",
            statusClass(area.status),
          ].join(" ")}
        >
          {area.status}
        </span>
        <span className="shrink-0 font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
          {itemCountLabel(cards.length, gaps.length)}
        </span>
      </button>
      {isOpen ? (
        <div className="py-2">
          {lead != null ? (
            <ContextStory
              allCards={allCards}
              lead={lead}
              onSelectPiece={(id) => onSelect({ id, kind: "card" })}
              pieces={pieceCards}
              typeMapping={typeMapping}
            />
          ) : null}
          {pieceCards.map((card) => (
            <CardRow
              card={card}
              edgesById={edgesById}
              isSelected={selectedItem?.kind === "card" && selectedItem.id === card.id}
              key={card.id}
              onSelect={() =>
                onSelect(
                  selectedItem?.kind === "card" && selectedItem.id === card.id
                    ? null
                    : { id: card.id, kind: "card" },
                )
              }
              onSelectPiece={(id) => onSelect({ id, kind: "card" })}
              pieceByLabel={areaPieceByLabel}
              typeMapping={typeMapping}
            />
          ))}
          {gaps.map((gap) => (
            <GapRow
              gap={gap}
              isSelected={selectedItem?.kind === "gap" && selectedItem.id === gap.id}
              key={gap.id}
              onSelect={() =>
                onSelect(
                  selectedItem?.kind === "gap" && selectedItem.id === gap.id
                    ? null
                    : { id: gap.id, kind: "gap" },
                )
              }
            />
          ))}
          {cards.length === 0 && gaps.length === 0 ? <EmptyAreaGap area={area} /> : null}
        </div>
      ) : null}
    </section>
  );
}

// Exported for the standalone IndexView (issue #611 promotion).
export function LibraryIndexView({
  cardsById,
  indexSections,
  metadataIssueCount = 0,
  onSelectArea,
  onSelectPiece,
  readinessAreasById,
  typeMapping,
}: {
  cardsById: Map<string, LibraryCatalogCard>;
  indexSections: readonly LibraryIndexSection[];
  // Named so the global "no contexts at all" empty state below can say why
  // (issue #647: a bare zero can mean either "nothing here" or "everything
  // here failed the schema floor"). Optional/defaulted rather than required,
  // since this view predates the fix and most call sites have zero issues.
  metadataIssueCount?: number;
  onSelectArea(areaId: string): void;
  onSelectPiece(cardId: string): void;
  readinessAreasById: Map<string, LibraryCatalogFillReadinessArea>;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  const hasContexts = indexSections.some((section) => section.areas.length > 0);

  return (
    <div className="space-y-4" data-testid="library-index-view">
      {!hasContexts ? (
        <div
          className="raven-etched-note raven-etched-note-danger px-4 py-3 font-sans text-[12px]"
          data-testid="library-index-empty"
        >
          {metadataIssueCount > 0
            ? `No contexts projected (${metadataIssueCount} file${metadataIssueCount === 1 ? "" : "s"} failed schema validation).`
            : "No contexts projected."}
        </div>
      ) : null}
      {indexSections.map((section) => (
        <section
          className={`p-4 ${READING_PANEL_STRONG_CLASS}`}
          data-testid={`library-index-plane-${testIdPart(section.plane)}`}
          key={section.plane}
        >
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-[color:var(--viewer-canvas-fg-bright)]">
              {formatPlaneLabel(section.plane)}
            </h3>
            <span className="font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
              {section.areas.length} context{section.areas.length === 1 ? "" : "s"}
            </span>
          </div>
          {section.lead != null ? (
            <PlaneLeadStory
              areas={section.areas}
              cardsById={cardsById}
              lead={section.lead}
              onSelectArea={onSelectArea}
              onSelectPiece={onSelectPiece}
              typeMapping={typeMapping}
            />
          ) : null}
          {section.areas.length === 0 ? (
            <div
              className="raven-etched-note px-3 py-2 font-sans text-[12px]"
              data-testid={`library-index-plane-empty-${testIdPart(section.plane)}`}
            >
              No contexts.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {section.areas.map((area) => {
                const readinessArea = readinessAreasById.get(area.id);
                return (
                  <button
                    className="group min-h-[116px] border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-3 py-3 text-left transition-colors hover:border-[color:var(--viewer-canvas-amber)] hover:bg-[color:var(--viewer-canvas-slate-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--viewer-canvas-amber-dim)]"
                    data-testid={`library-index-context-${testIdPart(area.id)}`}
                    key={area.id}
                    onClick={() => onSelectArea(area.id)}
                    type="button"
                  >
                    <span
                      aria-hidden
                      className="mb-3 block h-2 w-14 border border-b-0 border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate-2)] group-hover:border-[color:var(--viewer-canvas-amber)]"
                    />
                    <span className="block break-words font-display text-[14px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
                      {area.label}
                    </span>
                    <span className="mt-1 block break-words font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
                      {formatPlaneLabel(area.plane)}
                    </span>
                    <span
                      className="mt-3 flex flex-wrap gap-2 font-sans text-[11px]"
                      data-testid={`library-index-context-counts-${testIdPart(area.id)}`}
                    >
                      {readinessArea == null ? (
                        <span className={`border px-2 py-0.5 ${NEUTRAL_CHIP_CLASS}`}>
                          counts unavailable
                        </span>
                      ) : (
                        <>
                          <span className={`border px-2 py-0.5 ${NEUTRAL_CHIP_CLASS}`}>
                            {simpleCardCountLabel(readinessArea.cardCount)}
                          </span>
                          <span className={`border px-2 py-0.5 ${SUCCESS_CHIP_CLASS}`}>
                            {simpleFillableCountLabel(readinessArea.fillableCount)}
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

// Exported for the standalone CatalogView/WorkflowView/IndexView (issue #611
// promotion).
export function MetadataIssues({ issues }: { issues: readonly string[] }) {
  if (issues.length === 0) {
    return (
      <div className="raven-etched-note px-4 py-3 font-sans text-[12px]">
        No metadata issues projected.
      </div>
    );
  }

  return (
    <div
      className="raven-etched-note raven-etched-note-danger px-4 py-3"
      data-testid="catalog-metadata-issues"
    >
      <h3 className="font-sans text-[12px] font-semibold uppercase text-[color:var(--viewer-canvas-fg-bright)]">
        Metadata issues
      </h3>
      <ul className="mt-2 space-y-1">
        {issues.map((issue) => (
          <li
            className="break-words font-sans text-[12px] text-[color:var(--viewer-canvas-fg-dim)]"
            key={issue}
          >
            {issue}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CoverageTab({
  areas,
  cardsById,
  gapsById,
}: {
  areas: readonly LibraryCatalogArea[];
  cardsById: Map<string, LibraryCatalogCard>;
  gapsById: Map<string, LibraryCatalogGap>;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {areas.map((area) => (
        <section className={`p-4 ${READING_PANEL_STRONG_CLASS}`} key={area.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="break-words font-display text-[14px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
                {area.label}
              </h3>
              <p className="mt-1 break-words font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
                {formatPlaneLabel(area.plane)} / {area.context}
              </p>
            </div>
            <span
              className={[
                "shrink-0 border px-2 py-0.5 font-sans text-[10px] uppercase",
                statusClass(area.status),
              ].join(" ")}
            >
              {area.status}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 font-sans text-[12px]">
            <div className={`px-3 py-2 ${READING_PANEL_MUTED_CLASS}`}>
              <div className="text-[10px] uppercase text-[color:var(--viewer-canvas-fg-dim)]">
                Cards
              </div>
              <div className="mt-1 text-[18px] text-[color:var(--viewer-engine-confidence-high-text)]">
                {area.cardIds.filter((cardId) => cardsById.has(cardId)).length}
              </div>
            </div>
            <div className={`px-3 py-2 ${READING_PANEL_MUTED_CLASS}`}>
              <div className="text-[10px] uppercase text-[color:var(--viewer-canvas-fg-dim)]">
                Gaps
              </div>
              <div className="mt-1 text-[18px] text-[color:var(--viewer-engine-confidence-low-text)]">
                {area.gapIds.filter((gapId) => gapsById.has(gapId)).length}
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function GapsTab({ gaps }: { gaps: readonly LibraryCatalogGap[] }) {
  if (gaps.length === 0) {
    return (
      <div className="raven-etched-note px-4 py-3 font-sans text-[12px]">
        No explicit gaps projected.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {gaps.map((gap) => (
        <section
          className="raven-etched-note raven-etched-note-danger p-4"
          data-testid={`catalog-gap-summary-${testIdPart(gap.id)}`}
          key={gap.id}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="break-words font-display text-[14px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
                {gap.label}
              </h3>
              <p className="mt-1 break-words font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
                {formatPlaneLabel(gap.plane)} / {gap.context}
              </p>
            </div>
            <span
              className={[
                "border px-2 py-0.5 font-sans text-[10px] uppercase",
                darkConfidenceClass(gap.confidence),
              ].join(" ")}
            >
              {gap.confidence}
            </span>
          </div>
          <p className="mt-3 break-words text-[13px] text-[color:var(--viewer-canvas-fg)]">
            {gap.reason}
          </p>
          <p className="mt-2 break-words font-mono text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
            {provenanceText(gap)}
          </p>
        </section>
      ))}
    </div>
  );
}

function orderedWorkflowSteps(
  steps: readonly LibraryCatalogWorkflowStep[],
): LibraryCatalogWorkflowStep[] {
  return steps
    .map((step, index) => ({ index, step }))
    .sort((left, right) => left.step.order - right.step.order || left.index - right.index)
    .map(({ step }) => step);
}

function workflowContexts(steps: readonly LibraryCatalogWorkflowStep[]): string[] {
  const contexts: string[] = [];
  const seen = new Set<string>();
  for (const step of steps) {
    if (seen.has(step.context)) {
      continue;
    }
    seen.add(step.context);
    contexts.push(step.context);
  }
  return contexts;
}

function resolveWorkflowCard(
  pieceByLabel: Map<string, LibraryCatalogCard>,
  cardRef: string,
): LibraryCatalogCard | undefined {
  return resolvePiece(pieceByLabel, cardRef);
}

function WorkflowCardRef({
  cardRef,
  pieceByLabel,
  stepIndex,
  workflowId,
  onSelectCard,
  typeMapping,
}: {
  cardRef: string;
  pieceByLabel: Map<string, LibraryCatalogCard>;
  stepIndex: number;
  workflowId: string;
  onSelectCard(card: LibraryCatalogCard): void;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  const card = resolveWorkflowCard(pieceByLabel, cardRef);
  const className =
    card == null
      ? `border px-1.5 py-0.5 ${NEUTRAL_CHIP_CLASS}`
      : "border px-1.5 py-0.5 font-semibold hover:brightness-110";

  if (card == null) {
    return (
      <span
        className={className}
        data-testid={`workflow-cardref-${testIdPart(workflowId)}-${stepIndex}-${testIdPart(
          cardRef,
        )}`}
      >
        {cardRef}
      </span>
    );
  }

  return (
    <button
      className={className}
      data-testid={`workflow-cardref-${testIdPart(workflowId)}-${stepIndex}-${testIdPart(cardRef)}`}
      onClick={() => onSelectCard(card)}
      style={darkTypeStyle(card.type, typeMapping)}
      type="button"
    >
      {card.prefLabel}
    </button>
  );
}

function WorkflowNode({
  pieceByLabel,
  point,
  step,
  stepIndex,
  workflowId,
  onSelectCard,
}: {
  pieceByLabel: Map<string, LibraryCatalogCard>;
  point: { x: number; y: number };
  step: LibraryCatalogWorkflowStep;
  stepIndex: number;
  workflowId: string;
  onSelectCard(card: LibraryCatalogCard): void;
}) {
  const firstCard = (step.cardRefs ?? [])
    .map((cardRef) => resolveWorkflowCard(pieceByLabel, cardRef))
    .find((card): card is LibraryCatalogCard => card != null);
  const className = [
    "absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center border bg-[color:var(--viewer-canvas-slate-2)] font-sans text-[11px] font-semibold",
    step.gate === true
      ? "border-[color:var(--viewer-canvas-amber)] text-[color:var(--viewer-canvas-amber-glow)]"
      : "border-[color:var(--viewer-raven-core)] text-[color:var(--viewer-raven-core-soft)]",
    firstCard == null
      ? ""
      : "hover:bg-[color:var(--viewer-canvas-slate)] focus:outline-none focus:ring-2 focus:ring-[color:var(--viewer-canvas-amber-dim)]",
  ].join(" ");
  const content = (
    <>
      {step.gate === true ? (
        <span
          aria-hidden
          className="absolute inset-[-6px] border-2 border-[color:var(--viewer-canvas-amber)]"
          data-testid={`workflow-gate-${testIdPart(workflowId)}-${stepIndex}`}
        />
      ) : null}
      <span className="relative z-10">{step.order}</span>
    </>
  );
  const style = { left: point.x, top: point.y };

  if (firstCard == null) {
    return (
      <span
        className={className}
        data-testid={`workflow-node-${testIdPart(workflowId)}-${stepIndex}`}
        data-workflow-context={step.context}
        data-workflow-gate={step.gate === true ? "true" : "false"}
        data-workflow-order={step.order}
        style={style}
        title={step.activity}
      >
        {content}
      </span>
    );
  }

  return (
    <button
      aria-label={`Open ${firstCard.prefLabel} from ${step.activity}`}
      className={className}
      data-testid={`workflow-node-${testIdPart(workflowId)}-${stepIndex}`}
      data-workflow-context={step.context}
      data-workflow-gate={step.gate === true ? "true" : "false"}
      data-workflow-order={step.order}
      onClick={() => onSelectCard(firstCard)}
      style={style}
      type="button"
    >
      {content}
    </button>
  );
}

function WorkflowMatrix({
  pieceByLabel,
  workflow,
  onSelectCard,
  typeMapping,
}: {
  pieceByLabel: Map<string, LibraryCatalogCard>;
  workflow: LibraryCatalogWorkflow;
  onSelectCard(card: LibraryCatalogCard): void;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  const steps = orderedWorkflowSteps(workflow.steps);
  const contexts = workflowContexts(steps);
  const width = WORKFLOW_LEFT_GUTTER + Math.max(contexts.length, 1) * WORKFLOW_COLUMN_WIDTH;
  const height = WORKFLOW_HEADER_HEIGHT + Math.max(steps.length, 1) * WORKFLOW_ROW_HEIGHT;
  const columnByContext = new Map(contexts.map((context, index) => [context, index]));
  const points = steps.map((step, stepIndex) => {
    const columnIndex = columnByContext.get(step.context) ?? 0;
    return {
      x: WORKFLOW_LEFT_GUTTER + columnIndex * WORKFLOW_COLUMN_WIDTH + WORKFLOW_COLUMN_WIDTH / 2,
      y: WORKFLOW_HEADER_HEIGHT + stepIndex * WORKFLOW_ROW_HEIGHT + WORKFLOW_ROW_HEIGHT / 2,
    };
  });
  // Relationships-in-motion: the typed link each step activates with another
  // context, derived from its cardRefs' cross-context links (issue #456).
  // Renders only where the data supports it — a step with no cross-context
  // cardRef links produces nothing and the row is unchanged.
  const activationsByStep = steps.map((step) => deriveStepActivations(step, pieceByLabel));
  const columnCenterX = (context: string): number | null => {
    const columnIndex = columnByContext.get(context);
    return columnIndex == null
      ? null
      : WORKFLOW_LEFT_GUTTER + columnIndex * WORKFLOW_COLUMN_WIDTH + WORKFLOW_COLUMN_WIDTH / 2;
  };

  return (
    <section
      className={`p-4 ${READING_PANEL_STRONG_CLASS}`}
      data-testid={`workflow-card-${testIdPart(workflow.id)}`}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words font-display text-[14px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
            {workflow.unit}
          </h3>
          <p className="mt-1 break-words font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
            {workflow.id}
          </p>
        </div>
        <span
          className={`border px-2 py-0.5 font-sans text-[10px] uppercase ${NEUTRAL_CHIP_CLASS}`}
        >
          {steps.length} step{steps.length === 1 ? "" : "s"}
        </span>
      </div>
      {steps.length === 0 ? (
        <div className="raven-etched-note px-3 py-2 font-sans text-[12px]">No steps projected.</div>
      ) : (
        <div className="overflow-x-auto" data-testid={`workflow-scroll-${testIdPart(workflow.id)}`}>
          <div className="relative" style={{ height, width }}>
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0"
              height={height}
              width={width}
            >
              {contexts.map((context, contextIndex) => {
                const x =
                  WORKFLOW_LEFT_GUTTER +
                  contextIndex * WORKFLOW_COLUMN_WIDTH +
                  WORKFLOW_COLUMN_WIDTH / 2;
                return (
                  <line
                    key={context}
                    stroke="var(--viewer-canvas-rule)"
                    strokeDasharray="3 5"
                    x1={x}
                    x2={x}
                    y1={WORKFLOW_HEADER_HEIGHT - 8}
                    y2={height - 10}
                  />
                );
              })}
              {steps.map((step, stepIndex) => {
                const y = WORKFLOW_HEADER_HEIGHT + stepIndex * WORKFLOW_ROW_HEIGHT;
                return (
                  <line
                    data-testid={`workflow-row-separator-${testIdPart(workflow.id)}-${stepIndex}`}
                    key={`${step.order}-${step.activity}-${stepIndex}`}
                    stroke="var(--viewer-canvas-panel-bd)"
                    x1={WORKFLOW_LEFT_GUTTER}
                    x2={width}
                    y1={y}
                    y2={y}
                  />
                );
              })}
              <polyline
                data-testid={`workflow-polyline-${testIdPart(workflow.id)}`}
                fill="none"
                points={points.map((point) => `${point.x},${point.y}`).join(" ")}
                stroke="var(--viewer-raven-core)"
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={3}
              />
              {steps.flatMap((_, stepIndex) => {
                const point = points[stepIndex];
                if (point == null) {
                  return [];
                }
                // Stack the rel labels when one step activates more than one
                // typed link into the SAME target column, so the labels never
                // render on top of each other.
                const labelRowByContext = new Map<string, number>();
                return activationsByStep[stepIndex]!.flatMap((activation) => {
                  const targetX = columnCenterX(activation.toContext);
                  // A tick can only point at a column; an activation toward a
                  // context that is not in this workflow has no diagram target.
                  if (targetX == null || targetX === point.x) {
                    return [];
                  }
                  const labelRow = labelRowByContext.get(activation.toContext) ?? 0;
                  labelRowByContext.set(activation.toContext, labelRow + 1);
                  const midX = (point.x + targetX) / 2;
                  return [
                    <g
                      data-testid={`workflow-activation-${testIdPart(workflow.id)}-${stepIndex}-${activation.relKey}-${testIdPart(
                        activation.toContext,
                      )}`}
                      key={`${stepIndex}-${activation.relKey}-${activation.toContext}`}
                    >
                      <line
                        stroke="var(--viewer-canvas-amber)"
                        strokeDasharray="2 3"
                        strokeWidth={1.5}
                        x1={point.x}
                        x2={targetX}
                        y1={point.y}
                        y2={point.y}
                      />
                      <circle
                        cx={targetX}
                        cy={point.y}
                        fill="var(--viewer-canvas-bg)"
                        r={5}
                        stroke="var(--viewer-canvas-amber)"
                        strokeWidth={1.5}
                      />
                      <text
                        fill="var(--viewer-canvas-amber-glow)"
                        fontSize={9}
                        textAnchor="middle"
                        x={midX}
                        y={point.y - 6 - labelRow * 10}
                      >
                        {activation.rel}
                      </text>
                    </g>,
                  ];
                });
              })}
            </svg>

            {contexts.map((context, contextIndex) => (
              <div
                className="absolute top-0 flex h-[56px] items-end justify-center border-b border-[color:var(--viewer-canvas-rule)] px-3 pb-2 text-center font-sans text-[11px] font-semibold uppercase text-[color:var(--viewer-canvas-fg-dim)]"
                data-testid={`workflow-context-${testIdPart(workflow.id)}-${testIdPart(context)}`}
                key={context}
                style={{
                  left: WORKFLOW_LEFT_GUTTER + contextIndex * WORKFLOW_COLUMN_WIDTH,
                  width: WORKFLOW_COLUMN_WIDTH,
                }}
              >
                <span className="break-words">{context}</span>
              </div>
            ))}

            {steps.map((step, stepIndex) => {
              const point = points[stepIndex] ?? { x: WORKFLOW_LEFT_GUTTER, y: 0 };
              return (
                <div key={`${step.order}-${step.activity}-${stepIndex}`}>
                  <div
                    className="absolute left-0 flex flex-col justify-center overflow-hidden py-2 pr-4 font-sans text-[12px]"
                    data-testid={`workflow-row-${testIdPart(workflow.id)}-${stepIndex}`}
                    data-workflow-activity={step.activity}
                    data-workflow-context={step.context}
                    data-workflow-order={step.order}
                    style={{
                      height: WORKFLOW_ROW_HEIGHT,
                      top: WORKFLOW_HEADER_HEIGHT + stepIndex * WORKFLOW_ROW_HEIGHT,
                      width: WORKFLOW_LEFT_GUTTER,
                    }}
                  >
                    <div className="flex min-w-0 items-baseline gap-2">
                      <span className="shrink-0 text-[10px] text-[color:var(--viewer-canvas-amber)]">
                        {step.order}
                      </span>
                      <span className="min-w-0 break-words font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
                        {step.activity}
                      </span>
                    </div>
                    <div className="mt-1 flex min-w-0 flex-wrap gap-1.5 text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
                      {step.stateAfter != null ? (
                        <span className={`border px-1.5 py-0.5 ${AMBER_CHIP_CLASS}`}>
                          {step.stateAfter}
                        </span>
                      ) : null}
                      {step.doer != null ? (
                        <span className={`border px-1.5 py-0.5 ${NEUTRAL_CHIP_CLASS}`}>
                          {step.doer}
                        </span>
                      ) : null}
                      {(step.cardRefs ?? []).map((cardRef) => (
                        <WorkflowCardRef
                          cardRef={cardRef}
                          key={cardRef}
                          onSelectCard={onSelectCard}
                          pieceByLabel={pieceByLabel}
                          stepIndex={stepIndex}
                          typeMapping={typeMapping}
                          workflowId={workflow.id}
                        />
                      ))}
                    </div>
                  </div>
                  <WorkflowNode
                    onSelectCard={onSelectCard}
                    pieceByLabel={pieceByLabel}
                    point={point}
                    step={step}
                    stepIndex={stepIndex}
                    workflowId={workflow.id}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export function WorkflowLensView({
  cards,
  workflows,
  onSelectCard,
  typeMapping = [],
}: {
  cards: readonly LibraryCatalogCard[];
  workflows: readonly LibraryCatalogWorkflow[];
  onSelectCard(card: LibraryCatalogCard): void;
  typeMapping?: readonly LibraryCatalogTypeMappingEntry[];
}) {
  const pieceByLabel = useMemo(() => buildCardResolverIndex(cards), [cards]);

  return (
    <div className="space-y-4" data-testid="workflow-lens-view">
      {workflows.map((workflow) => (
        <WorkflowMatrix
          key={workflow.id}
          onSelectCard={onSelectCard}
          pieceByLabel={pieceByLabel}
          typeMapping={typeMapping}
          workflow={workflow}
        />
      ))}
    </div>
  );
}

function GatePanel({
  catalog,
  onCatalogRefresh,
  runtimeClient,
}: {
  catalog: LibraryCatalog;
  onCatalogRefresh?: () => Promise<void>;
  runtimeClient?: ViewerRuntimeClient;
}) {
  const gate = catalog.gate;
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"confirm" | "reject" | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [editKind, setEditKind] = useState<LibraryConfirmationEditKind>("context_boundary");
  const [target, setTarget] = useState("");
  const [requestedChange, setRequestedChange] = useState("");
  const [rationale, setRationale] = useState("");
  const [edits, setEdits] = useState<LibraryConfirmationEdit[]>([]);

  if (gate == null) {
    return null;
  }

  const activeGate = gate;
  const disabled =
    runtimeClient == null || pendingAction != null || activeGate.approved || activeGate.dirty;
  // The current input row, if complete, plus any rows already staged. A single
  // edit still works without staging (the filled row is included on submit).
  const currentEdit: LibraryConfirmationEdit | null =
    target.trim().length > 0 && requestedChange.trim().length > 0
      ? {
          kind: editKind,
          requestedChange: requestedChange.trim(),
          target: target.trim(),
          ...(rationale.trim().length === 0 ? {} : { rationale: rationale.trim() }),
        }
      : null;
  const pendingEdits = currentEdit == null ? edits : [...edits, currentEdit];
  const canAddEdit = !disabled && currentEdit != null;
  const canReject = !disabled && pendingEdits.length > 0;
  const gateLabel = activeGate.approved
    ? "approved"
    : activeGate.dirty
      ? "not ready"
      : activeGate.rejection != null
        ? "rejected"
        : "not approved";

  // Re-pull the catalog after a confirm/reject so the gate reflects the new
  // state. This intentionally does not throw on a failed refresh: the catalog
  // hook captures the failure as catalog error state, which LibraryBrowserApp
  // surfaces through the shared RuntimeUnavailablePanel (with Retry) rather than
  // showing stale catalog data here. So the confirm/reject catch blocks below
  // only ever handle the confirm/reject call itself, not refreshGate.
  async function refreshGate(): Promise<void> {
    if (onCatalogRefresh != null) {
      await onCatalogRefresh();
    }
  }

  async function confirm(): Promise<void> {
    if (runtimeClient == null || activeGate.approved || activeGate.dirty) {
      return;
    }
    setPendingAction("confirm");
    setError(null);
    try {
      await Effect.runPromise(
        runtimeClient.confirmLibrary({
          bundlePath: activeGate.bundlePath,
          libraryVersion: activeGate.libraryVersion,
          product: activeGate.product,
        }),
      );
      await refreshGate();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setPendingAction(null);
    }
  }

  function addEdit(): void {
    if (currentEdit == null) {
      return;
    }
    setEdits((current) => [...current, currentEdit]);
    setTarget("");
    setRequestedChange("");
    setRationale("");
    setEditKind("context_boundary");
  }

  function removeEdit(index: number): void {
    setEdits((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function reject(): Promise<void> {
    if (runtimeClient == null || !canReject) {
      return;
    }
    const editList = pendingEdits;
    setPendingAction("reject");
    setError(null);
    try {
      await Effect.runPromise(
        runtimeClient.rejectLibrary({
          bundlePath: activeGate.bundlePath,
          editList,
          libraryVersion: activeGate.libraryVersion,
          product: activeGate.product,
        }),
      );
      setShowReject(false);
      setEdits([]);
      setTarget("");
      setRequestedChange("");
      setRationale("");
      await refreshGate();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <section
      className={`mt-3 p-3 ${READING_PANEL_MUTED_CLASS}`}
      data-testid="empty-library-confirm-gate"
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1 font-sans">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "border px-2 py-0.5 text-[10px] uppercase",
                activeGate.approved
                  ? SUCCESS_CHIP_CLASS
                  : activeGate.dirty
                    ? DANGER_CHIP_CLASS
                    : AMBER_CHIP_CLASS,
              ].join(" ")}
            >
              {gateLabel}
            </span>
            <span className="break-words font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
              {activeGate.product} / v{activeGate.libraryVersion}
            </span>
          </div>
          <div className="mt-1 break-words font-mono text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
            {activeGate.bundlePath}
          </div>
          {activeGate.confirmationEventId != null ? (
            <div className="mt-1 break-words font-mono text-[11px] text-[color:var(--viewer-engine-confidence-high-text)]">
              ledger event {activeGate.confirmationEventId}
            </div>
          ) : null}
          {activeGate.statusReason != null ? (
            <div className="mt-1 break-words text-[11px] text-[color:var(--viewer-engine-confidence-low-text)]">
              {activeGate.statusReason}
            </div>
          ) : null}
          {activeGate.rejection != null ? (
            <div className="raven-etched-note raven-etched-note-danger mt-2 p-2 text-[11px]">
              <div className="font-semibold">Latest rejection routed to front-of-house-walk</div>
              <ul className="mt-1 space-y-1">
                {activeGate.rejection.editList.map((edit, index) => (
                  <li className="break-words" key={`${edit.kind}-${edit.target}-${index}`}>
                    {edit.kind}: {edit.target} - {edit.requestedChange}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            className={[
              "h-8 border px-3 font-sans text-[12px]",
              disabled ? NEUTRAL_CHIP_CLASS : `${SUCCESS_CHIP_CLASS} hover:brightness-110`,
            ].join(" ")}
            disabled={disabled}
            onClick={() => {
              void confirm();
            }}
            type="button"
          >
            {pendingAction === "confirm" ? "Confirming" : "Confirm"}
          </button>
          <button
            className={[
              "h-8 border px-3 font-sans text-[12px]",
              disabled ? NEUTRAL_CHIP_CLASS : `${DANGER_CHIP_CLASS} hover:brightness-110`,
            ].join(" ")}
            disabled={disabled}
            onClick={() => setShowReject((current) => !current)}
            type="button"
          >
            Reject
          </button>
        </div>
      </div>
      {showReject && !activeGate.approved ? (
        <div
          className="mt-3 border-t border-[color:var(--viewer-canvas-rule)] pt-3"
          data-testid="empty-library-reject-form"
        >
          {edits.length > 0 ? (
            <ul className="mb-3 space-y-1" data-testid="empty-library-reject-staged">
              {edits.map((edit, index) => (
                <li
                  className={`flex items-start justify-between gap-3 px-3 py-2 font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)] ${READING_PANEL_MUTED_CLASS}`}
                  key={`${edit.kind}-${edit.target}-${index}`}
                >
                  <span className="min-w-0 break-words">
                    {index + 1}. {edit.kind}: {edit.target} - {edit.requestedChange}
                    {edit.rationale == null ? "" : ` (${edit.rationale})`}
                  </span>
                  <button
                    aria-label={`Remove edit ${index + 1}`}
                    className="shrink-0 border border-[color:var(--viewer-canvas-rule)] px-2 text-[color:var(--viewer-engine-confidence-low-text)] hover:bg-[color:var(--viewer-canvas-slate)]"
                    onClick={() => removeEdit(index)}
                    type="button"
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="grid gap-2 md:grid-cols-[190px_1fr_1fr]">
            <label className="font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
              <span className="mb-1 block uppercase">Edit kind</span>
              <select
                className="h-9 w-full border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-2 text-[12px] text-[color:var(--viewer-canvas-fg)]"
                onChange={(event) => setEditKind(event.target.value as LibraryConfirmationEditKind)}
                value={editKind}
              >
                {REJECTION_EDIT_KINDS.map((kind) => (
                  <option key={kind.id} value={kind.id}>
                    {kind.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
              <span className="mb-1 block uppercase">Target</span>
              <input
                className="h-9 w-full border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-2 text-[12px] text-[color:var(--viewer-canvas-fg)]"
                onChange={(event) => setTarget(event.target.value)}
                value={target}
              />
            </label>
            <label className="font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
              <span className="mb-1 block uppercase">Requested change</span>
              <input
                className="h-9 w-full border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-2 text-[12px] text-[color:var(--viewer-canvas-fg)]"
                onChange={(event) => setRequestedChange(event.target.value)}
                value={requestedChange}
              />
            </label>
            <label className="font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)] md:col-span-3">
              <span className="mb-1 block uppercase">Rationale</span>
              <input
                className="h-9 w-full border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-2 text-[12px] text-[color:var(--viewer-canvas-fg)]"
                onChange={(event) => setRationale(event.target.value)}
                value={rationale}
              />
            </label>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              className={[
                "h-9 border px-3 font-sans text-[12px]",
                canAddEdit
                  ? `${DARK_BUTTON_BASE} hover:bg-[color:var(--viewer-canvas-slate-2)]`
                  : NEUTRAL_CHIP_CLASS,
              ].join(" ")}
              disabled={!canAddEdit}
              onClick={addEdit}
              type="button"
            >
              Add another edit
            </button>
            <button
              className={[
                "h-9 border px-3 font-sans text-[12px]",
                canReject ? `${DANGER_CHIP_CLASS} hover:brightness-110` : NEUTRAL_CHIP_CLASS,
              ].join(" ")}
              disabled={!canReject}
              onClick={() => {
                void reject();
              }}
              type="button"
            >
              {pendingAction === "reject"
                ? "Recording"
                : pendingEdits.length > 1
                  ? `Record rejection (${pendingEdits.length} edits)`
                  : "Record rejection"}
            </button>
          </div>
        </div>
      ) : null}
      {error != null ? (
        <div className="raven-etched-note raven-etched-note-danger mt-2 px-3 py-2 font-sans text-[11px]">
          {error}
        </div>
      ) : null}
    </section>
  );
}

function PeekSectionLabel({ children }: { children: string }) {
  return <div className={`${READING_LABEL_CLASS} mb-1.5`}>{children}</div>;
}

// The one shared in-place peek (issue #456). It reflects a noun — card or
// context — to the storytelling standard (WHAT/HOW, contains, leans-on,
// used-in) without leaving the active tab. It is an undimmed right-hand drawer:
// the view behind stays visible (a peek, not a navigation). "open in Catalog →"
// is the only thing that navigates — to the Catalog deep dive.
export function LibraryPeek({
  model,
  onClose,
  onOpenInCatalog,
  onPeekCard,
  pieceByLabel,
  typeMapping,
}: {
  model: LibraryPeekModel;
  onClose(): void;
  onOpenInCatalog(): void;
  onPeekCard(cardId: string): void;
  pieceByLabel: Map<string, LibraryCatalogCard>;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (model.kind === "thread") {
    return (
      <>
        <button
          aria-label="Close peek"
          className="fixed inset-0 z-40 cursor-default bg-[color:var(--viewer-canvas-bg)]/50"
          onClick={onClose}
          tabIndex={-1}
          type="button"
        />
        <aside
          aria-label={`Peek: ${model.title}`}
          className="fixed right-0 top-0 z-50 flex h-full w-[min(440px,92vw)] flex-col overflow-y-auto border-l-2 border-[color:var(--viewer-canvas-amber)] bg-[color:var(--viewer-canvas-slate-2)] text-[color:var(--viewer-canvas-fg)] shadow-[-12px_0_32px_rgba(0,0,0,0.34)]"
          data-peek-context={model.context}
          data-peek-kind={model.kind}
          data-testid="library-peek"
        >
          <header className="sticky top-0 z-10 border-b border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate-2)] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 font-sans text-[10px] uppercase tracking-[0.08em] text-[color:var(--viewer-canvas-amber)]">
                  <span className={`border px-1.5 py-0.5 ${AMBER_CHIP_CLASS}`}>thread</span>
                  <span
                    className={["border px-1.5 py-0.5", darkThreadStatusClass(model.status)].join(
                      " ",
                    )}
                    data-testid="library-peek-thread-status"
                  >
                    {threadStatusLabel(model.status)}
                  </span>
                </div>
                <h3
                  className="mt-1 break-words font-display text-[16px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]"
                  data-testid="library-peek-title"
                >
                  {model.title}
                </h3>
                <p className="mt-0.5 break-words font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
                  {formatPlaneLabel(model.plane)} / {model.contextLabel}
                </p>
              </div>
              <button
                aria-label="Close peek"
                className="shrink-0 border border-[color:var(--viewer-canvas-rule)] px-2 py-0.5 font-sans text-[14px] leading-none text-[color:var(--viewer-engine-confidence-low-text)] hover:bg-[color:var(--viewer-canvas-slate)]"
                data-testid="library-peek-close"
                onClick={onClose}
                type="button"
              >
                ×
              </button>
            </div>
            <button
              className="mt-3 font-sans text-[12px] text-[color:var(--viewer-raven-core-soft)] hover:underline"
              data-testid="library-peek-open-catalog"
              onClick={onOpenInCatalog}
              type="button"
            >
              open in Catalog →
            </button>
          </header>

          <div className="flex-1 space-y-4 px-4 py-4 text-[13px] text-[color:var(--viewer-canvas-fg)]">
            <section data-testid="library-peek-thread-question">
              <PeekSectionLabel>question</PeekSectionLabel>
              <p className="break-words leading-6">{model.title}</p>
            </section>

            <section data-testid="library-peek-thread-reason">
              <PeekSectionLabel>builder reason</PeekSectionLabel>
              <p className="break-words leading-6">{model.reason}</p>
            </section>

            <section data-testid="library-peek-thread-concerns">
              <PeekSectionLabel>concerns</PeekSectionLabel>
              {model.concerns.length === 0 ? (
                <p className="font-sans text-[12px] text-[color:var(--viewer-canvas-fg-dim)]">
                  No concerns recorded.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {model.concerns.map((concern, index) => {
                    const cardId = concern.cardId;
                    return cardId != null ? (
                      <button
                        className={`border px-1.5 py-0.5 font-sans text-[11px] font-semibold hover:brightness-110 ${AMBER_CHIP_CLASS}`}
                        data-testid={`library-peek-thread-concern-${testIdPart(cardId)}`}
                        key={`${cardId}-${index}`}
                        onClick={() => onPeekCard(cardId)}
                        type="button"
                      >
                        {concern.label}
                      </button>
                    ) : (
                      <span
                        className={`border px-1.5 py-0.5 font-sans text-[11px] ${NEUTRAL_CHIP_CLASS}`}
                        key={`${concern.type}-${concern.label}-${index}`}
                      >
                        {concern.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </section>

            <section data-testid="library-peek-thread-provenance">
              <PeekSectionLabel>provenance</PeekSectionLabel>
              <p className="font-mono text-[12px] text-[color:var(--viewer-canvas-fg-dim)]">
                via {model.emittingMove}
              </p>
              {model.sourceEvidence.length === 0 ? (
                <p
                  className="mt-1 font-sans text-[12px] text-[color:var(--viewer-canvas-fg-dimmer)]"
                  data-testid="library-peek-thread-no-evidence"
                >
                  no evidence
                </p>
              ) : (
                <ul className="mt-2 space-y-1" data-testid="library-peek-thread-evidence">
                  {model.sourceEvidence.map((ref, index) => (
                    <li
                      className="break-words font-mono text-[12px] text-[color:var(--viewer-canvas-fg-dim)]"
                      key={`${ref}-${index}`}
                    >
                      {ref}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </aside>
      </>
    );
  }

  const story = model.story;
  const hasWhat = story != null && story.what.trim().length > 0;
  const hasHow = story != null && story.how.trim().length > 0;
  const hasWhy = story != null && story.why.trim().length > 0;
  const hasWhen = story != null && story.when.trim().length > 0;

  return (
    <>
      <button
        aria-label="Close peek"
        className="fixed inset-0 z-40 cursor-default bg-[color:var(--viewer-canvas-bg)]/50"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <aside
        aria-label={`Peek: ${model.title}`}
        className="fixed right-0 top-0 z-50 flex h-full w-[min(440px,92vw)] flex-col overflow-y-auto border-l-2 border-[color:var(--viewer-canvas-amber)] bg-[color:var(--viewer-canvas-slate-2)] text-[color:var(--viewer-canvas-fg)] shadow-[-12px_0_32px_rgba(0,0,0,0.34)]"
        data-peek-context={model.context}
        data-peek-kind={model.kind}
        data-testid="library-peek"
      >
        <header className="sticky top-0 z-10 border-b border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate-2)] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 font-sans text-[10px] uppercase tracking-[0.08em] text-[color:var(--viewer-canvas-amber)]">
                <span className={`border px-1.5 py-0.5 ${AMBER_CHIP_CLASS}`}>{model.kind}</span>
                {model.altitude != null ? <span>{model.altitude}</span> : null}
                {model.type != null ? (
                  <span className="text-[color:var(--viewer-canvas-fg-dim)]">{model.type}</span>
                ) : null}
              </div>
              <h3
                className="mt-1 break-words font-display text-[16px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]"
                data-testid="library-peek-title"
              >
                {model.title}
              </h3>
              <p className="mt-0.5 break-words font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
                {formatPlaneLabel(model.plane)} / {model.contextLabel}
              </p>
            </div>
            <button
              aria-label="Close peek"
              className="shrink-0 border border-[color:var(--viewer-canvas-rule)] px-2 py-0.5 font-sans text-[14px] leading-none text-[color:var(--viewer-engine-confidence-low-text)] hover:bg-[color:var(--viewer-canvas-slate)]"
              data-testid="library-peek-close"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </div>
          <button
            className="mt-3 font-sans text-[12px] text-[color:var(--viewer-raven-core-soft)] hover:underline"
            data-testid="library-peek-open-catalog"
            onClick={onOpenInCatalog}
            type="button"
          >
            open in Catalog →
          </button>
        </header>

        <div className="flex-1 space-y-4 px-4 py-4 text-[13px] text-[color:var(--viewer-canvas-fg)]">
          {hasWhat ? (
            <section data-testid="library-peek-what">
              <PeekSectionLabel>what it does</PeekSectionLabel>
              <StoryProse
                onSelectPiece={onPeekCard}
                pieceByLabel={pieceByLabel}
                story={story?.what ?? ""}
                typeMapping={typeMapping}
              />
            </section>
          ) : null}
          {hasHow ? (
            <section data-testid="library-peek-how">
              <PeekSectionLabel>how it does it</PeekSectionLabel>
              <StoryProse
                onSelectPiece={onPeekCard}
                pieceByLabel={pieceByLabel}
                story={story?.how ?? ""}
                typeMapping={typeMapping}
              />
            </section>
          ) : null}
          {hasWhy ? (
            <section data-testid="library-peek-why">
              <PeekSectionLabel>why it matters</PeekSectionLabel>
              <StoryProse
                onSelectPiece={onPeekCard}
                pieceByLabel={pieceByLabel}
                story={story?.why ?? ""}
                typeMapping={typeMapping}
              />
            </section>
          ) : null}
          {hasWhen ? (
            <section data-testid="library-peek-when">
              <PeekSectionLabel>when</PeekSectionLabel>
              <StoryProse
                onSelectPiece={onPeekCard}
                pieceByLabel={pieceByLabel}
                story={story?.when ?? ""}
                typeMapping={typeMapping}
              />
            </section>
          ) : null}

          {model.contains.length > 0 ? (
            <section data-testid="library-peek-contains">
              <PeekSectionLabel>contains</PeekSectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {model.contains.map((part) => (
                  <button
                    className="border px-1.5 py-0.5 font-sans text-[11px] font-semibold hover:brightness-110"
                    key={part.cardId}
                    onClick={() => onPeekCard(part.cardId)}
                    style={darkTypeStyle(part.type, typeMapping)}
                    type="button"
                  >
                    {part.label}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {model.leansOn.length > 0 ? (
            <section data-testid="library-peek-leans-on">
              <PeekSectionLabel>leans on</PeekSectionLabel>
              <ul className="space-y-1.5">
                {model.leansOn.map((seam) => (
                  <li
                    className="flex flex-wrap items-baseline gap-1.5 font-sans text-[12px]"
                    data-testid={`library-peek-seam-${seam.relKey}-${testIdPart(seam.targetContext)}`}
                    key={`${seam.relKey}-${seam.targetCardId ?? seam.targetLabel}`}
                  >
                    <span className="font-mono text-[color:var(--viewer-canvas-amber)]">
                      {seam.rel}
                    </span>
                    {seam.targetCardId != null ? (
                      <button
                        className={`border px-1.5 py-0.5 font-semibold hover:brightness-110 ${AMBER_CHIP_CLASS}`}
                        onClick={() => onPeekCard(seam.targetCardId ?? "")}
                        type="button"
                      >
                        {seam.targetLabel}
                      </button>
                    ) : (
                      <span className={`border px-1.5 py-0.5 ${NEUTRAL_CHIP_CLASS}`}>
                        {seam.targetLabel}
                      </span>
                    )}
                    <span className="text-[color:var(--viewer-canvas-fg-dim)]">
                      in {seam.targetContext}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {model.usedIn.length > 0 ? (
            <section data-testid="library-peek-used-in">
              <PeekSectionLabel>used in the walk-through</PeekSectionLabel>
              <ul className="space-y-1">
                {model.usedIn.map((usage, usageIndex) => (
                  <li
                    className="break-words font-sans text-[12px] text-[color:var(--viewer-canvas-fg-dim)]"
                    key={`${usage.workflowId}-${usage.order}-${usageIndex}`}
                  >
                    {usage.unit} · step {usage.order}: {usage.activity}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {model.gaps.length > 0 ? (
            <section data-testid="library-peek-gaps">
              <PeekSectionLabel>gaps</PeekSectionLabel>
              <ul className="space-y-1.5">
                {model.gaps.map((gap) => (
                  <li
                    className="border-l-2 border-dashed border-[color:var(--viewer-canvas-danger)] bg-[color:var(--viewer-canvas-slate)] px-2 py-1 text-[12px] text-[color:var(--viewer-canvas-fg)]"
                    data-testid={`library-peek-gap-${testIdPart(gap.id)}`}
                    key={gap.id}
                  >
                    <span className="font-sans font-semibold text-[color:var(--viewer-engine-confidence-low-text)]">
                      {gap.label}
                    </span>
                    <span className="ml-1.5 break-words">{gap.reason}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {!peekHasContent(model) ? (
            <p
              className="font-sans text-[12px] text-[color:var(--viewer-canvas-fg-dim)]"
              data-testid="library-peek-empty"
            >
              Nothing further projected for this {model.kind}.
            </p>
          ) : null}
        </div>
      </aside>
    </>
  );
}

export function EmptyLibraryView({
  catalog,
  emptyStatePath,
  initialSelectedItem,
  initialTab,
  onCatalogRefresh,
  runtimeClient,
}: EmptyLibraryViewProps) {
  const cardsById = useMemo(() => byId(catalog.cards), [catalog.cards]);
  const gapsById = useMemo(() => byId(catalog.gaps), [catalog.gaps]);
  const edgesById = useMemo(() => byId(catalog.edges), [catalog.edges]);
  const hasFillReadiness = catalog.fillReadiness != null;
  const workflows = catalog.workflows ?? [];
  const hasWorkflowLens = hasFillReadiness && workflows.length > 0;
  const catalogTabs = useMemo(
    () =>
      hasFillReadiness
        ? [
            { id: "index" as const, label: "Index" },
            { id: "readiness" as const, label: "Notepad" },
            ...(hasWorkflowLens ? [{ id: "workflow" as const, label: "Workflow" }] : []),
            { id: "catalog" as const, label: "Catalog" },
          ]
        : LEGACY_CATALOG_TABS,
    [hasFillReadiness, hasWorkflowLens],
  );
  const [activeTab, setActiveTab] = useState<CatalogTab>(
    () => initialTab ?? (catalog.fillReadiness == null ? "catalog" : "index"),
  );
  // Track which areas the director has explicitly COLLAPSED. Default empty =
  // every area open, deterministically — no race with the async catalog load.
  const [collapsedAreaIds, setCollapsedAreaIds] = useState<Set<string>>(() => new Set());
  const [selectedItem, setSelectedItem] = useState<SelectedCatalogItem>(
    () => initialSelectedItem ?? null,
  );
  // The noun the in-place peek is reflecting (null = closed). Shared by every
  // view; opening it never changes the active tab. `peekSubject`/
  // `setPeekSubject` are also consumed directly below (selectCardInCatalog,
  // peekOpenInCatalog) alongside this view's other own state, so the raw
  // setter is kept rather than only the hook's `open*` conveniences.
  const { peekCardIndex, peekModel, peekSubject, setPeekSubject } = useLibraryPeek(
    catalog,
    cardsById,
    gapsById,
  );
  const { areasByPlane, planeStats, selectedPlane, setSelectedPlane } = usePlaneStats(catalog);

  useEffect(() => {
    if (!catalogTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(catalog.fillReadiness == null ? "catalog" : "index");
    }
  }, [activeTab, catalog.fillReadiness, catalogTabs]);

  // A catalog refresh (poll, gate action) replaces the object identity, so do
  // NOT reset the active tab here — that would bounce the director off whatever
  // tab they navigated to. The guard effect above already corrects the tab when
  // a schema change makes the current one invalid.
  useEffect(() => {
    setCollapsedAreaIds(new Set());
    setSelectedItem(null);
  }, [catalog]);

  const indexSections = useMemo(
    () => buildLibraryIndexSections(catalog.areas, cardsById),
    [catalog.areas, cardsById],
  );
  const readinessAreasById = useMemo(
    () => new Map((catalog.fillReadiness?.areas ?? []).map((area) => [area.areaId, area])),
    [catalog.fillReadiness?.areas],
  );
  const selectedAreas = areasByPlane.get(selectedPlane) ?? [];
  const blankCatalog =
    catalog.meta.areaCount === 0 && catalog.meta.cardCount === 0 && catalog.meta.gapCount === 0;
  const showBlankCatalog =
    blankCatalog && (emptyStatePath != null || !(hasFillReadiness && activeTab === "index"));
  // A bare zero can mean either "nothing here" or "everything here failed
  // the schema floor" (issue #647's root cause on the old prose library) —
  // these read identically as 0 cards/gaps/areas otherwise, so name the
  // metadataIssues count in the headline whenever it's the latter. The full
  // per-file list still renders just below via MetadataIssues.
  const metadataIssueCount = catalog.meta.metadataIssues.length;
  const blankCatalogCopy =
    metadataIssueCount > 0
      ? `${metadataIssueCount} file${metadataIssueCount === 1 ? "" : "s"} failed schema validation` +
        (emptyStatePath == null
          ? " — no filled cards, explicit gaps, or named areas were projected by the runtime."
          : ` — no filled cards, explicit gaps, or named areas were projected from ${emptyStatePath}.`)
      : emptyStatePath == null
        ? "No filled cards, explicit gaps, or named areas were projected by the runtime."
        : `No filled cards, explicit gaps, or named areas were projected from ${emptyStatePath}.`;

  function cardsForArea(area: LibraryCatalogArea): LibraryCatalogCard[] {
    return area.cardIds.flatMap((cardId) => {
      const card = cardsById.get(cardId);
      return card == null ? [] : [card];
    });
  }

  function gapsForArea(area: LibraryCatalogArea): LibraryCatalogGap[] {
    return area.gapIds.flatMap((gapId) => {
      const gap = gapsById.get(gapId);
      return gap == null ? [] : [gap];
    });
  }

  function toggleArea(areaId: string): void {
    setCollapsedAreaIds((current) => {
      const next = new Set(current);
      if (next.has(areaId)) {
        next.delete(areaId);
      } else {
        next.add(areaId);
      }
      return next;
    });
  }

  function uncollapse(areaId: string): void {
    setCollapsedAreaIds((current) => {
      if (!current.has(areaId)) {
        return current;
      }
      const next = new Set(current);
      next.delete(areaId);
      return next;
    });
  }

  // The deep dive: switch to the Catalog tab and select the card there. Closes
  // the peek. This is the only path that navigates.
  function selectCardInCatalog(card: LibraryCatalogCard): void {
    const area = catalog.areas.find((candidate) => candidate.cardIds.includes(card.id));
    if (area != null) {
      uncollapse(area.id);
    }
    setSelectedPlane(card.plane);
    setPeekSubject(null);
    setActiveTab("catalog");
    setSelectedItem({ id: card.id, kind: "card" });
  }

  // The deep dive for a context: the Catalog tab focused on the area.
  function openContextInCatalog(area: LibraryCatalogArea): void {
    uncollapse(area.id);
    setSelectedPlane(area.plane);
    setPeekSubject(null);
    setActiveTab("catalog");
    setSelectedItem(null);
  }

  // The peek replaces the jump: views call these instead of selectCardInCatalog.
  function openCardPeek(cardId: string): void {
    setPeekSubject({ cardId, kind: "card" });
  }

  function openContextPeek(areaId: string): void {
    setPeekSubject({ areaId, kind: "context" });
  }

  function openThreadPeek(threadId: string): void {
    setPeekSubject({ kind: "thread", threadId });
  }

  function peekOpenInCatalog(): void {
    if (peekSubject == null) {
      return;
    }
    if (peekSubject.kind === "card") {
      const card = cardsById.get(peekSubject.cardId);
      if (card != null) {
        selectCardInCatalog(card);
      }
      return;
    }
    if (peekSubject.kind === "thread") {
      const thread = (catalog.threads ?? []).find(
        (candidate) => candidate.id === peekSubject.threadId,
      );
      if (thread == null) {
        return;
      }
      const cardConcern = thread.concerns.find(
        (concern) =>
          concern.type === "card" && concern.cardId != null && cardsById.has(concern.cardId),
      );
      if (cardConcern?.cardId != null) {
        const card = cardsById.get(cardConcern.cardId);
        if (card != null) {
          selectCardInCatalog(card);
          return;
        }
      }
      const contextConcern = thread.concerns.find(
        (concern) => concern.context != null && concern.plane != null,
      );
      if (contextConcern?.context != null && contextConcern.plane != null) {
        const area = catalog.areas.find(
          (candidate) =>
            candidate.context === contextConcern.context &&
            candidate.plane === contextConcern.plane,
        );
        if (area != null) {
          openContextInCatalog(area);
          return;
        }
      }
      setPeekSubject(null);
      setActiveTab("catalog");
      setSelectedItem(null);
      return;
    }
    const area = catalog.areas.find((candidate) => candidate.id === peekSubject.areaId);
    if (area != null) {
      openContextInCatalog(area);
    }
  }

  const readiness = catalog.fillReadiness;
  const headerReadout =
    readiness == null
      ? `${catalog.meta.cardCount} cards / ${catalog.meta.gapCount} gaps / ${catalog.meta.areaCount} areas`
      : `${readiness.fillableCardCount}/${readiness.totalCardCount} fillable · ${
          readiness.gapCount
        } gap${readiness.gapCount === 1 ? "" : "s"} · ${hotSpotLabel(readiness.hotSpotCount)}`;

  return (
    <section
      className="raven-canvas-section min-h-[520px] text-[color:var(--viewer-canvas-fg)]"
      data-testid="empty-library-view"
    >
      <header className="sticky top-0 z-[1] border-b border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate-2)] px-5 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.24)]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-[15px] font-semibold uppercase tracking-[0.04em] text-[color:var(--viewer-canvas-fg-bright)]">
              Empty Library
            </h2>
            <p className="mt-0.5 font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
              {headerReadout}
            </p>
          </div>
          <nav className="flex flex-wrap gap-1" aria-label="Empty Library workbench views">
            {catalogTabs.map((tab) => (
              <WorkbenchTabButton
                active={activeTab === tab.id}
                key={tab.id}
                label={tab.label}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPeekSubject(null);
                  if (tab.id === "index") {
                    setSelectedItem(null);
                  }
                }}
              />
            ))}
          </nav>
          <div className="ml-auto flex flex-wrap items-center gap-3 font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
            {readiness != null ? (
              <span
                className={[
                  "inline-flex border px-2 py-0.5 text-[10px] uppercase",
                  readiness.ready ? SUCCESS_CHIP_CLASS : DANGER_CHIP_CLASS,
                ].join(" ")}
              >
                {readiness.ready ? "preliminary-ready" : "blocked"}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <span className={`h-2.5 w-2.5 border ${SUCCESS_CHIP_CLASS}`} />
              filled card
            </span>
            <span className="inline-flex items-center gap-1">
              <span className={`h-2.5 w-2.5 border border-dashed ${DANGER_CHIP_CLASS}`} />
              explicit gap
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex gap-0.5">
                <span className={`h-2.5 w-2.5 border ${SUCCESS_CHIP_CLASS}`} title="high" />
                <span className={`h-2.5 w-2.5 border ${AMBER_CHIP_CLASS}`} title="medium" />
                <span className={`h-2.5 w-2.5 border ${DANGER_CHIP_CLASS}`} title="low" />
              </span>
              confidence (high / med / low)
            </span>
          </div>
        </div>
        <TypeLegend catalog={catalog} className="mt-3" />
        <DraftOverlaySummary catalog={catalog} className="mt-3" />
        <GatePanel
          catalog={catalog}
          onCatalogRefresh={onCatalogRefresh}
          runtimeClient={runtimeClient}
        />
      </header>

      {showBlankCatalog ? (
        <div className="min-h-[460px] p-5">
          <div
            className="raven-etched-note raven-etched-note-danger p-6"
            data-testid="empty-library-blank-state"
          >
            <h3 className="font-display text-[15px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
              No catalog projection yet
            </h3>
            <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-[color:var(--viewer-canvas-fg-dim)]">
              {blankCatalogCopy}
            </p>
            <MetadataIssues issues={catalog.meta.metadataIssues} />
          </div>
        </div>
      ) : hasFillReadiness && activeTab === "index" ? (
        <div className="min-h-[460px] p-5">
          <LibraryIndexView
            cardsById={cardsById}
            indexSections={indexSections}
            metadataIssueCount={catalog.meta.metadataIssues.length}
            onSelectArea={openContextPeek}
            onSelectPiece={openCardPeek}
            readinessAreasById={readinessAreasById}
            typeMapping={catalog.typeMapping ?? []}
          />
        </div>
      ) : (
        <div className="grid min-h-[460px] grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="border-b border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate-3)] p-3 lg:border-b-0 lg:border-r">
            <div className="mb-2 px-2 font-sans text-[11px] font-semibold uppercase text-[color:var(--viewer-canvas-fg-dim)]">
              Planes
            </div>
            <div className="space-y-1">
              {planeStats.map((stats) => (
                <PlaneButton
                  active={selectedPlane === stats.plane}
                  areaCount={stats.areaCount}
                  cardCount={stats.cardCount}
                  gapCount={stats.gapCount}
                  key={stats.plane}
                  onClick={() => setSelectedPlane(stats.plane)}
                  plane={stats.plane}
                />
              ))}
            </div>
          </aside>

          <div className="min-w-0 p-5">
            {activeTab === "workflow" && hasWorkflowLens ? (
              <WorkflowLensView
                cards={catalog.cards}
                onSelectCard={(card) => openCardPeek(card.id)}
                typeMapping={catalog.typeMapping ?? []}
                workflows={workflows}
              />
            ) : blankCatalog ? (
              <div
                className="raven-etched-note raven-etched-note-danger p-6"
                data-testid="empty-library-blank-state"
              >
                <h3 className="font-display text-[15px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
                  No catalog projection yet
                </h3>
                <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-[color:var(--viewer-canvas-fg-dim)]">
                  {blankCatalogCopy}
                </p>
                <MetadataIssues issues={catalog.meta.metadataIssues} />
              </div>
            ) : activeTab === "catalog" ? (
              <div className="space-y-3">
                {selectedAreas.length === 0 ? (
                  <div className="raven-etched-note raven-etched-note-danger p-4 font-sans text-[12px]">
                    No areas projected for {formatPlaneLabel(selectedPlane)}.
                  </div>
                ) : (
                  selectedAreas.map((area) => (
                    <CatalogAreaTree
                      allCards={catalog.cards}
                      area={area}
                      cards={cardsForArea(area)}
                      edgesById={edgesById}
                      gaps={gapsForArea(area)}
                      isOpen={!collapsedAreaIds.has(area.id)}
                      key={area.id}
                      onSelect={setSelectedItem}
                      onToggle={() => toggleArea(area.id)}
                      selectedItem={selectedItem}
                      typeMapping={catalog.typeMapping ?? []}
                    />
                  ))
                )}
                {catalog.meta.metadataIssues.length > 0 ? (
                  <MetadataIssues issues={catalog.meta.metadataIssues} />
                ) : null}
              </div>
            ) : activeTab === "readiness" && readiness != null ? (
              <NotepadView
                cardsById={cardsById}
                catalog={catalog}
                onSelectCard={(card) => openCardPeek(card.id)}
                onSelectThread={(thread) => openThreadPeek(thread.id)}
              />
            ) : activeTab === "coverage" ? (
              <CoverageTab areas={catalog.areas} cardsById={cardsById} gapsById={gapsById} />
            ) : activeTab === "gaps" ? (
              <GapsTab gaps={catalog.gaps} />
            ) : (
              <MetadataIssues issues={catalog.meta.metadataIssues} />
            )}
          </div>
        </div>
      )}
      {peekModel != null ? (
        <LibraryPeek
          model={peekModel}
          onClose={() => setPeekSubject(null)}
          onOpenInCatalog={peekOpenInCatalog}
          onPeekCard={openCardPeek}
          pieceByLabel={peekCardIndex}
          typeMapping={catalog.typeMapping ?? []}
        />
      ) : null}
    </section>
  );
}
