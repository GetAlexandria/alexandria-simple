#!/usr/bin/env bun

import { Effect } from "effect";

import {
  createGitHubClient,
  extractIssueUrl,
  issueLabelNames,
  parseGitHubIssueUrl,
  replaceLabelState,
  type GitHubClient,
} from "./fabro-github.js";
import { envString, parseJson, readStdinOrFile, runTextCommand } from "./fabro-process.js";
import {
  watcherConfigFromEnv,
  type WatcherConfig,
  type WatcherLabels,
} from "./fabro-issue-watcher.js";

interface HookContext {
  readonly event: string;
  readonly run_id: string;
  readonly handler_type?: string;
}

interface LabelTransition {
  readonly remove: readonly string[];
  readonly add: readonly string[];
}

export interface GithubLabelHookDependencies {
  readonly github?: GitHubClient;
  readonly inspectGoal?: (runId: string) => Promise<string>;
  readonly inspectRunData?: (runId: string) => Promise<unknown>;
  readonly log?: (message: string) => void;
}

const contextFromUnknown = (value: unknown): HookContext => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {
      event: envString("FABRO_EVENT") ?? "unknown",
      run_id: envString("FABRO_RUN_ID") ?? "unknown",
    };
  }
  const record = value as Record<string, unknown>;
  return {
    event: typeof record.event === "string" ? record.event : "unknown",
    run_id: typeof record.run_id === "string" ? record.run_id : "unknown",
    ...(typeof record.handler_type === "string" ? { handler_type: record.handler_type } : {}),
  };
};

const transitionForContext = (
  context: HookContext,
  labels: WatcherLabels,
): LabelTransition | undefined => {
  const allStates = [
    labels.ready,
    labels.submitted,
    labels.running,
    labels.needsHuman,
    labels.done,
    labels.failed,
  ];

  switch (context.event) {
    case "run_start":
      return {
        remove: allStates,
        add: [labels.running],
      };
    case "stage_start":
      return {
        remove: allStates,
        add: [context.handler_type === "human" ? labels.needsHuman : labels.running],
      };
    case "stage_failed":
    case "run_failed":
      return {
        remove: allStates,
        add: [labels.failed],
      };
    case "run_complete":
      return {
        remove: allStates,
        add: [labels.done],
      };
    default:
      return undefined;
  }
};

const inspectRun = async (
  config: WatcherConfig,
  runId: string,
  log: (message: string) => void,
): Promise<unknown> => {
  if (runId === "unknown") {
    log("Fabro GitHub label hook cannot inspect an unknown run id.");
    return {};
  }
  const result = await runTextCommand(
    ["fabro", "inspect", "--server", config.fabroServer, runId, "--json"],
    config.commandTimeoutSeconds,
  );
  if (result.timedOut) {
    log(`Fabro GitHub label hook timed out inspecting run ${runId}.`);
    return {};
  }
  if (result.exitCode !== 0) {
    log(
      `Fabro GitHub label hook could not inspect run ${runId}: ${result.stderr || result.stdout}`,
    );
    return {};
  }
  const parsed = parseJson(result.stdout);
  return Array.isArray(parsed) ? (parsed[0] ?? {}) : parsed;
};

const sleep = async (milliseconds: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// The workflow graph cannot fail a run from an edge (fabro's validator
// requires an unconditional fallback edge, and fallbacks complete the run),
// so a failed final node — e.g. create_pr's delivery verification — leaves
// the run "succeeded" while checkpoint.context_values records the truth.
// Delivery enforcement therefore lives here: run_complete only labels
// fabro:done when the final node outcome is not "failed"
// (efficiency review rec #1, 2026-07-09; probed empirically).
const getFinalOutcomeFailure = (inspect: unknown): string | undefined => {
  if (typeof inspect !== "object" || inspect === null || Array.isArray(inspect)) {
    return undefined;
  }
  const record = inspect as Record<string, unknown>;
  const checkpoint = record.checkpoint as Record<string, unknown> | undefined;
  const contextValues = checkpoint?.context_values as Record<string, unknown> | undefined;
  if (contextValues?.outcome !== "failed") {
    return undefined;
  }
  const signature = contextValues.failure_signature;
  return typeof signature === "string" && signature.length > 0
    ? signature
    : "final node outcome failed";
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

// Repair-loop cap escalation (efficiency review rec #4): a run killed by the
// max_node_visits cycle cap is a stuck repair loop, not a hard failure — it
// deserves a human with the reviewer's last verdict in hand, not fabro:failed.
const getCycleCapFailure = (inspect: unknown): string | undefined => {
  const record = asRecord(inspect);
  const status = asRecord(record?.status);
  const conclusion = asRecord(record?.conclusion);
  const failure = asRecord(conclusion?.failure);
  const detail = asRecord(failure?.detail);
  const candidates = [detail?.message, failure?.message, status?.reason];
  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate.includes("visited") &&
      candidate.includes("cycle")
    ) {
      return candidate;
    }
  }
  return undefined;
};

const getLastReviewVerdict = (inspect: unknown): string | undefined => {
  const record = asRecord(inspect);
  const checkpoint = asRecord(record?.checkpoint);
  const contextValues = asRecord(checkpoint?.context_values);
  const review = contextValues?.["response.review"];
  if (typeof review !== "string" || review.length === 0 || review.startsWith("blob://")) {
    return undefined;
  }
  return review.length > 1800 ? `…${review.slice(-1800)}` : review;
};

