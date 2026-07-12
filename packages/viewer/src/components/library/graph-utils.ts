import type { GroupedLibraryCards, LibraryGraph, LibraryGraphCard } from "./types";

// Exported for reuse by constellation-view-model.ts's catalog-driven layout
// (the same golden-angle-spiral math, applied to contexts instead of
// territory/subfolder clusters) — one shared positioning algorithm, not two.
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function clusterKey(card: LibraryGraphCard): string {
  return `${card.territory}/${card.subfolder}`;
}

export function spacingFor(count: number): number {
  if (count > 60) {
    return 18;
  }
  if (count > 20) {
    return 16;
  }
  if (count > 8) {
    return 18;
  }
  return 22;
}

function compareGroupedCards(left: GroupedLibraryCards, right: GroupedLibraryCards): number {
  return (
    left.territory.localeCompare(right.territory) || left.subfolder.localeCompare(right.subfolder)
  );
}

function compareCards(left: LibraryGraphCard, right: LibraryGraphCard): number {
  return left.title.localeCompare(right.title) || left.id.localeCompare(right.id);
}

export function fallbackClusterCenter(index: number): readonly [number, number] {
  const radius = 180 + 72 * Math.sqrt(index);
  const theta = index * GOLDEN_ANGLE;

  return [1000 + radius * Math.cos(theta), 700 + radius * Math.sin(theta)];
}

export function groupCards(graph: LibraryGraph): GroupedLibraryCards[] {
  const grouped = new Map<string, GroupedLibraryCards>();

  for (const card of graph.cards) {
    const key = clusterKey(card);
    const existing =
      grouped.get(key) ??
      ({
        cards: [],
        subfolder: card.subfolder,
        territory: card.territory,
      } satisfies GroupedLibraryCards);
    existing.cards.push(card);
    grouped.set(key, existing);
  }

  return [...grouped.values()]
    .map((group) => ({
      ...group,
      cards: [...group.cards].sort(compareCards),
    }))
    .sort(compareGroupedCards);
}
