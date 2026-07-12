# Vocabulary Explorer

A standalone HTML/CSS/JS workbench for browsing and comparing the 10 worked Vocabularies in `../vocabularies/`. No backend — everything runs in the browser against a pre-built `vocabularies.json`.

## Open it locally

`vocabularies.json` is gitignored; build it first, then serve the page.

```bash
cd docs/alexandria/plans/library-population-playbook/vocabulary/explorer
bun build-vocabularies-json.ts                # regenerates vocabularies.json from vocabularies/
python3 -m http.server 8765               # any static server works
```

Then open <http://localhost:8765/> in a browser.

> Why a server and not a file:// open? Chrome blocks `fetch()` on `file://`. Firefox tolerates it. Safari can be configured. A local HTTP server is the safe default.

## The four views

1. **📚 Vocabulary** — sidebar lists all 10 vocabularies; click one to see its full file-browser tree. Click folders to expand; click cards for an inline detail panel (subcategory, facets, file path, sources, WHAT preview).
2. **⚖ Compare** — pick any two vocabularies from dropdowns; see them side-by-side as a 10-row table by universal category, with each cell showing that vocabulary's subfolder tree for that category. Defaults to Alexandria vs Linear.
3. **🔍 By category** — pick one of the 10 universal categories; see how all 10 vocabularies fill that category in parallel columns. Defaults to Roles.
4. **🎯 Closest fit** — paste a one-line product description; keyword-match ranking across signatures + card names + altLabels. Stand-in for the future Raven scan in the integrated canvas flow.

## Re-running the build

Re-run `bun build-vocabularies-json.ts` any time you:

- Add or remove a card file under `../vocabularies/`
- Edit a card's frontmatter (especially `category`, `subcategory`, `facets`, `user_visible`)
- Add a new vocabulary directory (e.g. `../vocabularies/jira/`)

The build script walks `../vocabularies/*/` recursively, parses each card's frontmatter and body, and emits a single `vocabularies.json` blob (~2.4 MB) that the page consumes.

## File layout

```
explorer/
├── README.md                 (this file)
├── index.html                (page skeleton + view tabs)
├── explorer.css              (tree-browser styling)
├── explorer.js               (view logic; ~500 LOC)
├── build-vocabularies-json.ts    (corpus → JSON; ~420 LOC, Bun)
└── vocabularies.json             (gitignored; rebuild locally)
```

## Conventions to know

- **Tree rendering**: folders are 📁, cards are 📄. Card border-left color encodes `user_visible`: green = user-facing, orange = engine-internal, gray = unset.
- **Facet marker**: `⬗` next to a card means it has a `facets:` field (a genuine multi-category concept).
- **Folder-to-category mapping** is declared in `build-vocabularies-json.ts` (`FOLDER_TO_CATEGORY`). To add a new universal category, update that map and the `UNIVERSAL_CATEGORIES` constant.

## Known limitations

- "Vocabulary" terminology lingers in internal code (`buildVocabulary`, `interface Vocabulary`, the JSON top-level key) — will be swept in a follow-up rename pass.
- `vocabularies.json` size grows linearly with the corpus; for ~10 vocabularies it's ~2.4 MB which is fine for local use but unsuitable for a production deploy without compression.
- The closest-fit picker uses naive keyword overlap; the integrated canvas version will use Raven's source-scan and is structurally different.
