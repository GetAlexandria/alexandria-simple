import type { LibraryCatalogRequest } from "./runtime/client";
import type { LibraryCatalog } from "./runtime/schemas";
import { notepadBadgeCountForCatalog } from "../components/library/notepad-view-model";

export const PMS_LIBRARY_ROOT = "studio/sweeps/playmaker-studio";
export const PMS_DRAFT_PATCH_LOG = "studio/drafts/playmaker-studio/patches.json";
export const ALEXANDRIA_PRODUCT_NOTEPAD_ROOT = "docs/alexandria/library";

export type PmsSurface = "studio" | "pms-back" | "pms-drafts" | "notepad";
export type LibraryPmsSurface = Exclude<PmsSurface, "studio">;

export const SURFACE_TABS: readonly { href: string; label: string; surface: PmsSurface }[] = [
  { href: "/", label: "Studio", surface: "studio" },
  { href: "/?surface=pms-back", label: "PMS-Back", surface: "pms-back" },
  { href: "/?surface=pms-drafts", label: "PMS-Drafts", surface: "pms-drafts" },
  { href: "/?surface=notepad", label: "Notepad", surface: "notepad" },
];

export const FIXED_LIBRARY_AUTO_REFRESH_MS = 2_000;

export function surfaceFromLocation(searchParams: URLSearchParams): PmsSurface {
  const surface = searchParams.get("surface");
  return surface === "pms-back" || surface === "pms-drafts" || surface === "notepad"
    ? surface
    : "studio";
}

export function catalogRequestFor(surface: LibraryPmsSurface): LibraryCatalogRequest {
  switch (surface) {
    case "notepad":
      return { libraryRoot: ALEXANDRIA_PRODUCT_NOTEPAD_ROOT };
    case "pms-back":
      return { libraryRoot: PMS_LIBRARY_ROOT };
    case "pms-drafts":
      return { draftPatchLog: PMS_DRAFT_PATCH_LOG, libraryRoot: PMS_LIBRARY_ROOT };
  }
}

export function autoRefreshMsForSurface(surface: LibraryPmsSurface): number | undefined {
  return surface === "pms-drafts" || surface === "notepad"
    ? FIXED_LIBRARY_AUTO_REFRESH_MS
    : undefined;
}

export function surfaceBadgeForCatalog(
  surface: LibraryPmsSurface,
  catalog: LibraryCatalog,
): number | null {
  return surface === "notepad" ? notepadBadgeCountForCatalog(catalog) : null;
}
