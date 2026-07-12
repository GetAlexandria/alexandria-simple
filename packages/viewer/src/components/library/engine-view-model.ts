import type {
  LibraryCatalog,
  LibraryCatalogCard,
  LibraryCatalogConfidence,
  LibraryCatalogEdge,
  LibraryCatalogProvenance,
  LibraryCatalogTypeMappingEntry,
} from "./types";

export const ENGINE_UNFILED_ZONE_KEY = "unfiled";
export const ENGINE_ALL_TYPES = "all";

const ZONE_COLUMNS = 2;
const VIEW_PADDING = 32;
const ZONE_WIDTH = 540;
const ZONE_GAP_X = 44;
const ZONE_GAP_Y = 46;
const ZONE_HEADER_HEIGHT = 76;
const ZONE_PADDING = 26;
const CARD_WIDTH = 210;
const CARD_HEIGHT = 82;
const CARD_GAP = 18;

const CONTEXT_ORDER = [
  "library",
  "knowledge-organization",
  "playbook",
  "ledger",
  "studio",
  "runtime",
  "triggers",
  "viewer",
  ENGINE_UNFILED_ZONE_KEY,
];

// A card's status is the one other closed, ratified enum in the card
// contract (packages/ax/src/domain/library-catalog.ts's
// PRODUCT_CARD_STATUS_VALUES) — duplicated here rather than imported for the
// same reason the ruled type categories are duplicated above: the viewer
// and ax packages don't share a runtime.
const STATUS_ORDER = ["confirmed", "stub", "deprecated"];

// Altitude has no fixed enum in the card contract (a free string by design —
// see library-catalog.ts), so unlike Type or Status there is no ratified set
// to pre-seed empty zones from. This ordering is only a display convenience
// for the values that are actually in use; an unrecognized value sorts after
// every recognized one, alphabetically.
const ALTITUDE_ORDER = [
  "keystone",
  "pillar",
  "aggregate",
  "component",
  "capability",
  "context",
  "value",
];

const CONTAINMENT_EDGE_TYPES = new Set([
  "contained-by",
  "contains",
  "has-part",
  "includes",
  "owns",
  "owned-by",
  "part-of",
]);

export interface EngineTypeDescriptor {
  accent: string;
  background: string;
  border: string;
  definition: string;
  differsFrom: string;
  icon: string;
  label: string;
  order: number;
  type: string;
}

