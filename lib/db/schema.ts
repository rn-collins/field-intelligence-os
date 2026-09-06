/**
 * Typed mirror of the database schema.
 *
 * Hand-written rather than generated, because generation needs a live Supabase
 * project (secrets) which Phase 01 deliberately does not require. These types
 * are the contract the migrations implement; when the CLI is available,
 * `supabase gen types` can replace this file and a test will catch any drift.
 *
 * The point of writing them now: Phase 02 moves the Command Center from static
 * seed to a real query without changing the components, because the row types
 * already match what the seed's `Deployment` type promised. See the mapping in
 * `lib/db/mappers.ts`.
 */

export type Uuid = string;
/** ISO 8601 timestamp string. */
export type Timestamptz = string;
/** ISO 8601 date string (no time). */
export type DateOnly = string;

export type DeploymentStatus =
  | "candidate"
  | "not_selected"
  | "planning"
  | "ready"
  | "active"
  | "processing"
  | "closed"
  | "cancelled";

export type PriorityLevel = "A" | "B" | "C";

export type SensitivityLevel =
  "public" | "internal" | "confidential" | "source_protected" | "highly_restricted";

export type MemberRole =
  "owner" | "investigator" | "editor" | "researcher" | "producer" | "viewer" | "service";

export type VerificationStatus =
  | "unreviewed"
  | "unverified"
  | "partially_verified"
  | "verified"
  | "disputed"
  | "false"
  | "superseded"
  | "do_not_use";

export type InteractionStatus =
  "draft" | "scheduled" | "in_progress" | "processing" | "completed" | "restricted" | "cancelled";

export type WorkspaceRow = {
  id: Uuid;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
  created_at: Timestamptz;
  updated_at: Timestamptz;
};

export type DeploymentRow = {
  id: Uuid;
  workspace_id: Uuid;
  code: string;
  name: string;
  status: DeploymentStatus;
  priority: PriorityLevel;
  city: string | null;
  country: string | null;
  timezone: string | null;
  starts_on: DateOnly | null;
  ends_on: DateOnly | null;
  mission: string | null;
  lanes: string[];
  readiness_score: number | null;
  competes_with: Uuid[];
  version: number;
  created_at: Timestamptz;
  updated_at: Timestamptz;
  deleted_at: Timestamptz | null;
};

export type PersonRow = {
  id: Uuid;
  workspace_id: Uuid;
  preferred_name: string;
  pronunciation: string | null;
  bio: string | null;
  expertise: string[];
  relationship_status: string | null;
  sensitivity: SensitivityLevel;
  do_not_contact: boolean;
  version: number;
  created_at: Timestamptz;
  updated_at: Timestamptz;
  deleted_at: Timestamptz | null;
};

export type ClaimRow = {
  id: Uuid;
  workspace_id: Uuid;
  deployment_id: Uuid | null;
  interaction_id: Uuid | null;
  exact_text: string;
  claim_type: string | null;
  context: string | null;
  verification: VerificationStatus;
  version: number;
  created_at: Timestamptz;
  updated_at: Timestamptz;
  deleted_at: Timestamptz | null;
};

/** Verification status transitions a human may not bypass. */
export const FINAL_VERIFICATION_STATUSES: readonly VerificationStatus[] = [
  "verified",
  "false",
  "do_not_use",
];

/** AI/service actors may propose, never finalize (AGENTS.md). */
export function canServiceSetStatus(status: VerificationStatus): boolean {
  return !FINAL_VERIFICATION_STATUSES.includes(status);
}
