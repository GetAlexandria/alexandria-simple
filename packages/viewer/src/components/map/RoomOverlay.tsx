// The Map-tab room overlay (S2, Strategy Center / Learning Lab): a building
// landmark click opens this over a dimmed map. It shares MapScrimPanel's
// shell directly (grow-from-hex origin, expandable takeover) rather than
// riding through MapOverlay's MapOverlayTarget — a room names a fixed slot
// (one of MAP_ROOMS), not an entity id, and MapOverlayTarget's two variants
// ("entity" | "pile") are both entity-shaped. So this is a THIRD, parallel
// overlay kind, the same call ColleagueOverlay already made for a colleague's
// journal: its own close-on-Escape listener, its own width policy.
//
// S1 shipped the room's permanent shape (title, purpose, advisor block) with
// two labeled placeholders. This slice (S2) fills them with real dashboards,
// derived entirely by the pure modules this component only renders "dumbly":
// room-strategy-model.ts, room-learning-model.ts, and — shared by both rooms,
// identical component per the XCOM consistent-HUD ruling — room-board-model.ts
// for "Related board work". Every section order stays Advisor / Dashboard /
// Related board work in both rooms.

import { useEffect, useMemo, type ReactNode } from "react";
import type {
  InfoHubBoard,
  InfoHubCard,
  LibraryCatalog,
  MapState,
  RuntimeAgent,
} from "../../app/runtime/schemas";
import { buildDomainNameById, WorkOrderCardFace } from "../library/infohub/WorkOrderCard";
import { MAP_ROOM_COLORS } from "./colors";
import { MapScrimPanel, type RoomOrigin } from "./MapScrimPanel";
import { RoomActionButton } from "./panel-buttons";
import { boardCardsForPlane } from "./room-board-model";
import {
  buildArcRows,
  buildLearningLanes,
  type LearningArcRow,
  type LearningExperimentRow,
  type LearningLanes,
  type VerdictBadge,
} from "./room-learning-model";
import {
  buildStrategyDashboard,
  riskCountLabel,
  type ReadingState,
  type StrategyAnchorGroup,
  type StrategyBetRow,
  type StrategyDashboard,
  type StrategyMeasureRow,
} from "./room-strategy-model";
import { MAP_ROOMS, type MapRoomId } from "./vocabulary";

/** One-line room purpose shown under the title (S1 copy). */
const ROOM_PURPOSE: Record<MapRoomId, string> = {
  "strategy-center": "The metrics we're winning and losing by, relative to our major bets.",
  "learning-lab": "Experiments in flight and what they're teaching us.",
};

/** The library plane each room's dashboard reads (also the board join's plane). */
const ROOM_PLANE: Record<MapRoomId, string> = {
  "strategy-center": "strategy",
  "learning-lab": "learning",
};

const RAVEN_AGENT_ID = "raven";

/**
 * The advisor every room fronts with (S1: Raven only). Mirrors RavenBench's
 * own fallback identity so a roster miss still names an advisor instead of a
 * blank block — duplicated rather than imported, since RavenBench doesn't
 * export its fallback constant and this is one small object, not a shared
 * contract worth a new export.
 */
const FALLBACK_RAVEN_IDENTITY: Pick<RuntimeAgent, "id" | "name" | "jobTitle"> = {
  id: RAVEN_AGENT_ID,
  name: "Raven",
  jobTitle: "Product",
};

// --- Shared small chrome pieces --------------------------------------------
// Bordered chip: subtext color by default — teal/amber/deny accents are
// reserved for the two signals the room brief calls out (measure reading
// state, experiment verdict); every other chip (status/confidence/cost/
// altitude/kind/grade/risk-count) stays neutral so those two keep reading as
// signal, not decoration.

function Chip({ children }: { children: ReactNode }) {
  return (
    <span
      className="shrink-0 rounded border px-1.5 py-0.5 text-[10px]"
      style={{ borderColor: MAP_ROOM_COLORS.rule, color: MAP_ROOM_COLORS.subtext }}
    >
      {children}
    </span>
  );
}

function AccentChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ borderColor: color, color }}
    >
      {label}
    </span>
  );
}

function ReadingBadge({ state }: { state: ReadingState }) {
  return state === "reading" ? (
    <AccentChip label="Reading" color={MAP_ROOM_COLORS.accent} />
  ) : (
    <AccentChip label="No reading yet" color={MAP_ROOM_COLORS.glow} />
  );
}

