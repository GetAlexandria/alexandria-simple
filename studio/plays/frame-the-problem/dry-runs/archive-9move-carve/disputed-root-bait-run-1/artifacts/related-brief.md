# Draft Problem Brief

framed with: surface map [provided] · users [provided] · prior brief [not provided]

---

## Problem 1 — "We can't get alerting working for our workloads — nothing in the product maps to what we actually run"

**Progress sought:** Enterprise data ops leads are trying to reach a state where Streamwatch alerts cover the things that matter in their pipeline — consumer lag, throughput drops, the failures specific to their streaming architecture — so that monitoring is running and they can stop thinking about setup.

**Who:** Enterprise data ops leads at streaming-oriented accounts (Kafka, Kinesis). Resolved from Kazan's ops lead specifically, and the broader Q1 enterprise cohort described by Marcus (Customer Success Lead).

**Circumstance:** During the ninety-day activation window after going live. The ops lead opens the product to configure alerting. They look at the template library and find templates built for batch processing — daily jobs, hourly aggregations — nothing that matches their streaming infrastructure. They try the custom alert builder instead and hit the metric selector (field two), which requires them to already understand Streamwatch's internal metric taxonomy. They haven't built that mental model. They stall, keep trying, and eventually give up.

**Evidence:**

1. "Fourteen of the twenty-six accounts that went live in Q1 never made it to day ninety." — Marcus · `specific-past`
2. "almost every one of them said the same thing in some form: they couldn't get alerting working in a way that was useful for them. Not that Streamwatch didn't work — that they couldn't figure out what to alert on, or the alerts they set up were firing so much they turned them off." — Marcus · `specific-past` (the exit interviews happened and the responses were recorded) · Note: "they couldn't figure out what to alert on" is Marcus's summary of customer statements; the customers' own words appear in evidence 4.
3. "We spent two weeks trying to set up alerts for our Kafka consumers and gave up." — Marcus quoting Kazan's ops lead · `commitment` — engineering time actually spent and lost on a failed attempt.
4. "Getting to a state where alerting is actually useful for their workload. They come in, they try to configure something, and they can't get there. And then we lose them." — Marcus · `opinion` — Marcus's synthesis of the pattern he sees across accounts; conviction high.
5. "We ship templates that assume batch processing — daily jobs, hourly aggregations. And the customers who churn are almost all streaming-first. Kafka, Kinesis, whatever. The templates just don't apply to them. They open the template library, see nothing that maps to their architecture, and bounce." — Dev · `opinion` — Dev's diagnosis of the mismatch; conviction high, grounded in product knowledge.
6. "they went straight to the custom alert builder. And that's where they got lost. Seven fields, half of them with tooltips that reference concepts your typical ops person doesn't know." — Marcus · `specific-past` — recounting what Kazan did and what he observed in the builder.
7. "The drop-off isn't on field seven. It's on field two. The metric selector. People don't know what metric to select because they don't know how Streamwatch models their pipeline. They haven't built the mental model. So it's not that the form is long — it's that you need prerequisite knowledge to use it at all. That's a different problem from templates." — Priya · `specific-past` (Priya examined Loupe session recordings and located the actual drop-off point) + `opinion` ("it's that you need prerequisite knowledge to use it at all" — her causal interpretation; conviction high).
8. "The exit interviews say "alerting wasn't useful." They don't say templates. That's your interpretation." — Priya · `opinion` — Priya challenging Marcus's attribution; conviction high.

**What it's not:** This is not a request for streaming templates, nor a request to redesign the custom alert builder. Those are two competing solutions proposed in the room (Marcus argues templates; Priya argues a self-describing metric selector). The problem is that streaming-oriented ops leads cannot bridge from their own infrastructure knowledge to a working alert — by either path the product currently offers. The room does not have data to determine which path would close the gap (evidence: "We don't have the data to close this, do we." — Layla; "No. We'd need to run a test — put a cohort through with proper streaming templates and see if retention improves. We haven't done that." — Priya).

