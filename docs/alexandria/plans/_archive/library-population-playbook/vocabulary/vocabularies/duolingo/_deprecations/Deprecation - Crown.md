---
type: Deprecation
prefLabel: Crown
replaced_by: Path (progress display)
deprecation_date: ~2022
reason: Crown was a per-skill mastery tier (level 1-5 per Skill); the redesigned learning path collapsed crown progression into linear node-completion in the Path UI. Mastery moved from per-Skill counters to overall course progress.
migration_note: The Path redesign (2022) replaced the Skill Tree + Crown system with a linearized node sequence; per-skill crown levels were retired in favor of path-node completion state.
status: deprecated
source_evidence:
  - https://blog.duolingo.com/new-duolingo-home-screen-design/
---

# Deprecation - Crown

## WHAT (the tombstone)

_The per-skill mastery tier system Duolingo used before the Path redesign. Each Skill had five Crown levels (1–5); Learners earned Crowns by completing a Skill's lessons repeatedly at increasing difficulty. Retired approximately 2022 when the home screen redesigned from a Skill Tree to a linearized Path. The Path's node-completion model replaced Crown progression as the primary measure of course progress._

_Per the families.md finding "deprecation as prose, not metadata" — the transition surfaced through Duolingo blog posts and forum announcements, not through a formal migration API. If you encounter "Crown" in older Duolingo documentation, third-party integrations, or community guides, it refers to this retired per-skill mastery tier — not to the current Path node system._

## Active replacement

[[Entity - Path]] — the current progress-display model, whose node-completion states replaced Crown levels.
