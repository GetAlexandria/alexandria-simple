---
type: value
prefLabel: Run Mode
altLabels: [run mode, --interactive, --auto-approve, --wait, detached]
category: runtime
subcategory: value
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/RUNTIME.md L42-50; studio/plays/TESTING.md L42-55
context: runtime
altitude: value
---

## WHAT
_Stub —_ how `ax run <slug>` is invoked: **detached** (fire-and-forget; default since #305), **`--interactive`** (attended TTY), **`--auto-approve`** (gates auto-resolved — smokes only), **`--wait`** (gather to terminal inline).

## WHERE
Set on the `ax run` command. Drives whether human gates block or wake-resume.

## WHY
Different launch contexts need different gating: a Raven-mediated detached run can't be `--interactive` (deadlock — see Hot Spot H3); a smoke can't use real human reactions; a graded gate test needs scripted [[Component - Reactions File]] instead of `--auto-approve`.

## WHEN
Chosen at launch.

## HOW
- `--auto-approve` legal only for gateless plays or structural smokes — never for grading gate behavior.
- Graded gates: `--reactions <case>/reactions.json`.
- `--interactive` deadlocks detached / agent-launched runs.
