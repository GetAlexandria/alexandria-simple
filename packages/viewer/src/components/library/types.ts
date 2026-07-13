// Library graph response contracts are defined once as runtime schemas
// (src/app/runtime/schemas.ts) and re-exported here for component use.
// Keep the schemas aligned with packages/ax/src/domain/library-graph.ts.
export type {
  LibraryCatalog,
  LibraryCatalogArea,
  LibraryCatalogBetRisk,
  LibraryCatalogCard,
  LibraryCatalogConfidence,
  LibraryCatalogDiagram,
  LibraryCatalogDiagramConnector,
  LibraryCatalogDraftInvalidPatch,
  LibraryCatalogDraftContainerMappingEntry,
  LibraryCatalogDraftKeystoneDraft,
  LibraryCatalogDraftOverlay,
  LibraryCatalogDraftRulingEntry,
  LibraryCatalogDraftSectionConfirmation,
  LibraryCatalogDraftTrailEntry,
  LibraryCatalogDraftUnresolvedUpdate,
  LibraryCatalogEdge,
  LibraryCatalogFillReadiness,
  LibraryCatalogFillReadinessArea,
  LibraryCatalogFillReadinessCard,
  LibraryCatalogGate,
  LibraryCatalogGap,
  LibraryCatalogLinks,
  LibraryCatalogProvenance,
  LibraryCatalogStoryBuckets,
  LibraryCatalogTagNote,
  LibraryCatalogThread,
  LibraryCatalogThreadConcern,
  LibraryCatalogTypeMappingDisposition,
  LibraryCatalogTypeMappingEntry,
  LibraryCatalogWorkflow,
  LibraryCatalogWorkflowStep,
  LibraryCardDetail,
  LibraryConfirmationEdit,
  LibraryConfirmationEditKind,
  LibraryGraph,
  LibraryGraphCard,
  LibraryGraphEdge,
  LibraryGraphMeta,
  LibraryPlane,
} from "../../app/runtime/schemas";

import type { LibraryGraphCard } from "../../app/runtime/schemas";
import type { LibraryModeId } from "./viewer-routes";

// The full mode set (and its section membership) is the single source of
// truth in viewer-routes.ts; LibraryViewMode is kept as the public alias
// components import, so adding a mode there without a section still fails
// to compile everywhere this type is used.
export type LibraryViewMode = LibraryModeId;

export type LibraryBrowserView =
  | "agent"
  | "home"
  | "info"
  | "ledger"
  | "library"
  | "map"
  | "playbook"
  | "knowledge-bank"
  | "vision-onboarding"
  | "dev-map"
  | "not-found";

export type RavenConnectionState = "connected" | "disconnected";

export interface GroupedLibraryCards {
  cards: LibraryGraphCard[];
  subfolder: string;
  territory: string;
}
