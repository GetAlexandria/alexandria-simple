import {
  isKnownStateEventType,
  validateAlexandriaActor,
  type AlexandriaActor,
  type AlexandriaStateEvent,
  type AlexandriaStateEventType,
} from "./state-events.js";

export const WAKE_SUBSCRIPTION_SCHEMA_VERSION = 1;
export const CONNECTION_LEASE_SCHEMA_VERSION = 1;

export const WAKE_HOSTS = ["claude-code", "codex", "freeq-raven"] as const;
export const WAKE_DELIVERY_MODES = ["plugin-monitor", "codex-app-server", "room-bot"] as const;

export type WakeHost = (typeof WAKE_HOSTS)[number];
export type WakeDeliveryMode = (typeof WAKE_DELIVERY_MODES)[number];

export interface WakeSubscriptionRule {
  type: AlexandriaStateEventType;
  reason: string;
}

export interface WakeSubscription {
  schemaVersion: number;
  subscriptionId: string;
  connectionId: string;
  owner: AlexandriaActor;
  match: WakeSubscriptionRule[];
  delivery: {
    host: WakeHost;
    mode: WakeDeliveryMode;
  };
  wake: {
    includeMatchedEvent: boolean;
    includeProjectedState: boolean;
    maxContextEvents: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionLease {
  schemaVersion: number;
  connectionId: string;
  cursorId: string;
  owner: AlexandriaActor;
  delivery: {
    host: WakeHost;
    mode: WakeDeliveryMode;
  };
  pid: number;
  startedAt: string;
  updatedAt: string;
  expiresAt: string;
}

export type WakeSubscriptionDecision =
  | {
      kind: "wake";
      message: string;
      reason: string;
      subscriptionId: string;
    }
  | {
      kind: "ignore";
      reason: "subscription-no-match";
    };

const IdPattern = /^[A-Za-z0-9._:-]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function validateId(value: unknown, field: string): string | Error {
  if (typeof value !== "string" || value.length === 0) {
    return new Error(`${field} must be a non-empty string.`);
  }

  if (value === "." || value === "..") {
    return new Error(`${field} must not be "." or "..".`);
  }

  if (!IdPattern.test(value)) {
    return new Error(
      `${field} may contain only letters, numbers, dots, underscores, colons, and dashes.`,
    );
  }

  return value;
}

function validateIsoTimestamp(value: unknown, field: string): string | Error {
  if (typeof value !== "string") {
    return new Error(`${field} must be an ISO timestamp string.`);
  }

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return new Error(`${field} must be an ISO timestamp with millisecond precision.`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.toISOString() !== value) {
    return new Error(`${field} must be a valid ISO timestamp.`);
  }

  return value;
}

function isWakeHost(value: unknown): value is WakeHost {
  return typeof value === "string" && (WAKE_HOSTS as readonly string[]).includes(value);
}

function isWakeDeliveryMode(value: unknown): value is WakeDeliveryMode {
  return typeof value === "string" && (WAKE_DELIVERY_MODES as readonly string[]).includes(value);
}

function validateWakeHost(value: unknown): WakeHost | Error {
  if (isWakeHost(value)) {
    return value;
  }

  return new Error(`delivery.host must be one of ${WAKE_HOSTS.join(", ")}.`);
}

function validateDeliveryMode(value: unknown): WakeDeliveryMode | Error {
  if (isWakeDeliveryMode(value)) {
    return value;
  }

  return new Error(`delivery.mode must be one of ${WAKE_DELIVERY_MODES.join(", ")}.`);
}

function validateRule(value: unknown, index: number): WakeSubscriptionRule | Error {
  if (!isRecord(value)) {
    return new Error(`match[${index}] must be an object.`);
  }

  if (typeof value.type !== "string" || !isKnownStateEventType(value.type)) {
    return new Error(`match[${index}].type must be a known event type.`);
  }

  if (typeof value.reason !== "string" || value.reason.length === 0) {
    return new Error(`match[${index}].reason must be a non-empty string.`);
  }

  return {
    type: value.type,
    reason: value.reason,
  };
}

export function validateSubscriptionId(value: string): string | Error {
  return validateId(value, "subscriptionId");
}

export function validateConnectionId(value: string): string | Error {
  return validateId(value, "connectionId");
}

export function validateWakeSubscription(value: unknown): WakeSubscription | Error {
  if (!isRecord(value)) {
    return new Error("wake subscription must be a JSON object.");
  }

  if (value.schemaVersion !== WAKE_SUBSCRIPTION_SCHEMA_VERSION) {
    return new Error(`schemaVersion must be ${WAKE_SUBSCRIPTION_SCHEMA_VERSION}.`);
  }

  const subscriptionId = validateId(value.subscriptionId, "subscriptionId");
  if (subscriptionId instanceof Error) {
    return subscriptionId;
  }

  const connectionId = validateId(value.connectionId, "connectionId");
  if (connectionId instanceof Error) {
    return connectionId;
  }

  const owner = validateAlexandriaActor(value.owner);
  if (owner instanceof Error) {
    return owner;
  }

  if (!Array.isArray(value.match) || value.match.length === 0) {
    return new Error("match must contain at least one rule.");
  }

  const match: WakeSubscriptionRule[] = [];
  for (const [index, ruleValue] of value.match.entries()) {
    const rule = validateRule(ruleValue, index);
    if (rule instanceof Error) {
      return rule;
    }
    match.push(rule);
  }

  if (!isRecord(value.delivery)) {
    return new Error("delivery must be an object.");
  }
  const host = validateWakeHost(value.delivery.host);
  if (host instanceof Error) {
    return host;
  }
  const mode = validateDeliveryMode(value.delivery.mode);
  if (mode instanceof Error) {
    return mode;
  }

  if (!isRecord(value.wake)) {
    return new Error("wake must be an object.");
  }
  if (typeof value.wake.includeMatchedEvent !== "boolean") {
    return new Error("wake.includeMatchedEvent must be a boolean.");
  }
  if (typeof value.wake.includeProjectedState !== "boolean") {
    return new Error("wake.includeProjectedState must be a boolean.");
  }
  if (
    typeof value.wake.maxContextEvents !== "number" ||
    !Number.isSafeInteger(value.wake.maxContextEvents) ||
    value.wake.maxContextEvents < 1
  ) {
    return new Error("wake.maxContextEvents must be a positive integer.");
  }

  const createdAt = validateIsoTimestamp(value.createdAt, "createdAt");
  if (createdAt instanceof Error) {
    return createdAt;
  }
  const updatedAt = validateIsoTimestamp(value.updatedAt, "updatedAt");
  if (updatedAt instanceof Error) {
    return updatedAt;
  }

  return {
    schemaVersion: WAKE_SUBSCRIPTION_SCHEMA_VERSION,
    subscriptionId,
    connectionId,
    owner,
    match,
    delivery: { host, mode },
    wake: {
      includeMatchedEvent: value.wake.includeMatchedEvent,
      includeProjectedState: value.wake.includeProjectedState,
      maxContextEvents: value.wake.maxContextEvents,
    },
    createdAt,
    updatedAt,
  };
}

export function validateConnectionLease(value: unknown): ConnectionLease | Error {
  if (!isRecord(value)) {
    return new Error("connection lease must be a JSON object.");
  }

  if (value.schemaVersion !== CONNECTION_LEASE_SCHEMA_VERSION) {
    return new Error(`schemaVersion must be ${CONNECTION_LEASE_SCHEMA_VERSION}.`);
  }

  const connectionId = validateId(value.connectionId, "connectionId");
  if (connectionId instanceof Error) {
    return connectionId;
  }

  if ("subscriptionId" in value) {
    return new Error(
      "connection leases must not include subscriptionId; subscriptions are event match rules attached to a connection.",
    );
  }

  const cursorId = validateId(value.cursorId, "cursorId");
  if (cursorId instanceof Error) {
    return cursorId;
  }

  const owner = validateAlexandriaActor(value.owner);
  if (owner instanceof Error) {
    return owner;
  }

  if (!isRecord(value.delivery)) {
    return new Error("delivery must be an object.");
  }
  const host = validateWakeHost(value.delivery.host);
  if (host instanceof Error) {
    return host;
  }
  const mode = validateDeliveryMode(value.delivery.mode);
  if (mode instanceof Error) {
    return mode;
  }

  if (typeof value.pid !== "number" || !Number.isSafeInteger(value.pid) || value.pid < 1) {
    return new Error("pid must be a positive integer.");
  }

  const startedAt = validateIsoTimestamp(value.startedAt, "startedAt");
  if (startedAt instanceof Error) {
    return startedAt;
  }
  const updatedAt = validateIsoTimestamp(value.updatedAt, "updatedAt");
  if (updatedAt instanceof Error) {
    return updatedAt;
  }
  const expiresAt = validateIsoTimestamp(value.expiresAt, "expiresAt");
  if (expiresAt instanceof Error) {
    return expiresAt;
  }

  return {
    schemaVersion: CONNECTION_LEASE_SCHEMA_VERSION,
    connectionId,
    cursorId,
    owner,
    delivery: { host, mode },
    pid: value.pid,
    startedAt,
    updatedAt,
    expiresAt,
  };
}

export function parseWakeSubscription(content: string): WakeSubscription | Error {
  try {
    return validateWakeSubscription(JSON.parse(content) as unknown);
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

export function parseConnectionLease(content: string): ConnectionLease | Error {
  try {
    return validateConnectionLease(JSON.parse(content) as unknown);
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

export function serializeWakeSubscription(subscription: WakeSubscription): string {
  return `${JSON.stringify(subscription, null, 2)}\n`;
}

export function serializeConnectionLease(lease: ConnectionLease): string {
  return `${JSON.stringify(lease, null, 2)}\n`;
}

export function reasonForEventType(type: AlexandriaStateEventType): string {
  return type.replaceAll(".", "-");
}

export function ownerForWakeHost(host: WakeHost): AlexandriaActor {
  if (host === "claude-code") {
    return { kind: "process", host: "claude-code", process: "monitor" };
  }

  if (host === "codex") {
    return { kind: "process", host: "codex", process: "host-adapter" };
  }

  return { kind: "agent", host: "freeq", name: "Raven" };
}

function defaultDeliveryModeForHost(host: WakeHost): WakeDeliveryMode {
  if (host === "claude-code") {
    return "plugin-monitor";
  }

  if (host === "codex") {
    return "codex-app-server";
  }

  return "room-bot";
}

export function createWakeSubscription(options: {
  connectionId: string;
  eventTypes: AlexandriaStateEventType[];
  host: WakeHost;
  mode?: WakeDeliveryMode;
  now: string;
  subscriptionId: string;
}): WakeSubscription | Error {
  const subscriptionId = validateSubscriptionId(options.subscriptionId);
  if (subscriptionId instanceof Error) {
    return subscriptionId;
  }
  const connectionId = validateConnectionId(options.connectionId);
  if (connectionId instanceof Error) {
    return connectionId;
  }

  return {
    schemaVersion: WAKE_SUBSCRIPTION_SCHEMA_VERSION,
    subscriptionId,
    connectionId,
    owner: ownerForWakeHost(options.host),
    match: options.eventTypes.map((type) => ({
      type,
      reason: reasonForEventType(type),
    })),
    delivery: {
      host: options.host,
      mode: options.mode ?? defaultDeliveryModeForHost(options.host),
    },
    wake: {
      includeMatchedEvent: true,
      includeProjectedState: true,
      maxContextEvents: 20,
    },
    createdAt: options.now,
    updatedAt: options.now,
  };
}

export function createConnectionLease(options: {
  connectionId: string;
  cursorId: string;
  expiresAt: string;
  host: WakeHost;
  mode?: WakeDeliveryMode;
  now: string;
  pid: number;
}): ConnectionLease | Error {
  const connectionId = validateConnectionId(options.connectionId);
  if (connectionId instanceof Error) {
    return connectionId;
  }
  const cursorId = validateId(options.cursorId, "cursorId");
  if (cursorId instanceof Error) {
    return cursorId;
  }

  return {
    schemaVersion: CONNECTION_LEASE_SCHEMA_VERSION,
    connectionId,
    cursorId,
    owner: ownerForWakeHost(options.host),
    delivery: {
      host: options.host,
      mode: options.mode ?? defaultDeliveryModeForHost(options.host),
    },
    pid: options.pid,
    startedAt: options.now,
    updatedAt: options.now,
    expiresAt: options.expiresAt,
  };
}

export function wakeMessage(): string {
  return "Alexandria event log update. The included `event` object was emitted by the local Alexandria web UI or runtime. Use `alexandria:alexandria-event-log` (or `alexandria-event-log`) when available; otherwise inspect `event.type` and `event.payload` directly.";
}

export function matchWakeSubscriptionEvent(options: {
  event: AlexandriaStateEvent;
  subscription: WakeSubscription;
}): WakeSubscriptionDecision {
  const rule = options.subscription.match.find(
    (candidate) => candidate.type === options.event.type,
  );

  if (rule == null) {
    return { kind: "ignore", reason: "subscription-no-match" };
  }

  return {
    kind: "wake",
    subscriptionId: options.subscription.subscriptionId,
    reason: rule.reason,
    message: wakeMessage(),
  };
}
