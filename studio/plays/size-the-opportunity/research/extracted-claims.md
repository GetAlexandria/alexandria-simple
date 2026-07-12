# Extracted claims — opportunity sizing canon (2026-06-11)

Status: **extracted; verification pass run same day** on the five most
load-bearing search-snippet-only claims. Confirmed material graduates to
`grounding.md`, caveats inline. Two Sonnet researchers (method report +
quality/failure report); synthesis and verification by this agent.

Legend: [F] fetched-and-verified · [S] search-snippet-only
· [P] paywalled/login-walled · [I] inference

---

## Verification pass — verdicts (same day)

1. VC Factory "1% of a $100B market" wishful-thinking framing: **CONFIRMED-PRIMARY**
   — fetched thevcfactory.com/startup-pitch-decks/; verbatim: "They don't fall
   into the 'TAM trap,' where founders highlight an immense market and argue that
   by capturing just '1%', they'd be on their way to creating a unicorn." The raw
   report quote ("Market sizing by wishful thinking — 'We need just 1% of a $100B
   market' — is a common mistake.") is a paraphrase of this passage, not a direct
   verbatim. Use primary wording.

2. Strategyn Cordis case "from 1% to over 20%": **CONFIRMED-PRIMARY WITH
   CORRECTION** — fetched strategyn.com/outcome-driven-innovation-process/;
   verbatim from Rick Faleschini (Cordis): "Our market share grew from 2% to over
   20%." The raw report stated "1%" as the starting figure; primary source says
   "2%." Use the primary figure.

3. Waveup "2026 VCs increasingly anchor on bottom-up": **CONFIRMED-PRIMARY** —
   fetched waveup.com; verbatim: "2026 VCs increasingly anchor on the bottom-up
   number — top-down is for context, bottom-up is what they pressure-test." Note:
   this is from a vendor advisory firm; represents strong practitioner consensus,
   not an empirical survey.

4. PitchDoctor "top-down not convincing / bottom-up always the winning approach":
   **CONFIRMED-SECONDARY** — fetched visible.vc which quotes it verbatim: "Top-
   down market sizes are not convincing … Bottoms-up market sizes are always the
   winning approach." Attribution traces to PitchDoctor; not independently
   confirmed at primary PitchDoctor URL in this pass.

5. ProductPlan "85% of PMs do not know Cost of Delay / intuitive estimates differ
   by 50 to 1": **UNCONFIRMED** — fetched productplan.com/learn/justify-
   opportunity-cost/ and productplan.com/learn/product-manager-cost-of-delay/;
   neither page contains the 85% figure or the "50 to 1" statistic. The "50 to 1"
   figure is attributed in the raw report to Don Reinertsen (Principles of Product
   Development Flow) but could not be confirmed in the fetched ProductPlan pages.
   Do not quote the 85% or 50:1 figures as verbatim. The concept (cost of delay is
   chronically underestimated, Reinertsen) is sound but the specific numbers are
   unconfirmable from the cited URL. The "We're not profiting from a feature that
   is not in production" quote was confirmed at the productplan.com CoD page,
   attributed to Derek Heuther, ALM Platforms.

---

## Section 1 — What opportunity sizing is

- TAM (Total Addressable Market): the maximum revenue opportunity if a company
  captured 100% of demand for its product, with no geographic, competitive, or
  awareness constraints. "The total revenue opportunity if you sold to 100% of
  the market." [F] optimaljon.medium.com (Jon Warner, investor/VC practitioner)

- SAM (Serviceable Available Market): the portion of TAM a company can
  realistically serve given its business model, geography, and operational
  capabilities. "The portion of TAM that your business can realistically serve."
  [F] optimaljon.medium.com

- SOM (Serviceable Obtainable Market): the near-term revenue target within SAM
  expected to be captured based on specific go-to-market strategy and realistic
  penetration rates. "The portion of SAM that you expect to capture in the near
  term — essentially your target market share." [F] optimaljon.medium.com

- TAM matters to demonstrate market viability; SAM defines strategic focus; SOM
  is what investors actually pressure-test against go-to-market plans. [F]
  waveup.com (Waveup, investor pitch advisory)

- TAM is not potential revenue. "Mistakenly assume that TAM equals potential
  revenue, you might view a $10B market as a $10B revenue opportunity." [F]
  thetopvoices.com

- "A product is not a market. Every product will one day become a thing of the
  past." [F] strategyn.com/outcome-driven-innovation/market-sizing/
  (Tony Ulwick / Strategyn) — the underlying job persists even as products
  become obsolete, so product-level TAM calculations mislead.

- Willingness to pay for a JTBD is distinct from willingness to pay for the
  current product: "What they would pay to get the job done better." [F]
  strategyn.com — hair salon example: patron paying $50 today might pay $100 for
  perfect results, doubling the apparent market.

- Opportunity sizing fires when a go/no-go decision or resource-allocation choice
  between competing initiatives must be made. "Opportunity Sizing isn't so much
  about making a precise forecast... It's really about creating this separation
  so it's easier to make decisions." [F] medium.com/related-works-inc
  (Giovanni Fernandez-Kincade, Related Works)

- Sizing must be pegged to a single North Star metric to be comparable across
  ideas; mixing metrics (revenue for one idea, enrollments for another) makes
  comparison impossible. "If you assess one idea based on projected revenue and
  another on projected enrollments, you'll have no way to compare the two." [F]
  builtin.com/articles/opportunity-sizing

---

## Section 2 — Methods: top-down vs. bottom-up

- Top-down: starts with broad industry data and applies narrowing percentages;
  fast but less accurate due to reliance on broad assumptions. [F]
  uncovered.so/blog/top-down-vs-bottom-up-market-sizing

- Bottom-up: builds from granular customer data; formula: number of potential
  customers × average revenue per user × purchase frequency. [F] uncovered.so

- Practitioners and investors strongly prefer bottom-up because it is grounded
  in real, defensible data and forces the estimator to reveal unit economics.
  "Top-down market sizes are not convincing … Bottoms-up market sizes are always
  the winning approach." [F via secondary: visible.vc] Attribution: PitchDoctor.

- The top-down percentage-market-share assumption is "often an unsubstantiated
  afterthought." "A bottom-up build of future revenue is more useful than basing
  SOM on a hypothetical % share of TAM or SAM." [F] pear.vc/market-sizing-guide/
  (Pear VC)

- Expert best practice: run both methods and triangulate. If bottom-up and
  top-down align within roughly 20%, the estimate is considered credible.
  "If your top-down SAM and bottom-up SOM are within ~20% of each other (after
  normalizing for the layer comparison), most 2026 VCs treat that as a credible
  market." [F] waveup.com — this is vendor advisory consensus, not survey data.

