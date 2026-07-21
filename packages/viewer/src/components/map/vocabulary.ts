// The map's shared id vocabulary (extracted at the V2 rebase so the layout
// modules, fixtures, and tests stop repeating the raw prefixes): domain
// `owner` strings ("colleague:raven" | "human:danvers"), work-item `assignee`
// refs (the same prefix scheme, read via assigneeColleagueId / ASSIGNEE_OPTIONS),
// and landmark position ids ("colleague:raven" | "seat:bench-1"). Three.js- and
// React-free so it stays bun-testable alongside the layout modules.

/** Domain `owner` prefix for a colleague owner (e.g. "colleague:raven"). */
export const COLLEAGUE_OWNER_PREFIX = "colleague:";

/** Domain `owner` prefix for a human owner (e.g. "human:danvers"). */
export const HUMAN_OWNER_PREFIX = "human:";

/** Landmark-position id prefix for the locked future-seat plots. */
export const LOCKED_SEAT_PREFIX = "seat:";

/** Landmark-position id prefix for colleague landmarks (M1 vocabulary). */
export const COLLEAGUE_LANDMARK_PREFIX = COLLEAGUE_OWNER_PREFIX;

/** Landmark-position id prefix for the decorative campfire (L2 — one hearth). */
export const CAMPFIRE_LANDMARK_PREFIX = "campfire:";

/**
 * Landmark-position id prefix for a Map-tab room building (Strategy Center /
 * Learning Lab, S1). Unlike the other landmark prefixes, the id after the
 * colon is not free-form — it must name one of MAP_ROOMS' fixed slots, so a
 * hand-authored `building:foo` drops the same way an unknown prefix does
 * (parseLandmarkId), rather than opening a room that doesn't exist.
 */
export const BUILDING_LANDMARK_PREFIX = "building:";

/**
 * The fixed catalog of rooms a `building:` landmark can open. A "room" is a
 * Map-tab-level MapScrimPanel overlay (RoomOverlay.tsx) — a sibling of the
 * per-entity work overlay and the colleague overlay, but keyed to one of
 * these two fixed slots instead of an entity or colleague id. `spriteKind`
 * names which of the two unused watercolor sprites (statue.png /
 * sanctuary.png — see FixedBuilding.tsx) the building renders; assigned by
 * hand here since there are only two rooms, not derived by any formula.
 */
export type MapRoomId = "strategy-center" | "learning-lab";

/** Which watercolor sprite (FixedBuilding.tsx) a room's building renders. */
export type MapRoomSpriteKind = "statue" | "sanctuary";

export const MAP_ROOMS: Record<MapRoomId, { name: string; spriteKind: MapRoomSpriteKind }> = {
  "strategy-center": { name: "Strategy Center", spriteKind: "statue" },
  "learning-lab": { name: "Learning Lab", spriteKind: "sanctuary" },
};

/** Whether a string names a known room — the `building:` prefix's allowlist. */
function isMapRoomId(value: string): value is MapRoomId {
  return Object.hasOwn(MAP_ROOMS, value);
}

export type DomainOwnerKind = "colleague" | "human";

export type DomainOwner = {
  kind: DomainOwnerKind;
  /** Bare owner id without the kind prefix, e.g. "raven". */
  id: string;
  /** Display name derived from the id. */
  name: string;
};

/**
 * The three outcomes of reading a domain's `owner` field. "unclaimed" is a
 * demand signal, not an error (the domain wants an owner); "malformed" is a
 * data problem (a prefix with no id, or an unknown "kind:" prefix) rendered
 * like unclaimed but with a warning, never as a fake owner.
 */
export type DomainOwnership =
  | { status: "owned"; owner: DomainOwner }
  | { status: "unclaimed" }
  | { status: "malformed"; raw: string };

/** Uppercase the first character; the map's id-to-display-name convention. */
export const capitalize = (value: string): string =>
  value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Parse a domain's `owner` field ("colleague:raven" | "human:danvers").
 *
 * - Absent/empty owner → unclaimed.
 * - A known prefix with an empty id ("colleague:") or an unknown "kind:"
 *   prefix ("robot:zed") → malformed, NOT a human named "Colleague:".
 * - A bare name with no ":" (e.g. "raven") is treated as a human owner
 *   rather than silently rendering the domain unclaimed — the documented
 *   fallback for hand-written state files.
 */
export function parseDomainOwner(owner: string | undefined): DomainOwnership {
  if (owner === undefined || owner.length === 0) {
    return { status: "unclaimed" };
  }

  if (owner.startsWith(COLLEAGUE_OWNER_PREFIX)) {
    const id = owner.slice(COLLEAGUE_OWNER_PREFIX.length);
    return id.length > 0
      ? { status: "owned", owner: { kind: "colleague", id, name: capitalize(id) } }
      : { status: "malformed", raw: owner };
  }

  if (owner.startsWith(HUMAN_OWNER_PREFIX)) {
    const id = owner.slice(HUMAN_OWNER_PREFIX.length);
    return id.length > 0
      ? { status: "owned", owner: { kind: "human", id, name: capitalize(id) } }
      : { status: "malformed", raw: owner };
  }

  if (owner.includes(":")) {
    return { status: "malformed", raw: owner };
  }

  return { status: "owned", owner: { kind: "human", id: owner, name: capitalize(owner) } };
}

/**
 * The bare colleague id an `assignee` names, or undefined when it names no
 * colleague. A work item's `assignee` shares the domain-`owner` prefix scheme
 * (`colleague:<id>` | `human:<id>`, parsed by parseDomainOwner), so this is
 * "the agent id when the assignee is colleague-kind, else nothing": a
 * human-kind, malformed, bare (prefix-less), or absent assignee all yield
 * undefined. The map's agent-cadence health and the coin's escalation glow
 * read work through this, so only a colleague-assigned item feeds an agent's
 * signals — a human-assigned or unassigned item feeds none.
 */
