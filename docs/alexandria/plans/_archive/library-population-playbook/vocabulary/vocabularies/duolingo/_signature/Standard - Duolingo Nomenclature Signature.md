---
type: Standard
prefLabel: Duolingo Nomenclature Signature
altLabels: []
category: [Rationale]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://blog.duolingo.com
  - https://duolingo.com
---

# Duolingo Nomenclature Signature

## WHAT: Definition

The naming style this product commits to. New nouns proposed by Sam, Raven, or any maintainer get linted against this signature; violations require a deliberate override.

The signature has six rules, inferred from Duolingo's existing public vocabulary:

1. **Short concrete English nouns named for the felt experience.** Streak, Heart, Gem, Crown, League, Path, Quest. The user's emotional encounter with the concept names the concept. This is the opposite pole from Stripe's `PaymentIntent` or Linear's `WorkflowState` — no mechanism leaks, no state-machine names, no data-model terms.
2. **Compounds are two plain words, never CamelCased.** Streak Freeze, Practice Hub, Diamond Tournament. Not `StreakFreeze`. Not `PracticeHub`. The two-word form is the canonical written form everywhere the product uses it.
3. **Tiered things get gemstone names — a closed metaphor family.** Bronze → Silver → Gold → Sapphire → Ruby → Emerald → Amethyst → Pearl → Obsidian → Diamond. This is a *family* signature: once one tier is named in a gemstone, all peers must be. Adding a tier means picking the next gemstone; breaking out of the family (e.g., naming a tier "Platinum" or "Champion") violates the signature.
4. **Subscriptions get power-word suffixes.** Super, Max. Brief, declarative, unadorned. Not "Duolingo Plus," not "Duolingo Premium Pro." The suffix IS the product name.
5. **Almost nothing is invented vocabulary.** "Lingot" was the one major exception and was retired in favor of "Gems" — see [[Deprecation - Lingot]]. Branded mascot-adjacent terms are reserved for entertainment surfaces (DuoRadio, Video Call with Lily) where the named character IS the surface.
6. **Pedagogy vocabulary is borrowed from textbooks, not invented.** Unit, Section, Lesson — these came from classroom convention, kept deliberately so learners recognize them without onboarding. The borrowing is intentional: recognizability over novelty.

This signature places Duolingo close to the Hearthfire-shape that `families.md` identifies as the right approach for gamified-life-OS products. The MDA inversion rule ("name from aesthetics first, not mechanics") is lived practice here — Streak beats `habit_completion_count`, Hearts beats `error_tolerance_budget`, Gems beats `virtual_currency_balance`. By contrast, Stripe's mechanism-naming (`PaymentIntent`, `SetupIntent`, `PaymentMethod`) produces nouns that require documentation to decode. Duolingo's nouns are self-explaining. Any director building a life-OS product (Hearthfire explicitly included) should treat this signature as the reference shape: felt encounter → plain noun, no invented terminology, closed tier families.

## WHERE: Ecosystem

_Stub — links to the Standard for Five-Dimension Card Requirements, the Principle for One Concept Per Card, and every card type in this library that the signature constrains. Filled when the library structure is fully banked._

## WHY: Rationale

_Stub — owner-supplied. Vision module will bank the claim that anchors why this signature matters; this section then links to that Vision card._

## WHEN: Timeline

_Stub — stamped at bank time with date Vocabulary module was run. Re-banked when the signature is updated (drift detected during lint or director-initiated)._

## HOW: Specification

_Stub — to be enriched with: the lint rule format (regex / classifier hints), the override gesture (who approves a signature violation), the deprecation path for retired nouns, and worked examples of named-correctly vs flagged-for-rename._
