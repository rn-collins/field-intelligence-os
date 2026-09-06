# September-First Plan

**Goal:** the shortest path to a system RN can actually use in the field for the
Manhattan and Reykjavík deployments (late September 2026), not the full 8-phase
product.

Anchored to `docs/PRODUCT_VISION.md`, which defines first-release success as:
_"RN can plan and execute Manhattan and Reykjavík inside the system, capture
minimum packages on mobile, preserve consent, connect claims to evidence, and
see missing coverage — without duplicating data across six trackers."_

That sentence is the scope. Everything not required by it is deferred.

---

## The field-ready minimum

Six capabilities. If these work, the trip is survivable inside the system:

1. **Sign in** — real auth, so records have an owner and RLS has a user to gate on.
2. **Plan a deployment** — Manhattan/Reykjavík as live records: mission, dates,
   readiness, the September decision.
3. **Hold people & organizations** — sources and institutions, with consent
   preferences and restrictions.
4. **Log an interaction** — an interview with consent recorded first, notes,
   and the follow-ups it created. On the phone.
5. **Capture in the field** — Field Mode: photo/audio/note capture tied to a
   deployment, working with bad connectivity.
6. **Connect a claim to its evidence** — the verification spine: an assertion,
   what supports it, its status.

## Explicitly deferred to after September

Not because they don't matter — because the trip doesn't strictly need them, and
cutting them is what makes six weeks real:

- Universal search and the research canvas (Phase 07)
- AI transcription / claim extraction (Phase 07)
- The outputs/publication pipeline (Phase 08)
- Notion mirror (Phase 08)
- Sophisticated offline sync + conflict UI (basic offline queue only for Sept)
- Systems reconstruction graphs (Phase 05 — capture the data, defer the visual)
- Drive OAuth automation (manual Drive links for September; automate later)

---

## The critical path

Ordered by dependency. Each step ends green (tests pass) before the next.

| #   | Work                                                                                      | Depends on            | Human gate                         |
| --- | ----------------------------------------------------------------------------------------- | --------------------- | ---------------------------------- |
| 0   | **Prove tenant isolation** — run the Phase 01 pgTAP tests                                 | Docker + Supabase CLI | Install Docker (owner)             |
| 1   | **Finish auth** — login flow, session, first workspace                                    | 0                     | Supabase project + secrets (owner) |
| 2   | **Wire Command Center to the database** — deployments render from real records (Phase 02) | 1                     | —                                  |
| 3   | **People, organizations, targets** (Phase 03) — schema, RLS, UI                           | 2                     | —                                  |
| 4   | **Interactions + consent** (Phase 04) — the interview workflow                            | 3                     | —                                  |
| 5   | **Field Mode capture** (Phase 04) — mobile capture, basic offline queue                   | 4                     | —                                  |
| 6   | **Claims + evidence** (Phase 05) — the verification spine                                 | 3                     | —                                  |
| 7   | **Load the real deployments** — Manhattan/Reykjavík as working records                    | 2–6                   | Owner's real plan data             |
| 8   | **Field rehearsal** — a full dry-run: plan → capture → evidence, on the phone             | all                   | Owner walks it through             |

Steps 3–6 can partly overlap; 6 depends only on 3, not on 4–5.

---

## Rough six-week shape

Calendar, not coding hours. The bars move if human gates stall — that is the
single biggest risk, not the code.

- **Week 1** — Prove isolation (step 0), finish auth (step 1). _Needs Docker +
  Supabase secrets early; everything waits on these._
- **Week 2** — Command Center live on real data (step 2); People/orgs schema (step 3).
- **Week 3** — People/orgs UI; Claims + evidence spine (step 6).
- **Week 4** — Interactions + consent (step 4).
- **Week 5** — Field Mode capture + basic offline (step 5).
- **Week 6** — Load real deployments (step 7), field rehearsal (step 8), fix what
  the rehearsal breaks. **Buffer lives here — protect it.**

## What would blow the timeline

1. **Stalled human gates.** Days waiting on an install, a secret, or a decision.
   Front-load these: Docker and the Supabase project are needed in week 1.
2. **Scope creep.** "Can it also…" — every yes moves September closer. The answer
   to non-essential asks until the trip is "after September."
3. **Skipping verification to go faster.** We have not done this and should not.
   An evidence system that fails in the field, holding a protected source, is
   worse than one feature short. The tests are the reason you can trust it when
   it matters.

## Definition of "September-ready"

Not "every module done." It is: **RN can, on a phone with bad signal, open a
deployment, start an interview, record consent, capture media and notes, and
later connect a claim to its evidence — and nothing is lost, and no protected
source leaks.** When a field rehearsal proves that end to end, it is ready.

## Immediate next action

Step 0 is blocked on one thing only: **Docker + the Supabase CLI installed, so
the isolation tests run.** That is the gate holding the whole critical path.
Everything after it is code I can drive.
