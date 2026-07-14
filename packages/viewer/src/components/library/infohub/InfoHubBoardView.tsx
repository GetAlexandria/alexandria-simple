import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  INFO_HUB_CARD_STATUSES,
  type InfoHubBoard,
  type InfoHubCard,
  type MapContext,
  type MapState,
} from "../../../app/runtime/schemas";
import type { MapStateSaveError } from "../hooks/useMapState";
import { slugify, uniqueId } from "../../id-slug";
import {
  entityKindLabel,
  promotionDraftFromCard,
  withCardJoin,
  withEntityCreated,
} from "../../map/placement";
import {
  activeWorkOrderLane,
  archiveDateForTerminalCard,
  defaultPriorityForType,
  inWorkOrderArchive,
  isAgeArchived,
  isTerminalStatus,
  passesPrioritySift,
  sortCardsByPriority,
  withChecklistItemToggled,
  withStatus,
  withoutArchiveOverride,
  type ActiveWorkOrderStatus,
  type PrioritySortDirection,
  type WorkOrderStatus,
  type WorkOrderType,
} from "./boardModel";
import {
  cardScopeLabel,
  cardTitleLabel,
  WORK_ORDER_STATUS_LABELS,
  WORK_ORDER_TYPE_LABELS,
  WorkOrderCardFace,
  WorkOrderDetailModal,
  WorkOrderStatusActions,
} from "./WorkOrderCard";

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
// Derived from the schema's single status declaration — lane and filter
// order follow INFO_HUB_CARD_STATUSES; only wont-do is laneless (it folds
// into the done lane via activeWorkOrderLane).
const WORK_ORDER_STATUS_FILTERS: WorkOrderStatus[] = [...INFO_HUB_CARD_STATUSES];
const WORK_ORDER_STATUSES: ActiveWorkOrderStatus[] = INFO_HUB_CARD_STATUSES.filter(
  (status): status is ActiveWorkOrderStatus => status !== "wont-do",
);

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function createCardId(
  type: WorkOrderType,
  domainId: string,
  title: string,
  existingIds: ReadonlySet<string>,
): string {
  const base = `wo-${slugify(domainId || "general")}-${slugify(type)}-${slugify(title || "card") || "card"}`;
  return uniqueId(base, existingIds);
}

/**
 * The context `<option>`s shared by the promote picker and the card join
 * form — each select renders its own leading "no context" placeholder, then
 * these. The two lists must stay identical, so they live in one place.
 */
function ContextOptions({ contexts }: { contexts: readonly MapContext[] }) {
  return (
    <>
      {contexts.map((context) => (
        <option key={context.id} value={context.id}>
          {context.name}
        </option>
      ))}
    </>
  );
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
  /**
   * Map state for the card join pickers and promote-to-project (S2). The
   * board only reads it — context/entity names and ids come from here, and
   * card writes still flow through `onSaveCards`. Null/undefined (loading,
   * fetch failed, or map empty) hides the join UI; the board never blocks
   * on the map.
   */
  mapState?: MapState | null;
  /**
   * Promote-to-project's one map write: useMapState's revision-guarded
   * full-document save (the shared path for ALL map writes; resolves null
   * on success, the structured save error otherwise — the promote flow
   * branches conflict-vs-error on it). Absent → promote is hidden.
   */
  onSaveMapState?: (next: MapState) => Promise<MapStateSaveError | null>;
  /** Refresh remedy for a promote that hit a stale map revision (409). */
  onRefreshMapState?: () => void;
  mapSaving?: boolean;
  /**
   * Initial status-lane filter, from the route (e.g. the Map tab's colleague
   * overlay jumps here with `?status=needs-a-human`). Applied once on mount;
   * an unrecognized value is ignored. The user can still change or clear it.
   */
  initialStatusFilter?: string;
}

/**
 * A promote whose map half landed (the project exists) but whose board join
 * hasn't yet: retrying skips entity creation and only re-attempts the join,
 * so a flaky board save can never mint duplicate orphan projects
 * (PR #20 review gate).
 */
type PendingPromotion = {
  cardId: string;
  contextId: string;
  entityId: string;
  entityName: string;
};

