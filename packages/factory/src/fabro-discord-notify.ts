#!/usr/bin/env bun

import { Effect } from "effect";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export type FabroHookEvent =
  | "run_start"
  | "stage_start"
  | "stage_complete"
  | "stage_failed"
  | "run_failed"
  | "run_complete";

export interface HookContext {
  readonly event: FabroHookEvent | "unknown";
  readonly run_id: string;
  readonly workflow_name: string;
  readonly node_id?: string;
  readonly node_label?: string;
  readonly handler_type?: string;
  readonly status?: string;
  readonly failure_reason?: string;
  readonly error_message?: string;
}

export interface DiscordField {
  readonly name: string;
  readonly value: string;
  readonly inline: boolean;
}

export interface DiscordPayload {
  readonly username: "Fabro";
  readonly embeds: readonly [
    {
      readonly title: string;
      readonly url: string;
      readonly description: string;
      readonly color: number;
      readonly fields: readonly DiscordField[];
    },
  ];
}

export interface PullRequestInfo {
  readonly number: number;
  readonly title: string;
  readonly url: string;
}

interface RuntimeEnv {
  readonly webhookUrl: string;
  readonly server: string;
  readonly webUrl: string;
  readonly dedupeDir: string;
  readonly dryRun: boolean;
  readonly timeoutSeconds: number;
}

export type WebhookFetch = (url: string, init: RequestInit) => Promise<Response>;

export type WebhookDeliveryResult =
  | {
      readonly ok: true;
    }
  | {
      readonly ok: false;
      readonly status?: number;
      readonly statusText?: string;
      readonly error?: string;
    };

const defaultServer = "http://127.0.0.1:3000";
const defaultDedupeDir = join(homedir(), ".fabro", "discord-notify-state");
const Color = {
  Blue: 3447003,
  Yellow: 16776960,
  Red: 15158332,
  Green: 3066993,
} as const;

