/**
 * Tests for canvas-server SSE delivery and step-save coalescing.
 *
 * The whole UX bet of the spike is "Raven wakes the right number of times."
 * These tests pin down (a) every subscriber receives every mutation as a
 * data: frame, (b) global mutations broadcast to subscribers on other steps,
 * (c) the 500ms step-save debounce coalesces double-clicks server-side
 * (closes the cross-watcher-cycle gap the formatter alone can't fix),
 * (d) a dropped subscriber doesn't break subsequent pushes.
 */

import { test, expect, describe, beforeEach, afterEach } from "bun:test";

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

interface Subscription {
  reader: ReadableStreamDefaultReader<Uint8Array>;
  decoder: TextDecoder;
  buffer: string;
  cancel: () => Promise<void>;
}

async function subscribe(step: string): Promise<Subscription> {
  const res = await fetch(`${server.baseUrl}/api/canvas-stream/${step}`);
  if (!res.body) throw new Error("no SSE body");
  const reader = res.body.getReader();
  return {
    reader,
    decoder: new TextDecoder(),
    buffer: "",
    async cancel() {
      try {
        await reader.cancel();
      } catch {
        // already closed
      }
    },
  };
}

// Read SSE frames until we have at least `n` data: lines, or timeout.
async function readDataFrames(
  sub: Subscription,
  n: number,
  timeoutMs = 3000,
): Promise<unknown[]> {
  const frames: unknown[] = [];
  const deadline = Date.now() + timeoutMs;
  while (frames.length < n && Date.now() < deadline) {
    const remaining = deadline - Date.now();
    const result = await Promise.race([
      sub.reader.read(),
      new Promise<{ done: true; value: undefined }>((resolve) =>
        setTimeout(() => resolve({ done: true, value: undefined }), remaining),
      ),
    ]);
    if (result.done) break;
    sub.buffer += sub.decoder.decode(result.value, { stream: true });
    // SSE frames are separated by "\n\n"; each frame is one or more "field: value" lines.
    let sep = sub.buffer.indexOf("\n\n");
    while (sep !== -1 && frames.length < n) {
      const frame = sub.buffer.slice(0, sep);
      sub.buffer = sub.buffer.slice(sep + 2);
      for (const line of frame.split("\n")) {
        if (line.startsWith("data: ")) {
          frames.push(JSON.parse(line.slice("data: ".length)));
        }
      }
      sep = sub.buffer.indexOf("\n\n");
    }
  }
  return frames;
}

describe("canvas-server SSE", () => {
  test("subscriber receives initial state frame on connect", async () => {
    const sub = await subscribe("1.2");
    const frames = await readDataFrames(sub, 1);
    expect(frames).toHaveLength(1);
    expect((frames[0] as { available?: boolean }).available).toBe(true);
    await sub.cancel();
  });

  test("one mutation pushes one new frame to one subscriber", async () => {
    const sub = await subscribe("1.2");
    await readDataFrames(sub, 1); // drain initial
    const r = await post("/api/canvas/recap/1.2", {
      text: "first recap",
      by: "director",
    });
    expect(r.status).toBe(200);
    const frames = await readDataFrames(sub, 1);
    expect(frames).toHaveLength(1);
    expect((frames[0] as { what_you_told_me?: string }).what_you_told_me).toBe(
      "first recap",
    );
    await sub.cancel();
  });

  test("two subscribers on the same step both receive the mutation (fan-out)", async () => {
    const subA = await subscribe("1.2");
    const subB = await subscribe("1.2");
    await readDataFrames(subA, 1);
    await readDataFrames(subB, 1);
    await post("/api/canvas/recap/1.2", {
      text: "broadcast me",
      by: "director",
    });
    const [framesA, framesB] = await Promise.all([
      readDataFrames(subA, 1),
      readDataFrames(subB, 1),
    ]);
    expect((framesA[0] as { what_you_told_me?: string }).what_you_told_me).toBe(
      "broadcast me",
    );
    expect((framesB[0] as { what_you_told_me?: string }).what_you_told_me).toBe(
      "broadcast me",
    );
    await subA.cancel();
    await subB.cancel();
  });

  test("global save broadcasts to subscribers on a different step", async () => {
    const sub = await subscribe("1.1");
    await readDataFrames(sub, 1); // drain initial
    await post("/api/canvas/save/1.2", { nextStep: "1.3" });
    const frames = await readDataFrames(sub, 1);
    expect(frames).toHaveLength(1);
    const nav = (frames[0] as { navigation?: { to?: string; from?: string } })
      .navigation;
    expect(nav?.from).toBe("1.2");
    expect(nav?.to).toBe("1.3");
    await sub.cancel();
  });

  test("double-clicked save coalesces server-side (one event, one frame)", async () => {
    const sub = await subscribe("1.1");
    await readDataFrames(sub, 1);

    // Fire two saves back-to-back. Without server-side debounce, both write
    // to step-events.jsonl and both fire notifyAllSteps → two frames.
    const [r1, r2] = await Promise.all([
      post("/api/canvas/save/1.1", { nextStep: "1.2" }),
      post("/api/canvas/save/1.1", { nextStep: "1.2" }),
    ]);
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    const body1 = (await r1.json()) as { coalesced?: boolean };
    const body2 = (await r2.json()) as { coalesced?: boolean };
    // Exactly one of the two should report coalesced (ordering depends on
    // which lands at the handler first).
    expect(Boolean(body1.coalesced) !== Boolean(body2.coalesced)).toBe(true);

    // And the subscriber sees one frame, not two.
    const frames = await readDataFrames(sub, 2, 1000);
    expect(frames).toHaveLength(1);
    await sub.cancel();
  });

  test("distinct saves to different next steps both go through (debounce key separates them)", async () => {
    const sub = await subscribe("1.1");
    await readDataFrames(sub, 1);

    const r1 = await post("/api/canvas/save/1.1", { nextStep: "1.2" });
    const r2 = await post("/api/canvas/save/1.1", { nextStep: "1.3" });
    expect((await r1.json()) as { coalesced?: boolean }).not.toHaveProperty(
      "coalesced",
    );
    expect((await r2.json()) as { coalesced?: boolean }).not.toHaveProperty(
      "coalesced",
    );
    const frames = await readDataFrames(sub, 2);
    expect(frames).toHaveLength(2);
    await sub.cancel();
  });

  test("subscriber disconnect doesn't break next mutation push", async () => {
    const subA = await subscribe("1.2");
    const subB = await subscribe("1.2");
    await readDataFrames(subA, 1);
    await readDataFrames(subB, 1);
    await subA.cancel();
    // Give the server a moment to process cancel.
    await Bun.sleep(100);
    // Mutation should not throw and subB should still receive.
    const r = await post("/api/canvas/recap/1.2", {
      text: "after disconnect",
      by: "raven",
    });
    expect(r.status).toBe(200);
    const framesB = await readDataFrames(subB, 1);
    expect((framesB[0] as { what_you_told_me?: string }).what_you_told_me).toBe(
      "after disconnect",
    );
    await subB.cancel();
  });

  test("mutation to a step with zero subscribers is a no-op (no error)", async () => {
    const r = await post("/api/canvas/recap/1.2", {
      text: "no one listening",
      by: "director",
    });
    expect(r.status).toBe(200);
    // Subscribe AFTER the mutation; initial frame should reflect the saved
    // recap, proving the mutation persisted even without subscribers.
    const sub = await subscribe("1.2");
    const frames = await readDataFrames(sub, 1);
    expect((frames[0] as { what_you_told_me?: string }).what_you_told_me).toBe(
      "no one listening",
    );
    await sub.cancel();
  });
});
