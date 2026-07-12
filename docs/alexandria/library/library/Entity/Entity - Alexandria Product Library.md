---
plane: product
status: confirmed
confidence: high
altitude: pillar
altLabels:
  - context library
  - product library
evidence:
  - packages/ax/src/domain/library-catalog.ts
links:
  contains:
    - Entity - Atomic Card
    - Entity - Thread
  operates_on:
    - Entity - Source
  produces:
    - Entity - Atomic Card
  relegates:
    - Entity - Cards
  related_to:
    - Domain - Playmaker's Studio Library
    - Capability - Source Scan
    - Capability - Vision Drafting
    - Surface - Inbox
    - Capability - Source Assessment
    - Capability - Source Conversion
    - Entity - Frozen Source of Truth
    - Capability - Front-of-House Walk
    - Entity - Walk Turn
    - Entity - Section
    - Entity - Bundle Patch
    - Mechanism - Draft Overlay
    - Mechanism - Confirmation Gate
    - Capability - Library Confirmation
    - Entity - Plane
    - Entity - Knowledge Bank Area
    - Capability - Atomize
    - Entity - Atomic Card Category
    - Capability - Studio Operation
    - Principle - Director Ruling
    - Pattern - Updating the Library
    - Surface - Builder
---

## WHAT

The knowledge store — company knowledge made atomic and organized into cards
so agents and humans can use it. One of the two innovations at the heart of
the product. Each division or business unit has its own library with three
planes: the work of that division, strategy, and learning; the Company
Library is the planned federation of all division libraries. The first
library being built is Product — describing Alexandria itself. An older,
larger library remains as a legacy reference for QA until this build
supersedes it; the Playmaker's Studio Library belongs to a separate
product.

## WHY

One always-current store of company knowledge beating scattered, stale
tools is the wager the whole library rides on,
[[Bet - Library as Living Source of Truth]]; each pass through it must
deposit durable value, [[Principle - Cumulative, Not Sisyphean]].

## WHERE

The library catalog data structure; the workspace library root; eleven
library modes split across two viewer sections — six for browsing the
current library (Index, Catalog, Workflow, Engine, Folders, Constellation)
and five for building it ([[Surface - Builder]]: Back, Drafts, Notepad,
Confirm, Legacy reference).

## HOW

The library is built by walking the [[Pattern - Updating the Library]]:
raw material worked into filed knowledge, held open to review. A
[[Capability - Source Scan]] produces the draft library's stub cards
and open questions, while a
[[Capability - Vision Drafting]] co-authors the onboarding Vision with
the director. Material lands as an
[[Entity - Source]] in the [[Surface - Inbox]] until a
[[Capability - Source Assessment]] clears its pending state; a
[[Capability - Source Conversion]] works it toward freeze, the frozen
output tracked under the retired name [[Entity - Frozen Source of Truth]].
Then the [[Capability - Front-of-House Walk]]
refines the draft: each recorded [[Entity - Walk Turn]] and
[[Entity - Section]] check produces a validated
[[Entity - Bundle Patch]]. Patches append to the
[[Mechanism - Draft Overlay]]'s log, tracking every
[[Entity - Atomic Card]] entry and open [[Entity - Thread]] without
touching the frozen base. Every entry carries one of the three
[[Entity - Plane]] bands. The
[[Mechanism - Confirmation Gate]] is the last gate; a
[[Capability - Library Confirmation]] records the director's verdict,
sending rejections back. Alongside it, parked prototyping machinery:
an [[Entity - Knowledge Bank Area]] reaches ready for
atomization, and a [[Capability - Atomize]] drafts and publishes each
[[Entity - Atomic Card]], filed under one
[[Entity - Atomic Card Category]] bucket; a
[[Capability - Studio Operation]] captures, deprecates, or quarantines
it, citing the [[Principle - Director Ruling]] it answers. The library
root declares its card-format contract — current, or legacy kept for
QA against the retiring 208-card library — and relates to the
federated [[Domain - Playmaker's Studio Library]] pointer. This whole
pipeline is one running instance of the product's continuous
[[Pattern - Updating the Library]], new material arriving and worked
toward finished knowledge, again and again.
