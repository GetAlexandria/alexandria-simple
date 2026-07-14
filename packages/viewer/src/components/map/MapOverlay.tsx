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
import {
  WorkOrderCardFace,
  WorkOrderDetailModal,
  WorkOrderStatusActions,
} from "../library/infohub/WorkOrderCard";
import { MAP_FALLBACK_COLORS } from "./colors";
import { MapScrimPanel } from "./MapScrimPanel";
import { ParchmentActionButton } from "./panel-buttons";
import { cardsJoinedToEntity, entityKindLabel, looseCardsForContext } from "./placement";

export type MapOverlayTarget =
  | { kind: "entity"; entityId: string }
  | { kind: "pile"; contextId: string };

type MapOverlayProps = {
  target: MapOverlayTarget;
  state: MapState;
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
};

function entityMetaLine(
  kind: "project" | "system",
  lifecycle: string,
  contextName: string,
): string {
  return `${entityKindLabel(kind)} · ${lifecycle} · ${contextName}`;
}

export function MapOverlay({
  target,
  state,
  cards,
  boardError,
  boardSaveError,
  boardSaving,
  onMoveStatus,
  onToggleChecklistItem,
  onEditEntity,
  onClose,
}: MapOverlayProps) {
  // Card detail is derived from the live card list by id so a status or
  // checklist save re-renders the open modal with the server-merged card.
  const [detailCardId, setDetailCardId] = useState<string | null>(null);

  // domainId → display name for the card scope label, from the map's domains.
  const domainNameById = useMemo(() => {
    const byId = new Map<string, string>();
    for (const domain of state.domains) {
      byId.set(domain.id, domain.name);
    }
    return byId;
  }, [state.domains]);

  const entity =
    target.kind === "entity"
      ? (state.entities.find((candidate) => candidate.id === target.entityId) ?? null)
      : null;
  const contextId = target.kind === "entity" ? (entity?.contextId ?? null) : target.contextId;
  const context = state.contexts.find((candidate) => candidate.id === contextId) ?? null;
  const readOnly = entity != null && entity.kind === "project" && entity.lifecycle === "completed";

  const overlayCards = useMemo(() => {
    if (cards == null) {
      return [];
    }
    return sortCardsByPriority(
      target.kind === "entity"
        ? cardsJoinedToEntity(cards, target.entityId)
        : looseCardsForContext(cards, target.contextId),
    );
  }, [cards, target]);

  const detailCard =
    detailCardId == null ? null : (overlayCards.find((card) => card.id === detailCardId) ?? null);

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
        : entityMetaLine(entity.kind, entity.lifecycle, context?.name ?? entity.contextId)
      : `Cards in ${context?.name ?? target.contextId} joined to no project or system — the stray pile.`;

  return (
    <MapScrimPanel
      testId="map-overlay"
      maxWidthClass="max-w-xl"
      onClose={onClose}
      title={
        <div>
          <p
            className="text-sm font-semibold"
            data-testid="map-overlay-title"
            style={{ color: MAP_FALLBACK_COLORS.heading }}
          >
            {title}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
            {subtitle}
          </p>
          {readOnly ? (
            <p
              className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide"
              data-testid="map-overlay-readonly"
              style={{ color: MAP_FALLBACK_COLORS.subtext }}
            >
              Completed — read-only, victories stay visible
            </p>
          ) : null}
        </div>
      }
      headerActions={
        <div className="flex shrink-0 items-center gap-2">
          {entity != null && !readOnly ? (
            <ParchmentActionButton label="Edit entity" onClick={() => onEditEntity(entity.id)} />
          ) : null}
          <ParchmentActionButton label="Close" onClick={onClose} />
        </div>
      }
      afterPanel={
        detailCard != null ? (
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
      {boardSaveError != null ? (
        // Same failure the board surface banners; a status/checklist
        // click from the overlay must not fail silently (PR #20 gate).
        <p
          className="mb-3 text-xs font-semibold"
          data-testid="map-overlay-save-error"
          role="alert"
          style={{ color: MAP_FALLBACK_COLORS.heading }}
        >
          The card change didn&apos;t save:{" "}
          <span className="font-normal" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
            {boardSaveError}
          </span>
        </p>
      ) : null}
      {cards == null ? (
        <p className="text-xs" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
          {boardError ?? "Loading the Info Hub board…"}
        </p>
      ) : overlayCards.length === 0 ? (
        <p className="text-xs" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
          {target.kind === "entity"
            ? "No board cards are joined to this tile yet — join one from the Info Hub card form."
            : "No loose cards left in this context."}
        </p>
      ) : (
        <div className="flex flex-col gap-3" data-testid="map-overlay-cards">
          {overlayCards.map((card) => (
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
              {readOnly ? null : (
                <div className="info-hub-card-actions">
                  <WorkOrderStatusActions
                    card={card}
                    onMoveStatus={onMoveStatus}
                    saving={boardSaving}
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </MapScrimPanel>
  );
}
