// The Map tab's work overlay (S2, plan §1.1 — Lifebuild's overlay grammar):
// clicking a tile opens the work behind it while the map stays mounted and
// dimmed underneath; clicking a stray pile opens the context's loose cards.
// Cards render through the SAME components as the Info Hub board
// (WorkOrderCard.tsx) and every card write flows through the existing board
// save path handed down from the container — the overlay is a lens over
// docs/alexandria/info-hub/board-state.json, never a second store.
//
// Completed projects open read-only ("victories stay visible"): the tile
// stays clickable and its history readable, but status buttons and
// checklist toggles are withheld.

import { useEffect, useMemo, useState } from "react";
import type { InfoHubCard, MapState } from "../../app/runtime/schemas";
import { sortCardsByPriority, type WorkOrderStatus } from "../library/infohub/boardModel";
import { EntityRoomBody, isEntityRoomReadOnly } from "../library/infohub/EntityRoomBody";
import {
  buildDomainNameById,
  WorkOrderCardFace,
  WorkOrderDetailModal,
  WorkOrderStatusActions,
} from "../library/infohub/WorkOrderCard";
import { MAP_ROOM_COLORS } from "./colors";
import { MapScrimPanel, type RoomOrigin } from "./MapScrimPanel";
import { RoomActionButton } from "./panel-buttons";
import { entityKindLabel, looseCardsForDomain } from "./placement";

export type MapOverlayTarget =
  | { kind: "entity"; entityId: string }
  | { kind: "pile"; domainId: string };

type MapOverlayProps = {
  target: MapOverlayTarget;
  state: MapState;
  /**
   * The opening click's viewport position — the room shell grows from the
   * clicked tile/pile instead of fading in from nowhere. Null when there is
   * no opening click to anchor to.
   */
  origin?: RoomOrigin | null;
  /** Board cards, or null while the board is unavailable on this surface. */
  cards: readonly InfoHubCard[] | null;
  boardError: string | null;
  /** Last board write failure — a status/checklist click must not fail silently. */
  boardSaveError: string | null;
  boardSaving: boolean;
  onMoveStatus: (cardId: string, status: WorkOrderStatus) => void;
  onToggleChecklistItem: (cardId: string, index: number) => void;
  onEditEntity: (entityId: string) => void;
  onClose: () => void;
  /**
   * System room upgrade-queue project links (work-system plan §3):
   * re-targets this same overlay at another entity's room.
   */
  onOpenEntity?: (entityId: string) => void;
  /**
   * System room's "Create upgrade project" (map-upgrade-deeplink): the map
   * surface has no entity-creation form mounted to hand a preset to, so
   * instead of opening a form in place (the board room's behavior) this
   * navigates to the Info Hub board with the preset upgrade-project form
   * already open — see LibraryBrowserApp's `?upgrade=<systemId>` wiring.
   */
  onCreateUpgradeProject?: (systemId: string, domainId: string) => void;
};

/** `contextName` null → the entity has no context (latent data) — the segment is omitted, never "undefined". */
function entityMetaLine(
  kind: "project" | "system",
  lifecycle: string,
  contextName: string | null,
): string {
  return contextName == null
    ? `${entityKindLabel(kind)} · ${lifecycle}`
    : `${entityKindLabel(kind)} · ${lifecycle} · ${contextName}`;
}

