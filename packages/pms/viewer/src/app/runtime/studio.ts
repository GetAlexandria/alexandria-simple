import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { ViewerDecodeError, ViewerHttpError, ViewerJsonError, ViewerNetworkError } from "./errors";

/**
 * Studio runtime client — the Play Maker's Studio surfaces
 * (Studio → Fabro plan, Slice 4). Narrow schemas: registry rows are
 * deliberately tolerant records — registry.js is studio-owned data and
 * the viewer renders what it finds.
 */

export const StudioRungSchema = Schema.Struct({
  // Read-only provenance decoration projected from the ledger by the registry API
  // (#344) — present only once a play has a `play.provenance_recorded` event.
  builtBy: Schema.optionalWith(
    Schema.Struct({
      agent: Schema.String,
      division: Schema.String,
      function: Schema.String,
    }),
    { exact: true },
  ),
  d: Schema.optionalWith(Schema.String, { exact: true }),
  division: Schema.optionalWith(Schema.String, { exact: true }),
  doc: Schema.optionalWith(Schema.String, { exact: true }),
  function: Schema.optionalWith(Schema.String, { exact: true }),
  glyph: Schema.optionalWith(Schema.String, { exact: true }),
  job: Schema.optionalWith(Schema.String, { exact: true }),
  n: Schema.Union(Schema.String, Schema.Number),
  name: Schema.String,
  prio: Schema.optionalWith(Schema.String, { exact: true }),
  rulings: Schema.optionalWith(Schema.Union(Schema.Number, Schema.Null), {
    exact: true,
  }),
  slug: Schema.String,
  status: Schema.String,
  surface: Schema.optionalWith(Schema.String, { exact: true }),
  tier: Schema.optionalWith(Schema.String, { exact: true }),
});

export type StudioRung = Schema.Schema.Type<typeof StudioRungSchema>;

export const StudioDivisionSchema = Schema.Struct({
  face: Schema.String,
  functions: Schema.Array(Schema.String),
});

export type StudioDivision = Schema.Schema.Type<typeof StudioDivisionSchema>;

export const StudioDivisionsSchema = Schema.Record({
  key: Schema.String,
  value: StudioDivisionSchema,
});

export type StudioDivisions = Schema.Schema.Type<typeof StudioDivisionsSchema>;

export const StudioCompanySchema = Schema.Struct({
  name: Schema.optionalWith(Schema.String, { exact: true }),
});

export type StudioCompany = Schema.Schema.Type<typeof StudioCompanySchema>;

export const StudioChecklistItemSchema = Schema.Struct({
  done: Schema.Boolean,
  text: Schema.String,
});

export type StudioChecklistItem = Schema.Schema.Type<typeof StudioChecklistItemSchema>;

export const StudioBoardCardStatusSchema = Schema.Literal("open", "in-progress", "done", "wont-do");

export type StudioBoardCardStatus = Schema.Schema.Type<typeof StudioBoardCardStatusSchema>;

export const StudioBoardCardSchema = Schema.Struct({
  archived: Schema.optionalWith(Schema.Boolean, { exact: true }),
  checklist: Schema.optionalWith(Schema.Array(StudioChecklistItemSchema), { exact: true }),
  created: Schema.String,
  detail: Schema.optionalWith(Schema.String, { exact: true }),
  division: Schema.String,
  function: Schema.String,
  id: Schema.String,
  pinned: Schema.optionalWith(Schema.Boolean, { exact: true }),
  play: Schema.optionalWith(Schema.String, { exact: true }),
  priority: Schema.Number,
  source: Schema.String,
  status: StudioBoardCardStatusSchema,
  terminalAt: Schema.optionalWith(Schema.String, { exact: true }),
  title: Schema.optionalWith(Schema.String, { exact: true }),
  type: Schema.Literal("testing", "improvement", "bug"),
});

export type StudioBoardCard = Schema.Schema.Type<typeof StudioBoardCardSchema>;

export const StudioBoardSchema = Schema.Struct({
  cards: Schema.optionalWith(Schema.Array(StudioBoardCardSchema), { exact: true }),
  graduated: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  graduatedAt: Schema.optionalWith(Schema.Record({ key: Schema.String, value: Schema.String }), {
    exact: true,
  }),
  // Slugs whose work is done and awaiting the Director's confirm — a per-card
  // marker, separate from the stage.
  ready: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  stages: Schema.Record({
    key: Schema.String,
    value: Schema.Array(Schema.String),
  }),
  updated: Schema.optionalWith(Schema.String, { exact: true }),
});

