import { describe, expect, test } from "bun:test";
import type { InfoHubCard, MapContext } from "../../app/runtime/schemas";
import { boardCardsForPlane } from "./room-board-model";

function card(overrides: Partial<InfoHubCard> & { id: string }): InfoHubCard {
  return {
    type: "task",
    status: "open",
    domainId: "alexandria",
    priority: 15,
    source: "test",
    created: "2026-07-13",
    ...overrides,
  };
}

function context(overrides: Partial<MapContext> & { id: string }): MapContext {
  return {
    domainId: "alexandria",
    name: overrides.id,
    ...overrides,
  };
}

describe("boardCardsForPlane", () => {
  test("joins a card through its context's libraryContext plane prefix", () => {
    const contexts = [context({ id: "ctx-viewer", libraryContext: "product/viewer" })];
    const cards = [card({ id: "wo-1", contextId: "ctx-viewer" })];
    expect(boardCardsForPlane(cards, contexts, "product")).toEqual(cards);
    expect(boardCardsForPlane(cards, contexts, "strategy")).toEqual([]);
  });

  test("a card with no contextId joins nothing", () => {
    const cards = [card({ id: "wo-1" })];
    expect(boardCardsForPlane(cards, [], "strategy")).toEqual([]);
  });

  test("a contextId that resolves to a context with no libraryContext joins nothing", () => {
    const contexts = [context({ id: "ctx-bare" })];
    const cards = [card({ id: "wo-1", contextId: "ctx-bare" })];
    expect(boardCardsForPlane(cards, contexts, "strategy")).toEqual([]);
  });

  test("today's real shape (no context carries a strategy/learning libraryContext) yields an empty join", () => {
    const contexts = [context({ id: "ctx-viewer", libraryContext: "product/viewer" })];
    const cards = [card({ id: "wo-1", contextId: "ctx-viewer" })];
    expect(boardCardsForPlane(cards, contexts, "strategy")).toEqual([]);
    expect(boardCardsForPlane(cards, contexts, "learning")).toEqual([]);
  });

  test("a terminal card (done/wont-do) does not join even when its context matches", () => {
    const contexts = [context({ id: "ctx-strategy", libraryContext: "strategy/bets" })];
    const cards = [
      card({ id: "wo-done", contextId: "ctx-strategy", status: "done" }),
      card({ id: "wo-wontdo", contextId: "ctx-strategy", status: "wont-do" }),
      card({ id: "wo-open", contextId: "ctx-strategy", status: "open" }),
    ];
    expect(boardCardsForPlane(cards, contexts, "strategy").map((c) => c.id)).toEqual(["wo-open"]);
  });

  test("only the segment before the first '/' counts as the plane", () => {
    const contexts = [context({ id: "ctx-nested", libraryContext: "learning/experiments/probes" })];
    const cards = [card({ id: "wo-1", contextId: "ctx-nested" })];
    expect(boardCardsForPlane(cards, contexts, "learning")).toEqual(cards);
  });
});
