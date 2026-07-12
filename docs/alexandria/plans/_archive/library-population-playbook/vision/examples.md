# Vision Mad Lib — Examples

Worked good/bad pairs for each of the 8 slots. The good examples come from real companies (Stripe, Slack), a fictional product (**Quill** — a meeting-notes tool for small consultancies), and a running example throughout (**Alexandria**, our context-library product). The bad examples are written in the same domain so the comparison is direct.

Each slot ends with **the pattern** — a one-line observation about what generally separates good from bad.

---

## 1. The Shift

### Good example *(Stripe, in retrospect)*

> *Commerce is moving onto the internet at a generational scale, and the developer — not the CFO — is increasingly the person who decides which payments stack a business uses. Five years ago the buyer was finance and the developer integrated whatever finance picked. Today the developer often is the buyer, and finance discovers the choice after the fact.*

**Why it works:**
- Names a *specific change*: who-the-buyer-is shifted from finance to developer.
- Time-bounded: "five years ago vs. today." A reader can independently verify.
- Externally verifiable. The shift exists whether or not Stripe exists.
- Creates downstream pressure for who the Person should be (a developer, not a CFO).

### Bad example

> *Online commerce is growing rapidly. AI and modern technology are reshaping how businesses operate. The pace of change is accelerating.*

**Why it fails:**
- Generic. Could be in any startup deck from the last fifteen years.
- Untestable. When did this start? When will it stop? No claim sharp enough to fail.
- No *specific* shift named. Just trend vibes.
- Could justify any product.

### The pattern

Good Shifts name a *specific identifiable change* with a rough time window. Bad Shifts gesture at trends without claiming anything specific.

---

## 2. The Person

### Good example *(Quill — fictional consulting-notes product)*

> ***Maya**, a partner at a 6-person strategy consultancy. Spent 8 years at McKinsey before going solo. She's typically running 5–9 client engagements at any time, her team rotating between them. The pain in her week is post-meeting: she's spent 90 minutes in a high-context client conversation, and now she has to either spend 45 minutes writing notes herself (which only she can write well) or read someone else's notes that miss what mattered. She's the most senior person on the engagement and the only one who knows what good looks like.*

**Why it works:**
- Name (Maya) + backstory (8 years at McKinsey, went solo).
- Current situation (6-person firm, 5–9 engagements).
- Scene-level pain (90 minutes in, 45 minutes out, post-meeting).
- Specific enough to picture her week.
- Last line — *only one who knows what good looks like* — sets up Discovered Pain later.

### Bad example

> *Small business owners and professional services teams that need better tools for managing meeting notes and documentation.*

**Why it fails:**
- A segment, not a person.
- Two distinct personas mashed (small business owners ≠ professional services teams).
- No scene.
- Could apply to any meeting-notes-adjacent product on the market.

### The pattern

Good Persons have *names*. Bad Persons have *demographics*.

---

## 3a. The Named Pain

### Good example *(Quill, in Maya's voice)*

> *"I'm spending 30 to 45 minutes after every client call writing notes my team can actually use. My time is the most expensive resource in my firm and I'm burning the first hour of every afternoon on something a notetaker should be able to do — except no notetaker we've tried can capture what was implied in the conversation, only what was said. So I either pay the time-tax myself or end up with notes I have to rewrite anyway."*

**Why it works:**
- Maya's voice — could be said in a conversation.
- Specific (30–45 minutes, "first hour of every afternoon").
- Felt, not diagnosed. She's complaining, not consulting on herself.
- Connects to a specific behavior (she does the writing herself).
- Mentions what she's *already tried* (notetakers) and why they failed.

### Bad example

> *Meeting documentation is fragmented and consumes significant cognitive overhead for senior practitioners, leading to suboptimal knowledge retention and team-wide alignment friction.*

**Why it fails:**
- Consultant-speak, not Maya's voice.
- Abstract ("fragmented", "cognitive overhead", "alignment friction").
- No scene, no time-of-day, no behavior named.
- Could apply to any knowledge-management product.

### The pattern

Good Named Pain sounds like a quote from a coffee shop. Bad Named Pain sounds like a survey-response.

---

## 3b. The Discovered Pain

### Good example *(Quill, what Maya realizes after a month)*