**Where it lands:** Alert configuration flow — spanning both the template library (missing streaming coverage) and the custom alert builder (metric selector requires prerequisite knowledge of Streamwatch's internal metric taxonomy). Per the surface map, the template library ships batch-oriented defaults only, and the metric selector requires familiarity with Streamwatch's internal metric taxonomy.

---

## Problem 2 — "We set up alerts and they fire on everything — now we ignore them and miss what actually matters"

**Progress sought:** Enterprise data ops leads who have gotten past configuration want alerts that distinguish real incidents from noise, so that when something fires it means something and the team actually responds.

**Who:** Enterprise data ops leads at accounts that successfully configured alerts. A distinct subset of the Q1 enterprise cohort — those who got through setup but churned anyway.

**Circumstance:** After initial alert configuration. The ops lead sets a threshold, and the alert fires constantly — on routine fluctuations, not just real incidents. The team silences the alert to stop the noise. Now the alert catches nothing, including the real failures it was meant to surface. The monitoring that exists is worse than no monitoring: it has consumed trust. When something genuinely breaks, nobody looks at Streamwatch because past alerts were meaningless.

**Evidence:**

1. "So separate from the customers who give up on configuration — there's a set who do configure something, but then get flooded. Alert noise. They set a threshold, it fires constantly, they silence it, and then nothing catches the real incidents either. That's a different failure mode." — Marcus · `specific-past` (he's describing accounts he's seen follow this pattern) + `opinion` ("That's a different failure mode" — his classification; conviction high).
2. "The default threshold values are very aggressive. Almost anything will trigger." — Dev · `opinion` — Dev confirming the product ships aggressive defaults; conviction high, stated as product knowledge.
3. "So that's a distinct problem — configured alerts that fire too much and lose trust." — Layla · `opinion` — Layla naming the pattern; conviction high.
4. "And the exit interviews actually split on that. Some left because they couldn't configure anything useful. Some configured stuff but the noise killed it." — Marcus · `specific-past` — the exit interviews exist and showed this split.

**What it's not:** This is not a request to tune thresholds or add auto-tuning. Those are possible solutions. The problem is that alerts that fire on everything are functionally the same as no alerts — the ops lead's team stops trusting the system, silences it, and misses real incidents.

**Where it lands:** Alert threshold defaults — per the surface map, seeded with aggressive sensitivity and no auto-tuning. The noise originates in the threshold values set at alert creation.

---

## Unclear

The following highlights from the evidence list did not earn a problem entry but are not dropped.

1. "Can you share which tickets you're looking at? Because I've been watching support volume and I'm not seeing it spike the way you'd expect if it were a product problem." — Dev · This is Dev questioning whether support data corroborates Marcus's churn signal. It surfaces a possible tension — the churn may not be showing up through the support channel — but no one in the room resolves it. It does not describe a user problem; it describes an internal data-visibility question for the Streamwatch team.

2. "Okay, but that prerequisite knowledge gap — why does it exist? It exists because the templates don't onboard them into the model. A good template says: here is a consumer lag alert for Kafka, here are the metrics it uses, and why. That teaches the model while giving them something working. Template-first is how you close the knowledge gap." — Marcus · This is a solution argument (templates as the onboarding path), not a problem statement. The underlying problem it attempts to solve — the knowledge gap — is captured in Problem 1.

3. "Or you fix the metric selector to be self-describing. Show the pipeline topology, let people click on a node, see what's measurable. Same outcome, no templates needed." — Priya · This is a competing solution argument (self-describing UI), not a problem statement. The underlying problem it attempts to solve is the same knowledge gap captured in Problem 1.

4. "I'm saying the templates are wrong for the customer base we actually have. That's the root of why they can't configure alerts." — Marcus · Solution-flavored root-cause claim. Captured as contributing evidence within Problem 1 but does not constitute a separate problem.

5. "No. We'd need to run a test — put a cohort through with proper streaming templates and see if retention improves. We haven't done that." — Priya · An observation about missing validation data. Not a user problem; it describes the team's inability to resolve their internal disagreement. The absence of data is noted in Problem 1's "what it's not" section.

---

## Relationships

- Problem 1 ↔ Problem 2: `sibling` — Both are failures in the alerting experience for the same user population, but they are distinct and attackable separately. Problem 1 blocks at configuration: the ops lead never reaches a working alert. Problem 2 occurs after configuration: the ops lead has a working alert but it fires indiscriminately and the team loses trust. Solving one does not solve the other. An ops lead who gets past a fixed configuration flow still hits aggressive defaults; an ops lead who benefits from better defaults still cannot configure an alert if the template and metric-selector gaps remain.

- Within Problem 1 — cause: `disputed` — Marcus vs. Priya over what blocks configuration. Marcus attributes the failure to missing streaming templates ("I'm saying the templates are wrong for the customer base we actually have. That's the root of why they can't configure alerts."). Dev corroborates the template-mismatch diagnosis ("We ship templates that assume batch processing — daily jobs, hourly aggregations. And the customers who churn are almost all streaming-first. Kafka, Kinesis, whatever. The templates just don't apply to them."). Priya attributes it to the metric selector requiring prerequisite knowledge of Streamwatch's internal model ("The drop-off isn't on field seven. It's on field two. The metric selector. People don't know what metric to select because they don't know how Streamwatch models their pipeline. They haven't built the mental model. So it's not that the form is long — it's that you need prerequisite knowledge to use it at all. That's a different problem from templates."). Both candidate causes — template gap and metric-selector knowledge gap — live inside this dispute. Neither is promoted to a standalone causal edge. **Test:** run a cohort of streaming-oriented accounts through onboarding with streaming templates present and measure whether retention improves relative to the baseline Q1 cohort. Priya named this test explicitly ("No. We'd need to run a test — put a cohort through with proper streaming templates and see if retention improves. We haven't done that."). If the template cohort retains, the template-gap attribution holds. If it doesn't — if ops leads still stall at the metric selector even with streaming templates available — Priya's attribution holds. The test is gatherable: it requires a set of streaming templates (Dev can scope the build), a cohort of new streaming-oriented accounts, and a retention measurement window matching the ninety-day activation window Marcus cited.

---

## Hunch

None earned. The cause of Problem 1 is under active dispute between Marcus and Priya, and the room acknowledged they lack the data to resolve it. Problem 1 and Problem 2 are siblings — distinct failure modes, neither downstream of the other. There is no undisputed structural relationship in the evidence that supports a root claim.
