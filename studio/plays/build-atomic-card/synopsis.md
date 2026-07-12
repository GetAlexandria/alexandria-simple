# Synopsis — Build Atomic Card (reverse-derived)

<!--
REVERSE-DERIVED director-facing overview. Sources: the shipped build
(build-atomic-card/workflow.fabro + its inline node prompts) + brief.md
(reverse-engineered). Product / Library Operations, fronted by Raven;
not gated through the studio ladder.
-->

## What it does

Builds **one** Alexandria atomic card from a card contract. A GPT-5.4 agent drafts
the card (WHAT · WHERE · WHY · WHEN · HOW) grounded *only* in the source ranges the
contract cites; mechanical validators check the structure; a second GPT-5.4 agent
grades it against a rubric and the raw source and rules **PUBLISH / REVISE / BAIL**;
the card is revised up to a turn budget, then published — or it bails when the
source can't support it. Every outcome is reported back to the planning play that
called it.

## Reach for it when

- `atomic-card-planning` has an **approved build plan** and needs each `write_new`
  contract turned into a published card — this is its per-card sub-workflow.
- you want to see, card by card, **how source material becomes an atomic card**,
  and where the draft → grade → revise loop publishes, revises, or bails.

## The story

A contract arrives for one concept — say a product mechanism — naming the exact
source byte-ranges that may ground it and the grade bar it must clear. The build
validates the contract, then a drafting agent reads only those ranges and the
existing card library and writes the five sections, mapping the concept's
neighbours as phrased wikilinks and adding nothing the source doesn't support. A
validator checks the shape; a grading agent scores each section against the raw
source and the rubric and rules PUBLISH, REVISE, or BAIL. A revise spends a turn
and hands back specific deficiencies; a publish writes the card into the library; a
bail says, honestly, that the source can't carry this card. Either way it emits a
result the planning play can read.

## Trigger

Called as a **sub-workflow** by `atomic-card-planning`'s `execute_plan`, once per
`write_new` contract — input: the contract path and the revision-turn budget.
