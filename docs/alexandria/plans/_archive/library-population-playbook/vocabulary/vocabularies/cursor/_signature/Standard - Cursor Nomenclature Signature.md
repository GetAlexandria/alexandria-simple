---
type: Standard
prefLabel: Cursor Nomenclature Signature
altLabels: []
category: [Rationale]
user_visible: false
status: stub
proposed_by: raven
source_evidence:
  - https://docs.cursor.com
  - https://cursor.com
---

# Cursor Nomenclature Signature

## WHAT: Definition

The naming style this product commits to. New nouns proposed by Sam, Raven, or any maintainer get linted against this signature; violations require a deliberate override.

The signature has five rules, inferred from Cursor's existing public vocabulary at docs.cursor.com:

1. **Short utilitarian English. Single words preferred.** Tab, Chat, Composer, Agent, Index, File, Folder, Workspace, Project — one word, no compound if avoidable. When a compound is necessary (Inline Edit, Background Agent), it stays two plain words, never CamelCased or hyphenated.
2. **Autonomy-tier nouns are aesthetics-named for the felt encounter.** Tab (the keystroke that accepts), Inline Edit (the selected-text scope), Composer (the multi-file drafting instrument), Agent (the autonomous loop) — each names what the developer *sees and does* at the moment of interaction, not what the orchestrator's state machine records. This is the signature property `families.md` calls "the cleanest surface naming in the agentic-software space" and the canonical positive example of MDA-inversion-avoided.
3. **Borrowed developer-tool vocabulary kept generic and recognizable without explanation.** File, Folder, Workspace, Project — terms any developer picks up immediately from context. No invented variants (not "Codebase Container," not "Project Space").
4. **Settings and configuration vocabulary is explicit and artifact-named.** Rules, `.cursorrules`, MCP server — names the configuration artifact the developer authors, not the runtime effect it produces. Explicit over euphemistic.
5. **Action verbs in UI are bare imperatives ("Apply", "Index", "Accept", "Reject"), not gerunds.** This differs from Linear's gerund convention (Filtering, Assigning) and matches developer-tool norms across the category. The verb names what the key does, not what the user is engaged in doing.

Cursor is the `families.md` positive example of MDA-inversion-avoided across an entire four-tier autonomy surface vocabulary. The diagnostic from that document: *"if the noun describes what the user sees on screen during the moment, it's aesthetics-named; if it describes an object in the orchestrator's state machine, it's mechanism-named."* Every Cursor surface noun passes this test: Tab names the keypress that fires autocomplete acceptance; Inline Edit names the selection-bounded diff the developer reads; Composer names the multi-file drafting surface the developer types into; Agent names the autonomous loop the developer watches and can interrupt. None of these nouns describe the model's internal state, the inference pipeline, or the diff algorithm. The contrast case in the same family is OpenAI's `Run`, `Run Step`, `Vector Store`, and `Sampling` — all mechanism-named, all requiring documentation to decode. Directors naming new UI surfaces for agentic tools should hold Cursor's four-tier vocabulary as the reference shape: name the encounter, not the engine state.

## WHERE: Ecosystem

_Stub — links to the Standard for Five-Dimension Card Requirements, the Principle for One Concept Per Card, and every card type in this library that the signature constrains. Filled when the library structure is fully banked._

## WHY: Rationale

_Stub — owner-supplied. Vision module will bank the claim that anchors why this signature matters; this section then links to that Vision card._

## WHEN: Timeline

_Stub — stamped at bank time with date Vocabulary module was run. Re-banked when the signature is updated (drift detected during lint or director-initiated)._

## HOW: Specification

_Stub — to be enriched with: the lint rule format (regex / classifier hints), the override gesture (who approves a signature violation), the deprecation path for retired nouns, and worked examples of named-correctly vs flagged-for-rename._
