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
import type { InfoHubBoard, InfoHubCard, MapEntity, MapState } from "../../app/runtime/schemas";
import type { MapStateSaveError } from "../library/hooks/useMapState";
import { withStatus, type WorkOrderStatus } from "../library/infohub/boardModel";
import { MAP_FALLBACK_COLORS } from "./colors";
import { DomainView } from "./DomainView";
import { generateHexGrid, hexToKey, type HexCoord } from "./hex";
import type { HexCellVisualState } from "./HexCell";
import { computeDomainViewLayout } from "./layout/domain-view";
import { buildOwnerViewLayout } from "./layout/owner-view";
import { mapStateGridRadius } from "./map-grid";
import { MapEntityForm } from "./MapEntityForm";
import { MapMessagePanel } from "./MapMessagePanel";
import { MapOverlay, type MapOverlayTarget } from "./MapOverlay";
import { MapScene } from "./MapScene";
import { OwnerViewLayer } from "./OwnerViewLayer";
import { PanelButton, ParchmentActionButton } from "./panel-buttons";
import {
  occupiedHexKeys,
  placeableHexKeys,
  placedEntities as placedEntitiesFrom,
  positionedEntityIds as positionedEntityIdsFrom,
  strayCardCountsByContext,
  unplacedEntities as unplacedEntitiesFrom,
  withEntityCreated,
  withEntityEdited,
  withEntityPlaced,
  withEntityRemoved,
  type MapEntityDraft,
} from "./placement";
import { type MapViewMode, VIEW_MODES } from "./view-mode";
import { isWebGLForcedOff, supportsWebGL } from "./webgl";

export type MapTabViewProps = {
  error: string | null;
  loading: boolean;
  onRefresh: () => void;
  /** Full-document save through the loaded revision; true on success. */
  onSave: (next: MapState) => Promise<boolean>;
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
  boardSaving: boolean;
  /** The EXISTING board save path (useInfoHubBoard.saveCards) — overlay card writes go here. */
  onSaveCards: (cards: readonly InfoHubCard[]) => Promise<InfoHubBoard | null>;
};

/** The entity form's open state: create, or edit a specific entity. */
type EntityFormState = { entityId: string | null };

