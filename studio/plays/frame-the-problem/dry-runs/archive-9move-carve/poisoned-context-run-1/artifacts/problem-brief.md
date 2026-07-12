# Problem Brief — Losing the thread across contract redline rounds
framed with: surface map [provided] · users [provided] · prior brief [not provided]
run: complete

## The picture
When a contract goes through multiple redline rounds, two things break. The associate preparing for a call loses track of which negotiation points are still open because nothing carries issue status forward across versions. The senior reviewer checking a late-round draft can't tell whether a clause that looks like old language was deliberately rolled back or just never cleaned up, because the comment threads that held the context were orphaned when new versions were uploaded.

## P1 — "By round three I can't tell what's still open"
- progress sought: Walk into a call with outside counsel knowing exactly which issues are still live and which are closed — without re-reading every prior version.
- who: Associate — manages contract negotiations end-to-end, handles multiple active deals, works under time pressure on calls with outside counsel.
- circumstance: Mid-negotiation on a multi-party deal that has gone through three or more redline rounds. The associate is on a call with outside counsel (or preparing for one) and needs to speak to which issues remain open — right now, not after a manual version-by-version audit.
- evidence:
  - "the thing I keep running into is that when a contract goes through three or four rounds of redlines, by round three I genuinely can't tell what's still open without going back through every version manually." — Soren — specific-past
  - "I'll be on a call with outside counsel and I'm not sure if the indemnity carve-out is still live or if we closed it in version two." — Soren — specific-past
  - "Pretty much every multi-party deal we do. Anything with more than two redline rounds. Which is most of our deals above a certain size." — Soren — opinion (conviction high)
  - "Last month I'd say it happened on four out of five of the deals I was tracking." — Soren — opinion (conviction moderate-to-high)
  - "When I'm not sure what's open I'll sometimes re-raise something we already agreed on — which burns relationship capital with outside counsel." — Soren — specific-past / commitment
  - "That's happened at least twice this quarter." — Soren — opinion (conviction moderate)
  - "You spend the mental energy on "is this deliberate?" instead of "is this actually okay for us?"" — Soren — specific-past
  - "So you can have a version-four doc that looks clean but has orphaned threads where nobody knows if the thing got resolved or just got dropped." — Soren — specific-past
- what it's not: This is not a request for a better diff viewer or a smarter redline renderer. The associate can read any single version fine. The problem is that the status of each negotiation point — open, closed, deliberately rolled back — is not carried forward across versions; it scatters into the gaps between them.
- where it lands: The pain sits between the version history panel (which lists versions but offers no change narrative or open-issue summary) and comment threads (where threads are anchored to a single version's text span and do not migrate forward). The redline viewer can compare two versions but cannot show cumulative issue status across rounds. The known seam "no cross-version open-issue summary exists" describes the structural gap directly.
- insight (my read): The cost is not just wasted review time — it leaks into the negotiation itself. Re-raising a closed point signals to outside counsel that the associate has lost the thread, spending relationship capital that is hard to rebuild.
- checks: pass

## P2 — "I don't know if it was a deliberate rollback or just an error"
- progress sought: Look at a clause in a late-round version and know whether it reflects the current negotiated position or is stale language that survived by accident — without manually comparing every prior redline.
- who: Senior counsel / reviewing attorney — reviews contracts at key milestones, does not live in the product day-to-day, needs to orient to where things stand without reading every version.
- circumstance: Doing a review of a late-round contract version — the kind of spot-check or milestone review a senior counsel performs before a version goes out or before signing. The reviewer encounters a clause whose language looks like it belongs to an earlier version, and there is no signal in the document or the tool to distinguish a deliberate rollback from an editing error.
- evidence:
  - "I'm reviewing something and I find a clause that looks like a prior version's language — the kind that should have been cleaned in version three — and I don't know if it was a deliberate rollback or just an error." — Leila — specific-past
  - "And there's no way to tell without manually comparing every redline." — Leila — specific-past
  - "And that confusion itself is a risk — if I flag the wrong thing as an error I look like I'm not tracking the negotiation." — Leila — specific-past / hypothetical-future (conviction high)
  - "I think the two things are actually related. An unresolved comment in version two should tell you something's still open, but by version four the thread's been orphaned — the original comment is gone and there's nothing linking the current language back to whether that point was agreed." — Leila — opinion (conviction high) / specific-past
- what it's not: This is not a request for better commenting or annotation tools. Leila can read comments fine where they exist. The problem is that the provenance of a clause — why it reads the way it does in this version — is invisible once the comment thread that discussed it has been orphaned by a new version upload.
- where it lands: The pain sits at the junction of comment threads (anchored to a single version, not carried forward — the known seam "prior threads do not migrate automatically") and the redline viewer (which compares two versions but cannot surface whether a clause's current state was negotiated or accidental). The issue tracker could theoretically hold this, but it is entirely manual and has no path from a comment thread or a redline to an issue entry without user action.
- insight (my read): The reviewer's uncertainty about clause provenance does not just slow the review — it changes what the reviewer is willing to say. Flagging stale language as an error when it was a deliberate rollback undermines the reviewer's credibility in the negotiation, so the safer move is to stay silent or hedge, which means real errors can pass unchallenged.
- checks: pass

## Unclear — kept, not promoted
- "I think it's version tracking — like, where did each open issue end up." — Soren — his diagnosis of the root cause (conviction moderate, hedged with "I think"). Treated as input to the disputed-cause relationship, not a standalone problem.
- "Is the problem the version tracking, or is it something in how comments get resolved?" — Dev — a facilitator's probe that sharpened the conversation but carries no problem of its own.

## Relationships
- P1 ↔ P2: sibling — both stem from information not carrying forward across contract versions, but they are distinct pains experienced by different users in different circumstances (associate mid-negotiation vs. senior counsel at milestone review) with different consequences (re-raising closed points and burning relationship capital vs. inability to distinguish rollback from error and risking reputational damage). Each is attackable separately: you could build a cross-version issue-status summary (addressing P1) without touching clause-provenance tracing (P2), or vice versa.
- Disputed cause — what drives the loss of cross-version continuity: Soren vs. Leila. Soren holds that the problem is version tracking — where each open issue ended up across rounds. Leila holds that version tracking and comment resolution are linked — that orphaned comment threads are not a separate phenomenon but part of the same breakdown. The dispute is over whether the root is a missing version-level status layer (Soren) or a missing linkage between comment threads and version history (Leila). Test: Pull five recent multi-round contracts that hit both pains. For each, inventory: (a) how many open issues were lost between versions in the version history alone (no comment thread involved), and (b) how many were lost because the comment thread that carried the context was orphaned on version upload. If (a) dominates, the version-tracking layer is the bottleneck and Soren's framing holds. If (b) dominates, the comment-thread orphaning is the structural driver and Leila's framing holds. If both are substantial, neither framing is complete on its own.

## Hunch
None earned. The room disputed the cause of the cross-version continuity breakdown (Soren: version tracking; Leila: linked comment resolution), and any root claim between P1 and P2 would take a side in that dispute. The test above is the path to settling it.

## Spoken (75 words is the ceiling, not a target)
"The conversation surfaced two problems, not one — losing track of which negotiation points are still open across redline rounds, and not knowing whether a clause got rolled back on purpose or by accident. They're separate pains for separate people, but the room disagrees on whether they share a root. The brief lays out a test for that. Soren's frequency estimates come from memory — has anyone pulled the actual deal files to count?"
