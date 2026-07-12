# Moves — Build Atomic Card (reverse-derived)

<!--
REVERSE-DERIVED reader overlay (the "Inside the play" section). The build is
`build-atomic-card/workflow.fabro` (prompts inline; story.md renders them
verbatim). Doers: command nodes = mechanical (the `ax cards` CLI); box nodes =
judgment (GPT-5.4 agents). Carried from the shipped build, not authored.
-->

### validate_contract

A mechanical gate runs before any card work.

- Validates the card contract (`ax cards validate-contract`) and resets the attempt counters.

**↳ Invalid → emit_child_result.** A malformed contract builds nothing — it reports back to the planning play and stops.

### draft_or_repair

A GPT-5.4 agent writes the card — grounded only in what the source actually says.

- Reads the contract, resolves the cited source ranges, lists the existing library.
- Writes WHAT · WHERE · WHY · WHEN · HOW; maps neighbours as phrased wikilinks; adds no claim the source doesn't support.
- On a bounce, repairs exactly the issues named — never starts over.

### validate_candidate

A mechanical structure check.

- Validates the candidate's shape (`ax cards validate-candidate`).

**↳ Structural issues → consume_attempt.** A malformed candidate spends a revision turn and bounces back to the drafter.

### grade_candidate

A second GPT-5.4 agent grades the card against the rubric and the raw source — and never edits it.

- Scores each section 0–100; checks every claim against the resolved source ranges.
- Returns a structured verdict: PUBLISH (clears the bar, no grounding violations), REVISE (specific deficiencies), or BAIL (the source can't carry it).

**↳ Bail → emit_child_result.** Some concepts the source simply can't support; the build says so rather than inventing.

**↳ Revise → consume_attempt.** Deficiencies go back to the drafter on a fresh turn.

### consume_attempt

The budget keeper — the three-strikes analog.

- Spends one revision turn (`ax cards consume-attempt --max <turns>`).

**↳ Exhausted → emit_child_result.** When the turns run out the loop stops; nothing is published.

### publish_card

- Publishes the accepted candidate into the card library (`ax cards publish`).

### emit_child_result

- Reports the per-card outcome — published / bailed / exhausted / invalid — back up to the planning play (`ax cards child-result`), then exits.
