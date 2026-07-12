# @alexandria/library-card-resolver

The single source of truth for resolving a wikilink-style label
(`Stage`, `Value - Stage`, `[[Value - Stage|alias#WHAT]]`) to the catalog card
it names.

Both the AX catalog domain (`@alexandria/ax`, which validates references and
derives threads) and the Viewer (`@alexandria/viewer`, which renders story and
workflow click-through) previously carried their own near-identical copy of this
logic. They now share this one module, so a reference resolves — or doesn't —
the same way on both sides.

## Why a separate package

The Viewer is a browser app and deliberately does not depend on `@alexandria/ax`
(which pulls in Node/Effect internals). This package depends on **nothing** and
operates over a minimal structural card shape (`ResolvableCard`), so it is safe
to bundle into the browser and import from either side without coupling them.

## API

- `createCardResolver(cards)` — closure form: `(label) => card | undefined`.
  Preferred by AX.
- `buildCardResolverIndex(cards)` — returns the `Map<string, card>` lookup.
- `resolveCardFromIndex(index, label)` — resolve a label against a prebuilt
  index. The Viewer threads the `Map` through its components and calls this.
- `normalizeResolverKey(value)` / `normalizeWikilinkTarget(rawTarget)` — the
  shared normalization primitives.

Resolution order: exact match on a normalized key (id, prefLabel,
`Type - prefLabel`, file stem, altLabels), then — for a multi-word label — a
retry with the leading word (the type prefix) dropped. An ambiguous suffix owned
by more than one card does not resolve.
