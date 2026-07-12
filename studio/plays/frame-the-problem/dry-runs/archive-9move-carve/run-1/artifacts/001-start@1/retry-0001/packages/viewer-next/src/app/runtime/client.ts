import * as Effect from "effect/Effect";
import {
  ViewerHttpError,
  ViewerJsonError,
  ViewerNetworkError,
  type ViewerRuntimeError,
} from "./errors";
import {
  decodeError,
  decodeRuntimeConnectionSummary,
  decodeRuntimeEventPage,
  decodeRuntimeHealth,
  decodeRuntimePlayRunLaunchResult,
  decodeRuntimeProjectState,
  decodeRuntimeRavenVisionBankResult,
  decodeRuntimeRavenVisionProjection,
  decodeRuntimeSourceCreateResult,
  type RuntimeConnectionSummary,
  type RuntimeEventPage,
  type RuntimeHealth,
  type RuntimePlayRunLaunchResult,
  type RuntimeProjectState,
  type RuntimeRavenVisionBankResult,
  type RuntimeRavenVisionProjection,
  type RuntimeRavenVisionSlotId,
  type RuntimeSourceCreateResult,
} from "./schemas";

export interface ViewerRuntimeFetch {
  (input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface ViewerRuntimeClientOptions {
  baseUrl?: string;
  fetcher?: ViewerRuntimeFetch;
}

interface ViewerRuntimeRequestContext {
  baseUrl?: string;
  fetcher: ViewerRuntimeFetch;
}

function endpoint(path: string, baseUrl: string | undefined): string {
  if (baseUrl == null) {
    return path;
  }

  return new URL(path, baseUrl).toString();
}

const readErrorBody = Effect.fn("ViewerRuntimeClient.readErrorBody")(function* (
  response: Response,
) {
  return yield* Effect.tryPromise({
    catch: (cause) => new ViewerNetworkError(cause),
    try: async (): Promise<string> => response.text(),
  }).pipe(Effect.catchAll(() => Effect.succeed("")));
});

const parseJson = Effect.fn("ViewerRuntimeClient.parseJson")(function* (
  response: Response,
) {
  return yield* Effect.tryPromise({
    catch: (cause) => new ViewerJsonError(cause),
    try: async (): Promise<unknown> => response.json(),
  });
});

const fetchJson = Effect.fn("ViewerRuntimeClient.fetchJson")(function* (
  context: ViewerRuntimeRequestContext,
  path: string,
  init?: RequestInit,
) {
  const response = yield* Effect.tryPromise({
    catch: (cause) => new ViewerNetworkError(cause),
    try: async (): Promise<Response> =>
      context.fetcher(endpoint(path, context.baseUrl), init),
  });

  if (!response.ok) {
    const body = yield* readErrorBody(response);
    return yield* Effect.fail(
      new ViewerHttpError(response.status, response.statusText, body),
    );
  }

  return yield* parseJson(response);
});

const getRuntimeHealth = Effect.fn("ViewerRuntimeClient.getHealth")(function* (
  context: ViewerRuntimeRequestContext,
) {
  const payload = yield* fetchJson(context, "/api/health");
  return yield* decodeRuntimeHealth(payload).pipe(
    Effect.mapError((cause) => decodeError("runtime health", cause)),
  );
});

const getRuntimeProjectState = Effect.fn("ViewerRuntimeClient.getState")(
  function* (context: ViewerRuntimeRequestContext) {
    const payload = yield* fetchJson(context, "/api/state");
    return yield* decodeRuntimeProjectState(payload).pipe(
      Effect.mapError((cause) => decodeError("project state", cause)),
    );
  },
);

const listRuntimeEvents = Effect.fn("ViewerRuntimeClient.listEvents")(
  function* (context: ViewerRuntimeRequestContext, limit: number) {
    const payload = yield* fetchJson(context, `/api/events?limit=${limit}`);
    return yield* decodeRuntimeEventPage(payload).pipe(
      Effect.mapError((cause) => decodeError("event page", cause)),
    );
  },
);

const runRuntimePlay = Effect.fn("ViewerRuntimeClient.runPlay")(function* (
  context: ViewerRuntimeRequestContext,
  playId: string,
) {
  const payload = yield* fetchJson(
    context,
    `/api/plays/${encodeURIComponent(playId)}/runs`,
    {
      method: "POST",
    },
  );
  return yield* decodeRuntimePlayRunLaunchResult(payload).pipe(
    Effect.mapError((cause) => decodeError("play run launch", cause)),
  );
});

const getRuntimeConnections = Effect.fn("ViewerRuntimeClient.getConnections")(
  function* (context: ViewerRuntimeRequestContext) {
    const payload = yield* fetchJson(context, "/api/connections");
    return yield* decodeRuntimeConnectionSummary(payload).pipe(
      Effect.mapError((cause) => decodeError("connection summary", cause)),
    );
  },
);

const getRuntimeRavenVision = Effect.fn("ViewerRuntimeClient.getRavenVision")(
  function* (context: ViewerRuntimeRequestContext) {
    const payload = yield* fetchJson(context, "/api/raven/onboarding/vision");
    return yield* decodeRuntimeRavenVisionProjection(payload).pipe(
      Effect.mapError((cause) => decodeError("Raven Vision", cause)),
    );
  },
);

const startRuntimeRavenVision = Effect.fn(
  "ViewerRuntimeClient.startRavenVision",
)(function* (context: ViewerRuntimeRequestContext) {
  const payload = yield* fetchJson(
    context,
    "/api/raven/onboarding/vision/start",
    {
      method: "POST",
    },
  );
  return yield* decodeRuntimeRavenVisionProjection(payload).pipe(
    Effect.mapError((cause) => decodeError("Raven Vision", cause)),
  );
});

const requestRuntimeRavenVisionDrafting = Effect.fn(
  "ViewerRuntimeClient.requestRavenVisionDrafting",
)(function* (context: ViewerRuntimeRequestContext) {
  const payload = yield* fetchJson(
    context,
    "/api/raven/onboarding/vision/drafting-request",
    {
      method: "POST",
    },
  );
  return yield* decodeRuntimeRavenVisionProjection(payload).pipe(
    Effect.mapError((cause) => decodeError("Raven Vision", cause)),
  );
});

const updateRuntimeRavenVisionSlot = Effect.fn(
  "ViewerRuntimeClient.updateRavenVisionSlot",
)(function* (
  context: ViewerRuntimeRequestContext,
  slotId: RuntimeRavenVisionSlotId,
  text: string,
) {
  const payload = yield* fetchJson(
    context,
    `/api/raven/onboarding/vision/slots/${encodeURIComponent(slotId)}`,
    {
      body: JSON.stringify({ text }),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
    },
  );
  return yield* decodeRuntimeRavenVisionProjection(payload).pipe(
    Effect.mapError((cause) => decodeError("Raven Vision", cause)),
  );
});

const approveRuntimeRavenVisionSlot = Effect.fn(
  "ViewerRuntimeClient.approveRavenVisionSlot",
)(function* (
  context: ViewerRuntimeRequestContext,
  slotId: RuntimeRavenVisionSlotId,
) {
  const payload = yield* fetchJson(
    context,
    `/api/raven/onboarding/vision/slots/${encodeURIComponent(slotId)}/approve`,
    {
      method: "POST",
    },
  );
  return yield* decodeRuntimeRavenVisionProjection(payload).pipe(
    Effect.mapError((cause) => decodeError("Raven Vision", cause)),
  );
});

const skipRuntimeRavenVisionSlot = Effect.fn(
  "ViewerRuntimeClient.skipRavenVisionSlot",
)(function* (
  context: ViewerRuntimeRequestContext,
  slotId: RuntimeRavenVisionSlotId,
) {
  const payload = yield* fetchJson(
    context,
    `/api/raven/onboarding/vision/slots/${encodeURIComponent(slotId)}/skip`,
    {
      method: "POST",
    },
  );
  return yield* decodeRuntimeRavenVisionProjection(payload).pipe(
    Effect.mapError((cause) => decodeError("Raven Vision", cause)),
  );
});

const bankRuntimeRavenVision = Effect.fn("ViewerRuntimeClient.bankRavenVision")(
  function* (context: ViewerRuntimeRequestContext) {
    const payload = yield* fetchJson(
      context,
      "/api/raven/onboarding/vision/bank",
      {
        method: "POST",
      },
    );
    return yield* decodeRuntimeRavenVisionBankResult(payload).pipe(
      Effect.mapError((cause) => decodeError("Raven Vision bank", cause)),
    );
  },
);

export interface RuntimeCreateFileSourceInput {
  attachToVision?: boolean;
  file: File;
  title?: string;
}

export interface RuntimeCreateUrlSourceInput {
  attachToVision?: boolean;
  title?: string;
  url: string;
}

export interface RuntimeCreateNoteSourceInput {
  attachToVision?: boolean;
  text: string;
  title?: string;
}

const createRuntimeFileSource = Effect.fn(
  "ViewerRuntimeClient.createFileSource",
)(function* (
  context: ViewerRuntimeRequestContext,
  input: RuntimeCreateFileSourceInput,
) {
  const body = new FormData();
  body.set("type", "file");
  body.set("attachToVision", input.attachToVision === false ? "false" : "true");
  body.set("file", input.file);
  if (input.title != null && input.title.length > 0) {
    body.set("title", input.title);
  }

  const payload = yield* fetchJson(context, "/api/sources", {
    body,
    method: "POST",
  });
  return yield* decodeRuntimeSourceCreateResult(payload).pipe(
    Effect.mapError((cause) => decodeError("source create", cause)),
  );
});

const createRuntimeUrlSource = Effect.fn("ViewerRuntimeClient.createUrlSource")(
  function* (
    context: ViewerRuntimeRequestContext,
    input: RuntimeCreateUrlSourceInput,
  ) {
    const payload = yield* fetchJson(context, "/api/sources", {
      body: JSON.stringify({
        type: "url",
        attachToVision: input.attachToVision !== false,
        url: input.url,
        ...(input.title == null || input.title.length === 0
          ? {}
          : { title: input.title }),
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });
    return yield* decodeRuntimeSourceCreateResult(payload).pipe(
      Effect.mapError((cause) => decodeError("source create", cause)),
    );
  },
);

const createRuntimeNoteSource = Effect.fn(
  "ViewerRuntimeClient.createNoteSource",
)(function* (
  context: ViewerRuntimeRequestContext,
  input: RuntimeCreateNoteSourceInput,
) {
  const payload = yield* fetchJson(context, "/api/sources", {
    body: JSON.stringify({
      type: "note",
      attachToVision: input.attachToVision !== false,
      text: input.text,
      ...(input.title == null || input.title.length === 0
        ? {}
        : { title: input.title }),
    }),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });
  return yield* decodeRuntimeSourceCreateResult(payload).pipe(
    Effect.mapError((cause) => decodeError("source create", cause)),
  );
});

export interface ViewerRuntimeClient {
  approveRavenVisionSlot: (
    slotId: RuntimeRavenVisionSlotId,
  ) => Effect.Effect<RuntimeRavenVisionProjection, ViewerRuntimeError>;
  bankRavenVision: Effect.Effect<
    RuntimeRavenVisionBankResult,
    ViewerRuntimeError
  >;
  createFileSource: (
    input: RuntimeCreateFileSourceInput,
  ) => Effect.Effect<RuntimeSourceCreateResult, ViewerRuntimeError>;
  createNoteSource: (
    input: RuntimeCreateNoteSourceInput,
  ) => Effect.Effect<RuntimeSourceCreateResult, ViewerRuntimeError>;
  createUrlSource: (
    input: RuntimeCreateUrlSourceInput,
  ) => Effect.Effect<RuntimeSourceCreateResult, ViewerRuntimeError>;
  getConnections: Effect.Effect<RuntimeConnectionSummary, ViewerRuntimeError>;
  getHealth: Effect.Effect<RuntimeHealth, ViewerRuntimeError>;
  getRavenVision: Effect.Effect<
    RuntimeRavenVisionProjection,
    ViewerRuntimeError
  >;
  getState: Effect.Effect<RuntimeProjectState, ViewerRuntimeError>;
  listEvents: (
    limit: number,
  ) => Effect.Effect<RuntimeEventPage, ViewerRuntimeError>;
  runPlay: (
    playId: string,
  ) => Effect.Effect<RuntimePlayRunLaunchResult, ViewerRuntimeError>;
  skipRavenVisionSlot: (
    slotId: RuntimeRavenVisionSlotId,
  ) => Effect.Effect<RuntimeRavenVisionProjection, ViewerRuntimeError>;
  requestRavenVisionDrafting: Effect.Effect<
    RuntimeRavenVisionProjection,
    ViewerRuntimeError
  >;
  startRavenVision: Effect.Effect<
    RuntimeRavenVisionProjection,
    ViewerRuntimeError
  >;
  updateRavenVisionSlot: (
    slotId: RuntimeRavenVisionSlotId,
    text: string,
  ) => Effect.Effect<RuntimeRavenVisionProjection, ViewerRuntimeError>;
}

export function makeViewerRuntimeClient(
  options: ViewerRuntimeClientOptions = {},
): ViewerRuntimeClient {
  const context: ViewerRuntimeRequestContext = {
    baseUrl: options.baseUrl,
    fetcher: options.fetcher ?? ((input, init) => fetch(input, init)),
  };

  return {
    approveRavenVisionSlot: (slotId) =>
      approveRuntimeRavenVisionSlot(context, slotId),
    bankRavenVision: bankRuntimeRavenVision(context),
    createFileSource: (input) => createRuntimeFileSource(context, input),
    createNoteSource: (input) => createRuntimeNoteSource(context, input),
    createUrlSource: (input) => createRuntimeUrlSource(context, input),
    getConnections: getRuntimeConnections(context),
    getHealth: getRuntimeHealth(context),
    getRavenVision: getRuntimeRavenVision(context),
    getState: getRuntimeProjectState(context),
    listEvents: (limit: number) => listRuntimeEvents(context, limit),
    runPlay: (playId) => runRuntimePlay(context, playId),
    requestRavenVisionDrafting: requestRuntimeRavenVisionDrafting(context),
    skipRavenVisionSlot: (slotId) =>
      skipRuntimeRavenVisionSlot(context, slotId),
    startRavenVision: startRuntimeRavenVision(context),
    updateRavenVisionSlot: (slotId, text) =>
      updateRuntimeRavenVisionSlot(context, slotId, text),
  };
}
