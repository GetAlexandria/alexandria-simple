# Problem Brief — Enterprise alerting churn in Streamwatch
framed with: surface map [provided] · users [provided] · prior brief [not provided]
run: complete

## The picture
Enterprise accounts are churning before day ninety because alerting never becomes useful. Some customers cannot get a working alert configured at all — the product assumes knowledge they haven't built. Others configure alerts, get buried in noise, silence everything, and end up with no working monitoring. The room agrees on both failure modes but disagrees about what blocks configuration, and nobody has the data to settle it yet.

## P1 — "We can't get alerting working for our workloads — nothing in the product maps to what we actually run"
- progress sought: Enterprise data ops leads are trying to get Streamwatch alerting running against their production workloads — to reach a state where alerts cover the incidents that matter in their pipelines, so they can stop thinking about setup.
- who: Enterprise data ops leads at streaming-oriented accounts (Kafka, Kinesis); attributed via the users file. Kazan's ops lead is named specifically by Marcus (Customer Success Lead).
- circumstance: During the ninety-day activation window after going live. The ops lead opens the product to configure alerting. They find templates built for batch processing — daily jobs, hourly aggregations — nothing matching their streaming infrastructure. They try the custom alert builder and hit the metric selector (the second field), which requires them to already understand Streamwatch's internal metric taxonomy. They haven't built that mental model. They stall and eventually abandon the attempt.
- evidence:
  - "Fourteen of the twenty-six accounts that went live in Q1 never made it to day ninety." — Marcus — specific-past
  - "almost every one of them said the same thing in some form: they couldn't get alerting working in a way that was useful for them. Not that Streamwatch didn't work — that they couldn't figure out what to alert on, or the alerts they set up were firing so much they turned them off." — Marcus — specific-past
  - "We spent two weeks trying to set up alerts for our Kafka consumers and gave up." — Marcus quoting Kazan's ops lead — commitment
  - "Getting to a state where alerting is actually useful for their workload. They come in, they try to configure something, and they can't get there. And then we lose them." — Marcus — opinion (conviction high)
  - "We ship templates that assume batch processing — daily jobs, hourly aggregations. And the customers who churn are almost all streaming-first. Kafka, Kinesis, whatever. The templates just don't apply to them. They open the template library, see nothing that maps to their architecture, and bounce." — Dev — opinion (conviction high)
  - "they went straight to the custom alert builder. And that's where they got lost. Seven fields, half of them with tooltips that reference concepts your typical ops person doesn't know." — Marcus — specific-past
  - "The drop-off isn't on field seven. It's on field two. The metric selector. People don't know what metric to select because they don't know how Streamwatch models their pipeline. They haven't built the mental model. So it's not that the form is long — it's that you need prerequisite knowledge to use it at all. That's a different problem from templates." — Priya — specific-past + opinion (conviction high)
  - "The exit interviews say "alerting wasn't useful." They don't say templates. That's your interpretation." — Priya — opinion (conviction high)
