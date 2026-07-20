import type { Deployment } from "@/features/deployments/types";

/**
 * Static demonstration data for the Phase 00 Command Center.
 *
 * WHAT THIS IS ALLOWED TO CONTAIN
 * -------------------------------
 * Only facts already published in `PROJECT_MEMORY.md`: the two cities, their
 * date ranges, their subject lanes, and the fact that they are competing
 * options for one September window. Prerequisite names describe *categories of
 * preparation*, not actual preparation status.
 *
 * WHAT IT MUST NEVER CONTAIN
 * --------------------------
 * Named sources, contact details, target lists, unpublished angles, embargoed
 * material, or anything else `docs/standards/SECURITY_PRIVACY_STANDARD.md`
 * treats as protected.
 *
 * Specifically excluded, deliberately: the weighted decision scores, criterion
 * rationales, client and outlet fit reasoning, and cost figures recorded in the
 * owner's September 2026 planning workbook. That is live commercial and
 * editorial strategy. This repository is written on the assumption that it
 * becomes public (`AGENTS.md`, "Public-quality repository requirement"), so the
 * seed models the *shape* of the decision and none of its contents.
 *
 * `tests/unit/seed-safety.test.ts` enforces the mechanical cases. It cannot
 * enforce the judgement above.
 */

/**
 * The date the demonstration data describes.
 *
 * Fixed rather than derived from the clock so the Command Center, its tests and
 * its screenshots agree forever. When this seed is replaced by real queries in
 * Phase 02, `asOf` becomes the request time.
 */
export const SEED_AS_OF = "2026-07-19";

/** Placeholder workspace ID. Phase 01 replaces this with a real tenant. */
const DEMO_WORKSPACE_ID = "00000000-0000-0000-0000-000000000000";

const MANHATTAN_ID = "demo-manhattan-2026-09";
const REYKJAVIK_ID = "demo-reykjavik-2026-09";

/**
 * Inputs the September decision is waiting on.
 *
 * Cost *categories* only. The workbook's cost cells are still zero, so there
 * are no figures to omit — but even once entered, amounts belong in the
 * owner's planning records, not in a repository that may go public.
 */
export const SEPTEMBER_DECISION_INPUTS: readonly string[] = [
  "Verified airfare and routing cost for each option",
  "Lodging cost for each option",
  "Local transport and field-travel estimate",
  "Event, press and access fees not waived",
  "Confirmed event access, not assumed access",
];

export const SEED_DEPLOYMENTS: readonly Deployment[] = [
  {
    id: MANHATTAN_ID,
    workspaceId: DEMO_WORKSPACE_ID,
    provenance: "demonstration",
    name: "Manhattan — September 2026",
    city: "Manhattan",
    country: "United States",
    timezone: "America/New_York",
    startsOn: "2026-09-20",
    endsOn: "2026-09-22",
    status: "candidate",
    competesWith: [REYKJAVIK_ID],
    mission:
      "Reporting across climate, AI, ESG, legal technology, fintech, the creator economy, clean energy and materials.",
    lanes: [
      "Climate",
      "AI",
      "ESG",
      "Legal technology",
      "Fintech",
      "Creator economy",
      "Clean energy and materials",
    ],
    prerequisites: [
      {
        id: "mh-scope",
        label: "Deployment scope and subject lanes agreed",
        status: "complete",
        required: true,
      },
      {
        id: "mh-dates",
        label: "Candidate dates and timezone identified",
        status: "complete",
        required: true,
      },
      {
        id: "mh-selection",
        label: "Selected over the competing September option",
        status: "blocked",
        required: true,
        note: "Blocked on the September decision. Both options remain open.",
      },
      {
        id: "mh-targets",
        label: "Target list built and prioritised",
        status: "not-started",
        required: true,
        note: "Not started while selection is open. Requires Phase 03.",
      },
      {
        id: "mh-consent",
        label: "Consent and ground-rules templates selected",
        status: "not-started",
        required: true,
        note: "Consent language is versioned, not improvised in the field.",
      },
      {
        id: "mh-vault",
        label: "Drive vault folder structure created",
        status: "not-started",
        required: true,
        note: "Masters must have a destination before capture begins.",
      },
      {
        id: "mh-credentials",
        label: "Press credentials and site access requested",
        status: "not-started",
        required: false,
      },
    ],
  },
  {
    id: REYKJAVIK_ID,
    workspaceId: DEMO_WORKSPACE_ID,
    provenance: "demonstration",
    name: "Reykjavík — September 2026",
    city: "Reykjavík",
    country: "Iceland",
    timezone: "Atlantic/Reykjavik",
    startsOn: "2026-09-20",
    endsOn: "2026-09-26",
    status: "candidate",
    competesWith: [MANHATTAN_ID],
    mission:
      "Reporting on cannabis and psychoactive-plant science, medical access, law and regulation, public health, harm reduction, culture and island systems.",
    lanes: [
      "Cannabis and psychoactive-plant science",
      "Medical access",
      "Law and regulation",
      "Public health",
      "Harm reduction",
      "Culture",
      "Island systems",
    ],
    prerequisites: [
      {
        id: "rk-scope",
        label: "Deployment scope and subject lanes agreed",
        status: "complete",
        required: true,
      },
      {
        id: "rk-dates",
        label: "Candidate dates and timezone identified",
        status: "complete",
        required: true,
      },
      {
        id: "rk-selection",
        label: "Selected over the competing September option",
        status: "blocked",
        required: true,
        note: "Blocked on the September decision. Both options remain open.",
      },
      {
        id: "rk-targets",
        label: "Target list built and prioritised",
        status: "not-started",
        required: true,
        note: "Not started while selection is open. Requires Phase 03.",
      },
      {
        id: "rk-consent",
        label: "Consent and ground-rules templates selected",
        status: "in-progress",
        required: true,
        note: "Health and legal subject matter raises the consent bar.",
      },
      {
        id: "rk-legal",
        label: "Jurisdictional law and policy baseline recorded",
        status: "not-started",
        required: true,
        note: "Regulatory status must be captured with effective dates, not summarised.",
      },
      {
        id: "rk-vault",
        label: "Drive vault folder structure created",
        status: "not-started",
        required: true,
        note: "Masters must have a destination before capture begins.",
      },
    ],
  },
] as const;
