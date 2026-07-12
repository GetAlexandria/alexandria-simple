export const CODEX_APP_SERVER_SCHEMA_VERSION = 1;

export interface CodexAppServerMetadata {
  schemaVersion: typeof CODEX_APP_SERVER_SCHEMA_VERSION;
  appServerId: string;
  endpoint: string;
  host: string;
  pid: number;
  port: number;
  projectRoot: string;
  startedAt: string;
  workspacePath: string;
}

export class CodexAppServerMetadataInvalidError extends Error {
  readonly _tag = "CodexAppServerMetadataInvalidError";
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

function validateEndpoint(value: string): Error | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== "ws:" && url.protocol !== "wss:") {
      return new Error("endpoint must use ws or wss.");
    }
    return undefined;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

export function validateCodexAppServerMetadata(value: unknown): CodexAppServerMetadata | Error {
  if (!isRecord(value)) {
    return new Error("Codex app-server metadata must be a JSON object.");
  }

  if (value.schemaVersion !== CODEX_APP_SERVER_SCHEMA_VERSION) {
    return new Error(`schemaVersion must be ${CODEX_APP_SERVER_SCHEMA_VERSION}.`);
  }

  const appServerId = stringField(value, "appServerId");
  if (appServerId instanceof Error) {
    return appServerId;
  }

  const endpoint = stringField(value, "endpoint");
  if (endpoint instanceof Error) {
    return endpoint;
  }
  const endpointError = validateEndpoint(endpoint);
  if (endpointError != null) {
    return endpointError;
  }

  const host = stringField(value, "host");
  if (host instanceof Error) {
    return host;
  }

  const pid = integerField(value, "pid");
  if (pid instanceof Error) {
    return pid;
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

  const startedAt = stringField(value, "startedAt");
  if (startedAt instanceof Error) {
    return startedAt;
  }
  if (Number.isNaN(new Date(startedAt).getTime())) {
    return new Error("startedAt must be a valid timestamp.");
  }

  const workspacePath = stringField(value, "workspacePath");
  if (workspacePath instanceof Error) {
    return workspacePath;
  }

  return {
    schemaVersion: CODEX_APP_SERVER_SCHEMA_VERSION,
    appServerId,
    endpoint,
    host,
    pid,
    port,
    projectRoot,
    startedAt,
    workspacePath,
  };
}

export function parseCodexAppServerMetadata(content: string): CodexAppServerMetadata | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }

  return validateCodexAppServerMetadata(parsed);
}

export function serializeCodexAppServerMetadata(metadata: CodexAppServerMetadata): string {
  return `${JSON.stringify(metadata, null, 2)}\n`;
}
