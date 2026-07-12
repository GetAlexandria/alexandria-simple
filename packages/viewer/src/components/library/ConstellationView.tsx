import { useMemo, useState } from "react";
import {
  buildConstellationLayout,
  constellationRegionCounts,
  type ConstellationStar,
} from "./constellation-view-model";
import { buildTypeDescriptors } from "./engine-view-model";
import { TypeSwatch, typeTooltip } from "./TypeSwatch";
import type { LibraryCatalog, LibraryCatalogCard, LibraryCatalogEdge } from "./types";

interface ConstellationViewProps {
  catalog: LibraryCatalog;
}

function ContextCounts({ catalog }: { catalog: LibraryCatalog }) {
  const layout = useMemo(() => buildConstellationLayout(catalog), [catalog]);
  const counts = useMemo(() => constellationRegionCounts(layout), [layout]);

  return (
    <div className="mt-5 space-y-2">
      {counts.map(({ count, key, label }) => (
        <div
          className="flex items-center justify-between border-b border-[#3b2c20] py-1.5 font-display text-[15px] text-[#e8e0d4]"
          key={key}
        >
          <span>{label}</span>
          <span className="text-[#d4a052]">
            {count} <em className="text-[12px] text-[#8f806c]">cards</em>
          </span>
        </div>
      ))}
    </div>
  );
}

// TypeLegend (EmptyLibraryView/EngineLibraryView) is themed for a light
// header; this starfield sidebar is dark. Same shared TypeSwatch primitive
// and typeTooltip convention, its own themed wrapper — mirrors how
// TypeFilterButton (Engine, interactive) and TypeLegend (passive, light)
// already both wrap TypeSwatch rather than duplicating swatch markup.
function DarkTypeLegend({ catalog }: { catalog: LibraryCatalog }) {
  const descriptors = useMemo(
    () => buildTypeDescriptors(catalog.cards, catalog.typeMapping ?? []),
    [catalog.cards, catalog.typeMapping],
  );

  if (descriptors.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-col gap-1.5" data-testid="constellation-type-legend">
      {descriptors.map((descriptor) => (
        <span
          className="flex items-center gap-1.5 font-display text-[13px] text-[#e8e0d4]"
          key={descriptor.type}
          title={typeTooltip(descriptor)}
        >
          <TypeSwatch descriptor={descriptor} />
          {descriptor.label}
        </span>
      ))}
    </div>
  );
}

function outboundCount(edges: readonly LibraryCatalogEdge[], cardId: string): number {
  return edges.filter((edge) => edge.from === cardId).length;
}

