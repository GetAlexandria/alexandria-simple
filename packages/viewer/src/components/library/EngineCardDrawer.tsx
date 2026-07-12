import type { EngineDrawerLink } from "./engine-view-model";
import { engineEdgeClass, engineTestIdPart, ENGINE_UNFILED_ZONE_KEY } from "./engine-view-model";
import type { LibraryCatalogCard, LibraryCatalogConfidence, LibraryCatalogTagNote } from "./types";

interface EngineCardDrawerProps {
  card: LibraryCatalogCard | null;
  links: EngineDrawerLink[];
  onClose(): void;
  onNavigate(cardId: string): void;
}

function confidenceClass(confidence: LibraryCatalogConfidence): string {
  switch (confidence) {
    case "high":
      return "border-[color:var(--viewer-canvas-success)] bg-[color:var(--viewer-engine-confidence-high-bg)] text-[color:var(--viewer-engine-confidence-high-text)]";
    case "medium":
      return "border-[color:var(--viewer-canvas-amber)] bg-[color:var(--viewer-engine-confidence-medium-bg)] text-[color:var(--viewer-engine-confidence-medium-text)]";
    case "low":
      return "border-[color:var(--viewer-canvas-danger)] bg-[color:var(--viewer-engine-confidence-low-bg)] text-[color:var(--viewer-engine-confidence-low-text)]";
  }
}

// Chip for the one horizon value that renders (`future`); absent/"now" cards
// show no chip at all, so there is no per-value branch like confidenceClass.
const FUTURE_HORIZON_CHIP_CLASS =
  "border-[color:var(--viewer-engine-horizon-future-border)] bg-[color:var(--viewer-engine-horizon-future-bg)] text-[color:var(--viewer-engine-horizon-future-accent)]";

function displayContext(context: string): string {
  return context.trim().length === 0 ? ENGINE_UNFILED_ZONE_KEY : context;
}

function sourceList(sourceRefs: readonly string[]) {
  if (sourceRefs.length === 0) {
    return (
      <span className="text-[color:var(--viewer-canvas-fg-dim)]">
        No source references projected.
      </span>
    );
  }

  return (
    <ul className="mt-2 space-y-1">
      {sourceRefs.map((sourceRef) => (
        <li
          className="break-words font-mono text-[11px] text-[color:var(--viewer-canvas-fg-dim)]"
          key={sourceRef}
        >
          {sourceRef}
        </li>
      ))}
    </ul>
  );
}

// Learning-plane vitals (issue #675, following on #712's catalog parsing):
// Experiment/Research/Measure cards carry these as optional free strings.
// Only fields actually present on the card render — v1 product/strategy
// cards carry none of them, so their drawers show no Vitals section at all.
function vitalsScalarEntries(card: LibraryCatalogCard): Array<[string, string]> {
  return (
    [
      ["kind", card.kind],
      ["grade", card.grade],
      ["state", card.state],
      ["expected", card.expected],
      ["arc", card.arc],
      ["role", card.role],
      ["verdict", card.verdict],
      ["origin", card.origin],
      ["target", card.target],
      ["trend", card.trend],
    ] as const
  ).flatMap(([label, value]) => (value == null ? [] : [[label, value] as [string, string]]));
}

