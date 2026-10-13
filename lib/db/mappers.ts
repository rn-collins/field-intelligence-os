import type { Deployment } from "@/features/deployments/types";
import type { DeploymentRow } from "./schema";

/**
 * Maps a database row to the domain type the UI already consumes.
 *
 * This is the seam that lets Phase 02 swap the static seed for a query without
 * touching a single component. The Phase 00 `Deployment` type was shaped, on
 * purpose, to match what the `deployments` table would return — this function
 * is where that promise is kept.
 *
 * `provenance` becomes "live" here: a real row is not demonstration data, and
 * the required discriminant guarantees a row can never be rendered through a
 * surface expecting a labeled sample without this explicit conversion.
 */
export function deploymentFromRow(row: DeploymentRow): Deployment {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    provenance: "live",
    name: row.name,
    city: row.city ?? "",
    country: row.country ?? "",
    timezone: row.timezone ?? "UTC",
    startsOn: row.starts_on ?? "",
    endsOn: row.ends_on ?? "",
    // DB enum uses snake_case; the domain type uses hyphenated. One tiny,
    // tested translation rather than leaking DB spelling into the UI.
    status: row.status === "not_selected" ? "not-selected" : row.status,
    mission: row.mission ?? "",
    lanes: row.lanes,
    // Prerequisites live in a related table (Phase 02); a live row starts with
    // none until that join exists, rather than inventing them.
    prerequisites: [],
    competesWith: row.competes_with,
  };
}
