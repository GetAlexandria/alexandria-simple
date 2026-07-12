/**
 * Raven — Technical Product role model. The "build-an-employee × human-role"
 * sheet, ported verbatim from studio/index.html (TIERS, JOBS, W weights, PLAYS)
 * and made data-driven for the viewer's Raven home tab.
 *
 * The model: one shared product core (the eight jobs) + Technical as an additive
 * overlay (the tech: 1 cards). Plays that map to a registry play carry a `slug`
 * so the tab can surface live status and route to the play's workshop. Two
 * reconciliation plays (Elicit Business Context, Riskiest-Assumption Test) are
 * added here from the golden path — they were missing from the original sheet.
 * See studio/plays/raven-grounding.md for the rationale.
 */

export type TierId = "coordinator" | "manager" | "senior";

export interface Tier {
  glyph: string;
  id: TierId;
  /** The italic teal one-liner shown under the tier tabs. */
  intro: string;
  name: string;
  sub: string;
}

export type JobId =
  | "insight"
  | "strategy"
  | "spec"
  | "delivery"
  | "launch"
  | "analytics"
  | "comms"
  | "ops";

export interface Job {
  glyph: string;
  id: JobId;
  name: string;
  tag: string;
}

/** Weight: [intensity 1–3, one-word ownership label] per tier per job. */
export type Weight = readonly [1 | 2 | 3, string];
export type JobWeights = Readonly<Record<TierId, Weight>>;

export interface Play {
  /** Long description shown in the card body. */
  d: string;
  job: JobId;
  /** Display name (the sheet's play name). */
  n: string;
  /** Registry slug when this play maps to a live registry play. */
  slug?: string;
  /** 1 = technical overlay card (teal); 0 = base product card (dashed gold). */
  tech: 0 | 1;
  tier: TierId;
}

export const TIERS: readonly Tier[] = [
  {
    glyph: "◇",
    id: "coordinator",
    intro:
      "The Coordinator keeps the product machine running — heaviest on delivery, communication logistics, and operations; barely touches the build decisions.",
    name: "Technical Coordinator",
    sub: "Inputs · runs the machine",
  },
  {
    glyph: "◆",
    id: "manager",
    intro:
      "The Product Manager owns a feature end to end — from a validated problem, through a buildable spec, to a shipped, measured result.",
    name: "Technical PM",
    sub: "Owns a feature end-to-end",
  },
  {
    glyph: "★",
    id: "senior",
    intro:
      "The Senior owns the strategy across features — the bets, the roadmap, the narrative to leadership.",
    name: "Technical Sr. Manager",
    sub: "Owns strategy across features",
  },
];

export const JOBS: readonly Job[] = [
  {
    glyph: "🔍",
    id: "insight",
    name: "Customer & Market Insight",
    tag: "Know the user and the market",
  },
  {
    glyph: "🎯",
    id: "strategy",
    name: "Strategy & Prioritization",
    tag: "Decide what to build, and why",
  },
  {
    glyph: "📐",
    id: "spec",
    name: "Product Definition",
    tag: "Turn the decision into something buildable",
  },
  {
    glyph: "🛠️",
    id: "delivery",
    name: "Delivery & Execution",
    tag: "Get it built, on track, unblocked",
  },
  {
    glyph: "🚀",
    id: "launch",
    name: "Launch & Go-to-Market",
    tag: "Ship it and make it land",
  },
  {
    glyph: "📊",
    id: "analytics",
    name: "Analytics & Outcomes",
    tag: "Measure what happened; learn from it",
  },
  {
    glyph: "📣",
    id: "comms",
    name: "Stakeholder Communication",
    tag: "Keep everyone aligned",
  },
  {
    glyph: "⚙️",
    id: "ops",
    name: "Product Operations",
    tag: "Run the tools, process, and cadence",
  },
];

