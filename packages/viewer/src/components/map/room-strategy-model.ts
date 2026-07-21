// Strategy Center's dashboard model (S2): "the metrics we're winning and
// losing by, relative to our major bets." Pure derivation over the library
// catalog's Bet/Measure cards — three.js- and React-free, like placement.ts
// and signals.ts, so every grouping and reading-state rule is bun-testable
// and RoomOverlay only renders the shape this module hands it.
//
// The join, verified against a real `/api/library/catalog` payload
// (2026-07-21, 21 Bets / 5 Measures): a Bet's `links.derived_from` — when
// present — names exactly one OTHER Bet's full catalog id ("Bet - <prefLabel>",
// never a bracketed wikilink and never a bare prefLabel). The 3 corporate
// anchor bets (`home: "company-library"`) carry no `derived_from` of their
// own; every other Bet in the current library derives from exactly one
// anchor, one level deep. A Measure's `derived_from` (when present) names an
// ANCHOR's id directly in every measure the library currently carries — this
// module still resolves a measure through a nested bet's own `derived_from`
// defensively (never silently dropping a measure a future card authors one
// level deeper than today's data does), and files anything that resolves to
// no anchor as "unattached" rather than dropping it.
//
// Measures live in the LEARNING plane (`plane: "learning"`) but ARE the
// strategy metrics — attaching them here by design, per the room's brief,
// not a bug in the plane split.

import type { LibraryCatalogCard } from "../../app/runtime/schemas";

/** A Bet/Measure's `home` value that marks it one of the 3 corporate anchors. */
const ANCHOR_HOME = "company-library";

/**
 * Strip a catalog id or prefLabel's leading "<Type> - " stem, e.g.
 * "Bet - Named Colleagues" -> "Named Colleagues". Catalog ids are always
 * "<Type> - <prefLabel>"; in the current library `prefLabel` itself never
 * repeats the stem (the server already strips it), so this is a no-op most
 * of the time — it exists so a card that DOES carry the redundant stem still
 * displays clean rather than doubling the type name.
 */
export function cardDisplayName(card: Pick<LibraryCatalogCard, "prefLabel" | "type">): string {
  const stem = `${card.type} - `;
  return card.prefLabel.startsWith(stem) ? card.prefLabel.slice(stem.length) : card.prefLabel;
}

/**
 * Strip a raw catalog id's "<Type> - " stem without a card to resolve it
 * against (Learning Lab's "bet(s) it tests" reads straight off a `links`
 * array of ids). Ids are always "<Type> - <prefLabel>" with a single-word
 * type, so splitting on the FIRST " - " is safe even when a prefLabel later
 * contains " - " of its own.
 */
export function stripCatalogIdStem(id: string): string {
  const separatorIndex = id.indexOf(" - ");
  return separatorIndex === -1 ? id : id.slice(separatorIndex + 3);
}

export type ReadingState = "no-reading" | "reading";

/**
 * v1 heuristic (deliberate, per the room's brief): a Measure's free-string
 * `trend` narration reads as "no reading yet" when it starts with "Not yet"
 * (case-insensitive) — the only signal a narrative trend field offers before
 * a real instrumentation-status field exists. A missing/blank trend reads the
 * same way: there is nothing to call a reading. Every other trend text reads
 * as an active reading, however early or rough.
 */
export function measureReadingState(trend: string | undefined): ReadingState {
  const normalized = (trend ?? "").trim();
  if (normalized.length === 0) {
    return "no-reading";
  }
  return normalized.toLowerCase().startsWith("not yet") ? "no-reading" : "reading";
}

/** "3 risks" / "1 risk" / "0 risks" — the bet row's risk-count chip. */
export function riskCountLabel(riskCount: number): string {
  return `${riskCount} ${riskCount === 1 ? "risk" : "risks"}`;
}

export interface StrategyBetRow {
  id: string;
  displayName: string;
  status: string;
  confidence: string;
  cost: string | null;
  altitude: string | null;
  riskCount: number;
}

export interface StrategyMeasureRow {
  id: string;
  displayName: string;
  target: string | null;
  trend: string | null;
  readingState: ReadingState;
}

export interface StrategyAnchorGroup {
  anchor: StrategyBetRow;
  /** `transfer === "pending"` on the anchor card — drives the "Transfer pending" badge. */
  transferPending: boolean;
  nestedBets: readonly StrategyBetRow[];
  measures: readonly StrategyMeasureRow[];
}