> *What Maya didn't know to ask for: she didn't actually want notes. She wanted **deliverables-in-progress** — the meeting captured in a form that's the spine of the next thing she has to write for the client. After a month of using Quill, she realizes she's not editing notes into deliverables anymore; the deliverable started forming during the meeting. The "notes problem" she'd been solving for years was actually a "work-product continuity" problem disguised as a notes problem.*

**Why it works:**
- Maya would not say this today if asked.
- Recognizable in retrospect ("after a month").
- Reframes the original pain at a higher altitude.
- Connects to a specific behavior shift (she stops editing notes into deliverables).
- The reframe is structural — it implies different product decisions than a notes-product would make.

### Bad example

> *Users discover that they really need a knowledge management platform that captures institutional knowledge across all client engagements over time.*

**Why it fails:**
- Founder's diagnosis dressed up as customer insight.
- Pitchy. Sounds like a website tagline, not a customer realization.
- Vague ("institutional knowledge").
- Maya wouldn't endorse this even after using the product. It's the *category*'s pitch, not her experience.

### The pattern

Good Discovered Pain is a *reframing* the customer recognizes only with hindsight. Bad Discovered Pain is the founder's pitch hiding inside the customer's mouth.

---

## 4. The Inadequacy

### Good example *(Slack-shaped, addressing why team comms didn't already work)*

> - **Email** was designed for asynchronous one-to-one or small-group correspondence. It has no concept of *channels of ongoing context*, so team conversations either fragment across personal inboxes or collapse into broadcast-and-archive.
> - **IRC and chat tools** assumed the message *is* the artifact — search, history, and structure are afterthoughts. Modern teams need conversations that *become* searchable working memory, not conversations that disappear into log files.
> - **Wiki tools** treat finished documents as the canonical artifact. They have no good way to absorb the in-progress conversations that produce those documents. Every wiki page is a frozen output disconnected from the process that made it.

**Why it works:**
- Names *real* categories (email, IRC, wikis).
- Each failure is *structural* — designed for a different shape of communication.
- A reader sees the gap is durable — none of these tools can close it with a redesign.
- Concrete consequences ("fragment across personal inboxes", "collapse into broadcast-and-archive").

### Bad example

> - Existing tools are slow and outdated.
> - Most products don't have good UX.
> - Legacy solutions don't integrate well with modern workflows.

**Why it fails:**
- Generic critique that could apply to any incumbent.
- "Slow", "outdated", "bad UX" — all closeable with a refresh.
- Doesn't name actual tools customers use today.
- Reveals nothing structural — competitors could plausibly fix all three in a quarter.

### The pattern

Good Inadequacy names actual tools and explains why their core assumptions don't fit. Bad Inadequacy throws shade at "legacy software."

---

## 5. The Mechanism

### Good example *(Stripe)*

> **Stripe is the payments stack a developer would have built for themselves: APIs first, ops second, billing as a side effect.**
>
> The mechanism has two primitives. First, an API surface designed to be installed in twenty minutes by a developer reading docs — no sales call, no contract, no compliance pre-clearance. Second, an underwriting and ops layer that handles the messy back-office work in the background, surfaced only when the developer actually needs it. The result: a developer who decides to take payments at 11 PM can ship before bed.

**Why it works:**
- Exclusive claim ("the payments stack a developer would have built for themselves").
- A stranger can predict the roadmap: SDKs, dashboard for developers, docs-as-product, refusal to require sales calls.
- Names the primitives (developer API + invisible ops).
- Concludes with a specific predictable behavior (11 PM → ship by bed).

### Bad example

> **Stripe is the best payment platform for businesses of all sizes, leveraging cutting-edge technology to enable seamless commerce.**
>
> We empower businesses to accept payments online with industry-leading reliability, security, and ease of use.

**Why it fails:**
- "Best" — non-exclusive; every competitor will claim this.
- "All sizes" — no chosen target.
- "Cutting-edge / leveraging / seamless / industry-leading" — buzzword soup.
- A stranger reading this can't predict a single feature.

### The pattern

Good Mechanism sentences let a stranger predict your roadmap. Bad ones use words that fit any product in the category.

---

## 6. The Felt Experience

### Good example *(Stripe, 11 PM Tuesday)*

> *11 PM Tuesday. A founder finishes the third draft of their landing page and decides she wants payments live before launch tomorrow morning. She opens Stripe's docs in one tab, her code in another. She copies the integration snippet, fills in two values, runs a test transaction with her own card. It works. She commits, pushes, and goes to bed.*
>
> *Conspicuously absent: no vendor onboarding call has been booked. No legal redline of a contract. No PCI compliance training scheduled. No KYC interview. All of those things exist, and she'll encounter them later, surfaced by Stripe at the moments she actually needs them. By the time she wakes up, payments are live on the site.*

