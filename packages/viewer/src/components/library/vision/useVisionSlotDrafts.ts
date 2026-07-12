import { useEffect, useMemo, useRef, useState } from "react";
import type * as Effect from "effect/Effect";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import type {
  RuntimeRavenVisionProjection,
  RuntimeRavenVisionSlot,
  RuntimeRavenVisionSlotId,
} from "../../../app/runtime/schemas";

type SlotTextMap = Partial<Record<RuntimeRavenVisionSlotId, string>>;

const SLOT_SAVE_DEBOUNCE_MS = 300;
const REMOTE_FLASH_MS = 1_400;

function setMembership(
  values: RuntimeRavenVisionSlotId[],
  slotId: RuntimeRavenVisionSlotId,
  present: boolean,
): RuntimeRavenVisionSlotId[] {
  if (present) {
    return values.includes(slotId) ? values : [...values, slotId];
  }

  return values.filter((value) => value !== slotId);
}

export interface VisionSlotDrafts {
  commitSlotText(slotId: RuntimeRavenVisionSlotId): Promise<boolean>;
  conflictedSlots: RuntimeRavenVisionSlotId[];
  remoteUpdatedSlots: RuntimeRavenVisionSlotId[];
  reviewSlot(slotId: RuntimeRavenVisionSlotId, action: "approve" | "skip"): Promise<void>;
  reviewingSlots: RuntimeRavenVisionSlotId[];
  savingSlots: RuntimeRavenVisionSlotId[];
  scheduleSlotTextSave(slotId: RuntimeRavenVisionSlotId, text: string): void;
  slotStateById: ReadonlyMap<RuntimeRavenVisionSlotId, RuntimeRavenVisionSlot>;
  slotText: SlotTextMap;
}

export interface VisionSlotDraftsOptions {
  applyVisionMutation(
    effect: Effect.Effect<RuntimeRavenVisionProjection, unknown>,
  ): Promise<RuntimeRavenVisionProjection | null>;
  runtimeClient: ViewerRuntimeClient;
  vision: RuntimeRavenVisionProjection | null;
}

/**
 * Owns the local slot draft lifecycle: debounced autosave, save/review
 * busy-state, remote-update flashes, and conflict detection between local
 * drafts and Raven-side slot updates.
 */
