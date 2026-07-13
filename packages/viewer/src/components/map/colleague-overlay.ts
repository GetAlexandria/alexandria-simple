// Pure logic behind the colleague landmark overlay (L2, plan §1.1 — click a
// colleague's building to see who they are, what they've been doing, and what
// they can do). Three.js- and React-free so it unit-tests under bun; the
// overlay component (ColleagueOverlay) is the only renderer of these.

import type { InfoHubCard, MapState, RuntimeAgent } from "../../app/runtime/schemas";

/** The colleague's name/role line, resolved from the agent roster. */
export interface ColleagueIdentity {
  id: string;
  name: string;
  /** The roster jobTitle, or null when the colleague has no roster entry. */
  role: string | null;
}

const capitalize = (value: string): string =>
  value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);

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
 * systems they run (map entities with `colleague: <id>`); a `needs-a-human`
 * board card counts when it is joined (`entityId`) to one of those systems —
 * the card-level twin of the per-tile "needs a human" glow (plan §1.4).
 */
export function colleagueNeedsHumanCount(
  state: MapState,
  cards: readonly InfoHubCard[],
  colleagueId: string,
): number {
  const entityIds = new Set(
    state.entities.filter((entity) => entity.colleague === colleagueId).map((entity) => entity.id),
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
