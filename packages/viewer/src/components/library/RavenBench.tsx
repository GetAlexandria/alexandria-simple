import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { RuntimeAgent } from "../../app/runtime/schemas";
import type { RavenConnectionState } from "./types";

interface LockedSeat {
  key: string;
  label: string;
}

const RAVEN_AGENT_ID = "raven";

// Live agents with a bespoke portrait coin instead of the default
// initials-on-medallion treatment. Keyed by agent id. Each coin rests on its
// unlit face and fades in the lit face on hover / when selected.
interface CoinPortrait {
  unlit: string;
  lit: string;
}

const AGENT_COIN_PORTRAITS: Record<string, CoinPortrait> = {
  damien: {
    unlit: "/raven-assets/damien-unlit.png",
    lit: "/raven-assets/damien-lit.png",
  },
};

const fallbackRavenAgent: RuntimeAgent = {
  id: RAVEN_AGENT_ID,
  jobTitle: "Product",
  knowledgeBankAreaIds: [],
  name: "Raven",
  status: "available",
};

const lockedSeats: LockedSeat[] = [
  { key: "engineering", label: "Engineering" },
  { key: "design", label: "Design" },
  { key: "research", label: "Research" },
  { key: "operations", label: "Operations" },
];

function shortJobTitle(agent: RuntimeAgent): string {
  if (agent.id === RAVEN_AGENT_ID && agent.jobTitle === "Product Owner") {
    return "Product";
  }

  return agent.jobTitle;
}

function agentInitials(agent: RuntimeAgent): string {
  const initials = agent.name
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials === "" ? "AG" : initials;
}

function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={["h-4 w-4 transition-transform duration-200", isExpanded ? "rotate-180" : ""].join(
        " ",
      )}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 15l6-6 6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function LockIcon({ seat }: { seat: LockedSeat }) {
  return (
    <span
      aria-hidden="true"
      className="absolute bottom-[18px] right-[14px] z-[5] grid h-[18px] w-[18px] place-items-center text-[rgba(180,140,80,0.60)]"
      data-testid={`lock-icon-${seat.key}`}
    >
      <svg className="h-full w-full" fill="none" viewBox="0 0 16 16">
        <path
          d="M5 7V5a3 3 0 0 1 6 0v2m-7 0h8a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    </span>
  );
}

function CoinPlate({ name, plateId, title }: { name?: string; plateId: string; title: string }) {
  return (
    <span
      className="mt-[7px] flex w-[144px] flex-col items-center justify-center rounded-[2px] border border-[rgba(30,18,8,0.65)] border-t-[rgba(255,230,180,0.30)] bg-[linear-gradient(180deg,#c9a878_0%,#a98850_55%,#7a4f22_100%)] px-2 py-1 text-center shadow-[inset_0_1px_0_rgba(255,230,180,0.40),inset_0_-1px_1px_rgba(0,0,0,0.40),0_2px_5px_rgba(0,0,0,0.55)]"
      data-testid={`coin-plate-${plateId}`}
    >
      {/* Major font: the agent's name. Locked seats render a blank
          non-breaking space in the same font so every plate reserves the
          exact height a real name will occupy when the agent activates —
          keeping all plates (and therefore all coins) the same height. */}
      <span
        aria-hidden={name == null ? true : undefined}
        className={[
          "block max-w-full truncate font-display text-[18px] font-semibold uppercase leading-[1.1] tracking-[0.12em]",
          name == null
            ? "select-none text-transparent"
            : "text-[rgba(20,10,2,0.96)] [text-shadow:0_1px_0_rgba(255,230,180,0.45)]",
        ].join(" ")}
        data-testid={`coin-plate-${plateId}-name`}
        title={name}
      >
        {name ?? " "}
      </span>
      {/* Sub font: the seat's title — same size on every coin so the title
          rows align across the whole tray. */}
      <span
        className="mt-px block max-w-full truncate font-display text-[12px] font-semibold uppercase leading-none tracking-[0.14em] text-[rgba(60,38,12,0.78)] [text-shadow:0_1px_0_rgba(255,232,184,0.40)]"
        data-testid={`coin-plate-${plateId}-role`}
        title={title}
      >
        {title}
      </span>
    </span>
  );
}