// The fourteen ruled families categories (packages/ax/src/domain/atomic-card-categories.ts)
// are the single source of truth for card-type color/icon/definition — this
// used to be a DDD/event-storming vocabulary (Aggregate, Read Model, System,
// Agent, User, External) that overlapped the ruled set on only three entries
// (Surface, Capability, Entity, kept below with their existing colors for
// continuity), leaving most ruled categories to fall through to Unknown.
// Definitions are grounded product copy (see plan.md's "Type definitions"
// table and issue #634), not invented.
//
// Director ruling 2026-07-06 (docs/alexandria/plans/strategy-plane-rebuild/
// design-log.md): Bet and Principle are first-class card `type` values in
// their own right, not nested under a Rationale bucket via typeMapping. The
// old Rationale entry is retired from the live taxonomy; Bet keeps its
// position in the ordering and Principle — the normative heir to the
// settled "why" — inherits Rationale's old indigo color for continuity.
export const ENGINE_TYPE_ICON_SET: EngineTypeDescriptor[] = [
  {
    accent: "var(--viewer-engine-type-bet-accent)",
    background: "var(--viewer-engine-type-bet-bg)",
    border: "var(--viewer-engine-type-bet-border)",
    definition:
      "A falsifiable strategy-plane wager the product is making, staked before the evidence is in (e.g. Bet - Atomic, Agent-Readable Knowledge).",
    differsFrom:
      "vs Principle: can be proven wrong by evidence; a Principle is held regardless of outcome.",
    icon: "B",
    label: "Bet",
    order: 10,
    type: "Bet",
  },
  {
    accent: "var(--viewer-engine-type-principle-accent)",
    background: "var(--viewer-engine-type-principle-bg)",
    border: "var(--viewer-engine-type-principle-border)",
    definition:
      "A normative strategy-plane rule the product holds to (kinds: experience-goal, standard, refusal, ruling), e.g. Principle - Legible Graph.",
    differsFrom: "vs Bet: held regardless of outcome; a Bet can be proven wrong by evidence.",
    icon: "§",
    label: "Principle",
    order: 15,
    type: "Principle",
  },
  {
    accent: "var(--viewer-engine-type-research-accent)",
    background: "var(--viewer-engine-type-research-bg)",
    border: "var(--viewer-engine-type-research-border)",
    definition:
      "External findings and results that inform product decisions — lives on the Learning plane as evidence that can inform bets, experiments, and measures.",
    differsFrom:
      "vs Experiment/Measure: a finding or result record, not the bounded test or standing quantity that produced it.",
    icon: "H",
    label: "Research",
    order: 20,
    type: "Research",
  },
  {
    accent: "var(--viewer-engine-type-experiment-accent)",
    background: "var(--viewer-engine-type-experiment-bg)",
    border: "var(--viewer-engine-type-experiment-border)",
    definition:
      "A bounded Learning-plane test with a pre-committed question, instrument, and stopping rule.",
    differsFrom:
      "vs Research: the test being run, not the finding it produces; vs Measure: bounded by design, not a standing quantity.",
    icon: "X",
    label: "Experiment",
    order: 24,
    type: "Experiment",
  },
  {
    accent: "var(--viewer-engine-type-measure-accent)",
    background: "var(--viewer-engine-type-measure-bg)",
    border: "var(--viewer-engine-type-measure-border)",
    definition:
      "A standing Learning-plane quantity the product watches over time, often feeding experiments and research results.",
    differsFrom:
      "vs Experiment: persistent reading, not a bounded test; vs Research: instrument definition, not a reported finding.",
    icon: "#",
    label: "Measure",
    order: 26,
    type: "Measure",
  },
  {
    accent: "var(--viewer-engine-type-arc-accent)",
    background: "var(--viewer-engine-type-arc-bg)",
    border: "var(--viewer-engine-type-arc-border)",
    definition:
      "A Learning-plane release story told atomically: narrates a cross-shelf slice of experiments, measures, and research — the keystone move at the little-picture scale.",
    differsFrom:
      "vs a keystone: narrates one release slice, not the whole plane; vs Research/Experiment/Measure: the cross-shelf story that ties them together, not a single piece of evidence.",
    icon: "A",
    label: "Arc",
    order: 28,
    type: "Arc",
  },
  {
    accent: "var(--viewer-engine-type-role-accent)",
    background: "var(--viewer-engine-type-role-bg)",
    border: "var(--viewer-engine-type-role-border)",
    definition:
      "A person or AI colleague who acts within the product (e.g. Role - Director, Role - AI Colleague, Role - Raven).",
    differsFrom: "vs Entities: who acts, not a thing the product tracks.",
    icon: "L",
    label: "Role",
    order: 30,
    type: "Role",
  },
  {
    accent: "var(--viewer-engine-type-domain-accent)",
    background: "var(--viewer-engine-type-domain-bg)",
    border: "var(--viewer-engine-type-domain-border)",
    definition:
      "A division or business unit of the company that owns the product — where a sibling product's own library lives (e.g. Domain - Playmaker's Studio Library, a federation pointer to PMS's library).",
    differsFrom:
      "vs Context: a company-level division, not a container within one product's plane.",
    icon: "D",
    label: "Domain",
    order: 40,
    type: "Domain",
  },
  {
    accent: "var(--viewer-engine-type-surface-accent)",
    background: "var(--viewer-engine-type-surface-bg)",
    border: "var(--viewer-engine-type-surface-border)",
    definition:
      "A bounded place where material lands or work is seen — not itself lifecycle-bearing. e.g. Inbox.",
    differsFrom: "vs Entities: the place, not the thing.",
    icon: "S",
    label: "Surface",
    order: 50,
    type: "Surface",
  },
  {
    accent: "var(--viewer-engine-type-entity-accent)",
    background: "var(--viewer-engine-type-entity-bg)",
    border: "var(--viewer-engine-type-entity-border)",
    definition:
      "A thing with its own identity and lifecycle/state that moves through the process. e.g. Source, Thread, the draft Library.",
    differsFrom: "vs Surfaces: the thing, not the place it sits.",
    icon: "E",
    label: "Entity",
    order: 60,
    type: "Entity",
  },
  {
    accent: "var(--viewer-engine-type-capability-accent)",
    background: "var(--viewer-engine-type-capability-bg)",
    border: "var(--viewer-engine-type-capability-border)",
    definition: "An operation the product performs — what a play does. e.g. Source Assessment.",
    differsFrom: "vs Mechanisms: what it does, not the rule by which it happens.",
    icon: "C",
    label: "Capability",
    order: 70,
    type: "Capability",
  },
  {
    accent: "var(--viewer-engine-type-mechanism-accent)",
    background: "var(--viewer-engine-type-mechanism-bg)",
    border: "var(--viewer-engine-type-mechanism-border)",
    definition:
      "The rule or gate by which something happens. e.g. Confirmation Gate, Draft Overlay.",
    differsFrom: "vs Capabilities: the gate, not the operation.",
    icon: "M",
    label: "Mechanism",
    order: 80,
    type: "Mechanism",
  },
  {
    accent: "var(--viewer-engine-type-pattern-accent)",
    background: "var(--viewer-engine-type-pattern-bg)",
    border: "var(--viewer-engine-type-pattern-border)",
    definition: "A named recurring arc across the product. e.g. Front-of-House Walk.",
    differsFrom: "vs Mechanisms: a whole multi-step arc, not one gate.",
    icon: "P",
    label: "Pattern",
    order: 90,
    type: "Pattern",
  },
  {
    accent: "var(--viewer-engine-type-economy-accent)",
    background: "var(--viewer-engine-type-economy-bg)",
    border: "var(--viewer-engine-type-economy-border)",
    definition:
      "Real product economics — currency, pricing, stock, seats, tiers. Alexandria (an agentic product) has ~none yet, so rightly near-empty.",
    differsFrom:
      "The value-objects once filed here (Plane, Thread Status) are not Economy — they're altitude: value, a different axis; rehome them.",
    icon: "$",
    label: "Economy",
    order: 100,
    type: "Economy",
  },
];

