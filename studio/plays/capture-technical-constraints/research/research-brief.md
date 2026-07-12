# Research brief — Capture Technical Constraints (step 0)

Drafted 2026-06-11 by the synthesis-and-verification agent. Executed same day
against the working example brief at
`../../examples/capture-technical-constraints.brief.md`. This is the second
play to carry the two-mandate brief structure established for Write the One-Pager
(see `../../write-the-one-pager/research/research-brief.md`).

> Research not only the best practices for our output (its form, its
> attributes) but also explores the questions we ask in the elicitation
> we're about to do — filling out our interview manifest with expert
> answers and examples found online.

**Alignment with the worked example brief:** The example brief scopes this play
narrowly as a transcript-extraction tool: given a meeting transcript, emit a
constraints log entry with speaker, verbatim quote, restatement, and what-is-
constrained. The research confirms this scope is the correct minimal surface for
a coordinator-tier play; the broader ADR / NFR / constraint-register literature
routes to adjacent plays or future compound plays, not here.

**Conflict to rule on:** The example brief classifies this play under
"Customer & Market Insight (technical overlay)" with chain = standalone. The
research surfaces a strong pull toward a compound-input relationship with
Write the One-Pager and Feasibility Check: constraints captured here are named
inputs to both downstream plays. The Director should rule on whether the job
classification and chain field are correct for the current design, or whether
this play should be modeled as a compound input of the PRD chain.

## Two mandates

**A. Ground the output.** What a constraints log entry is, its mandatory fields,
when the capture is done vs. incomplete, and what distinguishes a real constraint
from a preference laundered as one.

**B. Pre-answer the elicitation.** The brief conversation runs on
`../../TEMPLATE-brief.md`'s sections. For each, find the expert answer before
asking the Director:
- §1 Goal — what a successful run produces; done-condition; what a failed one looks like.
- §2 Trigger — when this play fires in expert practice (what must exist first).
- §3 Required knowledge — inputs experts say must be in hand; what to do when missing.
- §4 Golden path — the expert step-by-step method.
- §5 What could go wrong — documented failure modes and root causes, with severity.
- §7 Proof spec — how experts judge a constraint log entry; rubric; weak/strong pairs.

## Segments (executed same day)

Two Sonnet researcher reports were delivered:
1. **Method report** — ADR canon (Nygard, MADR, Y-Statement), constraint taxonomy
   (categories, rigidity levels, mandatory fields), NFR elicitation (ISO 25010,
   DPR SMART), golden-path synthesis across schools, prerequisite checklist.
2. **Quality/failure report** — failure modes and root causes, anti-patterns (named
   by Zimmermann, Konishi, Microsoft, modernanalyst.com), quality rubric with
   10 weak/strong pairs, verification of load-bearing claims.

## Claim discipline

Every claim carries its source (URL + attribution); verbatim quotes where fetched;
search-snippet claims flagged [S]; primary fetches flagged [F]. The one
search-snippet-only claim requiring verification (SPK Associates rework cost %)
was verified same day — verdict below. Raw claims in `extracted-claims.md`;
confirmed material in `grounding.md`, caveats inline.

## Verification verdict (same day)

- **SPK Associates "50% of total project costs" rework claim** (search-snippet):
  **UNCONFIRMED** — the primary URL was fetched; the page contains no statistics,
  percentages, or cited sources supporting this figure. The substance (late
  discovery is costly) is supported independently by Bridging the Gap (CONFIRMED-
  PRIMARY, verbatim fetched) and NASA SWEHB (CONFIRMED-PRIMARY). The 50% figure
  is NOT used in any research output.

## Open Director questions — carried to this play's brief conversation

(Surfaced by the step-0 synthesis, 2026-06-11. None block rung 2; each is a Gate-1-era ruling for THIS play.)

1. Chain field: the worked example says standalone, but the research shows its log is a named input to the one-pager AND the feasibility check — reclassify as compound input, or keep meeting-support scope?
2. Add a preference-laundering failure row (constraint stated without evidence basis → flagged hard-unverified, Director rules before filing), or is the existing unclear bucket sufficient?
3. The Spotify-style secondary trigger (peer review reveals an undocumented standard): in scope at coordinator tier, or future ADR-authoring play?
