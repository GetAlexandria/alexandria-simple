# Source Material: Orchestration and Product Boundary

**Date:** 2026-04-10
**Origin:** meeting
**Origin detail:** Strategy sessions, 2026-04-09 and 2026-04-10, Chapel Hill (Jess + Dan)
**Triaged by:** Solomon + Jess

## Settled Claims

### Claim 1: Orchestration is inside the product boundary

**Authority:** Dan (co-founder, product owner) and Jess (co-founder, technical lead) — joint decision during strategy session. Both co-founders agreed.
**Evidence:** Direct co-founder decision during session. Dan: "We have to own orchestration." Jess: "We need to own orchestration... we have to run the plays." Both arrived at this conclusion independently before the meeting.
**Evidence tier:** E2 (expert judgment — architectural reasoning from both co-founders)
**Source reliability:** A
**Content credibility:** 5
**Tensions checked:** T1 checked — the library currently has no explicit position on orchestration ownership. T6 checked — medium blast radius (affects play definitions, product roadmap, architecture cards). No tensions fired that weren't resolved by the human's classification.

**Nuance from human classification:** Alexandria bundles an open-source orchestration framework rather than building its own. Individual agents and skills can still run on external harnesses (Claude Code, OpenClaw, etc.). Plays specifically require orchestration and therefore run inside the library.

**Key distinction:** "The plays are orchestration. You can't say we'll use an orchestrator [externally]. If the plays are the value, how the plays are orchestrated is part of the secret sauce." But the execution infrastructure (durable execution, cost control, restarts) comes from an open-source framework bundled inside, not built from scratch.

**Library impact:**
- **Affected cards:** [[Artifact - Product Roadmap]], [[Artifact - Play Definition]], [[Artifact - Play Pattern]], [[Artifact - Decision 9: Plays as Team Coordination]]
- **Impact type:** update — orchestration ownership needs to be stated as a product position
- **Blast radius:** medium (5-8 cards — play-related cards, architecture cards, roadmap)

---

### Claim 2: Agentic-deterministic-agentic is an architectural pattern

**Authority:** Jess (co-founder, technical lead) — observed pattern from months of building agentic systems. Dan confirmed as accurate description.
**Evidence:** Months of implementation experience across multiple agentic systems built by Jess. The pattern was articulated during the session: outer layer is agentic (e.g., Raven), middle layer is deterministic workflow, inner layer is agentic (individual agent tasks on workflow rails).
**Evidence tier:** E2 (expert judgment — pattern observed across multiple implementations)
**Source reliability:** A
**Content credibility:** 5
**Tensions checked:** T1 checked — no contradiction found. Library has no current position on this pattern. T4 checked — evidence is experience-based, not data-backed, but the human classified this as a principle (observed pattern), not a requirement.

**Settled as:** A principle — an observed architectural pattern for how to execute orchestration. Not a hard requirement. The pattern describes: (1) agentic outer layer works across the whole workflow but is constrained by it, (2) deterministic middle layer keeps things on rails and can wrap both deterministic and non-deterministic stations, (3) agentic inner layer handles individual tasks within the workflow structure.

**Library impact:**
- **Affected cards:** New principle card needed. Related to [[Artifact - Play Pattern]], [[Artifact - Play Definition]]
- **Impact type:** net-new — no existing card captures this pattern
- **Blast radius:** low (new card, 2-3 existing cards get a new relationship link)

---

### Claim 3: The core product trifecta is agents + plays + context library (orchestration implied)

**Authority:** Dan (co-founder, product owner) — stated during strategy session: "It's this trifecta. We own the agents, the plays, and the cross-library data layer about the agents and plays."
**Evidence:** Direct product owner assertion during session, confirmed by both co-founders in discussion.
**Evidence tier:** E2 (expert judgment — product vision from co-founders)
**Source reliability:** A
**Content credibility:** 5
**Tensions checked:** T1 checked — no direct contradiction. Library describes agents, plays, and knowledge graph separately but has no "core trifecta" framing. T6 checked — high blast radius if this becomes the organizing frame.

**Settled with caveat from human classification:** The trifecta is agents + plays + context library. Orchestration is implied because plays require orchestration to run (per Claim 1 above). The context library is what makes the agents and plays valuable — "without relevant, up-to-date organizational context, this is fairly tone-deaf."

**Library impact:**
- **Affected cards:** [[Artifact - Product Roadmap]], [[Artifact - Play Definition]], potentially a new decision card
- **Impact type:** update — existing cards need the trifecta framing as an organizing concept
- **Blast radius:** high (8+ cards — this is a framing shift that affects how the product is described)