const UNKNOWN_TYPE: EngineTypeDescriptor = {
  accent: "var(--viewer-engine-type-unknown-accent)",
  background: "var(--viewer-engine-type-unknown-bg)",
  border: "var(--viewer-engine-type-unknown-border)",
  definition:
    "A type that doesn't (yet) resolve to a ruled category — taxonomy drift, surfaced on purpose.",
  differsFrom: "vs every ruled category: it isn't one, until re-typed or mapped.",
  icon: "?",
  label: "Unknown",
  order: 1000,
  type: "Unknown",
};

const TYPE_BY_NORMALIZED = new Map(
  ENGINE_TYPE_ICON_SET.map((descriptor) => [normalizeType(descriptor.type), descriptor]),
);

export type EngineEdgeClass = "containment" | "relationship";
export type EngineSelectedType = typeof ENGINE_ALL_TYPES | string;
export type EngineLinkDirection = "inbound" | "outbound";

// The Engine's grouping axis: "one library, multiple sorts" (plan.md, Part B)
// rather than a separate view per axis. Context is the default and the only
// axis the Constellation ever asks for (buildConstellationLayout never
// passes groupBy) — its container-axis ruling is settled independently of
// whatever a director has the Engine's own toggle set to.
export const ENGINE_GROUP_BY_VALUES = ["context", "type", "altitude", "status"] as const;
export type EngineGroupBy = (typeof ENGINE_GROUP_BY_VALUES)[number];

