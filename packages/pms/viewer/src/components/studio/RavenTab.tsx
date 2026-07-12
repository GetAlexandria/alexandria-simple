import { useEffect, useMemo, useState } from "react";
import * as Effect from "effect/Effect";
import { fetchStudioFile } from "../../app/runtime/studio";
import type { StudioBoard, StudioRung } from "../../app/runtime/studio";
import { stageBadgeColor, stageLabel } from "./StudioApp";
import { StudioMarkdown } from "./StudioMarkdown";
import { JOBS, PLAYS, TIERS, W, type Play, type TierId, type Weight } from "./ravenModel";

/**
 * Raven — the studio's home tab. A data-driven port of the static
 * build-an-employee × human-role sheet (studio/index.html): three tiers
 * (Coordinator → PM → Sr. PM), the eight product jobs, base-product cards plus
 * a technical overlay. Plays that map to a registry play carry a `slug`; this
 * tab fetches the registry (for the golden-path # and criticality Tier) and
 * the Board (the single source of production progress) and routes those cards
 * to their workshop. Each card's corner shows its Board stage — not the
 * registry status — plus a "● ready" marker when it's awaiting the Director's
 * confirm. The Golden Path view shows only the registry-mapped plays. A
 * Grounding section at the bottom renders the role's design footprint.
 */

const RAVEN_GROUNDING_PATH = "plays/raven-grounding.md";

// Level-1 lens: a human-role tier, "All tiers" (the lot), or "Golden Path"
// (the cross-role demo chain). Level-2 (Show) only filters within a role.
type RoleLens = TierId | "all" | "golden";

// Level-2 view: filters WITHIN a role (or the full lot). Golden Path is NOT
// here — it's a Level-1 lens, since the chain spans roles.
type RavenView = "all" | "base" | "tech";

const VIEWS: { label: string; value: RavenView }[] = [
  { label: "All plays", value: "all" },
  { label: "Base product", value: "base" },
  { label: "Technical overlay", value: "tech" },
];

const WEIGHT_BADGE: Readonly<Record<1 | 2 | 3, string>> = {
  1: "border-[#786c5a]/40 bg-black/15 text-[#6a5e4e]",
  2: "border-[#4fb8a8]/45 bg-[#4fb8a8]/07 text-[#7ad4c4]",
  3: "border-[#f0c060]/50 bg-[#f0c060]/08 text-[#f0c060]",
};

// The tier selector: "All tiers" (the full lot — the default) + the three
// human-role tiers as filters. The full set of cards is all plays across all
// tiers; the tiers, Base/Technical, and Golden Path are all lenses on that lot.
const TIER_TABS: { glyph: string; id: RoleLens; name: string; sub: string }[] = [
  { glyph: "⬚", id: "all", name: "All tiers", sub: "the full lot" },
  ...TIERS.map((t) => ({ glyph: t.glyph, id: t.id, name: t.name, sub: t.sub })),
  { glyph: "↣", id: "golden", name: "Golden Path", sub: "the demo chain" },
];

const TIER_GLYPH: Readonly<Record<string, string>> = Object.fromEntries(
  TIERS.map((t) => [t.id, t.glyph]),
);

const TIER_IDS: ReadonlySet<string> = new Set(TIERS.map((t) => t.id));

// Narrow a RoleLens to a real human-role tier (excludes "all" / "golden"), so
// the per-job weight is only indexed for a tier the W table actually keys.
function isTierId(lens: RoleLens): lens is TierId {
  return TIER_IDS.has(lens);
}

function emptyMessage(view: RavenView): string {
  if (view === "tech") {
    return "No technical overlay in this job.";
  }
  if (view === "base") {
    return "No base plays in this job.";
  }
  return "No plays here.";
}

// Criticality tiers for the Golden Path view — most critical is Tier 1. The
// Golden Path is organized by these (the Tier is the section headline), not by
// the eight job categories. The trailing "Other" group is the safety net: any
// rung whose prio is null or outside the four known buckets still renders, so
// the registry chain is never silently truncated.
const GOLDEN_TIERS: { label: string; prios: readonly string[] }[] = [
  { label: "Tier 1", prios: ["core"] },
  { label: "Tier 2", prios: ["input"] },
  { label: "Tier 3", prios: ["stretch"] },
  { label: "Parked", prios: ["parked"] },
];

