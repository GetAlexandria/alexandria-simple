# Hardening — Write the One-Pager / PRD (the reshape)

Hardener: fresh-eyes agent + orchestrator synthesis, 2026-06-16. Scope per the
ladder: content AND shape, before Gate 1. The One-Pager was at "brief, pre-Gate-1"
— §4 was a narrative list, not a derivable move graph. Method: the §4 move graph
audited against the move-graph laws (doer-honesty, edges-not-margins, owned
bounces + three-strikes, mixed-failure ordering, consumes/emits state discipline)
with the exemplar `frame-the-problem` as the standard; content critique across
§§1–8; the Director's decision queue surfaced.

**Disposition convention:** *APPLIED* = mechanical fix made in the reshape (follows
the exemplar/rules, no ruling needed); *▲ PROVISIONAL* = orchestrator decision
applied and flagged for the Director to react to in the studio (overriding it
re-derives); *DIRECTOR* = needs a ruling, queued.

The reshape rewrote §4 into the block format (`doer / consumes / emits / does /
bounces / routes` + `checkpoint`), split the bundled mechanical checks into a real
`ground` node + a `word_check` software node, wired every bounce edge and
consumes/emits, named the refusal and escalation artifacts, and applied the seven
provisional Gate-1 decisions. Brief flips `drafted → designed (provisional)`.

## A. Structural findings (Derive-readiness of §4)

| # | Finding (severity) | Disposition |
|---|---|---|
| A1 | §4 was narrative prose, not the derivable block format (blocking) | APPLIED: rewritten to `doer/consumes/emits/does/bounces/routes`, mirroring the exemplar's §4 |
| A2 | every bounce lived in §5 prose only, none in §4 (blocking) | APPLIED: each is a named edge — ground→{compose, map_coverage}, self_check→{compose, map_coverage}, cold_reader→compose, word_check→speak |
| A3 | mixed-failure ordering for the checker absent (blocking) | APPLIED: ground's mixed case bounces map_coverage (upstream) before compose; recorded as a taste call, lint E5-a |
| A4 | doer-honesty: mechanical checks bundled in a judgment move (blocking) | APPLIED: split into `ground` (mechanical, runs best-effort as an agent per PROJECTION D3) + the `word_check` software node; the judgment residue is `self_check` |
| A5 | consumes/emits undefined; the checker couldn't run its trace (blocking) | APPLIED: every move declares consumes/emits; `ground` and `self_check` consume the problem brief (to verify traces); `speak`/`word_check` consume the spoken paragraph |
| A6 | the three-question elicitation had no human checkpoint (should-fix) | APPLIED: `gather_context` carries a `checkpoint` — asks the room; answers→context, silence→TBD; never blocks (only the missing brief at `orient` is a hard gate) |
| A7 | the word ceiling was assigned to no node (should-fix) | APPLIED via ▲②: a real `word_check` software node (`wc`, ceiling 100), mirroring the exemplar |

## B. Content findings

| # | Finding | Disposition |
|---|---|---|
| B1 | dual-rendering (page + spoken) not structural; post-speak anti-drift unowned | APPLIED: `compose` (page) and `speak` (spoken) are separate moves; `self_check` verifies BOTH for drift after speak |
| B2 | the refusal artifact was unnamed (Protocol E would flag) | APPLIED: `orient` emits `refusal-report` |
| B3 | the cold-read was a same-agent self-check, not actually cold | APPLIED via ▲⑤: `cold_reader` in-run node reads the one-pager alone |
| B4 | the disputed-edge escalation path was missing from the graph | APPLIED via ▲⑥: `map_coverage → exit [Escalate]` emits an escalation-report; self_check's disputed catch bounces to map_coverage |
| B5 | the degraded-and-labeled (thin brief) path was unspecified | APPLIED: `orient` names it (NOT a refusal); `account` proceeds degraded and names the gaps |
| B6 | the coverage map had no named emit for the checker to verify | APPLIED: `map_coverage` emits `coverage-map`; `ground` checks it |
| B7 | §7 was in the old proof-spec format | RESOLVED via ▲⑦: §7 = `risk-map.md` (#270, already authored — the modern coverage plan) |
| B8 | no untrusted-input declaration in §3 (the §6 clause is broader) | DIRECTOR (minor): §3 should declare the problem brief / transcripts untrusted to match §6; queued, non-blocking |
| B9 | sizing-law rationale sat in §4 and could leak into prompts | APPLIED: trimmed to a standing-constraint note; `ground` enforces the lexicon mechanically |

## C. Director's queue (provisional answers applied; he reacts in the studio)

▲①–⑦ are applied in the brief §4 amendment. Genuinely open for the Director's
ruling — and the reason this is built rather than asked:

1. **▲① coverage-first** — the one real design fork (account → define → map vs.
   solution-first). The forcing function against "solution-in-disguise."
2. **▲② spoken ceiling = 100** — the `word_check` number.
3. **node count — 12 vs the exemplar's 9.** The One-Pager genuinely does more
   (account · gather_context · define · map_coverage · set_goals), but `set_goals`
   could fold into `compose`, and `account`+`gather_context` are candidates to
   reconsider. Flag for his eye.
4. **B8** — the minor §3 trust declaration.

Coverage attestation: all twelve moves state-audited (consumes/emits chained,
including bounce re-entry); every bounce walked for fix-capacity and an owner; the
§5 failure table mapped to moves/routes; the escalation route, the `word_check`
condition, and `cold_reader` placement checked against the exemplar. The node
prompts (the method bodies) are authored at Derive and lint at Protocol A–E.
