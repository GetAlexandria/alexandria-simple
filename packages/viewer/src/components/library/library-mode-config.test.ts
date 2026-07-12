import { describe, expect, test } from "bun:test";
import { viewerSectionLibraryRootRequest } from "./library-mode-config";

describe("viewerSectionLibraryRootRequest", () => {
  test("defaults to the server-owned root with no draft patch-log param", () => {
    const request = viewerSectionLibraryRootRequest(new URLSearchParams());

    expect(request.libraryRoot).toBeUndefined();
    expect(request.draftPatchLog).toBeUndefined();
  });

  test("honors an explicit libraryRoot override and forces no overlay", () => {
    const request = viewerSectionLibraryRootRequest(
      new URLSearchParams({ libraryRoot: "studio/library" }),
    );

    expect(request.libraryRoot).toBe("studio/library");
    expect(request.draftPatchLog).toBeUndefined();
  });

  test("treats an empty libraryRoot param as no override (server-owned root)", () => {
    const request = viewerSectionLibraryRootRequest(new URLSearchParams({ libraryRoot: "" }));

    expect(request.libraryRoot).toBeUndefined();
    expect(request.draftPatchLog).toBeUndefined();
  });
});
