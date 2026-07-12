import {
  createCardResolver,
  normalizeResolverKey,
  normalizeWikilinkTarget,
} from "@alexandria/library-card-resolver";
import type { LibraryCatalog, LibraryCatalogCard } from "./library-catalog.js";
import {
  type CanonicalCardType,
  LIBRARY_CATALOG_LINK_KEYS,
  labelForLibraryCatalogLinkKey,
  resolveCardCategory,
  type LibraryCatalogLinkKey,
  type LibraryCatalogTypeMappingEntry,
} from "./library-catalog-links.js";

export interface LibraryCatalogStoryBuckets {
  how: string;
  what: string;
  when: string;
  why: string;
}

export interface LibraryCatalogDiagramConnector {
  label: string;
  targetLabel: string;
  targetCardId?: string;
}

export interface LibraryCatalogDiagram {
  connectors?: LibraryCatalogDiagramConnector[];
  flow?: string[];
  kind: "feeds" | "hub" | "lifecycle";
}

export type ProductCardStoryLintRule = "diagram-parity" | "no-orphans";

// The closed set of story-lint rules, single-sourced so the CLI's `--rule`
// selector validates against exactly the rules the linter can emit.
export const PRODUCT_CARD_STORY_LINT_RULES: readonly ProductCardStoryLintRule[] = [
  "no-orphans",
  "diagram-parity",
];

export interface ProductCardStoryLintViolation {
  cardId?: string;
  context: string;
  leadCardId: string;
  message: string;
  rule: ProductCardStoryLintRule;
}

// The card-body sections that feed the catalog story. WHERE is locational
// detail, so it still folds into the how-it-does-it bucket (after native
// HOW). WHY and WHEN are each their own first-class story bucket (learning-
// plane reshape, flight board #672 / director ruling 2026-07-08: authored
// WHY/WHEN prose was invisible, folded and truncated into the how bucket) —
// they no longer fold into `how`. WHEN remains the planning/roadmap slot:
// present only on `horizon: future` cards (issue #633), conditionally
// required there (see `missingFillSections` in library-catalog.ts).
// parseMarkdownSections, the how-bucket fold, the why/when buckets, and the
// missing-card wikilink scan in library-catalog.ts all derive from this
// list, so adding a section here propagates to every consumer at once.
export const STORY_SECTION_NAMES = ["what", "where", "why", "how", "when"] as const;

export type LibraryCatalogMarkdownSections = Record<(typeof STORY_SECTION_NAMES)[number], string>;

export interface LibraryCatalogWikilink {
  label: string;
  target: string;
}

interface StoryMention {
  label: string;
  target: string;
  targetCardId?: string;
}

type CardResolver = (label: string) => LibraryCatalogCard | undefined;

const WIKILINK_PATTERN = /\[\[([^\]]+)\]\]/g;
const SECTION_HEADING_PATTERN = /^##\s+([A-Za-z][A-Za-z0-9 -]*)\s*$/;

export const LIBRARY_CATALOG_ALTITUDE_WORDS = [
  "keystone",
  "pillar",
  "context",
  "aggregate",
  "component",
  "value",
  "capability",
] as const;

const LEAD_ALTITUDE_RANK: Record<string, number> = {
  aggregate: 5,
  capability: 2,
  component: 4,
  context: 3,
  keystone: 7,
  pillar: 6,
  value: 1,
};

// Cap a rendered story so a runaway card body can't bloat the catalog payload.
// 6,000 (was 2,400): the no-orphans rule requires a context lead's HOW to
// narrate and wikilink every member of its context, and a large shelf (the
// learning plane's research context carries nineteen members) cannot honestly
// tell all of them inside 2,400 chars of folded WHERE+HOW. At 2,400 the cap
// cut the experiments lead's story mid-sentence and hid its later member
// links from the lint as truncation-orphans no author could fix. The cap
// stays a runaway guard, not a design length — the lint and the renderer
// keep reading the same capped story, so coverage is judged on exactly the
// text a reader sees.
const STORY_BUCKET_MAX_CHARS = 6000;
const LEGACY_STORY_MAX_CHARS = 1600;

// Re-exported as the catalog domain's name for the shared normalization so the
// many existing callers in this module keep working unchanged.
export function normalizeKey(value: string): string {
  return normalizeResolverKey(value);
}

function normalizeSectionName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function wikilinkLabel(rawTarget: string): string {
  const parts = rawTarget.split("|");
  const label = parts.length > 1 ? parts.at(-1) : parts[0];
  return (label ?? rawTarget).split("#")[0]?.trim() ?? rawTarget.trim();
}

