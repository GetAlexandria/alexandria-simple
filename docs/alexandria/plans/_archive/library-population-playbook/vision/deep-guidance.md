# Vision — Deep Per-Slot Guidance

For each of the 8 slots in `1-page-template.md`, this doc names: the argument-level job the slot does, what it's *not* (boundaries against adjacent slots), common failure modes, sharpness targets, the diagnostic test, and how the slot connects to the others.

A note on sharpening: in stand-alone Vision exercises (Geoffrey Moore positioning, Lafley/Martin winning aspiration, Amazon PRFAQ), each question has to bear the *whole* Vision's weight in one answer. In this template, the slots share the weight — which means each slot can be *more specific and more narrowly scoped* than its stand-alone equivalent. The guidance below assumes the rest of the template is doing its part.

---

## 1. The Shift

### Job
Names the external change in the world that creates the conditions for this product. Without it, the Vision is timeless and therefore untestable. The Shift is what makes the product *necessary now* rather than *useful in general*.

### Not the job
- Not your internal origin story ("we noticed a gap")
- Not market sizing
- Not a vague trend declaration ("AI is changing everything")
- Not the Problem (slot 3) — the Shift is in the world; the Problem is what the Shift produces for the Person

### Common failure modes
- **Generic.** "AI is exciting now." Could be said in any AI deck since 2022.
- **Untestable.** "The future is here." Not a claim you could fail on.
- **Internally focused.** "We saw an opportunity." Doesn't describe a shift; describes a feeling.
- **Old news.** A shift everyone now takes for granted.
- **Multiple shifts mashed together.** Pick the one that's load-bearing.

### Sharpness target
1 paragraph. Specific named change. If a journalist could quote your Shift sentence in 2030 and it still reads as a meaningful observation about today, you've got the level right.

### Diagnostic test
Could a smart person who has never heard of your product agree with your Shift statement on its own merits, just from what they see in the world? If yes, it's a real Shift. If only your customers would agree, you've described a niche pain, not a shift.

### How it connects
The Shift *exposes* the Person to the Problem. The Inadequacy (slot 4) also leans on the Shift — existing tools fail because they were built for the pre-Shift world. If you can't articulate the Shift, slots 3 and 4 will float without a foundation.

---

## 2. The Person

### Job
A specific composite the rest of the document can refer back to. Specific enough that every downstream slot has someone real to test against.

### Not the job
- Not a segment ("small business owners")
- Not a demographic ("ages 25–45, urban")
- Not an ICP description with firmographics
- Not an idealized perfect-buyer
- Not the Problem (slot 3) — the Person is *who*; the Problem is *what they're feeling*

### Common failure modes
- **Demographic disguised as person.** "Tech-savvy professionals."
- **Multiple personas mashed.** "Founders, product managers, and CTOs."
- **Idealized buyer.** Too clean. Real people are messier.
- **Too detailed.** Specific job title + age + zip code turns into market segment.
- **Too abstract.** "Someone with edge." That's a quality, not a person.

### Sharpness target
1 short paragraph. Name + backstory phrase + current situation + scene-level pain. The reader should feel they could pick this person out at an event.

### Diagnostic test
Could a stranger reading the Person paragraph predict what this person says *yes to* and *no to* on a typical Thursday? If yes, you have a person. If no, you have a segment.

### How it connects
The Person carries through every subsequent slot. The Problem is *their* problem. The Mechanism solves it *for them*. The Felt Experience is a scene in *their* life. The Proof tests whether the Vision held for *people like them*. Skip this slot and the rest abstracts into nothing.

---

## 3a. Named Pain

### Job
The pain in the Person's own language. Front-door pain that sells. What a buyer would say if you asked them.

### Not the job
- Not a list of category complaints
- Not founder-voice ("their workflow is fragmented")
- Not aspirational pain ("they want to scale")
- Not the Discovered Pain — that's 3b

### Common failure modes
- **Founder voice instead of person voice.** "Their tooling is misaligned" is your diagnosis, not their complaint.
- **Diagnostic language.** "Cognitive overhead from context-switching" is consultant-speak.
- **Generic SaaS pain.** "We want to grow faster" applies to every company.
- **Multiple pains piled together.** Pick the one that's front-of-mind.

### Sharpness target
1 paragraph in the Person's voice. Should sound like coffee-shop language, not survey-response language.

### Diagnostic test
If you read the Named Pain to the Person, would they nod? If they'd correct you ("that's not how I'd put it"), you haven't gotten their voice yet.

### How it connects
The Named Pain is what marketing's front door promises to solve. It sets up the Discovered Pain by being the *visible-but-incomplete* version. The Mechanism (5) must address the Named Pain directly — if it doesn't, your front door doesn't sell.

