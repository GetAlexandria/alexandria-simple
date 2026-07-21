// The Map stone tab's container (S1) — fresh code, not a port of
// Lifebuild's LifeMap: the real `docs/alexandria/map/map-state.json`
// document arrives as props (fetched once + manually refreshed by
// useMapState in LibraryBrowserApp, the Info Hub pattern), is reshaped
// through the existing pure layout modules, and renders through the same
// MapScene surface as the /dev/map harness. Plan §5 ruling 7: both looks
// shipped — the Domain ↔ Owner toggle is a real view mode here.
//
// Placement (director-only, plan §1.1): the side panel lists unplaced
// entities; selecting one highlights the free hexes of its context's patch
// ("placeable" cell overrides through MapScene's cellVisualStateByKey);
// clicking a highlighted hex POSTs the full document with the loaded
// revision. Escape / click-away cancels. Occupied hexes — including
// reserved landmark hexes — are excluded client-side (the server rejects
// them anyway via M1's one-entity-per-hex rule). A 409 conflict surfaces as
// "map changed — refresh", never a silent clobber.
//
// Like MapDevView, this module (and everything it imports, including
// three.js) is only loaded through React.lazy in LibraryBrowserApp.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ColleagueJournal,
  InfoHubBoard,
  InfoHubCard,
  LibraryCatalog,
  MapEntity,
  MapState,
  RuntimeAgent,
} from "../../app/runtime/schemas";
import type { MapStateSaveError } from "../library/hooks/useMapState";
import {
  withChecklistItemToggled,
  withStatus,
  type WorkOrderStatus,
} from "../library/infohub/boardModel";
import { buildDomainNameById } from "../library/infohub/WorkOrderCard";
import { colleagueNeedsHumanCount, resolveColleagueIdentity } from "./colleague-overlay";
import { ColleagueOverlay } from "./ColleagueOverlay";
import { MAP_FALLBACK_COLORS } from "./colors";
import { DomainView } from "./DomainView";
import { generateHexGrid, hexToKey, type HexCoord } from "./hex";
import type { HexCellVisualState } from "./HexCell";
import { buildingLandmarks } from "./landmarks";
import { computeDomainViewLayout } from "./layout/domain-view";
import { computeOwnerViewLayout, groupWorkByAssignee, workItemEntities } from "./layout/owner-view";
import { mapStateGridRadius } from "./map-grid";
import { MapEntityForm } from "./MapEntityForm";
import { MapLandmarks } from "./MapLandmarks";
import { MapMessagePanel } from "./MapMessagePanel";
import { MapLegend } from "./MapLegend";
import { MapOverlay, type MapOverlayTarget } from "./MapOverlay";
import { MapScene } from "./MapScene";
import type { RoomOrigin } from "./MapScrimPanel";
import { Panel, PanelButton, ParchmentActionButton } from "./panel-buttons";
import {
  entityKindLabel,
  occupiedHexKeys,
  placeableHexKeys,
  placedEntities as placedEntitiesFrom,
  positionedEntityIds as positionedEntityIdsFrom,
  strayCardCountsByAssignee,
  strayCardCountsByDomain,
  strayCountsEqual,
  unplacedEntities as unplacedEntitiesFrom,
  withEntityCreated,
  withEntityEdited,
  withEntityPlaced,
  withEntityRemoved,
  type MapEntityDraft,
} from "./placement";
import { RoomOverlay } from "./RoomOverlay";
import { deriveTileSignalsByEntity, tileSignalsByEntityEqual, type TileSignals } from "./signals";
import { type MapViewMode, VIEW_MODES } from "./view-mode";
import type { MapRoomId } from "./vocabulary";
import { isWebGLForcedOff, supportsWebGL } from "./webgl";

// Buildings are the only landmark kind the shipped Map tab renders (Map Glow
// Up declutter — colleague/seat/campfire furniture stays in the coin tray,
// per DomainView's mount comment below); MapLandmarks' onColleagueClick is
// therefore never actually invoked here, but the prop is still required by
// MapLandmarksProps. A real no-op, like MapDevView's own noopColleagueClick.
const noopColleagueClick = (): void => {};

