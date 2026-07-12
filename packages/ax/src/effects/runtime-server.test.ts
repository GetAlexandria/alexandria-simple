import { describe, expect, test } from "bun:test";
import { LibraryGateError } from "../domain/library-confirmation.js";
import {
  isLibraryGateParamPresent,
  libraryCardDetailHttpStatus,
  libraryGraphHttpStatus,
} from "./runtime-server.js";

// The library-endpoint HTTP status classifier must key off error *type*, not
// error *message* — every viewer request carries a libraryRoot under
// docs/alexandria/library, so a message-based regex flags
// nearly any error (including raw Node FS errors whose message embeds that
// path, e.g. an EACCES) as a 400. Only errors the loaders actually raise as
// LibraryGateError for genuine client-input problems should map to 400.
describe("libraryGraphHttpStatus / libraryCardDetailHttpStatus", () => {
  test("a LibraryGateError maps to 400 when root-aware (today's pinned 400s stay 400)", () => {
    const error = new LibraryGateError(
      "libraryRoot must be within the project root: docs/alexandria/library",
    );

    expect(libraryGraphHttpStatus(error, true)).toBe(400);
    expect(libraryCardDetailHttpStatus(error, error.message, true)).toBe(400);
  });

  test("an untyped error whose message contains a gate keyword/root path is NOT a 400", () => {
    // Simulates a raw Node FS error (e.g. EACCES) whose message happens to
    // embed the libraryRoot path, which contains "product". This must never
    // be misclassified as a client-input problem.
    const error = new Error(
      "EACCES: permission denied, open 'docs/alexandria/library/product/Surface - Product Home.md'",
    );

    expect(libraryGraphHttpStatus(error, true)).toBe(500);
    expect(libraryCardDetailHttpStatus(error, error.message, true)).toBe(500);
  });

  test("a genuine LibraryGateError validation failure still maps to 400", () => {
    const error = new LibraryGateError("draftPatchLog must not be under the libraryRoot: x");

    expect(libraryGraphHttpStatus(error, true)).toBe(400);
  });

  test("card-detail 'not found' keeps its 404 regardless of error type", () => {
    const error = new Error("Library card not found: Surface - Missing");

    expect(libraryCardDetailHttpStatus(error, error.message, true)).toBe(404);
    expect(libraryCardDetailHttpStatus(error, error.message, false)).toBe(404);
  });

  test("a non-root-aware request never applies the gate mapping, even for a LibraryGateError", () => {
    const error = new LibraryGateError("Bundle path is required.");

    expect(libraryGraphHttpStatus(error, false)).toBe(500);
  });
});

// The rootAware computation in runtime-server must agree with the loaders'
// own `.length > 0` gate (library-graph-loader.ts), so `?libraryRoot=` (an
// empty string) is indistinguishable from the param being absent.
describe("isLibraryGateParamPresent", () => {
  test("null is absent", () => {
    expect(isLibraryGateParamPresent(null)).toBe(false);
  });

  test("empty string is absent, matching the loaders' `.length > 0` gate", () => {
    expect(isLibraryGateParamPresent("")).toBe(false);
  });

  test("a non-empty string is present", () => {
    expect(isLibraryGateParamPresent("docs/alexandria/library")).toBe(true);
  });
});