interface EventMetadata {
  readonly title: string;
  readonly description?: string;
  readonly color: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getPath = (value: unknown, path: readonly string[]): unknown =>
  path.reduce<unknown>((current, key) => (isRecord(current) ? current[key] : undefined), value);

const getString = (value: unknown, path: readonly string[]): string | undefined => {
  const pathValue = getPath(value, path);
  return typeof pathValue === "string" && pathValue.length > 0 ? pathValue : undefined;
};

const getNumber = (value: unknown, path: readonly string[]): number | undefined => {
  const pathValue = getPath(value, path);
  return typeof pathValue === "number" && Number.isFinite(pathValue) ? pathValue : undefined;
};

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const envString = (name: string): string | undefined => {
  const value = process.env[name];
  return value === undefined || value === "" ? undefined : value;
};

const hookEventFromString = (value: unknown): HookContext["event"] => {
  switch (value) {
    case "run_start":
    case "stage_start":
    case "stage_complete":
    case "stage_failed":
    case "run_failed":
    case "run_complete":
      return value;
    default:
      return "unknown";
  }
};

const runtimeEnv = (): RuntimeEnv => {
  const server = envString("FABRO_LOCAL_SERVER") ?? defaultServer;
  return {
    webhookUrl: envString("FABRO_DISCORD_WEBHOOK_URL") ?? "",
    server,
    webUrl: envString("FABRO_DISCORD_WEB_URL") ?? envString("FABRO_WEB_URL") ?? server,
    dedupeDir: envString("FABRO_DISCORD_DEDUPE_DIR") ?? defaultDedupeDir,
    dryRun: envString("FABRO_DISCORD_DRY_RUN") === "true",
    timeoutSeconds: Number(envString("FABRO_DISCORD_TIMEOUT_SECONDS") ?? "5"),
  };
};

export const normalizeRemoteUrl = (remoteUrl: string): string => {
  let url = remoteUrl;

  if (url.startsWith("git@") && url.includes(":")) {
    const rest = url.slice("git@".length);
    const separator = rest.indexOf(":");
    url = `https://${rest.slice(0, separator)}/${rest.slice(separator + 1)}`;
  } else if (url.startsWith("ssh://git@")) {
    url = `https://${url.slice("ssh://git@".length)}`;
  }

  if (url.startsWith("https://") && url.includes("@")) {
    const rest = url.slice("https://".length);
    const marker = rest.indexOf("@");
    const credentials = rest.slice(0, marker);
    if (!credentials.includes("/")) {
      url = `https://${rest.slice(marker + 1)}`;
    }
  }

  if (url.startsWith("https://github.com:")) {
    url = `https://github.com/${url.slice("https://github.com:".length)}`;
  }

  return url.replace(/\/+$/, "").replace(/\.git$/, "");
};

export const deriveTitle = (goal: string): string => {
  const firstLine =
    goal
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? "";

  let title = firstLine.replace(/^#+\s*/, "").replace(/^GitHub Issue #/, "");
  if (/^\d+:\s+.+/.test(title)) {
    title = title.replace(/^\d+:\s+/, "");
  }

  return title.length > 0 ? title : "Fabro workflow run";
};

export const extractIssueUrl = (goal: string): string | undefined =>
  goal.match(/https:\/\/github\.com\/[^\s)]+\/issues\/\d+/)?.[0];

export const issueLabelFromUrl = (url: string | undefined): string | undefined => {
  if (url === undefined) {
    return undefined;
  }
  return `#${url.slice(url.lastIndexOf("/") + 1)}`;
};

export const formatDurationMs = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  return seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`;
};

export const shouldNotify = (context: HookContext): boolean =>
  // The workflow hook matcher catches human stages today; keep this guard so a
  // future matcher change does not turn every stage event into a Discord post.
  (context.event !== "stage_start" && context.event !== "stage_complete") ||
  context.handler_type === "human";

const safeDedupePart = (value: string): string => value.replace(/[^A-Za-z0-9_.-]/g, "_");

const errorCode = (error: unknown): string | undefined =>
  isRecord(error) && typeof error.code === "string" ? error.code : undefined;

export const notificationDedupeKey = (context: HookContext): string | undefined => {
  if (context.event !== "run_start" || context.run_id === "unknown") {
    return undefined;
  }

  return [context.event, context.workflow_name, context.run_id].map(safeDedupePart).join(".");
};

export const shouldSkipDeliveredNotification = async (
  context: HookContext,
  dedupeDir: string,
): Promise<boolean> => {
  const key = notificationDedupeKey(context);
  if (key === undefined) {
    return false;
  }

  try {
    await readFile(join(dedupeDir, key), "utf8");
    return true;
  } catch (error) {
    if (errorCode(error) !== "ENOENT") {
      console.warn(`Failed to read Discord notification dedupe state: ${String(error)}`);
    }
    return false;
  }
};

export const recordDeliveredNotification = async (
  context: HookContext,
  dedupeDir: string,
): Promise<void> => {
  const key = notificationDedupeKey(context);
  if (key === undefined) {
    return;
  }

  await mkdir(dedupeDir, { recursive: true });

  try {
    await writeFile(
      join(dedupeDir, key),
      JSON.stringify({
        event: context.event,
        run_id: context.run_id,
        workflow_name: context.workflow_name,
        delivered_at: new Date().toISOString(),
      }),
      { flag: "wx" },
    );
  } catch (error) {
    if (errorCode(error) !== "EEXIST") {
      console.warn(`Failed to write Discord notification dedupe state: ${String(error)}`);
    }
  }
};

const field = (name: string, value: string, inline: boolean): DiscordField => ({
  name,
  value,
  inline,
});

const metadataForEvent = (
  event: HookContext["event"],
  fallbackDescription: string,
): EventMetadata => {
  switch (event) {
    case "run_start":
      return {
        title: "Fabro run started",
        color: Color.Blue,
      };
    case "stage_start":
      return {
        title: "Human approval needed",
        description: "Review the workflow question before execution continues.",
        color: Color.Yellow,
      };
    case "stage_complete":
      return {
        title: "Human feedback received",
        description: "Human feedback was received; workflow execution can continue.",
        color: Color.Blue,
      };
    case "stage_failed":
      return {
        title: "Fabro stage failed",
        description: "A workflow stage failed. See the reason below.",
        color: Color.Red,
      };
    case "run_failed":
      return {
        title: "Fabro run failed",
        description: "The workflow run failed. See the reason below.",
        color: Color.Red,
      };
    case "run_complete":
      return {
        title: "Fabro run completed",
        color: Color.Green,
      };
    case "unknown":
      return {
        title: "Fabro event",
        description: fallbackDescription,
        color: Color.Blue,
      };
    default: {
      const unhandled: never = event;
      return {
        title: unhandled,
        color: Color.Blue,
      };
    }
  }
};

export const buildDiscordPayload = (
  context: HookContext,
  inspect: unknown,
  webUrl: string,
  pullRequest?: PullRequestInfo,
): DiscordPayload => {
  const goal =
    getString(inspect, ["run_spec", "settings", "run", "goal", "value"]) ??
    getString(inspect, ["run_spec", "graph", "attrs", "goal", "String"]) ??
    "";
  const issueTitle = deriveTitle(goal);
  const issueUrl = extractIssueUrl(goal);
  const issueLabel = issueLabelFromUrl(issueUrl);
  const duration = formatDurationMs(getNumber(inspect, ["conclusion", "duration_ms"]) ?? 0);
  const status =
    getString(inspect, ["conclusion", "status"]) ?? getString(inspect, ["status", "kind"]);

  const metadata = metadataForEvent(context.event, issueTitle);

  const fields = [
    field("Run", `\`${context.run_id}\``, true),
    field("Workflow", `\`${context.workflow_name}\``, true),
  ];

  if (issueUrl !== undefined && issueLabel !== undefined) {
    fields.push(field("Issue", `[${issueLabel}](${issueUrl})`, true));
  }

  const stage = context.node_label ?? context.node_id;
  if (stage !== undefined && stage.length > 0) {
    fields.push(field("Stage", `\`${stage}\``, true));
  }

  if (context.node_id !== undefined && context.node_id.length > 0) {
    fields.push(field("Node", `\`${context.node_id}\``, true));
  }

  const failureReason = context.failure_reason ?? context.error_message;
  if (failureReason !== undefined && failureReason.length > 0) {
    fields.push(field("Reason", failureReason, false));
  }

  if (context.event === "stage_complete" && context.status !== undefined) {
    fields.push(field("Result", `\`${context.status}\``, true));
  }

  if (context.event === "run_complete") {
    fields.push(field("Duration", duration, true));
    if (status !== undefined) {
      fields.push(field("Result", `\`${status}\``, true));
    }
    if (pullRequest !== undefined) {
      fields.push(
        field(
          "Pull Request",
          `[#${pullRequest.number} ${pullRequest.title}](${pullRequest.url})`,
          false,
        ),
      );
    }
  }

  return {
    username: "Fabro",
    embeds: [
      {
        title: metadata.title,
        url: `${webUrl.replace(/\/+$/, "")}/runs/${context.run_id}`,
        description: metadata.description ?? issueTitle,
        color: metadata.color,
        fields,
      },
    ],
  };
};

