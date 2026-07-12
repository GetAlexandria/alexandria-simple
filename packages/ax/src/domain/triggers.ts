import * as Schema from "effect/Schema";
import { SourceIdentitySchema, type SourceIdentity } from "./sources.js";

export const INBOX_SOURCE_PENDING_TRIGGER_TYPE = "inbox.source.pending";
export const SOURCE_ASSESSMENT_PLAY_ID = "source-assessment";

export const InboxSourcePendingTriggerSchema = Schema.Struct({
  triggerType: Schema.Literal(INBOX_SOURCE_PENDING_TRIGGER_TYPE),
  suggestedPlay: Schema.Literal(SOURCE_ASSESSMENT_PLAY_ID),
  source: SourceIdentitySchema,
});

export type InboxSourcePendingTrigger = Schema.Schema.Type<typeof InboxSourcePendingTriggerSchema>;

// The former ruling.capture.pending derived trigger was removed with the
// Studio Operations eviction (PMS/Alexandria boundary migration, Slice 1):
// after eviction ax cannot run `capture`, so suggesting it would point at an
// unknown play. Derived-on-read, so nothing stored needed migration.
export type ActiveTrigger = InboxSourcePendingTrigger;

export function createInboxSourcePendingTrigger(source: SourceIdentity): InboxSourcePendingTrigger {
  return {
    triggerType: INBOX_SOURCE_PENDING_TRIGGER_TYPE,
    suggestedPlay: SOURCE_ASSESSMENT_PLAY_ID,
    source,
  };
}

export function deriveActiveTriggers(sources: SourceIdentity[]): ActiveTrigger[] {
  return sources.map(createInboxSourcePendingTrigger);
}
