# For the Director — Raven's marching orders

## What to put in front of him

Hand him `runtime/problem-framing.md` as-is. The framing is concrete enough to react to: two problems, a disputed root cause on the first, a thin evidence base on the second. Tell him: "This is what I pulled out of the meeting transcript. I want to check the bones before we go further."

## What to draw out

### 1. The disputed root cause needs a tiebreaker — but first, check if he already has one

Marcus and Priya disagree on why customers fail at alert configuration: template-content gap vs. UI-knowledge gap. The meeting ended with everyone agreeing there's no data to pick one. But the director may have a view, or may have seen something since.

**The move:** "Marcus says it's the templates — they don't cover streaming workloads, so customers have nothing to start from. Priya says it's the metric selector — customers don't understand how Streamwatch models their pipeline, so they stall on field two regardless of templates. The team agreed they'd need a test to close it. Do you have a read on which one is closer, or have you seen anything since that meeting that points one way?"

If he picks a side without evidence, the follow-up is: **"Can you tell me about a specific customer or session where you saw that happen?"** He doesn't need a date — he needs one real instance.

### 2. The alert-fatigue problem needs a specific case

The framing has a named customer for the configuration problem (Kazan) but no named customer for the alert-noise problem. Dev and Marcus both say it exists, and exit interviews confirm a split, but nobody put a face on it.

**The move:** "The second problem — customers who configure alerts but get flooded — is real but I don't have a specific customer to anchor it. Can you think of one account where that happened? Someone who got alerts running and then bailed because of noise?"

**Evidence bar:** One specific account name and what happened. "Noise is a problem" is hand-wavey. "Initech configured CPU alerts on their Kinesis consumers, got 400 alerts in the first week, silenced everything, and missed a real outage" is evidence.

### 3. (Optional, if time) — Does the 14/26 number hold up under scrutiny?

Dev pushed back that support volume doesn't match the picture Marcus painted. Marcus promised to share the ticket doc but hadn't yet. The director may or may not care about validating the denominator, but if he's going to act on "14 of 26 churned," it's worth knowing whether Dev's concern has been resolved.

**The move (only if the first two are settled):** "Marcus's 14-of-26 number is the anchor for urgency. Dev noted support volume didn't spike to match. Has Marcus shared that ticket doc? Are we confident in the number?"