---

## 3b. Discovered Pain

### Job
The deeper structural pain that becomes visible only after the alternative exists. The pain that retains.

### Not the job
- Not the marketing pitch
- Not something the Person would name if asked today
- Not a more-sophisticated-sounding restatement of the Named Pain
- Not a founder's diagnosis the customer wouldn't endorse even after using the product

### Common failure modes
- **Restating Named Pain in different words.** If the customer would recognize it today, it belongs in 3a.
- **A diagnosis the customer wouldn't endorse.** Your insight, not their reality.
- **Too philosophical.** Category-level claims when you need a personal one.
- **Leading marketing with this.** A buyer who's already decided your category doesn't work will *confirm their bias* if you pitch them the Discovered Pain. Save it for the experience.

### Sharpness target
1 paragraph. Should be the "oh — THAT was the real problem" moment a customer has weeks into using the product.

### Diagnostic test
Could a customer say *"I didn't know that's what was bothering me until I didn't have to do it anymore"*? If yes, you've got a Discovered Pain. If they would recognize and name it before adopting, it's actually a Named Pain.

### How it connects
The Discovered Pain is usually what makes the product *categorical* — what changes when it's solved is a shift in identity or work shape, not just task efficiency. The Mechanism's deepest claim often resolves the Discovered Pain. The Felt Experience often gets its GASP moment from the absence of the Discovered Pain.

---

## 4. The Inadequacy

### Job
Names the structural reasons existing tools fail. Establishes that the gap is *durable* — not closeable by the competitor's next release.

