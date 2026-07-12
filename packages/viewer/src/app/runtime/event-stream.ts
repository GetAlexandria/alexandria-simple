import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { ViewerSubscriptionError } from "./errors";

export interface RuntimeStreamMessage {
  data: string;
  event: "message" | "project-state" | "ready" | "state-event";
  id: string;
}

function streamMessage(
  event: RuntimeStreamMessage["event"],
  message: MessageEvent<string>,
): RuntimeStreamMessage {
  return {
    data: message.data,
    event,
    id: message.lastEventId,
  };
}

export function runtimeEventStream(
  endpoint = "/api/events-stream",
): Stream.Stream<RuntimeStreamMessage, ViewerSubscriptionError> {
  // Stream.asyncScoped runs the register effect as scoped resource
  // acquisition, so the EventSource must be acquired and released through
  // the scope; returning a close effect directly (Stream.async canceler
  // semantics) would close the source immediately on subscription.
  return Stream.asyncScoped<RuntimeStreamMessage, ViewerSubscriptionError>((emit) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const source = new EventSource(endpoint);
        const emitMessage =
          (eventName: RuntimeStreamMessage["event"]) => (message: MessageEvent<string>) => {
            emit(Effect.succeed(Chunk.of(streamMessage(eventName, message))));
          };
        const emitFailure = (event: Event) => {
          if (source.readyState !== EventSource.CLOSED) {
            return;
          }

          emit(Effect.fail(Option.some(new ViewerSubscriptionError(endpoint, event))));
        };

        source.addEventListener("message", emitMessage("message"));
        source.addEventListener("project-state", emitMessage("project-state"));
        source.addEventListener("ready", emitMessage("ready"));
        source.addEventListener("state-event", emitMessage("state-event"));
        source.addEventListener("error", emitFailure);

        return source;
      }),
      (source) =>
        Effect.sync(() => {
          source.close();
        }),
    ),
  );
}
