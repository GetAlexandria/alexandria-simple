import { useEffect, useMemo, useState } from "react";
import { EngineCardDrawer } from "./EngineCardDrawer";
import {
  buildEngineViewModel,
  engineTestIdPart,
  engineTypeDescriptor,
  enginePlanesPresent,
  ENGINE_ALL_TYPES,
  ENGINE_GROUP_BY_LABELS,
  ENGINE_GROUP_BY_VALUES,
  ENGINE_UNFILED_ZONE_KEY,
  type EngineCardNode,
  type EngineGroupBy,
  type EngineSelectedType,
  type EngineTypeDescriptor,
  type EngineZone,
} from "./engine-view-model";
import { formatPlaneLabel } from "./plane";
import { TypeLegend } from "./TypeLegend";
import { TypeSwatch, typeTooltip } from "./TypeSwatch";
import type { LibraryCatalog } from "./types";

interface EngineLibraryViewProps {
  catalog: LibraryCatalog;
  initialSelectedPlane?: string;
  initialSelectedType?: EngineSelectedType;
}

const DEFAULT_ZONE_TONE = {
  accent: "var(--viewer-engine-zone-default-accent)",
  background: "var(--viewer-engine-zone-default-bg)",
  border: "var(--viewer-engine-zone-default-border)",
};

const CONTEXT_ZONE_TONE_KEYS = new Set([
  "library",
  "knowledge-organization",
  "playbook",
  "ledger",
  "studio",
  "runtime",
  "triggers",
  "viewer",
  ENGINE_UNFILED_ZONE_KEY,
]);

// Context keeps its own hand-picked palette (a zone key is a context name).
// Type grouping instead reuses the shared type palette directly — a zone key
// there IS the resolved type string, so the same color a card's icon/swatch
// already carries becomes the zone's color too, one palette, not two.
// Altitude/Status have no ratified palette of their own (see engine-view-
// model.ts's ALTITUDE_ORDER comment), so they fall to the neutral default
// rather than inventing new color meaning.
function zoneTone(
  zoneKey: string,
  groupBy: EngineGroupBy,
): {
  accent: string;
  background: string;
  border: string;
} {
  if (groupBy === "type") {
    const descriptor = engineTypeDescriptor(zoneKey);
    return {
      accent: descriptor.accent,
      background: descriptor.background,
      border: descriptor.border,
    };
  }

  if (groupBy !== "context") {
    return DEFAULT_ZONE_TONE;
  }

  const key = zoneKey.toLowerCase();
  if (!CONTEXT_ZONE_TONE_KEYS.has(key)) {
    return DEFAULT_ZONE_TONE;
  }

  return {
    accent: `var(--viewer-engine-zone-${key}-accent)`,
    background: `var(--viewer-engine-zone-${key}-bg)`,
    border: `var(--viewer-engine-zone-${key}-border)`,
  };
}

function TypeIcon({ descriptor, testId }: { descriptor: EngineTypeDescriptor; testId?: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center border font-sans text-[12px] font-semibold shadow-[0_0_12px_rgba(0,0,0,0.18)]"
      data-testid={testId}
      style={{
        backgroundColor: descriptor.background,
        borderColor: descriptor.border,
        color: descriptor.accent,
      }}
      title={descriptor.label}
    >
      {descriptor.icon}
    </span>
  );
}

const ENGINE_CONTROL_BUTTON_BASE =
  "h-8 border px-3 font-sans text-[12px] font-medium transition-colors";
const ENGINE_CONTROL_BUTTON_ACTIVE =
  "border-[color:var(--viewer-canvas-amber)] bg-[color:var(--viewer-canvas-slate-2)] text-[color:var(--viewer-canvas-amber-glow)]";
const ENGINE_CONTROL_BUTTON_INACTIVE =
  "border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] text-[color:var(--viewer-canvas-fg-dim)] hover:border-[color:var(--viewer-canvas-amber-dim)] hover:text-[color:var(--viewer-canvas-fg)]";