export type MapTabViewProps = {
  error: string | null;
  loading: boolean;
  onRefresh: () => void;
  /** Full-document save through the loaded revision; null on success. */
  onSave: (next: MapState) => Promise<MapStateSaveError | null>;
  saveError: MapStateSaveError | null;
  saving: boolean;
  state: MapState | null;
  /**
   * The Info Hub board (S2): stray piles derive from its cards and the tile
   * overlay lists/edits them. Null while loading or unavailable — the map
   * renders without piles rather than blocking on the board.
   */
  board: InfoHubBoard | null;
  boardError: string | null;
  /** Last board WRITE failure (useInfoHubBoard.saveError) — the overlay renders it. */
  boardSaveError: string | null;
  boardSaving: boolean;
  /** The EXISTING board save path (useInfoHubBoard.saveCards) — overlay card writes go here. */
  onSaveCards: (cards: readonly InfoHubCard[]) => Promise<InfoHubBoard | null>;
  /** Agent roster (name/role) for the colleague overlay's identity line (L2). */
  agents: readonly RuntimeAgent[];
  /**
   * Open the Info Hub board's needs-a-human lane (the whole lane — cards carry
   * no colleague field, so it is not filtered to one colleague; the overlay's
   * count is the colleague-scoped number).
   */
  onOpenNeedsHumanBoard: () => void;
  /** Open a colleague's per-agent page (the bench quick-bar link). */
  onOpenAgentPage: (colleagueId: string) => void;
  /**
   * Colleague duty-loop journals: L1's read-only data path for the system
   * health dots and overdue candle flicker, and (L2) the source the colleague
   * overlay selects the clicked colleague's entries from. Null while loading
   * or unavailable — systems fall back to a neutral health reading (no false
   * flicker) and the overlay reads as "reading journals…".
   */
  journals: readonly ColleagueJournal[] | null;
  /**
   * The library catalog (S2, room dashboards): Strategy Center's Bet/Measure
   * cards and Learning Lab's Experiment/Arc cards both read from here. Null
   * while loading or unavailable on this surface — RoomOverlay reads that as
   * "catalog unavailable", never as "empty catalog".
   */
  catalog: LibraryCatalog | null;
  catalogError: string | null;
  /**
   * Deep-link entry (Map Glow Up): a colleague coin's "Journal" action
   * navigates to /map?colleague=<id>, and LibraryBrowserApp forwards that id
   * here. Opens that colleague's overlay ONCE on mount — the same overlay a
   * landmark click opens — mirroring the board's initialStatusFilter. Undefined
   * (no deep-link) opens nothing; an id with no roster/entity still names itself
   * via resolveColleagueIdentity, exactly as a hand-added landmark does.
   *
   * Applied on mount only: navigating map→map with a NEW `?colleague=` (a second
   * Journal click while already on the Map tab) does not remount, so it does not
   * reopen. That is the same limitation initialStatusFilter carries; in this PR
   * the colleague landmark is still on the map as the alternate entry, and the
   * follow-up that removes colleagues from the map owns closing that gap.
   */
  initialColleagueId?: string;
  /**
   * The system room's "Create upgrade project" (map-upgrade-deeplink): the
   * map surface has no entity-creation form mounted, so this navigates to
   * the Info Hub board with the preset upgrade-project form already open,
   * rather than opening a form in place the way the board room does.
   */
  onCreateUpgradeProject?: (systemId: string, domainId: string) => void;
};

/** The entity form's open state: create, or edit a specific entity. */
type EntityFormState = { entityId: string | null };

/** Small bordered per-row action button (Edit / Remove) in the panel lists. */
function PanelRowButton({
  disabled,
  label,
  onClick,
  testId,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      className="shrink-0 rounded border px-1.5 py-0.5 text-[10px] disabled:opacity-50"
      style={{
        borderColor: MAP_FALLBACK_COLORS.border,
        color: MAP_FALLBACK_COLORS.subtext,
      }}
    >
      {label}
    </button>
  );
}

/**
 * The placement side panel (Domain view only): unplaced entities to select
 * for placement, placed tiles with remove-from-map, and the S2 entity
 * create/edit entry points (New entity, per-row Edit).
 */
