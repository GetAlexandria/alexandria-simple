import { useEffect, useState } from "react";
import * as Effect from "effect/Effect";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import type {
  RuntimeRavenVisionBankResult,
  RuntimeRavenVisionProjection,
  RuntimeRavenVisionSlotId,
} from "../../../app/runtime/schemas";
import { errorMessage } from "../error-message";
import { useVisionSlotDrafts } from "./useVisionSlotDrafts";
import { VisionSlotCard } from "./VisionSlotCard";
import { VisionSourceIntake } from "./VisionSourceIntake";
import { visionStatusLabels } from "./vision-slot-guidance";

interface VisionOnboardingViewProps {
  runtimeClient: ViewerRuntimeClient;
  vision: RuntimeRavenVisionProjection | null;
  onVisionBanked(result: RuntimeRavenVisionBankResult): void;
  onVisionChange(vision: RuntimeRavenVisionProjection): void;
}

function toggledMembership(
  values: RuntimeRavenVisionSlotId[],
  slotId: RuntimeRavenVisionSlotId,
  present: boolean,
): RuntimeRavenVisionSlotId[] {
  if (present) {
    return values.includes(slotId) ? values : [...values, slotId];
  }

  return values.filter((value) => value !== slotId);
}

export function VisionOnboardingView({
  runtimeClient,
  vision,
  onVisionBanked,
  onVisionChange,
}: VisionOnboardingViewProps) {
  const [error, setError] = useState<string | null>(null);
  const [banking, setBanking] = useState(false);
  const [requestingDraft, setRequestingDraft] = useState(false);
  const [expandedCompletedSlots, setExpandedCompletedSlots] = useState<RuntimeRavenVisionSlotId[]>(
    [],
  );
  const [collapsedInfoSlots, setCollapsedInfoSlots] = useState<RuntimeRavenVisionSlotId[]>([]);

  useEffect(() => {
    let canceled = false;

    if (vision != null) {
      return;
    }

    Effect.runPromise(runtimeClient.getRavenVision)
      .then((loadedVision) => {
        if (!canceled) {
          onVisionChange(loadedVision);
        }
      })
      .catch((caught: unknown) => {
        if (!canceled) {
          setError(errorMessage(caught));
        }
      });

    return () => {
      canceled = true;
    };
  }, [onVisionChange, runtimeClient, vision]);

  async function applyVisionMutation(
    effect: Effect.Effect<RuntimeRavenVisionProjection, unknown>,
  ): Promise<RuntimeRavenVisionProjection | null> {
    try {
      const nextVision = await Effect.runPromise(effect);
      setError(null);
      onVisionChange(nextVision);
      return nextVision;
    } catch (caught: unknown) {
      setError(errorMessage(caught));
      return null;
    }
  }

  const drafts = useVisionSlotDrafts({
    applyVisionMutation,
    runtimeClient,
    vision,
  });

  async function requestDrafting(): Promise<void> {
    setError(null);
    setRequestingDraft(true);

    try {
      const nextVision = await Effect.runPromise(runtimeClient.requestRavenVisionDrafting);
      onVisionChange(nextVision);
    } catch (caught: unknown) {
      setError(errorMessage(caught));
    } finally {
      setRequestingDraft(false);
    }
  }

  async function bankVision(): Promise<void> {
    setError(null);
    setBanking(true);

    try {
      const result = await Effect.runPromise(runtimeClient.bankRavenVision);
      onVisionChange(result.vision);
      onVisionBanked(result);
    } catch (caught: unknown) {
      setError(errorMessage(caught));
    } finally {
      setBanking(false);
    }
  }

  if (vision == null) {
    return (
      <section
        className="raven-canvas-section min-h-[calc(100vh-84px-220px)] px-6 py-10"
        data-testid="vision-onboarding"
      >
        <div className="mx-auto max-w-[1120px] font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-[#d4a052]">
          Loading the description
        </div>
      </section>
    );
  }

  const bankAvailable = vision.status === "ready_to_bank" && !banking;
  const bankButtonLabel =
    vision.status === "banked" ? "Banked" : banking ? "Banking" : "Bank description";
  const hasReviewSlot = vision.slots.some((slot) => slot.status === "needs_review");
  const hasEmptySlot = vision.slots.some((slot) => slot.status === "empty");
  const canRequestDrafting =
    vision.sourceItems.length > 0 &&
    hasEmptySlot &&
    !hasReviewSlot &&
    vision.status !== "banked" &&
    !requestingDraft;
  const draftRequestTitle =
    vision.sourceItems.length === 0
      ? "Add at least one source first."
      : hasReviewSlot
        ? "Review the current slot first."
        : !hasEmptySlot
          ? "No empty Vision slots remain."
          : undefined;

  return (
    <section
      className="raven-canvas-section min-h-[calc(100vh-84px-220px)] px-6 py-9"
      data-vision-status={vision.status}
      data-testid="vision-onboarding"
    >
      <div className="vision-builder-shell" data-vision-status={vision.status}>
        <header className="vision-builder-header max-[780px]:items-start">
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b8863a]">
              Basic Product Description
            </p>
            <h1 className="mt-2 font-display text-[42px] font-normal leading-tight text-[#f1d9aa] max-[640px]:text-[34px]">
              Describe the product
            </h1>
          </div>

          <div className="flex flex-col items-end gap-2 max-[780px]:items-start">
            <button
              className={[
                "raven-btn-primary raven-bank-button min-w-[178px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]",
                bankAvailable ? "" : "cursor-not-allowed",
              ].join(" ")}
              data-testid="bank-vision-button"
              disabled={!bankAvailable}
              onClick={() => {
                void bankVision();
              }}
              type="button"
            >
              {bankButtonLabel}
            </button>
            <span
              className={[
                "raven-status-pip raven-status-pip-compact",
                bankAvailable
                  ? "raven-status-pip-approved"
                  : vision.status === "banked"
                    ? "raven-status-pip-approved"
                    : "raven-status-pip-review",
              ].join(" ")}
              data-testid="vision-ready-state"
            >
              {visionStatusLabels[vision.status]}
            </span>
          </div>
        </header>

        {error == null ? null : (
          <p
            className="raven-etched-note raven-etched-note-danger mt-5 px-4 py-3"
            data-testid="vision-inline-error"
          >
            {error}
          </p>
        )}

        <VisionSourceIntake
          canRequestDrafting={canRequestDrafting}
          draftRequestTitle={draftRequestTitle}
          onRequestDrafting={() => {
            void requestDrafting();
          }}
          onVisionChange={onVisionChange}
          requestingDraft={requestingDraft}
          runtimeClient={runtimeClient}
          sourceItems={vision.sourceItems}
        />

        <div className="vision-slots-list mt-7">
          {vision.manifest.map((manifestSlot) => {
            const slot = drafts.slotStateById.get(manifestSlot.id) ?? {
              id: manifestSlot.id,
              status: "empty" as const,
              text: "",
            };

            return (
              <VisionSlotCard
                conflicted={drafts.conflictedSlots.includes(manifestSlot.id)}
                infoCollapsed={collapsedInfoSlots.includes(manifestSlot.id)}
                key={manifestSlot.id}
                manifestSlot={manifestSlot}
                onApprove={() => {
                  void drafts.reviewSlot(manifestSlot.id, "approve");
                }}
                onCommitText={() => {
                  void drafts.commitSlotText(manifestSlot.id);
                }}
                onSkip={() => {
                  void drafts.reviewSlot(manifestSlot.id, "skip");
                }}
                onTextChange={(text) => {
                  drafts.scheduleSlotTextSave(manifestSlot.id, text);
                }}
                onToggleExpanded={() => {
                  setExpandedCompletedSlots((current) =>
                    toggledMembership(current, manifestSlot.id, !current.includes(manifestSlot.id)),
                  );
                }}
                onToggleInfo={(infoExpanded) => {
                  setCollapsedInfoSlots((current) =>
                    toggledMembership(current, manifestSlot.id, infoExpanded),
                  );
                }}
                remoteUpdated={drafts.remoteUpdatedSlots.includes(manifestSlot.id)}
                reviewing={drafts.reviewingSlots.includes(manifestSlot.id)}
                reviewExpanded={expandedCompletedSlots.includes(manifestSlot.id)}
                saving={drafts.savingSlots.includes(manifestSlot.id)}
                slot={slot}
                value={drafts.slotText[manifestSlot.id] ?? slot.text}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