function stripStubMarker(value: string): string {
  return value.replace(/_Stub\s*[—-]_/gi, "").replace(/\bStub\s*[—-]\s*/gi, "");
}

function normalizeParagraphs(value: string): string[] {
  return stripStubMarker(value)
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join(" "),
    )
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter((paragraph) => paragraph.length > 0);
}

function stripStarterLabel(value: string, labels: readonly RegExp[]): string {
  let current = value.trim();
  for (const label of labels) {
    current = current.replace(label, "").trim();
  }
  return current;
}

function splitWhatCompatibility(whatSection: string): { how: string[]; what: string[] } {
  const what: string[] = [];
  const how: string[] = [];
  const whatLabels = [/^What it does\.\s*/i, /^What it'?s for\.\s*/i];
  const howLabels = [/^How it works\.\s*/i, /^How it does it\.\s*/i];

  for (const paragraph of normalizeParagraphs(whatSection)) {
    if (howLabels.some((label) => label.test(paragraph))) {
      const stripped = stripStarterLabel(paragraph, howLabels);
      if (stripped.length > 0) {
        how.push(stripped);
      }
      continue;
    }

    const stripped = stripStarterLabel(paragraph, whatLabels);
    if (stripped.length > 0) {
      what.push(stripped);
    }
  }

  return { how, what };
}

function parseMarkdownSections(content: string): LibraryCatalogMarkdownSections {
  const sections = new Map<string, string[]>();
  let current: string | null = null;

  for (const line of content.replace(/\r\n/g, "\n").split("\n")) {
    const heading = SECTION_HEADING_PATTERN.exec(line.trim());
    if (heading?.[1] != null) {
      current = normalizeSectionName(heading[1]);
      if (!sections.has(current)) {
        sections.set(current, []);
      }
      continue;
    }

    if (current != null) {
      sections.get(current)?.push(line);
    }
  }

  return Object.fromEntries(
    STORY_SECTION_NAMES.map((name) => [name, sections.get(name)?.join("\n") ?? ""]),
  ) as LibraryCatalogMarkdownSections;
}

export function extractCatalogMarkdownSections(content: string): LibraryCatalogMarkdownSections {
  return parseMarkdownSections(content);
}

export interface FrontmatterBlock {
  body: string;
  lines: string[];
}

// Extracts the `---`-fenced frontmatter block, its exact body suffix, and its
// meaningful lines (blank and `#`-comment lines removed), or null when there is
// no block. The single owner of the frontmatter fence shape for every
// catalog/FoH reader, so the regex and the comment-skip live in exactly one place.
export function splitFrontmatter(content: string): FrontmatterBlock | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  if (match?.[1] == null) {
    return null;
  }
  return {
    body: content.slice(match[0].length),
    lines: match[1]
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0 && !line.trimStart().startsWith("#")),
  };
}

// Removes a leading `---`-fenced frontmatter block so body-only readers (e.g.
// keystone wikilink extraction) don't pick up `[[...]]` written in frontmatter
// values. Derives from `splitFrontmatter` so the fence shape lives in one place.
export function stripLeadingFrontmatter(content: string): string {
  return splitFrontmatter(content)?.body ?? content;
}

export function extractCatalogWikilinks(content: string): LibraryCatalogWikilink[] {
  const wikilinks: LibraryCatalogWikilink[] = [];
  for (const match of content.matchAll(WIKILINK_PATTERN)) {
    const rawTarget = match[1];
    if (rawTarget == null) {
      continue;
    }
    const target = normalizeWikilinkTarget(rawTarget);
    const label = wikilinkLabel(rawTarget);
    if (target.length > 0 && label.length > 0) {
      wikilinks.push({ label, target });
    }
  }
  return wikilinks;
}

function joinStoryParagraphs(paragraphs: readonly string[]): string {
  return paragraphs.join("\n\n").slice(0, STORY_BUCKET_MAX_CHARS);
}

export function extractCatalogStoryBuckets(content: string): LibraryCatalogStoryBuckets {
  const sections = parseMarkdownSections(content);
  // WHAT is split for compatibility labels; WHERE is locational detail and
  // folds into the how-it-does-it bucket, after native HOW. WHY and WHEN are
  // rendered as their own buckets rather than folding in (director ruling
  // 2026-07-08).
  const splitWhat = splitWhatCompatibility(sections.what);
  const foldedIntoHow = [
    ...normalizeParagraphs(sections.where),
    ...normalizeParagraphs(sections.how),
  ];

  return {
    how: joinStoryParagraphs([...splitWhat.how, ...foldedIntoHow]),
    what: joinStoryParagraphs(splitWhat.what),
    when: joinStoryParagraphs(normalizeParagraphs(sections.when)),
    why: joinStoryParagraphs(normalizeParagraphs(sections.why)),
  };
}