function VerdictChip({ verdict }: { verdict: VerdictBadge }) {
  const color =
    verdict.tone === "confirms"
      ? MAP_ROOM_COLORS.accent
      : verdict.tone === "denies"
        ? MAP_ROOM_COLORS.deny
        : MAP_ROOM_COLORS.glow;
  return <AccentChip label={verdict.label} color={color} />;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: MAP_ROOM_COLORS.subtext }}
    >
      {children}
    </p>
  );
}

// --- Strategy Center ---------------------------------------------------------

function BetChips({ bet }: { bet: StrategyBetRow }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      <Chip>{bet.status}</Chip>
      <Chip>{bet.confidence}</Chip>
      {bet.cost != null ? <Chip>{bet.cost}</Chip> : null}
      {bet.altitude != null ? <Chip>{bet.altitude}</Chip> : null}
      <Chip>{riskCountLabel(bet.riskCount)}</Chip>
    </div>
  );
}

function MeasureRow({ measure }: { measure: StrategyMeasureRow }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold" style={{ color: MAP_ROOM_COLORS.text }}>
          {measure.displayName}
        </p>
        <ReadingBadge state={measure.readingState} />
      </div>
      {measure.target != null ? (
        <p className="mt-0.5 line-clamp-3 text-[10px]" style={{ color: MAP_ROOM_COLORS.subtext }}>
          {measure.target}
        </p>
      ) : null}
      {measure.trend != null ? (
        <p className="mt-0.5 text-[10px] italic" style={{ color: MAP_ROOM_COLORS.subtext }}>
          {measure.trend}
        </p>
      ) : null}
    </div>
  );
}

