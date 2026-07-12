import { useEffect, useMemo, useState } from "react";
import { testIdPart } from "./DraftOverlayViews";
import { threadEmittingMove, threadQuestion } from "./library-peek-view-model";
import {
  confidenceClass,
  DANGER_CHIP_CLASS,
  NEUTRAL_CHIP_CLASS,
  normalizedThreadStatus,
  readinessAreaState,
  roleStyle,
  SUCCESS_CHIP_CLASS,
  threadCountLabel,
  threadEvidenceCountLabel,
  threadFamilyClass,
  threadStatusClass,
  threadStatusLabel,
  threadStatusSummary,
  valueLabel,
  type ThreadStatusFilter,
} from "./notepad-view-model";
import { formatPlaneLabel } from "./plane";
import type {
  LibraryCatalog,
  LibraryCatalogCard,
  LibraryCatalogThread,
  LibraryCatalogTypeMappingEntry,
} from "./types";

// Standalone extraction of EmptyLibraryView's `readiness` sub-tab (issue
// #609), mirroring the PMS Notepad's file shape (component + view-model, no
// shared import). Output is the same fill-readiness projection, unchanged —
// this is a pure move, not a redesign.
//
// `confidenceClass`/`roleStyle` are shared with EmptyLibraryView via
// notepad-view-model.ts (both were previously byte-identical duplicates kept
// in step by hand; now one definition).

const NOTEPAD_PANEL_CLASS =
  "border border-[color:var(--viewer-canvas-panel-bd)] bg-[color:var(--viewer-canvas-slate-2)] text-[color:var(--viewer-canvas-fg)]";
const NOTEPAD_MUTED_PANEL_CLASS =
  "border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate-3)] text-[color:var(--viewer-canvas-fg)]";
const NOTEPAD_LABEL_CLASS =
  "font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--viewer-canvas-fg-dim)]";
const NOTEPAD_SELECT_CLASS =
  "h-8 w-full border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-2 font-sans text-[12px] text-[color:var(--viewer-canvas-fg)]";
const NOTEPAD_CHIP_BASE_CLASS = "border px-2 py-0.5 font-sans text-[10px] font-semibold uppercase";
const NOTEPAD_SECTION_CLASS = `${NOTEPAD_PANEL_CLASS} p-4`;
const NOTEPAD_AREA_CARD_CLASS = `${NOTEPAD_MUTED_PANEL_CLASS} px-3 py-2`;
const NOTEPAD_FILTER_LABEL_CLASS = `mb-1 block ${NOTEPAD_LABEL_CLASS}`;
const NOTEPAD_AREA_READY_CLASS = `shrink-0 ${NOTEPAD_CHIP_BASE_CLASS} ${SUCCESS_CHIP_CLASS}`;
const NOTEPAD_AREA_BLOCKED_CLASS = `shrink-0 ${NOTEPAD_CHIP_BASE_CLASS} ${DANGER_CHIP_CLASS}`;
const NOTEPAD_KIND_CHIP_CLASS = `${NOTEPAD_CHIP_BASE_CLASS} ${NEUTRAL_CHIP_CLASS}`;

function ThreadConcernList({
  cardsById,
  concerns,
  onSelectCard,
  typeMapping,
}: {
  cardsById: Map<string, LibraryCatalogCard>;
  concerns: LibraryCatalogThread["concerns"];
  onSelectCard(card: LibraryCatalogCard): void;
  typeMapping: readonly LibraryCatalogTypeMappingEntry[];
}) {
  const cardConcerns = concerns.flatMap((concern) => {
    if (concern.type !== "card" || concern.cardId == null) {
      return [];
    }
    const card = cardsById.get(concern.cardId);
    return card == null ? [] : [{ card, label: concern.label ?? card.prefLabel }];
  });
  const nounConcerns = concerns.filter((concern) => concern.type === "noun");
  const contextConcerns = concerns.filter((concern) => concern.type === "context");

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      {cardConcerns.map(({ card, label }) => (
        <button
          className={`border px-1.5 py-0.5 font-sans text-[11px] font-semibold hover:brightness-110 ${roleStyle(card.type, typeMapping)}`}
          key={card.id}
          onClick={(event) => {
            event.stopPropagation();
            onSelectCard(card);
          }}
          type="button"
        >
          {label}
        </button>
      ))}
      {nounConcerns.map((concern, index) => (
        <span
          className="border border-[color:var(--viewer-canvas-rule)] bg-transparent px-1.5 py-0.5 font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]"
          key={`${concern.label ?? "noun"}-${index}`}
        >
          {concern.label ?? "uncarded noun"}
        </span>
      ))}
      {contextConcerns.map((concern, index) => (
        <span
          className="border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-1.5 py-0.5 font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]"
          key={`${concern.plane ?? "context"}-${concern.context ?? "ctx"}-${index}`}
        >
          {formatPlaneLabel(concern.plane ?? "")} / {concern.context ?? "context"}
        </span>
      ))}
    </div>
  );
}

