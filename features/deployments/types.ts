/**
 * Deployment domain types.
 *
 * Field names mirror `docs/source-materials/engineering-package-expanded/fios_v1_spec/schema.sql`
 * (`workspaces`, `deployments`) so that Phase 02 can replace the static seed
 * import with a Supabase query without rewriting the components that consume it.
 */

/** Status pipeline from the v1.0 spec, SCR-02. */
export const DEPLOYMENT_STATUSES = [
  "planning",
  "ready",
  "active",
  "processing",
  "closed",
  "cancelled",
] as const;

export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number];

/**
 * Provenance is a required discriminant rather than an optional boolean.
 *
 * Phase 00 ships demonstration data only, and `AGENTS.md` requires the
 * Manhattan and Reykjavík records to be clearly labelled. Making this a
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
