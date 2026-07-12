# Prepare PR

Prepare the final pull request context.

Fabro's configured `[run.pull_request]` finalization creates the pull request
after this node. Write the PR title and body to these files:

- `/tmp/fabro-pr-title.txt`
- `/tmp/fabro-pr-body.md`

Include:

- Suggested PR title
- What changed
- Why it changed
- Validation commands and results
- Any remaining risks or manual follow-up

Keep the summary concise and specific to Alexandria. Do not describe this as a
handoff to a human; write it as PR-ready reviewer context.

The title file must contain exactly one line. The body file must contain
Markdown suitable for a draft pull request body.