const GOLDEN_OTHER_LABEL = "Other";

// Every prio that maps to a named tier — anything else falls to "Other".
const KNOWN_GOLDEN_PRIOS: ReadonlySet<string> = new Set(GOLDEN_TIERS.flatMap((tier) => tier.prios));

// Group the registry rungs by criticality Tier (Tier 1 → … → Parked → Other),
// preserving registry order within each group. The Golden Path is the registry
// chain itself, so it iterates the rungs — proven plays that have no ravenModel
// card (e.g. frame-the-problem) still appear.
function groupGoldenRungs(
  rungs: readonly StudioRung[],
): { label: string; rungs: readonly StudioRung[] }[] {
  const groups = GOLDEN_TIERS.map((tier) => ({
    label: tier.label,
    rungs: rungs.filter((rung) => rung.prio != null && tier.prios.includes(rung.prio)),
  }));
  const other = rungs.filter((rung) => rung.prio == null || !KNOWN_GOLDEN_PRIOS.has(rung.prio));
  if (other.length > 0) {
    groups.push({ label: GOLDEN_OTHER_LABEL, rungs: other });
  }
  return groups.filter((group) => group.rungs.length > 0);
}

// The card's Board stage badge — the single source of production progress.
// A registry-mapped play that isn't on the Board reads as Backlog (unplaced).
function StageBadge(props: { stage: string }): React.ReactElement {
  return (
    <span
      className={`rounded-[3px] border px-1.5 py-0.5 text-[8px] uppercase tracking-[0.12em] ${stageBadgeColor(props.stage)}`}
    >
      {stageLabel(props.stage)}
    </span>
  );
}