const getGoal = (inspect: unknown): string => {
  if (typeof inspect !== "object" || inspect === null || Array.isArray(inspect)) {
    return "";
  }
  const record = inspect as Record<string, unknown>;
  const runSpec = record.run_spec as Record<string, unknown> | undefined;
  const settings = runSpec?.settings as Record<string, unknown> | undefined;
  const run = settings?.run as Record<string, unknown> | undefined;
  const goal = run?.goal as Record<string, unknown> | undefined;
  if (typeof goal?.value === "string") {
    return goal.value;
  }
  const graph = runSpec?.graph as Record<string, unknown> | undefined;
  const attrs = graph?.attrs as Record<string, unknown> | undefined;
  const graphGoal = attrs?.goal as Record<string, unknown> | undefined;
  return typeof graphGoal?.String === "string" ? graphGoal.String : "";
};

const inspectGoalWithRetry = async (
  config: WatcherConfig,
  runId: string,
  log: (message: string) => void,
): Promise<string> => {
  const deadline = Date.now() + Math.min(config.commandTimeoutSeconds, 4) * 1000;
  let attempts = 0;

  while (Date.now() < deadline) {
    attempts += 1;
    const goal = getGoal(await inspectRun(config, runId, log));
    if (goal.length > 0) {
      if (attempts > 1) {
        log(`Fabro GitHub label hook found run ${runId} goal after ${attempts} attempts.`);
      }
      return goal;
    }
    await sleep(250);
  }

  log(`Fabro GitHub label hook could not read run ${runId} goal before the retry budget expired.`);
  return "";
};

export const runGithubLabelHook = async (
  config: WatcherConfig,
  context: HookContext,
  dependencies?: GithubLabelHookDependencies,
): Promise<void> => {
  const log = dependencies?.log ?? console.warn;
  const transition = transitionForContext(context, config.labels);
  if (transition === undefined) {
    return;
  }

  let inspectData: unknown;
  const fetchInspect = async (): Promise<unknown> => {
    if (inspectData === undefined) {
      inspectData =
        dependencies?.inspectRunData !== undefined
          ? await dependencies.inspectRunData(context.run_id)
          : dependencies?.inspectGoal !== undefined
            ? // Hermetic dependency-injected mode: no shelling out.
              undefined
            : await inspectRun(config, context.run_id, log);
    }
    return inspectData;
  };

  let effectiveTransition = transition;
  let escalationComment: string | undefined;
  if (context.event === "run_failed" || context.event === "stage_failed") {
    const capFailure = getCycleCapFailure(await fetchInspect());
    if (capFailure !== undefined) {
      const verdict = getLastReviewVerdict(await fetchInspect());
      log(
        `Fabro GitHub label hook escalating run ${context.run_id} to ${config.labels.needsHuman}: ${capFailure}`,
      );
      effectiveTransition = {
        remove: transition.remove,
        add: [config.labels.needsHuman],
      };
      escalationComment = [
        `**Repair-loop cap reached** (run \`${context.run_id}\`): ${capFailure}`,
        "",
        verdict === undefined
          ? "_The reviewer's last verdict was not inline-readable; see the run transcript._"
          : `Reviewer's last verdict:\n\n${verdict}`,
      ].join("\n");
    }
  }
  if (context.event === "run_complete") {
    const failure = getFinalOutcomeFailure(await fetchInspect());
    if (failure !== undefined) {
      log(
        `Fabro GitHub label hook refusing ${config.labels.done} for run ${context.run_id}: ${failure}`,
      );
      effectiveTransition = {
        remove: transition.remove,
        add: [config.labels.failed],
      };
    }
  }

  const goal =
    dependencies?.inspectGoal === undefined
      ? getGoal(await fetchInspect()) || (await inspectGoalWithRetry(config, context.run_id, log))
      : await dependencies.inspectGoal(context.run_id);
  const issueUrl = extractIssueUrl(goal);
  if (issueUrl === undefined) {
    log(`Fabro GitHub label hook found no GitHub issue URL for run ${context.run_id}.`);
    return;
  }

  const issueRef = parseGitHubIssueUrl(issueUrl);
  if (issueRef === undefined || issueRef.owner !== config.owner || issueRef.repo !== config.repo) {
    log(`Fabro GitHub label hook ignored non-target issue URL: ${issueUrl}`);
    return;
  }

  const client =
    dependencies?.github ??
    createGitHubClient({
      owner: config.owner,
      repo: config.repo,
      token: config.githubToken,
      apiBaseUrl: config.githubApiBaseUrl,
      readyLabel: config.labels.ready,
    });
  const issue = await client.getIssue(issueRef.number);
  const nextLabels = replaceLabelState(
    issueLabelNames(issue),
    effectiveTransition.remove,
    effectiveTransition.add,
  );
  await client.setLabels(issueRef.number, nextLabels);
  if (escalationComment !== undefined) {
    await client.createComment(issueRef.number, escalationComment);
  }
};

const main = Effect.gen(function* () {
  const config = watcherConfigFromEnv();
  const contextText = yield* Effect.promise(() => readStdinOrFile("FABRO_HOOK_CONTEXT"));
  const context = contextFromUnknown(contextText === undefined ? {} : parseJson(contextText));
  yield* Effect.promise(() => runGithubLabelHook(config, context));
});

if (import.meta.main) {
  await Effect.runPromise(
    main.pipe(
      Effect.catchAll((error: unknown) =>
        Effect.sync(() => {
          console.error(
            error instanceof Error && error.stack !== undefined ? error.stack : String(error),
          );
        }),
      ),
    ),
  );
}