- "Don't limit yourself to one method. The savviest startups (and VCs) will
  calculate market size in multiple ways and see if the numbers triangulate to a
  similar range." [F] optimaljon.medium.com (Jon Warner)

- As of 2026, VCs anchor on the bottom-up number; top-down is for context.
  "2026 VCs increasingly anchor on the bottom-up number — top-down is for
  context, bottom-up is what they pressure-test." [F] waveup.com

- "Top-down answers 'how big is the prize.' Bottom-up answers 'can you actually
  capture it.'" [F] waveup.com

---

## Section 3 — Frameworks for feature/internal-level sizing

- Marty Cagan's Opportunity Assessment (SVPG / Inspired): 10 questions before
  any spec — including "How big is the opportunity? (market size)" and "What
  alternatives are out there? (competitive landscape)" and "Why now? (market
  window)." [F via secondaries] product-frameworks.com; marcabraham.com;
  votito.com (SVPG page 403)

- In Inspired 2nd edition the framework simplifies to four questions: what
  business objective; how will you know success; what problem for customers;
  what type of customer. [F, truncated] oreilly.com/library/view/inspired-2nd-
  edition/9781119387503/c35.xhtml

- The market size question in Cagan's framework is deliberately open-ended; no
  specific sizing methodology is prescribed. [F] marcabraham.com

- RICE scoring (Intercom, Sean McBride): Reach × Impact × Confidence ÷ Effort.
  Reach = people affected per time period. Impact = qualitative scale (3=massive,
  2=high, 1=medium, 0.5=low, 0.25=minimal). Confidence = percentage (100%/
  80%/50%). [F] intercom.com/blog/rice-simple-prioritization-for-product-managers/

- RICE should not be applied rigidly; lower-scoring projects may be prioritized
  for strategic reasons (dependencies, table stakes). "Using RICE provides
  visibility into when you're making deliberate trade-offs against the scoring
  results." [F] intercom.com

- Ulwick's Outcome-Driven Innovation Opportunity Algorithm: Opportunity =
  Importance + max(Importance − Satisfaction, 0). "market opportunity =
  (importance + max,0 (importance – satisfaction))" [F]
  marketingjournal.org (Anthony Ulwick, Strategyn)

