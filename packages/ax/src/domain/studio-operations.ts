export const STUDIO_OPERATION_PLAY_IDS = ["capture", "deprecate", "quarantine"] as const;

export type StudioOperationPlayId = (typeof STUDIO_OPERATION_PLAY_IDS)[number];

export const STUDIO_OPERATION_TRIGGER_KINDS = [
  "director-invoked",
  "timer",
  "quality-reaction",
  "intake",
] as const;

export type StudioOperationTriggerKind = (typeof STUDIO_OPERATION_TRIGGER_KINDS)[number];

export const STUDIO_OPERATION_EVENT_TYPES = {
  capture: "studio.operations.capture",
  deprecate: "studio.operations.deprecate",
  quarantine: "studio.operations.quarantine",
} as const satisfies Record<StudioOperationPlayId, string>;

// Ruling events that surface a pending Capture trigger (derived, never
// materialized as a ledger event). See domain/triggers.ts.
export const CAPTURE_REQUEST_SOURCE_EVENT_TYPES = ["play.review_gate_confirmed"] as const;

export type CaptureRequestSourceEventType = (typeof CAPTURE_REQUEST_SOURCE_EVENT_TYPES)[number];

export function isStudioOperationPlayId(value: string): value is StudioOperationPlayId {
  return (STUDIO_OPERATION_PLAY_IDS as readonly string[]).includes(value);
}

export function isStudioOperationTriggerKind(value: string): value is StudioOperationTriggerKind {
  return (STUDIO_OPERATION_TRIGGER_KINDS as readonly string[]).includes(value);
}

export function studioOperationEventTypeForPlayId(playId: StudioOperationPlayId): string {
  return STUDIO_OPERATION_EVENT_TYPES[playId];
}
