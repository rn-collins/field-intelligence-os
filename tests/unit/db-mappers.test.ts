import { describe, expect, it } from "vitest";
import { deploymentFromRow } from "@/lib/db/mappers";
import { canServiceSetStatus, type DeploymentRow } from "@/lib/db/schema";

function row(overrides: Partial<DeploymentRow> = {}): DeploymentRow {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    workspace_id: "00000000-0000-0000-0000-0000000000ff",
    code: "MH-2609",
    name: "Manhattan — September 2026",
    status: "candidate",
    priority: "B",
    city: "Manhattan",
    country: "United States",
    timezone: "America/New_York",
    starts_on: "2026-09-20",
    ends_on: "2026-09-22",
    mission: "Reporting.",
    lanes: ["Climate", "AI"],
    readiness_score: null,
    competes_with: [],
    version: 1,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
    deleted_at: null,
    ...overrides,
  };
}

describe("deploymentFromRow", () => {
  it("maps a live row into the domain type the UI already consumes", () => {
    const d = deploymentFromRow(row());

    expect(d.city).toBe("Manhattan");
    expect(d.lanes).toEqual(["Climate", "AI"]);
    expect(d.startsOn).toBe("2026-09-20");
  });

  it("stamps live provenance — a real row is never a demonstration sample", () => {
    expect(deploymentFromRow(row()).provenance).toBe("live");
  });

  it("translates the snake_case not_selected enum to the domain spelling", () => {
    expect(deploymentFromRow(row({ status: "not_selected" })).status).toBe("not-selected");
    expect(deploymentFromRow(row({ status: "planning" })).status).toBe("planning");
  });

  it("tolerates nullable columns without inventing data", () => {
    const d = deploymentFromRow(
      row({ city: null, mission: null, starts_on: null, timezone: null }),
    );

    expect(d.city).toBe("");
    expect(d.mission).toBe("");
    expect(d.timezone).toBe("UTC");
    // No prerequisites invented — they come from a related table in Phase 02.
    expect(d.prerequisites).toEqual([]);
  });
});

describe("canServiceSetStatus", () => {
  it("lets a service actor propose non-final statuses", () => {
    expect(canServiceSetStatus("partially_verified")).toBe(true);
    expect(canServiceSetStatus("unreviewed")).toBe(true);
    expect(canServiceSetStatus("disputed")).toBe(true);
  });

  it("blocks a service actor from setting a final status", () => {
    // AGENTS.md: AI cannot set final verification status; a human must.
    expect(canServiceSetStatus("verified")).toBe(false);
    expect(canServiceSetStatus("false")).toBe(false);
    expect(canServiceSetStatus("do_not_use")).toBe(false);
  });
});