export function extractCatalogLegacyStory(content: string): string {
  const sections = parseMarkdownSections(content);
  return joinStoryParagraphs(normalizeParagraphs(sections.what)).slice(0, LEGACY_STORY_MAX_CHARS);
}

export function createCatalogCardResolver(cards: readonly LibraryCatalogCard[]): CardResolver {
  return createCardResolver(cards);
}

function linkTargetContent(entry: string): string {
  const trimmed = entry.trim();
  const wikilink = /^\[\[([^\]]+)\]\]$/.exec(trimmed);
  return wikilink?.[1]?.trim() ?? trimmed;
}

function connectorFromLink(
  key: LibraryCatalogLinkKey,
  target: string,
  resolveCard: CardResolver,
): LibraryCatalogDiagramConnector | null {
  const targetContent = linkTargetContent(target);
  const normalizedTarget = normalizeWikilinkTarget(targetContent);
  const fallbackLabel = wikilinkLabel(targetContent);
  if (normalizedTarget.length === 0 || fallbackLabel.length === 0) {
    return null;
  }

  const targetCard = resolveCard(normalizedTarget);
  return {
    label: labelForLibraryCatalogLinkKey(key),
    targetLabel: targetCard?.prefLabel ?? fallbackLabel,
    ...(targetCard == null ? {} : { targetCardId: targetCard.id }),
  };
}

function linkConnectorsForCard(
  card: LibraryCatalogCard,
  resolveCard: CardResolver,
): LibraryCatalogDiagramConnector[] {
  const connectors: LibraryCatalogDiagramConnector[] = [];
  for (const key of LIBRARY_CATALOG_LINK_KEYS) {
    for (const target of card.links?.[key] ?? []) {
      const connector = connectorFromLink(key, target, resolveCard);
      if (connector != null) {
        connectors.push(connector);
      }
    }
  }
  return connectors;
}

// Load-time bridge so Back-of-House sweep cards draw a relationship diagram.
// The diagram kinds below key off the canonical render types (aggregate/surface/
// value/read-model), but a sweep names cards with product-descriptive types
// (Concept, Stage, Gate, ...). Each of those is a node with outbound typed
// links, so we route it to the "aggregate" (hub) shape — the card at the centre,
// its links radiating out. Canonical render types are left untouched, so this
// never changes how an authored library draws. The durable fix is settling one
// shared category vocabulary (the §5b track), after which this map can go.
const DIAGRAM_TYPE_ALIASES: Record<string, string> = {
  agent: "aggregate",
  concept: "aggregate",
  gate: "aggregate",
  mechanic: "aggregate",
  process: "aggregate",
  rendering: "aggregate",
  stage: "aggregate",
};

// The ruled families categories render natively — no alias needed. A Pattern
// or Mechanism that resolves with a `flow` is a named arc → the functional
// flow diagram; every other resolved category — and a flow-less Pattern or
// Mechanism — is an entity-like hub (the card at the centre, its typed links
// radiating out). Membership keys off resolveCardCategory (the single source
// of truth in library-catalog-links: identity against the fourteen ruled
// categories, or the bundle's own locked typeMapping), and the lifecycle
// subset is typed against CanonicalCardType, so renaming a category there
// fails the build here rather than silently drifting from the renderer.
// Diagram `kind` stays feeds|hub|lifecycle (no client-schema change). This is
// additive: the render set + DIAGRAM_TYPE_ALIASES above are untouched, so an
// authored or already-swept library draws exactly as before.
const CANONICAL_LIFECYCLE_CARD_TYPES = ["Pattern", "Mechanism"] satisfies CanonicalCardType[];
const CANONICAL_LIFECYCLE_CARD_TYPE_KEYS = new Set<string>(
  CANONICAL_LIFECYCLE_CARD_TYPES.map((type) => type.toLowerCase()),
);