function RavenCard(props: {
  golden: boolean;
  onOpenPlay: (slug: string) => void;
  play: Play;
  ready: boolean;
  rung: StudioRung | undefined;
  stage: string | undefined;
}): React.ReactElement {
  const { golden, play, ready, rung, stage } = props;
  const clickable = play.slug != null;
  const tech = play.tech === 1;
  const goldenMeta = golden && rung != null;
  // The Board is the single source of progress: show the stage badge whenever a
  // Board stage exists, OR (falling back) when the play has a registry rung — a
  // rung without a Board stage reads as the Backlog default. Only when the play
  // has neither do we fall through to the ⚙ tech / empty slot tag.
  const hasStage = stage != null || rung != null;

  const base = [
    "relative rounded-[4px] border border-[#d4a052]/18 p-[13px_14px_12px] transition-all",
    tech
      ? "border-l-[3px] border-l-[#4fb8a8] bg-gradient-to-b from-[#1c2220]/85 to-[#141a18]/80"
      : "border-l-[3px] border-l-dashed border-l-[#b8863a] bg-[#1c140c]/80",
    clickable
      ? "cursor-pointer hover:border-[#d4a052]/60 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
      : "hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]",
  ].join(" ");

  const body = (
    <>
      {/* upper-right: golden-path # · criticality Tier · Board stage · ready */}
      <span className="absolute right-[10px] top-[9px] flex flex-col items-end gap-1">
        {goldenMeta && rung != null ? (
          <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#c9a878]">
            #{rung.n}
          </span>
        ) : null}
        {hasStage ? (
          <StageBadge stage={stage ?? "backlog"} />
        ) : tech ? (
          <span className="rounded-[3px] border border-[#4fb8a8]/40 px-[5px] py-px text-[8px] uppercase tracking-[0.12em] text-[#7ad4c4]">
            ⚙ tech
          </span>
        ) : (
          <span className="text-[8px] uppercase tracking-[0.18em] text-[#6a5e4e]">empty</span>
        )}
        {ready ? (
          <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-[0.1em] text-[#7ad4c4]">
            <span aria-hidden>●</span> ready
          </span>
        ) : null}
      </span>
      <h4 className="mb-[5px] pr-[84px] font-display text-[16px] font-semibold leading-[1.15] text-[#e8e0d4]">
        <span className="mr-1 text-[12px] text-[#b8863a]" title={play.tier}>
          {TIER_GLYPH[play.tier]}
        </span>
        {play.n}
      </h4>
      <p className="min-h-[31px] text-[11.5px] leading-[1.45] text-[#9a8c78]">{play.d}</p>
    </>
  );

  if (clickable && play.slug != null) {
    const slug = play.slug;
    return (
      <button className={`${base} text-left`} onClick={() => props.onOpenPlay(slug)} type="button">
        {body}
      </button>
    );
  }
  return <div className={base}>{body}</div>;
}

function JobSection(props: {
  bySlug: Map<string, StudioRung>;
  glyph: string;
  jobId: (typeof JOBS)[number]["id"];
  name: string;
  onOpenPlay: (slug: string) => void;
  plays: readonly Play[];
  readySet: ReadonlySet<string>;
  stageBySlug: ReadonlyMap<string, string>;
  tag: string;
  view: RavenView;
  weight?: Weight;
}): React.ReactElement {
  return (
    <div className="mt-6 border-t border-[#d4a052]/12 pt-4">
      <div className="flex flex-wrap items-baseline gap-[13px]">
        <span className="text-[17px]">{props.glyph}</span>
        <span className="font-display text-[22px] font-semibold text-[#e8b86d]">{props.name}</span>
        <span className="text-[11.5px] italic text-[#9a8c78]">{props.tag}</span>
        {props.weight != null ? (
          <span
            className={`ml-auto whitespace-nowrap rounded-full border px-[11px] py-1 text-[9.5px] uppercase tracking-[0.11em] ${WEIGHT_BADGE[props.weight[0]]}`}
          >
            {props.weight[1]}
          </span>
        ) : null}
      </div>
      {props.plays.length > 0 ? (
        <div className="mt-[13px] grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
          {props.plays.map((play) => (
            <RavenCard
              golden={false}
              key={`${play.job}-${play.tier}-${play.n}`}
              onOpenPlay={props.onOpenPlay}
              play={play}
              ready={play.slug != null && props.readySet.has(play.slug)}
              rung={play.slug != null ? props.bySlug.get(play.slug) : undefined}
              stage={play.slug != null ? props.stageBySlug.get(play.slug) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="mt-3 text-[12px] italic text-[#6a5e4e]">{emptyMessage(props.view)}</div>
      )}
    </div>
  );
}

// A single registry-chain rung card for the Golden Path view. The card is the
// rung itself (not a ravenModel Play), so the chain shows every registered play
// — including proven ones with no role-sheet card. Trusted studio data: the
// description may carry inline HTML, rendered as the old RegistryRung did.
function RegistryRung(props: {
  onOpenPlay: (slug: string) => void;
  ready: boolean;
  rung: StudioRung;
  stage: string | undefined;
}): React.ReactElement {
  const { onOpenPlay, ready, rung, stage } = props;
  return (
    <button
      className="relative rounded-[4px] border border-[#d4a052]/18 border-l-[3px] border-l-[#b8863a] bg-[#1c140c]/80 p-[13px_14px_12px] text-left transition-all hover:border-[#d4a052]/60 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
      onClick={() => onOpenPlay(rung.slug)}
      type="button"
    >
      {/* upper-right: golden-path # · Board stage · ready */}
      <span className="absolute right-[10px] top-[9px] flex flex-col items-end gap-1">
        <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#c9a878]">
          #{rung.n}
        </span>
        <StageBadge stage={stage ?? "backlog"} />
        {ready ? (
          <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-[0.1em] text-[#7ad4c4]">
            <span aria-hidden>●</span> ready
          </span>
        ) : null}
      </span>
      <h4 className="mb-[5px] pr-[84px] font-display text-[16px] font-semibold leading-[1.15] text-[#e8e0d4]">
        {rung.glyph != null ? (
          <span className="mr-1 text-[12px] text-[#b8863a]">{rung.glyph}</span>
        ) : null}
        {rung.name}
      </h4>
      {rung.d != null ? (
        <p
          className="min-h-[31px] text-[11.5px] leading-[1.45] text-[#9a8c78] [&_b]:font-semibold [&_b]:text-[#c9a878]"
          // Trusted studio-owned data — registry.js descriptions carry inline
          // HTML (e.g. <b>); rendered verbatim like the legacy RegistryRung.
          dangerouslySetInnerHTML={{ __html: rung.d }}
        />
      ) : null}
    </button>
  );
}

// Golden Path view: the registry chain, organized by criticality Tier (the
// headline), not by the eight job categories. Tier 1 (most critical) first,
// then Tier 2/3, Parked, and an "Other" catch-all. Driven by the rungs — not
// the ravenModel PLAYS — so a proven play with no role-sheet card still shows.
function GoldenPathByTier(props: {
  groups: readonly { label: string; rungs: readonly StudioRung[] }[];
  onOpenPlay: (slug: string) => void;
  readySet: ReadonlySet<string>;
  stageBySlug: ReadonlyMap<string, string>;
}): React.ReactElement {
  return (
    <div className="pb-2">
      {props.groups.map((group) => (
        <div className="mt-6 border-t border-[#d4a052]/12 pt-4" key={group.label}>
          <h3 className="font-display text-[22px] font-semibold text-[#e8b86d]">{group.label}</h3>
          <div className="mt-[13px] grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
            {group.rungs.map((rung) => (
              <RegistryRung
                key={rung.slug}
                onOpenPlay={props.onOpenPlay}
                ready={props.readySet.has(rung.slug)}
                rung={rung}
                stage={props.stageBySlug.get(rung.slug)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GroundingSection(props: {
  footprint: { golden: number; proven: number; total: number };
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || content != null) {
      return;
    }
    let cancelled = false;
    // Re-opening after a failed fetch must retry cleanly: clear the stale error
    // before re-fetching so a transient failure recovers on re-expand.
    setError(null);
    void Effect.runPromise(fetchStudioFile(RAVEN_GROUNDING_PATH)).then(
      (text) => {
        if (!cancelled) {
          setContent(text);
          setError(null);
        }
      },
      (cause: unknown) => {
        if (!cancelled) {
          setError(String(cause));
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [open, content]);

  return (
    <div className="mt-10 border-t-2 border-[#b8863a] pt-7">
      <button
        className="flex w-full items-center gap-2 text-left"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="text-[15px] text-[#9a8c78]">{open ? "▾" : "▸"}</span>
        <span className="font-display text-[26px] font-semibold text-[#e8b86d]">Grounding</span>
        <span className="text-[11px] uppercase tracking-[0.12em] text-[#6a5e4e]">
          {props.footprint.total} modelled ·{" "}
          <span className="text-[#7ad4c4]">{props.footprint.golden}</span> on path ·{" "}
          <span className="text-[#9be8a0]">{props.footprint.proven}</span> proven
        </span>
      </button>
      {open ? (
        <div className="mt-4">
          <p className="mb-3 text-[12px] italic text-[#9a8c78]">
            The footprint of what Raven is built from.
          </p>
          {error != null ? (
            <p className="text-[12px] text-[#e08a8a]">{error}</p>
          ) : content == null ? (
            <p className="text-[12px] text-[#8f806c]">loading grounding…</p>
          ) : (
            <StudioMarkdown content={content} />
          )}
        </div>
      ) : null}
    </div>
  );
}

export function RavenTab(props: {
  board: StudioBoard | null;
  onOpenPlay: (slug: string) => void;
  rungs: readonly StudioRung[];
}): React.ReactElement {
  const [active, setActive] = useState<RoleLens>("all");
  const [view, setView] = useState<RavenView>("all");

  const bySlug = useMemo(
    () => new Map(props.rungs.map((rung) => [rung.slug, rung])),
    [props.rungs],
  );

  // The Board is the single source of production progress. Build slug → stage
  // from board.stages (each slug in a stage's list maps to that stage), and the
  // ready set from board.ready (slugs awaiting the Director's confirm).
  const stageBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const [stage, slugs] of Object.entries(props.board?.stages ?? {})) {
      for (const slug of slugs) {
        map.set(slug, stage);
      }
    }
    return map;
  }, [props.board]);

  const readySet = useMemo(() => new Set(props.board?.ready ?? []), [props.board]);

  const visible = (play: Play): boolean => {
    if (view === "base") {
      return play.tech === 0;
    }
    if (view === "tech") {
      return play.tech === 1;
    }
    return true;
  };

  // The Golden Path IS the registry chain — group the rungs by criticality
  // Tier (+ an "Other" catch-all). Memoized: stable per fetched registry.
  const goldenGroups = useMemo(() => groupGoldenRungs(props.rungs), [props.rungs]);

  const footprint = useMemo(() => {
    // The Golden Path is the registry chain, so the footprint counts the rungs,
    // not the ravenModel PLAYS: "on path" = every rung; "proven" reads from the
    // Board — a rung whose board stage is proven or live (counted even when it
    // has no role-sheet card). "modelled" stays the count of ravenModel plays.
    const proven = props.rungs.filter((rung) => {
      const stage = stageBySlug.get(rung.slug);
      return stage === "proven" || stage === "live";
    });
    return {
      golden: props.rungs.length,
      proven: proven.length,
      total: PLAYS.length,
    };
  }, [props.rungs, stageBySlug]);

  const tier = TIERS.find((entry) => entry.id === active) ?? TIERS[0];
  const isGolden = active === "golden";

  return (
    <div>
      {/* Level 1: role lenses — All tiers · TC · PM · Sr · Golden Path.
          Junior to the Studio tabs above: compact, no raised parchment lift. */}
      <div className="flex gap-1.5">
        {TIER_TABS.map((entry) => {
          const on = entry.id === active;
          return (
            <button
              className={[
                "relative flex flex-1 items-center gap-2 rounded-t-[4px] border border-b-0 px-[11px] py-[7px] text-left transition-all",
                on
                  ? "border-[#d4a052] bg-gradient-to-b from-[#c9a878] to-[#b8946a] text-[#28180a]"
                  : "border-[#d4a052]/18 bg-gradient-to-b from-[#281c10]/60 to-[#140e08]/60 text-[#9a8c78] hover:bg-[#4fb8a8]/10 hover:text-[#e8e0d4]",
              ].join(" ")}
              key={entry.id}
              onClick={() => setActive(entry.id)}
              type="button"
            >
              <span className={`text-[13px] ${on ? "text-[#5a3c14]" : "text-[#d4a052]"}`}>
                {entry.glyph}
              </span>
              <span>
                <span className="block font-display text-[13px] font-semibold leading-[1.1]">
                  {entry.name}
                </span>
                <span className="block text-[8.5px] uppercase tracking-[0.12em] opacity-80">
                  {entry.sub}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Intro — none for All tiers (no single role to narrate) */}
      {isGolden || active !== "all" ? (
        <div className="border-t border-[#d4a052]/18 px-1 pb-1 pt-4 font-display text-[17px] italic leading-[1.5] text-[#7ad4c4]">
          {isGolden
            ? "The golden path — the demo chain, across all roles. Tier 1 is most critical."
            : tier.intro}
        </div>
      ) : null}

      {/* Level 2: Show — filters within a role; not shown for Golden Path */}
      {!isGolden ? (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-[#6a5e4e]">
          Show:
          <div className="inline-flex overflow-hidden rounded-[5px] border border-[#d4a052]/18">
            {VIEWS.map((entry) => {
              const on = entry.value === view;
              return (
                <button
                  className={[
                    "border-r border-[#d4a052]/18 px-[13px] py-[5px] text-[11px] transition-colors last:border-r-0",
                    on
                      ? entry.value === "tech"
                        ? "bg-[#4fb8a8]/16 text-[#7ad4c4]"
                        : "bg-[#f0c060]/14 text-[#f0c060]"
                      : "text-[#9a8c78] hover:bg-[#4fb8a8]/08 hover:text-[#e8e0d4]",
                  ].join(" ")}
                  key={entry.value}
                  onClick={() => setView(entry.value)}
                  type="button"
                >
                  {entry.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Golden Path → organized by Tier; roles/All → the eight job categories */}
      {isGolden ? (
        <GoldenPathByTier
          groups={goldenGroups}
          onOpenPlay={props.onOpenPlay}
          readySet={readySet}
          stageBySlug={stageBySlug}
        />
      ) : (
        <div className="pb-2">
          {JOBS.map((job) => {
            const plays = PLAYS.filter(
              (play) =>
                play.job === job.id && visible(play) && (active === "all" || play.tier === active),
            );
            return (
              <JobSection
                bySlug={bySlug}
                glyph={job.glyph}
                jobId={job.id}
                key={job.id}
                name={job.name}
                onOpenPlay={props.onOpenPlay}
                plays={plays}
                readySet={readySet}
                stageBySlug={stageBySlug}
                tag={job.tag}
                view={view}
                weight={isTierId(active) ? W[job.id][active] : undefined}
              />
            );
          })}
        </div>
      )}

      <GroundingSection footprint={footprint} />
    </div>
  );
}
