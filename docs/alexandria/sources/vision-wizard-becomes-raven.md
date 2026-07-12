# Raven Handoff: The Wizard Becomes Raven

**Date:** 2026-04-02 (updated with design decisions)
**Session:** Vision synthesis for wizard redesign — from form-filling workflow to Raven-as-guide

---

## The Vision, Crystallized

The wizard as currently built is an instrument of configuration. You invoke it, answer questions, and it produces a prioritized seeding plan. Raven exists separately — a thinking partner you call after the library is built. The new vision collapses this separation: Raven is present from the very first moment you initialize a library, and she *is* the configuration experience.

What this actually means in practice: when you spin up a Context Library, you don't fill out a form. You meet Raven. She greets you, she asks what you're building, she reads what you have, she runs background agents to draft material and fill out forms while you're talking. The three configuration questions (AI mode, domain novelty, product complexity) don't disappear — they get answered *through conversation* rather than presented as a checklist. Raven synthesizes the engine's logic from the texture of your dialogue, rather than presenting it as a form to complete. The output is the same; the experience is entirely different.

This matters because the current wizard's core failure mode is that it *feels like an interrogation*. The incremental fixes (infer-before-ask, greenfield fast-lane, opening value frame) are all attempts to patch around a structural mismatch: a form-based tool trying to do relationship-building work. The new vision doesn't patch that — it replaces the form with a guide. Raven can sing in rounds, backtrack, explain why something matters, give you a synopsis paragraph and let your spider sense calibrate. A form cannot do any of those things. And critically: this isn't a one-time setup. The library grows iteratively — you build enough to ship tickets, ship, come back, give Raven more, unlock more. The `/library` room is where that cycle lives, across sessions, across months.

---

## Key Design Shifts

### From Wizard-as-Form to Raven-as-Guide

The existing wizard has a procedure: Step 0 → Step 1 → Step 2 → … → Step 6. That linear procedure is embedded in the skill file and makes sense as engineering — it's deterministic, testable, reproducible. What it lacks is adaptability. Raven's conversational model replaces linearity with orchestration: she has a *goal* (configure the library) and *tools* (scanner, assembler, background agents), and she navigates toward the goal through dialogue rather than walking a fixed script.

This is not cosmetic. It changes:
- **What gets asked vs. inferred.** Raven reads what you have. If your README explains your product in one sentence that's clearly founder-market fit in an untested space, she doesn't ask "would someone guess what using your product feels like?" — she infers High novelty and surfaces that inference for you to confirm.
- **Who drives pacing.** The user can now say "wait, why does that matter?" and get an answer. They can backtrack. They can push back. The form can't respond to any of that; Raven can.
- **What happens when the user isn't ready.** Greenfield users don't have documentation to declare gaps in. Raven meets them where they are: "Tell me what you're building" → she drafts a starter Vision card live. That's not a feature added to the wizard; it's a natural consequence of Raven being in charge.

### From Blocking Interrogation to Parallel Assembly

The vision describes Raven running background agents to fill out forms and draft material while the conversation is happening. This is the foreground/background improvement made structurally sound rather than bolted on. Raven doesn't pause the conversation to scan your codebase — she kicks off the scan and asks you something while it runs. She doesn't stop to draft the impact statement — she delegates it to a background agent and presents it for review when it's ready.

Raven's role in this model is clear: **she elicits and conducts, agents write.** Raven never writes files directly. She orchestrates — calling the scanner, directing Sam to produce artifacts, integrating results into the conversation. The experience feels like Raven doing it; the mechanics route through appropriate agents. This resolves the write-authority question cleanly and aligns with the existing division of labor: Sam writes cards, Raven thinks. In wizard mode, Raven directs Sam explicitly and in real time rather than leaving Sam for later in the lifecycle.

This constraint also makes backgrounding easier to reason about. If Raven were writing files herself, async background work would require her state to be split. If she's directing agents, the agent calls are the background work — Raven's conversation continues in the foreground.

### From Assessment-at-the-End to Calibration-Throughout

Currently, the gap analysis happens in Step 5, after you've answered all the configuration questions. In the Raven model, gap assessment is continuous — as you share documents, as you answer questions, as you describe what you're building, Raven is updating her model of what's present, what's missing, and what the priorities are. The scoreboard (see below) is the persistent artifact of this continuous assessment: funnels filling up as material flows in, rather than a batch assessment generated at the end.

