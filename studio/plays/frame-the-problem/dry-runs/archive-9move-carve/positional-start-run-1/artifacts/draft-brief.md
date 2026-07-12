# Draft Problem Brief

framed with: surface map [provided] · users [provided] · prior brief [not provided]

Prior draft was wholly invalidated by bounce: every quote was fabricated (wrong speakers, wrong product domain, wrong transcript). This draft is rebuilt from the actual transcript.

---

## Problem 1 — "They don't know what to do with the empty dashboard"

**Progress sought:** A new customer wants to get productive with Meridian — connect their data, see their dashboard populated, and feel confident the product will deliver value.

**Who:** Customer (new account). LEO reports this from four implementation calls; the customer is the one stuck, but LEO is the witness. Resolved against users file: "Customer (new account) — the buyer or technical admin who sets up the account."

**Circumstance:** A new customer has just created their Meridian account and opens the main dashboard. The dashboard is empty because no data source is connected yet. The onboarding checklist that is supposed to guide them through setup is in the sidebar and requires scrolling to find. By the time they discover it — if they discover it — they have already concluded the product is complicated. What greets them is a blank screen with no obvious path forward.

**Evidence:**

1. "Every single one, the customer is like, okay we set up the account, now what? They don't know what to do with the empty dashboard." — LEO · `specific-past` — LEO recounts a pattern from four named implementation calls
2. "The checklist isn't helping because they don't see it until after they've already decided the product is complicated." — LEO · `opinion` · conviction high — LEO's judgment about the causal sequence, grounded in direct observation but still an inference about the customer's internal state
3. "It's in the sidebar. You have to scroll." — SAM · `specific-past` — describes the current product state as a fact
4. "Right, so they never find it." — LEO · `opinion` · conviction high — a generalization ("never") based on LEO's implementation call experience

**What it's not:** A request for a better checklist, an onboarding wizard, or a redesigned sidebar. The problem is that the customer's opening encounter with Meridian is a blank screen that gives no signal about what to do, and the existing guidance is placed where they will not see it in time.

**Where it lands:** Onboarding checklist (hidden in sidebar, not surfaced on the empty dashboard state — confirmed by surface map known seam: the checklist requires scrolling and is absent from the empty dashboard view) · Dashboard (empty until a data source is connected — confirmed by surface map: "shows pre-built charts from connected data. Empty until a data source is connected").

---

## Problem 2 — "They get stuck at connecting the data source"

**Progress sought:** A new customer wants to complete setup by connecting their data source so they can see their dashboards populated — but the connector step demands information they do not have at hand.

**Who:** Customer (new account). LEO reports this from direct observation on implementation calls. Resolved against users file: the customer "typically does not have the database URL or technical details for the connector step at hand during initial setup."

**Circumstance:** The customer has found the setup flow (either on their own or with a CSM screen-sharing) and reached the "connect data source" step. This step has four sub-steps and requires a database URL. The customer does not have the URL handy. There is no way to save progress and return later. There is no in-app link to the help article that explains the step. The customer stalls, and the setup session ends with the product still non-functional.

**Evidence:**

