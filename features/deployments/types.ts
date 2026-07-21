/**
 * Deployment domain types.
 *
 * Field names mirror `docs/source-materials/engineering-package-expanded/fios_v1_spec/schema.sql`
 * (`workspaces`, `deployments`) so that Phase 02 can replace the static seed
 * import with a Supabase query without rewriting the components that consume it.
 */

/**
 * Status pipeline from the v1.0 spec, SCR-02, plus two states the spec omits.
 *
 * `candidate` and `not-selected` are additions. SCR-02 assumes every deployment
 * is one the operator has committed to, but the September 2026 planning record
 * shows Manhattan and Reykjavík as *competing* options for a single window with
 * the choice still open. Without a candidate state, a competing option has to be
 * stored as `planning`, which asserts a commitment that was never made — and in
 * a system whose purpose is provenance, silently upgrading "considering" to
 * "planned" is the exact failure mode to avoid.
 *
 * Recorded in `docs/build/OPEN_QUESTIONS.md` #13 for ratification against the
 * v1.0 specification.
 */
export const DEPLOYMENT_STATUSES = [
  "candidate",
  "not-selected",
  "planning",
  "ready",
  "active",
  "processing",
  "closed",
  "cancelled",
] as const;

export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number];

/** Statuses that mean the operator has committed to running this deployment. */
export const COMMITTED_STATUSES = [
  "planning",
  "ready",
  "active",
  "processing",
  "closed",
] as const satisfies readonly DeploymentStatus[];

export function isCommitted(deployment: { readonly status: DeploymentStatus }): boolean {
  return (COMMITTED_STATUSES as readonly DeploymentStatus[]).includes(deployment.status);
}

/**
 * Provenance is a required discriminant rather than an optional boolean.
 *
 * Phase 00 ships demonstration data only, and `AGENTS.md` requires the
 * Manhattan and Reykjavík records to be clearly labeled. Making this a
 * required literal means a record cannot reach a rendering surface without
 * declaring what it is, and a future real record cannot be typed into a
 * demonstration slot by accident.
 */
export type Provenance = "demonstration";

export type PrerequisiteStatus = "complete" | "in-progress" | "not-started" | "blocked";

export type Prerequisite = {
  readonly id: string;
  readonly label: string;
  readonly status: PrerequisiteStatus;
  /** Optional prerequisites are tracked but do not gate readiness. */
  readonly required: boolean;
  /** Why this matters, shown when it is the thing standing in the way. */
  readonly note?: string;
};

export type Deployment = {
  readonly id: string;
  readonly workspaceId: string;
  readonly provenance: Provenance;
  readonly name: string;
  readonly city: string;
  readonly country: string;
  readonly timezone: string;
  /** ISO 8601 date, inclusive. */
  readonly startsOn: string;
  /** ISO 8601 date, inclusive. */
  readonly endsOn: string;
  readonly status: DeploymentStatus;
  readonly mission: string;
  /** Subject lanes this deployment covers. */
  readonly lanes: readonly string[];
  readonly prerequisites: readonly Prerequisite[];
  /**
   * IDs of deployments this one is a mutually exclusive alternative to.
   *
   * Declared exclusivity, not inferred. Two deployments sharing dates may be a
   * mistake; two deployments the operator has explicitly framed as competing
   * options is a decision waiting to be made. The system must not conflate them.
   */
  readonly competesWith?: readonly string[];
};

/**
 * An open choice between mutually exclusive candidate deployments.
 *
 * Derived, never stored: exclusivity lives on the deployments themselves, so a
 * decision cannot drift out of sync with the records it concerns.
 */
export type DeploymentDecision = {
  /** Stable identifier derived from the candidate IDs, sorted. */
  readonly id: string;
  readonly candidates: readonly Deployment[];
  /** Whether the candidates also collide on the calendar. */
  readonly sharesWindow: boolean;
  /**
   * What must be known before the decision can be made. Named inputs, not a
   * vague "needs review" — SCR-01 requires every alert to link to its cause.
   */
  readonly outstandingInputs: readonly string[];
};

/**
 * Two committed deployments whose dates collide.
 *
 * Distinct from a `DeploymentDecision`: this is an error state — the operator
 * has committed to two things that cannot both happen — whereas a decision is
 * an open question that has not been answered yet.
 */
export type ScheduleConflict = {
  readonly id: string;
  readonly deployments: readonly [Deployment, Deployment];
};

/** The computed readiness of a deployment. Never stored; always derived. */
export type Readiness = {
  readonly completed: number;
  readonly requiredTotal: number;
  /** 0–100, rounded. 100 only when every required prerequisite is complete. */
  readonly percentage: number;
  /** Required prerequisites that are not yet complete, worst state first. */
  readonly outstanding: readonly Prerequisite[];
  /** Required prerequisites explicitly blocked — these need a decision, not work. */
  readonly blocked: readonly Prerequisite[];
  readonly isReady: boolean;
};
