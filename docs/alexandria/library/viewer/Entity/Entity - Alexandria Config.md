---
plane: product
status: stub
confidence: high
altitude: component
altLabels:
  - .alexandria/alexandria-config.json
evidence:
  - packages/ax/CLAUDE.md
links:
  related_to:
    - Entity - Project
---

## WHAT
The project's configuration file — what setting up a project writes and
every later command reads to know which workspace it is operating in. A
part with no independent lifecycle: it exists exactly as long as its
project does.

## WHY
Giving each project one settled place to record its own setup means every
later command can trust what it finds there instead of re-asking or
re-guessing. Because the file has no life apart from the project it
belongs to, it travels wherever the project travels and can never drift
out of sync with a workspace that no longer exists. That small guarantee
is what lets a long chain of separate commands, run at different times,
all agree on which workspace they're actually operating in.

## WHERE
A single settings file at the project root.

## HOW
It rides the [[Entity - Project]]: written when the project is initialized
and consulted by every command that needs the workspace paths.
