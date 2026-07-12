import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Effect from "effect/Effect";
import {
  fetchStudioRegistry,
  fetchStudioRunEvents,
  saveStudioBoard,
  studioRuntimeErrorMessage,
  type StudioBoard,
  type StudioBoardCard,
  type StudioRegistry,
  type StudioRunEvents,
  type StudioRung,
} from "../../app/runtime/studio";
import type { RuntimePlaybook } from "../../app/runtime/schemas";
import {
  activeWorkOrderLane,
  archiveDateForTerminalCard,
  inWorkOrderArchive,
  isAgeArchived,
  isTerminalStatus,
  passesPrioritySift,
  priorityLabel,
  sortCardsByPriority,
  studioPlayHref,
  withStatus,
  withoutArchiveOverride,
  type ActiveWorkOrderStatus,
  type ArchiveDisposition,
  type ArchiveKindFilter,
  type PrioritySortDirection,
  type WorkOrderStatus,
  type WorkOrderType,
} from "./boardModel";
import { CatalogTab } from "./CatalogTab";
import { DamienTab } from "./DamienTab";
import { PlayPage } from "./PlayPage";
import { PlayTrackerTab } from "./PlayTrackerTab";
import { RavenTab } from "./RavenTab";

/**
 * Play Maker's Studio surfaces (Studio → Fabro plan, Slice 4 — pulled
 * forward by Director ruling 2026-06-12: "I need the full debug
 * surfaces from the beginning"). Board, Registry, play records (the
 * derived renderings and dry-run records), and live factory runs.
 * Records stay files under studio/; the viewer renders, it does not
 * own them. Cards advance a column only on a Director confirm.
 */

// The six unified production stages. The Board is the single source of truth;
// a card advances a stage only on a Director confirm (the ▸). `built` includes
// authoring AND choosing the play's fixtures. Stage advances per stage; a
// separate per-card "● ready" marker means the work is done, awaiting confirm.

// The stage keys in ladder order, and their plain labels — shared so other
// surfaces (RavenTab) read the same vocabulary as the Board (one source).
export const STAGE_ORDER = ["backlog", "sourced", "designed", "built", "proven", "live"] as const;

export type StudioStage = (typeof STAGE_ORDER)[number];

export const STAGE_LABELS: Readonly<Record<StudioStage, string>> = {
  backlog: "Backlog",
  built: "Built",
  designed: "Designed",
  live: "Live",
  proven: "Proven",
  sourced: "Sourced",
};

export function isStudioStage(stage: string): stage is StudioStage {
  return STAGE_ORDER.some((candidate) => candidate === stage);
}

function normalizeStageKey(stage: string): string {
  return stage === "empty" ? "backlog" : stage;
}

export function stageLabel(stage: string | undefined): string {
  if (stage == null) {
    return STAGE_LABELS.backlog;
  }
  const normalized = normalizeStageKey(stage);
  return isStudioStage(normalized) ? STAGE_LABELS[normalized] : stage;
}

// The gate description per stage — the bar a card clears to advance.
const STAGE_GATES: Readonly<Record<StudioStage, string>> = {
  backlog: "Named and waiting in the work pool.",
  built: "Workflow + fixtures built.",
  designed: "The logic is drawn.",
  live: "Registered — users can run it.",
  proven: "Runs on its fixtures and holds.",
  sourced: "Source material gathered.",
};

// The Board columns, derived from STAGE_ORDER so keys/labels/order live once.
const BOARD_COLUMNS = STAGE_ORDER.map((key) => ({
  gate: STAGE_GATES[key],
  key,
  title: STAGE_LABELS[key],
}));

// A fresh, mutable copy of every board column — the base for a board edit.
function cloneStages(stages: Record<string, readonly string[]>): Record<string, string[]> {
  return normalizeBoardStages(stages);
}

function normalizeBoardStages(stages: Record<string, readonly string[]>): Record<string, string[]> {
  const next: Record<string, string[]> = {};
  for (const column of BOARD_COLUMNS) {
    next[column.key] = [];
  }
  for (const [rawKey, slugs] of Object.entries(stages)) {
    const key = normalizeStageKey(rawKey);
    if (!isStudioStage(key)) {
      continue;
    }
    const existing = new Set(next[key]);
    for (const slug of slugs) {
      if (!existing.has(slug)) {
        next[key].push(slug);
        existing.add(slug);
      }
    }
  }
  return next;
}

// Badge color per production stage.
export function stageBadgeColor(stage: string): string {
  switch (normalizeStageKey(stage)) {
    case "backlog":
      return "border-[#6a5e4e]/60 text-[#b9aa91]";
    case "sourced":
      return "border-[#e8a64f]/50 text-[#e8a64f]";
    case "designed":
      return "border-[#f0c060]/50 text-[#f0c060]";
    case "built":
      return "border-[#4fb8a8]/50 text-[#7ad4c4]";
    case "proven":
      return "border-[#78dc82]/50 text-[#9be8a0]";
    case "live":
      return "border-[#b090e8]/50 text-[#c0a8f0]";
    default:
      return "border-[#6a5e4e]/60 text-[#9a8c78]";
  }
}

const WORK_ORDER_TYPES: WorkOrderType[] = ["testing", "improvement", "bug"];
const WORK_ORDER_STATUSES: ActiveWorkOrderStatus[] = ["open", "in-progress", "done"];
const WORK_ORDER_STATUS_FILTERS: WorkOrderStatus[] = ["open", "in-progress", "done", "wont-do"];
const ARCHIVE_DISPOSITIONS: ArchiveDisposition[] = ["done", "wont-do", "graduated"];

const WORK_ORDER_TYPE_LABELS: Readonly<Record<WorkOrderType, string>> = {
  bug: "Bug",
  improvement: "Improvement",
  testing: "Testing",
};

const WORK_ORDER_STATUS_LABELS: Readonly<Record<WorkOrderStatus, string>> = {
  done: "Done",
  "in-progress": "In Progress",
  open: "Open",
  "wont-do": "Won't Do",
};

const WORK_ORDER_DEFAULT_PRIORITY: Readonly<Record<WorkOrderType, number>> = {
  bug: 10,
  improvement: 20,
  testing: 15,
};

