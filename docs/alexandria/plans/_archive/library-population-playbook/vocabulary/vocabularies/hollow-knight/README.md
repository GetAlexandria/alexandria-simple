# The Hollow Knight Lexicon — worked example

The Hollow Knight Lexicon — the worked example of what Vocabulary would emit for Team Cherry's Metroidvania. A Lexicon is: the library shell (folder structure) + N stub cards (the inventory) + the Nomenclature Signature (style guide). Together they're the named-inventory of what's in this product, with the rules for naming new things.

## Hollow Knight's distinguishing contribution

This Lexicon is the canonical case study of Metroidvania vocabulary discipline. Every noun a player encounters in Hollow Knight was designed from the *felt experience first* — Charm, Bench, Stag, Vessel, Knight, Soul, Geo, Mask, Crossroads, Greenpath — and the engine vocabulary (Unity Component, GameObject, Prefab, Mesh) is *invisible* to the player. This is the engine-vs-content split from `families.md`, enforced strictly and beautifully.

Hollow Knight is families.md's archetype of MDA-from-aesthetics-inward. Hunicke's MDA framework says players meet aesthetics; designers reason mechanics. Team Cherry's nouns live entirely on the aesthetic side: a player who sits at a Bench to save does not feel they are calling a `CheckpointWrite()` function — they feel rest. A player who spends Geo does not feel they are decrementing a `currency_balance` field — they feel transaction. The mechanic is inhabited by the metaphor. This Lexicon documents what that commitment looks like at the full vocabulary layer.

Two uses:

1. **Agent reference.** When Raven (or future maintainer-side agents) needs to see what a Metroidvania's player-encounter vocabulary actually outputs, point here. The Hollow Knight Lexicon is the contrast pole to Duolingo — spatial surfaces vs temporal/social surfaces; world-traversal as the core loop vs daily-return as the core loop; retroactive-unlock Patterns vs spaced-repetition Patterns.
2. **Director template.** When a director is building something Metroidvania-shaped (or any exploration-gated game), the module can offer this whole shell as a starting frame: "Want to start from Hollow Knight's worked vocabulary? You'll get these 9 folders and these stubs; rename, drop, add as you go."

## Folder structure

```
hollow-knight/
├── _signature/
│   └── Standard - Hollow Knight Nomenclature Signature.md
├── roles/     (Knight, Boss, NPC — 3 stubs)
├── entities/  (Charm, Mask, Mask Shard, Vessel Fragment, Geo, Soul, Pale Ore, Map, Quill, Grub — 10 stubs)
├── surfaces/  (World, Map, Inventory, Charm Screen, Dialogue — 5 stubs)
├── domains/   (Forgotten Crossroads, Greenpath, City of Tears, Deepnest, White Palace — 5 stubs)
├── capabilities/  (Dashing, Wall-Jumping, Soul Gathering, Healing, Casting Spells, Map Updating — 6 stubs)
├── systems/   (Charm Notch System, Soul Economy, Bench Save, Stag Fast Travel — 4 stubs)
├── patterns/  (Retroactive Unlock, Lock-and-Key Gating, State-Capture-With-Cost, Boss Phase, Shade Recovery — 5 stubs)
└── economy/   (Geo, Soul, Mask, Charm Notch, Rarity — 5 stubs)
```

43 stubs + 1 signature card = 44 files. Some concepts are genuine multi-category facet pairs (Geo as Entity + Economy; Soul as Entity + Economy; Mask as Entity + Economy) — the card lives in its primary-category folder (`category: [<primary>]`), and secondary categories are declared in `facets: [<secondary>]`.

## Subfolder taxonomy (subcategory tags)

The wiki view renders these subcategories as virtual subfolders:

- **roles/** — hero (Knight); villain (Boss); npc (NPC)
- **entities/** — item (Charm, Vessel Fragment, Pale Ore, Quill); currency (Geo, Soul); health-resource (Mask, Mask Shard); map-artifact (Map); collectible (Grub)
- **surfaces/** — world-display (World); menu (Map, Inventory, Charm Screen); dialogue (Dialogue)
- **capabilities/** — movement (Dashing, Wall-Jumping); combat (Casting Spells); resource (Soul Gathering, Healing, Map Updating)
- **patterns/** — genre-defining (Retroactive Unlock, Lock-and-Key Gating); mechanic (State-Capture-With-Cost, Boss Phase, Shade Recovery)
- **economy/** — currency (Geo, Soul); health-resource (Mask); slot (Charm Notch); classification (Rarity)
- **systems/, domains/** — flat for now

Subcategories determine file paths: a card with `subcategory: [tag1, tag2]` lives at the nested path `<category>/<tag1>/<tag2>/<file>.md`. The filesystem tree above is the canonical directory structure; frontmatter `subcategory:` tags and the actual file paths stay in sync.

## Stub frontmatter shape

Vocabulary banks stubs with the identity layer populated. Later modules (Vision banks a claim; Sam writes the WHAT/WHERE/WHY/WHEN/HOW; Conan grades) fill the body content. Frontmatter the module produces at bank time:

```yaml
---
type: <one of: Role | Entity | Surface | Capability | System | Pattern | Economy-instance | Standard>
prefLabel: <canonical name>
altLabels: [<other names used for the same concept>]
category: [<primary>]          # single value — drives the file path
subcategory: [<tag>, ...]      # drives view-time grouping; [] if no sub-tags
facets: [<other-category>, ...] # optional — only for genuine multi-category concepts
user_visible: <true | false — drives the MDA-inversion guard>
status: stub
proposed_by: <raven | director>
source_evidence: [<URLs or paths where the term was observed>]
---
```

The 10 universal categories: Rationale · Research · Roles · Domains · Surfaces · Entities · Capabilities · Mechanisms · Patterns · Economy.

Body has the five Alexandria dimension sections (WHAT / WHERE / WHY / WHEN / HOW) present-but-stubbed so later modules know where to write.

## Contrast with Duolingo

Both Lexicons share dense Economy and Patterns coverage — Hollow Knight's economy (Geo, Soul, Mask, Charm Notch) is as closed-loop and conversion-tracked as Duolingo's (XP, Gems, Hearts, Streak). But the Surfaces and Domains categories diverge sharply:

- **Duolingo surfaces are temporal and social** — Home (Path), Leaderboard, Shop, Practice Hub. They are named by what the user *does* at that moment in time (learn, compete, shop, practice).
- **Hollow Knight surfaces and domains are spatial** — World, Map, Inventory, Charm Screen, and then five named world areas (Forgotten Crossroads, Greenpath, City of Tears, Deepnest, White Palace). They are named by where the player *is* or what physical layer of the interface they inhabit.

This spatial-vs-temporal distinction is the Metroidvania signature. The world is the product; traversing it IS the design. Directors building exploration-gated or spatial-progress games should treat Hollow Knight's Domains category as load-bearing — as load-bearing as Duolingo's Patterns category is for daily-return games.

## What's NOT here

Rationale and Research cards. Per the cross-cut finding in `families.md`, those two categories are owner-supplied — they describe why-this-product-exists and what-we-found, both of which come from the director's own product work (Vision, Bets, Guardrails, User Research modules), not from any exemplar's docs. The Vocabulary module surfaces these category folders but doesn't pre-populate them.

Also absent: engine-layer vocabulary. Unity's Component, GameObject, Prefab, Mesh, Animator, Rigidbody, Collider, ScriptableObject — all real and real-to-Team-Cherry during development — are deliberately excluded. This Lexicon documents only the player-encounter layer. The engine-vs-content split is architectural; the two layers have disjoint vocabularies; the player never sees the engine layer.
