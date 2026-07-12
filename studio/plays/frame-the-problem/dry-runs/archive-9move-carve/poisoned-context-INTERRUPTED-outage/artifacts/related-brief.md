# Draft Problem Brief

framed with: surface map [provided] · users [provided] · prior brief [not provided]

---

## Problem 1 — "By round three I genuinely can't tell what's still open"

**Progress sought:** Walk into a call with outside counsel — or sit down to review a late-stage draft — and know, without archaeology, which issues from this negotiation are still live and which are closed.

**Who:** Soren — associate. Manages contract negotiations end-to-end, tracks redlines, coordinates with outside counsel across multiple active deals simultaneously (users file: Associate).

**Circumstance:** A multi-party contract has gone through three or more redline rounds. Soren is on a call with outside counsel or preparing for one. He needs to know the current state of every open issue — but the only way to reconstruct it is to manually walk back through each prior version. The gap between the number of versions and what he can hold in memory means he either guesses or burns time re-reading.

**Evidence:**

1. "the thing I keep running into is that when a contract goes through three or four rounds of redlines, by round three I genuinely can't tell what's still open without going back through every version manually." — SOREN · `specific-past` (a recurring real experience Soren describes from his own work)
2. "I'll be on a call with outside counsel and I'm not sure if the indemnity carve-out is still live or if we closed it in version two." — SOREN · `specific-past` (a concrete scenario Soren has been in — present tense describing a recurring real moment)
3. "Pretty much every multi-party deal we do. Anything with more than two redline rounds. Which is most of our deals above a certain size." — SOREN · `opinion` (Soren's estimate of how broadly this hits; conviction high — stated as flat fact, not hedged)
4. "Last month I'd say it happened on four out of five of the deals I was tracking." — SOREN · `specific-past` (counted occurrences in a named time period)
5. "When I'm not sure what's open I'll sometimes re-raise something we already agreed on" — SOREN · `specific-past` (something that happens to him recurrently) · "which burns relationship capital with outside counsel." — SOREN · `opinion` (his judgment about the consequence; conviction high)
6. "That's happened at least twice this quarter." — SOREN · `specific-past` (counted occurrences — re-raising settled points — in a named period)
7. "You spend the mental energy on "is this deliberate?" instead of "is this actually okay for us?"" — SOREN · `opinion` (characterizing the misallocation of attention; conviction high)

**What it's not:** A request for a diff tool, a version-comparison feature, or a deal dashboard. The problem is not the absence of a specific tool — it is that the state of open issues becomes invisible as versions accumulate, and recovering it requires manual effort that scales with the number of rounds.

**Where it lands:** Version history panel (lists versions but offers no diff summary, change narrative, or open-issue state), redline viewer (compares exactly two versions at a time — no cumulative or cross-version view), issue tracker (entirely manual; no automatic population from redlines or comments). Known seam: no cross-version open-issue summary exists.

---

## Problem 2 — "I don't know if it was a deliberate rollback or just an error"

**Progress sought:** Review a late-stage contract version and evaluate each clause on its merits — is this language acceptable? — without having to determine whether the language is even intentional.

**Who:** Leila — senior counsel / reviewing attorney. Reviews contracts at key milestones; does not live in the product day-to-day; opens a deal to do a spot-check or final review and needs to orient quickly (users file: Senior counsel / reviewing attorney).

**Circumstance:** Leila is reviewing a version-three or version-four draft and encounters a clause whose language looks like it belongs to an earlier version — the kind that should have been superseded. She cannot tell whether the presence of that language is a deliberate rollback by the other side or a copy-paste error. The only way to find out is to manually compare every prior redline. Meanwhile, she risks flagging something as an error that was actually agreed upon, which would make her look like she's not tracking the negotiation.

**Evidence:**

1. "I'm reviewing something and I find a clause that looks like a prior version's language — the kind that should have been cleaned in version three — and I don't know if it was a deliberate rollback or just an error." — LEILA · `specific-past` (a real situation Leila encounters in her review work)
2. "And there's no way to tell without manually comparing every redline." — LEILA · `opinion` (her assessment that no path exists other than manual comparison; conviction high — stated as absolute, no hedge)
3. "And that confusion itself is a risk" — LEILA · `opinion` (risk assessment; conviction high) · "if I flag the wrong thing as an error I look like I'm not tracking the negotiation." — LEILA · `hypothetical-future` (a consequence she fears — described conditionally with "if"; conviction high)

**What it's not:** A request for a better redline viewer or an automated clause-comparison tool. The problem is the ambiguity of language provenance in late-stage versions — Leila's review energy goes to "is this deliberate?" before she can get to "is this acceptable?", and the wrong call carries credibility risk.

**Where it lands:** Redline viewer (clause-level diff between two versions only; no indication of whether a clause's presence is a reversion or a carry-forward), comment threads (anchored to a specific version's text span; prior threads do not migrate, so a comment explaining a clause change in version two is not visible when reviewing version four). Known seam: comment threads from earlier versions are not visible in later version views unless the user manually opens the earlier version.

---

## Shared mechanism — comment-thread orphaning across versions

Soren and Leila disagree about whether this is a separate problem or part of version tracking, then converge. The evidence below surfaces a mechanism that feeds both Problem 1 and Problem 2 — comment threads lose their connection to the negotiation as versions advance — but neither speaker frames it as a standalone problem they independently have. It is recorded here as supporting context, not as a third problem entry.

**Evidence:**

1. "I think it's version tracking — like, where did each open issue end up. The comments are fine; once something's in the doc I can read it. It's across versions." — SOREN · `opinion` (Soren's diagnosis isolating version tracking as the problem and dismissing comments; conviction moderate — "I think")
2. "I think the two things are actually related. An unresolved comment in version two should tell you something's still open, but by version four the thread's been orphaned — the original comment is gone and there's nothing linking the current language back to whether that point was agreed." — LEILA · clause 1 "I think the two things are actually related": `opinion` (Leila's diagnostic view countering Soren; conviction moderate — "I think") · clause 2 "An unresolved comment in version two should tell you something's still open, but by version four the thread's been orphaned — the original comment is gone and there's nothing linking the current language back to whether that point was agreed": `specific-past` (Leila describes what she has observed happening to comment threads across versions)
3. "So you can have a version-four doc that looks clean but has orphaned threads where nobody knows if the thing got resolved or just got dropped." — SOREN · `specific-past` (Soren describes a situation he has seen — a doc that looks clean with unresolved history underneath)

**Where it lands:** Comment threads (threads anchored to a specific version's text span; do not migrate when a new version is uploaded). Known seam: a comment from version two is not visible in the version-four view unless the user manually opens version two.

---

## Relationships

- Problem 1 ↔ Problem 2: `sibling` — both surface when a contract crosses three or more redline rounds, and both stem from the absence of cross-version continuity in the product. But they break at distinct points for distinct users: Problem 1 is Soren unable to recover the state of open negotiation issues across versions; Problem 2 is Leila unable to determine whether a clause's presence in a late draft is intentional or accidental. An associate could have a cumulative open-issue view and still leave a reviewer unable to tell a rollback from an error; a reviewer could have full clause provenance and still leave an associate unable to say what is open. Each is attackable on its own.

- Shared mechanism (comment-thread orphaning) → Problem 1: `subset-of` — orphaned comment threads are one pathway by which open-issue state becomes invisible across versions, the condition Problem 1 describes. Soren confirms this when he describes a version-four doc that "looks clean but has orphaned threads where nobody knows if the thing got resolved or just got dropped."

- Shared mechanism (comment-thread orphaning) → Problem 2: `subset-of` — orphaned comment threads are one pathway by which clause provenance becomes untraceable, the condition Problem 2 describes. Leila surfaces this directly: "the original comment is gone and there's nothing linking the current language back to whether that point was agreed."

---

## Hunch

None earned. The two problem entries are siblings — distinct in who they affect, what breaks, and what a fix requires. No evidence in the transcript connects one as a cause or root of the other. They share a common architectural gap (no cross-version continuity), but that gap is a described mechanism, not a problem entry someone in the room articulated as their own pain — and naming it as a root would be imposing structure the evidence does not contain.
