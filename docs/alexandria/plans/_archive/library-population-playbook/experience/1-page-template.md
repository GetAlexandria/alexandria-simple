# Experience — 1-page template

An Experience document captures the *felt-shape* of the product over time — phases, rhythms, transitions, loops, and the cadences running behind the scenes. It is a single narrative document, not a set of atomic cards; atomization is downstream.

Load-bearing constraints (don't break these when sharpening):

- The template must accept Raven's inputs from a Product Walk: per-stop `experience_note` + behind-the-scenes `cadence` (see `product-walk/template.md § 5c`).
- Sections must be fillable by a human directly OR draftable by Raven from a Walk artifact.
- The register is story-shaped where possible: lived time, not feature lists.
- Each section follows the same schema: *Length · Pulling for · Quick test · Prompt · Answer · Pointer to deeper resources.*
- For deep per-section guidance, see `deep-guidance.md` (later slice). For worked examples, see `examples.md` (later slice).

The 5 sections, in reading order:

1. The Day Shape — *the overall arc, phases, and rhythm*
2. Phase-by-Phase Felt Shape — *what each phase feels like from inside*
3. Transitions — *the seams between phases*
4. Behind-the-Scenes Cadences — *what runs while the user isn't watching*
5. Loops and Progression — *what recurs, what compounds, what changes over weeks*

---

## 1. The Day Shape

*Length: 2–3 short paragraphs · Pulling for: the overall arc of a representative day or session — phases named, rhythm sketched · Quick test: could a stranger predict where the dense parts and the quiet parts are?*

Describe the shape of a representative day (or session, if the product isn't daily) in the user's life with this product. Name the phases in order. Sketch the rhythm: where it's fast and dense, where it's slow and broad, where it's quiet. Don't list features — describe the *shape* of time spent.

If Raven is drafting, she reads the ordered chain of stops + their `experience_note` values and writes the overall arc as a single short narrative.

> *Your answer here.*

*Deep: `deep-guidance.md § 1` · Examples: `examples.md § 1`*

---

## 2. Phase-by-Phase Felt Shape

*Length: 2–4 sentences per phase · Pulling for: the inside-feel of each phase — texture, density, demand on attention · Quick test: could you tell which phase someone was in just by watching their face?*

For each phase named in § 1, describe what it feels like from inside. Texture (sharp / loose / heavy / weightless). Density (dense / sparse). Demand on attention (high-focus / ambient / background). What the user is *doing* with their attention, not what the UI is showing.

If Raven is drafting, she groups stops by phase and synthesizes their `experience_note` values into one felt-shape paragraph per phase. She marks inferences with *(inferred)*.

> *Your answer here, one entry per phase.*

*Deep: `deep-guidance.md § 2` · Examples: `examples.md § 2`*

---

## 3. Transitions

*Length: 1–2 sentences per transition · Pulling for: the seams — what the user crosses, drops, or picks up between phases · Quick test: does the transition feel like a doorway, a tide change, or a hard cut?*

Name each transition between phases from § 1. Is it abrupt or gradual? Does the user choose it or does the system pull them? What gets dropped (an open question, an in-flight artifact) and what gets picked up (a new posture, a fresh surface)? Transitions often carry as much felt-meaning as phases themselves — name them on purpose.

If Raven is drafting, she reads `came_from` / `goes_to` edges between phase-spanning stops and infers the transition character from adjacent `experience_note` shifts.

> *Your answer here.*

*Deep: `deep-guidance.md § 3` · Examples: `examples.md § 3`*

---

## 4. Behind-the-Scenes Cadences

*Length: 1–2 sentences per cadence · Pulling for: the work running while the user isn't looking — and how its rhythm shows up in their day · Quick test: would the user notice if it stopped?*

Name the cadences running behind the scenes (nightly indexers, hourly summarizers, on-event agents, continuous watchers). For each: when it runs, what it produces, and how the user feels its output land in their day. The point isn't a cron-job list; it's how invisible work shapes felt experience — what arrives fresh, what's quietly ready, what changed overnight.

If Raven is drafting, she reads the `behind_the_scenes` blocks from the Walk and writes each as a felt-shape entry, not a process spec.

> *Your answer here.*

*Deep: `deep-guidance.md § 4` · Examples: `examples.md § 4`*

---

## 5. Loops and Progression

*Length: 2–4 short paragraphs · Pulling for: what recurs, what compounds, and what looks different in week 6 vs. day 1 · Quick test: could you describe the product on day 1 and on day 90 without describing the same scene twice?*

Two things together:

- **Loops** — what recurs at what cadence? Daily check-ins, weekly retros, monthly resets. The loops aren't features; they're the heartbeat the product imposes (or invites) on the user's life.
- **Progression** — what compounds over time? What does week 6 look like that day 1 didn't? Does the product get denser, lighter, smarter, quieter? Where does the user's posture shift from learning to wielding to teaching?

If Raven is drafting, she reads behind-the-scenes `cadence` values + any `experience_note` mentions of recurrence or growth, and sketches loops + progression. She marks the progression arc as *(inferred)* if the Walk only shows day-1 state.

> *Your answer here.*

*Deep: `deep-guidance.md § 5` · Examples: `examples.md § 5`*

---

*Deeper per-section guidance and worked examples will land in a later slice (`deep-guidance.md`, `examples.md`).*
