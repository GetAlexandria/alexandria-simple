import { afterEach, describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
  connectionPathForWorkspacePath,
  subscriptionPathForWorkspacePath,
} from "../src/domain/paths.js";
import { createConnectionLease, createWakeSubscription } from "../src/domain/wake-subscriptions.js";
import {
  listConnectionLeases,
  listWakeSubscriptions,
  readWakeSubscription,
  writeConnectionLease,
  writeWakeSubscription,
} from "../src/effects/runtime-registry.js";

const tempDirs: string[] = [];

function makeWorkspace(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-runtime-registry-"));
  tempDirs.push(dir);
  return join(dir, "docs/alexandria");
}

function unwrap<T>(value: T | Error): T {
  if (value instanceof Error) {
    throw value;
  }
  return value;
}

function subscription(subscriptionId: string, now = "2026-05-22T00:00:00.000Z") {
  return unwrap(
    createWakeSubscription({
      connectionId: "host:claude-code:registry",
      eventTypes: ["canvas.review.requested"],
      host: "claude-code",
      now,
      subscriptionId,
    }),
  );
}

function lease(connectionId: string, now = "2026-05-22T00:00:00.000Z") {
  return unwrap(
    createConnectionLease({
      connectionId,
      cursorId: "host:claude-code:registry",
      expiresAt: "2026-05-22T00:01:00.000Z",
      host: "claude-code",
      now,
      pid: process.pid,
    }),
  );
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("runtime registry", () => {
  test("returns null and empty lists for missing registry files", async () => {
    const workspacePath = makeWorkspace();

    await expect(
      Effect.runPromise(
        readWakeSubscription({
          subscriptionId: "host:claude-code:missing",
          workspacePath,
        }),
      ),
    ).resolves.toBeNull();
    await expect(Effect.runPromise(listWakeSubscriptions({ workspacePath }))).resolves.toEqual({
      entries: [],
      warnings: [],
    });
    await expect(Effect.runPromise(listConnectionLeases({ workspacePath }))).resolves.toEqual({
      entries: [],
      warnings: [],
    });
  });

  test("lists subscriptions in deterministic file order", async () => {
    const workspacePath = makeWorkspace();
    await Effect.runPromise(
      writeWakeSubscription({
        subscription: subscription("host:claude-code:b"),
        workspacePath,
      }),
    );
    await Effect.runPromise(
      writeWakeSubscription({
        subscription: subscription("host:claude-code:a"),
        workspacePath,
      }),
    );

    const listed = await Effect.runPromise(listWakeSubscriptions({ workspacePath }));

    expect(listed.warnings).toEqual([]);
    expect(listed.entries.map((entry) => entry.subscriptionId)).toEqual([
      "host:claude-code:a",
      "host:claude-code:b",
    ]);
  });

  test("skips malformed registry entries and returns warnings", async () => {
    const workspacePath = makeWorkspace();
    await Effect.runPromise(
      writeWakeSubscription({
        subscription: subscription("host:claude-code:valid"),
        workspacePath,
      }),
    );
    writeFileSync(
      subscriptionPathForWorkspacePath(workspacePath, "host:claude-code:bad"),
      "{ bad json",
      "utf8",
    );
    await Effect.runPromise(
      writeConnectionLease({
        lease: lease("host:claude-code:valid:plugin-monitor:1:abc"),
        workspacePath,
      }),
    );
    writeFileSync(
      connectionPathForWorkspacePath(workspacePath, "host:claude-code:bad:plugin-monitor:1:abc"),
      "{ bad json",
      "utf8",
    );

    const subscriptions = await Effect.runPromise(listWakeSubscriptions({ workspacePath }));
    const connections = await Effect.runPromise(listConnectionLeases({ workspacePath }));

    expect(subscriptions.entries).toHaveLength(1);
    expect(subscriptions.warnings).toHaveLength(1);
    expect(subscriptions.warnings[0]!.message).toContain("Invalid wake subscription");
    expect(connections.entries).toHaveLength(1);
    expect(connections.warnings).toHaveLength(1);
    expect(connections.warnings[0]!.message).toContain("Invalid connection lease");
  });

  test("rejects registry entries whose file id does not match content id", async () => {
    const workspacePath = makeWorkspace();
    await Effect.runPromise(
      writeWakeSubscription({
        subscription: subscription("host:claude-code:valid"),
        workspacePath,
      }),
    );
    writeFileSync(
      subscriptionPathForWorkspacePath(workspacePath, "host:claude-code:mismatch"),
      `${JSON.stringify(subscription("host:claude-code:other"), null, 2)}\n`,
      "utf8",
    );

    await expect(
      Effect.runPromise(
        readWakeSubscription({
          subscriptionId: "host:claude-code:mismatch",
          workspacePath,
        }),
      ),
    ).rejects.toThrow("does not match file id host:claude-code:mismatch");

    await Effect.runPromise(
      writeConnectionLease({
        lease: lease("host:claude-code:valid:plugin-monitor:1:abc"),
        workspacePath,
      }),
    );
    writeFileSync(
      connectionPathForWorkspacePath(
        workspacePath,
        "host:claude-code:mismatch:plugin-monitor:1:abc",
      ),
      `${JSON.stringify(lease("host:claude-code:other:plugin-monitor:1:abc"), null, 2)}\n`,
      "utf8",
    );

    const subscriptions = await Effect.runPromise(listWakeSubscriptions({ workspacePath }));
    const connections = await Effect.runPromise(listConnectionLeases({ workspacePath }));

    expect(subscriptions.entries.map((entry) => entry.subscriptionId)).toEqual([
      "host:claude-code:valid",
    ]);
    expect(subscriptions.warnings[0]!.message).toContain(
      "does not match file id host:claude-code:mismatch",
    );
    expect(connections.entries.map((entry) => entry.connectionId)).toEqual([
      "host:claude-code:valid:plugin-monitor:1:abc",
    ]);
    expect(connections.warnings[0]!.message).toContain(
      "does not match file id host:claude-code:mismatch:plugin-monitor:1:abc",
    );
  });

  test("overwrites registry files atomically without leaving temp files", async () => {
    const workspacePath = makeWorkspace();
    const first = subscription("host:claude-code:atomic", "2026-05-22T00:00:00.000Z");
    const second = subscription("host:claude-code:atomic", "2026-05-22T00:00:01.000Z");

    await Effect.runPromise(writeWakeSubscription({ subscription: first, workspacePath }));
    await Effect.runPromise(writeWakeSubscription({ subscription: second, workspacePath }));

    const path = subscriptionPathForWorkspacePath(workspacePath, "host:claude-code:atomic");
    expect(JSON.parse(readFileSync(path, "utf8")).updatedAt).toBe("2026-05-22T00:00:01.000Z");
    expect(readdirSync(join(workspacePath, ".runtime/subscriptions"))).toEqual([
      "host:claude-code:atomic.json",
    ]);
  });

  test("does not surface torn reads while leases are refreshed", async () => {
    const workspacePath = makeWorkspace();
    const connectionId = "host:claude-code:registry:plugin-monitor:1:stable";

    await Promise.all(
      Array.from({ length: 25 }, async (_, index) => {
        await Effect.runPromise(
          writeConnectionLease({
            lease: lease(connectionId, `2026-05-22T00:00:${String(index).padStart(2, "0")}.000Z`),
            workspacePath,
          }),
        );
        const listed = await Effect.runPromise(listConnectionLeases({ workspacePath }));
        expect(listed.warnings).toEqual([]);
      }),
    );
  });

  test("overwrites the lease for the same connection", async () => {
    const workspacePath = makeWorkspace();
    const connectionId = "host:claude-code:registry";

    await Effect.runPromise(
      writeConnectionLease({
        lease: lease(connectionId, "2026-05-22T00:00:00.000Z"),
        workspacePath,
      }),
    );
    await Effect.runPromise(
      writeConnectionLease({
        lease: lease(connectionId, "2026-05-22T00:00:01.000Z"),
        workspacePath,
      }),
    );

    const connections = await Effect.runPromise(listConnectionLeases({ workspacePath }));

    expect(connections.warnings).toEqual([]);
    expect(connections.entries.map((entry) => entry.connectionId)).toEqual([connectionId]);
    expect(connections.entries[0]!.updatedAt).toBe("2026-05-22T00:00:01.000Z");
  });
});
