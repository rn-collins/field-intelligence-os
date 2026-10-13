# Phase 04 — The Minimum Capture Package

Status: **Specification. Not implemented in Phase 00.**
Owner of this spec: the Field Investigation method (see `docs/source-materials/`).

## What this is

The minimum capture package is the set of records, footage, stills and audio
that make a subject **reconstructable later** — enough reality that the place,
the people, the process and the investigator's understanding can be rebuilt
after the trip, not just described.

It is not a wish list and not a quick note. It is a checklist the operator works
against on site, ending in a single decision: **is it safe to leave?**

This is distinct from the "quick capture record types" shown on the Field Mode
entry page. Those are fast structured records you *start*. This is *coverage*.
Conflating the two was a Phase 00 terminology error, corrected on that page.

## The package

### Video

- 10-second exterior
- 10-second entrance
- Wide environmental shot
- Medium activity shot
- Three detail shots
- Movement sequence
- Interview
- Demonstration or process
- Relevant document or interface
- Before clip
- After clip
- Unresolved-question clip

### Photography

- Clean exterior
- Environmental portrait
- Working portrait
- Object or equipment
- Evidence or document
- Wide room
- Detail
- Access or barrier
- Contradiction
- Place-and-subject image

### Audio

- Full interview
- Room tone
- Distinctive ambient sound
- Demonstration sound
- Spoken field note
- Pronunciation of names and local terms
- Exact legal or scientific explanation
- Source stating the central claim in their own words

### Records

- Name and title
- Consent and attribution
- Exact location
- Time
- Source documents
- URLs
- Relevant law
- Promised materials
- Unanswered questions
- Next person to interview

## Required behavior of the future component

Each package item must support:

- **Required or optional** — required items gate the "safe to leave?" decision.
- **Capture state** — one of: captured, not captured, unavailable, refused.
  `unavailable` and `refused` are distinct and both legitimate; neither is a
  failure to be hidden. A refusal is itself a record.
- **Linked assets** — an item is satisfied by pointing at the asset(s) that
  fulfill it, so coverage and the media register stay one source of truth.
- **Exception reason** — any required item marked unavailable or refused carries
  a reason, so the gap is explained rather than silent.
- **Completion percentage** — over required items only, matching the readiness
  rule already used for deployments: optional items must not dilute the number.
- **"Safe to leave?" decision** — a single, explicit determination. It may be
  yes with recorded exceptions, but it is never implicit.

## Why it is specified now but not built

Phase 00 is a foundation. Building the capture workflow would be Phase 04 work,
and doing it early would mean shipping an interaction surface with no schema,
no assets, no consent records and no offline queue to attach it to. The value of
writing it down now is that the requirement cannot quietly shrink later:
implementation is measured against this list.

See `docs/decisions/ADR-007-field-mode-interaction-shell.md` for the shell this
runs inside.