This changes the user's relationship to the library build. Currently it's: answer questions → receive a plan → execute the plan. In the Raven model it's: start talking → watch the library take shape → calibrate and steer. The user is part of the assembly across multiple sessions, not a form-filler who hands off to a process once.

---

## The Iterative Room Model

This is a first-class design decision, not just a scope clarification: `/library` is a persistent room, not a one-time command.

The current wizard is invoked once at setup. The new model is iterative:

1. **Round 1:** Build enough to get going. Foundation fills. Raven says "you're cleared to build X." You start printing tickets and shipping.
2. **Round 2:** You come back. Give Raven more material. Core starts filling. New tickets come out — some refine what was already built, some initialize new areas. Raven shows you the scoreboard where it was last, updated with anything that improved through other channels since.
3. **Rounds 3-N:** Each iteration of filling the scoreboard leads to both refinement and expansion. A fully-filled category unlocks a lot at once; even a little progress in a bucket unlocks something.

The critical behavior: **when someone runs `/library` six months later, Raven picks up where she left off.** The scoreboard reflects the current state — including any improvements made through channels other than this room (Conan health checks, Sam card builds, source material additions). Raven doesn't re-ask questions that are already settled. She reads the current library state, shows you where things are, and asks what you want to work on.

This model has major implications:
- The wizard isn't a skill you complete and archive — it's a live interface to the library's growth state.
- Session continuity is load-bearing. Raven needs to be able to reconstruct context from the library state and any session notes, not from conversation history alone.
- The stopping-point logic becomes round-by-round, not end-state: "here's what this round of investment unlocks" is more useful than "here's the full readiness rubric."

---

## The Scoreboard

The scoreboard is the visual/textual artifact at the center of the `/library` room. It's the shared reference between Raven and the user — where progress is visible and what unlocks next is explicit.

**Structure:** The scoreboard maps directly to the wizard engine's configuration output. When you set your product type (AI mode × novelty × complexity), your scoreboard gets configured — Foundation bucket, Core bucket, Amplifier bucket, each with the specific knowledge areas relevant to your configuration. Different configurations produce different bucket shapes; a Factory-mode high-complexity product has more areas and heavier Foundation requirements than a Short-Order Cook with simple complexity.

**Filling mechanics:** Each knowledge area is a bar in its bucket. As material flows in — documents shared, cards built, source material added — bars fill. A fully-filled Foundation bucket means: "Build cleared for XYZ." Half-full Core: "Build cleared for A and B, not yet C, D, E." Each round of investment advances bars and unlocks actions.

**Rendering target:** ASCII art. Think of the configurator output — tabular, text-first, rendered in the Claude Code interface. Something like:

```
┌─ FOUNDATION ─────────────────────────────────┐
│ Product Vision     ████████████████████ FULL  │
│ Product Strategy   █████████████░░░░░░  65%   │
│ User Personas      ████████░░░░░░░░░░░  40%   │
│ Noun Vocabulary    ░░░░░░░░░░░░░░░░░░░  0%    │
└──────────────────────────────────────────────┘
  → Foundation partial: cleared for [A, B] | need [C, D] for full clearance

┌─ CORE ────────────────────────────────────────┐
│ User Journey Maps  ░░░░░░░░░░░░░░░░░░░  0%    │
│ System Design      ░░░░░░░░░░░░░░░░░░░  0%    │
└──────────────────────────────────────────────┘
  → Core locked until Foundation >= 80%
```

**Key property:** Even partial progress unlocks something. Raven's stopping-point calls reference the scoreboard explicitly: "Your Foundation is 65% — that's enough to start building tickets for the Vision and Strategy work, but your Noun Vocabulary gap will bite you at Factory mode. Want to fill that now or come back to it?"

**Persistence:** The scoreboard state is derived from `wizard-config.json` plus the current library state — not from conversation history. This means it's reconstructible and updatable by any agent, not just through the `/library` room.

---

## Implications

### Skill Surface

The current wizard skill (`skills/wizard/SKILL.md`) is a linear procedure with embedded logic for each step. Under this vision, that becomes something different — closer to Raven's job-procedure architecture: a goal statement, a set of tools, and a set of stopping criteria, with the conversational path left to Raven's judgment.

