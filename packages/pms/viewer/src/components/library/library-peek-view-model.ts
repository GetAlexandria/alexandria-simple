// The data model behind the in-place "peek" and the Workflow view's
// relationships-in-motion ticks. Both are *derived* from existing catalog data
// (`storyBuckets`, the typed `links:` map, `workflows[].steps`) — no new card or
// workflow schema (issue #456). Keeping the derivation pure and separate from
// EmptyLibraryView keeps it unit-testable without rendering React.
//
// The seams ("leans on") and the per-step activations both come from a card's
// typed `links:` — the structured frontmatter relationships
// (contains/conforms_to/operates_on/produces/related_to/derived_from) — NOT from
// `catalog.edges`, which are the prose-extracted body links the Catalog already
// surfaces as "Typed edges". A link is a cross-context "seam" when its resolved
// target card sits in another `context`; `contains` is containment (the noun's
// parts), so it feeds the "contains" section and is never treated as a seam.
import { buildCardResolverIndex, resolveCardFromIndex } from "@alexandria/library-card-resolver";
import type {
  LibraryCatalogArea,
  LibraryCatalogCard,
  LibraryCatalogGap,
  LibraryCatalogThread,
  LibraryCatalogThreadConcern,
  LibraryCatalogWorkflow,
  LibraryCatalogWorkflowStep,
} from "./types";

// The one link key that is containment, not a relationship-to-another-context.
const CONTAINS_LINK_KEY = "contains";

// Altitude rank for choosing the lead card of a context (C4 zoom: the
// top-altitude card the others are pieces of). Tiebreak by edge count.
const LEAD_ALTITUDE_RANK: Record<string, number> = {
  pillar: 5,
  aggregate: 4,
  component: 3,
  capability: 2,
  value: 1,
};

export function leadAltitudeRank(card: LibraryCatalogCard): number {
  return LEAD_ALTITUDE_RANK[(card.altitude ?? "").toLowerCase()] ?? 0;
}

// The "lead" card of a context (our working shorthand for the top piece at this
// zoom). Requires a genuinely-distinguishing altitude so flat contexts fall
// back to the plain list.
export function pickContextLead(cards: readonly LibraryCatalogCard[]): LibraryCatalogCard | null {
  if (cards.length < 2) {
    return null;
  }
  let best: LibraryCatalogCard | null = null;
  let bestScore = -1;
  for (const card of cards) {
    const score = leadAltitudeRank(card) * 1000 + card.edgeIds.length;
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }
  return best != null && leadAltitudeRank(best) >= 3 ? best : null;
}

export function storyBucketsForCard(
  card: LibraryCatalogCard,
): { how: string; what: string } | null {
  if (card.storyBuckets != null) {
    return card.storyBuckets;
  }
  if (card.story != null && card.story.length > 0) {
    return { how: "", what: card.story };
  }
  if (card.synopsis != null && card.synopsis.length > 0) {
    return { how: "", what: card.synopsis };
  }
  return null;
}

export function storyTextForOrdering(card: LibraryCatalogCard): string | undefined {
  const buckets = storyBucketsForCard(card);
  if (buckets == null) {
    return undefined;
  }
  return [buckets.how, buckets.what].filter((part) => part.length > 0).join("\n\n");
}

// "derived_from" -> "derived from", "related_to" -> "related to", etc. The
// canonical link keys are snake_case; the reader contract is the same set the
// AX scanner writes (LIBRARY_CATALOG_LINK_KEYS).
export function humanizeLinkKey(key: string): string {
  return key.replace(/_/g, " ");
}

export interface PeekStory {
  how: string;
  what: string;
}

// A part the noun contains (a `links.contains` target, or — for a context — a
// member card). Display-only identity; the click-through is the peek itself.
export interface PeekPart {
  cardId: string;
  label: string;
  type: string;
}

// A cross-context typed link — the seam the noun leans on.
export interface PeekSeam {
  rel: string;
  relKey: string;
  targetCardId?: string;
  targetContext: string;
  targetLabel: string;
  targetPlane?: string;
}

// A workflow step that touches the noun — because its context is the noun's, or
// because one of its cardRefs resolves into it.
export interface PeekUsage {
  activity: string;
  order: number;
  unit: string;
  via: "card" | "context";
  workflowId: string;
}

// An explicit gap recorded in a context (context peeks only). Keeping it on the
// peek preserves the per-context gap burndown the old in-index drill showed.
export interface PeekGap {
  confidence: string;
  id: string;
  label: string;
  reason: string;
}

