# Problem Brief — Losing track of what's open and what's intentional across contract redline rounds
framed with: surface map [provided] · users [provided] · prior brief [not provided]
run: complete

## The picture
When a contract crosses three or more redline rounds, the people working on it lose the thread. The associate managing the negotiation can't reconstruct which issues are still live without walking back through every prior version. The reviewing attorney, opening a late draft cold, can't tell whether a clause that looks like it belongs to an earlier version got there on purpose or by accident. Both gaps trace to the same architectural hole — nothing in the product carries context forward across versions — but they hit different people at different moments and neither fix requires the other.

## P1 — "By round three I genuinely can't tell what's still open"
- progress sought: Walk into a call with outside counsel or sit down to review a late-stage draft and know, without archaeology, which issues from this negotiation are still live and which are closed.
- who: Soren — associate (manages contract negotiations end-to-end, tracks redlines, coordinates with outside counsel across multiple active deals simultaneously)
- circumstance: A multi-party contract has gone through three or more redline rounds. Soren is on a call with outside counsel or preparing for one. He needs the current state of every open issue, but the only way to reconstruct it is to walk back through each prior version. The gap between the number of versions and what he can hold in memory means he either guesses or burns time re-reading.
- evidence:
  - "the thing I keep running into is that when a contract goes through three or four rounds of redlines, by round three I genuinely can't tell what's still open without going back through every version manually." — Soren — specific-past
  - "I'll be on a call with outside counsel and I'm not sure if the indemnity carve-out is still live or if we closed it in version two." — Soren — specific-past
  - "Pretty much every multi-party deal we do. Anything with more than two redline rounds. Which is most of our deals above a certain size." — Soren — opinion (conviction high)
  - "Last month I'd say it happened on four out of five of the deals I was tracking." — Soren — specific-past
  - "When I'm not sure what's open I'll sometimes re-raise something we already agreed on" — Soren — specific-past; "which burns relationship capital with outside counsel." — Soren — opinion (conviction high)
  - "That's happened at least twice this quarter." — Soren — specific-past
  - "You spend the mental energy on "is this deliberate?" instead of "is this actually okay for us?"" — Soren — opinion (conviction high)
- what it's not: A request for a diff tool, a version-comparison feature, or a deal dashboard. The problem is that the state of open issues becomes invisible as versions accumulate, and recovering it requires manual effort that scales with the number of rounds.
- where it lands: Version history panel (lists versions but offers no diff summary, change narrative, or open-issue state); redline viewer (compares exactly two versions at a time — no cumulative or cross-version view); issue tracker (entirely manual; no automatic population from redlines or comments). No cross-version open-issue summary exists.
- checks: pass

## P2 — "I don't know if it was a deliberate rollback or just an error"
- progress sought: Review a late-stage contract version and evaluate each clause on its merits — is this language acceptable? — without having to determine whether the language is even intentional.
- who: Leila — senior counsel / reviewing attorney (reviews contracts at key milestones; does not live in the product day-to-day; opens a deal to do a spot-check or final review and needs to orient quickly)
- circumstance: Leila is reviewing a version-three or version-four draft and encounters a clause whose language looks like it belongs to an earlier version. She cannot tell whether that language is a deliberate rollback by the other side or a copy-paste error. The only way to find out is to manually compare every prior redline. She risks flagging something as an error that was actually agreed upon, which would undermine her credibility in the negotiation.
- evidence:
  - "I'm reviewing something and I find a clause that looks like a prior version's language — the kind that should have been cleaned in version three — and I don't know if it was a deliberate rollback or just an error." — Leila — specific-past
  - "And there's no way to tell without manually comparing every redline." — Leila — opinion (conviction high)
  - "And that confusion itself is a risk" — Leila — opinion (conviction high); "if I flag the wrong thing as an error I look like I'm not tracking the negotiation." — Leila — hypothetical-future (conviction high)
- what it's not: A request for a better redline viewer or an automated clause-comparison tool. The problem is the ambiguity of language provenance in late-stage versions — review energy goes to "is this deliberate?" before "is this acceptable?", and the wrong call carries credibility risk.
- where it lands: Redline viewer (clause-level diff between two versions only; no indication of whether a clause's presence is a reversion or a carry-forward); comment threads (anchored to a specific version's text span; prior threads do not migrate, so a comment explaining a clause change in version two is not visible when reviewing version four).
- checks: pass

## Unclear — kept, not promoted
- Comment-thread orphaning across versions: Soren and Leila both describe comment threads that lose their connection to the negotiation as versions advance — "by version four the thread's been orphaned" (Leila), "a version-four doc that looks clean but has orphaned threads where nobody knows if the thing got resolved or just got dropped" (Soren). Neither speaker frames this as a standalone problem they independently carry. It is a shared mechanism feeding both P1 and P2, recorded as supporting context.

## Relationships
- P1 ↔ P2: sibling — both surface when a contract crosses three or more redline rounds, and both stem from the absence of cross-version continuity. But they break at distinct points for distinct users: P1 is an associate unable to recover the state of open negotiation issues; P2 is a reviewing attorney unable to determine whether a clause's presence in a late draft is intentional or accidental. An associate could have a cumulative open-issue view and still leave a reviewer unable to tell a rollback from an error. Each is attackable on its own.
- Comment-thread orphaning → P1: subset-of — orphaned threads are one pathway by which open-issue state becomes invisible across versions.
- Comment-thread orphaning → P2: subset-of — orphaned threads are one pathway by which clause provenance becomes untraceable.

## Hunch
None earned. The two entries are siblings — distinct in who they affect, what breaks, and what a fix requires. No evidence in the transcript connects one as a cause or root of the other. They share a common architectural gap, but that gap is a described mechanism, not a problem someone in the room articulated as their own pain.

## Spoken (75 words is the ceiling, not a target)
"The conversation surfaced two problems, not one. An associate can't tell what's still open after three rounds of redlines without re-reading every version. Separately, a reviewing attorney can't tell whether old language in a late draft is a deliberate rollback or a mistake. They share a gap but break for different people at different moments, and you can fix either alone. Leila's side rests on three incidents — is that pattern or coincidence?"
