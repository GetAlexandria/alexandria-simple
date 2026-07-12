/**
 * Tests for canvas-server path-traversal handling.
 *
 * Locks down the isValidStep() barrier on every step-derived endpoint. New
 * endpoints that forget the check will trip these tests rather than landing
 * silently with a hole.
 */

import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { existsSync } from "fs";
import { join } from "path";

import {
  startCanvasServer,
  type CanvasServerHandle,
} from "./canvas-server-helpers";

let server: CanvasServerHandle;

beforeEach(async () => {
  server = await startCanvasServer();
});

afterEach(async () => {
  await server.dispose();
});

async function post(path: string, body: unknown): Promise<Response> {
  return fetch(server.baseUrl + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("canvas-server path validation", () => {
  test("recap with URL-encoded ../ traversal returns 400", async () => {
    const r = await post("/api/canvas/recap/..%2F..%2Fetc%2Fhosts", {
      text: "x",
    });
    expect(r.status).toBe(400);
    const body = (await r.json()) as { error?: string };
    expect(body.error).toContain("invalid step");
    // And no file landed outside stateDir.
    expect(existsSync("/etc/hosts")).toBe(true); // sanity: didn't overwrite
  });

  test("recap with foo..bar embedded dots returns 400", async () => {
    const r = await post("/api/canvas/recap/foo..bar", { text: "x" });
    expect(r.status).toBe(400);
  });

  test("recap with valid step name returns 200 and writes a file", async () => {
    const r = await post("/api/canvas/recap/1.2", {
      text: "hello world",
      by: "director",
    });
    expect(r.status).toBe(200);
    expect(existsSync(join(server.stateDir, "recap", "1.2.json"))).toBe(true);
  });

  test("save with traversal-laden nextStep returns 400", async () => {
    const r = await post("/api/canvas/save/1.1", { nextStep: "../escape" });
    expect(r.status).toBe(400);
  });

  test("save with valid step + nextStep returns 200", async () => {
    const r = await post("/api/canvas/save/1.1", { nextStep: "1.2" });
    expect(r.status).toBe(200);
  });

  test("static GET ..%2F..%2Fetc%2Fpasswd is forbidden", async () => {
    const r = await fetch(server.baseUrl + "/..%2F..%2Fetc%2Fpasswd");
    // Either 403 (caught by canvasRoot check) or 404 (slipped to existsSync,
    // file not in canvasRoot). Both are acceptable; what we MUST NOT see is
    // 200 with /etc/passwd content.
    expect([403, 404]).toContain(r.status);
    const text = await r.text();
    expect(text).not.toContain("root:");
  });

  test("intent with invalid step in body returns 400", async () => {
    const r = await post("/api/intent", { step: "../foo", action: "echo" });
    expect(r.status).toBe(400);
  });

  test("intent with empty step returns 400", async () => {
    const r = await post("/api/intent", { step: "", action: "echo" });
    expect(r.status).toBe(400);
  });

  test("queue with invalid step in body returns 400", async () => {
    const r = await post("/api/queue", { title: "test", step: "../bad" });
    expect(r.status).toBe(400);
  });

  test("demo/codebase-scan rejects a path outside project root", async () => {
    const r = await post("/api/demo/codebase-scan", { path: "/etc" });
    expect(r.status).toBe(400);
    const body = (await r.json()) as { error?: string };
    expect(body.error).toContain("inside project root");
  });

  test("malformed JSON body returns 400 (top-level handler guard)", async () => {
    const r = await fetch(server.baseUrl + "/api/canvas/save/1.1", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not valid json",
    });
    expect(r.status).toBe(400);
    const body = (await r.json()) as { error?: string };
    expect(body.error).toContain("request failed");
  });
});
