import type { RuntimeEvent, RuntimeEventPage } from "../../app/runtime/schemas";

const PAYLOAD_SUMMARY_KEYS = [
  "playId",
  "status",
  "fabroRunId",
  "playRunId",
  "agentId",
  "routeToPlayId",
  "product",
  "libraryVersion",
  "bundlePath",
] as const;

const PAYLOAD_VALUE_LIMIT = 84;
const FALLBACK_PAYLOAD_KEY_LIMIT = 5;

// Status-pip stems are matched against whole classification tokens by prefix, not
// raw substrings, so e.g. "already_appended" does not match the "ready" stem.
const CONFLICT_STEMS = ["fail", "dead", "error", "reject", "conflict"] as const;
const BUSY_STEMS = ["running", "started", "submitted", "requested", "launching"] as const;
const APPROVED_STEMS = [
  "confirmed",
  "completed",
  "succeeded",
  "banked",
  "synced",
  "updated",
] as const;
const REVIEW_STEMS = ["ready", "review", "pending", "needs", "feedback"] as const;

export interface LedgerEventRow {
  actorSummary: string;
  atLabel: string;
  id: string;
  payloadSummary: string;
  statusClass: string;
  type: string;
}

interface IndexedEvent {
  event: RuntimeEvent;
  index: number;
}

function sortableTime(value: string): number {
  const time = Date.parse(value);
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function pluralize(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`;
}

function compactValue(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length === 0) {
      return null;
    }
    return normalized.length > PAYLOAD_VALUE_LIMIT
      ? `${normalized.slice(0, PAYLOAD_VALUE_LIMIT - 3)}...`
      : normalized;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `${value.length} ${pluralize(value.length, "item")}`;
  }

  if (typeof value === "object") {
    return `${Object.keys(value).length} ${pluralize(Object.keys(value).length, "key")}`;
  }

  return null;
}

export function sortLedgerEventsNewestFirst(events: readonly RuntimeEvent[]): RuntimeEvent[] {
  return events
    .map((event, index): IndexedEvent => ({ event, index }))
    .sort((left, right) => {
      const timeDelta = sortableTime(right.event.at) - sortableTime(left.event.at);
      if (timeDelta !== 0) {
        return timeDelta;
      }

      return right.index - left.index;
    })
    .map(({ event }) => event);
}

export function ledgerActorSummary(actor: RuntimeEvent["actor"]): string {
  const name = nonEmptyString(actor.name);
  if (name != null) {
    return name;
  }

  const parts = [actor.kind, actor.host, actor.process].flatMap((part) => {
    const normalized = nonEmptyString(part);
    return normalized == null ? [] : [normalized];
  });

  return parts.length === 0 ? "unknown actor" : parts.join(" / ");
}

export function formatLedgerTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    second: "2-digit",
    year: "numeric",
  });
}

function classificationTokens(event: RuntimeEvent): string[] {
  const status = nonEmptyString(event.payload.status)?.toLowerCase();
  const classification = status ?? event.type.toLowerCase();
  return classification.split(/[^a-z0-9]+/).filter((token) => token.length > 0);
}

function tokensStartWithAny(tokens: readonly string[], stems: readonly string[]): boolean {
  return tokens.some((token) => stems.some((stem) => token.startsWith(stem)));
}

export function ledgerStatusClass(event: RuntimeEvent): string {
  const tokens = classificationTokens(event);

  if (tokensStartWithAny(tokens, CONFLICT_STEMS)) {
    return "raven-status-pip-conflict";
  }

  if (tokensStartWithAny(tokens, BUSY_STEMS)) {
    return "raven-status-pip-busy";
  }

  if (tokensStartWithAny(tokens, APPROVED_STEMS)) {
    return "raven-status-pip-approved";
  }

  if (tokensStartWithAny(tokens, REVIEW_STEMS)) {
    return "raven-status-pip-review";
  }

  return "raven-status-pip-neutral";
}

export function ledgerPayloadSummary(event: RuntimeEvent): string {
  const parts = PAYLOAD_SUMMARY_KEYS.flatMap((key) => {
    if (!(key in event.payload)) {
      return [];
    }

    const value = compactValue(event.payload[key]);
    return value == null ? [] : [`${key}=${value}`];
  });

  if (parts.length > 0) {
    return parts.join(" / ");
  }

  const keys = Object.keys(event.payload).sort();
  if (keys.length > 0) {
    const visibleKeys = keys.slice(0, FALLBACK_PAYLOAD_KEY_LIMIT);
    const suffix = keys.length > visibleKeys.length ? ` +${keys.length - visibleKeys.length}` : "";
    return `payload keys: ${visibleKeys.join(", ")}${suffix}`;
  }

  return event.id;
}

export function buildLedgerEventRows(events: readonly RuntimeEvent[]): LedgerEventRow[] {
  return sortLedgerEventsNewestFirst(events).map((event) => ({
    actorSummary: ledgerActorSummary(event.actor),
    atLabel: formatLedgerTimestamp(event.at),
    id: event.id,
    payloadSummary: ledgerPayloadSummary(event),
    statusClass: ledgerStatusClass(event),
    type: event.type,
  }));
}

export function ledgerCountLine(page: RuntimeEventPage): string {
  const returnedCount = page.returnedCount;
  const totalCount = page.totalCount ?? returnedCount;

  if (page.truncated === true && totalCount > returnedCount) {
    return `Showing ${returnedCount} of ${totalCount} events. More events exist.`;
  }

  if (page.truncated === true) {
    return `Showing ${returnedCount} ${pluralize(returnedCount, "event")}. More events exist.`;
  }

  if (totalCount !== returnedCount) {
    return `Showing ${returnedCount} of ${totalCount} events.`;
  }

  return `Showing ${returnedCount} ${pluralize(returnedCount, "event")}.`;
}
