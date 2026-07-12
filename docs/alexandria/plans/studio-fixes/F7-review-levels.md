> **Agent-drafted 2026-06-22, rewritten same day** from the retired "trust-setting" framing per director ruling: "trust" retired; this is a writer's **review cycle**, expressed as **Low / Medium / High Review** variants of a **Play Writing play**, composed from versioned step-plays. Draft — not ruled. (Supersedes the deleted `F7-trust-setting.md`.)

# DESIGN SPEC — Review Levels for Play Writing Plays

**Item:** F7 (Playmaker's Studio fix-list). **Lexicon:** Brick 0 (Role / Tier / Function / Play). **Connects to:** F8 (make-playmaking-a-play), Play Re-sync, versions-of-plays.

---

## 1. The problem — review cycle, not "trust"

The original draft framed this as a "trust" dial. **"Trust" is retired** — it was a one-off term used to straighten out a confused agent and hasn't aged well, and it's the wrong concept. This is about a **play writer's preferred review cycle** — how often, and *where*, they want to cut into the build of a play. It is not about trusting the agent.

Different writers have different styles:
- **Build-and-react** (the director's): let a lot get built, see it all, then react. This style is *why Play Re-sync exists* — you need the consistency play when you react to a big built chunk.
- **Hands-on**: see each piece as it's born, dig in, don't go too far before checking.

Today there is exactly one cycle, silently: two gates — **Gate 1** (confirm the design) and **Gate 2** (confirm it's proven), agents do everything in between. That's the director's enshrined preference, but it's hard-coded, not *chosen*. The job: make the review cycle a **choice**, easy to change when it's not just the director — or when he wants a different one.

## 2. The model — Play Writing plays, composed of step-plays

The unlock (director's ruling): **play-writing is itself a play** — a **Play Writing play** (this is F8, make-playmaking-a-play). And it is built from **step-plays**, each its own play with its own versioning, **strung together**:

```
Ground → Brief → Harden → Derive → Test → Run → (Bank · Register)
```

Between any two step-plays, a **human gate** may sit, or the run passes straight through. A **review cycle is just which seams are gates** — the chaining. *("If we break our process down into legs, it's as simple as one just passes where another ends with a human gate check-in. Then the full experience is just how those are chained.")*

So a "Review level" is **not** a dial setting — it's a **pre-composed Play Writing play**: a specific stringing of step-plays with specific gates. Build the step-plays as composable, individually-versioned units, and the Review levels fall out as three compositions — with new ones trivial to add.

## 3. The three starter Review levels

Three pre-composed Play Writing plays, for the most likely preferences:

| Review level | Gates | For |
|---|---|---|
| **Low Review** | **2** — Gate 1 (after Harden) + Gate 2 (after Run) | the director's build-and-react; coast between the two confirms; **demands Play Re-sync** |
| **Medium Review** | **3** — Low + *review the drawing* (after Derive) | the director's likely near-term (untested); catch a bad projection before testing |
| **High Review** | most — front-end + per-step + back-end (§4) | the hands-on writer; see each piece as it's born |

**Low Review is exactly today's behavior** — so this is additive; nothing changes for the director's current style.

## 4. The gate positions (front to back)

Every seam where a human gate *can* sit:

| After step | The gate (if present) |
|---|---|
| **Ground** | review the grounding before drafting — *front-end* |
| **Brief** | review the brief before hardening — *front-end* |
| **Harden** | **Gate 1 — confirm the design** *(enshrined; in every level)* |
| **Derive** | review the drawing · approve each prompt |
| **Test** | approve the test tuning |
| **Run** | **Gate 2 — confirm it's proven** *(enshrined; in every level)* |
| Bank · Register | *(mechanical — no gate)* |

Gates 1 and 2 are the floor of every Review level. Low adds nothing; Medium adds *review-the-drawing*; High turns on the front-end gates (Ground, Brief) and the per-step ones (prompts, tests). *(The original draft had only back-end gates; the front-end ones are added per the director's note that a hands-on writer wants earlier cut-ins.)*

## 5. Choosing + changing the review cycle

- A writer **picks the Review level** that matches their style when they start a Play Writing run. It is a *preference*, not an earned status (the old "trust ratchets up as a play proves" framing is gone — that conflated review-cycle with maturity).
- **Easy to change** — switch levels between plays, or mid-stream if a writer wants more/less involvement. ("When it's not just me, or when I personally want a change, it would be nice to easily change this.")
- Director's current default is **Low Review**; likely near-term is **Medium Review**.

## 6. Composability + versioning — the real architecture

The Review levels are the surface; the substance is **step-plays as composable, versioned units**:
- **Each step is its own play** (Ground, Brief, Harden, Derive, Test, Run) with its **own versioning** — improved independently.
- A Review level is a **composition**: which step-plays, in what order, with which gates between them.
- **New review cycles are cheap** — a new composition, not new code. "Maybe we just start with 3 compound plays… but we'll want to build composably to easily make new builds."
- This is **versions of plays** applied to the play-writing play itself: the Play Writing play *has versions* (Low/Medium/High Review), each a different leg-chaining.

## 7. Storage / provenance

A built play records **which Review-level Play Writing play built it** — a provenance fact about the *run*, not a permanent config on the *play*. Per the work-with-the-ledger decision, that's naturally a **ledger event** (the play-writing run carries its Review level; the gate confirms are the run's events with an `AlexandriaActor`), not a hand-set field.

## 8. Connections

- **F8 (make-playmaking-a-play) — this *is* it.** Review levels are versions of the Play Writing play. F7 specifies the review-cycle variants; F8 makes play-writing a play at all. Same workstream — **F7 can't land before F8's play-writing-as-a-play + step-plays exist.**
- **Play Re-sync — Low Review demands it.** Build-and-react means reacting to a big built chunk; Play Re-sync is what keeps that chunk's artifacts aligned. The director's own style is the proof case.
- **Versions of plays.** The step-plays *and* the Review-level compositions are both versioned — the same versioning primitive the whole system needs.

## 9. Open questions

1. **Gate labels.** "Review the drawing," "approve each prompt," "approve the test tuning," "review the grounding / brief" — confirm names (the two enshrined are Gate 1 / Gate 2).
2. **High Review's exact set.** Does High gate *every* step, or a chosen subset? "Most" — but the exact composition is a choice.
3. **Dependency on F8 — sequence.** F8 first (play-writing as a play + step-plays as versioned units), then the Review-level compositions. Confirm the ordering.
4. **Mid-stream switching.** Can a writer change Review level *during* a run, or only at the start? (Affects pre-composed vs dynamically-inserted gates.)
5. **Where the presets live.** Three named Play Writing plays in the registry (with a family tag), or configurations of one? (Ties to the EL-family registry-home question, IG4.)
