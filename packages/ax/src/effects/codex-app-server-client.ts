import { Effect } from "effect";

export class CodexAppServerError extends Error {
  readonly _tag = "CodexAppServerError";
}

export interface CodexAppServerDelivery {
  mode: "codex-app-server";
  methods: string[];
  turnStarted: boolean;
}

export interface InjectCodexWakeInput {
  endpoint: string;
  startTurn: boolean;
  text: string;
  threadId: string;
}

export interface CodexThreadSummary {
  cwd: string;
  id: string;
}

const CODEX_WAKE_TURN_TEXT = "🅰 Alexandria: Update incoming";

interface PendingRequest {
  reject(error: Error): void;
  resolve(result: unknown): void;
}

interface CodexRequest {
  id: number;
  jsonrpc: "2.0";
  method: string;
  params: unknown;
}

interface CodexNotification {
  jsonrpc: "2.0";
  method: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function parseEndpoint(endpoint: string): URL | Error {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return new Error("Codex app-server endpoint must be a valid URL.");
  }

  if (url.protocol !== "ws:" && url.protocol !== "wss:") {
    return new Error("Codex app-server endpoint must use ws:// or wss:// for this adapter.");
  }

  return url;
}

function responseErrorMessage(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  if (!isRecord(value.error)) {
    return null;
  }

  if (typeof value.error.message === "string") {
    return value.error.message;
  }

  return "Codex app-server request failed.";
}

function responseResult(value: unknown): unknown {
  return isRecord(value) ? value.result : undefined;
}

function responseId(value: unknown): number | null {
  if (!isRecord(value)) {
    return null;
  }

  // The Codex app-server requests this client sends use numeric JSON-RPC ids.
  return typeof value.id === "number" ? value.id : null;
}

function responseText(data: unknown): string | Error {
  if (typeof data === "string") {
    return data;
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString("utf8");
  }

  return new Error("Codex app-server sent a non-text response.");
}

function openSocket(endpoint: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(endpoint);
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("Timed out connecting to Codex app-server."));
    }, 2_000);

    ws.addEventListener(
      "open",
      () => {
        clearTimeout(timeout);
        resolve(ws);
      },
      { once: true },
    );
    ws.addEventListener(
      "error",
      () => {
        clearTimeout(timeout);
        reject(new Error("Failed to connect to Codex app-server."));
      },
      { once: true },
    );
  });
}

function installResponseRouter(ws: WebSocket, pending: Map<number, PendingRequest>): void {
  ws.addEventListener("message", (event) => {
    const text = responseText(event.data);
    if (text instanceof Error) {
      return;
    }

    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      return;
    }

    const id = responseId(value);
    if (id == null) {
      return;
    }

    const request = pending.get(id);
    if (request == null) {
      return;
    }
    pending.delete(id);

    const errorMessage = responseErrorMessage(value);
    if (errorMessage != null) {
      request.reject(new Error(errorMessage));
      return;
    }

    request.resolve(responseResult(value));
  });

  ws.addEventListener("close", () => {
    for (const request of pending.values()) {
      request.reject(new Error("Codex app-server connection closed."));
    }
    pending.clear();
  });
}

function sendNotification(ws: WebSocket, notification: Omit<CodexNotification, "jsonrpc">): void {
  ws.send(JSON.stringify({ jsonrpc: "2.0", ...notification }));
}

function sendRequestValue(
  ws: WebSocket,
  pending: Map<number, PendingRequest>,
  request: Omit<CodexRequest, "jsonrpc">,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(request.id);
      reject(new Error(`Timed out waiting for ${request.method}.`));
    }, 5_000);

    pending.set(request.id, {
      reject(error) {
        clearTimeout(timeout);
        reject(error);
      },
      resolve(result) {
        clearTimeout(timeout);
        resolve(result);
      },
    });

    ws.send(JSON.stringify({ jsonrpc: "2.0", ...request }));
  });
}

async function sendRequest(
  ws: WebSocket,
  pending: Map<number, PendingRequest>,
  request: Omit<CodexRequest, "jsonrpc">,
): Promise<void> {
  await sendRequestValue(ws, pending, request);
}

async function withCodexAppServer<T>(
  input: { endpoint: string },
  use: (ws: WebSocket, pending: Map<number, PendingRequest>) => Promise<T>,
): Promise<T> {
  const endpoint = parseEndpoint(input.endpoint);
  if (endpoint instanceof Error) {
    throw endpoint;
  }

  const ws = await openSocket(endpoint.toString());
  const pending = new Map<number, PendingRequest>();
  installResponseRouter(ws, pending);

  try {
    await sendRequest(ws, pending, {
      id: 1,
      method: "initialize",
      params: {
        clientInfo: {
          name: "alexandria-ax",
          title: "Alexandria AX",
          version: "1.0.0",
        },
        capabilities: {
          experimentalApi: true,
        },
      },
    });
    sendNotification(ws, { method: "initialized" });
    return await use(ws, pending);
  } finally {
    // Calls only wait for app-server request acks. Turn progress and final
    // output remain owned by the target Codex thread after this socket closes.
    ws.close();
  }
}

function wakeItem(text: string): Record<string, unknown> {
  return {
    type: "message",
    role: "user",
    content: [
      {
        type: "input_text",
        text,
      },
    ],
  };
}