export type StudioBoard = Schema.Schema.Type<typeof StudioBoardSchema>;

export function studioRuntimeErrorMessage(
  cause: unknown,
  fallback = "Studio runtime request failed",
): string {
  return resolveStudioErrorMessage(cause, 0) ?? fallback;
}

// Board-save rejections reach the UI in assorted shapes: a live ViewerHttpError,
// its serialized plain-object form (sometimes JSON-stringified, sometimes
// wrapped in an Error.message), or a plain Error. The useful reason lives in a
// `body`, `error`, or `message` field that may itself be JSON-encoded, so we
// dig through those keys recursively, preferring `body` (the server payload).
// The depth guard is belt-and-suspenders — each step parses a strictly shorter
// string, so the recursion already terminates.
const STUDIO_ERROR_KEYS = ["body", "error", "message"] as const;

function resolveStudioErrorMessage(cause: unknown, depth: number): string | null {
  if (cause == null || depth > 8) {
    return null;
  }
  if (cause instanceof ViewerHttpError) {
    return resolveStudioErrorMessage(cause.body, depth + 1) ?? cause.message.trim();
  }
  if (typeof cause === "string") {
    const text = cause.trim();
    if (text.length === 0) {
      return null;
    }
    const parsed = parseJsonRecord(text);
    return (parsed != null ? resolveStudioErrorMessage(parsed, depth + 1) : null) ?? text;
  }
  if (typeof cause === "object" && !Array.isArray(cause)) {
    const record = cause as Record<string, unknown>;
    for (const key of STUDIO_ERROR_KEYS) {
      const message = resolveStudioErrorMessage(record[key], depth + 1);
      if (message != null) {
        return message;
      }
    }
  }
  return null;
}

