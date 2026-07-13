import { describe, expect, test } from "bun:test";
import { ViewerHttpError, ViewerNetworkError } from "../../../app/runtime/errors";
import { saveErrorFromRuntimeError } from "./useMapState";

// The interactive save/load race in useMapState itself (saveState aborting
// an in-flight load) needs a DOM/act harness this repo's bun tests don't
// carry (component tests render static markup only), so these tests pin the
// pure copy-routing contract instead.
describe("saveErrorFromRuntimeError", () => {
  test("routes a 409 to conflict copy, preferring the server's structured message", () => {
    const structured = saveErrorFromRuntimeError(
      new ViewerHttpError(
        409,
        "Conflict",
        JSON.stringify({
          error: { code: "map_state_conflict", message: "The map state changed. Refresh." },
        }),
      ),
    );
    expect(structured).toEqual({ kind: "conflict", message: "The map state changed. Refresh." });

    const unparseable = saveErrorFromRuntimeError(new ViewerHttpError(409, "Conflict", "gateway"));
    expect(unparseable.kind).toBe("conflict");
    expect(unparseable.message).toContain("Refresh the map");
  });

  test("never applies conflict copy to a non-409 with an unparseable body (e.g. proxy HTML)", () => {
    const badGateway = saveErrorFromRuntimeError(
      new ViewerHttpError(502, "Bad Gateway", "<html>upstream error</html>"),
    );
    expect(badGateway.kind).toBe("error");
    expect(badGateway.message).not.toContain("Refresh the map");
    expect(badGateway.message).not.toContain("map changed");
  });

  test("surfaces a non-409 structured server message (e.g. a 400 validation rejection)", () => {
    const rejected = saveErrorFromRuntimeError(
      new ViewerHttpError(
        400,
        "Bad Request",
        JSON.stringify({
          error: { code: "map_state_invalid", message: "duplicate position at hex (0,-2)" },
        }),
      ),
    );
    expect(rejected).toEqual({ kind: "error", message: "duplicate position at hex (0,-2)" });
  });

  test("falls back to the generic runtime copy for non-HTTP failures", () => {
    const network = saveErrorFromRuntimeError(new ViewerNetworkError(new Error("offline")));
    expect(network.kind).toBe("error");
    expect(network.message.length).toBeGreaterThan(0);
    expect(network.message).not.toContain("Refresh the map");
  });
});
