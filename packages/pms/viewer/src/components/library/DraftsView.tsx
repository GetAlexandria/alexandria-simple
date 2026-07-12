import { useMemo } from "react";
import type {
  LibraryCatalog,
  LibraryCatalogCard,
  LibraryCatalogDraftRulingEntry,
  LibraryCatalogDraftSectionConfirmation,
} from "./types";
import { DraftOverlaySummary, DraftTrail, testIdPart } from "./DraftOverlayViews";
import { storyBucketsForCard } from "./library-peek-view-model";
import { formatPlaneLabel } from "./plane";

const EMPTY_DRAFTS_COPY = "No drafts yet — run a Front-of-House walk to start Raven's draft.";

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
    <div className="mt-3 border border-[#b8c9c1] bg-[#f5faf7] px-3 py-3">
      <div className="font-mono text-[10px] uppercase text-[#2f6d50]">Map ruling</div>
      <ul className="mt-2 grid gap-2">
        {ruling.containerMapping.map((entry, index) => (
          <li
            className="grid gap-1 border-t border-[#d7e3dd] pt-2 first:border-t-0 first:pt-0"
            key={index}
          >
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#264b3a]">
              <span className="border border-[#7ea48f] bg-white px-2 py-0.5 text-[10px] uppercase">
                {DISPOSITION_LABELS[entry.disposition]}
              </span>
              <span className="break-words">
                {entry.from}
                {entry.to == null ? null : ` -> ${entry.to}`}
              </span>
            </div>
            <p className="break-words text-[13px] leading-5 text-[#2d3d35]">{entry.basis}</p>
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
    <div className="mt-3 border border-[#c7c0d7] bg-[#fbf9ff] px-3 py-3">
      <div className="font-mono text-[10px] uppercase text-[#5b4b7a]">Proposed index card</div>
      {keystone.prefLabel == null ? null : (
        <h4 className="mt-2 break-words font-mono text-[14px] font-semibold text-[#20242b]">
          {keystone.prefLabel}
        </h4>
      )}
      {meta.length === 0 ? null : (
        <div className="mt-1 break-words font-mono text-[11px] text-[#6b627a]">
          {meta.join(" / ")}
        </div>
      )}
      <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-5 text-[#2b2924]">
        {keystone.body}
      </p>
    </div>
  );
}

function DraftRuling({ ruling }: { ruling: LibraryCatalogDraftRulingEntry }) {
  return (
    <article
      className="border border-[#cfc7b6] bg-[#fffdf8] p-4"
      data-testid={`drafts-ruling-${testIdPart(ruling.patchId)}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase text-[#8a4f16]">
            <span className="border border-[#b6742b] bg-[#fff8ed] px-2 py-0.5">Ruling</span>
            <span className="break-words text-[#7b7164]">Agenda item</span>
          </div>
          <h3 className="mt-2 break-words font-mono text-[16px] font-semibold text-[#20242b]">
            {ruling.agendaItemId}
          </h3>
        </div>
        <span className="shrink-0 border border-[#2f7d57] bg-[#e8f3ec] px-2 py-0.5 font-mono text-[10px] uppercase text-[#1f5d3f]">
          Resolved
        </span>
      </div>
      {ruling.rulingExcerpt == null ? null : (
        <p className="mt-3 max-w-[920px] whitespace-pre-wrap break-words text-[14px] leading-6 text-[#2b2924]">
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
    <article
      className="border border-[#cfc7b6] bg-[#fffdf8] p-4"
      data-testid={`drafts-card-${testIdPart(card.id)}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase text-[#8a4f16]">
            <span className="border border-[#b6742b] bg-[#fff8ed] px-2 py-0.5">Draft change</span>
            <span className="break-words text-[#7b7164]">
              {formatPlaneLabel(card.plane)} / {card.context}
            </span>
          </div>
          <h3 className="mt-2 break-words font-mono text-[16px] font-semibold text-[#20242b]">
            {card.prefLabel}
          </h3>
        </div>
        <span className="shrink-0 border border-[#2f7d57] bg-[#e8f3ec] px-2 py-0.5 font-mono text-[10px] uppercase text-[#1f5d3f]">
          {card.status}
        </span>
      </div>
      {preview == null ? null : (
        <p className="mt-3 max-w-[820px] whitespace-pre-wrap break-words text-[14px] leading-6 text-[#2b2924]">
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
      <header className="border border-[#d9d2c2] bg-[#f6f1e8] px-4 py-3">
        <div className="font-mono text-[11px] uppercase text-[#7b7164]">
          {formatPlaneLabel(section.plane)} / {section.context}
        </div>
        <h2 className="mt-1 break-words font-mono text-[18px] font-semibold text-[#20242b]">
          {section.confirmation?.prefLabel ?? section.context}
        </h2>
        {section.confirmation == null ? null : (
          <p
            className="mt-2 max-w-[820px] break-words text-[14px] leading-6 text-[#3f3a33]"
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
          className="border border-[#d9d2c2] bg-[#fffdf8] px-4 py-5 font-mono text-[13px] text-[#4b443c]"
          data-testid="drafts-empty"
        >
          <p>{EMPTY_DRAFTS_COPY}</p>
          {emptyStatePatchLogPath == null ? null : (
            <p
              className="mt-2 break-words text-[12px] text-[#6f6458]"
              data-testid="drafts-empty-log-path"
            >
              Expected draft log: {emptyStatePatchLogPath}
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
