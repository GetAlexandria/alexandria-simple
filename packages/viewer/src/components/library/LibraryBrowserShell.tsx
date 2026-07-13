import type { ReactNode } from "react";
import type { RuntimeAgent } from "../../app/runtime/schemas";
import type { LibraryBundle } from "./library-bundle-registry";
import { FIXED_LIBRARY_MODE_CONFIGS } from "./library-mode-config";
import { RavenBench } from "./RavenBench";
import { sectionForLibraryMode, type LibrarySection } from "./viewer-routes";
import { StoneTopBar } from "./StoneTopBar";
import type { LibraryBrowserView, LibraryViewMode, RavenConnectionState } from "./types";
import { BuilderBundleSelector } from "./BuilderBundleSelector";

// Viewer-section order is the frozen contract (issue #611): Index (default) ·
// Catalog · Workflow · Constellation · Engine · Folders. Builder-section
// surfaces (issue #613): Back · Drafts · Notepad · Confirm, as mode tabs
// under the bundle selector — Back/Drafts were
// previously labeled "Alexandria Back"/"Alexandria Drafts" (their route/mode
// ids are unchanged, only the on-screen label shortened once the selector
// makes the bundle explicit); Confirm is the old Empty Library tab, re-homed
// (the `empty` mode/route are unchanged); Notepad is the Builder notepad
// lens. The `empty` mode kept no tab pre-#613 (its direct URL still rendered);
// it regains one here, relabeled.
const LIBRARY_MODE_TABS: Array<{
  label: string;
  minWidthClass: string;
  mode: LibraryViewMode;
}> = [
  { label: "Index", minWidthClass: "min-w-[110px]", mode: "index" },
  { label: "Catalog", minWidthClass: "min-w-[122px]", mode: "catalog" },
  { label: "Workflow", minWidthClass: "min-w-[132px]", mode: "workflow" },
  { label: "Constellation", minWidthClass: "min-w-[168px]", mode: "constellation" },
  { label: "Engine", minWidthClass: "min-w-[118px]", mode: "engine" },
  { label: "Folders", minWidthClass: "min-w-[118px]", mode: "folders" },
  ...FIXED_LIBRARY_MODE_CONFIGS.map((config) => ({
    label: config.label,
    minWidthClass: config.minWidthClass,
    mode: config.mode,
  })),
  { label: "Notepad", minWidthClass: "min-w-[118px]", mode: "notepad" },
  // Naming note for test authors: the Confirm surface's own EL4 gate
  // (GatePanel, EmptyLibraryView.tsx) renders its own button also labeled
  // "Confirm" when a bundle's gate is active. That button lives inside the
  // Empty Library workbench (the section's `children`), a sibling of this
  // tab strip, not a descendant — so a locator scoped to the gate/workbench
  // container stays unambiguous; only an unscoped page-wide
  // getByRole("button", { name: "Confirm" }) would collide.
  { label: "Confirm", minWidthClass: "min-w-[118px]", mode: "empty" },
];

const LIBRARY_SECTION_TABS: Array<{ label: string; section: LibrarySection }> = [
  { label: "Library", section: "viewer" },
  { label: "Builder", section: "builder" },
];