interface BasePeekModel {
  context: string;
  contextLabel: string;
  kind: "card" | "context" | "thread";
  plane: string;
  title: string;
}

export interface LibraryNounPeekModel extends BasePeekModel {
  altitude?: string;
  areaId?: string;
  cardId?: string;
  contains: PeekPart[];
  gaps: PeekGap[];
  kind: "card" | "context";
  leansOn: PeekSeam[];
  story: PeekStory | null;
  type?: string;
  usedIn: PeekUsage[];
}

export interface PeekThreadConcern {
  cardId?: string;
  context?: string;
  label: string;
  plane?: string;
  type: LibraryCatalogThreadConcern["type"];
}

export interface LibraryThreadPeekModel extends BasePeekModel {
  concerns: PeekThreadConcern[];
  emittingMove: string;
  kind: "thread";
  reason: string;
  sourceEvidence: string[];
  status: string;
  threadId: string;
}

export type LibraryPeekModel = LibraryNounPeekModel | LibraryThreadPeekModel;

// Per-step relationship-in-motion: the typed link a step activates toward
// another context, derived from the step's cardRefs' cross-context links.
export interface StepActivation {
  rel: string;
  relKey: string;
  targetCardId?: string;
  targetLabel: string;
  toContext: string;
}

type CardResolverIndex = ReturnType<typeof buildCardResolverIndex<LibraryCatalogCard>>;

export function buildPeekCardIndex(cards: readonly LibraryCatalogCard[]): CardResolverIndex {
  return buildCardResolverIndex(cards);
}

// The single reading of a card's typed `links:` — every non-containment link
// resolved to its target card. Unresolved targets are skipped (without the
// target we can't classify it, and we never invent an empty scaffold). The
// peek's seams AND the Workflow ticks both derive from this one function, so
// they can never drift on what a typed link is; each caller applies its own
// cross-context filter (a card's own context vs a step's context).
function typedLinks(
  card: LibraryCatalogCard,
  index: CardResolverIndex,
): Array<{ rel: string; relKey: string; target: LibraryCatalogCard }> {
  const out: Array<{ rel: string; relKey: string; target: LibraryCatalogCard }> = [];
  for (const [key, targets] of Object.entries(card.links ?? {})) {
    if (key === CONTAINS_LINK_KEY) {
      continue;
    }
    for (const rawTarget of targets ?? []) {
      const target = resolveCardFromIndex(index, rawTarget);
      if (target != null) {
        out.push({ rel: humanizeLinkKey(key), relKey: key, target });
      }
    }
  }
  return out;
}

// A card's containment (`links.contains`) resolved to its parts, deduped by id.
function containsFor(card: LibraryCatalogCard, index: CardResolverIndex): PeekPart[] {
  const parts: PeekPart[] = [];
  const seen = new Set<string>();
  for (const rawTarget of card.links?.[CONTAINS_LINK_KEY] ?? []) {
    const target = resolveCardFromIndex(index, rawTarget);
    if (target == null || seen.has(target.id)) {
      continue;
    }
    seen.add(target.id);
    parts.push({ cardId: target.id, label: target.prefLabel, type: target.type });
  }
  return parts;
}

// The card's cross-context seams (a typed link whose target sits in another
// context than the card's own), deduped by (relKey, target card).
function seamsFor(card: LibraryCatalogCard, index: CardResolverIndex): PeekSeam[] {
  const seams: PeekSeam[] = [];
  const seen = new Set<string>();
  for (const link of typedLinks(card, index)) {
    if (link.target.context === card.context) {
      continue;
    }
    const dedupe = `${link.relKey} ${link.target.id}`;
    if (seen.has(dedupe)) {
      continue;
    }
    seen.add(dedupe);
    seams.push({
      rel: link.rel,
      relKey: link.relKey,
      targetCardId: link.target.id,
      targetContext: link.target.context,
      targetLabel: link.target.prefLabel,
      targetPlane: link.target.plane,
    });
  }
  return seams;
}

// Does this step touch `card` — same context, or a cardRef that resolves to it?
function stepUsage(
  step: LibraryCatalogWorkflowStep,
  workflow: LibraryCatalogWorkflow,
  card: LibraryCatalogCard,
  index: CardResolverIndex,
): PeekUsage | null {
  const byCardRef = (step.cardRefs ?? []).some(
    (ref) => resolveCardFromIndex(index, ref)?.id === card.id,
  );
  const byContext = step.context === card.context;
  if (!byCardRef && !byContext) {
    return null;
  }
  return {
    activity: step.activity,
    order: step.order,
    unit: workflow.unit,
    // The cardRef match is the more specific signal; prefer it for the label.
    via: byCardRef ? "card" : "context",
    workflowId: workflow.id,
  };
}

