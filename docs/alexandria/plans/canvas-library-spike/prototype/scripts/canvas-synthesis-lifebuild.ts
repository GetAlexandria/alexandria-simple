/**
 * Demo synthesis fixture for the lifebuild project.
 *
 * Hand-authored — acting as the LLM, given the scan output (groups: LifeMap,
 * Projects, DraftingRoom, ProjectRoom, SortingRoom, AgenticLoop, RoomChat,
 * etc.) and the README ("visual life management system, 8 domains, AI
 * workers that actually do things").
 *
 * Lives outside scripts/canvas-server.ts so the server stays product-agnostic
 * per CLAUDE.md ("agents and skills must work for ANY product"). Future
 * synthesis sources (real LLM call, other fixtures) plug into the same shape.
 */

export type NounSource = "director" | "docs" | "product" | "raven";

export interface StoryNoun {
  text: string;
  // empty array = industry-standard fill (no real source)
  sources: NounSource[];
  // for industry-fill nouns
  alternatives?: string[];
}

export interface StoryToken {
  kind: "text" | "noun";
  // for "text" — the literal characters
  v: string;
  // for "noun" — stable identifier across edits (e.g. "n-1-3")
  id?: string;
  // for "noun" — the meta
  noun?: StoryNoun;
}

export interface Synthesis {
  available: boolean;
  product_name?: string;
  // a recap of the director's orientation, paraphrased
  what_you_told_me?: string;
  story?: { paragraphs: StoryToken[][] };
  raven_prompt?: string;
  legend?: string;
  next_step_doc_ask?: string;
}

export function lifebuildSynthesis(): Synthesis {
  const t = (v: string): StoryToken => ({ kind: "text", v });
  let _para = 0;
  let _idx = 0;
  const nextPara = (): void => {
    _para++;
    _idx = 0;
  };
  const n = (text: string, sources: NounSource[], alternatives?: string[]): StoryToken => {
    _idx++;
    return {
      kind: "noun",
      v: text,
      id: `n-${_para}-${_idx}`,
      noun: { text, sources, alternatives },
    };
  };

  nextPara();
  const p1: StoryToken[] = [
    n("LifeBuild", ["director", "docs", "product"]),
    t(" is for "),
    n("individuals", ["director"]),
    t(" who want to bring the same strategic clarity to their "),
    n("personal life", ["director", "docs"]),
    t(" that they bring to their best "),
    n(
      "professional work",
      [],
      ["workplace standards", "office discipline", "the way you run projects at work"],
    ),
    t(
      ". The core problem it solves: outside of work, your projects get scattered across notes apps, calendars, and your own head — and the ",
    ),
    n("operational work", [], ["busywork", "low-leverage tasks", "tactical work"]),
    t(" eats the strategic time you wanted for deciding what matters."),
  ];

  nextPara();
  const p2: StoryToken[] = [
    t("You start with a "),
    n("LifeMap", ["docs", "product"]),
    t(" — your life laid out across "),
    n("eight domains", ["docs"]),
    t(", so you can see everything at once and prioritize ruthlessly. Inside the map you create "),
    n("Projects", ["product"]),
    t(", each one goal-oriented with success criteria. Projects live in dedicated "),
    n("Rooms", ["product"]),
    t(" — a "),
    n("DraftingRoom", ["product"]),
    t(" for shaping new ideas, a "),
    n("ProjectRoom", ["product"]),
    t(" for active execution, a "),
    n("SortingRoom", ["product"]),
    t(" for triage. When operational work piles up, you delegate it to "),
    n("Agents", ["docs"], ["AI workers", "operators", "assistants"]),
    t(" running in an "),
    n("AgenticLoop", ["product"]),
    t(" — AI workers that actually do the work, not just suggest it."),
  ];

  return {
    available: true,
    product_name: "LifeBuild",
    // No hardcoded recap — it lands when Raven (or the director) pushes one
    // via POST /api/canvas/recap/<step>.
    story: { paragraphs: [p1, p2] },
    legend:
      "Blue = a real noun from your words, your docs, or your product. Hover any blue noun to see where it came from. Gray = an industry-standard placeholder — hover to see alternatives, or replace it with your own term.",
    raven_prompt:
      "Anything wrong here? Anything we should call something else? Anything important we missed?",
    next_step_doc_ask:
      "Before we lay out how the library will be organized, do you have a product roadmap, technical whitepaper, or 'how it works' document handy? Dropping one in would give the next step a big head start.",
  };
}