function HoverDetails({
  card,
  edges,
}: {
  card: LibraryCatalogCard | null;
  edges: readonly LibraryCatalogEdge[];
}) {
  if (card == null) {
    return (
      <p className="font-display text-[14px] italic leading-7 text-[#8f806c]">
        Mouse over any star to see its name, type, and connections.
      </p>
    );
  }

  return (
    <div className="font-display text-[14px] leading-7 text-[#e8e0d4]">
      <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#b8863a]">Name</div>
      <b className="text-[16px] text-[#f0d49a]">{card.prefLabel}</b>
      <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[#b8863a]">Type</div>
      <div>{card.type}</div>
      <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[#b8863a]">Context</div>
      <div>{card.context}</div>
      <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[#b8863a]">Connections</div>
      <div>{outboundCount(edges, card.id)} outbound</div>
    </div>
  );
}

function regionBounds(stars: readonly ConstellationStar[]): {
  radius: number;
  x: number;
  y: number;
} {
  const xs = stars.map((star) => star.x);
  const ys = stars.map((star) => star.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    radius: Math.max(maxX - minX, maxY - minY) / 2 + 60,
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
}

export function ConstellationView({ catalog }: ConstellationViewProps) {
  const layout = useMemo(() => buildConstellationLayout(catalog), [catalog]);
  const cardsById = useMemo(
    () => new Map(catalog.cards.map((card) => [card.id, card])),
    [catalog.cards],
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const connected =
    hoveredId == null ? null : (layout.connectedCardIdsByCard.get(hoveredId) ?? null);
  const hoveredCard = hoveredId == null ? null : (cardsById.get(hoveredId) ?? null);

  return (
    <section className="grid min-h-[400px] grid-cols-[minmax(0,1fr)_280px] gap-4 bg-[radial-gradient(ellipse_at_50%_35%,rgba(40,56,100,0.25)_0%,transparent_55%),radial-gradient(ellipse_at_center,#0a1226_0%,#050912_100%)] p-[14px_16px_20px]">
      <div className="overflow-hidden rounded-[4px] border border-[#2d332f] bg-[radial-gradient(ellipse_at_center,rgba(20,30,60,0.15)_0%,transparent_70%)]">
        <svg
          aria-label="Library constellation"
          className="block aspect-[2000/1400] h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          viewBox="0 0 2000 1400"
        >
          <rect fill="#050914" height="1400" width="2000" />
          {layout.regions.map((region) => {
            if (region.stars.length === 0) {
              return null;
            }
            const bounds = regionBounds(region.stars);
            return (
              <ellipse
                cx={bounds.x}
                cy={bounds.y}
                fill="rgba(212,160,82,0.035)"
                key={region.key}
                rx={bounds.radius}
                ry={bounds.radius}
              />
            );
          })}
          <g>
            {layout.lines.map((line) => {
              const touchesHovered =
                hoveredId != null && (line.from === hoveredId || line.to === hoveredId);
              return (
                <line
                  key={line.id}
                  stroke={touchesHovered ? "rgba(122,212,196,0.85)" : "rgba(212,160,82,0.12)"}
                  strokeWidth={touchesHovered ? 1 : 0.4}
                  vectorEffect="non-scaling-stroke"
                  x1={line.x1}
                  x2={line.x2}
                  y1={line.y1}
                  y2={line.y2}
                />
              );
            })}
          </g>
          <g>
            {layout.regions.flatMap((region) =>
              region.stars.map((star) => {
                const faded =
                  hoveredId != null && hoveredId !== star.card.id && !connected?.has(star.card.id);
                const highlighted = hoveredId === star.card.id;
                const color = star.type.accent;
                return (
                  <g
                    className="cursor-crosshair"
                    key={star.card.id}
                    onMouseEnter={() => setHoveredId(star.card.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    opacity={faded ? 0.18 : 1}
                  >
                    <circle
                      cx={star.x}
                      cy={star.y}
                      fill={color}
                      opacity={highlighted ? 0.3 : 0.05}
                      r="12"
                    />
                    <circle
                      cx={star.x}
                      cy={star.y}
                      fill={color}
                      opacity={highlighted ? 0.85 : 0.2}
                      r="5.5"
                    />
                    <circle cx={star.x} cy={star.y} fill={color} r="2.4" />
                    {star.isKeyStar ? (
                      <text
                        fill="#e8e0d4"
                        fontFamily="Cormorant Garamond, Georgia, serif"
                        fontSize="13"
                        textAnchor="middle"
                        x={star.x}
                        y={star.y - 10}
                      >
                        {star.card.prefLabel}
                      </text>
                    ) : highlighted ? (
                      <text
                        fill="#e8e0d4"
                        fontFamily="Cormorant Garamond, Georgia, serif"
                        fontSize="12"
                        textAnchor="middle"
                        x={star.x}
                        y={star.y - 9}
                      >
                        {star.card.prefLabel}
                      </text>
                    ) : null}
                  </g>
                );
              }),
            )}
          </g>
          <g>
            {layout.regions.map((region) => {
              if (region.stars.length === 0) {
                return null;
              }
              const bounds = regionBounds(region.stars);
              return (
                <g key={`label-${region.key}`}>
                  <text
                    fill="#d4a052"
                    fontFamily="Cormorant Garamond, Georgia, serif"
                    fontSize="19"
                    letterSpacing="0.12em"
                    textAnchor="middle"
                    x={bounds.x}
                    y={bounds.y - bounds.radius - 14}
                  >
                    {region.label.toUpperCase()}
                  </text>
                  <text
                    fill="#8f806c"
                    fontFamily="Cormorant Garamond, Georgia, serif"
                    fontSize="15"
                    fontStyle="italic"
                    textAnchor="middle"
                    x={bounds.x}
                    y={bounds.y - bounds.radius}
                  >
                    {region.stars.length} cards
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <aside className="sticky top-[14px] h-fit rounded-[4px] border border-[#3b2c20] bg-[linear-gradient(180deg,rgba(58,44,28,0.45)_0%,rgba(44,32,20,0.40)_100%)] p-4">
        <h2 className="border-b border-[#322619] pb-[6px] font-display text-[14px] uppercase tracking-[0.18em] text-[#d4a052]">
          Hover a star
        </h2>
        <div className="min-h-[100px] py-4">
          <HoverDetails card={hoveredCard} edges={catalog.edges} />
        </div>
        <h2 className="mt-[18px] border-b border-[#322619] pb-[6px] font-display text-[14px] uppercase tracking-[0.18em] text-[#d4a052]">
          Type key
        </h2>
        <DarkTypeLegend catalog={catalog} />
        <h2 className="mt-[18px] border-b border-[#322619] pb-[6px] font-display text-[14px] uppercase tracking-[0.18em] text-[#d4a052]">
          Contexts
        </h2>
        <ContextCounts catalog={catalog} />
      </aside>
    </section>
  );
}