export function diagramForCatalogCard(
  card: LibraryCatalogCard,
  resolveCard: CardResolver,
  typeMapping: readonly LibraryCatalogTypeMappingEntry[] = [],
): LibraryCatalogDiagram | undefined {
  const rawType = card.type.toLowerCase();
  const type = DIAGRAM_TYPE_ALIASES[rawType] ?? rawType;
  const connectors = linkConnectorsForCard(card, resolveCard);
  const flow = card.flow ?? [];

  if ((type === "aggregate" || type === "surface") && connectors.length > 0) {
    return {
      connectors,
      kind: "hub",
    };
  }

  if (type === "value" && flow.length > 0) {
    return {
      flow: [...flow],
      kind: "lifecycle",
    };
  }

  if (type === "read-model" && connectors.length > 0) {
    return {
      connectors,
      kind: "feeds",
    };
  }

  // Ruled families categories — render natively (additive; resolved through
  // resolveCardCategory, not the raw card type). A Pattern or Mechanism with a
  // flow draws the lifecycle arc; every other resolved category — and a
  // flow-less one — draws a hub. An unresolved category (off-canon, unmapped)
  // draws nothing here.
  const category = resolveCardCategory(card.type, typeMapping);
  if (category != null) {
    if (CANONICAL_LIFECYCLE_CARD_TYPE_KEYS.has(category.toLowerCase()) && flow.length > 0) {
      return {
        flow: [...flow],
        kind: "lifecycle",
      };
    }
    if (connectors.length > 0) {
      return {
        connectors,
        kind: "hub",
      };
    }
  }

  return undefined;
}

export function applyCatalogStoryResolution(
  cards: readonly LibraryCatalogCard[],
  typeMapping: readonly LibraryCatalogTypeMappingEntry[] = [],
): void {
  const resolveCard = createCatalogCardResolver(cards);
  for (const card of cards) {
    const diagram = diagramForCatalogCard(card, resolveCard, typeMapping);
    if (diagram != null) {
      card.diagram = diagram;
    }
  }
}

function storyMentions(story: string, resolveCard: CardResolver): StoryMention[] {
  const mentions: StoryMention[] = [];
  for (const match of story.matchAll(WIKILINK_PATTERN)) {
    const rawTarget = match[1];
    if (rawTarget == null) {
      continue;
    }
    const target = normalizeWikilinkTarget(rawTarget);
    const label = wikilinkLabel(rawTarget);
    if (target.length === 0 || label.length === 0) {
      continue;
    }
    const targetCard = resolveCard(target);
    mentions.push({
      label,
      target,
      ...(targetCard == null ? {} : { targetCardId: targetCard.id }),
    });
  }
  return mentions;
}

function textContainsLabel(text: string, label: string): boolean {
  const normalizedText = normalizeKey(
    text.replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g, "$1"),
  );
  const normalizedLabel = normalizeKey(label);
  if (normalizedLabel.length === 0) {
    return false;
  }
  return ` ${normalizedText} `.includes(` ${normalizedLabel} `);
}

function leadAltitudeRank(card: LibraryCatalogCard): number {
  return LEAD_ALTITUDE_RANK[(card.altitude ?? "").toLowerCase()] ?? 0;
}

function pickContextLead(cards: readonly LibraryCatalogCard[]): LibraryCatalogCard | null {
  if (cards.length < 2) {
    return null;
  }

  let best: LibraryCatalogCard | null = null;
  let bestScore = -1;
  for (const card of cards) {
    const score = leadAltitudeRank(card) * 1000 + card.edgeIds.length;
    if (score > bestScore) {
      best = card;
      bestScore = score;
    }
  }

  return best != null && leadAltitudeRank(best) >= 3 ? best : null;
}

function isRelegatedConnector(connector: LibraryCatalogDiagramConnector): boolean {
  return connector.label.trim().toLowerCase().startsWith("relegates");
}

function connectorTargetCardIds(
  connectors: readonly LibraryCatalogDiagramConnector[] | undefined,
): Set<string> {
  return new Set(
    (connectors ?? []).flatMap((connector) =>
      connector.targetCardId == null || isRelegatedConnector(connector)
        ? []
        : [connector.targetCardId],
    ),
  );
}

function relegatedConnectorTargetCardIds(
  connectors: readonly LibraryCatalogDiagramConnector[] | undefined,
): Set<string> {
  return new Set(
    (connectors ?? []).flatMap((connector) =>
      connector.targetCardId != null && isRelegatedConnector(connector)
        ? [connector.targetCardId]
        : [],
    ),
  );
}

