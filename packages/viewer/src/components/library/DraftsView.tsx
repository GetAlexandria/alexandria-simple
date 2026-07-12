import { useMemo } from "react";
import type {
  LibraryCatalog,
  LibraryCatalogCard,
  LibraryCatalogDraftRulingEntry,
  LibraryCatalogDraftSectionConfirmation,
} from "./types";
import { DraftOverlaySummary, DraftTrail, testIdPart } from "./DraftOverlayViews";
import { storyBucketsForCard } from "./library-peek-view-model";
import { AMBER_CHIP_CLASS, SUCCESS_CHIP_CLASS } from "./notepad-view-model";
import { formatPlaneLabel } from "./plane";

const EMPTY_DRAFTS_COPY = "No drafts yet — run a Front-of-House walk to start Raven's draft.";
const DRAFT_PANEL_CLASS =
  "border border-[color:var(--viewer-canvas-panel-bd)] bg-[color:var(--viewer-canvas-slate-2)] text-[color:var(--viewer-canvas-fg)]";
const DRAFT_MUTED_PANEL_CLASS =
  "border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate-3)] text-[color:var(--viewer-canvas-fg)]";
const DRAFT_LABEL_CLASS =
  "font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--viewer-canvas-fg-dim)]";
const DRAFT_DIM_TEXT_CLASS = "text-[color:var(--viewer-canvas-fg-dimmer)]";
const DRAFT_ID_TEXT_CLASS = "font-mono text-[color:var(--viewer-canvas-fg-dim)]";
const CHIP_BASE_CLASS = "border px-2 py-0.5 font-sans text-[10px] font-semibold uppercase";
const DRAFT_ARTICLE_CLASS = `${DRAFT_PANEL_CLASS} p-4`;
const DRAFT_AMBER_CHIP_FULL_CLASS = `${CHIP_BASE_CLASS} ${AMBER_CHIP_CLASS}`;
const DRAFT_SUCCESS_CHIP_FULL_CLASS = `shrink-0 ${CHIP_BASE_CLASS} ${SUCCESS_CHIP_CLASS}`;
const DRAFT_MAP_DELTA_PANEL_CLASS =
  "mt-3 px-3 py-3 border border-[color:var(--viewer-canvas-success)] bg-[color:var(--viewer-engine-confidence-high-bg)] text-[color:var(--viewer-canvas-fg)]";
const DRAFT_KEYSTONE_PANEL_CLASS =
  "mt-3 px-3 py-3 border border-[color:var(--viewer-engine-type-principle-border)] bg-[color:var(--viewer-engine-type-principle-bg)] text-[color:var(--viewer-canvas-fg)]";
const DRAFT_DISPOSITION_CHIP_CLASS = `${CHIP_BASE_CLASS} border-[color:var(--viewer-canvas-success)] bg-[color:var(--viewer-canvas-slate)] text-[color:var(--viewer-engine-confidence-high-text)]`;
const DRAFT_ID_BREAK_WORDS_CLASS = `break-words ${DRAFT_ID_TEXT_CLASS}`;
const DRAFT_LABEL_BREAK_WORDS_CLASS = `break-words ${DRAFT_LABEL_CLASS}`;
const DRAFT_SECTION_HEADER_CLASS = `${DRAFT_MUTED_PANEL_CLASS} px-4 py-3`;

interface DraftSection {
  cards: LibraryCatalogCard[];
  confirmation?: LibraryCatalogDraftSectionConfirmation;
  context: string;
  plane: string;
}

function sectionKey(plane: string, context: string): string {
  return `${plane}\0${context}`;
}

function storyPreview(card: LibraryCatalogCard): string | null {
  const what = storyBucketsForCard(card)?.what.trim();
  return what == null || what.length === 0 ? null : what;
}