export const W: Readonly<Record<JobId, JobWeights>> = {
  insight: {
    coordinator: [2, "Supports"],
    manager: [3, "Owns"],
    senior: [2, "Sets the thesis"],
  },
  strategy: {
    coordinator: [1, "Light"],
    manager: [2, "Shares"],
    senior: [3, "Owns"],
  },
  spec: {
    coordinator: [2, "Supports"],
    manager: [3, "Owns"],
    senior: [2, "Reviews"],
  },
  delivery: {
    coordinator: [3, "Heavy"],
    manager: [3, "Owns"],
    senior: [1, "Light"],
  },
  launch: {
    coordinator: [2, "Supports"],
    manager: [3, "Owns"],
    senior: [2, "Calls it"],
  },
  analytics: {
    coordinator: [2, "Supports"],
    manager: [3, "Owns"],
    senior: [3, "Decides"],
  },
  comms: {
    coordinator: [3, "Heavy"],
    manager: [3, "Owns"],
    senior: [2, "Narrative"],
  },
  ops: {
    coordinator: [3, "Owns"],
    manager: [1, "Light"],
    senior: [1, "Light"],
  },
};

const b = (job: JobId, tier: TierId, n: string, d: string): Play => ({
  d,
  job,
  n,
  tech: 0,
  tier,
});
const t = (job: JobId, tier: TierId, n: string, d: string): Play => ({
  d,
  job,
  n,
  tech: 1,
  tier,
});