// Experiment `stop`/`guardrails`: `{tag, note}` lists, same shape and
// presentation as a Bet's `risks` (#628 precedent) — "(tag) note" per line.
function tagNoteList(
  label: string,
  entries: readonly LibraryCatalogTagNote[] | undefined,
  testId: string,
) {
  if (entries == null || entries.length === 0) {
    return null;
  }

  return (
    <div className="mt-3" data-testid={testId}>
      <h4 className="font-sans text-[10px] font-semibold uppercase text-[color:var(--viewer-canvas-amber-dim)]">
        {label}
      </h4>
      <ul className="mt-1 space-y-1">
        {entries.map((entry, index) => (
          <li
            className="break-words font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]"
            key={`${entry.tag}-${index}`}
          >
            <span className="font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
              ({entry.tag})
            </span>{" "}
            {entry.note}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EngineCardDrawer({ card, links, onClose, onNavigate }: EngineCardDrawerProps) {
  if (card == null) {
    return null;
  }

  const vitals = vitalsScalarEntries(card);
  const hasStop = card.stop != null && card.stop.length > 0;
  const hasGuardrails = card.guardrails != null && card.guardrails.length > 0;
  const hasVitals = vitals.length > 0 || hasStop || hasGuardrails;

  return (
    <aside
      aria-label={`${card.prefLabel} card detail`}
      className="sticky bottom-0 z-30 border-t border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate-2)] text-[color:var(--viewer-canvas-fg)] shadow-[0_-18px_36px_rgba(0,0,0,0.34)]"
      data-testid="engine-card-drawer"
    >
      <div className="mx-auto grid max-w-[1180px] gap-5 px-5 py-5 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 font-sans text-[11px] font-semibold uppercase text-[color:var(--viewer-canvas-amber)]">
                <span>
                  {card.type} / {card.status}
                </span>
                {card.horizon === "future" ? (
                  <span
                    className={[
                      "border px-2 py-0.5 font-sans text-[10px] font-semibold uppercase",
                      FUTURE_HORIZON_CHIP_CLASS,
                    ].join(" ")}
                    data-testid="engine-card-horizon-chip"
                  >
                    future
                  </span>
                ) : null}
              </div>
              <h2 className="mt-1 break-words font-display text-[24px] leading-tight text-[color:var(--viewer-canvas-fg-bright)]">
                {card.prefLabel}
              </h2>
            </div>
            <button
              aria-label="Close Engine card detail"
              className="h-9 shrink-0 border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-3 font-sans text-[12px] font-semibold text-[color:var(--viewer-canvas-fg-dim)] hover:border-[color:var(--viewer-canvas-amber-dim)] hover:text-[color:var(--viewer-canvas-fg)]"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>

          <dl className="mt-4 grid grid-cols-[92px_1fr] gap-x-4 gap-y-2 border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-4 py-3 font-sans text-[12px]">
            <dt className="text-[color:var(--viewer-canvas-amber-dim)]">type</dt>
            <dd className="break-words text-[color:var(--viewer-canvas-fg-bright)]">{card.type}</dd>
            <dt className="text-[color:var(--viewer-canvas-amber-dim)]">prefLabel</dt>
            <dd className="break-words text-[color:var(--viewer-canvas-fg-bright)]">
              {card.prefLabel}
            </dd>
            <dt className="text-[color:var(--viewer-canvas-amber-dim)]">context</dt>
            <dd className="break-words text-[color:var(--viewer-canvas-fg-bright)]">
              {displayContext(card.context)}
            </dd>
            <dt className="text-[color:var(--viewer-canvas-amber-dim)]">plane</dt>
            <dd className="break-words text-[color:var(--viewer-canvas-fg-bright)]">
              {card.plane}
            </dd>
            <dt className="text-[color:var(--viewer-canvas-amber-dim)]">status</dt>
            <dd className="break-words text-[color:var(--viewer-canvas-fg-bright)]">
              {card.status}
            </dd>
          </dl>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          <section className="border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-sans text-[11px] font-semibold uppercase text-[color:var(--viewer-canvas-amber)]">
                Provenance
              </h3>
              <span
                className={[
                  "border px-2 py-0.5 font-sans text-[10px] font-semibold uppercase",
                  confidenceClass(card.confidence),
                ].join(" ")}
              >
                {card.confidence}
              </span>
            </div>
            <p className="mt-2 break-words text-[13px] text-[color:var(--viewer-canvas-fg)]">
              {card.provenance.label}
            </p>
            {sourceList(card.provenance.sourceRefs)}
          </section>

          {hasVitals ? (
            <section
              className="border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-4 py-3"
              data-testid={`engine-card-vitals-${engineTestIdPart(card.id)}`}
            >
              <h3 className="font-sans text-[11px] font-semibold uppercase text-[color:var(--viewer-canvas-amber)]">
                Vitals
              </h3>
              {vitals.length > 0 ? (
                <dl className="mt-2 grid grid-cols-[92px_1fr] gap-x-4 gap-y-1 font-sans text-[12px]">
                  {vitals.flatMap(([label, value]) => [
                    <dt className="text-[color:var(--viewer-canvas-amber-dim)]" key={`${label}-dt`}>
                      {label}
                    </dt>,
                    <dd
                      className="break-words text-[color:var(--viewer-canvas-fg-bright)]"
                      key={`${label}-dd`}
                    >
                      {value}
                    </dd>,
                  ])}
                </dl>
              ) : null}
              {tagNoteList("stop", card.stop, `engine-card-stop-${engineTestIdPart(card.id)}`)}
              {tagNoteList(
                "guardrails",
                card.guardrails,
                `engine-card-guardrails-${engineTestIdPart(card.id)}`,
              )}
            </section>
          ) : null}

          <section className="border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-4 py-3">
            <h3 className="font-sans text-[11px] font-semibold uppercase text-[color:var(--viewer-canvas-amber)]">
              Typed links
            </h3>
            {links.length === 0 ? (
              <p className="mt-2 font-sans text-[12px] text-[color:var(--viewer-canvas-fg-dim)]">
                No typed links projected.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {links.map((link) => (
                  <li key={`${link.direction}:${link.edge.id}`}>
                    <button
                      className="grid w-full grid-cols-[88px_1fr] gap-2 border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate-3)] px-3 py-2 text-left font-sans text-[12px] text-[color:var(--viewer-canvas-fg)] hover:border-[color:var(--viewer-canvas-amber-dim)] hover:bg-[color:var(--viewer-canvas-slate)]"
                      data-engine-edge-class={engineEdgeClass(link.edge.type)}
                      data-testid={`engine-drawer-link-${engineTestIdPart(link.otherCard.id)}`}
                      onClick={() => onNavigate(link.otherCard.id)}
                      type="button"
                    >
                      <span className="text-[color:var(--viewer-canvas-amber-dim)]">
                        {link.direction}
                      </span>
                      <span className="min-w-0">
                        <span className="block break-words font-semibold">
                          {link.edge.type} {"->"} {link.otherCard.prefLabel}
                        </span>
                        <span className="mt-0.5 block break-words text-[11px] text-[color:var(--viewer-canvas-fg-dim)]">
                          {link.otherCard.type} / {displayContext(link.otherCard.context)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </aside>
  );
}
