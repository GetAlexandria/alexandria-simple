---
# Alexandria Lexicon — the recursion case
---

# Alexandria Lexicon

The recursion case. Worked output of running Vocabulary on Alexandria itself, extracted from the 208-card library at `docs/alexandria/library/`. This Lexicon documents what Alexandria *actually calls things* — not invented vocabulary, but the names already in use across 208 cards, 2,174 edges, and 18 type-typed subfolders.

The recursion check: does the 10-category framework explain Alexandria's existing structure? Answer below — cleanly where it does, honestly where it doesn't.

## Folder structure

```
alexandria/
├── README.md                   (this file)
├── _signature/
│   └── Standard - Alexandria Nomenclature Signature.md
├── roles/          (Director, Maintainer, Raven, Conan, Sam, Bridget, Solomon — 7 stubs)
├── entities/       (Card, Territory, Subfolder, Wikilink, Brief, Plan, Skill, Template, Component — 9 stubs)
├── surfaces/       (Library, Playbook, Info Hub, Ledger, Canvas, Card Repository, Assembly Workspace — 7 stubs)
├── capabilities/   (Banking, Atomization, Grading, Linting, Briefing, Card Building, Health Check, Source Assessment, Inventory, Cascade Analysis, Surgery, Implementation Planning — 12 stubs)
├── systems/        (Knowledge Graph, Quality Grading Engine, Wizard Configuration Engine, Retrieval and Assembly Engine, Gap Analysis Engine, Codebase Scanner, DAG Engine, Eval Harness, Signal Queue, Feedback Queue, Provenance Log — 11 stubs)
├── domains/        (Library Interior, Library Boundary — 2 stubs)
├── patterns/       (Daily Engagement Loop, Nightly Factory Shipment, Library Genesis to Steady-State, Save → React, Alignment Sweep, Strategy Cascade, Coverage Momentum — 7 stubs)
└── economy/        (Plan, Context Window — 2 stubs)
```

57 stubs + 1 signature card = 58 files. (Rationale and Research remain owner-supplied per the convention — no stubs for Principles, Standards, Product Theses, or Research cards.)

## Recursion proof: how the 10-category framework maps to Alexandria's library subfolders

| Library subfolder | 10-category mapping | Notes |
|---|---|---|
| `product/agents/` | **Roles** | Five named agents. Maps cleanly to Roles. |
| `product/primitives/` | **Entities** (atomic) | Card is the only primitive; maps cleanly. |
| `product/components/` | **Entities** (composed) | WHAT Section, WHERE Section, Gap Manifest, Task Frame — named parts of larger structures. |
| `product/artifacts/` | **Entities** (outputs) | Decision records, Lesson cards, Anti-Pattern cards — output artifacts. Also a light Research flavor. |
| `product/capabilities/` | **Capabilities** | All gerund-named. Maps cleanly. |
| `product/systems/` | **Mechanisms** | All "<Domain> Engine" or equivalent. Maps cleanly. |
| `product/sections/` | **Surfaces** | Assembly Workspace, Card Repository, Source Material, Rationale Layer, Feedback Workspace. Maps to Surfaces with the note that "Section" is Alexandria's term for what other products call "Surface" or "View." |
| `product/domains/` | **Domains** | Library Interior, Library Boundary. Maps cleanly. |
| `product/templates/` | **Entities** (reusable shapes) | Card, Context Briefing, Implementation Plan templates. Maps cleanly as Entity subtype. |
| `product/governance/` | **Mechanisms or Rationale** | Agent Capability Matrix — it is a constraint table governing agent behavior. Could be Systems (mechanism) or Rationale (governance). **Flag: ambiguous.** The framework has no "Governance" category; Alexandria invented one. Lean Mechanisms here since it is a runtime constraint, not a why-claim. |
| `experience/experience-goals/` | **Rationale** | Quality aspirations (Cumulative Not Sisyphean, Legible Graph, etc.). Owner-supplied flavor of Rationale — the *experience* framing is stronger than in any exemplar. **Flag: no exemplar has an Experience Goals category.** |
| `experience/loops/` | **Patterns** | Repeating cycles: Nightly Factory Shipment, Alignment Sweep, Strategy Cascade, etc. Maps to Patterns. |
| `experience/journeys/` | **Patterns** | Multi-phase progressions: Library Genesis to Steady-State, Conversational Mastery Arc. Maps to Patterns. |
| `experience/forces/` | **Patterns or Rationale** | Coverage Momentum, Quality Ratchet — emergent cross-system behaviors. **Flag: "Force" is a design-thinking term (Christensen / design forces) that doesn't map to any of the 10 categories cleanly.** Best fit: Patterns (they describe recurring system dynamics). Rationale fit is weaker (they don't explain why the product was built). |
| `rationale/principles/` | **Rationale** | Owner-supplied. Maps cleanly. |
| `rationale/standards/` | **Rationale** | Governance flavor of Rationale. Maps cleanly. |
| `rationale/product-theses/` | **Rationale** | Owner-supplied. Maps cleanly. |
| `temporal/root/` | **Patterns or Research** | A single decision record living in the temporal territory. **Flag: the "temporal" territory has no good mapping in the 10-category framework.** Decision records are Research-flavored (what we found, what we decided) but are banked as product artifacts rather than owner-supplied research notes. |

