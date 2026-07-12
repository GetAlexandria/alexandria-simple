export const RUNTIME_SERVER_SCHEMA_VERSION = 1;

export const RUNTIME_SERVER_MODES = ["api", "viewer"] as const;

export type AlexandriaRuntimeServerMode = (typeof RUNTIME_SERVER_MODES)[number];

export interface AlexandriaRuntimeServerMetadata {
  schemaVersion: typeof RUNTIME_SERVER_SCHEMA_VERSION;
  serverId: string;
  pid: number;
  url: string;
  host: string;
  port: number;
  projectRoot: string;
  workspacePath: string;
  libraryRoot?: string;
  mode: AlexandriaRuntimeServerMode;
  startedAt: string;
}

export interface AlexandriaRuntimeHealth {
  status: "ok";
  serverId: string;
  pid: number;
  url: string;
  projectRoot: string;
  workspacePath: string;
  libraryRoot: string;
  mode: AlexandriaRuntimeServerMode;
}

export class RuntimeMetadataInvalidError extends Error {
  readonly _tag = "RuntimeMetadataInvalidError";
}

export class ExistingRuntimeServerError extends Error {
  readonly _tag = "ExistingRuntimeServerError";

  constructor(readonly metadata: AlexandriaRuntimeServerMetadata) {
    super(formatExistingRuntimeServerMessage(metadata));
  }
}

export class RuntimeServerStartupClaimConflictError extends Error {
  readonly _tag = "RuntimeServerStartupClaimConflictError";

  constructor(readonly claimPath: string) {
    super(`Another Alexandria runtime server startup is in progress: ${claimPath}`);
  }
}

export class RuntimeServerUnhealthyError extends Error {
  readonly _tag = "RuntimeServerUnhealthyError";

  constructor(
    readonly metadata: AlexandriaRuntimeServerMetadata,
    readonly reason: string,
  ) {
    super(
      [
        "Recorded Alexandria runtime server is alive but unhealthy.",
        `PID: ${metadata.pid}`,
        `URL: ${metadata.url}`,
        `Workspace: ${metadata.workspacePath}`,
        `Reason: ${reason}`,
      ].join("\n"),
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function stringField(value: Record<string, unknown>, field: string): string | Error {
  const fieldValue = value[field];
  if (typeof fieldValue !== "string" || fieldValue.length === 0) {
    return new Error(`${field} must be a non-empty string.`);
  }
  return fieldValue;
}

function integerField(value: Record<string, unknown>, field: string): number | Error {
  const fieldValue = value[field];
  if (typeof fieldValue !== "number" || !Number.isSafeInteger(fieldValue) || fieldValue < 0) {
    return new Error(`${field} must be a non-negative integer.`);
  }
  return fieldValue;
}

function parseMode(value: unknown): AlexandriaRuntimeServerMode | Error {
  if (value === "api" || value === "viewer") {
    return value;
  }
  return new Error("mode must be api or viewer.");
}

function validateUrl(value: string): Error | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return new Error("url must use http or https.");
    }
    return undefined;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

export function validateRuntimeServerMetadata(
  value: unknown,
): AlexandriaRuntimeServerMetadata | Error {
  if (!isRecord(value)) {
    return new Error("Runtime server metadata must be a JSON object.");
  }

  if (value.schemaVersion !== RUNTIME_SERVER_SCHEMA_VERSION) {
    return new Error(`schemaVersion must be ${RUNTIME_SERVER_SCHEMA_VERSION}.`);
  }

  const serverId = stringField(value, "serverId");
  if (serverId instanceof Error) {
    return serverId;
  }

  const pid = integerField(value, "pid");
  if (pid instanceof Error) {
    return pid;
  }

  const url = stringField(value, "url");
  if (url instanceof Error) {
    return url;
  }
  const urlError = validateUrl(url);
  if (urlError != null) {
    return urlError;
  }

  const host = stringField(value, "host");
  if (host instanceof Error) {
    return host;
  }

  const port = integerField(value, "port");
  if (port instanceof Error) {
    return port;
  }
  if (port > 65535) {
    return new Error("port must be between 0 and 65535.");
  }

  const projectRoot = stringField(value, "projectRoot");
  if (projectRoot instanceof Error) {
    return projectRoot;
  }

  const workspacePath = stringField(value, "workspacePath");
  if (workspacePath instanceof Error) {
    return workspacePath;
  }

  const libraryRoot = value.libraryRoot == null ? undefined : stringField(value, "libraryRoot");
  if (libraryRoot instanceof Error) {
    return libraryRoot;
  }

  const mode = parseMode(value.mode);
  if (mode instanceof Error) {
    return mode;
  }

  const startedAt = stringField(value, "startedAt");
  if (startedAt instanceof Error) {
    return startedAt;
  }
  if (Number.isNaN(new Date(startedAt).getTime())) {
    return new Error("startedAt must be a valid timestamp.");
  }

  return {
    schemaVersion: RUNTIME_SERVER_SCHEMA_VERSION,
    serverId,
    pid,
    url,
    host,
    port,
    projectRoot,
    workspacePath,
    ...(libraryRoot == null ? {} : { libraryRoot }),
    mode,
    startedAt,
  };
}

export function parseRuntimeServerMetadata(
  content: string,
): AlexandriaRuntimeServerMetadata | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }

  return validateRuntimeServerMetadata(parsed);
}

export function serializeRuntimeServerMetadata(metadata: AlexandriaRuntimeServerMetadata): string {
  return `${JSON.stringify(metadata, null, 2)}\n`;
}

export function formatExistingRuntimeServerMessage(
  metadata: AlexandriaRuntimeServerMetadata,
): string {
  return [
    "An Alexandria runtime server is already running for this workspace.",
    `PID: ${metadata.pid}`,
    `URL: ${metadata.url}`,
    `Workspace: ${metadata.workspacePath}`,
  ].join("\n");
}

export function isRuntimeHealthResponse(value: unknown): value is AlexandriaRuntimeHealth {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.status === "ok" &&
    typeof value.serverId === "string" &&
    typeof value.pid === "number" &&
    typeof value.url === "string" &&
    typeof value.projectRoot === "string" &&
    typeof value.workspacePath === "string" &&
    typeof value.libraryRoot === "string" &&
    (value.mode === "api" || value.mode === "viewer")
  );
}

export function isPidAlive(pid: number): boolean {
  // pid 0 signals the caller's own process group and pid < 0 a whole group,
  // so corrupt metadata with a non-positive pid would read as alive forever.
  if (!Number.isSafeInteger(pid) || pid < 1) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error != null && typeof error === "object" && "code" in error && error.code === "EPERM") {
      return true;
    }
    return false;
  }
}
