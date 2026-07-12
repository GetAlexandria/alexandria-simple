# ADR 004: Host-Specific Primitives As Execution Aid With Fallback Contract

**Status:** Accepted
**Date:** 2026-04-15
**Context:** First shipped use of Claude Code Task primitives in `/ax-library` first-session initialize; portability commitment remains governed by ADR 001

---

## Decision

Alexandria skills may depend on **host-specific primitives** such as Task tools,
MCP-backed capabilities, or other harness-only affordances **only as execution aids**.

The canonical procedure remains the checked-in prose skill or job file. A host-specific
primitive may improve enforcement, progress visibility, or ergonomics, but it may not
become the only definition of the behavior.

Every use of a host-specific primitive must satisfy four rules:

1. **Prose remains canonical.** The skill file still defines the behavior end-to-end in a
   way a non-supporting host can follow.
2. **Fallback is explicit.** The skill file names what happens when the primitive is
   unavailable.
3. **Failure is graceful.** Missing primitive support may reduce experience quality, but it
   must not create a user-visible dead end for behavior the skill can still perform in prose.
4. **Tests exercise the contract.** Eval or deterministic coverage must prove both the
   improved path and the fallback semantics as far as the available host makes honest.

## Context

ADR 001 commits Alexandria to dual-mode distribution: Claude Code plugin first, with
filesystem-based portability to other harnesses. That commitment does not mean every host
offers the same primitives. Some harnesses expose capabilities such as Task orchestration,
MCP connectors, or host-managed progress surfaces that others do not.

The first concrete instance is `/ax-library` first-session initialize. The restored ritual is
more reliable when Claude Code Task primitives mirror beat order and completion state. That
improves adherence under load and gives the human a clearer sense that Raven has a plan.

The portability risk is that a useful host primitive can quietly become a hidden dependency:
the behavior only works on one host, the prose no longer explains the fallback, and evals
only cover the happy path. That breaks the Alexandria promise that the knowledge layer is
portable even when the host ergonomics differ.

## Why Execution Aid, Not Hard Dependency

**Why allow host-specific primitives at all:**
- Some host features materially improve reliability. Task orchestration is stronger than
  hoping a long prose ritual is followed perfectly under model pressure.
- Some host features improve user trust without changing the underlying product behavior.
  Visible progress scaffolding is a real UX win.
- Refusing all host-specific capabilities would force Alexandria down to the weakest common
  denominator even when a host can safely do better.

**Why not allow them as the canonical behavior:**
- Alexandria is distributed beyond one host. A behavior that exists only as tool calls is not
  portable.
- Skill files are the audited product surface. They must remain understandable without
  reconstructing hidden harness behavior.
- Eval coverage becomes misleading if it only proves a host-specific path and not the
  declared fallback.

## First Instance

`skills/raven/job-first-session.md` is the first shipped use of this pattern.

- **Primitive:** Claude Code `TaskCreate`, `TaskList`, and `TaskUpdate`
- **Purpose:** mirror the nine first-session initialize beats and their dependency order
- **Canonical procedure:** the beat-by-beat prose procedure in the job file
- **Fallback:** if one or more Task primitives are unavailable, Raven runs the same ritual in
  prose and treats missing Task support as a non-blocking host limitation

This is an execution aid, not a separate product surface. The human interacts with the
initialize conversation and its artifacts, not with Task tooling directly.

## Test Obligation

Any host-specific primitive governed by this ADR must be covered by tests that make the
contract inspectable.

Minimum expectation:

1. **Improved-path evidence** when the host exposes the primitive
2. **Fallback-path evidence** when the primitive is disabled or unavailable
3. **Artifact / behavior parity checks** proving the fallback still completes the intended
   product behavior honestly

For `/ax-library` first-session initialize, this means the eval harness must be able to inspect
Task lifecycle evidence when present, and also prove that the prose path still completes the
ritual when Task tools are absent.

## Consequences

- New host-specific primitive usage requires an explicit fallback statement in the skill file
- Maintainership burden increases slightly: the better host path and the portable fallback
  must stay aligned
- Eval artifacts need enough session evidence to verify host-level tool behavior when that
  behavior is part of the acceptance contract
- Alexandria can adopt host improvements without abandoning ADR 001 portability