function AnchorGroupCard({ group }: { group: StrategyAnchorGroup }) {
  return (
    <div
      className="rounded border px-3 py-2"
      data-testid={`strategy-anchor-${group.anchor.id}`}
      style={{ borderColor: MAP_ROOM_COLORS.rule }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold" style={{ color: MAP_ROOM_COLORS.heading }}>
          {group.anchor.displayName}
        </p>
        {group.transferPending ? (
          <AccentChip label="Transfer pending" color={MAP_ROOM_COLORS.glow} />
        ) : null}
      </div>
      <BetChips bet={group.anchor} />

      {group.nestedBets.length > 0 ? (
        <ul
          className="mt-2 flex flex-col gap-1.5 border-t pt-2"
          style={{ borderColor: MAP_ROOM_COLORS.rule }}
        >
          {group.nestedBets.map((bet) => (
            <li key={bet.id} className="text-[11px]" style={{ color: MAP_ROOM_COLORS.text }}>
              {bet.displayName}
              <BetChips bet={bet} />
            </li>
          ))}
        </ul>
      ) : null}

      {group.measures.length > 0 ? (
        <div
          className="mt-2 flex flex-col gap-2 border-t pt-2"
          style={{ borderColor: MAP_ROOM_COLORS.rule }}
        >
          {group.measures.map((measure) => (
            <MeasureRow key={measure.id} measure={measure} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StrategyCenterDashboard({ dashboard }: { dashboard: StrategyDashboard }) {
  const isEmpty =
    dashboard.anchors.length === 0 &&
    dashboard.otherBets.length === 0 &&
    dashboard.unattachedMeasures.length === 0;
  if (isEmpty) {
    return (
      <p className="text-[11px]" style={{ color: MAP_ROOM_COLORS.subtext }}>
        No Bet or Measure cards in the catalog yet.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {dashboard.anchors.map((group) => (
        <AnchorGroupCard key={group.anchor.id} group={group} />
      ))}

      {dashboard.otherBets.length > 0 ? (
        <div>
          <SectionLabel>Other bets</SectionLabel>
          <ul className="mt-1 flex flex-col gap-1.5">
            {dashboard.otherBets.map((bet) => (
              <li key={bet.id} className="text-[11px]" style={{ color: MAP_ROOM_COLORS.text }}>
                {bet.displayName}
                <BetChips bet={bet} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {dashboard.unattachedMeasures.length > 0 ? (
        <div>
          <SectionLabel>Other measures</SectionLabel>
          <div className="mt-1 flex flex-col gap-2">
            {dashboard.unattachedMeasures.map((measure) => (
              <MeasureRow key={measure.id} measure={measure} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// --- Learning Lab -------------------------------------------------------------

function ExperimentCard({ row }: { row: LearningExperimentRow }) {
  return (
    <div
      className="rounded border px-3 py-2"
      data-testid={`learning-experiment-${row.id}`}
      style={{ borderColor: MAP_ROOM_COLORS.rule }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold" style={{ color: MAP_ROOM_COLORS.text }}>
          {row.displayName}
        </p>
        {row.verdict != null ? <VerdictChip verdict={row.verdict} /> : null}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {row.kind != null ? <Chip>{row.kind}</Chip> : null}
        {row.grade != null ? <Chip>{row.grade}</Chip> : null}
      </div>
      {row.betNames.length > 0 ? (
        <p className="mt-1 text-[10px]" style={{ color: MAP_ROOM_COLORS.subtext }}>
          Tests: {row.betNames.join(", ")}
        </p>
      ) : null}
      {row.arc != null || row.role != null ? (
        <p className="mt-0.5 text-[10px]" style={{ color: MAP_ROOM_COLORS.subtext }}>
          {[row.arc, row.role].filter((value) => value != null).join(" · ")}
        </p>
      ) : null}
      {row.expected != null ? (
        <div className="mt-1">
          <p
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: MAP_ROOM_COLORS.subtext }}
          >
            Expected
          </p>
          <p className="line-clamp-3 text-[10px]" style={{ color: MAP_ROOM_COLORS.subtext }}>
            {row.expected}
          </p>
        </div>
      ) : null}
      {row.stopSummary != null ? (
        <p className="mt-1 text-[10px] italic" style={{ color: MAP_ROOM_COLORS.subtext }}>
          {row.stopSummary}
        </p>
      ) : null}
    </div>
  );
}

function LaneSection({
  title,
  rows,
  emptyText,
}: {
  title: string;
  rows: readonly LearningExperimentRow[];
  emptyText: string;
}) {
  return (
    <div>
      <SectionLabel>
        {title} ({rows.length})
      </SectionLabel>
      {rows.length === 0 ? (
        <p className="mt-1 text-[11px]" style={{ color: MAP_ROOM_COLORS.subtext }}>
          {emptyText}
        </p>
      ) : (
        <div className="mt-1 flex flex-col gap-2">
          {rows.map((row) => (
            <ExperimentCard key={row.id} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArcsStrip({ arcs }: { arcs: readonly LearningArcRow[] }) {
  if (arcs.length === 0) {
    return null;
  }
  return (
    <div className="border-t pt-3" style={{ borderColor: MAP_ROOM_COLORS.rule }}>
      <SectionLabel>Arcs</SectionLabel>
      <ul className="mt-1 flex flex-wrap gap-2">
        {arcs.map((arc) => (
          <li
            key={arc.id}
            className="rounded border px-2 py-1 text-[11px]"
            style={{ borderColor: MAP_ROOM_COLORS.rule, color: MAP_ROOM_COLORS.text }}
          >
            {arc.displayName}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LearningLabDashboard({
  lanes,
  arcs,
}: {
  lanes: LearningLanes;
  arcs: readonly LearningArcRow[];
}) {
  const hasAnyExperiment =
    lanes.planned.length + lanes.running.length + lanes.called.length + lanes.otherState.length > 0;
  if (!hasAnyExperiment && arcs.length === 0) {
    return (
      <p className="text-[11px]" style={{ color: MAP_ROOM_COLORS.subtext }}>
        No Experiment or Arc cards in the catalog yet.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <LaneSection title="Planned" rows={lanes.planned} emptyText="Nothing planned yet." />
      <LaneSection title="Running" rows={lanes.running} emptyText="Nothing running yet." />
      <LaneSection title="Called" rows={lanes.called} emptyText="No verdicts yet." />
      {lanes.otherState.length > 0 ? (
        // Never silently dropped, but not one of the three named lanes above
        // — a state the library hasn't authored yet, or a data anomaly.
        <LaneSection title="Other" rows={lanes.otherState} emptyText="" />
      ) : null}
      <ArcsStrip arcs={arcs} />
    </div>
  );
}

// --- Related board work (shared, both rooms) ---------------------------------

/** A room click never needs a card-detail modal in v1 — the face is read-only. */
function noopOpenCard(): void {}

function RelatedBoardWork({
  plane,
  cards,
  domainNameById,
}: {
  plane: string;
  cards: readonly InfoHubCard[];
  domainNameById: ReadonlyMap<string, string>;
}) {
  if (cards.length === 0) {
    return (
      <p className="mt-1 text-[11px]" style={{ color: MAP_ROOM_COLORS.subtext }}>
        No board work is joined to the {plane} plane yet. Cards join when their map context&apos;s
        libraryContext points into {plane}/…
      </p>
    );
  }
  return (
    <ul className="mt-1 flex flex-col gap-2" data-testid="room-overlay-board-cards">
      {cards.map((card) => (
        <li key={card.id} className="info-hub-card">
          <WorkOrderCardFace card={card} domainNameById={domainNameById} onOpen={noopOpenCard} />
        </li>
      ))}
    </ul>
  );
}

type RoomOverlayProps = {
  roomId: MapRoomId;
  /** Agent roster (name/role) for the advisor block, same source as ColleagueOverlay. */
  agents: readonly RuntimeAgent[];
  /** The opening click's viewport position — the room grows from the clicked building. */
  origin: RoomOrigin | null;
  /**
   * The library catalog (S2): Strategy Center reads its Bet/Measure cards,
   * Learning Lab its Experiment/Arc cards. Null while loading or unavailable
   * on this surface — the dashboard reads that as "unavailable", never as
   * "empty catalog".
   */
  catalog: LibraryCatalog | null;
  catalogError: string | null;
  /** The map document (S2): its `contexts` feed the board join's libraryContext lookup. */
  state: MapState | null;
  /** Info Hub board cards (S2): the "Related board work" join's other half. */
  board: InfoHubBoard | null;
  /** Opens the advisor's per-agent page (the bench quick-bar's same destination). */
  onOpenAgentPage: (colleagueId: string) => void;
  onClose: () => void;
};

export function RoomOverlay({
  roomId,
  agents,
  origin,
  catalog,
  catalogError,
  state,
  board,
  onOpenAgentPage,
  onClose,
}: RoomOverlayProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const room = MAP_ROOMS[roomId];
  const advisor = agents.find((agent) => agent.id === RAVEN_AGENT_ID) ?? FALLBACK_RAVEN_IDENTITY;

  const strategyDashboard = useMemo(
    () => (roomId === "strategy-center" ? buildStrategyDashboard(catalog?.cards ?? []) : null),
    [roomId, catalog],
  );
  const learningLanes = useMemo(
    () => (roomId === "learning-lab" ? buildLearningLanes(catalog?.cards ?? []) : null),
    [roomId, catalog],
  );
  const learningArcs = useMemo(
    () => (roomId === "learning-lab" ? buildArcRows(catalog?.cards ?? []) : []),
    [roomId, catalog],
  );

  const domainNameById = useMemo(() => buildDomainNameById(state?.domains ?? []), [state]);
  const relatedBoardCards = useMemo(
    () => boardCardsForPlane(board?.cards ?? [], state?.contexts ?? [], ROOM_PLANE[roomId]),
    [board, state, roomId],
  );

  return (
    <MapScrimPanel
      testId="room-overlay"
      maxWidthClass="max-w-2xl"
      expandable
      origin={origin}
      onClose={onClose}
      title={
        <p
          className="text-sm font-semibold"
          data-testid="room-overlay-title"
          style={{ color: MAP_ROOM_COLORS.heading }}
        >
          {room.name}
        </p>
      }
      headerActions={<RoomActionButton label="Close" onClick={onClose} />}
    >
      <p
        className="text-xs"
        data-testid="room-overlay-purpose"
        style={{ color: MAP_ROOM_COLORS.text }}
      >
        {ROOM_PURPOSE[roomId]}
      </p>

      <div
        className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded border px-3 py-2"
        data-testid="room-overlay-advisor"
        style={{ borderColor: MAP_ROOM_COLORS.rule }}
      >
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: MAP_ROOM_COLORS.subtext }}
          >
            Advisor — {advisor.name}
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: MAP_ROOM_COLORS.subtext }}>
            {advisor.jobTitle}
          </p>
        </div>
        <RoomActionButton
          label={`${advisor.name}'s workspace`}
          onClick={() => onOpenAgentPage(advisor.id)}
          testId="room-overlay-advisor-agent-page"
        />
      </div>

      <div
        className="mt-4 flex flex-col gap-4 border-t pt-3"
        style={{ borderColor: MAP_ROOM_COLORS.rule }}
      >
        <div data-testid="room-overlay-dashboard">
          <SectionLabel>Dashboard</SectionLabel>
          <div className="mt-1.5">
            {catalog == null ? (
              <p className="text-[11px]" style={{ color: MAP_ROOM_COLORS.subtext }}>
                {catalogError ?? "Reading the library catalog…"}
              </p>
            ) : roomId === "strategy-center" ? (
              <StrategyCenterDashboard dashboard={strategyDashboard!} />
            ) : (
              <LearningLabDashboard lanes={learningLanes!} arcs={learningArcs} />
            )}
          </div>
        </div>

        <div
          className="border-t pt-3"
          data-testid="room-overlay-board-work"
          style={{ borderColor: MAP_ROOM_COLORS.rule }}
        >
          <SectionLabel>Related board work</SectionLabel>
          <RelatedBoardWork
            plane={ROOM_PLANE[roomId]}
            cards={relatedBoardCards}
            domainNameById={domainNameById}
          />
        </div>
      </div>
    </MapScrimPanel>
  );
}

export default RoomOverlay;
