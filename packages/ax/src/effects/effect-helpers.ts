import { Effect } from "effect";

/**
 * Wrap a Promise-returning IO in an Effect, normalizing any thrown value to an
 * `Error` tagged with the operation name. Shared by the command/effect layers
 * that bridge async Fabro IO into Effect control flow.
 */
export function promiseBoundary<A>(
  operation: string,
  run: () => Promise<A>,
): Effect.Effect<A, Error, never> {
  return Effect.tryPromise({
    try: run,
    catch: (cause) =>
      cause instanceof Error ? cause : new Error(`${operation} failed: ${String(cause)}`),
  });
}