function entityKindLabel(entity: MapEntity): string {
  return entity.kind === "project" ? "Project" : "System";
}

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
  contextNameById,
  onCreate,
  onEdit,
  onRemove,
  onSelect,
  placingEntityId,
  placedEntities,
  saving,
  unplacedEntities,
}: {
  contextNameById: ReadonlyMap<string, string>;
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
    <div
      className="pointer-events-auto w-64 overflow-hidden rounded border"
      style={{
        backgroundColor: MAP_FALLBACK_COLORS.panel,
        borderColor: MAP_FALLBACK_COLORS.border,
      }}
      data-testid="map-placement-panel"
    >
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
                    · {entityKindLabel(entity)} ·{" "}
                    {contextNameById.get(entity.contextId) ?? entity.contextId}
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
    </div>
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
  boardSaving,
  onSaveCards,
}: MapTabViewProps) {
  const [hasWebGLSupport] = useState(
    () => supportsWebGL() && !isWebGLForcedOff(window.location.search),
  );
  const [viewMode, setViewMode] = useState<MapViewMode>("domain");
  const [placingEntityId, setPlacingEntityId] = useState<string | null>(null);
  const [entityForm, setEntityForm] = useState<EntityFormState | null>(null);
  const [overlayTarget, setOverlayTarget] = useState<MapOverlayTarget | null>(null);

  // Key the grid memo on the derived radius NUMBER, not the state object:
  // every save/refresh produces a new state identity, and regenerating the
  // grid would hand every memoized HexCell a fresh coord identity.
  const gridRadius = state == null ? null : mapStateGridRadius(state);
  const cells = useMemo(
    () => (gridRadius == null ? [] : generateHexGrid(gridRadius)),
    [gridRadius],
  );
  // The real board-derived stray counts (S2, plan §1.3): cards with a
  // contextId, no entityId, and a non-terminal status, per context.
  const strayCardCounts = useMemo(() => strayCardCountsByContext(board?.cards ?? []), [board]);
  const domainLayout = useMemo(
    () => (state == null ? null : computeDomainViewLayout(state, cells, { strayCardCounts })),
    [state, cells, strayCardCounts],
  );
  const ownerLayout = useMemo(() => (state == null ? null : buildOwnerViewLayout(state)), [state]);

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
  const contextNameById = useMemo(
    () => new Map((state?.contexts ?? []).map((context) => [context.id, context.name])),
    [state],
  );

  const placingEntity = useMemo(
    () =>
      placingEntityId == null
        ? null
        : (unplacedEntities.find((entity) => entity.id === placingEntityId) ?? null),
    [placingEntityId, unplacedEntities],
  );

  // The free hexes of the placing entity's context patch.
  const placeableKeys = useMemo(() => {
    if (placingEntity == null || domainLayout == null) {
      return new Set<string>();
    }
    return placeableHexKeys(domainLayout.patchByCellKey, placingEntity.contextId, occupiedKeys);
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
      if (await onSave(withEntityPlaced(state, placingEntity, coord))) {
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

  const submitEntityForm = useCallback(
    async (draft: MapEntityDraft): Promise<boolean> => {
      if (state == null) {
        return false;
      }
      const next =
        entityForm?.entityId == null
          ? withEntityCreated(state, draft).next
          : withEntityEdited(state, entityForm.entityId, draft);
      const saved = await onSave(next);
      if (saved) {
        setEntityForm(null);
      }
      return saved;
    },
    [state, entityForm, onSave],
  );

  const openEntityForm = useCallback((entityId: string | null) => {
    setEntityForm({ entityId });
    setPlacingEntityId(null);
    setOverlayTarget(null);
  }, []);

  // --- Tile/pile overlay (S2): during placement a tile click is just
  // click-away (cancel); otherwise it opens the entity's work overlay.
  const handleTileClick = useCallback(
    (entity: MapEntity) => {
      if (placingEntityId != null) {
        cancelPlacement();
        return;
      }
      setOverlayTarget({ kind: "entity", entityId: entity.id });
    },
    [placingEntityId, cancelPlacement],
  );

  const handlePileClick = useCallback(
    (contextId: string) => {
      if (placingEntityId != null) {
        cancelPlacement();
        return;
      }
      setOverlayTarget({ kind: "pile", contextId });
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
      const nextChecklist = target.checklist.map((item, itemIndex) =>
        itemIndex === index ? { ...item, done: !item.done } : item,
      );
      void onSaveCards(
        board.cards.map((card) =>
          card.id === cardId ? { ...card, checklist: nextChecklist } : card,
        ),
      );
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

  const hudStats =
    viewMode === "domain"
      ? `${state.domains.length} domains · ${state.contexts.length} contexts · ` +
        `${domainLayout?.tiles.length ?? 0} tiles`
      : `${ownerLayout?.territories.length ?? 0} territories · ` +
        `${ownerLayout?.seats.length ?? 0} locked seats`;

  return (
    <div className="relative h-full w-full" data-testid="map-tab">
      <div
        className="pointer-events-none absolute left-4 top-4 z-10 rounded border px-3 py-2"
        style={{
          backgroundColor: MAP_FALLBACK_COLORS.panel,
          borderColor: MAP_FALLBACK_COLORS.border,
        }}
      >
        <p className="text-xs font-semibold" style={{ color: MAP_FALLBACK_COLORS.heading }}>
          Map — {VIEW_MODES.find(({ mode }) => mode === viewMode)!.label}
        </p>
        <p className="mt-0.5 text-[10px]" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
          {hudStats} — wheel zooms, arrow keys pan
        </p>
      </div>

      <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-3">
        <div className="flex items-stretch gap-2">
          <div
            className="flex overflow-hidden rounded border"
            style={{
              backgroundColor: MAP_FALLBACK_COLORS.panel,
              borderColor: MAP_FALLBACK_COLORS.border,
            }}
            role="group"
            aria-label="Map view mode"
          >
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
          </div>
          <div
            className="flex overflow-hidden rounded border"
            style={{
              backgroundColor: MAP_FALLBACK_COLORS.panel,
              borderColor: MAP_FALLBACK_COLORS.border,
            }}
          >
            <PanelButton disabled={loading || saving} label="Refresh" onClick={onRefresh} />
          </div>
        </div>

        {viewMode === "domain" ? (
          entityForm != null ? (
            <div
              className="pointer-events-auto w-64 overflow-hidden rounded border"
              style={{
                backgroundColor: MAP_FALLBACK_COLORS.panel,
                borderColor: MAP_FALLBACK_COLORS.border,
              }}
            >
              <MapEntityForm
                // Remount per target so field state never leaks between
                // "create" and different edited entities.
                key={entityForm.entityId ?? "create"}
                contexts={state.contexts}
                entity={editingEntity}
                onCancel={() => setEntityForm(null)}
                onSubmit={submitEntityForm}
                saving={saving}
              />
            </div>
          ) : (
            <PlacementPanel
              contextNameById={contextNameById}
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

        {/* Full-map fallback of the pile fallback chain: a context whose
            whole domain territory is occupied still shows its stray count
            here instead of silently dropping it (issue #9 carry-over). */}
        {viewMode === "domain" && (domainLayout?.unplacedPiles.length ?? 0) > 0 ? (
          <div
            className="pointer-events-auto w-64 rounded border px-3 py-2"
            data-testid="map-unplaced-piles"
            style={{
              backgroundColor: MAP_FALLBACK_COLORS.panel,
              borderColor: MAP_FALLBACK_COLORS.border,
            }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: MAP_FALLBACK_COLORS.subtext }}
            >
              Piles without a hex
            </p>
            <ul className="mt-1 space-y-1">
              {domainLayout!.unplacedPiles.map((pile) => (
                <li key={pile.contextId}>
                  <button
                    type="button"
                    className="w-full rounded border px-2 py-1 text-left text-[11px]"
                    onClick={() => handlePileClick(pile.contextId)}
                    style={{
                      borderColor: MAP_FALLBACK_COLORS.border,
                      color: MAP_FALLBACK_COLORS.text,
                    }}
                  >
                    {contextNameById.get(pile.contextId) ?? pile.contextId} · {pile.cardCount} loose{" "}
                    {pile.cardCount === 1 ? "card" : "cards"} — no free hex
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Top-center notices: the fixed RavenBench bar owns the viewport
          bottom, so feedback anchors under the stone bar instead. */}
      {saveError != null ? (
        <div
          className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-3 rounded border px-3 py-2"
          style={{
            backgroundColor: MAP_FALLBACK_COLORS.panel,
            borderColor: MAP_FALLBACK_COLORS.border,
          }}
          role="alert"
        >
          <p className="text-xs" style={{ color: MAP_FALLBACK_COLORS.heading }}>
            {saveError.kind === "conflict" ? "The map changed — refresh. " : ""}
            <span style={{ color: MAP_FALLBACK_COLORS.subtext }}>{saveError.message}</span>
          </p>
          {saveError.kind === "conflict" ? (
            <ParchmentActionButton label="Refresh" onClick={onRefresh} />
          ) : null}
        </div>
      ) : null}

      {placingEntity != null && placeableKeys.size === 0 ? (
        <div
          className="absolute left-1/2 top-16 z-10 -translate-x-1/2 rounded border px-3 py-2"
          style={{
            backgroundColor: MAP_FALLBACK_COLORS.panel,
            borderColor: MAP_FALLBACK_COLORS.border,
          }}
        >
          <p className="text-xs" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
            No free hex in {contextNameById.get(placingEntity.contextId) ?? "this context"}&apos;s
            patch — remove a tile or grow the domain first.
          </p>
        </div>
      ) : null}

      <MapScene
        cells={cells}
        cellTintByKey={
          viewMode === "domain" ? domainLayout?.tintByCellKey : ownerLayout?.tintByCellKey
        }
        cellVisualStateByKey={viewMode === "domain" ? cellVisualStateByKey : undefined}
        // Only wired while placing: HexCell shows a pointer cursor for any
        // onClick, and the ground is not clickable outside placement mode.
        onCellClick={viewMode === "domain" && placingEntityId != null ? handleCellClick : undefined}
        onPointerMissed={placingEntityId == null ? undefined : cancelPlacement}
      >
        {viewMode === "domain" && domainLayout != null ? (
          <DomainView
            layout={domainLayout}
            onTileClick={handleTileClick}
            onPileClick={handlePileClick}
          />
        ) : viewMode === "owner" && ownerLayout != null ? (
          <OwnerViewLayer layout={ownerLayout} />
        ) : null}
      </MapScene>

      {overlayTarget != null ? (
        <MapOverlay
          target={overlayTarget}
          state={state}
          cards={board?.cards ?? null}
          boardError={boardError}
          boardSaving={boardSaving}
          onMoveStatus={moveCardStatus}
          onToggleChecklistItem={toggleChecklistItem}
          onEditEntity={(entityId) => openEntityForm(entityId)}
          onClose={() => setOverlayTarget(null)}
        />
      ) : null}
    </div>
  );
}

export default MapTabView;
