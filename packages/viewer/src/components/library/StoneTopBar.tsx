import type { LibraryBrowserView } from "./types";

const stoneTabs = [
  {
    active: "/library-assets/journal-stone-active.png",
    disabled: false,
    dormant: "/library-assets/journal-stone.png",
    id: "library",
    label: "Library",
  },
  {
    active: "/library-assets/strategy-stone-active.png",
    disabled: false,
    dormant: "/library-assets/strategy-stone.png",
    id: "playbook",
    label: "Playbook",
  },
  {
    active: "/library-assets/microscope-stone-active.png",
    disabled: false,
    dormant: "/library-assets/microscope-stone.png",
    id: "info",
    label: "Info Hub",
  },
  {
    active: "/library-assets/ledger-stone.png",
    disabled: false,
    dormant: "/library-assets/ledger-stone.png",
    id: "ledger",
    label: "Ledger",
  },
] as const;

interface StoneTopBarProps {
  activeTab: LibraryBrowserView | null;
  onHome(): void;
  onInfo(): void;
  onLedger(): void;
  onLibrary(): void;
  onPlaybook(): void;
}

export function StoneTopBar({
  activeTab,
  onHome,
  onInfo,
  onLedger,
  onLibrary,
  onPlaybook,
}: StoneTopBarProps) {
  return (
    <header className="sticky top-0 z-50 grid h-[84px] grid-cols-[220px_minmax(0,1fr)_220px] items-center border-b border-[#2b2118] bg-[linear-gradient(180deg,rgba(43,32,21,0.97),rgba(24,18,13,0.95))] px-6 shadow-[0_2px_12px_rgba(0,0,0,0.58)]">
      <button
        aria-label="Return to Alexandria home"
        className="font-display text-[15px] font-normal uppercase tracking-[0.28em] text-[#d4a052] opacity-95"
        onClick={onHome}
        type="button"
      >
        Alexandria
      </button>

      <nav
        aria-label="Canvas navigation"
        className="flex h-full items-center justify-center gap-3"
        role="tablist"
      >
        {stoneTabs.map((tab) => {
          const isLibrary = tab.id === "library";
          const isPlaybook = tab.id === "playbook";
          const isInfo = tab.id === "info";
          const isLedger = tab.id === "ledger";
          const isActive = activeTab === tab.id;
          const onClick = isLibrary
            ? onLibrary
            : isPlaybook
              ? onPlaybook
              : isInfo
                ? onInfo
                : isLedger
                  ? onLedger
                  : undefined;

          return (
            <button
              aria-disabled={tab.disabled}
              aria-selected={isActive}
              className={[
                "group relative h-[74px] w-[148px] overflow-hidden rounded-[3px] border bg-[#16110d] shadow-[0_0_0_1px_rgba(255,230,170,0.08),0_8px_20px_rgba(0,0,0,0.62)]",
                isActive
                  ? "border-[#e8b86d] shadow-[0_0_0_2px_rgba(232,184,109,0.45),0_0_16px_rgba(232,184,109,0.28)]"
                  : "border-[#33271d]",
                tab.disabled ? "opacity-[0.55]" : "",
              ].join(" ")}
              disabled={tab.disabled}
              key={tab.id}
              onClick={!tab.disabled ? onClick : undefined}
              role="tab"
              type="button"
            >
              <img
                alt=""
                className={[
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
                  isActive ? "opacity-0" : "opacity-100 group-hover:opacity-0",
                ].join(" ")}
                src={tab.dormant}
              />
              <img
                alt=""
                className={[
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                ].join(" ")}
                src={tab.active}
              />
              <span className="absolute inset-x-0 bottom-2 text-center font-display text-[11px] uppercase tracking-[0.24em] text-[#f0cd8a] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="flex justify-end">
        <button
          className="rounded-[3px] border border-[#6a5132] bg-[#21170f]/80 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#d4a052] shadow-inner shadow-black/40"
          type="button"
        >
          <kbd className="font-mono">⌘K</kbd> Search
        </button>
      </div>
    </header>
  );
}