---

### Claim 4: Must be multi-model, not all-in Anthropic

**Authority:** Jess (co-founder, technical lead) — classification commentary: "Settled. Can't be all-in anthropic. Can have a claude plugin and have some special anthropic things, but need to be multi-model."
**Evidence:** Strategic reasoning — reliance on a single model provider creates vendor lock-in risk. The product can still have Anthropic-specific features (Claude plugin, Claude agent SDK) while supporting multiple models.
**Evidence tier:** E2 (expert judgment — strategic assessment from technical co-founder)
**Source reliability:** A
**Content credibility:** 5
**Tensions checked:** T1 checked — the raw signal from Jess's personal reflection suggested "go all in on the anthropic ecosystem" as a possible S (slimmest version). The human's classification explicitly reversed this: the product must be multi-model. T7 checked — internal signal conflict between the reflection's "forget about model agnosticism" and the classification's "need to be multi-model." Resolved by the human's explicit classification.

**Supersedes:**
- **Previous position:** Jess's personal reflection suggested "go all in on the anthropic ecosystem" as one approach for the slimmest S
- **Previous authority:** Same person (Jess), earlier in the thinking process
- **Reason for change:** On reflection, Jess determined multi-model is the correct strategic position. Anthropic-specific features are acceptable but not exclusivity.

**Library impact:**
- **Affected cards:** [[Artifact - Product Roadmap]], model routing config, any cards describing distribution strategy
- **Impact type:** net-new — library has no explicit position on model exclusivity vs. multi-model
- **Blast radius:** medium (3-5 cards)

---

### Claim 5: Knowledge data layer is an implementation detail, not a differentiator

**Authority:** Dan (co-founder, product owner) — stated during session: "I'm almost damn sure we don't want to own this... it's the most commoditizable."
**Evidence:** Market analysis reasoning — knowledge storage (graph DBs, vector DBs, markdown files, SQLite) has been through multiple product cycles and is the most mature, undifferentiated layer. "The closest thing to a database and we've been doing databases for 60 years."
**Evidence tier:** E2 (expert judgment — market analysis from product owner)
**Source reliability:** A
**Content credibility:** 5
**Tensions checked:** T1 checked — [[Artifact - Decision 22: Beads as AI-Native Knowledge Unit]] positions beadification as critical infrastructure. No contradiction: beadification is wise engineering (the human confirmed "beadification is wise and practical") but the storage layer should be abstracted and swappable. The selling point is what runs on top of storage, not the storage itself.

**Nuance from human classification:** "We need to architect in such a way that the storage layer is abstracted away and can be swapped out. It affects retrieval and performance and some other things. But it's not what we sell on — merely an implementation detail. (Like which db a saas app uses)"

**Library impact:**
- **Affected cards:** [[Artifact - Decision 22: Beads as AI-Native Knowledge Unit]], [[Artifact - Roadmap: Beadification and MCP Compatibility]], [[System - Knowledge Graph]]
- **Impact type:** update — add framing that storage is an abstracted implementation detail, not a differentiator
- **Blast radius:** medium (4-6 cards)

## Context for Conan

These five claims emerged from a two-day strategy session where the co-founders worked through Alexandria's product boundary — what's inside, what's outside, what they own vs. what they leverage. The overarching theme is clarity on the product's core: agents + plays + context library, with orchestration inside (bundled open-source framework), multi-model support, and storage as an abstracted implementation detail.

These claims are interconnected. The orchestration decision (Claim 1) enables the core trifecta framing (Claim 3). The multi-model position (Claim 4) constrains the orchestration approach. The storage-as-implementation-detail position (Claim 5) reframes beadification as good engineering rather than product differentiator.

Sam should look for opportunities to create a new Decision card capturing the orchestration ownership decision, a new Principle card for the agentic-deterministic-agentic pattern, and updates to the Product Roadmap and Play Definition cards for the trifecta framing.

## Raw Signal Reference

- `docs/alexandria/sources/2026-04-09/meeting-1.txt` — Strategy whiteboarding session
- `docs/alexandria/sources/2026-04-09/meeting-2.txt` — Continuation of strategy session
- `docs/alexandria/sources/2026-04-10/meeting-1.txt` — Morning session, orchestration decision
- `docs/alexandria/sources/2026-04-10/jess-personal-reflection.txt` — Jess's post-session reflection