export const PLAYS: readonly Play[] = [
  // INSIGHT
  {
    ...b(
      "insight",
      "coordinator",
      "Gather Customer Feedback",
      "Collect and tag incoming user feedback into the insight log.",
    ),
  },
  {
    ...b(
      "insight",
      "coordinator",
      "Market & Competitor Scan",
      "Summarize what competitors shipped and where the gaps are.",
    ),
    slug: "market-competitor-scan",
  },
  {
    ...b(
      "insight",
      "coordinator",
      "Schedule & Log Interviews",
      "Book user interviews and file clean, searchable notes.",
    ),
  },
  {
    ...t(
      "insight",
      "coordinator",
      "Capture Technical Constraints",
      "File the eng constraints and feasibility notes raised in discussion.",
    ),
    slug: "capture-technical-constraints",
  },
  {
    ...b(
      "insight",
      "manager",
      "Run a Discovery Interview",
      "Lead the conversation and surface the real problem.",
    ),
  },
  {
    ...b(
      "insight",
      "manager",
      "Run Internal Feature Discovery",
      "Find the problem behind a proposed internal solution (solution → problem).",
    ),
    slug: "run-internal-feature-discovery",
  },
  {
    ...b(
      "insight",
      "manager",
      "Frame the Problem",
      "State the job-to-be-done and exactly who has it.",
    ),
    slug: "frame-the-problem",
  },
  // Reconciliation: on the golden path, missing from the original sheet.
  {
    ...b(
      "insight",
      "manager",
      "Elicit Business Context",
      "Draw out the business goal, constraints, and stakeholders behind the ask.",
    ),
    slug: "elicit-business-context",
  },
  {
    ...t(
      "insight",
      "manager",
      "Feasibility Check",
      "Validate the idea against the architecture before committing resources.",
    ),
    slug: "feasibility-check",
  },
  {
    ...b(
      "insight",
      "senior",
      "Size the Opportunity",
      "Estimate the value of solving this versus the alternatives.",
    ),
    slug: "size-the-opportunity",
  },
  {
    ...b(
      "insight",
      "senior",
      "Set the Insight Thesis",
      "Decide which problem space the team bets on.",
    ),
  },
  {
    ...t(
      "insight",
      "senior",
      "Assess Technical Bet & Risk",
      "Weigh the scalability and feasibility of a direction.",
    ),
  },
  // STRATEGY
  {
    ...b(
      "strategy",
      "coordinator",
      "Maintain the Backlog",
      "Keep the backlog clean, tagged, and de-duplicated.",
    ),
  },
  {
    ...b(
      "strategy",
      "coordinator",
      "Keep the Roadmap Current",
      "Update the roadmap tool as decisions land.",
    ),
  },
  {
    ...b(
      "strategy",
      "manager",
      "Prioritize the Backlog",
      "Rank what is next, with rationale for each call.",
    ),
    slug: "prioritize-the-backlog",
  },
  {
    ...b("strategy", "manager", "Draft the Roadmap", "Lay out now / next / later for the area."),
  },
  {
    ...t(
      "strategy",
      "manager",
      "Plan Tech-Debt Paydown",
      "Sequence debt work against feature work.",
    ),
  },
  {
    ...b("strategy", "senior", "Frame a Bet", "Problem → hypothesis → success metric."),
    slug: "frame-a-bet",
  },
  // Reconciliation: on the golden path, missing from the original sheet.
  {
    ...b(
      "strategy",
      "senior",
      "Riskiest-Assumption Test",
      "Isolate the assumption that would sink the bet, and test it cheaply.",
    ),
    slug: "riskiest-assumption-test",
  },
  {
    ...b(
      "strategy",
      "senior",
      "Set Product Strategy",
      "Pick the direction and the explicit non-goals.",
    ),
  },
  {
    ...b("strategy", "senior", "Make the Build / Kill Call", "Commit it, or cut it."),
  },
  {
    ...t(
      "strategy",
      "senior",
      "Set Technical Standards",
      "Architecture and quality standards across features.",
    ),
  },
  {
    ...t("strategy", "senior", "Build-vs-Buy Call", "Decide to build, buy, or integrate."),
  },
  // SPEC / DEFINITION
  {
    ...b(
      "spec",
      "coordinator",
      "Maintain Spec Docs & Templates",
      "Keep specs current and well-formatted.",
    ),
  },
  {
    ...b("spec", "coordinator", "Draft Release Notes", "Write the first pass of what shipped."),
  },
  {
    ...t(
      "spec",
      "coordinator",
      "Maintain API & Technical Docs",
      "Keep technical docs and API references current.",
    ),
  },
  {
    ...b("spec", "manager", "Write the One-Pager / PRD", "Define what we are building and why."),
    slug: "write-the-one-pager",
  },
  {
    ...b("spec", "manager", "Write Acceptance Criteria", 'Spell out what "done" means.'),
    slug: "write-acceptance-criteria",
  },
  {
    ...b("spec", "manager", "Scope an MVP", "Cut to the smallest valuable slice."),
    slug: "scope-an-mvp",
  },
  {
    ...t(
      "spec",
      "manager",
      "Survey the Existing System",
      "Tour the surface and audit what is load-bearing in the current build.",
    ),
    slug: "survey-the-existing-system",
  },
  {
    ...t(
      "spec",
      "manager",
      "Write the Technical Spec",
      "The design + the integration contract engineering trusts.",
    ),
  },
  {
    ...b("spec", "senior", "Review Spec for Strategic Fit", "Does this actually serve the bet?"),
  },
  {
    ...t("spec", "senior", "Architecture Review", "Review the design for scalability and fit."),
  },
  // DELIVERY
  {
    ...b(
      "delivery",
      "coordinator",
      "Track the Timeline",
      "Own dates, dependencies, and the status board.",
    ),
  },
  {
    ...b(
      "delivery",
      "coordinator",
      "Run Status Updates",
      "Drive stand-ups and circulate progress notes.",
    ),
  },
  {
    ...b("delivery", "coordinator", "Set QA Checkpoints", "Place quality gates across the build."),
  },
  {
    ...b(
      "delivery",
      "coordinator",
      "Groom the Backlog",
      "Keep tickets ready and clear for the team.",
    ),
  },
  {
    ...t(
      "delivery",
      "coordinator",
      "Maintain the Technical Backlog",
      "Keep bug and tech-debt tickets triaged and detailed.",
    ),
  },
  {
    ...b("delivery", "manager", "Run Sprint Planning", "Commit the sprint with the team."),
  },
  {
    ...b("delivery", "manager", "Unblock Engineering", "Clear the path; make the judgment calls."),
  },
  {
    ...b("delivery", "manager", "Run UAT", "Validate it does what the spec says."),
  },
  {
    ...t(
      "delivery",
      "manager",
      "Architecture-Aware Build Plan",
      "Sequence the work against the real codebase — the hand-off.",
    ),
    slug: "architecture-aware-build-plan",
  },
  {
    ...t(
      "delivery",
      "manager",
      "Code-Health / Anti-Pattern Sweep",
      "Flag risky patterns before they spread.",
    ),
  },
  {
    ...b(
      "delivery",
      "senior",
      "Resolve Cross-Team Blockers",
      "Use standing to break the log-jams.",
    ),
  },
  // LAUNCH
  {
    ...b(
      "launch",
      "coordinator",
      "Coordinate Launch Logistics",
      "Run the launch checklist end to end.",
    ),
  },
  {
    ...b("launch", "coordinator", "Prep Launch Materials", "Assemble promo and enablement assets."),
  },
  {
    ...b("launch", "coordinator", "Run Feature Training", "Teach internal teams the new feature."),
  },
  {
    ...b("launch", "manager", "Plan the Launch", "Own the go-to-market plan and rollout."),
  },
  {
    ...b("launch", "manager", "Coordinate Rollout", "Stage the release safely (flags, phases)."),
  },
  {
    ...b("launch", "manager", "Enable Sales & Support", "Arm the front line before it lands."),
  },
  {
    ...b("launch", "senior", "Make the Go / No-Go Call", "Decide we ship."),
  },
  // ANALYTICS
  {
    ...b(
      "analytics",
      "coordinator",
      "Report the Metrics",
      "Pull the numbers and circulate the read.",
    ),
  },
  {
    ...b("analytics", "coordinator", "Maintain Event Taxonomy", "Keep tracking clean and trusted."),
  },
  {
    ...b(
      "analytics",
      "manager",
      "Review the Funnel",
      "Find where users drop, and form a hypothesis.",
    ),
  },
  {
    ...b("analytics", "manager", "Run a Retro", "Capture what the team learned."),
  },
  {
    ...b("analytics", "manager", "Write a Results Readout", "Tell the story of what happened."),
  },
  {
    ...t(
      "analytics",
      "manager",
      "Instrument the Feature",
      "Define the events and telemetry in the build.",
    ),
  },
  {
    ...b("analytics", "senior", "Decide Iterate / Kill / Scale", "Act on the result."),
  },
  {
    ...b("analytics", "senior", "Diagnose Churn", "Root-cause why users leave."),
  },
  // COMMS
  {
    ...b(
      "comms",
      "coordinator",
      "Prepare Status Reports",
      "Roll up progress for senior management.",
    ),
  },
  {
    ...b("comms", "coordinator", "Run Recurring Syncs", "Keep the cross-team meetings flowing."),
  },
  {
    ...b(
      "comms",
      "coordinator",
      "Coordinate Cross-Team Comms",
      "Route information where it needs to go.",
    ),
  },
  {
    ...b("comms", "manager", "Write a Stakeholder Update", "A crisp written update with the why."),
  },
  {
    ...b("comms", "manager", "Make an Ask", "Request a decision or resources, clearly."),
  },
  {
    ...b("comms", "senior", "Tell the Product Narrative", "Frame the story leadership buys into."),
  },
  {
    ...b("comms", "senior", "Brief Leadership", "Present strategy and trade-offs to execs."),
  },
  // OPS
  {
    ...b(
      "ops",
      "coordinator",
      "Administer the Tool Stack",
      "Own Jira / Confluence / analytics configuration.",
    ),
  },
  {
    ...b(
      "ops",
      "coordinator",
      "Manage Access & Permissions",
      "Grant and govern who can see and do what.",
    ),
  },
  {
    ...b(
      "ops",
      "coordinator",
      "Maintain the Documentation System",
      "Keep the team knowledge base tidy and current.",
    ),
  },
  {
    ...b("ops", "coordinator", "Standardize Rituals", "Codify how the team works."),
  },
  {
    ...t(
      "ops",
      "coordinator",
      "Manage the Dev Toolchain",
      "Own CI / repo / environment access and config.",
    ),
  },
  {
    ...b("ops", "manager", "Improve a Workflow", "Find the friction; fix the process."),
  },
  {
    ...b("ops", "senior", "Evaluate & Choose a Tool", "Pick and budget new tooling."),
  },
];
