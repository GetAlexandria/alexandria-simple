// The Info Hub work-order card pieces shared between the board lanes
// (InfoHubBoardView) and the Map tab's tile/pile overlay (S2): the clickable
// card face, the status-change action buttons, and the card detail modal.
// Extracted from InfoHubBoardView so the map overlay reuses the exact same
// card rendering and the same board save path (the overlay is another lens
// over docs/alexandria/info-hub/board-state.json, never a second store).

import type { ReactNode } from "react";
import type { InfoHubCard } from "../../../app/runtime/schemas";
import {
  isTerminalStatus,
  priorityLabel,
  type WorkOrderStatus,
  type WorkOrderType,
} from "./boardModel";

export const WORK_ORDER_TYPE_LABELS: Readonly<Record<WorkOrderType, string>> = {
  bug: "Bug",
  improvement: "Improvement",
  task: "Task",
  testing: "Testing",
};

export const WORK_ORDER_STATUS_LABELS: Readonly<Record<WorkOrderStatus, string>> = {
  done: "Done",
  "in-progress": "In Progress",
  "needs-a-human": "Needs a Human",
  open: "Open",
  "wont-do": "Won't Do",
};

/**
 * The card's domain, rendered as its map display name when known and falling
 * back to the raw `domainId` (or "General" for a domain-less card). Callers on
 * a surface with map state pass `domainNameById` (built from mapState.domains);
 * without it the raw id shows.
 */
export function cardScopeLabel(
  card: InfoHubCard,
  domainNameById?: ReadonlyMap<string, string>,
): string {
  const name = domainNameById?.get(card.domainId);
  if (name != null && name.length > 0) {
    return name;
  }
  return card.domainId.length > 0 ? card.domainId : "General";
}

export function cardTitleLabel(card: InfoHubCard): string {
  return card.title ?? WORK_ORDER_TYPE_LABELS[card.type];
}

/** The clickable card face: type tag, priority, title, status, scope, checklist progress. */
export function WorkOrderCardFace({
  card,
  domainNameById,
  onOpen,
}: {
  card: InfoHubCard;
  domainNameById?: ReadonlyMap<string, string>;
  onOpen: () => void;
}) {
  return (
    <div
      className="info-hub-card-face"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      title="Open work-order details"
    >
      <div className="info-hub-card-head">
        <span className="info-hub-card-tag">{WORK_ORDER_TYPE_LABELS[card.type]}</span>
        <span className="info-hub-card-priority" title="Lower priority number is more urgent">
          {priorityLabel(card)}
        </span>
      </div>
      <h3 className="info-hub-card-title">{cardTitleLabel(card)}</h3>
      <div className="info-hub-card-status">{WORK_ORDER_STATUS_LABELS[card.status]}</div>
      <p className="info-hub-card-scope">{cardScopeLabel(card, domainNameById)}</p>
      {card.checklist != null && card.checklist.length > 0 ? (
        <p className="info-hub-card-checklist-progress">
          ✓ {card.checklist.filter((item) => item.done).length}/{card.checklist.length} steps
        </p>
      ) : null}
    </div>
  );
}

/**
 * The status-change buttons every card surface shares (Start / Close /
 * Won't do / Reopen). Board-only actions (Archive now, Keep on board, Edit)
 * stay in InfoHubBoardView, rendered alongside these.
 */
export function WorkOrderStatusActions({
  card,
  onMoveStatus,
  saving,
}: {
  card: InfoHubCard;
  onMoveStatus: (id: string, status: WorkOrderStatus) => void;
  saving: boolean;
}) {
  return (
    <>
      {card.status === "open" ? (
        <button
          className="info-hub-action-btn"
          data-variant="positive"
          disabled={saving}
          onClick={() => onMoveStatus(card.id, "in-progress")}
          type="button"
        >
          Start
        </button>
      ) : null}
      {card.status !== "done" ? (
        <button
          className="info-hub-action-btn"
          data-variant="positive"
          disabled={saving}
          onClick={() => onMoveStatus(card.id, "done")}
          type="button"
        >
          Close
        </button>
      ) : null}
      {card.status !== "wont-do" ? (
        <button
          className="info-hub-action-btn"
          data-variant="danger"
          disabled={saving}
          onClick={() => onMoveStatus(card.id, "wont-do")}
          type="button"
        >
          Won&apos;t do
        </button>
      ) : null}
      {isTerminalStatus(card.status) ? (
        <button
          className="info-hub-action-btn"
          data-variant="positive"
          disabled={saving}
          onClick={() => onMoveStatus(card.id, "in-progress")}
          type="button"
        >
          Reopen
        </button>
      ) : null}
    </>
  );
}

/**
 * The card detail modal: full title/detail, the toggleable checklist, and
 * source/created metadata. `footer` is a slot between the metadata and the
 * Close row for surface-specific actions (the board's promote-to-project
 * section); `readOnly` disables the checklist writes (the overlay's
 * completed-project view — "victories stay visible", not editable).
 */
export function WorkOrderDetailModal({
  card,
  domainNameById,
  footer,
  onClose,
  onToggleChecklistItem,
  readOnly = false,
}: {
  card: InfoHubCard;
  domainNameById?: ReadonlyMap<string, string>;
  footer?: ReactNode;
  onClose: () => void;
  onToggleChecklistItem: (cardId: string, index: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="info-hub-modal-backdrop" onClick={onClose} role="presentation">
      <div className="info-hub-modal" onClick={(event) => event.stopPropagation()}>
        <div className="info-hub-card-head">
          <div className="flex flex-wrap items-center gap-2">
            <span className="info-hub-card-tag">{WORK_ORDER_TYPE_LABELS[card.type]}</span>
            <span className="info-hub-card-priority" title="Lower priority number is more urgent">
              {priorityLabel(card)}
            </span>
            <span className="info-hub-card-status">{WORK_ORDER_STATUS_LABELS[card.status]}</span>
          </div>
          <button className="info-hub-action-btn" onClick={onClose} title="Close" type="button">
            ×
          </button>
        </div>
        <h3 className="info-hub-card-title mt-3 text-[18px]">{cardTitleLabel(card)}</h3>
        <p className="info-hub-card-scope">{cardScopeLabel(card, domainNameById)}</p>
        {card.detail != null && card.detail.length > 0 ? (
          <p className="info-hub-card-scope mt-3 whitespace-pre-wrap">{card.detail}</p>
        ) : null}
        {card.checklist != null && card.checklist.length > 0 ? (
          <ul className="info-hub-modal-checklist" data-testid="info-hub-checklist">
            {card.checklist.map((item, index) => (
              <li key={`detail-${card.id}-check-${index}`}>
                <button
                  className="info-hub-modal-checklist-item"
                  data-done={item.done}
                  disabled={readOnly}
                  onClick={() => onToggleChecklistItem(card.id, index)}
                  type="button"
                >
                  <span aria-hidden>{item.done ? "☑" : "☐"}</span>
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <dl className="info-hub-form-row mt-4 border-t border-[color:var(--viewer-canvas-rule)] pt-3">
          <div className="info-hub-filter-field">
            Source
            <span className="info-hub-card-scope">{card.source}</span>
          </div>
          <div className="info-hub-filter-field">
            Created
            <span className="info-hub-card-scope">{card.created}</span>
          </div>
        </dl>
        {footer}
        <div className="info-hub-form-actions justify-end">
          <button className="info-hub-action-btn" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