export function assigneeColleagueId(assignee?: string): string | undefined {
  const parsed = parseDomainOwner(assignee);
  return parsed.status === "owned" && parsed.owner.kind === "colleague"
    ? parsed.owner.id
    : undefined;
}

/** One selectable work-item assignee: a prefix-style ref and its display name. */
export type AssigneeOption = {
  /** The `human:<id>` | `colleague:<id>` ref stored on the work item. */
  ref: string;
  /** The display name a picker shows (and the Owner-by-assignee view labels with). */
  name: string;
};

/**
 * The valid work-item assignees (v1): the two humans and the four colleagues,
 * prefix-style (the same `owner` scheme parseDomainOwner reads), each with the
 * display name a picker renders. A single assignee per item; unassigned is
 * simply no field, so it is not an entry here. A later PR renders these as the
 * assignee picker and the Owner-by-assignee view references them; this PR only
 * adds the field and the constant.
 */
export const ASSIGNEE_OPTIONS: readonly AssigneeOption[] = [
  { ref: "human:danvers", name: "Danvers" },
  { ref: "human:jess", name: "Jess" },
  { ref: "colleague:raven", name: "Raven" },
  { ref: "colleague:damien", name: "Damien" },
  { ref: "colleague:william", name: "William" },
  { ref: "colleague:rob", name: "Rob" },
];

/**
 * The bucket key work with no assignee groups under in the Owner-by-assignee
 * view. A colon-free sentinel: a real v1 assignee is always prefix-style
 * (`human:`/`colleague:`), so this can't collide with one — only a bare,
 * hand-written assignee literally spelled "unassigned" would, a documented v1
 * edge (assignees are meant to be prefixed).
 */
export const UNASSIGNED_ASSIGNEE_KEY = "unassigned";

/** The territory label for the unassigned bucket (Owner-by-assignee view). */
export const UNASSIGNED_ASSIGNEE_LABEL = "Unassigned";

/**
 * The bucket key a work item's `assignee` groups under: the prefix-style ref
 * itself (`human:danvers` | `colleague:raven` — the identity ASSIGNEE_OPTIONS
 * lists), or UNASSIGNED_ASSIGNEE_KEY when the field is absent or empty. Map
 * entities carry `assignee` as an optional (possibly empty) string and board
 * cards as an optional non-empty one; both fold through here, so a blank
 * assignee reads as unassigned rather than its own empty-string bucket.
 */
export function assigneeKeyOf(assignee?: string): string {
  return assignee != null && assignee.length > 0 ? assignee : UNASSIGNED_ASSIGNEE_KEY;
}

/**
 * The display name an assignee bucket renders as (the Owner-by-assignee
 * territory label): UNASSIGNED_ASSIGNEE_LABEL for the unassigned key, the
 * canonical ASSIGNEE_OPTIONS name for a known v1 ref, else the name
 * parseDomainOwner derives (a colleague/human id capitalized, or a bare
 * hand-written name), else the raw ref for malformed data — shown, never
 * dropped, so bad assignee data reads as itself instead of vanishing.
 */
export function assigneeDisplayName(ref: string): string {
  if (ref === UNASSIGNED_ASSIGNEE_KEY) {
    return UNASSIGNED_ASSIGNEE_LABEL;
  }
  const option = ASSIGNEE_OPTIONS.find((candidate) => candidate.ref === ref);
  if (option) {
    return option.name;
  }
  const parsed = parseDomainOwner(ref);
  return parsed.status === "owned" ? parsed.owner.name : ref;
}

/** A parsed landmark position id; "unknown" ids carry no map furniture yet. */
export type ParsedLandmarkId =
  | { kind: "colleague"; id: string }
  | { kind: "seat"; id: string }
  | { kind: "campfire"; id: string }
  | { kind: "building"; roomId: MapRoomId }
  | { kind: "unknown"; raw: string };

/**
 * Parse a landmark position's entityId ("colleague:raven" | "seat:bench-1" |
 * "campfire:hearth" | "building:strategy-center"). The prefixes are disjoint,
 * so the check order does not matter; an empty id after any known prefix
 * falls through to "unknown" — and for `building:`, so does a non-empty id
 * that isn't one of MAP_ROOMS' fixed slots (a hand-authored "building:foo"
 * drops rather than crashing or opening a room that doesn't exist).
 */
export function parseLandmarkId(entityId: string): ParsedLandmarkId {
  if (entityId.startsWith(COLLEAGUE_LANDMARK_PREFIX)) {
    const id = entityId.slice(COLLEAGUE_LANDMARK_PREFIX.length);
    if (id.length > 0) {
      return { kind: "colleague", id };
    }
  }
  if (entityId.startsWith(LOCKED_SEAT_PREFIX)) {
    const id = entityId.slice(LOCKED_SEAT_PREFIX.length);
    if (id.length > 0) {
      return { kind: "seat", id };
    }
  }
  if (entityId.startsWith(CAMPFIRE_LANDMARK_PREFIX)) {
    const id = entityId.slice(CAMPFIRE_LANDMARK_PREFIX.length);
    if (id.length > 0) {
      return { kind: "campfire", id };
    }
  }
  if (entityId.startsWith(BUILDING_LANDMARK_PREFIX)) {
    const roomId = entityId.slice(BUILDING_LANDMARK_PREFIX.length);
    if (isMapRoomId(roomId)) {
      return { kind: "building", roomId };
    }
  }
  return { kind: "unknown", raw: entityId };
}
