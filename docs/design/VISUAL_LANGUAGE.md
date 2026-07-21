# Visual Language — Direction

Status: **Design direction. Phase 00 implements only the restrained subset noted
at the end.**

This document names the intended visual identity so later phases build toward
one thing rather than drifting. It is deliberately not a Phase 00 redesign:
over-decorating a foundation is its own failure.

## The reference blend

Field Intelligence OS should look like the intersection of seven things, none of
them a generic SaaS dashboard:

1. **Editorial publication design** — a considered typographic hierarchy;
   content that reads, not just displays.
2. **Scientific field notebook** — dated entries, observations distinguished
   from conclusions, room for uncertainty.
3. **Legal evidence index** — every item numbered, sourced, and traceable; the
   record IDs are part of the aesthetic, not hidden.
4. **Documentary contact sheet** — media shown as a grid of captured moments,
   each with its metadata legible.
5. **Geographic and time stamps** — where and when are first-class, shown on the
   record, not buried in a detail panel.
6. **Provenance chains** — a claim visibly connected to its evidence to its
   source; the chain is the interface.
7. **System maps** — actors, rules and handoffs drawn as graphs, with observed
   and claimed steps rendered differently.

The through-line: this is an instrument for establishing what is true and how we
know it. The design should feel like evidence handling, not content management.

## Principles

- **Monospace for anything that identifies a record** — IDs, timestamps,
  coordinates. Already in the tokens.
- **Structure over decoration** — a diagram that shows a real relationship beats
  an icon that shows nothing. The module placeholders already do this.
- **Uncertainty is visible** — verification, consent and restriction states are
  never implied; they are shown, and never by color alone.
- **Density is earned** — desktop is research-dense; Field Mode is sparse and
  large. Same system, opposite ends.

## Future theme modes (F7)

Recorded now, implemented with Field Mode (ADR-007). The product will support:

- **System** (current default)
- **Light**
- **Dark**
- **High-glare / daylight** — maximum contrast for direct sun.
- **Low-light** — dim, red-shifted where possible for night use.
- **Maximum contrast** — an accessibility mode beyond standard dark/light.

The token architecture already anticipates this: all colors are CSS custom
properties in one place, so a new mode is a new set of values, not a component
rewrite.

## Restrained Phase 00 improvements (in scope)

These are the only visual changes Phase 00 makes toward the above; the rest is
deferred:

- Semantic color roles split out (F1), so "action", "link", "attention" and
  status can diverge visually as the identity develops.
- Record IDs and timestamps already render monospace.
- Structure diagrams on placeholders (E1) establish the "structure over
  decoration" principle early.
- A preview/demonstration visual language (`PreviewBadge`, `DemoDataBanner`)
  kept deliberately outside the record-status palette.

## Not in scope for Phase 00

A signature typeface, a contact-sheet media grid, rendered provenance chains,
interactive system maps, and the daylight/low-light themes. These are named here
so they are built deliberately, not improvised.
