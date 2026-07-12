// The Notepad's derived data: the fill-readiness burndown (Presence) plus the
// thread worklist filters, extracted standalone out of EmptyLibraryView's
// `readiness` sub-tab (issue #609) so the Notepad can be mounted anywhere,
// mirroring the PMS extraction (packages/pms/viewer's notepad-view-model.ts).
// Kept deliberately separate from that PMS file — same shape, no shared
// import — because the PMS/Alexandria package boundary stays intact; the
// small amount of duplicated logic (thread status/label helpers) is the
// accepted cost.
//
// Everything here is a pure derivation of the served `LibraryCatalog`: the
// Notepad stores nothing and writes nothing.
import { typeDescriptor } from "./engine-view-model";
import type {
  LibraryCatalog,
  LibraryCatalogFillReadinessArea,
  LibraryCatalogThread,
  LibraryCatalogTypeMappingEntry,
} from "./types";

export const CANONICAL_THREAD_STATUSES = ["open", "answered", "residual"] as const;
export type ThreadStatus = (typeof CANONICAL_THREAD_STATUSES)[number];
export type ThreadStatusFilter = "all" | ThreadStatus;

export const NEUTRAL_CHIP_CLASS =
  "border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] text-[color:var(--viewer-canvas-fg-dim)]";
export const SUCCESS_CHIP_CLASS =
  "border-[color:var(--viewer-canvas-success)] bg-[color:var(--viewer-engine-confidence-high-bg)] text-[color:var(--viewer-engine-confidence-high-text)]";
export const AMBER_CHIP_CLASS =
  "border-[color:var(--viewer-canvas-amber)] bg-[color:var(--viewer-engine-confidence-medium-bg)] text-[color:var(--viewer-engine-confidence-medium-text)]";
export const DANGER_CHIP_CLASS =
  "border-[color:var(--viewer-canvas-danger)] bg-[color:var(--viewer-engine-confidence-low-bg)] text-[color:var(--viewer-engine-confidence-low-text)]";
const TYPE_DESCRIPTOR_CHIP_CLASSES: Record<string, string> = {
  Arc: "border-[color:var(--viewer-engine-type-arc-border)] bg-[color:var(--viewer-engine-type-arc-bg)] text-[color:var(--viewer-engine-type-arc-accent)]",
  Bet: "border-[color:var(--viewer-engine-type-bet-border)] bg-[color:var(--viewer-engine-type-bet-bg)] text-[color:var(--viewer-engine-type-bet-accent)]",
  Capability:
    "border-[color:var(--viewer-engine-type-capability-border)] bg-[color:var(--viewer-engine-type-capability-bg)] text-[color:var(--viewer-engine-type-capability-accent)]",
  Domain:
    "border-[color:var(--viewer-engine-type-domain-border)] bg-[color:var(--viewer-engine-type-domain-bg)] text-[color:var(--viewer-engine-type-domain-accent)]",
  Economy:
    "border-[color:var(--viewer-engine-type-economy-border)] bg-[color:var(--viewer-engine-type-economy-bg)] text-[color:var(--viewer-engine-type-economy-accent)]",
  Entity:
    "border-[color:var(--viewer-engine-type-entity-border)] bg-[color:var(--viewer-engine-type-entity-bg)] text-[color:var(--viewer-engine-type-entity-accent)]",
  Experiment:
    "border-[color:var(--viewer-engine-type-experiment-border)] bg-[color:var(--viewer-engine-type-experiment-bg)] text-[color:var(--viewer-engine-type-experiment-accent)]",
  Measure:
    "border-[color:var(--viewer-engine-type-measure-border)] bg-[color:var(--viewer-engine-type-measure-bg)] text-[color:var(--viewer-engine-type-measure-accent)]",
  Mechanism:
    "border-[color:var(--viewer-engine-type-mechanism-border)] bg-[color:var(--viewer-engine-type-mechanism-bg)] text-[color:var(--viewer-engine-type-mechanism-accent)]",
  Pattern:
    "border-[color:var(--viewer-engine-type-pattern-border)] bg-[color:var(--viewer-engine-type-pattern-bg)] text-[color:var(--viewer-engine-type-pattern-accent)]",
  Principle:
    "border-[color:var(--viewer-engine-type-principle-border)] bg-[color:var(--viewer-engine-type-principle-bg)] text-[color:var(--viewer-engine-type-principle-accent)]",
  Research:
    "border-[color:var(--viewer-engine-type-research-border)] bg-[color:var(--viewer-engine-type-research-bg)] text-[color:var(--viewer-engine-type-research-accent)]",
  Role: "border-[color:var(--viewer-engine-type-role-border)] bg-[color:var(--viewer-engine-type-role-bg)] text-[color:var(--viewer-engine-type-role-accent)]",
  Surface:
    "border-[color:var(--viewer-engine-type-surface-border)] bg-[color:var(--viewer-engine-type-surface-bg)] text-[color:var(--viewer-engine-type-surface-accent)]",
  Unknown:
    "border-[color:var(--viewer-engine-type-unknown-border)] bg-[color:var(--viewer-engine-type-unknown-bg)] text-[color:var(--viewer-engine-type-unknown-accent)]",
};

