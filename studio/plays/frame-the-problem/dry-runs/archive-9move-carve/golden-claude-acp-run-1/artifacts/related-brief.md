# Draft Problem Brief

framed with: surface map [provided] · users [provided] · prior brief [not provided]

---

## Problem 1: Source material is lost between the moment of encounter and the conversion session

**Title (user voice):** "Half my best source material dies in tabs."

**Progress sought:** Get source material from the moment I find it into the library — without relying on my memory to bridge the gap between research and the conversion session that follows.

**Who:** Crew member (Maya — a researcher/curator who gathers and stages source material across many browser tabs and documents over days; resolved from users input).

**Circumstance:** Mid-research, with dozens of browser tabs open, accumulating source material over days. There is no way to bank or stage a source at the point of encounter. The only intake path requires a desktop conversion session, so everything found during browsing has to survive in tabs until that session happens. By the time the crew member sits down to convert, the link between source and context is broken — which tab had it, why it mattered — and material that was once in hand simply never enters the library.

**Evidence:**

- "Every time I'm doing research I end up with like forty tabs, and by the time I sit down to do a conversion session I can't remember which tab had the thing." — MAYA · `specific-past` (describes a recurring real experience)
- "So stuff just never makes it in." — MAYA · `specific-past` (consequence she has lived through repeatedly)
- "Half my best source material dies in tabs." — MAYA · `opinion` (a judgment quantifying the loss — conviction high, but "half" and "best" are her assessment, not a counted fact)
- "That's real, I've watched you do it." — DEV · `specific-past` (eyewitness corroboration of the behavior Maya describes)
- "The point is capture-in-the-moment instead of capture-from-memory." — MAYA · `opinion` (frames the core contrast as she sees it — conviction high, articulates the principle rather than a past event)

**What it's not:** This is not a request for a browser extension. The extension is Maya's proposed drill; the hole is the gap between encountering source material and having any place to put it before a conversion session happens. Any path that closes the time-gap between encounter and capture would address this problem — the form factor is open.

**Where it lands:** Touches the **Source Conversion** surface (intake is currently session-only, desktop-only) and the known seam: "Capture happens only inside a desktop intake session; nothing exists for capture at the moment of encounter."

---

## Problem 2: Directors can't tell what's already in the library, so they re-add things

**Title (user voice):** "Directors keep telling us they don't know what's already in the library, so they re-add things."

**Progress sought:** Know, at the moment it matters, whether a piece of source material is already banked — so work isn't duplicated and the library doesn't accumulate redundant cards.

**Who:** Director (resolved from users input — the customer role; runs conversions, approves drafts, banks cards, owns the library's truth). Reported secondhand by Maya (a crew member who fields director questions about what's already in the library).

**Circumstance:** During or before a conversion session, when a director is deciding whether a piece of source material is worth converting. There is no "already banked" signal outside the Library browse view, so the director has no way to check coverage without leaving the conversion flow and manually browsing the library. The result is redundant work: sources re-added, cards duplicated across areas.

**Evidence:**

- "directors keep telling us they don't know what's already in the library, so they re-add things." — MAYA · `specific-past` (reports a pattern she has heard repeatedly from directors; secondhand but describes real events, not a hypothetical)

**What it's not:** This is not a request for search-in-an-extension, nor for better browse navigation. The problem is the absence of a visibility signal — "is this already banked?" — at the moment the director is handling source material. DEV explicitly separates this from the capture problem: "That's a different thing though. That's search." The form the signal takes is open.

**Where it lands:** Touches **Search & duplicate awareness** (minimal today: no global search, no "already banked" signal outside the Library view) and the known seam: "Duplicate detection runs only at atomize time, not at intake — and it is area-local."

---

## Unclear

Items from the evidence list that do not support a distinct problem entry.

**"every director has this problem, literally all of them, I'd bet anything."** — MAYA
Marked `evidence-free claim` in the evidence list. Maya asserts universal prevalence of the duplicate-awareness problem but stakes it on a bet, not on observed data. The claim amplifies Problem 2's scope but provides no new evidence of who hurts or when. Carried here so it is not silently dropped.

**"A whole extension? That's a big surface."** — DEV
Could be friction about implementation scope, or a neutral sizing question. No problem is stated — DEV doesn't say the scope causes them pain or blocks progress. Without more context, this cannot ground a problem entry.

**"That's a different thing though. That's search." / "It's all the same thing, it's the extension!"** — DEV / MAYA
A disagreement about whether capture and duplicate-awareness belong to the same solution surface. This is a solution-architecture debate, not a problem statement. The disagreement itself informed the decision to separate Problems 1 and 2 above, but it does not constitute evidence of a distinct problem.

---

## Relationships

- **Problem 1 ↔ Problem 2: sibling** — distinct problems, attackable separately. Problem 1 is about intake timing (no capture path at the moment of encounter; affects crew members mid-research). Problem 2 is about visibility (no "already banked" signal at conversion time; affects directors deciding whether material is worth converting). Different roles, different circumstances, different surfaces (Source Conversion vs. Search & duplicate awareness). Neither causes the other: material can be lost in tabs without any duplicate ever being created, and directors can re-add material that was never lost.
- **Problem 1 ↔ Problem 2: disputed — MAYA vs DEV, over whether these belong to the same solution surface.** MAYA treats them as one thing ("It's all the same thing, it's the extension!"); DEV separates them ("That's a different thing though. That's search."). The dispute is about solution bundling, not about the problems' causal structure — neither party claims one problem causes the other. **Test:** Build or prototype capture-at-encounter (Problem 1) without any duplicate-awareness feature, and duplicate-awareness (Problem 2) without any change to capture timing. If each independently reduces pain for its respective user, the problems are separable regardless of whether a single surface eventually serves both. The evidence to gather: does solving one leave the other's pain unchanged?

---

## Hunch

None earned. The two problems are siblings — distinct failure modes on different surfaces, affecting different roles, with independent evidence trails. The room's dispute about whether they share a solution surface is live and unsettled; claiming a root through that disputed territory would take a side. The undisputed structure is flat: two peer problems, no causal chain between them.
