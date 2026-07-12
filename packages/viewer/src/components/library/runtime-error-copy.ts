export type LibraryRuntimeErrorSurface = "card-detail" | "catalog" | "graph" | "ledger";
export type TrackerRuntimeErrorSurface = "run-events" | "studio-runs";
export type RuntimeErrorSurface = LibraryRuntimeErrorSurface | TrackerRuntimeErrorSurface;

interface RuntimeErrorMessageOptions {
  runId?: string;
}

type RuntimeErrorTag =
  | "ViewerDecodeError"
  | "ViewerHttpError"
  | "ViewerJsonError"
  | "ViewerNetworkError"
  | "ViewerSubscriptionError";

const SURFACE_LABELS: Readonly<Record<LibraryRuntimeErrorSurface, string>> = {
  "card-detail": "card content",
  catalog: "library catalog",
  graph: "library graph",
  ledger: "ledger",
};

const NO_RUNTIME_FAILURE = Symbol("NO_RUNTIME_FAILURE");
const UNKNOWN_RUNTIME_ERROR_DETAIL = "Unknown viewer runtime error";

function runtimeErrorTag(error: unknown): RuntimeErrorTag | null {
  if (error == null || typeof error !== "object" || !("_tag" in error)) {
    return null;
  }

  const tag = error._tag;
  switch (tag) {
    case "ViewerDecodeError":
    case "ViewerHttpError":
    case "ViewerJsonError":
    case "ViewerNetworkError":
    case "ViewerSubscriptionError":
      return tag;
    default:
      return null;
  }
}

function readableRuntimeErrorDetail(error: unknown): string {
  const runtimeError = unwrapEffectRuntimeFailure(error);
  const tag = runtimeErrorTag(runtimeError);
  if (tag != null && runtimeError != null && typeof runtimeError === "object") {
    return (
      cleanRuntimeErrorDetail(readMessageProperty(runtimeError)) ?? UNKNOWN_RUNTIME_ERROR_DETAIL
    );
  }

  if (runtimeError instanceof Error) {
    return (
      detailFromSerializedRuntimeError(runtimeError.message) ??
      cleanRuntimeErrorDetail(runtimeError.message) ??
      UNKNOWN_RUNTIME_ERROR_DETAIL
    );
  }

  if (typeof runtimeError === "string") {
    return (
      detailFromSerializedRuntimeError(runtimeError) ??
      cleanRuntimeErrorDetail(runtimeError) ??
      UNKNOWN_RUNTIME_ERROR_DETAIL
    );
  }

  return UNKNOWN_RUNTIME_ERROR_DETAIL;
}

function unwrapEffectRuntimeFailure(error: unknown): unknown {
  if (error == null || typeof error !== "object") {
    return error;
  }

  for (const symbol of Object.getOwnPropertySymbols(error)) {
    if (String(symbol) !== "Symbol(effect/Runtime/FiberFailure/Cause)") {
      continue;
    }

    const failure = runtimeFailureFromCause((error as Record<symbol, unknown>)[symbol], 0);
    if (failure !== NO_RUNTIME_FAILURE) {
      return failure;
    }
  }

  return error;
}

function runtimeFailureFromCause(
  cause: unknown,
  depth: number,
): unknown | typeof NO_RUNTIME_FAILURE {
  if (depth > 8 || cause == null || typeof cause !== "object") {
    return NO_RUNTIME_FAILURE;
  }

  if ((cause as { readonly _tag?: unknown })._tag === "Fail" && "failure" in cause) {
    return (cause as { readonly failure: unknown }).failure;
  }

  for (const key of ["cause", "left", "right"] as const) {
    if (!(key in cause)) {
      continue;
    }

    const failure = runtimeFailureFromCause((cause as Record<typeof key, unknown>)[key], depth + 1);
    if (failure !== NO_RUNTIME_FAILURE) {
      return failure;
    }
  }

  return NO_RUNTIME_FAILURE;
}

function readMessageProperty(error: object): unknown {
  try {
    return (error as { readonly message?: unknown }).message;
  } catch {
    return null;
  }
}

function cleanRuntimeErrorDetail(message: unknown): string | null {
  if (typeof message !== "string") {
    return null;
  }

  const trimmed = message.trim();
  if (trimmed.length === 0 || trimmed.includes("[object Object]")) {
    return null;
  }

  return trimmed;
}

function detailFromSerializedRuntimeError(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed.startsWith("{")) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed == null || typeof parsed !== "object") {
      return null;
    }

    if ((parsed as { readonly _tag?: unknown })._tag !== "ViewerHttpError") {
      return null;
    }

    const status = (parsed as { readonly status?: unknown }).status;
    const statusText = (parsed as { readonly statusText?: unknown }).statusText;
    if (typeof status !== "number" || typeof statusText !== "string") {
      return null;
    }

    return `Viewer runtime responded with ${status} ${statusText}`;
  } catch {
    return null;
  }
}

function sentence(detail: string): string {
  return /[.!?…]$/.test(detail) ? detail : `${detail}.`;
}

export function libraryRuntimeErrorMessage(
  surface: LibraryRuntimeErrorSurface,
  error: unknown,
): string;
export function libraryRuntimeErrorMessage(surface: "studio-runs", error: unknown): string;
export function libraryRuntimeErrorMessage(
  surface: "run-events",
  error: unknown,
  options: { runId: string },
): string;
export function libraryRuntimeErrorMessage(
  surface: RuntimeErrorSurface,
  error: unknown,
  options: RuntimeErrorMessageOptions = {},
): string {
  if (surface === "studio-runs") {
    const detail = sentence(readableRuntimeErrorDetail(error));
    return `Couldn't load active play runs — ${detail} Retrying…`;
  }

  if (surface === "run-events") {
    const detail = sentence(readableRuntimeErrorDetail(error));
    return `Couldn't load run ${options.runId ?? "unknown"} — ${detail}`;
  }

  const label = SURFACE_LABELS[surface];
  const tag = runtimeErrorTag(error);

  switch (tag) {
    case "ViewerHttpError":
      return `The Alexandria runtime responded with an error while loading the ${label}. Check that the backend is healthy, then retry.`;
    case "ViewerNetworkError":
      return `The viewer could not reach the Alexandria runtime while loading the ${label}. Start the backend or check the connection, then retry.`;
    case "ViewerDecodeError":
    case "ViewerJsonError":
      return `The Alexandria runtime returned data the viewer could not read while loading the ${label}. Retry after the backend is healthy.`;
    case "ViewerSubscriptionError":
      return `The viewer lost its runtime connection while loading the ${label}. Retry after the backend is available.`;
    default:
      return `The viewer could not load the ${label}. Retry after the backend is available.`;
  }
}
