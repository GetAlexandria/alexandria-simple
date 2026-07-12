import { isAbsolute, join, normalize, resolve, relative } from "path";

export const DEFAULT_CONFIG_DIR = ".alexandria";
export const CONFIG_FILE_NAME = "alexandria-config.json";
export const DEFAULT_SOURCES_PATH = `${DEFAULT_CONFIG_DIR}/sources.jsonl`;
export const DEFAULT_WORKSPACE = "docs/alexandria";
export const INBOX_DIR = "inbox";
export const LEDGER_DIR = "ledger";
export const LEDGER_FILE_NAME = "events.jsonl";
export const RUNTIME_DIR = ".runtime";
export const CURSORS_DIR = "cursors";
export const CONNECTIONS_DIR = "connections";
export const CODEX_APP_SERVER_METADATA_FILE_NAME = "codex-app-server.json";
export const SERVER_CLAIM_FILE_NAME = "server.claim";
export const SERVER_METADATA_FILE_NAME = "server.json";
export const SOURCE_ASSESSMENTS_DIR = "source-assessments";
export const SOURCE_OF_TRUTH_DIR = "source-of-truth";
export const SOURCES_DIR = "sources";
export const SOURCE_ORIGINALS_DIR = "originals";
export const SOURCE_PROCESSED_DIR = "processed";
export const SUBSCRIPTIONS_DIR = "subscriptions";
export const RAVEN_SOURCE_OF_TRUTH_FILE_NAME = "raven-product-context.md";
export const SOURCE_OF_TRUTH_FILE_NAME = "source-of-truth.md";
export const INFO_HUB_DIR = "info-hub";
export const INFO_HUB_BOARD_FILE_NAME = "board-state.json";

export function configPathForRoot(root: string): string {
  return `${root}/${DEFAULT_CONFIG_DIR}/${CONFIG_FILE_NAME}`;
}

export function ledgerPathForWorkspace(root: string, workspace: string): string {
  return join(root, workspace, LEDGER_DIR, LEDGER_FILE_NAME);
}

export function inboxPathForWorkspace(root: string, workspace: string): string {
  return join(root, workspace, INBOX_DIR);
}

export function sourceAssessmentsPathForWorkspace(root: string, workspace: string): string {
  return join(root, workspace, SOURCE_ASSESSMENTS_DIR);
}

export function sourceOriginalsPathForWorkspace(root: string, workspace: string): string {
  return join(root, workspace, SOURCES_DIR, SOURCE_ORIGINALS_DIR);
}

export function sourceProcessedPathForWorkspace(root: string, workspace: string): string {
  return join(root, workspace, SOURCES_DIR, SOURCE_PROCESSED_DIR);
}

export function ravenSourceOfTruthPathForWorkspace(root: string, workspace: string): string {
  return join(root, workspace, SOURCE_OF_TRUTH_DIR, RAVEN_SOURCE_OF_TRUTH_FILE_NAME);
}

export function ravenSourceOfTruthProjectPathForWorkspace(workspace: string): string {
  return normalizeWorkspace(join(workspace, SOURCE_OF_TRUTH_DIR, RAVEN_SOURCE_OF_TRUTH_FILE_NAME));
}

export function sourceOfTruthPathForKnowledgeBankArea(
  root: string,
  workspace: string,
  agentId: string,
  knowledgeBankAreaId: string,
): string {
  return join(
    root,
    workspace,
    SOURCE_OF_TRUTH_DIR,
    agentId,
    knowledgeBankAreaId,
    SOURCE_OF_TRUTH_FILE_NAME,
  );
}

export function sourceOfTruthProjectPathForKnowledgeBankArea(
  workspace: string,
  agentId: string,
  knowledgeBankAreaId: string,
): string {
  return normalizeWorkspace(
    join(workspace, SOURCE_OF_TRUTH_DIR, agentId, knowledgeBankAreaId, SOURCE_OF_TRUTH_FILE_NAME),
  );
}