## Framework seams (honest)

**Where the framework cleanly maps (10 of 18 subfolders):**
`product/agents/`, `product/primitives/`, `product/components/`, `product/capabilities/`, `product/systems/`, `product/domains/`, `product/templates/`, `rationale/principles/`, `rationale/standards/`, `rationale/product-theses/`

**Where Alexandria stresses the framework:**

1. **`product/governance/`** — The 10-category framework has no Governance category. Alexandria created it for the Agent Capability Matrix, which is a runtime constraint governing agent exclusivity. Closest fit is Mechanisms (it constrains behavior at runtime). Governance as a named category is a product-specific invention.

2. **`experience/experience-goals/`** — No exemplar has an Experience Goals category. Alexandria separates "how the experience should feel" from both Rationale (why we built it) and Patterns (what repeats). This is a genuine product-specific contribution — a quality-aspiration layer that sits between Vision and implementation. The framework could accommodate it as owner-supplied Rationale, but the "experience" framing is distinctive enough that it arguably deserves its own slot.

3. **`experience/forces/`** — "Force" is borrowed from design thinking, not from any of the 10 categories. Coverage Momentum and Quality Ratchet are emergent system dynamics — neither owner-supplied Rationale nor designer-specified Patterns. They describe how systems behave under real use. Best fit: Patterns (a dynamic that recurs). But the fit is loose; these are closer to "emergence notes" than designed recurring structures.

4. **`temporal/`** — The fourth territory in Alexandria's library is time-indexed. The 10-category framework is atemporal — categories describe *what a concept is*, not *when it was created*. Alexandria's temporal territory is a pending-classification staging area, not a category of its own. Cards here are waiting to be absorbed into the other territories. The framework has no equivalent.

5. **`product/artifacts/`** — Alexandria's Artifact type spans Decision records, Lesson cards, Anti-Pattern cards, Competitive Landscape analyses, and Market Evidence. This mixes Research (what we found), Rationale (what we decided), and Knowledge (patterns to avoid). The framework would split these: Decision/Lesson cards → Rationale; Market Evidence/Competitive Landscape → Research; Anti-Patterns → Rationale. Alexandria banks them all as Artifacts because they are all *outputs* of product thinking, not type-specific claims. This is a pragmatic umbrella the framework would tighten.

6. **Unified user+engineer corpus** — Alexandria's most structurally distinctive trait: the same named agent team (Raven, Conan, Sam, Bridget, Solomon) is visible to both maintainers (engineers building Alexandria) and end users (directors using Alexandria). Every exemplar surveyed has a strict engine-vs-content split: Unity vocabulary is disjoint from per-game vocabulary; LangChain's framework vocabulary is disjoint from agents built on it. Alexandria deliberately collapses this. The Roles category captures this (both Director and Maintainer appear as human roles), but the framework's "engine-vs-content split" diagnostic would flag this as a potential bleed risk. Alexandria's position: the collapse is intentional — the framework is the product, and exposing it is the bet.

## Subfolder taxonomy (subcategory tags)

The wiki view renders these subcategories as virtual subfolders:

- **roles/** — Human (Director, Maintainer); Agentic / Front-of-house (Raven); Agentic / Back-of-house (Conan, Sam, Bridget, Solomon — transitioning to Plays in the Playbook)
- **entities/** — primitive (Card, Territory, Subfolder, Wikilink); composite (Skill, Component); artifact (Brief, Plan); template (Template)
- **capabilities/** — director-action (Banking); play (everything else, callable by either front-of-house agents or humans)
- **patterns/** — loop (Daily Engagement, Nightly Factory, Alignment Sweep); journey (Library Genesis, Strategy Cascade); force (Coverage Momentum); pattern (Save → React)
- **surfaces/, systems/, domains/, economy/** — flat for now

Subcategories determine file paths: a card with `subcategory: [tag1, tag2]` lives at the nested path `<category>/<tag1>/<tag2>/<file>.md`. The filesystem tree above is the canonical directory structure; frontmatter `subcategory:` tags and the actual file paths stay in sync.

## Note: Economy density

Alexandria is unusually thin in Economy. The product is not seat-priced, not token-priced to the user (tokens are an infrastructure cost, not a user noun), and has no gamified resource economy. The only Economy-relevant concepts are Anthropic's pricing tiers (Plan) and the Context Window as a constrained resource. This thinness is expected for a developer-tool / agentic-software product per `families.md` — Economy is the quietest category in this family.