Practically: the wizard engine YAML (`docs/wizard/wizard-engine.yaml`) doesn't go away — it's still the data source for tier assignments and sensitivity matrices. The solicitation prompts in `phase-6-intake-engine.md` still matter — they become conversation seeds rather than form fields. The output artifacts (`wizard-output.md`, `wizard-config.json`, `assessment.md`) still need to exist because downstream agents (Conan, Sam, Bridget) consume them. What changes is that producing these artifacts is Raven's orchestration goal, not the user's form-filling work.

One implication to hold: the current skill can be invoked in test suites deterministically. A Raven-orchestrated build is LLM-mediated. You probably need both: a "Raven wizard mode" for real human sessions, and a legacy procedural path for CI and scripted runs. That's a meaningful engineering constraint, but the human's guidance on eval strategy (build it, play with it, then harden) means this doesn't need to be designed before building Phase 2.

### Agent Architecture

This vision asks Raven to be something she currently isn't: an orchestrator with tools. Raven's current capability set is Read, Grep, Glob — she reads, she thinks, she talks. She cannot invoke subagents or write files. The wizard-mode architecture requires:
- **Scanner as a callable tool** — Raven kicks off a scan as a delegated task and integrates results
- **Sam as a real-time collaborator** — Raven dictates artifact production (Vision card drafts, `wizard-config.json`, `assessment.md`) to Sam mid-conversation rather than leaving Sam for the post-wizard lifecycle
- **Scoreboard state in `wizard-config.json`** — the scoreboard is derived from the library state and the config, updated by whatever agent last touched it, readable by Raven at the start of any `/library` session

The division of labor is now explicit: **Raven elicits, conducts, and synthesizes. Agents write.** This is not a limitation on Raven — it's the right architecture. Raven's judgment is the valuable thing; delegating file writes to Sam keeps that judgment clean and auditable.

The thin orchestration layer between Raven's conversational state and Sam's production is the main new interface to design. Raven needs a way to say "draft a Vision card from what we've discussed" and have Sam produce it, show it to the user, and update the scoreboard — all within the `/library` session.

### User Experience

The stopping-point problem is partially answered by the scoreboard: Raven has a shared visual reference and can point at it explicitly. But the deeper calibration — what "Foundation >= 80%" actually means for different product types and build phases — needs exemplar grounding.

**Stopping-point calibration approach (decided):** Interview the human on how a master constructs a context library. What are the real stopping points they've observed? When did a partial Foundation bite someone? When was "good enough" actually good enough? That interview produces the initial heuristics; Raven uses them from the start and refines them over time as more cases accumulate. This is the right bootstrap: come out of the gate with real calibration, not theoretical rubrics.

The synopsis paragraph concept remains crucial and underspecified as implementation detail — but the mechanism is clear: Raven reads what you've shared and gives you her take on whether the build is "off," grounded in the exemplar heuristics from the stopping-point calibration work.

### Team Model

The `/library` room changes the team model significantly. It's not "the wizard the product lead ran once at setup." It's the ongoing interface for anyone who wants to understand where the library stands and what to work on next. New team members can run `/library` and get oriented. The product lead can run it after a major pivot to recalibrate. Any round of investment — however small — shows up on the scoreboard.

This shifts scope from "a skill you run once" to "the primary interface layer for library configuration and growth." That's a larger surface than the current wizard, but it's also the right scope: the library is a living artifact, and it needs a living interface.

Stopping points in the iterative model: Raven's signal that you're ready to build is per-round, not absolute. "Foundation is solid enough to ship your MVP feature set. Come back when you're hitting walls on Core — that's when User Journey Maps and System Design start earning their weight." Each round ends with a specific clearance statement and a specific "come back when" prompt.

---

## The Hardest Problems

**1. Determinism vs. Conversation**
The wizard's value is partly that it produces consistent, reproducible output. Raven's conversational model trades determinism for adaptability. The hard problem: how do you maintain testability while making the primary experience conversational? The answer is the engine/interface separation: the engine (YAML-driven, CLI-callable, deterministic) remains testable; the interface (Raven-mediated) gets eval coverage. Eval strategy: build it, play with it, then harden based on where things actually land — not theoretical test cases designed before the experience exists.

