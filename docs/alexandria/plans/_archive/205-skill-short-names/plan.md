# Technical Plan: Issue 205 Skill Short Names

- Issue reference: `#205` — `[POLISH-001] Rename skill name: fields to short names`
- Goal: shorten the product skill `name:` frontmatter fields so Claude Code plugin skill invocations read cleanly under the automatic `/alexandria:` namespace
- Linked product plan: none checked in; product intent comes from the sanitized issue summary for `#205`

## Scope

- Rename the canonical product-skill `name:` fields that are currently awkward under `/alexandria:`
- Keep the rename limited to checked-in product skill frontmatter plus the small set of active docs that present the canonical invocation
- Preserve the existing skill directory layout, route files, eval case directories, and compatibility symlinks
- Keep `wizard` and `release` unchanged because they are already short enough
- Keep `context-library-upgrade` as the explicit legacy alias in this slice so old upgrade invocations still have a stable compatibility entrypoint

## Non-Goals

- Renaming skill directories under `skills/`
- Renaming contributor-skill names or contributor-skill directories
- Renaming eval case directories such as `tests/eval-cases/implementation-planning/`
- Reworking plugin registration, setup symlinks, or route-file discovery
- Removing the legacy upgrade alias or introducing a second compatibility layer for the other renamed skills

## Linked Product-Plan Summary

- The issue summary calls out Claude Code's automatic `/alexandria:` prefix as the motivation for shortening long skill names.
- This issue must land first so downstream polish tickets target the final naming scheme instead of the transitional long names.
- The summary explicitly says `wizard` stays `wizard`; the rest of the work is to shorten the long product-facing names without regressing plugin usability.

## Current Gap

- Today the plugin exposes long slash-command names such as `/alexandria:implementation-planning` and `/alexandria:context-briefing`.
- The frontmatter `name:` fields, not the skill directories, define the user-facing command surface.
- Internal repo tooling mostly keys off paths like `skills/implementation-planning/SKILL.md`, so the naming problem is primarily user-facing rather than architectural.
- The upgrade surface already has a compatibility alias skill, which means the canonical upgrade command can be shortened without deleting the legacy alias.

## Architectural Boundaries

- Change only product-facing `name:` fields where the command surface is the actual behavior under review.
- Do not rename `skills/<dir>/` folders in the same slice; path-based discovery, route files, and eval directories should stay stable.
- Treat `context-library-upgrade` as a compatibility contract, not just duplicate copy. Its long name stays until a dedicated alias-removal issue says otherwise.
- Update only active docs that present the canonical command users should run now. Do not churn historical plans and frozen transcripts for cosmetic consistency.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Planning skill command | `skills/implementation-planning/SKILL.md` | Canonical slash-command shortens from `implementation-planning` to `plan` |
| Briefing skill command | `skills/context-briefing/SKILL.md` | Canonical slash-command shortens from `context-briefing` to `brief` |
| Upgrade skill command | `skills/alexandria-upgrade/SKILL.md` | Canonical slash-command shortens from `alexandria-upgrade` to `upgrade` |
| Legacy upgrade alias | `skills/context-library-upgrade/SKILL.md` | Compatibility entrypoint remains long-name alias and should point users at the new canonical short command |
| User-facing docs | `README.md` and any touched skill copy | Docs point users at the short canonical command names instead of the old long names |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `wizard` | No command-name change; stays `wizard` | None beyond documenting that it was intentionally unchanged in the plan |
| `implementation-planning` | Canonical invocation becomes `/alexandria:plan` | Update any active docs or compatibility copy that still present the long name as the primary command |
| `context-briefing` | Canonical invocation becomes `/alexandria:brief` | Update any active docs or compatibility copy that surface the primary name |
| `alexandria-upgrade` | Canonical invocation becomes `/alexandria:upgrade` | Update README upgrade instructions and the compatibility alias text |
| `context-library-upgrade` | Stays a legacy alias rather than becoming a second short name | Keep its frontmatter long-form and make the body point to the short canonical command |
| `release` | No command-name change; stays `release` | None |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown, JSON/YAML, shell, and type-check surfaces after frontmatter/doc edits |
| Full deterministic suite | `bun test` | Confirms the name-only slice did not accidentally perturb setup, eval CLI, routing, or packaging behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `wizard` | Yes | No rerun if untouched; the canonical name remains unchanged | none |
| `implementation-planning` | Yes | Keep the eval configs aligned to the renamed skill because the eval harness routes by the configured skill `name:` when constructing `@skill` prompts | update the eval config entries in the same slice |
| `context-briefing` / `bridget` | Yes | Re-evaluate after implementation; expected outcome is "no rerun needed" for the same reason as above if only frontmatter naming changes | document decision in execution notes |
| `alexandria-upgrade` | No default eval coverage | Validate via deterministic checks and manual doc review | none |
| `release` | No default eval coverage | No rerun if untouched | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The legacy upgrade alias gets accidentally renamed away, breaking compatibility for existing users | Keep `skills/context-library-upgrade/SKILL.md` explicitly out of the short-name rename set and review its final diff separately |
| Historical docs and eval artifacts create noisy churn with little value | Limit doc edits to active user-facing references only; do not rewrite historical plans or frozen transcripts in this slice |
| A frontmatter rename is assumed to affect routing or eval discovery when those systems actually key off paths | Preserve directories and route files, and run the deterministic suite to catch any unexpected coupling |
| README and compatibility copy drift from the new canonical commands | Update the small set of active docs in the same slice as the frontmatter edits |

## Implementation Steps

1. Write this repo-specific plan for issue `#205`.
2. Update the canonical product skill frontmatter names:
   - `wizard` → `wizard`
   - `implementation-planning` → `plan`
   - `context-briefing` → `brief`
   - `alexandria-upgrade` → `upgrade`
   - `release` → `release`
3. Leave `context-library-upgrade` as the legacy alias and update its body text to point at `/alexandria:upgrade` as the preferred command.
4. Update the narrow set of active docs that present the canonical command, starting with `README.md`.
5. Audit the final diff for any additional active references that now misstate the primary command surface.
6. Run `bun run check`.
7. Run `bun test`.
8. Do a local review pass focused on compatibility alias preservation and doc drift.
9. Keep the eval config metadata aligned with the renamed planning skill so later manual or CI eval runs target the correct `@skill` invocation without needing additional repair work.
10. Commit the branch changes and open or update the PR against `main`.

## Acceptance / Exit Criteria

1. The canonical product skill commands exposed by frontmatter are short names where intended: `wizard`, `plan`, `brief`, `upgrade`, and `release`.
2. The legacy `context-library-upgrade` compatibility skill still exists and clearly points to the new canonical upgrade command.
3. Active user-facing docs no longer present the old long upgrade command as canonical.
4. Skill directories and route-file paths remain unchanged.
5. `bun run check` passes.
6. `bun test` passes.
7. The eval config metadata stays aligned with the renamed `plan` skill so later eval runs target the correct command surface.

## Deferred Follow-Ups

1. Add explicit compatibility aliases for other renamed long-form commands if host behavior or user feedback shows they are needed.
2. Sweep historical plans, frozen transcripts, or eval metadata only if a later cleanup issue decides the churn is worthwhile.
3. Decide whether the legacy `context-library-upgrade` alias can be removed in a later release once the short command is established.
