import { describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildDiscordPayload,
  deriveTitle,
  extractIssueUrl,
  formatWebhookDeliveryWarning,
  formatDurationMs,
  issueLabelFromUrl,
  normalizeRemoteUrl,
  notificationDedupeKey,
  postWebhook,
  recordDeliveredNotification,
  shouldNotify,
  shouldSkipDeliveredNotification,
  type HookContext,
} from "./fabro-discord-notify.js";

const inspect = {
  run_spec: {
    settings: {
      run: {
        goal: {
          value:
            "# GitHub Issue #120: Validate Fabro workflow\n\nhttps://github.com/GetAlexandria/alexandria-internal/issues/120",
        },
      },
    },
    git: {
      origin_url: "git@github.com:GetAlexandria/alexandria-internal.git",
    },
  },
  start_record: {
    run_branch: "fabro/run-120",
  },
  conclusion: {
    duration_ms: 125000,
    status: "success",
  },
};

describe("Fabro Discord notifier", () => {
  test("normalizes GitHub remotes", () => {
    expect(normalizeRemoteUrl("git@github.com:GetAlexandria/alexandria-internal.git")).toBe(
      "https://github.com/GetAlexandria/alexandria-internal",
    );
    expect(normalizeRemoteUrl("ssh://git@github.com/GetAlexandria/alexandria-internal.git")).toBe(
      "https://github.com/GetAlexandria/alexandria-internal",
    );
    expect(
      normalizeRemoteUrl("https://token@github.com/GetAlexandria/alexandria-internal.git"),
    ).toBe("https://github.com/GetAlexandria/alexandria-internal");
  });

  test("derives issue titles without mangling conventional commit titles", () => {
    expect(deriveTitle("# GitHub Issue #120: Validate Fabro workflow")).toBe(
      "Validate Fabro workflow",
    );
    expect(deriveTitle("feat: add X: do Y")).toBe("feat: add X: do Y");
    expect(deriveTitle("")).toBe("Fabro workflow run");
  });

  test("extracts issue labels from goals", () => {
    const url = extractIssueUrl(
      "Run https://github.com/GetAlexandria/alexandria-internal/issues/120 please.",
    );
    expect(url).toBe("https://github.com/GetAlexandria/alexandria-internal/issues/120");
    expect(issueLabelFromUrl(url)).toBe("#120");
  });

  test("formats durations", () => {
    expect(formatDurationMs(9000)).toBe("9s");
    expect(formatDurationMs(125000)).toBe("2m 5s");
  });

  test("filters non-human stage events", () => {
    expect(
      shouldNotify({
        event: "stage_start",
        run_id: "01RUN",
        workflow_name: "workflow",
        handler_type: "command",
      }),
    ).toBe(false);
    expect(
      shouldNotify({
        event: "stage_start",
        run_id: "01RUN",
        workflow_name: "workflow",
        handler_type: "human",
      }),
    ).toBe(true);
    expect(
      shouldNotify({
        event: "stage_complete",
        run_id: "01RUN",
        workflow_name: "workflow",
        handler_type: "command",
      }),
    ).toBe(false);
    expect(
      shouldNotify({
        event: "stage_complete",
        run_id: "01RUN",
        workflow_name: "workflow",
        handler_type: "human",
      }),
    ).toBe(true);
  });

  test("deduplicates delivered run start notifications by run id", async () => {
    const dedupeDir = await mkdtemp(join(tmpdir(), "fabro-discord-dedupe-"));
    const context: HookContext = {
      event: "run_start",
      run_id: "01RUN",
      workflow_name: "AxFeatureAcp",
    };

    try {
      expect(notificationDedupeKey(context)).toBe("run_start.AxFeatureAcp.01RUN");
      expect(await shouldSkipDeliveredNotification(context, dedupeDir)).toBe(false);

      await recordDeliveredNotification(context, dedupeDir);

      expect(await shouldSkipDeliveredNotification(context, dedupeDir)).toBe(true);
    } finally {
      await rm(dedupeDir, { recursive: true, force: true });
    }
  });

  test("does not deduplicate stage notifications", () => {
    expect(
      notificationDedupeKey({
        event: "stage_start",
        run_id: "01RUN",
        workflow_name: "AxFeatureAcp",
        handler_type: "human",
      }),
    ).toBeUndefined();
  });

  test("builds human approval payloads", () => {
    const payload = buildDiscordPayload(
      {
        event: "stage_start",
        run_id: "01RUN",
        workflow_name: "ax-feature",
        node_id: "human",
        node_label: "Plan approval",
        handler_type: "human",
      },
      inspect,
      "https://fabro.local",
    );

    expect(payload.embeds[0].title).toBe("Human approval needed");
    expect(payload.embeds[0].url).toBe("https://fabro.local/runs/01RUN");
    expect(payload.embeds[0].fields).toContainEqual({
      name: "Issue",
      value: "[#120](https://github.com/GetAlexandria/alexandria-internal/issues/120)",
      inline: true,
    });
    expect(payload.embeds[0].fields).toContainEqual({
      name: "Stage",
      value: "`Plan approval`",
      inline: true,
    });
  });

  test("builds human feedback received payloads", () => {
    const payload = buildDiscordPayload(
      {
        event: "stage_complete",
        run_id: "01RUN",
        workflow_name: "ax-feature",
        node_id: "approve",
        node_label: "Approve Plan",
        handler_type: "human",
        status: "succeeded",
      },
      inspect,
      "https://fabro.local",
    );

    expect(payload.embeds[0].title).toBe("Human feedback received");
    expect(payload.embeds[0].description).toBe(
      "Human feedback was received; workflow execution can continue.",
    );
    expect(payload.embeds[0].fields).toContainEqual({
      name: "Stage",
      value: "`Approve Plan`",
      inline: true,
    });
    expect(payload.embeds[0].fields).toContainEqual({
      name: "Result",
      value: "`succeeded`",
      inline: true,
    });
  });

  test("builds failure payloads with explicit descriptions", () => {
    const payload = buildDiscordPayload(
      {
        event: "stage_failed",
        run_id: "01RUN",
        workflow_name: "ax-feature",
        failure_reason: "pnpm failed",
      },
      inspect,
      "https://fabro.local/",
    );

    expect(payload.embeds[0].description).toBe("A workflow stage failed. See the reason below.");
    expect(payload.embeds[0].fields).toContainEqual({
      name: "Reason",
      value: "pnpm failed",
      inline: false,
    });
  });

  test("adds completion details and pull request links", () => {
    const payload = buildDiscordPayload(
      {
        event: "run_complete",
        run_id: "01RUN",
        workflow_name: "ax-feature",
      },
      inspect,
      "https://fabro.local",
      {
        number: 129,
        title: "Fix workflow",
        url: "https://github.com/GetAlexandria/alexandria-internal/pull/129",
      },
    );

    expect(payload.embeds[0].fields).toContainEqual({
      name: "Duration",
      value: "2m 5s",
      inline: true,
    });
    expect(payload.embeds[0].fields).toContainEqual({
      name: "Pull Request",
      value: "[#129 Fix workflow](https://github.com/GetAlexandria/alexandria-internal/pull/129)",
      inline: false,
    });
  });

  test("reports webhook HTTP failures without throwing", async () => {
    const payload = buildDiscordPayload(
      {
        event: "run_start",
        run_id: "01RUN",
        workflow_name: "ax-feature",
      },
      inspect,
      "https://fabro.local",
    );

    const result = await postWebhook(
      "https://discord.example/webhook",
      payload,
      5,
      async () => new Response("missing", { status: 404, statusText: "Not Found" }),
    );

    expect(result).toEqual({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });
    expect(formatWebhookDeliveryWarning(result)).toBe(
      "Discord webhook post failed: HTTP 404 Not Found",
    );
  });

  test("reports webhook network failures without throwing", async () => {
    const payload = buildDiscordPayload(
      {
        event: "run_start",
        run_id: "01RUN",
        workflow_name: "ax-feature",
      },
      inspect,
      "https://fabro.local",
    );

    const result = await postWebhook("https://discord.example/webhook", payload, 5, async () => {
      throw new Error("network down");
    });

    expect(result).toEqual({
      ok: false,
      error: "network down",
    });
    expect(formatWebhookDeliveryWarning(result)).toBe("Discord webhook post failed: network down");
  });
});
