import { describe, expect, test } from "bun:test";
import {
  ravenConnectionsFromSummary,
  ravenConnectionStateFromSummary,
} from "./useRavenConnectionState";

describe("ravenConnectionStateFromSummary", () => {
  test("connects for an active default Claude Code plugin monitor lease", () => {
    expect(
      ravenConnectionStateFromSummary({
        connections: [
          {
            active: true,
            connectionId: "host:claude-code:default",
            delivery: { host: "claude-code", mode: "plugin-monitor" },
          },
        ],
      }),
    ).toBe("connected");
  });

  test("returns active default Claude Code plugin monitor rows for the Knowledge Bank list", () => {
    expect(
      ravenConnectionsFromSummary({
        connections: [
          {
            active: true,
            connectionId: "host:claude-code:default",
            delivery: { host: "claude-code", mode: "plugin-monitor" },
          },
        ],
      }).map((connection) => connection.connectionId),
    ).toEqual(["host:claude-code:default"]);
  });

  test("ignores inactive default Claude Code plugin monitor leases", () => {
    const summary = {
      connections: [
        {
          active: false,
          connectionId: "host:claude-code:default",
          delivery: { host: "claude-code", mode: "plugin-monitor" },
        },
      ],
    };

    expect(ravenConnectionStateFromSummary(summary)).toBe("disconnected");
    expect(ravenConnectionsFromSummary(summary)).toEqual([]);
  });

  test("connects for an active Freeq Raven room bot connection", () => {
    expect(
      ravenConnectionStateFromSummary({
        connections: [
          {
            active: true,
            connectionId: "host:freeq-raven:alexandria",
            delivery: { host: "freeq-raven", mode: "room-bot" },
          },
        ],
      }),
    ).toBe("connected");
  });

  test("connects for an active Raven owner outside Freeq", () => {
    expect(
      ravenConnectionStateFromSummary({
        connections: [
          {
            active: true,
            connectionId: "host:codex:vision-review",
            delivery: { host: "codex", mode: "host-adapter" },
            owner: { host: "codex", kind: "agent", name: "Raven" },
          },
        ],
      }),
    ).toBe("connected");
  });

  test("ignores inactive Raven leases", () => {
    const summary = {
      connections: [
        {
          active: false,
          connectionId: "host:freeq-raven:alexandria",
          delivery: { host: "freeq-raven", mode: "room-bot" },
        },
      ],
    };

    expect(ravenConnectionStateFromSummary(summary)).toBe("disconnected");
    expect(ravenConnectionsFromSummary(summary)).toEqual([]);
  });

  test("ignores active Claude Code default leases without plugin-monitor delivery mode", () => {
    const summary = {
      connections: [
        {
          active: true,
          connectionId: "host:claude-code:default",
          delivery: { host: "claude-code", mode: "host-adapter" },
        },
      ],
    };

    expect(ravenConnectionStateFromSummary(summary)).toBe("disconnected");
    expect(ravenConnectionsFromSummary(summary)).toEqual([]);
  });

  test("ignores active Claude Code plugin-monitor delivery on non-host connection ids", () => {
    const summary = {
      connections: [
        {
          active: true,
          connectionId: "viewer:claude-code:default",
          delivery: { host: "claude-code", mode: "plugin-monitor" },
        },
      ],
    };

    expect(ravenConnectionStateFromSummary(summary)).toBe("disconnected");
    expect(ravenConnectionsFromSummary(summary)).toEqual([]);
  });

  test("returns only active Raven connection rows for the Knowledge Bank list", () => {
    expect(
      ravenConnectionsFromSummary({
        connections: [
          {
            active: true,
            connectionId: "host:claude-code:default",
            delivery: { host: "claude-code", mode: "plugin-monitor" },
          },
          {
            active: false,
            connectionId: "host:codex:raven-reviewer",
            delivery: { host: "codex", mode: "host-adapter" },
          },
          {
            active: true,
            connectionId: "host:codex:reviewer",
            delivery: { host: "codex", mode: "host-adapter" },
          },
        ],
      }).map((connection) => connection.connectionId),
    ).toEqual(["host:claude-code:default"]);
  });
});
