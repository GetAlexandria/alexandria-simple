// The colleague landmark overlay (L2, plan §1.1): clicking a colleague's
// building opens this over a dimmed map — who they are (name/role from the
// agent roster), what they've been doing (top ~3 journal entries, the file is
// the source of truth), and what they can do (a quick bar mirroring
// RavenBench: open their workspace, and a jump to their needs-a-human cards on
// the board). It shares MapOverlay's shell (the MapScrimPanel primitive: scrim
// + centered parchment panel + click-away) but keeps its own close-on-Escape
// and narrower width — this lens shows a journal, not cards.

import { useEffect, type CSSProperties } from "react";
import type { JournalEntry } from "../../app/runtime/schemas";
import type { ColleagueIdentity } from "./colleague-overlay";
import { topJournalEntries } from "./colleague-overlay";
import { MAP_FALLBACK_COLORS } from "./colors";
import { MapScrimPanel } from "./MapScrimPanel";
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
  /**
   * The colleague's journal entries, selected from the shared journals feed:
   * null while journals load / are unavailable, [] when the colleague has no
   * journal file yet, otherwise newest-first entries.
   */
  entries: readonly JournalEntry[] | null;
  needsHumanCount: number;
  /** Opens the colleague's per-agent page (the bench quick-bar link). */
  onOpenAgentPage: () => void;
  /** Opens the Info Hub board's needs-a-human lane. */
  onOpenBoard: () => void;
  onClose: () => void;
};

export function ColleagueOverlay({
  identity,
  entries,
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

  const journalLoading = entries == null;
  const topEntries = entries == null ? [] : topJournalEntries(entries, JOURNAL_ENTRY_LIMIT);

  return (
    <MapScrimPanel
      testId="colleague-overlay"
      maxWidthClass="max-w-md"
      onClose={onClose}
      title={
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
      }
      headerActions={<ParchmentActionButton label="Close" onClick={onClose} />}
    >
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
      ) : topEntries.length === 0 ? (
        <p className="mt-1 text-xs" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
          No journal entries yet — {identity.name} hasn&apos;t written a beat.
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2" data-testid="colleague-overlay-journal">
          {topEntries.map((entry, index) => (
            <li
              key={`${entry.timestamp}:${entry.title}:${index}`}
              className="rounded border px-2 py-1.5"
              data-testid="colleague-overlay-entry"
              style={{ borderColor: MAP_FALLBACK_COLORS.border }}
            >
              <p
                className="text-[11px] font-semibold"
                style={{ color: MAP_FALLBACK_COLORS.heading }}
              >
                {entry.title || "Untitled entry"}
                {entry.timestamp.length > 0 ? (
                  <span className="ml-1 font-normal" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
                    · {entry.timestamp}
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
          <ParchmentActionButton label={`${identity.name}'s workspace`} onClick={onOpenAgentPage} />
          <ParchmentActionButton
            label="Open the board's needs-a-human lane"
            onClick={onOpenBoard}
            testId="colleague-overlay-needs-human"
          />
        </div>
      </div>
    </MapScrimPanel>
  );
}