function draftSections(catalog: LibraryCatalog): DraftSection[] {
  const bySection = new Map<string, DraftSection>();
  for (const confirmation of catalog.draftOverlay?.sectionConfirmations ?? []) {
    bySection.set(sectionKey(confirmation.plane, confirmation.context), {
      cards: [],
      confirmation,
      context: confirmation.context,
      plane: confirmation.plane,
    });
  }
  for (const card of catalog.cards) {
    if ((card.draftTrail ?? []).length === 0) {
      continue;
    }
    const key = sectionKey(card.plane, card.context);
    const section =
      bySection.get(key) ??
      ({
        cards: [],
        context: card.context,
        plane: card.plane,
      } satisfies DraftSection);
    section.cards.push(card);
    bySection.set(key, section);
  }

  return [...bySection.values()].sort((left, right) => {
    const plane = left.plane.localeCompare(right.plane);
    if (plane !== 0) {
      return plane;
    }
    return left.context.localeCompare(right.context);
  });
}

const DISPOSITION_LABELS: Record<
  LibraryCatalogDraftRulingEntry["containerMapping"][number]["disposition"],
  string
> = {
  demote: "Demote",
  hold: "Hold",
  keep: "Keep",
  merge: "Merge",
  rename: "Rename",
};

function DraftRulingMapDelta({ ruling }: { ruling: LibraryCatalogDraftRulingEntry }) {
  if (ruling.containerMapping.length === 0) {
    return null;
  }

  return (
    <div className={DRAFT_MAP_DELTA_PANEL_CLASS}>
      <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--viewer-engine-confidence-high-text)]">
        Map ruling
      </div>
      <ul className="mt-2 grid gap-2">
        {ruling.containerMapping.map((entry, index) => (
          <li
            className="grid gap-1 border-t border-[color:var(--viewer-canvas-panel-bd)] pt-2 first:border-t-0 first:pt-0"
            key={index}
          >
            <div className="flex flex-wrap items-center gap-2 font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
              <span className={DRAFT_DISPOSITION_CHIP_CLASS}>
                {DISPOSITION_LABELS[entry.disposition]}
              </span>
              <span className={DRAFT_ID_BREAK_WORDS_CLASS}>
                {entry.from}
                {entry.to == null ? null : ` -> ${entry.to}`}
              </span>
            </div>
            <p className="break-words text-[13px] leading-5 text-[color:var(--viewer-canvas-fg)]">
              {entry.basis}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DraftRulingKeystone({ ruling }: { ruling: LibraryCatalogDraftRulingEntry }) {
  const keystone = ruling.keystoneDraft;
  if (keystone == null) {
    return null;
  }

  const meta = [keystone.plane, keystone.context, keystone.status].filter(
    (item): item is string => item != null && item.length > 0,
  );

  return (
    <div className={DRAFT_KEYSTONE_PANEL_CLASS}>
      <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--viewer-engine-type-principle-accent)]">
        Proposed index card
      </div>
      {keystone.prefLabel == null ? null : (
        <h4 className="mt-2 break-words font-display text-[18px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
          {keystone.prefLabel}
        </h4>
      )}
      {meta.length === 0 ? null : (
        <div className="mt-1 break-words font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
          {meta.join(" / ")}
        </div>
      )}
      <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-5 text-[color:var(--viewer-canvas-fg)]">
        {keystone.body}
      </p>
    </div>
  );
}

function DraftRuling({ ruling }: { ruling: LibraryCatalogDraftRulingEntry }) {
  return (
    <article
      className={DRAFT_ARTICLE_CLASS}
      data-testid={`drafts-ruling-${testIdPart(ruling.patchId)}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={DRAFT_AMBER_CHIP_FULL_CLASS}>Ruling</span>
            <span className={DRAFT_LABEL_CLASS}>Agenda item</span>
          </div>
          <h3 className="mt-2 break-words font-mono text-[16px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
            {ruling.agendaItemId}
          </h3>
        </div>
        <span className={DRAFT_SUCCESS_CHIP_FULL_CLASS}>Resolved</span>
      </div>
      {ruling.rulingExcerpt == null ? null : (
        <p className="mt-3 max-w-[920px] whitespace-pre-wrap break-words text-[14px] leading-6 text-[color:var(--viewer-canvas-fg)]">
          {ruling.rulingExcerpt}
        </p>
      )}
      <DraftRulingMapDelta ruling={ruling} />
      <DraftRulingKeystone ruling={ruling} />
    </article>
  );
}

function DraftCard({ card }: { card: LibraryCatalogCard }) {
  const preview = storyPreview(card);

  return (
    <article className={DRAFT_ARTICLE_CLASS} data-testid={`drafts-card-${testIdPart(card.id)}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={DRAFT_AMBER_CHIP_FULL_CLASS}>Draft change</span>
            <span className={DRAFT_LABEL_BREAK_WORDS_CLASS}>
              {formatPlaneLabel(card.plane)} / {card.context}
            </span>
          </div>
          <h3 className="mt-2 break-words font-display text-[20px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
            {card.prefLabel}
          </h3>
        </div>
        <span className={DRAFT_SUCCESS_CHIP_FULL_CLASS}>{card.status}</span>
      </div>
      {preview == null ? null : (
        <p className="mt-3 max-w-[820px] whitespace-pre-wrap break-words text-[14px] leading-6 text-[color:var(--viewer-canvas-fg)]">
          {preview}
        </p>
      )}
      <DraftTrail card={card} />
    </article>
  );
}

function DraftSectionView({ section }: { section: DraftSection }) {
  const sectionTestId = `drafts-section-${testIdPart(section.plane)}-${testIdPart(
    section.context,
  )}`;
  return (
    <section className="space-y-3" data-testid={sectionTestId}>
      <header className={DRAFT_SECTION_HEADER_CLASS}>
        <div className={DRAFT_LABEL_CLASS}>
          {formatPlaneLabel(section.plane)} / {section.context}
        </div>
        <h2 className="mt-1 break-words font-display text-[24px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
          {section.confirmation?.prefLabel ?? section.context}
        </h2>
        {section.confirmation == null ? null : (
          <p
            className="mt-2 max-w-[820px] break-words text-[14px] leading-6 text-[color:var(--viewer-canvas-fg)]"
            data-testid={`${sectionTestId}-summary`}
          >
            {section.confirmation.summary}
          </p>
        )}
      </header>
      <div className="grid gap-3">
        {[...section.cards]
          .sort((left, right) => left.prefLabel.localeCompare(right.prefLabel))
          .map((card) => (
            <DraftCard card={card} key={card.id} />
          ))}
      </div>
    </section>
  );
}

export function DraftsView({
  catalog,
  emptyStatePatchLogPath,
}: {
  catalog: LibraryCatalog;
  emptyStatePatchLogPath?: string;
}) {
  const sections = useMemo(() => draftSections(catalog), [catalog]);
  const rulings = catalog.draftOverlay?.rulings ?? [];
  const hasDraftContent = sections.length > 0 || rulings.length > 0;

  return (
    <section className="m-7 space-y-4" data-testid="drafts-view">
      {!hasDraftContent ? (
        <div
          className={`${DRAFT_PANEL_CLASS} px-4 py-5 font-sans text-[13px]`}
          data-testid="drafts-empty"
        >
          <p>{EMPTY_DRAFTS_COPY}</p>
          {emptyStatePatchLogPath == null ? null : (
            <p
              className={`mt-2 break-words text-[12px] ${DRAFT_DIM_TEXT_CLASS}`}
              data-testid="drafts-empty-log-path"
            >
              Expected draft log:{" "}
              <span className={DRAFT_ID_TEXT_CLASS}>{emptyStatePatchLogPath}</span>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {rulings.length === 0 ? null : (
            <section className="space-y-3" data-testid="drafts-rulings">
              {rulings.map((ruling) => (
                <DraftRuling key={ruling.patchId} ruling={ruling} />
              ))}
            </section>
          )}
          {sections.map((section) => (
            <DraftSectionView key={sectionKey(section.plane, section.context)} section={section} />
          ))}
        </div>
      )}
      <DraftOverlaySummary catalog={catalog} hideWhenNoIssues />
    </section>
  );
}