export interface StrategyDashboard {
  anchors: readonly StrategyAnchorGroup[];
  /** Bets whose `derived_from` resolves to no anchor (including anchor-less orphans) — never dropped. */
  otherBets: readonly StrategyBetRow[];
  /** Measures whose `derived_from` resolves to no anchor (including measures with none at all) — never dropped. */
  unattachedMeasures: readonly StrategyMeasureRow[];
}

function betRow(card: LibraryCatalogCard): StrategyBetRow {
  return {
    id: card.id,
    displayName: cardDisplayName(card),
    status: card.status,
    confidence: card.confidence,
    cost: card.cost ?? null,
    altitude: card.altitude ?? null,
    riskCount: card.risks?.length ?? 0,
  };
}

function measureRow(card: LibraryCatalogCard): StrategyMeasureRow {
  return {
    id: card.id,
    displayName: cardDisplayName(card),
    target: card.target ?? null,
    trend: card.trend ?? null,
    readingState: measureReadingState(card.trend),
  };
}

/** The first `derived_from` entry present in `candidateIds`, else null. */
function firstMatchingDerivedFrom(
  card: LibraryCatalogCard,
  candidateIds: ReadonlySet<string>,
): string | null {
  const derived = card.links?.derived_from ?? [];
  for (const id of derived) {
    if (candidateIds.has(id)) {
      return id;
    }
  }
  return null;
}

/**
 * Bucket `items` by their resolved anchor id, filing anything that resolves
 * to no anchor under `unattached` instead of dropping it — the shared shape
 * behind both the nested-bets-by-anchor and measures-by-anchor groupings
 * below.
 */
function groupByAnchor<T, Row>(
  items: readonly T[],
  resolveAnchorId: (item: T) => string | null,
  toRow: (item: T) => Row,
): { byAnchor: Map<string, Row[]>; unattached: Row[] } {
  const byAnchor = new Map<string, Row[]>();
  const unattached: Row[] = [];
  for (const item of items) {
    const anchorId = resolveAnchorId(item);
    if (anchorId == null) {
      unattached.push(toRow(item));
      continue;
    }
    const bucket = byAnchor.get(anchorId) ?? [];
    bucket.push(toRow(item));
    byAnchor.set(anchorId, bucket);
  }
  return { byAnchor, unattached };
}

export function buildStrategyDashboard(cards: readonly LibraryCatalogCard[]): StrategyDashboard {
  const bets = cards.filter((card) => card.type === "Bet");
  const measures = cards.filter((card) => card.type === "Measure");

  const anchorCards = bets.filter((card) => card.home === ANCHOR_HOME);
  const anchorIds = new Set(anchorCards.map((card) => card.id));
  const nonAnchorBets = bets.filter((card) => !anchorIds.has(card.id));

  // One-level resolution: a non-anchor bet -> the anchor id it derives from
  // (or none, filed under "Other bets"). Built before measures resolve so a
  // measure that (defensively) cites a NESTED bet can walk one hop further.
  const anchorIdByBetId = new Map<string, string>();
  for (const bet of nonAnchorBets) {
    const anchorId = firstMatchingDerivedFrom(bet, anchorIds);
    if (anchorId != null) {
      anchorIdByBetId.set(bet.id, anchorId);
    }
  }

  function resolveAnchorId(card: LibraryCatalogCard): string | null {
    const direct = firstMatchingDerivedFrom(card, anchorIds);
    if (direct != null) {
      return direct;
    }
    const derived = card.links?.derived_from ?? [];
    for (const id of derived) {
      const viaBet = anchorIdByBetId.get(id);
      if (viaBet != null) {
        return viaBet;
      }
    }
    return null;
  }

  const { byAnchor: nestedBetsByAnchor, unattached: otherBets } = groupByAnchor(
    nonAnchorBets,
    (bet) => anchorIdByBetId.get(bet.id) ?? null,
    betRow,
  );

  const { byAnchor: measuresByAnchor, unattached: unattachedMeasures } = groupByAnchor(
    measures,
    resolveAnchorId,
    measureRow,
  );

  const anchors: StrategyAnchorGroup[] = anchorCards.map((card) => ({
    anchor: betRow(card),
    transferPending: card.transfer === "pending",
    nestedBets: nestedBetsByAnchor.get(card.id) ?? [],
    measures: measuresByAnchor.get(card.id) ?? [],
  }));

  return { anchors, otherBets, unattachedMeasures };
}
