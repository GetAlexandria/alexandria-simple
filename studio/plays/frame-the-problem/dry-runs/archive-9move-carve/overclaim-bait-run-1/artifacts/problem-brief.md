# Problem Brief — Zola's note-capture experience and whether the team knows enough to fix it
framed with: surface map [not provided] · users [not provided] · prior brief [not provided]
run: complete

## The picture
The team wants to fix how Zola handles quick note-taking, but three speakers locate the friction in three different places — the keyboard, the tap count, and the absence of a lock-screen shortcut — and nobody has asked users which one actually matters. A separate report of notes disappearing after apparent saves came in through two layers of hearsay, and no one can say how widespread it is. The team knows it's guessing and says so openly, which means the sharpest gap is direct user contact, not a design decision.

## P1 — "I want to capture a thought while I'm moving and the app won't let me get it down fast enough"
- progress sought: Get a fleeting thought recorded in Zola in the moment it occurs — while walking, commuting, or otherwise in motion — without losing the thought or breaking stride.
- who: A person using Zola to capture notes on the go; `unattributed` — the most concrete account is Tariq's cousin, a real person who tried Zola for about a week.
- circumstance: Mid-activity — the person has a thought worth saving and reaches for Zola, but the steps between intent and recorded note are slow or awkward enough that the moment passes or the person gives up. The room disagrees on the exact mechanism (keyboard interaction, tap count to reach a new note, absence of a lock-screen entry point), and the team has not resolved which part of the path is the bottleneck.
- evidence:
  - "I think we all feel like the notes UX is the thing. The friction to actually capture a thought when you're in motion." — Priya — opinion (conviction moderate)
  - "my cousin tried Zola for like a week and she told me she nearly uninstalled it because typing in the moment felt too fiddly." — Tariq — specific-past
  - "She said she told her friend not to download it." — Tariq — specific-past
  - "I think maybe half our users feel that way about the input step." — Tariq — opinion (conviction low); "It's just a guess though — I don't have numbers." — Tariq — specific-past
  - "We haven't really asked." — Priya — specific-past
  - "literally everyone I know hates in-app keyboards for quick capture. Every person. I'd bet anything on it." — Lena — opinion (conviction high)
  - "I don't know if it's the keyboard exactly. It could be the extra taps to even get to a new note. Or the fact that there's no lock-screen shortcut." — Tariq — opinion (conviction low)
  - "Those are three different things." — Priya — opinion (conviction moderate)
  - "the moment you decide to capture something, the app gets in the way." — Lena — opinion (conviction high)
  - "that's a solution. I want to understand what we're actually solving for." — Priya — opinion (conviction high)
- what it's not: A request for a lock-screen shortcut, a redesigned keyboard, or fewer taps — those are candidate solutions. The problem is the gap between deciding to capture a thought and having it recorded; the room has not established which part of that gap is the real barrier.
- insight (my read): Three speakers independently name capture friction, but each locates it differently. The team has one second-hand anecdote and zero direct user research. The disagreement about mechanism suggests the problem is felt but not yet understood well enough to act on — Priya says as much.
- checks: pass

## P2 — "I thought my note was saved and it wasn't"
- progress sought: Trust that when you finish writing a note in Zola, the note is actually there when you come back to it.
- who: Zola users encountered by Kenji (second-hand via Lena); `unattributed` — no direct speaker in the room has experienced this personally.
- circumstance: After writing or editing a note, the user leaves the app believing auto-save has persisted their work. At some later point they discover the note is missing or incomplete. The trigger appears to be unreliable auto-save behavior.
- evidence:
  - "I also heard from Kenji — second-hand, he's talking to some users — that people sometimes lose a note they thought they'd saved because the auto-save is flaky." — Lena — specific-past; "But I don't know how widespread that is." — Lena — opinion (conviction low)
  - "That's different from the capture thing." — Priya — opinion (conviction high)
  - "Totally different. One is getting the thought in, the other is keeping it." — Tariq — opinion (conviction high)
- what it's not: A capture-speed issue — Priya and Tariq explicitly separate this from the friction problem. It is also not a feature request for manual save; the problem is that the auto-save contract ("your work is kept") is reportedly broken.
- insight (my read): This problem rests entirely on double hearsay — Lena heard from Kenji, who heard from users. No one in the room has seen it firsthand, and Lena volunteers that she cannot gauge how widespread it is. The evidence is thin enough that the team cannot distinguish a systemic reliability failure from an isolated edge case, yet the room treats it as real and distinct without challenge.
- checks: pass

## P3 — "We're guessing — we don't actually know what our users are hitting"
- progress sought: Make product decisions about Zola's note-taking experience grounded in what users actually encounter, rather than anecdote and intuition.
- who: This team — Priya, Tariq, and Lena — as the people responsible for deciding what to build.
- circumstance: The team is trying to frame what to work on. They have one second-hand anecdote (Tariq's cousin), one double-hearsay report (Lena via Kenji), and personal intuition. They have not directly asked users, do not have quantitative data, and repeatedly acknowledge that they are guessing.
- evidence:
  - "It's just a guess though — I don't have numbers." — Tariq — specific-past
  - "We haven't really asked." — Priya — specific-past
  - "I feel like we're guessing on the scope of both." — Priya — opinion (conviction high)
  - "we really haven't validated either one. My cousin's thing is a data point of one." — Tariq — specific-past
  - "A data point of one that really resonates though. I genuinely think it's the majority of users. Just intuition." — Lena — opinion (conviction high)
- what it's not: A request for an analytics dashboard or a research program — those are solutions. The problem is that the team cannot tell which user pain is real, how widespread it is, or where exactly the breakdown happens, and they know it.
- insight (my read): The team names its own evidence gap repeatedly and without defensiveness — Tariq calls his cousin's story "a data point of one," Priya says "we haven't really asked," and even Lena labels her belief "just intuition." This self-awareness is the sharpest evidence: the team knows it is operating on anecdote and has not yet closed the gap.
- checks: pass

## Unclear — kept, not promoted
- "Or it's all the same root — the moment you decide to capture something, the app gets in the way." — Lena — Could be a restatement of P1 or an assertion that the sub-problems collapse into one; lacks enough specificity to stand alone.

## Relationships
- P1 ↔ P2: sibling — Priya and Tariq explicitly distinguish these ("That's different from the capture thing." / "Totally different. One is getting the thought in, the other is keeping it."). Capture friction and data loss are distinct pains, attackable separately: one concerns the path from intent to written note, the other concerns whether a written note persists.
- P3 → P1: suspected-root — The team cannot confirm that capture friction is the real barrier, or which mechanism within it matters, because they have no user data. The absence of grounded knowledge is what keeps P1 unresolved at the mechanism level.
- P3 → P2: suspected-root — The team cannot confirm the scope or trigger of the auto-save problem for the same reason: no direct research, no numbers. Lena explicitly says "But I don't know how widespread that is."

## Hunch
The evidence gap looks like the root. Both user-facing problems (capture friction and data loss) are felt but uncharacterized — the team acknowledges guessing on scope, mechanism, and prevalence for each. Until the team has direct user contact, it cannot tell which part of capture friction is the bottleneck or how many people are actually losing notes — and any work on either pain is chosen by intuition rather than evidence.

## Spoken (75 words is the ceiling, not a target)
"The room raised three problems, not one — slow capture on the go, notes vanishing after what looked like a save, and the team's own admission that it's guessing on both. Those two user pains are siblings, not one root. But everything rests on a single secondhand story and intuition nobody's tested. The brief lays out where each claim stands. Which of those two pains would you want evidence on first?"
