import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DemoDataBanner } from "@/components/ui/demo-data-banner";
import {
  Callout,
  EmptyState,
  ErrorState,
  LoadingState,
  RestrictedState,
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
   * Restriction is correct system behaviour, not a fault. It must not be
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
  });

  it("offers no way to dismiss it", () => {
    // AGENTS.md requires demonstration records to be clearly labelled. A
    // dismissible marker is one that will eventually be dismissed and forgotten.
    render(<DemoDataBanner />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("accepts more specific detail", () => {
    render(<DemoDataBanner detail="Two sample deployments." />);

    expect(screen.getByText(/two sample deployments/i)).toBeInTheDocument();
  });
});
