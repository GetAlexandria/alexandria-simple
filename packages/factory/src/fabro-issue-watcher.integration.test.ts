import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, chmod, mkdtemp, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import {
  parsePositiveInt,
  runIssueWatcherOnce,
  type WatcherConfig,
} from "./fabro-issue-watcher.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

interface FakeIssue {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  labels: Array<{ name: string }>;
}

interface FakeGitHub {
  readonly server: ReturnType<typeof Bun.serve>;
  readonly origin: string;
  readonly issue: FakeIssue;
  readonly comments: string[];
  readonly stop: () => void;
}

const createdServers: Array<ReturnType<typeof Bun.serve>> = [];

afterEach(() => {
  for (const server of createdServers.splice(0)) {
    server.stop(true);
  }
});

const createFakeGitHub = (labels: readonly string[]): FakeGitHub => {
  const comments: string[] = [];
  const issue: FakeIssue = {
    number: 120,
    title: "Validate local Fabro issue watcher",
    body: "Make sure duplicate submissions are prevented.",
    html_url: "https://github.com/GetAlexandria/alexandria-internal/issues/120",
    labels: labels.map((name) => ({ name })),
  };

  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      const url = new URL(request.url);

      if (
        request.method === "GET" &&
        url.pathname === "/repos/GetAlexandria/alexandria-internal/issues"
      ) {
        const requestedLabel = url.searchParams.get("labels");
        const hasRequestedLabel =
          requestedLabel === null || issue.labels.some((label) => label.name === requestedLabel);
        return Response.json(hasRequestedLabel ? [issue] : []);
      }

      if (
        request.method === "GET" &&
        url.pathname === "/repos/GetAlexandria/alexandria-internal/issues/120"
      ) {
        return Response.json(issue);
      }

      if (
        request.method === "PATCH" &&
        url.pathname === "/repos/GetAlexandria/alexandria-internal/issues/120"
      ) {
        const body = (await request.json()) as { labels: string[] };
        issue.labels = body.labels.map((name) => ({ name }));
        return Response.json(issue);
      }

      if (
        request.method === "POST" &&
        url.pathname === "/repos/GetAlexandria/alexandria-internal/issues/120/comments"
      ) {
        const body = (await request.json()) as { body: string };
        comments.push(body.body);
        return Response.json({ id: comments.length, body: body.body });
      }

      return new Response("not found", { status: 404 });
    },
  });
  createdServers.push(server);

  return {
    server,
    origin: `http://${server.hostname}:${server.port}`,
    issue,
    comments,
    stop: () => server.stop(true),
  };
};

const labelNames = (issue: FakeIssue): readonly string[] =>
  issue.labels.map((label) => label.name).sort();

const createFakeFabro = async (): Promise<{
  readonly binDir: string;
  readonly logPath: string;
}> => {
  const dir = await mkdtemp(join(tmpdir(), "fabro-watcher-test-"));
  const binDir = join(dir, "bin");
  await mkdir(binDir);
  const logPath = join(dir, "fabro.log");
  const fabroPath = join(binDir, "fabro");
  await Bun.write(
    fabroPath,
    `#!/usr/bin/env bash
set -euo pipefail
printf '%s\\n' "$*" >> "$FABRO_FAKE_LOG"
printf 'cwd=%s\\n' "$PWD" >> "$FABRO_FAKE_LOG"
if [ "$1" = "inspect" ]; then
  cat <<'JSON'
[{"run_spec":{"settings":{"run":{"goal":{"value":"GitHub Issue #120: Validate local Fabro issue watcher\\n\\nhttps://github.com/GetAlexandria/alexandria-internal/issues/120"}}}}}]
JSON
else
  echo "Run: 01KTESTFABRORUN0000000001"
fi
`,
  );
  await chmod(fabroPath, 0o755);
  return { binDir, logPath };
};

const configFor = (github: FakeGitHub): WatcherConfig => ({
  owner: "GetAlexandria",
  repo: "alexandria-internal",
  githubToken: "test-token",
  githubApiBaseUrl: github.origin,
  fabroServer: "http://127.0.0.1:3000",
  fabroWorkflowConfig: ".fabro/workflows/ax-feature/workflow.toml",
  fabroWebUrl: "https://fabro.local",
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
});

