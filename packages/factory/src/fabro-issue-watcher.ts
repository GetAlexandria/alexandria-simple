#!/usr/bin/env bun

import { Effect } from "effect";
import { fileURLToPath } from "node:url";

import {
  createGitHubClient,
  issueLabelNames,
  replaceLabelState,
  type GitHubClient,
  type GitHubIssue,
} from "./fabro-github.js";
import { envString, runTextCommand } from "./fabro-process.js";

export interface WatcherLabels {
  readonly ready: string;
  readonly submitted: string;
  readonly running: string;
  readonly needsHuman: string;
  readonly done: string;
  readonly failed: string;
}

export interface WatcherConfig {
  readonly owner: string;
  readonly repo: string;
  readonly githubToken: string;
  readonly githubApiBaseUrl: string;
  readonly fabroServer: string;
  readonly fabroWorkflowConfig: string;
  readonly fabroWebUrl: string;
  readonly pollIntervalSeconds: number;
  readonly commandTimeoutSeconds: number;
  readonly labels: WatcherLabels;
}

export interface SubmittedRun {
  readonly runId: string;
}

export interface WatcherDependencies {
  readonly github: GitHubClient;
  readonly submitRun: (issue: GitHubIssue) => Promise<SubmittedRun>;
  readonly log: (message: string) => void;
  readonly errorLog: (message: string) => void;
}

export interface WatcherResult {
  readonly submitted: number;
  readonly skipped: number;
  readonly failed: number;
}

const defaultLabels: WatcherLabels = {
  ready: "fabro:ready",
  submitted: "fabro:submitted",
  running: "fabro:running",
  needsHuman: "fabro:needs-human",
  done: "fabro:done",
  failed: "fabro:failed",
};
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

const stateLabels = (labels: WatcherLabels): readonly string[] => [
  labels.ready,
  labels.submitted,
  labels.running,
  labels.needsHuman,
  labels.done,
  labels.failed,
];

const getRequiredEnv = (name: string): string => {
  const value = envString(name);
  if (value === undefined) {
    throw new Error(`${name} is required.`);
  }
  return value;
};

const formatError = (error: unknown): string =>
  error instanceof Error && error.stack !== undefined ? error.stack : String(error);

export const parsePositiveInt = (
  value: string | undefined,
  fallback: number,
  name: string,
  warn: (message: string) => void = console.warn,
): number => {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    warn(`${name} must be a positive integer; using ${fallback}.`);
    return fallback;
  }
  return parsed;
};

export const watcherConfigFromEnv = (): WatcherConfig => ({
  owner: envString("FABRO_WATCHER_GITHUB_OWNER") ?? "GetAlexandria",
  repo: envString("FABRO_WATCHER_GITHUB_REPO") ?? "alexandria-internal",
  githubToken:
    envString("FABRO_WATCHER_GITHUB_TOKEN") ??
    envString("GITHUB_TOKEN") ??
    getRequiredEnv("GH_TOKEN"),
  githubApiBaseUrl: envString("FABRO_WATCHER_GITHUB_API_BASE_URL") ?? "https://api.github.com",
  fabroServer: envString("FABRO_LOCAL_SERVER") ?? "http://127.0.0.1:3000",
  fabroWorkflowConfig: getRequiredEnv("FABRO_WATCHER_WORKFLOW_CONFIG"),
  fabroWebUrl:
    envString("FABRO_WEB_URL") ??
    envString("FABRO_DISCORD_WEB_URL") ??
    envString("FABRO_LOCAL_SERVER") ??
    "http://127.0.0.1:3000",
  pollIntervalSeconds: parsePositiveInt(
    envString("FABRO_WATCHER_POLL_SECONDS"),
    60,
    "FABRO_WATCHER_POLL_SECONDS",
  ),
  commandTimeoutSeconds: parsePositiveInt(
    envString("FABRO_WATCHER_COMMAND_TIMEOUT_SECONDS"),
    30,
    "FABRO_WATCHER_COMMAND_TIMEOUT_SECONDS",
  ),
  labels: {
    ready: envString("FABRO_WATCHER_READY_LABEL") ?? defaultLabels.ready,
    submitted: envString("FABRO_WATCHER_SUBMITTED_LABEL") ?? defaultLabels.submitted,
    running: envString("FABRO_WATCHER_RUNNING_LABEL") ?? defaultLabels.running,
    needsHuman: envString("FABRO_WATCHER_NEEDS_HUMAN_LABEL") ?? defaultLabels.needsHuman,
    done: envString("FABRO_WATCHER_DONE_LABEL") ?? defaultLabels.done,
    failed: envString("FABRO_WATCHER_FAILED_LABEL") ?? defaultLabels.failed,
  },
});

export const buildIssueGoal = (issue: GitHubIssue): string => {
  const body = issue.body?.trim();
  return [
    `GitHub Issue #${issue.number}: ${issue.title}`,
    "",
    issue.html_url,
    ...(body === undefined || body.length === 0 ? [] : ["", body]),
  ].join("\n");
};

const writeTempGoalFile = async (issue: GitHubIssue): Promise<string> => {
  const path = `${process.env.TMPDIR ?? "/tmp"}/fabro-issue-${issue.number}-${Date.now()}.md`;
  await Bun.write(path, buildIssueGoal(issue));
  return path;
};

