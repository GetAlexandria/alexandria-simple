---
type: Entity
prefLabel: Block
altLabels:
  - Content Block
  - Block type
category: [Entities]
subcategory: [primitive]
user_visible: true
status: stub
proposed_by: raven
source_evidence:
  - https://www.notion.com/help/what-is-a-block
  - https://developers.notion.com/reference/block
---

# Block

## WHAT: Definition

_Stub — the atomic content unit. Everything visible on a [[Entity - Page]] is a Block: paragraph text, headings (H1/H2/H3), images, videos, files, embeds, code snippets, bulleted and numbered lists, toggles, callouts, dividers, tables, databases (inline), and sub-page references are all Blocks. Users create Blocks via the "/" menu (the slash command), and every Block can be independently selected, moved (via drag handle), duplicated, deleted, and transformed to a different Block type._

_Block is the canonical working MDA-inversion survivor in the `families.md` universal cross-cut section. The noun comes directly from Notion's front-end implementation — a Block is a React node in the document tree. This is textbook mechanism-naming and would ordinarily be a violation of the MDA rule: mechanism-named nouns that leak to user-facing surfaces require permanent prose to explain. Block survived and became a successful user-facing noun for one reason: users genuinely see and feel the discrete bordered visual unit when they hover or click. The drag handle appears, a blue border highlights the unit, and the Block is visually legible as a separate thing. The mechanism IS the aesthetic — the React node's visual boundary IS the user's experience of the concept. This is the strict exception condition for mechanism-naming: the internal object must be aesthetically visible as exactly itself during the user's moment of use. Block clears this test; most mechanism nouns do not. No other family produces a clean example of this exception; it is Notion-specific._

## WHERE: Ecosystem

_Stub — links to: [[Entity - Page]] (Pages are composed of Blocks), [[System - Block Tree]] (the AST-style structure of all Blocks in a Page), [[Entity - Database]] (a Database is a Block type; inline databases render as Blocks within a Page), [[Entity - Template]] (Templates are reusable Block or Page arrangements), [[Economy-instance - Block Limit]] (Free-tier constraint on total Block count)._

## WHY: Rationale

_Stub — owner-supplied._

## WHEN: Timeline

_Stub._

## HOW: Specification

_Stub — to be enriched with: the full Block type taxonomy (basic, media, database, advanced, embeds), the "/" menu invocation gesture, the Block transformation rules (convert paragraph to heading, etc.), the turn-into menu, the Block API object shape, and the Block Limit counting rules (what counts as one Block vs many)._
