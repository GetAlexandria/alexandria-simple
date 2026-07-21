import { describe, expect, it } from "bun:test";
import {
  ASSIGNEE_OPTIONS,
  MAP_ROOMS,
  UNASSIGNED_ASSIGNEE_KEY,
  UNASSIGNED_ASSIGNEE_LABEL,
  assigneeColleagueId,
  assigneeDisplayName,
  assigneeKeyOf,
  parseDomainOwner,
  parseLandmarkId,
} from "./vocabulary";

describe("parseDomainOwner", () => {
  it("parses colleague owners", () => {
    expect(parseDomainOwner("colleague:raven")).toEqual({
      status: "owned",
      owner: { kind: "colleague", id: "raven", name: "Raven" },
    });
  });

  it("parses human owners", () => {
    expect(parseDomainOwner("human:danvers")).toEqual({
      status: "owned",
      owner: { kind: "human", id: "danvers", name: "Danvers" },
    });
  });

  it("treats an absent owner as unclaimed", () => {
    expect(parseDomainOwner(undefined)).toEqual({ status: "unclaimed" });
    expect(parseDomainOwner("")).toEqual({ status: "unclaimed" });
  });

  it("treats a bare name as a human owner instead of silently unclaiming", () => {
    expect(parseDomainOwner("jess")).toEqual({
      status: "owned",
      owner: { kind: "human", id: "jess", name: "Jess" },
    });
  });

  it("flags a known prefix with an empty id as malformed, not a fake owner", () => {
    expect(parseDomainOwner("colleague:")).toEqual({ status: "malformed", raw: "colleague:" });
    expect(parseDomainOwner("human:")).toEqual({ status: "malformed", raw: "human:" });
  });

  it("flags unknown kind-prefixed strings as malformed", () => {
    expect(parseDomainOwner("robot:zed")).toEqual({ status: "malformed", raw: "robot:zed" });
    expect(parseDomainOwner(":")).toEqual({ status: "malformed", raw: ":" });
  });
});

describe("assigneeColleagueId", () => {
  it("returns the bare id for a colleague-kind assignee", () => {
    expect(assigneeColleagueId("colleague:raven")).toBe("raven");
    expect(assigneeColleagueId("colleague:damien")).toBe("damien");
  });

  it("returns undefined for a human-kind assignee", () => {
    expect(assigneeColleagueId("human:danvers")).toBeUndefined();
  });

  it("returns undefined for an absent assignee", () => {
    expect(assigneeColleagueId(undefined)).toBeUndefined();
    expect(assigneeColleagueId("")).toBeUndefined();
  });

  it("returns undefined for a malformed colleague ref (prefix, no id)", () => {
    expect(assigneeColleagueId("colleague:")).toBeUndefined();
  });

  it("treats a bare, prefix-less id as non-colleague (assignees must be prefixed)", () => {
    expect(assigneeColleagueId("raven")).toBeUndefined();
  });
});

describe("ASSIGNEE_OPTIONS", () => {
  it("lists the six v1 refs (humans then colleagues) with display names", () => {
    expect(ASSIGNEE_OPTIONS).toEqual([
      { ref: "human:danvers", name: "Danvers" },
      { ref: "human:jess", name: "Jess" },
      { ref: "colleague:raven", name: "Raven" },
      { ref: "colleague:damien", name: "Damien" },
      { ref: "colleague:william", name: "William" },
      { ref: "colleague:rob", name: "Rob" },
    ]);
  });

  it("has a well-formed owner-style ref for every option", () => {
    for (const option of ASSIGNEE_OPTIONS) {
      expect(parseDomainOwner(option.ref).status).toBe("owned");
    }
  });
});

describe("assigneeKeyOf", () => {
  it("returns the prefix-style ref unchanged when present", () => {
    expect(assigneeKeyOf("human:danvers")).toBe("human:danvers");
    expect(assigneeKeyOf("colleague:raven")).toBe("colleague:raven");
  });

  it("folds an absent or empty assignee to the unassigned key", () => {
    expect(assigneeKeyOf(undefined)).toBe(UNASSIGNED_ASSIGNEE_KEY);
    expect(assigneeKeyOf("")).toBe(UNASSIGNED_ASSIGNEE_KEY);
  });
});

describe("assigneeDisplayName", () => {
  it("uses the canonical ASSIGNEE_OPTIONS name for a known ref", () => {
    expect(assigneeDisplayName("human:danvers")).toBe("Danvers");
    expect(assigneeDisplayName("colleague:raven")).toBe("Raven");
  });

  it("labels the unassigned key with the unassigned label", () => {
    expect(assigneeDisplayName(UNASSIGNED_ASSIGNEE_KEY)).toBe(UNASSIGNED_ASSIGNEE_LABEL);
  });

  it("derives a name for an unknown-but-parseable ref (colleague/human/bare)", () => {
    expect(assigneeDisplayName("colleague:zoe")).toBe("Zoe");
    expect(assigneeDisplayName("human:sam")).toBe("Sam");
    expect(assigneeDisplayName("mystery")).toBe("Mystery");
  });

  it("falls back to the raw ref for malformed data (shown, never dropped)", () => {
    expect(assigneeDisplayName("colleague:")).toBe("colleague:");
    expect(assigneeDisplayName("robot:zed")).toBe("robot:zed");
  });
});

describe("parseLandmarkId", () => {
  it("parses colleague landmarks", () => {
    expect(parseLandmarkId("colleague:raven")).toEqual({ kind: "colleague", id: "raven" });
  });

  it("parses locked-seat landmarks", () => {
    expect(parseLandmarkId("seat:bench-1")).toEqual({ kind: "seat", id: "bench-1" });
  });

  it("parses the campfire landmark", () => {
    expect(parseLandmarkId("campfire:hearth")).toEqual({ kind: "campfire", id: "hearth" });
  });

  it("returns unknown for empty ids and foreign prefixes", () => {
    expect(parseLandmarkId("colleague:")).toEqual({ kind: "unknown", raw: "colleague:" });
    expect(parseLandmarkId("seat:")).toEqual({ kind: "unknown", raw: "seat:" });
    expect(parseLandmarkId("campfire:")).toEqual({ kind: "unknown", raw: "campfire:" });
    expect(parseLandmarkId("statue-of-jess")).toEqual({
      kind: "unknown",
      raw: "statue-of-jess",
    });
  });

  it("parses the two S1 room buildings", () => {
    expect(parseLandmarkId("building:strategy-center")).toEqual({
      kind: "building",
      roomId: "strategy-center",
    });
    expect(parseLandmarkId("building:learning-lab")).toEqual({
      kind: "building",
      roomId: "learning-lab",
    });
  });

  it("drops an empty or unrecognized building id as unknown, not a crash", () => {
    expect(parseLandmarkId("building:")).toEqual({ kind: "unknown", raw: "building:" });
    expect(parseLandmarkId("building:foo")).toEqual({ kind: "unknown", raw: "building:foo" });
  });
});

describe("MAP_ROOMS", () => {
  it("names the two S1 rooms and their sprite", () => {
    expect(MAP_ROOMS).toEqual({
      "strategy-center": { name: "Strategy Center", spriteKind: "statue" },
      "learning-lab": { name: "Learning Lab", spriteKind: "sanctuary" },
    });
  });
});