1. "But even when I screen-share and walk them through it, they get stuck at connecting the data source. That step has four sub-steps and none of them make sense if you don't know your database URL. Which nobody has handy." — LEO · `specific-past` (the stuck customers on screen-share calls — it happened) + `opinion` · conviction high ("none of them make sense" and "nobody has handy" — LEO's generalizations from experience)
2. "So they drop off right there." — SAM · `opinion` · conviction high — SAM's summary of what LEO described; SAM treats it as established but is restating LEO's account, not citing independent data
3. "Three of my accounts just... went dark after that call." — LEO · `specific-past` — three named accounts, a real outcome
4. "There's a help article nobody finds." — LEO · `opinion` · conviction high — "nobody" is a generalization, but LEO's conviction is clear

**What it's not:** A request to simplify the connector or reduce its sub-steps. The problem is that the customer reaches a step requiring information they do not possess at that moment, with no way to pause, save, find guidance, or get help — so the session dies.

**Where it lands:** Data source connector (requires credentials customers rarely have on hand, no save-and-return, help article not linked from the connector — confirmed by surface map: "Requires a database URL, credentials, and a schema selection. There is no in-app guide; a help article exists but is not linked from the connector itself" and "No in-product path from a stuck connector attempt to human support or documentation").

---

## Problem 3 — "I have to spend half the call re-explaining the same setup"

**Progress sought:** LEO wants to advance accounts through onboarding without losing the same ground repeatedly — move forward with each call rather than re-covering the same walkthrough.

**Who:** Customer Success Manager (CSM). LEO is the speaker. Resolved against users file: the CSM runs implementation calls, onboards new accounts, and owns the customer relationship through the initial onboarding window.

**Circumstance:** A customer went dark after getting stuck on the data source connector step (see Problem 2). LEO books a follow-up call. Instead of picking up where they left off, the follow-up call starts from scratch because the customer retained nothing from the prior session and the product itself has no record of partial progress. LEO ends up re-explaining the same setup steps. This repeats across accounts.

**Evidence:**

1. "Then I have to spend half the next call re-explaining the same setup." — LEO · `commitment` — LEO is paying real time on every follow-up call to redo work that should have stuck
2. "It's the same conversation every time." — LEO · `opinion` · conviction high — a generalization, but LEO's frustration reflects repeated lived experience
3. "I've been on four implementation calls in the last month." — LEO · `specific-past` — establishes the volume of direct observation behind LEO's claims

**What it's not:** A complaint about call volume or a request for self-serve onboarding. The problem is that progress made on one call does not survive to the following one — neither in the product (no saved state) nor in the customer's understanding (no reference material they found useful) — so the CSM pays the cost of repetition.

**Where it lands:** Data source connector (no save-and-return — confirmed by surface map known seam) · Onboarding checklist (does not record or surface partial progress in a way that helps a returning customer resume).

---

## Problem 4 — "We shipped it two months ago and I'm not sure it's actually working"

**Progress sought:** SAM wants to know whether a shipped feature (the onboarding checklist) is actually solving the activation problem it was built to solve — and if not, to understand why.

**Who:** Product team. SAM is the speaker. Resolved against users file: "Sets scope, approves design decisions, owns the roadmap. Fielded as Sam (product)."

**Circumstance:** SAM shipped the onboarding checklist and has had time to observe its performance. SAM pulled the activation numbers and found that 31% of new accounts complete the opening three steps before day seven — unchanged from before the checklist shipped. The feature has had no measurable effect on the metric it was designed to move, and SAM does not know whether the cause is the product, the timing, or something else.

**Evidence:**

1. "We shipped it two months ago and I'm not sure it's actually working." — SAM · `opinion` · conviction moderate — SAM voices uncertainty, not a firm verdict
2. "I pulled the activation numbers last week. We're still sitting at 31% of new accounts completing the first three steps before day seven." — SAM · `specific-past` — a real measurement SAM performed
3. "That's unchanged from before the checklist, right?" — PRIYA · `specific-past` — PRIYA confirms the pre/post comparison
4. "Yeah. Which is weird because the PM said this would fix it." — SAM · `specific-past` ("Yeah" — confirming the metric is unchanged) + `opinion` · conviction moderate ("weird" — SAM expected a different outcome but is not assigning blame)
5. "I don't know if it's a product thing or like a timing thing." — SAM · `opinion` · conviction low — SAM explicitly marks their own uncertainty about root cause

**What it's not:** A request to remove the checklist or to ship a replacement. The problem is that the team invested in a solution, the outcome metric did not move, and they lack the information to diagnose why — is the feature undiscoverable, is it the wrong intervention, or has it not had enough time?

**Where it lands:** Onboarding checklist (the feature in question — confirmed by surface map as a shipped surface).

---

## Unclear

Items from the evidence list that did not earn a problem entry:

- **"Define working."** — PRIYA · A clarifying question that prompts SAM to specify the activation metric. Carries no independent problem assertion. It functions as conversational scaffolding.

- **"Raven, frame that."** — LEO · The invocation moment. Not a problem statement; it is the request that triggered this analysis.

- **"Where does the checklist even show up?"** — PRIYA · A diagnostic question. Carries no problem assertion; it prompted SAM's factual response about the sidebar placement, which is captured under Problem 1.

- **"Is there documentation for that step?"** — PRIYA · A diagnostic question. Carries no problem assertion of its own; it prompted LEO's response about the unfindable help article, which is captured under Problem 2.