function usagesForContext(
  context: string,
  workflows: readonly LibraryCatalogWorkflow[],
): PeekUsage[] {
  const usages: PeekUsage[] = [];
  for (const workflow of workflows) {
    for (const step of workflow.steps) {
      if (step.context !== context) {
        continue;
      }
      usages.push({
        activity: step.activity,
        order: step.order,
        unit: workflow.unit,
        via: "context",
        workflowId: workflow.id,
      });
    }
  }
  return usages.sort((left, right) => left.order - right.order);
}

function toPeekGap(gap: LibraryCatalogGap): PeekGap {
  return { confidence: gap.confidence, id: gap.id, label: gap.label, reason: gap.reason };
}

// The director-register headline for a thread, with a neutral fallback when an
// older thread carries no phrased question. Shared by the worklist row and the
// thread peek so both render the same fallback copy.
export function threadQuestion(thread: LibraryCatalogThread): string {
  const question = thread.question?.trim();
  return question == null || question.length === 0 ? "Unphrased thread question" : question;
}

// The provenance move label for a thread, with a neutral fallback. Shared by the
// worklist row and the thread peek.
export function threadEmittingMove(thread: LibraryCatalogThread): string {
  const move = thread.emittingMove?.trim();
  return move == null || move.length === 0 ? "unknown move" : move;
}

function threadConcernLabel(
  concern: LibraryCatalogThreadConcern,
  cardsById?: ReadonlyMap<string, LibraryCatalogCard>,
): string {
  const label = presentThreadConcernPart(concern.label);
  if (label != null) {
    return label;
  }
  if (concern.cardId != null) {
    return cardsById?.get(concern.cardId)?.prefLabel ?? concern.cardId;
  }
  if (concern.type === "context") {
    const contextLabel = [
      presentThreadConcernPart(concern.plane),
      presentThreadConcernPart(concern.context),
    ]
      .filter((part): part is string => part != null)
      .join(" / ");
    return contextLabel.length > 0 ? contextLabel : "Notepad";
  }
  return "uncarded noun";
}