### Not the job
- Not insults aimed at competitors
- Not a feature comparison
- Not "they don't have X" (that's a feature gap, not a structural one)
- Not ignoring real alternatives (if customers reach for Notion or sprints today, those must be named)

### Common failure modes
- **Listing missing features instead of structural reasons.** "Notion doesn't have agents" is a feature gap. "Notion was designed for humans to browse, not agents to operate from" is structural.
- **Generic critique.** "Legacy tools are slow."
- **Attacking intent.** "They don't care about users."
- **Ignoring actual alternatives.** If the customer's most common workaround isn't on your list, you've missed the real comparison set.

### Sharpness target
3–5 bullets. Each names a tool or category and a one-sentence structural reason. Each should reveal a *durable* gap.

### Diagnostic test
Could the competitor close this gap with a 2-week sprint? If yes, the reason isn't structural — it's a feature gap. Sharpen until the gap would require the competitor to *undo* something foundational.

### How it connects
Inadequacy connects Shift (1) → Mechanism (5). It explains why the pre-Shift world's tools don't fit and why your Mechanism is needed, not arbitrary. Without Inadequacy, the Mechanism looks like one more option among many.

---

## 5. The Mechanism

### Job
The exclusive positioning claim. What we are, specifically, that no one else is. The load-bearing sentence that drives every downstream slot.

### Not the job
- Not a tagline ("ship the speed of thought")
- Not a mission statement ("our mission is to…")
- Not a feature list ("we have cards and a graph")
- Not a generic value-prop ("empower teams to do X")

### Common failure modes
- **Buzzword soup.** "AI-powered platform empowering teams."
- **Non-exclusive claims.** "Best in our category" — every product in the category will claim this.
- **Internal-jargon-laden.** "Knowledge graph substrate" — what does that mean to a buyer?
- **Feature-shaped instead of value-shaped.** "We have cards." So what?
- **Too broad.** Could describe 100 products.

### Sharpness target
1 sentence + 2–3 supporting sentences on the primitives. The one sentence should be sharp enough that a stranger can predict your roadmap.

### Diagnostic test
Hand the positioning sentence to a stranger. Ask them to list 5 features they'd expect this product to ship, and 5 features they'd expect it to refuse. If they can do both convincingly, the Mechanism is sharp. If they can only generate vague guesses, it's not yet.

### How it connects
The Mechanism is the load-bearing claim. Felt Experience (6) is what life looks like with the Mechanism working. Proof (7) tests the Mechanism's claim. Refusal (8) names what we won't do because it would betray the Mechanism. If the Mechanism isn't sharp, everything downstream blurs with it.

---

## 6. The Felt Experience

### Job
A vivid scene from the user's life that makes the Mechanism's claim concrete. The story that surfaces the GASP and the conspicuous absences. The desirability test for the Vision.

### Not the job
- Not a roadmap projection ("by 2027, we support X")
- Not a list of business outcomes ("MRR grows 5x")
- Not a generic day ("they get things done")
- Not a press release
- Not a hero spot
- Not a metric dashboard

### Common failure modes
- **Roadmap drift.** "Three years in, we support 50+ integrations."
- **Outcome list.** "Customer's revenue grew, headcount stayed flat."
- **Generic day.** "They open the laptop, get focused work done." Could be any product.
- **Too short.** A bullet list isn't a scene.
- **Too long.** Loses focus past 500 words.
- **No absences.** Only describes what's there, missing what's *not* there. The absences usually carry more meaning than the presences.

### Sharpness target
250–400 words. A story with momentum. Specific time markers or scene moments. At least one GASP. At least one conspicuous absence. Horizon: when the user is a *power user* — the product is successfully installed and they're fully expressing what it enabled.

### Diagnostic test
Could the same scene be told about a different product? If yes, sharpen. The scene should be impossible to mistake.

### How it connects
Felt Experience is the concrete embodiment of Mechanism. Proof (7) tests whether this scene is observably real for customers. Refusal (8) often refers back to what would *break* this scene if served.

---

## 7. The Proof

### Job
Observable, falsifiable, distinctive markers that tell us the Vision held. Story-truth, not market-thesis.

### Not the job
- Not revenue targets ("$1M ARR")
- Not adoption counts ("100K users")
- Not NPS
- Not "users love us"
- Not OKRs
- Not aggregated theses ("we capture X% of market")

### Common failure modes
- **Adoption metrics.** "100K signups."
- **Vanity metrics.** "NPS 70."
- **Outcomes too general.** "Strong retention."
- **Not falsifiable.** "We see growth."
- **Could be hit by a different product accidentally.** If a competitor's product could trip the same marker, sharpen.

### Sharpness target
2–3 markers. Each behavioral, observable, specific to this Vision's distinctive claims.

### Diagnostic test
For each marker, ask: could a competitor with a different Mechanism accidentally hit this? If yes, sharpen until they couldn't. Story-truth markers are markers where the *only* way to hit them is to deliver on *this* Vision specifically.

### How it connects
Proof tests Mechanism (5) and Felt Experience (6). If the markers could be hit by a product with a different Mechanism, they aren't capturing what's distinctive about this one. Markers should map directly to specific claims in slots 5 and 6.

---

## 8. The Refusal

### Job
Trap-shaped anti-positions. Names what *looks aligned* with this Vision but would undermine it if served. With structural reasons connected to earlier slots.

### Not the job
- Not a list of segments outside the positive target (the positive target already implies that)
- Not preferences disguised as positions
- Not insults aimed at non-customers
- Not "not for everyone" (meaningless)

### Common failure modes
- **Segments instead of traps.** "Not for enterprises" is a segment. "Not for the enterprise division that 'happens to have a small team' — because the buying motion drags governance demands that reshape the product" is a trap with structural reasoning.
- **Insults.** "Not for people who don't value good tools."
- **Refusals you'd break for money.** If you'd sell to them with a $1M check in hand, it's a preference, not a refusal.
- **Refusals without reasons.** Each refusal must connect back to a slot earlier in the document.
- **Generic.** "Not for everyone." Helps no one decide anything.

### Sharpness target
2–3 anti-positions. Each names a specific trap or shape of customer. Each has a reason connected back to a specific earlier slot. Each is one you'd hold to with money in hand.

### Diagnostic test
For each refusal: would you sell to them with a $1M check in hand? If yes, it's not a refusal. Then: does the reason connect back to a specific earlier slot? If no, the refusal isn't structural — it's a hunch.

### How it connects
Refusal is the most downstream slot. It depends on slots 1–7 to explain *why* something is a trap. Without the earlier slots, refusals look arbitrary. A well-written Refusal slot also often surfaces a refinement to the positive target in earlier slots — sometimes the act of naming what you refuse reveals that what you positively target was a proxy for something deeper.

---

## How the slots earn each other

A structurally sound Vision argument flows top-to-bottom, with each slot earning the next:

```
Shift ──► Person ──► Problem ──► Inadequacy ──► Mechanism ──► Felt Experience ──► Proof
                                                                                    │
                                                                                    ▼
                                                                                 Refusal
                                                                              (connects back
                                                                              to slots 1–6)
```

If you remove any slot, the chain breaks:
- Remove **Shift** → the Vision becomes timeless and untestable.
- Remove **Person** → the rest of the document abstracts into nothing concrete.
- Remove **Problem** → the Mechanism solves nothing.
- Remove **Inadequacy** → the Mechanism looks arbitrary.
- Remove **Mechanism** → no positioning claim to test.
- Remove **Felt Experience** → the Mechanism stays theoretical; the team has no shared image.
- Remove **Proof** → no way to falsify; the Vision becomes wishful.
- Remove **Refusal** → no discipline against scope drift; the product sprawls.

A diagnostic when a Vision feels off: walk down the chain. The slot that breaks the chain is usually the one to sharpen first.