function storyMentionsConnector(
  story: string,
  mentions: readonly StoryMention[],
  connector: LibraryCatalogDiagramConnector,
): boolean {
  const targetKey = normalizeKey(connector.targetLabel);
  if (mentions.some((mention) => normalizeKey(mention.target) === targetKey)) {
    return true;
  }
  if (
    connector.targetCardId != null &&
    mentions.some((mention) => mention.targetCardId === connector.targetCardId)
  ) {
    return true;
  }
  return textContainsLabel(story, connector.targetLabel);
}

function contextCardsByKey(catalog: LibraryCatalog): Map<string, LibraryCatalogCard[]> {
  const byContext = new Map<string, LibraryCatalogCard[]>();
  for (const card of catalog.cards) {
    const key = `${card.plane}\u0000${card.context}`;
    byContext.set(key, [...(byContext.get(key) ?? []), card]);
  }
  return byContext;
}

export function lintProductCatalogStories(
  catalog: LibraryCatalog,
): ProductCardStoryLintViolation[] {
  const violations: ProductCardStoryLintViolation[] = [];
  const resolveCard = createCatalogCardResolver(catalog.cards);
  const byContext = contextCardsByKey(catalog);
  const contextCardIdsByCardId = new Map<string, Set<string>>();
  for (const cards of byContext.values()) {
    const ids = new Set(cards.map((card) => card.id));
    for (const card of cards) {
      contextCardIdsByCardId.set(card.id, ids);
    }
  }

  for (const cards of byContext.values()) {
    const lead = pickContextLead(cards);
    if (lead == null || lead.storyBuckets == null) {
      continue;
    }

    const mentions = storyMentions(lead.storyBuckets.how, resolveCard);
    const coveredCardIds = new Set(mentions.flatMap((mention) => mention.targetCardId ?? []));
    const relegatedCardIds = relegatedConnectorTargetCardIds(lead.diagram?.connectors);

    for (const card of cards) {
      if (card.id === lead.id || coveredCardIds.has(card.id) || relegatedCardIds.has(card.id)) {
        continue;
      }
      violations.push({
        cardId: card.id,
        context: lead.context,
        leadCardId: lead.id,
        message: `${lead.context} / ${lead.prefLabel}: orphan card "${card.id}" is not linked from the lead how-it-does-it story`,
        rule: "no-orphans",
      });
    }
  }

  for (const card of catalog.cards) {
    if (card.storyBuckets == null || card.diagram == null) {
      continue;
    }

    const how = card.storyBuckets.how;
    const mentions = storyMentions(how, resolveCard);
    const contextCardIds = contextCardIdsByCardId.get(card.id) ?? new Set<string>();
    const cardedMentionIds = new Set(
      mentions.flatMap((mention) =>
        mention.targetCardId != null && contextCardIds.has(mention.targetCardId)
          ? [mention.targetCardId]
          : [],
      ),
    );

    if (card.diagram.kind === "hub" || card.diagram.kind === "feeds") {
      const connectors = card.diagram.connectors ?? [];
      const connectorIds = connectorTargetCardIds(connectors);

      for (const connector of connectors) {
        if (isRelegatedConnector(connector)) {
          continue;
        }
        if (!storyMentionsConnector(how, mentions, connector)) {
          violations.push({
            context: card.context,
            leadCardId: card.id,
            message: `${card.context} / ${card.prefLabel}: diagram connector "${connector.targetLabel}" is missing from the how-it-does-it story`,
            rule: "diagram-parity",
          });
        }
      }

      for (const mentionId of cardedMentionIds) {
        if (mentionId === card.id || connectorIds.has(mentionId)) {
          continue;
        }
        violations.push({
          cardId: mentionId,
          context: card.context,
          leadCardId: card.id,
          message: `${card.context} / ${card.prefLabel}: story noun "${mentionId}" is missing from the diagram connectors`,
          rule: "diagram-parity",
        });
      }
    }

    if (card.diagram.kind === "lifecycle") {
      for (const stage of card.diagram.flow ?? []) {
        if (!textContainsLabel(how, stage)) {
          violations.push({
            context: card.context,
            leadCardId: card.id,
            message: `${card.context} / ${card.prefLabel}: lifecycle step "${stage}" is missing from the how-it-does-it story`,
            rule: "diagram-parity",
          });
        }
      }
    }
  }

  return violations;
}

export function formatProductCardStoryLint(
  violations: readonly ProductCardStoryLintViolation[],
): string {
  if (violations.length === 0) {
    return "Product card story lint passed.";
  }

  return [
    "Product card story lint failed:",
    ...violations.map((violation) => `- ${violation.message}`),
  ].join("\n");
}
