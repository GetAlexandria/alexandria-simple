// Pure logic behind the colleague landmark overlay (L2, plan §1.1 — click a
// colleague's building to see who they are, what they've been doing, and what
// they can do). Three.js- and React-free so it unit-tests under bun; the
// overlay component (ColleagueOverlay) is the only renderer of these.

import type {
  ColleagueJournal,
  InfoHubCard,
  MapState,
  RuntimeAgent,
} from "../../app/runtime/schemas";
import { deriveTileSignalsByEntity, type TileSignals } from "./signals";
import { assigneeColleagueId, capitalize } from "./vocabulary";

/** The colleague's name/role line, resolved from the agent roster. */
export interface ColleagueIdentity {
  id: string;
  name: string;
  /** The roster jobTitle, or null when the colleague has no roster entry. */
  role: string | null;
}

/**
 * The name/role line for a colleague landmark, sourced from the agent
 * definition roster (the same `RuntimeAgent[]` RavenBench renders as name +
 * jobTitle). A colleague with no roster entry falls back to the map's
 * existing capitalize-the-id convention with no role, rather than showing a
 * blank card — a hand-added `colleague:` landmark still names itself.
 */
export function resolveColleagueIdentity(
  colleagueId: string,
  agents: readonly RuntimeAgent[],
): ColleagueIdentity {
  const agent = agents.find((candidate) => candidate.id === colleagueId);
  if (agent != null) {
    return { id: colleagueId, name: agent.name, role: agent.jobTitle };
  }
  return { id: colleagueId, name: capitalize(colleagueId), role: null };
}

/**
 * How many of a colleague's cards need a human. A colleague's work is the
 * entities assigned to them (map entities whose `assignee` is `colleague:<id>`);
 * a `needs-a-human` board card counts when it is joined (`entityId`) to one of
 * those entities — the card-level twin of the per-tile "needs a human" glow
 * (plan §1.4).
 */
export function colleagueNeedsHumanCount(
  state: MapState,
  cards: readonly InfoHubCard[],
  colleagueId: string,
): number {
  const entityIds = new Set(
    state.entities
      .filter((entity) => assigneeColleagueId(entity.assignee) === colleagueId)
      .map((entity) => entity.id),
  );
  if (entityIds.size === 0) {
    return 0;
  }
  return cards.filter(
    (card) =>
      card.status === "needs-a-human" && card.entityId != null && entityIds.has(card.entityId),
  ).length;
}

/**
 * The top `limit` journal entries. The read path returns entries newest-first
 * (append-at-top files, see docs/alexandria/journal/README.md), so "top N" is
 * a slice of the head — never a re-sort — and a shorter journal yields fewer.
 */
export function topJournalEntries<Entry>(entries: readonly Entry[], limit: number): Entry[] {
  return entries.slice(0, Math.max(0, limit));
}

/**
 * Whether a colleague's coin should carry the escalation glow (Map Glow Up):
 * the director needs to step in on this colleague's work. A colleague's work is
 * the entities assigned to them (`assignee` = `colleague:<that agent>`). True
 * when EITHER a `needs-a-human` board card is joined to one of those entities
 * (colleagueNeedsHumanCount > 0), OR one of their systems has gone quiet — its
 * per-entity signal is `overdue`, or its health is KNOWN and fully drained
 * (`healthKnown && filledDots === 0`). It reuses the exact same building blocks
 * the map tiles read (colleagueNeedsHumanCount + the per-entity TileSignals),
 * so the coin glow and the tile treatments can never disagree.
 *
 * The per-entity signals are passed in (not recomputed here) so a whole-tray
 * rollup derives them ONCE — see escalationByColleagueId. A signal absent from
 * the map (unknown entity id) contributes nothing.
 */
export function colleagueEscalated(options: {
  state: MapState;
  cards: readonly InfoHubCard[];
  signalsByEntityId: ReadonlyMap<string, TileSignals>;
  colleagueId: string;
}): boolean {
  if (colleagueNeedsHumanCount(options.state, options.cards, options.colleagueId) > 0) {
    return true;
  }
  return options.state.entities.some((entity) => {
    if (assigneeColleagueId(entity.assignee) !== options.colleagueId) {
      return false;
    }
    const signals = options.signalsByEntityId.get(entity.id);
    if (signals == null) {
      return false;
    }
    return signals.overdue || (signals.healthKnown && signals.filledDots === 0);
  });
}

/**
 * The whole coin tray's escalation rollup, keyed by bare colleague id — one
 * entry for every colleague that runs at least one map entity, `true` when that
 * colleague is escalated (see colleagueEscalated). A colleague with no map
 * entity is absent from the map (the coin reads that as not escalated). The
 * per-entity signals are derived ONCE here (the same deriveTileSignalsByEntity
 * the map tiles use) and shared across the rollup, so the pass is
 * O(entities + cards) rather than re-deriving them per colleague.
 *
 * `journals == null` — the journal path is unavailable on this surface (e.g. the
 * Info Hub surface loads the board + map state but NOT the journals) — leaves
 * the health/overdue half inert (every system reads UNKNOWN: never overdue, and
 * `healthKnown` false), so only the needs-a-human half contributes there. That
 * mirrors the map's own graceful degradation, and it is deliberate: the caller
 * does not broaden journal fetching, keeping the glow's data cost bounded (v1).
 */
export function escalationByColleagueId(options: {
  state: MapState;
  cards: readonly InfoHubCard[];
  journals: readonly ColleagueJournal[] | null;
  nowMs: number;
}): Map<string, boolean> {
  const signalsByEntityId = deriveTileSignalsByEntity({
    entities: options.state.entities,
    cards: options.cards,
    journals: options.journals,
    nowMs: options.nowMs,
  });
  const byColleague = new Map<string, boolean>();
  for (const entity of options.state.entities) {
    const colleagueId = assigneeColleagueId(entity.assignee);
    if (colleagueId == null || byColleague.has(colleagueId)) {
      continue;
    }
    byColleague.set(
      colleagueId,
      colleagueEscalated({
        state: options.state,
        cards: options.cards,
        signalsByEntityId,
        colleagueId,
      }),
    );
  }
  return byColleague;
}
