# Feedback Queue

**Source briefing:** architecture-review-hardening
**Date:** 2026-04-10
**Logged by:** Bridget the Briefer

---

## Actionable Items

### 1. Agent File Format Standard — No Card Exists

**Severity:** High
**Type:** Missing card
**Dimension gap:** HOW + WHAT
**Description:** No canonical agent file template exists in the library. The scratchpad flags "agent file format standardization" as an open question without an answer. The builder is currently left to audit all 6 agent files and derive the pattern before applying it. A Standard card (`Standard - Agent File Format`) would document the canonical sections, their order, and what goes in each section — making this deterministic rather than judgment-based.
**Recommendation:** Sam should create `Standard - Agent File Format.md` in `docs/alexandria/library/rationale/standards/`. This is also a missing conformance obligation for all 6 agent files.

---

### 2. Capability - Linting Card Outdated Post-Retirement

**Severity:** High
**Type:** Stale card
**Dimension gap:** WHEN + WHERE
**Description:** The [[Capability - Linting]] card currently describes Nit as the exclusive owner of this capability. After Nit's retirement, the capability is performed by the `alxndr lint` CLI tool. The card's WHERE section (who performs this capability) and WHEN section (current status) will be stale the moment the retirement is implemented.
**Recommendation:** Sam should update [[Capability - Linting]] after the implementation PR lands. Conan should flag this card for review in the next health check cycle.

---

### 3. Decision 7: Nit as Independent Linter — WHEN Section Needs Retirement Note

**Severity:** Medium
**Type:** Stale card (anticipated)
**Dimension gap:** WHEN
**Description:** [[Artifact - Decision 7: Nit as Independent Linter]] documents the original decision to create Nit as an independent agent. The retirement does not reverse this decision's rationale (independence principle transfers to the CLI), but the WHEN section should record the evolution: Nit's agentic form retired, the independence principle absorbed into the CLI tool architecture.
**Recommendation:** Sam should add a WHEN note to this card after the retirement lands.

---

### 4. Loop - Alignment Sweep Driver Change

**Severity:** Medium
**Type:** Stale card (anticipated)
**Dimension gap:** HOW + WHERE
**Description:** [[Loop - Alignment Sweep]] is currently described as driven by Nit running exhaustive mechanical checks. With Nit retired, this loop is driven by CI + `alxndr lint` calls from Conan or any agent. The loop card's HOW section currently attributes the loop trigger to Nit specifically.
**Recommendation:** Sam should update [[Loop - Alignment Sweep]] after retirement lands.

---

### 5. Play Protocol Agent Table — Nit Row

**Severity:** Medium
**Type:** Stale skill file
**Dimension gap:** WHEN
**Description:** `skills/shared/play-protocol.md` contains a model dispatch table with a Nit row (`| Nit | sonnet | Mechanical sweeps with boolean checks |`). After retirement, this row should be removed or replaced with a note about the `alxndr lint` CLI.
**Recommendation:** Builder should update this file as part of the retirement PR. Not a library card update — a skill file update.

---

### 6. Health Check + Quality Cycle Collapse — No Updated Play Card

**Severity:** Medium
**Type:** Gap (anticipated after implementation)
**Dimension gap:** HOW + WHAT
**Description:** The scratchpad proposes collapsing Health Check and Quality Cycle into one play with two phases (assess, then repair). After the collapse is implemented in `docs/design/playbook.md`, the library's loop card for this play (if one exists) and Conan's health check job skill file will need to reflect the new two-phase structure.
**Recommendation:** After the playbook edit, check whether a library card documents the Health Check play. If so, Sam should update it. Bridget logged this as a potential orphaned card situation.

---

### 7. Wizard Collapse — No Card for First-Time Setup vs. Return Visit UX

**Severity:** Low
**Type:** Missing card
**Dimension gap:** HOW
**Description:** The scratchpad describes a specific UX distinction: first-time visit (no library) triggers setup silently; return visit gets concierge greeting (status, nudge, what do you want to do). This is a design decision that warrants a Decision card. Currently undocumented in the library.
**Recommendation:** After the `/wizard` → `/library` collapse is implemented, Sam should create a Decision card capturing the two-path UX model and the rationale for collapsing the entry points.
