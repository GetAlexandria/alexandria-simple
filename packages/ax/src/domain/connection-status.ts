import type {
  ConnectionLease,
  WakeSubscription,
  WakeSubscriptionRule,
} from "./wake-subscriptions.js";

export interface ConnectionSubscriptionStatus {
  match: WakeSubscriptionRule[];
  subscriptionId: string;
}

export interface ConnectionStatus {
  active: boolean;
  connectionId: string;
  cursorId: string;
  delivery: ConnectionLease["delivery"];
  expiresAt: string;
  owner: ConnectionLease["owner"];
  pid: number;
  startedAt: string;
  subscriptions: ConnectionSubscriptionStatus[];
  updatedAt: string;
}

export interface ConnectionStatusSummary {
  activeCount: number;
  connections: ConnectionStatus[];
  rawLeaseCount: number;
  totalCount: number;
}

interface SummarizeConnectionLeasesOptions {
  isPidAlive: (pid: number) => boolean;
  leases: ConnectionLease[];
  nowMs: number;
  subscriptions: WakeSubscription[];
}

function timestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function toConnectionStatus(
  lease: ConnectionLease,
  options: Pick<SummarizeConnectionLeasesOptions, "isPidAlive" | "nowMs" | "subscriptions">,
): ConnectionStatus {
  const expiresAtMs = timestamp(lease.expiresAt);
  const active = expiresAtMs > options.nowMs && options.isPidAlive(lease.pid);

  return {
    active,
    connectionId: lease.connectionId,
    cursorId: lease.cursorId,
    delivery: lease.delivery,
    expiresAt: lease.expiresAt,
    owner: lease.owner,
    pid: lease.pid,
    startedAt: lease.startedAt,
    subscriptions: options.subscriptions
      .filter((subscription) => subscription.connectionId === lease.connectionId)
      .map((subscription) => ({
        match: subscription.match,
        subscriptionId: subscription.subscriptionId,
      }))
      .sort((left, right) => left.subscriptionId.localeCompare(right.subscriptionId)),
    updatedAt: lease.updatedAt,
  };
}

export function summarizeConnectionLeases(
  options: SummarizeConnectionLeasesOptions,
): ConnectionStatusSummary {
  const connections = options.leases
    .map((lease) => toConnectionStatus(lease, options))
    .sort((left, right) => left.connectionId.localeCompare(right.connectionId));

  return {
    activeCount: connections.filter((connection) => connection.active).length,
    connections,
    rawLeaseCount: options.leases.length,
    totalCount: connections.length,
  };
}
