# Problem Framing — Zola notes capture and save reliability
status: draft (v1)

## The problem(s)

### Capturing a thought in Zola is too fiddly when you're in motion
- People trying to jot a quick note in Zola hit enough friction that they give up or resent the app. The circumstance: you have a thought in the moment and want to capture it before it's gone — the app gets in the way.
- evidence:
  - "my cousin tried Zola for like a week and she told me she nearly uninstalled it because typing in the moment felt too fiddly. She said she told her friend not to download it." — Tariq, relaying his cousin's experience. `first-hand: a specific past instance` (his cousin's week with Zola — one person, one episode, second-hand from Tariq)
  - "I think maybe half our users feel that way about the input step. It's just a guess though — I don't have numbers." — Tariq. `assumed / hand-wavey`
  - "literally everyone I know hates in-app keyboards for quick capture. Every person. I'd bet anything on it." — Lena. `assumed / hand-wavey`
  - "the moment you decide to capture something, the app gets in the way." — Lena. `assumed / hand-wavey`
- thin spot: The only specific instance is Tariq's cousin — one person, relayed second-hand. The claim that this is widespread (Tariq's "half our users," Lena's "literally everyone") has no evidence behind it yet. Needs at least one more first-hand, specific past instance from a real user (ideally observed or heard directly, not through a cousin-of-a-friend chain).

### The root of capture friction is unclear — keyboard, tap count, or missing lock-screen entry point
- The team can't tell whether the friction is the in-app keyboard, the number of taps to reach a new note, or the absence of a lock-screen shortcut. These may be three symptoms of one root or three separate problems. The circumstance: the team is about to build solutions without knowing which sub-problem to target.
- evidence:
  - "I don't know if it's the keyboard exactly. It could be the extra taps to even get to a new note. Or the fact that there's no lock-screen shortcut." — Tariq. `assumed / hand-wavey`
  - "Those are three different things." — Priya. `assumed / hand-wavey`
  - "Or it's all the same root — the moment you decide to capture something, the app gets in the way." — Lena. `assumed / hand-wavey`
- thin spot: Nobody has a specific instance that pins the friction to one of these three causes. A useful instance would be someone describing exactly where in the flow they stalled — "I was on the bus, I unlocked my phone, and then I had to tap X, then Y, and by then I'd lost the thought."

### Notes sometimes silently disappear after a user thinks they saved
- Separate from capture friction: people lose notes they believed were saved because auto-save is unreliable. The circumstance: a user writes something, leaves the app assuming it persisted, and later finds it gone.
- evidence:
  - "I also heard from Kenji — second-hand, he's talking to some users — that people sometimes lose a note they thought they'd saved because the auto-save is flaky. But I don't know how widespread that is." — Lena, relaying what Kenji heard from users. `assumed / hand-wavey` (third-hand: Lena heard from Kenji who heard from users — no specific instance given)
- thin spot: This is entirely third-hand with no specific instance at all. Needs one concrete case: who lost a note, when, and what happened. Kenji is the trail to follow — he may have a specific user story from the conversations he's already having.

## How they relate (a guess)
Problems 1 and 2 are parent-child: "capture is too fiddly" is the felt problem, and the keyboard/taps/lock-screen question is about which sub-cause is actually driving it. Problem 3 (save reliability) is a sibling — genuinely different in kind (getting the thought in vs. keeping it once it's in), as Tariq and Priya both noted. Held loosely — it's possible that "flaky auto-save" and "fiddly capture" compound each other in a user's trust in the app, but that's speculation with no evidence either way.

## What this means for the solution (so far)
Complicates. The team has one real data point (Tariq's cousin) supporting the capture-friction problem, but the scope claim ("half our users," "literally everyone") is unsupported — so a large investment in a capture redesign isn't yet earned by the evidence. The save-reliability problem has no first-hand evidence at all. Before any solution is justified, both problems need at least one specific past instance each. The lock-screen shortcut Tariq floated may or may not address the real friction — nobody has an instance that isolates the cause.
