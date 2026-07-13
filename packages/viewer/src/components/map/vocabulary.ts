// The map's shared id vocabulary (extracted at the V2 rebase so the layout
// modules, fixtures, and tests stop repeating the raw prefixes): domain
// `owner` strings ("colleague:raven" | "human:danvers") and landmark
// position ids ("colleague:raven" | "seat:bench-1"). Three.js- and
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

/** A parsed landmark position id; "unknown" ids carry no map furniture yet. */
export type ParsedLandmarkId =
  | { kind: "colleague"; id: string }
  | { kind: "seat"; id: string }
  | { kind: "campfire"; id: string }
  | { kind: "unknown"; raw: string };

/**
 * Parse a landmark position's entityId ("colleague:raven" | "seat:bench-1" |
 * "campfire:hearth"). The prefixes are disjoint, so the check order does not
 * matter; an empty id after any known prefix falls through to "unknown".
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
  return { kind: "unknown", raw: entityId };
}
