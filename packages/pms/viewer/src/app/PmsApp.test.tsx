import { describe, expect, test } from "bun:test";
import {
  ALEXANDRIA_PRODUCT_NOTEPAD_ROOT,
  autoRefreshMsForSurface,
  catalogRequestFor,
  FIXED_LIBRARY_AUTO_REFRESH_MS,
  PMS_DRAFT_PATCH_LOG,
  PMS_LIBRARY_ROOT,
  SURFACE_TABS,
  surfaceBadgeForCatalog,
  surfaceFromLocation,
} from "./pms-surfaces";
import { sampleDurableNotepadCatalog } from "../components/library/notepad-test-fixtures";

describe("PMS app surface configuration", () => {
  test("keeps existing top-level tabs and adds Notepad as a sibling", () => {
    expect(SURFACE_TABS.map((tab) => tab.label)).toEqual([
      "Studio",
      "PMS-Back",
      "PMS-Drafts",
      "Notepad",
    ]);
    expect(SURFACE_TABS.map((tab) => tab.href)).toEqual([
      "/",
      "/?surface=pms-back",
      "/?surface=pms-drafts",
      "/?surface=notepad",
    ]);
  });

  test("parses Notepad while keeping unknown surfaces on Studio", () => {
    expect(surfaceFromLocation(new URLSearchParams("surface=notepad"))).toBe("notepad");
    expect(surfaceFromLocation(new URLSearchParams("surface=pms-back"))).toBe("pms-back");
    expect(surfaceFromLocation(new URLSearchParams("surface=pms-drafts"))).toBe("pms-drafts");
    expect(surfaceFromLocation(new URLSearchParams("surface=unknown"))).toBe("studio");
  });

  test("pins existing PMS catalog requests and adds the Alexandria Notepad root", () => {
    expect(catalogRequestFor("pms-back")).toEqual({ libraryRoot: PMS_LIBRARY_ROOT });
    expect(catalogRequestFor("pms-drafts")).toEqual({
      draftPatchLog: PMS_DRAFT_PATCH_LOG,
      libraryRoot: PMS_LIBRARY_ROOT,
    });
    expect(catalogRequestFor("notepad")).toEqual({
      libraryRoot: ALEXANDRIA_PRODUCT_NOTEPAD_ROOT,
    });
  });

  test("auto-refreshes Drafts and Notepad fixed surfaces", () => {
    expect(autoRefreshMsForSurface("pms-back")).toBeUndefined();
    expect(autoRefreshMsForSurface("pms-drafts")).toBe(FIXED_LIBRARY_AUTO_REFRESH_MS);
    expect(autoRefreshMsForSurface("notepad")).toBe(FIXED_LIBRARY_AUTO_REFRESH_MS);
  });

  test("derives only the Notepad tab badge from the Notepad model", () => {
    expect(surfaceBadgeForCatalog("notepad", sampleDurableNotepadCatalog)).toBe(2);
    expect(surfaceBadgeForCatalog("pms-back", sampleDurableNotepadCatalog)).toBeNull();
    expect(surfaceBadgeForCatalog("pms-drafts", sampleDurableNotepadCatalog)).toBeNull();
  });
});
