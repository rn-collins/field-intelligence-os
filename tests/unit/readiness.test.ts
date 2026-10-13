import { describe, expect, it } from "vitest";
import {
  calculateReadiness,
  daysUntilStart,
  durationInDays,
  overlaps,
} from "@/features/deployments/readiness";
import type { Deployment, Prerequisite } from "@/features/deployments/types";

function deployment(overrides: Partial<Deployment> = {}): Deployment {
  return {
    id: "test-deployment",
    workspaceId: "00000000-0000-0000-0000-000000000000",
    provenance: "demonstration",
    name: "Test",
    city: "Test City",
    country: "Testland",
    timezone: "UTC",
    startsOn: "2026-09-20",
    endsOn: "2026-09-22",
    status: "planning",
    mission: "Test mission.",
    lanes: [],
    prerequisites: [],
    ...overrides,
  };
}

function prerequisite(overrides: Partial<Prerequisite> & { id: string }): Prerequisite {
  return {
    label: overrides.id,
    status: "not-started",
    required: true,
    ...overrides,
  };
}

describe("calculateReadiness", () => {
  it("scores only required prerequisites", () => {
    const readiness = calculateReadiness(
      deployment({
        prerequisites: [
          prerequisite({ id: "a", status: "complete" }),
          prerequisite({ id: "b", status: "complete" }),
          // Optional and incomplete — must not drag the score down.
          prerequisite({ id: "c", status: "not-started", required: false }),
        ],
      }),
    );

    expect(readiness.requiredTotal).toBe(2);
    expect(readiness.completed).toBe(2);
    expect(readiness.percentage).toBe(100);
    expect(readiness.isReady).toBe(true);
  });

  it("treats a deployment with no prerequisites as unplanned, not ready", () => {
    const readiness = calculateReadiness(deployment({ prerequisites: [] }));

    expect(readiness.percentage).toBe(0);
    expect(readiness.isReady).toBe(false);
  });

  it("orders outstanding prerequisites worst-first", () => {
    const readiness = calculateReadiness(
      deployment({
        prerequisites: [
          prerequisite({ id: "in-progress", status: "in-progress" }),
          prerequisite({ id: "not-started", status: "not-started" }),
          prerequisite({ id: "blocked", status: "blocked" }),
          prerequisite({ id: "complete", status: "complete" }),
        ],
      }),
    );

    expect(readiness.outstanding.map((item) => item.id)).toEqual([
      "blocked",
      "not-started",
      "in-progress",
    ]);
  });

  it("separates blocked prerequisites, which need a decision rather than work", () => {
    const readiness = calculateReadiness(
      deployment({
        prerequisites: [
          prerequisite({ id: "blocked", status: "blocked" }),
          prerequisite({ id: "pending", status: "not-started" }),
        ],
      }),
    );

    expect(readiness.blocked.map((item) => item.id)).toEqual(["blocked"]);
    expect(readiness.outstanding).toHaveLength(2);
  });

  it("rounds the percentage", () => {
    const readiness = calculateReadiness(
      deployment({
        prerequisites: [
          prerequisite({ id: "a", status: "complete" }),
          prerequisite({ id: "b", status: "not-started" }),
          prerequisite({ id: "c", status: "not-started" }),
        ],
      }),
    );

    expect(readiness.percentage).toBe(33);
  });

  it("is not ready while anything required is outstanding", () => {
    const readiness = calculateReadiness(
      deployment({
        prerequisites: [
          prerequisite({ id: "a", status: "complete" }),
          prerequisite({ id: "b", status: "in-progress" }),
        ],
      }),
    );

    expect(readiness.isReady).toBe(false);
  });
});

describe("daysUntilStart", () => {
  it("counts whole days ahead", () => {
    expect(daysUntilStart(deployment({ startsOn: "2026-09-20" }), "2026-09-13")).toBe(7);
  });

  it("returns zero on the start date", () => {
    expect(daysUntilStart(deployment({ startsOn: "2026-09-20" }), "2026-09-20")).toBe(0);
  });

  it("goes negative once under way", () => {
    expect(daysUntilStart(deployment({ startsOn: "2026-09-20" }), "2026-09-22")).toBe(-2);
  });

  it("is unaffected by daylight-saving transitions", () => {
    // 2026-03-08 is the US DST change; a naive local-time diff yields 30.958…
    // days here and rounds inconsistently. Anchoring to UTC keeps it exact.
    expect(daysUntilStart(deployment({ startsOn: "2026-03-29" }), "2026-02-26")).toBe(31);
  });

  it("rejects a malformed date", () => {
    expect(() => daysUntilStart(deployment({ startsOn: "not-a-date" }), "2026-09-20")).toThrow();
  });
});

describe("durationInDays", () => {
  it("counts inclusively", () => {
    expect(durationInDays(deployment({ startsOn: "2026-09-20", endsOn: "2026-09-22" }))).toBe(3);
  });

  it("treats a single-day deployment as one day", () => {
    expect(durationInDays(deployment({ startsOn: "2026-09-20", endsOn: "2026-09-20" }))).toBe(1);
  });

  it("rejects an inverted range", () => {
    expect(() =>
      durationInDays(deployment({ startsOn: "2026-09-22", endsOn: "2026-09-20" })),
    ).toThrow(/ends before it starts/);
  });
});

describe("overlaps", () => {
  it("detects overlapping deployments", () => {
    const a = deployment({ id: "a", startsOn: "2026-09-20", endsOn: "2026-09-22" });
    const b = deployment({ id: "b", startsOn: "2026-09-21", endsOn: "2026-09-26" });

    expect(overlaps(a, b)).toBe(true);
    expect(overlaps(b, a)).toBe(true);
  });

  it("treats a shared boundary day as an overlap", () => {
    const a = deployment({ startsOn: "2026-09-20", endsOn: "2026-09-22" });
    const b = deployment({ startsOn: "2026-09-22", endsOn: "2026-09-26" });

    expect(overlaps(a, b)).toBe(true);
  });

  it("returns false for separate ranges", () => {
    const a = deployment({ startsOn: "2026-09-20", endsOn: "2026-09-22" });
    const b = deployment({ startsOn: "2026-09-23", endsOn: "2026-09-26" });

    expect(overlaps(a, b)).toBe(false);
  });
});
