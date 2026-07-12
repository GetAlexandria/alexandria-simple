# Factory Release Intake — Project Plan

**Issue:** #101
**Goal:** Create a deterministic sync flow from filesystem release tickets
(`docs/plans/<feature>/tickets/*.md`) into GitHub issues so Symphony can execute a
release plan without losing the filesystem plan as the source of truth.

---

## Problem

Alexandria plans releases as markdown artifacts under
`docs/plans/<feature>/tickets/*.md` and `docs/plans/<feature>/outcomes/*.md`.
Symphony executes GitHub issues today but does not read those filesystem tickets
directly. Without a bridge, running a release requires manually creating GitHub
issues that duplicate the filesystem plan — fragile, error-prone, and not idempotent.

## Goal

A single CLI script (`bin/alexandria-sync-issues`) that mirrors filesystem
release tickets into GitHub issues deterministically and idempotently. The filesystem
plan remains the **source of truth**; GitHub issues are derived artifacts.

---

## Design

### Source of Truth

Ticket files in `docs/plans/<feature>/tickets/*.md` with YAML frontmatter:

```yaml
---
id: DISC-001
title: "Wizard routing: two yes/no questions before Step 1"
outcome: O-1
tier: must          # must | should | could
enabler: false
blocked-by: []
blocks: [DISC-008]
cards: [System - Wizard Configuration Engine]
---
```

### Sync Mechanism

**Idempotency key:** Title prefix `[DISC-001]` plus the embedded plan marker in the
issue body. The script searches for existing open or closed issues with the title
prefix, then requires the body marker `<!-- cl-ticket: DISC-001 | plan: <plan> -->`
to match before treating the issue as the same filesystem ticket. The title prefix
remains visible, human-readable, and searchable, but it is not treated as globally
unique across every plan in the repo.

**One-way sync (filesystem → GitHub):** The script does not write back to filesystem
files. GitHub issues are treated as execution mirrors, not planning documents.

**Labels applied to every synced issue:**
- `tier:must`, `tier:should`, or `tier:could` — scope classification
- `cl-ticket` — marks the issue as a context library filesystem-sourced ticket

**Issue body format:**

```
<!-- cl-ticket: DISC-001 | plan: progressive-codebase-discovery -->

**Plan:** progressive-codebase-discovery
**Outcome:** O-1 | **Tier:** must | **Enabler:** no
**Blocked by:** (none) | **Blocks:** DISC-008

---

<full ticket markdown body>
```

### CLI Interface

```
alexandria-sync-issues <plan-dir> [options]
alexandria-sync-issues --all [--root <dir>]

Options:
  --repo owner/repo   GitHub repository (default: detected from git remote)
  --dry-run           Print actions without creating/updating issues
  --plan-label <lbl>  Extra label added to all issues (e.g. plan:release-v0.6)
  --state open|all    Issue search state (default: all, to catch closed issues too)
  --update            Update body of existing issues if ticket content changed
  --all               Sync every plan dir under --root (default: docs/plans/)
  --root <dir>        Root dir for --all mode (default: docs/plans/)
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0    | Success or dry-run no-op (everything already aligned) |
| 1    | One or more tickets failed to sync after input validation succeeded |
| 2    | Invalid input or malformed plan data; non-dry-run batches abort before any GitHub writes |
| 3    | Dry-run detected pending creates, updates, or dependency rewires |

---

## Implementation

### Files

| File | Purpose |
|------|---------|
| `bin/alexandria-sync-issues` | Main sync script (Python, no extra deps) |
| `tests/test-sync-issues.sh` | Unit tests (parsing, dry-run, idempotency) |

### Approach

1. **Parse tickets** — reuse the frontmatter parser pattern from `alxndr dag`
2. **Detect repo** — `git remote get-url origin`, strip `.git`, parse owner/repo
3. **Search existing issues** — `gh issue list --search "[ID]" --state all --limit 5`
4. **Create if missing** — `gh issue create --title "[ID] title" --body "..." --label ...`
5. **Update if changed** — `gh issue edit <number> --body "..."` (only with `--update`)
6. **Report** — Print a summary table of created / already-existed / failed tickets

### Dependency on `gh` CLI

The script requires the GitHub CLI (`gh`) to be installed and authenticated. It
prints a clear error with install instructions if `gh` is not available.

---

## Decisions Made During Planning

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| D1: Idempotency key | (A) Label per ticket, (B) Title prefix `[ID]`, (C) Manifest JSON | (B) Title prefix | Visible in UI, searchable, no extra files, no extra labels per-ticket |
| D2: Sync direction | (A) Two-way, (B) One-way FS→GH | (B) One-way | FS is source of truth; writing back to FS files adds complexity with no gain |
| D3: Implementation language | (A) Bash, (B) Python | (B) Python | Needs JSON parsing of gh output; Python matches alxndr dag pattern |
| D4: Update behavior | (A) Always update, (B) Never update, (C) --update flag | (C) Flag | Default is safe (no surprise edits); opt-in update for deliberate refreshes |
| D5: --all mode | (A) Single plan only, (B) Multi-plan --all flag | (B) Both | Enables full-release sync in one command; single-plan default is the common case |

---

## Risks and Assumptions

| Type | Description | Mitigation |
|------|-------------|-----------|
| Risk | gh CLI not installed | Clear error with install URL |
| Risk | Title search may return tickets from different plans that reuse the same local ID | After title search, require the embedded `cl-ticket` + `plan` body marker to match before reusing an issue |
| Risk | Rate limiting on large plan dirs | Script shows progress; exits cleanly on first gh error |
| Assumption | Ticket files have valid frontmatter with `id` and `title` fields | Same assumption as alxndr dag; errors reported per-file |
| Assumption | Labels `cl-ticket`, `tier:must/should/could` exist in the target repo | Script creates missing labels automatically before first use |
