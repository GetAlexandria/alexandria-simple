# Draft Problem Brief

framed with: surface map [provided] · users [provided] · prior brief [not provided]

---

## Problem 1 — "By round three I can't tell what's still open"

**Progress sought:** Walk into a call with outside counsel knowing exactly which issues are still live and which are closed — without re-reading every prior version.

**Who:** Associate (mapped from Soren per users file — manages contract negotiations end-to-end, handles multiple active deals, works under time pressure on calls with outside counsel).

**Circumstance:** Mid-negotiation on a multi-party deal that has gone through three or more redline rounds. The associate is on a call with outside counsel (or preparing for one) and needs to speak to which issues remain open — right now, not after a manual version-by-version audit.

**Evidence:**

1. "the thing I keep running into is that when a contract goes through three or four rounds of redlines, by round three I genuinely can't tell what's still open without going back through every version manually." — Soren · `specific-past` (describes a recurring real situation he keeps encountering)

2. "I'll be on a call with outside counsel and I'm not sure if the indemnity carve-out is still live or if we closed it in version two." — Soren · `specific-past` (a concrete scenario he has lived — on a call, uncertain about a named clause)

3. "Pretty much every multi-party deal we do. Anything with more than two redline rounds. Which is most of our deals above a certain size." — Soren · `opinion` (a frequency judgment about how often the pain strikes; conviction high — he says "pretty much every," but this is his assessment, not a counted fact)