export function normalizedThreadStatus(status: string): string {
  const normalized = status.trim().toLowerCase();
  return normalized.length === 0 ? "unknown" : normalized;
}

export function threadStatusLabel(status: string): string {
  return normalizedThreadStatus(status);
}

// Shared with the thread peek drawer (EmptyLibraryView's `LibraryPeek`,
// outside the Notepad tab), which reflects the same thread `status` in its
// header — not part of the fill-readiness projection duplication boundary.
export function threadStatusClass(status: string): string {
  switch (normalizedThreadStatus(status)) {
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

// Same two-value chip classification as `threadStatusClass`, kept alongside
// it rather than duplicated per-consumer.
export function threadFamilyClass(family: LibraryCatalogThread["family"]): string {
  switch (family) {
    case "gap":
      return DANGER_CHIP_CLASS;
    case "hot_spot":
      return AMBER_CHIP_CLASS;
  }
}

export function valueLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export function hotSpotLabel(count: number): string {
  return `${count} hot spot${count === 1 ? "" : "s"}`;
}

// Shared confidence-badge palette: the always-visible header readout, the
// Catalog/Index/Workflow card and gap badges (EmptyLibraryView), and the
// Notepad's thread severity badge (severity reuses the same three-level
// scale) all key off this one mapping.
export function confidenceClass(confidence: "high" | "low" | "medium"): string {
  switch (confidence) {
    case "high":
      return SUCCESS_CHIP_CLASS;
    case "medium":
      return AMBER_CHIP_CLASS;
    case "low":
      return DANGER_CHIP_CLASS;
  }
}

function classNamesForTypeDescriptor(descriptor: ReturnType<typeof typeDescriptor>): string {
  return TYPE_DESCRIPTOR_CHIP_CLASSES[descriptor.type] ?? TYPE_DESCRIPTOR_CHIP_CLASSES.Unknown;
}

// Event-Storming-ish role color for a card by type. The five legacy lowercase
// DDD-vocabulary cases (aggregate/read-model/value/component/capability) map
// to dark semantic tokens so they stay distinct without hardcoded light colors.
// Every other type resolves through the shared typeDescriptor, the same palette
// the Engine view renders from, so a color means the same category everywhere.
// Shared by EmptyLibraryView's Catalog/Index/Workflow tabs and the Notepad's
// thread concern chips.
export function roleStyle(
  type: string | undefined,
  typeMapping: readonly LibraryCatalogTypeMappingEntry[] = [],
): string {
  switch ((type ?? "").toLowerCase()) {
    case "aggregate":
      return AMBER_CHIP_CLASS;
    case "read-model":
      return SUCCESS_CHIP_CLASS;
    case "value":
      return NEUTRAL_CHIP_CLASS;
    case "component":
      return TYPE_DESCRIPTOR_CHIP_CLASSES.Principle;
    case "capability":
      return TYPE_DESCRIPTOR_CHIP_CLASSES.Capability;
    default:
      return classNamesForTypeDescriptor(typeDescriptor(type ?? "", typeMapping));
  }
}

export function threadCountLabel(gapCount: number, hotSpotCount: number): string {
  return `${gapCount} gap${gapCount === 1 ? "" : "s"} / ${hotSpotLabel(hotSpotCount)}`;
}

export function threadEvidenceCountLabel(
  thread: Pick<LibraryCatalogThread, "sourceEvidence">,
): string {
  const count = thread.sourceEvidence?.length ?? 0;
  return count === 0 ? "no evidence" : `${count} ref${count === 1 ? "" : "s"}`;
}

export function threadStatusCounts(
  threads: readonly LibraryCatalogThread[],
): Record<ThreadStatus, number> {
  return threads.reduce<Record<ThreadStatus, number>>(
    (counts, thread) => {
      const status = normalizedThreadStatus(thread.status);
      if (status === "open" || status === "answered" || status === "residual") {
        counts[status] += 1;
      }
      return counts;
    },
    { answered: 0, open: 0, residual: 0 },
  );
}

export function threadStatusSummary(threads: readonly LibraryCatalogThread[]): string {
  const counts = threadStatusCounts(threads);
  return `${counts.open} open · ${counts.answered} answered · ${counts.residual} residual`;
}

// "ready" when every card in the area is fillable and it carries no open gap
// or hot-spot thread; "blocked" otherwise. Areas with zero cards are never
// "ready" (there is nothing filled to certify).
export function readinessAreaState(area: LibraryCatalogFillReadinessArea): string {
  return area.cardCount > 0 &&
    area.fillableCount === area.cardCount &&
    area.gapCount === 0 &&
    area.hotSpotCount === 0
    ? "ready"
    : "blocked";
}

// The badge-count primitive for the Notepad's nav affordance: the open
// thread / hot-spot burndown count, mirroring
// packages/pms/viewer's `notepadBadgeCountForCatalog` count semantics
// (authored threads with no resolution yet). A catalog with no
// `fillReadiness`/`threads` projected counts as 0 — never a crash.
export function notepadBadgeCountForCatalog(catalog: LibraryCatalog): number {
  let open = 0;
  for (const thread of catalog.threads ?? []) {
    if (thread.source === "authored" && thread.resolution == null) {
      open += 1;
    }
  }
  return open;
}