export function sourcesPathForRoot(root: string, sourcesPath: string): string {
  return join(root, sourcesPath);
}

export function runtimePathForWorkspace(root: string, workspace: string): string {
  return join(root, workspace, RUNTIME_DIR);
}

export function runtimePathForWorkspacePath(workspacePath: string): string {
  return join(workspacePath, RUNTIME_DIR);
}

export function cursorsPathForWorkspacePath(workspacePath: string): string {
  return join(runtimePathForWorkspacePath(workspacePath), CURSORS_DIR);
}

export function connectionsPathForWorkspacePath(workspacePath: string): string {
  return join(runtimePathForWorkspacePath(workspacePath), CONNECTIONS_DIR);
}

export function cursorPathForWorkspacePath(workspacePath: string, cursorId: string): string {
  return join(cursorsPathForWorkspacePath(workspacePath), `${cursorId}.json`);
}

export function connectionPathForWorkspacePath(
  workspacePath: string,
  connectionId: string,
): string {
  return join(connectionsPathForWorkspacePath(workspacePath), `${connectionId}.json`);
}

export function subscriptionsPathForWorkspacePath(workspacePath: string): string {
  return join(runtimePathForWorkspacePath(workspacePath), SUBSCRIPTIONS_DIR);
}

export function subscriptionPathForWorkspacePath(
  workspacePath: string,
  subscriptionId: string,
): string {
  return join(subscriptionsPathForWorkspacePath(workspacePath), `${subscriptionId}.json`);
}

export function serverClaimPathForWorkspacePath(workspacePath: string): string {
  return join(runtimePathForWorkspacePath(workspacePath), SERVER_CLAIM_FILE_NAME);
}

export function serverMetadataPathForWorkspacePath(workspacePath: string): string {
  return join(runtimePathForWorkspacePath(workspacePath), SERVER_METADATA_FILE_NAME);
}

export function codexAppServerMetadataPathForWorkspacePath(workspacePath: string): string {
  return join(runtimePathForWorkspacePath(workspacePath), CODEX_APP_SERVER_METADATA_FILE_NAME);
}

export function infoHubDirForWorkspacePath(workspacePath: string): string {
  return join(workspacePath, INFO_HUB_DIR);
}

export function infoHubBoardPathForWorkspacePath(workspacePath: string): string {
  return join(infoHubDirForWorkspacePath(workspacePath), INFO_HUB_BOARD_FILE_NAME);
}

export function normalizeWorkspace(value: string): string {
  return normalize(value.replace(/\\/g, "/")).replace(/\\/g, "/");
}

export function isWindowsAbsolutePath(value: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(value);
}

export function validateWorkspace(value: string): string | Error {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return new Error("Workspace path must not be empty.");
  }

  if (isAbsolute(trimmed) || isWindowsAbsolutePath(trimmed)) {
    return new Error("Workspace path must be relative to the project root.");
  }

  const workspace = normalizeWorkspace(trimmed);
  if (workspace === "." || workspace === ".." || workspace.startsWith("../")) {
    return new Error("Workspace path must stay inside the project root.");
  }

  return workspace;
}

export function validateProjectRelativePath(value: string): string | Error {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return new Error("Project path must not be empty.");
  }

  if (isAbsolute(trimmed) || isWindowsAbsolutePath(trimmed)) {
    return new Error("Project path must be relative to the project root.");
  }

  const normalized = normalizeWorkspace(trimmed);
  if (normalized === "." || normalized === ".." || normalized.startsWith("../")) {
    return new Error("Project path must stay inside the project root.");
  }

  return normalized;
}

export function isPathInsideRoot(root: string, path: string): boolean {
  const candidateRelativePath = relative(resolve(root), resolve(path));
  return (
    candidateRelativePath === "" ||
    (!candidateRelativePath.startsWith("..") && !isAbsolute(candidateRelativePath))
  );
}