export function useVisionSlotDrafts({
  applyVisionMutation,
  runtimeClient,
  vision,
}: VisionSlotDraftsOptions): VisionSlotDrafts {
  const [slotText, setSlotText] = useState<SlotTextMap>({});
  const [savingSlots, setSavingSlots] = useState<RuntimeRavenVisionSlotId[]>([]);
  const [remoteUpdatedSlots, setRemoteUpdatedSlots] = useState<RuntimeRavenVisionSlotId[]>([]);
  const [conflictedSlots, setConflictedSlots] = useState<RuntimeRavenVisionSlotId[]>([]);
  const [reviewingSlots, setReviewingSlots] = useState<RuntimeRavenVisionSlotId[]>([]);
  const pendingText = useRef<SlotTextMap>({});
  const timers = useRef<Partial<Record<RuntimeRavenVisionSlotId, ReturnType<typeof setTimeout>>>>(
    {},
  );
  const remoteFlashTimers = useRef<Partial<Record<RuntimeRavenVisionSlotId, number>>>({});
  const previousVisionSlots = useRef<Map<RuntimeRavenVisionSlotId, string> | null>(null);

  useEffect(() => {
    if (vision == null) {
      return;
    }

    const incomingSlots = new Map(
      vision.slots.map((slot) => [
        slot.id,
        `${slot.status}\u0000${slot.text}\u0000${slot.updatedAt ?? ""}`,
      ]),
    );
    const previousSlots = previousVisionSlots.current;
    const changedSlots =
      previousSlots == null
        ? []
        : vision.slots
            .filter((slot) => previousSlots.get(slot.id) !== incomingSlots.get(slot.id))
            .map((slot) => slot.id);
    const changedSlotIds = new Set(changedSlots);
    const conflicts = vision.slots
      .filter((slot) => {
        const pending = pendingText.current[slot.id];
        return changedSlotIds.has(slot.id) && pending != null && pending !== slot.text;
      })
      .map((slot) => slot.id);
    for (const slotId of conflicts) {
      if (timers.current[slotId] != null) {
        clearTimeout(timers.current[slotId]);
        delete timers.current[slotId];
      }
    }
    previousVisionSlots.current = incomingSlots;
    if (changedSlots.length > 0) {
      const conflictSlotIds = new Set(conflicts);
      setConflictedSlots((current) => {
        const next = current.filter(
          (slotId) => !changedSlotIds.has(slotId) || conflictSlotIds.has(slotId),
        );
        for (const slotId of conflicts) {
          if (!next.includes(slotId)) {
            next.push(slotId);
          }
        }
        return next;
      });

      setRemoteUpdatedSlots((current) => {
        const next = new Set(current);
        for (const slotId of changedSlots) {
          next.add(slotId);
        }
        return [...next];
      });

      for (const slotId of changedSlots) {
        if (remoteFlashTimers.current[slotId] != null) {
          window.clearTimeout(remoteFlashTimers.current[slotId]);
        }
        remoteFlashTimers.current[slotId] = window.setTimeout(() => {
          delete remoteFlashTimers.current[slotId];
          setRemoteUpdatedSlots((current) => current.filter((candidate) => candidate !== slotId));
        }, REMOTE_FLASH_MS);
      }
    }

    setSlotText((current) => {
      const next = { ...current };
      for (const manifestSlot of vision.manifest) {
        const state = vision.slots.find((slot) => slot.id === manifestSlot.id);
        if (pendingText.current[manifestSlot.id] != null) {
          next[manifestSlot.id] = current[manifestSlot.id] ?? pendingText.current[manifestSlot.id];
        } else {
          next[manifestSlot.id] = state?.text ?? "";
        }
      }
      return next;
    });
  }, [vision]);

  useEffect(() => {
    return () => {
      for (const timer of Object.values(timers.current)) {
        if (timer != null) {
          clearTimeout(timer);
        }
      }
      for (const timer of Object.values(remoteFlashTimers.current)) {
        if (timer != null) {
          clearTimeout(timer);
        }
      }
    };
  }, []);

  const slotStateById = useMemo(() => {
    return new Map(vision?.slots.map((slot) => [slot.id, slot]) ?? []);
  }, [vision]);

  async function commitSlotText(slotId: RuntimeRavenVisionSlotId): Promise<boolean> {
    const text = pendingText.current[slotId];
    if (text == null) {
      return true;
    }

    if (timers.current[slotId] != null) {
      clearTimeout(timers.current[slotId]);
      delete timers.current[slotId];
    }
    delete pendingText.current[slotId];
    setConflictedSlots((current) => setMembership(current, slotId, false));
    setSavingSlots((current) => setMembership(current, slotId, true));

    try {
      const nextVision = await applyVisionMutation(
        runtimeClient.updateRavenVisionSlot(slotId, text),
      );
      return nextVision != null;
    } finally {
      setSavingSlots((current) => setMembership(current, slotId, false));
    }
  }

  function scheduleSlotTextSave(slotId: RuntimeRavenVisionSlotId, text: string): void {
    setSlotText((current) => ({ ...current, [slotId]: text }));
    pendingText.current[slotId] = text;
    setConflictedSlots((current) => setMembership(current, slotId, false));

    if (timers.current[slotId] != null) {
      clearTimeout(timers.current[slotId]);
    }

    timers.current[slotId] = setTimeout(() => {
      void commitSlotText(slotId);
    }, SLOT_SAVE_DEBOUNCE_MS);
  }

  async function reviewSlot(
    slotId: RuntimeRavenVisionSlotId,
    action: "approve" | "skip",
  ): Promise<void> {
    setReviewingSlots((current) => setMembership(current, slotId, true));
    try {
      const flushed = await commitSlotText(slotId);
      if (!flushed) {
        return;
      }

      await applyVisionMutation(
        action === "approve"
          ? runtimeClient.approveRavenVisionSlot(slotId)
          : runtimeClient.skipRavenVisionSlot(slotId),
      );
    } finally {
      setReviewingSlots((current) => setMembership(current, slotId, false));
    }
  }

  return {
    commitSlotText,
    conflictedSlots,
    remoteUpdatedSlots,
    reviewSlot,
    reviewingSlots,
    savingSlots,
    scheduleSlotTextSave,
    slotStateById,
    slotText,
  };
}
