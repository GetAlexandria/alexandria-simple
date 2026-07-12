# Library Updates from Library Viewer

Ask Conan to review this list and produce a transient surgery plan for Sam in the conversation, not as a checked-in file.

| Action | Card | What Changed | Source |
|--------|------|-------------|--------|
| Create | Artifact - Decision: Monorepo Workspace for Viewer | Viewer code lives in packages/viewer/ as a Bun workspace package | Step 4, D1 |
| Create | Artifact - Decision: Direct Graph Import | Viewer imports src/lib/graph.ts directly rather than a JSON data layer | Step 4, D2 |
| Create | Artifact - Decision: Inline Wikilink Context | Wikilink context phrases display inline, not as tooltips | Step 4, D5 |
| Create | System - Library Viewer | New system: local web interface for browsing the product knowledge library | Step 5 |
| Update | System - Knowledge Graph (WHEN) | Graph parser now consumed by both CLI tools and the Astro viewer | Step 5 |
| Update | Experience Goal - Legible Graph (WHEN) | First human-browsing surface implementing legible graph for humans | Step 5 |