export function MapOverlay({
  target,
  state,
  origin = null,
  cards,
  boardError,
  boardSaveError,
  boardSaving,
  onMoveStatus,
  onToggleChecklistItem,
  onEditEntity,
  onClose,
  onOpenEntity,
  onCreateUpgradeProject,
}: MapOverlayProps) {
  // Card detail is derived from the live card list by id so a status or
  // checklist save re-renders the open modal with the server-merged card.
  const [detailCardId, setDetailCardId] = useState<string | null>(null);

  // domainId → display name for the card scope label, from the map's domains.
  const domainNameById = useMemo(() => buildDomainNameById(state.domains), [state.domains]);

  const entity =
    target.kind === "entity"
      ? (state.entities.find((candidate) => candidate.id === target.entityId) ?? null)
      : null;
  // The entity meta line still names the entity's own context; the stray pile
  // is domain-keyed now (strays v1) and labels by the domain name instead.
  const context =
    entity == null
      ? null
      : (state.contexts.find((candidate) => candidate.id === entity.contextId) ?? null);
  const pileDomainName =
    target.kind === "pile" ? (domainNameById.get(target.domainId) ?? target.domainId) : null;
  const readOnly = entity != null && isEntityRoomReadOnly(entity);

  // Pile cards only — the entity case's card list/detail now lives inside
  // EntityRoomBody (the same joined-card grid the board's entity room
  // renders), keyed on the controlled detailCardId below.
  const pileCards = useMemo(() => {
    if (cards == null || target.kind !== "pile") {
      return [];
    }
    return sortCardsByPriority(looseCardsForDomain(cards, target.domainId));
  }, [cards, target]);

  const detailCard =
    target.kind !== "pile" || detailCardId == null
      ? null
      : (pileCards.find((card) => card.id === detailCardId) ?? null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      // Escape peels one layer: the card detail first, then the overlay.
      if (detailCardId != null) {
        setDetailCardId(null);
      } else {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [detailCardId, onClose]);

  const title = target.kind === "entity" ? (entity?.name ?? target.entityId) : "Loose cards";
  const subtitle =
    target.kind === "entity"
      ? entity == null
        ? "This entity is no longer in the map state."
        : entityMetaLine(
            entity.kind,
            entity.lifecycle,
            entity.contextId == null ? null : (context?.name ?? entity.contextId),
          )
      : `Cards in ${pileDomainName} joined to no project or system — the stray pile.`;

  return (
    <MapScrimPanel
      testId="map-overlay"
      maxWidthClass="max-w-xl"
      onClose={onClose}
      origin={origin}
      expandable
      title={
        <div>
          <p
            className="text-sm font-semibold"
            data-testid="map-overlay-title"
            style={{ color: MAP_ROOM_COLORS.heading }}
          >
            {title}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: MAP_ROOM_COLORS.subtext }}>
            {subtitle}
          </p>
          {readOnly ? (
            <p
              className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide"
              data-testid="map-overlay-readonly"
              style={{ color: MAP_ROOM_COLORS.subtext }}
            >
              Completed — read-only, victories stay visible
            </p>
          ) : null}
        </div>
      }
      headerActions={
        <div className="flex shrink-0 items-center gap-2">
          {entity != null && !readOnly ? (
            <RoomActionButton label="Edit entity" onClick={() => onEditEntity(entity.id)} />
          ) : null}
          <RoomActionButton label="Close" onClick={onClose} />
        </div>
      }
      afterPanel={
        // Pile cards only — the entity case's detail modal now renders
        // inside EntityRoomBody's own children (the panel's own click
        // handler already stops propagation there; see its module comment).
        target.kind === "pile" && detailCard != null ? (
          // The modal's fixed backdrop sits inside the overlay's click-away
          // root; stop propagation so closing the card detail (or clicking
          // inside it) never also closes the overlay underneath.
          <div onClick={(event) => event.stopPropagation()} role="presentation">
            <WorkOrderDetailModal
              card={detailCard}
              domainNameById={domainNameById}
              onClose={() => setDetailCardId(null)}
              onToggleChecklistItem={onToggleChecklistItem}
              readOnly={readOnly}
            />
          </div>
        ) : null
      }
    >
      {target.kind === "entity" ? (
        <EntityRoomBody
          boardError={boardError}
          boardSaveError={boardSaveError}
          boardSaving={boardSaving}
          cards={cards}
          detailCardId={detailCardId}
          entity={entity}
          entityId={target.entityId}
          mapState={state}
          onCloseCard={() => setDetailCardId(null)}
          onCreateUpgradeProject={onCreateUpgradeProject}
          onMoveStatus={onMoveStatus}
          onOpenCard={(cardId) => setDetailCardId(cardId)}
          onOpenEntity={onOpenEntity}
          onToggleChecklistItem={onToggleChecklistItem}
          testIdPrefix="map-overlay"
        />
      ) : (
        <>
          {boardSaveError != null ? (
            // Same failure the board surface banners; a status/checklist
            // click from the overlay must not fail silently (PR #20 gate).
            <p
              className="mb-3 text-xs font-semibold"
              data-testid="map-overlay-save-error"
              role="alert"
              style={{ color: MAP_ROOM_COLORS.heading }}
            >
              The card change didn&apos;t save:{" "}
              <span className="font-normal" style={{ color: MAP_ROOM_COLORS.subtext }}>
                {boardSaveError}
              </span>
            </p>
          ) : null}
          {cards == null ? (
            <p className="text-xs" style={{ color: MAP_ROOM_COLORS.subtext }}>
              {boardError ?? "Loading the Info Hub board…"}
            </p>
          ) : pileCards.length === 0 ? (
            <p className="text-xs" style={{ color: MAP_ROOM_COLORS.subtext }}>
              No loose cards left in this domain.
            </p>
          ) : (
            <div className="flex flex-col gap-3" data-testid="map-overlay-cards">
              {pileCards.map((card) => (
                <article
                  className="info-hub-card"
                  data-testid={`map-overlay-card-${card.id}`}
                  data-type={card.type}
                  key={card.id}
                >
                  <WorkOrderCardFace
                    card={card}
                    domainNameById={domainNameById}
                    onOpen={() => setDetailCardId(card.id)}
                  />
                  <div className="info-hub-card-actions">
                    <WorkOrderStatusActions
                      card={card}
                      onMoveStatus={onMoveStatus}
                      saving={boardSaving}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </MapScrimPanel>
  );
}
