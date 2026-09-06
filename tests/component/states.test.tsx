import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DemoDataBanner } from "@/components/ui/demo-data-banner";
import { PreviewBadge } from "@/components/ui/preview-badge";
import {
  Callout,
  EmptyState,
  ErrorState,
  LoadingState,
  RestrictedState,
  SuccessState,
} from "@/components/ui/states";

describe("EmptyState", () => {
  it("renders a heading and an explanation", () => {
    render(<EmptyState title="Nothing here yet" description="Records appear once created." />);

    expect(screen.getByRole("heading", { name: "Nothing here yet" })).toBeInTheDocument();
    expect(screen.getByText("Records appear once created.")).toBeInTheDocument();
  });

  it("renders an optional action", () => {
    render(
      <EmptyState
        title="Nothing here yet"
        description="Records appear once created."
        action={<button type="button">Create record</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Create record" })).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("announces itself as an alert", () => {
    render(<ErrorState title="Could not load" description="Try again shortly." />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("RestrictedState", () => {
  /**
   * Restriction is correct system behavior, not a fault. It must not be
   * announced as an error, and the copy must not describe what is being
   * withheld — the shape of protected material is itself protected.
   */
  it("is not announced as an error", () => {
    render(
      <RestrictedState
        title="Restricted record"
        description="Your role does not include access to this record."
      />,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Restricted record" })).toBeInTheDocument();
  });
});

describe("LoadingState", () => {
  it("exposes a polite live region", () => {
    render(<LoadingState label="Loading deployments" />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Loading deployments");
  });
});

describe("Callout", () => {
  it("renders its title and content", () => {
    render(<Callout title="Scope">Phase 00 is a foundation.</Callout>);

    expect(screen.getByText("Scope")).toBeInTheDocument();
    expect(screen.getByText("Phase 00 is a foundation.")).toBeInTheDocument();
  });
});

describe("DemoDataBanner", () => {
  it("always states that the data is demonstration data", () => {
    render(<DemoDataBanner />);

    expect(screen.getByText(/demonstration data/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 00 preview/i)).toBeInTheDocument();
  });

  it("offers no way to dismiss it", () => {
    // AGENTS.md requires demonstration records to be clearly labeled. A
    // dismissible marker is one that will eventually be dismissed and forgotten.
    render(<DemoDataBanner />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("states in one line that nothing is saved", () => {
    // C1: the operator needs the fact, not an essay on build status.
    render(<DemoDataBanner />);

    expect(screen.getByText(/changes\s+are not saved/i)).toBeInTheDocument();
  });
});

describe("SuccessState", () => {
  it("renders a heading and description", () => {
    render(<SuccessState title="Record saved" description="Your changes are stored." />);

    expect(screen.getByRole("heading", { name: "Record saved" })).toBeInTheDocument();
    expect(screen.getByText("Your changes are stored.")).toBeInTheDocument();
  });

  it("announces politely rather than as an alert", () => {
    // Success is not urgent; it must not interrupt a screen reader mid-sentence.
    render(<SuccessState title="Saved" description="Done." />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("carries an icon so it is distinguishable without color", () => {
    const { container } = render(<SuccessState title="Saved" description="Done." />);

    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders an optional next action", () => {
    render(
      <SuccessState
        title="Saved"
        description="Done."
        action={<button type="button">View record</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "View record" })).toBeInTheDocument();
  });
});

describe("configurable heading level", () => {
  /**
   * A hard-coded h3 skips a level wherever the surrounding context does not
   * happen to match — a real screen-reader navigation defect, not a cosmetic one.
   */
  it("defaults to h3, preserving existing call sites", () => {
    render(<EmptyState title="Nothing" description="None." />);

    expect(screen.getByRole("heading", { level: 3, name: "Nothing" })).toBeInTheDocument();
  });

  it.each([2, 4, 5, 6] as const)("renders at level %s when asked", (level) => {
    render(<EmptyState title="Nothing" description="None." headingLevel={level} />);

    expect(screen.getByRole("heading", { level, name: "Nothing" })).toBeInTheDocument();
  });

  it("applies to every state variant", () => {
    const { rerender } = render(<SuccessState title="S" description="d" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "S" })).toBeInTheDocument();

    rerender(<RestrictedState title="R" description="d" headingLevel={4} />);
    expect(screen.getByRole("heading", { level: 4, name: "R" })).toBeInTheDocument();

    rerender(<ErrorState title="E" description="d" headingLevel={5} />);
    expect(screen.getByRole("heading", { level: 5, name: "E" })).toBeInTheDocument();
  });
});

describe("PreviewBadge", () => {
  /**
   * Product-preview state is not a record status. An earlier revision rendered
   * "Not yet built" with the `pending` tone, which in this product means a
   * record awaiting a decision — so a reader could not tell whether the data or
   * the software was incomplete.
   */
  it("renders its label with an icon", () => {
    const { container } = render(<PreviewBadge>Not built yet</PreviewBadge>);

    expect(screen.getByText("Not built yet")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("defaults to a preview label", () => {
    render(<PreviewBadge />);

    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("does not use record-status tokens", () => {
    const { container } = render(<PreviewBadge />);
    const el = container.firstElementChild as HTMLElement;

    expect(el.className).toContain("preview");
    expect(el.className).not.toMatch(/status-(pending|verified|disputed|restricted)/);
  });
});
