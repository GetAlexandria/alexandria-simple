# Duolingo — worked vocabulary output

The library shell + stub cards that the Vocabulary module would produce if Duolingo's product owner ran it against duolingo.com.

This is what good output looks like for a gamified-life-OS product. Two uses:

1. **Agent reference.** When Raven (or future maintainer-side agents) needs to see what a consumer-facing gamified-learning vocabulary actually outputs, point here.
2. **Director template.** When a director is building something Duolingo-shaped, the module can offer this whole shell as a starting frame: "Want to start from Duolingo's worked vocabulary? You'll get these 9 folders and these stubs; rename, drop, add as you go."

## Folder structure

```
duolingo/
├── _signature/
│   └── Standard - Duolingo Nomenclature Signature.md
├── _deprecations/
│   ├── Deprecation - Lingot.md
│   └── Deprecation - Crown.md
├── roles/
│   ├── Role - Learner.md
│   ├── Role - Friend.md
│   ├── Role - Family Plan Member.md
│   └── Role - Lily.md
├── entities/
│   ├── Entity - Course.md
│   ├── Entity - Section.md
│   ├── Entity - Unit.md
│   ├── Entity - Lesson.md
│   ├── Entity - Path.md
│   ├── Entity - Story.md
│   ├── Entity - DuoRadio.md
│   └── Entity - Quest.md
├── surfaces/
│   ├── Surface - Home.md
│   ├── Surface - Profile.md
│   ├── Surface - Leaderboard.md
│   ├── Surface - Shop.md
│   └── Surface - Practice Hub.md
├── capabilities/
│   ├── Capability - Completing a Lesson.md
│   ├── Capability - Practicing.md
│   ├── Capability - Listening.md
│   └── Capability - Speaking.md
├── systems/
│   ├── System - XP System.md
│   ├── System - Streak Engine.md
│   └── System - Heart Regeneration.md
├── patterns/
│   ├── Pattern - Daily Engagement Loop.md
│   ├── Pattern - Weekly League Cycle.md
│   ├── Pattern - Streak Recovery.md
│   └── Pattern - Spaced Repetition.md
└── economy/
    ├── Economy-instance - XP.md
    ├── Economy-instance - Gems.md
    ├── Economy-instance - Hearts.md
    ├── Economy-instance - Streak.md
    ├── Economy-instance - Streak Freeze.md
    ├── Economy-instance - League.md
    └── Economy-instance - Super.md
```

This v1 sample covers the core Duolingo vocabulary surface. Full Duolingo expands to additional stubs covering the complete product (Achievement, Avatar, Notification, Goal, Placement Test, XP Boost, Diamond Tournament, Duo the mascot, Zari, Vikram, Video Call with Lily, DuoRadio episodes, etc.).

## Subfolder taxonomy (subcategory tags)

The wiki view renders these subcategories as virtual subfolders:

- **roles/** — learner (Learner); social (Friend); subscription (Family Plan Member); character (Lily)
- **entities/** — pedagogy-unit (Course, Section, Unit, Lesson, Path); content (Story, DuoRadio); goal (Quest)
- **surfaces/** — home (Home, Profile); social (Leaderboard); commerce (Shop); premium (Practice Hub)
- **capabilities/** — atomic-action (Completing a Lesson, Practicing); modality (Listening, Speaking)
- **patterns/** — loop (Daily Engagement); cycle (Weekly League); recovery (Streak Recovery); pedagogy (Spaced Repetition)
- **economy/** — counter (XP, Streak); currency (Gems); resource (Hearts); meta-resource (Streak Freeze); tier (League); subscription (Super)
- **systems/** — flat for now

Subcategories determine file paths: a card with `subcategory: [tag1, tag2]` lives at the nested path `<category>/<tag1>/<tag2>/<file>.md`. The filesystem tree above is the canonical directory structure; frontmatter `subcategory:` tags and the actual file paths stay in sync.

## Stub frontmatter shape

Vocabulary banks stubs with the identity layer populated. Later modules (Vision banks a claim; Sam writes the WHAT/WHERE/WHY/WHEN/HOW; Conan grades) fill the body content. Frontmatter the module produces at bank time:

```yaml
---
type: <one of: Role | Entity | Surface | Capability | System | Pattern | Economy-instance | Standard>
prefLabel: <canonical name>
altLabels: [<other names used for the same concept>]
category: [<primary>]          # single-valued YAML list; drives the file path
subcategory: [<tags>]          # drives view-time grouping; empty list [] if no sub-tags
facets: [<other-categories>]   # optional; other universal categories the concept genuinely faces into
user_visible: <true | false — drives the MDA-inversion guard>
status: stub
proposed_by: <raven | director>
source_evidence: [<URLs or paths where the term was observed>]
---
```

The 10 universal categories: Rationale · Research · Roles · Domains · Surfaces · Entities · Capabilities · Mechanisms · Patterns · Economy.

**Facets convention.** `category:` is always a single-valued list — the primary category that drives the file path. Genuine facet-concepts declare secondary categories via `facets:` — e.g., Duolingo's `Streak` is `category: [Economy]` with `facets: [Patterns, Entities]`; `League` is `category: [Economy]` with `facets: [Surfaces, Patterns]`. Facets are rare and optional; most concepts omit them.

Body has the five Alexandria dimension sections (WHAT / WHERE / WHY / WHEN / HOW) present-but-stubbed so later modules know where to write.

## What's NOT here

Rationale and Research cards. Per the cross-cut finding in `families.md`, those two categories are owner-supplied — they describe why-this-product-exists and what-we-found, both of which come from the director's own product work (Vision, Bets, Guardrails, User Research modules), not from any exemplar's docs. The Vocabulary module surfaces these category folders but doesn't pre-populate them.

## Note: Economy and Patterns density

This product is exceptionally rich in Economy and Patterns, consistent with the `families.md` "gamified-life-OS" finding. Streak, Gems, Hearts, XP, Streak Freeze, and League are all first-class economy nouns — closed-loop, conversion-tracked, and directly connected to the retention mechanics Duolingo publishes. The Patterns category carries the daily-return loop, the weekly competitive cycle, and spaced repetition, each of which runs as a named, product-owned design decision. Directors building gamified-life-OS products (including Hearthfire) should treat this Economy and Patterns depth as the expected output shape, not as a Duolingo quirk.

This sample also demonstrates the Surfaces category in its dense form. Home (Path), Leaderboard, Shop, Practice Hub, and Profile are all named, A/B-tested, and conversion-tracked surfaces — each with its own documented release history on the Duolingo blog. Directors working in this product family should expect Surfaces to be as rich as Entities, not an afterthought.
