// The Constellation's derived data: a live projection of the served
// LibraryCatalog, not a separate stale LibraryGraph model. Containers are the
// same contexts (and the same canonical order) buildEngineViewModel already
// derives for the Engine view — one source of truth for "which containers
// exist," not two independently-derived lists. Every catalog card becomes a
// star (the Engine's plane/gap/schema floor doesn't apply here — the
// Constellation shows the whole served library, denser sky included). Star
// placement reuses graph-utils.ts's existing golden-angle-spiral math (the
// same shape as the Engine/Folders-serving code, applied to a different
// grouping key); star color reuses the shared typeDescriptor palette from
// engine-view-model.ts. Since the Engine view lost its own drawn line layer
// (PR #656), this is now the surface where connections are visible — a
// faint wispy line per catalog edge whose endpoints both have stars.
import {
  buildEngineViewModel,
  engineTypeDescriptor,
  ENGINE_ALL_TYPES,
  type EngineTypeDescriptor,
} from "./engine-view-model";
import { fallbackClusterCenter, GOLDEN_ANGLE, spacingFor } from "./graph-utils";
import type { LibraryCatalog, LibraryCatalogCard, LibraryCatalogEdge } from "./types";

export interface ConstellationStar {
  card: LibraryCatalogCard;
  isKeyStar: boolean;
  type: EngineTypeDescriptor;
  x: number;
  y: number;
}

// A faint thread tracing one catalog edge between two placed stars — any
// edge type, cross-region allowed. `id` is the edge id (the React key,
// since two edges can share both endpoints); `from`/`to` are card ids, for
// hover look-up; x1/y1/x2/y2 are the two stars' already-computed positions.
export interface ConstellationLine {
  id: string;
  from: string;
  to: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ConstellationRegion {
  center: readonly [number, number];
  key: string;
  label: string;
  stars: ConstellationStar[];
}

export interface PositionedConstellation {
  connectedCardIdsByCard: Map<string, Set<string>>;
  lines: ConstellationLine[];
  regions: ConstellationRegion[];
  starsByCardId: Map<string, ConstellationStar>;
}

function compareCardsByLabel(left: LibraryCatalogCard, right: LibraryCatalogCard): number {
  return left.prefLabel.localeCompare(right.prefLabel) || left.id.localeCompare(right.id);
}

function outDegreeByCardId(edges: readonly LibraryCatalogEdge[]): Map<string, number> {
  const outDegree = new Map<string, number>();
  for (const edge of edges) {
    outDegree.set(edge.from, (outDegree.get(edge.from) ?? 0) + 1);
  }
  return outDegree;
}

// The key star for a constellation: its highest-out-degree member, ties
// broken alphabetically by prefLabel — deterministic regardless of card
// iteration order.
function selectKeyStarId(
  cards: readonly LibraryCatalogCard[],
  outDegree: ReadonlyMap<string, number>,
): string | undefined {
  return [...cards].sort(
    (left, right) =>
      (outDegree.get(right.id) ?? 0) - (outDegree.get(left.id) ?? 0) ||
      compareCardsByLabel(left, right),
  )[0]?.id;
}

export function buildConstellationLayout(catalog: LibraryCatalog): PositionedConstellation {
  const model = buildEngineViewModel(catalog, ENGINE_ALL_TYPES, { includeAllCards: true });
  const typeMapping = catalog.typeMapping ?? [];
  const outDegree = outDegreeByCardId(catalog.edges);
  const regions: ConstellationRegion[] = [];
  const starsByCardId = new Map<string, ConstellationStar>();

  model.zones
    .filter((zone) => zone.cardIds.length > 0)
    .forEach((zone, zoneIndex) => {
      const center = fallbackClusterCenter(zoneIndex);
      const cards = zone.cardIds
        .map((cardId) => model.cardsById.get(cardId))
        .filter((card): card is LibraryCatalogCard => card != null)
        .sort(compareCardsByLabel);
      const keyStarId = selectKeyStarId(cards, outDegree);
      const spacing = spacingFor(cards.length);

      const stars: ConstellationStar[] = cards.map((card, cardIndex) => {
        const radius = spacing * Math.sqrt(cardIndex + 0.5);
        const theta = cardIndex * GOLDEN_ANGLE;
        const star: ConstellationStar = {
          card,
          isKeyStar: card.id === keyStarId,
          type: engineTypeDescriptor(card.type, typeMapping),
          x: center[0] + radius * Math.cos(theta),
          y: center[1] + radius * Math.sin(theta),
        };
        starsByCardId.set(card.id, star);
        return star;
      });

      regions.push({ center, key: zone.key, label: zone.label, stars });
    });

  // One pass over every catalog edge, after all stars are placed: any edge
  // type, cross-region included — a faint thread wherever both endpoints
  // have a star. The Engine view lost its own drawn line layer (PR #656),
  // so this is now the surface where connections are visible.
  const lines: ConstellationLine[] = [];
  for (const edge of catalog.edges) {
    const from = starsByCardId.get(edge.from);
    const to = starsByCardId.get(edge.to);
    if (from == null || to == null) {
      continue;
    }
    lines.push({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
    });
  }

  const connectedCardIdsByCard = new Map<string, Set<string>>();
  for (const edge of catalog.edges) {
    if (!starsByCardId.has(edge.from) || !starsByCardId.has(edge.to)) {
      continue;
    }
    const fromConnected = connectedCardIdsByCard.get(edge.from) ?? new Set<string>();
    fromConnected.add(edge.to);
    connectedCardIdsByCard.set(edge.from, fromConnected);
    const toConnected = connectedCardIdsByCard.get(edge.to) ?? new Set<string>();
    toConnected.add(edge.from);
    connectedCardIdsByCard.set(edge.to, toConnected);
  }

  return { connectedCardIdsByCard, lines, regions, starsByCardId };
}

export function constellationRegionCounts(
  positioned: PositionedConstellation,
): Array<{ count: number; key: string; label: string }> {
  return positioned.regions
    .map((region) => ({ count: region.stars.length, key: region.key, label: region.label }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}
