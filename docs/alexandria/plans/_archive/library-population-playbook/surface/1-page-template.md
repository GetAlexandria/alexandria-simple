# Surface — 1-page template

A Surface document is a catalog of the named places in the product — each screen, region, or panel a user lands on. One entry per place. Not numbered argument-slots like Vision; the entry shape is repeated N times.

Load-bearing constraints:

- Each entry describes one place as it appears today (or as planned, if not yet built).
- Surfaces are not features. A Surface is a *place*; capabilities live inside it.
- This document is a single catalog, not atomic cards. Atomization is downstream.
- The template must accept what Raven hands it from a Product Walk stop: `name`, `entities_seen`, `capabilities_here`, `experience_note`, `built`, and first `captures` entry.

## How to use this form

- **One entry per Surface.** A Surface is a place in the product with a stable name — a dashboard, a canvas, a settings panel, a bench. If it shares a name and a felt-shape with another place, it's the same Surface.
- **Order by main path.** Entries roughly follow the user's main route through the product; side-trip Surfaces appear after the main-path Surface they branch from.
- **Built status is honest.** `built` / `partial` / `planned` — don't paper over gaps. Planned-but-not-walked Surfaces go in the *What's missing* section at the end.
- **Evidence is required for built Surfaces.** A screenshot reference, a URL, or a clip. If there's none, mark the entry *(no capture)* — that's a coverage signal, not a blocker.
- Suitable for either a human filling it directly OR Raven drafting from a Walk artifact.

---

## Intro

*Length: 2–4 sentences · Pulling for: the shape of the product's surface area at a glance · Quick test: could a stranger predict roughly how many Surfaces the product has and what kind of product it is?*

A brief orientation: what kind of product this is, how many named Surfaces it has, what the main path through them looks like. Not a tour — a map legend.

> *Your answer here.*

---

## Surfaces

One entry per place. Repeat the shape below for each.

### Surface name

*Provisional name, 1–6 words. Refined later in Vocabulary. Example: "the dashboard," "the canvas," "the bench."*

**What's here**

*Length: bullet list, 2–8 items · Pulling for: the nouns visible at this Surface · Quick test: could someone sketch the Surface from this list?*

The entities present at this Surface — cards, coins, panels, strips, rows, members. Nouns, not actions. From the Walk: `entities_seen`.

> - *entity*
> - *entity*

**What you can do**

*Length: bullet list, 2–8 items · Pulling for: the affordances at this Surface · Quick test: are these verbs the user does, not features marketing names?*

The things a user can do while standing on this Surface — add a member, drag a card, filter, open a side panel. Verbs in user-language. From the Walk: `capabilities_here`.

> - *capability*
> - *capability*

**Built status**

*One of: built · partial · planned · Pulling for: honest current state · Quick test: could you screenshot this today?*

> *built | partial | planned* — *if partial or planned, one line on what's missing.*

**Felt shape**

*Length: 1–3 sentences · Pulling for: how this Surface feels to be on — pace, density, mood · Quick test: does it describe the experience, not the UI?*

What it's like to be on this Surface. *Quiet and broad. Dense and fast. Demanding. Sparse, with one thing in focus.* From the Walk: `experience_note`.

> *Your answer here.*

**Evidence**

*Length: 1–3 references · Pulling for: a real artifact a reader can look at · Quick test: does the reference resolve?*

Screenshot path, URL, or clip ref. From the Walk: first `captures` entry. If none, write *(no capture)*.

> *path or URL — one-line caption*

---

*Repeat the entry above for each Surface in the product. Side-trip Surfaces follow the main-path Surface they branch from.*

---

## What's missing

*Length: bullet list, 0–N items · Pulling for: named Surfaces the product plans but the Walk didn't visit · Quick test: would the director recognize each as a place they intend to build?*

Surfaces that exist in the team's plans but weren't walked — either because they're not built yet, or because the Walk didn't reach them. One line each, with status. Feeds the Forward Plan when those entries are tiered.

> - *Surface name — planned/partial — one-line note*

---

*Deeper per-field guidance and worked good/bad Surface entries arrive in a later slice.*