function LockedCoin({
  isActive,
  onToggle,
  seat,
}: {
  isActive: boolean;
  onToggle(): void;
  seat: LockedSeat;
}) {
  return (
    <div
      className="group relative flex h-[158px] w-[140px] flex-col items-center"
      data-testid={`locked-seat-${seat.key}`}
    >
      <button
        aria-describedby={`upgrade-${seat.key}`}
        aria-label={`Future teammate - ${seat.label}`}
        className="relative h-[112px] w-[112px] rounded-full bg-[radial-gradient(circle_at_30%_28%,rgba(255,222,180,0.16)_0%,transparent_45%),radial-gradient(circle_at_72%_78%,rgba(20,10,4,0.55)_0%,transparent_50%),linear-gradient(135deg,#4a3520_0%,#2e1f10_55%,#15100a_100%)] shadow-[inset_2px_2px_4px_rgba(255,220,180,0.20),inset_-2px_-2px_4px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(60,36,14,0.55),0_4px_16px_rgba(0,0,0,0.55)] transition-shadow duration-300 group-hover:shadow-[inset_2px_2px_4px_rgba(255,220,180,0.20),inset_-2px_-2px_4px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(79,184,168,0.20),0_4px_16px_rgba(0,0,0,0.55),0_0_18px_rgba(79,184,168,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]"
        data-testid={`locked-coin-${seat.key}`}
        onClick={onToggle}
        type="button"
      >
        <span className="absolute inset-[10px] rounded-full bg-[radial-gradient(circle_at_50%_38%,#2b211a_0%,#0e0a08_100%)] shadow-[inset_0_5px_10px_rgba(0,0,0,0.86),inset_0_-1px_2px_rgba(255,224,144,0.10)]" />
        <span className="absolute inset-[16px] rounded-full overflow-hidden shadow-[inset_0_0_8px_rgba(0,0,0,0.65),0_1px_0_rgba(255,231,159,0.13)]">
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            src="/raven-assets/coin-tails-unactivated.png"
          />
          <img
            alt=""
            className={[
              "absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-150 group-hover:opacity-[0.55]",
              isActive ? "opacity-[0.72]" : "",
            ].join(" ")}
            data-testid="coin-tails-activated"
            src="/raven-assets/coin-tails-activated.png"
          />
        </span>
        <LockIcon seat={seat} />
      </button>
      <CoinPlate plateId={seat.key} title={seat.label} />
      <span
        className={[
          "pointer-events-none absolute -top-[31px] left-1/2 z-10 w-[156px] -translate-x-1/2 rounded-[3px] border border-[#7b5a31] bg-[#21170f]/96 px-3 py-2 text-center font-display text-[11px] leading-[1.25] tracking-[0.07em] text-[#f0ca6b] opacity-0 shadow-[0_8px_16px_rgba(0,0,0,0.62)] transition-opacity duration-[120ms] group-hover:opacity-100",
          isActive ? "opacity-100" : "",
        ].join(" ")}
        data-testid={`upgrade-message-${seat.key}`}
        id={`upgrade-${seat.key}`}
      >
        <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#e8b86d]">
          Future teammate
        </span>
        {seat.label} unlocks later.
      </span>
    </div>
  );
}

function elementCenterX(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  return rect.left + rect.width / 2;
}

function quickBarStyle(anchorLeft: number | null): { left?: string } {
  return anchorLeft == null ? {} : { left: `${Math.round(anchorLeft)}px` };
}

