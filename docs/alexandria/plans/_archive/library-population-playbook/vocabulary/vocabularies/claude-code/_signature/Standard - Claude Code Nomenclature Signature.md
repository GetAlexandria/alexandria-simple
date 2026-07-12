---
type: Standard
prefLabel: Claude Code Nomenclature Signature
altLabels: []
category: [Rationale]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://code.claude.com/docs
  - https://docs.anthropic.com/en/docs/claude-code
---

# Claude Code Nomenclature Signature

## WHAT: Definition

The naming style this product commits to. New nouns proposed by Sam, Raven, or any maintainer get linted against this signature; violations require a deliberate override.

The signature has six rules, inferred from Claude Code's existing public vocabulary:

1. **Short descriptive English.** Tool, Skill, Hook, Memory, Session, Plan, Checkpoint. One or two syllables. No camel-cased mechanism names, no verb-object compounds (`PaymentIntent`, `RunStep`). The noun names what the user encounters; it doesn't describe the orchestrator's state machine.
2. **Verbs-as-modes (gerund-noun hybrids).** Plan mode, Background agent. These are named states the user enters — the gerund or modifier describes the encounter, not the engine's internal representation. "Plan mode" is what the user is doing (planning); it is not "PlanningPhaseRuntime" or "PreExecutionState." The mode name IS the user's encounter.
3. **Skill is reserved for a specific meaning.** A packaged repeatable workflow with instructions, invoked via a slash command. Distinct from a Tool (atomic single-step capability) and from a Subagent (a separately-context-windowed agent). `families.md` identifies "Skill means three incompatible things" as the most contested disambiguation in agentic software — Claude Code picks the workflow-with-instructions sense and holds it across every surface, every doc, every invocation.
4. **CLI conventions for invocation surfaces.** Slash commands (`/plan`, `/clear`, `/review`) follow shell-script naming convention: lowercase, hyphen-separated, preceded by `/`. Bracket-prefix tool names follow the same convention. This borrows from shell culture deliberately — Claude Code is a terminal-first product, and the user's mental model of slash commands is already formed by shell muscle memory.
5. **Memory and Context are distinct concepts, deliberately.** Memory persists across Sessions — it is durable, retrievable, and explicitly managed (CLAUDE.md, harness-managed memory). Context is the current window — temporary, bounded by the active turn, and non-persistent. These two must never be used interchangeably; blurring them produces user confusion about what will survive the next `/clear` or new Session.
6. **Hooks borrowed from web/event-handler convention.** Deterministic shell side-effects bound to lifecycle events (PreToolUse, PostToolUse, Stop, Notification), outside the LLM loop. "Hook" is borrowed from web development (React hooks, Git hooks, Webpack hooks) — the word already carries the meaning "code that fires when an event occurs." The borrow is intentional: developers using Claude Code already know what a hook is.

**MDA balance note.** Claude Code's surface nouns lean aesthetic — Plan mode names what the user experiences (thinking-without-acting); Slash command names the invocation gesture; Background agent names the user's felt relationship (something running in the background). But some entity and system nouns lean mechanism — Hook, Subagent, MCP Server, Tool Dispatcher. Where the line falls is a deliberate signature choice: user-facing states and actions get aesthetic names; integration points and infrastructure get mechanism names because the users of those features (developers extending Claude Code) benefit from precision over felt-encounter warmth. The diagnostic is: *does this noun appear in the end-user UI, or only in settings/docs for power users?* End-user UI → aesthetic. Power-user integration surface → mechanism is acceptable.

## WHERE: Ecosystem

_Stub — links to the Standard for Five-Dimension Card Requirements, the Principle for One Concept Per Card, and every card type in this library that the signature constrains. Filled when the library structure is fully banked._

## WHY: Rationale

_Stub — owner-supplied. Vision module will bank the claim that anchors why this signature matters; this section then links to that Vision card._

## WHEN: Timeline

_Stub — stamped at bank time with date Vocabulary module was run. Re-banked when the signature is updated (drift detected during lint or director-initiated)._

## HOW: Specification

_Stub — to be enriched with: the lint rule format (regex / classifier hints), the override gesture (who approves a signature violation), the deprecation path for retired nouns, and worked examples of named-correctly vs flagged-for-rename._
