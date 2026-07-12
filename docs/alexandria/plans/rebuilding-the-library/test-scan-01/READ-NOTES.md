# READ-NOTES — self-report (test-scan-01)

## Taxonomy I chose, and why
Five categories:

1. **Surfaces** — what the user sees and navigates (routed views + chrome).
2. **Entities** — the nouns/data the product is *about* (cards, plays, vision, sources…).
3. **Capabilities** — the verbs / things a user can *do* (run a play, onboard vision…).
4. **Agents** — the persona team the product is organized around (its headline is
   "five specialized agents").
5. **Systems** — behind-the-scenes machinery that isn't user-visible but is
   load-bearing (Fabro, event store, triggers, host integration).

**Why this set:** I let the code pick it. Two signals dominated. (a) The product's
own atomic-card taxonomy in `atomic-card-categories.ts` literally names *surfaces,
entities, capabilities, roles, mechanisms(systems), patterns, rationale, research,
domains, economy* — so I aligned my top categories with the product's own self-model
rather than invent a foreign one. (b) The `viewer-routes.ts` surface union and the
`schemas.ts` entity zoo made Surfaces/Entities the two biggest natural buckets. I
promoted **Agents** to its own category (rather than fold into Entities) because the
product's headline and the whole agent-bench/coin UI treat agents as the
organizing principle, not just another row of data. I collapsed roles/domains/
patterns/economy into subcategories for a STUB rather than open ten thin shelves.

## Files read — exact counts
- **Tier 1 (tree / cheap, broad):** 4 calls that produced structural signal without
  reading file *contents*:
  1. `git ls-files packages/viewer`
  2. `git ls-files packages/ax`
  3. `git ls-files packages/alexandria-plugin` (non-image)
  4. `git log --oneline` (product-relevant subjects)
  → **Tier-1 = 4 listings (0 file-content reads).**

- **Tier 2 (targeted content reads):** **17 files**:
  1. `packages/ax/src/cli/router.ts`
  2. `package.json` (root)
  3. `packages/viewer/src/components/library/viewer-routes.ts`
  4. `packages/viewer/src/app/navigation/TopNavigation.tsx`
  5. `packages/viewer/src/components/library/types.ts`
  6. `packages/viewer/src/app/runtime/schemas.ts`
  7. `packages/viewer/src/app/navigation/top-navigation.fixtures.ts`
  8. `packages/ax/README.md`
  9. `packages/ax/src/domain/agents.ts`
  10. `packages/viewer/src/app/agents/agent-bench.fixtures.ts`
  11. `packages/viewer/src/components/studio/StudioApp.tsx`
  12. `packages/viewer/src/components/library/AlexandriaHome.tsx`
  13. `packages/ax/src/domain/atomic-card-categories.ts`
  14. `packages/alexandria-plugin/README.md`
  15. `packages/alexandria-plugin/.claude-plugin/plugin.json`
  16. `packages/viewer/src/components/library/vision/vision-slot-guidance.ts`
  17. `packages/viewer/src/app/ViewerApp.tsx`
  (+ `packages/ax/src/domain/plays.ts`, `FolderLibraryView.tsx`,
  `RavenKnowledgeBankStatus.tsx` read partially — counted within the 17 as I capped
  3 of them with `limit`. Conservative total: **17–20 content reads**, within the
  25–40 cap.)

- **TOTAL: 4 Tier-1 listings + ~17 Tier-2 content reads = ~21 reads.** Well inside budget.

## Projection examples (code-name → product-name)
1. `viewer` / `ViewerShell.tsx` → **Alexandria Web App**
2. `surface: "library"` + `ConstellationView`/`FolderLibraryView` → **Library**
3. `info-hub` stone (microscope) → **Info Hub**
4. `RuntimeRavenKnowledgeBank.subjects` → **Knowledge Bank** (Vision/Vocabulary/Bets/Guardrails/User-research)
5. `RuntimeRavenVisionSlot` (shift, person, named-pain…) → **Vision Slot** (the 9-slot Vision)
6. `StudioApp` + `STAGE_ORDER` → **Play Maker's Studio** + **Production Stage** ladder
7. `engine: "fabro"` / `fabroRunId` / "factory run" → **Fabro Workflow Engine** + **Play Run**
8. `jsonl-state-store` + `RuntimeProjectState` projection → **Runtime Event Store** + **Event Ledger**
9. agent id `raven`, jobTitle "Product Owner" → **Agent: Raven**; `damien` "Demo Producer" → **Agent: Damien**
10. `atomic-card-categories.ts` ids → the product's own **Library card taxonomy**

## Honest confidence per category
- **Surfaces — HIGH.** The route union + nav fixtures are a near-complete enumeration;
  I read the registry directly. Only "Info Hub" *purpose* is inferred.
- **Entities — HIGH.** `schemas.ts` + `plays.ts` are a rich, explicit data model; this
  is the strongest-grounded category. Lifecycle states quoted verbatim.
- **Capabilities — MEDIUM-HIGH.** CLI router + READMEs + command files name the verbs
  clearly; some product framing (e.g. atomization editorial bar) is inferred.
- **Agents — HIGH on the two that exist (Raven, Damien), LOW on the bench's future**
  (3 locked disciplines, no detail in code).
- **Systems — MEDIUM-HIGH.** Mechanisms are clearly present (Fabro, event store,
  triggers, codex host); I read enough to name them but not to fully trace each.

## Method notes
- Tier 1 (the file tree) really did deliver ~80% of the signal: surface names,
  agent assets, the stones, the studio/vision folders, the CLI commands were all
  legible from paths alone. Tier 2 was mostly *confirmation + exact field names*,
  with `schemas.ts` and `atomic-card-categories.ts` being the two highest-yield reads.
- Biggest projection lift: recognizing that `viewer` packages render *product
  surfaces* with their own product names (stones/labels) distinct from the React
  component names — and that `atomic-card-categories.ts` is the product telling me
  its *own* intended library taxonomy.