function RavenCoin({
  agent,
  containerRef,
  connectionState,
  isOpen,
  onToggle,
}: {
  agent: RuntimeAgent;
  containerRef: RefObject<HTMLDivElement | null>;
  connectionState: RavenConnectionState;
  isOpen: boolean;
  onToggle(anchorLeft: number): void;
}) {
  const isConnected = connectionState === "connected";
  const title = shortJobTitle(agent);

  return (
    <div
      className="group relative flex h-[158px] w-[140px] flex-col items-center"
      data-testid="raven-seat"
      ref={containerRef}
    >
      <button
        aria-controls={`agent-quick-bar-${agent.id}`}
        aria-expanded={isOpen}
        aria-label={`${agent.name} - ${title}`}
        className={[
          "relative h-[112px] w-[112px] rounded-full bg-[radial-gradient(circle_at_30%_28%,rgba(255,222,180,0.16)_0%,transparent_45%),radial-gradient(circle_at_72%_78%,rgba(20,10,4,0.55)_0%,transparent_50%),linear-gradient(135deg,#4a3520_0%,#2e1f10_55%,#15100a_100%)] transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]",
          isConnected
            ? "shadow-[inset_2px_2px_4px_rgba(255,220,180,0.25),inset_-2px_-2px_4px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(79,184,168,0.42),0_4px_16px_rgba(0,0,0,0.55),0_0_22px_rgba(79,184,168,0.36)]"
            : "shadow-[inset_2px_2px_4px_rgba(255,220,180,0.25),inset_-2px_-2px_4px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(60,36,14,0.55),0_4px_16px_rgba(0,0,0,0.55)]",
        ].join(" ")}
        data-raven-connection-state={connectionState}
        data-testid="raven-coin"
        onClick={(event) => onToggle(elementCenterX(event.currentTarget))}
        type="button"
      >
        <span className="absolute inset-[10px] rounded-full overflow-hidden shadow-[inset_0_0_12px_rgba(0,0,0,0.72),0_1px_0_rgba(255,232,159,0.18)]">
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            src="/raven-assets/raven-unlit.png"
          />
          <img
            alt=""
            className={[
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-150",
              isConnected || isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            ].join(" ")}
            data-testid="raven-lit-layer"
            src="/raven-assets/raven-lit.png"
          />
        </span>
      </button>
      <CoinPlate name={agent.name} plateId="raven" title={title} />
    </div>
  );
}

function AgentCoin({
  agent,
  isOpen,
  onToggle,
}: {
  agent: RuntimeAgent;
  isOpen: boolean;
  onToggle(anchorLeft: number): void;
}) {
  const title = shortJobTitle(agent);
  const portrait = AGENT_COIN_PORTRAITS[agent.id];

  return (
    <div
      className="group relative flex h-[158px] w-[140px] flex-col items-center"
      data-testid={`agent-seat-${agent.id}`}
    >
      <button
        aria-controls={`agent-quick-bar-${agent.id}`}
        aria-expanded={isOpen}
        aria-label={`${agent.name} - ${title}`}
        className={[
          "relative h-[112px] w-[112px] rounded-full bg-[radial-gradient(circle_at_30%_28%,rgba(255,222,180,0.16)_0%,transparent_45%),radial-gradient(circle_at_72%_78%,rgba(20,10,4,0.55)_0%,transparent_50%),linear-gradient(135deg,#4a3520_0%,#2e1f10_55%,#15100a_100%)] transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]",
          isOpen
            ? "shadow-[inset_2px_2px_4px_rgba(255,220,180,0.25),inset_-2px_-2px_4px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(232,184,109,0.48),0_4px_16px_rgba(0,0,0,0.55),0_0_22px_rgba(232,184,109,0.28)]"
            : "shadow-[inset_2px_2px_4px_rgba(255,220,180,0.25),inset_-2px_-2px_4px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(60,36,14,0.55),0_4px_16px_rgba(0,0,0,0.55)] group-hover:shadow-[inset_2px_2px_4px_rgba(255,220,180,0.25),inset_-2px_-2px_4px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(232,184,109,0.34),0_4px_16px_rgba(0,0,0,0.55),0_0_18px_rgba(232,184,109,0.18)]",
        ].join(" ")}
        data-testid={`agent-coin-${agent.id}`}
        onClick={(event) => onToggle(elementCenterX(event.currentTarget))}
        type="button"
      >
        {portrait ? (
          <span className="absolute inset-[10px] overflow-hidden rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.72),0_1px_0_rgba(255,232,159,0.18)]">
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              src={portrait.unlit}
            />
            <img
              alt=""
              className={[
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-150",
                isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              ].join(" ")}
              data-testid={`agent-coin-lit-${agent.id}`}
              src={portrait.lit}
            />
          </span>
        ) : (
          <>
            <span className="absolute inset-[10px] rounded-full bg-[radial-gradient(circle_at_50%_38%,#2b211a_0%,#0e0a08_100%)] shadow-[inset_0_5px_10px_rgba(0,0,0,0.86),inset_0_-1px_2px_rgba(255,224,144,0.10)]" />
            <span className="absolute inset-[16px] overflow-hidden rounded-full shadow-[inset_0_0_8px_rgba(0,0,0,0.65),0_1px_0_rgba(255,231,159,0.13)]">
              <img
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                src="/raven-assets/coin-tails-activated.png"
              />
              <span className="absolute inset-[24px] grid place-items-center rounded-full border border-[rgba(255,230,180,0.24)] bg-[rgba(18,10,4,0.50)] font-display text-[24px] font-semibold uppercase leading-none tracking-[0.08em] text-[#f0ca6b] [text-shadow:0_2px_4px_rgba(0,0,0,0.65)]">
                {agentInitials(agent)}
              </span>
            </span>
          </>
        )}
      </button>
      <CoinPlate name={agent.name} plateId={agent.id} title={title} />
    </div>
  );
}

