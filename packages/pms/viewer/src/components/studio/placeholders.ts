/**
 * The canonical Alexandria runtime-placeholder grammar — the ONE home the
 * studio surface shares, so its parsers cannot drift apart.
 *
 * Source of truth: the ax runtime substitutor,
 * `packages/ax/src/domain/orchestration.ts`, which substitutes **single-`AX_`**
 * placeholders only — `/__AX_([A-Z0-9_]+)__/` (e.g. `__AX_INPUT_<KEY>__`,
 * `__AX_ACP_COMMAND_JSON__`, `__AX_PROJECT_ROOT__`). A token authored any other
 * way — notably the dead `__AX2_…` spelling the `ax-next → ax` rename left
 * behind — is never substituted: the node ships the literal placeholder instead
 * of the input, a silent miss.
 *
 * Before this module the pattern was defined twice and drifted — the runtime
 * regex (`__AX_INPUT_`) versus the viewer's `promptContract.ts`
 * (`__AX2_INPUT_`, made tolerant `__AX2?_` as a #299 stopgap). Both viewer
 * consumers — the prompt-contract parser and the placeholder conformance gate
 * (`placeholderConformance.test.ts`) — now import these definitions, so they
 * can't disagree again. Keep them in lockstep with `orchestration.ts`.
 */

/**
 * A runtime-valid placeholder, anchored to a whole token: `__AX_<UPPER_SNAKE>__`.
 * Mirrors orchestration.ts's `/__AX_([A-Z0-9_]+)__/`. Test one token with
 * `RUNTIME_PLACEHOLDER.test(token)`.
 */
export const RUNTIME_PLACEHOLDER = /^__AX_[A-Z0-9_]+__$/;

/**
 * The build-time external-input placeholder `__AX_INPUT_<KEY>__` (capture group
 * 1 is the KEY) — the form a move's `consumes:` frontmatter declares.
 */
export const INPUT_PLACEHOLDER = /__AX_INPUT_([A-Z0-9_]+)__/;

/**
 * Any `__AX…__`-shaped token, valid or dead — the net the conformance gate casts
 * before checking each catch against `RUNTIME_PLACEHOLDER`. The body is `*?`
 * (not `+?`) so a degenerate zero-body `__AX__` is caught too, not silently
 * skipped. Non-greedy so adjacent tokens don't merge. Stateful (`g`): use with
 * `matchAll`, not `.test`.
 */
const AX_PLACEHOLDER = /__AX[A-Za-z0-9_]*?__/g;

/**
 * Every `__AX…__`-shaped token in `text` the runtime substitutor would NOT match
 * — i.e. would ship literally. An empty array means every AX placeholder in
 * `text` is runtime-valid; that is the conformance gate's whole judgement.
 */
export function deadPlaceholders(text: string): string[] {
  const dead: string[] = [];
  for (const match of text.matchAll(AX_PLACEHOLDER)) {
    if (!RUNTIME_PLACEHOLDER.test(match[0])) {
      dead.push(match[0]);
    }
  }
  return dead;
}
