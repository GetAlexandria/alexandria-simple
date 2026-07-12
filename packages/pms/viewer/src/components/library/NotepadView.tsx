import { useMemo, useState, type ReactNode } from "react";
import type { LibraryCatalogThreadResolutionState } from "./types";
import { testIdPart } from "./DraftOverlayViews";
import { humanizeLinkKey } from "./library-peek-view-model";
import type { LibraryCatalog } from "./types";
import {
  buildNotepadModel,
  NOTEPAD_RESOLUTION_STATE_LABELS,
  NOTEPAD_RESOLUTION_STATE_MARKERS,
  type NotepadLens,
  type NotepadResolvedStateGroup,
  type NotepadResolvedThread,
  type NotepadThreadMoveGroup,
  type NotepadThreadRow,
} from "./notepad-view-model";

const LENS_LABELS: Record<NotepadLens, string> = {
  generated: "Generated",
  open: "Open",
  resolved: "Resolved",
};

function countLabel(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

function evidenceCount(thread: NotepadThreadRow): string {
  const count = thread.sourceEvidence.length;
  return count === 0 ? "no evidence" : countLabel(count, "ref");
}

function fragmentHref(value: string): string {
  return `#${testIdPart(value)}`;
}

function stateClass(state: LibraryCatalogThreadResolutionState): string {
  switch (NOTEPAD_RESOLUTION_STATE_MARKERS[state]) {
    case "director":
      return "border-[#2f7d57] bg-[#e8f3ec] text-[#1f5d3f]";
    case "machine":
      return "border-[#2f6f9e] bg-[#e3eef6] text-[#1f4f72]";
    case "deferred":
      return "border-[#b6742b] bg-[#f7ead8] text-[#8a4f16]";
    case "miss":
      return "border-[#9a4c58] bg-[#fff8f8] text-[#7b2f3a]";
  }
}

function LensButton({
  active,
  count,
  lens,
  onClick,
}: {
  active: boolean;
  count: number;
  lens: NotepadLens;
  onClick(): void;
}) {
  return (
    <button
      aria-pressed={active}
      className={[
        "h-9 border px-3 font-mono text-[12px]",
        active
          ? "border-[#20242b] bg-[#20242b] text-[#f7f3ea]"
          : "border-[#cfc7b6] bg-transparent text-[#5c6470] hover:bg-[#efe8dc]",
      ].join(" ")}
      data-testid={`notepad-lens-button-${lens}`}
      onClick={onClick}
      type="button"
    >
      {LENS_LABELS[lens]} <span className="text-[11px] opacity-80">{count}</span>
    </button>
  );
}

function CountTile({ label, testId, value }: { label: string; testId: string; value: number }) {
  return (
    <div className="border border-[#d9d2c2] bg-[#fffdf8] px-3 py-2" data-testid={testId}>
      <div className="font-mono text-[10px] uppercase text-[#7b7164]">{label}</div>
      <div className="mt-1 font-mono text-[18px] font-semibold text-[#20242b]">{value}</div>
    </div>
  );
}

function SourceEvidence({ evidence }: { evidence: readonly string[] }) {
  if (evidence.length === 0) {
    return <span className="text-[#8b8173]">No source evidence.</span>;
  }

  return (
    <ul className="mt-1 space-y-1">
      {evidence.map((source) => (
        <li className="break-words font-mono text-[11px] text-[#5c6470]" key={source}>
          {source}
        </li>
      ))}
    </ul>
  );
}

function ThreadFacts({ row }: { row: NotepadThreadRow }) {
  return (
    <div className="mt-3 grid gap-3 border-t border-[#e5dece] pt-3 md:grid-cols-[1fr_1fr]">
      <div>
        <div className="font-mono text-[10px] uppercase text-[#8a4f16]">Builder reason</div>
        <p className="mt-1 break-words text-[13px] leading-5 text-[#3f3a33]">{row.reason}</p>
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase text-[#8a4f16]">Source evidence</div>
        <SourceEvidence evidence={row.sourceEvidence} />
      </div>
    </div>
  );
}

function ResolutionProvenance({ row }: { row: NotepadResolvedThread }) {
  const resolution = row.resolution;
  const rulingText = resolution.answerText ?? resolution.reason ?? "No ruling text available.";

  return (
    <div
      className="mt-3 border border-[#d9d2c2] bg-[#f6f1e8] px-3 py-2"
      data-testid={`notepad-provenance-${testIdPart(row.id)}`}
    >
      <dl className="grid gap-2 font-mono text-[11px] text-[#4b443c] md:grid-cols-[96px_1fr]">
        <dt className="text-[#7b7164]">Ruling</dt>
        <dd className="break-words" id={testIdPart(resolution.resolvingEventId)}>
          {rulingText}
        </dd>
        <dt className="text-[#7b7164]">Event</dt>
        <dd className="break-words">
          <a
            className="text-[#1f4f72] underline decoration-[#b7cad8] underline-offset-2"
            data-testid={`notepad-resolution-event-${testIdPart(row.id)}`}
            href={fragmentHref(resolution.resolvingEventId)}
          >
            {resolution.resolvingEventId}
          </a>
        </dd>
        {resolution.patches == null || resolution.patches.length === 0 ? null : (
          <>
            <dt className="text-[#7b7164]">Patches</dt>
            <dd className="flex flex-wrap gap-1.5">
              {resolution.patches.map((patch) => (
                <span
                  className="inline-flex min-w-0 flex-wrap gap-1 border border-[#b6742b] bg-[#fff8ed] px-2 py-0.5 text-[#8a4f16]"
                  data-testid={`notepad-patch-${testIdPart(row.id)}-${testIdPart(patch.patchId)}`}
                  key={`${patch.eventId}-${patch.patchId}`}
                >
                  <a
                    className="break-words underline decoration-[#d5b98f] underline-offset-2"
                    href={fragmentHref(patch.eventId)}
                    id={testIdPart(patch.eventId)}
                  >
                    {patch.eventId}
                  </a>
                  <span aria-hidden>/</span>
                  <a
                    className="break-words underline decoration-[#d5b98f] underline-offset-2"
                    href={fragmentHref(patch.patchId)}
                    id={testIdPart(patch.patchId)}
                  >
                    {patch.patchId}
                  </a>
                </span>
              ))}
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}

type ThreadRowProps =
  | { row: NotepadThreadRow; variant: "generated" | "open" }
  | { row: NotepadResolvedThread; variant: "resolved" };

function ThreadRow(props: ThreadRowProps) {
  const { row, variant } = props;
  const resolution = props.variant === "resolved" ? props.row.resolution : null;

  return (
    <article
      className="border border-[#e0d8c8] bg-[#fffdf8] px-3 py-3"
      {...(resolution == null
        ? {}
        : {
            "data-resolution-marker": NOTEPAD_RESOLUTION_STATE_MARKERS[resolution.state],
            "data-resolution-state": resolution.state,
          })}
      data-testid={`notepad-${variant}-thread-${testIdPart(row.id)}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            {resolution == null ? null : (
              <span
                className={[
                  "border px-2 py-0.5 font-mono text-[10px]",
                  stateClass(resolution.state),
                ].join(" ")}
                data-testid={`notepad-resolution-label-${testIdPart(row.id)}`}
              >
                {NOTEPAD_RESOLUTION_STATE_LABELS[resolution.state]}
              </span>
            )}
            <span className="border border-[#d9d2c2] bg-[#f6f1e8] px-2 py-0.5 font-mono text-[10px] uppercase text-[#5c6470]">
              {row.emittingMove}
            </span>
            <span className="border border-[#d9d2c2] bg-[#fffdf8] px-2 py-0.5 font-mono text-[10px] uppercase text-[#5c6470]">
              {humanizeLinkKey(row.kind)}
            </span>
          </div>
          <h3 className="break-words text-[14px] font-semibold leading-5 text-[#20242b]">
            {row.question}
          </h3>
        </div>
        <span className="shrink-0 border border-[#cfc7b6] bg-[#f6f1e8] px-2 py-0.5 font-mono text-[10px] uppercase text-[#6b665b]">
          {evidenceCount(row)}
        </span>
      </div>
      <ThreadFacts row={row} />
      {props.variant === "resolved" ? <ResolutionProvenance row={props.row} /> : null}
    </article>
  );
}

function GroupedThreadList<T extends NotepadThreadRow>({
  groups,
  kindClassName,
  kindTestId,
  moveHeader,
  moveTestId,
  renderRow,
  sectionClassName,
}: {
  groups: readonly NotepadThreadMoveGroup<T>[];
  kindClassName: string;
  kindTestId?(moveGroup: NotepadThreadMoveGroup<T>, kind: string): string;
  moveHeader(moveGroup: NotepadThreadMoveGroup<T>): ReactNode;
  moveTestId(moveGroup: NotepadThreadMoveGroup<T>): string;
  renderRow(row: T): ReactNode;
  sectionClassName: string;
}) {
  return (
    <>
      {groups.map((moveGroup) => (
        <section
          className={sectionClassName}
          data-testid={moveTestId(moveGroup)}
          key={moveGroup.emittingMove}
        >
          {moveHeader(moveGroup)}
          {moveGroup.kindGroups.map((kindGroup) => (
            <div
              className="space-y-2"
              {...(kindTestId == null
                ? {}
                : { "data-testid": kindTestId(moveGroup, kindGroup.kind) })}
              key={`${moveGroup.emittingMove}:${kindGroup.kind}`}
            >
              <div className={kindClassName}>{humanizeLinkKey(kindGroup.kind)}</div>
              {kindGroup.threads.map((row) => renderRow(row))}
            </div>
          ))}
        </section>
      ))}
    </>
  );
}

function ThreadGroupList({
  groups,
  variant,
}: {
  groups: readonly NotepadThreadMoveGroup[];
  variant: "generated" | "open";
}) {
  return (
    <div className="space-y-4">
      <GroupedThreadList
        groups={groups}
        kindClassName="font-mono text-[11px] uppercase text-[#7b7164]"
        kindTestId={(moveGroup, kind) =>
          `notepad-${variant}-kind-${testIdPart(moveGroup.emittingMove)}-${testIdPart(kind)}`
        }
        moveHeader={(moveGroup) => (
          <div className="flex flex-wrap items-baseline justify-between gap-3 border border-[#d9d2c2] bg-[#f6f1e8] px-4 py-2">
            <h3 className="break-words font-mono text-[13px] font-semibold uppercase text-[#20242b]">
              {moveGroup.emittingMove}
            </h3>
            <span className="font-mono text-[11px] text-[#6b665b]">
              {countLabel(moveGroup.count, "thread")}
            </span>
          </div>
        )}
        moveTestId={(moveGroup) => `notepad-${variant}-move-${testIdPart(moveGroup.emittingMove)}`}
        renderRow={(row) => <ThreadRow key={row.id} row={row} variant={variant} />}
        sectionClassName="space-y-3"
      />
    </div>
  );
}

function ResolvedStateGroup({ group }: { group: NotepadResolvedStateGroup }) {
  return (
    <section
      className="space-y-3"
      data-resolution-marker={NOTEPAD_RESOLUTION_STATE_MARKERS[group.state]}
      data-resolution-state={group.state}
      data-testid={`notepad-resolved-state-${group.state}`}
    >
      <header
        className={[
          "flex flex-wrap items-baseline justify-between gap-3 border px-4 py-2",
          stateClass(group.state),
        ].join(" ")}
      >
        <h3 className="break-words font-mono text-[13px] font-semibold">
          {NOTEPAD_RESOLUTION_STATE_LABELS[group.state]}
        </h3>
        <span className="font-mono text-[11px]">{countLabel(group.count, "thread")}</span>
      </header>
      <GroupedThreadList
        groups={group.groups}
        kindClassName="font-mono text-[11px] text-[#8a4f16]"
        moveHeader={(moveGroup) => (
          <div className="font-mono text-[11px] uppercase text-[#7b7164]">
            {moveGroup.emittingMove}
          </div>
        )}
        moveTestId={(moveGroup) =>
          `notepad-resolved-move-${testIdPart(group.state)}-${testIdPart(moveGroup.emittingMove)}`
        }
        renderRow={(row) => <ThreadRow key={row.id} row={row} variant="resolved" />}
        sectionClassName="space-y-2"
      />
    </section>
  );
}

function MissesRollup({ misses }: { misses: readonly NotepadResolvedThread[] }) {
  if (misses.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3" data-testid="notepad-misses-rollup">
      <header
        className={[
          "flex flex-wrap items-baseline justify-between gap-3 border px-4 py-2",
          stateClass("invalidated"),
        ].join(" ")}
      >
        <h3 className="break-words font-mono text-[13px] font-semibold uppercase">Misses</h3>
        <span className="font-mono text-[11px]">{countLabel(misses.length, "thread")}</span>
      </header>
      <div className="space-y-2">
        {misses.map((row) => (
          <div data-testid={`notepad-miss-thread-${testIdPart(row.id)}`} key={row.id}>
            <ThreadRow row={row} variant="resolved" />
          </div>
        ))}
      </div>
    </section>
  );
}

function LensPanel({
  children,
  className,
  empty,
  emptyMessage,
  lens,
}: {
  children: ReactNode;
  className: string;
  empty: boolean;
  emptyMessage: string;
  lens: NotepadLens;
}) {
  return (
    <div className={className} data-testid={`notepad-lens-panel-${lens}`}>
      {empty ? (
        <div className="border border-[#d9d2c2] bg-[#fffdf8] px-4 py-3 font-mono text-[12px] text-[#5f6f62]">
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function NotepadView({
  catalog,
  initialLens = "generated",
  libraryRoot,
}: {
  catalog: LibraryCatalog;
  initialLens?: NotepadLens;
  libraryRoot?: string;
}) {
  const model = useMemo(() => buildNotepadModel(catalog), [catalog]);
  const [activeLens, setActiveLens] = useState<NotepadLens>(initialLens);
  const selectedLens = model.availableLenses.includes(activeLens) ? activeLens : "generated";

  return (
    <section className="m-7 space-y-4" data-testid="notepad-view">
      <header className="border border-[#d9d2c2] bg-[#f6f1e8] px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-mono text-[18px] font-semibold text-[#20242b]">Notepad</h1>
            {libraryRoot == null ? null : (
              <p
                className="mt-1 break-words font-mono text-[11px] text-[#6b665b]"
                data-testid="notepad-library-root"
              >
                Bundle: {libraryRoot}
              </p>
            )}
          </div>
          <div className="grid min-w-[240px] grid-cols-2 gap-2 sm:grid-cols-4">
            <CountTile
              label="Generated"
              testId="notepad-count-generated"
              value={model.counts.generated}
            />
            <CountTile
              label="Resolved"
              testId="notepad-count-resolved"
              value={model.counts.resolved}
            />
            <CountTile label="Open" testId="notepad-count-open" value={model.counts.open} />
            <CountTile label="Misses" testId="notepad-count-misses" value={model.counts.misses} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {model.availableLenses.map((lens) => (
            <LensButton
              active={selectedLens === lens}
              count={model.counts[lens]}
              key={lens}
              lens={lens}
              onClick={() => setActiveLens(lens)}
            />
          ))}
        </div>
      </header>

      {selectedLens === "generated" ? (
        <LensPanel
          className="space-y-3"
          empty={model.counts.generated === 0}
          emptyMessage="No generated threads."
          lens="generated"
        >
          <ThreadGroupList groups={model.generatedGroups} variant="generated" />
        </LensPanel>
      ) : selectedLens === "resolved" ? (
        <LensPanel
          className="space-y-5"
          empty={model.resolvedGroups.length === 0 && model.misses.length === 0}
          emptyMessage="No resolved threads."
          lens="resolved"
        >
          {model.resolvedGroups.map((group) => (
            <ResolvedStateGroup group={group} key={group.state} />
          ))}
          <MissesRollup misses={model.misses} />
        </LensPanel>
      ) : (
        <LensPanel
          className="space-y-3"
          empty={model.counts.open === 0}
          emptyMessage="No open threads."
          lens="open"
        >
          <ThreadGroupList groups={model.openGroups} variant="open" />
        </LensPanel>
      )}
    </section>
  );
}