- Importance = % of respondents rating a desired outcome 4 or 5 on a 5-point
  importance scale; Satisfaction = % rating current solution 4 or 5. [F]
  medium.com/uxr-microsoft (JP Carrascal, UXR @ Microsoft)

- ODI Opportunity Landscape: underserved zone (high importance, low satisfaction)
  = strongest innovation opportunities. "Underserved area: Strong opportunities
  to innovate; customers willing to pay more for solutions." [F]
  medium.com/uxr-microsoft

- Teresa Torres' Opportunity Solution Tree: four sizing dimensions — how many
  customers affected, how often, how it affects market position, importance vs.
  satisfaction with existing solutions. Prerequisites: defined outcome (North
  Star), theory of target customer, at least 3–4 story-based customer interviews.
  [F] producttalk.org/opportunity-solution-trees/

- Pain-point triage: Severity (1–5) × Frequency (1–5) × Business Impact (1–5).
  "A severe but rare problem may rank lower than a moderate but near-universal
  one." [F] smaply.com/blog/pain-point-prioritization

- Shopify's three rigor levels: (1) directional t-shirt sizing for early
  ideation; (2) bottom-up using comparables for existing initiatives; (3) top-
  down for new initiatives requiring higher rigor. [F]
  shopify.engineering/shopify-data-guide-opportunity-sizing

- Shopify's canonical output statement: "if we build feature X, we will acquire
  MM (+/- delta) new active users in T timeframe under DD assumptions." Use an
  annualized view to compare across initiatives. [F] shopify.engineering

---

## Section 4 — Prerequisites and missing-input convention

- Required inputs (bottom-up school): affected user count in target segment;
  frequency of the pain; average revenue or impact per event; expected lift rate
  from comparable initiatives; current baseline metric. [F] shopify.engineering;
  builtin.com; waveup.com

- Required inputs (Cagan/ODI school): problem statement; target market;
  competitive alternatives; importance and satisfaction scores from customer
  research. [F] product-frameworks.com; marketingjournal.org

- When a data point is missing: do NOT block — proceed directionally, declare
  the gap explicitly, use ranges, and flag which assumption is load-bearing.
  "The nature of opportunity sizing is directional." "As we share and discuss
  this analysis, we can highlight that this is a data point we're not 100%
  certain about." [F] shopify.engineering; medium.com/related-works-inc

- "Be conservative in your initial estimates to account for this lack of
  precision." [F] shopify.engineering

---

## Section 5 — Quality and credibility

- Credible sizing always cites sources. "If you say the market is worth $10B,
  back it up." "Always cite your sources." [F] goingvc.com/post/how-investors-
  use-tam-sam-som-to-evaluate-startups

- "Throwing out an unsubstantiated number reduces the chance of anyone
  believing it." [F] pitchdoctor.app/post/msize-convincing

- "Including irrelevant spend pools means 'VCs will discount your market size
  completely.'" [F] pitchdoctor.app

- "No concrete number leaves ambiguity ('Thousands? Millions? Billions?') and
  damages credibility"; leaving sizing open "forces investors to form
  independent opinions, exposing them to investor bias and laziness." [F]
  pitchdoctor.app

- The process is the proof: "How did you get there? That's what matters." [F]
  underscore.vc/resources/bottom-up-market-size-slide/ (Richard Dulude,
  Underscore VC)

- Strong bottom-up worked example (PipeCo): 120,000 registered US plumbing
  companies × $7,200/year (3 users × $200/user/month × 12) = $864M market.
  All inputs traceable to empirical sources including customer interviews. [F]
  pitchdoctor.app

- Weak vs. strong archetype:
  Weak: "The global smart healthcare market was worth $144B in 2019, and we
  think we can reach 10% of this market in 2021, meaning we're targeting a
  $14B market opportunity."
  Strong: "We're going to sell our product to doctors in hospitals that use
  this specific critical care application, starting in New England. There are
  about 175 hospitals with roughly 80 doctors currently using this kind of
  application. The average selling price will be $3,500 per doctor per year.
  That gives us a $50M market to begin with, with the opportunity to expand
  regionally." [F] underscore.vc (Richard Dulude)

- Recent tech IPOs achieved only 0.1% to 2% share of addressable market; pitch
  decks "often state a 10% potential market share" — systematic optimism bias.
  Even mature companies rarely exceed 20% market share. [F] pear.vc;
  thetopvoices.com

- The critical SOM mistake: "claiming you'll capture 10% of your SAM in year
  one without a clear plan" grounded in tested CAC, pipeline, or conversion
  data. [F] goingvc.com

---

## Section 6 — Failure modes