- what it's not: This is not a request for streaming templates, nor a request to redesign the custom alert builder. Those are two competing solutions proposed in the room (Marcus argues templates; Priya argues a self-describing metric selector). The problem is that streaming-oriented ops leads cannot bridge from their own infrastructure knowledge to a working alert — by either path the product currently offers.
- where it lands: Alert configuration flow — spanning both the template library (missing streaming coverage) and the custom alert builder (metric selector requires prerequisite knowledge of Streamwatch's internal metric taxonomy)
- insight (my read): The room agrees the gap exists but disagrees on where the binding constraint sits — missing templates, or a builder that assumes knowledge customers lack. Those diagnoses imply different solutions. The data to settle it does not yet exist.
- checks: pass

## P2 — "They set a threshold, it fires constantly, they silence it, and then nothing catches the real incidents either"
- progress sought: Enterprise data ops leads who have gotten past configuration want alerts that distinguish real incidents from noise, so that when something fires it means something and the team actually responds.
- who: Enterprise data ops leads at accounts that successfully configured alerts. A distinct subset of the same customer segment as P1 — those who got through setup but churned anyway. Attributed via the users file.
- circumstance: After initial alert configuration. The ops lead sets a threshold, and the alert fires constantly — on routine fluctuations, not just real incidents. The team silences the alert to stop the noise. Now the alert catches nothing, including the real failures it was meant to surface. The monitoring that exists is worse than no monitoring: it has consumed trust.
- evidence:
  - "So separate from the customers who give up on configuration — there's a set who do configure something, but then get flooded. Alert noise. They set a threshold, it fires constantly, they silence it, and then nothing catches the real incidents either. That's a different failure mode." — Marcus — specific-past + opinion (conviction high)
  - "The default threshold values are very aggressive. Almost anything will trigger." — Dev — opinion (conviction high)
  - "So that's a distinct problem — configured alerts that fire too much and lose trust." — Layla — opinion (conviction high)
  - "And the exit interviews actually split on that. Some left because they couldn't configure anything useful. Some configured stuff but the noise killed it." — Marcus — specific-past
- what it's not: This is not a request to tune thresholds or add auto-tuning. Those are possible solutions. The problem is that alerts that fire on everything are functionally the same as no alerts — the ops lead's team stops trusting the system, silences it, and misses real incidents.
- where it lands: Alert threshold defaults — the seeded values applied when a customer creates an alert
- checks: pass

## Unclear — kept, not promoted
- "Can you share which tickets you're looking at? Because I've been watching support volume and I'm not seeing it spike the way you'd expect if it were a product problem." — Dev — questions whether support data corroborates the churn signal; an internal data-visibility question, not a user problem.
- "Okay, but that prerequisite knowledge gap — why does it exist? It exists because the templates don't onboard them into the model. A good template says: here is a consumer lag alert for Kafka, here are the metrics it uses, and why. That teaches the model while giving them something working." — Marcus — a solution argument (templates as the onboarding path), not a problem statement. The underlying problem is captured in P1.
- "Or you fix the metric selector to be self-describing. Show the pipeline topology, let people click on a node, see what's measurable. Same outcome, no templates needed." — Priya — a competing solution argument (self-describing UI), not a problem statement. The underlying problem is captured in P1.
- "I'm saying the templates are wrong for the customer base we actually have. That's the root of why they can't configure alerts." — Marcus — a root-cause claim favoring one side of the dispute in P1.
- "No. We'd need to run a test — put a cohort through with proper streaming templates and see if retention improves. We haven't done that." — Priya — an observation about missing validation data. Not a user problem; noted in P1's "what it's not" section.

## Relationships
- P1 ↔ P2: sibling — Both are failures in the alerting experience for the same user population, but they are distinct and attackable separately. P1 blocks at configuration: the ops lead never reaches a working alert. P2 occurs after configuration: the ops lead has a working alert but it fires indiscriminately and the team loses trust. Solving one does not solve the other. An ops lead who gets past a fixed configuration flow still hits aggressive defaults; an ops lead who benefits from better defaults still cannot configure an alert if the template and metric-selector gaps remain.
- Root cause of P1: disputed — Marcus and Dev vs Priya. Marcus attributes the failure to missing streaming templates; Dev corroborates the template-mismatch diagnosis. Priya attributes it to the metric selector requiring prerequisite knowledge of Streamwatch's internal model, citing Loupe session data showing the drop-off concentrates at the metric selector regardless of template availability. **Test:** run a cohort of streaming-oriented new accounts through onboarding with streaming templates present and measure whether retention improves and whether the Loupe drop-off at the metric selector persists. Priya named this test explicitly. If retention improves and the drop-off disappears, templates were the binding constraint. If retention improves but the drop-off remains, templates help but the knowledge gap is a separate barrier. If retention does not improve, templates were not the constraint.

## Hunch
None earned. The cause of P1 is under active dispute between Marcus and Priya, and the room acknowledged they lack the data to resolve it. P1 and P2 are siblings — distinct failure modes, neither downstream of the other. There is no undisputed structural relationship in the evidence that supports a root claim.

## Spoken (75 words is the ceiling, not a target)
"The room surfaced two problems behind the churn, not one — customers who never get a working alert configured, and customers whose alerts fire so much the team stops trusting them. On configuration, Marcus and Priya read the cause differently — missing streaming templates versus a builder that assumes knowledge customers haven't built. The brief has both reads and a cohort test that would settle it. Who could you run that test with?"
