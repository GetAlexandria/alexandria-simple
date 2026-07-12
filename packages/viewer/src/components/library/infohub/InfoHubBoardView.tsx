import { useCallback, useMemo, useRef, useState } from "react";
import type { InfoHubBoard, InfoHubCard } from "../../../app/runtime/schemas";
import {
  activeWorkOrderLane,
  archiveDateForTerminalCard,
  defaultPriorityForType,
  inWorkOrderArchive,
  isAgeArchived,
  isTerminalStatus,
  passesPrioritySift,
  priorityLabel,
  sortCardsByPriority,
  withStatus,
  withoutArchiveOverride,
  type ActiveWorkOrderStatus,
  type PrioritySortDirection,
  type WorkOrderStatus,
  type WorkOrderType,
} from "./boardModel";

/**
 * Info Hub work-order board surface (Info Hub kanban plan, Lane B) — the
 * Alexandria-branded port of the PlayMaker Studio Work Board's "Work Orders"
 * half (packages/pms/viewer/src/components/studio/StudioApp.tsx). No play
 * tracker, no drag-and-drop: three lanes, discrete status buttons, a card
 * detail modal with checklist toggling, an add/edit form, and an archive
 * shelf for terminal cards past the 7-day window. `board` is the caller's
 * current server-confirmed state (via useInfoHubBoard); every mutation posts
 * the full known card set and adopts whatever the server merges back.
 */

const WORK_ORDER_TYPES: WorkOrderType[] = ["bug", "task", "testing", "improvement"];
const WORK_ORDER_STATUSES: ActiveWorkOrderStatus[] = ["open", "in-progress", "done"];
const WORK_ORDER_STATUS_FILTERS: WorkOrderStatus[] = ["open", "in-progress", "done", "wont-do"];

const WORK_ORDER_TYPE_LABELS: Readonly<Record<WorkOrderType, string>> = {
  bug: "Bug",
  improvement: "Improvement",
  task: "Task",
  testing: "Testing",
};

