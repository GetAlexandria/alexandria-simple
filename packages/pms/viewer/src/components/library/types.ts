// Library graph response contracts are defined once as runtime schemas
// (src/app/runtime/schemas.ts) and re-exported here for component use.
// Keep the schemas aligned with packages/ax/src/domain/library-graph.ts.
export type {
  LibraryCatalog,
  LibraryCatalogArea,
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
  LibraryCatalogThread,
  LibraryCatalogThreadConcern,
  LibraryCatalogThreadResolution,
  LibraryCatalogThreadResolutionState,
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

export type LibraryViewMode =
  | "constellation"
  | "empty"
  | "engine"
  | "folders"
  | "alexandria-back"
  | "pms-back"
  | "pms-drafts";

export type LibraryBrowserView =
  | "agent"
  | "home"
  | "info"
  | "ledger"
  | "library"
  | "playbook"
  | "knowledge-bank"
  | "studio"
  | "vision-onboarding"
  | "not-found";

export type RavenConnectionState = "connected" | "disconnected";

export interface GroupedLibraryCards {
  cards: LibraryGraphCard[];
  subfolder: string;
  territory: string;
}