**2. Session Continuity**
The iterative room model requires Raven to reconstruct context reliably at the start of every session. "Scoreboard where it was last" is the minimum; "scoreboard reflecting current library state" is the goal. This means the scoreboard derivation logic needs to be well-defined and runnable at any time — not just output during the initial wizard run. The `wizard-config.json` is the seed; the current library state (what cards exist, what Conan has graded) enriches it. Raven needs a lightweight "session start" procedure: read config, read library state, render scoreboard, orient.

**3. Background Agents in Claude Code**
The vision assumes Raven can kick off background work while the conversation proceeds. In the current Claude Code plugin architecture, subagent calls are synchronous — the orchestrator waits. True parallel assembly (Raven talking while Sam drafts) would require async tooling that may not exist yet. This is a genuine infrastructure gap. Phase 2 can be designed to work with sequential agent calls (Raven kicks off Sam, waits, presents result, continues) while leaving the door open for genuine parallelism when the platform supports it.

**4. Exemplar Calibration**
Raven needs internalized exemplars of what a well-built library looks like across configurations — for synopsis paragraphs, stopping-point calls, and "is this build off?" judgments. The calibration method is decided: interview the human expert, extract heuristics, encode them as reference material Raven loads in wizard mode. This is not a large effort. It is a prerequisite for Phase 2 to feel trustworthy rather than just confident.

---

## What This Makes Easier

- **Greenfield users.** Raven as guide is a natural fit for users who have ideas but not documentation. The current wizard's form-filling model is actively wrong for them. Raven can meet them in conversation, draft Vision material live, and give them something real before they've answered a single configuration question.
- **Backtracking and recalibration.** The current wizard's reconfigure loop (say "reconfigure" to restart from Q2) is clunky. Raven handles recalibration naturally — "actually, I think this is more Factory than Pair Programmer" is just a turn in the conversation, not a special command.
- **Singing in rounds.** A conversational model is designed for this: one topic flows into another, you come back to something you said earlier, the frame shifts. The form model has to special-case every non-linear behavior.
- **Transferring power user knowledge.** Exemplar Raven behavior — the synopsis paragraph, the stopping-point heuristics — is something you can build and refine. The form doesn't have a "get better at judging library completeness" surface. Raven does.
- **Iterative library growth.** Each `/library` session is additive. Small investments unlock something. The scoreboard makes progress visible and motivating.
- **Explaining why things matter.** The form's `when_missing` text is good but one-directional. Raven can explain, respond to "but why?", and calibrate the explanation to what the user seems to be uncertain about.

## What This Makes Harder

- **Deterministic testing.** The build standard requires tests that call tools as black-box executables and assert on output. A conversational wizard needs LLM-as-judge evals — higher variance, higher cost, harder to run in CI. Mitigation: keep the engine deterministically testable; apply eval coverage to the conversation layer after building and playing with it.
- **Consistency across runs.** Two users with similar products should get similar library configurations. The Raven model makes this harder to audit. Eval coverage over time is the answer, not a pre-build test harness.
- **Handoff to downstream agents.** Conan and Sam consume structured artifacts. If Raven orchestrates their production through conversation, you need to verify artifact quality at the seams. More fragile than the current form-to-file pipeline — mitigated by keeping Sam as the writer and Raven as the director.
- **Session continuity burden.** The room model requires reliable state reconstruction at session start. If `wizard-config.json` is stale or the library has drifted significantly since the last `/library` session, Raven's scoreboard read may be wrong. Needs a defined reconciliation procedure.

---

## Phased Approach

### Phase 1: Raven-Flavored Wizard (Available Now)

No infrastructure changes. Rework the wizard skill to open with Raven's voice — a greeting, a framing of what we're building together, and a question rather than a form. The three configuration questions remain, but they're presented conversationally and Raven explains the *why* behind each one. The greenfield fast-lane gets implemented: detect thin-material state early and branch to "tell me what you're building." The opening value frame lands.

This is the incremental improvements from the previous handoff, delivered with Raven's voice rather than a form wrapper. It doesn't require new tools or agent architecture. It does require rewriting the wizard skill's Step 0 and Step 1 language, adding the greenfield branch, and adding the value frame.

**Exit criterion:** After Phase 1, does the wizard feel like a form or a conversation? If a user says "wait, why does AI mode matter?" does the skill respond meaningfully rather than presenting the next question?

### Phase 2: Raven Orchestrates the Wizard