function TypeFilterButton({
  active,
  descriptor,
  label,
  onClick,
}: {
  active: boolean;
  descriptor?: EngineTypeDescriptor;
  label: string;
  onClick(): void;
}) {
  return (
    <button
      aria-pressed={active}
      className={[
        ENGINE_CONTROL_BUTTON_BASE,
        active ? ENGINE_CONTROL_BUTTON_ACTIVE : ENGINE_CONTROL_BUTTON_INACTIVE,
      ].join(" ")}
      data-testid={`engine-type-filter-${engineTestIdPart(label)}`}
      onClick={onClick}
      title={descriptor == null ? undefined : typeTooltip(descriptor)}
      type="button"
    >
      <span className="inline-flex items-center gap-2">
        {descriptor == null ? null : <TypeSwatch descriptor={descriptor} />}
        {label}
      </span>
    </button>
  );
}

function GroupByButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick(): void;
}) {
  return (
    <button
      aria-pressed={active}
      className={[
        ENGINE_CONTROL_BUTTON_BASE,
        active ? ENGINE_CONTROL_BUTTON_ACTIVE : ENGINE_CONTROL_BUTTON_INACTIVE,
      ].join(" ")}
      data-testid={`engine-group-by-${engineTestIdPart(label)}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function PlaneFilterButton({
  active,
  label,
  onClick,
  plane,
}: {
  active: boolean;
  label: string;
  onClick(): void;
  plane: string;
}) {
  return (
    <button
      aria-pressed={active}
      className={[
        ENGINE_CONTROL_BUTTON_BASE,
        active ? ENGINE_CONTROL_BUTTON_ACTIVE : ENGINE_CONTROL_BUTTON_INACTIVE,
      ].join(" ")}
      data-testid={`engine-plane-filter-${engineTestIdPart(plane)}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function EngineZoneHull({ groupBy, zone }: { groupBy: EngineGroupBy; zone: EngineZone }) {
  const tone = zoneTone(zone.key, groupBy);
  return (
    <section
      aria-label={`${zone.label} zone`}
      className="pointer-events-none absolute border p-0 shadow-[0_14px_30px_rgba(0,0,0,0.22)]"
      data-testid={`engine-zone-${engineTestIdPart(zone.key)}`}
      style={{
        backgroundColor: tone.background,
        borderColor: tone.border,
        borderRadius: 18,
        height: zone.height,
        left: zone.x,
        top: zone.y,
        width: zone.width,
      }}
    >
      <header className="flex h-[62px] items-center justify-between gap-4 border-b border-[color:var(--viewer-canvas-panel-bd)] px-5">
        <div className="min-w-0">
          <h2
            className="break-words font-display text-[24px] leading-tight"
            style={{ color: tone.accent }}
          >
            {zone.label}
          </h2>
          <p className="font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
            {zone.cardIds.length} cards / {zone.visibleCardIds.length} visible
          </p>
        </div>
        <span className="border border-[color:var(--viewer-canvas-panel-bd)] bg-[color:var(--viewer-canvas-slate)] px-2 py-1 font-sans text-[10px] font-semibold uppercase text-[color:var(--viewer-canvas-fg-dim)]">
          {zone.status}
        </span>
      </header>
      {zone.visibleCardIds.length === 0 ? (
        <div className="mx-5 mt-5 border border-dashed border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-3 py-2 font-sans text-[12px] text-[color:var(--viewer-canvas-fg-dim)]">
          No visible cards in this zone.
        </div>
      ) : null}
    </section>
  );
}

const ENGINE_CARD_BUTTON_BASE =
  "absolute grid grid-cols-[32px_1fr] gap-3 border bg-[color:var(--viewer-canvas-slate-2)] px-3 py-3 text-left shadow-[0_8px_18px_rgba(0,0,0,0.22)] outline-none transition";
const ENGINE_CARD_BUTTON_SELECTED =
  "ring-2 ring-[color:var(--viewer-canvas-amber)] ring-offset-2 ring-offset-[color:var(--viewer-canvas-bg)]";
const ENGINE_CARD_BUTTON_UNSELECTED =
  "hover:-translate-y-0.5 hover:bg-[color:var(--viewer-canvas-slate)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.28)]";

function EngineCardButton({
  node,
  onSelect,
  selected,
}: {
  node: EngineCardNode;
  onSelect(): void;
  selected: boolean;
}) {
  return (
    <button
      aria-pressed={selected}
      className={[
        ENGINE_CARD_BUTTON_BASE,
        selected ? ENGINE_CARD_BUTTON_SELECTED : ENGINE_CARD_BUTTON_UNSELECTED,
      ].join(" ")}
      data-testid={`engine-card-${engineTestIdPart(node.card.id)}`}
      onClick={onSelect}
      style={{
        borderColor: node.type.border,
        borderRadius: 6,
        height: node.height,
        left: node.x,
        opacity: node.visible ? 1 : 0,
        pointerEvents: node.visible ? "auto" : "none",
        top: node.y,
        width: node.width,
      }}
      type="button"
    >
      <TypeIcon
        descriptor={node.type}
        testId={`engine-card-icon-${engineTestIdPart(node.card.id)}`}
      />
      <span className="min-w-0">
        <span className="block truncate font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
          {node.type.label}
        </span>
        <span className="mt-1 block break-words font-display text-[17px] leading-[1.05] text-[color:var(--viewer-canvas-fg-bright)]">
          {node.card.prefLabel}
        </span>
        <span className="mt-1 inline-block border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase text-[color:var(--viewer-canvas-fg-dim)]">
          {node.card.status}
        </span>
      </span>
    </button>
  );
}

export function EngineLibraryView({
  catalog,
  initialSelectedPlane = "product",
  initialSelectedType = ENGINE_ALL_TYPES,
}: EngineLibraryViewProps) {
  const [selectedPlane, setSelectedPlane] = useState<string>(initialSelectedPlane);
  const [selectedType, setSelectedType] = useState<EngineSelectedType>(initialSelectedType);
  const [groupBy, setGroupBy] = useState<EngineGroupBy>("context");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const planeOptions = useMemo(() => enginePlanesPresent(catalog.cards), [catalog.cards]);
  const model = useMemo(
    () => buildEngineViewModel(catalog, selectedType, { groupBy, selectedPlane }),
    [catalog, groupBy, selectedPlane, selectedType],
  );
  const selectedCard =
    selectedCardId == null ? null : (model.cardsById.get(selectedCardId) ?? null);
  const selectedLinks =
    selectedCardId == null ? [] : (model.linksByCardId.get(selectedCardId) ?? []);

  useEffect(() => {
    if (selectedCardId != null && !model.cardsById.has(selectedCardId)) {
      setSelectedCardId(null);
    }
  }, [model.cardsById, selectedCardId]);

  function focusCard(cardId: string): void {
    window.setTimeout(() => {
      const element = document.querySelector<HTMLElement>(
        `[data-testid="engine-card-${engineTestIdPart(cardId)}"]`,
      );
      element?.scrollIntoView({ block: "center", inline: "center" });
      element?.focus();
    }, 0);
  }

  function navigateToCard(cardId: string): void {
    const targetNode = model.cardNodesById.get(cardId);
    if (
      targetNode != null &&
      selectedType !== ENGINE_ALL_TYPES &&
      targetNode.type.type !== selectedType
    ) {
      setSelectedType(ENGINE_ALL_TYPES);
    }
    setSelectedCardId(cardId);
    focusCard(cardId);
  }

  // Switching planes re-shelves everything (zones, type-filter row all key
  // off the newly selected plane's cards — see buildEngineViewModel). A type
  // filter left over from the old plane can select a type absent from the
  // new one (e.g. Mechanism on Learning), producing a confusingly empty
  // board, so plane switches reset to "All types" — the same reset
  // navigateToCard already does when a link jumps to a card outside the
  // current type filter.
  function selectPlane(nextPlane: string): void {
    if (nextPlane === selectedPlane) {
      return;
    }
    setSelectedPlane(nextPlane);
    setSelectedType(ENGINE_ALL_TYPES);
  }

  return (
    <section
      className="raven-canvas-section raven-kb-surface min-h-[520px] text-[color:var(--viewer-canvas-fg)]"
      data-testid="engine-library-view"
    >
      <div className="border-b border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-5 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
        <div
          aria-label="Engine plane filter"
          className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-2"
        >
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-[color:var(--viewer-canvas-amber-dim)]">
            Plane
          </span>
          {planeOptions.map((plane) => (
            <PlaneFilterButton
              active={plane === selectedPlane}
              key={plane}
              label={formatPlaneLabel(plane)}
              onClick={() => selectPlane(plane)}
              plane={plane}
            />
          ))}
        </div>
        <div className="mx-auto mt-2 flex max-w-[1180px] flex-wrap items-center gap-4">
          <div className="font-sans text-[12px] text-[color:var(--viewer-canvas-fg-dim)]">
            {formatPlaneLabel(model.selectedPlane)} / {model.visibleNodes.length} of{" "}
            {model.cardNodes.length} cards
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Engine type filter">
            <TypeFilterButton
              active={selectedType === ENGINE_ALL_TYPES}
              label="All types"
              onClick={() => setSelectedType(ENGINE_ALL_TYPES)}
            />
            {model.types.map((descriptor) => (
              <TypeFilterButton
                active={selectedType === descriptor.type}
                descriptor={descriptor}
                key={descriptor.type}
                label={descriptor.label}
                onClick={() => setSelectedType(descriptor.type)}
              />
            ))}
          </div>
        </div>
        <div
          aria-label="Engine group by"
          className="mx-auto mt-2 flex max-w-[1180px] flex-wrap items-center gap-2"
        >
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-[color:var(--viewer-canvas-amber-dim)]">
            Group by
          </span>
          {ENGINE_GROUP_BY_VALUES.map((value) => (
            <GroupByButton
              active={groupBy === value}
              key={value}
              label={ENGINE_GROUP_BY_LABELS[value]}
              onClick={() => setGroupBy(value)}
            />
          ))}
        </div>
        <div className="mx-auto mt-2 max-w-[1180px]">
          <TypeLegend catalog={catalog} />
        </div>
      </div>

      {model.zones.length === 0 ? (
        catalog.meta.metadataIssues.length > 0 ? (
          <div className="raven-etched-note raven-etched-note-danger mx-auto my-10 max-w-[760px] px-5 py-4 text-[13px]">
            <div className="font-sans text-[13px] font-semibold text-[color:var(--viewer-canvas-amber-glow)]">
              {catalog.meta.metadataIssues.length} card
              {catalog.meta.metadataIssues.length === 1 ? "" : "s"} couldn&apos;t be projected
            </div>
            <p className="mt-2 leading-5">
              The Engine builds the part-first graph from cards that carry the Brick-0 floor (
              <span className="font-sans text-[12px] font-semibold">
                type, prefLabel, plane, status, confidence, provenance
              </span>
              ). These cards are missing it, so they don&apos;t render here yet.
            </p>
            <p className="mt-2 leading-5">
              See them by folder in{" "}
              <a
                className="font-semibold underline hover:text-[color:var(--viewer-canvas-amber-glow)]"
                href="/library/folders"
              >
                Folders
              </a>
              , or the full list under{" "}
              <a
                className="font-semibold underline hover:text-[color:var(--viewer-canvas-amber-glow)]"
                href="/library/empty"
              >
                Empty Library → Issues
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="raven-etched-note mx-auto my-10 max-w-[760px] px-5 py-4 font-sans text-[13px]">
            No Product cards projected.
          </div>
        )
      ) : (
        <div className="overflow-x-auto px-4 py-5">
          <div
            className="relative mx-auto"
            style={{
              height: model.height,
              minWidth: model.width,
              width: model.width,
            }}
          >
            <div className="absolute inset-0 z-0">
              {model.zones.map((zone) => (
                <EngineZoneHull groupBy={groupBy} key={zone.key} zone={zone} />
              ))}
            </div>
            <div className="absolute inset-0 z-20">
              {model.visibleNodes.map((node) => (
                <EngineCardButton
                  key={node.card.id}
                  node={node}
                  onSelect={() => setSelectedCardId(node.card.id)}
                  selected={selectedCardId === node.card.id}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <EngineCardDrawer
        card={selectedCard}
        links={selectedLinks}
        onClose={() => setSelectedCardId(null)}
        onNavigate={navigateToCard}
      />
    </section>
  );
}