const contextFromEnv = (): HookContext => {
  const nodeId = envString("FABRO_NODE_ID");
  return {
    event: hookEventFromString(envString("FABRO_EVENT")),
    run_id: envString("FABRO_RUN_ID") ?? "unknown",
    workflow_name: envString("FABRO_WORKFLOW") ?? "unknown",
    ...(nodeId === undefined ? {} : { node_id: nodeId }),
  };
};

const contextFromUnknown = (value: unknown): HookContext => {
  if (!isRecord(value)) {
    return contextFromEnv();
  }

  return {
    event: hookEventFromString(value.event),
    run_id: typeof value.run_id === "string" ? value.run_id : "unknown",
    workflow_name: typeof value.workflow_name === "string" ? value.workflow_name : "unknown",
    ...(typeof value.node_id === "string" ? { node_id: value.node_id } : {}),
    ...(typeof value.node_label === "string" ? { node_label: value.node_label } : {}),
    ...(typeof value.handler_type === "string" ? { handler_type: value.handler_type } : {}),
    ...(typeof value.status === "string" ? { status: value.status } : {}),
    ...(typeof value.failure_reason === "string" ? { failure_reason: value.failure_reason } : {}),
    ...(typeof value.error_message === "string" ? { error_message: value.error_message } : {}),
  };
};

const readContextText = async (): Promise<string> => {
  const contextPath = envString("FABRO_HOOK_CONTEXT");
  if (contextPath !== undefined) {
    const file = Bun.file(contextPath);
    if (await file.exists()) {
      return await file.text();
    }
  }

  if (!process.stdin.isTTY) {
    const stdin = await Bun.stdin.text();
    if (stdin.trim().length > 0) {
      return stdin;
    }
  }

  return JSON.stringify(contextFromEnv());
};