const parseFabroRunId = (text: string): string | undefined => {
  const runLine = text.match(/Run:\s*([A-Z0-9]{20,32})/i)?.[1];
  if (runLine !== undefined) {
    return runLine;
  }
  return text.match(/\b[0-9A-HJKMNP-TV-Z]{20,32}\b/)?.[0];
};

export const createFabroSubmitter =
  (config: WatcherConfig) =>
  async (issue: GitHubIssue): Promise<SubmittedRun> => {
    const goalFile = await writeTempGoalFile(issue);
    try {
      const result = await runTextCommand(
        [
          "fabro",
          "run",
          "--server",
          config.fabroServer,
          config.fabroWorkflowConfig,
          "--goal-file",
          goalFile,
          "--detach",
        ],
        config.commandTimeoutSeconds,
        { cwd: repoRoot },
      );
      const combinedOutput = `${result.stdout}\n${result.stderr}`;
      const runId = parseFabroRunId(combinedOutput);
      if (result.timedOut) {
        throw new Error("Timed out submitting Fabro run.");
      }
      if (result.exitCode !== 0 || runId === undefined) {
        throw new Error(`Fabro run submission failed: ${combinedOutput}`);
      }
      return { runId };
    } finally {
      await Bun.file(goalFile)
        .delete()
        .catch(() => undefined);
    }
  };

const isEligibleForClaim = (issue: GitHubIssue, labels: WatcherLabels): boolean => {
  const names = issueLabelNames(issue);
  const blocking = stateLabels(labels).filter((label) => label !== labels.ready);
  return names.includes(labels.ready) && !blocking.some((label) => names.includes(label));
};

const claimIssue = async (
  github: GitHubClient,
  issue: GitHubIssue,
  labels: WatcherLabels,
): Promise<GitHubIssue | undefined> => {
  const fresh = await github.getIssue(issue.number);
  if (!isEligibleForClaim(fresh, labels)) {
    return undefined;
  }

  const nextLabels = replaceLabelState(issueLabelNames(fresh), [labels.ready], [labels.submitted]);
  return await github.setLabels(fresh.number, nextLabels);
};

const markSubmissionFailed = async (
  github: GitHubClient,
  issue: GitHubIssue,
  labels: WatcherLabels,
  reason: string,
): Promise<void> => {
  const nextLabels = replaceLabelState(
    issueLabelNames(issue),
    [labels.ready, labels.submitted, labels.running, labels.needsHuman],
    [labels.failed],
  );
  await github.setLabels(issue.number, nextLabels);
  await github.createComment(
    issue.number,
    `Fabro local run submission failed.\n\nReason: ${reason}`,
  );
};

export const runIssueWatcherOnce = async (
  config: WatcherConfig,
  dependencies?: Partial<WatcherDependencies>,
): Promise<WatcherResult> => {
  const github =
    dependencies?.github ??
    createGitHubClient({
      owner: config.owner,
      repo: config.repo,
      token: config.githubToken,
      apiBaseUrl: config.githubApiBaseUrl,
      readyLabel: config.labels.ready,
    });
  const submitRun = dependencies?.submitRun ?? createFabroSubmitter(config);
  const log = dependencies?.log ?? console.log;
  const errorLog = dependencies?.errorLog ?? console.error;

  let submitted = 0;
  let skipped = 0;
  let failed = 0;

  const issues = await github.listReadyIssues();
  for (const issue of issues) {
    const claimed = await claimIssue(github, issue, config.labels);
    if (claimed === undefined) {
      skipped += 1;
      log(`Skipped issue #${issue.number}; it was already claimed or completed.`);
      continue;
    }

    try {
      const run = await submitRun(issue);
      const runUrl = `${config.fabroWebUrl.replace(/\/+$/, "")}/runs/${run.runId}`;
      await github.createComment(issue.number, `Fabro local run submitted: ${runUrl}`);
      submitted += 1;
      log(`Submitted issue #${issue.number} to Fabro as ${run.runId}.`);
    } catch (error) {
      failed += 1;
      const reason = formatError(error);
      log(`Failed to submit issue #${issue.number} to Fabro: ${reason}`);
      errorLog(reason);
      await markSubmissionFailed(github, claimed, config.labels, reason);
    }
  }

  return { submitted, skipped, failed };
};

const sleep = async (milliseconds: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const main = Effect.gen(function* () {
  const config = watcherConfigFromEnv();
  const once = process.argv.includes("--once");

  do {
    const result = yield* Effect.promise(() => runIssueWatcherOnce(config));
    console.log(
      `Fabro issue watcher: submitted=${result.submitted} skipped=${result.skipped} failed=${result.failed}`,
    );
    if (once) {
      return;
    }
    yield* Effect.promise(() => sleep(Math.max(1, config.pollIntervalSeconds) * 1000));
  } while (true);
});

if (import.meta.main) {
  await Effect.runPromise(
    main.pipe(
      Effect.catchAll((error: unknown) =>
        Effect.sync(() => {
          console.error(String(error));
          process.exitCode = 1;
        }),
      ),
    ),
  );
}
