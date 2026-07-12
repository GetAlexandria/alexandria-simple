import { describe, expect, test } from "bun:test";

import { runGithubLabelHook } from "./fabro-github-label-hook.js";
import { type WatcherConfig } from "./fabro-issue-watcher.js";

const makeIssue = (labels: readonly string[]) => ({
  number: 120,
  title: "Lifecycle labels",
  body: null,
  html_url: "https://github.com/GetAlexandria/alexandria-internal/issues/120",
  labels: labels.map((name) => ({ name })),
});

const config: WatcherConfig = {
  owner: "GetAlexandria",
  repo: "alexandria-internal",
  githubToken: "test-token",
  githubApiBaseUrl: "http://github.local",
  fabroServer: "http://fabro.local",
  fabroWorkflowConfig: ".fabro/workflows/ax-feature/workflow.toml",
  fabroWebUrl: "http://fabro.local",
  pollIntervalSeconds: 60,
  commandTimeoutSeconds: 5,
  labels: {
    ready: "fabro:ready",
    submitted: "fabro:submitted",
    running: "fabro:running",
    needsHuman: "fabro:needs-human",
    done: "fabro:done",
    failed: "fabro:failed",
  },
};

describe("Fabro GitHub label hook", () => {
  test("hook lifecycle transitions use the shared label state machine", async () => {
    let issue = makeIssue(["fabro:submitted"]);
    const github = {
      listReadyIssues: async () => [],
      getIssue: async () => issue,
      setLabels: async (_number: number, labels: readonly string[]) => {
        issue = makeIssue(labels);
        return issue;
      },
      createComment: async () => undefined,
    };

    const dependencies = {
      github,
      inspectGoal: async () =>
        "GitHub Issue #120: Lifecycle labels\n\nhttps://github.com/GetAlexandria/alexandria-internal/issues/120",
    };
    await runGithubLabelHook(
      config,
      {
        event: "run_start",
        run_id: "01KTESTFABRORUN0000000001",
      },
      dependencies,
    );
    expect(issue.labels.map((label) => label.name).sort()).toEqual(["fabro:running"]);

    await runGithubLabelHook(
      config,
      {
        event: "stage_start",
        run_id: "01KTESTFABRORUN0000000001",
        handler_type: "human",
      },
      dependencies,
    );
    expect(issue.labels.map((label) => label.name).sort()).toEqual(["fabro:needs-human"]);

    await runGithubLabelHook(
      config,
      {
        event: "stage_start",
        run_id: "01KTESTFABRORUN0000000001",
        handler_type: "agent",
      },
      dependencies,
    );
    expect(issue.labels.map((label) => label.name).sort()).toEqual(["fabro:running"]);

    await runGithubLabelHook(
      config,
      {
        event: "run_complete",
        run_id: "01KTESTFABRORUN0000000001",
      },
      dependencies,
    );
    expect(issue.labels.map((label) => label.name).sort()).toEqual(["fabro:done"]);
  });
});

import { runGithubLabelHook as runHookForDelivery } from "./fabro-github-label-hook.js";
import { describe as describeDelivery, expect as expectDelivery, it as itDelivery } from "bun:test";

