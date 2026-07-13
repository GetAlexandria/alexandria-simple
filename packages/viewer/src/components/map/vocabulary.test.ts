import { describe, expect, it } from "bun:test";
import { parseDomainOwner, parseLandmarkId } from "./vocabulary";

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
});
