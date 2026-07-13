import * as Effect from "effect/Effect";
import {
  ViewerHttpError,
  ViewerJsonError,
  ViewerNetworkError,
  type ViewerRuntimeError,
} from "./errors";
import {
  decodeColleagueJournals,
  decodeError,
  decodeInfoHubBoard,
  decodeMapState,
  decodeLibraryCatalog,
  decodeLibraryCardDetail,
  decodeLibraryGraph,
  decodeRuntimeConnectionSummary,
  decodeRuntimeEventPage,
  decodeRuntimeHealth,
  decodeRuntimeLibraryConfirmationResult,
  decodeRuntimePlayRunLaunchResult,
  decodeRuntimeProjectState,
  decodeRuntimeRavenVisionBankResult,
  decodeRuntimeRavenVisionProjection,
  decodeRuntimeSourceCreateResult,
  type ColleagueJournals,
  type InfoHubBoard,
  type InfoHubCard,
  type LibraryCardDetail,
  type LibraryCatalog,
  type LibraryConfirmationEdit,
  type LibraryGraph,
  type MapState,
  type RuntimeConnectionSummary,
  type RuntimeEventPage,
  type RuntimeHealth,
  type RuntimeLibraryConfirmationResult,
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

const parseJson = Effect.fn("ViewerRuntimeClient.parseJson")(function* (response: Response) {
  return yield* Effect.tryPromise({
    catch: (cause) => new ViewerJsonError(cause),
    try: async (): Promise<unknown> => response.json(),
  });
});

/**
 * One fetch-and-decode pipeline: request, surface a network/HTTP/JSON
 * failure as the corresponding ViewerRuntimeError, and hand back the
 * decoded payload plus the raw Response for callers that need header
 * access (map state's ETag/If-Match). Most callers only need the payload —
 * see fetchJson below.
 */
const fetchJsonKeepingResponse = Effect.fn("ViewerRuntimeClient.fetchJsonKeepingResponse")(
  function* (context: ViewerRuntimeRequestContext, path: string, init?: RequestInit) {
    const response = yield* Effect.tryPromise({
      catch: (cause) => new ViewerNetworkError(cause),
      try: async (): Promise<Response> => context.fetcher(endpoint(path, context.baseUrl), init),
    });

    if (!response.ok) {
      const body = yield* readErrorBody(response);
      return yield* Effect.fail(new ViewerHttpError(response.status, response.statusText, body));
    }

    const payload = yield* parseJson(response);
    return { payload, response };
  },
);

/** fetchJsonKeepingResponse, discarding the Response — the common case. */
const fetchJson = Effect.fn("ViewerRuntimeClient.fetchJson")(function* (
  context: ViewerRuntimeRequestContext,
  path: string,
  init?: RequestInit,
) {
  const { payload } = yield* fetchJsonKeepingResponse(context, path, init);
  return payload;
});

export interface LibraryCardRef {
  // Root + overlay carry the same read-time projection as the catalog/graph
  // requests, so a card-detail open in a root-aware view reads the same
  // (draft) library the surrounding view renders. Absent = the server default.
  draftPatchLog?: string;
  id: string;
  libraryRoot?: string;
  subfolder: string;
  territory: string;
}

export interface LibraryCatalogRequest {
  bundlePath?: string;
  draftPatchLog?: string;
  libraryRoot?: string;
  libraryVersion?: number;
  product?: string;
}

export interface LibraryGraphRequest {
  draftPatchLog?: string;
  libraryRoot?: string;
}

const getLibraryGraph = Effect.fn("ViewerRuntimeClient.getLibraryGraph")(function* (
  context: ViewerRuntimeRequestContext,
  request?: LibraryGraphRequest,
) {
  const params = new URLSearchParams();
  if (request?.libraryRoot != null && request.libraryRoot.length > 0) {
    params.set("libraryRoot", request.libraryRoot);
  }
  if (request?.draftPatchLog != null && request.draftPatchLog.length > 0) {
    params.set("draftPatchLog", request.draftPatchLog);
  }
  const query = params.toString();
  const payload = yield* fetchJson(
    context,
    query.length === 0 ? "/api/library/graph" : `/api/library/graph?${query}`,
  );
  return yield* decodeLibraryGraph(payload).pipe(
    Effect.mapError((cause) => decodeError("library graph", cause)),
  );
});

const getLibraryCatalog = Effect.fn("ViewerRuntimeClient.getLibraryCatalog")(function* (
  context: ViewerRuntimeRequestContext,
  request?: LibraryCatalogRequest,
) {
  const params = new URLSearchParams();
  if (request?.bundlePath != null && request.bundlePath.length > 0) {
    params.set("bundlePath", request.bundlePath);
  }
  if (request?.draftPatchLog != null && request.draftPatchLog.length > 0) {
    params.set("draftPatchLog", request.draftPatchLog);
  }
  if (request?.libraryRoot != null && request.libraryRoot.length > 0) {
    params.set("libraryRoot", request.libraryRoot);
  }
  if (request?.product != null && request.product.length > 0) {
    params.set("product", request.product);
  }
  if (request?.libraryVersion != null) {
    params.set("libraryVersion", String(request.libraryVersion));
  }
  const query = params.toString();
  const payload = yield* fetchJson(
    context,
    query.length === 0 ? "/api/library/catalog" : `/api/library/catalog?${query}`,
  );
  return yield* decodeLibraryCatalog(payload).pipe(
    Effect.mapError((cause) => decodeError("library catalog", cause)),
  );
});

const getLibraryCardDetail = Effect.fn("ViewerRuntimeClient.getLibraryCard")(function* (
  context: ViewerRuntimeRequestContext,
  card: LibraryCardRef,
) {
  const params = new URLSearchParams({
    subfolder: card.subfolder,
    territory: card.territory,
  });
  if (card.libraryRoot != null && card.libraryRoot.length > 0) {
    params.set("libraryRoot", card.libraryRoot);
  }
  if (card.draftPatchLog != null && card.draftPatchLog.length > 0) {
    params.set("draftPatchLog", card.draftPatchLog);
  }
  const payload = yield* fetchJson(
    context,
    `/api/library/cards/${encodeURIComponent(card.id)}?${params.toString()}`,
  );
  return yield* decodeLibraryCardDetail(payload).pipe(
    Effect.mapError((cause) => decodeError("library card detail", cause)),
  );
});

const getRuntimeHealth = Effect.fn("ViewerRuntimeClient.getHealth")(function* (
  context: ViewerRuntimeRequestContext,
) {
  const payload = yield* fetchJson(context, "/api/health");
  return yield* decodeRuntimeHealth(payload).pipe(
    Effect.mapError((cause) => decodeError("runtime health", cause)),
  );
});

const getRuntimeProjectState = Effect.fn("ViewerRuntimeClient.getState")(function* (
  context: ViewerRuntimeRequestContext,
) {
  const payload = yield* fetchJson(context, "/api/state");
  return yield* decodeRuntimeProjectState(payload).pipe(
    Effect.mapError((cause) => decodeError("project state", cause)),
  );
});

const listRuntimeEvents = Effect.fn("ViewerRuntimeClient.listEvents")(function* (
  context: ViewerRuntimeRequestContext,
  limit: number,
) {
  const payload = yield* fetchJson(context, `/api/events?limit=${limit}`);
  return yield* decodeRuntimeEventPage(payload).pipe(
    Effect.mapError((cause) => decodeError("event page", cause)),
  );
});

const getInfoHubBoard = Effect.fn("ViewerRuntimeClient.getInfoHubBoard")(function* (
  context: ViewerRuntimeRequestContext,
) {
  const payload = yield* fetchJson(context, "/api/info-hub/board");
  return yield* decodeInfoHubBoard(payload).pipe(
    Effect.mapError((cause) => decodeError("info hub board", cause)),
  );
});

const getColleagueJournals = Effect.fn("ViewerRuntimeClient.getColleagueJournals")(function* (
  context: ViewerRuntimeRequestContext,
) {
  const payload = yield* fetchJson(context, "/api/journals");
  return yield* decodeColleagueJournals(payload).pipe(
    Effect.mapError((cause) => decodeError("colleague journals", cause)),
  );
});

const saveInfoHubBoard = Effect.fn("ViewerRuntimeClient.saveInfoHubBoard")(function* (
  context: ViewerRuntimeRequestContext,
  cards: readonly InfoHubCard[],
) {
  const payload = yield* fetchJson(context, "/api/info-hub/board", {
    body: JSON.stringify({ cards }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  return yield* decodeInfoHubBoard(payload).pipe(
    Effect.mapError((cause) => decodeError("info hub board", cause)),
  );
});

/**
 * Map state plus the server's revision (the GET/POST ETag). The revision is
 * echoed back as `If-Match` on the next save so a stale full-document POST
 * fails with a structured 409 instead of clobbering a concurrent write.
 */
export interface MapStateWithRevision {
  revision: string | null;
  state: MapState;
}

function revisionFromResponse(response: Response): string | null {
  const etag = response.headers.get("etag");
  if (etag == null) {
    return null;
  }
  return etag.trim().replace(/^W\//, "").replace(/^"|"$/g, "");
}

const decodeMapStateWithRevision = Effect.fn("ViewerRuntimeClient.decodeMapStateWithRevision")(
  function* (payload: unknown, response: Response) {
    const state = yield* decodeMapState(payload).pipe(
      Effect.mapError((cause) => decodeError("map state", cause)),
    );
    return { revision: revisionFromResponse(response), state } satisfies MapStateWithRevision;
  },
);

const getMapState = Effect.fn("ViewerRuntimeClient.getMapState")(function* (
  context: ViewerRuntimeRequestContext,
) {
  const { payload, response } = yield* fetchJsonKeepingResponse(context, "/api/map/state");
  return yield* decodeMapStateWithRevision(payload, response);
});

const saveMapState = Effect.fn("ViewerRuntimeClient.saveMapState")(function* (
  context: ViewerRuntimeRequestContext,
  state: MapState,
  revision: string | null,
) {
  const { payload, response } = yield* fetchJsonKeepingResponse(context, "/api/map/state", {
    body: JSON.stringify(state),
    headers: {
      "content-type": "application/json",
      ...(revision == null ? {} : { "if-match": `"${revision}"` }),
    },
    method: "POST",
  });
  return yield* decodeMapStateWithRevision(payload, response);
});

export interface RuntimeLibraryConfirmationRequest {
  bundlePath: string;
  libraryVersion?: number;
  product?: string;
}

const confirmRuntimeLibrary = Effect.fn("ViewerRuntimeClient.confirmLibrary")(function* (
  context: ViewerRuntimeRequestContext,
  request: RuntimeLibraryConfirmationRequest,
) {
  const payload = yield* fetchJson(context, "/api/library/confirmations", {
    body: JSON.stringify({
      action: "confirm",
      actor: { host: "viewer", kind: "user" },
      bundlePath: request.bundlePath,
      ...(request.libraryVersion == null ? {} : { libraryVersion: request.libraryVersion }),
      ...(request.product == null ? {} : { product: request.product }),
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  return yield* decodeRuntimeLibraryConfirmationResult(payload).pipe(
    Effect.mapError((cause) => decodeError("library confirmation", cause)),
  );
});

const rejectRuntimeLibrary = Effect.fn("ViewerRuntimeClient.rejectLibrary")(function* (
  context: ViewerRuntimeRequestContext,
  request: RuntimeLibraryConfirmationRequest & { editList: LibraryConfirmationEdit[] },
) {
  const payload = yield* fetchJson(context, "/api/library/confirmations", {
    body: JSON.stringify({
      action: "reject",
      actor: { host: "viewer", kind: "user" },
      bundlePath: request.bundlePath,
      editList: request.editList,
      ...(request.libraryVersion == null ? {} : { libraryVersion: request.libraryVersion }),
      ...(request.product == null ? {} : { product: request.product }),
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  return yield* decodeRuntimeLibraryConfirmationResult(payload).pipe(
    Effect.mapError((cause) => decodeError("library rejection", cause)),
  );
});

const runRuntimePlay = Effect.fn("ViewerRuntimeClient.runPlay")(function* (
  context: ViewerRuntimeRequestContext,
  playId: string,
) {
  const payload = yield* fetchJson(context, `/api/plays/${encodeURIComponent(playId)}/runs`, {
    method: "POST",
  });
  return yield* decodeRuntimePlayRunLaunchResult(payload).pipe(
    Effect.mapError((cause) => decodeError("play run launch", cause)),
  );
});

// Request a play from the coin: append a `play.requested` event so the monitor
// wakes Raven to elicit input and launch the play. This is deliberately NOT
// `runPlay` (POST /api/plays/{id}/runs), which spawns a headless, inputless
// server-side run — the frame-the-problem play needs material Raven must elicit.
const requestRuntimePlay = Effect.fn("ViewerRuntimeClient.requestPlay")(function* (
  context: ViewerRuntimeRequestContext,
  playId: string,
  agentId: string,
) {
  yield* fetchJson(context, "/api/events", {
    body: JSON.stringify({
      actor: { host: "viewer", kind: "user" },
      payload: { agentId, playId, source: "viewer-coin" },
      type: "play.requested",
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
});

const getRuntimeConnections = Effect.fn("ViewerRuntimeClient.getConnections")(function* (
  context: ViewerRuntimeRequestContext,
) {
  const payload = yield* fetchJson(context, "/api/connections");
  return yield* decodeRuntimeConnectionSummary(payload).pipe(
    Effect.mapError((cause) => decodeError("connection summary", cause)),
  );
});

const disconnectRuntimeConnection = Effect.fn("ViewerRuntimeClient.disconnectConnection")(
  function* (context: ViewerRuntimeRequestContext, connectionId: string) {
    const payload = yield* fetchJson(
      context,
      `/api/connections/${encodeURIComponent(connectionId)}`,
      { method: "DELETE" },
    );
    return yield* decodeRuntimeConnectionSummary(payload).pipe(
      Effect.mapError((cause) => decodeError("connection summary", cause)),
    );
  },
);

const getRuntimeRavenVision = Effect.fn("ViewerRuntimeClient.getRavenVision")(function* (
  context: ViewerRuntimeRequestContext,
) {
  const payload = yield* fetchJson(context, "/api/raven/onboarding/vision");
  return yield* decodeRuntimeRavenVisionProjection(payload).pipe(
    Effect.mapError((cause) => decodeError("Raven Vision", cause)),
  );
});

const startRuntimeRavenVision = Effect.fn("ViewerRuntimeClient.startRavenVision")(function* (
  context: ViewerRuntimeRequestContext,
) {
  const payload = yield* fetchJson(context, "/api/raven/onboarding/vision/start", {
    method: "POST",
  });
  return yield* decodeRuntimeRavenVisionProjection(payload).pipe(
    Effect.mapError((cause) => decodeError("Raven Vision", cause)),
  );
});

const requestRuntimeRavenVisionDrafting = Effect.fn(
  "ViewerRuntimeClient.requestRavenVisionDrafting",
)(function* (context: ViewerRuntimeRequestContext) {
  const payload = yield* fetchJson(context, "/api/raven/onboarding/vision/drafting-request", {
    method: "POST",
  });
  return yield* decodeRuntimeRavenVisionProjection(payload).pipe(
    Effect.mapError((cause) => decodeError("Raven Vision", cause)),
  );
});

const updateRuntimeRavenVisionSlot = Effect.fn("ViewerRuntimeClient.updateRavenVisionSlot")(
  function* (context: ViewerRuntimeRequestContext, slotId: RuntimeRavenVisionSlotId, text: string) {
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
  },
);

const approveRuntimeRavenVisionSlot = Effect.fn("ViewerRuntimeClient.approveRavenVisionSlot")(
  function* (context: ViewerRuntimeRequestContext, slotId: RuntimeRavenVisionSlotId) {
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
  },
);

const skipRuntimeRavenVisionSlot = Effect.fn("ViewerRuntimeClient.skipRavenVisionSlot")(function* (
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

const bankRuntimeRavenVision = Effect.fn("ViewerRuntimeClient.bankRavenVision")(function* (
  context: ViewerRuntimeRequestContext,
) {
  const payload = yield* fetchJson(context, "/api/raven/onboarding/vision/bank", {
    method: "POST",
  });
  return yield* decodeRuntimeRavenVisionBankResult(payload).pipe(
    Effect.mapError((cause) => decodeError("Raven Vision bank", cause)),
  );
});

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

const createRuntimeFileSource = Effect.fn("ViewerRuntimeClient.createFileSource")(function* (
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

const createRuntimeUrlSource = Effect.fn("ViewerRuntimeClient.createUrlSource")(function* (
  context: ViewerRuntimeRequestContext,
  input: RuntimeCreateUrlSourceInput,
) {
  const payload = yield* fetchJson(context, "/api/sources", {
    body: JSON.stringify({
      type: "url",
      attachToVision: input.attachToVision !== false,
      url: input.url,
      ...(input.title == null || input.title.length === 0 ? {} : { title: input.title }),
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

const createRuntimeNoteSource = Effect.fn("ViewerRuntimeClient.createNoteSource")(function* (
  context: ViewerRuntimeRequestContext,
  input: RuntimeCreateNoteSourceInput,
) {
  const payload = yield* fetchJson(context, "/api/sources", {
    body: JSON.stringify({
      type: "note",
      attachToVision: input.attachToVision !== false,
      text: input.text,
      ...(input.title == null || input.title.length === 0 ? {} : { title: input.title }),
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
  bankRavenVision: Effect.Effect<RuntimeRavenVisionBankResult, ViewerRuntimeError>;
  createFileSource: (
    input: RuntimeCreateFileSourceInput,
  ) => Effect.Effect<RuntimeSourceCreateResult, ViewerRuntimeError>;
  createNoteSource: (
    input: RuntimeCreateNoteSourceInput,
  ) => Effect.Effect<RuntimeSourceCreateResult, ViewerRuntimeError>;
  createUrlSource: (
    input: RuntimeCreateUrlSourceInput,
  ) => Effect.Effect<RuntimeSourceCreateResult, ViewerRuntimeError>;
  disconnectConnection: (
    connectionId: string,
  ) => Effect.Effect<RuntimeConnectionSummary, ViewerRuntimeError>;
  getColleagueJournals: Effect.Effect<ColleagueJournals, ViewerRuntimeError>;
  getConnections: Effect.Effect<RuntimeConnectionSummary, ViewerRuntimeError>;
  getHealth: Effect.Effect<RuntimeHealth, ViewerRuntimeError>;
  getInfoHubBoard: Effect.Effect<InfoHubBoard, ViewerRuntimeError>;
  getMapState: Effect.Effect<MapStateWithRevision, ViewerRuntimeError>;
  getLibraryCatalog: Effect.Effect<LibraryCatalog, ViewerRuntimeError>;
  getLibraryCatalogForRequest: (
    request: LibraryCatalogRequest,
  ) => Effect.Effect<LibraryCatalog, ViewerRuntimeError>;
  getLibraryCard: (card: LibraryCardRef) => Effect.Effect<LibraryCardDetail, ViewerRuntimeError>;
  getLibraryGraph: Effect.Effect<LibraryGraph, ViewerRuntimeError>;
  getLibraryGraphForRequest: (
    request: LibraryGraphRequest,
  ) => Effect.Effect<LibraryGraph, ViewerRuntimeError>;
  getRavenVision: Effect.Effect<RuntimeRavenVisionProjection, ViewerRuntimeError>;
  getState: Effect.Effect<RuntimeProjectState, ViewerRuntimeError>;
  listEvents: (limit: number) => Effect.Effect<RuntimeEventPage, ViewerRuntimeError>;
  confirmLibrary: (
    request: RuntimeLibraryConfirmationRequest,
  ) => Effect.Effect<RuntimeLibraryConfirmationResult, ViewerRuntimeError>;
  requestPlay: (playId: string, agentId: string) => Effect.Effect<void, ViewerRuntimeError>;
  rejectLibrary: (
    request: RuntimeLibraryConfirmationRequest & { editList: LibraryConfirmationEdit[] },
  ) => Effect.Effect<RuntimeLibraryConfirmationResult, ViewerRuntimeError>;
  runPlay: (playId: string) => Effect.Effect<RuntimePlayRunLaunchResult, ViewerRuntimeError>;
  saveInfoHubBoard: (
    cards: readonly InfoHubCard[],
  ) => Effect.Effect<InfoHubBoard, ViewerRuntimeError>;
  saveMapState: (
    state: MapState,
    revision: string | null,
  ) => Effect.Effect<MapStateWithRevision, ViewerRuntimeError>;
  skipRavenVisionSlot: (
    slotId: RuntimeRavenVisionSlotId,
  ) => Effect.Effect<RuntimeRavenVisionProjection, ViewerRuntimeError>;
  requestRavenVisionDrafting: Effect.Effect<RuntimeRavenVisionProjection, ViewerRuntimeError>;
  startRavenVision: Effect.Effect<RuntimeRavenVisionProjection, ViewerRuntimeError>;
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
    approveRavenVisionSlot: (slotId) => approveRuntimeRavenVisionSlot(context, slotId),
    bankRavenVision: bankRuntimeRavenVision(context),
    createFileSource: (input) => createRuntimeFileSource(context, input),
    createNoteSource: (input) => createRuntimeNoteSource(context, input),
    createUrlSource: (input) => createRuntimeUrlSource(context, input),
    disconnectConnection: (connectionId) => disconnectRuntimeConnection(context, connectionId),
    getColleagueJournals: getColleagueJournals(context),
    getConnections: getRuntimeConnections(context),
    getHealth: getRuntimeHealth(context),
    getInfoHubBoard: getInfoHubBoard(context),
    getMapState: getMapState(context),
    getLibraryCatalog: getLibraryCatalog(context),
    getLibraryCatalogForRequest: (request) => getLibraryCatalog(context, request),
    getLibraryCard: (card) => getLibraryCardDetail(context, card),
    getLibraryGraph: getLibraryGraph(context),
    getLibraryGraphForRequest: (request) => getLibraryGraph(context, request),
    getRavenVision: getRuntimeRavenVision(context),
    getState: getRuntimeProjectState(context),
    listEvents: (limit: number) => listRuntimeEvents(context, limit),
    confirmLibrary: (request) => confirmRuntimeLibrary(context, request),
    requestPlay: (playId, agentId) => requestRuntimePlay(context, playId, agentId),
    rejectLibrary: (request) => rejectRuntimeLibrary(context, request),
    runPlay: (playId) => runRuntimePlay(context, playId),
    saveInfoHubBoard: (cards) => saveInfoHubBoard(context, cards),
    saveMapState: (state, revision) => saveMapState(context, state, revision),
    requestRavenVisionDrafting: requestRuntimeRavenVisionDrafting(context),
    skipRavenVisionSlot: (slotId) => skipRuntimeRavenVisionSlot(context, slotId),
    startRavenVision: startRuntimeRavenVision(context),
    updateRavenVisionSlot: (slotId, text) => updateRuntimeRavenVisionSlot(context, slotId, text),
  };
}