function parseJsonRecord(text: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed != null && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export const StudioRegistrySchema = Schema.Struct({
  board: Schema.Union(StudioBoardSchema, Schema.Null),
  company: Schema.optionalWith(Schema.Union(StudioCompanySchema, Schema.Null), {
    default: () => null,
  }),
  divisions: Schema.optionalWith(StudioDivisionsSchema, { default: () => ({}) }),
  rungs: Schema.Array(StudioRungSchema),
});

export type StudioRegistry = Schema.Schema.Type<typeof StudioRegistrySchema>;

export const StudioRecordsSchema = Schema.Struct({
  records: Schema.Array(
    Schema.Struct({
      bytes: Schema.Number,
      path: Schema.String,
    }),
  ),
  slug: Schema.String,
});

export type StudioRecords = Schema.Schema.Type<typeof StudioRecordsSchema>;

const StudioMoveKindSchema = Schema.Literal(
  "start",
  "exit",
  "agent",
  "prompt",
  "human",
  "conditional",
  "parallel",
  "parallel.fan_in",
  "command",
  "tool",
  "stack.manager_loop",
  "wait",
  "unknown",
);

export const StudioCompositionSchema = Schema.Struct({
  gates: Schema.Array(
    Schema.Struct({
      afterModuleOrdinal: Schema.optionalWith(Schema.Number, { exact: true }),
      basis: Schema.optionalWith(Schema.String, { exact: true }),
      decidedAt: Schema.optionalWith(Schema.String, { exact: true }),
      decidedBy: Schema.optionalWith(Schema.String, { exact: true }),
      decision: Schema.optionalWith(Schema.String, { exact: true }),
      files: Schema.Struct({
        json: Schema.optionalWith(
          Schema.Struct({
            bytes: Schema.Number,
            path: Schema.String,
          }),
          { exact: true },
        ),
        other: Schema.Array(
          Schema.Struct({
            bytes: Schema.Number,
            path: Schema.String,
          }),
        ),
        review: Schema.optionalWith(
          Schema.Struct({
            bytes: Schema.Number,
            path: Schema.String,
          }),
          { exact: true },
        ),
      }),
      id: Schema.String,
      label: Schema.String,
      notes: Schema.optionalWith(Schema.String, { exact: true }),
    }),
  ),
  modules: Schema.Array(
    Schema.Struct({
      label: Schema.String,
      legsPath: Schema.optionalWith(Schema.String, { exact: true }),
      moves: Schema.Array(
        Schema.Struct({
          id: Schema.String,
          kind: StudioMoveKindSchema,
          label: Schema.String,
          nodeId: Schema.String,
        }),
      ),
      module: Schema.String,
      playId: Schema.optionalWith(Schema.String, { exact: true }),
      trackerLegs: Schema.Array(
        Schema.Struct({
          beats: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
          description: Schema.optionalWith(Schema.String, { exact: true }),
          kind: Schema.optionalWith(StudioMoveKindSchema, { exact: true }),
          label: Schema.String,
          lead: Schema.optionalWith(Schema.String, { exact: true }),
          nodeId: Schema.String,
          typicalSeconds: Schema.Number,
        }),
      ),
      trackerLegsWarning: Schema.optionalWith(Schema.String, { exact: true }),
      transitions: Schema.Array(
        Schema.Struct({
          condition: Schema.optionalWith(Schema.String, { exact: true }),
          fromMoveId: Schema.String,
          label: Schema.optionalWith(Schema.String, { exact: true }),
          toMoveId: Schema.String,
        }),
      ),
      workflowPath: Schema.String,
    }),
  ),
  slug: Schema.String,
});

export type StudioComposition = Schema.Schema.Type<typeof StudioCompositionSchema>;

// `fabro validate` output — only the fields the surface reads; the CLI carries
// many more per-diagnostic (rule/fix/line/…) which we deliberately ignore.
export const StudioValidationSchema = Schema.Struct({
  diagnostics: Schema.Array(
    Schema.Struct({
      message: Schema.String,
      severity: Schema.String,
    }),
  ),
  edges: Schema.Number,
  nodes: Schema.Number,
  valid: Schema.Boolean,
});

export type StudioValidation = Schema.Schema.Type<typeof StudioValidationSchema>;

export const StudioRunReviewGateSchema = Schema.Struct({
  afterStep: Schema.String,
  confirmedAt: Schema.optionalWith(Schema.String, { exact: true }),
  confirmedBy: Schema.optionalWith(Schema.Literal("director", "auto"), { exact: true }),
  gateId: Schema.String,
  questionId: Schema.optionalWith(Schema.String, { exact: true }),
  status: Schema.Literal("pending", "confirmed"),
});

export const StudioRunReviewSchema = Schema.Struct({
  compositionId: Schema.String,
  gateSeams: Schema.Array(Schema.String),
  gates: Schema.Array(StudioRunReviewGateSchema),
  label: Schema.String,
  level: Schema.String,
});

export type StudioRunReview = Schema.Schema.Type<typeof StudioRunReviewSchema>;

export const StudioRunEventsSchema = Schema.Struct({
  events: Schema.Array(Schema.String),
  inspect: Schema.Unknown,
  inspectError: Schema.Union(Schema.String, Schema.Null),
  review: Schema.optionalWith(Schema.Union(StudioRunReviewSchema, Schema.Null), { exact: true }),
  runId: Schema.String,
});

export type StudioRunEvents = Schema.Schema.Type<typeof StudioRunEventsSchema>;

export const StudioActiveRunSchema = Schema.Struct({
  elapsedMs: Schema.optionalWith(Schema.Number, { exact: true }),
  playId: Schema.optionalWith(Schema.String, { exact: true }),
  playName: Schema.optionalWith(Schema.String, { exact: true }),
  runId: Schema.String,
  startedAt: Schema.optionalWith(Schema.String, { exact: true }),
  status: Schema.String,
  trackerPath: Schema.String,
  workflowName: Schema.optionalWith(Schema.String, { exact: true }),
  workflowSlug: Schema.optionalWith(Schema.String, { exact: true }),
});

export type StudioActiveRun = Schema.Schema.Type<typeof StudioActiveRunSchema>;

export const StudioActiveRunsSchema = Schema.Struct({
  runs: Schema.Array(StudioActiveRunSchema),
  source: Schema.Literal("fabro-ps", "ledger-fallback", "projection"),
  // Set when the pms server could not read Alexandria's run projection and
  // degraded to an empty list — the tracker must surface this, not render a
  // clean "no runs" state.
  warning: Schema.optionalWith(Schema.String, { exact: true }),
});

export type StudioActiveRuns = Schema.Schema.Type<typeof StudioActiveRunsSchema>;

const decodeStudioRegistry = Schema.decodeUnknown(StudioRegistrySchema);
const decodeStudioRecords = Schema.decodeUnknown(StudioRecordsSchema);
const decodeStudioComposition = Schema.decodeUnknown(StudioCompositionSchema);
const decodeStudioValidation = Schema.decodeUnknown(StudioValidationSchema);
const decodeStudioRunEvents = Schema.decodeUnknown(StudioRunEventsSchema);
const decodeStudioActiveRuns = Schema.decodeUnknown(StudioActiveRunsSchema);

const fetchOk = Effect.fn("StudioRuntime.fetchOk")(function* (path: string, init?: RequestInit) {
  const response = yield* Effect.tryPromise({
    catch: (cause) => new ViewerNetworkError(cause),
    try: async (): Promise<Response> => fetch(path, init),
  });
  if (!response.ok) {
    const body = yield* Effect.tryPromise({
      catch: (cause) => new ViewerNetworkError(cause),
      try: async (): Promise<string> => response.text(),
    }).pipe(Effect.catchAll(() => Effect.succeed("")));
    return yield* Effect.fail(
      new ViewerHttpError(response.status, response.statusText, body.slice(0, 300)),
    );
  }
  return response;
});

const jsonBody = Effect.fn("StudioRuntime.jsonBody")(function* (response: Response) {
  return yield* Effect.tryPromise({
    catch: (cause) => new ViewerJsonError(cause),
    try: async (): Promise<unknown> => response.json(),
  });
});

export const fetchStudioRegistry = Effect.fn("StudioRuntime.registry")(function* () {
  const response = yield* fetchOk("/api/studio/registry");
  const body = yield* jsonBody(response);
  return yield* decodeStudioRegistry(body).pipe(
    Effect.mapError((cause) => new ViewerDecodeError("studio", cause)),
  );
});

export const saveStudioBoard = Effect.fn("StudioRuntime.saveBoard")(function* ({
  cards,
  graduated,
  ready,
  stages,
}: {
  cards?: readonly StudioBoardCard[];
  graduated?: readonly string[];
  ready: readonly string[];
  stages: Record<string, readonly string[]>;
}) {
  yield* fetchOk("/api/studio/board", {
    body: JSON.stringify({
      ...(cards === undefined ? {} : { cards }),
      ...(graduated === undefined ? {} : { graduated }),
      ready,
      stages,
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
});

export const fetchStudioRecords = Effect.fn("StudioRuntime.records")(function* (slug: string) {
  const response = yield* fetchOk(`/api/studio/plays/${encodeURIComponent(slug)}/records`);
  const body = yield* jsonBody(response);
  return yield* decodeStudioRecords(body).pipe(
    Effect.mapError((cause) => new ViewerDecodeError("studio", cause)),
  );
});

export const fetchStudioComposition = Effect.fn("StudioRuntime.composition")(function* (
  slug: string,
) {
  const response = yield* fetchOk(`/api/studio/plays/${encodeURIComponent(slug)}/composition`);
  const body = yield* jsonBody(response);
  return yield* decodeStudioComposition(body).pipe(
    Effect.mapError((cause) => new ViewerDecodeError("studio", cause)),
  );
});

export const fetchStudioValidate = Effect.fn("StudioRuntime.validate")(function* (slug: string) {
  const response = yield* fetchOk(`/api/studio/plays/${encodeURIComponent(slug)}/validate`);
  const body = yield* jsonBody(response);
  return yield* decodeStudioValidation(body).pipe(
    Effect.mapError((cause) => new ViewerDecodeError("studio", cause)),
  );
});

export const fetchStudioFile = Effect.fn("StudioRuntime.file")(function* (path: string) {
  const response = yield* fetchOk(`/api/studio/file?path=${encodeURIComponent(path)}`);
  return yield* Effect.tryPromise({
    catch: (cause) => new ViewerNetworkError(cause),
    try: async (): Promise<string> => response.text(),
  });
});

export const fetchStudioRunEvents = Effect.fn("StudioRuntime.runEvents")(function* (runId: string) {
  const response = yield* fetchOk(`/api/studio/runs/${encodeURIComponent(runId)}/events`);
  const body = yield* jsonBody(response);
  return yield* decodeStudioRunEvents(body).pipe(
    Effect.mapError((cause) => new ViewerDecodeError("studio", cause)),
  );
});

export const fetchStudioActiveRuns = Effect.fn("StudioRuntime.activeRuns")(function* () {
  const response = yield* fetchOk("/api/studio/runs");
  const body = yield* jsonBody(response);
  return yield* decodeStudioActiveRuns(body).pipe(
    Effect.mapError((cause) => new ViewerDecodeError("studio", cause)),
  );
});

export const fetchStudioFabroRuns = Effect.fn("StudioRuntime.fabroRuns")(function* () {
  const response = yield* fetchOk("/api/studio/fabro/runs");
  return yield* jsonBody(response);
});
