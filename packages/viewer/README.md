# Alexandria Viewer

Viewer is the Alexandria browser interface. It is built as a static
Astro app with React for interactive UI and Tailwind for styling.

The viewer is served by `ax start viewer`. It should call the local AX runtime
APIs for project state and mutations; it should not read workspace files or
ledger JSONL directly.

## Development

```bash
pnpm --filter @alexandria/viewer run dev
pnpm --filter @alexandria/viewer run check
pnpm --filter @alexandria/viewer run test
pnpm --filter @alexandria/viewer run test:e2e
pnpm --filter @alexandria/viewer run storybook
pnpm --filter @alexandria/viewer run storybook:build
```

The viewer ships multiple routes — home, library (several modes), playbook,
info, ledger, per-agent pages, and Raven's vision/knowledge-bank surfaces. See
`src/components/library/viewer-routes.ts` for the authoritative route list.

## Effect Boundary

Use Effect at browser runtime boundaries:

```text
local runtime API -> Schema decode -> typed Effect errors -> React hook adapter
```

Effect belongs in `src/app/runtime/*` for:

- `fetch` calls to local `/api/*` endpoints
- decoding unknown JSON responses with `Schema`
- expected network, HTTP, JSON, decode, and subscription errors
- server-sent event acquisition and cleanup
- test and Storybook replacement of runtime behavior

Effect should not be used inside pure visual components. Components such as the
top navigation should receive ordinary props and callbacks. React hooks are the
adapter layer that runs runtime Effects and converts them into React state.

Preferred runtime shape:

- `schemas.ts` defines browser-facing runtime response schemas.
- `errors.ts` defines tagged runtime errors.
- `client.ts` exposes reusable operations with `Effect.fn`.
- `service.ts` defines a `Context.Tag` service only when dependency replacement
  is useful.
- `event-stream.ts` owns scoped `EventSource` lifecycle when SSE is wired.

Keep viewer schemas narrow. AX owns the canonical project-state and event-store
contracts. If the viewer begins duplicating large AX domain models, extract a
shared contract package instead of copying more shapes into the browser app.
