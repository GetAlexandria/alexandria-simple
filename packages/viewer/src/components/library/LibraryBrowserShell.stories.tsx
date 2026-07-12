import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { LibraryBundle } from "./library-bundle-registry";
import { LibraryBrowserShell } from "./LibraryBrowserShell";
import type { LibraryBrowserView, LibraryViewMode, RavenConnectionState } from "./types";

// The shell never renders the /dev/map surface (LibraryBrowserApp early-returns
// before the shell), so its stories use the same shell-facing view type.
type ShellView = Exclude<LibraryBrowserView, "dev-map">;

const STORY_BUNDLES: LibraryBundle[] = [
  {
    id: "alexandria-product",
    label: "Alexandria Product",
    libraryRoot: "docs/alexandria/library",
  },
];

function ShellStory({
  initialView = "home",
  ravenConnectionState = "disconnected",
}: {
  initialView?: ShellView;
  ravenConnectionState?: RavenConnectionState;
}) {
  const [mode, setMode] = useState<LibraryViewMode>("engine");
  const [activeView, setActiveView] = useState<ShellView>(initialView);
  const [selectedBundleId, setSelectedBundleId] = useState(STORY_BUNDLES[0]!.id);

  return (
    <LibraryBrowserShell
      activeView={activeView}
      builderBundles={STORY_BUNDLES}
      builderNotepadBadgeCount={2}
      builderSelectedBundleId={selectedBundleId}
      mode={mode}
      onBundleSelect={setSelectedBundleId}
      onHome={() => setActiveView("home")}
      onInfo={() => setActiveView("info")}
      onLibrary={() => setActiveView("library")}
      onAgent={() => setActiveView("agent")}
      onFrameProblem={() => {}}
      onKnowledgeBank={() => setActiveView("knowledge-bank")}
      onLedger={() => setActiveView("ledger")}
      onModeChange={setMode}
      onPlaybook={() => setActiveView("playbook")}
      onSectionChange={(section) => setMode(section === "viewer" ? "engine" : "alexandria-back")}
      ravenActionRequest={0}
      ravenConnectionState={ravenConnectionState}
    >
      <div className="m-7 border border-[#3b2c20] bg-[#1c1712]/85 p-8 font-display text-[#d4a052]">
        {activeView === "home"
          ? "Home content slot"
          : activeView === "knowledge-bank"
            ? "Knowledge Bank content slot"
            : activeView === "playbook"
              ? "Playbook content slot"
              : activeView === "info"
                ? "Info content slot"
                : activeView === "ledger"
                  ? "Ledger content slot"
                  : "Library content slot"}
      </div>
    </LibraryBrowserShell>
  );
}

const meta = {
  component: ShellStory,
  title: "Library Browser/Shell",
} satisfies Meta<typeof ShellStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Library: Story = {
  args: {
    initialView: "library",
  },
};

export const KnowledgeBank: Story = {
  args: {
    initialView: "knowledge-bank",
  },
};

export const ConnectedHome: Story = {
  args: {
    ravenConnectionState: "connected",
  },
};
