import { isKnownStateEventType, type AlexandriaStateEventType } from "./state-events.js";
import type { AlexandriaCodexConfig } from "./config.js";

export interface CodexSubscriptionSpec {
  id: string;
  types: AlexandriaStateEventType[];
}

export interface CodexIntegrationConfig {
  enabled: boolean;
  startTurn: boolean;
  subscriptions: CodexSubscriptionSpec[];
}

export const DEFAULT_CODEX_SUBSCRIPTIONS: CodexSubscriptionSpec[] = [
  {
    id: "reviews",
    types: ["canvas.review.requested"],
  },
];

export function resolveCodexIntegrationConfig(
  config: AlexandriaCodexConfig | undefined,
): CodexIntegrationConfig | Error {
  const subscriptions =
    config?.subscriptions == null
      ? DEFAULT_CODEX_SUBSCRIPTIONS
      : config.subscriptions.map((subscription) => {
          const types: AlexandriaStateEventType[] = [];
          for (const type of subscription.types) {
            if (!isKnownStateEventType(type)) {
              return new Error(`Unknown Codex subscription event type: ${type}`);
            }
            types.push(type);
          }
          return {
            id: subscription.id,
            types,
          };
        });

  const resolvedSubscriptions: CodexSubscriptionSpec[] = [];
  for (const subscription of subscriptions) {
    if (subscription instanceof Error) {
      return subscription;
    }
    resolvedSubscriptions.push(subscription);
  }

  return {
    enabled: config?.enabled ?? true,
    startTurn: config?.startTurn ?? true,
    subscriptions: resolvedSubscriptions,
  };
}
