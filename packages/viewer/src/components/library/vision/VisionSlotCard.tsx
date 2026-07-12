import type {
  RuntimeRavenVisionManifestSlot,
  RuntimeRavenVisionSlot,
} from "../../../app/runtime/schemas";
import { RavenNotesMarkdown } from "./RavenNotesMarkdown";
import {
  isCompletedSlotStatus,
  slotGuidance,
  slotStatusLabels,
  slotStatusPipClass,
} from "./vision-slot-guidance";

interface VisionSlotCardProps {
  conflicted: boolean;
  infoCollapsed: boolean;
  manifestSlot: RuntimeRavenVisionManifestSlot;
  onApprove(): void;
  onCommitText(): void;
  onSkip(): void;
  onTextChange(text: string): void;
  onToggleExpanded(): void;
  onToggleInfo(infoExpanded: boolean): void;
  remoteUpdated: boolean;
  reviewing: boolean;
  reviewExpanded: boolean;
  saving: boolean;
  slot: RuntimeRavenVisionSlot;
  value: string;
}

export function VisionSlotCard({
  conflicted,
  infoCollapsed,
  manifestSlot,
  onApprove,
  onCommitText,
  onSkip,
  onTextChange,
  onToggleExpanded,
  onToggleInfo,
  remoteUpdated,
  reviewing,
  reviewExpanded,
  saving,
  slot,
  value,
}: VisionSlotCardProps) {
  const guidance = slotGuidance[manifestSlot.id];
  const completed = isCompletedSlotStatus(slot.status);
  const expanded = !completed || reviewExpanded;
  const infoExpanded = expanded && !infoCollapsed;
  const lockedLabel =
    slot.status === "approved"
      ? "Approved and locked"
      : slot.status === "skipped"
        ? "Skipped and locked"
        : undefined;
  const busy = saving || reviewing;
  const hasRavenNotes = slot.ravenNotes != null || slot.ravenDraftedAt != null;
  const syncLabel = busy
    ? "Saving"
    : conflicted
      ? "Local draft"
      : remoteUpdated
        ? "Synced"
        : "Saved";
  const syncPipClass = busy
    ? "raven-status-pip-busy"
    : conflicted
      ? "raven-status-pip-conflict"
      : remoteUpdated
        ? "raven-status-pip-synced"
        : "raven-status-pip-neutral";

  return (
    <article
      className="vision-slot-card"
      data-remote-update={remoteUpdated ? "true" : "false"}
      data-folded={expanded ? "false" : "true"}
      data-locked={completed ? "true" : "false"}
      data-status={slot.status}
      data-testid={`vision-slot-${manifestSlot.id}`}
    >
      <div className="vision-slot-head">
        <span className="vision-slot-number">{String(manifestSlot.order).padStart(2, "0")}</span>
        <div className="min-w-0">
          <h2 className="vision-slot-title">{manifestSlot.label}</h2>
          <p className="vision-slot-purpose">{manifestSlot.purpose}</p>
        </div>
        <span
          className={[
            "raven-status-pip raven-status-pip-compact shrink-0",
            slotStatusPipClass(slot.status),
          ].join(" ")}
          data-testid={`vision-slot-status-${manifestSlot.id}`}
        >
          {slotStatusLabels[slot.status]}
        </span>
      </div>

      {expanded ? (
        <div className="vision-slot-main">
          <div className="vision-slot-info-bar">
            <button
              aria-expanded={infoExpanded}
              className="vision-slot-info-toggle"
              data-testid={`vision-slot-info-toggle-${manifestSlot.id}`}
              onClick={() => {
                onToggleInfo(infoExpanded);
              }}
              type="button"
            >
              <span className="vision-slot-info-chev" aria-hidden="true">
                v
              </span>
              Instructions
            </button>
            <span className="vision-slot-info-link">
              <span aria-hidden="true">i</span>
              Slot guide
            </span>
          </div>

          {infoExpanded ? (
            <section
              aria-label={`${manifestSlot.label} instructions`}
              className="vision-slot-info"
              data-testid={`vision-slot-info-${manifestSlot.id}`}
            >
              <dl className="vision-slot-info-grid">
                <div>
                  <dt>Length</dt>
                  <dd>{guidance.length}</dd>
                </div>
                <div>
                  <dt>Pulling for</dt>
                  <dd>{guidance.pullingFor}</dd>
                </div>
                <div>
                  <dt>Quick test</dt>
                  <dd>{guidance.quickTest}</dd>
                </div>
              </dl>
              <p className="vision-slot-prompt">{guidance.prompt}</p>
            </section>
          ) : null}

          <textarea
            aria-label={`${manifestSlot.label} vision slot`}
            className="vision-slot-editor"
            data-testid={`vision-slot-editor-${manifestSlot.id}`}
            disabled={completed || busy}
            onBlur={() => {
              if (!completed) {
                onCommitText();
              }
            }}
            onChange={(event) => {
              if (!completed) {
                onTextChange(event.target.value);
              }
            }}
            readOnly={completed}
            value={value}
          />

          {hasRavenNotes ? (
            <section
              aria-label={`${manifestSlot.label} Raven notes`}
              className="vision-raven-notes"
              data-testid={`vision-slot-raven-notes-${manifestSlot.id}`}
            >
              <div className="vision-raven-notes-title">Raven&apos;s notes</div>
              <div className="vision-raven-notes-body">
                <RavenNotesMarkdown
                  content={
                    slot.ravenNotes != null && slot.ravenNotes.length > 0
                      ? slot.ravenNotes
                      : "No notes came with this draft."
                  }
                />
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <p className="vision-slot-folded-summary">
          {value.trim().length > 0 ? value : lockedLabel}
        </p>
      )}

      <div className="vision-slot-belowbar">
        <span
          className={["raven-status-pip raven-status-pip-compact min-w-[8.5em]", syncPipClass].join(
            " ",
          )}
          data-testid={conflicted ? `vision-slot-conflict-${manifestSlot.id}` : undefined}
        >
          {syncLabel}
        </span>
        <div className="flex flex-wrap justify-end gap-2">
          {completed ? (
            <>
              <span className="vision-slot-lock-note">{lockedLabel}</span>
              <button
                aria-expanded={expanded}
                className="raven-btn-quiet h-9 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]"
                data-testid={`vision-slot-toggle-${manifestSlot.id}`}
                onClick={onToggleExpanded}
                type="button"
              >
                {expanded ? "Fold" : "Review"}
              </button>
            </>
          ) : (
            <>
              <button
                className="raven-btn-ghost h-9 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]"
                data-testid={`vision-slot-approve-${manifestSlot.id}`}
                disabled={busy}
                onClick={onApprove}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                type="button"
              >
                Approve
              </button>
              <button
                className="raven-btn-quiet h-9 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]"
                data-testid={`vision-slot-skip-${manifestSlot.id}`}
                disabled={busy}
                onClick={onSkip}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                type="button"
              >
                Skip
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
