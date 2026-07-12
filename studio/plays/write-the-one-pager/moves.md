# Moves — Write the One-Pager

<!--
AUTHORED, reader-facing prose for the Play-page "Inside the play" section. It
overlays the *derived* move spine (ids, doers, routes come from story.md /
workflow.fabro — never re-authored here). Like synopsis.md, this is a
deliberate simplification that points back at canon, never competing canon.

Paint-by-numbers, one block per move:

  ### <move id — matches the node id in workflow.fabro>
  <Lead: one plain sentence — what this move is.>
  - <The beats: 2–4 bullets, in order, in her voice — the concrete things
    she actually does on the golden path. Scannable, never a yolo paragraph.>

  **↳ <Route label> — <headline>.**
  <The branch story: what happens when a run validly leaves the golden path
  here. Write one per off-path route the move has (see story.md "Routes
  besides the golden path"), plus any honest empty/no-op landing worth
  naming. The label before the em-dash binds to the derived route so the
  viewer can draw the arrow and colour it; the colour is automatic —
  refuse/exit = red, empty/honest = blue, fix/bounce = amber.>

Sources:
  golden path  ← prompts/<move>.md (the method), story.md (the spine)
  branches     ← prompts/<move>.md routing blocks, brief §4 edges, hardening.md
Carried from the proven ../frame-the-problem prototype (same play shape, rung 2).
-->

### orient

She confirms she has what the work actually requires before building anything.

- Opens the problem brief and checks that it is real: at least one named entry, evidence grades, relationship edges.
- Reads the name-call for any caller narrowing — a scoped run names what was excluded by instruction.
- When the scope is genuinely ambiguous, she asks rather than lets her hunch silently become a priority verdict.

**↳ Refuse — no problem brief, no play.**
If no brief exists — or the file is blank, with no problem entries at all — she writes a loud, specific refusal report: what she received, what a problem brief would have given the work (named problems, evidence grades, the denominator the solution is held to), and the name of the play that produces one. Nothing else is built.

### account

She restates the entire problem space before any solution exists.

- Writes one row per brief entry in the owner's voice — the way the person with the problem would name it — carrying the brief's exact phrasing where it exists.
- Evidence grades travel verbatim from the brief: she does not re-grade, upgrade, or smooth an awkward grade.
- Where the brief recorded a dispute on a relationship edge, she carries both sides intact and marks the direction contested — the accounting is where disputes are made visible, not where they are settled.
- A thin brief proceeds: gaps are named explicitly ("evidence grade absent — unverifiable"), never backfilled.

### gather_context

She collects the business context already in the room without inventing what the room did not say.

- Scans the conversation for three answers: why now — what changed; what's the appetite (a human-stated bound, recorded verbatim and attributed — she never infers a number); and the top three named reasons this will not succeed.
- If the surface map is provided, she notes what the existing system already covers.
- When the conversation hasn't answered all three, she asks the room directly — one message, three questions — and waits.
- Whatever the room can't or won't answer is declared TBD; the play never blocks on missing context.

**↳ Checkpoint pause — the room is asked.**
When the conversation doesn't carry the three answers, she pauses within the move and puts the questions to the room: why now, what's the appetite, the top three reasons this fails. This is not a branch — the run does not split. Room answers are carried into context; silence or a decline marks each unanswered item TBD and proceeds. The play continues either way.

### define

She forms one coherent solution direction against the whole problem shape.

- Reads the full accounting — every entry, every grade, every edge — before forming any direction.
- Writes one direction: what kind of thing this is, who it is for, what change in the world it produces. Not a wishlist, not a ranked list of ideas.
- Where the accounting shows a suspected root, she traces how the direction plausibly addresses downstream entries through those edges — traced analysis, never a priority verdict.
- Disputed edges stay disputed; the direction is never designed as if one side were true.

### map_coverage

She holds the solution to every entry in the problem accounting, one by one.

- Works through the full accounting: for each entry, decides whether the solution addresses it (and how directly) or leaves it on the table as a named non-goal with rationale — "out of scope" alone is not a rationale.
- Where the brief recorded a dispute, she either carries the posited test forward (naming both scenarios and how the solution handles each) or states concretely why the solution is robust either way.
- States what she examined — coverage is attested, never implied.

**↳ Escalate — a disputed edge blocks the map.**
If the only honest path forward would require picking a side of a live dispute — no test she can carry forward, no robust-either-way claim she can defend — she stops. She writes an escalation report: the exact dispute, the posited test, why the coverage map cannot proceed without a ruling. The run ends there; the Director resolves it.

### set_goals

She turns the coverage map into goals stated as changes in the world, not features to ship.

- For each addressed entry, she asks: what changes for the person with this problem when the solution works? That is the goal.
- Names one primary metric, guardrails that must not degrade, and prefers rates over absolutes.
- An immeasurable goal is stated and marked as such — never censored, never dressed as measurable to make the list look clean.

### compose

She assembles the one-pager from the derived inputs — she writes, she does not re-derive.

- Puts the sections in reader order: problem inherited and traced · what we're building and why now · coverage map and non-goals · goals and metrics · assumptions and open questions.
- Every problem claim traces to a named accounting entry with its evidence grade intact; disputes in the brief travel open into the page, never resolved.
- TBD is legal and labeled; a one-pager with explicit TBDs is more useful downstream than one that fills gaps with guesses.
- Scans her own words for sizing language — quick, cheap, sprint, weeks, next — and removes every instance that is not a verbatim attributed human quote.

### ground

A proofreader who is not allowed to think runs four closed checks before anything leaves the desk.

- TRACE: every claim in the Problem section names a brief entry, with the evidence grade carried intact — not upgraded, not omitted.
- COVERAGE ACCOUNTING: every entry in the problem accounting is in the coverage map as either addressed or a named non-goal; nothing is silently dropped.
- SIZING LEXICON: the one-pager's own words — outside verbatim quotes — are free of quick, cheap, easy, small, sprint, weeks, months, first, next.
- FIELDS: required sections present; one primary metric plus guardrails; assumptions labeled.

**↳ Fix compose — trace, lexicon, or field failure.**
A drifted grade, a missing field, or a sizing word in Raven's own text goes back to `compose` with a note naming the exact failure. Compose fixes only what is named and carries every passing section unchanged. Three strikes on an item, then it ships marked failing — never silently dropped, never looped.

**↳ Fix coverage — coverage drop.**
An accounting entry absent from the coverage map is a failure that belongs to its upstream owner. It goes back to `map_coverage` first; that output flows down through compose, so fixing the upstream owner is mandatory before compose reruns.

### speak

She speaks the delta to the room — what her analysis added — not a recap of what they already heard.

- Opens on the solution shape against the problem space and the coverage verdict; ends with one question aimed at the weakest point of the one-pager.
- Anti-drift is absolute: the paragraph may claim nothing the page doesn't contain, and may not sound more certain than the evidence grades allow.
- 100 words is a ceiling, never a target; if she can say it in 60, she stops at 60.

### word_check

A one-line script counts the words in the spoken paragraph — the only purely mechanical gate in the play.

- 100 or fewer: passes through silently.
- Over budget: sends the paragraph back to lose a whole thought, not to compress one.

**↳ Over budget — back to speak.**
When the paragraph runs long it returns to `speak` to cut a thought entirely, never to squeeze one. After three visits the over-budget verdict travels on and is recorded at release rather than looped on.

### self_check

A fresh pair of eyes re-reads the finished work against the problem brief — it verifies, it does not rewrite.

- Anti-drift, both renderings: does the page or the paragraph claim more than the brief backs, or sound more certain than the evidence grades allow?
- Disputed-edge discipline: where the brief recorded a live disagreement, does the one-pager carry it open — no dispute silently resolved by building as if one side were true?
- Goals are outcomes, metrics are typed; a word-budget residual from the paragraph is recorded if the paragraph reached here over ceiling.

**↳ Fix voice — overclaim in the page or paragraph.**
An overclaim, an over-certain line, or an anti-drift violation — in the one-pager or the spoken paragraph — goes back to `compose`, carrying the exact claim and the brief entry it exceeds, side by side.

**↳ Fix logic — dropped entry or silently resolved dispute.**
A coverage mismatch, a dropped problem-brief entry, or a disputed edge that ground missed goes back to `map_coverage` — this is not a voice defect, it lives upstream. Fix at the source.

### cold_reader

A new teammate who wasn't in the room reads the one-pager alone to see if it stands on its own.

- Restates from the document alone: what are we building, who is it for, how will we know it worked, what is still open.
- Comprehensible: the page ships. Confused: she names the exact sentences that lost her and the question she could not answer from the document alone.

**↳ Confused — back to compose.**
If the newcomer can't follow it, the one-pager returns to `compose` with the confusing passages quoted and the unanswerable question named. Three strikes, then the confusion ships on the record rather than looping forever.
