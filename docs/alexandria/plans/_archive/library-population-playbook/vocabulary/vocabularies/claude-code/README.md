# Claude Code Lexicon — the worked example of what Vocabulary would emit for Anthropic's Claude Code CLI/IDE.

The library shell + stub cards that the Vocabulary module would produce if Claude Code's product owner ran it against code.claude.com.

This is what good output looks like for a software-with-agents-in-it product. Two uses:

1. **Agent reference.** When Raven (or future maintainer-side agents) needs to see what an agentic developer-tool vocabulary actually outputs, point here.
2. **Director template.** When a director is building something Claude Code-shaped, the module can offer this whole shell as a starting frame: "Want to start from Claude Code's worked vocabulary? You'll get these 8 folders and these stubs; rename, drop, add as you go."

## Note on recursion

Claude Code IS the agent you are running in. The lexicon was produced by the agent running against itself. This recursion is intentional — it validates the Vocabulary module's invariant that the same naming rules hold whether the subject is a project-management tool (Linear), a gamified learning app (Duolingo), or the agent loop generating the card. The recursion also illustrates the **engine-vs-content split** finding from `families.md` cleanly: Claude Code the product has user-facing nouns (Plan mode, Session, Skill) that are entirely disjoint from the Anthropic infrastructure nouns underneath them.

## Claude Code's distinguishing contribution to the Family 2 vocabulary

Claude Code advances the agentic-software vocabulary in three ways that no prior worked exemplar covered:

1. **Tool / Skill / Subagent / Hook separation.** Four related-but-distinct concepts, each with a clear boundary. Tools are atomic. Skills are packaged workflows. Subagents are separately-context-windowed agents. Hooks are deterministic shell side-effects outside the LLM loop. Families.md identifies "Skill means three incompatible things" as the most contested term in agentic software; Claude Code picks one sense and holds it across the product.
2. **Plan mode as a named user-facing state.** Not an internal planning step (LangChain), not an artifact (Copilot Workspace) — a named mode the user encounters in the UI. The user opts in, watches the agent think without acting, and chooses when to transition. This is the clearest implementation of the families.md recommendation to "name agent UI states from the operator's encounter, not from the orchestrator's state machine."
3. **Memory / Context discipline.** Memory persists across Sessions; Context is the current window. The distinction is held explicitly and consistently — a deliberate choice that most agentic products blur.

## Folder structure

```
claude-code/
├── _signature/
│   └── Standard - Claude Code Nomenclature Signature.md
├── roles/
│   ├── Role - User.md
│   ├── Role - Agent.md
│   └── Role - Subagent.md
├── entities/
│   ├── Entity - Workspace.md
│   ├── Entity - Session.md
│   ├── Entity - Tool.md
│   ├── Entity - Skill.md
│   ├── Entity - Hook.md
│   ├── Entity - Memory.md
│   ├── Entity - Slash Command.md
│   ├── Entity - MCP Server.md
│   ├── Entity - Checkpoint.md
│   └── Entity - Routine.md
├── surfaces/
│   ├── Surface - CLI.md
│   ├── Surface - Plan Mode.md
│   ├── Surface - Stream.md
│   ├── Surface - Diff Review.md
│   └── Surface - IDE Extension Pane.md
├── capabilities/
│   ├── Capability - Tool Calling.md
│   ├── Capability - Skill Invocation.md
│   ├── Capability - Subagent Dispatch.md
│   ├── Capability - Plan-and-Execute.md
│   └── Capability - Memory Recall.md
├── systems/
│   ├── System - Tool Dispatcher.md
│   ├── System - Hook Execution.md
│   └── System - MCP Integration Layer.md
├── patterns/
│   ├── Pattern - Plan-Then-Act.md
│   ├── Pattern - Tool-Use Loop.md
│   ├── Pattern - Subagent Delegation.md
│   └── Pattern - Save-React.md
└── economy/
    ├── Economy-instance - Context Window.md
    ├── Economy-instance - Token Budget.md
    └── Economy-instance - Plan.md
```

33 stubs + 1 signature card = 34 files.

## Subfolder taxonomy (subcategory tags)

The wiki view renders these subcategories as virtual subfolders:

- **roles/** — human (User); agent / main (Agent); agent / sub (Subagent)
- **entities/** — workspace (Workspace); session (Session, Memory, Checkpoint); capability-unit (Tool, Skill); invocation (Slash Command, Routine); integration (Hook, MCP Server)
- **surfaces/** — input-output (CLI, Stream, IDE Extension Pane); mode (Plan Mode); review (Diff Review)
- **economy/** — resource (Context Window, Token Budget); plan (Plan)
- **capabilities/, systems/, patterns/** — flat for now

Subcategories determine file paths: a card with `subcategory: [tag1, tag2]` lives at the nested path `<category>/<tag1>/<tag2>/<file>.md`. The filesystem tree above is the canonical directory structure; frontmatter `subcategory:` tags and the actual file paths stay in sync.

## Stub frontmatter shape

Vocabulary banks stubs with the identity layer populated. Later modules (Vision banks a claim; Sam writes the WHAT/WHERE/WHY/WHEN/HOW; Conan grades) fill the body content. Frontmatter the module produces at bank time:

```yaml
---
type: <one of: Role | Entity | Surface | Capability | System | Pattern | Economy-instance | Standard>
prefLabel: <canonical name>
altLabels: [<other names used for the same concept>]
category: [<primary>]                      # single value; drives the file path
subcategory: [<tag>, ...]                  # drives view-time grouping; empty list if flat
facets: [<other-category>, ...]            # optional; only for genuine multi-category concepts; omit if not applicable
user_visible: <true | false — drives the MDA-inversion guard>
status: stub
proposed_by: <raven | director>
source_evidence: [<URLs or paths where the term was observed>]
---
```

The 10 universal categories: Rationale · Research · Roles · Domains · Surfaces · Entities · Capabilities · Mechanisms · Patterns · Economy.

**Facets convention.** `category:` is always a single-element list. Genuine facet-concepts declare secondary categories in the optional `facets:` field — e.g., `Context Window` has `category: [Economy]` and `facets: [Surfaces, Mechanisms]`; `Plan Mode` has `category: [Surfaces]` and `facets: [Patterns]`. The card lives in the folder of its `category[0]`; facet membership is signaled in `facets:` only. Most cards omit `facets:` entirely.

Body has the five Alexandria dimension sections (WHAT / WHERE / WHY / WHEN / HOW) present-but-stubbed so later modules know where to write.

## What's NOT here

Rationale and Research cards. Per the cross-cut finding in `families.md`, those two categories are owner-supplied — they describe why-this-product-exists and what-we-found, both of which come from the director's own product work (Vision, Bets, Guardrails, User Research modules), not from any exemplar's docs. The Vocabulary module surfaces these category folders but doesn't pre-populate them.

## Note: Economy is the most under-named category here — and the most important

Per `families.md` Family 2: Economy is "quiet — and a gap" in agentic software. Token cost, rate limits, and context-window budgets exist everywhere but aren't first-class nouns in any framework. Claude Code's vocabulary is ahead of the field here: `Context Window` is explicitly named as a budget + surface + memory + pricing axis, and families.md flags it as the strongest candidate for an Alexandria-coined term. Directors building agentic products should treat this Economy depth as the expected gap to fill, not as a curiosity.
