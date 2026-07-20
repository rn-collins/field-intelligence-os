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

  it("shows the subject lanes", () => {
    render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);

    for (const lane of manhattan.lanes) {
      expect(screen.getByText(lane)).toBeInTheDocument();
    }
  });

  /**
   * SCR-03: readiness must identify the exact missing prerequisites. A score
   * with no attached cause is the unactionable dashboard number that
   * docs/standards/UI_STANDARD.md rules out.
   */
  it("lists every outstanding prerequisite alongside the score", () => {
    render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);
    const readiness = calculateReadiness(manhattan);

    expect(readiness.outstanding.length).toBeGreaterThan(0);
    for (const item of readiness.outstanding) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it("explains why a blocked prerequisite is blocked", () => {
    render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);
    const readiness = calculateReadiness(manhattan);

    for (const item of readiness.blocked) {
      expect(item.note).toBeDefined();
      expect(screen.getByText(item.note!)).toBeInTheDocument();
    }
  });

  it("renders a deterministic day count from the supplied reference date", () => {
    const { rerender } = render(<DeploymentCard deployment={manhattan} asOf="2026-09-13" />);
    expect(screen.getByText(/Starts in 7 days/)).toBeInTheDocument();

    rerender(<DeploymentCard deployment={manhattan} asOf="2026-09-20" />);
    expect(screen.getByText(/Starts today/)).toBeInTheDocument();
  });

  it("states that deployment workspaces are not yet available", () => {
    render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);

    expect(screen.getByText(/Phase 02/)).toBeInTheDocument();
  });

  it("renders no interactive controls, since none of them would work yet", () => {
    const { container } = render(<DeploymentCard deployment={manhattan} asOf={SEED_AS_OF} />);

    expect(within(container).queryByRole("button")).not.toBeInTheDocument();
    expect(within(container).queryAllByRole("link")).toHaveLength(0);
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