function defaultPriority(type: WorkOrderType): number {
  return WORK_ORDER_DEFAULT_PRIORITY[type] ?? 50;
}

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
  scope: string,
  title: string,
  existingIds: ReadonlySet<string>,
): string {
  const base = `wo-${slugify(scope || "system")}-${slugify(type)}-${slugify(title || "card") || "card"}`;
  let id = base;
  let suffix = 2;
  while (existingIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function parseChecklist(text: string): NonNullable<StudioBoardCard["checklist"]> {
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

function checklistToText(checklist: StudioBoardCard["checklist"]): string {
  return (checklist ?? []).map((item) => `[${item.done ? "x" : " "}] ${item.text}`).join("\n");
}

function cardScopeLabel(card: StudioBoardCard, bySlug: ReadonlyMap<string, StudioRung>): string {
  if (card.play != null) {
    return `${bySlug.get(card.play)?.name ?? card.play} · ${card.division} / ${card.function}`;
  }
  return `System · ${card.division} / ${card.function}`;
}

function cardBorderClass(type: WorkOrderType): string {
  switch (type) {
    case "bug":
      return "border-l-[#d06d5f]";
    case "improvement":
      return "border-l-[#d4a052]";
    case "testing":
      return "border-l-[#4fb8a8]";
  }
}

type WorkOrderArchiveEntry = {
  card: StudioBoardCard;
  date: string | null;
  disposition: WorkOrderStatus;
  id: string;
  kind: "work-order";
  play: string;
  searchText: string;
  title: string;
  type: WorkOrderType;
};

type PlayArchiveEntry = {
  date: string | null;
  disposition: "graduated";
  id: string;
  kind: "play";
  play: string;
  rung: StudioRung | null;
  searchText: string;
  title: string;
  type: "play";
};

type ArchiveEntry = WorkOrderArchiveEntry | PlayArchiveEntry;

function selectOptionsFromRungs(
  rungs: readonly StudioRung[],
): Array<{ label: string; value: string }> {
  return rungs.map((rung) => ({ label: rung.name, value: rung.slug }));
}

type StudioTab = "raven" | "catalog" | "damien" | "board" | "play" | "runs" | "tracker";

function isStudioTab(tab: string | null): tab is StudioTab {
  return (
    tab === "raven" ||
    tab === "catalog" ||
    tab === "damien" ||
    tab === "board" ||
    tab === "play" ||
    tab === "runs" ||
    tab === "tracker"
  );
}

function useStudioRegistry(): {
  error: string | null;
  refresh: () => void;
  registry: StudioRegistry | null;
} {
  const [registry, setRegistry] = useState<StudioRegistry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(() => {
    // Each refresh decodes a brand-new registry object, so `registry.board` is a
    // fresh reference every time. BoardView's archive clock keys off that
    // identity to age cards out without a reload — don't add referential reuse
    // (e.g. skipping setState when "unchanged") without re-deriving that clock.
    void Effect.runPromise(fetchStudioRegistry()).then(
      (value) => {
        setRegistry(value);
        setError(null);
      },
      (cause: unknown) => setError(String(cause)),
    );
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { error, refresh, registry };
}

function PanelFrame(props: { children: React.ReactNode; title: string }): React.ReactElement {
  return (
    <div className="border border-[#4b3827] bg-[#1d140b]/70 p-5 shadow-[0_18px_36px_rgba(0,0,0,0.35)]">
      <h2 className="font-display text-[20px] text-[#d4a052]">{props.title}</h2>
      <div className="mt-3">{props.children}</div>
    </div>
  );
}

function BoardView(props: {
  board: StudioBoard | null;
  onMoved: () => void;
  onOpenPlay: (slug: string) => void;
  rungs: readonly StudioRung[];
}): React.ReactElement {
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [detailCard, setDetailCard] = useState<StudioBoardCard | null>(null);
  const [selectedPlay, setSelectedPlay] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | WorkOrderType>("");
  const [statusFilter, setStatusFilter] = useState<"" | WorkOrderStatus>("");
  const [prioritySort, setPrioritySort] = useState<PrioritySortDirection>("urgent-first");
  const [maxPriority, setMaxPriority] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveDispositionFilter, setArchiveDispositionFilter] = useState<"" | ArchiveDisposition>(
    "",
  );
  const [archiveKindFilter, setArchiveKindFilter] = useState<"" | ArchiveKindFilter>("");
  const [archivePlayFilter, setArchivePlayFilter] = useState("");
  const [archiveDateFilter, setArchiveDateFilter] = useState("");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardType, setCardType] = useState<WorkOrderType>("improvement");
  const [cardPlay, setCardPlay] = useState("");
  const [cardDivision, setCardDivision] = useState("Product");
  const [cardFunction, setCardFunction] = useState("Insight");
  const [cardPriority, setCardPriority] = useState(String(defaultPriority("improvement")));
  const [cardTitle, setCardTitle] = useState("");
  const [cardDetail, setCardDetail] = useState("");
  const [cardChecklist, setCardChecklist] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const bySlug = useMemo(
    () => new Map(props.rungs.map((rung) => [rung.slug, rung])),
    [props.rungs],
  );
  const graduated = useMemo(() => props.board?.graduated ?? [], [props.board?.graduated]);
  const graduatedAt = useMemo(() => props.board?.graduatedAt ?? {}, [props.board?.graduatedAt]);
  const graduatedSet = useMemo(() => new Set(graduated), [graduated]);
  const stages = useMemo(
    () => normalizeBoardStages(props.board?.stages ?? {}),
    [props.board?.stages],
  );
  const activeStageSlugs = useMemo(
    () =>
      Object.values(stages)
        .flat()
        .filter((slug) => !graduatedSet.has(slug)),
    [graduatedSet, stages],
  );
  const boardSlugs = useMemo(() => new Set(activeStageSlugs), [activeStageSlugs]);
  const playOptions = useMemo(
    () => selectOptionsFromRungs(props.rungs.filter((rung) => boardSlugs.has(rung.slug))),
    [boardSlugs, props.rungs],
  );
  const archivePlayOptions = useMemo(() => selectOptionsFromRungs(props.rungs), [props.rungs]);
  const readySet = useMemo(() => new Set(props.board?.ready ?? []), [props.board?.ready]);
  const cards = useMemo(() => sortCardsByPriority(props.board?.cards ?? []), [props.board?.cards]);
  // Refreshed with each board payload so derived archive membership can age out
  // after a registry refresh without a full page reload.
  const now = useMemo(() => new Date(), [props.board]);
  const activeCards = useMemo(
    () => cards.filter((card) => !inWorkOrderArchive(card, now)),
    [cards, now],
  );
  const archivedCards = useMemo(
    () => cards.filter((card) => inWorkOrderArchive(card, now)),
    [cards, now],
  );
  // Sift ceiling: keep cards at or above this urgency (priority ≤ N). Blank,
  // non-numeric, or negative input means no sift (a negative ceiling would empty the
  // board — guarded here as well as via the input's min). Unprioritized cards always
  // survive the sift; they sort to the bottom rather than being dropped.
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
        if (selectedPlay.length > 0 && card.play !== selectedPlay) {
          return false;
        }
        if (typeFilter.length > 0 && card.type !== typeFilter) {
          return false;
        }
        if (statusFilter.length > 0 && card.status !== statusFilter) {
          return false;
        }
        if (!passesPrioritySift(card, maxPriorityValue)) {
          return false;
        }
        return true;
      }),
    [activeCards, maxPriorityValue, selectedPlay, statusFilter, typeFilter],
  );
  // Derived view: re-order the filtered set by the chosen sort direction. The
  // stored `cards` order stays canonical (urgent-first); sorting never rewrites
  // priorities.
  const orderedCards = useMemo(
    () => sortCardsByPriority(filteredCards, prioritySort),
    [filteredCards, prioritySort],
  );
  const selectedPlayName =
    selectedPlay.length > 0 ? (bySlug.get(selectedPlay)?.name ?? selectedPlay) : "";
  const archiveEntries = useMemo<ArchiveEntry[]>(() => {
    const workOrderEntries = archivedCards.map<WorkOrderArchiveEntry>((card) => {
      const playName = card.play == null ? "System" : (bySlug.get(card.play)?.name ?? card.play);
      const title = card.title ?? WORK_ORDER_TYPE_LABELS[card.type];
      return {
        card,
        date: archiveDateForTerminalCard(card),
        disposition: card.status,
        id: card.id,
        kind: "work-order",
        play: card.play ?? "",
        searchText: [
          title,
          card.detail ?? "",
          card.id,
          playName,
          card.division,
          card.function,
          WORK_ORDER_TYPE_LABELS[card.type],
          WORK_ORDER_STATUS_LABELS[card.status],
        ]
          .join(" ")
          .toLowerCase(),
        title,
        type: card.type,
      };
    });
    // Render every graduated slug, even one absent from the registry, so a
    // stray entry (an unknown slug an `/api/studio/board` POST persisted) stays
    // visible and restorable instead of silently orphaning in board-state.json.
    const graduatedEntries = graduated.map<PlayArchiveEntry>((slug) => {
      const rung = bySlug.get(slug) ?? null;
      const title = rung?.name ?? slug;
      return {
        date: graduatedAt[slug] ?? null,
        disposition: "graduated",
        id: `play-${slug}`,
        kind: "play",
        play: slug,
        rung,
        searchText: [
          title,
          slug,
          rung?.division ?? "",
          rung?.function ?? "",
          rung?.status ?? "",
          "graduated",
        ]
          .join(" ")
          .toLowerCase(),
        title,
        type: "play",
      };
    });
    return [...workOrderEntries, ...graduatedEntries];
  }, [archivedCards, bySlug, graduated, graduatedAt]);
  const filteredArchiveEntries = useMemo(() => {
    const search = archiveSearch.trim().toLowerCase();
    return archiveEntries.filter((entry) => {
      if (search.length > 0 && !entry.searchText.includes(search)) {
        return false;
      }
      if (archiveDispositionFilter.length > 0 && entry.disposition !== archiveDispositionFilter) {
        return false;
      }
      if (archiveKindFilter.length > 0 && entry.type !== archiveKindFilter) {
        return false;
      }
      if (archivePlayFilter.length > 0 && entry.play !== archivePlayFilter) {
        return false;
      }
      if (archiveDateFilter.length > 0 && entry.date !== archiveDateFilter) {
        return false;
      }
      return true;
    });
  }, [
    archiveDateFilter,
    archiveDispositionFilter,
    archiveEntries,
    archiveKindFilter,
    archivePlayFilter,
    archiveSearch,
  ]);

  const playDefaults = useCallback(
    (slug: string): { division: string; functionName: string } => {
      const rung = bySlug.get(slug);
      return {
        division: rung?.division ?? "Product",
        functionName: rung?.function ?? "Insight",
      };
    },
    [bySlug],
  );

  const applyPlayDefaults = useCallback(
    (slug: string) => {
      if (slug.length === 0) {
        return;
      }
      const defaults = playDefaults(slug);
      setCardDivision(defaults.division);
      setCardFunction(defaults.functionName);
    },
    [playDefaults],
  );

  const selectPlayView = useCallback(
    (slug: string) => {
      setSelectedPlay(slug);
      if (editingCardId == null) {
        setCardPlay(slug);
        applyPlayDefaults(slug);
      }
    },
    [applyPlayDefaults, editingCardId],
  );

  const resetForm = useCallback(
    (nextPlay = selectedPlay) => {
      setEditingCardId(null);
      setCardType("improvement");
      setCardPlay(nextPlay);
      if (nextPlay.length > 0) {
        const defaults = playDefaults(nextPlay);
        setCardDivision(defaults.division);
        setCardFunction(defaults.functionName);
      } else {
        setCardDivision("Product");
        setCardFunction("Insight");
      }
      setCardPriority(String(defaultPriority("improvement")));
      setCardTitle("");
      setCardDetail("");
      setCardChecklist("");
    },
    [playDefaults, selectedPlay],
  );

  const saveBoard = useCallback(
    (
      nextStages: Record<string, string[]>,
      nextReady: ReadonlySet<string>,
      nextGraduated: readonly string[] = graduated,
    ) => {
      const boardSlugs = new Set(Object.values(nextStages).flat());
      setPending(true);
      void Effect.runPromise(
        saveStudioBoard({
          graduated: nextGraduated,
          ready: [...nextReady].filter((slug) => boardSlugs.has(slug)),
          stages: nextStages,
        }),
      ).then(
        () => {
          setPending(false);
          setSaveError(null);
          props.onMoved();
        },
        (cause: unknown) => {
          setPending(false);
          setSaveError(studioRuntimeErrorMessage(cause, "board save failed"));
        },
      );
    },
    [graduated, props.onMoved],
  );

  const saveCards = useCallback(
    (nextCards: readonly StudioBoardCard[], onSuccess?: () => void) => {
      setPending(true);
      void Effect.runPromise(
        saveStudioBoard({
          cards: nextCards,
          graduated,
          ready: [...readySet].filter((slug) => boardSlugs.has(slug)),
          stages,
        }),
      ).then(
        () => {
          setPending(false);
          setSaveError(null);
          onSuccess?.();
          props.onMoved();
        },
        (cause: unknown) => {
          setPending(false);
          setSaveError(studioRuntimeErrorMessage(cause, "board save failed"));
        },
      );
    },
    [boardSlugs, graduated, props.onMoved, readySet, stages],
  );

  const move = useCallback(
    (slug: string, fromKey: StudioStage, toKey: StudioStage) => {
      const next = cloneStages(stages);
      next[fromKey] = (next[fromKey] ?? []).filter((item) => item !== slug);
      (next[toKey] ?? []).unshift(slug);
      const nextReady = new Set(readySet);
      nextReady.delete(slug);
      saveBoard(next, nextReady);
    },
    [readySet, saveBoard, stages],
  );

  const toggleReady = useCallback(
    (slug: string) => {
      const next = cloneStages(stages);
      const nextReady = new Set(readySet);
      if (nextReady.has(slug)) {
        nextReady.delete(slug);
      } else {
        nextReady.add(slug);
      }
      saveBoard(next, nextReady);
    },
    [readySet, saveBoard, stages],
  );

  const graduatePlay = useCallback(
    (slug: string) => {
      const rungName = bySlug.get(slug)?.name ?? slug;
      if (!window.confirm(`Graduate ${rungName} into the Work Board archive?`)) {
        return;
      }
      const next = cloneStages(stages);
      for (const key of STAGE_ORDER) {
        next[key] = (next[key] ?? []).filter((item) => item !== slug);
      }
      const nextReady = new Set(readySet);
      nextReady.delete(slug);
      const nextGraduated = Array.from(new Set([...graduated, slug]));
      saveBoard(next, nextReady, nextGraduated);
    },
    [bySlug, graduated, readySet, saveBoard, stages],
  );

  const restoreGraduatedPlay = useCallback(
    (slug: string) => {
      const next = cloneStages(stages);
      for (const key of STAGE_ORDER) {
        next[key] = (next[key] ?? []).filter((item) => item !== slug);
      }
      next.live = [slug, ...(next.live ?? [])];
      saveBoard(
        next,
        readySet,
        graduated.filter((item) => item !== slug),
      );
    },
    [graduated, readySet, saveBoard, stages],
  );

  const formError = useMemo(() => {
    if (cardType === "testing" && cardPlay.length === 0) {
      return "Testing needs a play.";
    }
    if (
      cardType === "testing" &&
      cards.some(
        (card) => card.type === "testing" && card.play === cardPlay && card.id !== editingCardId,
      )
    ) {
      return `${bySlug.get(cardPlay)?.name ?? cardPlay} already has a Testing card.`;
    }
    if (cardDivision.trim().length === 0 || cardFunction.trim().length === 0) {
      return "Division and function are required.";
    }
    const priority = Number.parseInt(cardPriority, 10);
    if (!Number.isInteger(priority)) {
      return "Priority must be a whole number.";
    }
    return null;
  }, [bySlug, cardDivision, cardFunction, cardPlay, cardPriority, cardType, cards, editingCardId]);

  const buildCardFromForm = useCallback(
    (existing: StudioBoardCard | null): StudioBoardCard => {
      const type = existing?.type === "testing" ? "testing" : cardType;
      const play = existing?.type === "testing" ? (existing.play ?? "") : cardPlay;
      const title = cardTitle.trim() || WORK_ORDER_TYPE_LABELS[type];
      const scope = play.length > 0 ? play : `${cardDivision}-${cardFunction}`;
      const checklist = parseChecklist(cardChecklist);
      const next: StudioBoardCard = {
        ...(existing?.archived == null ? {} : { archived: existing.archived }),
        created: existing?.created ?? todayIso(),
        detail: cardDetail,
        division: cardDivision.trim(),
        function: cardFunction.trim(),
        id: existing?.id ?? createCardId(type, scope, title, new Set(cards.map((card) => card.id))),
        ...(play.length > 0 ? { play } : {}),
        ...(existing?.pinned == null ? {} : { pinned: existing.pinned }),
        priority: Number.parseInt(cardPriority, 10),
        source: existing?.source ?? "board:director",
        status: existing?.status ?? "open",
        ...(existing?.terminalAt == null ? {} : { terminalAt: existing.terminalAt }),
        title,
        type,
        ...(type === "testing"
          ? {
              checklist:
                checklist.length > 0
                  ? checklist
                  : [{ done: false, text: "Define the next proof campaign." }],
            }
          : {}),
      };
      return next;
    },
    [
      cardChecklist,
      cardDetail,
      cardDivision,
      cardFunction,
      cardPlay,
      cardPriority,
      cardTitle,
      cardType,
      cards,
    ],
  );

  const saveCard = useCallback(
    (event: React.SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (formError != null || pending) {
        return;
      }
      const existing =
        editingCardId == null ? null : (cards.find((card) => card.id === editingCardId) ?? null);
      const nextCard = buildCardFromForm(existing);
      const nextCards =
        existing == null
          ? sortCardsByPriority([...cards, nextCard])
          : cards.map((card) => (card.id === existing.id ? nextCard : card));
      saveCards(nextCards, () => resetForm());
    },
    [buildCardFromForm, cards, editingCardId, formError, pending, resetForm, saveCards],
  );

  const editCard = useCallback((card: StudioBoardCard) => {
    setEditingCardId(card.id);
    setDetailCard(null);
    setCardType(card.type);
    setCardPlay(card.play ?? "");
    setCardDivision(card.division);
    setCardFunction(card.function);
    setCardPriority(String(card.priority));
    setCardTitle(card.title ?? "");
    setCardDetail(card.detail ?? "");
    setCardChecklist(checklistToText(card.checklist));
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      titleInputRef.current?.focus();
    });
  }, []);

  const moveCardStatus = useCallback(
    (id: string, status: WorkOrderStatus) => {
      saveCards(cards.map((card) => (card.id === id ? withStatus(card, status) : card)));
    },
    [cards, saveCards],
  );

  const archiveNow = useCallback(
    (id: string) => {
      saveCards(cards.map((card) => (card.id === id ? { ...card, archived: true } : card)));
    },
    [cards, saveCards],
  );

  const keepOnBoard = useCallback(
    (id: string) => {
      saveCards(
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
    [cards, saveCards],
  );

  const restoreWorkOrder = useCallback(
    (card: StudioBoardCard) => {
      saveCards(
        cards.map((candidate) => {
          if (candidate.id !== card.id) {
            return candidate;
          }
          const restored = withoutArchiveOverride(candidate);
          return isAgeArchived(restored, now) ? { ...restored, pinned: true } : restored;
        }),
      );
    },
    [cards, now, saveCards],
  );

  const openPlayCard = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      window.history.pushState(null, "", studioPlayHref(slug));
      props.onOpenPlay(slug);
    },
    [props.onOpenPlay],
  );

  return (
    <div>
      {saveError != null ? (
        <p className="mb-3 text-[12px] text-[#e08a8a]" data-testid="studio-board-save-error">
          {saveError}
        </p>
      ) : null}
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <h3 className="font-display text-[18px] text-[#e8b86d]">Play Making</h3>
          <span className="text-[11px] text-[#8f806c]">{activeStageSlugs.length} cards</span>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
          {BOARD_COLUMNS.map((column, columnIndex) => (
            <div className="rounded-[6px] border border-[#3a2c1e] bg-black/25 p-3" key={column.key}>
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-display text-[16px] text-[#e8b86d]">{column.title}</h4>
                <span className="rounded border border-[#4b3827] px-1.5 text-[10px] text-[#9a8c78]">
                  {(stages[column.key] ?? []).filter((slug) => !graduatedSet.has(slug)).length}
                </span>
              </div>
              <p className="mt-1 min-h-[40px] text-[10px] leading-4 text-[#8f806c]">
                {column.gate}
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {(stages[column.key] ?? [])
                  .filter((slug) => !graduatedSet.has(slug))
                  .map((slug) => {
                    const rung = bySlug.get(slug);
                    const prevColumn = BOARD_COLUMNS[columnIndex - 1];
                    const nextColumn = BOARD_COLUMNS[columnIndex + 1];
                    return (
                      <article
                        className="rounded-[5px] border border-[#4b3827] border-l-[3px] border-l-[#d4a052] bg-[#241a10] p-3"
                        data-testid={`studio-play-card-${slug}`}
                        key={slug}
                      >
                        <a
                          className="-mx-1 -mt-1 block rounded-[3px] px-1 pt-1 hover:bg-white/[0.03] focus:outline-none focus:ring-1 focus:ring-[#e8b86d]/50"
                          href={studioPlayHref(slug)}
                          onClick={(event) => openPlayCard(event, slug)}
                        >
                          <span className="block text-[13px] font-semibold leading-5 text-[#e8e0d4]">
                            {rung?.glyph ?? "▫"} {rung?.name ?? slug}
                          </span>
                          <span className="mt-1 block text-[11px] leading-5 text-[#9a8c78]">
                            {rung?.division ?? "Product"} / {rung?.function ?? "Insight"}
                          </span>
                        </a>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {readySet.has(slug) ? (
                            <button
                              className="inline-flex items-center gap-1 rounded border border-[#4fb8a8]/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#7ad4c4] disabled:opacity-40"
                              disabled={pending}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                toggleReady(slug);
                              }}
                              title="Clear awaiting-confirm marker"
                              type="button"
                            >
                              <span aria-hidden>●</span> ready
                            </button>
                          ) : (
                            <button
                              className="rounded border border-[#4b3827] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#9a8c78] hover:border-[#4fb8a8]/50 hover:text-[#7ad4c4] disabled:opacity-40"
                              disabled={pending}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                toggleReady(slug);
                              }}
                              title="Mark work done and awaiting Director confirm"
                              type="button"
                            >
                              ○ ready
                            </button>
                          )}
                          <div className="ml-auto flex shrink-0 items-center gap-1">
                            {prevColumn != null ? (
                              <button
                                className="rounded-full border border-[#6a5132]/60 px-1.5 text-[11px] text-[#c9a878] disabled:opacity-40"
                                disabled={pending}
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  move(slug, column.key, prevColumn.key);
                                }}
                                title={`Move back to ${prevColumn.title} (rework)`}
                                type="button"
                              >
                                ◂
                              </button>
                            ) : null}
                            {nextColumn != null ? (
                              <button
                                className="rounded-full border border-[#4fb8a8]/60 px-1.5 text-[11px] text-[#7ad4c4] disabled:opacity-40"
                                disabled={pending}
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  move(slug, column.key, nextColumn.key);
                                }}
                                title={`Director confirm - advance to ${nextColumn.title}`}
                                type="button"
                              >
                                ▸
                              </button>
                            ) : null}
                          </div>
                          {column.key === "live" ? (
                            <button
                              className="rounded border border-[#b090e8]/60 px-2 py-0.5 text-[10px] text-[#c0a8f0] disabled:opacity-40"
                              disabled={pending}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                graduatePlay(slug);
                              }}
                              type="button"
                            >
                              Graduate
                            </button>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>
      {detailCard != null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDetailCard(null)}
          role="presentation"
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-[8px] border border-[#4b3827] bg-[#1c140c] p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-[#6a5132] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em] text-[#e8b86d]">
                  {WORK_ORDER_TYPE_LABELS[detailCard.type]}
                </span>
                <span
                  className="rounded border border-[#4b3827] px-1.5 py-0.5 text-[10px] text-[#b9aa91]"
                  title="Lower priority number is more urgent"
                >
                  {priorityLabel(detailCard)}
                </span>
                <span className="text-[10px] uppercase tracking-[0.08em] text-[#7ad4c4]">
                  {WORK_ORDER_STATUS_LABELS[detailCard.status]}
                </span>
              </div>
              <button
                className="text-[18px] leading-none text-[#9a8c78] hover:text-[#e8e0d4]"
                onClick={() => setDetailCard(null)}
                title="Close"
                type="button"
              >
                ×
              </button>
            </div>
            <h4 className="mt-3 font-display text-[18px] leading-6 text-[#e8b86d]">
              {detailCard.title ?? WORK_ORDER_TYPE_LABELS[detailCard.type]}
            </h4>
            <p className="mt-1 text-[11px] leading-5 text-[#9a8c78]">
              {cardScopeLabel(detailCard, bySlug)}
            </p>
            {detailCard.detail != null && detailCard.detail.length > 0 ? (
              <p className="mt-3 whitespace-pre-wrap text-[12px] leading-6 text-[#c9bba2]">
                {detailCard.detail}
              </p>
            ) : null}
            {detailCard.type === "testing" && detailCard.checklist != null ? (
              <ul className="mt-3 space-y-1 text-[12px] leading-6 text-[#b9aa91]">
                {detailCard.checklist.map((item, index) => (
                  <li
                    className={item.done ? "text-[#6a5e4e] line-through" : ""}
                    key={`detail-${detailCard.id}-check-${index}`}
                  >
                    {item.done ? "✓" : "□"} {item.text}
                  </li>
                ))}
              </ul>
            ) : null}
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-[#33271d] pt-3 text-[10px] text-[#8f806c]">
              <dt className="uppercase tracking-[0.08em]">Source</dt>
              <dd className="text-[#b9aa91]">{detailCard.source}</dd>
              <dt className="uppercase tracking-[0.08em]">Created</dt>
              <dd className="text-[#b9aa91]">{detailCard.created}</dd>
              <dt className="uppercase tracking-[0.08em]">Filing</dt>
              <dd className="text-[#b9aa91]">
                {detailCard.division} / {detailCard.function}
              </dd>
            </dl>
            <div className="mt-4 flex justify-end gap-2">
              {detailCard.play != null ? (
                <button
                  className="rounded border border-[#6a5132] px-2.5 py-1 text-[11px] text-[#d4a052]"
                  onClick={() => {
                    const slug = detailCard.play ?? "";
                    setDetailCard(null);
                    props.onOpenPlay(slug);
                  }}
                  type="button"
                >
                  View play
                </button>
              ) : null}
              <button
                className="rounded border border-[#4b3827] px-2.5 py-1 text-[11px] text-[#b9aa91] hover:text-[#e8e0d4]"
                onClick={() => setDetailCard(null)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mt-6 border-t border-[#3a2c1e] pt-5" data-testid="studio-board-work-orders">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-[18px] text-[#e8b86d]">
              Work Orders{selectedPlayName.length > 0 ? ` · ${selectedPlayName}` : ""}
            </h3>
            <p className="mt-1 text-[11px] text-[#8f806c]">
              {filteredCards.length} cards
              {typeFilter === "" ? "" : ` · ${WORK_ORDER_TYPE_LABELS[typeFilter]}`}
              {statusFilter === "" ? "" : ` · ${WORK_ORDER_STATUS_LABELS[statusFilter]}`}
              {maxPriorityValue == null ? "" : ` · Priority ≤ ${maxPriorityValue}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-[#b9aa91]">
            <label className="flex flex-col gap-1">
              Play
              <select
                aria-label="Work order play filter"
                className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                onChange={(event) => selectPlayView(event.target.value)}
                value={selectedPlay}
              >
                <option value="">All plays</option>
                {playOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Type
              <select
                aria-label="Work order type filter"
                className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
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
            <label className="flex flex-col gap-1">
              Status
              <select
                aria-label="Work order status filter"
                className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
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
            <div className="flex flex-col gap-1">
              <span>Sort</span>
              <button
                aria-label={
                  prioritySort === "urgent-first"
                    ? "Sort by priority: most urgent first — activate to reverse"
                    : "Sort by priority: least urgent first — activate to reverse"
                }
                aria-pressed={prioritySort === "urgent-last"}
                className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-left text-[#e8e0d4] hover:border-[#6a5132]"
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
            <label className="flex flex-col gap-1">
              Priority ≤
              <input
                aria-label="Maximum work order priority"
                className="w-20 rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                inputMode="numeric"
                min={0}
                onChange={(event) => setMaxPriority(event.target.value)}
                placeholder="Any"
                type="number"
                value={maxPriority}
              />
            </label>
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {WORK_ORDER_STATUSES.map((status) => {
            const laneCards = orderedCards.filter(
              (card) => activeWorkOrderLane(card.status) === status,
            );
            return (
              <section
                className="rounded-[6px] border border-[#3a2c1e] bg-black/20 p-3"
                data-testid={`work-order-lane-${status}`}
                key={status}
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-display text-[15px] text-[#d4a052]">
                    {WORK_ORDER_STATUS_LABELS[status]}
                  </h4>
                  <span className="rounded border border-[#4b3827] px-1.5 text-[10px] text-[#9a8c78]">
                    {laneCards.length}
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {laneCards.length === 0 ? (
                    <div className="rounded-[4px] border border-dashed border-[#3a2c1e] p-3 text-[11px] text-[#6a5e4e]">
                      No work-order cards here.
                    </div>
                  ) : (
                    laneCards.map((card) => (
                      <article
                        className={`rounded-[5px] border border-[#4b3827] border-l-[3px] bg-[#241a10] p-3 ${cardBorderClass(card.type)}`}
                        data-testid={`work-order-card-${card.id}`}
                        key={card.id}
                      >
                        <div
                          className="-mx-1 -mt-1 cursor-pointer rounded-[3px] px-1 pt-1 hover:bg-white/[0.03]"
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
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded border border-[#6a5132] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em] text-[#e8b86d]">
                              {WORK_ORDER_TYPE_LABELS[card.type]}
                            </span>
                            <span
                              className="rounded border border-[#4b3827] px-1.5 py-0.5 text-[10px] text-[#b9aa91]"
                              title="Lower priority number is more urgent"
                            >
                              {priorityLabel(card)}
                            </span>
                          </div>
                          <h5 className="mt-2 text-[13px] font-semibold leading-5 text-[#e8e0d4]">
                            {card.title ?? WORK_ORDER_TYPE_LABELS[card.type]}
                          </h5>
                          <div className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[#7ad4c4]">
                            {WORK_ORDER_STATUS_LABELS[card.status]}
                          </div>
                          <p className="mt-1 text-[11px] leading-5 text-[#9a8c78]">
                            {cardScopeLabel(card, bySlug)}
                          </p>
                          {/* The card face is a glance summary; the full detail and
                              checklist live in the click-to-open overlay. */}
                          {card.type === "testing" &&
                          card.checklist != null &&
                          card.checklist.length > 0 ? (
                            <p className="mt-2 text-[11px] leading-5 text-[#b9aa91]">
                              ✓ {card.checklist.filter((item) => item.done).length}/
                              {card.checklist.length} steps
                            </p>
                          ) : null}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {card.status === "open" ? (
                            <button
                              className="rounded border border-[#4fb8a8]/50 px-2 py-0.5 text-[10px] text-[#7ad4c4] disabled:opacity-40"
                              disabled={pending}
                              onClick={() => moveCardStatus(card.id, "in-progress")}
                              type="button"
                            >
                              Start
                            </button>
                          ) : null}
                          {card.status === "in-progress" ? (
                            <button
                              className="rounded border border-[#6a5132] px-2 py-0.5 text-[10px] text-[#c9a878] disabled:opacity-40"
                              disabled={pending}
                              onClick={() => moveCardStatus(card.id, "open")}
                              type="button"
                            >
                              Open
                            </button>
                          ) : null}
                          {card.status !== "done" ? (
                            <button
                              className="rounded border border-[#4fb8a8]/50 px-2 py-0.5 text-[10px] text-[#7ad4c4] disabled:opacity-40"
                              disabled={pending}
                              onClick={() => moveCardStatus(card.id, "done")}
                              type="button"
                            >
                              Close
                            </button>
                          ) : null}
                          {card.status !== "wont-do" ? (
                            <button
                              className="rounded border border-[#d06d5f]/50 px-2 py-0.5 text-[10px] text-[#e08a8a] disabled:opacity-40"
                              disabled={pending}
                              onClick={() => moveCardStatus(card.id, "wont-do")}
                              type="button"
                            >
                              Won&apos;t do
                            </button>
                          ) : null}
                          {isTerminalStatus(card.status) ? (
                            <>
                              <button
                                className="rounded border border-[#4fb8a8]/50 px-2 py-0.5 text-[10px] text-[#7ad4c4] disabled:opacity-40"
                                disabled={pending}
                                onClick={() => moveCardStatus(card.id, "in-progress")}
                                type="button"
                              >
                                Reopen
                              </button>
                              <button
                                className="rounded border border-[#6a5132] px-2 py-0.5 text-[10px] text-[#d4a052] disabled:opacity-40"
                                disabled={pending}
                                onClick={() => archiveNow(card.id)}
                                type="button"
                              >
                                Archive now
                              </button>
                              <button
                                className="rounded border border-[#6a5132] px-2 py-0.5 text-[10px] text-[#c9a878] disabled:opacity-40"
                                disabled={pending}
                                onClick={() => keepOnBoard(card.id)}
                                type="button"
                              >
                                Keep on board
                              </button>
                            </>
                          ) : null}
                          <button
                            className="rounded border border-[#6a5132] px-2 py-0.5 text-[10px] text-[#d4a052] disabled:opacity-40"
                            disabled={pending}
                            onClick={() => editCard(card)}
                            type="button"
                          >
                            Edit
                          </button>
                          {card.play != null ? (
                            <button
                              className="rounded border border-[#6a5132] px-2 py-0.5 text-[10px] text-[#d4a052]"
                              onClick={() => props.onOpenPlay(card.play ?? "")}
                              type="button"
                            >
                              View play
                            </button>
                          ) : null}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
        <div className="mt-4 border-t border-[#33271d] pt-4">
          <label className="inline-flex items-center gap-2 text-[12px] text-[#b9aa91]">
            <input
              checked={showArchived}
              className="accent-[#d4a052]"
              onChange={(event) => setShowArchived(event.target.checked)}
              type="checkbox"
            />
            Show archived
          </label>
          {showArchived ? (
            <section
              className="mt-3 rounded-[6px] border border-[#3a2c1e] bg-black/20 p-3"
              data-testid="studio-board-archive"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h4 className="font-display text-[15px] text-[#d4a052]">Archive</h4>
                  <p className="mt-1 text-[11px] text-[#8f806c]">
                    {filteredArchiveEntries.length} of {archiveEntries.length} cards
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-[#b9aa91]">
                  <label className="flex min-w-[160px] flex-col gap-1">
                    Search
                    <input
                      aria-label="Archive search"
                      className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                      onChange={(event) => setArchiveSearch(event.target.value)}
                      value={archiveSearch}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Label
                    <select
                      aria-label="Archive disposition filter"
                      className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                      onChange={(event) =>
                        setArchiveDispositionFilter(event.target.value as "" | ArchiveDisposition)
                      }
                      value={archiveDispositionFilter}
                    >
                      <option value="">All labels</option>
                      {ARCHIVE_DISPOSITIONS.map((disposition) => (
                        <option key={disposition} value={disposition}>
                          {disposition}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    Type
                    <select
                      aria-label="Archive type filter"
                      className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                      onChange={(event) =>
                        setArchiveKindFilter(event.target.value as "" | ArchiveKindFilter)
                      }
                      value={archiveKindFilter}
                    >
                      <option value="">All types</option>
                      <option value="play">Play</option>
                      {WORK_ORDER_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {WORK_ORDER_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    Play
                    <select
                      aria-label="Archive play filter"
                      className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                      onChange={(event) => setArchivePlayFilter(event.target.value)}
                      value={archivePlayFilter}
                    >
                      <option value="">All plays</option>
                      {archivePlayOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    Date
                    <input
                      aria-label="Archive date filter"
                      className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                      onChange={(event) => setArchiveDateFilter(event.target.value)}
                      type="date"
                      value={archiveDateFilter}
                    />
                  </label>
                </div>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {filteredArchiveEntries.length === 0 ? (
                  <div className="rounded-[4px] border border-dashed border-[#3a2c1e] p-3 text-[11px] text-[#6a5e4e]">
                    No archived cards match.
                  </div>
                ) : (
                  filteredArchiveEntries.map((entry) =>
                    entry.kind === "work-order" ? (
                      <article
                        className={`rounded-[5px] border border-[#4b3827] border-l-[3px] bg-[#241a10] p-3 ${cardBorderClass(entry.card.type)}`}
                        data-testid={`archive-work-order-card-${entry.card.id}`}
                        key={entry.id}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded border border-[#6a5132] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em] text-[#e8b86d]">
                            {WORK_ORDER_TYPE_LABELS[entry.card.type]}
                          </span>
                          <span className="rounded border border-[#4b3827] px-1.5 py-0.5 text-[10px] text-[#b9aa91]">
                            {entry.disposition}
                          </span>
                        </div>
                        <h5 className="mt-2 text-[13px] font-semibold leading-5 text-[#e8e0d4]">
                          {entry.title}
                        </h5>
                        <p className="mt-1 text-[11px] leading-5 text-[#9a8c78]">
                          {cardScopeLabel(entry.card, bySlug)}
                        </p>
                        {entry.date != null ? (
                          <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[#6a5e4e]">
                            {entry.date}
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <button
                            className="rounded border border-[#4fb8a8]/50 px-2 py-0.5 text-[10px] text-[#7ad4c4] disabled:opacity-40"
                            disabled={pending}
                            onClick={() => restoreWorkOrder(entry.card)}
                            type="button"
                          >
                            Restore
                          </button>
                          <button
                            className="rounded border border-[#6a5132] px-2 py-0.5 text-[10px] text-[#d4a052] disabled:opacity-40"
                            disabled={pending}
                            onClick={() => editCard(entry.card)}
                            type="button"
                          >
                            Edit
                          </button>
                        </div>
                      </article>
                    ) : (
                      <article
                        className="rounded-[5px] border border-[#4b3827] border-l-[3px] border-l-[#b090e8] bg-[#241a10] p-3"
                        data-testid={`archive-play-card-${entry.play}`}
                        key={entry.id}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded border border-[#b090e8]/60 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em] text-[#c0a8f0]">
                            graduated
                          </span>
                          <span className="rounded border border-[#4b3827] px-1.5 py-0.5 text-[10px] text-[#b9aa91]">
                            Play
                          </span>
                        </div>
                        <a
                          className="mt-2 block text-[13px] font-semibold leading-5 text-[#e8e0d4] hover:text-[#f0c060] hover:underline"
                          href={studioPlayHref(entry.play)}
                          onClick={(event) => openPlayCard(event, entry.play)}
                        >
                          {entry.rung?.glyph ?? "▫"} {entry.title}
                        </a>
                        <p className="mt-1 text-[11px] leading-5 text-[#9a8c78]">
                          {entry.rung?.division ?? "Product"} / {entry.rung?.function ?? "Insight"}
                        </p>
                        <button
                          className="mt-3 rounded border border-[#4fb8a8]/50 px-2 py-0.5 text-[10px] text-[#7ad4c4] disabled:opacity-40"
                          disabled={pending}
                          onClick={() => restoreGraduatedPlay(entry.play)}
                          type="button"
                        >
                          Restore
                        </button>
                      </article>
                    ),
                  )
                )}
              </div>
            </section>
          ) : null}
        </div>
        <form
          className="mt-4 rounded-[6px] border border-[#3a2c1e] bg-black/20 p-3"
          ref={formRef}
          onSubmit={saveCard}
        >
          <h4 className="mb-3 font-display text-[15px] text-[#d4a052]">
            {editingCardId == null
              ? "New work order"
              : `Editing ${cards.find((card) => card.id === editingCardId)?.title ?? editingCardId}`}
          </h4>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex min-w-[140px] flex-col gap-1 text-[11px] text-[#b9aa91]">
              Type
              <select
                aria-label="Work order type"
                className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                disabled={editingCardId != null && cardType === "testing"}
                onChange={(event) => {
                  const nextType = event.target.value as WorkOrderType;
                  setCardType(nextType);
                  setCardPriority(String(defaultPriority(nextType)));
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
            <label className="flex min-w-[200px] flex-col gap-1 text-[11px] text-[#b9aa91]">
              Play
              <select
                aria-label="Work order play"
                className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                disabled={editingCardId != null && cardType === "testing"}
                onChange={(event) => {
                  const slug = event.target.value;
                  setCardPlay(slug);
                  applyPlayDefaults(slug);
                }}
                value={cardPlay}
              >
                <option value="">System-level</option>
                {playOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-[140px] flex-col gap-1 text-[11px] text-[#b9aa91]">
              Division
              <input
                aria-label="Work order division"
                className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                onChange={(event) => setCardDivision(event.target.value)}
                value={cardDivision}
              />
            </label>
            <label className="flex min-w-[140px] flex-col gap-1 text-[11px] text-[#b9aa91]">
              Function
              <input
                aria-label="Work order function"
                className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                onChange={(event) => setCardFunction(event.target.value)}
                value={cardFunction}
              />
            </label>
            <label className="flex w-[86px] flex-col gap-1 text-[11px] text-[#b9aa91]">
              Priority
              <input
                aria-label="Work order priority"
                className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                onChange={(event) => setCardPriority(event.target.value)}
                type="number"
                value={cardPriority}
              />
            </label>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-[minmax(180px,280px)_1fr]">
            <label className="flex flex-col gap-1 text-[11px] text-[#b9aa91]">
              Title
              <input
                aria-label="Work order title"
                className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                onChange={(event) => setCardTitle(event.target.value)}
                ref={titleInputRef}
                value={cardTitle}
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-[#b9aa91]">
              Detail
              <input
                aria-label="Work order detail"
                className="rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                onChange={(event) => setCardDetail(event.target.value)}
                value={cardDetail}
              />
            </label>
          </div>
          {cardType === "testing" ? (
            <label className="mt-3 flex flex-col gap-1 text-[11px] text-[#b9aa91]">
              Checklist
              <textarea
                aria-label="Work order checklist"
                className="min-h-[90px] rounded border border-[#4b3827] bg-[#140d08] px-2 py-1 text-[#e8e0d4]"
                onChange={(event) => setCardChecklist(event.target.value)}
                value={cardChecklist}
              />
            </label>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              className="rounded border border-[#4fb8a8]/60 px-3 py-1 text-[12px] text-[#7ad4c4] disabled:opacity-40"
              disabled={pending || formError != null}
              type="submit"
            >
              {editingCardId == null ? "Create card" : "Save card"}
            </button>
            {editingCardId != null ? (
              <button
                className="rounded border border-[#6a5132] px-3 py-1 text-[12px] text-[#d4a052]"
                onClick={() => resetForm()}
                type="button"
              >
                Cancel
              </button>
            ) : null}
            {formError != null ? (
              <span className="text-[12px] text-[#e08a8a]">{formError}</span>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}

function parseLoopWarnings(events: readonly string[]): string[] {
  const counts = new Map<string, number>();
  for (const line of events) {
    for (const match of line.matchAll(/([a-z_]+)@(\d+)/g)) {
      const visit = Number(match[2]);
      const node = match[1] ?? "";
      counts.set(node, Math.max(counts.get(node) ?? 0, visit));
    }
  }
  return [...counts.entries()]
    .filter(([, visit]) => visit >= 3)
    .map(([node, visit]) => `${node} is on visit ${visit} — bounce loop?`);
}

function RunsView(props: { initialRunId: string }): React.ReactElement {
  const [runId, setRunId] = useState(props.initialRunId);
  const [queriedId, setQueriedId] = useState(props.initialRunId);
  const [data, setData] = useState<StudioRunEvents | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = useCallback((id: string) => {
    if (id.length === 0) {
      return;
    }
    void Effect.runPromise(fetchStudioRunEvents(id)).then(
      (value) => {
        setData(value);
        setError(null);
      },
      (cause: unknown) => setError(String(cause)),
    );
  }, []);

  useEffect(() => {
    load(queriedId);
    if (!autoRefresh) {
      return;
    }
    const timer = setInterval(() => load(queriedId), 15000);
    return () => clearInterval(timer);
  }, [autoRefresh, load, queriedId]);

  const status = useMemo(() => {
    const inspect = data?.inspect;
    const first = Array.isArray(inspect) ? inspect[0] : undefined;
    if (
      typeof first === "object" &&
      first != null &&
      "status" in first &&
      typeof first.status === "object" &&
      first.status != null &&
      "kind" in first.status &&
      typeof first.status.kind === "string"
    ) {
      return first.status.kind;
    }
    return "unknown";
  }, [data]);

  const warnings = useMemo(() => parseLoopWarnings(data?.events ?? []), [data]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          className="w-[340px] rounded border border-[#4b3827] bg-black/40 px-2 py-1 font-mono text-[12px] text-[#e8e0d4]"
          onChange={(event) => setRunId(event.target.value.trim())}
          placeholder="factory run id (01KTY…)"
          value={runId}
        />
        <button
          className="rounded border border-[#4fb8a8]/60 px-3 py-1 text-[12px] text-[#7ad4c4]"
          onClick={() => setQueriedId(runId)}
          type="button"
        >
          watch
        </button>
        <label className="flex items-center gap-1 text-[11px] text-[#8f806c]">
          <input
            checked={autoRefresh}
            onChange={(event) => setAutoRefresh(event.target.checked)}
            type="checkbox"
          />
          auto-refresh
        </label>
        <span className="ml-2 rounded border border-[#6a5e4e]/60 px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] text-[#b9aa91]">
          {status}
        </span>
      </div>
      {error != null ? <p className="mt-2 text-[12px] text-[#e08a8a]">{error}</p> : null}
      {data?.inspectError != null ? (
        <p className="mt-2 text-[12px] text-[#e08a8a]">{data.inspectError}</p>
      ) : null}
      {warnings.map((warning) => (
        <p
          className="mt-2 border border-[#e08a8a]/50 bg-[#3a1515]/40 px-2 py-1 text-[12px] text-[#e08a8a]"
          key={warning}
        >
          ⚠ {warning}
        </p>
      ))}
      <pre className="mt-3 max-h-[60vh] overflow-y-auto whitespace-pre-wrap border border-[#3a2c1e] bg-black/30 p-3 text-[11px] leading-5 text-[#c9bba2]">
        {(data?.events ?? []).join("\n") || "no events yet"}
      </pre>
      <p className="mt-2 text-[11px] text-[#8f806c]">
        Preserved run records (full stage prompts, responses, artifacts) live in each play&apos;s
        dry-runs/ directory. The Play tab surfaces the current graded read-out in Play Walk.
      </p>
    </div>
  );
}

// Shown when the registry cannot be reached at all (no Alexandria host serving
// /api/studio/*). Replaces the raw fetch error with an actionable empty state;
// the underlying cause stays available under a collapsed details panel.
function StudioUnavailable(props: { detail: string; onRetry: () => void }): React.ReactElement {
  return (
    <div className="mt-6 border border-[#4b3827] bg-[#1d140b]/70 p-8 text-center shadow-[0_18px_36px_rgba(0,0,0,0.35)]">
      <h2 className="font-display text-[20px] text-[#d4a052]">Studio backend unavailable</h2>
      <p className="mx-auto mt-3 max-w-[480px] text-[13px] leading-6 text-[#9a8c78]">
        The Studio reads plays from a live Alexandria host. Start one with{" "}
        <code className="rounded bg-[#2a1d10] px-1.5 py-0.5 text-[#e8b86d]">ax start viewer</code>{" "}
        from an initialized project (one that has a{" "}
        <code className="rounded bg-[#2a1d10] px-1.5 py-0.5 text-[#e8b86d]">studio/</code>{" "}
        directory) to load the board and plays.
      </p>
      <button
        className="mt-5 rounded-[3px] border border-[#6a5132] bg-[#21170f]/80 px-4 py-1.5 text-[12px] uppercase tracking-[0.12em] text-[#d4a052] hover:text-[#e8b86d]"
        onClick={props.onRetry}
        type="button"
      >
        Retry
      </button>
      <details className="mx-auto mt-4 max-w-[480px] text-left">
        <summary className="cursor-pointer text-[11px] uppercase tracking-[0.12em] text-[#6a5e4e]">
          Technical details
        </summary>
        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded border border-[#33271d] bg-[#140d08] p-3 text-[11px] leading-5 text-[#9a8c78]">
          {props.detail}
        </pre>
      </details>
    </div>
  );
}

export function StudioApp(props: {
  playbook?: RuntimePlaybook | null;
  searchParams: URLSearchParams;
}): React.ReactElement {
  const { error, refresh, registry } = useStudioRegistry();
  const tabParam = props.searchParams.get("tab");
  const [tab, setTab] = useState<StudioTab>(isStudioTab(tabParam) ? tabParam : "raven");
  const [playSlug, setPlaySlug] = useState<string>(
    props.searchParams.get("slug") ?? "frame-the-problem",
  );

  const openPlay = useCallback((slug: string) => {
    setPlaySlug(slug);
    setTab("play");
  }, []);

  // The Board is the single source of production progress (as RavenTab reads it).
  const stageBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const [stage, slugs] of Object.entries(registry?.board?.stages ?? {})) {
      for (const slug of slugs) {
        map.set(slug, normalizeStageKey(stage));
      }
    }
    return map;
  }, [registry?.board]);
  const readySet = useMemo(() => new Set(registry?.board?.ready ?? []), [registry?.board]);
  const currentRung = (registry?.rungs ?? []).find((rung) => rung.slug === playSlug);

  // No registry at all means the host/API is unreachable — show a friendly
  // empty state rather than the board chrome with nothing in it.
  const unavailable = error != null && registry == null;

  const tabs: { key: StudioTab; label: string }[] = [
    { key: "raven", label: "Raven" },
    { key: "catalog", label: "Catalog" },
    { key: "damien", label: "Damien" },
    { key: "board", label: "Board" },
    { key: "play", label: "Play" },
    { key: "runs", label: "Factory runs" },
    { key: "tracker", label: "Play Tracker" },
  ];

  return (
    <section className="raven-canvas-section min-h-[calc(100vh-84px-220px)] px-6 py-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-baseline gap-4">
          <h1 className="font-display text-[28px] text-[#d4a052]">⬚ Play Maker&apos;s Studio</h1>
          {unavailable ? null : (
            <nav className="flex gap-2">
              {tabs.map((entry) => (
                <button
                  className={[
                    "rounded-[3px] border px-3 py-1 text-[12px] uppercase tracking-[0.12em]",
                    tab === entry.key
                      ? "border-[#e8b86d] text-[#e8b86d]"
                      : "border-[#33271d] text-[#8f806c] hover:text-[#d6c9b4]",
                  ].join(" ")}
                  key={entry.key}
                  onClick={() => setTab(entry.key)}
                  type="button"
                >
                  {entry.label}
                </button>
              ))}
            </nav>
          )}
        </div>
        {unavailable ? (
          <StudioUnavailable detail={error ?? ""} onRetry={refresh} />
        ) : (
          <>
            {error != null ? (
              <p className="mt-4 text-[13px] text-[#e08a8a]">
                Couldn&apos;t refresh the Studio.{" "}
                <button className="underline hover:text-[#f0a0a0]" onClick={refresh} type="button">
                  Retry
                </button>
              </p>
            ) : null}
            <div className="mt-5">
              {tab === "raven" ? (
                <RavenTab
                  board={registry?.board ?? null}
                  onOpenPlay={openPlay}
                  rungs={registry?.rungs ?? []}
                />
              ) : tab === "catalog" ? (
                registry != null ? (
                  <CatalogTab registry={registry} />
                ) : (
                  <PanelFrame title="Catalog">
                    <p className="text-[13px] text-[#8f806c]">Loading catalog…</p>
                  </PanelFrame>
                )
              ) : tab === "damien" ? (
                <DamienTab />
              ) : tab === "board" ? (
                <PanelFrame title="Work Board">
                  <BoardView
                    board={registry?.board ?? null}
                    onMoved={refresh}
                    onOpenPlay={openPlay}
                    rungs={registry?.rungs ?? []}
                  />
                </PanelFrame>
              ) : tab === "play" ? (
                <PlayPage
                  onBack={() => setTab("raven")}
                  ready={readySet.has(playSlug)}
                  rung={currentRung}
                  slug={playSlug}
                  stage={stageBySlug.get(playSlug)}
                />
              ) : tab === "runs" ? (
                <PanelFrame title="Factory runs — live debug">
                  <RunsView initialRunId={props.searchParams.get("run") ?? ""} />
                </PanelFrame>
              ) : (
                <PlayTrackerTab
                  initialRunId={props.searchParams.get("run") ?? ""}
                  playbook={props.playbook}
                />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
