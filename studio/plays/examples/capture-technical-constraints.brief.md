# Play Design Brief — Capture Technical Constraints

*(Worked example. A complete brief at the standard we're aiming for — small play,
every section pulled tight. Imitate the shape, not the content.)*

```
status:   designed
tier:     coordinator
job:      Customer & Market Insight (technical overlay)
chain:    standalone (meeting-support play)
gate-1:   not yet approved
```

## 1. Goal

Given a meeting transcript segment, produce a **constraints log entry**: every
technical constraint or feasibility note raised in the segment, each with the
speaker, a verbatim quote, a plain-language restatement, and what it constrains.
The consumer is the PM running Feasibility Check or Survey the Existing System —
the entry is done when nothing raised was missed and nothing was invented.
A failed run reports *which part* of the transcript it couldn't process and why;
it never emits a partial log that looks complete. An empty log from a segment
with no constraints is a **valid success**, not a failure.

## 2. Trigger

Manual to start: the Director or PM invokes it on a transcript segment after a
discussion. Later: fired automatically when a meeting ends in Freeq.

## 3. Required knowledge

- **The transcript segment** (the only content source). Missing → refuse to run.
- **Speaker names** attached to the transcript. Missing → proceed degraded:
  capture constraints with speaker marked `unattributed`, and say so in the log header.
- No Library cards required — this play files raw observations; it does not
  interpret them against the architecture. (That's Feasibility Check's job.)

## 4. Golden path — the moves

```
1. judgment — reads transcript — identifies candidate statements that constrain
   the build (capacity, architecture, dependency, effort, risk) — writes a
   candidate list, each with speaker + verbatim quote
2. judgment — reads candidate list — restates each in plain product language and
   tags what it constrains (which feature/area/decision) — writes draft entries
3. software — reads draft entries + transcript — checks every entry has
   speaker, quote, restatement, tag; checks every quote appears verbatim in the
   transcript — writes a pass/fail check line per entry
4. human — Director or PM spot-checks the log before it's filed
```

Move 3 is the anti-hallucination gate, and it is honestly software: string
matching against the transcript is a closed rule.

## 5. What could go wrong

| Hypothesis | Severity | Response |
|---|---|---|
| Segment contains no constraints at all | — (valid outcome) | Emit an explicitly empty log: "no constraints raised in this segment" |
| Restatement drifts from what was actually said (paraphrase invention) | low-confidence | Move 3's verbatim-quote check fails the entry → loop back to move 2 for that entry only |
| A statement is ambiguous — might be a constraint, might be musing | needs-input | Capture it in an "unclear — Director to resolve" section; never silently resolve or drop |
| Transcript is malformed / not a transcript | errored | Refuse to run; report what was received instead |

## 6. Draft prompt language

> You are filing, not interpreting. Read the transcript segment and pull out every
> statement that limits or shapes what can be built — capacity, architecture,
> dependencies, effort, risk. For each one: who said it, their exact words, and a
> one-sentence restatement a non-engineer can act on. If you're not sure a
> statement is a constraint, file it under "unclear" — do not decide for the team
> and do not leave it out. If the segment contains no constraints, say exactly that.

## 7. Proof spec

- **Fixture:** a synthetic transcript with **3 planted constraints**, **1 ambiguous
  statement**, and ordinary chatter.
- **Pass looks like:**
  - all 3 planted constraints captured, each quote verbatim (I can ctrl-F the transcript)
  - the ambiguous statement appears under "unclear," not resolved, not dropped
  - zero entries that don't trace to the transcript
  - restatements readable by a non-engineer
- **The failure we'll demonstrate:** run it on a segment with no constraints —
  correct behavior is the explicit empty log, not invented entries.
