# Asset Credits

Source notes for art used in the cognitive lab. New entries: append, don't reorder.

## microscope-stone.png · microscope-stone-active.png

- **Source:** AI-generated (locally, by the author).
- **Use:** Library tile (Band 1) stone-tile dormant + activated variants in `cognitive-lab/cognitive-lab-v0.1.html`. Previewed in `cognitive-lab/bg-lab.html`.
- **License:** Author-owned; no third-party rights.

## pilot-stone.png · pilot-stone-active.png

- **Source:** AI-generated (locally, by the author).
- **Use:** Pilot Check Station tile (Band 2) stone-tile dormant + activated variants. Previewed in `bg-lab.html`.
- **License:** Author-owned; no third-party rights.

## recover-stone.png · recover-stone-active.png

- **Source:** AI-generated (locally, by the author).
- **Use:** Recovery Room tile (Band 2) stone-tile dormant + activated variants. Previewed in `bg-lab.html`.
- **License:** Author-owned; no third-party rights.

## theater-stone.png · theater-stone-active.png

- **Source:** AI-generated (Gemini, by the author).
- **Use:** Explainer Theater tile (Band 1) stone-tile dormant + activated variants in `cognitive-lab/cognitive-lab-v0.1.html`. Replaces the 🎬 emoji placeholder. Image is a classical Hellenic theater scene — robed orators and chorus arrayed around a central glowing-cyan altar/stage with circuit-pattern floor — reads as the room where writeups, decks, and demos get performed.
- **Aspect:** 1380×752 → aspect ratio 1.835, matches the default `--art-aspect: 1.833`. No per-tile override needed.
- **Modifications:** `theater-stone-active.png` is the source image with PIL brightness +18%, saturation +35%, contrast +8% applied — same recipe used for the other active variants.
- **License:** Author-owned; no third-party rights.

## journal-stone.png · journal-stone-active.png

- **Source:** AI-generated (by the author). Original file: `stack-library.png`.
- **Use:** The Daily Journal tile (Band 1) stone-tile dormant + activated variants in `cognitive-lab/cognitive-lab-v0.1.html`. Replaces the 📰 emoji placeholder. Image is a vast library of stacked shelves with glowing tomes and a central archway — reads as the archive where journal scratchpad, decisions, and editions accumulate.
- **Aspect:** 1264×768 → aspect ratio 1.503 (differs from the 1.833 used by other stones). The tile sets `--art-aspect: 1.503` inline so the socket impression sizes correctly to the artifact.
- **Modifications:** `journal-stone-active.png` is the source image with PIL brightness +18%, saturation +35%, contrast +8% applied — same recipe used for `bridge-stone-active.png` and `strategy-stone-active.png`.
- **License:** Author-owned; no third-party rights.

## strategy-stone.png · strategy-stone-active.png

- **Source:** AI-generated (Gemini, by the author).
- **Use:** Strategy & Plans tile (Band 1, top-right) stone-tile dormant + activated variants in `cognitive-lab/cognitive-lab-v0.1.html`. Replaces the 🗺️ emoji placeholder. Image is a 3D perspective chess board on a dark stone-toned background; the dark margin reads as the bezel seating into the socket impression, with the board floating depressed inside.
- **Modifications:** `strategy-stone-active.png` is the source image with PIL brightness +18%, saturation +35%, contrast +8% applied — same recipe used for `bridge-stone-active.png`. Generates the activated-state variant for the dormant↔active hover/click cross-fade.
- **License:** Author-owned; no third-party rights.

## bridge-stone.png · bridge-stone-active.png

- **Source:** https://getalexandria.ai/bridge.png
- **Retrieved:** 2026-05-12
- **Use:** Transition Hallway stone tile (dormant + activated cross-fade) in `cognitive-lab-v0.1.html`.
- **Modifications:** `bridge-stone-active.png` is the source image with PIL brightness +18%, saturation +35%, contrast +8% applied — generates the activated-state variant for the dormant↔active hover/click cross-fade.
- **License / permission:** Sourced from Alexandria's public marketing site. Treat as "all rights reserved by source" pending explicit permission from the Alexandria team. If we ship this publicly beyond internal use, confirm permission and update this entry.
