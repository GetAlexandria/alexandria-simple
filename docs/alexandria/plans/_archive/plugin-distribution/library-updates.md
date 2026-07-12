# Library Updates from Plugin Distribution

Ask Conan to review this list and produce a transient surgery plan for Sam in the conversation, not as a checked-in file.

| Action | Card | What Changed | Source |
|--------|------|-------------|--------|
| Create | System - Plugin Distribution | New system: tarball packaging, curl installer, static hosting at sociotechnica.org/alexandria/ | D-1 |
| Create | System - Plugin Data Persistence | New system: compiled binaries and state stored in ${CLAUDE_PLUGIN_DATA} to survive updates | D-2 |
| Update | System - Update Check (WHEN) | Remote version URL moving from raw.githubusercontent.com to sociotechnica.org/alexandria/latest-version.txt | FEAT-007 |

Note: The context library has minimal card coverage on distribution and installation.
These cards would document systems that currently exist only in code (`setup` script,
bin wrappers, `update-check.ts`) and operational docs (ADR 001). Creating them is
optional but would improve library completeness.