const WORK_ORDER_STATUS_LABELS: Readonly<Record<WorkOrderStatus, string>> = {
  done: "Done",
  "in-progress": "In Progress",
  open: "Open",
  "wont-do": "Won't Do",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function createCardId(
  type: WorkOrderType,
  area: string,
  title: string,
  existingIds: ReadonlySet<string>,
): string {
  const base = `wo-${slugify(area || "general")}-${slugify(type)}-${slugify(title || "card") || "card"}`;
  let id = base;
  let suffix = 2;
  while (existingIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function parseChecklist(text: string): NonNullable<InfoHubCard["checklist"]> {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = /^\[(x|X| )\]\s*(.+)$/.exec(line);
      if (match != null) {
        return { done: match[1]?.toLowerCase() === "x", text: match[2]?.trim() ?? "" };
      }
      return { done: false, text: line };
    });
}

function checklistToText(checklist: InfoHubCard["checklist"]): string {
  return (checklist ?? []).map((item) => `[${item.done ? "x" : " "}] ${item.text}`).join("\n");
}

function cardScopeLabel(card: InfoHubCard): string {
  return card.area != null && card.area.trim().length > 0 ? card.area : "General";
}

interface ArchiveEntry {
  card: InfoHubCard;
  date: string | null;
  disposition: WorkOrderStatus;
}

export interface InfoHubBoardViewProps {
  board: InfoHubBoard;
  onSaveCards: (cards: readonly InfoHubCard[]) => Promise<InfoHubBoard | null>;
  saveError: string | null;
  saving: boolean;
}

export function InfoHubBoardView({ board, onSaveCards, saveError, saving }: InfoHubBoardViewProps) {
  const [detailCard, setDetailCard] = useState<InfoHubCard | null>(null);
  const [typeFilter, setTypeFilter] = useState<"" | WorkOrderType>("");
  const [statusFilter, setStatusFilter] = useState<"" | WorkOrderStatus>("");
  const [areaFilter, setAreaFilter] = useState("");
  const [prioritySort, setPrioritySort] = useState<PrioritySortDirection>("urgent-first");
  const [maxPriority, setMaxPriority] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveTypeFilter, setArchiveTypeFilter] = useState<"" | WorkOrderType>("");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardType, setCardType] = useState<WorkOrderType>("improvement");
  const [cardArea, setCardArea] = useState("");
  const [cardPriority, setCardPriority] = useState(String(defaultPriorityForType("improvement")));
  const [cardTitle, setCardTitle] = useState("");
  const [cardDetail, setCardDetail] = useState("");
  const [cardChecklist, setCardChecklist] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const cards = useMemo(() => sortCardsByPriority(board.cards), [board.cards]);
  // Refreshed whenever the board reloads so derived archive membership can
  // age out on a fresh fetch without a full page reload.
  const now = useMemo(() => new Date(), [board]);
  const activeCards = useMemo(
    () => cards.filter((card) => !inWorkOrderArchive(card, now)),
    [cards, now],
  );
  const archivedCards = useMemo(
    () => cards.filter((card) => inWorkOrderArchive(card, now)),
    [cards, now],
  );
  const areaOptions = useMemo(() => {
    const areas = new Set<string>();
    for (const card of cards) {
      if (card.area != null && card.area.trim().length > 0) {
        areas.add(card.area);
      }
    }
    return [...areas].sort((left, right) => left.localeCompare(right));
  }, [cards]);
  const maxPriorityValue = useMemo(() => {
    const trimmed = maxPriority.trim();
    if (trimmed.length === 0) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }, [maxPriority]);
  const filteredCards = useMemo(
    () =>
      activeCards.filter((card) => {
        if (typeFilter.length > 0 && card.type !== typeFilter) {
          return false;
        }
        if (statusFilter.length > 0 && card.status !== statusFilter) {
          return false;
        }
        if (areaFilter.length > 0 && card.area !== areaFilter) {
          return false;
        }
        if (!passesPrioritySift(card, maxPriorityValue)) {
          return false;
        }
        return true;
      }),
    [activeCards, areaFilter, maxPriorityValue, statusFilter, typeFilter],
  );
  // Derived view: re-order the filtered set by the chosen sort direction. The
  // stored `cards` order stays canonical (urgent-first); sorting never
  // rewrites priorities.
  const orderedCards = useMemo(
    () => sortCardsByPriority(filteredCards, prioritySort),
    [filteredCards, prioritySort],
  );
  const archiveEntries = useMemo<ArchiveEntry[]>(
    () =>
      archivedCards.map((card) => ({
        card,
        date: archiveDateForTerminalCard(card),
        disposition: card.status,
      })),
    [archivedCards],
  );
  const filteredArchiveEntries = useMemo(() => {
    const search = archiveSearch.trim().toLowerCase();
    return archiveEntries.filter((entry) => {
      if (archiveTypeFilter.length > 0 && entry.card.type !== archiveTypeFilter) {
        return false;
      }
      if (search.length === 0) {
        return true;
      }
      const searchText = [
        entry.card.title ?? "",
        entry.card.detail ?? "",
        entry.card.id,
        entry.card.area ?? "",
        WORK_ORDER_TYPE_LABELS[entry.card.type],
        WORK_ORDER_STATUS_LABELS[entry.card.status],
      ]
        .join(" ")
        .toLowerCase();
      return searchText.includes(search);
    });
  }, [archiveEntries, archiveSearch, archiveTypeFilter]);

  const resetForm = useCallback(() => {
    setEditingCardId(null);
    setCardType("improvement");
    setCardArea("");
    setCardPriority(String(defaultPriorityForType("improvement")));
    setCardTitle("");
    setCardDetail("");
    setCardChecklist("");
  }, []);

  const formError = useMemo(() => {
    const priority = Number.parseInt(cardPriority, 10);
    if (!Number.isInteger(priority)) {
      return "Priority must be a whole number.";
    }
    return null;
  }, [cardPriority]);

  const buildCardFromForm = useCallback(
    (existing: InfoHubCard | null): InfoHubCard => {
      const area = cardArea.trim();
      const title = cardTitle.trim() || WORK_ORDER_TYPE_LABELS[cardType];
      const checklist = parseChecklist(cardChecklist);
      return {
        ...(existing?.archived == null ? {} : { archived: existing.archived }),
        ...(area.length > 0 ? { area } : {}),
        ...(checklist.length > 0 ? { checklist } : {}),
        created: existing?.created ?? todayIso(),
        detail: cardDetail,
        id: existing?.id ?? createCardId(cardType, area, title, new Set(cards.map((c) => c.id))),
        ...(existing?.pinned == null ? {} : { pinned: existing.pinned }),
        priority: Number.parseInt(cardPriority, 10),
        source: existing?.source ?? "board:director",
        status: existing?.status ?? "open",
        ...(existing?.terminalAt == null ? {} : { terminalAt: existing.terminalAt }),
        title,
        type: cardType,
      };
    },
    [cardArea, cardChecklist, cardDetail, cardPriority, cardTitle, cardType, cards],
  );

  const editCard = useCallback((card: InfoHubCard) => {
    setEditingCardId(card.id);
    setDetailCard(null);
    setCardType(card.type);
    setCardArea(card.area ?? "");
    setCardPriority(String(card.priority));
    setCardTitle(card.title ?? "");
    setCardDetail(card.detail ?? "");
    setCardChecklist(checklistToText(card.checklist));
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      titleInputRef.current?.focus();
    });
  }, []);

  const handleSubmit = useCallback(
    async (event: React.SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (formError != null || saving) {
        return;
      }
      const existing =
        editingCardId == null ? null : (cards.find((card) => card.id === editingCardId) ?? null);
      const nextCard = buildCardFromForm(existing);
      const nextCards =
        existing == null
          ? sortCardsByPriority([...cards, nextCard])
          : cards.map((card) => (card.id === existing.id ? nextCard : card));
      const result = await onSaveCards(nextCards);
      if (result != null) {
        resetForm();
      }
    },
    [buildCardFromForm, cards, editingCardId, formError, onSaveCards, resetForm, saving],
  );

  const moveCardStatus = useCallback(
    (id: string, status: WorkOrderStatus) => {
      void onSaveCards(cards.map((card) => (card.id === id ? withStatus(card, status) : card)));
    },
    [cards, onSaveCards],
  );

  const archiveNow = useCallback(
    (id: string) => {
      void onSaveCards(cards.map((card) => (card.id === id ? { ...card, archived: true } : card)));
    },
    [cards, onSaveCards],
  );

  const keepOnBoard = useCallback(
    (id: string) => {
      void onSaveCards(
        cards.map((card) => {
          if (card.id !== id) {
            return card;
          }
          const { archived, ...rest } = card;
          void archived;
          return { ...rest, pinned: true };
        }),
      );
    },
    [cards, onSaveCards],
  );

  const restoreWorkOrder = useCallback(
    (card: InfoHubCard) => {
      void onSaveCards(
        cards.map((candidate) => {
          if (candidate.id !== card.id) {
            return candidate;
          }
          const restored = withoutArchiveOverride(candidate);
          return isAgeArchived(restored, now) ? { ...restored, pinned: true } : restored;
        }),
      );
    },
    [cards, now, onSaveCards],
  );

  const toggleChecklistItem = useCallback(
    (cardId: string, index: number) => {
      const target = cards.find((card) => card.id === cardId);
      if (target?.checklist == null) {
        return;
      }
      const nextChecklist = target.checklist.map((item, itemIndex) =>
        itemIndex === index ? { ...item, done: !item.done } : item,
      );
      const nextCard: InfoHubCard = { ...target, checklist: nextChecklist };
      void onSaveCards(cards.map((card) => (card.id === cardId ? nextCard : card)));
      setDetailCard(nextCard);
    },
    [cards, onSaveCards],
  );

  return (
    <section
      aria-labelledby="info-hub-heading"
      className="raven-canvas-section info-hub-surface min-h-[calc(100vh-84px-220px)] px-6 py-9"
      data-testid="info-hub-board"
    >
      <div className="info-hub-sheet">
        {saveError != null ? (
          <p className="info-hub-form-error mb-3" data-testid="info-hub-save-error">
            {saveError}
          </p>
        ) : null}

        <header className="info-hub-header">
          <div>
            <p className="info-hub-eyebrow">Info Hub</p>
            <h1 className="info-hub-crest" id="info-hub-heading">
              Work Board
              <small>Work orders agents and the director file directly</small>
            </h1>
          </div>
          <dl className="info-hub-header-stats">
            <div className="info-hub-stat">
              <dt>Active</dt>
              <dd>{activeCards.length}</dd>
            </div>
            <div className="info-hub-stat">
              <dt>Archived</dt>
              <dd>{archivedCards.length}</dd>
            </div>
          </dl>
        </header>

        <div className="info-hub-filter-bar">
          <label className="info-hub-filter-field">
            Type
            <select
              aria-label="Work order type filter"
              onChange={(event) => setTypeFilter(event.target.value as "" | WorkOrderType)}
              value={typeFilter}
            >
              <option value="">All types</option>
              {WORK_ORDER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {WORK_ORDER_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>
          <label className="info-hub-filter-field">
            Status
            <select
              aria-label="Work order status filter"
              onChange={(event) => setStatusFilter(event.target.value as "" | WorkOrderStatus)}
              value={statusFilter}
            >
              <option value="">All statuses</option>
              {WORK_ORDER_STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>
                  {WORK_ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          {areaOptions.length > 0 ? (
            <label className="info-hub-filter-field">
              Area
              <select
                aria-label="Work order area filter"
                onChange={(event) => setAreaFilter(event.target.value)}
                value={areaFilter}
              >
                <option value="">All areas</option>
                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="info-hub-filter-field">
            Priority ≤
            <input
              aria-label="Maximum work order priority"
              inputMode="numeric"
              min={0}
              onChange={(event) => setMaxPriority(event.target.value)}
              placeholder="Any"
              type="number"
              value={maxPriority}
            />
          </label>
          <div className="info-hub-filter-field">
            Sort
            <button
              aria-label={
                prioritySort === "urgent-first"
                  ? "Sort by priority: most urgent first — activate to reverse"
                  : "Sort by priority: least urgent first — activate to reverse"
              }
              aria-pressed={prioritySort === "urgent-last"}
              className="info-hub-action-btn"
              data-testid="work-order-priority-sort"
              onClick={() =>
                setPrioritySort((current) =>
                  current === "urgent-first" ? "urgent-last" : "urgent-first",
                )
              }
              title="Order the lanes by priority — click to reverse"
              type="button"
            >
              {prioritySort === "urgent-first" ? "Most urgent ↑" : "Least urgent ↓"}
            </button>
          </div>
        </div>

        <div className="info-hub-lanes">
          {WORK_ORDER_STATUSES.map((status) => {
            const laneCards = orderedCards.filter(
              (card) => activeWorkOrderLane(card.status) === status,
            );
            return (
              <section
                className="info-hub-lane"
                data-testid={`work-order-lane-${status}`}
                key={status}
              >
                <div className="info-hub-lane-header">
                  <h2 className="info-hub-lane-title">{WORK_ORDER_STATUS_LABELS[status]}</h2>
                  <span className="info-hub-lane-count">{laneCards.length}</span>
                </div>
                <div className="info-hub-lane-body">
                  {laneCards.length === 0 ? (
                    <div className="info-hub-lane-empty">No work-order cards here.</div>
                  ) : (
                    laneCards.map((card) => (
                      <article
                        className="info-hub-card"
                        data-testid={`work-order-card-${card.id}`}
                        data-type={card.type}
                        key={card.id}
                      >
                        <div
                          className="info-hub-card-face"
                          onClick={() => setDetailCard(card)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setDetailCard(card);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          title="Open work-order details"
                        >
                          <div className="info-hub-card-head">
                            <span className="info-hub-card-tag">
                              {WORK_ORDER_TYPE_LABELS[card.type]}
                            </span>
                            <span
                              className="info-hub-card-priority"
                              title="Lower priority number is more urgent"
                            >
                              {priorityLabel(card)}
                            </span>
                          </div>
                          <h3 className="info-hub-card-title">
                            {card.title ?? WORK_ORDER_TYPE_LABELS[card.type]}
                          </h3>
                          <div className="info-hub-card-status">
                            {WORK_ORDER_STATUS_LABELS[card.status]}
                          </div>
                          <p className="info-hub-card-scope">{cardScopeLabel(card)}</p>
                          {card.checklist != null && card.checklist.length > 0 ? (
                            <p className="info-hub-card-checklist-progress">
                              ✓ {card.checklist.filter((item) => item.done).length}/
                              {card.checklist.length} steps
                            </p>
                          ) : null}
                        </div>
                        <div className="info-hub-card-actions">
                          {card.status === "open" ? (
                            <button
                              className="info-hub-action-btn"
                              data-variant="positive"
                              disabled={saving}
                              onClick={() => moveCardStatus(card.id, "in-progress")}
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
                              onClick={() => moveCardStatus(card.id, "done")}
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
                              onClick={() => moveCardStatus(card.id, "wont-do")}
                              type="button"
                            >
                              Won&apos;t do
                            </button>
                          ) : null}
                          {isTerminalStatus(card.status) ? (
                            <>
                              <button
                                className="info-hub-action-btn"
                                data-variant="positive"
                                disabled={saving}
                                onClick={() => moveCardStatus(card.id, "in-progress")}
                                type="button"
                              >
                                Reopen
                              </button>
                              <button
                                className="info-hub-action-btn"
                                data-variant="primary"
                                disabled={saving}
                                onClick={() => archiveNow(card.id)}
                                type="button"
                              >
                                Archive now
                              </button>
                              <button
                                className="info-hub-action-btn"
                                disabled={saving}
                                onClick={() => keepOnBoard(card.id)}
                                type="button"
                              >
                                Keep on board
                              </button>
                            </>
                          ) : null}
                          <button
                            className="info-hub-action-btn"
                            data-variant="primary"
                            disabled={saving}
                            onClick={() => editCard(card)}
                            type="button"
                          >
                            Edit
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <label className="info-hub-archive-toggle">
          <input
            checked={showArchived}
            onChange={(event) => setShowArchived(event.target.checked)}
            type="checkbox"
          />
          Show archived ({archivedCards.length})
        </label>

        {showArchived ? (
          <section className="info-hub-archive-shelf" data-testid="work-order-archive">
            <div className="info-hub-filter-bar">
              <label className="info-hub-filter-field">
                Search
                <input
                  aria-label="Archive search"
                  onChange={(event) => setArchiveSearch(event.target.value)}
                  value={archiveSearch}
                />
              </label>
              <label className="info-hub-filter-field">
                Type
                <select
                  aria-label="Archive type filter"
                  onChange={(event) =>
                    setArchiveTypeFilter(event.target.value as "" | WorkOrderType)
                  }
                  value={archiveTypeFilter}
                >
                  <option value="">All types</option>
                  {WORK_ORDER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {WORK_ORDER_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="info-hub-archive-grid">
              {filteredArchiveEntries.length === 0 ? (
                <div className="info-hub-lane-empty">No archived cards match.</div>
              ) : (
                filteredArchiveEntries.map((entry) => (
                  <article
                    className="info-hub-card"
                    data-testid={`archive-work-order-card-${entry.card.id}`}
                    data-type={entry.card.type}
                    key={entry.card.id}
                  >
                    <div className="info-hub-card-head">
                      <span className="info-hub-card-tag">
                        {WORK_ORDER_TYPE_LABELS[entry.card.type]}
                      </span>
                      <span className="info-hub-card-priority">
                        {WORK_ORDER_STATUS_LABELS[entry.disposition]}
                      </span>
                    </div>
                    <h3 className="info-hub-card-title">
                      {entry.card.title ?? WORK_ORDER_TYPE_LABELS[entry.card.type]}
                    </h3>
                    <p className="info-hub-card-scope">{cardScopeLabel(entry.card)}</p>
                    {entry.date != null ? (
                      <p className="info-hub-card-checklist-progress">{entry.date}</p>
                    ) : null}
                    <div className="info-hub-card-actions">
                      <button
                        className="info-hub-action-btn"
                        data-variant="positive"
                        disabled={saving}
                        onClick={() => restoreWorkOrder(entry.card)}
                        type="button"
                      >
                        Restore
                      </button>
                      <button
                        className="info-hub-action-btn"
                        data-variant="primary"
                        disabled={saving}
                        onClick={() => editCard(entry.card)}
                        type="button"
                      >
                        Edit
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}

        {detailCard != null ? (
          <div
            className="info-hub-modal-backdrop"
            onClick={() => setDetailCard(null)}
            role="presentation"
          >
            <div className="info-hub-modal" onClick={(event) => event.stopPropagation()}>
              <div className="info-hub-card-head">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="info-hub-card-tag">
                    {WORK_ORDER_TYPE_LABELS[detailCard.type]}
                  </span>
                  <span
                    className="info-hub-card-priority"
                    title="Lower priority number is more urgent"
                  >
                    {priorityLabel(detailCard)}
                  </span>
                  <span className="info-hub-card-status">
                    {WORK_ORDER_STATUS_LABELS[detailCard.status]}
                  </span>
                </div>
                <button
                  className="info-hub-action-btn"
                  onClick={() => setDetailCard(null)}
                  title="Close"
                  type="button"
                >
                  ×
                </button>
              </div>
              <h3 className="info-hub-card-title mt-3 text-[18px]">
                {detailCard.title ?? WORK_ORDER_TYPE_LABELS[detailCard.type]}
              </h3>
              <p className="info-hub-card-scope">{cardScopeLabel(detailCard)}</p>
              {detailCard.detail != null && detailCard.detail.length > 0 ? (
                <p className="info-hub-card-scope mt-3 whitespace-pre-wrap">{detailCard.detail}</p>
              ) : null}
              {detailCard.checklist != null && detailCard.checklist.length > 0 ? (
                <ul className="info-hub-modal-checklist" data-testid="info-hub-checklist">
                  {detailCard.checklist.map((item, index) => (
                    <li key={`detail-${detailCard.id}-check-${index}`}>
                      <button
                        className="info-hub-modal-checklist-item"
                        data-done={item.done}
                        onClick={() => toggleChecklistItem(detailCard.id, index)}
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
                  <span className="info-hub-card-scope">{detailCard.source}</span>
                </div>
                <div className="info-hub-filter-field">
                  Created
                  <span className="info-hub-card-scope">{detailCard.created}</span>
                </div>
              </dl>
              <div className="info-hub-form-actions justify-end">
                <button
                  className="info-hub-action-btn"
                  onClick={() => setDetailCard(null)}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <form className="info-hub-form" onSubmit={handleSubmit} ref={formRef}>
          <h3 className="info-hub-form-title">
            {editingCardId == null
              ? "New work order"
              : `Editing ${cards.find((card) => card.id === editingCardId)?.title ?? editingCardId}`}
          </h3>
          <div className="info-hub-form-row">
            <label className="info-hub-form-field">
              Type
              <select
                aria-label="Work order type"
                onChange={(event) => {
                  const nextType = event.target.value as WorkOrderType;
                  setCardType(nextType);
                  setCardPriority(String(defaultPriorityForType(nextType)));
                }}
                value={cardType}
              >
                {WORK_ORDER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {WORK_ORDER_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>
            <label className="info-hub-form-field">
              Area
              <input
                aria-label="Work order area"
                onChange={(event) => setCardArea(event.target.value)}
                placeholder="library, viewer, runtime, ops…"
                value={cardArea}
              />
            </label>
            <label className="info-hub-form-field">
              Priority
              <input
                aria-label="Work order priority"
                onChange={(event) => setCardPriority(event.target.value)}
                type="number"
                value={cardPriority}
              />
            </label>
          </div>
          <div className="info-hub-form-row mt-2">
            <label className="info-hub-form-field" style={{ flex: "1 1 260px" }}>
              Title
              <input
                aria-label="Work order title"
                onChange={(event) => setCardTitle(event.target.value)}
                ref={titleInputRef}
                value={cardTitle}
              />
            </label>
            <label className="info-hub-form-field" style={{ flex: "2 1 320px" }}>
              Detail
              <input
                aria-label="Work order detail"
                onChange={(event) => setCardDetail(event.target.value)}
                value={cardDetail}
              />
            </label>
          </div>
          <label className="info-hub-form-field mt-2" style={{ flex: "1 1 100%" }}>
            Checklist (one step per line, optionally &quot;[x] done step&quot;)
            <textarea
              aria-label="Work order checklist"
              onChange={(event) => setCardChecklist(event.target.value)}
              rows={3}
              value={cardChecklist}
            />
          </label>
          <div className="info-hub-form-actions">
            <button
              className="info-hub-action-btn"
              data-variant="positive"
              disabled={saving || formError != null}
              type="submit"
            >
              {editingCardId == null ? "Create card" : "Save card"}
            </button>
            {editingCardId != null ? (
              <button className="info-hub-action-btn" onClick={() => resetForm()} type="button">
                Cancel
              </button>
            ) : null}
            {formError != null ? <span className="info-hub-form-error">{formError}</span> : null}
          </div>
        </form>
      </div>
    </section>
  );
}
