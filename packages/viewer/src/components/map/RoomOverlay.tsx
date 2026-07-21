// The Map-tab room overlay (S1, Strategy Center / Learning Lab): a building
// landmark click opens this over a dimmed map. It shares MapScrimPanel's
// shell directly (grow-from-hex origin, expandable takeover) rather than
// riding through MapOverlay's MapOverlayTarget — a room names a fixed slot
// (one of MAP_ROOMS), not an entity id, and MapOverlayTarget's two variants
// ("entity" | "pile") are both entity-shaped. So this is a THIRD, parallel
// overlay kind, the same call ColleagueOverlay already made for a colleague's
// journal: its own close-on-Escape listener, its own width policy.
//
// This slice ships the room's permanent shape, not its payload: a title, a
// one-line purpose, an advisor block (Raven, from the agent roster — the
// same identity source ColleagueOverlay reads), and two labeled placeholder
// sections. The dashboard and the related-board-work list that will fill
// those placeholders are a later slice's payload; this PR only proves the
// click → room plumbing.

import { useEffect } from "react";
import type { RuntimeAgent } from "../../app/runtime/schemas";
import { MAP_ROOM_COLORS } from "./colors";
import { MapScrimPanel, type RoomOrigin } from "./MapScrimPanel";
import { RoomActionButton } from "./panel-buttons";
import { MAP_ROOMS, type MapRoomId } from "./vocabulary";

/** One-line room purpose shown under the title (S1 copy). */
const ROOM_PURPOSE: Record<MapRoomId, string> = {
  "strategy-center": "The metrics we're winning and losing by, relative to our major bets.",
  "learning-lab": "Experiments in flight and what they're teaching us.",
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

type RoomOverlayProps = {
  roomId: MapRoomId;
  /** Agent roster (name/role) for the advisor block, same source as ColleagueOverlay. */
  agents: readonly RuntimeAgent[];
  /** The opening click's viewport position — the room grows from the clicked building. */
  origin: RoomOrigin | null;
  /** Opens the advisor's per-agent page (the bench quick-bar's same destination). */
  onOpenAgentPage: (colleagueId: string) => void;
  onClose: () => void;
};

export function RoomOverlay({
  roomId,
  agents,
  origin,
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
        className="mt-4 flex flex-col gap-3 border-t pt-3"
        style={{ borderColor: MAP_ROOM_COLORS.rule }}
      >
        {/* Placeholders: this slice proves the room shell and the click
            plumbing; the dashboard and its linked board work are the next
            slice's payload, so both sections name what's coming rather than
            rendering nothing (a silent "why is this blank" gap) or a fake
            preview. */}
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: MAP_ROOM_COLORS.subtext }}
          >
            Dashboard
          </p>
          <p className="mt-1 text-[11px]" style={{ color: MAP_ROOM_COLORS.subtext }}>
            The metrics view for this room lands in a later slice.
          </p>
        </div>
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: MAP_ROOM_COLORS.subtext }}
          >
            Related board work
          </p>
          <p className="mt-1 text-[11px]" style={{ color: MAP_ROOM_COLORS.subtext }}>
            Board cards linked to this room land in a later slice.
          </p>
        </div>
      </div>
    </MapScrimPanel>
  );
}

export default RoomOverlay;
