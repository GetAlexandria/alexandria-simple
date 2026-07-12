# Cold-Read Report

## Restatement (from `runtime/problem-brief.md` alone)

### What's going on?
A team (Priya, Tariq, Lena) is discussing Zola's note-capture experience. They want to improve it but can't agree on what's actually broken. Three candidate friction points came up — the in-app keyboard, the number of taps to start a note, and the lack of a lock-screen shortcut — and a separate report surfaced about notes disappearing after users believed they'd been saved. The team openly acknowledges it has almost no real user data to guide a decision.

### Who hurts, and when?
Two groups hurt:

1. **People trying to capture a thought on the go** — they reach for Zola mid-activity (walking, commuting) and the path from intent to recorded note is slow or awkward enough that the moment passes. The most concrete account is Tariq's cousin, who tried Zola for about a week and nearly uninstalled it.

2. **People who wrote a note and lost it** — they leave the app expecting auto-save to persist their work, then come back to find the note missing or incomplete. This is known only through double hearsay (Lena heard from Kenji, who heard from users); no one in the room has experienced it directly.

### What's still open?
Nearly everything of consequence:

- Which part of the capture path is the actual bottleneck (keyboard, tap count, or lock-screen entry point) — the room disagrees and has no data to resolve it.
- Whether the auto-save problem is a systemic reliability failure or an isolated edge case — no one can gauge how widespread it is.
- How many users are affected by either problem — the team has one anecdote, one piece of double hearsay, and personal intuition. They have not directly asked users.

### What does the author think?
The author thinks the evidence gap is the root issue. Both user-facing problems (capture friction and data loss) are felt but uncharacterized. The team knows it's guessing — they say so repeatedly and without defensiveness — and until they get direct user contact, any work on either pain is chosen by intuition rather than evidence. The author treats the team's self-awareness about its own guessing as the sharpest signal in the conversation.

## Verdict: **comprehensible**

The document stands on its own. Each section — the picture, the three problems, their relationships, and the hunch — follows logically. The evidence is quoted with attribution, the author's interpretive layer is clearly separated from the speakers' words, and the "what it's not" sections prevent me from collapsing distinct pains into one. I could restate the situation confidently without having been in the room, and I would trust my restatement.