const runTextCommand = async (
  command: readonly string[],
  timeoutSeconds: number,
): Promise<string | undefined> => {
  let didTimeout = false;
  const child = Bun.spawn([...command], { stdout: "pipe", stderr: "pipe" });
  const timeout = setTimeout(() => {
    didTimeout = true;
    child.kill();
  }, timeoutSeconds * 1000);

  try {
    const [stdout, exitCode] = await Promise.all([new Response(child.stdout).text(), child.exited]);
    if (didTimeout) {
      console.warn(`Timed out running ${command[0] ?? "command"}.`);
      return undefined;
    }
    if (exitCode !== 0) {
      return undefined;
    }
    return stdout;
  } catch (error) {
    console.warn(`Failed running ${command[0] ?? "command"}: ${String(error)}`);
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
};

const inspectRun = async (
  server: string,
  runId: string,
  timeoutSeconds: number,
): Promise<unknown> => {
  if (runId === "unknown") {
    return {};
  }

  // Fields consumed downstream: goal, origin URL, run branch, duration,
  // conclusion status, and live status. Missing fields degrade gracefully.
  const stdout = await runTextCommand(
    ["fabro", "inspect", "--server", server, runId, "--json"],
    timeoutSeconds,
  );
  if (stdout === undefined) {
    return {};
  }
  const parsed = parseJson(stdout);
  return Array.isArray(parsed) ? (parsed[0] ?? {}) : parsed;
};

const ownerRepoFromRemote = (remoteUrl: string | undefined): string | undefined => {
  if (remoteUrl === undefined) {
    return undefined;
  }
  const normalized = normalizeRemoteUrl(remoteUrl);
  return normalized.startsWith("https://github.com/")
    ? normalized.slice("https://github.com/".length)
    : undefined;
};

const lookupPullRequest = async (
  inspect: unknown,
  timeoutSeconds: number,
): Promise<PullRequestInfo | undefined> => {
  const runBranch = getString(inspect, ["start_record", "run_branch"]);
  const ownerRepo = ownerRepoFromRemote(getString(inspect, ["run_spec", "git", "origin_url"]));
  if (runBranch === undefined || ownerRepo === undefined) {
    return undefined;
  }

  const stdout = await runTextCommand(
    [
      "gh",
      "pr",
      "list",
      "--repo",
      ownerRepo,
      "--head",
      runBranch,
      "--state",
      "all",
      "--json",
      "number,title,url",
      "--jq",
      ".[0] // empty",
    ],
    timeoutSeconds,
  );
  if (stdout === undefined || stdout.trim().length === 0) {
    return undefined;
  }
  const result = parseJson(stdout);
  if (!isRecord(result)) {
    return undefined;
  }
  return typeof result.number === "number" &&
    typeof result.title === "string" &&
    typeof result.url === "string"
    ? { number: result.number, title: result.title, url: result.url }
    : undefined;
};

export const formatWebhookDeliveryWarning = (result: WebhookDeliveryResult): string | undefined => {
  if (result.ok) {
    return undefined;
  }

  if (result.status !== undefined) {
    const statusText =
      result.statusText === undefined || result.statusText.length === 0
        ? ""
        : ` ${result.statusText}`;
    return `Discord webhook post failed: HTTP ${result.status}${statusText}`;
  }

  return `Discord webhook post failed: ${result.error ?? "unknown error"}`;
};

export const postWebhook = async (
  webhookUrl: string,
  payload: DiscordPayload,
  timeoutSeconds: number,
  fetchImpl: WebhookFetch = fetch,
): Promise<WebhookDeliveryResult> => {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), timeoutSeconds * 1000);
  try {
    const response = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        statusText: response.statusText,
      };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
};

const main = Effect.gen(function* () {
  const env = runtimeEnv();
  if (env.webhookUrl.length === 0 && !env.dryRun) {
    console.warn("FABRO_DISCORD_WEBHOOK_URL is unset; skipping Discord notification.");
    return;
  }

  const contextText = yield* Effect.promise(readContextText);
  const context = contextFromUnknown(parseJson(contextText));
  if (!shouldNotify(context)) {
    return;
  }
  if (yield* Effect.promise(() => shouldSkipDeliveredNotification(context, env.dedupeDir))) {
    return;
  }

  const inspect = yield* Effect.promise(() =>
    inspectRun(env.server, context.run_id, env.timeoutSeconds),
  );
  const pullRequest =
    context.event === "run_complete"
      ? yield* Effect.promise(() => lookupPullRequest(inspect, env.timeoutSeconds))
      : undefined;
  const payload = buildDiscordPayload(context, inspect, env.webUrl, pullRequest);

  if (env.dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const delivery = yield* Effect.promise(() =>
    postWebhook(env.webhookUrl, payload, env.timeoutSeconds),
  );
  const warning = formatWebhookDeliveryWarning(delivery);
  if (warning !== undefined) {
    console.warn(warning);
  } else {
    yield* Effect.promise(() => recordDeliveredNotification(context, env.dedupeDir));
  }
});

if (import.meta.main) {
  await Effect.runPromise(
    main.pipe(
      Effect.catchAll((error: unknown) =>
        Effect.sync(() => {
          console.error(String(error));
        }),
      ),
    ),
  );
}