function LibrarySectionTab({
  active,
  badgeCount,
  label,
  onClick,
}: {
  active: boolean;
  badgeCount?: number;
  label: string;
  onClick(): void;
}) {
  return (
    <button
      aria-selected={active}
      className={[
        "flex h-[34px] min-w-[104px] items-center justify-center gap-2 border px-5 font-display text-[13px] lowercase tracking-[0.15em]",
        active ? "border-[#d4a052] bg-[#3a2c1d] text-[#d4a052]" : "border-[#4b3827] text-[#a3907a]",
      ].join(" ")}
      onClick={onClick}
      role="tab"
      type="button"
    >
      {label}
      {badgeCount != null && badgeCount > 0 ? (
        <span
          className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-[#d4a052] bg-[#241b13] px-1 font-mono text-[10px] normal-case tracking-normal text-[#e8b86d]"
          data-testid="builder-notepad-badge"
        >
          {badgeCount}
        </span>
      ) : null}
    </button>
  );
}

function LibraryModeTab({
  active,
  label,
  minWidthClass,
  onClick,
}: {
  active: boolean;
  label: string;
  minWidthClass: string;
  onClick(): void;
}) {
  return (
    <button
      className={[
        "h-[38px] border px-5 font-display text-[15px] tracking-[0.15em]",
        minWidthClass,
        active
          ? "border-[#e8b86d] text-[#e8b86d] shadow-[0_0_0_2px_rgba(232,184,109,0.32)]"
          : "border-[#57422c] text-[#8c7b67]",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

interface LibraryBrowserShellProps {
  // "dev-map" is excluded: the shell has no branch for it, so the type forces
  // LibraryBrowserApp's early return to keep the dev route outside the chrome.
  activeView: Exclude<LibraryBrowserView, "dev-map">;
  agents?: RuntimeAgent[];
  children: ReactNode;
  // The Builder section tab's Notepad burndown badge (issue #613): always the
  // FIRST/DEFAULT bundle's count, one number on the section tab — never a
  // per-selected-bundle chip. Omitted/0 renders no badge.
  builderNotepadBadgeCount?: number;
  // The bundle registry + current selection for the Builder's selector
  // (issue #613). Undefined when the registry failed to parse; the selector
  // itself is omitted in that case (the active builder surface shows the
  // registry-unavailable empty state instead).
  builderSelectedBundleId?: string;
  builderBundles?: readonly LibraryBundle[];
  // An unresolved `?bundle=` id: passed through to BuilderBundleSelector so
  // it renders an explicit "Unknown bundle: <id>" placeholder option instead
  // of a blank/mismatched controlled-select value.
  builderUnknownBundleId?: string;
  mode: LibraryViewMode;
  onHome(): void;
  onInfo(): void;
  onLibrary(): void;
  onMap(): void;
  onAgent(agentId: string): void;
  onBundleSelect(bundleId: string): void;
  onFrameProblem(): void;
  onKnowledgeBank(): void;
  onLedger(): void;
  onModeChange(mode: LibraryViewMode): void;
  onPlaybook(): void;
  onSectionChange(section: LibrarySection): void;
  ravenActionRequest: number;
  ravenConnectionState: RavenConnectionState;
}

export function LibraryBrowserShell({
  activeView,
  agents = [],
  builderBundles = [],
  builderNotepadBadgeCount,
  builderSelectedBundleId,
  builderUnknownBundleId,
  children,
  mode,
  onHome,
  onInfo,
  onLibrary,
  onMap,
  onAgent,
  onBundleSelect,
  onFrameProblem,
  onKnowledgeBank,
  onLedger,
  onModeChange,
  onPlaybook,
  onSectionChange,
  ravenActionRequest,
  ravenConnectionState,
}: LibraryBrowserShellProps) {
  const activeSection = sectionForLibraryMode(mode);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#241b13] text-[#e8e0d4]">
      <StoneTopBar
        activeTab={activeView}
        onHome={onHome}
        onInfo={onInfo}
        onLedger={onLedger}
        onLibrary={onLibrary}
        onMap={onMap}
        onPlaybook={onPlaybook}
      />
      <main className="pb-[280px]">
        {activeView === "library" ? (
          <>
            <section className="border-b border-[#4b3827]/80 bg-[linear-gradient(180deg,rgba(44,34,25,0.94),rgba(30,23,17,0.92))] shadow-[inset_0_-1px_0_rgba(255,230,180,0.04)]">
              <div className="flex h-[58px] items-center px-6">
                <h1 className="font-display text-[28px] font-normal lowercase tracking-[0.08em] text-[#d4a052]">
                  library
                </h1>
              </div>
              <div
                className="flex min-h-[42px] flex-wrap items-end gap-2 border-b border-[#3b2c20]/70 px-4 pb-2 sm:px-7"
                role="tablist"
              >
                {LIBRARY_SECTION_TABS.map((tab) => (
                  <LibrarySectionTab
                    active={activeSection === tab.section}
                    badgeCount={tab.section === "builder" ? builderNotepadBadgeCount : undefined}
                    key={tab.section}
                    label={tab.label}
                    onClick={() => onSectionChange(tab.section)}
                  />
                ))}
              </div>
              {activeSection === "builder" && builderBundles.length > 0 ? (
                <div className="flex min-h-[46px] flex-wrap items-center gap-2 border-b border-[#3b2c20]/70 px-4 py-2 sm:px-7">
                  <BuilderBundleSelector
                    bundles={builderBundles}
                    onSelect={onBundleSelect}
                    selectedBundleId={builderSelectedBundleId ?? builderBundles[0]!.id}
                    unknownBundleId={builderUnknownBundleId}
                  />
                </div>
              ) : null}
              <div
                className="flex min-h-[50px] flex-wrap items-end gap-2 px-4 py-2 sm:px-7"
                data-testid="library-mode-tabs"
              >
                {LIBRARY_MODE_TABS.filter(
                  (tab) => sectionForLibraryMode(tab.mode) === activeSection,
                ).map((tab) => (
                  <LibraryModeTab
                    active={mode === tab.mode}
                    key={tab.mode}
                    label={tab.label}
                    minWidthClass={tab.minWidthClass}
                    onClick={() => onModeChange(tab.mode)}
                  />
                ))}
              </div>
            </section>
            {children}
          </>
        ) : (
          children
        )}
      </main>
      <RavenBench
        actionRequest={ravenActionRequest}
        agents={agents}
        connectionState={ravenConnectionState}
        onAgent={onAgent}
        onFrameProblem={onFrameProblem}
        onKnowledgeBank={onKnowledgeBank}
      />
    </div>
  );
}
