---
type: Surface
prefLabel: "Agent Bench"
altLabels: ["agent bench", "AgentBench", "the bench", "seats"]
category: [Surfaces]
subcategory: [roster, team, chrome]
context: viewer
altitude: component
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/app/agents/AgentBench.tsx
  - packages/viewer/src/app/agents/agent-bench.fixtures.ts
---

## NOTE — retyped

Re-typed from `System` to `Surface`: the bench is chrome (an agent picker tray
that renders the available agents). The roster it shows is just the *set of
Agent aggregates* — there is no separate "bench entity" in the data model.

## WHAT
_Stub —_ The five-seat team of specialized agents that staff a product: Engineering, Design, Product, Market, Research — with Product (Raven) unlocked and the rest locked at scan time. A picker/tray, not its own noun.

## WHERE
_Stub —_ Rendered as a bench/tray of agent coins in [[Surface - Viewer Shell]]; seats map to product disciplines; [[Agent - Raven]] fills Product.

## WHY
_Stub —_ The "five specialized agents" framing is the product's headline (plugin.json); why these five disciplines, and which ship next, is NOT in code (only Raven + Damien exist).

## WHEN
_Stub —_ Visible whenever choosing or invoking an agent.

## HOW
_Stub —_ Seats list {id, role, locked, name?}; only the Product seat is unlocked; coins show lit/unlit + activated states.
