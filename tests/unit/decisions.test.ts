import { describe, expect, it } from "vitest";
import { findPendingDecisions, findScheduleConflicts } from "@/features/deployments/decisions";
import type { Deployment, DeploymentStatus } from "@/features/deployments/types";

function deployment(id: string, overrides: Partial<Deployment> = {}): Deployment {
  return {
    id,
    workspaceId: "00000000-0000-0000-0000-000000000000",
    provenance: "demonstration",
    name: id,
    city: id,
    country: "Testland",
    timezone: "UTC",
    startsOn: "2026-09-20",
    endsOn: "2026-09-22",
    status: "candidate" as DeploymentStatus,
    mission: "Test mission.",
    lanes: [],
    prerequisites: [],
    ...overrides,
  };
}

describe("findPendingDecisions", () => {
  it("groups mutually exclusive candidates into one decision", () => {
    const a = deployment("a", { competesWith: ["b"] });
    const b = deployment("b", { competesWith: ["a"] });

    const decisions = findPendingDecisions([a, b]);

    expect(decisions).toHaveLength(1);
    expect(decisions[0]?.candidates.map((c) => c.id).toSorted()).toEqual(["a", "b"]);
  });

  /**
   * Exclusivity is a property of a pair, so a half-updated record must not make
   * the decision vanish. Losing an open decision is worse than showing a
   * slightly malformed one.
   */
  it("treats exclusivity as symmetric even when declared on only one side", () => {
    const a = deployment("a", { competesWith: ["b"] });
    const b = deployment("b");

    expect(findPendingDecisions([a, b])).toHaveLength(1);
  });

  it("collapses a three-way choice into a single decision", () => {
    const a = deployment("a", { competesWith: ["b"] });
    const b = deployment("b", { competesWith: ["c"] });
    const c = deployment("c");

    const decisions = findPendingDecisions([a, b, c]);

    expect(decisions).toHaveLength(1);
    expect(decisions[0]?.candidates).toHaveLength(3);
  });

  it("produces a stable id regardless of input order", () => {
    const a = deployment("a", { competesWith: ["b"] });
    const b = deployment("b", { competesWith: ["a"] });

    expect(findPendingDecisions([a, b])[0]?.id).toBe(findPendingDecisions([b, a])[0]?.id);
  });

  it("reports whether the candidates also share a window", () => {
    const sameWindow = findPendingDecisions([
      deployment("a", { competesWith: ["b"] }),
      deployment("b", { competesWith: ["a"] }),
    ]);
    expect(sameWindow[0]?.sharesWindow).toBe(true);

    const separate = findPendingDecisions([
      deployment("a", { competesWith: ["b"] }),
      deployment("b", {
        competesWith: ["a"],
        startsOn: "2026-10-01",
        endsOn: "2026-10-03",
      }),
    ]);
    // Options can be mutually exclusive for reasons other than the calendar —
    // budget, for instance. Exclusivity must not depend on overlapping dates.
    expect(separate[0]?.sharesWindow).toBe(false);
    expect(separate).toHaveLength(1);
  });

  it("ignores candidates with no declared alternative", () => {
    expect(findPendingDecisions([deployment("lonely")])).toEqual([]);
  });

  it("ignores deployments that are no longer candidates", () => {
    const chosen = deployment("a", { competesWith: ["b"], status: "planning" });
    const dropped = deployment("b", { competesWith: ["a"], status: "not-selected" });

    expect(findPendingDecisions([chosen, dropped])).toEqual([]);
  });

  it("passes the candidate group to the input resolver", () => {
    const decisions = findPendingDecisions(
      [deployment("a", { competesWith: ["b"] }), deployment("b", { competesWith: ["a"] })],
      (candidates) => candidates.map((c) => `cost for ${c.id}`),
    );

    expect(decisions[0]?.outstandingInputs).toEqual(["cost for a", "cost for b"]);
  });

  it("defaults to no outstanding inputs", () => {
    const decisions = findPendingDecisions([
      deployment("a", { competesWith: ["b"] }),
      deployment("b", { competesWith: ["a"] }),
    ]);

    expect(decisions[0]?.outstandingInputs).toEqual([]);
  });
});

describe("findScheduleConflicts", () => {
  /**
   * The central distinction. Two candidates sharing dates is the expected shape
   * of a decision; two committed deployments sharing dates is an error. Reporting
   * the first as a conflict would train the operator to ignore the alert.
   */
  it("ignores overlapping candidates", () => {
    const a = deployment("a", { competesWith: ["b"] });
    const b = deployment("b", { competesWith: ["a"] });

    expect(findScheduleConflicts([a, b])).toEqual([]);
  });

  it("reports overlapping committed deployments", () => {
    const a = deployment("a", { status: "planning" });
    const b = deployment("b", { status: "active" });

    const conflicts = findScheduleConflicts([a, b]);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.deployments.map((d) => d.id)).toEqual(["a", "b"]);
  });

  it("ignores committed deployments that do not overlap", () => {
    const a = deployment("a", { status: "planning" });
    const b = deployment("b", {
      status: "planning",
      startsOn: "2026-10-01",
      endsOn: "2026-10-03",
    });

    expect(findScheduleConflicts([a, b])).toEqual([]);
  });

  it("ignores cancelled deployments", () => {
    const a = deployment("a", { status: "planning" });
    const b = deployment("b", { status: "cancelled" });

    expect(findScheduleConflicts([a, b])).toEqual([]);
  });

  it("reports each pair once", () => {
    const conflicts = findScheduleConflicts([
      deployment("a", { status: "planning" }),
      deployment("b", { status: "planning" }),
      deployment("c", { status: "planning" }),
    ]);

    expect(conflicts).toHaveLength(3);
    expect(new Set(conflicts.map((c) => c.id)).size).toBe(3);
  });
});
