# Problem Framing — the library is getting harder to trust and harder to work in
status: draft (v1)

## The problem(s)

### Stale cards are invisible — nothing distinguishes a dead card from a live one
- **Who has it:** Contributors and directors who consume library cards to do real work (write decks, make staffing decisions). It bites when someone builds on a card that looks current but isn't.
- **Evidence:**
  - "Two weeks ago I rewrote the whole onboarding deck off a card that turned out to be two quarters old. Half a day, gone. Nothing told me it was stale. It just sits there looking exactly as confident as a card from yesterday." — Theo. `first-hand: a specific past instance`
  - "Last month I deprioritized the Ops area because the bar was at ninety percent. Turned out half those cards were from last year. We almost didn't staff a session that area badly needed." — Nadia. `first-hand: a specific past instance`
  - "The bar counts a dead card the same as a live one. Ninety percent full of corpses is still ninety percent to that bar." — Nadia. `assumed / hand-wavey` (a characterization of how the bar works, not a second specific incident)
- **Thin spot:** Two solid instances. The mechanism claim — that staleness is what's distorting the coverage bar, rather than duplication or something else — is asserted but not isolated. Nadia herself says "We don't actually know."

### Duplicate cards across areas go undetected, padding counts
- **Who has it:** Anyone relying on coverage metrics or trying to keep the library clean. It bites when the same source lives in multiple areas and nothing notices, inflating the apparent coverage.
- **Evidence:**
  - "Priya found the same board deck banked in two areas. Dedup only looks inside the area you're in. So the same source can live in Strategy and Ops and nothing notices." — Nadia. `first-hand: a specific past instance`
  - "We've got dupes everywhere." — Roman. `assumed / hand-wavey`
  - "Which probably feeds the bar thing too, but I don't want to put words in anyone's mouth." — Bex. `hypothetical`
- **Thin spot:** One concrete instance (Priya's board deck). The claim that dupes are widespread ("everywhere") and that they meaningfully distort the coverage bar needs a specific past instance — Roman asserts it but Bex and Nadia both flag it as a guess.

### Atomization is unpredictable — same-shaped documents split into wildly different numbers of cards
- **Who has it:** Sam and downstream consumers who depend on consistent card output. It bites when you can't predict or explain how a document will be broken up, and consumers downstream have no idea what they're going to get.
- **Evidence:**
  - "The vendor doc atomized into twelve cards. The almost-identical one last month was three. There's no rhyme to it. Consumers downstream have no idea what they're going to get." — Sam. `first-hand: a specific past instance`
- **Thin spot:** One instance (twelve vs. three). Is this a recurring pattern or a one-off oddity? Needs at least one more specific instance to confirm it's systematic, and ideally clarity on what "downstream consumers" are actually doing differently because of it.

### The approval bottleneck blocks work when the director is unavailable
- **Who has it:** Bex (and potentially other contributors) who produce drafts that need director sign-off. It bites when the single approver is busy or out, and drafts sit idle long enough for their sources to go stale.
- **Evidence:**
  - "When Nadia was out that week, I had eleven drafts just sitting. Two of them I gave up on and the sources went stale before they ever got banked. Nothing moves without a director's sign-off and the director is one person with a real job." — Bex. `first-hand: a specific past instance`
  - "Every director hates the approval wait. All of them. Guaranteed. Nobody will say it on the record but it's true." — Bex. `assumed / hand-wavey`
  - "And honestly — maybe people bank stuff in a hurry because of the backlog, and that's part of why we get sloppy dupes? I don't know. Might be nothing." — Bex. `hypothetical`
- **Thin spot:** Bex's own week is solid. The claim that this is universal ("every director") is hand-wavey — she's generalizing without naming another instance. The hypothesized link between approval pressure and sloppy dupes is flagged as speculative by Bex herself.

### Institutional knowledge about the library workflow is undocumented and single-threaded through Bex
- **Who has it:** New contributors (Sam specifically) and the team at large. It bites at onboarding and would bite hard if Bex left.
- **Evidence:**
  - "My first week was just walking over to Bex's desk every twenty minutes. None of it's written down. If Bex ever leaves we're cooked, honestly. Nobody else knows the atomize quirks." — Sam. `first-hand: a specific past instance`
  - "I have tried to write it down. There's never time, because, see above, eleven drafts." — Bex. `first-hand: a specific past instance` (the reason it stays undocumented is the approval bottleneck eating her time)
- **Thin spot:** Sam's onboarding experience is concrete. The bus-factor claim ("if Bex ever leaves we're cooked") is `hypothetical` — it hasn't happened yet. Needs clarity on whether other contributors have had the same onboarding experience or whether Sam's was unusually rough.

## How they relate (a guess)

Held loosely:

- **Staleness and duplication** may both feed the unreliable coverage bar, but the team explicitly doesn't know which one (or both) is the driver. Treat them as siblings until someone can isolate the contribution of each.
- **The approval bottleneck** may drive duplication and staleness (Bex's hypothesis: rushed banking produces sloppy dupes; stalled drafts go stale before they're banked). This is speculative — Bex herself hedges it. If true, the bottleneck is upstream of the other problems; if not, they're independent.
- **Unpredictable atomization** looks like a sibling — a separate consistency problem, not obviously caused by or causing the others.
- **Undocumented workflow** is partly a consequence of the approval bottleneck (Bex can't write docs because she's drowning in drafts), and partly an independent onboarding gap.

## What this means for the solution (so far)

- **Roman's auto-approver:** Addresses the approval bottleneck, which has one solid instance (Bex's week). Whether it would help with dupes or staleness depends on the hypothesized link that nobody has confirmed yet. The solution is plausible but the problem it solves is narrower than it sounds — it's Bex's queue, not necessarily a systemic issue, until another instance surfaces.
- **Roman's expiry date on every card:** Directly targets staleness. Theo's half-day and Nadia's staffing miss both support the existence of the problem. Whether a date is the right mechanism is genuinely open (Theo himself isn't sure).
- **Cross-area dedup:** Addresses duplication, which has one concrete instance (Priya's board deck). Roman correctly notes it's a large project. The case for prioritizing it depends on whether duplication is actually widespread or a few isolated cases.
- **Atomization consistency:** No solution was proposed. The problem has one instance but it's vivid — twelve vs. three for same-shaped docs.
- **Overall:** The staleness problem has the strongest evidence (two specific, costly instances). The others each have one instance or rest partly on assumption. None of the proposed solutions is undercut by the evidence, but several are ahead of their evidence base.
