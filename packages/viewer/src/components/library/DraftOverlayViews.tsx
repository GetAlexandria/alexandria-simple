import type { LibraryCatalog, LibraryCatalogCard } from "./types";
import { humanizeLinkKey } from "./library-peek-view-model";

const OVERLAY_PANEL_CLASS =
  "border border-[color:var(--viewer-canvas-panel-bd)] bg-[color:var(--viewer-canvas-slate-2)] text-[color:var(--viewer-canvas-fg)]";
const OVERLAY_LABEL_CLASS =
  "font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--viewer-canvas-amber)]";
const OVERLAY_MUTED_TEXT_CLASS = "font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]";
const OVERLAY_ID_TEXT_CLASS = "font-mono text-[11px] text-[color:var(--viewer-canvas-fg-dim)]";
const OVERLAY_AMBER_CHIP_CLASS =
  "border border-[color:var(--viewer-canvas-amber)] bg-[color:var(--viewer-engine-confidence-medium-bg)] px-2 py-0.5 font-sans text-[10px] font-semibold uppercase text-[color:var(--viewer-engine-confidence-medium-text)]";
const OVERLAY_ID_BREAK_WORDS_CLASS = `break-words ${OVERLAY_ID_TEXT_CLASS}`;

export function testIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// The Front-of-House draft diagnostics panel: patch-log identity plus the
// unresolved/invalid entries. Shared verbatim (same testids) between the
// Empty Library review surface and the PMS-Drafts window.
export function DraftOverlaySummary({
  catalog,
  className,
  hideWhenNoIssues = false,
}: {
  catalog: LibraryCatalog;
  className?: string;
  hideWhenNoIssues?: boolean;
}) {
  const overlay = catalog.draftOverlay;
  if (overlay == null) {
    return null;
  }
  const invalidPatches = overlay.invalidPatches ?? [];
  if (hideWhenNoIssues && invalidPatches.length === 0 && overlay.unresolvedUpdates.length === 0) {
    return null;
  }
  const rulingCount = overlay.rulings.length;

  return (
    <section
      className={[
        OVERLAY_PANEL_CLASS,
        "p-3 font-sans text-[11px]",
        ...(className == null ? [] : [className]),
      ].join(" ")}
      data-testid="draft-overlay-summary"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={OVERLAY_AMBER_CHIP_CLASS}>Draft overlay</span>
        <span className="break-words font-mono text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
          {overlay.patchLogPath}
        </span>
        <span className="text-[color:var(--viewer-canvas-fg-dim)]">
          {overlay.appliedUpdateCount} card update{overlay.appliedUpdateCount === 1 ? "" : "s"} /{" "}
          {rulingCount} ruling{rulingCount === 1 ? "" : "s"}
        </span>
      </div>
      {overlay.unresolvedUpdates.length > 0 ? (
        <div className="raven-etched-note mt-3 px-3 py-2" data-testid="draft-overlay-unresolved">
          <div className={OVERLAY_LABEL_CLASS}>Unresolved updates</div>
          <ul className="mt-1 space-y-1">
            {overlay.unresolvedUpdates.map((update, index) => (
              <li
                className="break-words text-[color:var(--viewer-canvas-fg-dim)]"
                key={`${update.patchId}-${update.cardPath}-${index}`}
              >
                <span className="font-mono">
                  {update.cardPath} / {update.patchId} / {update.agendaItemId}
                </span>
                : {update.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {invalidPatches.length > 0 ? (
        <div
          className="raven-etched-note raven-etched-note-danger mt-3 px-3 py-2"
          data-testid="draft-overlay-invalid"
        >
          <div className={OVERLAY_LABEL_CLASS}>Invalid patches</div>
          <ul className="mt-1 space-y-1">
            {invalidPatches.map((patch) => (
              <li
                className="break-words text-[color:var(--viewer-canvas-fg-dim)]"
                key={patch.patchIndex}
              >
                Patch {patch.patchIndex}: {patch.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

// The per-card draft provenance trail (patch / agenda / answer / changed).
export function DraftTrail({ card }: { card: LibraryCatalogCard }) {
  const trail = card.draftTrail ?? [];
  if (trail.length === 0) {
    return null;
  }

  return (
    <div
      className={`${OVERLAY_PANEL_CLASS} mt-3 px-3 py-2`}
      data-testid={`catalog-draft-trail-${testIdPart(card.id)}`}
    >
      <div className={OVERLAY_LABEL_CLASS}>Draft overlay</div>
      <ul className="mt-2 space-y-2">
        {trail.map((entry, index) => {
          const changes = [
            ...entry.fields,
            ...entry.relationships.map((relationship) => humanizeLinkKey(relationship)),
          ];
          return (
            <li
              className="grid gap-1 font-sans text-[11px] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
              key={`${entry.patchId}-${index}`}
            >
              <div className="min-w-0">
                <span className={OVERLAY_MUTED_TEXT_CLASS}>patch</span>{" "}
                <span className={OVERLAY_ID_BREAK_WORDS_CLASS}>{entry.patchId}</span>
              </div>
              <div className="min-w-0">
                <span className={OVERLAY_MUTED_TEXT_CLASS}>agenda/thread</span>{" "}
                <span className={OVERLAY_ID_BREAK_WORDS_CLASS}>{entry.agendaItemId}</span>
              </div>
              <div className="min-w-0">
                <span className={OVERLAY_MUTED_TEXT_CLASS}>answer</span>{" "}
                <span className={OVERLAY_ID_BREAK_WORDS_CLASS}>{entry.answerEventId}</span>
              </div>
              <div className="min-w-0">
                <span className={OVERLAY_MUTED_TEXT_CLASS}>changed</span>{" "}
                <span className="break-words text-[color:var(--viewer-canvas-fg-dim)]">
                  {changes.length === 0 ? "none" : changes.join(", ")}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
