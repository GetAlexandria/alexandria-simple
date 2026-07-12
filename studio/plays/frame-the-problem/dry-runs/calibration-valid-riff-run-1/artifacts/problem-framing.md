# Problem Framing — onboarding checklist not moving activation numbers
status: draft (v1)

## The problem(s)

### New customers don't know what to do after account setup and stall out before getting value

- **Who has it:** New customers, in the first seven days after account creation — specifically during first login and initial product setup.
- **Evidence:**
  - "We're still sitting at 31% of new accounts completing the first three steps before day seven." — `first-hand: a specific past instance` (Sam pulled the activation numbers last week; the 31% figure is a measured state, unchanged from before the checklist shipped two months ago.)
  - "Every single one, the customer is like, okay we set up the account, now what? They don't know what to do with the empty dashboard." — `first-hand: a specific past instance` (Leo reporting from four implementation calls in the last month; this is observed customer behavior across multiple accounts.)
  - "The checklist isn't helping because they don't see it until after they've already decided the product is complicated." — `assumed / hand-wavey` (Leo's interpretation of why the checklist fails; plausible but not directly observed — he's inferring a mental model.)
- **Thin spot:** The claim that customers "already decided the product is complicated" before seeing the checklist. Leo states it as fact, but the evidence is his read of their reaction, not something a customer said. Worth asking: did a customer actually say that, or is it Leo's gloss?

### Customers get stuck at the "connect a data source" step and disengage

- **Who has it:** New customers during guided implementation, at the specific step of connecting a data source — and the CSM (Leo) who has to recover the relationship after they go dark.
- **Evidence:**
  - "Even when I screen-share and walk them through it, they get stuck at connecting the data source. That step has four sub-steps and none of them make sense if you don't know your database URL. Which nobody has handy." — `first-hand: a specific past instance` (Leo reporting from his own screen-share sessions across multiple implementation calls; the failure point is specific and repeatable.)
  - "Three of my accounts just... went dark after that call." — `first-hand: a specific past instance` (Leo reporting a specific count of accounts that disengaged after hitting this step.)
  - "I have to spend half the next call re-explaining the same setup. It's the same conversation every time." — `first-hand: a specific past instance` (Leo reporting the recurring cost of the stuck step — the recovery pattern he runs through repeatedly.)
- **Thin spot:** We hear this from one CSM (Leo) across his accounts. Is this the same pattern across other CSMs' books, or is it specific to his segment / account type? The evidence is strong for Leo's accounts but has not been confirmed broader.

### The onboarding checklist — the shipped solution — isn't reaching users

- **Who has it:** New customers who might benefit from the checklist but never encounter it.
- **Evidence:**
  - "It's in the sidebar. You have to scroll." — `first-hand: a specific past instance` (Sam confirming the checklist's current placement; this is a product fact, not an inference.)
  - "They never find it." — `assumed / hand-wavey` (Leo's assertion, consistent with placement but not backed by a specific observed instance of a customer failing to find it.)
  - The activation rate is unchanged at 31% after two months — `first-hand: a specific past instance` (Sam's measured data; the checklist has had no detectable effect on the metric it was built to move.)
- **Thin spot:** Nobody has direct evidence of a customer looking for onboarding guidance and failing to find the checklist. The 31% stall is real but doesn't isolate "discoverability" as the cause — the checklist could be discoverable and still not work.

## How they relate (a guess)

These look like a chain, held loosely:

Problem 1 (empty-dashboard confusion) is the entry condition. Problem 3 (checklist invisible) means the shipped remedy doesn't intervene. Problem 2 (data-source step is a wall) is where the damage happens — customers hit a hard prerequisite they can't clear, and disengage.

The chain is: confused arrival -> no guidance found -> stuck at a hard step -> gone dark. But this is a guess — it's also possible that fixing the data-source step alone would move numbers even without the checklist, or that the empty-dashboard confusion is less important than it seems (Leo sees it on calls, but we don't know if self-serve users feel the same way).

## What this means for the solution (so far)

The material doesn't name a specific proposed solution beyond the existing checklist. The evidence so far **complicates** the checklist as a fix: it shipped two months ago and the number hasn't moved. The strongest evidence points to two things the checklist can't solve from its current position — (1) customers don't find it, and (2) even when walked through setup manually, they hit a hard blocker at the data-source step that requires information they don't have on hand. A better checklist in the same sidebar slot may not help. The data-source step itself may be the load-bearing problem — but that's where the evidence is thickest, not where it's proven.
