# Vision Slot Pegs: The Refusal & Fence

Ported from the canvas-library-spike prototype. Read this file before Raven drafts or elicits this slot.

## Deep Guidance

### Job
Trap-shaped anti-positions. Names what *looks aligned* with this Vision but would undermine it if served. With structural reasons connected to earlier slots.

The Fence half prunes the build. It names what the library build should not chase: out-of-scope subsystems, shapes this product is not, and external-dependency neighbors that are not part of this product.

### Not the job
- Not a list of segments outside the positive target (the positive target already implies that)
- Not preferences disguised as positions
- Not insults aimed at non-customers
- Not "not for everyone" (meaningless)
- Not a comprehensive architecture boundary
- Not a license to ignore evidence inside the declared product
- Not a sweep brief; it is the scope cut the sweep reads before it starts

### Common failure modes
- **Segments instead of traps.** "Not for enterprises" is a segment. "Not for the enterprise division that 'happens to have a small team' — because the buying motion drags governance demands that reshape the product" is a trap with structural reasoning.
- **Insults.** "Not for people who don't value good tools."
- **Refusals you'd break for money.** If you'd sell to them with a $1M check in hand, it's a preference, not a refusal.
- **Refusals without reasons.** Each refusal must connect back to a slot earlier in the document.
- **No fence.** The slot says who not to sell to but never tells the build which subsystems, shapes, or neighboring dependencies to ignore.
- **Fence as denial.** The slot excludes a source trail because it is inconvenient, not because it is out of product scope.
- **External neighbors smuggled in.** Integrations, host apps, or adjacent teams become part of the product just because the product depends on them.
- **Generic.** "Not for everyone." Helps no one decide anything.

### Sharpness target
2–3 anti-positions plus the build fence. Each anti-position names a specific trap or shape of customer, has a reason connected back to a specific earlier slot, and is one you'd hold to with money in hand. The fence names out-of-scope subsystems, shapes this product is not, and external neighbors the build should treat as dependencies rather than product parts.

### Diagnostic test
For each refusal: would you sell to them with a $1M check in hand? If yes, it's not a refusal. Then: does the reason connect back to a specific earlier slot? If no, the refusal isn't structural — it's a hunch.

For the fence: could a builder stop reading a plausible but irrelevant subsystem because this slot says it is outside the product? Could they avoid chasing a shape The Shape explicitly excluded? Could they treat a neighbor as an external dependency instead of reconstructing it as part of the product?

### How it connects
Refusal & Fence is the most downstream slot. It depends on earlier slots to explain *why* something is a trap and uses Shape plus The Work to explain what the build should not chase. Without the earlier slots, refusals look arbitrary and fences look like preferences. A well-written Refusal & Fence slot also often surfaces a refinement to the positive target in earlier slots — sometimes the act of naming what you refuse reveals that what you positively target was a proxy for something deeper.

---

## Examples

### Good example *(Stripe)*

> - **Not for the AR/AP buyer.** Companies whose primary payments need is invoicing, accounts receivable, or treasury automation should reach for a finance-buyer-shaped product. We will turn them down even with money in hand. *Reason: serving them would drift us toward finance-buyer feature requests and erode the developer-first feel that's the entire Mechanism.*
> - **Not for businesses without a developer in the loop.** A retail SMB whose owner doesn't code is better served by Square or a POS product. *Reason: our value depends on the integration being intimate; without a developer, there's no integration to be intimate with.*
> - **Not "enterprise payment processing" in the legacy-procurement sense.** Companies whose buying motion is multi-quarter vendor evaluations led by procurement aren't a fit, even with large contracts. *Reason: their cycle drags governance overhead that reshapes the product into something a developer can no longer pick up at 11 PM.*

**Why it works:**
- Each is a *real trap* — you can imagine these customers showing up with money.
- Each has a *structural reason* connected back to earlier slots (Mechanism, Felt Experience).
- Each is one Stripe would actually hold to.

### Good fence add-on *(claims review tool)*

> **Build fence:** scan only the claims workflow and its claim records. Do not reconstruct the billing ledger, the customer CRM, or the email gateway as part of this product. Treat the payout rails and the identity provider as external neighbors unless the claims tool stores product-owned state about them.

**Why it works:**
- Names the in-scope surface.
- Prunes plausible adjacent systems before the sweep starts.
- Treats dependencies as neighbors rather than hidden product parts.
- Gives the build a concrete "not this" boundary.

### Bad example

> - Not for everyone.
> - Not for people who don't care about developer experience.
> - Not for businesses that want bad APIs.

**Why it fails:**
- "Not for everyone" — meaningless; helps no one decide anything.
- "Not for people who don't care about X" — insulting and unactionable. Nobody self-identifies as not caring.
- "Not for businesses that want bad APIs" — strawman that no buyer would agree they want.

### The pattern

Good Refusals name *real customer shapes* with *structural reasons* and give the build a scope fence. Bad Refusals say "we're for good people" disguised as a refusal, or leave the build to chase every adjacent system.

---