4. "Last month I'd say it happened on four out of five of the deals I was tracking." — Soren · `opinion` (a frequency estimate hedged with "I'd say"; conviction moderate-to-high — he's reporting from memory, not from records)

5. "When I'm not sure what's open I'll sometimes re-raise something we already agreed on — which burns relationship capital with outside counsel." — Soren · clause 1: `specific-past` (re-raising closed issues — it happens) · clause 2: `commitment` (relationship capital actually spent — damage to a working relationship with outside counsel is a real cost paid)

6. "That's happened at least twice this quarter." — Soren · `opinion` (a frequency estimate from memory; conviction moderate — "at least" signals he believes the floor but isn't certain of the count)

7. "You spend the mental energy on "is this deliberate?" instead of "is this actually okay for us?"" — Soren · `specific-past` (describes where attention actually goes during review — a real pattern of wasted effort he has experienced)

8. "So you can have a version-four doc that looks clean but has orphaned threads where nobody knows if the thing got resolved or just got dropped." — Soren · `specific-past` (describes a real state-of-affairs he has encountered — a doc that appears clean while issues are silently lost)

**What it's not:** This is not a request for a better diff viewer or a smarter redline renderer. The associate can read any single version fine. The problem is that the status of each negotiation point — open, closed, deliberately rolled back — is not carried forward across versions; it scatters into the gaps between them.

**Where it lands:** The pain sits between the **version history panel** (which lists versions but offers no change narrative or open-issue summary) and the **comment threads** surface (where threads are anchored to a single version's text span and do not migrate forward). The **redline viewer** can compare two versions but cannot show cumulative issue status across rounds. The known seam "no cross-version open-issue summary exists" describes the structural gap directly (surface map).

**Insight:** The cost is not just wasted review time — it leaks into the negotiation itself. Re-raising a closed point signals to outside counsel that the associate has lost the thread, spending relationship capital that is hard to rebuild.

---

## Problem 2 — "I don't know if it was a deliberate rollback or just an error"

**Progress sought:** Look at a clause in a late-round version and know whether it reflects the current negotiated position or is stale language that survived by accident — without manually comparing every prior redline.

**Who:** Senior counsel / reviewing attorney (mapped from Leila per users file — reviews contracts at key milestones, does not live in the product day-to-day, needs to orient to where things stand without reading every version).

**Circumstance:** Doing a review of a late-round contract version — the kind of spot-check or milestone review a senior counsel performs before a version goes out or before signing. The reviewer encounters a clause whose language looks like it belongs to an earlier version, and there is no signal in the document or the tool to distinguish a deliberate rollback from an editing error.

**Evidence:**

1. "I'm reviewing something and I find a clause that looks like a prior version's language — the kind that should have been cleaned in version three — and I don't know if it was a deliberate rollback or just an error." — Leila · `specific-past` (a real situation she has encountered during review)

2. "And there's no way to tell without manually comparing every redline." — Leila · `specific-past` (describes the actual workaround she is forced into — manual comparison across every version)

3. "And that confusion itself is a risk — if I flag the wrong thing as an error I look like I'm not tracking the negotiation." — Leila · clause 1: `specific-past` (the confusion is a real, present condition of her work) · clause 2: `hypothetical-future` (the reputational consequence of flagging wrongly — she fears it, and it may have happened, but as stated it is a forward-looking risk; conviction high — she calls it "a risk" directly)

4. "I think the two things are actually related. An unresolved comment in version two should tell you something's still open, but by version four the thread's been orphaned — the original comment is gone and there's nothing linking the current language back to whether that point was agreed." — Leila · clause 1: `opinion` (her judgment that version tracking and comment resolution are linked; conviction high — she's pushing back on Soren's separation) · clause 2: `specific-past` (describes a real structural condition — comment threads orphaned by version four, no linkage back to agreement status)

**What it's not:** This is not a request for better commenting or annotation tools. Leila can read comments fine where they exist. The problem is that the provenance of a clause — why it reads the way it does in this version — is invisible once the comment thread that discussed it has been orphaned by a new version upload.

**Where it lands:** The pain sits at the junction of **comment threads** (anchored to a single version, not carried forward — the known seam "prior threads do not migrate automatically") and the **redline viewer** (which compares two versions but cannot surface whether a clause's current state was negotiated or accidental). The **issue tracker** could theoretically hold this, but it is entirely manual and has "no path from a comment thread or a redline to an issue entry without user action" (surface map).

**Insight:** The reviewer's uncertainty about clause provenance does not just slow the review — it changes what the reviewer is willing to say. Flagging stale language as an error when it was a deliberate rollback undermines the reviewer's credibility in the negotiation, so the safer move is to stay silent or hedge, which means real errors can pass unchallenged.

---

## Unclear

These highlights are diagnostic exchanges — the speakers are probing the shape of the problem rather than voicing a distinct pain. They informed framing but do not constitute a separate problem entry.

1. "I think it's version tracking — like, where did each open issue end up." — Soren · `opinion` (his diagnosis of the root cause; conviction moderate — hedged with "I think") · Note: Dev asked whether the problem is version tracking or comment resolution (evidence 12); Soren asserted version tracking. Leila disagreed (evidence 13), arguing the two are linked. The framing above treats both dimensions as present — Problem 1 centers on the associate's loss of issue status across versions, Problem 2 centers on the reviewer's inability to trace clause provenance when comment threads have been orphaned.

2. "Is the problem the version tracking, or is it something in how comments get resolved?" — Dev · This is a facilitator's probe, not a voiced pain or claim. It sharpened the conversation but carries no problem of its own.

---

## Relationships

- Problem 1 ↔ Problem 2: `sibling` — both stem from information not carrying forward across contract versions, but they are distinct pains experienced by different users in different circumstances (associate mid-negotiation vs. senior counsel at milestone review) with different consequences (re-raising closed points and burning relationship capital vs. inability to distinguish rollback from error and risking reputational damage). Each is attackable separately: you could build a cross-version issue-status summary (addressing P1) without touching clause-provenance tracing (P2), or vice versa.

- Disputed cause — what drives the loss of cross-version continuity: Soren vs. Leila. Soren holds that the problem is version tracking — where each open issue ended up across rounds ("I think it's version tracking — like, where did each open issue end up."). Leila holds that version tracking and comment resolution are linked — that orphaned comment threads are not a separate phenomenon but part of the same breakdown ("I think the two things are actually related. An unresolved comment in version two should tell you something's still open, but by version four the thread's been orphaned — the original comment is gone and there's nothing linking the current language back to whether that point was agreed."). The dispute is over whether the root is a missing version-level status layer (Soren) or a missing linkage between comment threads and version history (Leila). **Test:** Pull five recent multi-round contracts that hit both pains. For each, inventory: (a) how many open issues were lost between versions in the version history alone (no comment thread involved), and (b) how many were lost because the comment thread that carried the context was orphaned on version upload. If (a) dominates, the version-tracking layer is the bottleneck and Soren's framing holds. If (b) dominates, the comment-thread orphaning is the structural driver and Leila's framing holds. If both are substantial, neither framing is complete on its own.

---

## Hunch

None earned. The room disputed the cause of the cross-version continuity breakdown (Soren: version tracking; Leila: linked comment resolution), and any root claim between Problem 1 and Problem 2 would take a side in that dispute. The test above is the path to settling it.
