import { useCallback, useEffect, useRef, useState } from "react";
import * as Effect from "effect/Effect";
import type { ViewerRuntimeClient } from "../../app/runtime/client";
import type { RuntimeConnectionStatus, RuntimeConnectionSummary } from "../../app/runtime/schemas";
import type { RavenConnectionState } from "./types";

const ravenConnectionRefreshMs = 1_000;
const claudeCodeConnectionIdPrefix = "host:claude-code:";
const claudeCodeDeliveryHost = "claude-code";
const claudeCodePluginMonitorMode = "plugin-monitor";

export interface RavenConnectionsSnapshot {
  connectionState: RavenConnectionState;
  disconnectError: string | null;
  disconnectingConnectionId: string | null;
  disconnectConnection: (connectionId: string) => Promise<void>;
  ravenConnections: ReadonlyArray<RuntimeConnectionStatus>;
}

function containsRaven(value: string | undefined): boolean {
  return value?.toLowerCase().includes("raven") === true;
}

function hasExplicitRavenMetadata(connection: RuntimeConnectionStatus): boolean {
  return (
    containsRaven(connection.owner?.name) ||
    containsRaven(connection.owner?.host) ||
    containsRaven(connection.connectionId) ||
    containsRaven(connection.delivery?.host)
  );
}

function isClaudeCodePluginMonitorConnection(connection: RuntimeConnectionStatus): boolean {
  return (
    connection.connectionId.startsWith(claudeCodeConnectionIdPrefix) &&
    connection.delivery?.host === claudeCodeDeliveryHost &&
    connection.delivery?.mode === claudeCodePluginMonitorMode
  );
}

export function isRavenRuntimeConnection(connection: RuntimeConnectionStatus): boolean {
  return hasExplicitRavenMetadata(connection) || isClaudeCodePluginMonitorConnection(connection);
}

function isActiveRavenRuntimeConnection(connection: RuntimeConnectionStatus): boolean {
  return connection.active && isRavenRuntimeConnection(connection);
}

export function ravenConnectionsFromSummary(summary: {
  connections?: ReadonlyArray<RuntimeConnectionStatus>;
}): ReadonlyArray<RuntimeConnectionStatus> {
  return (summary.connections ?? []).filter(isActiveRavenRuntimeConnection);
}

export function ravenConnectionStateFromSummary(summary: {
  connections?: ReadonlyArray<RuntimeConnectionStatus>;
}): RavenConnectionState {
  const hasActiveRavenConnection = ravenConnectionsFromSummary(summary).length > 0;

  return hasActiveRavenConnection ? "connected" : "disconnected";
}

function messageFromUnknown(caught: unknown): string {
  return caught instanceof Error ? caught.message : String(caught);
}

export function useRavenConnections(client: ViewerRuntimeClient): RavenConnectionsSnapshot {
  const [connectionState, setConnectionState] = useState<RavenConnectionState>("disconnected");
  const [ravenConnections, setRavenConnections] = useState<ReadonlyArray<RuntimeConnectionStatus>>(
    [],
  );
  const [disconnectingConnectionId, setDisconnectingConnectionId] = useState<string | null>(null);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  const applySummary = useCallback((summary: RuntimeConnectionSummary): void => {
    setRavenConnections(ravenConnectionsFromSummary(summary));
    setConnectionState(ravenConnectionStateFromSummary(summary));
  }, []);

  const disconnectConnection = useCallback(
    async (connectionId: string): Promise<void> => {
      setDisconnectError(null);
      setDisconnectingConnectionId(connectionId);
      try {
        const summary = await Effect.runPromise(client.disconnectConnection(connectionId));
        if (mountedRef.current) {
          applySummary(summary);
        }
      } catch (caught: unknown) {
        if (mountedRef.current) {
          setDisconnectError(messageFromUnknown(caught));
        }
      } finally {
        if (mountedRef.current) {
          setDisconnectingConnectionId(null);
        }
      }
    },
    [applySummary, client],
  );

  useEffect(() => {
    let cancelled = false;
    let refreshTimeout: number | undefined;
    mountedRef.current = true;

    function scheduleRefresh(): void {
      refreshTimeout = window.setTimeout(refreshConnectionState, ravenConnectionRefreshMs);
    }

    function refreshConnectionState(): void {
      Effect.runPromise(client.getConnections)
        .then((summary) => {
          if (!cancelled) {
            applySummary(summary);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setRavenConnections([]);
            setConnectionState("disconnected");
          }
        })
        .finally(() => {
          if (!cancelled) {
            scheduleRefresh();
          }
        });
    }

    refreshConnectionState();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      if (refreshTimeout != null) {
        window.clearTimeout(refreshTimeout);
      }
    };
  }, [applySummary, client]);

  return {
    connectionState,
    disconnectConnection,
    disconnectError,
    disconnectingConnectionId,
    ravenConnections,
  };
}

export function useRavenConnectionState(client: ViewerRuntimeClient): RavenConnectionState {
  return useRavenConnections(client).connectionState;
}