type PromoteFailure = {
  /** conflict → offer "Refresh map data"; error/join → message only. */
  kind: "conflict" | "error" | "join";
  message: string;
};

export function InfoHubBoardView({
  board,
  onSaveCards,
  saveError,
  saving,
  mapState,
  onSaveMapState,
  onRefreshMapState,
  mapSaving = false,
  initialStatusFilter,
}: InfoHubBoardViewProps) {
  const [detailCard, setDetailCard] = useState<InfoHubCard | null>(null);
  const [typeFilter, setTypeFilter] = useState<"" | WorkOrderType>("");
  const [statusFilter, setStatusFilter] = useState<"" | WorkOrderStatus>(() =>
    initialStatusFilter != null &&
    (WORK_ORDER_STATUSES as readonly string[]).includes(initialStatusFilter)
      ? (initialStatusFilter as WorkOrderStatus)
      : "",
  );
  const [domainFilter, setDomainFilter] = useState("");
  const [prioritySort, setPrioritySort] = useState<PrioritySortDirection>("urgent-first");
  const [maxPriority, setMaxPriority] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveTypeFilter, setArchiveTypeFilter] = useState<"" | WorkOrderType>("");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardType, setCardType] = useState<WorkOrderType>("improvement");
  const [cardDomainId, setCardDomainId] = useState("");
  const [cardPriority, setCardPriority] = useState(String(defaultPriorityForType("improvement")));
  const [cardTitle, setCardTitle] = useState("");
  const [cardDetail, setCardDetail] = useState("");
  const [cardChecklist, setCardChecklist] = useState("");
  // Map join pickers (S2): the ids the form writes as contextId/entityId.
  // "" means "no join" — the fields are omitted from the card, never
  // written as empty strings (the M1 validators reject "").
  const [cardContextId, setCardContextId] = useState("");
  const [cardEntityId, setCardEntityId] = useState("");
  // Promote-to-project state (detail modal footer).
  const [promoteContextId, setPromoteContextId] = useState("");
  const [promoteError, setPromoteError] = useState<PromoteFailure | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const mapContexts = useMemo(() => mapState?.contexts ?? [], [mapState]);
  const mapEntities = useMemo(() => mapState?.entities ?? [], [mapState]);
  const mapDomains = useMemo(() => mapState?.domains ?? [], [mapState]);
  const joinUiAvailable = mapState != null && mapContexts.length > 0;
  // The form's domain picker is sourced from the map's domain set; without it
  // there is nothing to pick, so the form falls back to the raw stored value.
  const domainPickerAvailable = mapDomains.length > 0;
  // domainId → display name, for the card scope label and the domain filter.
  // Falls back to the raw domainId when the map has no matching domain.
  const domainNameById = useMemo(() => {
    const byId = new Map<string, string>();
    for (const domain of mapDomains) {
      byId.set(domain.id, domain.name);
    }
    return byId;
  }, [mapDomains]);
  // Stored joins are reconciled against the live map (PR #20 gate): an id
  // whose context/entity no longer exists (or whose entity moved contexts)
  // renders as unselected, and the SAVE writes exactly what the form shows —
  // never a stale join back.
  const effectiveCardContextId = mapContexts.some((context) => context.id === cardContextId)
    ? cardContextId
    : "";
  // The entity picker narrows to the picked context; without a context it
  // offers every entity (picking one adopts its context, below).
  const entityOptions = useMemo(
    () =>
      effectiveCardContextId.length === 0
        ? mapEntities
        : mapEntities.filter((entity) => entity.contextId === effectiveCardContextId),
    [mapEntities, effectiveCardContextId],
  );
  const effectiveCardEntityId = entityOptions.some((entity) => entity.id === cardEntityId)
    ? cardEntityId
    : "";

  // Seed the promote picker whenever the detail modal lands on a new card:
  // its own context when that context still exists on the map, otherwise
  // "pick one" (with a dead-context hint rendered in the footer).
  const detailCardId = detailCard?.id ?? null;
  const detailCardContextId = detailCard?.contextId ?? "";
  useEffect(() => {
    setPromoteContextId(
      mapContexts.some((context) => context.id === detailCardContextId) ? detailCardContextId : "",
    );
    setPromoteError(null);
  }, [detailCardId, detailCardContextId, mapContexts]);

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
  // The domain filter options are the domains actually present on cards
  // (parallel to the old area filter), labelled from the map's domain set
  // when available and falling back to the raw domainId otherwise.
  const domainFilterOptions = useMemo(() => {
    const ids = new Set<string>();
    for (const card of cards) {
      if (card.domainId.length > 0) {
        ids.add(card.domainId);
      }
    }
    return [...ids]
      .map((id) => ({ id, name: domainNameById.get(id) ?? id }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [cards, domainNameById]);
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
        if (domainFilter.length > 0 && card.domainId !== domainFilter) {
          return false;
        }
        if (!passesPrioritySift(card, maxPriorityValue)) {
          return false;
        }
        return true;
      }),
    [activeCards, domainFilter, maxPriorityValue, statusFilter, typeFilter],
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
        cardScopeLabel(entry.card, domainNameById),
        WORK_ORDER_TYPE_LABELS[entry.card.type],
        WORK_ORDER_STATUS_LABELS[entry.card.status],
      ]
        .join(" ")
        .toLowerCase();
      return searchText.includes(search);
    });
  }, [archiveEntries, archiveSearch, archiveTypeFilter, domainNameById]);

  const resetForm = useCallback(() => {
    setEditingCardId(null);
    setCardType("improvement");
    setCardDomainId("");
    setCardPriority(String(defaultPriorityForType("improvement")));
    setCardTitle("");
    setCardDetail("");
    setCardChecklist("");
    setCardContextId("");
    setCardEntityId("");
  }, []);

  const formError = useMemo(() => {
    const priority = Number.parseInt(cardPriority, 10);
    if (!Number.isInteger(priority)) {
      return "Priority must be a whole number.";
    }
    // A card needs a domain (the shared Map/Board spine). Gate only when the
    // picker can offer one — a board with no map can't pick, and the server
    // still guards domainId, so the no-map path is a degraded fallback.
    if (domainPickerAvailable && cardDomainId.trim().length === 0) {
      return "Pick a domain.";
    }
    return null;
  }, [cardDomainId, cardPriority, domainPickerAvailable]);

  const buildCardFromForm = useCallback(
    (existing: InfoHubCard | null): InfoHubCard => {
      const domainId = cardDomainId.trim();
      const title = cardTitle.trim() || WORK_ORDER_TYPE_LABELS[cardType];
      const checklist = parseChecklist(cardChecklist);
      // Join fields ride through withCardJoin so ""/absent means "omit the
      // field" — never an empty string on disk. With the join UI visible the
      // RECONCILED ids are written (what the pickers display); without map
      // state the stored ids pass through untouched, so editing a card while
      // the map is unavailable never strips its joins.
      return withCardJoin(
        {
          ...(existing?.archived == null ? {} : { archived: existing.archived }),
          ...(checklist.length > 0 ? { checklist } : {}),
          created: existing?.created ?? todayIso(),
          detail: cardDetail,
          domainId,
          id:
            existing?.id ??
            createCardId(cardType, domainId, title, new Set(cards.map((c) => c.id))),
          ...(existing?.pinned == null ? {} : { pinned: existing.pinned }),
          priority: Number.parseInt(cardPriority, 10),
          source: existing?.source ?? "board:director",
          status: existing?.status ?? "open",
          ...(existing?.terminalAt == null ? {} : { terminalAt: existing.terminalAt }),
          title,
          type: cardType,
        },
        joinUiAvailable
          ? { contextId: effectiveCardContextId, entityId: effectiveCardEntityId }
          : { contextId: cardContextId, entityId: cardEntityId },
      );
    },
    [
      cardChecklist,
      cardContextId,
      cardDetail,
      cardDomainId,
      cardEntityId,
      cardPriority,
      cardTitle,
      cardType,
      cards,
      effectiveCardContextId,
      effectiveCardEntityId,
      joinUiAvailable,
    ],
  );

  const editCard = useCallback((card: InfoHubCard) => {
    setEditingCardId(card.id);
    setDetailCard(null);
    setCardType(card.type);
    setCardDomainId(card.domainId);
    setCardPriority(String(card.priority));
    setCardTitle(card.title ?? "");
    setCardDetail(card.detail ?? "");
    setCardChecklist(checklistToText(card.checklist));
    setCardContextId(card.contextId ?? "");
    setCardEntityId(card.entityId ?? "");
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      titleInputRef.current?.focus();
    });
  }, []);

  /**
   * Promote a card to a project (plan §1.1): one revision-guarded map save
   * creating the (unplaced) entity, then the card joins it through the
   * existing board save path. A map failure leaves the card untouched and
   * branches conflict-vs-error copy; a board-join failure parks the created
   * entity as a PendingPromotion so retrying only re-attempts the join.
   */
  const promoteCard = useCallback(
    async (card: InfoHubCard, contextId: string) => {
      if (mapState == null || onSaveMapState == null) {
        return;
      }
      setPromoting(true);
      setPromoteError(null);
      let created = pendingPromotion?.cardId === card.id ? pendingPromotion : null;
      if (created == null) {
        if (contextId.length === 0) {
          setPromoting(false);
          return;
        }
        const { next, entity } = withEntityCreated(
          mapState,
          promotionDraftFromCard(card, contextId),
        );
        const failure = await onSaveMapState(next);
        if (failure != null) {
          setPromoteError(
            failure.kind === "conflict"
              ? {
                  kind: "conflict",
                  message: "The map changed since it loaded here — refresh the map data and retry.",
                }
              : {
                  kind: "error",
                  message: `Couldn't add the project to the map: ${failure.message}`,
                },
          );
          setPromoting(false);
          return;
        }
        created = { cardId: card.id, contextId, entityId: entity.id, entityName: entity.name };
        setPendingPromotion(created);
      }
      const joined = withCardJoin(card, {
        contextId: created.contextId,
        entityId: created.entityId,
      });
      const result = await onSaveCards(
        cards.map((candidate) => (candidate.id === card.id ? joined : candidate)),
      );
      setPromoting(false);
      if (result == null) {
        setPromoteError({
          kind: "join",
          message:
            `The project "${created.entityName}" is on the map, but joining the card failed — ` +
            "retry the join.",
        });
        return;
      }
      setPendingPromotion(null);
      setDetailCard(joined);
    },
    [cards, mapState, onSaveCards, onSaveMapState, pendingPromotion],
  );

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
      const nextCard = withChecklistItemToggled(target, index);
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
          {domainFilterOptions.length > 0 ? (
            <label className="info-hub-filter-field">
              Domain
              <select
                aria-label="Work order domain filter"
                onChange={(event) => setDomainFilter(event.target.value)}
                value={domainFilter}
              >
                <option value="">All domains</option>
                {domainFilterOptions.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name}
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
                        <WorkOrderCardFace
                          card={card}
                          domainNameById={domainNameById}
                          onOpen={() => setDetailCard(card)}
                        />
                        <div className="info-hub-card-actions">
                          <WorkOrderStatusActions
                            card={card}
                            onMoveStatus={moveCardStatus}
                            saving={saving}
                          />
                          {isTerminalStatus(card.status) ? (
                            <>
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
                    <h3 className="info-hub-card-title">{cardTitleLabel(entry.card)}</h3>
                    <p className="info-hub-card-scope">
                      {cardScopeLabel(entry.card, domainNameById)}
                    </p>
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
          <WorkOrderDetailModal
            card={detailCard}
            domainNameById={domainNameById}
            onClose={() => setDetailCard(null)}
            onToggleChecklistItem={toggleChecklistItem}
            footer={
              joinUiAvailable && onSaveMapState != null && detailCard.entityId == null ? (
                <div
                  className="mt-3 border-t border-[color:var(--viewer-canvas-rule)] pt-3"
                  data-testid="promote-card-section"
                >
                  <div className="info-hub-form-row">
                    <label className="info-hub-filter-field">
                      Map context
                      <select
                        aria-label="Promote target context"
                        // Once the project exists (a parked join retry), the
                        // context is settled — only the join is left.
                        disabled={pendingPromotion?.cardId === detailCard.id}
                        onChange={(event) => setPromoteContextId(event.target.value)}
                        value={promoteContextId}
                      >
                        <option value="">Pick a context…</option>
                        <ContextOptions contexts={mapContexts} />
                      </select>
                    </label>
                    <div className="info-hub-form-actions">
                      <button
                        className="info-hub-action-btn"
                        data-variant="positive"
                        data-testid="promote-card-button"
                        disabled={
                          saving ||
                          mapSaving ||
                          promoting ||
                          (pendingPromotion?.cardId !== detailCard.id &&
                            promoteContextId.length === 0)
                        }
                        onClick={() => void promoteCard(detailCard, promoteContextId)}
                        title="Create an unplaced project on the map from this card and join the card to it"
                        type="button"
                      >
                        {promoting
                          ? "Promoting…"
                          : pendingPromotion?.cardId === detailCard.id
                            ? "Retry join"
                            : "Promote to project"}
                      </button>
                    </div>
                  </div>
                  {detailCard.contextId != null &&
                  !mapContexts.some((context) => context.id === detailCard.contextId) ? (
                    <p className="info-hub-card-scope mt-2" data-testid="promote-context-gone">
                      This card&apos;s stored context (&quot;{detailCard.contextId}&quot;) no longer
                      exists on the map — pick one.
                    </p>
                  ) : null}
                  {promoteError != null ? (
                    <p className="info-hub-form-error mt-2" data-testid="promote-card-error">
                      {promoteError.message}
                      {promoteError.kind === "conflict" && onRefreshMapState != null ? (
                        <button
                          className="info-hub-action-btn ml-2"
                          onClick={onRefreshMapState}
                          type="button"
                        >
                          Refresh map data
                        </button>
                      ) : null}
                    </p>
                  ) : null}
                </div>
              ) : detailCard.entityId != null ? (
                <p className="info-hub-card-scope mt-3" data-testid="card-join-note">
                  Joined to{" "}
                  {mapEntities.find((entity) => entity.id === detailCard.entityId)?.name ??
                    detailCard.entityId}{" "}
                  on the map.
                </p>
              ) : null
            }
          />
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
              Domain
              <select
                aria-label="Work order domain"
                disabled={!domainPickerAvailable}
                onChange={(event) => setCardDomainId(event.target.value)}
                value={cardDomainId}
              >
                <option value="">
                  {domainPickerAvailable ? "Pick a domain…" : "No domains available"}
                </option>
                {mapDomains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name}
                  </option>
                ))}
              </select>
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
          {joinUiAvailable ? (
            <div className="info-hub-form-row mt-2" data-testid="card-join-pickers">
              <label className="info-hub-form-field">
                Map context (optional)
                <select
                  aria-label="Card map context"
                  onChange={(event) => {
                    const nextContextId = event.target.value;
                    setCardContextId(nextContextId);
                    // A picked entity that lives elsewhere no longer fits.
                    const entity = mapEntities.find((candidate) => candidate.id === cardEntityId);
                    if (
                      entity != null &&
                      nextContextId.length > 0 &&
                      entity.contextId !== nextContextId
                    ) {
                      setCardEntityId("");
                    }
                  }}
                  // The RECONCILED id: a stored context that left the map
                  // renders (and saves) as "No context", never silently
                  // written back stale.
                  value={effectiveCardContextId}
                >
                  <option value="">No context</option>
                  <ContextOptions contexts={mapContexts} />
                </select>
              </label>
              <label className="info-hub-form-field">
                Project / System (optional)
                <select
                  aria-label="Card map entity"
                  onChange={(event) => {
                    const nextEntityId = event.target.value;
                    setCardEntityId(nextEntityId);
                    // Joining an entity adopts its context, so the stored
                    // card always carries a consistent contextId pair.
                    const entity = mapEntities.find((candidate) => candidate.id === nextEntityId);
                    if (entity != null) {
                      setCardContextId(entity.contextId);
                    }
                  }}
                  // The RECONCILED id: a stored entity that left the map (or
                  // moved contexts) renders (and saves) as Loose — the write
                  // always matches the display.
                  value={effectiveCardEntityId}
                >
                  <option value="">Loose (stray pile when a context is set)</option>
                  {entityOptions.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name} · {entityKindLabel(entity.kind)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
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
