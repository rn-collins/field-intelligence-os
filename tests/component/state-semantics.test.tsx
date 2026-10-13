import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  RestrictedState,
  SuccessState,
} from "@/components/ui/states";

/**
 * State semantics (G3). These encode the distinctions in
 * `docs/ux/STATE_TAXONOMY.md` that are easy to regress: the ARIA role a state
 * announces itself with is part of its meaning, not decoration.
 */
describe("state ARIA semantics", () => {
  it("only the recoverable error announces as an alert", () => {
    const cases = [
      { node: <EmptyState title="t" description="d" />, alert: false },
      { node: <SuccessState title="t" description="d" />, alert: false },
      { node: <RestrictedState title="t" description="d" />, alert: false },
      { node: <LoadingState />, alert: false },
      { node: <ErrorState title="t" description="d" />, alert: true },
    ];

    for (const { node, alert } of cases) {
      const { unmount } = render(node);
      if (alert) {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      } else {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      }
      unmount();
    }
  });

  it("restricted is not announced as an error", () => {
    // Denied access to a protected record is correct behavior, not a fault.
    render(<RestrictedState title="Restricted" description="Your role does not include access." />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("loading and success announce politely, not assertively", () => {
    const { unmount } = render(<LoadingState label="Loading records" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    unmount();

    render(<SuccessState title="Saved" description="Done." />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("every state carries an icon so it survives greyscale", () => {
    for (const node of [
      <EmptyState key="e" title="t" description="d" />,
      <ErrorState key="x" title="t" description="d" />,
      <RestrictedState key="r" title="t" description="d" />,
      <SuccessState key="s" title="t" description="d" />,
    ]) {
      const { container, unmount } = render(node);
      expect(container.querySelector("svg")).not.toBeNull();
      unmount();
    }
  });
});
