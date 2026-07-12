import { useEffect, useMemo, useState } from "react";
import * as Effect from "effect/Effect";
import { makeViewerRuntimeClient } from "./runtime/client";
import type { RuntimePlaybook } from "./runtime/schemas";
import {
  ALEXANDRIA_PRODUCT_NOTEPAD_ROOT,
  autoRefreshMsForSurface,
  catalogRequestFor,
  PMS_DRAFT_PATCH_LOG,
  PMS_LIBRARY_ROOT,
  SURFACE_TABS,
  surfaceBadgeForCatalog,
  surfaceFromLocation,
  type LibraryPmsSurface,
} from "./pms-surfaces";
import { EmptyLibraryView } from "../components/library/EmptyLibraryView";
import { useLibraryCatalog } from "../components/library/hooks/useLibraryCatalog";
import { DraftsView } from "../components/library/DraftsView";
import { NotepadView } from "../components/library/NotepadView";
import { StudioApp } from "../components/studio/StudioApp";

// The PMS viewer shell (PMS/Alexandria boundary migration, Slice 2). Four
// surfaces, all PMS QA views: the Studio (Board, Catalog, plays, live runs)
// plus fixed library lenses over PMS and Alexandria product sweeps. Alexandria data
// (playbook names, catalog reads) arrives via the pms server's read-only
// proxy of the Alexandria public API — when Alexandria is not running the
// Studio still works and the library lenses degrade with a retry panel.

function FixedLibrarySurface({
  onBadgeChange,
  surface,
}: {
  onBadgeChange(badge: number | null): void;
  surface: LibraryPmsSurface;
}) {
  const runtimeClient = useMemo(() => makeViewerRuntimeClient(), []);
  const request = useMemo(() => catalogRequestFor(surface), [surface]);
  const autoRefreshIntervalMs = autoRefreshMsForSurface(surface);
  const { catalog, error, refresh } = useLibraryCatalog(
    runtimeClient,
    undefined,
    true,
    request,
    autoRefreshIntervalMs == null ? {} : { autoRefreshIntervalMs },
  );
  const badge = useMemo(
    () => (catalog == null || error != null ? null : surfaceBadgeForCatalog(surface, catalog)),
    [catalog, error, surface],
  );

  useEffect(() => {
    onBadgeChange(badge);
    return () => onBadgeChange(null);
  }, [badge, onBadgeChange]);

  if (error != null) {
    return (
      <div className="m-7 border border-[#4b3827] bg-[#1c1712]/80 p-5 font-display text-[#d4a052]">
        <p className="mb-3">Library catalog unavailable: {error}</p>
        <button
          className="border border-[#4b3827] px-3 py-1 text-[#e8d5b5] hover:bg-[#31261a]"
          onClick={() => {
            void refresh();
          }}
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (catalog == null) {
    return (
      <div className="m-7 border border-[#4b3827] bg-[#1c1712]/80 p-5 font-display text-[#d4a052]">
        Loading library catalog
      </div>
    );
  }

  if (surface === "pms-drafts") {
    return <DraftsView catalog={catalog} emptyStatePatchLogPath={PMS_DRAFT_PATCH_LOG} />;
  }

  if (surface === "notepad") {
    return <NotepadView catalog={catalog} libraryRoot={ALEXANDRIA_PRODUCT_NOTEPAD_ROOT} />;
  }

  // Read-only lens: no runtimeClient and no refresh, so no confirm/edit
  // affordances (same contract the fixed Back surfaces always had).
  return <EmptyLibraryView catalog={catalog} emptyStatePath={PMS_LIBRARY_ROOT} />;
}

export function PmsApp() {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const surface = surfaceFromLocation(searchParams);
  const runtimeClient = useMemo(() => makeViewerRuntimeClient(), []);
  const [playbook, setPlaybook] = useState<RuntimePlaybook | null>(null);
  // Only one surface ever mounts, so one badge slot is enough; the mounted
  // surface reports it and resets it to null on unmount/surface change.
  const [activeBadge, setActiveBadge] = useState<number | null>(null);

  // Play names / tracker metadata decorate the Studio when Alexandria is up;
  // the Studio renders immediately either way.
  useEffect(() => {
    let cancelled = false;
    void Effect.runPromise(runtimeClient.getState)
      .then((state) => {
        if (!cancelled && state.playbook != null) {
          setPlaybook(state.playbook);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [runtimeClient]);

  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-6 border-b border-[#4b3827] bg-[#1c1712] px-6 py-3">
        <span className="font-display text-lg tracking-wide text-[#e8d5b5]">
          Play Maker&rsquo;s Studio
        </span>
        <nav className="flex items-center gap-2">
          {SURFACE_TABS.map((tab) => (
            <a
              className={
                tab.surface === surface
                  ? "inline-flex items-center gap-1.5 border border-[#d4a052] px-3 py-1 text-sm text-[#d4a052]"
                  : "inline-flex items-center gap-1.5 border border-transparent px-3 py-1 text-sm text-[#a08a6a] hover:text-[#e8d5b5]"
              }
              href={tab.href}
              key={tab.surface}
            >
              <span>{tab.label}</span>
              {tab.surface !== surface || activeBadge == null ? null : (
                <span
                  className="min-w-5 border border-current px-1.5 text-center font-mono text-[11px]"
                  data-testid={`surface-tab-badge-${tab.surface}`}
                >
                  {activeBadge}
                </span>
              )}
            </a>
          ))}
        </nav>
      </header>
      {surface === "studio" ? (
        <StudioApp playbook={playbook} searchParams={searchParams} />
      ) : (
        <FixedLibrarySurface onBadgeChange={setActiveBadge} surface={surface} />
      )}
    </div>
  );
}