export const ENGINE_GROUP_BY_LABELS: Record<EngineGroupBy, string> = {
  altitude: "Altitude",
  context: "Context",
  status: "Status",
  type: "Type",
};

export interface EngineCardNode {
  card: LibraryCatalogCard;
  height: number;
  type: EngineTypeDescriptor;
  visible: boolean;
  width: number;
  x: number;
  y: number;
  zoneKey: string;
}

export interface EngineZone {
  cardIds: string[];
  height: number;
  key: string;
  label: string;
  status: "empty" | "filled" | "partial";
  visibleCardIds: string[];
  width: number;
  x: number;
  y: number;
}

export interface EngineDrawerLink {
  direction: EngineLinkDirection;
  edge: LibraryCatalogEdge;
  edgeClass: EngineEdgeClass;
  otherCard: LibraryCatalogCard;
}

export interface EngineViewModel {
  cardsById: Map<string, LibraryCatalogCard>;
  cardNodes: EngineCardNode[];
  cardNodesById: Map<string, EngineCardNode>;
  groupBy: EngineGroupBy;
  height: number;
  linksByCardId: Map<string, EngineDrawerLink[]>;
  selectedPlane: string;
  selectedType: EngineSelectedType;
  types: EngineTypeDescriptor[];
  visibleNodes: EngineCardNode[];
  width: number;
  zones: EngineZone[];
}

interface ZoneDraft {
  cardIds: string[];
  key: string;
  label: string;
  order: number;
}

export interface EngineViewModelOptions {
  groupBy?: EngineGroupBy;
  selectedPlane?: string;
  // Skips the isEngineCard floor (plane/gap-status/confidence/provenance) so
  // every catalog card is projected. Exists for the Constellation, which
  // shows the whole library rather than the Engine's projected floor.
  includeAllCards?: boolean;
}