const withFakeFabroOnPath = async <T>(action: () => Promise<T>): Promise<T> => {
  const fakeFabro = await createFakeFabro();
  const previousPath = process.env.PATH;
  const previousLog = process.env.FABRO_FAKE_LOG;
  // This test mutates process-wide PATH; keep all fake-fabro assertions inside
  // this file so Bun's parallel test files do not accidentally shell out here.
  process.env.PATH = `${fakeFabro.binDir}:${previousPath ?? ""}`;
  process.env.FABRO_FAKE_LOG = fakeFabro.logPath;
  try {
    return await action();
  } finally {
    process.env.PATH = previousPath;
    if (previousLog === undefined) {
      delete process.env.FABRO_FAKE_LOG;
    } else {
      process.env.FABRO_FAKE_LOG = previousLog;
    }
  }
};

const readFabroLogLines = async (): Promise<readonly string[]> => {
  const logPath = process.env.FABRO_FAKE_LOG;
  if (logPath === undefined) {
    return [];
  }
  const text = await readFile(logPath, "utf8").catch(() => "");
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

describe("Fabro issue watcher integration", () => {
  test("falls back for invalid numeric environment values", () => {
    const warnings: string[] = [];
    expect(parsePositiveInt("60", 10, "TEST_SECONDS")).toBe(60);
    expect(parsePositiveInt("60s", 10, "TEST_SECONDS", (message) => warnings.push(message))).toBe(
      10,
    );
    expect(parsePositiveInt("0", 10, "TEST_SECONDS", (message) => warnings.push(message))).toBe(10);
    expect(warnings).toHaveLength(2);
  });

  test("claims ready issues, submits exactly once, and comments with the run link", async () => {
    const github = createFakeGitHub(["fabro:ready"]);
    const config = configFor(github);

    await withFakeFabroOnPath(async () => {
      const first = await runIssueWatcherOnce(config, { log: () => undefined });
      expect(first).toEqual({ submitted: 1, skipped: 0, failed: 0 });
      expect(labelNames(github.issue)).toEqual(["fabro:submitted"]);
      expect(github.comments).toEqual([
        "Fabro local run submitted: https://fabro.local/runs/01KTESTFABRORUN0000000001",
      ]);
      const firstLog = await readFabroLogLines();
      expect(firstLog).toHaveLength(2);
      expect(firstLog[1]).toBe(`cwd=${repoRoot}`);
      expect(firstLog[1]).not.toContain("packages/factory");

      const second = await runIssueWatcherOnce(config, {
        log: () => undefined,
      });
      expect(second).toEqual({ submitted: 0, skipped: 0, failed: 0 });
      expect(labelNames(github.issue)).toEqual(["fabro:submitted"]);
      expect(github.comments).toHaveLength(1);
      expect(await readFabroLogLines()).toHaveLength(2);
    });
  });

  test("does not submit an issue that still has ready but already has a Fabro state", async () => {
    const github = createFakeGitHub(["fabro:ready", "fabro:submitted"]);
    const config = configFor(github);

    await withFakeFabroOnPath(async () => {
      const result = await runIssueWatcherOnce(config, {
        log: () => undefined,
      });
      expect(result).toEqual({ submitted: 0, skipped: 1, failed: 0 });
      expect(labelNames(github.issue)).toEqual(["fabro:ready", "fabro:submitted"]);
      expect(github.comments).toHaveLength(0);
      expect(await readFabroLogLines()).toHaveLength(0);
    });
  });

  test("marks claimed issues failed when Fabro submission fails", async () => {
    const github = createFakeGitHub(["fabro:ready"]);
    const config = configFor(github);
    const messages: string[] = [];

    const result = await runIssueWatcherOnce(config, {
      submitRun: async () => {
        throw new Error("synthetic Fabro failure");
      },
      log: (message) => messages.push(message),
      errorLog: () => undefined,
    });

    expect(result).toEqual({ submitted: 0, skipped: 0, failed: 1 });
    expect(labelNames(github.issue)).toEqual(["fabro:failed"]);
    expect(github.comments).toHaveLength(1);
    expect(github.comments[0]).toContain("Fabro local run submission failed.");
    expect(github.comments[0]).toContain("synthetic Fabro failure");
    expect(messages.some((message) => message.includes("issue #120"))).toBe(true);
  });
});