**Why it works:**
- A scene with momentum (11 PM → snippet → test transaction → commit → bed → morning live).
- A GASP: a founder, alone, gets payments live in an evening.
- Conspicuous absences (no onboarding call, no legal review, no compliance training, no KYC interview).
- Specific enough to be unmistakable — could not be said about any other product.

### Bad example

> *Three years in, Stripe customers love using our platform. They process millions of transactions and grow their businesses to new heights. Our reliable infrastructure powers commerce around the world.*

**Why it fails:**
- Marketing copy, not a scene.
- No specific user. No specific moment. No clock.
- Could be said about any payments company.
- No GASP. No absences. Just outcomes.

### The pattern

Good Felt Experience scenes have *clocks and verbs*. Bad ones have *adjectives and outcomes*.

---

## 7. The Proof

### Good example *(Stripe-shaped behavioral markers)*

> - **Time from `npm install stripe` to a successful test transaction is under 30 minutes for >70% of new integrations.** Observable directly in usage data.
> - **Zero human-to-human contact occurs in >90% of new accounts reaching production.** No sales call. No support email. No onboarding session. Self-service all the way.
> - **The "buyer" on >80% of new business accounts is documented as a developer or engineering leader**, not finance or operations. The buyer-shift the Vision claimed is observably real, not a marketing assertion.

**Why it works:**
- Each marker is observable, with a specific number.
- Each tests a distinctive claim from the Mechanism (developer-as-buyer, self-serve, fast-to-first-value).
- A competitor with a different model (sales-led, finance-buyer, multi-quarter procurement) could not accidentally hit these.

### Bad example

> - 100,000 active customers on the platform
> - $1B in payments processed annually
> - NPS score of 70 or higher

**Why it fails:**
- Adoption metrics, not Vision proof.
- Could be hit by any large payments company regardless of model.
- NPS measures sentiment, not the distinctive claim.
- Reveals nothing about whether developer-as-buyer is observably real.

### The pattern

Good Proof markers test a *distinctive behavior*. Bad Proof markers *count things*.

---

## 8. The Refusal

### Good example *(Stripe)*

> - **Not for the AR/AP buyer.** Companies whose primary payments need is invoicing, accounts receivable, or treasury automation should reach for a finance-buyer-shaped product. We will turn them down even with money in hand. *Reason: serving them would drift us toward finance-buyer feature requests and erode the developer-first feel that's the entire Mechanism.*
> - **Not for businesses without a developer in the loop.** A retail SMB whose owner doesn't code is better served by Square or a POS product. *Reason: our value depends on the integration being intimate; without a developer, there's no integration to be intimate with.*
> - **Not "enterprise payment processing" in the legacy-procurement sense.** Companies whose buying motion is multi-quarter vendor evaluations led by procurement aren't a fit, even with large contracts. *Reason: their cycle drags governance overhead that reshapes the product into something a developer can no longer pick up at 11 PM.*

**Why it works:**
- Each is a *real trap* — you can imagine these customers showing up with money.
- Each has a *structural reason* connected back to earlier slots (Mechanism, Felt Experience).
- Each is one Stripe would actually hold to.

### Bad example

> - Not for everyone.
> - Not for people who don't care about developer experience.
> - Not for businesses that want bad APIs.

**Why it fails:**
- "Not for everyone" — meaningless; helps no one decide anything.
- "Not for people who don't care about X" — insulting and unactionable. Nobody self-identifies as not caring.
- "Not for businesses that want bad APIs" — strawman that no buyer would agree they want.

### The pattern

Good Refusals name *real customer shapes* with *structural reasons*. Bad Refusals say "we're for good people" disguised as a refusal.

---

## A note on the working example

The synthesized Vision for **Alexandria** (in `../plan.md` and the worked artifact at the top of this playbook) is itself an extended Vision Mad Lib example. Where the slot-by-slot examples above use Stripe, Quill, and Slack-shaped material for teaching, Alexandria's Vision is the *live* worked example for this playbook — produced through the elicitation method, then synthesized, then test-validated by a fresh agent.

Worth studying both: the slot examples here are sharper because they're tuned for teaching; the Alexandria Vision is messier but real, with the texture of an actual founder working through their own argument.