function normalizeType(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeContext(value: string): string {
  const trimmed = value.trim();
  return trimmed.length === 0 ? ENGINE_UNFILED_ZONE_KEY : trimmed;
}

function normalizePlane(value: string): string {
  return value.trim().toLowerCase();
}

function contextSortKey(value: string): number {
  const normalized = value.toLowerCase();
  const index = CONTEXT_ORDER.indexOf(normalized);
  return index < 0 ? CONTEXT_ORDER.length : index;
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatContextLabel(value: string): string {
  const normalized = normalizeContext(value);
  if (normalized === ENGINE_UNFILED_ZONE_KEY) {
    return "unfiled";
  }

  return titleCase(normalized);
}

function hasValidProvenance(provenance: LibraryCatalogProvenance): boolean {
  return provenance.label.trim().length > 0;
}

function hasValidConfidence(confidence: LibraryCatalogConfidence): boolean {
  return confidence === "high" || confidence === "medium" || confidence === "low";
}

function isEngineCard(card: LibraryCatalogCard, selectedPlane: string): boolean {
  return (
    normalizePlane(card.plane) === selectedPlane &&
    card.status.trim().toLowerCase() !== "gap" &&
    hasValidConfidence(card.confidence) &&
    hasValidProvenance(card.provenance)
  );
}

function compareTypeDescriptors(left: EngineTypeDescriptor, right: EngineTypeDescriptor): number {
  return left.order - right.order || left.label.localeCompare(right.label);
}

interface GroupDescriptor {
  key: string;
  label: string;
  order: number;
}

// Dispatches a card to its zone under whichever axis is selected. Context
// keeps its existing registry-aware behavior (buildZoneDrafts still reads
// catalog.areas for it); the other three are computed straight from the
// card. Type and Status key off closed, ratified enums, so their order is
// meaningful; Altitude has no enum, so unrecognized values fall to the end,
// alphabetically among themselves.
function groupDescriptorForCard(
  card: LibraryCatalogCard,
  groupBy: EngineGroupBy,
  typeMapping: readonly LibraryCatalogTypeMappingEntry[],
): GroupDescriptor {
  if (groupBy === "type") {
    const descriptor = engineTypeDescriptor(card.type, typeMapping);
    return { key: descriptor.type, label: descriptor.label, order: descriptor.order };
  }

  if (groupBy === "status") {
    const normalized = card.status.trim().toLowerCase();
    const index = STATUS_ORDER.indexOf(normalized);
    return {
      key: normalized.length === 0 ? "unknown" : normalized,
      label: normalized.length === 0 ? "Unknown" : titleCase(normalized),
      order: index < 0 ? STATUS_ORDER.length : index,
    };
  }

  if (groupBy === "altitude") {
    const raw = card.altitude?.trim().toLowerCase() ?? "";
    const index = ALTITUDE_ORDER.indexOf(raw);
    return {
      key: raw.length === 0 ? "unspecified" : raw,
      label: raw.length === 0 ? "Unspecified" : titleCase(raw),
      order: index < 0 ? ALTITUDE_ORDER.length : index,
    };
  }

  const zoneKey = normalizeContext(card.context);
  return { key: zoneKey, label: formatContextLabel(zoneKey), order: contextSortKey(zoneKey) };
}

function compareCards(
  left: LibraryCatalogCard,
  right: LibraryCatalogCard,
  typeMapping: readonly LibraryCatalogTypeMappingEntry[],
  groupBy: EngineGroupBy,
): number {
  const leftGroup = groupDescriptorForCard(left, groupBy, typeMapping);
  const rightGroup = groupDescriptorForCard(right, groupBy, typeMapping);
  // Secondary axis: whichever of context/type isn't the primary grouping
  // still orders cards within a zone, so the view stays legible rather than
  // falling straight to an alphabetical scramble.
  const secondary =
    groupBy === "type"
      ? contextSortKey(normalizeContext(left.context)) -
        contextSortKey(normalizeContext(right.context))
      : engineTypeDescriptor(left.type, typeMapping).order -
        engineTypeDescriptor(right.type, typeMapping).order;

  return (
    leftGroup.order - rightGroup.order ||
    leftGroup.key.localeCompare(rightGroup.key) ||
    secondary ||
    left.prefLabel.localeCompare(right.prefLabel) ||
    left.id.localeCompare(right.id)
  );
}

function edgeClassForType(type: string): EngineEdgeClass {
  return CONTAINMENT_EDGE_TYPES.has(normalizeType(type)) ? "containment" : "relationship";
}

export function engineTestIdPart(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized.length === 0 ? "blank" : normalized;
}

export function engineZoneKeyForCard(card: LibraryCatalogCard): string {
  return normalizeContext(card.context);
}

// Resolves a raw card `type` to its palette descriptor: by identity against
// the fourteen ruled categories first, else the bundle's own locked `typeMapping`
// (last matching rename/merge entry wins — a lenient reader, not a validating
// write-time gate), else Unknown. Mirrors
// packages/ax/src/domain/library-catalog-links.ts's `resolveCardCategory` —
// duplicated, not imported, because the viewer and ax packages don't share a
// runtime (see notepad-view-model.ts's roleStyle for the same accepted cost).
export function engineTypeDescriptor(
  type: string,
  typeMapping: readonly LibraryCatalogTypeMappingEntry[] = [],
): EngineTypeDescriptor {
  const identityMatch = TYPE_BY_NORMALIZED.get(normalizeType(type));
  if (identityMatch != null) {
    return identityMatch;
  }

  const normalized = normalizeType(type);
  let resolvedTo: string | undefined;
  for (const entry of typeMapping) {
    if (normalizeType(entry.from) !== normalized) {
      continue;
    }
    if (entry.disposition !== "rename" && entry.disposition !== "merge") {
      continue;
    }
    if (entry.to != null) {
      resolvedTo = entry.to;
    }
  }

  if (resolvedTo != null) {
    const mappedDescriptor = TYPE_BY_NORMALIZED.get(normalizeType(resolvedTo));
    if (mappedDescriptor != null) {
      return mappedDescriptor;
    }
  }

  return UNKNOWN_TYPE;
}

// The plan.md-named export: a shared resolver Slice B's story chips/legend
// consume alongside the Engine view, both keyed off the same descriptor.
export const typeDescriptor = engineTypeDescriptor;

export function engineEdgeClass(type: string): EngineEdgeClass {
  return edgeClassForType(type);
}

function buildContextZoneDrafts(
  catalog: LibraryCatalog,
  cards: LibraryCatalogCard[],
  selectedPlane: string,
): ZoneDraft[] {
  const draftsByKey = new Map<string, ZoneDraft>();

  function ensureZone(rawContext: string, rawLabel?: string): ZoneDraft {
    const key = normalizeContext(rawContext);
    const existing = draftsByKey.get(key);
    if (existing != null) {
      return existing;
    }

    const labelSource = rawLabel != null && rawLabel.trim().length > 0 ? rawLabel : key;
    const draft: ZoneDraft = {
      cardIds: [],
      key,
      label: formatContextLabel(labelSource),
      order: contextSortKey(key),
    };
    draftsByKey.set(key, draft);
    return draft;
  }

  for (const area of catalog.areas) {
    if (normalizePlane(area.plane) === selectedPlane) {
      ensureZone(area.context, area.label);
    }
  }

  for (const card of cards) {
    ensureZone(card.context).cardIds.push(card.id);
  }

  return [...draftsByKey.values()];
}

// Seeds one zone per ratified enum value (a card's type, resolved through
// the ruled type categories, or its status) so an empty bucket — the
// Economy category, zero deprecated cards — renders as a visible, meaningful
// absence rather than silently not appearing (plan.md: "off-canon types
// render as Unknown, on purpose" — the same "show the empty shelf" instinct
// extended to every ratified bucket, not just off-canon drift).
function buildEnumZoneDrafts(
  cards: LibraryCatalogCard[],
  groupBy: "status" | "type",
  typeMapping: readonly LibraryCatalogTypeMappingEntry[],
): ZoneDraft[] {
  const draftsByKey = new Map<string, ZoneDraft>();

  function ensureZone(descriptor: GroupDescriptor): ZoneDraft {
    const existing = draftsByKey.get(descriptor.key);
    if (existing != null) {
      return existing;
    }
    const draft: ZoneDraft = {
      cardIds: [],
      key: descriptor.key,
      label: descriptor.label,
      order: descriptor.order,
    };
    draftsByKey.set(descriptor.key, draft);
    return draft;
  }

  if (groupBy === "type") {
    for (const known of ENGINE_TYPE_ICON_SET) {
      ensureZone({ key: known.type, label: known.label, order: known.order });
    }
  } else {
    STATUS_ORDER.forEach((status, index) => {
      ensureZone({ key: status, label: titleCase(status), order: index });
    });
  }

  for (const card of cards) {
    const descriptor = groupDescriptorForCard(card, groupBy, typeMapping);
    ensureZone(descriptor).cardIds.push(card.id);
  }

  return [...draftsByKey.values()];
}

// Altitude has no ratified enum (see ALTITUDE_ORDER's comment), so unlike
// type/status there is no fixed set to pre-seed — zones are derived purely
// from what's present.
function buildAltitudeZoneDrafts(
  cards: LibraryCatalogCard[],
  typeMapping: readonly LibraryCatalogTypeMappingEntry[],
): ZoneDraft[] {
  const draftsByKey = new Map<string, ZoneDraft>();

  for (const card of cards) {
    const descriptor = groupDescriptorForCard(card, "altitude", typeMapping);
    const existing = draftsByKey.get(descriptor.key);
    if (existing == null) {
      draftsByKey.set(descriptor.key, {
        cardIds: [card.id],
        key: descriptor.key,
        label: descriptor.label,
        order: descriptor.order,
      });
    } else {
      existing.cardIds.push(card.id);
    }
  }

  return [...draftsByKey.values()];
}

function buildZoneDrafts(
  catalog: LibraryCatalog,
  cards: LibraryCatalogCard[],
  selectedPlane: string,
  groupBy: EngineGroupBy,
  typeMapping: readonly LibraryCatalogTypeMappingEntry[],
): ZoneDraft[] {
  const drafts =
    groupBy === "context"
      ? buildContextZoneDrafts(catalog, cards, selectedPlane)
      : groupBy === "altitude"
        ? buildAltitudeZoneDrafts(cards, typeMapping)
        : buildEnumZoneDrafts(cards, groupBy, typeMapping);

  return drafts.sort(
    (left, right) => left.order - right.order || left.label.localeCompare(right.label),
  );
}

// Exported so any surface that needs "which type descriptors are present in
// this set of cards" (e.g. TypeLegend.tsx) computes it the same way the
// Engine view's own type-filter row does — one presence rule, not two.
export function buildTypeDescriptors(
  cards: readonly LibraryCatalogCard[],
  typeMapping: readonly LibraryCatalogTypeMappingEntry[],
): EngineTypeDescriptor[] {
  const descriptorsByType = new Map<string, EngineTypeDescriptor>();

  for (const card of cards) {
    const descriptor = engineTypeDescriptor(card.type, typeMapping);
    descriptorsByType.set(descriptor.type, descriptor);
  }

  return [...descriptorsByType.values()].sort(compareTypeDescriptors);
}

// The three ratified planes (strategy-plane-rebuild, learning-plane-build)
// sort first and in that canonical order; anything else (drift, a future
// plane not yet threaded through this ordering) falls after, alphabetically.
const PLANE_ORDER = ["product", "strategy", "learning"];

function planeSortKey(value: string): number {
  const index = PLANE_ORDER.indexOf(value);
  return index < 0 ? PLANE_ORDER.length : index;
}

// One plane button per plane actually carried by a real card — not
// catalog.meta.planes (a bundle can name a plane in its schema, or a gap can
// cite one, before any card lands on it; see samplePartialLibraryCatalog's
// gap-only Learning area). Mirrors buildTypeDescriptors's presence rule for
// the type-filter row: derive the switcher from what's actually there.
export function enginePlanesPresent(cards: readonly LibraryCatalogCard[]): string[] {
  const planes = new Set<string>();
  for (const card of cards) {
    const normalized = normalizePlane(card.plane);
    if (normalized.length > 0) {
      planes.add(normalized);
    }
  }

  return [...planes].sort(
    (left, right) => planeSortKey(left) - planeSortKey(right) || left.localeCompare(right),
  );
}

export function buildEngineViewModel(
  catalog: LibraryCatalog,
  selectedType: EngineSelectedType = ENGINE_ALL_TYPES,
  options: EngineViewModelOptions = {},
): EngineViewModel {
  const selectedPlane = normalizePlane(options.selectedPlane ?? "product");
  const groupBy = options.groupBy ?? "context";
  const typeMapping = catalog.typeMapping ?? [];
  const allCards = catalog.cards
    .filter((card) => options.includeAllCards === true || isEngineCard(card, selectedPlane))
    .sort((left, right) => compareCards(left, right, typeMapping, groupBy));
  const cardsById = new Map(allCards.map((card) => [card.id, card]));
  const visibleCardIds = new Set(
    allCards
      .filter(
        (card) =>
          selectedType === ENGINE_ALL_TYPES ||
          engineTypeDescriptor(card.type, typeMapping).type === selectedType,
      )
      .map((card) => card.id),
  );
  const zoneDrafts = buildZoneDrafts(catalog, allCards, selectedPlane, groupBy, typeMapping);
  const zoneLayoutRows: Array<{ drafts: ZoneDraft[]; height: number }> = [];

  for (let index = 0; index < zoneDrafts.length; index += ZONE_COLUMNS) {
    const drafts = zoneDrafts.slice(index, index + ZONE_COLUMNS);
    const height = Math.max(
      ...drafts.map((draft) => {
        const rows = Math.max(1, Math.ceil(draft.cardIds.length / 2));
        return ZONE_HEADER_HEIGHT + ZONE_PADDING + rows * CARD_HEIGHT + (rows - 1) * CARD_GAP;
      }),
    );
    zoneLayoutRows.push({ drafts, height });
  }

  const zones: EngineZone[] = [];
  const cardNodes: EngineCardNode[] = [];
  let nextY = VIEW_PADDING;

  for (const row of zoneLayoutRows) {
    row.drafts.forEach((draft, columnIndex) => {
      const zoneX = VIEW_PADDING + columnIndex * (ZONE_WIDTH + ZONE_GAP_X);
      const zoneY = nextY;
      const visibleIds = draft.cardIds.filter((cardId) => visibleCardIds.has(cardId));

      zones.push({
        cardIds: draft.cardIds,
        height: row.height,
        key: draft.key,
        label: draft.label,
        status:
          draft.cardIds.length === 0 ? "empty" : visibleIds.length === 0 ? "partial" : "filled",
        visibleCardIds: visibleIds,
        width: ZONE_WIDTH,
        x: zoneX,
        y: zoneY,
      });

      draft.cardIds.forEach((cardId, cardIndex) => {
        const card = cardsById.get(cardId);
        if (card == null) {
          return;
        }
        const cardColumn = cardIndex % 2;
        const cardRow = Math.floor(cardIndex / 2);
        const x = zoneX + ZONE_PADDING + cardColumn * (CARD_WIDTH + CARD_GAP);
        const y = zoneY + ZONE_HEADER_HEIGHT + cardRow * (CARD_HEIGHT + CARD_GAP);
        cardNodes.push({
          card,
          height: CARD_HEIGHT,
          type: engineTypeDescriptor(card.type, typeMapping),
          visible: visibleCardIds.has(card.id),
          width: CARD_WIDTH,
          x,
          y,
          zoneKey: draft.key,
        });
      });
    });
    nextY += row.height + ZONE_GAP_Y;
  }

  const cardNodesById = new Map(cardNodes.map((node) => [node.card.id, node]));

  // The Engine no longer draws typed links (Constellation owns that now — see
  // director QA ruling), but the card drawer still lists them per card, so
  // this stays: an edge contributes a link only when both endpoints resolve
  // to a projected card, regardless of the current type filter's visibility.
  const linksByCardId = new Map<string, EngineDrawerLink[]>();
  for (const edge of catalog.edges) {
    const fromCard = cardsById.get(edge.from);
    const toCard = cardsById.get(edge.to);
    if (fromCard == null || toCard == null) {
      continue;
    }
    const edgeClass = edgeClassForType(edge.type);

    const outboundLinks = linksByCardId.get(edge.from) ?? [];
    outboundLinks.push({ direction: "outbound", edge, edgeClass, otherCard: toCard });
    linksByCardId.set(edge.from, outboundLinks);

    const inboundLinks = linksByCardId.get(edge.to) ?? [];
    inboundLinks.push({ direction: "inbound", edge, edgeClass, otherCard: fromCard });
    linksByCardId.set(edge.to, inboundLinks);
  }

  for (const links of linksByCardId.values()) {
    links.sort(
      (left, right) =>
        left.direction.localeCompare(right.direction) ||
        left.edge.type.localeCompare(right.edge.type) ||
        left.otherCard.prefLabel.localeCompare(right.otherCard.prefLabel) ||
        left.edge.id.localeCompare(right.edge.id),
    );
  }

  const activeColumns = Math.max(1, Math.min(ZONE_COLUMNS, zoneDrafts.length));
  const width = VIEW_PADDING * 2 + activeColumns * ZONE_WIDTH + (activeColumns - 1) * ZONE_GAP_X;
  const height = Math.max(320, nextY - ZONE_GAP_Y + VIEW_PADDING);

  return {
    cardsById,
    cardNodes,
    cardNodesById,
    groupBy,
    height,
    linksByCardId,
    selectedPlane,
    selectedType,
    types: buildTypeDescriptors(allCards, typeMapping),
    visibleNodes: cardNodes.filter((node) => node.visible),
    width,
    zones,
  };
}