interface AgentQuickBarProps {
  anchorLeft: number | null;
  agent: RuntimeAgent;
  onAgent(agentId: string): void;
  onFrameProblem(): void;
  onKnowledgeBank(): void;
  onClose(): void;
  quickBarRef: RefObject<HTMLDivElement | null>;
}

function AgentQuickBar({
  agent,
  anchorLeft,
  onAgent,
  onFrameProblem,
  onKnowledgeBank,
  onClose,
  quickBarRef,
}: AgentQuickBarProps) {
  // Knowledge Bank and Frame a Problem are Raven-specific surfaces (they route
  // to Raven's KB and launch her play). Other agents only expose their own
  // Agent page, wired the same way Raven's is via onAgent(agent.id).
  const isRaven = agent.id === RAVEN_AGENT_ID;

  return (
    <div
      aria-label={`${agent.name} actions`}
      className="raven-quick-bar"
      data-testid={`agent-quick-bar-${agent.id}`}
      id={`agent-quick-bar-${agent.id}`}
      ref={quickBarRef}
      role="group"
      style={quickBarStyle(anchorLeft)}
    >
      {isRaven ? (
        <>
          <button
            className="raven-tray-action focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]"
            data-testid={`agent-quick-bar-knowledge-bank-${agent.id}`}
            onClick={onKnowledgeBank}
            type="button"
          >
            Knowledge Bank
          </button>
          <button
            className="raven-tray-action focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]"
            data-testid={`agent-quick-bar-frame-the-problem-${agent.id}`}
            onClick={onFrameProblem}
            type="button"
          >
            Frame a Problem
          </button>
        </>
      ) : null}
      <button
        className="raven-tray-action focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]"
        data-testid={`agent-quick-bar-page-${agent.id}`}
        onClick={() => onAgent(agent.id)}
        type="button"
      >
        Agent
      </button>
      <button
        aria-label={`Close ${agent.name} Quick Bar`}
        className="raven-quick-bar-close"
        onClick={onClose}
        type="button"
      >
        ×
      </button>
    </div>
  );
}

interface RavenBenchProps {
  actionRequest?: number;
  agents?: RuntimeAgent[];
  connectionState?: RavenConnectionState;
  onAgent?: (agentId: string) => void;
  onFrameProblem?: () => void;
  onKnowledgeBank?: () => void;
}

