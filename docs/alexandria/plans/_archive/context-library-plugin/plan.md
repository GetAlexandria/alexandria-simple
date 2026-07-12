> **DEPRECATED** — This was the original project plan for setting up the plugin repo.
> Phases 1-4 are complete. The plan is preserved for historical context only.
> See individual plan docs in `docs/plans/` for current work.

# Alexandria Plugin — Project Plan

**Goal:** Make the context-library repo a clean, installable Claude Code plugin that can
be dropped into any repo to create and maintain an Alexandria. Then test it end-to-end
on Hearthfire, feeding work into the software factory.

---

## Phase 1: Sync context-library repo with LifeBuild — DONE (PR #1)

Wholesale copied agents/skills from work-squared. Applied Strategy→Product Thesis rename.
Fixed agent frontmatter for plugin validation. See PR #1 for full diff details.

## Phase 2: Bring in work from LifeBuild issues #753 and #756 — DONE (PR #1)

- Wizard design docs (9 files) → `docs/wizard/`
- Product architecture docs (2 files) → `docs/design/`
- Reviewed 6 other branches — none needed for context-library
- Deleted 5 stale branches on work-squared (salvage-628-items, alexandria-product,
  conan-launch, conan-briefing, rename-constellation-to-briefing)

## Phase 3: Restructure as Claude Code plugin — DONE (PR #1)

- Added `.claude-plugin/plugin.json` manifest (v0.1.0)
- Moved agents/skills from `.claude/` to plugin root
- Removed shell scripts (init.sh, validate.sh) and test suite
- `claude plugin validate` passes clean
- Updated README and CLAUDE.md for plugin workflow

---

## Phase 4: Wizard skill implementation — NEXT PR

The wizard is the library initialization flow. Design is complete (phases 1-6 locked in
`docs/wizard/`), implementation (phase 7) is not started.

Build a `skills/wizard/SKILL.md` that:
- Walks user through the 3 questions (AI mode, novelty, complexity)
- Applies engine logic from `docs/wizard/wizard-engine.yaml`
- Produces a prioritized seeding plan (tiered list of 22 knowledge areas)
- Scaffolds the `docs/alexandria/` folder structure
- Writes the seeding plan where Conan/Sam can reference it

The templates in `templates/` (reference.md, library-readme.md, etc.) are the raw materials
the wizard uses when scaffolding.

## Phase 5: Test on a real repo (Hearthfire)

Create a fresh context library in the Hearthfire repo to validate the full flow.

- [ ] Install plugin in Hearthfire repo
- [ ] Run wizard to configure and scaffold the library
- [ ] Add source material (product docs, design docs, etc.)
- [ ] Run Conan: source assessment, inventory, health check
- [ ] Run Sam: build initial cards from inventory
- [ ] Run Conan: grade, recommend, spot-check
- [ ] Validate the context library is usable (run a context briefing)

## Phase 6: Connect to the software factory

Once Hearthfire has a working context library, wire it into the factory.

- [ ] Have the context library emit work orders (from Conan's recommendations)
- [ ] Set up the software factory on Hearthfire
- [ ] Factory picks up work orders and executes them
- [ ] Validate the loop: library identifies gaps → factory fills them → library grades results

---

## Status (2026-03-19)

- **PR #1** (`plugin-restructure`): Phases 1-3 complete. Plugin validates clean. Ready to merge.
- **Next:** Phase 4 (wizard skill) as a new PR.
- **After that:** Phase 5 (Hearthfire test) — Danvers can run this once wizard is built.
