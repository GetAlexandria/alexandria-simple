import type { LibraryCatalog, LibraryCatalogCard } from "./types";
import { humanizeLinkKey } from "./library-peek-view-model";

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
        "border border-[#b6742b] bg-[#fff8ed] p-3 font-mono text-[11px] text-[#4b443c]",
        ...(className == null ? [] : [className]),
      ].join(" ")}
      data-testid="draft-overlay-summary"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="border border-[#b6742b] bg-[#f7ead8] px-2 py-0.5 text-[10px] uppercase text-[#8a4f16]">
          Draft overlay
        </span>
        <span className="break-words text-[#6b665b]">{overlay.patchLogPath}</span>
        <span className="text-[#7b7164]">
          {overlay.appliedUpdateCount} card update{overlay.appliedUpdateCount === 1 ? "" : "s"} /{" "}
          {rulingCount} ruling{rulingCount === 1 ? "" : "s"}
        </span>
      </div>
      {overlay.unresolvedUpdates.length > 0 ? (
        <div className="mt-2" data-testid="draft-overlay-unresolved">
          <div className="text-[10px] uppercase text-[#8a4f16]">Unresolved updates</div>
          <ul className="mt-1 space-y-1">
            {overlay.unresolvedUpdates.map((update, index) => (
              <li className="break-words" key={`${update.patchId}-${update.cardPath}-${index}`}>
                {update.cardPath} / {update.patchId} / {update.agendaItemId}: {update.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {invalidPatches.length > 0 ? (
        <div className="mt-2" data-testid="draft-overlay-invalid">
          <div className="text-[10px] uppercase text-[#8a4f16]">Invalid patches</div>
          <ul className="mt-1 space-y-1">
            {invalidPatches.map((patch) => (
              <li className="break-words" key={patch.patchIndex}>
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
      className="mt-3 border border-[#b6742b] bg-[#fff8ed] px-3 py-2"
      data-testid={`catalog-draft-trail-${testIdPart(card.id)}`}
    >
      <div className="font-mono text-[10px] uppercase text-[#8a4f16]">Draft overlay</div>
      <ul className="mt-2 space-y-2">
        {trail.map((entry, index) => {
          const changes = [
            ...entry.fields,
            ...entry.relationships.map((relationship) => humanizeLinkKey(relationship)),
          ];
          return (
            <li
              className="grid gap-1 font-mono text-[11px] text-[#4b443c] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
              key={`${entry.patchId}-${index}`}
            >
              <div className="min-w-0">
                <span className="text-[#7b7164]">patch</span>{" "}
                <span className="break-words">{entry.patchId}</span>
              </div>
              <div className="min-w-0">
                <span className="text-[#7b7164]">agenda/thread</span>{" "}
                <span className="break-words">{entry.agendaItemId}</span>
              </div>
              <div className="min-w-0">
                <span className="text-[#7b7164]">answer</span>{" "}
                <span className="break-words">{entry.answerEventId}</span>
              </div>
              <div className="min-w-0">
                <span className="text-[#7b7164]">changed</span>{" "}
                <span className="break-words">
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
