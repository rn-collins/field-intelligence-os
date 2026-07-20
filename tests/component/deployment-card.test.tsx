import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DeploymentCard } from "@/components/patterns/deployment-card";
import { ReadinessMeter } from "@/components/patterns/readiness-meter";
import { calculateReadiness } from "@/features/deployments/readiness";
import type { Deployment } from "@/features/deployments/types";
import { SEED_AS_OF, SEED_DEPLOYMENTS } from "@/lib/seed/deployments";

const manhattan = SEED_DEPLOYMENTS.find((d) => d.city === "Manhattan") as Deployment;

describe("DeploymentCard", () => {
  it("renders the city as a heading", () => {
    render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);

    expect(screen.getByRole("heading", { name: "Manhattan" })).toBeInTheDocument();
  });

  it("omits subject lanes from the summary but keeps them on the record", () => {
    // C4: the Command Center card answers where/when/how-ready/what-is-stopping-it.
    // Lanes belong to the Phase 02 detail page, not the home screen.
    render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);

    for (const lane of manhattan.lanes) {
      expect(screen.queryByText(lane)).not.toBeInTheDocument();
    }

    // Not deleted — still available for the detail view.
    expect(manhattan.lanes.length).toBeGreaterThan(0);
  });

  it("omits the raw record identifier", () => {
    render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);

    expect(screen.queryByText(manhattan.id)).not.toBeInTheDocument();
  });

  /**
   * SCR-03: readiness must identify the exact missing prerequisites. A score
   * with no attached cause is the unactionable dashboard number that
   * docs/standards/UI_STANDARD.md rules out.
   */
  it("surfaces the single biggest blocker, not the whole list", () => {
    render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);
    const readiness = calculateReadiness(manhattan);
    const [top, ...rest] = readiness.outstanding;

    // Worst-first ordering means the head of the list is what most likely
    // stops the trip.
    expect(screen.getByText(top!.label)).toBeInTheDocument();
    for (const item of rest) {
      expect(screen.queryByText(item.label)).not.toBeInTheDocument();
    }

    // The rest are counted, so nothing is silently hidden.
    expect(screen.getByText(new RegExp(`${rest.length} other prerequisite`))).toBeInTheDocument();
  });

  it("explains why the top blocker is blocked", () => {
    render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);
    const top = calculateReadiness(manhattan).outstanding[0]!;

    expect(top.note).toBeDefined();
    expect(screen.getByText(top.note!)).toBeInTheDocument();
  });

  it("renders a deterministic day count from the supplied reference date", () => {
    const committed = { ...manhattan, status: "planning" as const };

    const { rerender } = render(<DeploymentCard deployment={committed} asOf="2026-09-13" />);
    expect(screen.getByText("Starts in 7 days")).toBeInTheDocument();

    rerender(<DeploymentCard deployment={committed} asOf="2026-09-20" />);
    expect(screen.getByText("Starts today")).toBeInTheDocument();
  });

  /**
   * An earlier revision hard-coded the status badge to "Planning", which
   * asserted a commitment the operator had not made. In a provenance system
   * that is a correctness bug, not a cosmetic one.
   */
  it("renders the status from the record rather than assuming one", () => {
    const { rerender } = render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);
    // C5: short badge, qualifier as supporting text.
    expect(screen.getByText("Candidate")).toBeInTheDocument();
    expect(screen.getByText("Not selected yet")).toBeInTheDocument();
    expect(screen.queryByText("Planning")).not.toBeInTheDocument();

    rerender(
      <DeploymentCard deployment={{ ...manhattan, status: "planning" }} asOf={SEED_AS_OF} />,
    );
    expect(screen.getByText("Planning")).toBeInTheDocument();
  });

  it("phrases a candidate's timing conditionally", () => {
    render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);

    // Not "starts in" — nothing starts until the option is selected.
    expect(screen.getByText(/if selected/)).toBeInTheDocument();
  });

  it("offers a route to full detail rather than crowding the summary", () => {
    render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);

    const link = screen.getByRole("link", { name: /full detail for Manhattan/i });
    expect(link).toHaveAttribute("href", "/deployments");
  });

  it("renders no controls that do not work", () => {
    // A disabled button implies the feature is one permission away from working.
    const { container } = render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);

    expect(within(container).queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("ReadinessMeter", () => {
  it("gives the bar a full text alternative", () => {
    const readiness = calculateReadiness(manhattan);
    render(<ReadinessMeter readiness={readiness} />);

    expect(
      screen.getByRole("img", {
        name: `${readiness.completed} of ${readiness.requiredTotal} required prerequisites complete (${readiness.percentage}%)`,
      }),
    ).toBeInTheDocument();
  });
});
