# Draft Problem Brief

checked: quotes, citations, header, fields, lexicon, hunch — nothing flagged

framed with: surface map [not provided] · users [not provided] · prior brief [not provided]

---

## Problem 1 — "I want to capture a thought while I'm moving and the app won't let me get it down fast enough"

checks: pass

**Progress sought:** Get a fleeting thought recorded in Zola in the moment it occurs — while walking, commuting, or otherwise in motion — without losing the thought or breaking stride.

**Who:** A person using Zola to capture notes on the go. Speakers are unattributed (no users input provided); the most concrete account is Tariq's cousin, a real person who tried Zola for about a week.

**Circumstance:** Mid-activity — the person has a thought worth saving and reaches for Zola, but the steps between intent and recorded note are slow or awkward enough that the moment passes or the person gives up. The room disagrees on the exact mechanism (keyboard interaction, tap count to reach a new note, absence of a lock-screen entry point), and the team has not resolved which part of the path is the bottleneck.

**Evidence:**

- "I think we all feel like the notes UX is the thing. The friction to actually capture a thought when you're in motion." — Priya · `opinion` · conviction: moderate (hedged with "I think we all feel")
- "my cousin tried Zola for like a week and she told me she nearly uninstalled it because typing in the moment felt too fiddly." — Tariq · `specific-past` · (a real person's reported experience over approximately one week)
- "She said she told her friend not to download it." — Tariq · `specific-past` · (a real action his cousin reportedly took — passing along an anti-recommendation)
- "I think maybe half our users feel that way about the input step." — Tariq · `opinion` · conviction: low (immediately flagged as a guess) / "It's just a guess though — I don't have numbers." — Tariq · `specific-past` · (the absence of data is itself a fact about the team's current state)
- "We haven't really asked." — Priya · `specific-past` · (confirms the team has not sought user input on this)
- "literally everyone I know hates in-app keyboards for quick capture. Every person. I'd bet anything on it." — Lena · `opinion` · conviction: high (universal claim, staking language — but still a personal judgment, not a measured finding)
- "I don't know if it's the keyboard exactly. It could be the extra taps to even get to a new note. Or the fact that there's no lock-screen shortcut." — Tariq · `opinion` · conviction: low (openly uncertain, listing possibilities)
- "Those are three different things." — Priya · `opinion` · conviction: moderate (a structural observation that the proposed causes are distinct)
- "the moment you decide to capture something, the app gets in the way." — Lena · `opinion` · conviction: high (asserting a unified root cause)
- "that's a solution. I want to understand what we're actually solving for." — Priya · `opinion` · conviction: high (rejecting a jump to solutions)

**What it's not:** A request for a lock-screen shortcut, a redesigned keyboard, or fewer taps — those are candidate solutions that surfaced during discussion. The problem is the gap between deciding to capture a thought and having it recorded; the room has not established which part of that gap is the real barrier, and multiple mechanisms remain in contention.

**Insight:** Three speakers independently name capture friction, but each locates it differently (keyboard feel, tap count, lock-screen access, a general "app gets in the way"). The team has one second-hand anecdote and zero direct user research on this. The disagreement about mechanism suggests the problem is felt but not yet understood well enough to act on — Priya says as much.

---

## Problem 2 — "I thought my note was saved and it wasn't"

checks: pass

**Progress sought:** Trust that when you finish writing a note in Zola, the note is actually there when you come back to it.

**Who:** Zola users encountered by Kenji (second-hand via Lena). No direct speaker in the room has experienced this personally.

**Circumstance:** After writing or editing a note, the user leaves the app believing auto-save has persisted their work. At some later point they discover the note is missing or incomplete. The trigger appears to be unreliable auto-save behavior.

**Evidence:**

- "I also heard from Kenji — second-hand, he's talking to some users — that people sometimes lose a note they thought they'd saved because the auto-save is flaky." — Lena · `specific-past` · (Kenji reportedly heard this from real users; the chain is Lena → Kenji → users, but the claim is that it has happened) / "But I don't know how widespread that is." — Lena · `opinion` · conviction: low (explicitly uncertain about scope)
- "That's different from the capture thing." — Priya · `opinion` · conviction: high (distinguishing this as a separate problem)
- "Totally different. One is getting the thought in, the other is keeping it." — Tariq · `opinion` · conviction: high (agrees this is distinct and names the axis: persistence versus entry)

**What it's not:** A capture-speed issue — Priya and Tariq explicitly separate this from the friction problem. It is also not a feature request for manual save; the problem is that the auto-save contract ("your work is kept") is reportedly broken.

**Insight:** This problem rests entirely on double hearsay — Lena heard from Kenji, who heard from users. No one in the room has seen it firsthand, and Lena volunteers that she cannot gauge how widespread it is. The evidence is thin enough that the team cannot distinguish a systemic reliability failure from an isolated edge case, yet the room treats it as real and distinct from capture friction without challenge.

---

## Problem 3 — "We're guessing — we don't actually know what our users are hitting"

checks: pass

**Progress sought:** Make product decisions about Zola's note-taking experience grounded in what users actually encounter, rather than anecdote and intuition.

**Who:** This team — Priya, Tariq, and Lena — as the people responsible for deciding what to build.

**Circumstance:** The team is trying to frame what to work on. They have one second-hand anecdote (Tariq's cousin), one double-hearsay report (Lena via Kenji), and personal intuition. They have not directly asked users, do not have quantitative data, and repeatedly acknowledge that they are guessing.

**Evidence:**

- "It's just a guess though — I don't have numbers." — Tariq · `specific-past` · (the absence of supporting data is a fact about the team's state)
- "We haven't really asked." — Priya · `specific-past` · (confirms no user research has been done on this)
- "I feel like we're guessing on the scope of both." — Priya · `opinion` · conviction: high (she is certain the team is uncertain)
- "we really haven't validated either one. My cousin's thing is a data point of one." — Tariq · `specific-past` · (acknowledges the thinness of their evidence base)
- "A data point of one that really resonates though. I genuinely think it's the majority of users. Just intuition." — Lena · `opinion` · conviction: high (asserts majority-level prevalence while conceding the basis is intuition alone)

**What it's not:** A request for an analytics dashboard or a research program — those are solutions. The problem is that the team cannot tell which user pain is real, how widespread it is, or where exactly the breakdown happens, and they know it.

**Insight:** The team names its own evidence gap repeatedly and without defensiveness — Tariq calls his cousin's story "a data point of one," Priya says "we haven't really asked," and even Lena, the strongest advocate, labels her belief "just intuition." This self-awareness is itself the sharpest evidence: the team knows it is operating on anecdote and has not yet closed the gap.

---

## Unclear

Highlights that surfaced in the evidence list but do not earn a standalone problem entry:

- **"Or it's all the same root — the moment you decide to capture something, the app gets in the way."** (Lena, evidence-list item 8, marked `unclear`) — This could be a restatement of Problem 1 or an assertion that the sub-problems (keyboard, taps, lock-screen) collapse into one. It lacks enough specificity to stand alone; folded into Problem 1's evidence as a claim about unified root cause.

- **"That's different from the capture thing."** (Priya, evidence-list item 12, marked `unclear`) and **"Totally different. One is getting the thought in, the other is keeping it."** (Tariq, evidence-list item 13, marked `unclear`) — These are structural observations distinguishing Problems 1 and 2. They are used as evidence within those entries, not as problems in their own right.

---

## Relationships

- Problem 1 ↔ Problem 2: `sibling` — Priya and Tariq explicitly distinguish these ("That's different from the capture thing." / "Totally different. One is getting the thought in, the other is keeping it."). Capture friction and data loss are distinct pains, attackable separately: one concerns the path from intent to written note, the other concerns whether a written note persists. They share a surface (Zola's note-taking flow) but neither causes the other.

- Problem 3 → Problem 1: `suspected-root` — The team cannot confirm that capture friction is the real barrier, or which mechanism within it matters, because they have no user data. Problem 3 (the absence of grounded knowledge) is what keeps Problem 1 unresolved at the mechanism level. Without settling Problem 3, the team cannot distinguish between keyboard feel, tap count, and lock-screen access — the three candidates Tariq names and Priya correctly calls "three different things."

- Problem 3 → Problem 2: `suspected-root` — The team cannot confirm the scope or trigger of the auto-save problem for the same reason: no direct research, no numbers. Lena explicitly says "But I don't know how widespread that is." Problem 3 is what keeps Problem 2's real shape unknown.

---

## Hunch

Problem 3 looks like the root. Both user-facing problems (capture friction and data loss) are felt but uncharacterized — the team acknowledges guessing on scope, mechanism, and prevalence for each. The evidence gap (Problem 3) is the thing that makes both Problems 1 and 2 un-actionable at the level of specific mechanism. Until the team has direct user contact, it cannot tell which part of capture friction is the bottleneck or how many people are actually losing notes — and any work on either pain is chosen by intuition rather than evidence.