async function injectCodexWakePromise(
  input: InjectCodexWakeInput,
): Promise<CodexAppServerDelivery> {
  return withCodexAppServer(input, async (ws, pending) => {
    await sendRequest(ws, pending, {
      id: 2,
      method: "thread/inject_items",
      params: {
        threadId: input.threadId,
        items: [wakeItem(input.text)],
      },
    });

    const methods = ["thread/inject_items"];
    if (input.startTurn) {
      await sendRequest(ws, pending, {
        id: 3,
        method: "turn/start",
        params: {
          threadId: input.threadId,
          input: [
            {
              type: "text",
              text: CODEX_WAKE_TURN_TEXT,
              text_elements: [],
            },
          ],
        },
      });
      methods.push("turn/start");
    }

    return {
      mode: "codex-app-server",
      methods,
      turnStarted: input.startTurn,
    };
  });
}

function loadedThreadIds(result: unknown): string[] | Error {
  if (!isRecord(result) || !Array.isArray(result.data)) {
    return new Error("Codex app-server returned invalid loaded thread list.");
  }

  const ids: string[] = [];
  for (const value of result.data) {
    if (typeof value !== "string" || value.length === 0) {
      return new Error("Codex app-server returned an invalid thread id.");
    }
    ids.push(value);
  }

  return ids;
}

function threadSummary(result: unknown): CodexThreadSummary | Error {
  if (!isRecord(result) || !isRecord(result.thread)) {
    return new Error("Codex app-server returned invalid thread data.");
  }

  if (
    typeof result.thread.id !== "string" ||
    result.thread.id.length === 0 ||
    typeof result.thread.cwd !== "string" ||
    result.thread.cwd.length === 0
  ) {
    return new Error("Codex app-server returned invalid thread metadata.");
  }

  return {
    cwd: result.thread.cwd,
    id: result.thread.id,
  };
}

async function listLoadedCodexThreadsPromise(input: { endpoint: string }): Promise<string[]> {
  return withCodexAppServer(input, async (ws, pending) => {
    const result = await sendRequestValue(ws, pending, {
      id: 2,
      method: "thread/loaded/list",
      params: {},
    });
    const ids = loadedThreadIds(result);
    if (ids instanceof Error) {
      throw ids;
    }
    return ids;
  });
}

async function readCodexThreadPromise(input: {
  endpoint: string;
  threadId: string;
}): Promise<CodexThreadSummary> {
  return withCodexAppServer(input, async (ws, pending) => {
    const result = await sendRequestValue(ws, pending, {
      id: 2,
      method: "thread/read",
      params: {
        includeTurns: false,
        threadId: input.threadId,
      },
    });
    const summary = threadSummary(result);
    if (summary instanceof Error) {
      throw summary;
    }
    return summary;
  });
}

async function listCodexThreadsByCwdPromise(input: {
  cwd: string;
  endpoint: string;
}): Promise<CodexThreadSummary[]> {
  return withCodexAppServer(input, async (ws, pending) => {
    const result = await sendRequestValue(ws, pending, {
      id: 2,
      method: "thread/list",
      params: {
        archived: false,
        cwd: input.cwd,
        limit: 50,
      },
    });
    if (!isRecord(result) || !Array.isArray(result.data)) {
      throw new Error("Codex app-server returned invalid thread list.");
    }

    const threads: CodexThreadSummary[] = [];
    for (const value of result.data) {
      const summary = threadSummary({ thread: value });
      if (summary instanceof Error) {
        throw summary;
      }
      threads.push(summary);
    }
    return threads;
  });
}

async function pingCodexAppServerPromise(input: { endpoint: string }): Promise<void> {
  await listLoadedCodexThreadsPromise(input);
}

export function injectCodexWake(
  input: InjectCodexWakeInput,
): Effect.Effect<CodexAppServerDelivery, CodexAppServerError> {
  return Effect.tryPromise({
    try: () => injectCodexWakePromise(input),
    catch: (error) =>
      new CodexAppServerError(error instanceof Error ? error.message : String(error)),
  });
}

export function pingCodexAppServer(input: {
  endpoint: string;
}): Effect.Effect<void, CodexAppServerError> {
  return Effect.tryPromise({
    try: () => pingCodexAppServerPromise(input),
    catch: (error) =>
      new CodexAppServerError(error instanceof Error ? error.message : String(error)),
  });
}

export function listLoadedCodexThreads(input: {
  endpoint: string;
}): Effect.Effect<string[], CodexAppServerError> {
  return Effect.tryPromise({
    try: () => listLoadedCodexThreadsPromise(input),
    catch: (error) =>
      new CodexAppServerError(error instanceof Error ? error.message : String(error)),
  });
}

export function readCodexThread(input: {
  endpoint: string;
  threadId: string;
}): Effect.Effect<CodexThreadSummary, CodexAppServerError> {
  return Effect.tryPromise({
    try: () => readCodexThreadPromise(input),
    catch: (error) =>
      new CodexAppServerError(error instanceof Error ? error.message : String(error)),
  });
}

export function listCodexThreadsByCwd(input: {
  cwd: string;
  endpoint: string;
}): Effect.Effect<CodexThreadSummary[], CodexAppServerError> {
  return Effect.tryPromise({
    try: () => listCodexThreadsByCwdPromise(input),
    catch: (error) =>
      new CodexAppServerError(error instanceof Error ? error.message : String(error)),
  });
}
