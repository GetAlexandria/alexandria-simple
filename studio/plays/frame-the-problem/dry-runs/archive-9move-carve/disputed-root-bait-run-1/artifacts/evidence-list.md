# Evidence List

Extracted from: `studio/plays/frame-the-problem-next/fixtures/disputed-root-bait/transcript.md`
Boundary: Lines 5–58 (as defined by `runtime/target-spans.md`)

---

1. **Quote:** "Churn is bad. Like, worse than I've seen. Fourteen of the twenty-six accounts that went live in Q1 never made it to day ninety."
   **Speaker:** Marcus
   **Mark:** pain

2. **Quote:** "almost every one of them said the same thing in some form: they couldn't get alerting working in a way that was useful for them. Not that Streamwatch didn't work — that they couldn't figure out what to alert on, or the alerts they set up were firing so much they turned them off."
   **Speaker:** Marcus
   **Mark:** pain

3. **Quote:** "Can you share which tickets you're looking at? Because I've been watching support volume and I'm not seeing it spike the way you'd expect if it were a product problem."
   **Speaker:** Dev
   **Mark:** disagreement (Dev vs Marcus)

4. **Quote:** "We spent two weeks trying to set up alerts for our Kafka consumers and gave up."
   **Speaker:** Marcus (quoting Kazan's ops lead)
   **Mark:** pain

5. **Quote:** "Getting to a state where alerting is actually useful for their workload. They come in, they try to configure something, and they can't get there. And then we lose them."
   **Speaker:** Marcus
   **Mark:** pain

6. **Quote:** "You're saying they can't get alerting working — but if you look at the configuration flow, it's not that it's hard to use. The issue is the default templates. We ship templates that assume batch processing — daily jobs, hourly aggregations. And the customers who churn are almost all streaming-first. Kafka, Kinesis, whatever. The templates just don't apply to them. They open the template library, see nothing that maps to their architecture, and bounce."
   **Speaker:** Dev
   **Mark:** disagreement (Dev vs Marcus)

7. **Quote:** "they went straight to the custom alert builder. And that's where they got lost. Seven fields, half of them with tooltips that reference concepts your typical ops person doesn't know."
   **Speaker:** Marcus
   **Mark:** pain

8. **Quote:** "The drop-off isn't on field seven. It's on field two. The metric selector. People don't know what metric to select because they don't know how Streamwatch models their pipeline. They haven't built the mental model. So it's not that the form is long — it's that you need prerequisite knowledge to use it at all. That's a different problem from templates."
   **Speaker:** Priya
   **Mark:** pain

9. **Quote:** "that prerequisite knowledge gap — why does it exist? It exists because the templates don't onboard them into the model. A good template says: here is a consumer lag alert for Kafka, here are the metrics it uses, and why. That teaches the model while giving them something working. Template-first is how you close the knowledge gap."
   **Speaker:** Marcus
   **Mark:** evidence-free claim

10. **Quote:** "Or you fix the metric selector to be self-describing. Show the pipeline topology, let people click on a node, see what's measurable. Same outcome, no templates needed."
    **Speaker:** Priya
    **Mark:** evidence-free claim

11. **Quote:** "I'm saying the templates are wrong for the customer base we actually have. That's the root of why they can't configure alerts."
    **Speaker:** Marcus
    **Mark:** evidence-free claim

12. **Quote:** "And I'm saying the configuration UI assumes knowledge they don't have. That's why they fail — templates or no templates. If you put better templates in front of the current builder, the Kazan ops lead still bounces on field two."
    **Speaker:** Priya
    **Mark:** disagreement (Priya vs Marcus)

13. **Quote:** "You don't know that."
    **Speaker:** Marcus
    **Mark:** disagreement (Marcus vs Priya)

14. **Quote:** "You don't know they would have succeeded with streaming templates either."
    **Speaker:** Priya
    **Mark:** disagreement (Priya vs Marcus)

15. **Quote:** "We don't have the data to close this, do we."
    **Speaker:** Layla
    **Mark:** pain

16. **Quote:** "No. We'd need to run a test — put a cohort through with proper streaming templates and see if retention improves. We haven't done that."
    **Speaker:** Priya
    **Mark:** unclear

17. **Quote:** "the exit interviews point at templates."
    **Speaker:** Marcus
    **Mark:** evidence-free claim

18. **Quote:** "The exit interviews say 'alerting wasn't useful.' They don't say templates. That's your interpretation."
    **Speaker:** Priya
    **Mark:** disagreement (Priya vs Marcus)

19. **Quote:** "separate from the customers who give up on configuration — there's a set who do configure something, but then get flooded. Alert noise. They set a threshold, it fires constantly, they silence it, and then nothing catches the real incidents either. That's a different failure mode."
    **Speaker:** Marcus
    **Mark:** pain

20. **Quote:** "The default threshold values are very aggressive. Almost anything will trigger."
    **Speaker:** Dev
    **Mark:** pain

21. **Quote:** "So that's a distinct problem — configured alerts that fire too much and lose trust."
    **Speaker:** Layla
    **Mark:** pain

22. **Quote:** "the exit interviews actually split on that. Some left because they couldn't configure anything useful. Some configured stuff but the noise killed it."
    **Speaker:** Marcus
    **Mark:** pain