describeDelivery("run_complete delivery enforcement", () => {
  const makeClient = () => {
    const calls: { labels?: string[] } = {};
    return {
      calls,
      client: {
        getIssue: async () => ({
          number: 120,
          labels: [{ name: "fabro:running" }],
        }),
        setLabels: async (_number: number, labels: string[]) => {
          calls.labels = labels;
        },
      },
    };
  };

  const config = {
    owner: "GetAlexandria",
    repo: "alexandria-internal",
    githubToken: "t",
    githubApiBaseUrl: "https://api.github.com",
    fabroServer: "http://127.0.0.1:3000",
    commandTimeoutSeconds: 1,
    labels: {
      ready: "fabro:ready",
      submitted: "fabro:submitted",
      running: "fabro:running",
      needsHuman: "fabro:needs-human",
      done: "fabro:done",
      failed: "fabro:failed",
    },
  };

  const goal =
    "GitHub Issue #120: Delivery\n\nhttps://github.com/GetAlexandria/alexandria-internal/issues/120";

  itDelivery("labels done when the final node succeeded", async () => {
    const { calls, client } = makeClient();
    await runHookForDelivery(
      config as never,
      { event: "run_complete", run_id: "run-ok" },
      {
        github: client as never,
        inspectGoal: async () => goal,
        inspectRunData: async () => ({
          checkpoint: { context_values: { outcome: "succeeded" } },
        }),
        log: () => {},
      },
    );
    expectDelivery(calls.labels).toContain("fabro:done");
  });

  itDelivery("refuses done and labels failed when the final node failed", async () => {
    const { calls, client } = makeClient();
    await runHookForDelivery(
      config as never,
      { event: "run_complete", run_id: "run-bad" },
      {
        github: client as never,
        inspectGoal: async () => goal,
        inspectRunData: async () => ({
          checkpoint: {
            context_values: {
              outcome: "failed",
              failure_signature: "create_pr|deterministic|delivery-verification: push did not land",
            },
          },
        }),
        log: () => {},
      },
    );
    expectDelivery(calls.labels).toContain("fabro:failed");
    expectDelivery(calls.labels ?? []).not.toContain("fabro:done");
  });

  itDelivery("stage_failed transitions are unaffected", async () => {
    const { calls, client } = makeClient();
    await runHookForDelivery(
      config as never,
      { event: "stage_failed", run_id: "run-mid" },
      {
        github: client as never,
        inspectGoal: async () => goal,
        inspectRunData: async () => ({}),
        log: () => {},
      },
    );
    expectDelivery(calls.labels).toContain("fabro:failed");
  });
});

describeDelivery("repair-loop cap escalation", () => {
  const config = {
    owner: "GetAlexandria",
    repo: "alexandria-internal",
    githubToken: "t",
    githubApiBaseUrl: "https://api.github.com",
    fabroServer: "http://127.0.0.1:3000",
    commandTimeoutSeconds: 1,
    labels: {
      ready: "fabro:ready",
      submitted: "fabro:submitted",
      running: "fabro:running",
      needsHuman: "fabro:needs-human",
      done: "fabro:done",
      failed: "fabro:failed",
    },
  };
  const goal =
    "GitHub Issue #120: Cap\n\nhttps://github.com/GetAlexandria/alexandria-internal/issues/120";

  const makeClient = () => {
    const calls: { labels?: string[]; comment?: string } = {};
    return {
      calls,
      client: {
        getIssue: async () => ({ number: 120, labels: [{ name: "fabro:running" }] }),
        setLabels: async (_n: number, labels: string[]) => {
          calls.labels = labels;
        },
        createComment: async (_n: number, body: string) => {
          calls.comment = body;
        },
      },
    };
  };

  itDelivery("escalates a cycle-cap run_failed to needs-human with the verdict", async () => {
    const { calls, client } = makeClient();
    await runHookForDelivery(
      config as never,
      { event: "run_failed", run_id: "run-cap" },
      {
        github: client as never,
        inspectGoal: async () => goal,
        inspectRunData: async () => ({
          conclusion: {
            failure: {
              detail: {
                message:
                  'node "implement" visited 4 times (graph limit 4); run is stuck in a cycle',
              },
            },
          },
          checkpoint: {
            context_values: { "response.review": "**Findings**\n- Blocking: fix the thing." },
          },
        }),
        log: () => {},
      },
    );
    expectDelivery(calls.labels).toContain("fabro:needs-human");
    expectDelivery(calls.labels ?? []).not.toContain("fabro:failed");
    expectDelivery(calls.comment ?? "").toContain("Repair-loop cap reached");
    expectDelivery(calls.comment ?? "").toContain("fix the thing");
  });

  itDelivery("ordinary run_failed stays fabro:failed with no comment", async () => {
    const { calls, client } = makeClient();
    await runHookForDelivery(
      config as never,
      { event: "run_failed", run_id: "run-plain" },
      {
        github: client as never,
        inspectGoal: async () => goal,
        inspectRunData: async () => ({
          conclusion: { failure: { detail: { message: "Failed to initialize sandbox" } } },
        }),
        log: () => {},
      },
    );
    expectDelivery(calls.labels).toContain("fabro:failed");
    expectDelivery(calls.comment).toBeUndefined();
  });
});