export function RavenBench({
  actionRequest = 0,
  agents = [],
  connectionState = "disconnected",
  onAgent = () => undefined,
  onFrameProblem = () => undefined,
  onKnowledgeBank = () => undefined,
}: RavenBenchProps) {
  const [minimized, setMinimized] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    // Start minimized (a thin bar) unless the director explicitly expanded it.
    // The bench still auto-expands when Raven raises an actionRequest (below).
    return window.localStorage.getItem("raven-bench-minimized") !== "false";
  });
  const [quickBarOpen, setQuickBarOpen] = useState(false);
  const [quickBarAnchorLeft, setQuickBarAnchorLeft] = useState<number | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [activeUpgrade, setActiveUpgrade] = useState<string | null>(null);
  const lastActionRequest = useRef(actionRequest);
  const plinthRef = useRef<HTMLDivElement>(null);
  const quickBarRef = useRef<HTMLDivElement>(null);
  const ravenSeatRef = useRef<HTMLDivElement>(null);
  const ravenAgent = agents.find((agent) => agent.id === RAVEN_AGENT_ID) ?? fallbackRavenAgent;
  const liveAgents = agents.filter(
    (agent) => agent.id !== RAVEN_AGENT_ID && agent.status === "available",
  );
  const activeAgent = liveAgents.find((agent) => agent.id === activeAgentId) ?? null;
  const quickBarAgent = quickBarOpen ? ravenAgent : activeAgent;

  useEffect(() => {
    if (actionRequest === lastActionRequest.current) {
      return;
    }

    lastActionRequest.current = actionRequest;
    setMinimized(false);
    setQuickBarOpen(true);
    setQuickBarAnchorLeft(
      ravenSeatRef.current == null ? null : elementCenterX(ravenSeatRef.current),
    );
    setActiveAgentId(null);
    setActiveUpgrade(null);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("raven-bench-minimized", "false");
    }
  }, [actionRequest]);

  useEffect(() => {
    if (!quickBarOpen && activeAgentId == null) {
      return;
    }

    function closeFromOutsideClick(event: PointerEvent): void {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        quickBarRef.current?.contains(target) ||
        ravenSeatRef.current?.contains(target) ||
        plinthRef.current?.contains(target)
      ) {
        return;
      }

      setQuickBarOpen(false);
      setQuickBarAnchorLeft(null);
      setActiveAgentId(null);
    }

    function closeFromEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setQuickBarOpen(false);
        setQuickBarAnchorLeft(null);
        setActiveAgentId(null);
      }
    }

    document.addEventListener("pointerdown", closeFromOutsideClick);
    document.addEventListener("keydown", closeFromEscape);

    return () => {
      document.removeEventListener("pointerdown", closeFromOutsideClick);
      document.removeEventListener("keydown", closeFromEscape);
    };
  }, [activeAgentId, quickBarOpen]);

  function updateMinimized(nextMinimized: boolean): void {
    setMinimized(nextMinimized);
    window.localStorage.setItem("raven-bench-minimized", nextMinimized ? "true" : "false");
    if (nextMinimized) {
      setQuickBarOpen(false);
      setQuickBarAnchorLeft(null);
      setActiveAgentId(null);
      setActiveUpgrade(null);
    }
  }

  function renderLockedCoin(seat: LockedSeat) {
    return (
      <LockedCoin
        isActive={activeUpgrade === seat.key}
        key={seat.key}
        onToggle={() => {
          setQuickBarOpen(false);
          setQuickBarAnchorLeft(null);
          setActiveAgentId(null);
          setActiveUpgrade((current) => (current === seat.key ? null : seat.key));
        }}
        seat={seat}
      />
    );
  }

  function renderAgentCoin(agent: RuntimeAgent) {
    return (
      <AgentCoin
        agent={agent}
        isOpen={activeAgentId === agent.id}
        key={agent.id}
        onToggle={(anchorLeft) => {
          const isActive = activeAgentId === agent.id;
          setQuickBarOpen(false);
          setQuickBarAnchorLeft(isActive ? null : anchorLeft);
          setActiveUpgrade(null);
          setActiveAgentId(isActive ? null : agent.id);
        }}
      />
    );
  }

  // Split the locked seats evenly so Raven remains the anchor of the tray.
  const seatSplit = Math.floor(lockedSeats.length / 2);
  const leftSeats = lockedSeats.slice(0, seatSplit);
  const rightSeats = lockedSeats.slice(seatSplit);

  return (
    <>
      <footer
        className={[
          "fixed inset-x-0 bottom-0 z-40 bg-[linear-gradient(180deg,#2a1d12_0%,#21160d_48%,#140d08_100%)] shadow-[0_-10px_28px_rgba(0,0,0,0.5)] transition-[height] duration-200",
          minimized ? "h-[64px]" : "h-[240px]",
        ].join(" ")}
        data-testid="raven-bench"
      >
        <button
          aria-expanded={!minimized}
          aria-label={minimized ? "Expand agent bench" : "Minimize agent bench"}
          className="absolute left-4 top-3 z-20 grid h-8 w-8 place-items-center rounded-[2px] border border-[#6c5130] bg-[#1b120b]/88 text-[#d4a052] shadow-[inset_0_1px_0_rgba(255,230,170,0.12),0_2px_8px_rgba(0,0,0,0.45)] transition-colors hover:border-[#d4a052] hover:text-[#f4d98d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]"
          onClick={() => updateMinimized(!minimized)}
          title={minimized ? "Expand agent bench" : "Minimize agent bench"}
          type="button"
        >
          <ChevronIcon isExpanded={!minimized} />
        </button>

        {minimized || quickBarAgent == null ? null : (
          <AgentQuickBar
            agent={quickBarAgent}
            anchorLeft={quickBarAnchorLeft}
            onAgent={(agentId) => {
              setQuickBarOpen(false);
              setActiveAgentId(null);
              setQuickBarAnchorLeft(null);
              onAgent(agentId);
            }}
            onFrameProblem={() => {
              setQuickBarOpen(false);
              setActiveAgentId(null);
              setQuickBarAnchorLeft(null);
              onFrameProblem();
            }}
            onKnowledgeBank={() => {
              setQuickBarOpen(false);
              setActiveAgentId(null);
              setQuickBarAnchorLeft(null);
              onKnowledgeBank();
            }}
            onClose={() => {
              setQuickBarOpen(false);
              setActiveAgentId(null);
              setQuickBarAnchorLeft(null);
            }}
            quickBarRef={quickBarRef}
          />
        )}

        <div
          className={[
            "absolute inset-x-0 top-[28px] h-[186px] overflow-visible bg-[linear-gradient(180deg,#3a2816_0%,#24170e_58%,#150d08_100%)] pt-[24px] shadow-[inset_0_-12px_24px_rgba(0,0,0,0.52)] transition-[opacity,transform] duration-200 max-[820px]:overflow-x-auto",
            minimized ? "pointer-events-none translate-y-6 opacity-0" : "translate-y-0 opacity-100",
          ].join(" ")}
          data-testid="raven-plinth"
          ref={plinthRef}
        >
          {/* w-max + mx-auto keeps the row centred with equal gutters, and lets
              it scroll without clipping if it ever outgrows the viewport. */}
          <div className="mx-auto flex w-max items-start gap-[26px] px-[38px] max-[1100px]:gap-[18px] max-[1100px]:px-4">
            {leftSeats.map(renderLockedCoin)}
            <RavenCoin
              agent={ravenAgent}
              containerRef={ravenSeatRef}
              connectionState={connectionState}
              isOpen={quickBarOpen}
              onToggle={(anchorLeft) => {
                setActiveAgentId(null);
                setActiveUpgrade(null);
                setQuickBarOpen((open) => {
                  const nextOpen = !open;
                  setQuickBarAnchorLeft(nextOpen ? anchorLeft : null);
                  return nextOpen;
                });
              }}
            />
            {liveAgents.map(renderAgentCoin)}
            {rightSeats.map(renderLockedCoin)}
          </div>
        </div>
      </footer>
    </>
  );
}
