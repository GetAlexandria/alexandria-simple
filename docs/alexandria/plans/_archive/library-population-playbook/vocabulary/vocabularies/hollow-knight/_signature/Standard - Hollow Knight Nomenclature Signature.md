---
type: Standard
prefLabel: Hollow Knight Nomenclature Signature
altLabels: []
category: [Rationale]
subcategory: []
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://www.hollowknight.com
  - https://hollowknight.wiki/w/Hollow_Knight_Wiki
  - https://www.teamcherry.com.au
---

# Hollow Knight Nomenclature Signature

## WHAT: Definition

The naming style Team Cherry commits to in Hollow Knight. New nouns proposed by Sam, Raven, or any maintainer get linted against this signature; violations require a deliberate override.

The signature has six rules, inferred from Hollow Knight's existing player-encounter vocabulary:

1. **Short evocative English, often archaic or folk-fantasy flavored.** Charm, Bench, Stag, Vessel, Knight, Soul, Geo, Mask, Crossroads, Greenpath. The words are drawn from old English registers — the kind that feel like they belong in a hand-lettered bestiary or illuminated manuscript. They are never technical, never numeric, never invented beyond their folk-fantasy heritage.
2. **Currencies and stats use short metaphor-rich names, never numbers as nouns.** Geo (not "currency"); Soul (not "magic points" or "mana"); Mask (not "HP unit" or "health point"). Each name carries its own mythology — Geo as recovered coin of a lost civilization, Soul as something extracted from the living and gathered by violence, Mask as both literal protective shell and the character's visible face.
3. **Places are evocative compound names.** "City of Tears," "Forgotten Crossroads," "Resting Grounds," "Howling Cliffs," "Kingdom's Edge" — the world's *poetic register* is set by these names. The place-naming pattern is: [state or feeling or history] + [physical descriptor]. The result is a name that tells you what happened here, not what you can do here.
4. **Mechanics get inhabited metaphors.** "Sitting at a Bench" replaces "saving the game"; "Stag Station" replaces "fast travel point"; "Focus" replaces "spend resource to heal"; "Sharp Shadow" replaces "dash-damage buff charm." Every mechanic is clothed in a world-image. The player inhabits the metaphor, not the mechanism.
5. **Engine vocabulary (Unity Component, GameObject, Prefab, Mesh, Animator, Rigidbody, Collider) is suppressed entirely.** Players never see these terms. This is the *engine-vs-content split* from `families.md`, enforced strictly. Team Cherry speaks two languages — engine-side (Unity) and player-side (folk-fantasy) — and the boundary between them is absolute in all player-facing surfaces.
6. **NPCs are characters with names, not categories.** Quirrel, Cornifer, Iselda, Sly, Salubra, Hornet, Zote — not "Merchant NPC," "Map NPC," "Lore NPC." Each named character is the canonical word for their role. There is no generic word for "the NPC that sells maps" — there is Cornifer, and Cornifer is specific.

Hollow Knight is families.md's archetype of MDA-from-aesthetics-inward. Every noun a player encounters was designed from the *felt experience first*, then back-filled with mechanics. Team Cherry did not name a mechanic and then dress it up; they felt what it should be like to rest, to gather power from enemies, to be guided by a mossy cartographer, to break through a crumbling wall that had been blocking you for hours — and they named from that feeling. "Retroactive unlock" is what designers call it; "Mantis Claw" is what players know. The signature is the enforcement mechanism for that inversion. Raven running this Lexicon against any new noun should ask: *"Does this name describe what the player feels, or what the engine does?"* The former passes. The latter fails and returns for renaming.

## WHERE: Ecosystem

_Stub — links to the Standard for Five-Dimension Card Requirements, the Principle for One Concept Per Card, and every card type in this library that the signature constrains. Filled when the library structure is fully banked._

## WHY: Rationale

_Stub — owner-supplied. Vision module will bank the claim that anchors why this signature matters; this section then links to that Vision card._

## WHEN: Timeline

_Stub — stamped at bank time with date Vocabulary module was run. Re-banked when the signature is updated (drift detected during lint or director-initiated)._

## HOW: Specification

_Stub — to be enriched with: the lint rule format (folk-fantasy test, mechanism-leak test, NPC-as-category test), the override gesture (who approves a signature violation), and worked examples of named-correctly vs flagged-for-rename (e.g., "Charm" passes; "EquipmentSlotItem" fails; "Notch" passes; "ChargeUnit" fails)._