- "1% of a big market" trap (confirmed primary verbatim): "They don't fall into
  the 'TAM trap,' where founders highlight an immense market and argue that by
  capturing just '1%', they'd be on their way to creating a unicorn. This overly
  simplistic approach often fails to convince experienced investors." [F]
  thevcfactory.com/startup-pitch-decks/

- Revenue vs. transaction volume conflation: "there is $10bn a year to be made"
  differs from "$10bn worth of transactions" (at a 1–3% take rate the latter
  overstates opportunity by 30–100×). [F] pitchdoctor.app

- Confusing TAM with revenue opportunity: "mistakenly assume that TAM equals
  potential revenue." [F] thetopvoices.com

- Narrative vs. operational use: "When TAM becomes a fundraising narrative
  rather than an operational planning tool, misalignment between projected
  opportunity and realized revenue becomes inevitable." [F] zenitdata.com/blog/
  saas-market-sizing/ (Zenit Data)

- Demographic rather than behavioral segmentation inflates opportunity "by
  assuming uniform adoption probability within segments that are heterogeneous in
  practice." [F] zenitdata.com — industry vertical, employee count, geography
  are convenient but insufficient.

- Competitive saturation as ignored constraint: "If a majority of target
  accounts already use a competing solution under multi-year contracts, immediate
  accessibility declines dramatically." [F] zenitdata.com

- Omitting alternatives and do-nothing: "What happens if we DON'T do it?" must
  be explicitly evaluated. Teams may gain "buy-in under false pretenses" by
  discussing only benefits. [F — concept confirmed] productplan.com/learn/
  justify-opportunity-cost/

- Cost of delay as do-nothing cost: "We're not profiting from a feature that is
  not in production, so therefore, we are losing money every day it's not there."
  [F] productplan.com/learn/product-manager-cost-of-delay/ (Derek Heuther,
  ALM Platforms — quoted by ProductPlan)

- "85% of PMs do not know Cost of Delay" and "intuitive estimates differ by 50
  to 1": **UNCONFIRMED** at cited URLs — attributed to Don Reinertsen (Principles
  of Product Development Flow) in circulation; not confirmed verbatim in fetched
  ProductPlan pages. Concept (CoD is chronically underestimated) is sound;
  specific figures are unusable as attributed quotes.

- Strategyn Cordis case (corrected from raw report): "Our market share grew from
  2% to over 20%." [F — primary] strategyn.com (Rick Faleschini, Cordis).
  The raw report cited "1% to over 20%" — the primary source says "2%."

- False precision trap: "The spreadsheet appears coherent. The numbers look
  defensible." A structurally coherent model can have bad inputs and still pass
  surface inspection. [F] zenitdata.com

- TAM as job vs. TAM as product: "Using traditional market sizing methods, a
  company could conclude that the market had no growth potential and was a bad
  investment risk, when in fact the opposite was true." [F]
  strategyn.com/outcome-driven-innovation/market-sizing/ (Ulwick/Strategyn)

- Market sizing failure in SaaS: fails "not because of flawed arithmetic, but
  because of structural modeling errors embedded in segmentation, competitive
  assumptions, data quality and adoption velocity." [F] zenitdata.com

- Analyst reports insufficient for TAM: "their broad conclusions don't take into
  account your unique value proposition." [F] maxio.com/blog/5-myths-of-market-
  sizing (Maxio)

- "The size of the total addressable market (TAM) prize only matters if you have
  a credible and differentiated product." [F] maxio.com

- Opportunity sizing must evaluate scale (how many have it), frequency (how
  often), and severity (how much they care) — not just revenue potential. [F]
  bu.edu/innovate (Boston University Innovate)

- Three severity signals: people already spend money on inadequate solutions and
  demonstrate significant time on workarounds = strong signals. "I guess that
  would be nice" or no prior attempts to solve it = weak signals. [F] bu.edu

- Comparing alternatives on inconsistent metrics makes prioritization meaningless
  and no valid conclusion is possible. [F] builtin.com

- Bottom-up sizing should be validated post-launch by comparing estimates to
  actuals. "Once your initiative launches, test to see how close your sizing
  estimates were to actuals." [F] shopify.engineering

- Reforge proprietary formula (affected users × frequency × average value): not
  confirmed in public sources; may exist in paid course materials. [I — cannot
  verify]

- Bad data costs $15M annually / 25% of potential revenue / 60% of businesses
  don't measure: [S] ideafloat.com — primary source for the figures not
  identified in the fetched content. Treat as unverified. Do not use.