function PlacementPanel({
  domainNameById,
  onCreate,
  onEdit,
  onRemove,
  onSelect,
  placingEntityId,
  placedEntities,
  saving,
  unplacedEntities,
}: {
  domainNameById: ReadonlyMap<string, string>;
  onCreate: () => void;
  onEdit: (entityId: string) => void;
  onRemove: (entityId: string) => void;
  onSelect: (entityId: string) => void;
  placingEntityId: string | null;
  placedEntities: readonly MapEntity[];
  saving: boolean;
  unplacedEntities: readonly MapEntity[];
}) {
  return (
    <Panel className="pointer-events-auto w-64 overflow-hidden" testId="map-placement-panel">
      <div className="flex items-start justify-between gap-2 px-3 py-2">
        <div>
          <p className="text-xs font-semibold" style={{ color: MAP_FALLBACK_COLORS.heading }}>
            Placement
          </p>
          <p className="mt-0.5 text-[10px]" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
            {placingEntityId == null
              ? "Pick an unplaced entity, then click a highlighted hex."
              : "Click a highlighted hex to place — Esc or click away to cancel."}
          </p>
        </div>
        <PanelRowButton
          disabled={saving}
          label="New entity"
          onClick={onCreate}
          testId="map-new-entity"
        />
      </div>

      <div className="border-t px-3 py-2" style={{ borderColor: MAP_FALLBACK_COLORS.border }}>
        <p
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: MAP_FALLBACK_COLORS.subtext }}
        >
          Unplaced
        </p>
        {unplacedEntities.length === 0 ? (
          <p className="mt-1 text-[11px]" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
            Everything is on the map.
          </p>
        ) : (
          <ul className="mt-1 space-y-1">
            {unplacedEntities.map((entity) => (
              <li key={entity.id} className="flex items-center gap-1">
                <button
                  type="button"
                  aria-pressed={placingEntityId === entity.id}
                  disabled={saving}
                  onClick={() => onSelect(entity.id)}
                  className="min-w-0 flex-1 rounded border px-2 py-1 text-left text-[11px] disabled:opacity-50"
                  style={
                    placingEntityId === entity.id
                      ? {
                          backgroundColor: MAP_FALLBACK_COLORS.border,
                          borderColor: MAP_FALLBACK_COLORS.border,
                          color: MAP_FALLBACK_COLORS.heading,
                          fontWeight: 600,
                        }
                      : {
                          borderColor: MAP_FALLBACK_COLORS.border,
                          color: MAP_FALLBACK_COLORS.text,
                        }
                  }
                >
                  {entity.name}
                  <span className="ml-1 opacity-70">
                    · {entityKindLabel(entity.kind)} ·{" "}
                    {domainNameById.get(entity.domainId) ?? entity.domainId}
                  </span>
                </button>
                <PanelRowButton
                  disabled={saving}
                  label="Edit"
                  onClick={() => onEdit(entity.id)}
                  testId={`map-edit-entity-${entity.id}`}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t px-3 py-2" style={{ borderColor: MAP_FALLBACK_COLORS.border }}>
        <p
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: MAP_FALLBACK_COLORS.subtext }}
        >
          On the map
        </p>
        {placedEntities.length === 0 ? (
          <p className="mt-1 text-[11px]" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
            No tiles placed yet.
          </p>
        ) : (
          <ul className="mt-1 space-y-1">
            {placedEntities.map((entity) => (
              <li
                key={entity.id}
                className="flex items-center justify-between gap-2 text-[11px]"
                style={{ color: MAP_FALLBACK_COLORS.text }}
              >
                <span className="truncate">
                  {entity.name}
                  {entity.kind === "system" && entity.lifecycle === "uprooted" ? (
                    // A hand-edited/unconditional write can leave an
                    // uprooted system with a stored position: it renders no
                    // tile but still occupies its hex. Name the dead spot so
                    // Remove is the visible remedy.
                    <span className="opacity-70"> · uprooted — not rendered</span>
                  ) : null}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <PanelRowButton
                    disabled={saving}
                    label="Edit"
                    onClick={() => onEdit(entity.id)}
                    testId={`map-edit-entity-${entity.id}`}
                  />
                  <PanelRowButton
                    disabled={saving}
                    label="Remove"
                    onClick={() => onRemove(entity.id)}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}

export function MapTabView({
  error,
  loading,
  onRefresh,
  onSave,
  saveError,
  saving,
  state,
  board,
  boardError,
  boardSaveError,
  boardSaving,
  onSaveCards,
  agents,
  onOpenNeedsHumanBoard,
  onOpenAgentPage,
  journals,
  catalog,
  catalogError,
  initialColleagueId,
  onCreateUpgradeProject,
}: MapTabViewProps) {
  const [hasWebGLSupport] = useState(
    () => supportsWebGL() && !isWebGLForcedOff(window.location.search),
  );
  const [viewMode, setViewMode] = useState<MapViewMode>("domain");
  const [placingEntityId, setPlacingEntityId] = useState<string | null>(null);
  const [entityForm, setEntityForm] = useState<EntityFormState | null>(null);
  const [overlayTarget, setOverlayTarget] = useState<MapOverlayTarget | null>(null);
  // The last pointerdown's viewport position, captured on the tab root: tile
  // clicks arrive through three.js raycasting with no DOM event to read, so
  // the room overlay's grow-from-hex origin is snapshotted here instead.
  const lastPointerRef = useRef<RoomOrigin | null>(null);
  const [overlayOrigin, setOverlayOrigin] = useState<RoomOrigin | null>(null);
  // The open colleague landmark overlay (L2), by bare colleague id, or null.
  // Seeded once from the `?colleague=` deep-link (Map Glow Up) — the colleague
  // coin's "Journal" action — so the Map tab mounts with that overlay already
  // open; see the initialColleagueId prop doc.
  const [openColleagueId, setOpenColleagueId] = useState<string | null>(() =>
    initialColleagueId != null && initialColleagueId.length > 0 ? initialColleagueId : null,
  );
  // The open room overlay (S1, Strategy Center / Learning Lab): parallel to
  // openColleagueId, but with its OWN grow-from-hex origin rather than
  // reusing overlayOrigin — a room is a third overlay slot alongside the
  // tile/pile MapOverlay and the colleague overlay, not a repaint of either,
  // so it needs its own origin snapshot to grow from its own clicked
  // building rather than whatever hex a DIFFERENT overlay last opened from.
  const [openRoomId, setOpenRoomId] = useState<MapRoomId | null>(null);
  const [roomOrigin, setRoomOrigin] = useState<RoomOrigin | null>(null);

  // Key the grid memo on the derived radius NUMBER, not the state object:
  // every save/refresh produces a new state identity, and regenerating the
  // grid would hand every memoized HexCell a fresh coord identity.
  const gridRadius = state == null ? null : mapStateGridRadius(state);
  const cells = useMemo(
    () => (gridRadius == null ? [] : generateHexGrid(gridRadius)),
    [gridRadius],
  );
  // The real board-derived stray counts (strays v1, plan §1.3): board cards
  // with no entityId and a non-terminal status, bucketed by their required
  // domainId (a card with no contextId still counts, in its domain).
  //
  // Held at a stable identity across board writes that don't change any pile
  // count: every card write (checklist toggle, status move) mints a new board
  // object, but only a change to the actual stray counts should re-run the
  // expensive domain-view layout below. Reuse the previous value whenever the
  // recomputed counts are value-equal so `domainLayout`'s memo stays warm.
  const strayCountsRef = useRef<Readonly<Record<string, number>> | null>(null);
  const strayCardCounts = useMemo(() => {
    const next = strayCardCountsByDomain(board?.cards ?? []);
    const previous = strayCountsRef.current;
    if (previous != null && strayCountsEqual(previous, next)) {
      return previous;
    }
    strayCountsRef.current = next;
    return next;
  }, [board]);
  const domainLayout = useMemo(
    () => (state == null ? null : computeDomainViewLayout(state, cells, { strayCardCounts })),
    [state, cells, strayCardCounts],
  );

  // Owner view is NOT a relabeled Domain view: it regroups the SAME work — the
  // project/system tiles and the stray Task-card piles — by each item's
  // `assignee`, giving every assignee a computed territory and the unassigned
  // work its own region (layout/owner-view.ts). Its stray piles are counted by
  // assignee, held at a stable identity across board writes that don't change
  // any pile size — same trick as the domain counts above — so a signal-
  // irrelevant board write keeps the owner-layout memo warm.
  const assigneeStrayCountsRef = useRef<Readonly<Record<string, number>> | null>(null);
  const strayCardCountsByAssigneeValue = useMemo(() => {
    const next = strayCardCountsByAssignee(board?.cards ?? []);
    const previous = assigneeStrayCountsRef.current;
    if (previous != null && strayCountsEqual(previous, next)) {
      return previous;
    }
    assigneeStrayCountsRef.current = next;
    return next;
  }, [board]);
  const ownerLayout = useMemo(
    () =>
      state == null
        ? null
        : computeOwnerViewLayout(state, cells, {
            strayCardCounts: strayCardCountsByAssigneeValue,
          }),
    [state, cells, strayCardCountsByAssigneeValue],
  );
  // The ordered assignee buckets behind the owner layout — the HUD counts these
  // (assignee territories, and whether an unassigned region is present).
  const ownerBuckets = useMemo(
    () =>
      state == null
        ? []
        : groupWorkByAssignee(workItemEntities(state), strayCardCountsByAssigneeValue),
    [state, strayCardCountsByAssigneeValue],
  );

  // The clicked colleague's overlay inputs (L2): identity, needs-a-human count,
  // and journal entries SELECTED from the shared journals feed (L1's
  // useColleagueJournals, already fetched on the map surface) — no second
  // fetch. `entries` is null while journals load or are unavailable (the
  // overlay reads that as "reading journals…"), and [] when the colleague has
  // no journal file yet.
  const openColleagueIdentity =
    openColleagueId == null ? null : resolveColleagueIdentity(openColleagueId, agents);
  const openColleagueNeedsHuman =
    openColleagueId == null || state == null
      ? 0
      : colleagueNeedsHumanCount(state, board?.cards ?? [], openColleagueId);
  const openColleagueEntries = useMemo(() => {
    if (openColleagueId == null || journals == null) {
      return null;
    }
    return journals.find((journal) => journal.colleague === openColleagueId)?.entries ?? [];
  }, [openColleagueId, journals]);

  // The four ambient signals (L1, plan §1.4), derived at read time — never
  // stored. needs-a-human and staleness read the board cards already fetched;
  // system health and overdue read the colleague journals. `Date.now()` at
  // derivation is the reference for the day/cadence-window math (fetch-once, so
  // "now" at load is the read time the plan specifies). Recomputed whenever the
  // map state, board, or journals change; empty until state loads.
  //
  // Held at a stable identity across a board/journal refresh that leaves every
  // entity's signals unchanged — same rationale and shape as strayCardCounts
  // above: reuse the previous map whenever the recomputed one is value-equal
  // (tileSignalsByEntityEqual), so a signal-irrelevant board write (e.g. a
  // checklist toggle) doesn't hand every tile a fresh signals object.
  const signalsRef = useRef<Map<string, TileSignals> | null>(null);
  const signalsByEntityId = useMemo(() => {
    const next = deriveTileSignalsByEntity({
      entities: state?.entities ?? [],
      cards: board?.cards ?? [],
      journals,
      nowMs: Date.now(),
    });
    const previous = signalsRef.current;
    if (previous != null && tileSignalsByEntityEqual(previous, next)) {
      return previous;
    }
    signalsRef.current = next;
    return next;
  }, [state, board, journals]);

  // The building landmarks Domain view renders (S1): buildingLandmarks
  // already filters mapLandmarks' output down to building-kind entries, so
  // the colleague/seat/campfire furniture the Map Glow Up moved off the map
  // never comes back here — see the DomainView mount comment below.
  const buildingLandmarksList = useMemo(
    () => (state == null ? [] : buildingLandmarks(state)),
    [state],
  );

  // Every stored position occupies its hex — entity tiles and landmark
  // hexes alike (landmark hexes are the reserved ones, plan §1.3).
  const occupiedKeys = useMemo(
    () => (state == null ? new Set<string>() : occupiedHexKeys(state)),
    [state],
  );
  const positionedEntityIds = useMemo(
    () => (state == null ? new Set<string>() : positionedEntityIdsFrom(state)),
    [state],
  );

  const unplacedEntities = useMemo(
    () => (state == null ? [] : unplacedEntitiesFrom(state, positionedEntityIds)),
    [state, positionedEntityIds],
  );
  const placedEntities = useMemo(
    () => (state == null ? [] : placedEntitiesFrom(state, positionedEntityIds)),
    [state, positionedEntityIds],
  );
  // Domain id → name for the placement panel, the domain-keyed stray piles'
  // fallback panel (strays v1), and the "no free hex" message — placement is
  // domain-keyed now, so entity labels speak domain rather than context.
  const domainNameById = useMemo(() => buildDomainNameById(state?.domains ?? []), [state]);

  const placingEntity = useMemo(
    () =>
      placingEntityId == null
        ? null
        : (unplacedEntities.find((entity) => entity.id === placingEntityId) ?? null),
    [placingEntityId, unplacedEntities],
  );

  // The free hexes of the placing entity's DOMAIN territory (not its context
  // patch — an entity with no contextId must still be placeable, and one
  // with a legacy contextId places exactly the same way, domain-keyed).
  // Stray-pile hexes are excluded explicitly: piles are derived, never
  // positioned, so they don't appear in occupiedKeys — but a tile dropped on
  // a pile's hex would collide with the pile sprite and hide the stray work.
  // (Context-patch keying used to exclude them by accident; domain keying
  // must do it on purpose.)
  const placeableKeys = useMemo(() => {
    if (placingEntity == null || domainLayout == null) {
      return new Set<string>();
    }
    const excludedKeys = new Set(occupiedKeys);
    for (const pile of domainLayout.piles) {
      excludedKeys.add(hexToKey(pile.coord));
    }
    return placeableHexKeys(domainLayout.territoryByCellKey, placingEntity.domainId, excludedKeys);
  }, [placingEntity, domainLayout, occupiedKeys]);

  const cellVisualStateByKey = useMemo(() => {
    if (placeableKeys.size === 0) {
      return undefined;
    }
    const byKey = new Map<string, HexCellVisualState>();
    for (const key of placeableKeys) {
      byKey.set(key, "placeable");
    }
    return byKey;
  }, [placeableKeys]);

  const cancelPlacement = useCallback(() => {
    setPlacingEntityId(null);
  }, []);

  useEffect(() => {
    if (placingEntityId == null) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelPlacement();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [placingEntityId, cancelPlacement]);

  const placeAt = useCallback(
    async (coord: HexCoord) => {
      if (state == null || placingEntity == null) {
        return;
      }
      if ((await onSave(withEntityPlaced(state, placingEntity, coord))) == null) {
        setPlacingEntityId(null);
      }
    },
    [state, placingEntity, onSave],
  );

  // Stable identity: this handler reaches every memoized HexCell, so it
  // reads the live placement inputs through a ref instead of re-binding
  // (and re-rendering the whole grid) on each selection/saving flip.
  const placementClickInputs = useRef({ placingEntityId, saving, placeableKeys, placeAt });
  placementClickInputs.current = { placingEntityId, saving, placeableKeys, placeAt };
  const handleCellClick = useCallback(
    (coord: HexCoord) => {
      const current = placementClickInputs.current;
      if (current.placingEntityId == null) {
        return;
      }
      if (current.saving) {
        // Mid-save (e.g. a double-click): ignore the click rather than
        // cancel — the selection and highlights survive a slow POST or 409.
        return;
      }
      if (current.placeableKeys.has(hexToKey(coord))) {
        void current.placeAt(coord);
        return;
      }
      // Clicking any non-placeable ground cancels (spec: click-away).
      cancelPlacement();
    },
    [cancelPlacement],
  );

  const removeFromMap = useCallback(
    (entityId: string) => {
      if (state == null || saving) {
        return;
      }
      void onSave(withEntityRemoved(state, entityId));
    },
    [state, saving, onSave],
  );

  // --- Entity create/edit (S2): document construction in placement.ts,
  // saved through the same revision-guarded onSave as placement.
  const editingEntity = useMemo(
    () =>
      entityForm?.entityId == null
        ? null
        : (state?.entities.find((entity) => entity.id === entityForm.entityId) ?? null),
    [entityForm, state],
  );

  // If the edited entity vanishes from the loaded state while the form is
  // open (e.g. a refresh after an external delete), close the form with a
  // notice instead of letting a submit route to a silent no-op edit
  // (PR #20 review gate).
  const [entityGoneNotice, setEntityGoneNotice] = useState<string | null>(null);
  useEffect(() => {
    if (state != null && entityForm?.entityId != null && editingEntity == null) {
      setEntityForm(null);
      setEntityGoneNotice(
        `Entity "${entityForm.entityId}" is no longer in the map state — it may have been removed elsewhere.`,
      );
    }
  }, [state, entityForm, editingEntity]);

  const submitEntityForm = useCallback(
    async (draft: MapEntityDraft): Promise<boolean> => {
      if (state == null) {
        return false;
      }
      if (entityForm?.entityId != null && editingEntity == null) {
        // Belt and braces alongside the effect above: never submit an edit
        // for an entity the loaded document no longer contains.
        return false;
      }
      const next =
        entityForm?.entityId == null
          ? withEntityCreated(state, draft).next
          : withEntityEdited(state, entityForm.entityId, draft);
      if ((await onSave(next)) != null) {
        return false;
      }
      setEntityForm(null);
      return true;
    },
    [state, entityForm, editingEntity, onSave],
  );

  const openEntityForm = useCallback((entityId: string | null) => {
    setEntityForm({ entityId });
    setEntityGoneNotice(null);
    setPlacingEntityId(null);
    setOverlayTarget(null);
    setOpenColleagueId(null);
    setOpenRoomId(null);
  }, []);

  // --- Tile/pile overlay (S2): a tile or pile click opens that target's work
  // overlay. During placement a tile click is instead click-away (cancel);
  // piles are raycast-inert while placing (onPileClick is withheld below), so
  // only tile clicks reach this cancel path.
  const openOverlay = useCallback(
    (target: MapOverlayTarget) => {
      if (placingEntityId != null) {
        cancelPlacement();
        return;
      }
      setOpenColleagueId(null);
      setOpenRoomId(null);
      setOverlayOrigin(lastPointerRef.current);
      setOverlayTarget(target);
    },
    [placingEntityId, cancelPlacement],
  );

  // --- Room overlay (S1): a building click opens its room, closing whatever
  // OTHER overlay was open (mirroring openOverlay's own closes) — the three
  // overlay kinds (tile/pile, colleague, room) are mutually exclusive on this
  // surface. During placement a building click is click-away (cancel), same
  // as a tile click.
  const openRoom = useCallback(
    (roomId: MapRoomId) => {
      if (placingEntityId != null) {
        cancelPlacement();
        return;
      }
      setOverlayTarget(null);
      setOpenColleagueId(null);
      setRoomOrigin(lastPointerRef.current);
      setOpenRoomId(roomId);
    },
    [placingEntityId, cancelPlacement],
  );

  // --- Overlay card writes: the EXISTING board save path (the same
  // full-known-set POST the Info Hub board makes; the server merges by id).
  const moveCardStatus = useCallback(
    (cardId: string, status: WorkOrderStatus) => {
      if (board == null) {
        return;
      }
      void onSaveCards(
        board.cards.map((card) => (card.id === cardId ? withStatus(card, status) : card)),
      );
    },
    [board, onSaveCards],
  );

  const toggleChecklistItem = useCallback(
    (cardId: string, index: number) => {
      const target = board?.cards.find((card) => card.id === cardId);
      if (board == null || target?.checklist == null) {
        return;
      }
      const nextCard = withChecklistItemToggled(target, index);
      void onSaveCards(board.cards.map((card) => (card.id === cardId ? nextCard : card)));
    },
    [board, onSaveCards],
  );

  if (!hasWebGLSupport) {
    return (
      <MapMessagePanel
        fill
        title="The map can't render here"
        subtext="WebGL is required to render the map."
      />
    );
  }

  if (state == null) {
    if (loading) {
      return (
        <MapMessagePanel
          fill
          title="Loading the map"
          subtext="Reading docs/alexandria/map/map-state.json…"
        />
      );
    }
    return (
      <MapMessagePanel
        fill
        title="The map state couldn't load"
        subtext={error ?? "Unknown error."}
        action={<ParchmentActionButton className="mt-2" label="Retry" onClick={onRefresh} />}
      />
    );
  }

  if (state.domains.length === 0) {
    return (
      <MapMessagePanel
        fill
        title="The map has no domains yet"
        subtext="Seed domains, contexts, and entities in docs/alexandria/map/map-state.json (the shape is documented in docs/alexandria/plans/map-tab/plan.md §1.3), then refresh."
        action={<ParchmentActionButton className="mt-2" label="Refresh" onClick={onRefresh} />}
      />
    );
  }

  // Owner view regroups the same work by assignee; its HUD counts the assignee
  // territories and their tiles (and flags an unassigned region), where Domain
  // view counts domains and contexts.
  const assigneeTerritoryCount = ownerBuckets.filter((bucket) => bucket.assigned).length;
  const hasUnassignedRegion = ownerBuckets.some((bucket) => !bucket.assigned);
  const hudStats =
    viewMode === "domain"
      ? `${state.domains.length} domains · ${state.contexts.length} contexts · ` +
        `${domainLayout?.tiles.length ?? 0} tiles`
      : `${assigneeTerritoryCount} ${assigneeTerritoryCount === 1 ? "assignee" : "assignees"} · ` +
        `${ownerLayout?.tiles.length ?? 0} tiles${hasUnassignedRegion ? " · unassigned region" : ""}`;

  return (
    <div
      className="relative h-full w-full"
      data-testid="map-tab"
      onPointerDownCapture={(event) => {
        lastPointerRef.current = { x: event.clientX, y: event.clientY };
      }}
    >
      <Panel className="pointer-events-none absolute left-4 top-4 z-10 px-3 py-2">
        <p className="text-xs font-semibold" style={{ color: MAP_FALLBACK_COLORS.heading }}>
          Map — {VIEW_MODES.find(({ mode }) => mode === viewMode)!.label}
        </p>
        <p className="mt-0.5 text-[10px]" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
          {hudStats} — wheel zooms, arrow keys pan
        </p>
      </Panel>

      <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-3">
        <div className="flex items-stretch gap-2">
          <Panel className="flex overflow-hidden" role="group" ariaLabel="Map view mode">
            {VIEW_MODES.map(({ mode, label }) => (
              <PanelButton
                key={mode}
                active={viewMode === mode}
                label={label}
                onClick={() => {
                  setViewMode(mode);
                  cancelPlacement();
                }}
              />
            ))}
          </Panel>
          <Panel className="flex overflow-hidden">
            <PanelButton disabled={loading || saving} label="Refresh" onClick={onRefresh} />
          </Panel>
        </div>

        {viewMode === "domain" ? (
          entityForm != null ? (
            <Panel className="pointer-events-auto w-64 overflow-hidden">
              <MapEntityForm
                // Remount per target so field state never leaks between
                // "create" and different edited entities.
                key={entityForm.entityId ?? "create"}
                contexts={state.contexts}
                domains={state.domains}
                entity={editingEntity}
                entities={state.entities}
                onCancel={() => setEntityForm(null)}
                onSubmit={submitEntityForm}
                saving={saving}
              />
            </Panel>
          ) : (
            <PlacementPanel
              domainNameById={domainNameById}
              onCreate={() => openEntityForm(null)}
              onEdit={(entityId) => openEntityForm(entityId)}
              onRemove={removeFromMap}
              onSelect={(entityId) =>
                setPlacingEntityId((current) => (current === entityId ? null : entityId))
              }
              placingEntityId={placingEntityId}
              placedEntities={placedEntities}
              saving={saving}
              unplacedEntities={unplacedEntities}
            />
          )
        ) : null}

        {/* Full-map fallback of the pile fallback chain: a domain whose whole
            territory is occupied still shows its stray count here instead of
            silently dropping it (issue #9 carry-over). */}
        {viewMode === "domain" && (domainLayout?.unplacedPiles.length ?? 0) > 0 ? (
          <Panel className="pointer-events-auto w-64 px-3 py-2" testId="map-unplaced-piles">
            <p
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: MAP_FALLBACK_COLORS.subtext }}
            >
              Piles without a hex
            </p>
            <ul className="mt-1 space-y-1">
              {domainLayout!.unplacedPiles.map((pile) => (
                <li key={pile.domainId}>
                  <button
                    type="button"
                    className="w-full rounded border px-2 py-1 text-left text-[11px]"
                    onClick={() => openOverlay({ kind: "pile", domainId: pile.domainId })}
                    style={{
                      borderColor: MAP_FALLBACK_COLORS.border,
                      color: MAP_FALLBACK_COLORS.text,
                    }}
                  >
                    {domainNameById.get(pile.domainId) ?? pile.domainId} · {pile.cardCount} loose{" "}
                    {pile.cardCount === 1 ? "card" : "cards"} — no free hex
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}
      </div>

      {/* Top-center notices: the fixed RavenBench bar owns the viewport
          bottom, so feedback anchors under the stone bar instead. */}
      {saveError != null ? (
        <Panel
          className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-3 px-3 py-2"
          role="alert"
        >
          <p className="text-xs" style={{ color: MAP_FALLBACK_COLORS.heading }}>
            {saveError.kind === "conflict" ? "The map changed — refresh. " : ""}
            <span style={{ color: MAP_FALLBACK_COLORS.subtext }}>{saveError.message}</span>
          </p>
          {saveError.kind === "conflict" ? (
            <ParchmentActionButton label="Refresh" onClick={onRefresh} />
          ) : null}
        </Panel>
      ) : null}

      {entityGoneNotice != null ? (
        <Panel
          className="absolute left-1/2 top-16 z-10 flex -translate-x-1/2 items-center gap-3 px-3 py-2"
          role="alert"
          testId="map-entity-gone-notice"
        >
          <p className="text-xs" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
            {entityGoneNotice}
          </p>
          <ParchmentActionButton label="Dismiss" onClick={() => setEntityGoneNotice(null)} />
        </Panel>
      ) : null}

      {placingEntity != null && placeableKeys.size === 0 ? (
        <Panel className="absolute left-1/2 top-16 z-10 -translate-x-1/2 px-3 py-2">
          <p className="text-xs" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
            No free hex in {domainNameById.get(placingEntity.domainId) ?? "this domain"}&apos;s
            territory — remove a tile or grow the domain first.
          </p>
        </Panel>
      ) : null}

      <MapScene
        cells={cells}
        // Each view paints its own territory wash: Domain view's domain/patch
        // washes, or Owner view's per-assignee territory washes.
        cellTintByKey={
          viewMode === "owner" ? ownerLayout?.tintByCellKey : domainLayout?.tintByCellKey
        }
        cellVisualStateByKey={viewMode === "domain" ? cellVisualStateByKey : undefined}
        // Only wired while placing: HexCell shows a pointer cursor for any
        // onClick, and the ground is not clickable outside placement mode.
        onCellClick={viewMode === "domain" && placingEntityId != null ? handleCellClick : undefined}
        onPointerMissed={placingEntityId == null ? undefined : cancelPlacement}
      >
        {viewMode === "domain" && domainLayout != null ? (
          <>
            {/* Work-geography, plus room buildings only (Map Glow Up
                declutter, S1 addendum): the colleague-building / campfire /
                locked-seat landmark row still renders in neither view —
                colleagues stay in the coin tray — but buildingLandmarksList
                (landmarks.ts' buildingLandmarks) is new furniture the
                declutter never touched, so it renders here. */}
            <DomainView
              layout={domainLayout}
              signalsByEntityId={signalsByEntityId}
              onTileClick={(entity) => openOverlay({ kind: "entity", entityId: entity.id })}
              // Undefined during placement: a pile by construction sits on a
              // free (placeable) patch cell, and a clickable sprite would
              // swallow the placement click (stopPropagation) and cancel the
              // mode. With no onClick the sprite reverts to raycast-inert, so
              // clicks and hover pass through to the cell (PR #20 gate).
              onPileClick={
                placingEntityId == null
                  ? (domainId) => openOverlay({ kind: "pile", domainId })
                  : undefined
              }
            />
            <MapLandmarks
              landmarks={buildingLandmarksList}
              onColleagueClick={noopColleagueClick}
              onBuildingClick={openRoom}
            />
          </>
        ) : viewMode === "owner" && ownerLayout != null ? (
          // Owner view = the same work regrouped by assignee: each assignee's
          // tiles and stray pile in that assignee's computed territory, the
          // unassigned work in its own visibly-unclaimed region. Read-only — no
          // ambient signals or click overlays, no context patches — rendered
          // through DomainView's primitives with the brass region labels.
          <DomainView layout={ownerLayout} />
        ) : null}
      </MapScene>

      {/* Signal legend (L1): small, collapsed by default. Scoped to Domain
          view — that is where the signals ride the tiles; Owner view reuses the
          same layout without signals, so it carries none of the four treatments
          and the legend would claim states nothing shows. */}
      {viewMode === "domain" ? <MapLegend /> : null}

      {overlayTarget != null ? (
        <MapOverlay
          target={overlayTarget}
          state={state}
          origin={overlayOrigin}
          cards={board?.cards ?? null}
          boardError={boardError}
          boardSaveError={boardSaveError}
          boardSaving={boardSaving}
          onMoveStatus={moveCardStatus}
          onToggleChecklistItem={toggleChecklistItem}
          onCreateUpgradeProject={onCreateUpgradeProject}
          onEditEntity={(entityId) => openEntityForm(entityId)}
          onClose={() => setOverlayTarget(null)}
          onOpenEntity={(entityId) => openOverlay({ kind: "entity", entityId })}
        />
      ) : null}

      {openColleagueId != null && openColleagueIdentity != null ? (
        <ColleagueOverlay
          identity={openColleagueIdentity}
          entries={openColleagueEntries}
          needsHumanCount={openColleagueNeedsHuman}
          onOpenAgentPage={() => onOpenAgentPage(openColleagueId)}
          onOpenBoard={onOpenNeedsHumanBoard}
          onClose={() => setOpenColleagueId(null)}
        />
      ) : null}

      {openRoomId != null ? (
        <RoomOverlay
          roomId={openRoomId}
          agents={agents}
          origin={roomOrigin}
          catalog={catalog}
          catalogError={catalogError}
          state={state}
          board={board}
          onOpenAgentPage={onOpenAgentPage}
          onClose={() => setOpenRoomId(null)}
        />
      ) : null}
    </div>
  );
}

export default MapTabView;