function presentThreadConcernPart(value: string | null | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function threadConcernPlane(
  concern: LibraryCatalogThreadConcern,
  cardsById?: ReadonlyMap<string, LibraryCatalogCard>,
): string | undefined {
  return (
    presentThreadConcernPart(concern.plane) ??
    (concern.cardId == null
      ? undefined
      : presentThreadConcernPart(cardsById?.get(concern.cardId)?.plane))
  );
}

function threadConcernContext(
  concern: LibraryCatalogThreadConcern,
  cardsById?: ReadonlyMap<string, LibraryCatalogCard>,
): string | undefined {
  return (
    presentThreadConcernPart(concern.context) ??
    (concern.cardId == null
      ? undefined
      : presentThreadConcernPart(cardsById?.get(concern.cardId)?.context))
  );
}

// The peek for a single card noun.
export function buildCardPeek(
  card: LibraryCatalogCard,
  options: {
    contextLabel?: string;
    index: CardResolverIndex;
    workflows: readonly LibraryCatalogWorkflow[];
  },
): LibraryNounPeekModel {
  const usedIn: PeekUsage[] = [];
  for (const workflow of options.workflows) {
    for (const step of workflow.steps) {
      const usage = stepUsage(step, workflow, card, options.index);
      if (usage != null) {
        usedIn.push(usage);
      }
    }
  }
  usedIn.sort((left, right) => left.order - right.order);

  return {
    ...(card.altitude == null ? {} : { altitude: card.altitude }),
    cardId: card.id,
    contains: containsFor(card, options.index),
    context: card.context,
    contextLabel: options.contextLabel ?? card.context,
    // Gaps are recorded per context, not per card; a card peek has none.
    gaps: [],
    kind: "card",
    leansOn: seamsFor(card, options.index),
    plane: card.plane,
    story: storyBucketsForCard(card),
    title: card.prefLabel,
    type: card.type,
    usedIn,
  };
}

// The peek for a context (area). Its story is the lead card's; its parts are the
// area's member cards; its seams are the union of every member's cross-context
// links; its gaps are the area's explicit gaps.
export function buildContextPeek(
  area: LibraryCatalogArea,
  options: {
    cards: readonly LibraryCatalogCard[];
    gaps?: readonly LibraryCatalogGap[];
    index: CardResolverIndex;
    workflows: readonly LibraryCatalogWorkflow[];
  },
): LibraryNounPeekModel {
  const lead = pickContextLead(options.cards) ?? options.cards[0] ?? null;

  const contains: PeekPart[] = [];
  const seenParts = new Set<string>();
  for (const card of options.cards) {
    if (seenParts.has(card.id)) {
      continue;
    }
    seenParts.add(card.id);
    contains.push({ cardId: card.id, label: card.prefLabel, type: card.type });
  }

  const leansOn: PeekSeam[] = [];
  const seenSeams = new Set<string>();
  for (const card of options.cards) {
    for (const seam of seamsFor(card, options.index)) {
      // Union across the area, but a link to a sibling inside the same context
      // is not a seam for the context as a whole.
      if (seam.targetContext === area.context) {
        continue;
      }
      const dedupe = `${seam.relKey} ${seam.targetCardId ?? seam.targetLabel}`;
      if (seenSeams.has(dedupe)) {
        continue;
      }
      seenSeams.add(dedupe);
      leansOn.push(seam);
    }
  }

  return {
    ...(lead?.altitude == null ? {} : { altitude: lead.altitude }),
    areaId: area.id,
    contains,
    context: area.context,
    contextLabel: area.label,
    gaps: (options.gaps ?? []).map(toPeekGap),
    kind: "context",
    leansOn,
    plane: area.plane,
    story: lead == null ? null : storyBucketsForCard(lead),
    title: area.label,
    usedIn: usagesForContext(area.context, options.workflows),
  };
}

export function buildThreadPeek(
  thread: LibraryCatalogThread,
  options: { cardsById?: ReadonlyMap<string, LibraryCatalogCard> } = {},
): LibraryThreadPeekModel {
  const concerns = thread.concerns.map((concern) => {
    const resolvedCard =
      concern.cardId == null ? undefined : options.cardsById?.get(concern.cardId);
    const context = threadConcernContext(concern, options.cardsById);
    const plane = threadConcernPlane(concern, options.cardsById);
    return {
      ...(resolvedCard == null ? {} : { cardId: resolvedCard.id }),
      ...(context == null ? {} : { context }),
      label: threadConcernLabel(concern, options.cardsById),
      ...(plane == null ? {} : { plane }),
      type: concern.type,
    };
  });
  const anchoredConcern =
    concerns.find(
      (concern) =>
        presentThreadConcernPart(concern.plane) != null &&
        presentThreadConcernPart(concern.context) != null,
    ) ?? concerns[0];

  return {
    concerns,
    context: anchoredConcern?.context ?? "threads",
    contextLabel: anchoredConcern?.context ?? "Notepad",
    emittingMove: threadEmittingMove(thread),
    kind: "thread",
    plane: anchoredConcern?.plane ?? "Notepad",
    reason: thread.reason,
    sourceEvidence: [...(thread.sourceEvidence ?? [])],
    status: thread.status,
    threadId: thread.id,
    title: threadQuestion(thread),
  };
}

// A peek model has nothing to show when it has neither a story nor any derived
// section. Callers render a single graceful line instead of an empty scaffold.
export function peekHasContent(model: LibraryPeekModel): boolean {
  if (model.kind === "thread") {
    return true;
  }
  const hasStory =
    model.story != null &&
    (model.story.what.trim().length > 0 || model.story.how.trim().length > 0);
  return (
    hasStory ||
    model.contains.length > 0 ||
    model.leansOn.length > 0 ||
    model.usedIn.length > 0 ||
    model.gaps.length > 0
  );
}

// The typed relationships a workflow step activates toward other contexts —
// derived from its cardRefs' cross-context links (excluding containment).
// Deduped by relationship + target context so one tick per (rel, context).
export function deriveStepActivations(
  step: LibraryCatalogWorkflowStep,
  index: CardResolverIndex,
): StepActivation[] {
  const activations: StepActivation[] = [];
  const seen = new Set<string>();
  for (const ref of step.cardRefs ?? []) {
    const card = resolveCardFromIndex(index, ref);
    if (card == null) {
      continue;
    }
    for (const link of typedLinks(card, index)) {
      if (link.target.context === step.context) {
        continue;
      }
      const dedupe = `${link.relKey} ${link.target.context}`;
      if (seen.has(dedupe)) {
        continue;
      }
      seen.add(dedupe);
      activations.push({
        rel: link.rel,
        relKey: link.relKey,
        targetCardId: link.target.id,
        targetLabel: link.target.prefLabel,
        toContext: link.target.context,
      });
    }
  }
  return activations;
}