Raven gets a `/library` entry point — a `wizard-mode` job in her agent definition. In wizard mode, she takes over the library build as orchestrator: she reads library state to render the scoreboard, conducts the session through conversation, and delegates artifact production to Sam. The wizard skill file becomes reference material she calls on, not a linear procedure she walks.

This requires:
- Raven's agent definition updated with a `wizard-mode` job and the `/library` entry point
- A session-start procedure: read `wizard-config.json`, read library state, render scoreboard, orient
- A scoreboard derivation spec: how is each knowledge area's fill level computed from current library state?
- A handoff protocol between Raven's conversational direction and Sam's artifact production
- The exemplar calibration work: interview the human expert on stopping-point heuristics, encode as Raven reference material

Phase 2 does not require async background agents — sequential agent calls (Raven directs Sam, waits, presents, continues) are sufficient. Genuine parallelism is a Phase 3 concern.

**Exit criterion:** Can Raven complete a full library initialization — configuration, gap analysis, assessment document — through conversation, with Sam producing the artifacts, and the scoreboard updating, without the user ever seeing a step-number or a form?

### Phase 3: Parallel Assembly and Persistent Room

Background agents running while Raven converses. Scoreboard updating in real time as material flows in through any channel. Synopsis paragraphs on shared documents. The full iterative room experience.

This phase likely needs infrastructure work — async execution in Claude Code, or the MCP/beadification direction in the design docs — before it's fully achievable. The scoreboard and session-continuity design from Phase 2 are prerequisites. Don't scope Phase 3 in detail until Phase 2 is proven and the platform constraints are clearer.

---

## Decided

These questions were open in the first draft. They are now resolved.

**Entry point:** `/library`. The command names what you're building, not the action you're taking. "Assemble," "initialize," and "build" could mean anything; "library" is specific to this context and signals the persistent room.

**Scope of wizard mode:** `/library` is a persistent room with session continuity, not a one-time command. Raven picks up where she left off. The scoreboard reflects the current library state — including improvements made through other channels since the last session. Iterative by design: build enough to ship, ship, come back, fill more, unlock more.

**Raven's write authority:** Raven elicits and conducts; agents write. No direct file writes from Raven in wizard mode. Sam produces all artifacts (Vision cards, `wizard-config.json`, `assessment.md`) on Raven's direction. This keeps Raven's role clean, enables backgrounding architecturally, and aligns with the existing division of labor.

**Stopping point calibration:** Interview the human expert on how a master constructs a context library and where the real stopping points are. Extract heuristics. Encode as reference material Raven loads in wizard mode. Start with that calibration from day one and improve from real cases over time.

**The scoreboard:** ASCII art, text-first, rendered in the Claude Code interface. Buckets map to the wizard engine's tier configuration (Foundation, Core, Amplifier). Each knowledge area is a bar. Bars fill as material flows in. Partial fill unlocks something; full fill unlocks more. Raven references the scoreboard explicitly in stopping-point calls.

**Evaluation coverage:** Build it, play with it, then harden. Don't design the eval harness before the experience exists. When it's time to harden, start with: greenfield onboarding end-to-end, brownfield with existing docs, reconfiguration after AI mode change.

---

## Remaining Open Questions

1. **Scoreboard derivation spec.** How exactly is each knowledge area's fill level computed from the current library state? The coarse model is: card exists → partial; card graded and passes Conan's threshold → full. But what about partial cards, multiple cards per area, source material without cards yet? This needs a defined algorithm before Phase 2 is buildable.

2. **Session-start reconciliation.** If the library has changed significantly since the last `/library` session (many new cards, a Conan health check that flagged things), how does Raven handle the delta? Does she present a "here's what changed since we last talked" summary? Does she silently update the scoreboard? What if the scoreboard looks worse (things degraded) — how does Raven handle that without derailing the session?

3. **The orchestration interface.** What does Raven's direction to Sam look like in practice — a natural language prompt in the conversation, a structured handoff, a tool call? The "Raven elicits, agents write" principle is clear; the interface spec is not. This needs design before Phase 2 implementation.

4. **Greenfield + iterative room interaction.** A greenfield user generates source material in their first `/library` session. On their second visit, they've shipped and have a codebase. Do they hit the scanner path, the brownfield path, or something hybrid? The scoreboard should handle this naturally (bars at 0% for everything, now let's fill them), but the session-start procedure needs to handle the greenfield-to-brownfield transition without confusion.