export function NotepadView({
  catalog,
  cardsById,
  onSelectCard,
  onSelectThread,
}: {
  catalog: LibraryCatalog;
  cardsById: Map<string, LibraryCatalogCard>;
  onSelectCard(card: LibraryCatalogCard): void;
  onSelectThread(thread: LibraryCatalogThread): void;
}) {
  const readiness = catalog.fillReadiness;
  const threads = catalog.threads ?? [];
  const [familyFilter, setFamilyFilter] = useState<"all" | LibraryCatalogThread["family"]>("all");
  const [kindFilter, setKindFilter] = useState<"all" | LibraryCatalogThread["kind"]>("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | LibraryCatalogThread["severity"]>(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<ThreadStatusFilter>("all");
  const threadKinds = useMemo(
    () => Array.from(new Set(threads.map((thread) => thread.kind))).sort(),
    [threads],
  );
  const statusSummary = useMemo(() => threadStatusSummary(threads), [threads]);
  const filteredThreads = useMemo(
    () =>
      threads.filter(
        (thread) =>
          (familyFilter === "all" || thread.family === familyFilter) &&
          (kindFilter === "all" || thread.kind === kindFilter) &&
          (severityFilter === "all" || thread.severity === severityFilter) &&
          (statusFilter === "all" || normalizedThreadStatus(thread.status) === statusFilter),
      ),
    [familyFilter, kindFilter, severityFilter, statusFilter, threads],
  );

  useEffect(() => {
    if (kindFilter !== "all" && !threadKinds.includes(kindFilter)) {
      setKindFilter("all");
    }
  }, [kindFilter, threadKinds]);

  if (readiness == null) {
    return null;
  }

  return (
    <div className="space-y-4" data-testid="fill-readiness-view">
      <section className={NOTEPAD_SECTION_CLASS} data-testid="fill-readiness-presence">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-display text-[20px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
            Presence
          </h3>
          <span className="font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
            {readiness.fillableCardCount}/{readiness.totalCardCount} fillable
          </span>
        </div>
        <div className="grid gap-2 lg:grid-cols-2">
          {readiness.areas.map((area) => (
            <div
              className={NOTEPAD_AREA_CARD_CLASS}
              data-testid={`fill-readiness-area-${testIdPart(area.areaId)}`}
              key={area.areaId}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="break-words font-display text-[17px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
                    {area.context}
                  </div>
                  <div className="mt-0.5 font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
                    {formatPlaneLabel(area.plane)}
                  </div>
                </div>
                <span
                  className={
                    readinessAreaState(area) === "ready"
                      ? NOTEPAD_AREA_READY_CLASS
                      : NOTEPAD_AREA_BLOCKED_CLASS
                  }
                >
                  {readinessAreaState(area)}
                </span>
              </div>
              <div className="mt-2 font-sans text-[12px] text-[color:var(--viewer-canvas-fg-dim)]">
                {area.fillableCount}/{area.cardCount} fillable ·{" "}
                {threadCountLabel(area.gapCount, area.hotSpotCount)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={NOTEPAD_SECTION_CLASS} data-testid="thread-worklist">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[20px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
              Threads
            </h3>
            <p
              className="mt-1 font-sans text-[12px] text-[color:var(--viewer-canvas-fg-dim)]"
              data-testid="thread-status-summary"
            >
              {statusSummary}
            </p>
          </div>
          <div className="grid w-full gap-2 font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)] sm:w-auto sm:grid-cols-4">
            <label>
              <span className={NOTEPAD_FILTER_LABEL_CLASS}>Status</span>
              <select
                className={NOTEPAD_SELECT_CLASS}
                data-testid="thread-filter-status"
                onChange={(event) => setStatusFilter(event.target.value as ThreadStatusFilter)}
                value={statusFilter}
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="answered">Answered</option>
                <option value="residual">Residual</option>
              </select>
            </label>
            <label>
              <span className={NOTEPAD_FILTER_LABEL_CLASS}>Family</span>
              <select
                className={NOTEPAD_SELECT_CLASS}
                data-testid="thread-filter-family"
                onChange={(event) =>
                  setFamilyFilter(event.target.value as "all" | LibraryCatalogThread["family"])
                }
                value={familyFilter}
              >
                <option value="all">All</option>
                <option value="gap">Gaps</option>
                <option value="hot_spot">Hot spots</option>
              </select>
            </label>
            <label>
              <span className={NOTEPAD_FILTER_LABEL_CLASS}>Kind</span>
              <select
                className={NOTEPAD_SELECT_CLASS}
                data-testid="thread-filter-kind"
                onChange={(event) =>
                  setKindFilter(event.target.value as "all" | LibraryCatalogThread["kind"])
                }
                value={kindFilter}
              >
                <option value="all">All</option>
                {threadKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {valueLabel(kind)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={NOTEPAD_FILTER_LABEL_CLASS}>Severity</span>
              <select
                className={NOTEPAD_SELECT_CLASS}
                data-testid="thread-filter-severity"
                onChange={(event) =>
                  setSeverityFilter(event.target.value as "all" | LibraryCatalogThread["severity"])
                }
                value={severityFilter}
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>
        </div>
        {filteredThreads.length === 0 ? (
          <div
            className={`${NOTEPAD_MUTED_PANEL_CLASS} px-3 py-2 font-sans text-[12px]`}
            data-testid="thread-worklist-empty"
          >
            No threads match the current filters.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredThreads.map((thread) => {
              const question = threadQuestion(thread);
              return (
                <article
                  aria-label={`Open thread: ${question}`}
                  className="grid cursor-pointer gap-3 border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate-3)] px-3 py-2 transition-colors hover:border-[color:var(--viewer-canvas-amber)] hover:bg-[color:var(--viewer-canvas-slate-2)] md:grid-cols-[minmax(0,1fr)_180px]"
                  data-testid={`thread-row-${testIdPart(thread.id)}`}
                  key={thread.id}
                  onClick={() => onSelectThread(thread)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectThread(thread);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`${NOTEPAD_CHIP_BASE_CLASS} ${threadStatusClass(thread.status)}`}
                        data-testid={`thread-status-${testIdPart(thread.id)}`}
                      >
                        {threadStatusLabel(thread.status)}
                      </span>
                      <span
                        className={`${NOTEPAD_CHIP_BASE_CLASS} ${threadFamilyClass(thread.family)}`}
                      >
                        {valueLabel(thread.family)}
                      </span>
                      <span className={NOTEPAD_KIND_CHIP_CLASS}>{valueLabel(thread.kind)}</span>
                    </div>
                    <p className="break-words text-[13px] font-semibold leading-5 text-[color:var(--viewer-canvas-fg-bright)]">
                      {question}
                    </p>
                    <div className="mt-2">
                      <ThreadConcernList
                        cardsById={cardsById}
                        concerns={thread.concerns}
                        onSelectCard={onSelectCard}
                        typeMapping={catalog.typeMapping ?? []}
                      />
                    </div>
                  </div>
                  <div className="space-y-1 font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
                    <span
                      className={`inline-block ${NOTEPAD_CHIP_BASE_CLASS} ${confidenceClass(thread.severity)}`}
                    >
                      {thread.severity}
                    </span>
                    <p className="break-words">
                      via {threadEmittingMove(thread)} · {threadEvidenceCountLabel(thread)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
