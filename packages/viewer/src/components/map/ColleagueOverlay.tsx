// The colleague landmark overlay (L2, plan §1.1): clicking a colleague's
// building opens this over a dimmed map — who they are (name/role from the
// agent roster), what they've been doing (top ~3 journal entries, the file is
// the source of truth), and what they can do (a quick bar mirroring
// RavenBench: open their workspace, and a jump to their needs-a-human cards on
// the board). It reuses MapOverlay's grammar (scrim + centered parchment
// panel, Escape / click-away to close, the shared parchment tokens and button)
// rather than the card overlay itself — this lens shows a journal, not cards.

import { useEffect, type CSSProperties } from "react";
import type { ColleagueJournal } from "../../app/runtime/schemas";
import type { ColleagueIdentity } from "./colleague-overlay";
import { topJournalEntries } from "./colleague-overlay";
import { MAP_FALLBACK_COLORS, MAP_OVERLAY_SCRIM_INK, withAlpha } from "./colors";
import { ParchmentActionButton } from "./panel-buttons";

/** How many journal entries the overlay shows (plan §1.1 "top ~3"). */
const JOURNAL_ENTRY_LIMIT = 3;

// Two-line clamp for an entry's body — enough to read the beat without the
// overlay growing unbounded on a long entry.
const ENTRY_BODY_CLAMP: CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

type ColleagueOverlayProps = {
  identity: ColleagueIdentity;
  journal: ColleagueJournal | null;
  journalLoading: boolean;
  journalError: string | null;
  needsHumanCount: number;
  /** Opens the colleague's per-agent page (the bench quick-bar link). */
  onOpenAgentPage: () => void;
  /** Jumps to the Info Hub board filtered to needs-a-human. */
  onOpenBoard: () => void;
  onClose: () => void;
};

export function ColleagueOverlay({
  identity,
  journal,
  journalLoading,
  journalError,
  needsHumanCount,
  onOpenAgentPage,
  onOpenBoard,
  onClose,
}: ColleagueOverlayProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const entries = journal == null ? [] : topJournalEntries(journal.entries, JOURNAL_ENTRY_LIMIT);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center p-6"
      data-testid="colleague-overlay"
      onClick={onClose}
      role="presentation"
      // The map stays mounted and visible behind this dim (MapOverlay grammar).
      style={{ backgroundColor: withAlpha(MAP_OVERLAY_SCRIM_INK, 0.55) }}
    >
      <div
        className="flex max-h-full w-full max-w-md flex-col overflow-hidden rounded border"
        onClick={(event) => event.stopPropagation()}
        style={{
          backgroundColor: MAP_FALLBACK_COLORS.panel,
          borderColor: MAP_FALLBACK_COLORS.border,
        }}
      >
        <div
          className="flex items-start justify-between gap-3 border-b px-4 py-3"
          style={{ borderColor: MAP_FALLBACK_COLORS.border }}
        >
          <div>
            <p
              className="text-sm font-semibold"
              data-testid="colleague-overlay-title"
              style={{ color: MAP_FALLBACK_COLORS.heading }}
            >
              {identity.name}
            </p>
            {identity.role != null ? (
              <p
                className="mt-0.5 text-[11px]"
                data-testid="colleague-overlay-role"
                style={{ color: MAP_FALLBACK_COLORS.subtext }}
              >
                {identity.role}
              </p>
            ) : null}
          </div>
          <ParchmentActionButton label="Close" onClick={onClose} />
        </div>

        <div className="overflow-y-auto px-4 py-3">
          <p
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: MAP_FALLBACK_COLORS.subtext }}
          >
            Recent journal
          </p>

          {journalLoading ? (
            <p className="mt-1 text-xs" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
              Reading {identity.name}&apos;s journal…
            </p>
          ) : journalError != null ? (
            <p className="mt-1 text-xs" role="alert" style={{ color: MAP_FALLBACK_COLORS.heading }}>
              {journalError}
            </p>
          ) : entries.length === 0 ? (
            <p className="mt-1 text-xs" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
              No journal entries yet — {identity.name} hasn&apos;t written a beat.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2" data-testid="colleague-overlay-journal">
              {entries.map((entry, index) => (
                <li
                  key={`${entry.date}:${entry.title}:${index}`}
                  className="rounded border px-2 py-1.5"
                  data-testid="colleague-overlay-entry"
                  style={{ borderColor: MAP_FALLBACK_COLORS.border }}
                >
                  <p
                    className="text-[11px] font-semibold"
                    style={{ color: MAP_FALLBACK_COLORS.heading }}
                  >
                    {entry.title || "Untitled entry"}
                    {entry.date.length > 0 ? (
                      <span
                        className="ml-1 font-normal"
                        style={{ color: MAP_FALLBACK_COLORS.subtext }}
                      >
                        · {entry.date}
                      </span>
                    ) : null}
                  </p>
                  {entry.body.length > 0 ? (
                    <p
                      className="mt-0.5 text-[11px]"
                      style={{ ...ENTRY_BODY_CLAMP, color: MAP_FALLBACK_COLORS.text }}
                    >
                      {entry.body}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <div
            className="mt-3 flex flex-col gap-2 border-t pt-3"
            style={{ borderColor: MAP_FALLBACK_COLORS.border }}
          >
            {/* The count is colleague-scoped (cards joined to the systems this
                colleague runs); the action opens the board's whole
                needs-a-human lane — cards carry no colleague field, so the
                board can't be filtered to one colleague. Count and destination
                are worded so they don't contradict. */}
            <p
              className="text-[11px]"
              data-testid="colleague-overlay-needs-human-count"
              style={{ color: MAP_FALLBACK_COLORS.subtext }}
            >
              {needsHumanCount === 1
                ? `1 of ${identity.name}'s cards needs a human`
                : `${needsHumanCount} of ${identity.name}'s cards need a human`}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <ParchmentActionButton
                label={`${identity.name}'s workspace`}
                onClick={onOpenAgentPage}
              />
              <ParchmentActionButton
                label="Open the board's needs-a-human lane"
                onClick={onOpenBoard}
                testId="colleague-overlay-needs-human"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
